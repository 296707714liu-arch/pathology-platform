import React, { useState } from 'react';
import {
  Microscope,
  Layers,
  BookOpen,
  Eye,
  Users,
  Search,
  ChevronRight,
  LayoutGrid,
  Settings
} from 'lucide-react';
import { AppView } from '../types';

interface DashboardProps {
  onChangeView: (view: AppView) => void;
}

// --- 子组件: 功能卡片 ---
const FeatureCard = ({
  icon: Icon,
  iconColor,
  badge,
  title,
  description,
  hasButton = false,
  onClick
}: any) => (
  <div
    onClick={onClick}
    className="bg-white rounded-xl p-6 border border-slate-100 hover:shadow-md transition-all cursor-pointer group"
  >
    <div className="flex items-start justify-between mb-4">
      <div className={`w-12 h-12 rounded-lg ${iconColor} flex items-center justify-center group-hover:scale-110 transition-transform`}>
        <Icon className="text-white" size={28} />
      </div>
      {badge && (
        <span className="text-xs font-bold text-blue-600 bg-blue-50 px-2 py-1 rounded">
          {badge}
        </span>
      )}
    </div>

    <h3 className="text-base font-bold text-slate-900 mb-2">
      {title}
    </h3>
    <p className="text-sm text-slate-600 leading-relaxed mb-4 line-clamp-3">
      {description}
    </p>

    {hasButton && (
      <button
        onClick={(e) => {
          e.stopPropagation();
          onClick?.();
        }}
        className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-2 transition-colors"
      >
        进入系统 <ChevronRight size={16} />
      </button>
    )}
  </div>
);

// --- 子组件: 资讯卡片 ---
const NewsCard = ({ tag, tagColor, time, title, summary }: any) => (
  <div className="bg-white rounded-xl p-4 border border-slate-100 hover:shadow-md transition-all cursor-pointer group">
    <div className="flex items-center justify-between mb-2">
      <span className={`text-xs font-bold px-2 py-0.5 rounded ${tagColor}`}>
        {tag}
      </span>
      <span className="text-xs text-slate-400">{time}</span>
    </div>
    <h4 className="text-sm font-bold text-slate-900 mb-1 line-clamp-2 group-hover:text-blue-600 transition-colors">
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
  const [activeMenu, setActiveMenu] = useState('explore');

  const menuItems = [
    { id: 'explore', label: '探索首页', icon: LayoutGrid, active: true },
    { id: 'slide', label: 'AI 阅片室', icon: Microscope },
    { id: 'cell', label: '细胞计数', icon: Eye },
    { id: 'research', label: '学术/科研', icon: BookOpen },
    { id: 'anatomy', label: '3D 解剖', icon: Layers },
    { id: 'exam', label: '考试中心', icon: BookOpen },
    { id: 'library', label: '协同资源库', icon: Users },
  ];

  const adminItems = [
    { id: 'admin', label: '用户管理', icon: Settings },
  ];

  const handleMenuClick = (id: string) => {
    setActiveMenu(id);
    switch (id) {
      case 'slide':
        onChangeView(AppView.SLIDE_ANALYSIS);
        break;
      case 'cell':
        onChangeView(AppView.QUANTIFICATION);
        break;
      case 'research':
        onChangeView(AppView.RESEARCH_ASSISTANT);
        break;
      case 'anatomy':
        onChangeView(AppView.ANATOMY);
        break;
      case 'exam':
        onChangeView(AppView.EXAM_SYSTEM);
        break;
      case 'library':
        onChangeView(AppView.COLLAB_LIBRARY);
        break;
      case 'admin':
        onChangeView(AppView.USER_MANAGEMENT);
        break;
    }
  };

  return (
    <div className="flex min-h-screen bg-slate-50">
      {/* 中间导航侧边栏 */}
      <aside className="w-56 bg-white border-r border-slate-200 flex flex-col sticky top-0 h-screen">
        {/* 导航菜单 */}
        <nav className="flex-1 px-4 py-6 space-y-1 overflow-y-auto">
          <p className="text-xs font-bold text-slate-400 uppercase tracking-widest px-3 mb-4">
            核心功能
          </p>
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeMenu === item.id;
            return (
              <button
                key={item.id}
                onClick={() => handleMenuClick(item.id)}
                className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-lg transition-all text-sm font-medium ${
                  isActive
                    ? 'bg-blue-600 text-white shadow-md'
                    : 'text-slate-600 hover:bg-slate-100'
                }`}
              >
                <Icon size={20} />
                <span>{item.label}</span>
              </button>
            );
          })}

          <p className="text-xs font-bold text-slate-400 uppercase tracking-widest px-3 mt-8 mb-4">
            系统管理
          </p>
          {adminItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeMenu === item.id;
            return (
              <button
                key={item.id}
                onClick={() => handleMenuClick(item.id)}
                className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-lg transition-all text-sm font-medium ${
                  isActive
                    ? 'bg-blue-600 text-white shadow-md'
                    : 'text-slate-600 hover:bg-slate-100'
                }`}
              >
                <Icon size={20} />
                <span>{item.label}</span>
              </button>
            );
          })}
        </nav>

        {/* 用户信息 */}
        <div className="p-4 border-t border-slate-100">
          <div className="flex items-center gap-3 p-3 rounded-lg hover:bg-slate-50 cursor-pointer transition-colors">
            <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 flex-shrink-0 text-sm font-bold">
              A
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-bold text-slate-900 truncate">Admin 系统</p>
              <p className="text-xs text-slate-400 truncate">超级管理权限</p>
            </div>
          </div>
        </div>
      </aside>

      {/* 右侧主内容区 */}
      <main className="flex-1 overflow-y-auto">
        {/* 顶部搜索栏 */}
        <div className="bg-white border-b border-slate-200 sticky top-0 z-10">
          <div className="px-8 py-6 flex items-center justify-between gap-8">
            <div>
              <h2 className="text-2xl font-bold text-slate-900 mb-1">
                令天想探索什么？
              </h2>
              <div className="flex items-center gap-2 text-blue-600 text-sm font-medium">
                <span className="w-1 h-1 rounded-full bg-blue-600"></span>
                <span>基于 AI 深度学习的病理数字化病理分析与诊断决策系统</span>
              </div>
            </div>
            <div className="relative w-72 flex-shrink-0">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="快速搜索模块或文档..."
                className="w-full bg-slate-50 border border-slate-200 rounded-lg py-2.5 pl-10 pr-4 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all placeholder-slate-400"
              />
            </div>
          </div>
        </div>

        {/* 主内容 */}
        <div className="p-8">
          {/* 功能卡片网格 - 2x2 + 1 */}
          <div className="grid grid-cols-3 gap-6 mb-12">
            {/* AI 阅片室 - 有按钮 */}
            <FeatureCard
              icon={Microscope}
              iconColor="bg-blue-500"
              badge="CORE"
              title="AI 阅片室"
              description="上传病理切片，AI 辅助细胞形态、特征与诊断思路，提供精准决策支持。"
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

            {/* 自动细胞计数 */}
            <FeatureCard
              icon={Eye}
              iconColor="bg-purple-500"
              title="自动细胞计数"
              description="调用先进视觉算法，一键完成视野内切片的细胞识别与计数，告别繁琐统计工作。"
              onClick={() => onChangeView(AppView.QUANTIFICATION)}
            />

            {/* 科研思路导航 - 大卡片 */}
            <FeatureCard
              icon={BookOpen}
              iconColor="bg-emerald-500"
              title="科研思路导航"
              description="输入研究背景或课题信息，AI 智能推荐实验方案、相关参考文献与多维度的深度科研分析。"
              onClick={() => onChangeView(AppView.RESEARCH_ASSISTANT)}
            />

            {/* 协同资源库 */}
            <FeatureCard
              icon={Users}
              iconColor="bg-orange-500"
              title="协同资源库"
              description="师生共用数字化切片库，支持在线标注，任务分发与多人实时会诊协作。"
              onClick={() => onChangeView(AppView.COLLAB_LIBRARY)}
            />
          </div>

          {/* 最新动态与资讯 */}
          <div>
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className="w-1 h-5 bg-blue-600 rounded-full"></div>
                <h3 className="text-base font-bold text-slate-900">最新动态与资讯</h3>
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
