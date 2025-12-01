import { Router } from 'express';
import { requireAuth, requireRole } from '../middleware/auth.js';
import { createTrip, searchTrips, getTripById, listMyTrips, deleteTrip, estimatePrice, getTripHistory, updateTrip, estimateTripTime } from '../controllers/trips.controller.js';
const router = Router();

router.get('/', searchTrips);
router.get('/history', requireAuth, getTripHistory);
router.get('/my', requireAuth, requireRole('driver'), listMyTrips);
router.get('/:id', getTripById);
router.post('/', requireAuth, requireRole('driver'), createTrip);
router.post('/estimate-price', requireAuth, requireRole('driver'), estimatePrice);
router.post('/estimate-time', estimateTripTime);
router.patch('/:id', requireAuth, requireRole('driver'), updateTrip);
router.delete('/:id', requireAuth, requireRole('driver'), deleteTrip);

export default router;
