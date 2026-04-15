import 'dotenv/config';
import 'reflect-metadata';
import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import dotenv from 'dotenv';

import apiRoutes from './routes/app.routes';
import { AppException } from './exceptions';
import { AppDataSource } from './config/data-source';
import { errorHandler } from './middlewares/errorHandler.middleware';
import { initWhatsApp } from './services/whatsapp.service';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 8080;

// 1. Basic Middleware
app.use(cors({
  origin: [ 'https://avital.vercel.app'],  // for dev #'http://localhost:5173'
  credentials: true,
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// 2. Health Check & Readiness Probe
app.get('/health', (req: Request, res: Response) => {
  res.status(200).json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
  });
});

// More detailed readiness check (database connection)
app.get('/ready', async (req: Request, res: Response) => {
  try {
    if (AppDataSource.isInitialized) {
      res.status(200).json({ status: 'ready', database: 'connected' });
    } else {
      res.status(503).json({ status: 'not ready', database: 'disconnected' });
    }
  } catch (error) {
    res.status(503).json({ status: 'not ready', database: 'error' });
  }
});

// 3. API Routes
app.use('/avital/api', apiRoutes);

// 4. 404 Handler (for unmatched routes)
app.use((req: Request, res: Response, next: NextFunction) => {
  next(new AppException(`Route ${req.method} ${req.url} not found`, 404, 'NOT_FOUND'));
});

// 5. Global Error Handler

app.use(errorHandler);

// 6. Start Server after Database Connection
const startServer = async () => {
  try {
    await AppDataSource.initialize();
    console.log('✅ Database connection established');
    await initWhatsApp();
    app.listen(PORT, () => {
      console.log(` Server running on http://localhost:${PORT}`);
      console.log(`API docs available at http://localhost:${PORT}/health`);
    });
  } catch (error) {
    console.error('❌ Failed to start server:', error);
    process.exit(1);
  }
};

startServer();

// Handle graceful shutdown
process.on('SIGINT', async () => {
  console.log('Shutting down gracefully...');
  if (AppDataSource.isInitialized) {
    await AppDataSource.destroy();
  }
  process.exit(0);
});