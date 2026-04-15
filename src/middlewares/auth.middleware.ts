import { Request, Response, NextFunction } from 'express';
import { verifyToken, TokenPayload } from '../utils/helpers/jwt';

// Extend Express Request type to include user
declare global {
  namespace Express {
    interface Request {
      user?: TokenPayload;
    }
  }
}

export const authMiddleware = (req: Request, res: Response, next: NextFunction) => {
  let token: string | undefined;

  // 1. Try to get token from cookie (httpOnly)
  if (req.cookies && req.cookies.access_token) {
    token = req.cookies.access_token;
  }
  // 2. Fallback to Authorization header
  else if (req.headers.authorization) {
    const parts = req.headers.authorization.split(' ');
    if (parts.length === 2 && parts[0] === 'Bearer') {
      token = parts[1];
    }
  }

  if (!token) {
    return res.status(401).json({ message: 'No token provided' });
  }

  const decoded = verifyToken(token);
  if (!decoded) {
    return res.status(401).json({ message: 'Invalid or expired token' });
  }

  req.user = decoded;
  next();
};