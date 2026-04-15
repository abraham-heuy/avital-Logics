import { Application, ApplicationStatus, PaymentStatus, Urgency } from '../entities/Application.entity';
import { BaseService } from './Base.service';
import { generateTicketId } from '../utils/helpers/generateCode';
import { sendAdminNewApplicationNotification, sendApplicationReceived } from './email.service';
import { BadRequestException, NotFoundException } from '../exceptions';
import { sendAdminWhatsAppNotification, sendWhatsAppMessage } from './whatsapp.service';

export class ApplicationService extends BaseService<Application> {
  constructor() {
    super(Application);
  }

  async createApplication(data: {
    applicantName: string;
    applicantEmail: string;
    applicantPhone: string;
    university?: string;
    yearOfStudy?: string;
    projectTitle: string;
    projectDescription: string;
    techStack: string;
    deadline: string;
    urgency: Urgency;
    blocker?: string;
    referralSource?: string;
    groupType?: string;
    userId?: string;
  }): Promise<Application> {
    const ticket_id = generateTicketId();
  
    const application = this.repository.create({
      ...data,
      ticket_id,
      applicationStatus: ApplicationStatus.PENDING,
      paymentStatus: PaymentStatus.UNPAID,
    });
    const saved = await this.repository.save(application);
  
    // 1. Notify the applicant
    sendApplicationReceived(saved.applicantEmail, saved.ticket_id, saved.applicantName).catch(console.error);
    if (saved.applicantPhone) {
      const whatsappMessage = `Hi ${saved.applicantName}, your Avital application has been received. Your ticket ID is: ${saved.ticket_id}. We'll review it shortly.`;
      sendWhatsAppMessage(saved.applicantPhone, whatsappMessage).catch(console.error);
    }
  
    // 2. Notify all admins
  // Inside ApplicationService.createApplication
sendAdminNewApplicationNotification({
  ticket_id: saved.ticket_id,
  applicantName: saved.applicantName,
  applicantEmail: saved.applicantEmail,
  applicantPhone: saved.applicantPhone,
  projectTitle: saved.projectTitle,
  projectDescription: saved.projectDescription,
  techStack: saved.techStack,
  deadline: saved.deadline,
  urgency: saved.urgency,
  blocker: saved.blocker,
  referralSource: saved.referralSource,
  groupType: saved.groupType,
  university: saved.university,
  yearOfStudy: saved.yearOfStudy,
}).catch(console.error);


    if (process.env.ADMIN_PHONES) {
      sendAdminWhatsAppNotification({
        ticket_id: saved.ticket_id,
        applicantName: saved.applicantName,
        applicantPhone: saved.applicantPhone,
        projectTitle: saved.projectTitle,
        urgency: saved.urgency,
      }).catch(console.error);
    }
  
    return saved;
  }
  async findByTicketId(ticketId: string): Promise<Application> {
    const application = await this.repository.findOne({ where: { ticket_id: ticketId } });
    if (!application) throw new NotFoundException('Application not found');
    return application;
  }

  async findByUserId(userId: string): Promise<Application[]> {
    return this.repository.find({ where: { userId }, order: { createdAt: 'DESC' } });
  }

  async updateStatus(id: string, status: ApplicationStatus): Promise<Application> {
    const application = await this.findById(id);
    application.applicationStatus = status;
    return this.repository.save(application);
  }

  async updatePaymentStatus(id: string, paymentStatus: PaymentStatus): Promise<Application> {
    const application = await this.findById(id);
    application.paymentStatus = paymentStatus;
    return this.repository.save(application);
  }

  async linkToUser(applicationId: string, userId: string): Promise<Application> {
    const application = await this.findById(applicationId);
    application.userId = userId;
    return this.repository.save(application);
  }


async findAllWithFilters(filters: {
    status?: ApplicationStatus;
    paymentStatus?: PaymentStatus;
    search?: string;
    page?: number;
    limit?: number;
  }) {
    const page = filters.page || 1;
    const limit = filters.limit || 10;
    const skip = (page - 1) * limit;
  
    const qb = this.repository.createQueryBuilder('app');
  
    if (filters.status) {
      qb.andWhere('app.applicationStatus = :status', { status: filters.status });
    }
    if (filters.paymentStatus) {
      qb.andWhere('app.paymentStatus = :paymentStatus', { paymentStatus: filters.paymentStatus });
    }
    if (filters.search) {
      qb.andWhere(
        '(app.ticket_id ILIKE :search OR app.applicantName ILIKE :search OR app.applicantEmail ILIKE :search OR app.projectTitle ILIKE :search)',
        { search: `%${filters.search}%` }
      );
    }
  
    qb.orderBy('app.createdAt', 'DESC').skip(skip).take(limit);
    const [applications, total] = await qb.getManyAndCount();
    return { applications, total, page, limit };
  }
  
  async review(applicationId: string, status: ApplicationStatus, adminNotes?: string) {
    const application = await this.findById(applicationId);
    application.applicationStatus = status;
    if (adminNotes) application.blocker = adminNotes;
    return this.repository.save(application);
  }
}