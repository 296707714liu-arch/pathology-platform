import React, { useState } from 'react';
import { LoginCredentials, User } from '../types';

interface LoginProps {
  onLogin: (credentials: LoginCredentials) => Promise<{ success: boolean; user?: User; error?: string }>;
  onSwitchToRegister: () => void;
}

const Login: React.FC<LoginProps> = ({ onLogin, onSwitchToRegister }) => {
  const [credentials, setCredentials] = useState<LoginCredentials>({
    email: '',
    password: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      const result = await onLogin(credentials);
      if (!result.success) {
        setError(result.error || '登录失败');
      }
    } catch (err) {
      setError('网络错误，请稍后重试');
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (field: keyof LoginCredentials, value: string) => {
    setCredentials(prev => ({ ...prev, [field]: value }));
    if (error) setError('');
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center p-4" style={{
      backgroundColor: '#F5F7FA',
      backgroundImage: `
        radial-gradient(at 0% 0%, rgba(45, 92, 247, 0.03) 0px, transparent 50%),
        radial-gradient(at 100% 100%, rgba(39, 194, 76, 0.03) 0px, transparent 50%)
      `
    }}>
      <div className="w-full max-w-[1000px] flex flex-col md:flex-row bg-white rounded-[2rem] overflow-hidden" style={{
        boxShadow: '0 20px 40px rgba(45, 92, 247, 0.08)'
      }}>
        {/* Left Side - Brand */}
        <div className="hidden md:flex md:w-1/2 bg-gradient-to-br from-[#2D5CF7] to-[#1a41c7] p-8 md:p-12 text-white flex-col justify-between relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -mr-20 -mt-20 blur-3xl"></div>
          
          <div className="z-10">
            <div className="flex items-center gap-3 mb-8">
              <div className="bg-white p-2 rounded-xl">
                <span style={{fontSize: '24px'}}>🧬</span>
              </div>
              <span className="text-xl md:text-2xl font-bold tracking-tight">大模型病理平台</span>
            </div>
            <h2 className="text-3xl md:text-4xl font-bold leading-tight mb-6">探索病理<br/>从这里开始</h2>
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <span style={{fontSize: '20px'}}>✓</span>
                <span className="text-sm font-medium">基于大模型的病理分析</span>
              </div>
              <div className="flex items-center gap-3">
                <span style={{fontSize: '20px'}}>👥</span>
                <span className="text-sm font-medium">为学生和教师提供学习平台</span>
              </div>
            </div>
          </div>

          <div className="z-10 bg-white/10 backdrop-blur-md p-4 rounded-2xl border border-white/20">
            <p className="text-xs font-medium text-white/80 mb-2 uppercase tracking-widest">关于平台</p>
            <p className="text-sm leading-relaxed">一个为病理学习而生的平台，结合大模型技术，让病理教学更直观、更有趣。</p>
          </div>
        </div>

        {/* Right Side - Form */}
        <div className="w-full md:w-1/2 p-6 md:p-12 flex flex-col justify-center">
          <div className="mb-8">
            <h1 className="text-2xl md:text-3xl font-bold text-slate-900 mb-2">欢迎登录</h1>
            <p className="text-slate-500 text-sm">请输入您的凭据进入学习空间</p>
          </div>

          <div className="flex border-b border-slate-100 mb-8">
            <div className="flex-1 py-3 text-sm font-bold text-center" style={{color: '#2D5CF7', borderBottom: '2px solid #2D5CF7'}}>账号密码登录</div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Email */}
            <div>
              <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">邮箱地址</label>
              <div className="relative">
                <span style={{position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', fontSize: '20px'}}>👤</span>
                <input
                  type="email"
                  value={credentials.email}
                  onChange={(e) => handleInputChange('email', e.target.value)}
                  className="w-full pl-12 pr-4 py-4 bg-slate-50 rounded-2xl transition-all text-slate-900 placeholder:text-slate-300 focus:outline-none focus:ring-2 focus:ring-[#2D5CF7]"
                  placeholder="请输入邮箱地址"
                  required
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <div className="flex justify-between items-center mb-2">
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider">密码</label>
                <a className="text-xs font-semibold text-[#2D5CF7] hover:underline" href="#">忘记密码？</a>
              </div>
              <div className="relative">
                <span style={{position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', fontSize: '20px'}}>🔒</span>
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={credentials.password}
                  onChange={(e) => handleInputChange('password', e.target.value)}
                  className="w-full pl-12 pr-12 py-4 bg-slate-50 rounded-2xl transition-all text-slate-900 placeholder:text-slate-300 focus:outline-none focus:ring-2 focus:ring-[#2D5CF7]"
                  placeholder="请输入登录密码"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-[#2D5CF7] text-xl"
                >
                  {showPassword ? '👁️' : '👁️‍🗨️'}
                </button>
              </div>
            </div>

            {/* Security Notice */}
            <div className="flex items-center gap-3 p-4 bg-blue-50/50 rounded-2xl border border-blue-100">
              <span style={{fontSize: '20px'}}>🛡️</span>
              <p className="text-xs text-slate-600">已启用双重验证。您的数据受行业标准 AES-256 加密保护。</p>
            </div>

            {/* Error Message */}
            {error && (
              <div className="flex items-center gap-3 p-4 bg-red-50/50 rounded-2xl border border-red-100">
                <span style={{fontSize: '20px'}}>⚠️</span>
                <p className="text-xs text-red-600">{error}</p>
              </div>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-[#2D5CF7] hover:bg-blue-700 text-white font-bold py-4 rounded-2xl shadow-lg transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
              style={{boxShadow: '0 10px 25px rgba(45, 92, 247, 0.2)'}}
            >
              {isLoading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  <span>登录中...</span>
                </>
              ) : (
                <>
                  <span>立即登录</span>
                  <span style={{fontSize: '18px'}}>🔓</span>
                </>
              )}
            </button>
          </form>

          <div className="mt-10 text-center">
            <p className="text-sm text-slate-500">还没有账号？ <button onClick={onSwitchToRegister} className="text-[#FF9800] font-bold hover:underline">立即注册</button></p>
          </div>
        </div>
      </div>

      <div className="fixed bottom-4 md:bottom-6 w-full text-center px-4">
        <div className="flex flex-wrap justify-center gap-x-4 md:gap-x-6 gap-y-2 text-[10px] md:text-[11px] font-medium text-slate-400">
          <a className="hover:text-[#2D5CF7] transition-colors" href="#">隐私协议</a>
          <a className="hover:text-[#2D5CF7] transition-colors" href="#">使用条款</a>
          <a className="hover:text-[#2D5CF7] transition-colors" href="#">技术支持</a>
          <span className="hidden md:inline">|</span>
          <span className="uppercase tracking-widest text-[9px] md:text-[10px]">© 2024 Pathology Platform</span>
        </div>
      </div>
    </div>
  );
};

export default Login;
