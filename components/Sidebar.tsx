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

interface SidebarProps {
  currentView: AppView;
  onChangeView: (view: AppView) => void;
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
  user: UserType | null;
  onLogout: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ currentView, onChangeView, isOpen, setIsOpen, user, onLogout }) => {
  const baseMenuItems = [
    { id: AppView.DASHBOARD, label: '综合首页', icon: LayoutDashboard },
    { id: AppView.SLIDE_ANALYSIS, label: 'AI 阅片室', icon: Microscope },
    { id: AppView.ANATOMY, label: '3D 解剖模拟', icon: Activity },
    { id: AppView.EXAM_SYSTEM, label: '考试中心', icon: GraduationCap },
    { id: AppView.RESEARCH_ASSISTANT, label: '学术/科研', icon: BookOpen },
    { id: AppView.COLLAB_LIBRARY, label: '协同资源库', icon: Users },
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
        fixed inset-y-0 left-0 z-30 w-64 transform transition-transform duration-300 ease-out lg:translate-x-0 lg:static lg:inset-auto lg:block lg:relative
        ${isOpen ? 'translate-x-0' : '-translate-x-full'}
        flex flex-col h-full
      `}>
        <div className="h-full bg-white flex flex-col overflow-hidden">
          
          {/* Logo */}
          <div className="p-6 border-b border-gray-200">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center text-white">
                <BrainCircuit className="w-6 h-6" />
              </div>
              <div>
                <h1 className="font-bold text-sm text-gray-900">大模型病理</h1>
                <p className="text-xs text-gray-500 tracking-wider">INTELLIGENT PATHOLOGY</p>
              </div>
            </div>
          </div>

          {/* 导航菜单 */}
          <nav className="flex-1 px-3 py-6 space-y-1 overflow-y-auto">
            <p className="text-xs font-bold text-gray-700 uppercase tracking-widest px-3 mb-4">
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
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all text-sm font-medium ${
                    isActive
                      ? 'bg-blue-600 text-white'
                      : 'text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  <Icon size={20} />
                  <span>{item.label}</span>
                </button>
              );
            })}
            {user && user.role === 'admin' && (
              <>
                <p className="text-xs font-bold text-gray-700 uppercase tracking-widest px-3 mt-8 mb-4">
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
                      className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all text-sm font-medium ${
                        isActive
                          ? 'bg-blue-600 text-white'
                          : 'text-gray-700 hover:bg-gray-100'
                      }`}
                    >
                      <Icon size={20} />
                      <span>{item.label}</span>
                    </button>
                  );
                })}
              </>
            )}
          </nav>

          {/* 用户信息 */}
          <div className="p-4 border-t border-gray-200">
            <div className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-100 cursor-pointer transition-colors group">
              <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center text-gray-700">
                <User size={24} />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-bold text-gray-900 truncate">Admin 系统管理员</p>
                <p className="text-xs text-gray-500 truncate">超级管理权限</p>
              </div>
              <button
                onClick={onLogout}
                className="text-gray-500 hover:text-gray-700 transition-colors"
              >
                <LogOut size={18} />
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Sidebar;
