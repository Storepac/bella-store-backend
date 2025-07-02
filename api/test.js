// Endpoint de teste super simples
module.exports = (req, res) => {
  res.json({ 
    message: 'Backend funcionando!',
    timestamp: new Date().toISOString()
  });
}; 