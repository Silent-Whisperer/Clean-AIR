import React from 'react';
import { AirQualityMetrics, AgentRecommendationResponse, HouseholdProfile } from '../types';
import { HeroAqiDisplay } from './HeroAqiDisplay';
import { ImmediateActions } from './ImmediateActions';

interface DashboardViewProps {
  airQuality: AirQualityMetrics;
  agentData: AgentRecommendationResponse;
  profile: HouseholdProfile;
  loading: boolean;
  onRefresh: () => void;
  onExploreTimeline: () => void;
  onNavigateTab: (tab: 'coach' | 'alternatives') => void;
}

/**
 * Primary Air Quality & Immediate Action Dashboard View
 * @description Centralized overview presenting continuous CAAQMS telemetry and prioritized public health mitigations
 */
export const DashboardView: React.FC<DashboardViewProps> = ({
  airQuality,
  agentData,
  profile,
  loading,
  onRefresh,
  onExploreTimeline,
  onNavigateTab,
}) => {
  return (
    <>
      {/* 1. Large Impressive Air Quality Hero Status */}
      <HeroAqiDisplay
        metrics={airQuality}
        onRefresh={onRefresh}
        isLoading={loading}
      />

      {/* 2. Most Important Section: What Should I Actually Do Today? */}
      <ImmediateActions
        actions={agentData.top3Actions}
        engineUsed={agentData.engineUsed}
        isAiGenerated={agentData.isAiGenerated}
        onExploreTimeline={onExploreTimeline}
      />

      {/* 3. Editorial Overview Highlights */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6 mb-8">
        <div className="bg-white rounded-3xl border border-stone-200/90 p-5 sm:p-6 flex flex-col justify-between shadow-2xs">
          <div>
            <h3 className="font-serif font-bold text-base sm:text-lg text-stone-900 mb-2">
              Indoor Air Quality Shield
            </h3>
            <p className="text-xs text-stone-600 leading-relaxed mb-4">
              {profile.homeFeatures.hasAirPurifier
                ? 'Active HEPA purifier registered. Maintain bedroom refuge seals to keep indoor PM2.5 under 25 µg/m³.'
                : 'No air purifier registered. Relying on verified Corsi-Rosenthal DIY box filtration, damp mopping, and window draft towel stoppers.'}
            </p>
          </div>
          <button
            onClick={() => onNavigateTab('coach')}
            className="text-xs font-bold text-emerald-900 hover:text-emerald-700 underline self-start min-h-[36px] flex items-center"
          >
            Open Room-by-Room Checklist & DIY Guide →
          </button>
        </div>

        <div className="bg-white rounded-3xl border border-stone-200/90 p-5 sm:p-6 flex flex-col justify-between shadow-2xs">
          <div>
            <h3 className="font-serif font-bold text-base sm:text-lg text-stone-900 mb-2">
              Commute & Exposure Trade-Off
            </h3>
            <p className="text-xs text-stone-600 leading-relaxed mb-4">
              {agentData.sustainableTransport.agentVerdict}
            </p>
          </div>
          <button
            onClick={() => onNavigateTab('alternatives')}
            className="text-xs font-bold text-emerald-900 hover:text-emerald-700 underline self-start min-h-[36px] flex items-center"
          >
            Evaluate Transit Exposure vs Emissions →
          </button>
        </div>
      </div>
    </>
  );
};
