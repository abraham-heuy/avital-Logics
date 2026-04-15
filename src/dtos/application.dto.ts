import { IsString, IsEmail, IsOptional, IsDateString, IsEnum, MinLength, MaxLength } from "class-validator";
import { Urgency } from "../entities/Application.entity";

export class CreateApplicationDto {
  @IsString()
  @MinLength(2)
  applicantName: string;

  @IsEmail()
  applicantEmail: string;

  @IsString()
  @MinLength(10)
  applicantPhone: string;

  @IsOptional()
  @IsString()
  university?: string;

  @IsOptional()
  @IsString()
  yearOfStudy?: string;

  @IsString()
  @MinLength(3)
  projectTitle: string;

  @IsString()
  @MinLength(10)
  projectDescription: string;

  @IsString()
  techStack: string;

  @IsDateString()
  deadline: string;

  @IsEnum(Urgency)
  urgency: Urgency;

  @IsOptional()
  @IsString()
  blocker?: string;

  @IsOptional()
  @IsString()
  referralSource?: string;

  @IsOptional()
  @IsString()
  groupType?: string; // "solo" or "group"
}

export class UpdateApplicationDto {
  @IsOptional()
  @IsString()
  projectTitle?: string;

  @IsOptional()
  @IsString()
  projectDescription?: string;

  @IsOptional()
  @IsString()
  techStack?: string;

  @IsOptional()
  @IsDateString()
  deadline?: string;

  @IsOptional()
  @IsEnum(Urgency)
  urgency?: Urgency;

  @IsOptional()
  @IsString()
  blocker?: string;
}

export class AdminUpdateApplicationDto {
  @IsOptional()
  @IsString()
  applicationStatus?: string; // pending, under_review, matched, etc.

  @IsOptional()
  @IsString()
  paymentStatus?: string; // unpaid, paid, refunded
}