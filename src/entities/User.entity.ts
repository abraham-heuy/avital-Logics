import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, OneToMany } from "typeorm";
import { Application } from "./Application.entity";
import { Match } from "./Match.entity";

export enum UserRole {
  STUDENT = "student",
  CONSULTANT = "consultant",
  ADMIN = "admin",
}

@Entity("users")
export class User {
  @PrimaryGeneratedColumn("uuid")
  id: string;

  @Column({ type: "varchar" })
  fullname: string;

  @Column({ type: "varchar", unique: true })
  email: string;

  @Column({ type: "varchar", nullable: true })
  phoneNumber: string;

  @Column({ type: "varchar", select: false })
  password: string;

  @Column({ type: "enum", enum: UserRole, default: UserRole.STUDENT })
  role: UserRole;

  @Column({ type: "varchar", nullable: true })
  university: string;

  @Column({ type: "varchar", nullable: true })
  yearOfStudy: string;

  @Column({ type: "varchar", nullable: true })
  techStack: string;

  @Column({ type: "boolean", default: false })
  isVerified: boolean;

  @Column({ type: "varchar", nullable: true })
  verificationCode: string | null;

  @Column({ type: "timestamp", nullable: true })
  verificationCodeExpires: Date | null;

  @Column({ type: "int", default: 0 })
  loginCount: number;

  @Column({ type: "timestamp", nullable: true })
  lastLoginAt: Date | null;

  @Column({ type: "boolean", default: true })
  isActive: boolean;

  @CreateDateColumn({ type: "timestamp" })
  createdAt: Date;

  @UpdateDateColumn({ type: "timestamp" })
  updatedAt: Date;

  @OneToMany(() => Application, (app) => app.user)
  applications: Application[];

  @OneToMany(() => Match, (match) => match.consultant)
  matchesAsConsultant: Match[];
}