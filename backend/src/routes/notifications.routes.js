
import { Router } from 'express';
import { requireAuth } from '../middleware/auth.js';
import { listNotifications, markRead } from '../controllers/notifications.controller.js';

const router = Router();

router.get('/', requireAuth, listNotifications);
router.patch('/:id/read', requireAuth, markRead);

export default router;
