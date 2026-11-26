import { describe, it, expect, vi, beforeEach } from 'vitest';
import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { ConversationalAssistant } from '../components/ConversationalAssistant';
import { DEFAULT_INITIAL_PROFILE } from '../utils/profileStorage';
import { AirQualityMetrics } from '../types';

const mockAqi: AirQualityMetrics = {
  aqi: 265,
  usEpaAqi: 215,
  category: 'Poor',
  scale: 'Indian NAQI (CPCB)',
  pm25: 110,
  pm10: 210,
  dominantPollutant: 'PM2.5',
  stationName: 'Victoria Memorial CAAQMS',
  city: 'Kolkata',
  locality: 'Maidan',
  latitude: 22.5448,
  longitude: 88.3426,
  source: 'CPCB',
  lastUpdated: '10:15 AM',
  healthImpactStatement: 'Breathing discomfort on prolonged exposure.',
  forecast: [],
};

describe('ConversationalAssistant Component', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it('renders grounded welcome message with aria-live region and sends a user question', async () => {
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({
        answer: 'Keep bedroom windows sealed during peak morning inversion.',
        groundingSources: [{ title: 'CPCB Telemetry', detail: 'NAQI 265' }],
        suggestedFollowUps: ['What mask should I wear?'],
        medicalDisclaimer: 'For informational guidance only.',
      }),
    }) as unknown as typeof fetch;

    render(<ConversationalAssistant profile={DEFAULT_INITIAL_PROFILE} airQuality={mockAqi} />);

    expect(screen.getByLabelText('Conversation messages')).toHaveAttribute('aria-live', 'polite');
    expect(screen.getByText(/ClearAir Conversational Specialist/i)).toBeInTheDocument();

    const input = screen.getByRole('textbox');
    fireEvent.change(input, { target: { value: 'Should I open my windows?' } });
    fireEvent.submit(input.closest('form')!);

    await waitFor(() => {
      expect(
        screen.getByText('Keep bedroom windows sealed during peak morning inversion.')
      ).toBeInTheDocument();
    });
  });
});
