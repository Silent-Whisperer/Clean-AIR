import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import React from 'react';
import { LocationBar } from '../../src/components/LocationBar';
import { SavedLocation } from '../../src/types';

describe('LocationBar Component', () => {
  const mockLocations: SavedLocation[] = [
    {
      id: 'loc-1',
      label: 'Home',
      cityName: 'Delhi',
      locality: 'Anand Vihar',
      latitude: 28.6469,
      longitude: 77.3160,
    },
    {
      id: 'loc-2',
      label: 'Work',
      cityName: 'Gurugram',
      locality: 'Cyber City',
      latitude: 28.4595,
      longitude: 77.0266,
    },
  ];

  it('renders active location and triggers Locate Me and location selection', () => {
    const handleSelect = vi.fn();
    const handleAdd = vi.fn();
    const handleDelete = vi.fn();

    render(
      <LocationBar
        locations={mockLocations}
        activeLocationId="loc-1"
        onSelectLocation={handleSelect}
        onAddLocation={handleAdd}
        onDeleteLocation={handleDelete}
        isLoading={false}
      />
    );

    expect(screen.getByText('Delhi')).toBeInTheDocument();
    expect(screen.getByText('(Anand Vihar)')).toBeInTheDocument();
    expect(screen.getByText('Locate Me')).toBeInTheDocument();

    const switchBtn = screen.getByText('Saved Places (2)');
    fireEvent.click(switchBtn);

    expect(screen.getByText('Manage Monitored Locations')).toBeInTheDocument();
  });
});
