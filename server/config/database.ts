import mysql from 'mysql2/promise';
import dotenv from 'dotenv';

dotenv.config();

// 数据库配置 - 支持 Zeabur 环境变量
const dbConfig = {
  host: process.env.DB_HOST || process.env.MYSQL_HOST || 'localhost',
  user: process.env.DB_USER || process.env.MYSQL_USERNAME || 'root',
  password: process.env.DB_PASSWORD || process.env.MYSQL_PASSWORD || '',
  database: process.env.DB_NAME || process.env.MYSQL_DATABASE || 'pathologic_ai_platform',
  port: parseInt(process.env.DB_PORT || process.env.MYSQL_PORT || '3306'),
  charset: 'utf8mb4',
  timezone: '+08:00'
};

// 创建连接池
export const pool = mysql.createPool({
  ...dbConfig,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  acquireTimeout: 60000,
  timeout: 60000
});

// 测试数据库连接（带重试逻辑）
export const testConnection = async (maxRetries = 5, delayMs = 3000) => {
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      const connection = await pool.getConnection();
      console.log('✅ 数据库连接成功');
      connection.release();
      return true;
    } catch (error) {
      console.error(`❌ 数据库连接失败 (尝试 ${attempt}/${maxRetries}):`, error);
      if (attempt < maxRetries) {
        console.log(`⏳ ${delayMs / 1000} 秒后重试...`);
        await new Promise(resolve => setTimeout(resolve, delayMs));
      }
    }
  }
  return false;
};

// 创建默认管理员账号
const createDefaultAdmin = async (connection: any) => {
  try {
    // 检查是否已存在管理员账号
    const [adminUsers] = await connection.execute(
      'SELECT id FROM users WHERE role = "admin" LIMIT 1'
    );

    if (adminUsers.length === 0) {
      const bcrypt = require('bcryptjs');
      const { v4: uuidv4 } = require('uuid');
      
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
    console.log('ℹ️  管理员账号已存在或创建失败:', error);
  }
};

// 初始化数据库表
export const initializeDatabase = async () => {
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
        id INT AUTO_INCREMENT PRIMARY KEY,
        user_id VARCHAR(36) NOT NULL,
        activity_type ENUM('login', 'logout', 'slide_analysis', 'quantification', 'research_chat', 'exam_attempt', 'anatomy_view', 'immersive_lab', 'resource_download', 'resource_upload') NOT NULL,
        module_name VARCHAR(100),
        details JSON,
        duration_seconds INT DEFAULT 0,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
        INDEX idx_user_activity (user_id, activity_type),
        INDEX idx_created_at (created_at)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `);

    // 创建考试记录表
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS exam_records (
        id INT AUTO_INCREMENT PRIMARY KEY,
        user_id VARCHAR(36) NOT NULL,
        exam_title VARCHAR(255) NOT NULL,
        score INT NOT NULL,
        total_score INT NOT NULL,
        duration_minutes INT NOT NULL,
        questions_data JSON,
        answers_data JSON,
        wrong_questions JSON,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
        INDEX idx_user_exam (user_id, created_at)
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
        INDEX idx_created_at (created_at),
        FULLTEXT idx_search (title, description)
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

    // 创建学习进度表
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS learning_progress (
        id INT AUTO_INCREMENT PRIMARY KEY,
        user_id VARCHAR(36) NOT NULL,
        module_name VARCHAR(100) NOT NULL,
        progress_data JSON,
        last_accessed TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
        UNIQUE KEY unique_user_module (user_id, module_name),
        INDEX idx_user_module (user_id, module_name)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `);

    // 创建默认管理员账号
    await createDefaultAdmin(connection);

    connection.release();
    console.log('✅ 数据库表初始化完成');
    return true;
  } catch (error) {
    console.error('❌ 数据库表初始化失败:', error);
    return false;
  }
};

export default pool;