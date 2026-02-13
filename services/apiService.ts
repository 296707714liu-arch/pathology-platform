import { User, LoginCredentials, RegisterData, UserStats, UserActivity, Resource, CreateResourceData, ExamRecord } from '../types';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3001/api';

// 添加全局 fetch 拦截
const originalFetch = window.fetch;
window.fetch = function(...args: any[]) {
  console.log('📡 API 请求:', args[0]);
  return originalFetch.apply(this, args).catch(error => {
    console.error('❌ 网络错误:', args[0], error);
    throw error;
  });
};

// 获取认证头
const getAuthHeaders = () => {
  const token = localStorage.getItem('auth_token');
  return {
    'Content-Type': 'application/json',
    ...(token && { 'Authorization': `Bearer ${token}` })
  };
};

// 处理API响应
const handleResponse = async (response: Response) => {
  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: '网络错误' }));
    console.error('API 错误:', response.status, error);
    throw new Error(error.error || '请求失败');
  }
  return response.json();
};

// 认证API
export const authAPI = {
  // 登录
  login: async (credentials: LoginCredentials): Promise<{ user: User; token: string }> => {
    const response = await fetch(`${API_BASE_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(credentials)
    });
    
    const data = await handleResponse(response);
    
    // 保存token
    localStorage.setItem('auth_token', data.token);
    
    return data;
  },

  // 注册
  register: async (userData: RegisterData): Promise<{ user: User; token: string }> => {
    const response = await fetch(`${API_BASE_URL}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(userData)
    });
    
    const data = await handleResponse(response);
    
    // 保存token
    localStorage.setItem('auth_token', data.token);
    
    return data;
  },

  // 获取当前用户信息
  getCurrentUser: async (): Promise<User> => {
    const response = await fetch(`${API_BASE_URL}/auth/me`, {
      headers: getAuthHeaders()
    });
    
    const data = await handleResponse(response);
    return data.user;
  },

  // 获取用户统计
  getUserStats: async (): Promise<UserStats> => {
    const response = await fetch(`${API_BASE_URL}/auth/stats`, {
      headers: getAuthHeaders()
    });
    
    const data = await handleResponse(response);
    return data.stats;
  },

  // 获取用户活动记录
  getUserActivities: async (limit: number = 50): Promise<UserActivity[]> => {
    const response = await fetch(`${API_BASE_URL}/auth/activities?limit=${limit}`, {
      headers: getAuthHeaders()
    });
    
    const data = await handleResponse(response);
    return data.activities;
  },

  // 获取所有用户（管理员功能）
  getAllUsers: async (): Promise<User[]> => {
    const response = await fetch(`${API_BASE_URL}/auth/users`, {
      headers: getAuthHeaders()
    });
    
    const data = await handleResponse(response);
    return data.users;
  },

  // 修改用户密码（管理员功能）
  updateUserPassword: async (userId: string, newPassword: string): Promise<void> => {
    const response = await fetch(`${API_BASE_URL}/auth/users/${userId}/password`, {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify({ newPassword })
    });
    
    await handleResponse(response);
  },

  // 删除用户（管理员功能）
  deleteUser: async (userId: string): Promise<void> => {
    const response = await fetch(`${API_BASE_URL}/auth/users/${userId}`, {
      method: 'DELETE',
      headers: getAuthHeaders()
    });
    
    await handleResponse(response);
  },

  // 注销当前账号（删除自己）
  deleteMe: async (): Promise<void> => {
    const response = await fetch(`${API_BASE_URL}/auth/me`, {
      method: 'DELETE',
      headers: getAuthHeaders()
    });

    await handleResponse(response);
  },

  // 登出
  logout: () => {
    localStorage.removeItem('auth_token');
  }
};

// 资源API
export const resourceAPI = {
  // 上传资源
  uploadResource: async (file: File, resourceData: CreateResourceData): Promise<Resource> => {
    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('title', resourceData.title);
      if (resourceData.description) formData.append('description', resourceData.description);
      formData.append('type', resourceData.type);
      if (resourceData.tags) formData.append('tags', JSON.stringify(resourceData.tags));
      formData.append('is_public', String(resourceData.is_public !== false));

      console.log('📤 上传资源:', {
        fileName: file.name,
        fileSize: file.size,
        fileType: file.type,
        title: resourceData.title,
        type: resourceData.type
      });

      const token = localStorage.getItem('auth_token');
      const response = await fetch(`${API_BASE_URL}/resources/upload`, {
        method: 'POST',
        headers: {
          ...(token && { 'Authorization': `Bearer ${token}` })
          // 注意：不要设置 Content-Type，让浏览器自动设置为 multipart/form-data
        },
        body: formData
      });
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: '上传失败' }));
        console.error('❌ 上传失败:', response.status, errorData);
        throw new Error(errorData.error || `上传失败: ${response.status}`);
      }

      const data = await response.json();
      console.log('✅ 上传成功:', data);
      return data.resource;
    } catch (error) {
      console.error('❌ 上传错误:', error);
      throw error;
    }
  },

  // 获取资源列表
  getResources: async (params: {
    page?: number;
    limit?: number;
    type?: string;
    search?: string;
    uploader_id?: string;
  } = {}): Promise<{ resources: Resource[]; total: number; totalPages: number }> => {
    const queryParams = new URLSearchParams();
    if (params.page) queryParams.append('page', String(params.page));
    if (params.limit) queryParams.append('limit', String(params.limit));
    if (params.type) queryParams.append('type', params.type);
    if (params.search) queryParams.append('search', params.search);
    if (params.uploader_id) queryParams.append('uploader_id', params.uploader_id);

    const response = await fetch(`${API_BASE_URL}/resources?${queryParams}`);
    return handleResponse(response);
  },

  // 获取单个资源
  getResource: async (id: string): Promise<Resource> => {
    const response = await fetch(`${API_BASE_URL}/resources/${id}`);
    const data = await handleResponse(response);
    return data.resource;
  },

  // 下载资源
  downloadResource: async (id: string): Promise<void> => {
    const response = await fetch(`${API_BASE_URL}/resources/${id}/download`, {
      method: 'POST',
      headers: getAuthHeaders()
    });

    if (!response.ok) {
      throw new Error('下载失败');
    }

    // 获取文件名
    const contentDisposition = response.headers.get('Content-Disposition');
    let filename = 'download';
    if (contentDisposition) {
      const matches = contentDisposition.match(/filename[^;=\n]*=((['"]).*?\2|[^;\n]*)/);
      if (matches && matches[1]) {
        filename = decodeURIComponent(matches[1].replace(/['"]/g, ''));
      }
    }

    // 创建下载链接
    const blob = await response.blob();
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    window.URL.revokeObjectURL(url);
    document.body.removeChild(a);
  },

  // 删除资源
  deleteResource: async (id: string): Promise<void> => {
    const response = await fetch(`${API_BASE_URL}/resources/${id}`, {
      method: 'DELETE',
      headers: getAuthHeaders()
    });
    
    await handleResponse(response);
  },

  // 一键清空所有资源 (管理员/教师专用)
  purgeAllResources: async (): Promise<void> => {
    const response = await fetch(`${API_BASE_URL}/resources/admin/purge-all`, {
      method: 'DELETE',
      headers: getAuthHeaders()
    });
    
    await handleResponse(response);
  },

  // 获取用户上传的资源
  getUserResources: async (): Promise<Resource[]> => {
    const response = await fetch(`${API_BASE_URL}/resources/user/my-resources`, {
      headers: getAuthHeaders()
    });
    
    const data = await handleResponse(response);
    return data.resources;
  }
};

// 考试API
export const examAPI = {
  // 保存考试记录
  saveExamRecord: async (examData: {
    exam_title: string;
    score: number;
    total_score: number;
    duration_minutes: number;
    questions_data: any;
    answers_data: any;
    wrong_questions: any;
  }): Promise<ExamRecord> => {
    const response = await fetch(`${API_BASE_URL}/exams/records`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(examData)
    });
    
    const data = await handleResponse(response);
    return data.record;
  },

  // 获取用户考试记录
  getUserExamRecords: async (limit: number = 20): Promise<ExamRecord[]> => {
    const response = await fetch(`${API_BASE_URL}/exams/records?limit=${limit}`, {
      headers: getAuthHeaders()
    });
    
    const data = await handleResponse(response);
    return data.records;
  },

  // 获取考试统计
  getExamStats: async (): Promise<any> => {
    const response = await fetch(`${API_BASE_URL}/exams/stats`, {
      headers: getAuthHeaders()
    });
    
    const data = await handleResponse(response);
    return data.stats;
  }
};

// 活动记录API
export const activityAPI = {
  // 记录用户活动
  logActivity: async (activityType: string, moduleName?: string, details?: any, durationSeconds?: number) => {
    try {
      const token = localStorage.getItem('auth_token');
      if (!token) return; // 未登录时不记录
      
      const response = await fetch(`${API_BASE_URL}/activities/log`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          activity_type: activityType,
          module_name: moduleName,
          details: details || {},
          duration_seconds: durationSeconds || 0
        })
      });
      
      if (!response.ok) {
        console.error('记录活动失败:', response.status);
      }
    } catch (error) {
      console.error('记录活动错误:', error);
    }
  }
};