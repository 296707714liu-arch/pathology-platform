const express = require('express');
const cors = require('cors');
const mysql = require('mysql2/promise');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { v4: uuidv4 } = require('uuid');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
require('dotenv').config();

const app = express();
// 强制使用固定端口，避免被环境变量覆盖导致端口冲突
const PORT = 3007;

// 中间件
const corsOptions = {
  origin: function (origin, callback) {
    // 允许所有 localhost 请求
    if (!origin || origin.includes('localhost') || origin.includes('127.0.0.1')) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
};

app.use(cors(corsOptions));

// 处理 OPTIONS 预检请求
app.options('*', cors(corsOptions));

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// 确保上传目录存在
const uploadDir = process.env.UPLOAD_DIR || 'uploads';
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// 静态文件服务
app.use('/uploads', express.static(path.join(__dirname, '..', uploadDir)));

// 配置multer用于文件上传
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const ext = path.extname(file.originalname);
    cb(null, file.fieldname + '-' + uniqueSuffix + ext);
  }
});

const upload = multer({
  storage: storage,
  limits: { fileSize: 50 * 1024 * 1024 }, // 50MB
  fileFilter: (req, file, cb) => {
    const allowedTypes = [
      'image/jpeg', 'image/png', 'image/gif', 'image/webp',
      'application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'application/vnd.ms-excel', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'application/vnd.ms-powerpoint', 'application/vnd.openxmlformats-officedocument.presentationml.presentation',
      'video/mp4', 'video/avi', 'video/mov', 'video/wmv',
      'application/zip', 'application/x-rar-compressed'
    ];
    
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('不支持的文件类型'));
    }
  }
});

// JWT认证中间件
const authenticateToken = async (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: '访问令牌缺失' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const connection = await pool.getConnection();
    const [users] = await connection.execute(
      'SELECT id, name, email, role, institution, avatar_url, created_at FROM users WHERE id = ? AND is_active = TRUE',
      [decoded.userId]
    );
    connection.release();

    if (users.length === 0) {
      return res.status(403).json({ error: '用户不存在' });
    }

    req.user = users[0];
    next();
  } catch (error) {
    return res.status(403).json({ error: '无效的访问令牌' });
  }
};

// 角色权限中间件
const requireRole = (roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ error: '未认证' });
    }

    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ error: '权限不足' });
    }

    next();
  };
};

// 数据库连接池 - 支持 Zeabur 环境变量
const pool = mysql.createPool({
  host: process.env.DB_HOST || process.env.MYSQL_HOST || 'localhost',
  user: process.env.DB_USER || process.env.MYSQL_USERNAME || 'root',
  password: process.env.DB_PASSWORD || process.env.MYSQL_PASSWORD || '',
  database: process.env.DB_NAME || process.env.MYSQL_DATABASE || 'pathologic_ai_platform',
  port: parseInt(process.env.DB_PORT || process.env.MYSQL_PORT || '3306'),
  charset: 'utf8mb4',
  timezone: '+08:00',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

// 测试数据库连接
async function testConnection() {
  try {
    const connection = await pool.getConnection();
    console.log('✅ 数据库连接成功');
    connection.release();
    return true;
  } catch (error) {
    console.error('❌ 数据库连接失败:', error.message);
    return false;
  }
}

// 初始化数据库表
async function initializeDatabase() {
  try {
    const connection = await pool.getConnection();
    
    // 创建用户表
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS users (
        id VARCHAR(36) PRIMARY KEY,
        name VARCHAR(100) NOT NULL,
        email VARCHAR(255) UNIQUE NOT NULL,
        password_hash VARCHAR(255) NOT NULL,
        role ENUM('student', 'teacher', 'researcher', 'admin') NOT NULL DEFAULT 'student',
        institution VARCHAR(255),
        avatar_url VARCHAR(500),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        last_login TIMESTAMP NULL,
        is_active BOOLEAN DEFAULT TRUE
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `);

    // 创建用户活动记录表
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS user_activities (
        id VARCHAR(36) PRIMARY KEY,
        user_id VARCHAR(36) NOT NULL,
        activity_type VARCHAR(50) NOT NULL,
        module_name VARCHAR(100),
        details JSON,
        duration_seconds INT DEFAULT 0,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
        INDEX idx_user_activity (user_id, activity_type),
        INDEX idx_created_at (created_at)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `);

    // 创建资源库表
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS resources (
        id VARCHAR(36) PRIMARY KEY,
        title VARCHAR(255) NOT NULL,
        description TEXT,
        type ENUM('slide', 'case', 'assignment', 'document', 'video', 'other') NOT NULL,
        file_name VARCHAR(255) NOT NULL,
        file_path VARCHAR(500) NOT NULL,
        file_size BIGINT NOT NULL,
        mime_type VARCHAR(100),
        uploader_id VARCHAR(36) NOT NULL,
        tags JSON,
        is_public BOOLEAN DEFAULT TRUE,
        download_count INT DEFAULT 0,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (uploader_id) REFERENCES users(id) ON DELETE CASCADE,
        INDEX idx_type_public (type, is_public),
        INDEX idx_uploader (uploader_id),
        INDEX idx_created_at (created_at)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `);

    // 创建资源下载记录表
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS resource_downloads (
        id INT AUTO_INCREMENT PRIMARY KEY,
        resource_id VARCHAR(36) NOT NULL,
        user_id VARCHAR(36) NOT NULL,
        downloaded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (resource_id) REFERENCES resources(id) ON DELETE CASCADE,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
        INDEX idx_resource_user (resource_id, user_id),
        INDEX idx_downloaded_at (downloaded_at)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `);

    // 创建考试记录表
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS exam_records (
        id VARCHAR(36) PRIMARY KEY,
        user_id VARCHAR(36) NOT NULL,
        exam_title VARCHAR(255) NOT NULL,
        score DECIMAL(10, 2) NOT NULL,
        total_score DECIMAL(10, 2) NOT NULL,
        duration_minutes INT NOT NULL,
        questions_data JSON,
        answers_data JSON,
        wrong_questions JSON,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
        INDEX idx_user_exam (user_id, created_at)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `);

    // 创建默认管理员账号（如果不存在）
    await createDefaultAdmin(connection);

    connection.release();
    console.log('✅ 数据库表初始化完成');
    return true;
  } catch (error) {
    console.error('❌ 数据库表初始化失败:', error.message);
    return false;
  }
}

// 创建默认管理员账号
async function createDefaultAdmin(connection) {
  try {
    // 检查是否已存在管理员账号
    const [adminUsers] = await connection.execute(
      'SELECT id FROM users WHERE role = "admin" LIMIT 1'
    );

    if (adminUsers.length === 0) {
      const adminId = uuidv4();
      const hashedPassword = await bcrypt.hash('admin123456', 12);
      
      await connection.execute(
        `INSERT INTO users (id, name, email, password_hash, role, institution) 
         VALUES (?, ?, ?, ?, ?, ?)`,
        [adminId, '系统管理员', 'admin@pathologic.ai', hashedPassword, 'admin', '智能AI病理平台']
      );
      console.log('✅ 默认管理员账号创建成功');
      console.log('   邮箱: admin@pathologic.ai');
      console.log('   密码: admin123456');
    }
  } catch (error) {
    console.log('ℹ️  管理员账号已存在或创建失败:', error.message);
  }
}

// 健康检查
app.get('/api/health', (req, res) => {
  console.log('✅ 健康检查请求收到');
  res.json({ 
    status: 'ok', 
    timestamp: new Date().toISOString(),
    version: '1.0.0'
  });
});

// 用户注册API
app.post('/api/auth/register', async (req, res) => {
  try {
    const { name, email, password, role, institution } = req.body;
    
    if (!name || !email || !password) {
      return res.status(400).json({ success: false, error: '请填写所有必填字段' });
    }

    if (password.length < 6) {
      return res.status(400).json({ success: false, error: '密码长度至少6位' });
    }

    const connection = await pool.getConnection();
    
    // 检查邮箱是否已存在
    const [existingUsers] = await connection.execute(
      'SELECT id, is_active FROM users WHERE email = ?',
      [email]
    );

    let userId;
    const hashedPassword = await bcrypt.hash(password, 12);

    if (existingUsers.length > 0) {
      const existingUser = existingUsers[0];
      
      if (existingUser.is_active) {
        // 活跃用户，不允许重新注册
        connection.release();
        return res.status(400).json({ success: false, error: '该邮箱已被注册' });
      } else {
        // 已删除用户，重新激活
        userId = existingUser.id;
        await connection.execute(
          `UPDATE users SET name = ?, password_hash = ?, role = ?, institution = ?, is_active = TRUE 
           WHERE id = ?`,
          [name, hashedPassword, role || 'student', institution || null, userId]
        );
        console.log('重新激活用户:', email);
      }
    } else {
      // 新用户，创建账户
      userId = uuidv4();
      try {
        await connection.execute(
          `INSERT INTO users (id, name, email, password_hash, role, institution) 
           VALUES (?, ?, ?, ?, ?, ?)`,
          [userId, name, email, hashedPassword, role || 'student', institution || null]
        );
      } catch (dbError) {
        connection.release();
        if (dbError.code === 'ER_DUP_ENTRY') {
          return res.status(400).json({ success: false, error: '该邮箱已被注册' });
        }
        throw dbError;
      }
    }

    // 获取创建的用户信息
    const [users] = await connection.execute(
      'SELECT id, name, email, role, institution, created_at FROM users WHERE id = ?',
      [userId]
    );

    connection.release();

    // 生成JWT token
    const token = jwt.sign({ userId }, process.env.JWT_SECRET, { expiresIn: '7d' });

    res.status(201).json({
      success: true,
      user: users[0],
      token
    });
  } catch (error) {
    console.error('注册失败:', error);
    res.status(500).json({ success: false, error: '注册失败，请稍后重试' });
  }
});

// 用户登录API
app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    
    if (!email || !password) {
      return res.status(400).json({ success: false, error: '请填写邮箱和密码' });
    }

    const connection = await pool.getConnection();
    
    const [users] = await connection.execute(
      'SELECT * FROM users WHERE email = ? AND is_active = TRUE',
      [email]
    );

    if (users.length === 0) {
      connection.release();
      return res.status(400).json({ success: false, error: '用户不存在' });
    }

    const user = users[0];
    
    // 验证密码
    const isPasswordValid = await bcrypt.compare(password, user.password_hash);
    if (!isPasswordValid) {
      connection.release();
      return res.status(400).json({ success: false, error: '密码错误' });
    }

    // 更新最后登录时间
    await connection.execute(
      'UPDATE users SET last_login = CURRENT_TIMESTAMP WHERE id = ?',
      [user.id]
    );

    connection.release();

    // 生成JWT token
    const token = jwt.sign({ userId: user.id }, process.env.JWT_SECRET, { expiresIn: '7d' });

    // 返回用户信息（不包含密码）
    const { password_hash, ...userWithoutPassword } = user;
    
    res.json({
      success: true,
      user: userWithoutPassword,
      token
    });
  } catch (error) {
    console.error('登录失败:', error);
    res.status(500).json({ success: false, error: '登录失败，请稍后重试' });
  }
});

// 获取当前用户信息
app.get('/api/auth/me', authenticateToken, async (req, res) => {
  res.json({
    success: true,
    user: req.user
  });
});

// 获取所有用户（管理员功能）
app.get('/api/auth/users', authenticateToken, requireRole(['admin']), async (req, res) => {
  try {
    const connection = await pool.getConnection();
    
    const [users] = await connection.execute(
      'SELECT id, name, email, password_hash, role, institution, created_at, last_login FROM users WHERE is_active = TRUE ORDER BY created_at DESC'
    );

    connection.release();

    res.json({
      success: true,
      users: users
    });
  } catch (error) {
    console.error('获取用户列表失败:', error);
    res.status(500).json({ success: false, error: '获取用户列表失败' });
  }
});

// 修改用户密码（管理员功能）
app.put('/api/auth/users/:userId/password', authenticateToken, requireRole(['admin']), async (req, res) => {
  try {
    const { userId } = req.params;
    const { newPassword } = req.body;

    if (!newPassword || newPassword.length < 6) {
      return res.status(400).json({ success: false, error: '密码长度至少6位' });
    }

    const connection = await pool.getConnection();

    // 检查用户是否存在
    const [users] = await connection.execute(
      'SELECT id FROM users WHERE id = ?',
      [userId]
    );

    if (users.length === 0) {
      connection.release();
      return res.status(404).json({ success: false, error: '用户不存在' });
    }

    // 加密新密码
    const hashedPassword = await bcrypt.hash(newPassword, 12);

    // 更新密码
    await connection.execute(
      'UPDATE users SET password_hash = ? WHERE id = ?',
      [hashedPassword, userId]
    );

    connection.release();

    res.json({ success: true, message: '密码已更新' });
  } catch (error) {
    console.error('修改密码失败:', error);
    res.status(500).json({ success: false, error: '修改密码失败' });
  }
});

// 删除用户
app.delete('/api/auth/users/:userId', authenticateToken, requireRole(['admin']), async (req, res) => {
  try {
    const { userId } = req.params;
    
    // 防止删除自己
    if (userId === req.user.id) {
      return res.status(400).json({ success: false, error: '不能删除自己' });
    }

    const connection = await pool.getConnection();
    
    // 检查用户是否存在
    const [users] = await connection.execute(
      'SELECT id FROM users WHERE id = ?',
      [userId]
    );

    if (users.length === 0) {
      connection.release();
      return res.status(404).json({ success: false, error: '用户不存在' });
    }

    // 删除用户（软删除 - 标记为不活跃）
    await connection.execute(
      'UPDATE users SET is_active = FALSE WHERE id = ?',
      [userId]
    );

    connection.release();

    res.json({ success: true, message: '用户已删除' });
  } catch (error) {
    console.error('删除用户失败:', error);
    res.status(500).json({ success: false, error: '删除用户失败' });
  }
});

// 上传资源
app.post('/api/resources/upload', authenticateToken, requireRole(['teacher', 'admin']), upload.single('file'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, error: '没有上传文件' });
    }

    const { title, description, type, tags, is_public } = req.body;

    if (!title || !type) {
      return res.status(400).json({ success: false, error: '标题和类型是必填项' });
    }

    const connection = await pool.getConnection();
    const resourceId = uuidv4();

    // 处理tags - 确保是有效的JSON字符串
    let tagsJson = '[]';
    if (tags) {
      try {
        tagsJson = JSON.stringify(typeof tags === 'string' ? JSON.parse(tags) : tags);
      } catch (e) {
        tagsJson = '[]';
      }
    }

    // 使用绝对路径而不是相对路径，确保文件始终可以找到
    const absoluteFilePath = path.resolve(req.file.path);
    
    await connection.execute(
      `INSERT INTO resources (id, title, description, type, file_name, file_path, file_size, mime_type, uploader_id, tags, is_public) 
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        resourceId,
        title,
        description || null,
        type,
        req.file.originalname,
        absoluteFilePath,
        req.file.size,
        req.file.mimetype,
        req.user.id,
        tagsJson,
        is_public !== 'false'
      ]
    );

    // 获取创建的资源信息
    const [resources] = await connection.execute(
      `SELECT r.*, u.name as uploader_name 
       FROM resources r 
       LEFT JOIN users u ON r.uploader_id = u.id 
       WHERE r.id = ?`,
      [resourceId]
    );

    connection.release();

    const resource = resources[0];
    try {
      resource.tags = JSON.parse(resource.tags || '[]');
    } catch (e) {
      resource.tags = [];
    }

    res.status(201).json({
      success: true,
      resource
    });
  } catch (error) {
    console.error('上传资源错误:', error);
    if (req.file) {
      fs.unlinkSync(req.file.path);
    }
    res.status(500).json({ success: false, error: '服务器内部错误' });
  }
});

// 获取用户上传的资源（必须在 /:id 之前）
app.get('/api/resources/user/my-resources', authenticateToken, async (req, res) => {
  try {
    const connection = await pool.getConnection();
    
    const [resources] = await connection.execute(
      `SELECT r.*, u.name as uploader_name 
       FROM resources r 
       LEFT JOIN users u ON r.uploader_id = u.id 
       WHERE r.uploader_id = ?
       ORDER BY r.created_at DESC`,
      [req.user.id]
    );

    connection.release();

    const resourcesWithTags = resources.map(resource => {
      let tags = [];
      try {
        tags = JSON.parse(resource.tags || '[]');
      } catch (e) {
        tags = [];
      }
      return {
        ...resource,
        tags
      };
    });

    res.json({
      success: true,
      resources: resourcesWithTags
    });
  } catch (error) {
    console.error('获取用户资源错误:', error);
    res.status(500).json({ success: false, error: '服务器内部错误' });
  }
});

// 获取资源列表
app.get('/api/resources', async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const type = req.query.type;
    const search = req.query.search;

    const connection = await pool.getConnection();

    // 先检查表是否存在
    const [tables] = await connection.execute(
      "SHOW TABLES LIKE 'resources'"
    );

    if (tables.length === 0) {
      connection.release();
      return res.json({
        success: true,
        resources: [],
        total: 0,
        totalPages: 0,
        message: '资源表不存在，返回空列表'
      });
    }

    // 构建查询条件
    let whereConditions = ['r.is_public = TRUE'];
    let queryParams = [];

    if (type && type !== 'all') {
      whereConditions.push('r.type = ?');
      queryParams.push(type);
    }

    if (search) {
      whereConditions.push('(r.title LIKE ? OR r.description LIKE ?)');
      queryParams.push(`%${search}%`, `%${search}%`);
    }

    const whereClause = whereConditions.length > 0 ? 'WHERE ' + whereConditions.join(' AND ') : '';

    // 获取总数
    const countQuery = `SELECT COUNT(*) as total FROM resources r ${whereClause}`;
    const [countResult] = await connection.execute(countQuery, queryParams);
    const total = countResult[0].total;

    // 获取资源列表
    const offset = (page - 1) * limit;
    const listQuery = `
      SELECT r.*, u.name as uploader_name 
      FROM resources r 
      LEFT JOIN users u ON r.uploader_id = u.id 
      ${whereClause}
      ORDER BY r.created_at DESC 
      LIMIT ${limit} OFFSET ${offset}
    `;
    
    const [resources] = await connection.execute(listQuery, queryParams);

    connection.release();

    // 解析tags JSON
    const resourcesWithTags = resources.map(resource => {
      let tags = [];
      try {
        tags = JSON.parse(resource.tags || '[]');
      } catch (e) {
        tags = [];
      }
      return {
        ...resource,
        tags
      };
    });

    const totalPages = Math.ceil(total / limit);

    res.json({
      success: true,
      resources: resourcesWithTags,
      total,
      totalPages
    });
  } catch (error) {
    console.error('获取资源列表错误:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// 下载资源（必须在 GET /:id 之前）
app.post('/api/resources/:id/download', authenticateToken, async (req, res) => {
  try {
    const connection = await pool.getConnection();
    
    // 获取资源信息
    const [resources] = await connection.execute(
      `SELECT r.*, u.name as uploader_name 
       FROM resources r 
       LEFT JOIN users u ON r.uploader_id = u.id 
       WHERE r.id = ?`,
      [req.params.id]
    );

    if (resources.length === 0) {
      connection.release();
      return res.status(404).json({ success: false, error: '资源不存在' });
    }

    const resource = resources[0];
    console.log('下载资源:', resource.file_name, '路径:', resource.file_path);

    // 确保使用绝对路径
    const filePath = path.isAbsolute(resource.file_path) 
      ? resource.file_path 
      : path.resolve(resource.file_path);

    // 检查文件是否存在
    if (!fs.existsSync(filePath)) {
      connection.release();
      console.error('文件不存在:', filePath);
      return res.status(404).json({ success: false, error: '文件不存在' });
    }

    // 增加下载计数
    await connection.execute(
      'UPDATE resources SET download_count = download_count + 1 WHERE id = ?',
      [req.params.id]
    );

    // 记录下载记录
    await connection.execute(
      'INSERT INTO resource_downloads (resource_id, user_id) VALUES (?, ?)',
      [req.params.id, req.user.id]
    );

    connection.release();

    // 设置下载响应头 - 使用正确的格式
    const filename = encodeURIComponent(resource.file_name);
    res.setHeader('Content-Disposition', `attachment; filename*=UTF-8''${filename}`);
    res.setHeader('Content-Type', resource.mime_type || 'application/octet-stream');
    res.setHeader('Content-Length', resource.file_size);

    console.log('开始发送文件:', resource.file_name, '路径:', filePath);
    // 发送文件
    res.sendFile(filePath, (err) => {
      if (err) {
        console.error('文件发送错误:', err);
      } else {
        console.log('文件发送成功:', resource.file_name);
      }
    });
  } catch (error) {
    console.error('下载资源错误:', error);
    res.status(500).json({ success: false, error: '服务器内部错误' });
  }
});

// 获取单个资源
app.get('/api/resources/:id', async (req, res) => {
  try {
    const connection = await pool.getConnection();
    
    const [resources] = await connection.execute(
      `SELECT r.*, u.name as uploader_name 
       FROM resources r 
       LEFT JOIN users u ON r.uploader_id = u.id 
       WHERE r.id = ?`,
      [req.params.id]
    );

    connection.release();

    if (resources.length === 0) {
      return res.status(404).json({ success: false, error: '资源不存在' });
    }

    const resource = resources[0];
    try {
      resource.tags = JSON.parse(resource.tags || '[]');
    } catch (e) {
      resource.tags = [];
    }

    res.json({
      success: true,
      resource
    });
  } catch (error) {
    console.error('获取资源错误:', error);
    res.status(500).json({ success: false, error: '服务器内部错误' });
  }
});

// 记录用户活动
app.post('/api/activities/log', authenticateToken, async (req, res) => {
  try {
    const { activity_type, module_name, details, duration_seconds } = req.body;
    
    if (!activity_type) {
      return res.status(400).json({ success: false, error: '缺少活动类型' });
    }

    const connection = await pool.getConnection();
    
    await connection.execute(`
      INSERT INTO user_activities (
        id, user_id, activity_type, module_name, details, duration_seconds
      ) VALUES (?, ?, ?, ?, ?, ?)
    `, [
      uuidv4(),
      req.user.id,
      activity_type,
      module_name || '',
      JSON.stringify(details || {}),
      duration_seconds || 0
    ]);

    connection.release();

    res.json({ success: true });
  } catch (error) {
    console.error('记录活动错误:', error);
    res.status(500).json({ success: false, error: '记录活动失败' });
  }
});

// 获取用户统计信息
app.get('/api/auth/stats', authenticateToken, async (req, res) => {
  try {
    const connection = await pool.getConnection();
    
    // 获取活动统计
    const [activities] = await connection.execute(`
      SELECT 
        activity_type,
        COUNT(*) as count,
        SUM(COALESCE(duration_seconds, 0)) as total_duration
      FROM user_activities
      WHERE user_id = ?
      GROUP BY activity_type
    `, [req.user.id]);

    // 获取考试统计
    const [exams] = await connection.execute(`
      SELECT 
        COUNT(*) as total_exams,
        AVG(score) as avg_score,
        MAX(score) as max_score,
        MIN(score) as min_score
      FROM exam_records
      WHERE user_id = ?
    `, [req.user.id]);

    // 获取下载统计
    const [downloads] = await connection.execute(`
      SELECT COUNT(*) as total_downloads
      FROM resource_downloads
      WHERE user_id = ?
    `, [req.user.id]);

    connection.release();

    res.json({
      success: true,
      stats: {
        activities: activities || [],
        exams: exams[0] || { total_exams: 0, avg_score: 0, max_score: 0, min_score: 0 },
        downloads: downloads[0] || { total_downloads: 0 }
      }
    });
  } catch (error) {
    console.error('获取用户统计错误:', error);
    res.status(500).json({ success: false, error: '获取统计信息失败' });
  }
});

// 获取用户活动记录
app.get('/api/auth/activities', authenticateToken, async (req, res) => {
  try {
    const limit = Math.min(parseInt(req.query.limit) || 50, 100);
    const connection = await pool.getConnection();
    
    const [activities] = await connection.execute(`
      SELECT 
        id,
        activity_type,
        module_name,
        details,
        duration_seconds,
        created_at
      FROM user_activities
      WHERE user_id = ?
      ORDER BY created_at DESC
      LIMIT ${limit}
    `, [req.user.id]);

    connection.release();

    res.json({
      success: true,
      activities: activities || []
    });
  } catch (error) {
    console.error('获取活动记录错误:', error);
    res.status(500).json({ success: false, error: '获取活动记录失败' });
  }
});

// 保存考试记录
app.post('/api/exams/records', authenticateToken, async (req, res) => {
  try {
    const { exam_title, score, total_score, duration_minutes, questions_data, answers_data, wrong_questions } = req.body;
    
    if (!exam_title || score === undefined || !total_score || !duration_minutes) {
      return res.status(400).json({ success: false, error: '缺少必要参数' });
    }

    const connection = await pool.getConnection();
    const recordId = uuidv4();

    await connection.execute(`
      INSERT INTO exam_records (
        id, user_id, exam_title, score, total_score, 
        duration_minutes, questions_data, answers_data, wrong_questions
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `, [
      recordId,
      req.user.id,
      exam_title,
      score,
      total_score,
      duration_minutes,
      JSON.stringify(questions_data || {}),
      JSON.stringify(answers_data || {}),
      JSON.stringify(wrong_questions || [])
    ]);

    // 记录活动
    await connection.execute(`
      INSERT INTO user_activities (
        id, user_id, activity_type, module_name, details, duration_seconds
      ) VALUES (?, ?, ?, ?, ?, ?)
    `, [
      uuidv4(),
      req.user.id,
      'exam_attempt',
      '考试系统',
      JSON.stringify({ exam_title, score, total_score }),
      duration_minutes * 60
    ]);

    connection.release();

    res.json({
      success: true,
      record: {
        id: recordId,
        user_id: req.user.id,
        exam_title,
        score,
        total_score,
        duration_minutes,
        created_at: new Date().toISOString()
      }
    });
  } catch (error) {
    console.error('保存考试记录错误:', error);
    res.status(500).json({ success: false, error: '保存考试记录失败' });
  }
});

// 获取考试统计
app.get('/api/exams/stats', authenticateToken, async (req, res) => {
  try {
    const connection = await pool.getConnection();
    
    const [stats] = await connection.execute(`
      SELECT 
        COUNT(*) as total_exams,
        AVG(score) as avg_score,
        MAX(score) as max_score,
        MIN(score) as min_score
      FROM exam_records
      WHERE user_id = ?
    `, [req.user.id]);

    connection.release();

    res.json({
      success: true,
      stats: stats[0] || { total_exams: 0, avg_score: 0, max_score: 0, min_score: 0 }
    });
  } catch (error) {
    console.error('获取考试统计错误:', error);
    res.status(500).json({ success: false, error: '获取考试统计失败' });
  }
});

// 获取用户考试记录
app.get('/api/exams/records', authenticateToken, async (req, res) => {
  try {
    const limit = Math.min(parseInt(req.query.limit) || 20, 100);
    const connection = await pool.getConnection();
    
    const [records] = await connection.execute(`
      SELECT 
        id,
        exam_title,
        score,
        total_score,
        duration_minutes,
        created_at
      FROM exam_records
      WHERE user_id = ?
      ORDER BY created_at DESC
      LIMIT ${limit}
    `, [req.user.id]);

    connection.release();

    res.json({
      success: true,
      records: records || []
    });
  } catch (error) {
    console.error('获取考试记录错误:', error);
    res.status(500).json({ success: false, error: '获取考试记录失败' });
  }
});

// 删除资源
app.delete('/api/resources/:id', authenticateToken, async (req, res) => {
  try {
    const connection = await pool.getConnection();
    
    // 获取资源信息
    const [resources] = await connection.execute(
      'SELECT * FROM resources WHERE id = ?',
      [req.params.id]
    );

    if (resources.length === 0) {
      connection.release();
      return res.status(404).json({ success: false, error: '资源不存在' });
    }

    const resource = resources[0];

    // 检查权限：只有上传者或管理员可以删除
    console.log('删除资源权限检查:', {
      resourceUploaderId: resource.uploader_id,
      currentUserId: req.user.id,
      currentUserRole: req.user.role,
      isUploader: resource.uploader_id === req.user.id,
      isAdmin: req.user.role === 'admin'
    });

    if (resource.uploader_id !== req.user.id && req.user.role !== 'admin') {
      connection.release();
      console.log('删除被拒绝 - 权限不足');
      return res.status(403).json({ success: false, error: '没有权限删除此资源' });
    }

    // 删除数据库记录
    await connection.execute(
      'DELETE FROM resources WHERE id = ?',
      [req.params.id]
    );

    connection.release();

    // 删除文件
    if (fs.existsSync(resource.file_path)) {
      fs.unlinkSync(resource.file_path);
    }

    res.json({ success: true, message: '资源已删除' });
  } catch (error) {
    console.error('删除资源错误:', error);
    res.status(500).json({ success: false, error: '服务器内部错误' });
  }
});

// ============================================
// Tripo3D API 代理（避免 CORS 问题）
// ============================================
const TRIPO_API_KEY = 'tsk_mFR_w4xgksplkjoIKH_BfN-1mtJZhZ8kWdf-TDEXj9U';
const TRIPO_BASE_URL = 'https://api.tripo3d.ai/v2/openapi';

// 创建 3D 模型任务
app.post('/api/tripo3d/task', authenticateToken, async (req, res) => {
  try {
    console.log('[Tripo3D] Creating task:', req.body);
    
    const response = await fetch(`${TRIPO_BASE_URL}/task`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${TRIPO_API_KEY}`
      },
      body: JSON.stringify(req.body)
    });

    const data = await response.json();
    console.log('[Tripo3D] Task response:', data);
    
    if (!response.ok) {
      return res.status(response.status).json(data);
    }
    
    res.json(data);
  } catch (error) {
    console.error('[Tripo3D] Create task error:', error);
    res.status(500).json({ code: -1, message: error.message });
  }
});

// 查询任务状态
app.get('/api/tripo3d/task/:taskId', authenticateToken, async (req, res) => {
  try {
    const { taskId } = req.params;
    console.log('[Tripo3D] Getting task status:', taskId);
    
    const response = await fetch(`${TRIPO_BASE_URL}/task/${taskId}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${TRIPO_API_KEY}`
      }
    });

    const data = await response.json();
    console.log('[Tripo3D] Task status:', data);
    
    if (!response.ok) {
      return res.status(response.status).json(data);
    }
    
    res.json(data);
  } catch (error) {
    console.error('[Tripo3D] Get task error:', error);
    res.status(500).json({ code: -1, message: error.message });
  }
});

// 代理下载 GLB 模型文件（避免 CORS）
app.get('/api/tripo3d/model', authenticateToken, async (req, res) => {
  try {
    const { url } = req.query;
    if (!url) {
      return res.status(400).json({ error: '缺少模型 URL' });
    }

    console.log('[Tripo3D] Proxying model download:', url);
    
    const response = await fetch(url);
    
    if (!response.ok) {
      console.error('[Tripo3D] Model download failed:', response.status);
      return res.status(response.status).json({ error: '模型下载失败' });
    }

    // 设置响应头
    res.setHeader('Content-Type', 'model/gltf-binary');
    res.setHeader('Access-Control-Allow-Origin', '*');
    
    // 流式传输文件
    const arrayBuffer = await response.arrayBuffer();
    res.send(Buffer.from(arrayBuffer));
    
    console.log('[Tripo3D] Model proxied successfully');
  } catch (error) {
    console.error('[Tripo3D] Model proxy error:', error);
    res.status(500).json({ error: error.message });
  }
});

// 获取账户余额
app.get('/api/tripo3d/user/balance', authenticateToken, async (req, res) => {
  try {
    const response = await fetch(`${TRIPO_BASE_URL}/user/balance`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${TRIPO_API_KEY}`
      }
    });

    const data = await response.json();
    
    if (!response.ok) {
      return res.status(response.status).json(data);
    }
    
    res.json(data);
  } catch (error) {
    console.error('[Tripo3D] Get balance error:', error);
    res.status(500).json({ code: -1, message: error.message });
  }
});

// 404处理
app.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    error: '接口不存在'
  });
});

// 启动服务器
async function startServer() {
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
      console.log(`🌐 前端URL: ${process.env.FRONTEND_URL}`);
      console.log(`📊 数据库: ${process.env.DB_NAME}`);
      console.log('');
      console.log('🚀 完整功能服务器启动成功！');
      console.log('');
      console.log('📋 可用的API端点:');
      console.log('- GET  /api/health - 健康检查');
      console.log('- POST /api/auth/register - 用户注册');
      console.log('- POST /api/auth/login - 用户登录');
      console.log('- GET  /api/auth/me - 获取当前用户信息');
      console.log('- GET  /api/auth/users - 获取用户列表 (管理员)');
      console.log('- POST /api/resources/upload - 上传资源 (教师/管理员)');
      console.log('- GET  /api/resources - 获取资源列表');
      console.log('- POST /api/resources/:id/download - 下载资源');
      console.log('');
      console.log('🔑 默认管理员账号:');
      console.log('   邮箱: admin@pathologic.ai');
      console.log('   密码: admin123456');
      console.log('');
      console.log('✨ 功能特性:');
      console.log('- ✅ JWT认证和授权');
      console.log('- ✅ 密码加密存储');
      console.log('- ✅ 文件上传和下载');
      console.log('- ✅ 用户活动记录');
      console.log('- ✅ 角色权限控制');
    });
  } catch (error) {
    console.error('❌ 服务器启动失败:', error);
    process.exit(1);
  }
}

startServer();