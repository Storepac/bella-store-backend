import express from 'express';

const router = express.Router();

// Placeholder para rotas do dashboard
router.get('/stats', (req, res) => {
  res.json({
    success: true,
    message: 'Dashboard em desenvolvimento'
  });
});

export default router;