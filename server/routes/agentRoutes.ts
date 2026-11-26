import { Router, Request, Response, NextFunction } from 'express';
import { EnvironmentalCoordinator } from '../coordinator';
import { validateHouseholdProfileInput, validateChatQueryInput } from '../middleware/security';
import { HouseholdProfile } from '../types';

/**
 * AI Health Intelligence & Conversational Assistant Router
 * @description Provides personalized exposure plans and grounded public health chat
 */
export const agentRouter = Router();

/**
 * Personalized Agent Intelligence endpoint
 * @route POST /api/agent/recommendations
 */
agentRouter.post(
  '/recommendations',
  validateHouseholdProfileInput,
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const profile: HouseholdProfile = req.body;
      const result = await EnvironmentalCoordinator.generateHouseholdRecommendations(profile);
      res.json(result);
    } catch (err) {
      next(err);
    }
  }
);

/**
 * Grounded Conversational AI Assistant endpoint
 * @route POST /api/agent/chat
 */
agentRouter.post(
  '/chat',
  validateChatQueryInput,
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { question, profile, airQuality } = req.body;
      const response = await EnvironmentalCoordinator.answerAssistantQuery(
        question,
        profile,
        airQuality
      );
      res.json(response);
    } catch (err) {
      next(err);
    }
  }
);
