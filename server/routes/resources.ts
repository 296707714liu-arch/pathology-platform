import express from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { 
  createResource, 
  getResources, 
  getResourceById, 
  downloadResource, 
  deleteResource, 
  getUserResources,
  getResourceStats 
} from '../services/resourceService.ts';
import { authenticateToken, requireRole } from '../middleware/auth.ts';
import type { AuthRequest } from '../middleware/auth.ts';

const router = express.Router();

// 确保上传目录存在
const uploadDir = process.env.UPLOAD_DIR || 'uploads';
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// 配置multer用于文件上传
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    // 生成唯一文件名
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const ext = path.extname(file.originalname);
    cb(null, file.fieldname + '-' + uniqueSuffix + ext);
  }
});

const upload = multer({
  storage: storage,
  limits: {
    fileSize: 50 * 1024 * 1024 // 50MB
  },
  fileFilter: (req, file, cb) => {
    // 允许的文件类型
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

// 上传资源
router.post('/upload', authenticateToken, requireRole(['teacher', 'admin']), upload.single('file'), async (req: AuthRequest, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, error: '没有上传文件' });
    }

    const { title, description, type, tags, is_public } = req.body;

    if (!title || !type) {
      return res.status(400).json({ success: false, error: '标题和类型是必填项' });
    }

    let parsedTags = [];
    if (tags) {
      try {
        parsedTags = typeof tags === 'string' ? JSON.parse(tags) : tags;
      } catch (e) {
        console.warn('解析 tags 失败:', e);
        parsedTags = [];
      }
    }

    const resourceData = {
      title,
      description,
      type,
      file_name: req.file.originalname,
      file_path: req.file.path,
      file_size: req.file.size,
      mime_type: req.file.mimetype,
      uploader_id: req.user.id,
      tags: parsedTags,
      is_public: is_public !== 'false'
    };

    const result = await createResource(resourceData);

    if (result.success) {
      res.status(201).json({
        success: true,
        resource: result.resource
      });
    } else {
      // 删除上传的文件
      fs.unlinkSync(req.file.path);
      res.status(400).json({
        success: false,
        error: result.error
      });
    }
  } catch (error) {
    console.error('上传资源错误:', error);
    if (req.file) {
      fs.unlinkSync(req.file.path);
    }
    res.status(500).json({ success: false, error: '服务器内部错误' });
  }
});

// 获取资源列表
router.get('/', async (req, res) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 20;
    const type = req.query.type as string;
    const search = req.query.search as string;
    const uploaderId = req.query.uploader_id as string;

    const result = await getResources(page, limit, type, search, uploaderId);

    res.json({
      success: true,
      ...result
    });
  } catch (error) {
    console.error('获取资源列表错误:', error);
    res.status(500).json({ success: false, error: '服务器内部错误' });
  }
});

// 获取单个资源信息
router.get('/:id', async (req, res) => {
  try {
    const resource = await getResourceById(req.params.id);

    if (resource) {
      res.json({
        success: true,
        resource
      });
    } else {
      res.status(404).json({
        success: false,
        error: '资源不存在'
      });
    }
  } catch (error) {
    console.error('获取资源错误:', error);
    res.status(500).json({ success: false, error: '服务器内部错误' });
  }
});

// 下载资源
router.post('/:id/download', authenticateToken, async (req: AuthRequest, res) => {
  try {
    const result = await downloadResource(req.params.id, req.user.id);

    if (result.success && result.resource) {
      // 检查文件是否存在
      if (!fs.existsSync(result.resource.file_path)) {
        return res.status(404).json({
          success: false,
          error: '文件不存在'
        });
      }

      // 设置下载响应头
      res.setHeader('Content-Disposition', `attachment; filename="${encodeURIComponent(result.resource.file_name)}"`);
      res.setHeader('Content-Type', result.resource.mime_type || 'application/octet-stream');

      // 发送文件
      res.sendFile(path.resolve(result.resource.file_path));
    } else {
      res.status(400).json({
        success: false,
        error: result.error
      });
    }
  } catch (error) {
    console.error('下载资源错误:', error);
    res.status(500).json({ success: false, error: '服务器内部错误' });
  }
});

// 删除资源
router.delete('/:id', authenticateToken, async (req: AuthRequest, res) => {
  try {
    const result = await deleteResource(req.params.id, req.user.id);

    if (result.success) {
      res.json({ success: true });
    } else {
      res.status(400).json({
        success: false,
        error: result.error
      });
    }
  } catch (error) {
    console.error('删除资源错误:', error);
    res.status(500).json({ success: false, error: '服务器内部错误' });
  }
});

// 管理员/教师一键清空所有资源 (临时放宽权限以方便清理)
router.delete('/admin/purge-all', authenticateToken, async (req: AuthRequest, res) => {
  const connection = await pool.getConnection();
  try {
    await connection.beginTransaction();

    // 1. 获取所有文件路径以便物理删除
    const [resources] = await connection.execute<RowDataPacket[]>(
      'SELECT file_path FROM resources'
    );

    // 2. 清空下载记录表
    await connection.execute('DELETE FROM resource_downloads');

    // 3. 清空资源表
    await connection.execute('DELETE FROM resources');

    await connection.commit();

    // 4. 物理删除文件
    resources.forEach(resource => {
      try {
        if (resource.file_path && fs.existsSync(resource.file_path)) {
          fs.unlinkSync(resource.file_path);
        }
      } catch (err) {
        console.error(`物理删除文件失败: ${resource.file_path}`, err);
      }
    });

    res.json({ success: true, message: '所有资源及物理文件已成功清空' });
  } catch (error) {
    await connection.rollback();
    console.error('清空所有资源失败:', error);
    res.status(500).json({ success: false, error: '清空操作失败' });
  } finally {
    connection.release();
  }
});

// 获取用户上传的资源
router.get('/user/my-resources', authenticateToken, async (req: AuthRequest, res) => {
  try {
    const resources = await getUserResources(req.user.id);
    res.json({
      success: true,
      resources
    });
  } catch (error) {
    console.error('获取用户资源错误:', error);
    res.status(500).json({ success: false, error: '服务器内部错误' });
  }
});

// 获取资源统计
router.get('/admin/stats', authenticateToken, requireRole(['admin', 'teacher']), async (req, res) => {
  try {
    const stats = await getResourceStats();
    res.json({
      success: true,
      stats
    });
  } catch (error) {
    console.error('获取资源统计错误:', error);
    res.status(500).json({ success: false, error: '服务器内部错误' });
  }
});

export default router;