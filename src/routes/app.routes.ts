import { Router } from 'express';
import * as authController from '../controllers/auth.controller';
import * as applicationController from '../controllers/application.controller';
import * as matchController from '../controllers/match.controller';
import * as adminController from '../controllers/admin.controller';
import * as userController from '../controllers/user.controller';
import { authMiddleware } from '../middlewares/auth.middleware';
import { roleCheck } from '../middlewares/rolecheck.middleware';

const router = Router();
 
// Auth routes (public)
router.post('/auth/register', authController.register);
router.post('/auth/login', authController.login);
router.post('/auth/verify', authController.verifyCode);
router.post('/auth/resend-code', authController.resendVerificationCode);
router.post('/auth/forgot-password', authController.requestPasswordReset);
router.post('/auth/reset-password', authController.resetPassword);
router.get('/auth/me', authMiddleware, authController.getMe);
router.post('/auth/logout', authMiddleware, authController.logout);

// Application routes
router.post('/applications', applicationController.createApplication);
router.get('/applications/ticket/:ticketId', applicationController.getApplicationByTicket);
router.get('/applications/me', authMiddleware, applicationController.getUserApplications);

// User profile routes (protected)
router.get('/users/me', authMiddleware, userController.getProfile);
router.put('/users/me', authMiddleware, userController.updateProfile);
router.post('/users/change-password', authMiddleware, userController.changePassword);
router.get('/consultants', userController.getConsultants);

// Match routes (consultant and admin)
router.post('/matches', authMiddleware, roleCheck(['admin']), matchController.createMatch);
router.put('/matches/:matchId/accept', authMiddleware, roleCheck(['consultant']), matchController.acceptMatch);
router.put('/matches/:matchId/reject', authMiddleware, roleCheck(['consultant']), matchController.rejectMatch);
router.put('/matches/:matchId/start', authMiddleware, roleCheck(['consultant']), matchController.startConsultation);
router.put('/matches/:matchId/complete', authMiddleware, roleCheck(['consultant']), matchController.completeMatch);
router.put('/matches/:matchId/pay', authMiddleware, roleCheck(['admin']), matchController.confirmPayment);
router.get('/consultant/matches', authMiddleware, roleCheck(['consultant']), matchController.getConsultantMatches);

// Admin routes
router.get('/admin/applications', authMiddleware, roleCheck(['admin']), adminController.getAllApplications);
router.post('/admin/applications/review/:applicationId', authMiddleware, roleCheck(['admin']), adminController.reviewApplication);
router.post('/admin/assign-consultant', authMiddleware, roleCheck(['admin']), adminController.assignConsultant);
router.get('/admin/dashboard/stats', authMiddleware, roleCheck(['admin']), adminController.getDashboardStats);

export default router;