import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import React from 'react';
import { HouseholdModal } from '../../src/components/HouseholdModal';
import { HouseholdProfile } from '../../src/types';

describe('HouseholdModal Component', () => {
  const mockProfile: HouseholdProfile = {
    id: 'test',
    name: 'Test Household',
    locations: [
      {
        id: 'loc-1',
        label: 'Home',
        cityName: 'Delhi',
        latitude: 28.6139,
        longitude: 77.2090,
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
      mode: 'public_transit',
      roundTripKm: 20,
      canWorkRemotely: false,
      departureTime: '08:00',
      returnTime: '17:00',
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

  it('renders modal with accessibility attributes and saves updated fields', () => {
    const handleClose = vi.fn();
    const handleSave = vi.fn();

    render(
      <HouseholdModal
        isOpen={true}
        onClose={handleClose}
        profile={mockProfile}
        onSave={handleSave}
      />
    );

    const dialog = screen.getByRole('dialog');
    expect(dialog).toBeInTheDocument();
    expect(dialog).toHaveAttribute('aria-modal', 'true');
    expect(screen.getByText('Household Health & Exposure Profile')).toBeInTheDocument();

    const saveButton = screen.getByText('Save & Recalculate');
    fireEvent.click(saveButton);

    expect(handleSave).toHaveBeenCalledTimes(1);
    expect(handleClose).toHaveBeenCalledTimes(1);
  });

  it('closes dialog when Escape key is pressed', () => {
    const handleClose = vi.fn();
    const handleSave = vi.fn();

    render(
      <HouseholdModal
        isOpen={true}
        onClose={handleClose}
        profile={mockProfile}
        onSave={handleSave}
      />
    );

    fireEvent.keyDown(window, { key: 'Escape' });
    expect(handleClose).toHaveBeenCalledTimes(1);
  });
});
