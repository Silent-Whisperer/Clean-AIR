import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import React from 'react';
import { HeroAqiDisplay } from '../../src/components/HeroAqiDisplay';
import { AirQualityMetrics } from '../../src/types';

describe('HeroAqiDisplay Component', () => {
  const mockMetrics: AirQualityMetrics = {
    aqi: 340,
    category: 'Very Poor',
    scale: 'Indian NAQI (CPCB)',
    pm25: 195.0,
    pm10: 298.5,
    dominantPollutant: 'PM2.5 (Fine Respirable Particles)',
    source: 'CPCB Reference Telemetry',
    timestamp: new Date().toISOString(),
    stationName: 'ITO CAAQMS (Delhi)',
    stationLat: 28.6297,
    stationLon: 77.2438,
    forecast: [
      {
        time: '08:00 AM',
        aqi: 360,
        category: 'Very Poor',
        summary: 'Inversion trap',
        isSafeForOutdoorExercise: false,
      },
    ],
  };

  it('renders large NAQI value, category pill, and station telemetry', () => {
    render(<HeroAqiDisplay metrics={mockMetrics} />);
    expect(screen.getByText('340')).toBeInTheDocument();
    expect(screen.getAllByText('Very Poor').length).toBeGreaterThanOrEqual(1);
    expect(screen.getByText('195 µg/m³')).toBeInTheDocument();
    expect(screen.getByText('ITO CAAQMS (Delhi)')).toBeInTheDocument();
    expect(screen.getByText('Indian NAQI (CPCB)')).toBeInTheDocument();
  });
});
