import { User, LoginCredentials, RegisterData } from '../types';

// 模拟用户数据库
const USERS_KEY = 'pathologic_users';
const CURRENT_USER_KEY = 'pathologic_current_user';

// 获取所有用户
const getUsers = (): User[] => {
  const users = localStorage.getItem(USERS_KEY);
  return users ? JSON.parse(users) : [];
};

// 保存用户
const saveUsers = (users: User[]) => {
  localStorage.setItem(USERS_KEY, JSON.stringify(users));
};

// 生成用户ID
const generateUserId = (): string => {
  return Date.now().toString(36) + Math.random().toString(36).substr(2);
};

// 验证邮箱格式
const isValidEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

// 登录
export const login = async (credentials: LoginCredentials): Promise<{ success: boolean; user?: User; error?: string }> => {
  return new Promise((resolve) => {
    setTimeout(() => {
      const { email, password } = credentials;
      
      if (!email || !password) {
        resolve({ success: false, error: '请填写邮箱和密码' });
        return;
      }

      if (!isValidEmail(email)) {
        resolve({ success: false, error: '邮箱格式不正确' });
        return;
      }

      const users = getUsers();
      const user = users.find(u => u.email === email);

      if (!user) {
        resolve({ success: false, error: '用户不存在' });
        return;
      }

      // 在实际应用中，这里应该验证加密后的密码
      // 为了演示，我们简单比较明文密码
      if (password !== 'password123') { // 模拟密码验证
        resolve({ success: false, error: '密码错误' });
        return;
      }

      // 保存当前用户
      localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(user));
      resolve({ success: true, user });
    }, 1000); // 模拟网络延迟
  });
};

// 注册
export const register = async (data: RegisterData): Promise<{ success: boolean; user?: User; error?: string }> => {
  return new Promise((resolve) => {
    setTimeout(() => {
      const { name, email, password, confirmPassword, role, institution } = data;

      // 验证输入
      if (!name || !email || !password || !confirmPassword) {
        resolve({ success: false, error: '请填写所有必填字段' });
        return;
      }

      if (!isValidEmail(email)) {
        resolve({ success: false, error: '邮箱格式不正确' });
        return;
      }

      if (password.length < 6) {
        resolve({ success: false, error: '密码长度至少6位' });
        return;
      }

      if (password !== confirmPassword) {
        resolve({ success: false, error: '两次输入的密码不一致' });
        return;
      }

      const users = getUsers();
      
      // 检查邮箱是否已存在
      if (users.some(u => u.email === email)) {
        resolve({ success: false, error: '该邮箱已被注册' });
        return;
      }

      // 创建新用户
      const newUser: User = {
        id: generateUserId(),
        name,
        email,
        role,
        institution,
        createdAt: new Date()
      };

      users.push(newUser);
      saveUsers(users);

      // 保存当前用户
      localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(newUser));
      resolve({ success: true, user: newUser });
    }, 1000); // 模拟网络延迟
  });
};

// 登出
export const logout = (): void => {
  localStorage.removeItem(CURRENT_USER_KEY);
};

// 获取当前用户
export const getCurrentUser = (): User | null => {
  const user = localStorage.getItem(CURRENT_USER_KEY);
  return user ? JSON.parse(user) : null;
};

// 检查是否已登录
export const isAuthenticated = (): boolean => {
  return getCurrentUser() !== null;
};

// 初始化一些测试用户
export const initializeTestUsers = () => {
  const users = getUsers();
  if (users.length === 0) {
    const testUsers: User[] = [
      {
        id: 'admin1',
        name: '系统管理员',
        email: 'admin@example.com',
        role: 'admin',
        institution: '智能AI病理平台',
        createdAt: new Date()
      },
      {
        id: 'test1',
        name: '张医生',
        email: 'doctor@example.com',
        role: 'teacher',
        institution: '北京大学医学院',
        createdAt: new Date()
      },
      {
        id: 'test2',
        name: '李同学',
        email: 'student@example.com',
        role: 'student',
        institution: '清华大学医学院',
        createdAt: new Date()
      },
      {
        id: 'test3',
        name: '王研究员',
        email: 'researcher@example.com',
        role: 'researcher',
        institution: '中科院生物医学研究所',
        createdAt: new Date()
      }
    ];
    saveUsers(testUsers);
  }
};