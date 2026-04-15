import { User, UserRole } from '../entities/User.entity';
import { BaseService } from './Base.service';
import { BadRequestException, NotFoundException } from '../exceptions';
import bcrypt from 'bcrypt';

export class UserService extends BaseService<User> {
constructor(){
    super(User)
}

  async findByEmail(email: string): Promise<User | null> {
    return this.repository.findOne({ where: { email } });
  }

  async updateProfile(userId: string, data: Partial<User>): Promise<User> {
    const user = await this.findById(userId);
    Object.assign(user, data);
    return this.repository.save(user);
  }

  async changePassword(userId: string, currentPassword: string, newPassword: string): Promise<void> {
    const user = await this.repository.findOne({
      where: { id: userId },
      select: ['id', 'password'],
    });
    if (!user) throw new NotFoundException('User not found');

    const isMatch = await bcrypt.compare(currentPassword, user.password);
    if (!isMatch) throw new BadRequestException('Current password is incorrect');

    user.password = await bcrypt.hash(newPassword, 10);
    await this.repository.save(user);
  }

  async getConsultants(): Promise<User[]> {
    return this.repository.find({
      where: { role: UserRole.CONSULTANT, isActive: true },
      order: { fullname: 'ASC' },
    });
  }
}