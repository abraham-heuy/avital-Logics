import { Request, Response, NextFunction } from 'express';
import { MatchService } from '../services/Match.service';
import { CreateMatchDto, UpdateMatchDto } from '../dtos/match.dto';
import { validate } from 'class-validator';

const matchService = new MatchService();

/**
 * Create a match (admin only) – assign consultant to an application
 */
export const createMatch = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const dto = Object.assign(new CreateMatchDto(), req.body);
    const errors = await validate(dto);
    if (errors.length) return res.status(400).json({ errors });

    const match = await matchService.createMatch(dto.applicationId, dto.consultantId, dto.notes);
    res.status(201).json(match);
  } catch (error) {
    next(error);
  }
};

/**
 * Consultant accepts a match
 */
export const acceptMatch = async (req: Request, res: Response, next: NextFunction) => {
  try {
    // Extract matchId from params and ensure it's a string
    const matchId = req.params.matchId as string;
    if (!matchId) return res.status(400).json({ message: 'matchId is required' });

    const match = await matchService.acceptMatch(matchId);
    res.json(match);
  } catch (error) {
    next(error);
  }
};

/**
 * Consultant rejects a match (optional reason)
 */
export const rejectMatch = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const matchId = req.params.matchId as string;
    if (!matchId) return res.status(400).json({ message: 'matchId is required' });

    const { reason } = req.body;
    const match = await matchService.rejectMatch(matchId, reason);
    res.json(match);
  } catch (error) {
    next(error);
  }
};

/**
 * Consultant starts consultation (changes status to in_progress)
 */
export const startConsultation = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const matchId = req.params.matchId as string;
    if (!matchId) return res.status(400).json({ message: 'matchId is required' });

    const match = await matchService.startConsultation(matchId);
    res.json(match);
  } catch (error) {
    next(error);
  }
};

/**
 * Consultant marks consultation as completed
 */
export const completeMatch = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const matchId = req.params.matchId as string;
    if (!matchId) return res.status(400).json({ message: 'matchId is required' });

    const match = await matchService.completeMatch(matchId);
    res.json(match);
  } catch (error) {
    next(error);
  }
};

/**
 * Admin confirms payment for a match (updates payment status)
 */
export const confirmPayment = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const matchId = req.params.matchId as string;
    if (!matchId) return res.status(400).json({ message: 'matchId is required' });

    const match = await matchService.confirmPayment(matchId);
    res.json(match);
  } catch (error) {
    next(error);
  }
};

/**
 * Get all matches assigned to the logged-in consultant
 */
export const getConsultantMatches = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const consultantId = (req as any).user?.id;
    if (!consultantId) return res.status(401).json({ message: 'Unauthorized' });

    const matches = await matchService.getMatchesForConsultant(consultantId);
    res.json(matches);
  } catch (error) {
    next(error);
  }
};