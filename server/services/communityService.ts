import { CommunityChallenge } from '../types';

/**
 * Community smog protection & household emission initiatives
 * Live aggregate counters initialized based on active community participation
 */
const activeInitiatives: CommunityChallenge[] = [
  {
    id: 'comm-1',
    title: 'The Clean Refuge Room Protocol',
    description: 'Select one primary bedroom or living area. Seal windows, install door draft stoppers, and damp-mop daily to maintain a <25 µg/m³ clean zone.',
    participantsCount: 1,
    co2PreventedKg: 0,
    category: 'indoor',
  },
  {
    id: 'comm-2',
    title: 'Peak-Hour Car-Free Commute Challenge',
    description: 'Avoid single-occupancy driving during morning smog peaks (07:30 - 10:00). Work remotely or take electric Metro transit.',
    participantsCount: 1,
    co2PreventedKg: 14,
    category: 'clean_commute',
  },
  {
    id: 'comm-3',
    title: 'Zero Waste & Leaf Burning Vigilance',
    description: 'Pledge zero garden waste, plastic or leaf burning in your neighborhood and report open fires to municipal authorities.',
    participantsCount: 1,
    co2PreventedKg: 5,
    category: 'collective_awareness',
  },
  {
    id: 'comm-4',
    title: 'Corsi-Rosenthal Community Filter Build',
    description: 'Assemble a DIY MERV 13 box fan filter for an elderly neighbor, student dorm, or child room.',
    participantsCount: 1,
    co2PreventedKg: 0,
    category: 'indoor',
  },
];

export class CommunityService {
  private static challenges: CommunityChallenge[] = [...activeInitiatives];

  /**
   * Fetches active community challenges
   */
  public static getChallenges(): CommunityChallenge[] {
    return this.challenges;
  }

  /**
   * Toggles or marks completion of a challenge by current user
   */
  public static toggleParticipation(id: string, completed: boolean): CommunityChallenge | null {
    const item = this.challenges.find((c) => c.id === id);
    if (!item) return null;

    item.isCompletedByMe = completed;
    if (completed) {
      item.participantsCount += 1;
    } else {
      item.participantsCount = Math.max(1, item.participantsCount - 1);
    }
    return item;
  }
}
