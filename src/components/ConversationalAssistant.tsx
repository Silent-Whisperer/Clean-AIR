import React, { useState } from 'react';
import { HouseholdProfile, AirQualityMetrics, ChatMessage } from '../types';
import { Send, User, Bot, AlertTriangle } from 'lucide-react';

interface ConversationalAssistantProps {
  profile: HouseholdProfile;
  airQuality: AirQualityMetrics;
}

export const ConversationalAssistant: React.FC<ConversationalAssistantProps> = ({
  profile,
  airQuality,
}) => {
  const currentCity = profile.locations[0]?.cityName || 'your area';

  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'welcome',
      sender: 'assistant',
      content: `Hello! I am your ClearAir Environmental Health Assistant. I am directly grounded in live CAAQMS telemetry for ${airQuality.stationName} in ${currentCity} (Indian NAQI: ${airQuality.aqi}, ${airQuality.category}, PM2.5: ${airQuality.pm25} µg/m³) and your household configuration (${profile.householdMembers.totalOccupants} occupants, Purifier: ${profile.homeFeatures.hasAirPurifier ? 'HEPA equipped' : 'None (DIY protocol)'}).\n\nWhat specific smog or health decision can I guide you on today?`,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      groundingSources: [
        {
          title: `Station Telemetry (${airQuality.stationName})`,
          detail: `CPCB NAQI ${airQuality.aqi} | PM2.5: ${airQuality.pm25} µg/m³ | Scale: Indian NAQI`,
        },
      ],
      suggestedFollowUps: [
        'How can I purify my bedroom without an expensive purifier?',
        'Is it safe for my child or elderly parent to go for a morning walk?',
        'Should I cycle to work today or take the Metro?',
      ],
      medicalDisclaimer: 'Guidance is provided for environmental health protection and does not constitute clinical medical diagnosis.',
    },
  ]);

  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSend = async (questionText?: string) => {
    const textToSend = questionText || input;
    if (!textToSend.trim() || isLoading) return;

    const userMessage: ChatMessage = {
      id: `user-${Date.now()}`,
      sender: 'user',
      content: textToSend.trim(),
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMessage]);
    if (!questionText) setInput('');
    setIsLoading(true);

    try {
      const response = await fetch('/api/agent/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          question: textToSend.trim(),
          profile,
          airQuality,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to query assistant');
      }

      const data = await response.json();
      const botMessage: ChatMessage = {
        id: `bot-${Date.now()}`,
        sender: 'assistant',
        content: data.answer,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        groundingSources: data.groundingSources,
        suggestedFollowUps: data.suggestedFollowUps,
        medicalDisclaimer: data.medicalDisclaimer,
      };

      setMessages((prev) => [...prev, botMessage]);
    } catch (err) {
      console.error(err);
      const errorMessage: ChatMessage = {
        id: `err-${Date.now()}`,
        sender: 'assistant',
        content: 'I apologize, but I could not connect to the environmental reasoning service. Please check your connection and try again.',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <section className="bg-white rounded-3xl border border-stone-200/90 shadow-xs p-4 sm:p-6 lg:p-8 mb-8 flex flex-col h-[calc(100vh-210px)] min-h-[480px] max-h-[750px] sm:h-[650px] lg:h-[750px]">
      <div className="pb-3 sm:pb-4 border-b border-stone-100 flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-lg sm:text-xl font-serif font-bold text-stone-900">
              ClearAir Conversational Specialist
            </h2>
            <span className="text-[9px] sm:text-[10px] px-2 py-0.5 rounded-full font-bold uppercase bg-stone-100 text-stone-700">
              CPCB Grounded
            </span>
          </div>
          <p className="text-[11px] sm:text-xs text-stone-600 mt-0.5">
            Real questions grounded in verified data, pulmonary physiology, and household context.
          </p>
        </div>
      </div>

      {/* Messages Scroll Area */}
      <div className="flex-1 overflow-y-auto py-4 space-y-4 pr-1">
        {messages.map((msg) => {
          const isUser = msg.sender === 'user';
          return (
            <div
              key={msg.id}
              className={`flex gap-3 max-w-2xl ${isUser ? 'ml-auto flex-row-reverse' : ''}`}
            >
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 text-xs font-semibold ${
                  isUser ? 'bg-stone-800 text-white' : 'bg-emerald-900 text-white'
                }`}
              >
                {isUser ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
              </div>

              <div
                className={`p-4 rounded-2xl border text-xs leading-relaxed ${
                  isUser
                    ? 'bg-stone-900 text-stone-100 border-stone-900'
                    : 'bg-[#FAF8F5] text-stone-800 border-stone-200'
                }`}
              >
                <div className="whitespace-pre-line">{msg.content}</div>

                {/* Grounding sources pill */}
                {msg.groundingSources && msg.groundingSources.length > 0 && (
                  <div className="mt-3 pt-2.5 border-t border-stone-200/70 text-[11px] text-stone-500 space-y-1">
                    <span className="font-bold text-stone-700 block">Grounding Telemetry:</span>
                    {msg.groundingSources.map((g, idx) => (
                      <div key={idx} className="truncate">
                        • {g.title}: <span className="text-stone-600">{g.detail}</span>
                      </div>
                    ))}
                  </div>
                )}

                {/* Medical Disclaimer */}
                {msg.medicalDisclaimer && (
                  <div className="mt-2.5 p-2 rounded-lg bg-amber-50/60 border border-amber-200/50 text-[10px] text-amber-900 flex items-start gap-1.5">
                    <AlertTriangle className="w-3 h-3 text-amber-700 shrink-0 mt-0.5" />
                    <span>{msg.medicalDisclaimer}</span>
                  </div>
                )}

                {/* Suggested Followups */}
                {msg.suggestedFollowUps && msg.suggestedFollowUps.length > 0 && (
                  <div className="mt-3 pt-2 border-t border-stone-200/60">
                    <span className="text-[10px] uppercase font-bold text-stone-500 block mb-1.5">
                      Suggested Inquiries:
                    </span>
                    <div className="flex flex-wrap gap-1.5">
                      {msg.suggestedFollowUps.map((item, fIdx) => (
                        <button
                          key={fIdx}
                          onClick={() => handleSend(item)}
                          disabled={isLoading}
                          className="text-[11px] bg-white border border-stone-300 text-stone-700 hover:bg-stone-50 px-2.5 py-1 rounded-lg text-left transition-colors"
                        >
                          {item}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          );
        })}

        {isLoading && (
          <div className="flex gap-3 max-w-xl">
            <div className="w-8 h-8 rounded-full bg-emerald-900 text-white flex items-center justify-center shrink-0">
              <Bot className="w-4 h-4" />
            </div>
            <div className="p-3 rounded-2xl bg-stone-100 text-stone-600 text-xs italic">
              Synthesizing environmental health recommendations...
            </div>
          </div>
        )}
      </div>

      {/* Input box */}
      <form
        onSubmit={(e) => {
          e.preventDefault();
          handleSend();
        }}
        className="pt-3 border-t border-stone-200 flex items-center gap-2"
      >
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Ask about today's smog, mask types, or room ventilation..."
          className="flex-1 px-3.5 sm:px-4 py-2.5 min-h-[44px] text-xs sm:text-sm border border-stone-300 rounded-xl focus:outline-none focus:ring-1 focus:ring-emerald-800 bg-[#FAF8F5]"
          disabled={isLoading}
        />
        <button
          type="submit"
          disabled={isLoading || !input.trim()}
          aria-label="Send message to assistant"
          className="px-4 sm:px-5 py-2.5 min-h-[44px] bg-stone-900 text-white text-xs font-semibold rounded-xl hover:bg-stone-800 active:scale-95 disabled:opacity-40 transition-all flex items-center justify-center gap-1.5 shadow-2xs shrink-0"
        >
          <Send className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">Ask</span>
        </button>
      </form>
    </section>
  );
};
