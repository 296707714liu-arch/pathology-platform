import pool from '../config/database.ts';
import mysql from 'mysql2';
import { v4 as uuidv4 } from 'uuid';
const { RowDataPacket, ResultSetHeader } = mysql;
import { logUserActivity } from './userService.ts';

export interface ExamRecord {
  id: number;
  user_id: string;
  exam_title: string;
  score: number;
  total_score: number;
  duration_minutes: number;
  questions_data: any;
  answers_data: any;
  wrong_questions: any;
  created_at: Date;
}

export interface CreateExamRecordData {
  user_id: string;
  exam_title: string;
  score: number;
  total_score: number;
  duration_minutes: number;
  questions_data: any;
  answers_data: any;
  wrong_questions: any;
}

// 保存考试记录
export const saveExamRecord = async (examData: CreateExamRecordData): Promise<{ success: boolean; record?: ExamRecord; error?: string }> => {
  const connection = await pool.getConnection();
  
  try {
    const recordId = uuidv4();
    const [result] = await connection.execute<ResultSetHeader>(
      `INSERT INTO exam_records (id, user_id, exam_title, score, total_score, duration_minutes, questions_data, answers_data, wrong_questions) 
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        recordId,
        examData.user_id,
        examData.exam_title,
        examData.score,
        examData.total_score,
        examData.duration_minutes,
        JSON.stringify(examData.questions_data),
        JSON.stringify(examData.answers_data),
        JSON.stringify(examData.wrong_questions)
      ]
    );

    // 记录考试活动
    await logUserActivity(examData.user_id, 'exam_attempt', 'exam_system', {
      exam_title: examData.exam_title,
      score: examData.score,
      total_score: examData.total_score,
      duration_minutes: examData.duration_minutes
    }, examData.duration_minutes * 60);

    // 获取保存的记录
    const [records] = await connection.execute<RowDataPacket[]>(
      'SELECT * FROM exam_records WHERE id = ?',
      [recordId]
    );

    const record = records[0] as ExamRecord;

    const safeParse = (val: any) => {
      if (val === null || val === undefined) return null;
      if (typeof val === 'object') return val;
      if (typeof val !== 'string') return val;
      const trimmed = val.trim();
      if (!trimmed) return null;
      try {
        return JSON.parse(trimmed);
      } catch (e) {
        return val;
      }
    };

    record.questions_data = safeParse((record as any).questions_data);
    record.answers_data = safeParse((record as any).answers_data);
    record.wrong_questions = safeParse((record as any).wrong_questions);

    return { success: true, record };
  } catch (error) {
    console.error('保存考试记录失败:', error);
    return { success: false, error: '保存考试记录失败' };
  } finally {
    connection.release();
  }
};

// 获取用户考试记录
export const getUserExamRecords = async (userId: string, limit: number = 20): Promise<ExamRecord[]> => {
  const connection = await pool.getConnection();
  
  try {
    const safeLimit = Number.isFinite(limit) ? Math.max(1, Math.floor(limit)) : 20;
    const [records] = await connection.execute<RowDataPacket[]>(
      `SELECT * FROM exam_records WHERE user_id = ? ORDER BY created_at DESC LIMIT ${safeLimit}`,
      [userId]
    );

    const safeParse = (val: any) => {
      if (val === null || val === undefined) return null;
      if (typeof val === 'object') return val;
      if (typeof val !== 'string') return val;
      const trimmed = val.trim();
      if (!trimmed) return null;
      try {
        return JSON.parse(trimmed);
      } catch (e) {
        return val;
      }
    };

    return records.map(record => ({
      ...record,
      questions_data: safeParse((record as any).questions_data),
      answers_data: safeParse((record as any).answers_data),
      wrong_questions: safeParse((record as any).wrong_questions)
    })) as ExamRecord[];
  } catch (error) {
    console.error('获取用户考试记录失败:', error);
    return [];
  } finally {
    connection.release();
  }
};

// 获取考试统计
export const getExamStats = async (userId?: string): Promise<any> => {
  const connection = await pool.getConnection();
  
  try {
    let whereClause = '';
    const params: any[] = [];

    if (userId) {
      whereClause = 'WHERE user_id = ?';
      params.push(userId);
    }

    // 基本统计
    const [basicStats] = await connection.execute<RowDataPacket[]>(
      `SELECT 
        COUNT(*) as total_exams,
        AVG(score) as avg_score,
        MAX(score) as best_score,
        MIN(score) as worst_score,
        SUM(duration_minutes) as total_time
       FROM exam_records ${whereClause}`,
      params
    );

    // 按考试标题统计
    const [examTitleStats] = await connection.execute<RowDataPacket[]>(
      `SELECT 
        exam_title,
        COUNT(*) as attempts,
        AVG(score) as avg_score,
        MAX(score) as best_score
       FROM exam_records ${whereClause}
       GROUP BY exam_title
       ORDER BY attempts DESC`,
      params
    );

    // 最近的考试记录
    const [recentExams] = await connection.execute<RowDataPacket[]>(
      `SELECT exam_title, score, total_score, created_at
       FROM exam_records ${whereClause}
       ORDER BY created_at DESC 
       LIMIT 10`,
      params
    );

    return {
      basic: basicStats[0] || { total_exams: 0, avg_score: 0, best_score: 0, worst_score: 0, total_time: 0 },
      byTitle: examTitleStats,
      recent: recentExams
    };
  } catch (error) {
    console.error('获取考试统计失败:', error);
    return { basic: {}, byTitle: [], recent: [] };
  } finally {
    connection.release();
  }
};