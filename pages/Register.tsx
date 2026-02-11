import React, { useState } from 'react';
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
      if (formData.password !== formData.confirmPassword) {
        setError('两次输入的密码不一致');
        setIsLoading(false);
        return;
      }

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
    <div className="light min-h-screen flex items-center justify-center p-4 font-sans antialiased text-slate-700" style={{
      backgroundColor: '#F5F7FA',
      backgroundImage: `
        radial-gradient(at 0% 0%, rgba(45, 92, 247, 0.03) 0px, transparent 50%),
        radial-gradient(at 100% 100%, rgba(39, 194, 76, 0.03) 0px, transparent 50%)
      `,
      minHeight: '100vh'
    }}>
      <style>{`
        .dna-pattern {
          position: absolute;
          top: 0; left: 0; right: 0; bottom: 0;
          opacity: 0.03;
          pointer-events: none;
          background-image: url("data:image/svg+xml,%3Csvg width='80' height='80' viewBox='0 0 80 80' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%232D5CF7' fill-opacity='1'%3E%3Cpath d='M40 40c0-11 9-20 20-20s20 9 20 20-9 20-20 20-20-9-20-20zm-40 0c0-11 9-20 20-20s20 9 20 20-9 20-20 20-20-9-20-20z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E");
        }
        .login-card {
          box-shadow: 0 20px 40px rgba(45, 92, 247, 0.08);
        }
        .tab-active {
          color: #2D5CF7;
          border-bottom: 2px solid #2D5CF7;
        }
      `}</style>

      <div className="dna-pattern"></div>

      <div className="relative w-full max-w-[1000px] flex flex-col md:flex-row bg-white rounded-[2rem] overflow-hidden login-card">
        {/* Left Side - Brand */}
        <div className="hidden md:flex md:w-1/2 bg-gradient-to-br from-[#2D5CF7] to-[#1a41c7] p-12 text-white flex-col justify-between relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -mr-20 -mt-20 blur-3xl"></div>
          
          <div className="z-10">
            <div className="flex items-center gap-3 mb-8">
              <div className="bg-white p-2 rounded-xl">
                <span className="text-2D5CF7 text-3xl">🧬</span>
              </div>
              <span className="text-2xl font-bold tracking-tight">智医科研平台</span>
            </div>
            <h2 className="text-4xl font-bold leading-tight mb-6">加入全球医学<br/>科研社区</h2>
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <span className="text-xl">✓</span>
                <span className="text-sm font-medium">国家级临床数据安全认证</span>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-xl">👥</span>
                <span className="text-sm font-medium">服务超过 10,000+ 顶尖医疗专家</span>
              </div>
            </div>
          </div>

          <div className="z-10 bg-white/10 backdrop-blur-md p-4 rounded-2xl border border-white/20">
            <p className="text-xs font-medium text-white/80 mb-2 uppercase tracking-widest">系统公告</p>
            <p className="text-sm leading-relaxed">2024年度医学科研课题申报通道已开启，欢迎符合条件的学者加入。</p>
          </div>
        </div>

        {/* Right Side - Form */}
        <div className="w-full md:w-1/2 p-8 md:p-12 flex flex-col justify-center">
          <div className="mb-8">
            <h1 className="text-2xl font-bold text-slate-900 mb-2">创建账号</h1>
            <p className="text-slate-500 text-sm">加入智能AI病理科研教学平台</p>
          </div>

          <div className="flex border-b border-slate-100 mb-8">
            <div className="flex-1 py-3 text-sm font-bold tab-active text-center">账号注册</div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Name */}
            <div>
              <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">姓名</label>
              <div className="relative">
                <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">person</span>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => handleInputChange('name', e.target.value)}
                  className="w-full pl-12 pr-4 py-4 bg-slate-50 border-transparent focus:border-[#2D5CF7] focus:ring-0 rounded-2xl transition-all text-slate-900 placeholder:text-slate-300"
                  placeholder="请输入姓名"
                  required
                />
              </div>
            </div>

            {/* Email */}
            <div>
              <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">邮箱地址</label>
              <div className="relative">
                <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">mail</span>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => handleInputChange('email', e.target.value)}
                  className="w-full pl-12 pr-4 py-4 bg-slate-50 border-transparent focus:border-[#2D5CF7] focus:ring-0 rounded-2xl transition-all text-slate-900 placeholder:text-slate-300"
                  placeholder="请输入邮箱地址"
                  required
                />
              </div>
            </div>

            {/* Role */}
            <div>
              <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">身份</label>
              <div className="relative">
                <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">badge</span>
                <select
                  value={formData.role}
                  onChange={(e) => handleInputChange('role', e.target.value as 'student' | 'teacher' | 'researcher')}
                  className="w-full pl-12 pr-4 py-4 bg-slate-50 border-transparent focus:border-[#2D5CF7] focus:ring-0 rounded-2xl transition-all text-slate-900"
                  required
                >
                  <option value="student">学生</option>
                  <option value="teacher">教师</option>
                  <option value="researcher">研究员</option>
                </select>
              </div>
            </div>

            {/* Institution */}
            <div>
              <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">所属机构</label>
              <div className="relative">
                <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">domain</span>
                <input
                  type="text"
                  value={formData.institution}
                  onChange={(e) => handleInputChange('institution', e.target.value)}
                  className="w-full pl-12 pr-4 py-4 bg-slate-50 border-transparent focus:border-[#2D5CF7] focus:ring-0 rounded-2xl transition-all text-slate-900 placeholder:text-slate-300"
                  placeholder="请输入所属机构（可选）"
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">密码</label>
              <div className="relative">
                <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">lock</span>
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={formData.password}
                  onChange={(e) => handleInputChange('password', e.target.value)}
                  className="w-full pl-12 pr-12 py-4 bg-slate-50 border-transparent focus:border-[#2D5CF7] focus:ring-0 rounded-2xl transition-all text-slate-900 placeholder:text-slate-300"
                  placeholder="请输入登录密码"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-[#2D5CF7]"
                >
                  <span className="material-symbols-outlined text-[20px]">{showPassword ? 'visibility_off' : 'visibility'}</span>
                </button>
              </div>
            </div>

            {/* Confirm Password */}
            <div>
              <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">确认密码</label>
              <div className="relative">
                <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">lock</span>
                <input
                  type={showConfirmPassword ? 'text' : 'password'}
                  value={formData.confirmPassword}
                  onChange={(e) => handleInputChange('confirmPassword', e.target.value)}
                  className="w-full pl-12 pr-12 py-4 bg-slate-50 border-transparent focus:border-[#2D5CF7] focus:ring-0 rounded-2xl transition-all text-slate-900 placeholder:text-slate-300"
                  placeholder="请再次输入密码"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-[#2D5CF7]"
                >
                  <span className="material-symbols-outlined text-[20px]">{showConfirmPassword ? 'visibility_off' : 'visibility'}</span>
                </button>
              </div>
            </div>

            {/* Security Notice */}
            <div className="flex items-center gap-3 p-4 bg-blue-50/50 rounded-2xl border border-blue-100">
              <span className="material-symbols-outlined text-[#2D5CF7]">shield_with_heart</span>
              <p className="text-xs text-slate-600">已启用双重验证。您的数据受行业标准 AES-256 加密保护。</p>
            </div>

            {/* Error Message */}
            {error && (
              <div className="flex items-center gap-3 p-4 bg-red-50/50 rounded-2xl border border-red-100">
                <span className="material-symbols-outlined text-red-600">error</span>
                <p className="text-xs text-red-600">{error}</p>
              </div>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-[#2D5CF7] hover:bg-blue-700 text-white font-bold py-4 rounded-2xl shadow-lg shadow-blue-500/20 transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  <span>注册中...</span>
                </>
              ) : (
                <>
                  <span>立即注册</span>
                  <span className="material-symbols-outlined">person_add</span>
                </>
              )}
            </button>
          </form>

          <div className="mt-10 text-center">
            <p className="text-sm text-slate-500">已有账号？ <button onClick={onSwitchToLogin} className="text-[#FF9800] font-bold hover:underline ml-1">立即登录</button></p>
          </div>
        </div>
      </div>

      <div className="fixed bottom-6 w-full text-center px-4">
        <div className="flex flex-wrap justify-center gap-x-6 gap-y-2 text-[11px] font-medium text-slate-400">
          <a className="hover:text-[#2D5CF7] transition-colors" href="#">平台隐私协议</a>
          <a className="hover:text-[#2D5CF7] transition-colors" href="#">科研伦理准则</a>
          <a className="hover:text-[#2D5CF7] transition-colors" href="#">技术支持专线</a>
          <span className="hidden md:inline">|</span>
          <span className="uppercase tracking-widest text-[10px]">© 2024 Smart Medical Research Systems</span>
        </div>
      </div>
    </div>
  );
};

export default Register;