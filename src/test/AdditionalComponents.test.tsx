import { describe, it, expect } from 'vitest';
import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { SmartDailyPlanner } from '../components/SmartDailyPlanner';
import { IndoorAirCoach } from '../components/IndoorAirCoach';
import { SustainableAlternatives } from '../components/SustainableAlternatives';
import { SmartDailyAction, IndoorAirAdvice, SustainableComparison, ImpactEngineReport } from '../types';

describe('Frontend Component Suite: SmartDailyPlanner', () => {
  const mockTimeline: SmartDailyAction[] = [
    {
      id: 'timeline-morning',
      timeframe: 'morning',
      title: 'Morning Ventilation Block',
      recommendation: 'Keep all windows tightly closed between 7 AM and 10 AM.',
      rationale: 'Thermal inversion traps morning particulate matter at ground level.',
      urgency: 'critical',
      actionWindow: '07:00 - 10:00 AM',
    },
    {
      id: 'timeline-afternoon',
      timeframe: 'afternoon',
      title: 'Solar Mixing Ventilation Window',
      recommendation: 'Brief 15-minute cross ventilation permitted if indoor CO2 is elevated.',
      rationale: 'Solar heating lifts the ground inversion layer temporarily.',
      urgency: 'recommended',
      actionWindow: '01:00 - 02:00 PM',
    },
  ];

  it('renders timeline action titles, windows, and allows editing recommendations', () => {
    render(<SmartDailyPlanner timeline={mockTimeline} city="Kolkata" />);

    expect(screen.getByText('Morning Ventilation Block')).toBeInTheDocument();
    expect(screen.getByText('07:00 - 10:00 AM')).toBeInTheDocument();
    expect(screen.getByText('Solar Mixing Ventilation Window')).toBeInTheDocument();

    const editButtons = screen.getAllByTitle('Edit schedule note');
    expect(editButtons.length).toBeGreaterThan(0);

    fireEvent.click(editButtons[0]);
    const textarea = screen.getByRole('textbox');
    expect(textarea).toBeInTheDocument();

    fireEvent.change(textarea, { target: { value: 'Updated: Keep room sealed and air purifier on.' } });
    const saveButton = screen.getByText('Save');
    fireEvent.click(saveButton);

    expect(screen.getByText('Updated: Keep room sealed and air purifier on.')).toBeInTheDocument();
  });
});

describe('Frontend Component Suite: IndoorAirCoach', () => {
  const mockGuidance: IndoorAirAdvice[] = [
    {
      id: 'coach-bedroom',
      room: 'Primary Bedroom Refuge',
      title: 'Create an Enclosed Clean-Air Refuge',
      category: 'ventilation',
      costEstimate: 'free',
      practicalSteps: [
        'Keep bedroom door and windows sealed during peak smog hours.',
        'Place rolled moist towel along bottom door gap.',
      ],
      expectedPmReductionPercent: 25,
      limitations: 'CO2 levels can accumulate after 6 hours without air exchange.',
    },
    {
      id: 'coach-kitchen',
      room: 'Kitchen Area',
      title: 'Combustion By-product Suppression',
      category: 'cooking',
      costEstimate: 'free',
      practicalSteps: [
        'Turn on kitchen exhaust fan 2 minutes before igniting LPG stove.',
      ],
      expectedPmReductionPercent: 40,
      limitations: 'Exhaust fan creates negative pressure if makeup air is not provided.',
    },
  ];

  it('renders room-by-room guidance and strategy summary', () => {
    render(<IndoorAirCoach guidance={mockGuidance} hasPurifier={false} cookingFuel="lpg_gas" />);

    expect(screen.getByText('Create an Enclosed Clean-Air Refuge')).toBeInTheDocument();
    expect(screen.getByText('Combustion By-product Suppression')).toBeInTheDocument();
    expect(screen.getByText(/Zero-Purifier Strategy/i)).toBeInTheDocument();
  });
});

describe('Frontend Component Suite: SustainableAlternatives', () => {
  const mockComparison: SustainableComparison = {
    currentMode: 'bicycle',
    recommendedMode: 'public_transit',
    primaryConsideration: 'Pulmonary Safety Override',
    tradeoffSummary: 'Switching to Metro reduces PM2.5 lung deposition by 88% while adding negligible emissions.',
    agentVerdict: 'Personal pulmonary safety strictly overrides green commute on high AQI days.',
    options: [
      {
        commuteMode: 'bicycle',
        modeLabel: 'Bicycle Commute',
        inhaledPm25DoseMicrograms: 145,
        estimatedCarbonGrams: 0,
        estimatedDurationMinutes: 35,
        exposureSeverity: 'high',
        tradeoffAnalysis: 'Zero emissions, but 4x pulmonary minute volume deposition.',
        isRecommended: false,
      },
      {
        commuteMode: 'public_transit',
        modeLabel: 'Metro Rail (Enclosed)',
        inhaledPm25DoseMicrograms: 18,
        estimatedCarbonGrams: 120,
        estimatedDurationMinutes: 40,
        exposureSeverity: 'low',
        tradeoffAnalysis: 'Minimal alveolar deposition in filtered, air-conditioned train carriage.',
        isRecommended: true,
      },
    ],
  };

  const mockImpact: ImpactEngineReport = {
    weeklyInhaledDoseAvoidedMicrograms: 620,
    potentialWeeklyEmissionSavingsKgCO2e: 14.5,
    equivalentCigarettesAvoidedPerMonth: 8,
    calculationBreakdown: [
      'Bicycle commute delivers ~145 ug PM2.5 per round trip',
      'Metro commute drops inhaled dose to ~18 ug PM2.5',
    ],
    disclaimer: 'Calculated using pulmonary minute volume models during exertion.',
  };

  it('renders pulmonary risk vs carbon comparison and impact metrics', () => {
    render(<SustainableAlternatives comparison={mockComparison} impact={mockImpact} />);

    expect(screen.getByText(/Sustainable Commute & Inhalation Exposure Evaluator/i)).toBeInTheDocument();
    expect(screen.getByText(/Personal pulmonary safety strictly overrides green commute/i)).toBeInTheDocument();
    expect(screen.getByText(/~14.5 kg/i)).toBeInTheDocument();
    expect(screen.getByText(/Bicycle commute delivers ~145 ug PM2.5/i)).toBeInTheDocument();
  });
});
