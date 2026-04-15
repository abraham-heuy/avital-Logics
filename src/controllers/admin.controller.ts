import { Request, Response, NextFunction } from 'express';
import { AdminService } from '../services/Admin.service';
import { ApplicationStatus, PaymentStatus } from '../entities/Application.entity';

const adminService = new AdminService();

/**
 * Get all applications with optional filters (status, payment, search, pagination)
 */
export const getAllApplications = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { status, paymentStatus, search, page, limit } = req.query;
    const result = await adminService.getAllApplications({
      status: status as ApplicationStatus,
      paymentStatus: paymentStatus as PaymentStatus,
      search: search as string,
      page: page ? parseInt(page as string) : undefined,
      limit: limit ? parseInt(limit as string) : undefined,
    });
    res.json(result);
  } catch (error) {
    next(error);
  }
};

/**
 * Assign a consultant to an application (creates a match)
 */
export const assignConsultant = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { applicationId, consultantId, notes } = req.body;
    if (!applicationId || !consultantId) {
      return res.status(400).json({ message: 'applicationId and consultantId are required' });
    }
    const match = await adminService.assignConsultant(applicationId, consultantId, notes);
    res.status(201).json(match);
  } catch (error) {
    next(error);
  }
};

/**
 * Review an application – change its status and optionally add admin notes
 */
export const reviewApplication = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const applicationId = req.params.applicationId as string;
    if (!applicationId) return res.status(400).json({ message: 'applicationId is required' });

    const { status, adminNotes } = req.body;
    const application = await adminService.reviewApplication(applicationId, status, adminNotes);
    res.json(application);
  } catch (error) {
    next(error);
  }
};

/**
 * Get dashboard statistics (counts of applications, consultants, students, active matches)
 */
export const getDashboardStats = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const stats = await adminService.getDashboardStats();
    res.json(stats);
  } catch (error) {
    next(error);
  }
};