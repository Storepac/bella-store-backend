// Middleware de tratamento de erros
export const errorHandler = (err, req, res, next) => {
  console.error('❌ Erro capturado:', {
    message: err.message,
    stack: err.stack,
    url: req.url,
    method: req.method,
    body: req.body,
    params: req.params,
    query: req.query
  });

  // Erro de validação do Joi
  if (err.isJoi) {
    return res.status(400).json({
      success: false,
      message: 'Dados inválidos',
      errors: err.details.map(detail => ({
        field: detail.path.join('.'),
        message: detail.message
      }))
    });
  }

  // Erro de JWT
  if (err.name === 'JsonWebTokenError') {
    return res.status(401).json({
      success: false,
      message: 'Token inválido'
    });
  }

  if (err.name === 'TokenExpiredError') {
    return res.status(401).json({
      success: false,
      message: 'Token expirado'
    });
  }

  // Erro de banco de dados PostgreSQL
  if (err.code) {
    switch (err.code) {
      case '23505': // Unique violation
        return res.status(409).json({
          success: false,
          message: 'Dados duplicados. Este registro já existe.',
          error: 'DUPLICATE_ENTRY'
        });
      
      case '23503': // Foreign key violation
        return res.status(400).json({
          success: false,
          message: 'Referência inválida. Verifique os dados relacionados.',
          error: 'FOREIGN_KEY_VIOLATION'
        });
      
      case '23502': // Not null violation
        return res.status(400).json({
          success: false,
          message: 'Campo obrigatório não informado.',
          error: 'REQUIRED_FIELD_MISSING'
        });
      
      case '42P01': // Undefined table
        return res.status(500).json({
          success: false,
          message: 'Erro de configuração do banco de dados.',
          error: 'DATABASE_CONFIG_ERROR'
        });
    }
  }

  // Erro de arquivo muito grande
  if (err.code === 'LIMIT_FILE_SIZE') {
    return res.status(413).json({
      success: false,
      message: 'Arquivo muito grande. Tamanho máximo permitido: 5MB',
      error: 'FILE_TOO_LARGE'
    });
  }

  // Erro de tipo de arquivo não permitido
  if (err.code === 'INVALID_FILE_TYPE') {
    return res.status(400).json({
      success: false,
      message: 'Tipo de arquivo não permitido. Use apenas imagens (JPG, PNG, WebP).',
      error: 'INVALID_FILE_TYPE'
    });
  }

  // Erro padrão
  const statusCode = err.statusCode || err.status || 500;
  const message = err.message || 'Erro interno do servidor';

  res.status(statusCode).json({
    success: false,
    message,
    error: process.env.NODE_ENV === 'development' ? err.stack : undefined
  });
};