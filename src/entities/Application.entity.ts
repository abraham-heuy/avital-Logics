import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn } from "typeorm";
import { User } from "./User.entity";

export enum ApplicationStatus {
  PENDING = "pending",           // just submitted, not reviewed yet
  UNDER_REVIEW = "under_review", // admin is reviewing
  MATCHED = "matched",           // consultant assigned
  IN_PROGRESS = "in_progress",   // consultation started
  COMPLETED = "completed",
  CANCELLED = "cancelled",
}

export enum PaymentStatus {
  UNPAID = "unpaid",
  PAID = "paid",
  REFUNDED = "refunded",
}

export enum Urgency {
  LOW = "low",
  MEDIUM = "medium",
  HIGH = "high",
  CRITICAL = "critical",
}

@Entity("applications")
export class Application {
  @PrimaryGeneratedColumn("uuid")
  id: string;

  @Column({ unique: true })
  ticket_id: string; // e.g., AVT-123456

  // Applicant info (even without a user account)
  @Column()
  applicantName: string;

  @Column()
  applicantEmail: string;

  @Column({ nullable: true })
  applicantPhone: string;

  @Column({ nullable: true })
  university: string;

  @Column({ nullable: true })
  yearOfStudy: string;

  // Project details
  @Column()
  projectTitle: string;

  @Column("text")
  projectDescription: string;

  @Column()
  techStack: string;

  @Column({ type: "date" })
  deadline: string;

  @Column({ type: "enum", enum: Urgency })
  urgency: Urgency;

  @Column({ nullable: true })
  blocker: string;

  @Column({ nullable: true })
  referralSource: string;

  @Column({ default: "solo" })
  groupType: string; // "solo" or "group"

  @Column({ type: "enum", enum: ApplicationStatus, default: ApplicationStatus.PENDING })
  applicationStatus: ApplicationStatus;

  @Column({ type: "enum", enum: PaymentStatus, default: PaymentStatus.UNPAID })
  paymentStatus: PaymentStatus;

  // Optional link to registered user
  @ManyToOne(() => User, (user) => user.applications, { nullable: true, onDelete: "SET NULL" })
  @JoinColumn({ name: "userId" })
  user: User | null;

  @Column({ nullable: true })
  userId: string | null;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}