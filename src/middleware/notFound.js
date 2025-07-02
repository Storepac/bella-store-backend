// Middleware para rotas não encontradas
export const notFound = (req, res) => {
  res.status(404).json({
    success: false,
    message: `Rota ${req.method} ${req.originalUrl} não encontrada`,
    error: 'ROUTE_NOT_FOUND'
  });
};