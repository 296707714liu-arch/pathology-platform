import React, { useState } from 'react';
import {
  Visibility,
  VisibilityOff,
  Mail,
  Lock,
  Person,
  Business,
  PersonAdd
} from '@mui/icons-material';
import { RegisterData, User as UserType } from '../types';

interface RegisterProps {
  onRegister: (userData: RegisterData) => Promise<{ success: boolean; user?: UserType; error?: string }>;
  onSwitchToLogin: () => void;
}

const Register: React.FC<RegisterProps> = ({ onRegister, onSwitchToLogin }) => {
  const [formData, setFormData] = useState<RegisterData>({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    role: 'student',
    institution: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      const result = await onRegister(formData);
      if (!result.success) {
        setError(result.error || '注册失败');
      }
    } catch (err) {
      setError('网络错误，请稍后重试');
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (field: keyof RegisterData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (error) setError('');
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-4 py-8">
      <div className="max-w-md w-full space-y-8">
        {/* Logo and Title */}
        <div className="text-center">
          <div className="mx-auto h-16 w-16 bg-primary rounded-lg flex items-center justify-center mb-4 shadow-lg">
            <PersonAdd className="h-8 w-8 text-white" />
          </div>
          <h2 className="text-3xl font-bold text-text mb-2">创建账号</h2>
          <p className="text-text-secondary">加入智能AI病理科研教学平台</p>
        </div>

        {/* Register Form */}
        <div className="glass-container p-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Name Input */}
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-text mb-2">
                姓名 *
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Person className="h-5 w-5 text-text-secondary" />
                </div>
                <input
                  id="name"
                  type="text"
                  value={formData.name}
                  onChange={(e) => handleInputChange('name', e.target.value)}
                  className="block w-full pl-10 pr-3 py-3 border border-border bg-background/50 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all duration-250"
                  placeholder="请输入姓名"
                  required
                />
              </div>
            </div>

            {/* Email Input */}
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-text mb-2">
                邮箱地址 *
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Mail className="h-5 w-5 text-text-secondary" />
                </div>
                <input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => handleInputChange('email', e.target.value)}
                  className="block w-full pl-10 pr-3 py-3 border border-border bg-background/50 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all duration-250"
                  placeholder="请输入邮箱地址"
                  required
                />
              </div>
            </div>

            {/* Role Selection */}
            <div>
              <label htmlFor="role" className="block text-sm font-medium text-text mb-2">
                身份 *
              </label>
              <select
                id="role"
                value={formData.role}
                onChange={(e) => handleInputChange('role', e.target.value as 'student' | 'teacher' | 'researcher')}
                className="block w-full px-3 py-3 border border-border bg-background/50 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all duration-250"
                required
              >
                <option value="student">学生</option>
                <option value="teacher">教师</option>
                <option value="researcher">研究员</option>
              </select>
            </div>

            {/* Institution Input */}
            <div>
              <label htmlFor="institution" className="block text-sm font-medium text-text mb-2">
                所属机构
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Business className="h-5 w-5 text-text-secondary" />
                </div>
                <input
                  id="institution"
                  type="text"
                  value={formData.institution}
                  onChange={(e) => handleInputChange('institution', e.target.value)}
                  className="block w-full pl-10 pr-3 py-3 border border-border bg-background/50 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all duration-250"
                  placeholder="请输入所属机构（可选）"
                />
              </div>
            </div>

            {/* Password Input */}
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-text mb-2">
                密码 *
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-text-secondary" />
                </div>
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  value={formData.password}
                  onChange={(e) => handleInputChange('password', e.target.value)}
                  className="block w-full pl-10 pr-12 py-3 border border-border bg-background/50 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all duration-250"
                  placeholder="请输入密码（至少6位）"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center hover:text-primary transition-colors"
                >
                  {showPassword ? (
                    <VisibilityOff className="h-5 w-5 text-text-secondary hover:text-primary" />
                  ) : (
                    <Visibility className="h-5 w-5 text-text-secondary hover:text-primary" />
                  )}
                </button>
              </div>
            </div>

            {/* Confirm Password Input */}
            <div>
              <label htmlFor="confirmPassword" className="block text-sm font-medium text-text mb-2">
                确认密码 *
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-text-secondary" />
                </div>
                <input
                  id="confirmPassword"
                  type={showConfirmPassword ? 'text' : 'password'}
                  value={formData.confirmPassword}
                  onChange={(e) => handleInputChange('confirmPassword', e.target.value)}
                  className="block w-full pl-10 pr-12 py-3 border border-border bg-background/50 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all duration-250"
                  placeholder="请再次输入密码"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center hover:text-primary transition-colors"
                >
                  {showConfirmPassword ? (
                    <VisibilityOff className="h-5 w-5 text-text-secondary hover:text-primary" />
                  ) : (
                    <Visibility className="h-5 w-5 text-text-secondary hover:text-primary" />
                  )}
                </button>
              </div>
            </div>

            {/* Error Message */}
            {error && (
              <div className="bg-red-50/50 border border-red-200/50 rounded-lg p-3">
                <p className="text-red-600 text-sm">{error}</p>
              </div>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full flex justify-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-primary hover:bg-primary/90 hover:shadow-md focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-250"
            >
              {isLoading ? (
                <div className="flex items-center">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  注册中...
                </div>
              ) : (
                <div className="flex items-center">
                  <PersonAdd className="h-4 w-4 mr-2" />
                  注册
                </div>
              )}
            </button>
          </form>

          {/* Switch to Login */}
          <div className="mt-6 text-center">
            <p className="text-text-secondary text-sm">
              已有账号？{' '}
              <button
                onClick={onSwitchToLogin}
                className="font-medium text-primary hover:text-primary/90 transition-colors"
              >
                立即登录
              </button>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Register;