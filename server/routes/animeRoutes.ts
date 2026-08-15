import { Router } from 'express';
import { animeController } from '../controllers/animeController.js';
import { requireAdmin } from '../middleware/authMiddleware.js';

const router = Router();

// Public Catalog Endpoints
router.get('/', animeController.getAllAnime);
router.get('/:id', animeController.getAnimeById);
router.get('/:id/episodes', animeController.getAnimeEpisodes);

// Protected Admin Endpoints (Only authenticated admins can add/edit/delete)
router.post('/', requireAdmin, animeController.createAnime);
router.put('/:id', requireAdmin, animeController.updateAnime);
router.delete('/:id', requireAdmin, animeController.deleteAnime);

// Anime Episode nested endpoints
router.post('/:id/episodes', requireAdmin, animeController.addEpisode);

export default router;
