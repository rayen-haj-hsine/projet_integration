
import { Router } from 'express';
import { requireAuth, requireRole } from '../middleware/auth.js';
import { createTrip, searchTrips, getTripById } from '../controllers/trips.controller.js';

const router = Router();

router.get('/', searchTrips);
router.get('/:id', getTripById);
router.post('/', requireAuth, requireRole('driver'), createTrip);

export default router;
