import React, { useState } from 'react';
import { AppView } from '../types';

interface DashboardProps {
  onChangeView: (view: AppView) => void;
}

const Dashboard: React.FC<DashboardProps> = ({ onChangeView }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [theme, setTheme] = useState<'light' | 'dark'>('light');

  const features = [
    {
      id: 'slide',
      icon: 'microscope',
      title: 'AI 阅片室',
      description: '上传病理切片，AI 辅助细胞形态、特征与诊断思路，提供精准决策支持。',
      view: AppView.SLIDE_ANALYSIS,
      color: 'blue',
      status: '运行中'
    },
    {
      id: 'anatomy',
      icon: 'view_in_ar',
      title: '3D 解剖模拟',
      description: '高精度 3D 器官建模，支持自由旋转与分层拆解，模拟实时生理变化与手术入路。',
      view: AppView.ANATOMY,
      color: 'cyan',
      status: '资源就绪'
    },
    {
      id: 'counting',
      icon: 'grid_view',
      title: '自动细胞计数',
      description: '调用先进视觉算法，一键完成视野内切片的细胞识别与计数，告别繁琐统计工作。',
      view: AppView.QUANTIFICATION,
      color: 'purple',
      status: '离线'
    },
    {
      id: 'research',
      icon: 'menu_book',
      title: '科研思路导航',
      description: '输入研究背景或课题信息，AI 智能推荐实验方案、相关参考文献与多维度的深度科研分析。',
      view: AppView.RESEARCH_ASSISTANT,
      color: 'emerald',
      status: '运行中'
    },
    {
      id: 'library',
      icon: 'groups',
      title: '协同资源库',
      description: '师生共用数字化切片库，支持在线标注，任务分发与多人实时会诊协作。',
      view: AppView.COLLAB_LIBRARY,
      color: 'orange',
      status: '运行中'
    }
  ];

  const news = [
    {
      tag: '临床资讯',
      color: 'blue',
      title: 'WHO 软组织肉瘤最新分类指南正式发布，包含多项基因测序标准',
      excerpt: '本指南修订后不仅关注了分子层面的诊断标准，更强调了...',
      time: '2小时前'
    },
    {
      tag: '技术批准',
      color: 'purple',
      title: 'FDA 批准首个基于 AI 的前列腺癌辅助筛查系统，准确率提升 19%',
      excerpt: '该系统通过深度学习切片数据，能大幅降低漏诊率...',
      time: '5小时前'
    },
    {
      tag: '科研成果',
      color: 'emerald',
      title: '肺腺癌新型生物标志物研究取得突破，相关论文发表于《Nature Medicine》',
      excerpt: '研究团队发现了一种新型蛋白标记物，可有效预测早期...',
      time: '昨天'
    }
  ];

  const getColorClasses = (color: string) => {
    const colors: Record<string, { bg: string; text: string; icon: string }> = {
      blue: { bg: 'bg-blue-50 dark:bg-blue-900/20', text: 'text-blue-600 dark:text-blue-400', icon: 'text-blue-600' },
      cyan: { bg: 'bg-cyan-50 dark:bg-cyan-900/20', text: 'text-cyan-600 dark:text-cyan-400', icon: 'text-cyan-500' },
      purple: { bg: 'bg-purple-50 dark:bg-purple-900/20', text: 'text-purple-600 dark:text-purple-400', icon: 'text-purple-500' },
      emerald: { bg: 'bg-emerald-50 dark:bg-emerald-900/20', text: 'text-emerald-600 dark:text-emerald-400', icon: 'text-emerald-500' },
      orange: { bg: 'bg-orange-50 dark:bg-orange-900/20', text: 'text-orange-600 dark:text-orange-400', icon: 'text-orange-500' }
    };
    return colors[color] || colors.blue;
  };

  const getStatusColor = (status: string) => {
    if (status === '运行中') return 'bg-emerald-500 text-emerald-600 dark:text-emerald-400';
    if (status === '资源就绪') return 'bg-emerald-500 text-emerald-600 dark:text-emerald-400';
    return 'bg-slate-400 text-slate-500 dark:text-slate-400';
  };

  const toggleTheme = () => {
    const newTheme = theme === 'light' ? 'dark' : 'light';
    setTheme(newTheme);
    if (newTheme === 'dark') {
      document.documentElement.classList.add('dark');
      localStorage.theme = 'dark';
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.theme = 'light';
    }
  };

  return (
    <div className={`min-h-screen ${theme === 'dark' ? 'dark' : ''}`}>
      <div className="bg-slate-50/50 dark:bg-slate-900/50 text-slate-900 dark:text-slate-100 transition-colors duration-300">
        {/* Header Navigation */}
        <nav className="h-16 bg-white dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700 flex items-center justify-between px-8 sticky top-0 z-30 shadow-sm">
          <div className="flex items-center text-sm text-slate-600 dark:text-slate-400">
            <span className="hover:text-blue-600 cursor-pointer transition-colors">首页</span>
            <span className="mx-1">›</span>
            <span className="font-medium text-slate-900 dark:text-white">仪表盘</span>
          </div>
          <div className="flex items-center gap-4">
            <button className="w-8 h-8 rounded-full hover:bg-slate-100 dark:hover:bg-slate-700 flex items-center justify-center transition-colors text-slate-600 dark:text-slate-400 relative">
              <span className="text-lg">🔔</span>
              <span className="absolute top-1.5 right-2 w-2 h-2 bg-red-500 rounded-full border-2 border-white dark:border-slate-800"></span>
            </button>
            <button
              onClick={toggleTheme}
              className="w-8 h-8 rounded-full hover:bg-slate-100 dark:hover:bg-slate-700 flex items-center justify-center transition-colors text-slate-600 dark:text-slate-400"
            >
              <span className="text-lg">{theme === 'dark' ? '☀️' : '🌙'}</span>
            </button>
          </div>
        </nav>

        {/* Main Content */}
        <div className="flex-1 overflow-y-auto">
          {/* Header Section */}
          <header className="bg-white/50 dark:bg-slate-800/50 pt-8 px-8 pb-4 flex flex-col md:flex-row md:items-end justify-between gap-6">
            <div className="flex flex-col max-w-2xl">
              <h2 className="text-3xl font-bold text-slate-900 dark:text-white tracking-tight leading-tight">
                今天想探索什么？
              </h2>
              <div className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400 mt-2">
                <span className="w-1.5 h-1.5 rounded-full bg-blue-600"></span>
                <span>基于大模型深度学习的数字化病理分析与辅助诊断系统</span>
              </div>
            </div>
            <div className="relative w-full md:w-80">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">🔍</span>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="快速搜索模块或文档..."
                className="w-full pl-11 pr-4 py-2.5 bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-full text-sm text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 transition-all shadow-sm"
              />
            </div>
          </header>

          {/* Content */}
          <div className="p-8 space-y-8">
            {/* Feature Cards Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {features.map((feature) => {
                const colors = getColorClasses(feature.color);
                return (
                  <div
                    key={feature.id}
                    onClick={() => onChangeView(feature.view)}
                    className="bg-white dark:bg-slate-800 rounded-2xl p-6 shadow-sm hover:shadow-md transition-all duration-300 group border border-slate-100 dark:border-slate-700/50 flex flex-col h-full relative overflow-hidden cursor-pointer"
                  >
                    <div className="flex justify-between items-start mb-5">
                      <div className={`w-11 h-11 rounded-lg ${colors.bg} ${colors.icon} flex items-center justify-center group-hover:scale-110 transition-transform duration-300`}>
                        <span className="text-2xl">
                          {feature.icon === 'microscope' && '🔬'}
                          {feature.icon === 'view_in_ar' && '🧬'}
                          {feature.icon === 'grid_view' && '📊'}
                          {feature.icon === 'menu_book' && '📚'}
                          {feature.icon === 'groups' && '👥'}
                        </span>
                      </div>
                    </div>
                    <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2 group-hover:text-blue-600 transition-colors">
                      {feature.title}
                    </h3>
                    <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed mb-6 flex-1 line-clamp-3">
                      {feature.description}
                    </p>
                    <div className="flex items-center justify-between mt-auto pt-4 border-t border-slate-50 dark:border-slate-700">
                      <button
                        onClick={() => onChangeView(feature.view)}
                        className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-xs font-medium transition-colors shadow-lg shadow-blue-500/20 flex items-center gap-1.5"
                      >
                        进入系统 →
                      </button>
                      <div className="flex items-center gap-1.5">
                        <span className={`w-2 h-2 rounded-full ${feature.status === '离线' ? 'bg-slate-400' : 'bg-emerald-500 shadow-sm shadow-emerald-500/50'}`}></span>
                        <span className={`text-[10px] font-medium ${feature.status === '离线' ? 'text-slate-500 dark:text-slate-400' : 'text-emerald-600 dark:text-emerald-400'}`}>
                          {feature.status}
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* News Section */}
            <section>
              <div className="flex items-center justify-between mb-5 px-1">
                <div className="flex items-center gap-2">
                  <div className="w-1 h-5 bg-blue-600 rounded-full"></div>
                  <h2 className="text-base font-bold text-slate-900 dark:text-white">最新动态与资讯</h2>
                </div>
                <a className="text-xs font-semibold text-blue-600 hover:text-blue-700 flex items-center gap-0.5 transition-colors uppercase tracking-wide">
                  查看更多 →
                </a>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {news.map((item, i) => {
                  const colors = getColorClasses(item.color);
                  return (
                    <div
                      key={i}
                      className="bg-white dark:bg-slate-800 p-5 rounded-2xl border border-slate-100 dark:border-slate-700/50 hover:shadow-md transition-all cursor-pointer group"
                    >
                      <div className="flex justify-between items-center mb-3">
                        <span className={`px-2 py-0.5 rounded border ${colors.text} ${colors.bg} text-[10px] font-bold tracking-wide uppercase`}>
                          {item.tag}
                        </span>
                        <span className="text-[10px] text-slate-600 dark:text-slate-400 font-medium">{item.time}</span>
                      </div>
                      <h4 className="text-sm font-bold text-slate-900 dark:text-white mb-2 line-clamp-2 leading-snug group-hover:text-blue-600 transition-colors">
                        {item.title}
                      </h4>
                      <p className="text-xs text-slate-600 dark:text-slate-400 line-clamp-2 leading-relaxed">
                        {item.excerpt}
                      </p>
                    </div>
                  );
                })}
              </div>
            </section>

            <div className="h-8"></div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;