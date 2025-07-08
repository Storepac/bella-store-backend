import express from 'express';

const router = express.Router();

// Placeholder para rotas de upload
router.post('/', (req, res) => {
  res.json({
    success: true,
    message: 'Upload em desenvolvimento'
  });
});

export default router;