import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import React from 'react';
import { DashboardView } from '../components/DashboardView';
import { AirQualityMetrics, AgentRecommendationResponse, HouseholdProfile } from '../types';

describe('DashboardView Component', () => {
  const mockAirQuality: AirQualityMetrics = {
    aqi: 320,
    category: 'Very Poor',
    scale: 'Indian NAQI (CPCB)',
    pm25: 180,
    pm10: 270,
    dominantPollutant: 'PM2.5',
    source: 'CPCB CAAQMS',
    timestamp: new Date().toISOString(),
    stationName: 'Victoria Memorial CAAQMS',
    stationLat: 22.5448,
    stationLon: 88.3426,
    forecast: [],
  };

  const mockAgentData: AgentRecommendationResponse = {
    top3Actions: [
      {
        id: 'act-1',
        title: 'Run Bedroom Purifier at Max Speed',
        explanation: 'Severe inversion concentrates particulate matter indoors.',
        urgency: 'critical',
        timeWindow: 'Morning',
        recommendation: 'Seal draft points with damp cloth.',
      },
    ],
    timeline: [],
    indoorGuidance: [],
    sustainableTransport: {
      commuteMode: 'metro',
      recommendedMode: 'metro',
      agentVerdict: 'Metro avoids outdoor vehicular exposure on severe smog days.',
      primaryConsideration: 'Respiratory Safety Override',
      options: [],
    },
    impactMetrics: {
      dailyCo2Kg: 1.2,
      savedCo2Kg: 3.5,
      respiratoryDepositionRisk: 'Severe',
      monthlyRupeesSaved: 1200,
    },
    engineUsed: 'CPCB Public Health Engine',
    isAiGenerated: false,
  };

  const mockProfile: HouseholdProfile = {
    id: 'test-profile',
    name: 'Test Family',
    locations: [
      {
        id: 'loc-1',
        label: 'Home',
        cityName: 'Kolkata',
        latitude: 22.5726,
        longitude: 88.3639,
      },
    ],
    activeLocationId: 'loc-1',
    householdMembers: {
      hasElderly: true,
      hasInfantsOrChildren: false,
      hasAsthmaOrRespiratory: true,
      totalOccupants: 3,
    },
    commute: {
      mode: 'metro',
      roundTripKm: 15,
      canWorkRemotely: false,
      departureTime: '08:30',
      returnTime: '17:30',
    },
    homeFeatures: {
      hasAirPurifier: true,
      hasExhaustKitchenFan: true,
      buildingType: 'apartment',
      cookingFuel: 'lpg_gas',
    },
    isOnboarded: true,
  };

  it('renders telemetry hero, immediate top actions, and overview highlight cards', () => {
    const onRefresh = vi.fn();
    const onExploreTimeline = vi.fn();
    const onNavigateTab = vi.fn();

    render(
      <DashboardView
        airQuality={mockAirQuality}
        agentData={mockAgentData}
        profile={mockProfile}
        loading={false}
        onRefresh={onRefresh}
        onExploreTimeline={onExploreTimeline}
        onNavigateTab={onNavigateTab}
      />
    );

    expect(screen.getByText('320')).toBeInTheDocument();
    expect(screen.getByText('Victoria Memorial CAAQMS')).toBeInTheDocument();
    expect(screen.getByText('Run Bedroom Purifier at Max Speed')).toBeInTheDocument();
    expect(screen.getByText('Indoor Air Quality Shield')).toBeInTheDocument();
    expect(screen.getByText('Commute & Exposure Trade-Off')).toBeInTheDocument();

    // Trigger tab navigation button
    const coachBtn = screen.getByText('Open Room-by-Room Checklist & DIY Guide →');
    fireEvent.click(coachBtn);
    expect(onNavigateTab).toHaveBeenCalledWith('coach');
  });
});
