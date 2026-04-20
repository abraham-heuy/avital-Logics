import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { User, UserRole } from '../entities/User.entity';
import { BaseService } from './Base.service';
import { BadRequestException, UnauthorizedException, ConflictException, NotFoundException } from '../exceptions';
import { sendVerificationCode, sendPasswordResetCode } from './email.service';
import { generateVerificationCode } from '../utils/helpers/generateCode';

export class AuthService extends BaseService<User> {
  constructor() {
    super(User);
  }

  private hashPassword(password: string): Promise<string> {
    return bcrypt.hash(password, 10);
  }

  private comparePassword(password: string, hash: string): Promise<boolean> {
    return bcrypt.compare(password, hash);
  }

  private generateToken(user: User): string {
    return jwt.sign(
      { id: user.id, email: user.email, role: user.role },
      process.env.JWT_SECRET!,
      { expiresIn: '7d' }
    );
  }

  async register(data: {
    fullname: string;
    email: string;
    phoneNumber: string;
    password: string;
    university?: string;
    yearOfStudy?: string;
  }): Promise<{ user: User; verificationCode: string }> {
    const existingUser = await this.repository.findOne({ where: { email: data.email } });
    if (existingUser) throw new ConflictException('User with this email already exists');

    const verificationCode = generateVerificationCode();
    const hashedPassword = await this.hashPassword(data.password);

    const user = this.repository.create({
      ...data,
      password: hashedPassword,
      verificationCode,
      verificationCodeExpires: new Date(Date.now() + 15 * 60000),
      role: UserRole.ADMIN,
    });
    await this.repository.save(user);

    // Send verification email (don't await to avoid blocking)
    sendVerificationCode(user.email, verificationCode, user.fullname).catch(console.error);

    return { user, verificationCode };
  }

  async login(email: string, password: string): Promise<{ accessToken: string; user: Partial<User> }> {
    const user = await this.repository.findOne({
      where: { email },
      select: ['id', 'fullname', 'email', 'phoneNumber', 'password', 'role', 'isVerified', 'loginCount'],
    });
    if (!user) throw new UnauthorizedException('Invalid credentials');

    const isPasswordValid = await this.comparePassword(password, user.password);
    if (!isPasswordValid) throw new UnauthorizedException('Invalid credentials');

    // Increment login count
    user.loginCount += 1;
    user.lastLoginAt = new Date();

    // Check if login count reached 6 and user not verified
    if (user.loginCount >= 6 && !user.isVerified) {
      // Generate new verification code and send
      const newCode = generateVerificationCode();
      user.verificationCode = newCode;
      user.verificationCodeExpires = new Date(Date.now() + 15 * 60000);
      await this.repository.save(user);
      sendVerificationCode(user.email, newCode, user.fullname).catch(console.error);
      throw new UnauthorizedException('Account not verified. A new verification code has been sent to your email.');
    }

    await this.repository.save(user);

    const accessToken = this.generateToken(user);
    const { password: _, ...userWithoutPassword } = user;
    return { accessToken, user: userWithoutPassword };
  }

  async verifyCode(email: string, code: string): Promise<{ message: string }> {
    const user = await this.repository.findOne({ where: { email } });
    if (!user) throw new NotFoundException('User not found');

    if (user.isVerified) throw new BadRequestException('Account already verified');

    if (user.verificationCode !== code) throw new BadRequestException('Invalid verification code');

    if (user.verificationCodeExpires && user.verificationCodeExpires < new Date()) {
      throw new BadRequestException('Verification code has expired. Request a new one.');
    }

    user.isVerified = true;
    user.loginCount = 0; // reset login count after verification
    user.verificationCode = null;
    user.verificationCodeExpires = null;
    await this.repository.save(user);

    return { message: 'Account verified successfully' };
  }

// Inside AuthService class

async resendVerificationCode(email: string): Promise<{ message: string; code: string }> {
  const user = await this.repository.findOne({ where: { email } });
  if (!user) throw new NotFoundException('User not found');
  if (user.isVerified) throw new BadRequestException('Account already verified');

  const newCode = generateVerificationCode();
  user.verificationCode = newCode;
  user.verificationCodeExpires = new Date(Date.now() + 15 * 60000);
  await this.repository.save(user);

  // Send email (optional – you might still want to keep email notification)
  await sendVerificationCode(user.email, newCode, user.fullname).catch(console.error);

  return { message: 'Verification code resent', code: newCode };
}

async requestPasswordReset(email: string): Promise<{ message: string; code: string }> {
  const user = await this.repository.findOne({ where: { email } });
  if (!user) throw new NotFoundException('User not found');

  const resetCode = generateVerificationCode();
  user.verificationCode = resetCode;
  user.verificationCodeExpires = new Date(Date.now() + 15 * 60000);
  await this.repository.save(user);

  await sendPasswordResetCode(user.email, resetCode, user.fullname).catch(console.error);

  return { message: 'Password reset code sent to your email', code: resetCode };
}

  async resetPassword(email: string, code: string, newPassword: string): Promise<{ message: string }> {
    const user = await this.repository.findOne({ where: { email } });
    if (!user) throw new NotFoundException('User not found');

    if (user.verificationCode !== code) throw new BadRequestException('Invalid reset code');

    if (user.verificationCodeExpires && user.verificationCodeExpires < new Date()) {
      throw new BadRequestException('Reset code has expired');
    }

    const hashedPassword = await this.hashPassword(newPassword);
    user.password = hashedPassword;
    user.verificationCode = null;
    user.verificationCodeExpires = null;
    await this.repository.save(user);

    return { message: 'Password reset successfully' };
  }
}