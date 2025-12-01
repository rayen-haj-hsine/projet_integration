
import { Router } from 'express';
import { register, login, getMe, updateMe, changePassword } from '../controllers/auth.controller.js';
import { requireAuth } from '../middleware/auth.js';

import { upload } from '../config/multer.js';

const router = Router();

router.post('/register', upload.fields([
    { name: 'profile_photo', maxCount: 1 },
    { name: 'license_document', maxCount: 1 }
]), register);
router.post('/login', login);

// Profile
router.get('/me', requireAuth, getMe);
router.put('/me', requireAuth, updateMe);
router.put('/me/password', requireAuth, changePassword); // NEW

export default router;
