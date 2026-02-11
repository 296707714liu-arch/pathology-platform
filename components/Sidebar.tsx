import React from 'react';
import {
  LayoutDashboard,
  Microscope,
  BookOpen,
  GraduationCap,
  X,
  Eye,
  Activity,
  BarChart3,
  Database,
  Users,
  LogOut,
  User,
  Settings,
  Sun,
  Moon,
  Menu
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
  // 使用主题上下文
  const { theme, toggleTheme } = useTheme();
  
  const baseMenuItems = [
    { id: AppView.DASHBOARD, label: '探索首页', icon: LayoutDashboard },
    { id: AppView.SLIDE_ANALYSIS, label: 'AI 阅片室', icon: Microscope },
    { id: AppView.QUANTIFICATION, label: '细胞计数', icon: Eye },
    { id: AppView.RESEARCH_ASSISTANT, label: '学术/科研', icon: BookOpen },
    { id: AppView.ANATOMY, label: '3D 解剖', icon: Activity },
    { id: AppView.COLLAB_LIBRARY, label: '协同资源库', icon: Users },
    { id: AppView.EXAM_SYSTEM, label: '考试中心', icon: GraduationCap },
  ];

  // 管理员菜单项
  const adminMenuItems = [
    { id: AppView.USER_MANAGEMENT, label: '用户管理', icon: Settings },
  ];

  // 个人菜单项
  const personalMenuItems = [
    { id: AppView.USER_PROFILE, label: '个人中心', icon: User },
  ];

  // 根据用户角色决定显示的菜单项
  let menuItems = [...baseMenuItems, ...personalMenuItems];
  if (user && user.role === 'admin') {
    menuItems = [...baseMenuItems, ...adminMenuItems, ...personalMenuItems];
  }

  return (
    <>
      <div 
        className={`fixed inset-0 z-20 bg-black/20 backdrop-blur-sm transition-opacity lg:hidden ${isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
        onClick={() => setIsOpen(false)}
      />

      <div className={`
        fixed inset-y-0 left-0 z-30 w-72 transform transition-transform duration-300 ease-out lg:translate-x-0 lg:static lg:inset-auto lg:block lg:relative
        ${isOpen ? 'translate-x-0' : '-translate-x-full'}
        p-0 flex flex-col h-full
      `}>
        <div className="h-full bg-white border border-gray-200 shadow-sm flex flex-col overflow-hidden p-4">
          
          <div className="flex items-center justify-between h-20 px-6 border-b border-gray-100">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-gray-900 rounded-lg flex items-center justify-center">
                <Activity className="w-5 h-5 text-white" />
              </div>
              <div>
                <span className="text-lg font-semibold text-gray-900">
                  智能AI病理
                </span>
                <span className="block text-[10px] text-gray-500 font-medium tracking-wider uppercase">科研教学平台</span>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button onClick={() => setIsOpen(false)} className="lg:hidden text-gray-400 hover:text-gray-600 hover:bg-gray-50 rounded-lg transition-colors p-2">
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          <nav className="p-4 space-y-1 flex-1 overflow-y-auto scrollbar-hide">
            {menuItems.map((item) => {
              const Icon = item.icon;
              const isActive = currentView === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => {
                    onChangeView(item.id);
                    setIsOpen(false);
                  }}
                  className={`relative flex items-center w-full px-3 py-2.5 rounded-lg transition-all duration-200 ${isActive ? 'bg-gray-900 text-white' : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'}`}
                >
                  <Icon className={`w-5 h-5 mr-3 ${isActive ? 'text-white' : 'text-gray-400'}`} />
                  <span className="font-medium text-sm">{item.label}</span>
                </button>
              );
            })}
          </nav>

          <div className="p-4 space-y-3 border-t border-gray-100">
            {/* User Info */}
            {user && (
              <div className="bg-gray-50 rounded-lg p-3 border border-gray-100">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-gray-900 rounded-full flex items-center justify-center">
                      <User className="w-4 h-4 text-white" />
                    </div>
                    <div>
                      <h4 className="text-sm font-medium text-gray-900">{user.name}</h4>
                      <p className="text-xs text-gray-500">
                        {user.role === 'student' ? '学生' : user.role === 'teacher' ? '教师' : '研究员'}
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={onLogout}
                    className="p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-all duration-200"
                    title="退出登录"
                  >
                    <LogOut className="w-4 h-4" />
                  </button>
                </div>
                {user.institution && (
                  <p className="text-xs text-gray-400 mt-2 truncate">{user.institution}</p>
                )}
              </div>
            )}

            {/* AI Status */}
            <div className="bg-gray-50 rounded-lg p-3 border border-gray-100">
              <div>
                <h4 className="text-xs font-medium text-gray-600 mb-1 flex items-center">
                  <span className="w-2 h-2 bg-green-500 rounded-full mr-2"></span>
                  AI 状态正常
                </h4>
                <p className="text-[10px] text-gray-400 font-medium">
                  AI 助手
                  <span className="block mt-1 text-gray-500">状态: 正常</span>
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Sidebar;