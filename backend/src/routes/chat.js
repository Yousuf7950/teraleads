import { Router } from 'express';
import { authMiddleware } from '../middleware/auth.js';
import * as chatController from '../controllers/chatController.js';

const router = Router();
router.use(authMiddleware);
router.get('/', chatController.getChatHistory);
router.post('/', chatController.sendMessage);
export default router;
