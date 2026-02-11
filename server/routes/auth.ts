import express from 'express';
import { registerUser, loginUser, getAllUsers, deleteUser, getUserStats, getUserActivities } from '../services/userService.ts';
import { authenticateToken, requireRole, AuthRequest } from '../middleware/auth.ts';

const router = express.Router();

// 用户注册
router.post('/register', async (req, res) => {
  try {
    const result = await registerUser(req.body);
    
    if (result.success) {
      res.status(201).json({
        success: true,
        user: result.user,
        token: result.token
      });
    } else {
      res.status(400).json({
        success: false,
        error: result.error
      });
    }
  } catch (error) {
    console.error('注册路由错误:', error);
    res.status(500).json({ success: false, error: '服务器内部错误' });
  }
});

// 用户登录
router.post('/login', async (req, res) => {
  try {
    const result = await loginUser(req.body);
    
    if (result.success) {
      res.json({
        success: true,
        user: result.user,
        token: result.token
      });
    } else {
      res.status(400).json({
        success: false,
        error: result.error
      });
    }
  } catch (error) {
    console.error('登录路由错误:', error);
    res.status(500).json({ success: false, error: '服务器内部错误' });
  }
});

// 获取当前用户信息
router.get('/me', authenticateToken, async (req: AuthRequest, res) => {
  try {
    res.json({
      success: true,
      user: req.user
    });
  } catch (error) {
    console.error('获取用户信息错误:', error);
    res.status(500).json({ success: false, error: '服务器内部错误' });
  }
});

// 获取用户统计信息
router.get('/stats', authenticateToken, async (req: AuthRequest, res) => {
  try {
    const stats = await getUserStats(req.user.id);
    res.json({
      success: true,
      stats
    });
  } catch (error) {
    console.error('获取用户统计错误:', error);
    res.status(500).json({ success: false, error: '服务器内部错误' });
  }
});

// 获取用户活动记录
router.get('/activities', authenticateToken, async (req: AuthRequest, res) => {
  try {
    const limit = parseInt(req.query.limit as string) || 50;
    const activities = await getUserActivities(req.user.id, limit);
    res.json({
      success: true,
      activities
    });
  } catch (error) {
    console.error('获取用户活动记录错误:', error);
    res.status(500).json({ success: false, error: '服务器内部错误' });
  }
});

// 获取所有用户（管理员功能）
router.get('/users', authenticateToken, requireRole(['admin', 'teacher']), async (req, res) => {
  try {
    const users = await getAllUsers();
    res.json({
      success: true,
      users
    });
  } catch (error) {
    console.error('获取用户列表错误:', error);
    res.status(500).json({ success: false, error: '服务器内部错误' });
  }
});

// 删除用户（管理员功能）
router.delete('/users/:userId', authenticateToken, requireRole(['admin']), async (req, res) => {
  try {
    const success = await deleteUser(req.params.userId);
    
    if (success) {
      res.json({ success: true });
    } else {
      res.status(400).json({ success: false, error: '删除用户失败' });
    }
  } catch (error) {
    console.error('删除用户错误:', error);
    res.status(500).json({ success: false, error: '服务器内部错误' });
  }
});

export default router;