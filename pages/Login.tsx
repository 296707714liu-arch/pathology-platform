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
    <html className="light" lang="zh-CN">
      <head>
        <meta charSet="utf-8" />
        <meta content="width=device-width, initial-scale=1.0" name="viewport" />
        <title>医疗研究平台 - 专业登录</title>
        <link href="https://fonts.googleapis.com" rel="preconnect" />
        <link crossOrigin="" href="https://fonts.gstatic.com" rel="preconnect" />
        <link href="https://fonts.googleapis.com/css2?family=Noto+Sans+SC:wght@300;400;500;700&display=swap" rel="stylesheet" />
        <link href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&display=swap" rel="stylesheet" />
        <script src="https://cdn.tailwindcss.com?plugins=forms,typography,container-queries"></script>
        <script>{`tailwind.config = {theme: {extend: {colors: {'med-blue': '#2D5CF7','health-green': '#27C24C','academic-orange': '#FF9800','bg-pale': '#F5F7FA',},fontFamily: {sans: ["'Noto Sans SC'", "PingFang SC", "Microsoft YaHei", "sans-serif"],},},},};`}</script>
        <style type="text/tailwindcss">{`:root {--primary: #2D5CF7;--success: #27C24C;--highlight: #FF9800;}body {background-color: #F5F7FA;background-image: radial-gradient(at 0% 0%, rgba(45, 92, 247, 0.03) 0px, transparent 50%),radial-gradient(at 100% 100%, rgba(39, 194, 76, 0.03) 0px, transparent 50%);min-height: 100vh;}.dna-pattern {position: absolute;top: 0; left: 0; right: 0; bottom: 0;opacity: 0.03;pointer-events: none;background-image: url("data:image/svg+xml,%3Csvg width='80' height='80' viewBox='0 0 80 80' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%232D5CF7' fill-opacity='1'%3E%3Cpath d='M40 40c0-11 9-20 20-20s20 9 20 20-9 20-20 20-20-9-20-20zm-40 0c0-11 9-20 20-20s20 9 20 20-9 20-20 20-20-9-20-20z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E");}.login-card {box-shadow: 0 20px 40px rgba(45, 92, 247, 0.08);}.tab-active {color: var(--primary);border-bottom: 2px solid var(--primary);}`}</style>
      </head>
      <body className="flex items-center justify-center p-4 font-sans antialiased text-slate-700">
        <div className="dna-pattern"></div>

        <div className="relative w-full max-w-[1000px] flex flex-col md:flex-row bg-white rounded-[2rem] overflow-hidden login-card">
          {/* Left Side */}
          <div className="hidden md:flex md:w-1/2 bg-gradient-to-br from-[#2D5CF7] to-[#1a41c7] p-12 text-white flex-col justify-between relative overflow-hidden">
            <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -mr-20 -mt-20 blur-3xl"></div>
            
            <div className="z-10">
              <div className="flex items-center gap-3 mb-8">
                <div className="bg-white p-2 rounded-xl">
                  <span className="material-symbols-outlined text-med-blue text-3xl">biotech</span>
                </div>
                <span className="text-2xl font-bold tracking-tight">智医科研平台</span>
              </div>
              <h2 className="text-4xl font-bold leading-tight mb-6">AI驱动的病理<br/>科研教学平台</h2>
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <span className="material-symbols-outlined text-white/80">verified</span>
                  <span className="text-sm font-medium">智能病理分析与诊断</span>
                </div>
                <div className="flex items-center gap-3">
                  <span className="material-symbols-outlined text-white/80">group</span>
                  <span className="text-sm font-medium">为医学教育与科研赋能</span>
                </div>
              </div>
            </div>

            <div className="z-10 bg-white/10 backdrop-blur-md p-4 rounded-2xl border border-white/20">
              <p className="text-xs font-medium text-white/80 mb-2 uppercase tracking-widest">平台特色</p>
              <p className="text-sm leading-relaxed">集AI分析、病理教学、科研协作于一体，助力医学专业人士提升诊疗水平。</p>
            </div>
          </div>

          {/* Right Side */}
          <div className="w-full md:w-1/2 p-8 md:p-12 flex flex-col justify-center">
            <div className="mb-8">
              <h1 className="text-2xl font-bold text-slate-900 mb-2">欢迎登录</h1>
              <p className="text-slate-500 text-sm">请输入您的凭据进入科研空间</p>
            </div>

            <div className="flex border-b border-slate-100 mb-8">
              <div className="flex-1 py-3 text-sm font-bold tab-active text-center">账号密码登录</div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Email */}
              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">手机号 / 邮箱</label>
                <div className="relative">
                  <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">person</span>
                  <input
                    type="email"
                    value={credentials.email}
                    onChange={(e) => handleInputChange('email', e.target.value)}
                    className="w-full pl-12 pr-4 py-4 bg-slate-50 border-transparent focus:border-med-blue focus:ring-0 rounded-2xl transition-all text-slate-900 placeholder:text-slate-300"
                    placeholder="请输入执业邮箱或手机"
                    required
                  />
                </div>
              </div>

              {/* Password */}
              <div>
                <div className="flex justify-between items-center mb-2">
                  <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider">密码</label>
                  <a className="text-xs font-semibold text-med-blue hover:underline" href="#">忘记密码？</a>
                </div>
                <div className="relative">
                  <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">lock</span>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={credentials.password}
                    onChange={(e) => handleInputChange('password', e.target.value)}
                    className="w-full pl-12 pr-12 py-4 bg-slate-50 border-transparent focus:border-med-blue focus:ring-0 rounded-2xl transition-all text-slate-900 placeholder:text-slate-300"
                    placeholder="请输入登录密码"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-med-blue"
                  >
                    <span className="material-symbols-outlined text-[20px]">{showPassword ? 'visibility_off' : 'visibility'}</span>
                  </button>
                </div>
              </div>

              {/* Security Notice */}
              <div className="flex items-center gap-3 p-4 bg-blue-50/50 rounded-2xl border border-blue-100">
                <span className="material-symbols-outlined text-med-blue">shield_with_heart</span>
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
                className="w-full bg-med-blue hover:bg-blue-700 text-white font-bold py-4 rounded-2xl shadow-lg shadow-blue-500/20 transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    <span>登录中...</span>
                  </>
                ) : (
                  <>
                    <span>立即登录</span>
                    <span className="material-symbols-outlined">login</span>
                  </>
                )}
              </button>
            </form>

            <div className="mt-10 text-center">
              <p className="text-sm text-slate-500">还没有账号？ <button onClick={onSwitchToRegister} className="text-academic-orange font-bold hover:underline ml-1">提交进驻申请</button></p>
            </div>
          </div>
        </div>

        <div className="fixed bottom-6 w-full text-center px-4">
          <div className="flex flex-wrap justify-center gap-x-6 gap-y-2 text-[11px] font-medium text-slate-400">
            <a className="hover:text-med-blue transition-colors" href="#">平台隐私协议</a>
            <a className="hover:text-med-blue transition-colors" href="#">科研伦理准则</a>
            <a className="hover:text-med-blue transition-colors" href="#">技术支持专线</a>
            <span className="hidden md:inline">|</span>
            <span className="uppercase tracking-widest text-[10px]">© 2024 Smart Medical Research Systems</span>
          </div>
        </div>
      </body>
    </html>
  );
};

export default Login;
