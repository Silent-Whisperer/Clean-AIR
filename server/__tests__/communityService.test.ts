import { describe, it, expect } from 'vitest';
import { CommunityService } from '../services/communityService';

describe('Community Service', () => {
  it('lists active neighborhood challenges and toggles participation by id', () => {
    const challenges = CommunityService.getChallenges();
    expect(challenges.length).toBeGreaterThan(0);

    const target = challenges[0];
    const initialCount = target.participantsCount;

    const joined = CommunityService.toggleParticipation(target.id, true);
    expect(joined?.isCompletedByMe).toBe(true);
    expect(joined?.participantsCount).toBe(initialCount + 1);

    const left = CommunityService.toggleParticipation(target.id, false);
    expect(left?.isCompletedByMe).toBe(false);
    expect(left?.participantsCount).toBe(initialCount);

    expect(CommunityService.toggleParticipation('non-existent-id', true)).toBeNull();
  });
});
