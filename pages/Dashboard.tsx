import React, { useState } from 'react';
import {
  Home,
  Microscope,
  Layers,
  BookOpen,
  Search,
  Users,
  UserCircle,
  Bell,
  Moon,
  Sun,
  ChevronRight,
  LogOut,
  BrainCircuit,
  Settings,
  Eye
} from 'lucide-react';
import { AppView } from '../types';

interface DashboardProps {
  onChangeView: (view: AppView) => void;
}

// --- 子组件: 导航项 ---
const NavItem = ({ icon: Icon, label, active = false, onClick }: any) => (
  <div
    onClick={onClick}
    className={`flex items-center gap-3 px-4 py-3 rounded-xl cursor-pointer transition-all ${
      active
        ? 'bg-blue-600 text-white shadow-md shadow-blue-200'
        : 'text-slate-600 hover:bg-slate-50'
    }`}
  >
    <Icon size={20} />
    <span className="font-medium text-[15px]">{label}</span>
  </div>
);

// --- 子组件: 功能模块卡片 ---
const FeatureCard = ({
  title,
  description,
  icon: Icon,
  iconColor,
  status,
  statusColor,
  hasButton = false,
  onClick
}: any) => (
  <div className="bg-white border border-slate-100 rounded-2xl p-6 flex flex-col justify-between hover:shadow-lg transition-shadow duration-300 relative overflow-hidden cursor-pointer group"
    onClick={onClick}
  >
    <div>
      <div className={`w-10 h-10 rounded-lg ${iconColor} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
        <Icon className="text-white" size={24} />
      </div>
      <h3 className="text-xl font-bold text-slate-800 mb-2 group-hover:text-blue-600 transition-colors">
        {title}
      </h3>
      <p className="text-slate-500 text-sm leading-relaxed mb-6">
        {description}
      </p>
    </div>
    <div className="flex items-center justify-between mt-auto">
      {hasButton ? (
        <button
          onClick={(e) => {
            e.stopPropagation();
            onClick?.();
          }}
          className="bg-blue-600 text-white px-5 py-2 rounded-lg text-sm font-medium flex items-center gap-2 hover:bg-blue-700 transition-colors"
        >
          进入系统 <ChevronRight size={16} />
        </button>
      ) : (
        <div />
      )}
      <div className="flex items-center gap-2 text-xs font-medium text-slate-400">
        <span className={`w-2 h-2 rounded-full ${statusColor}`} />
        {status}
      </div>
    </div>
  </div>
);

// --- 子组件: 资讯卡片 ---
const NewsCard = ({ tag, time, title, summary, tagColor }: any) => (
  <div className="bg-white border border-slate-100 rounded-2xl p-5 hover:shadow-md transition-shadow cursor-pointer group">
    <div className="flex items-center justify-between mb-3">
      <span className={`text-[11px] px-2 py-0.5 rounded ${tagColor} font-medium`}>
        {tag}
      </span>
      <span className="text-xs text-slate-400">{time}</span>
    </div>
    <h4 className="text-[15px] font-bold text-slate-800 mb-2 line-clamp-2 leading-snug group-hover:text-blue-600 transition-colors">
      {title}
    </h4>
    <p className="text-xs text-slate-500 line-clamp-2 leading-relaxed">
      {summary}
    </p>
  </div>
);

// --- 主页面组件 ---
const Dashboard: React.FC<DashboardProps> = ({ onChangeView }) => {
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const toggleTheme = () => {
    setIsDarkMode(!isDarkMode);
    if (!isDarkMode) {
      document.documentElement.classList.add('dark');
      localStorage.theme = 'dark';
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.theme = 'light';
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('auth_token');
    onChangeView(AppView.LOGIN);
  };

  return (
    <div className={`flex min-h-screen ${isDarkMode ? 'dark' : ''} bg-[#F8FAFC] dark:bg-slate-900 font-sans text-slate-900 dark:text-slate-100`}>
      {/* 左侧侧边栏 */}
      <aside className="w-64 bg-white dark:bg-slate-800 border-r border-slate-100 dark:border-slate-700 flex flex-col sticky top-0 h-screen">
        <div className="p-6 flex items-center gap-3">
          <div className="bg-blue-600 p-2 rounded-xl text-white">
            <BrainCircuit size={28} />
          </div>
          <div>
            <h1 className="font-bold text-lg leading-tight text-slate-800 dark:text-white">
              大模型病理
            </h1>
            <p className="text-[10px] text-slate-400 dark:text-slate-500 tracking-wider uppercase">
              教学平台
            </p>
          </div>
        </div>

        <nav className="flex-1 px-4 mt-4 space-y-2 overflow-y-auto">
          <p className="text-[11px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest px-4 mb-3">
            核心功能
          </p>
          <NavItem
            icon={Home}
            label="综合首页"
            active
          />
          <NavItem
            icon={Microscope}
            label="AI 阅片室"
            onClick={() => onChangeView(AppView.SLIDE_ANALYSIS)}
          />
          <NavItem
            icon={Layers}
            label="3D 解剖模拟"
            onClick={() => onChangeView(AppView.ANATOMY)}
          />
          <NavItem
            icon={BookOpen}
            label="考试中心"
            onClick={() => onChangeView(AppView.EXAM_SYSTEM)}
          />
          <NavItem
            icon={Users}
            label="协同资源库"
            onClick={() => onChangeView(AppView.COLLAB_LIBRARY)}
          />

          <p className="text-[11px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest px-4 mt-8 mb-3">
            系统管理
          </p>
          <NavItem
            icon={Settings}
            label="用户管理"
            onClick={() => onChangeView(AppView.USER_MANAGEMENT)}
          />
        </nav>

        <div className="p-4 border-t border-slate-50 dark:border-slate-700 mt-auto">
          <div className="flex items-center gap-3 p-2 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-700 cursor-pointer transition-colors group">
            <div className="w-10 h-10 rounded-full bg-orange-100 dark:bg-orange-900/30 flex items-center justify-center overflow-hidden">
              <UserCircle size={32} className="text-orange-400" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-bold text-slate-800 dark:text-white truncate">
                Admin 系统管理员
              </p>
              <p className="text-[11px] text-slate-400 dark:text-slate-500 truncate">
                超级管理权限
              </p>
            </div>
            <LogOut
              size={18}
              className="text-slate-300 dark:text-slate-600 group-hover:text-slate-500 dark:group-hover:text-slate-400 cursor-pointer"
              onClick={handleLogout}
            />
          </div>
        </div>
      </aside>

      {/* 右侧主内容区 */}
      <main className="flex-1 p-8 overflow-y-auto bg-slate-50/50 dark:bg-slate-900/50">
        {/* 顶部面包屑与工具 */}
        <header className="flex items-center justify-between mb-10">
          <div className="text-sm text-slate-400 dark:text-slate-500 flex items-center gap-2">
            <span>首页</span>
            <ChevronRight size={14} />
            <span className="text-slate-600 dark:text-slate-300 font-medium">仪表盘</span>
          </div>
          <div className="flex items-center gap-6 text-slate-400 dark:text-slate-500">
            <Bell
              size={20}
              className="hover:text-slate-600 dark:hover:text-slate-300 cursor-pointer transition-colors"
            />
            <button
              onClick={toggleTheme}
              className="hover:text-slate-600 dark:hover:text-slate-300 cursor-pointer transition-colors"
            >
              {isDarkMode ? <Sun size={20} /> : <Moon size={20} />}
            </button>
          </div>
        </header>

        {/* 欢迎语与搜索 */}
        <section className="flex items-end justify-between mb-10 gap-8">
          <div>
            <h2 className="text-3xl font-black text-slate-800 dark:text-white mb-3 tracking-tight">
              今天想探索什么？
            </h2>
            <div className="flex items-center gap-2 text-blue-600 dark:text-blue-400 text-sm font-medium">
              <span className="w-1.5 h-1.5 rounded-full bg-blue-600 dark:bg-blue-400" />
              基于大模型深度学习的数字化病理分析与辅助诊断系统
            </div>
          </div>
          <div className="relative w-96 flex-shrink-0">
            <Search
              className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 dark:text-slate-600"
              size={18}
            />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="快速搜索模块或文档..."
              className="w-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl py-3 pl-12 pr-4 text-sm focus:outline-none focus:ring-2 focus:ring-blue-100 dark:focus:ring-blue-900 focus:border-blue-500 transition-all shadow-sm text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500"
            />
          </div>
        </section>

        {/* 功能模块网格 */}
        <section className="grid grid-cols-3 gap-6 mb-12">
          <FeatureCard
            title="AI 阅片室"
            description="上传病理切片，AI 辅助细胞形态、特征与诊断思路，提供精准决策支持。"
            icon={Microscope}
            iconColor="bg-blue-500"
            status="运行中"
            statusColor="bg-green-500"
            hasButton
            onClick={() => onChangeView(AppView.SLIDE_ANALYSIS)}
          />
          <FeatureCard
            title="3D 解剖模拟"
            description="高精度 3D 器官建模，支持自由旋转与分层拆解，模拟实时生理变化与手术入路。"
            icon={Layers}
            iconColor="bg-cyan-500"
            status="资源就绪"
            statusColor="bg-green-500"
            onClick={() => onChangeView(AppView.ANATOMY)}
          />
          <FeatureCard
            title="自动细胞计数"
            description="调用先进视觉算法，一键完成视野内切片的细胞识别与计数，告别繁琐统计工作。"
            icon={Eye}
            iconColor="bg-purple-500"
            status="离线"
            statusColor="bg-slate-300"
            onClick={() => onChangeView(AppView.QUANTIFICATION)}
          />
          <div
            className="col-span-2 bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700 rounded-2xl p-8 flex items-center justify-between relative overflow-hidden group cursor-pointer hover:shadow-lg transition-shadow"
            onClick={() => onChangeView(AppView.RESEARCH_ASSISTANT)}
          >
            <div className="z-10 max-w-lg">
              <div className="w-10 h-10 rounded-lg bg-emerald-500 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                <BookOpen className="text-white" size={24} />
              </div>
              <h3 className="text-xl font-bold text-slate-800 dark:text-white mb-2 group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors">
                科研思路导航
              </h3>
              <p className="text-slate-500 dark:text-slate-400 text-sm leading-relaxed">
                输入研究背景或课题信息，AI 智能推荐实验方案、相关参考文献与多维度的深度科研分析。
              </p>
            </div>
            <div className="absolute right-[-20px] bottom-[-20px] w-48 h-48 bg-slate-50 dark:bg-slate-700/30 rounded-full opacity-50 group-hover:scale-110 transition-transform" />
          </div>
          <FeatureCard
            title="协同资源库"
            description="师生共用数字化切片库，支持在线标注，任务分发与多人实时会诊协作。"
            icon={Users}
            iconColor="bg-orange-500"
            status="在线"
            statusColor="bg-green-500"
            onClick={() => onChangeView(AppView.COLLAB_LIBRARY)}
          />
        </section>

        {/* 最新资讯区 */}
        <section>
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <span className="w-1 h-5 bg-blue-600 dark:bg-blue-500 rounded-full" />
              <h3 className="text-lg font-bold text-slate-800 dark:text-white">
                最新动态与资讯
              </h3>
            </div>
            <button className="text-blue-600 dark:text-blue-400 text-sm font-medium flex items-center gap-1 hover:underline transition-colors">
              查看更多 <ChevronRight size={16} />
            </button>
          </div>
          <div className="grid grid-cols-3 gap-6">
            <NewsCard
              tag="临床资讯"
              tagColor="bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400"
              time="2小时前"
              title="WHO 软组织肉瘤最新分类指南正式发布，包含多项基因测序标准"
              summary="本指南修订不仅关注了分子层面的诊断标准，更强调了..."
            />
            <NewsCard
              tag="技术批准"
              tagColor="bg-purple-50 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400"
              time="5小时前"
              title="FDA 批准首个基于 AI 的前列腺癌辅助筛查系统，准确率提升 19%"
              summary="该系统通过深度学习切片数据，能大幅降低漏诊率..."
            />
            <NewsCard
              tag="科研成果"
              tagColor="bg-emerald-50 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400"
              time="昨天"
              title="肺腺癌新型生物标志物研究取得突破，相关论文发表于《Nature Medicine》"
              summary="研究团队发现了一种新型蛋白标记物，可有效预测早期..."
            />
          </div>
        </section>
      </main>
    </div>
  );
};

export default Dashboard;
