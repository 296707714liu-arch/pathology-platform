import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import { testConnection, initializeDatabase } from './config/database.ts';
import authRoutes from './routes/auth.ts';
import resourceRoutes from './routes/resources.ts';
import examRoutes from './routes/exams.ts';

const __dirname = path.resolve();

dotenv.config();

const app = express();
// 使用环境变量端口，Zeabur 会自动分配
const PORT = parseInt(process.env.PORT || '3007', 10);

// 中间件
// CORS 配置：支持本地开发和 Zeabur 部署
const allowedOrigins = [
  'http://localhost:3000',
  'http://localhost:5173',
  process.env.FRONTEND_URL,
  process.env.ZEABUR_DOMAIN
].filter(Boolean);

app.use(cors({
  origin: (origin, callback) => {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('CORS not allowed'));
    }
  },
  credentials: true
}));

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// 静态文件服务（用于文件下载）
const uploadDir = process.env.UPLOAD_DIR || 'uploads';
app.use('/uploads', express.static(path.join(__dirname, '..', uploadDir)));

// API路由
app.use('/api/auth', authRoutes);
app.use('/api/resources', resourceRoutes);
app.use('/api/exams', examRoutes);

// 健康检查
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    timestamp: new Date().toISOString(),
    version: '1.0.0'
  });
});

// 错误处理中间件
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error('服务器错误:', err);
  
  if (err.code === 'LIMIT_FILE_SIZE') {
    return res.status(400).json({
      success: false,
      error: '文件大小超过限制'
    });
  }

  if (err.code === 'LIMIT_UNEXPECTED_FILE') {
    return res.status(400).json({
      success: false,
      error: '不支持的文件类型'
    });
  }

  res.status(500).json({
    success: false,
    error: process.env.NODE_ENV === 'production' ? '服务器内部错误' : err.message
  });
});

// 404处理
app.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    error: '接口不存在'
  });
});

// 启动服务器
const startServer = async () => {
  try {
    // 测试数据库连接
    const dbConnected = await testConnection();
    if (!dbConnected) {
      console.error('❌ 数据库连接失败，服务器启动中止');
      process.exit(1);
    }

    // 初始化数据库表
    const dbInitialized = await initializeDatabase();
    if (!dbInitialized) {
      console.error('❌ 数据库初始化失败，服务器启动中止');
      process.exit(1);
    }

    // 启动HTTP服务器
    app.listen(PORT, () => {
      console.log(`🚀 服务器运行在 http://localhost:${PORT}`);
      console.log(`📁 文件上传目录: ${uploadDir}`);
      console.log(`🌐 前端URL: ${process.env.FRONTEND_URL}`);
      console.log(`📊 数据库: ${process.env.DB_NAME}`);
    });
  } catch (error) {
    console.error('❌ 服务器启动失败:', error);
    process.exit(1);
  }
};

// 优雅关闭
process.on('SIGTERM', () => {
  console.log('🛑 收到SIGTERM信号，正在关闭服务器...');
  process.exit(0);
});

process.on('SIGINT', () => {
  console.log('🛑 收到SIGINT信号，正在关闭服务器...');
  process.exit(0);
});

startServer();