import { GoogleGenAI } from '@google/genai';
import { config } from '../config';
import {
  HouseholdProfile,
  AirQualityMetrics,
  AgentRecommendationResponse,
} from '../types';
import { DeterministicRulesEngine } from './rulesEngine';

/**
 * AI Agent Service
 * @description Supports OpenRouter and Google Gemini APIs with adaptive timeouts and XML prompt fencing.
 * Falls back transparently to DeterministicRulesEngine if API calls fail or credentials are omitted.
 */
export class AiAgentService {
  private static aiClient: GoogleGenAI | null = null;

  private static getGeminiClient(): GoogleGenAI | null {
    if (!this.aiClient && config.geminiApiKey && config.geminiApiKey.trim() !== '') {
      try {
        this.aiClient = new GoogleGenAI({ apiKey: config.geminiApiKey });
      } catch (err) {
        console.error('[AiAgentService] Failed to initialize Gemini client:', err);
        this.aiClient = null;
      }
    }
    return this.aiClient;
  }

  public static calculateAdaptiveTimeout(inputLength: number): number {
    const baseTimeout = config.aiTimeoutMs || 25000;
    const dynamicOffset = Math.round(inputLength * 8);
    return Math.max(baseTimeout, Math.min(60000, baseTimeout + dynamicOffset));
  }

  /**
   * Dispatches LLM inference to OpenRouter or Google Gemini
   */
  private static async executeLlmCall(
    prompt: string,
    timeoutMs: number
  ): Promise<{ text: string; engine: string }> {
    // 1. Prioritize OpenRouter if key is present
    if (config.openrouterApiKey && config.openrouterApiKey.trim() !== '') {
      const controller = new AbortController();
      const timer = setTimeout(() => controller.abort(), timeoutMs);
      try {
        const res = await fetch('https://openrouter.ai/api/v1/chat/completions', {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${config.openrouterApiKey.trim()}`,
            'Content-Type': 'application/json',
            'HTTP-Referer': 'https://cleanair.app',
            'X-Title': 'ClearAir Public Health',
          },
          body: JSON.stringify({
            model: config.openrouterModel,
            response_format: { type: 'json_object' },
            messages: [{ role: 'user', content: prompt }],
          }),
          signal: controller.signal,
        });
        clearTimeout(timer);
        if (!res.ok) {
          throw new Error(`OpenRouter HTTP ${res.status}`);
        }
        const data = (await res.json()) as any;
        const text = data.choices?.[0]?.message?.content || '';
        return { text, engine: `OpenRouter (${config.openrouterModel})` };
      } finally {
        clearTimeout(timer);
      }
    }

    // 2. Google Gemini fallback
    const gemini = this.getGeminiClient();
    if (gemini) {
      const timeoutPromise = new Promise<never>((_, reject) =>
        setTimeout(() => reject(new Error(`Gemini timeout (${timeoutMs}ms)`)), timeoutMs)
      );
      const aiPromise = gemini.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: prompt,
        config: {
          responseMimeType: 'application/json',
          temperature: 0.2,
        },
      });
      const response: any = await Promise.race([aiPromise, timeoutPromise]);
      return { text: response.text || '', engine: 'Gemini 2.5 Flash' };
    }

    throw new Error('No LLM credentials configured.');
  }

  /**
   * Generates personalized environmental recommendations.
   */
  public static async generatePersonalizedPlan(
    profile: HouseholdProfile,
    aqiData: AirQualityMetrics
  ): Promise<AgentRecommendationResponse> {
    const hasKeys = Boolean(config.openrouterApiKey || config.geminiApiKey);
    if (!hasKeys) {
      return DeterministicRulesEngine.generateFullPlan(profile, aqiData);
    }

    try {
      const prompt = `
You are the lead environmental health specialist and pulmonology advisor for ClearAir.
Evaluate the user's household profile against verified atmospheric metrics using the Indian CPCB NAQI standard.

<untrusted_household_profile>
${JSON.stringify(profile, null, 2)}
</untrusted_household_profile>

<verified_environmental_metrics>
${JSON.stringify(aqiData, null, 2)}
</verified_environmental_metrics>

CRITICAL RULES:
1. Indian NAQI Standards: Good (0-50), Satisfactory (51-100), Moderate (101-200), Poor (201-300), Very Poor (301-400), Severe (401-500).
2. TRADE-OFF PRINCIPLE: When AQI >= 200, personal lung safety strictly overrides green commute goals. Active cycling deposits 4x more PM2.5 in deep alveoli. Advise enclosed transit or remote work.
3. If household has no air purifier, give affordable low-cost interventions (clean room creation, Corsi-Rosenthal DIY box filter, towel draft guards, damp mopping).

Output MUST be a strict, valid JSON object matching the AgentRecommendationResponse schema.
`;

      const adaptiveTimeoutMs = this.calculateAdaptiveTimeout(prompt.length);
      const { text, engine } = await this.executeLlmCall(prompt, adaptiveTimeoutMs);
      const parsed = JSON.parse(text);

      return {
        ...parsed,
        isAiGenerated: true,
        engineUsed: engine,
        generatedAt: new Date().toISOString(),
      };
    } catch (err) {
      console.warn('[AiAgentService] LLM call failed, falling back to deterministic engine:', (err as Error).message);
      return DeterministicRulesEngine.generateFullPlan(profile, aqiData);
    }
  }

  /**
   * Conversational Assistant with grounding in environmental data and household context
   */
  public static async answerHouseholdQuery(
    question: string,
    profile: HouseholdProfile,
    aqiData: AirQualityMetrics
  ): Promise<{
    answer: string;
    groundingSources: Array<{ title: string; detail: string }>;
    suggestedFollowUps: string[];
    medicalDisclaimer: string;
  }> {
    const hasKeys = Boolean(config.openrouterApiKey || config.geminiApiKey);
    const activeLoc =
      profile.locations?.find((l) => l.id === profile.activeLocationId) || profile.locations?.[0];
    const locationDisplay = activeLoc?.locality
      ? `${activeLoc.cityName} (${activeLoc.locality})`
      : activeLoc?.cityName || 'Selected Area';

    const sources = [
      {
        title: `Live Station Telemetry (${aqiData.stationName})`,
        detail: `Indian NAQI: ${aqiData.aqi} (${aqiData.category}) | PM2.5: ${aqiData.pm25} µg/m³ | PM10: ${aqiData.pm10} µg/m³ | Source: ${aqiData.source}`,
      },
      {
        title: 'Household Profile Context',
        detail: `Location: ${locationDisplay} | Occupants: ${profile.householdMembers.totalOccupants} | Purifier: ${
          profile.homeFeatures.hasAirPurifier ? 'HEPA equipped' : 'None (DIY protocol)'
        } | Fuel: ${profile.homeFeatures.cookingFuel}`,
      },
    ];

    const disclaimer = 'Information provided is for environmental health risk mitigation only and does not replace clinical medical diagnosis or treatment by a licensed physician.';

    if (!hasKeys) {
      return this.generateDeterministicChatAnswer(question, profile, aqiData, sources, disclaimer);
    }

    try {
      const sanitizedQuestion = question.replace(/[<>]/g, '').slice(0, 500);
      const prompt = `
You are the ClearAir Public Health Assistant. Answer the user's specific inquiry.
Strictly ground your guidance in the verified environmental metrics and household context below.

<verified_environmental_metrics>
${JSON.stringify(aqiData, null, 2)}
</verified_environmental_metrics>

<untrusted_household_profile>
${JSON.stringify(profile, null, 2)}
</untrusted_household_profile>

<untrusted_user_input>
${sanitizedQuestion}
</untrusted_user_input>

RULES:
- Provide an honest, compassionate, direct answer (2-3 paragraphs).
- Explain physical trade-offs (e.g. personal lung safety vs commute decarbonization).
- Address any specific vulnerability in the household (elderly, asthma, infants).
- Suggest 3 natural follow-up questions.

Respond in valid JSON format:
{
  "answer": "string",
  "suggestedFollowUps": ["string", "string", "string"]
}
`;

      const adaptiveTimeoutMs = this.calculateAdaptiveTimeout(prompt.length);
      const { text } = await this.executeLlmCall(prompt, adaptiveTimeoutMs);
      const parsed = JSON.parse(text || '{}');

      return {
        answer: parsed.answer || 'Follow standard winter smog protection protocols.',
        groundingSources: sources,
        suggestedFollowUps: parsed.suggestedFollowUps || [
          'What are the best indoor plants for air quality?',
          'How does PM2.5 affect elderly cardiovascular health?',
          'What is the recommended cooking procedure during smog?',
        ],
        medicalDisclaimer: disclaimer,
      };
    } catch (err) {
      console.warn('[AiAgentService] LLM chat query failed, using rule-based response:', (err as Error).message);
      return this.generateDeterministicChatAnswer(question, profile, aqiData, sources, disclaimer);
    }
  }

  private static generateDeterministicChatAnswer(
    question: string,
    profile: HouseholdProfile,
    aqiData: AirQualityMetrics,
    sources: Array<{ title: string; detail: string }>,
    disclaimer: string
  ) {
    const q = question.toLowerCase();
    let answer = '';
    const suggestions = [
      'How can I purify my room without buying an expensive purifier?',
      'Is it safe for my child or elderly parent to go for a morning walk?',
      'Should I cycle to work today or take the Metro?',
    ];

    if (q.includes('window') || q.includes('ventilate') || q.includes('fresh air')) {
      answer =
        aqiData.aqi > 200
          ? `At Indian NAQI ${aqiData.aqi} (${aqiData.category}) in ${aqiData.stationName}, keep exterior windows tightly closed during morning (07:00–10:00 AM) and evening (06:00–10:00 PM) thermal inversion peaks. If the room feels stuffy with carbon dioxide, open leeward windows (sheltered from wind) for 10 minutes between 1:00 PM and 3:00 PM when solar heating disperses ground smog, then immediately reseal and damp-mop.`
          : `Current air quality is ${aqiData.aqi} (${aqiData.category}). It is safe to ventilate your living spaces for 20-30 minutes, preferably before evening traffic peaks.`;
    } else if (q.includes('mask') || q.includes('n95') || q.includes('cloth') || q.includes('surgical')) {
      answer = `Ordinary surgical masks and cloth bandanas only trap coarse dust (>10 µm) and allow over 80% of fine PM2.5 (${aqiData.pm25} µg/m³) to pass through gaps. For today's AQI of ${aqiData.aqi}, you must use a certified N95 or FFP2 respirator with an airtight nasal pinch seal to ensure effective lung filtration.`;
    } else if (q.includes('cycle') || q.includes('bike') || q.includes('run') || q.includes('walk') || q.includes('exercise')) {
      answer =
        aqiData.aqi > 200
          ? `Do NOT exercise, jog, or cycle outdoors today. Inhalation minute volume increases 3x–5x during aerobic exertion, driving toxic particulate matter deep into bronchial capillaries and triggering acute vascular inflammation. While cycling is eco-friendly, personal lung safety strictly takes precedence today. Use the enclosed Metro Rail.`
          : `Outdoor exercise and cycling are safe today given the current AQI of ${aqiData.aqi} (${aqiData.category}). Favor parks away from heavy vehicular arteries.`;
    } else if (q.includes('purifier') || q.includes('filter') || q.includes('diy') || q.includes('clean room')) {
      answer = profile.homeFeatures.hasAirPurifier
        ? `Since your household has an air purifier, elevate it 20 cm off the floor and run it continuously on medium speed in your primary bedroom. Keep doors and windows closed to create an enclosed <25 µg/m³ clean air refuge.`
        : `Without an air purifier, you can assemble a Corsi-Rosenthal DIY box filter using an ordinary 20-inch box fan and a MERV 13 furnace filter for under ₹2,000. Additionally, damp-mop floors daily (avoid dry sweeping) and place moist rolled towels at door bottoms to cut outdoor PM infiltration by up to 30%.`;
    } else {
      answer = `Based on today's air quality at ${aqiData.stationName} (Indian NAQI ${aqiData.aqi}, ${aqiData.category}) and your household configuration (${profile.householdMembers.totalOccupants} occupants, purifier: ${
        profile.homeFeatures.hasAirPurifier ? 'yes' : 'no'
      }), keep your living quarters sealed, avoid outdoor exertion during morning and evening rush hours, and wear a sealed N95 respirator for outdoor transitions.`;
    }

    return {
      answer,
      groundingSources: sources,
      suggestedFollowUps: suggestions,
      medicalDisclaimer: disclaimer,
    };
  }
}
