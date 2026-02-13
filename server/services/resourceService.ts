import pool from '../config/database';
import mysql, { RowDataPacket, ResultSetHeader } from 'mysql2/promise';
import { logUserActivity } from './userService';

export interface Resource {
  id: string;
  title: string;
  description?: string;
  type: 'slide' | 'case' | 'assignment' | 'document' | 'video' | 'other';
  file_name: string;
  file_path: string;
  file_size: number;
  mime_type?: string;
  uploader_id: string;
  uploader_name?: string;
  tags: string[];
  is_public: boolean;
  download_count: number;
  created_at: Date;
  updated_at: Date;
}

export interface CreateResourceData {
  title: string;
  description?: string;
  type: 'slide' | 'case' | 'assignment' | 'document' | 'video' | 'other';
  file_name: string;
  file_path: string;
  file_size: number;
  mime_type?: string;
  uploader_id: string;
  tags?: string[];
  is_public?: boolean;
}

// 创建资源
export const createResource = async (resourceData: CreateResourceData): Promise<{ success: boolean; resource?: Resource; error?: string }> => {
  const connection = await pool.getConnection();
  
  try {
    const resourceId = uuidv4();
    
    await connection.execute<ResultSetHeader>(
      `INSERT INTO resources (id, title, description, type, file_name, file_path, file_size, mime_type, uploader_id, tags, is_public) 
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        resourceId,
        resourceData.title,
        resourceData.description || null,
        resourceData.type,
        resourceData.file_name,
        resourceData.file_path,
        resourceData.file_size,
        resourceData.mime_type || null,
        resourceData.uploader_id,
        JSON.stringify(resourceData.tags || []),
        resourceData.is_public !== false
      ]
    );

    // 获取创建的资源信息
    const [resources] = await connection.execute<RowDataPacket[]>(
      `SELECT r.*, u.name as uploader_name 
       FROM resources r 
       LEFT JOIN users u ON r.uploader_id = u.id 
       WHERE r.id = ?`,
      [resourceId]
    );

    const resource = resources[0] as Resource;
    try {
      resource.tags = typeof resource.tags === 'string' ? JSON.parse(resource.tags) : (resource.tags || []);
    } catch (e) {
      resource.tags = [];
    }

    // 记录上传活动
    await logUserActivity(resourceData.uploader_id, 'resource_upload', 'collaborative_library', {
      resource_id: resourceId,
      resource_title: resourceData.title,
      resource_type: resourceData.type
    });

    return { success: true, resource };
  } catch (error) {
    console.error('创建资源失败 (DB Error):', error);
    return { 
      success: false, 
      error: error instanceof Error ? `数据库错误: ${error.message}` : '上传失败，请稍后重试' 
    };
  } finally {
    connection.release();
  }
};

// 获取资源列表
export const getResources = async (
  page: number = 1,
  limit: number = 20,
  type?: string,
  search?: string,
  uploaderId?: string
): Promise<{ resources: Resource[]; total: number; totalPages: number }> => {
  const connection = await pool.getConnection();
  
  try {
    let whereClause = 'WHERE r.is_public = TRUE';
    const params: any[] = [];

    if (type && type !== 'all') {
      whereClause += ' AND r.type = ?';
      params.push(type);
    }

    if (search) {
      whereClause += ' AND (r.title LIKE ? OR r.description LIKE ?)';
      params.push(`%${search}%`, `%${search}%`);
    }

    if (uploaderId) {
      whereClause = 'WHERE r.uploader_id = ?'; // 如果指定上传者，显示其所有资源
      params.unshift(uploaderId);
    }

    // 获取总数
    const [countResult] = await connection.execute<RowDataPacket[]>(
      `SELECT COUNT(*) as total FROM resources r ${whereClause}`,
      params
    );
    const total = countResult[0]?.total || 0;

    // 获取资源列表
    // 某些 MySQL/MariaDB 版本对预处理语句的 LIMIT/OFFSET 参数非常挑剔，容易触发 ER_WRONG_ARGUMENTS。
    // 这里将 safeLimit/safeOffset 作为“已净化整数”直接拼接进 SQL，避免驱动/数据库层面的问题。
    const safeLimit = Number.isFinite(limit) ? Math.max(1, Math.floor(limit)) : 20;
    const safeOffset = Number.isFinite(page) ? Math.max(0, (Math.floor(page) - 1) * safeLimit) : 0;
    const [resources] = await connection.execute<RowDataPacket[]>(
      `SELECT r.*, u.name as uploader_name 
       FROM resources r 
       LEFT JOIN users u ON r.uploader_id = u.id 
       ${whereClause}
       ORDER BY r.created_at DESC 
       LIMIT ${safeLimit} OFFSET ${safeOffset}`,
      params
    );

    // 解析tags JSON
    const resourcesWithTags = resources.map(resource => {
      let parsedTags: any[] = [];
      try {
        parsedTags = typeof (resource as any).tags === 'string' ? JSON.parse((resource as any).tags) : ((resource as any).tags || []);
      } catch (e) {
        parsedTags = [];
      }

      return {
        ...resource,
        tags: parsedTags
      };
    }) as Resource[];

    const totalPages = Math.ceil(total / limit);

    return { resources: resourcesWithTags, total, totalPages };
  } catch (error) {
    console.error('获取资源列表失败:', error);
    return { resources: [], total: 0, totalPages: 0 };
  } finally {
    connection.release();
  }
};

// 根据ID获取资源
export const getResourceById = async (resourceId: string): Promise<Resource | null> => {
  const connection = await pool.getConnection();
  
  try {
    const [resources] = await connection.execute<RowDataPacket[]>(
      `SELECT r.*, u.name as uploader_name 
       FROM resources r 
       LEFT JOIN users u ON r.uploader_id = u.id 
       WHERE r.id = ?`,
      [resourceId]
    );

    if (resources.length === 0) {
      return null;
    }

    const resource = resources[0] as Resource;
    try {
      resource.tags = typeof (resource as any).tags === 'string' ? JSON.parse((resource as any).tags) : ((resource as any).tags || []);
    } catch (e) {
      resource.tags = [];
    }

    return resource;
  } catch (error) {
    console.error('获取资源失败:', error);
    return null;
  } finally {
    connection.release();
  }
};

// 下载资源（增加下载计数）
export const downloadResource = async (resourceId: string, userId: string): Promise<{ success: boolean; resource?: Resource; error?: string }> => {
  const connection = await pool.getConnection();
  
  try {
    await connection.beginTransaction();

    // 获取资源信息
    const resource = await getResourceById(resourceId);
    if (!resource) {
      await connection.rollback();
      return { success: false, error: '资源不存在' };
    }

    // 增加下载计数
    await connection.execute<ResultSetHeader>(
      'UPDATE resources SET download_count = download_count + 1 WHERE id = ?',
      [resourceId]
    );

    // 记录下载记录
    await connection.execute<ResultSetHeader>(
      'INSERT INTO resource_downloads (resource_id, user_id) VALUES (?, ?)',
      [resourceId, userId]
    );

    await connection.commit();

    // 记录下载活动
    await logUserActivity(userId, 'resource_download', 'collaborative_library', {
      resource_id: resourceId,
      resource_title: resource.title,
      resource_type: resource.type
    });

    return { success: true, resource };
  } catch (error) {
    await connection.rollback();
    console.error('下载资源失败:', error);
    return { success: false, error: '下载失败，请稍后重试' };
  } finally {
    connection.release();
  }
};

// 删除资源
export const deleteResource = async (resourceId: string, userId: string): Promise<{ success: boolean; error?: string }> => {
  const connection = await pool.getConnection();
  
  try {
    // 检查资源是否存在且用户有权限删除
    const [resources] = await connection.execute<RowDataPacket[]>(
      'SELECT uploader_id FROM resources WHERE id = ?',
      [resourceId]
    );

    if (resources.length === 0) {
      return { success: false, error: '资源不存在' };
    }

    const resource = resources[0];
    
    // 检查权限（只有上传者、老师或管理员可以删除）
    const [users] = await connection.execute<RowDataPacket[]>(
      'SELECT role FROM users WHERE id = ?',
      [userId]
    );

    const user = users[0];
    if (resource.uploader_id !== userId && user.role !== 'admin' && user.role !== 'teacher') {
      return { success: false, error: '没有权限删除此资源' };
    }

    // 删除资源（软删除，实际上是设置为不公开）
    await connection.execute<ResultSetHeader>(
      'UPDATE resources SET is_public = FALSE WHERE id = ?',
      [resourceId]
    );

    return { success: true };
  } catch (error) {
    console.error('删除资源失败:', error);
    return { success: false, error: '删除失败，请稍后重试' };
  } finally {
    connection.release();
  }
};

// 获取用户上传的资源
export const getUserResources = async (userId: string): Promise<Resource[]> => {
  const connection = await pool.getConnection();
  
  try {
    const [resources] = await connection.execute<RowDataPacket[]>(
      `SELECT r.*, u.name as uploader_name 
       FROM resources r 
       LEFT JOIN users u ON r.uploader_id = u.id 
       WHERE r.uploader_id = ? 
       ORDER BY r.created_at DESC`,
      [userId]
    );

    return resources.map(resource => ({
      ...resource,
      tags: JSON.parse(resource.tags as any) || []
    })) as Resource[];
  } catch (error) {
    console.error('获取用户资源失败:', error);
    return [];
  } finally {
    connection.release();
  }
};

// 获取资源统计信息
export const getResourceStats = async (): Promise<any> => {
  const connection = await pool.getConnection();
  
  try {
    // 按类型统计
    const [typeStats] = await connection.execute<RowDataPacket[]>(
      'SELECT type, COUNT(*) as count FROM resources WHERE is_public = TRUE GROUP BY type'
    );

    // 总下载量
    const [downloadStats] = await connection.execute<RowDataPacket[]>(
      'SELECT SUM(download_count) as total_downloads FROM resources WHERE is_public = TRUE'
    );

    // 最受欢迎的资源
    const [popularResources] = await connection.execute<RowDataPacket[]>(
      `SELECT r.id, r.title, r.download_count, u.name as uploader_name
       FROM resources r 
       LEFT JOIN users u ON r.uploader_id = u.id 
       WHERE r.is_public = TRUE 
       ORDER BY r.download_count DESC 
       LIMIT 10`
    );

    return {
      typeStats,
      totalDownloads: downloadStats[0]?.total_downloads || 0,
      popularResources
    };
  } catch (error) {
    console.error('获取资源统计失败:', error);
    return { typeStats: [], totalDownloads: 0, popularResources: [] };
  } finally {
    connection.release();
  }
};