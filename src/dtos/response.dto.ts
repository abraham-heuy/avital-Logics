export class ApiResponse<T> {
    success: boolean;
    message: string;
    data?: T;
    errors?: any;
  }
  
  export class AuthResponseDto {
    accessToken: string;
    user: {
      id: string;
      fullname: string;
      email: string;
      role: string;
      isVerified: boolean;
    };
  }
  
  export class ApplicationResponseDto {
    id: string;
    ticket_id: string;
    applicantName: string;
    applicantEmail: string;
    projectTitle: string;
    projectDescription: string;
    techStack: string;
    deadline: string;
    urgency: string;
    applicationStatus: string;
    paymentStatus: string;
    createdAt: Date;
    updatedAt: Date;
  }
  
  export class MatchResponseDto {
    id: string;
    applicationId: string;
    consultantId: string;
    consultantName: string;
    status: string;
    paymentConfirmed: boolean;
    notes: string;
    createdAt: Date;
    updatedAt: Date;
  }