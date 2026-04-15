import { Request, Response, NextFunction } from 'express';
import { UserService } from '../services/User.service';
import { UpdateUserProfileDto, ChangePasswordDto } from '../dtos/user.dto';
import { validate } from 'class-validator';

const userService = new UserService();

/**
 * Get the currently logged-in user's profile
 */
export const getProfile = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = (req as any).user?.id;
    if (!userId) return res.status(401).json({ message: 'Unauthorized' });

    const user = await userService.findById(userId);
    const { password, ...userWithoutPassword } = user;
    res.json(userWithoutPassword);
  } catch (error) {
    next(error);
  }
};

/**
 * Update user profile (name, university, year, etc.)
 */
export const updateProfile = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = (req as any).user?.id;
    if (!userId) return res.status(401).json({ message: 'Unauthorized' });

    const dto = Object.assign(new UpdateUserProfileDto(), req.body);
    const errors = await validate(dto);
    if (errors.length) return res.status(400).json({ errors });

    const updatedUser = await userService.updateProfile(userId, dto);
    const { password, ...userWithoutPassword } = updatedUser;
    res.json(userWithoutPassword);
  } catch (error) {
    next(error);
  }
};

/**
 * Change user password (requires current password)
 */
export const changePassword = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = (req as any).user?.id;
    if (!userId) return res.status(401).json({ message: 'Unauthorized' });

    const dto = Object.assign(new ChangePasswordDto(), req.body);
    const errors = await validate(dto);
    if (errors.length) return res.status(400).json({ errors });

    await userService.changePassword(userId, dto.currentPassword, dto.newPassword);
    res.json({ message: 'Password changed successfully' });
  } catch (error) {
    next(error);
  }
};

/**
 * Get list of all active consultants (public)
 */
export const getConsultants = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const consultants = await userService.getConsultants();
    res.json(consultants);
  } catch (error) {
    next(error);
  }
};