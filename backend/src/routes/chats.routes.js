
import { Router } from 'express';
import { requireAuth } from '../middleware/auth.js';
import { listContacts, getConversation, sendMessage, getUnreadCounts } from '../controllers/chats.controller.js';

const router = Router();

// Get unread counts
router.get('/unread-counts', requireAuth, getUnreadCounts);

// List chat partners derived from reservations
router.get('/contacts', requireAuth, listContacts);

// Conversation between logged-in user and :userId (allowed only if reservation link exists)
router.get('/:userId', requireAuth, getConversation);

// Send message to a user if reservation link exists
router.post('/', requireAuth, sendMessage);

export default router;
