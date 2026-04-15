import { Request, Response, NextFunction } from 'express';
import { AppException } from '../exceptions';

export const errorHandler = (err: any, req: Request, res: Response, next: NextFunction) => {
  console.error(err);

  if (err instanceof AppException) {
    return res.status(err.statusCode).json({
      success: false,
      code: err.code,
      message: err.message,
    });
  }

  // Unknown errors
  res.status(500).json({
    success: false,
    code: 'INTERNAL_ERROR',
    message: 'An unexpected error occurred',
  });
};