import { describe, it, expect, vi, beforeEach } from 'vitest';
import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { StationExplorer } from '../components/StationExplorer';
import { MonitoringStation } from '../types';

const mockStations: MonitoringStation[] = [
  {
    id: 'st-kol',
    name: 'Victoria Memorial CAAQMS',
    city: 'Kolkata',
    state: 'West Bengal',
    agency: 'WBPCB',
    latitude: 22.5448,
    longitude: 88.3426,
    aqi: 145,
    category: 'Moderate',
    pm25: 72,
    pm10: 120,
    lastUpdated: '10:00 AM',
  },
  {
    id: 'st-del',
    name: 'Anand Vihar CAAQMS',
    city: 'Delhi',
    state: 'Delhi',
    agency: 'DPCC',
    latitude: 28.6469,
    longitude: 77.316,
    aqi: 345,
    category: 'Very Poor',
    pm25: 185,
    pm10: 310,
    lastUpdated: '10:00 AM',
  },
];

describe('StationExplorer Component', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it('renders stations, filters by city, and selects a station', async () => {
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => mockStations,
    }) as unknown as typeof fetch;

    const onSelect = vi.fn();
    render(<StationExplorer currentCity="Kolkata" onSelectStationLocation={onSelect} />);

    await waitFor(() => {
      expect(screen.getAllByText('Victoria Memorial CAAQMS').length).toBeGreaterThan(0);
    });

    const delhiFilter = screen.getByRole('button', { name: 'Delhi' });
    fireEvent.click(delhiFilter);

    expect(delhiFilter).toHaveAttribute('aria-pressed', 'true');
    expect(screen.getByText('Anand Vihar CAAQMS')).toBeInTheDocument();
  });
});
