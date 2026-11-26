import { describe, it, expect, vi, beforeEach } from 'vitest';
import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { CommunityMode } from '../components/CommunityMode';
import { CommunityChallenge } from '../types';

const mockChallenges: CommunityChallenge[] = [
  {
    id: 'ch-1',
    title: 'Zero Open Waste Burning Pledge',
    description: 'Report and prevent dry leaf or plastic burning in your lane.',
    participantsCount: 142,
    co2PreventedKg: 45,
    category: 'collective_awareness',
    isCompletedByMe: false,
  },
];

describe('CommunityMode Component', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it('renders community challenges and toggles user pledge optimistically', async () => {
    const fetchMock = vi
      .fn()
      .mockResolvedValueOnce({
        ok: true,
        json: async () => mockChallenges,
      })
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({ ...mockChallenges[0], isCompletedByMe: true, participantsCount: 143 }),
      });

    global.fetch = fetchMock as unknown as typeof fetch;

    render(<CommunityMode />);

    await waitFor(() => {
      expect(screen.getByText('Zero Open Waste Burning Pledge')).toBeInTheDocument();
    });

    const toggleButton = screen.getByRole('button');
    fireEvent.click(toggleButton);

    await waitFor(() => {
      expect(fetchMock).toHaveBeenCalledWith(
        '/api/community/challenges/ch-1/toggle',
        expect.objectContaining({ method: 'POST' })
      );
    });
  });
});
