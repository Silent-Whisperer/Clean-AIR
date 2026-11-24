import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import React from 'react';
import { LiveAqiCard } from '../../src/components/LiveAqiCard';
import { AirQualityMetrics } from '../../src/types';

describe('LiveAqiCard Component', () => {
  const mockMetrics: AirQualityMetrics = {
    aqi: 240,
    category: 'Very Unhealthy',
    pm25: 190.5,
    pm10: 280.2,
    dominantPollutant: 'PM2.5 (Fine particulate matter)',
    source: 'Open-Meteo / Copernicus Atmospheric Monitoring (Delhi)',
    timestamp: new Date().toISOString(),
    forecast: [
      { time: '08:00 AM', aqi: 250, category: 'Very Unhealthy', summary: 'Peak smog' },
      { time: '12:00 PM', aqi: 190, category: 'Unhealthy', summary: 'Thermal mixing' },
    ],
  };

  it('renders AQI value, category badge, and PM2.5 metrics', () => {
    render(<LiveAqiCard metrics={mockMetrics} />);
    expect(screen.getByText('240')).toBeInTheDocument();
    expect(screen.getAllByText('Very Unhealthy').length).toBeGreaterThanOrEqual(1);
    expect(screen.getByText('190.5 µg/m³')).toBeInTheDocument();
    expect(screen.getByText(/Open-Meteo \/ Copernicus/)).toBeInTheDocument();
  });

  it('renders diurnal forecast slots', () => {
    render(<LiveAqiCard metrics={mockMetrics} />);
    expect(screen.getByText('08:00 AM')).toBeInTheDocument();
    expect(screen.getByText('12:00 PM')).toBeInTheDocument();
  });
});
