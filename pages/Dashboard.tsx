import React, { useState } from 'react';
import {
  LayoutGrid,
  Microscope,
  Layers,
  BookOpen,
  Eye,
  Users,
  Settings,
  UserCircle,
  LogOut,
  BrainCircuit,
  ChevronRight,
  Search,
  Zap,
  BarChart3
} from 'lucide-react';
import { AppView } from '../types';

interface DashboardProps {
  onChangeView: (view: AppView) => void;
}

// --- 子组件: 功能菜单项 ---
const MenuItem = ({ icon: Icon, label, active = false, onClick }: any) => (
  <button
    onClick={onClick}
    className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all text-sm font-medium ${
      active
        ? 'bg-blue-600 text-white'
        : 'text-slate-600 hover:bg-slate-100'
    }`}
  >
    <Icon size={20} />
    <span>{label}</span>
  </button>
);

// --- 子组件: 功能卡片 ---
const FeatureCard = ({
  icon: Icon,
  iconColor,
  title,
  description,
  status,
  hasButton = false,
  onClick
}: any) => (
  <div
    onClick={onClick}
    className="bg-white rounded-2xl p-6 border border-slate-100 hover:shadow-lg transition-all cursor-pointer group"
  >
    <div className="flex items-start justify-between mb-4">
      <div className={`w-12 h-12 rounded-lg ${iconColor} flex items-center justify-center group-hover:scale-110 transition-transform`}>
        <Icon className="text-white" size={28} />
      </div>
    </div>

    <h3 className="text-lg font-bold text-slate-900 mb-2 group-hover:text-blue-600 transition-colors">
      {title}
    </h3>
    <p className="text-sm text-slate-600 leading-relaxed mb-4">
      {description}
    </p>

    <div className="flex items-center justify-between">
      {hasButton && (
        <button
          onClick={(e) => {
            e.stopPropagation();
            onClick?.();
          }}
          className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg text-sm font-medium flex items-center gap-2 transition-colors"
        >
          进入系统 <ChevronRight size={16} />
        </button>
      )}
      {status && (
        <div className="flex items-center gap-2 text-xs font-medium">
          <span className={`w-2 h-2 rounded-full ${status === '运行中' ? 'bg-green-500' : 'bg-slate-300'}`}></span>
          <span className={status === '运行中' ? 'text-green-600' : 'text-slate-500'}>
            {status}
          </span>
        </div>
      )}
    </div>
  </div>
);

// --- 子组件: 资讯卡片 ---
const NewsCard = ({ tag, tagColor, time, title, summary }: any) => (
  <div className="bg-white rounded-2xl p-5 border border-slate-100 hover:shadow-md transition-all cursor-pointer group">
    <div className="flex items-center justify-between mb-3">
      <span className={`text-xs font-bold px-2 py-1 rounded ${tagColor}`}>
        {tag}
      </span>
      <span className="text-xs text-slate-400">{time}</span>
    </div>
    <h4 className="text-sm font-bold text-slate-900 mb-2 line-clamp-2 group-hover:text-blue-600 transition-colors">
      {title}
    </h4>
    <p className="text-xs text-slate-500 line-clamp-2">
      {summary}
    </p>
  </div>
);

// --- 主页面组件 ---
const Dashboard: React.FC<DashboardProps> = ({ onChangeView }) => {
  const [searchQuery, setSearchQuery] = useState('');

  const handleLogout = () => {
    localStorage.removeItem('auth_token');
    onChangeView(AppView.LOGIN);
  };

  return (
    <div className="flex min-h-screen bg-slate-50">
      {/* 第一个侧边栏 - 深色背景 */}
      <aside className="w-48 bg-slate-900 text-white flex flex-col sticky top-0 h-screen">
        {/* Logo */}
        <div className="p-6 border-b border-slate-800">
          <div className="flex items-center gap-2 mb-2">
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
              <BarChart3 size={20} />
            </div>
            <div>
              <h1 className="font-bold text-sm">智能AI病理</h1>
              <p className="text-xs text-slate-400">科研教学平台</p>
            </div>
          </div>
        </div>

        {/* 核心功能标签 */}
        <div className="px-6 py-4">
          <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-3">
            核心功能
          </p>
        </div>

        {/* 空白区域 */}
        <div className="flex-1"></div>

        {/* 用户信息 */}
        <div className="p-4 border-t border-slate-800">
          <div className="flex items-center gap-3 p-2 rounded-lg hover:bg-slate-800 cursor-pointer transition-colors">
            <div className="w-10 h-10 rounded-full bg-orange-500 flex items-center justify-center text-white flex-shrink-0">
              <UserCircle size={24} />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-bold truncate">Admin 系统管理员</p>
              <p className="text-[10px] text-slate-400 truncate">超级管理权限</p>
            </div>
          </div>
        </div>
      </aside>

      {/* 第二个侧边栏 - 浅色背景 */}
      <aside className="w-56 bg-white border-r border-slate-200 flex flex-col sticky top-0 h-screen">
        {/* Logo */}
        <div className="p-6 border-b border-slate-100">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center text-white">
              <BrainCircuit size={24} />
            </div>
            <div>
              <h1 className="font-bold text-sm text-slate-900">大模型病理</h1>
              <p className="text-xs text-slate-400">教学平台</p>
            </div>
          </div>
        </div>

        {/* 导航菜单 */}
        <nav className="flex-1 px-3 py-6 space-y-1 overflow-y-auto">
          <p className="text-xs font-bold text-slate-400 uppercase tracking-widest px-3 mb-4">
            核心功能
          </p>
          <MenuItem
            icon={LayoutGrid}
            label="探索首页"
            active
          />
          <MenuItem
            icon={Microscope}
            label="AI 阅片室"
            onClick={() => onChangeView(AppView.SLIDE_ANALYSIS)}
          />
          <MenuItem
            icon={Eye}
            label="细胞计数"
            onClick={() => onChangeView(AppView.QUANTIFICATION)}
          />
          <MenuItem
            icon={BookOpen}
            label="学术/科研"
            onClick={() => onChangeView(AppView.RESEARCH_ASSISTANT)}
          />
          <MenuItem
            icon={Layers}
            label="3D 解剖"
            onClick={() => onChangeView(AppView.ANATOMY)}
          />
          <MenuItem
            icon={BookOpen}
            label="考试中心"
            onClick={() => onChangeView(AppView.EXAM_SYSTEM)}
          />
          <MenuItem
            icon={Users}
            label="协同资源库"
            onClick={() => onChangeView(AppView.COLLAB_LIBRARY)}
          />

          <p className="text-xs font-bold text-slate-400 uppercase tracking-widest px-3 mt-8 mb-4">
            系统管理
          </p>
          <MenuItem
            icon={Settings}
            label="用户管理"
            onClick={() => onChangeView(AppView.USER_MANAGEMENT)}
          />
        </nav>

        {/* 用户信息 */}
        <div className="p-4 border-t border-slate-100">
          <div className="flex items-center gap-3 p-3 rounded-lg hover:bg-slate-50 cursor-pointer transition-colors group">
            <div className="w-10 h-10 rounded-full bg-orange-100 flex items-center justify-center text-orange-600 flex-shrink-0">
              <UserCircle size={24} />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-bold text-slate-900 truncate">Admin 系统管理员</p>
              <p className="text-xs text-slate-400 truncate">超级管理权限</p>
            </div>
            <button
              onClick={handleLogout}
              className="text-slate-400 hover:text-slate-600 transition-colors"
            >
              <LogOut size={18} />
            </button>
          </div>
        </div>
      </aside>

      {/* 右侧主内容区 */}
      <main className="flex-1 overflow-y-auto">
        {/* 顶部导航栏 */}
        <div className="bg-white border-b border-slate-200 sticky top-0 z-10">
          <div className="px-8 py-4 flex items-center justify-between">
            <div className="text-sm text-slate-600 flex items-center gap-2">
              <span>首页</span>
              <ChevronRight size={14} />
              <span className="text-slate-900 font-medium">仪表盘</span>
            </div>
            <div className="flex items-center gap-4">
              <div className="relative w-64">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="快速搜索模块或文档..."
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg py-2 pl-10 pr-4 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all placeholder-slate-400"
                />
              </div>
            </div>
          </div>
        </div>

        {/* 主内容 */}
        <div className="p-8">
          {/* 欢迎语 */}
          <div className="mb-8">
            <h2 className="text-3xl font-bold text-slate-900 mb-2">
              令天想探索什么？
            </h2>
            <div className="flex items-center gap-2 text-blue-600 text-sm font-medium">
              <span className="w-1.5 h-1.5 rounded-full bg-blue-600"></span>
              <span>基于大模型深度学习的数字化病理分析与诊断决策系统</span>
            </div>
          </div>

          {/* 功能卡片网格 */}
          <div className="grid grid-cols-2 gap-6 mb-12">
            {/* AI 阅片室 */}
            <FeatureCard
              icon={Microscope}
              iconColor="bg-blue-500"
              title="AI 阅片室"
              description="上传病理切片，AI 辅助细胞形态、特征与诊断思路，提供精准决策支持。"
              status="运行中"
              hasButton
              onClick={() => onChangeView(AppView.SLIDE_ANALYSIS)}
            />

            {/* 3D 解剖模拟 */}
            <FeatureCard
              icon={Layers}
              iconColor="bg-cyan-500"
              title="3D 解剖模拟"
              description="高精度 3D 器官建模，支持自由旋转与分层拆解，模拟实时生理变化与手术入路。"
              onClick={() => onChangeView(AppView.ANATOMY)}
            />

            {/* 科研思路导航 - 大卡片 */}
            <FeatureCard
              icon={BookOpen}
              iconColor="bg-emerald-500"
              title="科研思路导航"
              description="输入研究背景或课题信息，AI 智能推荐实验方案、相关参考文献与多维度的深度科研分析。"
              onClick={() => onChangeView(AppView.RESEARCH_ASSISTANT)}
            />
          </div>

          {/* 最新动态与资讯 */}
          <div>
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className="w-1 h-6 bg-blue-600 rounded-full"></div>
                <h3 className="text-lg font-bold text-slate-900">最新动态与资讯</h3>
              </div>
              <button className="text-blue-600 text-sm font-medium flex items-center gap-1 hover:text-blue-700 transition-colors">
                查看更多资讯 <ChevronRight size={16} />
              </button>
            </div>

            <div className="grid grid-cols-3 gap-6">
              <NewsCard
                tag="临床资讯"
                tagColor="bg-blue-50 text-blue-600"
                time="2小时前"
                title="WHO 软组织肉瘤最新分类指南正式发布，包含多项基因测序标准"
                summary="本指南修订不仅关注了分子层面的诊断标准，更强调了..."
              />
              <NewsCard
                tag="医疗审批"
                tagColor="bg-purple-50 text-purple-600"
                time="5小时前"
                title="FDA 批准首个基于 AI 的前列腺癌辅助筛查系统，准确率提升 19%"
                summary="该系统通过深度学习切片数据，能大幅降低漏诊率..."
              />
              <NewsCard
                tag="科研成果"
                tagColor="bg-emerald-50 text-emerald-600"
                time="昨天"
                title="肺腺癌新型生物标志物研究取得突破，相关论文发表于《Nature Medicine》"
                summary="研究团队发现了一种新型蛋白标记物，可有效预测早期..."
              />
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Dashboard;
