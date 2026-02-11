import React, { useState } from 'react';
import { Microscope, BookOpen, GraduationCap, ArrowRight, Activity, TrendingUp, Users, Eye, Database, ChevronRight, Zap, Award, Clock } from 'lucide-react';
import { AppView } from '../types';

interface DashboardProps {
  onChangeView: (view: AppView) => void;
}

const Dashboard: React.FC<DashboardProps> = ({ onChangeView }) => {
  const [hoveredCard, setHoveredCard] = useState<string | null>(null);

  const features = [
    {
      id: 'slide',
      icon: '🔬',
      title: 'AI 阅片室',
      description: '上传切片，AI 导师帮你分析形态、特征与诊断思路',
      view: AppView.SLIDE_ANALYSIS,
      featured: true,
      stats: '已分析 2,847 张切片'
    },
    {
      id: 'anatomy',
      icon: '🧬',
      title: '3D 解剖模拟',
      description: '调整血管/肌肉参数，AI 实时解读生理变化',
      view: AppView.ANATOMY,
      stats: '支持 50+ 器官'
    },
    {
      id: 'counting',
      icon: '📊',
      title: '自动细胞计数',
      description: '智能识别与计数，精确量化分析',
      view: AppView.QUANTIFICATION,
      stats: '准确率 98.5%'
    },
    {
      id: 'research',
      icon: '📚',
      title: '科研思路导航',
      description: '输入样本信息，AI 推荐实验方案、参考文献与多维度分析',
      view: AppView.RESEARCH_ASSISTANT,
      featured: true,
      stats: '已生成 5,234 份方案'
    },
    {
      id: 'library',
      icon: '🤝',
      title: '协同资源库',
      description: '师生共用切片库，支持发布任务与AI批改',
      view: AppView.COLLAB_LIBRARY,
      stats: '共享资源 1,203 个'
    },
    {
      id: 'exam',
      icon: '🎓',
      title: '考试中心',
      description: '智能组卷、自动批改、错题总结',
      view: AppView.EXAM_SYSTEM,
      stats: '已完成 8,456 场考试'
    }
  ];

  const news = [
    { tag: '前沿', color: 'bg-blue-100 text-blue-700', title: 'WHO 软组织肉瘤新分类出炉', time: '刚刚' },
    { tag: '技术', color: 'bg-purple-100 text-purple-700', title: 'FDA 批准首个前列腺癌 AI 辅助检测', time: '2小时前' },
    { tag: '科研', color: 'bg-green-100 text-green-700', title: '肺腺癌新生物标志物研究突破', time: '5小时前' }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-50">
      {/* Hero Section */}
      <div className="relative overflow-hidden px-4 sm:px-6 lg:px-8 pt-12 pb-16 sm:pt-16 sm:pb-20">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-slate-900 mb-4 tracking-tight">
              大模型病理教学平台
            </h1>
            <p className="text-lg sm:text-xl text-slate-600 max-w-2xl mx-auto">
              探索病理，从这里开始。结合大模型技术，让病理教学更直观、更有趣。
            </p>
          </div>

          {/* Quick Stats */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-12">
            {[
              { icon: '📈', label: '已分析切片', value: '2,847' },
              { icon: '👥', label: '活跃用户', value: '1,234' },
              { icon: '🎓', label: '完成考试', value: '8,456' },
              { icon: '📚', label: '共享资源', value: '1,203' }
            ].map((stat, i) => (
              <div key={i} className="bg-white rounded-lg p-4 border border-slate-200 text-center hover:shadow-md transition-shadow">
                <div className="text-2xl mb-2">{stat.icon}</div>
                <p className="text-sm text-slate-600">{stat.label}</p>
                <p className="text-xl font-bold text-slate-900">{stat.value}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-20">
        
        {/* Featured Cards - Bento Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-12">
          
          {/* Main Featured Card */}
          <div
            onClick={() => onChangeView(features[0].view)}
            onMouseEnter={() => setHoveredCard('slide')}
            onMouseLeave={() => setHoveredCard(null)}
            className="lg:col-span-2 group relative bg-gradient-to-br from-blue-600 to-blue-700 rounded-2xl p-8 cursor-pointer overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-300 hover:-translate-y-1"
          >
            <div className="absolute inset-0 opacity-0 group-hover:opacity-10 bg-white transition-opacity duration-300"></div>
            <div className="relative z-10">
              <div className="flex justify-between items-start mb-8">
                <div className="text-5xl">{features[0].icon}</div>
                <div className="bg-white/20 backdrop-blur-sm px-3 py-1 rounded-full text-white text-xs font-semibold">
                  ⭐ 推荐
                </div>
              </div>
              <h2 className="text-3xl sm:text-4xl font-bold text-white mb-3">{features[0].title}</h2>
              <p className="text-blue-100 text-lg mb-6 max-w-md">{features[0].description}</p>
              <div className="flex items-center justify-between">
                <span className="text-blue-100 text-sm font-medium">{features[0].stats}</span>
                <div className="bg-white/20 backdrop-blur-sm p-3 rounded-lg group-hover:bg-white/30 transition-colors">
                  <ArrowRight className="w-5 h-5 text-white" />
                </div>
              </div>
            </div>
          </div>

          {/* Secondary Featured Card */}
          <div
            onClick={() => onChangeView(features[3].view)}
            onMouseEnter={() => setHoveredCard('research')}
            onMouseLeave={() => setHoveredCard(null)}
            className="group relative bg-gradient-to-br from-purple-600 to-purple-700 rounded-2xl p-8 cursor-pointer overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-300 hover:-translate-y-1"
          >
            <div className="absolute inset-0 opacity-0 group-hover:opacity-10 bg-white transition-opacity duration-300"></div>
            <div className="relative z-10">
              <div className="flex justify-between items-start mb-8">
                <div className="text-5xl">{features[3].icon}</div>
                <div className="bg-white/20 backdrop-blur-sm px-3 py-1 rounded-full text-white text-xs font-semibold">
                  ⭐ 推荐
                </div>
              </div>
              <h2 className="text-2xl font-bold text-white mb-3">{features[3].title}</h2>
              <p className="text-purple-100 text-sm mb-6">{features[3].description}</p>
              <span className="text-purple-100 text-xs font-medium">{features[3].stats}</span>
            </div>
          </div>
        </div>

        {/* Feature Grid */}
        <div className="mb-12">
          <h3 className="text-2xl font-bold text-slate-900 mb-6">所有功能</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.slice(1, 3).concat(features.slice(4)).map((feature) => (
              <div
                key={feature.id}
                onClick={() => onChangeView(feature.view)}
                onMouseEnter={() => setHoveredCard(feature.id)}
                onMouseLeave={() => setHoveredCard(null)}
                className="group relative bg-white rounded-xl p-6 border border-slate-200 cursor-pointer overflow-hidden shadow-sm hover:shadow-lg transition-all duration-300 hover:-translate-y-1"
              >
                <div className="absolute inset-0 bg-gradient-to-br from-slate-50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                <div className="relative z-10">
                  <div className="flex items-start justify-between mb-4">
                    <div className="text-4xl">{feature.icon}</div>
                    <ChevronRight className={`w-5 h-5 text-slate-400 group-hover:text-slate-600 transition-all duration-300 ${hoveredCard === feature.id ? 'translate-x-1' : ''}`} />
                  </div>
                  <h3 className="text-xl font-bold text-slate-900 mb-2">{feature.title}</h3>
                  <p className="text-slate-600 text-sm mb-4 line-clamp-2">{feature.description}</p>
                  <div className="flex items-center justify-between pt-4 border-t border-slate-100">
                    <span className="text-xs text-slate-500 font-medium">{feature.stats}</span>
                    <Zap className="w-4 h-4 text-slate-400" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* News & Updates Section */}
        <div className="bg-white rounded-2xl p-8 border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h3 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
                <TrendingUp className="w-6 h-6 text-blue-600" />
                最新动态
              </h3>
              <p className="text-slate-600 text-sm mt-1">病理教学领域的最新资讯和突破</p>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {news.map((item, i) => (
              <div key={i} className="group relative bg-gradient-to-br from-slate-50 to-slate-100 p-6 rounded-xl border border-slate-200 hover:border-slate-300 hover:shadow-md transition-all duration-300 cursor-pointer overflow-hidden">
                <div className="absolute inset-0 opacity-0 group-hover:opacity-100 bg-gradient-to-br from-blue-50 to-transparent transition-opacity duration-300"></div>
                <div className="relative z-10">
                  <div className="flex items-center justify-between mb-3">
                    <span className={`px-3 py-1 rounded-full text-xs font-semibold ${item.color}`}>
                      {item.tag}
                    </span>
                    <span className="text-xs text-slate-500 flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {item.time}
                    </span>
                  </div>
                  <p className="font-semibold text-slate-900 group-hover:text-blue-600 transition-colors line-clamp-3">
                    {item.title}
                  </p>
                  <div className="mt-4 flex items-center text-blue-600 text-sm font-medium opacity-0 group-hover:opacity-100 transition-opacity">
                    阅读更多 <ArrowRight className="w-3 h-3 ml-1" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* CTA Section */}
        <div className="mt-12 bg-gradient-to-r from-blue-600 to-blue-700 rounded-2xl p-8 sm:p-12 text-center text-white shadow-lg">
          <h3 className="text-2xl sm:text-3xl font-bold mb-3">准备好开始学习了吗？</h3>
          <p className="text-blue-100 mb-6 max-w-2xl mx-auto">
            选择上方任意功能开始探索病理的奥秘，AI 导师随时准备帮助你。
          </p>
          <button
            onClick={() => onChangeView(AppView.SLIDE_ANALYSIS)}
            className="inline-flex items-center gap-2 bg-white text-blue-600 px-8 py-3 rounded-lg font-semibold hover:bg-blue-50 transition-colors"
          >
            <Microscope className="w-5 h-5" />
            进入 AI 阅片室
          </button>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;