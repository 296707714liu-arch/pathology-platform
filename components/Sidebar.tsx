import React, { useState } from 'react';
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
  BrainCircuit,
  Search,
  ChevronRight
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
  const [searchQuery, setSearchQuery] = useState('');
  
  const baseMenuItems = [
    { id: AppView.DASHBOARD, label: '探索首页', icon: LayoutDashboard },
    { id: AppView.SLIDE_ANALYSIS, label: 'AI 阅片室', icon: Microscope },
    { id: AppView.QUANTIFICATION, label: '细胞计数', icon: Eye },
    { id: AppView.RESEARCH_ASSISTANT, label: '学术/科研', icon: BookOpen },
    { id: AppView.ANATOMY, label: '3D 解剖', icon: Activity },
    { id: AppView.COLLAB_LIBRARY, label: '协同资源库', icon: Users },
    { id: AppView.EXAM_SYSTEM, label: '考试中心', icon: GraduationCap },
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
        <div className="h-full bg-gradient-to-b from-blue-600 to-blue-700 flex flex-col overflow-hidden">
          
          {/* Logo */}
          <div className="p-6 border-b border-blue-500/30">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center text-white backdrop-blur-sm">
                <BrainCircuit className="w-6 h-6" />
              </div>
              <div>
                <h1 className="font-bold text-sm text-white">智医AI诊疗</h1>
                <p className="text-xs text-blue-100 tracking-wider">MEDICAL AI CORE</p>
              </div>
            </div>
          </div>

          {/* 搜索框 */}
          <div className="px-4 py-4 border-b border-blue-500/30">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-blue-100" size={18} />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="快速搜索..."
                className="w-full bg-white/10 border border-white/20 rounded-lg py-2 pl-10 pr-4 text-sm text-white placeholder-blue-100 focus:outline-none focus:ring-2 focus:ring-white/30 focus:border-white/40 transition-all backdrop-blur-sm"
              />
            </div>
          </div>

          {/* 导航菜单 */}
          <nav className="flex-1 px-3 py-6 space-y-1 overflow-y-auto">
            <p className="text-xs font-bold text-blue-100 uppercase tracking-widest px-3 mb-4 opacity-70">
              核心功能
            </p>
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
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all text-sm font-medium ${
                    isActive
                      ? 'bg-white/20 text-white shadow-lg backdrop-blur-sm'
                      : 'text-blue-100 hover:bg-white/10'
                  }`}
                >
                  <Icon size={20} />
                  <span>{item.label}</span>
                </button>
              );
            })}
          </nav>

          {/* 用户信息 */}
          <div className="p-4 border-t border-blue-500/30">
            <div className="flex items-center gap-3 p-3 rounded-lg hover:bg-white/10 cursor-pointer transition-colors group">
              <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center text-white flex-shrink-0 backdrop-blur-sm">
                <User size={24} />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-bold text-white truncate">Admin 系统管理员</p>
                <p className="text-xs text-blue-100 truncate">超级管理权限</p>
              </div>
              <button
                onClick={onLogout}
                className="text-blue-100 hover:text-white transition-colors"
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
