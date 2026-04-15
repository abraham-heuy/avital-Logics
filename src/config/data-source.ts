import "reflect-metadata";
import { DataSource } from "typeorm";
import { User } from "../entities/User.entity";
import { Application } from "../entities/Application.entity";
import { Match } from "../entities/Match.entity";
import { Notification } from "../entities/Notification.entity";

// Determine if we're using a full URL or separate parameters
const useDirectUrl = !!process.env.DIRECT_URL;

export const AppDataSource = new DataSource({
  type: "postgres",
  ...(useDirectUrl
    ? { url: process.env.DIRECT_URL }
    : {
        host: process.env.DB_HOST,
        port: parseInt(process.env.DB_PORT || "5432"),
        username: process.env.DB_USER,
        password: process.env.DB_PASSWORD,
        database: process.env.DB_NAME,
      }),
  synchronize: false, // always false in production – use migrations
  logging: process.env.NODE_ENV !== "production",
  entities: [User, Application, Match, Notification],
  migrations: ["src/migrations/*.ts"],
  subscribers: [],
  // Supabase requires SSL but rejects self‑signed certificates – this setting works for most cases
  ssl: useDirectUrl ? { rejectUnauthorized: false } : false,
});