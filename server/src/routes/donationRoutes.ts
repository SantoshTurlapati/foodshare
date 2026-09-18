import { Router } from 'express';
import { donationController } from '../controllers/donationController.js';
import { authenticate } from '../middleware/authMiddleware.js';
import { authorize } from '../middleware/roleMiddleware.js';
import { upload } from '../middleware/uploadMiddleware.js';

const router = Router();

router.get('/', donationController.getDonations);
router.get('/my-donations', authenticate, donationController.getMyDonations);
router.get('/my-tasks', authenticate, donationController.getMyTasks);
router.get('/:id', donationController.getDonationById);

router.post(
  '/',
  authenticate,
  authorize(['donor', 'admin']),
  upload.single('image'),
  donationController.createDonation
);

router.put('/:id', authenticate, donationController.updateDonation);
router.post('/:id/cancel', authenticate, donationController.cancelDonation);

router.post('/:id/accept', authenticate, authorize(['ngo', 'volunteer', 'admin']), donationController.acceptDonation);
router.post('/:id/assign-pickup', authenticate, authorize(['ngo', 'volunteer', 'admin']), donationController.assignPickup);
router.post('/:id/collect', authenticate, authorize(['ngo', 'volunteer', 'admin']), donationController.markCollected);
router.post('/:id/distribute', authenticate, authorize(['ngo', 'volunteer', 'admin']), donationController.markDistributed);
router.post('/:id/complete', authenticate, donationController.completeDonation);

export default router;
