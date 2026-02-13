import React from 'react';
import {
  Microscope,
  Layers,
  BookOpen,
  Eye,
  Users,
  ChevronRight
} from 'lucide-react';
import { AppView } from '../types';
import { useTheme } from '../context/ThemeContext';

// --- 子组件: 功能卡片 ---
const FeatureCard = ({
  icon: Icon,
  iconColor,
  title,
  description,
  status,
  hasButton = false,
  onClick,
  isDark
}: any) => (
  <div
    onClick={onClick}
    className={`${isDark ? 'bg-slate-800/40 border-slate-700 shadow-2xl' : 'bg-white/80 border-white/60 shadow-[0_10px_30px_rgba(45,92,247,0.06)]'} backdrop-blur-xl rounded-3xl p-7 border hover:shadow-[0_18px_50px_rgba(45,92,247,0.12)] transition-all cursor-pointer group hover:-translate-y-0.5`}
  >
    <div className="flex items-start justify-between mb-5">
      <div className={`w-12 h-12 rounded-2xl ${iconColor} flex items-center justify-center shadow-lg shadow-black/5 group-hover:scale-110 transition-transform`}>
        <Icon className="text-white" size={26} />
      </div>
    </div>

    <h3 className={`text-lg font-extrabold ${isDark ? 'text-white' : 'text-slate-900'} mb-2 group-hover:text-[#2D5CF7] transition-colors`}>
      {title}
    </h3>
    <p className={`text-sm ${isDark ? 'text-slate-400' : 'text-slate-600'} leading-relaxed mb-5`}>
      {description}
    </p>

    <div className="flex items-center justify-between">
      {hasButton && (
        <button
          onClick={(e) => {
            e.stopPropagation();
            onClick?.();
          }}
          className="bg-[#2D5CF7] hover:bg-blue-700 text-white px-6 py-2.5 rounded-2xl text-sm font-bold flex items-center gap-2 transition-colors shadow-lg shadow-blue-500/20"
        >
          进入系统 <ChevronRight size={16} />
        </button>
      )}
      {status && (
        <div className="flex items-center gap-2 text-xs font-semibold ml-auto">
          <span className={`w-2 h-2 rounded-full ${status === '运行中' ? 'bg-emerald-500' : 'bg-slate-300'}`}></span>
          <span className={status === '运行中' ? 'text-emerald-600' : (isDark ? 'text-slate-500' : 'text-slate-500')}>
            {status}
          </span>
        </div>
      )}
    </div>
  </div>
);

// --- 子组件: 资讯卡片 ---
const NewsCard = ({ tag, tagColor, time, title, summary, isDark }: any) => (
  <div className={`${isDark ? 'bg-slate-800/40 border-slate-700' : 'bg-white/80 border-white/60'} backdrop-blur-xl rounded-3xl p-6 border shadow-[0_10px_30px_rgba(15,23,42,0.06)] hover:shadow-[0_18px_50px_rgba(45,92,247,0.10)] transition-all cursor-pointer group hover:-translate-y-0.5`}>
    <div className="flex items-center justify-between mb-4">
      <span className={`text-[10px] font-extrabold px-2.5 py-1 rounded-xl ${tagColor} tracking-wider`}>
        {tag}
      </span>
      <span className="text-xs text-slate-400 font-medium">{time}</span>
    </div>
    <h4 className={`text-sm font-extrabold ${isDark ? 'text-white' : 'text-slate-900'} mb-2 line-clamp-2 group-hover:text-[#2D5CF7] transition-colors`}>
      {title}
    </h4>
    <p className={`text-xs ${isDark ? 'text-slate-400' : 'text-slate-500'} line-clamp-2 leading-relaxed`}>
      {summary}
    </p>
  </div>
);

// --- 主页面组件 ---
const Dashboard: React.FC<DashboardProps> = ({ onChangeView }) => {
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  const dashboardBg = isDark 
    ? `radial-gradient(at 0% 0%, rgba(45, 92, 247, 0.15) 0px, transparent 50%),
       radial-gradient(at 100% 100%, rgba(39, 194, 76, 0.1) 0px, transparent 50%)`
    : `radial-gradient(at 0% 0%, rgba(45, 92, 247, 0.03) 0px, transparent 50%),
       radial-gradient(at 100% 100%, rgba(39, 194, 76, 0.03) 0px, transparent 50%)`;

  return (
    <div className={`flex-1 overflow-y-auto ${isDark ? 'bg-[#0b0f1a]' : 'bg-[#F5F7FA]'}`} style={{
      backgroundImage: dashboardBg
    }}>
      {/* 主内容 */}
      <div className="p-10 max-w-[1600px] mx-auto">
        {/* 欢迎语 */}
        <div className="mb-10 relative">
          <div className={`absolute -top-10 -left-10 w-64 h-64 ${isDark ? 'bg-blue-500/10' : 'bg-blue-500/5'} rounded-full blur-3xl -z-10`}></div>
          <h2 className={`text-4xl font-black ${isDark ? 'text-white' : 'text-slate-900'} mb-3 tracking-tight`}>
            今天想探索什么？
          </h2>
          <div className="flex items-center gap-3">
            <div className={`px-3 py-1 ${isDark ? 'bg-blue-900/30 border-blue-800' : 'bg-blue-50 border-blue-100'} rounded-full border flex items-center gap-2`}>
              <span className="w-2 h-2 rounded-full bg-[#2D5CF7] animate-pulse"></span>
              <span className="text-[#2D5CF7] text-xs font-bold uppercase tracking-widest">AI Intelligent Assistant</span>
            </div>
            <span className="text-slate-400 text-sm font-medium">基于深度学习的数字化病理分析与诊断决策系统</span>
          </div>
        </div>

        {/* 功能卡片网格 */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-16">
          {/* AI 阅片室 */}
          <FeatureCard
            icon={Microscope}
            iconColor="bg-gradient-to-br from-blue-500 to-blue-600"
            title="AI 阅片室"
            description="上传病理切片，AI 辅助分析细胞形态与诊断思路，提供精准决策支持。"
            status="运行中"
            hasButton
            isDark={isDark}
            onClick={() => onChangeView(AppView.SLIDE_ANALYSIS)}
          />

          {/* 3D 解剖模拟 */}
          <FeatureCard
            icon={Layers}
            iconColor="bg-gradient-to-br from-cyan-500 to-cyan-600"
            title="3D 解剖模拟"
            description="高精度 3D 器官建模，支持自由旋转与分层拆解，模拟实时生理变化。"
            isDark={isDark}
            onClick={() => onChangeView(AppView.ANATOMY)}
          />

          {/* 自动细胞计数 */}
          <FeatureCard
            icon={Eye}
            iconColor="bg-gradient-to-br from-purple-500 to-purple-600"
            title="自动细胞计数"
            description="调用先进视觉算法，一键完成视野内切片的细胞识别与计数，告别繁琐统计。"
            isDark={isDark}
            onClick={() => onChangeView(AppView.QUANTIFICATION)}
          />

          {/* 科研思路导航 - 大卡片 */}
          <div
            onClick={() => onChangeView(AppView.RESEARCH_ASSISTANT)}
            className={`md:col-span-2 ${isDark ? 'bg-slate-800/40 border-slate-700' : 'bg-white/80 border-white/60'} backdrop-blur-xl rounded-[2.5rem] p-8 border shadow-[0_15px_40px_rgba(16,185,129,0.08)] hover:shadow-[0_20px_60px_rgba(16,185,129,0.15)] transition-all cursor-pointer group hover:-translate-y-1 relative overflow-hidden`}
          >
            <div className={`absolute top-0 right-0 w-64 h-64 ${isDark ? 'bg-emerald-500/10' : 'bg-emerald-500/5'} rounded-full -mr-32 -mt-32 blur-3xl transition-transform group-hover:scale-110`}></div>
            
            <div className="flex items-start justify-between mb-6 relative z-10">
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-emerald-500 to-emerald-600 flex items-center justify-center shadow-lg shadow-emerald-500/20 group-hover:scale-110 transition-transform">
                <BookOpen className="text-white" size={30} />
              </div>
              <div className={`px-4 py-1.5 ${isDark ? 'bg-emerald-900/30 border-emerald-800 text-emerald-400' : 'bg-emerald-50 border-emerald-100 text-emerald-600'} rounded-xl text-xs font-bold border`}>
                RECOMMENDED
              </div>
            </div>

            <div className="relative z-10">
              <h3 className={`text-2xl font-black ${isDark ? 'text-white' : 'text-slate-900'} mb-3 group-hover:text-emerald-600 transition-colors`}>
                科研思路导航
              </h3>
              <p className={`text-base ${isDark ? 'text-slate-400' : 'text-slate-600'} leading-relaxed mb-6 max-w-2xl`}>
                输入研究背景或课题信息，AI 智能推荐实验方案、相关参考文献与多维度的深度科研分析，大幅提升研究效率。
              </p>
              <div className="flex items-center gap-2 text-emerald-600 font-bold text-sm">
                开启科研对话 <ChevronRight size={18} />
              </div>
            </div>
          </div>

          {/* 协同资源库 */}
          <FeatureCard
            icon={Users}
            iconColor="bg-gradient-to-br from-orange-500 to-orange-600"
            title="协同资源库"
            description="师生共用数字化切片库，支持在线标注，任务分发与多人实时协作。"
            isDark={isDark}
            onClick={() => onChangeView(AppView.COLLAB_LIBRARY)}
          />
        </div>

        {/* 最新动态与资讯 */}
        <div className="relative">
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-4">
              <div className="w-2 h-8 bg-[#2D5CF7] rounded-full shadow-[0_0_15px_rgba(45,92,247,0.4)]"></div>
              <h3 className={`text-2xl font-black ${isDark ? 'text-white' : 'text-slate-900'} tracking-tight`}>最新动态与资讯</h3>
            </div>
            <button className={`${isDark ? 'bg-slate-800/50 border-slate-700 text-slate-300' : 'bg-white/50 border-slate-200 text-slate-600'} backdrop-blur-sm border px-5 py-2 rounded-2xl text-sm font-bold flex items-center gap-2 hover:bg-[#2D5CF7] hover:text-white hover:border-[#2D5CF7] transition-all group`}>
              更多资讯 <ChevronRight size={16} className="group-hover:translate-x-0.5 transition-transform" />
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <NewsCard
              tag="临床资讯"
              tagColor={isDark ? "bg-blue-900/40 text-blue-400" : "bg-blue-50 text-blue-600"}
              time="2小时前"
              title="WHO 软组织肉瘤最新分类指南正式发布，包含多项基因测序标准"
              summary="本指南修订不仅关注了分子层面的诊断标准，更强调了病理医生在数字化工作流中的核心作用..."
              isDark={isDark}
            />
            <NewsCard
              tag="医疗审批"
              tagColor={isDark ? "bg-purple-900/40 text-purple-400" : "bg-purple-50 text-purple-600"}
              time="5小时前"
              title="FDA 批准首个基于 AI 的前列腺癌辅助筛查系统，准确率提升 19%"
              summary="该系统通过深度学习数百万张切片数据，能有效识别微小病灶并降低资深医生的疲劳误差..."
              isDark={isDark}
            />
            <NewsCard
              tag="科研成果"
              tagColor={isDark ? "bg-emerald-900/40 text-emerald-400" : "bg-emerald-50 text-emerald-600"}
              time="昨天"
              title="肺腺癌新型生物标志物研究取得突破，相关论文发表于《Nature Medicine》"
              summary="研究团队利用大模型技术发现了一种新型蛋白标记物，可有效预测早期切除后的复发风险..."
              isDark={isDark}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
