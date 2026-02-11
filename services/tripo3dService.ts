/**
 * Tripo3D API 服务
 * 用于生成专业的 3D 模型
 * 通过中转站 API 调用
 */

import { TRIPO3D_API_CONFIG } from '../config/api';

// 后端代理地址
const TRIPO_BASE_URL = 'http://localhost:3007/api/tripo3d';

export interface TripoTaskResult {
  task_id: string;
  status: 'queued' | 'running' | 'success' | 'failed';
  progress: number;
  output?: {
    model: string; // GLB 模型 URL
    rendered_image?: string;
  };
  error?: string;
}

/**
 * 获取认证 token
 */
function getAuthToken(): string {
  return localStorage.getItem('auth_token') || '';
}

/**
 * 创建文本转 3D 任务
 */
export async function createTextTo3DTask(prompt: string): Promise<string> {
  console.log('[Tripo3D] Creating task for prompt:', prompt);
  
  const response = await fetch(`${TRIPO_BASE_URL}/task`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${getAuthToken()}`
    },
    body: JSON.stringify({
      type: 'text_to_model',
      prompt: prompt,
      model_version: 'v2.0-20240919',
      face_limit: 10000,
      texture: true,
      pbr: true
    })
  });

  if (!response.ok) {
    const error = await response.text();
    console.error('[Tripo3D] Create task failed:', error);
    throw new Error(`Tripo3D API 错误: ${response.status}`);
  }

  const data = await response.json();
  console.log('[Tripo3D] Task created:', data);
  
  if (data.code !== 0) {
    throw new Error(data.message || 'Tripo3D 任务创建失败');
  }
  
  return data.data.task_id;
}

/**
 * 查询任务状态
 */
export async function getTaskStatus(taskId: string): Promise<TripoTaskResult> {
  const response = await fetch(`${TRIPO_BASE_URL}/task/${taskId}`, {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${getAuthToken()}`
    }
  });

  if (!response.ok) {
    throw new Error(`查询任务状态失败: ${response.status}`);
  }

  const data = await response.json();
  console.log('[Tripo3D] Raw task data:', JSON.stringify(data, null, 2));
  
  if (data.code !== 0) {
    throw new Error(data.message || '查询失败');
  }

  const task = data.data;
  
  // Tripo3D API 返回的模型 URL 可能在不同字段
  // 尝试多种可能的字段名
  let modelUrl = task.output?.model || 
                 task.output?.pbr_model || 
                 task.output?.base_model ||
                 task.result?.model?.url ||
                 task.result?.pbr_model ||
                 task.model_url ||
                 task.draft_model_url ||
                 task.pbr_model_url;
  
  console.log('[Tripo3D] Parsed model URL:', modelUrl);
  console.log('[Tripo3D] Task output:', task.output);
  console.log('[Tripo3D] Task result:', task.result);
  
  return {
    task_id: task.task_id,
    status: task.status,
    progress: task.progress || 0,
    output: modelUrl ? { model: modelUrl } : task.output,
    error: task.error
  };
}

/**
 * 等待任务完成（轮询）
 */
export async function waitForTaskCompletion(
  taskId: string, 
  onProgress?: (progress: number, status: string) => void,
  maxWaitTime: number = 300000 // 最长等待 5 分钟
): Promise<TripoTaskResult> {
  const startTime = Date.now();
  const pollInterval = 3000; // 每 3 秒查询一次

  while (Date.now() - startTime < maxWaitTime) {
    const result = await getTaskStatus(taskId);
    
    if (onProgress) {
      onProgress(result.progress, result.status);
    }

    console.log(`[Tripo3D] Task ${taskId}: ${result.status} (${result.progress}%)`);

    if (result.status === 'success') {
      return result;
    }

    if (result.status === 'failed') {
      throw new Error(result.error || '3D 模型生成失败');
    }

    // 等待后继续轮询
    await new Promise(resolve => setTimeout(resolve, pollInterval));
  }

  throw new Error('3D 模型生成超时，请稍后重试');
}

/**
 * 一站式生成 3D 模型
 * 返回 GLB 模型的 URL
 */
export async function generateModel(
  prompt: string,
  onProgress?: (progress: number, status: string) => void
): Promise<string> {
  // 1. 创建任务
  const taskId = await createTextTo3DTask(prompt);
  
  // 2. 等待完成
  const result = await waitForTaskCompletion(taskId, onProgress);
  
  // 3. 返回模型 URL
  if (!result.output?.model) {
    throw new Error('未获取到模型文件');
  }
  
  console.log('[Tripo3D] Model URL:', result.output.model);
  return result.output.model;
}

/**
 * 获取账户余额/配额
 */
export async function getBalance(): Promise<{ balance: number; frozen: number }> {
  const response = await fetch(`${TRIPO_BASE_URL}/user/balance`, {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${getAuthToken()}`
    }
  });

  if (!response.ok) {
    throw new Error('获取余额失败');
  }

  const data = await response.json();
  return {
    balance: data.data?.balance || 0,
    frozen: data.data?.frozen || 0
  };
}
