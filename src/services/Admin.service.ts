import { ApplicationStatus, PaymentStatus } from "../entities/Application.entity";
import { MatchStatus } from "../entities/Match.entity";
import { UserRole } from "../entities/User.entity";
import { BadRequestException } from "../exceptions";
import { ApplicationService } from "./Application.service";
import { MatchService } from "./Match.service";
import { UserService } from "./User.service";

export class AdminService {
  private applicationService: ApplicationService;
  private matchService: MatchService;
  private userService: UserService;

  constructor() {
    this.applicationService = new ApplicationService();
    this.matchService = new MatchService();
    this.userService = new UserService();
  }

  async getAllApplications(filters?: {
    status?: ApplicationStatus;
    paymentStatus?: PaymentStatus;
    search?: string;
    page?: number;
    limit?: number;
  }) {
    // Use the service method instead of direct query builder
    return this.applicationService.findAllWithFilters(filters || {});
  }

  async assignConsultant(applicationId: string, consultantId: string, notes?: string) {
    const existingMatch = await this.matchService.findExistingMatch(applicationId);
    if (existingMatch) {
      throw new BadRequestException('Application already has a match');
    }
    return this.matchService.createMatch(applicationId, consultantId, notes);
  }

  async reviewApplication(applicationId: string, status: ApplicationStatus, adminNotes?: string) {
    return this.applicationService.review(applicationId, status, adminNotes);
  }

  async getDashboardStats() {
    // Get repositories via public getters
    const appRepo = this.applicationService.getRepository();
    const matchRepo = this.matchService.getRepository();
    const userRepo = this.userService.getRepository();

    const totalApplications = await appRepo.count();
    const pendingApplications = await appRepo.count({
      where: { applicationStatus: ApplicationStatus.PENDING },
    });
    const completedApplications = await appRepo.count({
      where: { applicationStatus: ApplicationStatus.COMPLETED },
    });
    const totalConsultants = await userRepo.count({
      where: { role: UserRole.CONSULTANT },
    });
    const totalStudents = await userRepo.count({
      where: { role: UserRole.STUDENT },
    });
    const activeMatches = await matchRepo.count({
      where: { status: MatchStatus.IN_PROGRESS },
    });

    return {
      totalApplications,
      pendingApplications,
      completedApplications,
      totalConsultants,
      totalStudents,
      activeMatches,
    };
  }
}