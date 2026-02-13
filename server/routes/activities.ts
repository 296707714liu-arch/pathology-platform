import express from 'express';
import { authenticateToken } from '../middleware/auth.ts';
import { logUserActivity } from '../services/userService.ts';
import type { AuthRequest } from '../middleware/auth.ts';

const router = express.Router();

// 记录用户活动日志
router.post('/log', authenticateToken, async (req: AuthRequest, res) => {
  try {
    const { activity_type, module_name, details, duration_seconds } = req.body;
    
    // 调用现有的 userService 中的活动记录功能
    await logUserActivity(
      req.user.id,
      activity_type,
      module_name || 'unknown',
      details || {},
      duration_seconds || 0
    );

    res.json({ success: true });
  } catch (error) {
    console.error('[Activities] Log error:', error);
    // 即使记录失败也返回成功，避免前端因为日志记录失败而中断业务逻辑
    res.json({ success: true, warning: 'Activity logged locally but failed to save to DB' });
  }
});

export default router;
