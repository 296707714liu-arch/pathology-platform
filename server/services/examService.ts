import pool from '../config/database.ts';
import { RowDataPacket, ResultSetHeader } from 'mysql2';
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
    const [result] = await connection.execute<ResultSetHeader>(
      `INSERT INTO exam_records (user_id, exam_title, score, total_score, duration_minutes, questions_data, answers_data, wrong_questions) 
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [
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
      [result.insertId]
    );

    const record = records[0] as ExamRecord;
    record.questions_data = JSON.parse(record.questions_data as any);
    record.answers_data = JSON.parse(record.answers_data as any);
    record.wrong_questions = JSON.parse(record.wrong_questions as any);

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
    const [records] = await connection.execute<RowDataPacket[]>(
      'SELECT * FROM exam_records WHERE user_id = ? ORDER BY created_at DESC LIMIT ?',
      [userId, limit]
    );

    return records.map(record => ({
      ...record,
      questions_data: JSON.parse(record.questions_data as any),
      answers_data: JSON.parse(record.answers_data as any),
      wrong_questions: JSON.parse(record.wrong_questions as any)
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