import { Request, Response, NextFunction } from 'express';
import { AuthService } from '../services/Auth.service';
import { RegisterDto, LoginDto, VerifyCodeDto, ResendCodeDto, RequestPasswordResetDto, ResetPasswordDto } from '../dtos/auth.dto';
import { validate } from 'class-validator';
import { generateAccessToken } from '../utils/helpers/jwt';
import { UserService } from '../services/User.service';
import { sendWhatsAppMessage } from '../services/whatsapp.service';
import { sendVerificationCode, sendPasswordResetCode } from '../services/email.service';

const authService = new AuthService(); 
const userService = new UserService();

/**
 * Helper to send verification code via email and WhatsApp
 */
const sendVerificationNotifications = async (email: string, phone: string | undefined, code: string, name: string) => {
  // Send email
  await sendVerificationCode(email, code, name);
  // Send WhatsApp if phone exists
  if (phone) {
    const whatsappMessage = `Hi ${name}, your Avital verification code is: ${code}. It expires in 15 minutes.`;
    await sendWhatsAppMessage(phone, whatsappMessage);
  }
};

/**
 * Helper to send password reset code via email and WhatsApp
 */
const sendPasswordResetNotifications = async (email: string, phone: string | undefined, code: string, name: string) => {
  // Send email
  await sendPasswordResetCode(email, code, name);
  // Send WhatsApp if phone exists
  if (phone) {
    const whatsappMessage = `Hi ${name}, use this code to reset your Avital password: ${code}. It expires in 15 minutes.`;
    await sendWhatsAppMessage(phone, whatsappMessage);
  }
};

export const register = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const dto = Object.assign(new RegisterDto(), req.body);
    const errors = await validate(dto);
    if (errors.length) return res.status(400).json({ errors });

    const { user, verificationCode } = await authService.register(dto);
    const { password, ...userWithoutPassword } = user;

    // Send verification code via email + WhatsApp
    await sendVerificationNotifications(user.email, user.phoneNumber, verificationCode, user.fullname);

    res.status(201).json({
      message: 'User registered successfully. Verification code sent.',
      user: userWithoutPassword,
      // verificationCode, // uncomment only for testing
    });
  } catch (error) {
    next(error);
  }
};

export const login = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const dto = Object.assign(new LoginDto(), req.body);
    const errors = await validate(dto);
    if (errors.length) return res.status(400).json({ errors });

    const { accessToken, user } = await authService.login(dto.email, dto.password);

    // Set HTTP‑only cookie
    res.cookie('access_token', accessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    res.json({ accessToken, user });
  } catch (error) {
    next(error);
  }
};

export const verifyCode = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const dto = Object.assign(new VerifyCodeDto(), req.body);
    const errors = await validate(dto);
    if (errors.length) return res.status(400).json({ errors });

    const result = await authService.verifyCode(dto.email, dto.code);
    res.json(result);
  } catch (error) {
    next(error);
  }
};

export const resendVerificationCode = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const dto = Object.assign(new ResendCodeDto(), req.body);
    const errors = await validate(dto);
    if (errors.length) return res.status(400).json({ errors });

    const { message, code } = await authService.resendVerificationCode(dto.email);
    const user = await userService.findByEmail(dto.email);
    if (user && user.phoneNumber) {
      const whatsappMessage = `Hi ${user.fullname}, your new Avital verification code is: ${code}. It expires in 15 minutes.`;
      await sendWhatsAppMessage(user.phoneNumber, whatsappMessage);
    }
    res.json({ message });
  } catch (error) {
    next(error);
  }
};

export const requestPasswordReset = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const dto = Object.assign(new RequestPasswordResetDto(), req.body);
    const errors = await validate(dto);
    if (errors.length) return res.status(400).json({ errors });

    const { message, code } = await authService.requestPasswordReset(dto.email);
    const user = await userService.findByEmail(dto.email);
    if (user && user.phoneNumber) {
      const whatsappMessage = `Hi ${user.fullname}, your password reset code is: ${code}. It expires in 15 minutes.`;
      await sendWhatsAppMessage(user.phoneNumber, whatsappMessage);
    }
    res.json({ message });
  } catch (error) {
    next(error);
  }
};

export const resetPassword = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const dto = Object.assign(new ResetPasswordDto(), req.body);
    const errors = await validate(dto);
    if (errors.length) return res.status(400).json({ errors });

    const result = await authService.resetPassword(dto.email, dto.code, dto.newPassword);
    res.json(result);
  } catch (error) {
    next(error);
  }
};

export const getMe = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = req.user?.id;
    if (!userId) return res.status(401).json({ message: 'Unauthorized' });

    const user = await userService.findById(userId);
    const { password, ...userWithoutPassword } = user;
    res.json(userWithoutPassword);
  } catch (error) {
    next(error);
  }
};

export const logout = (req: Request, res: Response) => {
  res.clearCookie('access_token', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
  });
  res.json({ message: 'Logged out successfully' });
};