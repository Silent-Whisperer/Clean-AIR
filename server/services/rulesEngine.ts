import {
  HouseholdProfile,
  AirQualityMetrics,
  SmartDailyAction,
  IndoorAirAdvice,
  AgentRecommendationResponse,
} from '../types';
import { calculateSustainableComparison, calculateImpactMetrics } from './impactEngine';

/**
 * Deterministic Safety Engine for ClearAir (Indian CPCB NAQI & WHO Standards)
 */
export class DeterministicRulesEngine {
  /**
   * Generates Top 3 immediate daily life actions
   */
  public static generateTopActions(profile: HouseholdProfile, aqiData: AirQualityMetrics): SmartDailyAction[] {
    const actions: SmartDailyAction[] = [];
    const isSevere = aqiData.aqi >= 300; // CPCB Very Poor / Severe
    const isPoor = aqiData.aqi >= 200;   // CPCB Poor
    const hasVulnerable =
      profile.householdMembers.hasElderly ||
      profile.householdMembers.hasInfantsOrChildren ||
      profile.householdMembers.hasAsthmaOrRespiratory;

    // Action 1: Commute & Aerobic Inhalation Protection
    if (isSevere) {
      if (profile.commute.mode === 'bicycle' || profile.commute.mode === 'walking') {
        actions.push({
          id: 'action-suspend-active-commute',
          timeframe: 'morning',
          title: 'Suspend Bicycle Commute — Inhalation Hazard',
          recommendation: profile.commute.canWorkRemotely
            ? 'Switch to Remote Work today. Avoid outdoor morning travel.'
            : `Do NOT cycle or walk to work. At Indian NAQI ${aqiData.aqi} (PM2.5: ${aqiData.pm25} µg/m³), physical exertion accelerates pulmonary minute volume 4x, depositing toxic ultrafine particles into deep lung alveoli. Take the enclosed Metro Rail with an N95 respirator.`,
          rationale: 'Active cycling in severe winter smog causes acute respiratory tract inflammation and vascular constriction, far outweighing carbon savings.',
          urgency: 'critical',
          tradeoffExplained: 'Safety Priority: Zero-emission cycling causes severe pulmonary harm during smog episodes. Personal lung safety is strictly prioritized.',
          actionWindow: '07:30 - 10:30 AM',
        });
      } else if (profile.commute.canWorkRemotely) {
        actions.push({
          id: 'action-telework-protocol',
          timeframe: 'morning',
          title: 'Activate Work-From-Home Protocol',
          recommendation: 'Eliminate road exposure entirely. Morning cold-layer thermal inversion traps heavy diesel particulate near breathing level.',
          rationale: `Prevents inhaling peak road PM2.5 concentrations exceeding ${aqiData.pm25} µg/m³.`,
          urgency: 'recommended',
          actionWindow: 'Full Day',
          environmentalImpact: {
            co2eAvoidedKg: Math.round(profile.commute.roundTripKm * 0.17 * 10) / 10,
            basis: `Avoids ${profile.commute.roundTripKm}km vehicular road transit.`,
          },
        });
      } else {
        actions.push({
          id: 'action-certified-n95',
          timeframe: 'morning',
          title: 'Wear Certified N95 / FFP2 Respirator Only',
          recommendation: 'Use a sealed N95/FFP2 respirator with an airtight nasal seal. Cloth and surgical masks allow 80%+ of PM2.5 to leak through edges.',
          rationale: 'Certified N95 electrostatic media captures fine particles down to 0.3 microns with >95% filtration efficiency.',
          urgency: 'critical',
          actionWindow: 'All Outdoor Transitions',
        });
      }
    } else if (isPoor) {
      actions.push({
        id: 'action-shift-commute-window',
        timeframe: 'morning',
        title: 'Delay Outdoor Commute or Use Enclosed Metro',
        recommendation: hasVulnerable
          ? 'Sensitive occupants (children/elderly/asthma) must stay strictly indoors. Use Metro or AC bus if travel is mandatory.'
          : 'Limit strenuous cycling. Shift morning departures past 09:30 AM once morning inversion begins to mix.',
        rationale: 'CPCB classification: Poor air causes breathing discomfort to most people on prolonged exposure.',
        urgency: 'recommended',
        actionWindow: '08:00 - 10:00 AM',
      });
    } else {
      actions.push({
        id: 'action-clean-commute-boost',
        timeframe: 'morning',
        title: 'Safe for Active Low-Emission Commute',
        recommendation: `Air quality (${aqiData.aqi} AQI, ${aqiData.category}) is safe. Cycle, walk, or take the metro to eliminate personal carbon emissions today.`,
        rationale: 'Current atmospheric dispersion presents minimal respiratory risk for healthy individuals.',
        urgency: 'recommended',
        actionWindow: 'Morning & Evening',
        environmentalImpact: {
          co2eAvoidedKg: Math.round(profile.commute.roundTripKm * 0.14 * 10) / 10,
          basis: 'Emission reduction vs single-occupant private vehicle.',
        },
      });
    }

    // Action 2: Indoor Air Protection
    if (profile.homeFeatures.hasAirPurifier) {
      actions.push({
        id: 'action-indoor-hepa-run',
        timeframe: 'afternoon',
        title: 'Run HEPA Purifier in Primary Bedroom (Clean Zone)',
        recommendation: 'Close all exterior doors and windows. Keep the bedroom door shut to establish an indoor refuge room with <25 µg/m³ PM2.5. Run purifier on medium-high speed.',
        rationale: 'Continuous HEPA recirculation reduces indoor particulate dose by 70-85% in sealed rooms.',
        urgency: 'critical',
        actionWindow: '12:00 - 05:00 PM',
      });
    } else {
      actions.push({
        id: 'action-indoor-diy-defense',
        timeframe: 'afternoon',
        title: 'Low-Cost Indoor Shield (No Air Purifier Strategy)',
        recommendation: 'Damp-mop hard floors with water (never dry sweep, which aerosolizes PM2.5 into breathing air). Place moist rolled towels along outer door and window gaps to cut outdoor infiltration by 30%.',
        rationale: 'Dry dusting resuspends settling particles. Water-binding stops particulate re-aerosolization.',
        urgency: 'critical',
        tradeoffExplained: 'Free, highly practical intervention for households without expensive electronic purifiers.',
        actionWindow: 'Midday Maintenance',
      });
    }

    // Action 3: Evening Care & Kitchen Combustion
    if (hasVulnerable && (isPoor || isSevere)) {
      actions.push({
        id: 'action-vulnerable-evening-care',
        timeframe: 'evening',
        title: 'Respiratory Care & Saline Rinse for Sensitive Members',
        recommendation: 'Ensure children, asthma patients, and elderly members perform warm isotonic saline nasal rinses before bed. Keep bedroom vaporized and drink warm fluids.',
        rationale: 'PM2.5 exposure impairs nasal ciliary transport and dries upper airway mucosa, triggering nocturnal bronchospasm.',
        urgency: 'recommended',
        actionWindow: '08:00 - 10:00 PM',
      });
    } else {
      actions.push({
        id: 'action-kitchen-ventilation',
        timeframe: 'evening',
        title: 'Kitchen Smoke & Exhaust Protocol',
        recommendation: profile.homeFeatures.cookingFuel === 'lpg_gas'
          ? 'Turn kitchen exhaust on BEFORE lighting the gas stove, cover pots with lids, and keep exhaust running for 8 minutes post-cooking. Close bedroom doors.'
          : 'Cover cookware during sautéing or frying to contain volatile oil droplets.',
        rationale: 'LPG gas stoves generate toxic Nitrogen Dioxide (NO2) and carbon monoxide that can spike indoor toxicity beyond outdoor levels.',
        urgency: 'recommended',
        actionWindow: '06:30 - 08:30 PM',
      });
    }

    return actions;
  }

  /**
   * Generates structured 3-part timeline for the day based on diurnal inversion
   */
  public static generateTimeline(profile: HouseholdProfile, aqiData: AirQualityMetrics): SmartDailyAction[] {
    const isSevere = aqiData.aqi > 250;
    return [
      {
        id: 'timeline-morning',
        timeframe: 'morning',
        title: 'Morning Smog Peak (07:00 - 10:00 AM)',
        recommendation: isSevere
          ? 'Ground radiation inversion traps vehicular exhaust and smoke near street level. Keep all exterior windows shut. Delay outdoor jogging or walking.'
          : 'Brief 15-minute cross-ventilation window before morning traffic intensifies.',
        rationale: 'Atmospheric boundary layer is lowest at dawn, producing peak particulate density.',
        urgency: isSevere ? 'critical' : 'recommended',
        actionWindow: '07:00 - 10:00 AM',
      },
      {
        id: 'timeline-afternoon',
        timeframe: 'afternoon',
        title: 'Midday Solar Dispersion (12:00 - 03:00 PM)',
        recommendation: aqiData.aqi > 350
          ? 'Severe hazardous smog persists. Keep indoor spaces sealed throughout midday.'
          : 'Solar heating drives vertical thermal air mixing. If indoor air feels stale or CO2 builds up, crack open leeward windows for 10-15 minutes, then reseal.',
        rationale: 'Solar radiation expands boundary mixing height, slightly diluting street-level particulate density.',
        urgency: 'recommended',
        actionWindow: '12:00 - 03:00 PM',
      },
      {
        id: 'timeline-evening',
        timeframe: 'evening',
        title: 'Night Cooling Inversion Trap (06:00 - 10:00 PM)',
        recommendation: 'Seal all windows before dusk. Place door draft stoppers. Run HEPA or Corsi-Rosenthal DIY filtration in sleeping quarters 1 hour before bed.',
        rationale: 'Night temperature drops rapidly, locking evening rush-hour emissions and biomass smoke directly into the breathing zone.',
        urgency: 'critical',
        actionWindow: '06:00 - 10:00 PM',
      },
    ];
  }

  /**
   * Room-by-room practical Indoor Air Coaching
   */
  public static generateIndoorAdvice(profile: HouseholdProfile): IndoorAirAdvice[] {
    return [
      {
        id: 'coach-clean-refuge-room',
        title: 'Room 1: The Clean Bedroom Refuge',
        category: 'room_checklist',
        practicalSteps: [
          'Choose the bedroom with the fewest exterior windows as the primary clean refuge room.',
          'Roll up damp towels or install foam weather-stripping along bottom door gaps.',
          'Wipe bedposts, dressers, and flooring with a wet microfiber cloth daily (never feather dust).',
          profile.homeFeatures.hasAirPurifier
            ? 'Place the HEPA purifier in this room, elevated 20cm off the floor, running on medium speed.'
            : 'Build a Corsi-Rosenthal DIY box filter (tape a 20-inch box fan to a MERV 13 furnace filter) for under ₹2,000.',
        ],
        limitations: 'Does not eliminate carbon dioxide (CO2). Air the room briefly at 2 PM if CO2 feels stuffy.',
        costEstimate: profile.homeFeatures.hasAirPurifier ? 'free' : 'low_cost',
      },
      {
        id: 'coach-kitchen-combustion',
        title: 'Room 2: Kitchen Combustion & Smoke Control',
        category: 'cooking',
        practicalSteps: [
          'Turn on kitchen exhaust fans at least 1 minute before turning on burners.',
          'Always keep cooking vessels covered with lids while boiling or simmering.',
          profile.homeFeatures.cookingFuel === 'lpg_gas'
            ? 'LPG gas produces unburnt hydrocarbons and NO2. Keep the kitchen door isolated from living areas during preparation.'
            : 'Induction cooking produces zero combustion emissions; prevent oil from reaching smoking point.',
          'Avoid deep-frying or grilling on days with poor outdoor AQI, as oil particulates persist indoors for hours.',
        ],
        limitations: 'Exhaust fans pull replacement air from outside. Ensure replacement air enters from the leeward side of your home.',
        costEstimate: 'free',
      },
      {
        id: 'coach-ventilation-timing',
        title: 'Room 3: Living Area Micro-Ventilation & Sealing',
        category: 'ventilation',
        practicalSteps: [
          'Identify your home’s leeward side (facing away from prevailing winter winds) for ventilation.',
          'Never ventilate between 06:00-10:00 AM or 07:00-10:00 PM during thermal inversion peaks.',
          'Never burn agarbatti (incense sticks), dhoop, mosquito coils, or scented candles indoors.',
        ],
        limitations: 'Micro-ventilation will still allow some PM2.5 infiltration; always follow with damp mopping.',
        costEstimate: 'free',
      },
    ];
  }

  /**
   * Generates the entire structured response via deterministic rules
   */
  public static generateFullPlan(profile: HouseholdProfile, aqiData: AirQualityMetrics): AgentRecommendationResponse {
    const top3 = this.generateTopActions(profile, aqiData);
    const timeline = this.generateTimeline(profile, aqiData);
    const indoor = this.generateIndoorAdvice(profile);
    const sustainable = calculateSustainableComparison(profile, aqiData.aqi);
    const impact = calculateImpactMetrics(profile, aqiData.aqi);

    const activeLoc =
      profile.locations?.find((l) => l.id === profile.activeLocationId) ||
      profile.locations?.[0];
    const locName = activeLoc?.locality
      ? `${activeLoc.cityName} (${activeLoc.locality})`
      : activeLoc?.cityName || 'your location';

    const hasVulnerable = profile.householdMembers.hasElderly || profile.householdMembers.hasAsthmaOrRespiratory;
    const insight =
      aqiData.aqi > 250
        ? `Severe winter smog advisory for ${locName} (CPCB: ${aqiData.category}, AQI ${aqiData.aqi}). Priority is personal respiratory protection: suspend active bicycle/walking commutes, seal indoor spaces, and run HEPA/Corsi-Rosenthal filtration.${
            hasVulnerable ? ' High-risk vulnerability protocol active for household members.' : ''
          }`
        : `Air quality in ${locName} is currently ${aqiData.category} (AQI ${aqiData.aqi}). Follow standard ventilation and transit guidelines.`;

    return {
      top3Actions: top3,
      timeline,
      indoorGuidance: indoor,
      sustainableTransport: sustainable,
      impactMetrics: impact,
      agentInsightNotes: insight,
      isAiGenerated: false,
      engineUsed: 'ClearAir Environmental Health Specialist (CPCB NAQI Standard)',
      generatedAt: new Date().toISOString(),
    };
  }
}
