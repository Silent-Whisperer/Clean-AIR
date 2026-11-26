import { describe, it, expect, vi } from 'vitest';
import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { OnboardingFlow } from '../components/OnboardingFlow';
import { DEFAULT_INITIAL_PROFILE } from '../utils/profileStorage';

describe('OnboardingFlow Component', () => {
  it('progresses through all 3 steps and activates intelligence', () => {
    const onComplete = vi.fn();
    const onSkip = vi.fn();

    render(
      <OnboardingFlow
        initialProfile={DEFAULT_INITIAL_PROFILE}
        onComplete={onComplete}
        onSkip={onSkip}
      />
    );

    expect(screen.getByRole('dialog')).toBeInTheDocument();
    expect(screen.getByText(/Step 1 of 3/i)).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: /Continue to next step/i }));
    expect(screen.getByText(/Step 2 of 3/i)).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: /Go back to previous setup step/i }));
    expect(screen.getByText(/Step 1 of 3/i)).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: /Continue to next step/i }));
    fireEvent.click(screen.getByRole('button', { name: /Continue to next step/i }));
    expect(screen.getByText(/Step 3 of 3/i)).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: /Activate CleanAir Intelligence/i }));
    expect(onComplete).toHaveBeenCalledWith(expect.objectContaining({ isOnboarded: true }));
  });

  it('dismisses onboarding on Escape key press', () => {
    const onSkip = vi.fn();
    render(
      <OnboardingFlow
        initialProfile={DEFAULT_INITIAL_PROFILE}
        onComplete={vi.fn()}
        onSkip={onSkip}
      />
    );

    fireEvent.keyDown(window, { key: 'Escape' });
    expect(onSkip).toHaveBeenCalledTimes(1);
  });
});
