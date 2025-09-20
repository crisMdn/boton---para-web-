import { Router } from 'express';
import { upload } from '../middleware/upload.js';
import { uploadImages, listImages, getByIds } from '../controllers/images.controller.js';

const router = Router();

router.post('/upload', upload.array('images', 20), uploadImages);
router.get('/images', listImages);
router.get('/images/by-ids', getByIds);

export default router;
