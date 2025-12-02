import { Router } from 'express';
import { requireAuth, requireAdmin } from '../middleware/auth.js';
import {
    getPendingDrivers, approveDriver, rejectDriver,
    getPassengers, getApprovedDrivers,
    getDriverRequests, approveDriverRequest, rejectDriverRequest
} from '../controllers/admin.controller.js';

const router = Router();

router.get('/pending-drivers', requireAuth, requireAdmin, getPendingDrivers);
router.patch('/approve-driver/:id', requireAuth, requireAdmin, approveDriver);
router.patch('/reject-driver/:id', requireAuth, requireAdmin, rejectDriver);
router.get('/passengers', requireAuth, requireAdmin, getPassengers);
router.get('/drivers', requireAuth, requireAdmin, getApprovedDrivers);

// Driver upgrade requests
router.get('/driver-requests', requireAuth, requireAdmin, getDriverRequests);
router.patch('/driver-requests/:id/approve', requireAuth, requireAdmin, approveDriverRequest);
router.patch('/driver-requests/:id/reject', requireAuth, requireAdmin, rejectDriverRequest);

export default router;
