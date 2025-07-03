import express from 'express';

const router = express.Router();

// Placeholder para rotas de pedidos
router.get('/', (req, res) => {
  res.json({
    success: true,
    message: 'Rotas de pedidos em desenvolvimento'
  });
});

export default router;