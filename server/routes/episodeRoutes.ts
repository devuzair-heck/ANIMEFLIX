import { Router } from 'express';
import { episodeController } from '../controllers/episodeController.js';
import { requireAdmin } from '../middleware/authMiddleware.js';

const router = Router();

// Public / Admin Read Endpoints
router.get('/', episodeController.getAllEpisodes);
router.get('/anime/:animeId', episodeController.getEpisodesByAnime);
router.get('/:id', episodeController.getEpisodeById);

// Protected Admin Mutation Endpoints
router.post('/', requireAdmin, episodeController.createEpisode);
router.put('/:id', requireAdmin, episodeController.updateEpisode);
router.patch('/:id', requireAdmin, episodeController.updateEpisode);
router.delete('/:id', requireAdmin, episodeController.deleteEpisode);

export default router;
