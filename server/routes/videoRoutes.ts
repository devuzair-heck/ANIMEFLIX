import { Router } from 'express';
import { videoController } from '../controllers/videoController.js';
import { requireAdmin } from '../middleware/authMiddleware.js';

const router = Router();

// Video stream sources management
router.get('/', videoController.getAllVideos);
router.get('/:id', videoController.getVideoById);

// Admin-only mutations
router.post('/', requireAdmin, videoController.createVideo);
router.put('/:id', requireAdmin, videoController.updateVideo);
router.delete('/:id', requireAdmin, videoController.deleteVideo);

export default router;
