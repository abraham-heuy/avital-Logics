import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn } from "typeorm";

@Entity("notifications")
export class Notification {
  @PrimaryGeneratedColumn("uuid")
  id: string;

  @Column()
  recipientEmail: string;

  @Column({ nullable: true })
  recipientPhone: string;

  @Column()
  subject: string;

  @Column("text")
  message: string;

  @Column({ default: false })
  emailSent: boolean;

  @Column({ default: false })
  whatsappSent: boolean;

  @CreateDateColumn()
  createdAt: Date;
}