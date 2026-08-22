import { Router } from 'express';
import { genreController } from '../controllers/genreController.js';
import { requireAdmin } from '../middleware/authMiddleware.js';

const router = Router();

// Public Genres
router.get('/', genreController.getAllGenres);

// Admin Genres management
router.post('/', requireAdmin, genreController.createGenre);
router.put('/:id', requireAdmin, genreController.updateGenre);
router.delete('/:id', requireAdmin, genreController.deleteGenre);

export default router;
