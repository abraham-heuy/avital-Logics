import { Request, Response, NextFunction } from 'express';
import { ApplicationService } from '../services/Application.service';
import { CreateApplicationDto } from '../dtos/application.dto';
import { validate } from 'class-validator';

const applicationService = new ApplicationService();

/**
 * Submit a help request (application) – no authentication required
 * Validates input, creates a ticket, sends email confirmation
 */
export const createApplication = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const dto = Object.assign(new CreateApplicationDto(), req.body);
    const errors = await validate(dto);
    if (errors.length) return res.status(400).json({ errors });

    const application = await applicationService.createApplication(dto);
    res.status(201).json({
      message: 'Application submitted successfully',
      ticket_id: application.ticket_id,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get application details by ticket ID – public, useful for status checks
 */
export const getApplicationByTicket = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const ticketId = req.params.ticketId as string;
    if (!ticketId) return res.status(400).json({ message: 'ticketId is required' });

    const application = await applicationService.findByTicketId(ticketId);
    res.json(application);
  } catch (error) {
    next(error);
  }
};

/**
 * Get all applications for the currently logged-in user
 * Requires authentication (user ID from token)
 */
export const getUserApplications = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = (req as any).user?.id;
    if (!userId) return res.status(401).json({ message: 'Unauthorized' });

    const applications = await applicationService.findByUserId(userId);
    res.json(applications);
  } catch (error) {
    next(error);
  }
};