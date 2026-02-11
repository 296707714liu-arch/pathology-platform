import React, { useState } from 'react';
import { Lock, Key, CheckCircle, AlertCircle, ArrowLeft } from 'lucide-react';
import { authAPI } from '../services/apiService';

interface ChangePasswordProps {
  onBack: () => void;
}

const ChangePassword: React.FC<ChangePasswordProps> = ({ onBack }) => {
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const validatePasswords = () => {
    if (!currentPassword || !newPassword || !confirmPassword) {
      setError('请填写所有必填字段');
      return false;
    }

    if (newPassword !== confirmPassword) {
      setError('新密码和确认密码不一致');
      return false;
    }

    if (newPassword.length < 8) {
      setError('新密码长度不能少于8个字符');
      return false;
    }

    if (newPassword === currentPassword) {
      setError('新密码不能与当前密码相同');
      return false;
    }

    return true;
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!validatePasswords()) {
      return;
    }

    setIsLoading(true);
    try {
      await authAPI.changePassword(currentPassword, newPassword);
      setSuccess(true);
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (err: any) {
      setError(err.message || '修改密码失败，请稍后重试');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-100 p-6">
      <div className="max-w-md mx-auto">
        {/* 返回按钮和页面标题 */}
        <div className="mb-8">
          <div className="flex items-center mb-4">
            <button
              onClick={onBack}
              className="mr-4 p-2 rounded-lg hover:bg-gray-100 transition-colors"
              aria-label="返回"
            >
              <ArrowLeft className="w-6 h-6 text-gray-700" />
            </button>
            <div className="w-12 h-12 bg-gray-900 rounded-xl flex items-center justify-center mr-4">
              <Lock className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-800">修改密码</h1>
              <p className="text-gray-600">安全修改您的账户密码</p>
            </div>
          </div>
        </div>

        {/* 密码修改表单 */}
        <div className="bg-white rounded-xl shadow-md border border-gray-200 overflow-hidden">
          <div className="p-6">
            {success && (
              <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg flex items-center">
                <CheckCircle className="w-5 h-5 text-green-600 mr-3" />
                <p className="text-green-700">密码修改成功！</p>
              </div>
            )}

            {error && (
              <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-center">
                <AlertCircle className="w-5 h-5 text-red-600 mr-3" />
                <p className="text-red-700">{error}</p>
              </div>
            )}

            <form onSubmit={handleChangePassword} className="space-y-6">
              {/* 当前密码 */}
              <div>
                <label htmlFor="currentPassword" className="block text-sm font-medium text-gray-700 mb-1">
                  当前密码
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Key className="w-5 h-5 text-gray-400" />
                  </div>
                  <input
                    type="password"
                    id="currentPassword"
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    disabled={isLoading}
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                    placeholder="输入当前密码"
                  />
                </div>
              </div>

              {/* 新密码 */}
              <div>
                <label htmlFor="newPassword" className="block text-sm font-medium text-gray-700 mb-1">
                  新密码
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Lock className="w-5 h-5 text-gray-400" />
                  </div>
                  <input
                    type="password"
                    id="newPassword"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    disabled={isLoading}
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                    placeholder="输入新密码（至少8个字符）"
                  />
                </div>
              </div>

              {/* 确认密码 */}
              <div>
                <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-1">
                  确认新密码
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Lock className="w-5 h-5 text-gray-400" />
                  </div>
                  <input
                    type="password"
                    id="confirmPassword"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    disabled={isLoading}
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                    placeholder="再次输入新密码"
                  />
                </div>
              </div>

              {/* 提交按钮 */}
              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-3 px-4 bg-gray-900 text-white rounded-lg hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 flex items-center justify-center font-medium"
              >
                {isLoading ? (
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                ) : (
                  <Lock className="w-5 h-5 mr-2" />
                )}
                {isLoading ? '修改中...' : '确认修改'}
              </button>
            </form>
          </div>

          {/* 密码强度提示 */}
          <div className="bg-gray-50 p-4 border-t border-gray-200">
            <h3 className="text-sm font-medium text-gray-700 mb-2">密码安全提示：</h3>
            <ul className="text-xs text-gray-600 space-y-1">
              <li className="flex items-center">
                <span className="w-1.5 h-1.5 bg-gray-400 rounded-full mr-2"></span>
                密码长度至少8个字符
              </li>
              <li className="flex items-center">
                <span className="w-1.5 h-1.5 bg-gray-400 rounded-full mr-2"></span>
                包含大小写字母、数字和特殊字符
              </li>
              <li className="flex items-center">
                <span className="w-1.5 h-1.5 bg-gray-400 rounded-full mr-2"></span>
                不要使用常见密码或个人信息
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChangePassword;