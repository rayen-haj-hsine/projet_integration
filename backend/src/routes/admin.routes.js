import { Router } from 'express';
import { requireAuth, requireAdmin } from '../middleware/auth.js';
import { getPendingDrivers, approveDriver, rejectDriver, getPassengers, getApprovedDrivers } from '../controllers/admin.controller.js';

const router = Router();

router.get('/pending-drivers', requireAuth, requireAdmin, getPendingDrivers);
router.patch('/approve-driver/:id', requireAuth, requireAdmin, approveDriver);
router.patch('/reject-driver/:id', requireAuth, requireAdmin, rejectDriver);
router.get('/passengers', requireAuth, requireAdmin, getPassengers);
router.get('/drivers', requireAuth, requireAdmin, getApprovedDrivers);

export default router;
