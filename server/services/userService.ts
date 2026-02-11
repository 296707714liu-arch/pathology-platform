import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { v4 as uuidv4 } from 'uuid';
import pool from '../config/database.ts';
import { RowDataPacket, ResultSetHeader } from 'mysql2';

export interface User {
  id: string;
  name: string;
  email: string;
  role: 'student' | 'teacher' | 'researcher' | 'admin';
  institution?: string;
  avatar_url?: string;
  created_at: Date;
  updated_at: Date;
  last_login?: Date;
  is_active: boolean;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterData {
  name: string;
  email: string;
  password: string;
  role: 'student' | 'teacher' | 'researcher';
  institution?: string;
}

// 生成JWT令牌
const generateToken = (userId: string): string => {
  return jwt.sign({ userId }, process.env.JWT_SECRET!, {
    expiresIn: process.env.JWT_EXPIRES_IN || '7d'
  });
};

// 验证JWT令牌
export const verifyToken = (token: string): { userId: string } | null => {
  try {
    return jwt.verify(token, process.env.JWT_SECRET!) as { userId: string };
  } catch (error) {
    return null;
  }
};

// 用户注册
export const registerUser = async (userData: RegisterData): Promise<{ success: boolean; user?: User; token?: string; error?: string }> => {
  const connection = await pool.getConnection();
  
  try {
    // 检查邮箱是否已存在
    const [existingUsers] = await connection.execute<RowDataPacket[]>(
      'SELECT id FROM users WHERE email = ?',
      [userData.email]
    );

    if (existingUsers.length > 0) {
      return { success: false, error: '该邮箱已被注册' };
    }

    // 加密密码
    const saltRounds = 12;
    const passwordHash = await bcrypt.hash(userData.password, saltRounds);

    // 创建用户
    const userId = uuidv4();
    await connection.execute<ResultSetHeader>(
      `INSERT INTO users (id, name, email, password_hash, role, institution) 
       VALUES (?, ?, ?, ?, ?, ?)`,
      [userId, userData.name, userData.email, passwordHash, userData.role, userData.institution || null]
    );

    // 获取创建的用户信息
    const [users] = await connection.execute<RowDataPacket[]>(
      'SELECT id, name, email, role, institution, avatar_url, created_at, updated_at, last_login, is_active FROM users WHERE id = ?',
      [userId]
    );

    const user = users[0] as User;
    const token = generateToken(userId);

    // 记录注册活动
    await logUserActivity(userId, 'login', 'registration', { action: 'user_registered' });

    return { success: true, user, token };
  } catch (error) {
    console.error('用户注册失败:', error);
    return { success: false, error: '注册失败，请稍后重试' };
  } finally {
    connection.release();
  }
};

// 用户登录
export const loginUser = async (credentials: LoginCredentials): Promise<{ success: boolean; user?: User; token?: string; error?: string }> => {
  const connection = await pool.getConnection();
  
  try {
    // 查找用户
    const [users] = await connection.execute<RowDataPacket[]>(
      'SELECT * FROM users WHERE email = ? AND is_active = TRUE',
      [credentials.email]
    );

    if (users.length === 0) {
      return { success: false, error: '用户不存在或已被禁用' };
    }

    const user = users[0];

    // 验证密码
    const isPasswordValid = await bcrypt.compare(credentials.password, user.password_hash);
    if (!isPasswordValid) {
      return { success: false, error: '密码错误' };
    }

    // 更新最后登录时间
    await connection.execute<ResultSetHeader>(
      'UPDATE users SET last_login = CURRENT_TIMESTAMP WHERE id = ?',
      [user.id]
    );

    // 生成令牌
    const token = generateToken(user.id);

    // 记录登录活动
    await logUserActivity(user.id, 'login', 'authentication', { action: 'user_login' });

    // 返回用户信息（不包含密码）
    const { password_hash, ...userWithoutPassword } = user;
    return { success: true, user: userWithoutPassword as User, token };
  } catch (error) {
    console.error('用户登录失败:', error);
    return { success: false, error: '登录失败，请稍后重试' };
  } finally {
    connection.release();
  }
};

// 根据ID获取用户
export const getUserById = async (userId: string): Promise<User | null> => {
  const connection = await pool.getConnection();
  
  try {
    const [users] = await connection.execute<RowDataPacket[]>(
      'SELECT id, name, email, role, institution, avatar_url, created_at, updated_at, last_login, is_active FROM users WHERE id = ? AND is_active = TRUE',
      [userId]
    );

    return users.length > 0 ? users[0] as User : null;
  } catch (error) {
    console.error('获取用户失败:', error);
    return null;
  } finally {
    connection.release();
  }
};

// 获取所有用户（管理员功能）
export const getAllUsers = async (): Promise<User[]> => {
  const connection = await pool.getConnection();
  
  try {
    const [users] = await connection.execute<RowDataPacket[]>(
      'SELECT id, name, email, role, institution, avatar_url, created_at, updated_at, last_login, is_active FROM users ORDER BY created_at DESC'
    );

    return users as User[];
  } catch (error) {
    console.error('获取用户列表失败:', error);
    return [];
  } finally {
    connection.release();
  }
};

// 删除用户
export const deleteUser = async (userId: string): Promise<boolean> => {
  const connection = await pool.getConnection();
  
  try {
    await connection.execute<ResultSetHeader>(
      'UPDATE users SET is_active = FALSE WHERE id = ?',
      [userId]
    );
    return true;
  } catch (error) {
    console.error('删除用户失败:', error);
    return false;
  } finally {
    connection.release();
  }
};

// 记录用户活动
export const logUserActivity = async (
  userId: string, 
  activityType: string, 
  moduleName?: string, 
  details?: any, 
  durationSeconds?: number
): Promise<void> => {
  const connection = await pool.getConnection();
  
  try {
    await connection.execute<ResultSetHeader>(
      'INSERT INTO user_activities (user_id, activity_type, module_name, details, duration_seconds) VALUES (?, ?, ?, ?, ?)',
      [userId, activityType, moduleName || null, JSON.stringify(details || {}), durationSeconds || 0]
    );
  } catch (error) {
    console.error('记录用户活动失败:', error);
  } finally {
    connection.release();
  }
};

// 获取用户活动记录
export const getUserActivities = async (userId: string, limit: number = 50): Promise<any[]> => {
  const connection = await pool.getConnection();
  
  try {
    const [activities] = await connection.execute<RowDataPacket[]>(
      'SELECT * FROM user_activities WHERE user_id = ? ORDER BY created_at DESC LIMIT ?',
      [userId, limit]
    );

    return activities;
  } catch (error) {
    console.error('获取用户活动记录失败:', error);
    return [];
  } finally {
    connection.release();
  }
};

// 获取用户统计信息
export const getUserStats = async (userId: string): Promise<any> => {
  const connection = await pool.getConnection();
  
  try {
    // 获取活动统计
    const [activityStats] = await connection.execute<RowDataPacket[]>(
      `SELECT 
        activity_type,
        COUNT(*) as count,
        SUM(duration_seconds) as total_duration
       FROM user_activities 
       WHERE user_id = ? 
       GROUP BY activity_type`,
      [userId]
    );

    // 获取考试统计
    const [examStats] = await connection.execute<RowDataPacket[]>(
      `SELECT 
        COUNT(*) as total_exams,
        AVG(score) as avg_score,
        MAX(score) as best_score,
        SUM(duration_minutes) as total_study_time
       FROM exam_records 
       WHERE user_id = ?`,
      [userId]
    );

    // 获取资源下载统计
    const [downloadStats] = await connection.execute<RowDataPacket[]>(
      `SELECT COUNT(*) as total_downloads
       FROM resource_downloads 
       WHERE user_id = ?`,
      [userId]
    );

    return {
      activities: activityStats,
      exams: examStats[0] || { total_exams: 0, avg_score: 0, best_score: 0, total_study_time: 0 },
      downloads: downloadStats[0] || { total_downloads: 0 }
    };
  } catch (error) {
    console.error('获取用户统计失败:', error);
    return { activities: [], exams: {}, downloads: {} };
  } finally {
    connection.release();
  }
};