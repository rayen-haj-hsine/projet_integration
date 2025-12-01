import { Router } from 'express';
import { requireAuth } from '../middleware/auth.js';
import {
    createReservation,
    confirmReservation,
    cancelReservation,
    listMyReservations,
    getTripReservations
} from '../controllers/reservations.controller.js';

const router = Router();

router.get('/me', requireAuth, listMyReservations);
router.post('/', requireAuth, createReservation);
router.get('/trip/:tripId', requireAuth, getTripReservations);
router.patch('/:id/confirm', requireAuth, confirmReservation);
router.patch('/:id/cancel', requireAuth, cancelReservation);

export default router;
