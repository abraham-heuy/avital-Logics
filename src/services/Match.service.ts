import { Match, MatchStatus } from '../entities/Match.entity';
import { BaseService } from './Base.service';
import { ApplicationService } from './Application.service';
import { UserService } from './User.service';
import { sendMatchAccepted } from './email.service';
import { BadRequestException, NotFoundException } from '../exceptions';
import { ApplicationStatus, PaymentStatus } from '../entities/Application.entity';

export class MatchService extends BaseService<Match> {
  private applicationService: ApplicationService;
  private userService: UserService;

  constructor() {
    super(Match);
    this.applicationService = new ApplicationService();
    this.userService = new UserService();
  }

  async createMatch(applicationId: string, consultantId: string, notes?: string): Promise<Match> {
    const application = await this.applicationService.findById(applicationId);
    if (application.applicationStatus !== 'pending') {
      throw new BadRequestException('Application is not in pending state');
    }

    const consultant = await this.userService.findById(consultantId);
    if (consultant.role !== 'consultant') {
      throw new BadRequestException('User is not a consultant');
    }

    // Check if match already exists for this application
    const existing = await this.repository.findOne({ where: { applicationId } });
    if (existing) throw new BadRequestException('Match already exists for this application');

    const match = this.repository.create({
      applicationId,
      consultantId,
      notes,
      status: MatchStatus.PENDING,
    });
    const saved = await this.repository.save(match);

    return saved;
  }

  async acceptMatch(matchId: string): Promise<Match> {
    const match = await this.findById(matchId, ['application', 'consultant']);
    if (match.status !== MatchStatus.PENDING) {
      throw new BadRequestException('Match is not in pending state');
    }

    match.status = MatchStatus.ACCEPTED;
    const saved = await this.repository.save(match);

    // Update application status to matched
    await this.applicationService.updateStatus(match.applicationId, ApplicationStatus.MATCHED);

    // Send notification to student
    const application = match.application;
    const consultant = match.consultant;
    const dashboardLink = `${process.env.FRONTEND_URL}/dashboard`;
    sendMatchAccepted(
      application.applicantEmail,
      application.projectTitle,
      consultant.fullname,
      consultant.email,
      dashboardLink
    ).catch(console.error);

    return saved;
  }

  async rejectMatch(matchId: string, reason?: string): Promise<Match> {
    const match = await this.findById(matchId);
    if (match.status !== MatchStatus.PENDING) {
      throw new BadRequestException('Match is not in pending state');
    }

    match.status = MatchStatus.REJECTED;
    match.notes = reason || match.notes;
    return this.repository.save(match);
  }

  async startConsultation(matchId: string): Promise<Match> {
    const match = await this.findById(matchId);
    if (match.status !== MatchStatus.ACCEPTED) {
      throw new BadRequestException('Match must be accepted before starting consultation');
    }

    match.status = MatchStatus.IN_PROGRESS;
    return this.repository.save(match);
  }

  async completeMatch(matchId: string): Promise<Match> {
    const match = await this.findById(matchId);
    if (match.status !== MatchStatus.IN_PROGRESS) {
      throw new BadRequestException('Match must be in progress to complete');
    }

    match.status = MatchStatus.COMPLETED;
    const saved = await this.repository.save(match);

    // Update application status to completed
    await this.applicationService.updateStatus(match.applicationId, ApplicationStatus.COMPLETED);

    return saved;
  }

  async confirmPayment(matchId: string): Promise<Match> {
    const match = await this.findById(matchId);
    match.paymentConfirmed = true;
    const saved = await this.repository.save(match);

    // Update application payment status
    await this.applicationService.updatePaymentStatus(match.applicationId, PaymentStatus.PAID);

    return saved;
  }

  async getMatchesForConsultant(consultantId: string): Promise<Match[]> {
    return this.repository.find({
      where: { consultantId },
      relations: ['application'],
      order: { createdAt: 'DESC' },
    });
  }

  async findExistingMatch(applicationId: string): Promise<Match | null> {
    return this.repository.findOne({ where: { applicationId } });
  }
}