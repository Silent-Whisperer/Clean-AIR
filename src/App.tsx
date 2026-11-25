import React, { useState, useEffect } from 'react';
import { Navbar } from './components/Navbar';
import { LocationBar } from './components/LocationBar';
import { DashboardView } from './components/DashboardView';
import { SmartDailyPlanner } from './components/SmartDailyPlanner';
import { StationExplorer } from './components/StationExplorer';
import { IndoorAirCoach } from './components/IndoorAirCoach';
import { SustainableAlternatives } from './components/SustainableAlternatives';
import { CommunityMode } from './components/CommunityMode';
import { ConversationalAssistant } from './components/ConversationalAssistant';
import { HouseholdModal } from './components/HouseholdModal';
import { OnboardingFlow } from './components/OnboardingFlow';
import { Footer } from './components/Footer';
import { useAutoLocation } from './hooks/useAutoLocation';
import { loadStoredProfile, saveStoredProfile, DEFAULT_INITIAL_PROFILE } from './utils/profileStorage';
import {
  HouseholdProfile,
  AirQualityMetrics,
  AgentRecommendationResponse,
  SavedLocation,
} from './types';
import { AlertCircle, RefreshCw } from 'lucide-react';

export const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<
    'dashboard' | 'planner' | 'stations' | 'coach' | 'alternatives' | 'community' | 'assistant'
  >('dashboard');

  const [profile, setProfile] = useState<HouseholdProfile>(loadStoredProfile);
  const [airQuality, setAirQuality] = useState<AirQualityMetrics | null>(null);
  const [agentData, setAgentData] = useState<AgentRecommendationResponse | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [showOnboarding, setShowOnboarding] = useState<boolean>(!profile.isOnboarded);

  // Active location resolver
  const activeLocation =
    profile.locations.find((l) => l.id === profile.activeLocationId) || profile.locations[0];

  // Synchronize environmental telemetry and agent plans
  useEffect(() => {
    saveStoredProfile(profile);
    fetchTelemetryAndRecommendations(profile);
  }, [profile.activeLocationId, profile.locations]);

  // Auto-detect real user municipal location on initial startup via network resolution
  useAutoLocation(profile, setProfile);

  const fetchTelemetryAndRecommendations = async (currentProfile: HouseholdProfile) => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/agent/recommendations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(currentProfile),
      });

      if (!res.ok) {
        throw new Error(`Server returned status ${res.status}`);
      }

      const data = await res.json();
      setAirQuality(data.airQuality);
      setAgentData(data.recommendations);
    } catch (err) {
      console.error('Failed to load live recommendations:', err);
      setError('Unable to fetch live telemetry. Checking local connection to monitoring services.');
    } finally {
      setLoading(false);
    }
  };

  const handleSelectLocation = (loc: SavedLocation) => {
    setProfile((prev) => ({
      ...prev,
      locations: [loc],
      activeLocationId: loc.id,
    }));
  };

  const handleStationMapSelect = (cityName: string, lat: number, lon: number, stationName: string) => {
    const customLoc: SavedLocation = {
      id: `station-${stationName.toLowerCase().replace(/[^a-z0-9]/g, '-')}`,
      label: 'Custom',
      customName: stationName,
      cityName,
      locality: stationName,
      latitude: lat,
      longitude: lon,
      isCurrentGps: true,
    };
    handleSelectLocation(customLoc);
  };

  return (
    <div className="min-h-screen bg-[#FAF8F5] text-stone-900 flex flex-col font-sans selection:bg-emerald-100 selection:text-emerald-950">
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:absolute focus:top-2 focus:left-2 focus:z-50 focus:px-4 focus:py-2 focus:bg-stone-900 focus:text-white focus:rounded-md"
      >
        Skip to main content
      </a>

      {/* Screen reader polite live region for telemetry status */}
      <div aria-live="polite" aria-atomic="true" className="sr-only">
        {loading
          ? `Updating atmospheric telemetry for ${activeLocation.cityName}...`
          : airQuality
          ? `Air quality in ${activeLocation.cityName} is Indian NAQI ${airQuality.aqi}, ${airQuality.category}.`
          : ''}
      </div>

      {/* Primary Navigation */}
      <Navbar
        activeTab={activeTab}
        onSelectTab={setActiveTab}
        onOpenSettings={() => setIsModalOpen(true)}
        stationName={airQuality?.stationName}
        aqi={airQuality?.aqi}
      />

      {/* Main Content Area */}
      <main id="main-content" className="flex-1 max-w-7xl w-full mx-auto px-3 sm:px-6 lg:px-8 py-5 sm:py-6 pb-24 sm:pb-12">
        {/* Dynamic Location Bar with Locate Me and City Search */}
        <LocationBar
          activeLocation={activeLocation}
          onSelectLocation={handleSelectLocation}
          isLoading={loading}
        />

        {error && (
          <div className="mb-6 p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-950 text-xs flex items-center justify-between">
            <div className="flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-rose-700 shrink-0" />
              <span>{error}</span>
            </div>
            <button
              onClick={() => fetchTelemetryAndRecommendations(profile)}
              className="font-bold underline hover:text-rose-900"
            >
              Retry Telemetry
            </button>
          </div>
        )}

        {/* Global Loading Spinner */}
        {loading && !airQuality && (
          <div className="py-28 text-center">
            <RefreshCw className="w-7 h-7 text-emerald-900 animate-spin mx-auto mb-3" />
            <h3 className="font-serif font-bold text-lg text-stone-900">
              Retrieving CAAQMS Atmospheric Telemetry
            </h3>
            <p className="text-xs text-stone-500 mt-1">
              Connecting to monitoring sensors and computing exposure safety mitigations...
            </p>
          </div>
        )}

        {/* Tab Views */}
        {airQuality && agentData && (
          <>
            {activeTab === 'dashboard' && (
              <DashboardView
                airQuality={airQuality}
                agentData={agentData}
                profile={profile}
                loading={loading}
                onRefresh={() => fetchTelemetryAndRecommendations(profile)}
                onExploreTimeline={() => setActiveTab('planner')}
                onNavigateTab={(tab) => setActiveTab(tab)}
              />
            )}

            {activeTab === 'planner' && (
              <SmartDailyPlanner timeline={agentData.timeline} city={activeLocation.cityName} />
            )}

            {activeTab === 'stations' && (
              <StationExplorer
                currentCity={activeLocation.cityName}
                onSelectStationLocation={handleStationMapSelect}
                onViewDashboard={() => setActiveTab('dashboard')}
              />
            )}

            {activeTab === 'coach' && (
              <IndoorAirCoach
                guidance={agentData.indoorGuidance}
                hasPurifier={profile.homeFeatures.hasAirPurifier}
                cookingFuel={profile.homeFeatures.cookingFuel}
              />
            )}

            {activeTab === 'alternatives' && (
              <SustainableAlternatives
                comparison={agentData.sustainableTransport}
                impact={agentData.impactMetrics}
              />
            )}

            {activeTab === 'community' && <CommunityMode />}

            {activeTab === 'assistant' && (
              <ConversationalAssistant profile={profile} airQuality={airQuality} />
            )}
          </>
        )}
      </main>

      <Footer />

      {/* Profile Settings Modal */}
      <HouseholdModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        profile={profile}
        onSave={(updated) => {
          setProfile(updated);
        }}
      />

      {/* Initial Clean Onboarding Flow */}
      {showOnboarding && (
        <OnboardingFlow
          initialProfile={profile}
          onComplete={(completed) => {
            setProfile(completed);
            setShowOnboarding(false);
          }}
          onSkip={() => setShowOnboarding(false)}
        />
      )}
    </div>
  );
};

export default App;
