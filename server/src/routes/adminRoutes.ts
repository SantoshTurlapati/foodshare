import { Router } from 'express';
import { adminController } from '../controllers/adminController.js';
import { authenticate } from '../middleware/authMiddleware.js';
import { authorize } from '../middleware/roleMiddleware.js';

const router = Router();

router.use(authenticate);
router.use(authorize(['admin']));

router.get('/stats', adminController.getDashboardStats);
router.get('/users', adminController.getUsers);
router.put('/users/:id/status', adminController.updateUserStatus);
router.put('/ngo/:id/verification', adminController.updateNgoVerification);
router.get('/donations', adminController.getDonationsAdmin);
router.delete('/donations/:id', adminController.deleteDonation);
router.get('/audit-logs', adminController.getAuditLogs);

export default router;
