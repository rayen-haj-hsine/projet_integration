import { Router } from 'express';
import { requireAuth } from '../middleware/auth.js';
import { createRating, getTripRatings, getUserRatings } from '../controllers/ratings.controller.js';

const router = Router();

router.post('/', requireAuth, createRating);
router.get('/trip/:tripId', getTripRatings);
router.get('/user/:userId', getUserRatings);

export default router;
