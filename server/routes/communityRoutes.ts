import { Router, Request, Response } from 'express';
import { EnvironmentalCoordinator } from '../coordinator';

/**
 * Community Smog Mitigation Challenges Router
 * @description Lists neighborhood initiatives and toggles user pledge participation
 */
export const communityRouter = Router();

/**
 * Community challenges endpoint
 * @route GET /api/community/challenges
 */
communityRouter.get('/challenges', (_req: Request, res: Response) => {
  const challenges = EnvironmentalCoordinator.getCommunityChallenges();
  res.json(challenges);
});

/**
 * Toggle challenge completion
 * @route POST /api/community/challenges/:id/toggle
 */
communityRouter.post('/challenges/:id/toggle', (req: Request, res: Response) => {
  const rawId = req.params.id;
  const id = Array.isArray(rawId) ? rawId[0] : rawId;
  if (!id || !/^[a-zA-Z0-9_-]{1,64}$/.test(id)) {
    res.status(400).json({ error: 'Invalid challenge identifier.' });
    return;
  }

  const { completed } = req.body ?? {};
  if (typeof completed !== 'boolean') {
    res.status(400).json({ error: 'A boolean "completed" field is required.' });
    return;
  }

  const updated = EnvironmentalCoordinator.toggleCommunityChallenge(id, completed);
  if (!updated) {
    res.status(404).json({ error: 'Challenge not found' });
    return;
  }
  res.json(updated);
});
