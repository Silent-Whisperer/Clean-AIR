import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import React from 'react';
import { LocationBar } from '../../src/components/LocationBar';
import { SavedLocation } from '../../src/types';

describe('LocationBar Component', () => {
  const mockLocation: SavedLocation = {
    id: 'loc-1',
    label: 'Custom',
    customName: 'GPS Verified',
    cityName: 'Kolkata',
    locality: 'Salt Lake',
    latitude: 22.5867,
    longitude: 88.4170,
    isCurrentGps: true,
  };

  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it('renders active location, Locate Me button, and city search without Saved Places', () => {
    const handleSelect = vi.fn();

    render(
      <LocationBar
        activeLocation={mockLocation}
        onSelectLocation={handleSelect}
        isLoading={false}
      />
    );

    expect(screen.getByText('Kolkata')).toBeInTheDocument();
    expect(screen.getByText('(Salt Lake)')).toBeInTheDocument();
    expect(screen.getByText('Locate Me')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Search city or area...')).toBeInTheDocument();
    expect(screen.queryByText(/Saved Places/i)).not.toBeInTheDocument();
  });

  it('resolves GPS coordinates via backend reverse-geocode when Locate Me is clicked', async () => {
    const handleSelect = vi.fn();

    Object.defineProperty(navigator, 'geolocation', {
      configurable: true,
      value: {
        getCurrentPosition: vi.fn((success) =>
          success({ coords: { latitude: 22.5726, longitude: 88.3639 } })
        ),
      },
    });

    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({
        city: 'Kolkata',
        locality: 'Esplanade',
        latitude: 22.5726,
        longitude: 88.3639,
      }),
    }) as unknown as typeof fetch;

    render(
      <LocationBar
        activeLocation={mockLocation}
        onSelectLocation={handleSelect}
        isLoading={false}
      />
    );

    fireEvent.click(screen.getByText('Locate Me'));

    await waitFor(() => {
      expect(handleSelect).toHaveBeenCalledWith(
        expect.objectContaining({
          cityName: 'Kolkata',
          locality: 'Esplanade',
          latitude: 22.5726,
          longitude: 88.3639,
        })
      );
    });
  });
});
