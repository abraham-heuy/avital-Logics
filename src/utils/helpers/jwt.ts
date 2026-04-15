import jwt, { SignOptions } from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET as string;
const JWT_EXPIRES_IN = (process.env.JWT_EXPIRES_IN || '7d') as SignOptions['expiresIn'];

if (!JWT_SECRET) {
  throw new Error('JWT_SECRET is not defined in environment variables');
}

export interface TokenPayload {
  id: string;
  email: string;
  role: string;
}

/**
 * Generate a JWT access token for a user
 */
export const generateAccessToken = (payload: TokenPayload): string => {
  const options: SignOptions = {
    expiresIn: JWT_EXPIRES_IN,
  };
  return jwt.sign(payload, JWT_SECRET, options);
};

/**
 * Verify and decode a JWT token
 */
export const verifyToken = (token: string): TokenPayload | null => {
  try {
    return jwt.verify(token, JWT_SECRET) as TokenPayload;
  } catch (error) {
    return null;
  }
};