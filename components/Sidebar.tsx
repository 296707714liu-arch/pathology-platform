import React from 'react';
import {
  LayoutDashboard,
  Microscope,
  BookOpen,
  GraduationCap,
  Eye,
  Activity,
  Users,
  LogOut,
  User,
  Settings,
  BrainCircuit
} from 'lucide-react';
import { AppView, User as UserType } from '../types';
import { useTheme } from '../context/ThemeContext';

interface SidebarProps {
  currentView: AppView;
  onChangeView: (view: AppView) => void;
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
  user: UserType | null;
  onLogout: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ currentView, onChangeView, isOpen, setIsOpen, user, onLogout }) => {
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  const baseMenuItems = [
    { id: AppView.DASHBOARD, label: '综合首页', icon: LayoutDashboard },
    { id: AppView.SLIDE_ANALYSIS, label: 'AI 阅片室', icon: Microscope },
    { id: AppView.ANATOMY, label: '3D 解剖模拟', icon: Activity },
    { id: AppView.EXAM_SYSTEM, label: '考试中心', icon: GraduationCap },
    { id: AppView.RESEARCH_ASSISTANT, label: '学术/科研', icon: BookOpen },
    { id: AppView.COLLAB_LIBRARY, label: '协同资源库', icon: Users },
    { id: AppView.USER_PROFILE, label: '个人中心', icon: User },
  ];

  const adminMenuItems = [
    { id: AppView.USER_MANAGEMENT, label: '用户管理', icon: Settings },
  ];

  let menuItems = [...baseMenuItems];
  if (user && user.role === 'admin') {
    menuItems = [...baseMenuItems, ...adminMenuItems];
  }

  return (
    <>
      <div 
        className={`fixed inset-0 z-20 bg-black/20 backdrop-blur-sm transition-opacity lg:hidden ${isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
        onClick={() => setIsOpen(false)}
      />

      <div className={`
        fixed inset-y-0 left-0 z-30 w-72 transform transition-all duration-300 ease-out lg:translate-x-0 lg:static lg:inset-auto lg:block lg:relative
        ${isOpen ? 'translate-x-0' : '-translate-x-full'}
        flex flex-col h-full ${isDark ? 'bg-[#0d121f] border-slate-800' : 'bg-white/70 backdrop-blur-xl border-white/20'} border-r shadow-xl
      `}>
        {/* Logo */}
        <div className={`p-6 border-b ${isDark ? 'border-slate-800' : 'border-slate-200/50'}`}>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-[#2D5CF7] rounded-xl flex items-center justify-center text-white shadow-lg shadow-blue-500/20">
              <BrainCircuit className="w-6 h-6" />
            </div>
            <div>
              <h1 className={`font-bold text-sm ${isDark ? 'text-white' : 'text-slate-900'}`}>大模型病理</h1>
              <p className="text-[10px] text-slate-500 tracking-wider font-semibold uppercase">Intelligent Pathology</p>
            </div>
          </div>
        </div>

        {/* 导航菜单 */}
        <nav className="flex-1 px-3 py-6 space-y-1.5 overflow-y-auto">
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest px-4 mb-4">
            核心功能
          </p>
          {baseMenuItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentView === item.id;
            return (
              <button
                key={item.id}
                onClick={() => {
                  onChangeView(item.id);
                  setIsOpen(false);
                }}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-2xl transition-all text-sm font-medium group ${
                  isActive
                    ? 'bg-[#2D5CF7] text-white shadow-lg shadow-blue-500/25'
                    : isDark 
                      ? 'text-slate-400 hover:bg-white/5 hover:text-white'
                    : 'text-slate-700 hover:bg-white/50 hover:text-[#2D5CF7]'
                }`}
              >
                <Icon size={20} className={isActive ? 'text-white' : isDark ? 'text-slate-500 group-hover:text-white' : 'text-slate-400 group-hover:text-[#2D5CF7]'} />
                <span>{item.label}</span>
              </button>
            );
          })}
          {user && user.role === 'admin' && (
            <>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest px-4 mt-8 mb-4">
                系统管理
              </p>
              {adminMenuItems.map((item) => {
                const Icon = item.icon;
                const isActive = currentView === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => {
                      onChangeView(item.id);
                      setIsOpen(false);
                    }}
                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-2xl transition-all text-sm font-medium group ${
                      isActive
                        ? 'bg-[#2D5CF7] text-white shadow-lg shadow-blue-500/25'
                        : isDark 
                          ? 'text-slate-400 hover:bg-white/5 hover:text-white'
                        : 'text-slate-700 hover:bg-white/50 hover:text-[#2D5CF7]'
                    }`}
                  >
                    <Icon size={20} className={isActive ? 'text-white' : isDark ? 'text-slate-500 group-hover:text-white' : 'text-slate-400 group-hover:text-[#2D5CF7]'} />
                    <span>{item.label}</span>
                  </button>
                );
              })}
            </>
          )}
        </nav>

        {/* 用户信息 */}
        <div className={`p-4 border-t ${isDark ? 'border-slate-800' : 'border-slate-200/50'}`}>
          <div className={`flex items-center gap-3 p-3 rounded-2xl ${isDark ? 'hover:bg-white/5 border-transparent hover:border-slate-700' : 'hover:bg-white/50 border-transparent hover:border-white/40'} cursor-pointer transition-all group border`}>
            <div className={`w-10 h-10 rounded-xl ${isDark ? 'bg-slate-800 text-slate-400 border-slate-700' : 'bg-slate-100 text-slate-600 border-slate-200'} flex items-center justify-center group-hover:border-[#2D5CF7]/30 transition-colors border`}>
              <User size={22} />
            </div>
            <div className="flex-1 min-w-0">
              <p className={`text-sm font-bold ${isDark ? 'text-white' : 'text-slate-900'} truncate`}>
                {user?.name || '管理员'}
              </p>
              <p className="text-[10px] text-slate-500 truncate font-medium uppercase tracking-wider">
                {user?.role === 'admin' ? '系统管理员' : 
                 user?.role === 'teacher' ? '教师权限' : 
                 user?.role === 'researcher' ? '研究员' : 
                 user?.role === 'student' ? '学生' : '普通用户'}
              </p>
            </div>
            <button
              onClick={onLogout}
              className="text-slate-400 hover:text-red-500 transition-colors p-1.5 hover:bg-red-50 rounded-lg"
              title="退出登录"
            >
              <LogOut size={18} />
            </button>
          </div>
        </div>
      </div>
    </>
  );
};

export default Sidebar;
