import { Request, Response, NextFunction } from 'express';
import { MatchService } from '../services/Match.service';

const matchService = new MatchService();

/**
 * Consultant views their assigned matches
 */
export const getMyMatches = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const consultantId = (req as any).user?.id;
    if (!consultantId) return res.status(401).json({ message: 'Unauthorized' });

    const matches = await matchService.getMatchesForConsultant(consultantId);
    res.json(matches);
  } catch (error) {
    next(error);
  }
};

