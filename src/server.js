import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import morgan from 'morgan';
import rateLimit from 'express-rate-limit';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

// Importar rotas
import authRoutes from './routes/auth.js';
import storeRoutes from './routes/stores.js';
import productRoutes from './routes/products.js';
import categoryRoutes from './routes/categories.js';
import orderRoutes from './routes/orders.js';
import bannerRoutes from './routes/banners.js';
import uploadRoutes from './routes/upload.js';
import dashboardRoutes from './routes/dashboard.js';

// Importar middlewares
import { errorHandler } from './middleware/errorHandler.js';
import { notFound } from './middleware/notFound.js';

// Configurar __dirname para ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Carregar variáveis de ambiente
dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

// Testar conexão com banco na inicialização
import { testConnection } from './config/database.js';

// Teste de conexão assíncrono
const initializeDatabase = async () => {
  try {
    await testConnection();
    console.log('✅ Banco de dados inicializado com sucesso');
  } catch (error) {
    console.error('⚠️ Erro ao conectar com banco de dados:', error);
    // Continua mesmo com erro de DB em produção
    if (process.env.NODE_ENV !== 'production') {
      console.error('❌ Parando aplicação devido a erro de DB');
    }
  }
};

// Inicializar DB
initializeDatabase();

// Capturar erros não tratados (para Railway)
process.on('uncaughtException', (error) => {
  console.error('❌ Erro não capturado:', error);
  // Em produção, continua rodando
  if (process.env.NODE_ENV !== 'production') {
    process.exit(1);
  }
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('❌ Promise rejeitada não tratada:', reason);
  // Em produção, continua rodando
  if (process.env.NODE_ENV !== 'production') {
    process.exit(1);
  }
});

// Rate limiting
const limiter = rateLimit({
  windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS) || 15 * 60 * 1000, // 15 minutos
  max: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS) || 100, // máximo 100 requests por IP
  message: {
    error: 'Muitas tentativas. Tente novamente em alguns minutos.'
  }
});

// Middlewares globais
app.use(helmet());
app.use(compression());
app.use(morgan('combined'));
app.use(limiter);

// CORS
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// Body parsing
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Servir arquivos estáticos (uploads)
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// Health check aprimorado
app.get('/health', async (req, res) => {
  try {
    // Testar conexão com banco
    await testConnection();
    
    res.json({
      status: 'OK',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      environment: process.env.NODE_ENV,
      database: 'connected',
      memory: process.memoryUsage(),
      version: process.version
    });
  } catch (error) {
    res.status(503).json({
      status: 'ERROR',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      environment: process.env.NODE_ENV,
      database: 'disconnected',
      error: error.message
    });
  }
});

// Rotas da API
app.use('/api/auth', authRoutes);
app.use('/api/stores', storeRoutes);
app.use('/api/products', productRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/banners', bannerRoutes);
app.use('/api/upload', uploadRoutes);
app.use('/api/dashboard', dashboardRoutes);

// Middleware de erro 404
app.use(notFound);

// Middleware de tratamento de erros
app.use(errorHandler);

// Iniciar servidor 
const server = app.listen(PORT, () => {
  console.log(`🚀 Servidor rodando na porta ${PORT}`);
  console.log(`📱 Ambiente: ${process.env.NODE_ENV}`);
  if (process.env.NODE_ENV === 'production') {
    console.log(`🌐 Railway URL: Verifique no painel do Railway`);
  } else {
    console.log(`🌐 URL: http://localhost:${PORT}`);
  }
});

// Graceful shutdown para Railway
const gracefulShutdown = () => {
  console.log('📴 Iniciando shutdown graceful...');
  
  server.close(() => {
    console.log('✅ Servidor HTTP fechado');
    process.exit(0);
  });

  // Forçar fechamento se demorar muito
  setTimeout(() => {
    console.error('⚠️ Forçando fechamento do servidor');
    process.exit(1);
  }, 10000);
};

// Escutar sinais de shutdown
process.on('SIGTERM', gracefulShutdown);
process.on('SIGINT', gracefulShutdown);

export default app;