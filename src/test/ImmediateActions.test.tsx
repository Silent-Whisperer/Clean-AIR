import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import React from 'react';
import { ImmediateActions } from '../../src/components/ImmediateActions';
import { SmartDailyAction } from '../../src/types';

describe('ImmediateActions Component', () => {
  const mockActions: SmartDailyAction[] = [
    {
      id: 'a1',
      timeframe: 'morning',
      title: 'Suspend Active Commute',
      recommendation: 'Do NOT cycle today. Air quality causes lung trauma.',
      rationale: 'Deep alveolar PM2.5 deposition.',
      urgency: 'critical',
      tradeoffExplained: 'Safety Priority: cycling produces 0g CO2 but causes respiratory injury.',
    },
    {
      id: 'a2',
      timeframe: 'afternoon',
      title: 'Affordable Indoor Shield',
      recommendation: 'Damp-wipe surfaces and seal window edges with towels.',
      rationale: 'Stops dry dust resuspension.',
      urgency: 'critical',
    },
    {
      id: 'a3',
      timeframe: 'evening',
      title: 'Kitchen Exhaust Protocol',
      recommendation: 'Run exhaust fan while cooking.',
      rationale: 'Removes combustion gases.',
      urgency: 'recommended',
    },
  ];

  it('renders all top 3 critical actions and explanations', () => {
    const handleExplore = vi.fn();
    render(
      <ImmediateActions
        actions={mockActions}
        engineUsed="Deterministic Engine"
        isAiGenerated={false}
        onExploreTimeline={handleExplore}
      />
    );

    expect(screen.getByText('Suspend Active Commute')).toBeInTheDocument();
    expect(screen.getByText('Affordable Indoor Shield')).toBeInTheDocument();
    expect(screen.getByText('Kitchen Exhaust Protocol')).toBeInTheDocument();
    expect(screen.getByText(/Safety Priority: cycling produces 0g CO2/)).toBeInTheDocument();

    const timelineButton = screen.getByText(/View Detailed Diurnal Smog Schedule/);
    fireEvent.click(timelineButton);
    expect(handleExplore).toHaveBeenCalledTimes(1);
  });
});
