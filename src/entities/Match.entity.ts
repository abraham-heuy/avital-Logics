import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn, CreateDateColumn, UpdateDateColumn } from "typeorm";
import { Application } from "./Application.entity";
import { User } from "./User.entity";


export enum MatchStatus {
  PENDING = "pending",     // consultant hasn't responded
  ACCEPTED = "accepted",   // consultant accepted
  REJECTED = "rejected",
  IN_PROGRESS = "in_progress",
  COMPLETED = "completed",
}

@Entity("matches")
export class Match {
  @PrimaryGeneratedColumn("uuid")
  id: string;

  @ManyToOne(() => Application, { onDelete: "CASCADE" })
  @JoinColumn({ name: "applicationId" })
  application: Application;

  @Column()
  applicationId: string;

  @ManyToOne(() => User)
  @JoinColumn({ name: "consultantId" })
  consultant: User;

  @Column()
  consultantId: string;

  @Column({ type: "enum", enum: MatchStatus, default: MatchStatus.PENDING })
  status: MatchStatus;

  @Column({ nullable: true })
  notes: string;

  @Column({ default: false })
  paymentConfirmed: boolean; // once admin confirms payment, consultation can start

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}