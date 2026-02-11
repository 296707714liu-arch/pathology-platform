import React, { useState } from 'react';
import {
  Microscope,
  Layers,
  BookOpen,
  Eye,
  Users,
  Search,
  ChevronRight
} from 'lucide-react';
import { AppView } from '../types';

interface DashboardProps {
  onChangeView: (view: AppView) => void;
}

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
        <div className="flex items-center gap-2 text-xs font-medium ml-auto">
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

  return (
    <div className="flex-1 overflow-y-auto bg-slate-50">
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
            <span>基于 AI 深度学习的病理数字化病理分析与诊断决策系统</span>
          </div>
        </div>

        {/* 功能卡片网格 */}
        <div className="grid grid-cols-3 gap-6 mb-12">
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

          {/* 自动细胞计数 */}
          <FeatureCard
            icon={Eye}
            iconColor="bg-purple-500"
            title="自动细胞计数"
            description="调用先进视觉算法，一键完成视野内切片的细胞识别与计数，告别繁琐统计工作。"
            onClick={() => onChangeView(AppView.QUANTIFICATION)}
          />

          {/* 科研思路导航 - 大卡片 */}
          <div
            onClick={() => onChangeView(AppView.RESEARCH_ASSISTANT)}
            className="col-span-2 bg-white rounded-2xl p-6 border border-slate-100 hover:shadow-lg transition-all cursor-pointer group"
          >
            <div className="flex items-start justify-between mb-4">
              <div className="w-12 h-12 rounded-lg bg-emerald-500 flex items-center justify-center group-hover:scale-110 transition-transform">
                <BookOpen className="text-white" size={28} />
              </div>
            </div>

            <h3 className="text-lg font-bold text-slate-900 mb-2 group-hover:text-emerald-600 transition-colors">
              科研思路导航
            </h3>
            <p className="text-sm text-slate-600 leading-relaxed mb-4">
              输入研究背景或课题信息，AI 智能推荐实验方案、相关参考文献与多维度的深度科研分析。
            </p>
          </div>

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
    </div>
  );
};

export default Dashboard;
