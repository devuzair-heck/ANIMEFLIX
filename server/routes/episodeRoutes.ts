import { Router } from 'express';
import { animeController } from '../controllers/animeController.js';
import { requireAdmin } from '../middleware/authMiddleware.js';

const router = Router();

// Episode Management Endpoints
router.get('/', animeController.getAllEpisodes);
router.post('/', requireAdmin, animeController.addEpisode);
router.put('/:id', requireAdmin, animeController.updateEpisode);
router.delete('/:id', requireAdmin, animeController.deleteEpisode);

export default router;
