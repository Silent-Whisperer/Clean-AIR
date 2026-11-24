import {
  AirQualityMetrics,
  MonitoringStation,
  HouseholdProfile,
  AgentRecommendationResponse,
  CommunityChallenge,
} from './types';
import { fetchLiveAirQuality } from './services/airQualityService';
import { getLiveMonitoringStations } from './services/stationsData';
import { AiAgentService } from './services/aiAgentService';
import { CommunityService } from './services/communityService';
import { inspectBinaryMagicBytes } from './middleware/security';

/**
 * Environmental Coordinator Layer
 * @description Central orchestration coordinator separating routing from domain business services
 */
export class EnvironmentalCoordinator {
  /**
   * Retrieves verified air quality telemetry for a specified city or coordinates
   * @param city - City or municipal name
   * @param lat - Optional latitude
   * @param lon - Optional longitude
   * @returns Telemetry metrics adhering to Indian NAQI standard
   */
  public static async fetchAirQuality(
    city?: string,
    lat?: number,
    lon?: number
  ): Promise<AirQualityMetrics> {
    const targetCity = city || 'Delhi';
    return fetchLiveAirQuality(targetCity, lat, lon);
  }

  /**
   * Retrieves active CAAQMS monitoring stations across Indian metropolitan zones
   * @returns Array of monitoring station telemetry nodes
   */
  public static async fetchMonitoringStations(): Promise<MonitoringStation[]> {
    return getLiveMonitoringStations();
  }

  /**
   * Orchestrates personalized health plans and exposure mitigations
   * @param profile - User household demographic and equipment profile
   * @returns Synchronized air quality telemetry and actionable recommendations
   */
  public static async generateHouseholdRecommendations(
    profile: HouseholdProfile
  ): Promise<{
    airQuality: AirQualityMetrics;
    recommendations: AgentRecommendationResponse;
  }> {
    const activeLoc =
      profile.locations?.find((l) => l.id === profile.activeLocationId) ||
      profile.locations?.[0];
    const city = activeLoc?.cityName || 'Delhi';
    const lat = activeLoc?.latitude;
    const lon = activeLoc?.longitude;

    const aqiData = await fetchLiveAirQuality(city, lat, lon);
    const recommendations = await AiAgentService.generatePersonalizedPlan(profile, aqiData);

    return {
      airQuality: aqiData,
      recommendations,
    };
  }

  /**
   * Orchestrates conversational health queries grounded in real environmental telemetry
   * @param question - User inquiry
   * @param profile - Optional household profile context
   * @param airQuality - Optional air quality snapshot
   * @returns Synthesized response with source citations and follow-up prompts
   */
  public static async answerAssistantQuery(
    question: string,
    profile?: HouseholdProfile,
    airQuality?: AirQualityMetrics
  ): Promise<{
    answer: string;
    groundingSources: Array<{ title: string; detail: string }>;
    suggestedFollowUps: string[];
    medicalDisclaimer: string;
  }> {
    const activeLoc =
      profile?.locations?.find((l) => l.id === profile?.activeLocationId) ||
      profile?.locations?.[0];
    const city = activeLoc?.cityName || 'Delhi';

    const aqiData =
      airQuality ||
      (await fetchLiveAirQuality(city, activeLoc?.latitude, activeLoc?.longitude));

    const effectiveProfile: HouseholdProfile = profile || {
      id: 'default',
      name: 'Default Household',
      locations: [
        {
          id: 'loc-default',
          label: 'Home',
          cityName: city,
          latitude: 28.6139,
          longitude: 77.2090,
        },
      ],
      activeLocationId: 'loc-default',
      householdMembers: {
        hasElderly: false,
        hasInfantsOrChildren: false,
        hasAsthmaOrRespiratory: false,
        totalOccupants: 3,
      },
      commute: {
        mode: 'public_transit',
        roundTripKm: 15,
        canWorkRemotely: false,
        departureTime: '08:30',
        returnTime: '18:00',
      },
      homeFeatures: {
        hasAirPurifier: false,
        hasExhaustKitchenFan: true,
        buildingType: 'apartment',
        cookingFuel: 'lpg_gas',
      },
      dailySchedule: {
        morningOutdoorTime: '08:00',
        eveningOutdoorTime: '18:00',
        hasOutdoorExerciseRoutine: false,
      },
      budgetSensitivity: 'moderate',
      isOnboarded: true,
    };

    return AiAgentService.answerHouseholdQuery(question, effectiveProfile, aqiData);
  }

  /**
   * Retrieves community smog mitigation challenges
   * @returns Array of active community challenges
   */
  public static getCommunityChallenges(): CommunityChallenge[] {
    return CommunityService.getChallenges();
  }

  /**
   * Toggles user participation for a community initiative
   * @param id - Challenge identifier
   * @param completed - Desired completion state
   * @returns Updated challenge entity or null if not found
   */
  public static toggleCommunityChallenge(
    id: string,
    completed: boolean
  ): CommunityChallenge | null {
    return CommunityService.toggleParticipation(id, completed);
  }

  /**
   * Inspects binary buffer signatures of uploaded telemetry files
   * @param buffer - File payload buffer
   * @param filename - Original uploaded file name
   * @returns Validation outcome with detected file signature
   */
  public static validateSensorUpload(
    buffer: Buffer,
    filename: string
  ): { isValid: boolean; reason?: string; detectedFormat?: string } {
    return inspectBinaryMagicBytes(buffer, filename);
  }
}
