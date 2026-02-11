import express from 'express';
import { saveExamRecord, getUserExamRecords, getExamStats } from '../services/examService.ts';
import { authenticateToken, AuthRequest } from '../middleware/auth.ts';

const router = express.Router();

// 保存考试记录
router.post('/records', authenticateToken, async (req: AuthRequest, res) => {
  try {
    const examData = {
      ...req.body,
      user_id: req.user.id
    };

    const result = await saveExamRecord(examData);

    if (result.success) {
      res.status(201).json({
        success: true,
        record: result.record
      });
    } else {
      res.status(400).json({
        success: false,
        error: result.error
      });
    }
  } catch (error) {
    console.error('保存考试记录错误:', error);
    res.status(500).json({ success: false, error: '服务器内部错误' });
  }
});

// 获取用户考试记录
router.get('/records', authenticateToken, async (req: AuthRequest, res) => {
  try {
    const limit = parseInt(req.query.limit as string) || 20;
    const records = await getUserExamRecords(req.user.id, limit);

    res.json({
      success: true,
      records
    });
  } catch (error) {
    console.error('获取考试记录错误:', error);
    res.status(500).json({ success: false, error: '服务器内部错误' });
  }
});

// 获取考试统计
router.get('/stats', authenticateToken, async (req: AuthRequest, res) => {
  try {
    const stats = await getExamStats(req.user.id);

    res.json({
      success: true,
      stats
    });
  } catch (error) {
    console.error('获取考试统计错误:', error);
    res.status(500).json({ success: false, error: '服务器内部错误' });
  }
});

export default router;