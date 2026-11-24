/**
 * ClearAir Central Domain Types & API Contracts
 * @module types
 */

/** Official Indian National Air Quality Index (CPCB NAQI) Categories */
export type IndianAqiCategory = 'Good' | 'Satisfactory' | 'Moderate' | 'Poor' | 'Very Poor' | 'Severe';

/** Atmospheric Telemetry and Air Quality Observation Model */
export interface AirQualityMetrics {
  aqi: number;
  usEpaAqi?: number;
  category: IndianAqiCategory;
  scale: 'Indian NAQI (CPCB)' | 'US EPA';
  pm25: number;
  pm10: number;
  no2?: number;
  o3?: number;
  so2?: number;
  co?: number;
  dominantPollutant: string;
  source: string;
  sourceUrl?: string;
  timestamp: string;
  stationName: string;
  stationLat: number;
  stationLon: number;
  forecast?: Array<{
    time: string;
    aqi: number;
    category: IndianAqiCategory;
    summary: string;
    isSafeForOutdoorExercise: boolean;
  }>;
}

/** Continuous Ambient Air Quality Monitoring Station (CAAQMS) Sensor Node */
export interface MonitoringStation {
  id: string;
  name: string;
  city: string;
  state: string;
  latitude: number;
  longitude: number;
  aqi: number;
  category: IndianAqiCategory;
  pm25: number;
  pm10: number;
  lastUpdated: string;
  agency: string;
}

/** User Saved Location Profile */
export interface SavedLocation {
  id: string;
  label: 'Home' | 'Work' | 'College' | 'Custom';
  customName?: string;
  cityName: string;
  locality?: string;
  latitude: number;
  longitude: number;
  isCurrentGps?: boolean;
}

/** Commute Transport Mode Taxonomy */
export type CommuteMode =
  | 'bicycle'
  | 'walking'
  | 'public_transit'
  | 'metro'
  | 'car_ev'
  | 'car_gas'
  | 'carpool'
  | 'work_from_home';

/** Household Demographic and Environmental Exposure Profile */
export interface HouseholdProfile {
  id: string;
  name: string;
  locations: SavedLocation[];
  activeLocationId: string;
  householdMembers: {
    hasElderly: boolean;
    hasInfantsOrChildren: boolean;
    hasAsthmaOrRespiratory: boolean;
    totalOccupants: number;
  };
  commute: {
    mode: CommuteMode;
    roundTripKm: number;
    canWorkRemotely: boolean;
    departureTime: string;
    returnTime: string;
  };
  homeFeatures: {
    hasAirPurifier: boolean;
    purifierCount?: number;
    hasExhaustKitchenFan: boolean;
    buildingType: 'apartment' | 'detached_house' | 'semi_detached';
    cookingFuel: 'lpg_gas' | 'induction_electric' | 'wood_biomass';
  };
  dailySchedule: {
    morningOutdoorTime: string;
    eveningOutdoorTime: string;
    hasOutdoorExerciseRoutine: boolean;
  };
  budgetSensitivity: 'low' | 'moderate' | 'high';
  isOnboarded: boolean;
}

/** Smart Daily Action Recommendation */
export interface SmartDailyAction {
  id: string;
  timeframe: 'morning' | 'afternoon' | 'evening';
  title: string;
  recommendation: string;
  rationale: string;
  urgency: 'critical' | 'recommended' | 'optional';
  tradeoffExplained?: string;
  actionWindow?: string;
  environmentalImpact?: {
    co2eAvoidedKg?: number;
    basis?: string;
  };
}

/** Indoor Air Quality Hack & Intervention Protocol */
export interface IndoorAirAdvice {
  id: string;
  title: string;
  category: 'ventilation' | 'cooking' | 'diy_purification' | 'room_checklist';
  practicalSteps: string[];
  limitations: string;
  costEstimate: 'free' | 'low_cost' | 'investment';
  safetyWarning?: string;
}

/** Commute Mode Evaluation Matrix Entry */
export interface CommuteOption {
  name: string;
  commuteMode: CommuteMode;
  emissionGramsCO2: number;
  inhalationExposureRisk: 'Low' | 'Moderate' | 'High' | 'Severe';
  estimatedCostFormatted: string;
  travelDurationMinutes: number;
  safetyScore: number;
}

/** Sustainable Commute Decision Evaluation */
export interface SustainableComparison {
  options: CommuteOption[];
  recommendedMode: CommuteMode;
  agentVerdict: string;
  primaryConsideration: 'Personal Respiratory Safety' | 'Emissions Reduction' | 'Time & Feasibility';
}

/** Quantitative Impact Engine Calculation Report */
export interface ImpactEngineReport {
  personalExposureMitigationScore: number;
  potentialWeeklyEmissionSavingsKgCO2e: number;
  calculationBreakdown: string[];
  disclaimer: string;
}

/** Community Collective Smog Mitigation Challenge */
export interface CommunityChallenge {
  id: string;
  title: string;
  description: string;
  participantsCount: number;
  co2PreventedKg: number;
  category: 'indoor' | 'clean_commute' | 'collective_awareness';
  isCompletedByMe?: boolean;
  locality?: string;
}

/** Synthesized AI Agent Environmental Plan Response */
export interface AgentRecommendationResponse {
  top3Actions: SmartDailyAction[];
  timeline: SmartDailyAction[];
  indoorGuidance: IndoorAirAdvice[];
  sustainableTransport: SustainableComparison;
  impactMetrics: ImpactEngineReport;
  agentInsightNotes: string;
  isAiGenerated: boolean;
  engineUsed: string;
  generatedAt: string;
}

/** Grounded Conversational Interaction Message */
export interface ChatMessage {
  id: string;
  sender: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: string;
  groundingSources?: Array<{ title: string; detail: string }>;
  suggestedFollowUps?: string[];
  medicalDisclaimer?: string;
}
