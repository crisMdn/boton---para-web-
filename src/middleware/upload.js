import multer from 'multer';

const allowed = new Set(['image/jpeg','image/png','image/webp','image/gif']);

export const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024, files: 20 },
  fileFilter: (_req, file, cb) => {
    if (!allowed.has(file.mimetype)) return cb(new Error('Tipo no permitido'));
    cb(null, true);
  }
});
