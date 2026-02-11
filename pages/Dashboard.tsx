import React from 'react';
import { Microscope, BookOpen, GraduationCap, ArrowRight, Activity, TrendingUp, Users, Box, Eye, Database } from 'lucide-react';
import { AppView } from '../types';

interface DashboardProps {
  onChangeView: (view: AppView) => void;
}

const Dashboard: React.FC<DashboardProps> = ({ onChangeView }) => {
  return (
    <div className="p-6 md:p-10 max-w-7xl mx-auto space-y-8 animate-fade-in bg-gray-50">
      
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 tracking-tight">
            今天想 <span className="text-gray-700">探索</span> 什么？
          </h1>
        </div>
      </div>

      {/* Bento Grid Layout */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        
        {/* Main Card: Slide Analysis */}
        <div 
          onClick={() => onChangeView(AppView.SLIDE_ANALYSIS)}
          className="group md:col-span-2 bg-white border border-gray-200 rounded-xl p-8 relative overflow-hidden cursor-pointer shadow-sm hover:shadow-md transition-all duration-300 hover:-translate-y-1"
        >
          <div className="relative z-10 flex flex-col h-full justify-between">
            <div className="flex justify-between items-start">
              <div className="p-3 bg-gray-100 rounded-lg">
                <Microscope className="w-8 h-8 text-gray-700" />
              </div>
            </div>
            
            <div className="mt-8">
              <h2 className="text-3xl font-bold mb-2 text-gray-900">智能阅片室</h2>
              <p className="text-gray-600 max-w-md text-lg">
                上传切片，AI 导师帮你分析形态、特征与诊断思路。
              </p>
            </div>
            
            <div className="mt-6 flex items-center font-medium text-sm bg-gray-900 text-white w-fit px-5 py-2.5 rounded-lg hover:bg-gray-800 transition-colors">
              立即开始 <ArrowRight className="w-4 h-4 ml-2" />
            </div>
          </div>
        </div>

        {/* 3D Anatomy */}
        <div 
           onClick={() => onChangeView(AppView.ANATOMY)}
           className="bg-white rounded-xl p-6 border border-gray-200 relative overflow-hidden cursor-pointer shadow-sm hover:shadow-md transition-all duration-300 hover:-translate-y-1"
        >
          <div className="p-3 bg-gray-100 w-fit rounded-lg mb-4 text-gray-700">
            <Activity className="w-6 h-6" />
          </div>
          <h3 className="text-xl font-bold text-gray-900 mb-1">3D 解剖模拟</h3>
          <p className="text-gray-600 text-sm mb-4">
            调整血管/肌肉参数，AI 实时解读生理变化。
          </p>
        </div>

        {/* Cell Counting */}
        <div 
           onClick={() => onChangeView(AppView.QUANTIFICATION)}
           className="bg-white rounded-xl p-6 border border-gray-200 relative overflow-hidden cursor-pointer shadow-sm hover:shadow-md transition-all duration-300 hover:-translate-y-1"
        >
          <div className="p-3 bg-gray-100 w-fit rounded-lg mb-4 text-gray-700">
            <Eye className="w-6 h-6" />
          </div>
          <h3 className="text-xl font-bold text-gray-900 mb-1">细胞计数</h3>
          <p className="text-gray-600 text-sm mb-4">
            智能识别与计数，精确量化分析。
          </p>
        </div>

        {/* Research */}
        <div 
          onClick={() => onChangeView(AppView.RESEARCH_ASSISTANT)}
          className="md:col-span-2 bg-white border border-gray-200 rounded-xl p-8 relative overflow-hidden cursor-pointer shadow-sm hover:shadow-md transition-all duration-300 hover:-translate-y-1"
        >
           <div className="relative z-10 flex flex-row items-center justify-between">
             <div>
                <div className="p-3 bg-gray-100 rounded-lg w-fit mb-4">
                  <BookOpen className="w-8 h-8 text-gray-700" />
                </div>
                <h3 className="text-2xl font-bold mb-2 text-gray-900">科研思路导航</h3>
                <p className="text-gray-600 max-w-sm">
                  输入样本信息，AI 推荐实验方案、参考文献与多维度分析。
                </p>
             </div>
             <div className="hidden md:flex items-center justify-center">
                <Database className="w-16 h-16 text-gray-300" />
             </div>
           </div>
        </div>

        {/* Collab Library */}
        <div 
           onClick={() => onChangeView(AppView.COLLAB_LIBRARY)}
           className="bg-white rounded-xl p-6 border border-gray-200 relative overflow-hidden cursor-pointer shadow-sm hover:shadow-md transition-all duration-300 hover:-translate-y-1"
        >
          <div className="p-3 bg-gray-100 w-fit rounded-lg mb-4 text-gray-700">
            <Users className="w-6 h-6" />
          </div>
          <h3 className="text-xl font-bold text-gray-900 mb-1">协同资源库</h3>
          <p className="text-gray-600 text-sm">
            师生共用切片库，支持发布任务与AI批改。
          </p>
        </div>

        {/* Exam System */}
        <div 
           onClick={() => onChangeView(AppView.EXAM_SYSTEM)}
           className="bg-white rounded-xl p-6 border border-gray-200 relative overflow-hidden cursor-pointer shadow-sm hover:shadow-md transition-all duration-300 hover:-translate-y-1"
        >
          <div className="p-3 bg-gray-100 w-fit rounded-lg mb-4 text-gray-700">
            <GraduationCap className="w-6 h-6" />
          </div>
          <h3 className="text-xl font-bold text-gray-900 mb-1">考试中心</h3>
          <p className="text-gray-600 text-sm">
            智能组卷、自动批改、错题总结。
          </p>
        </div>

      </div>

      {/* News Feed */}
      <div className="bg-white rounded-xl p-8 mt-8 border border-gray-200 shadow-sm">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-xl font-bold text-gray-900 flex items-center">
            <TrendingUp className="w-5 h-5 mr-2 text-gray-700" />
            最新新闻
          </h3>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[
            { tag: "前沿", color: "bg-gray-100 text-gray-700", title: "WHO 软组织肉瘤新分类出炉", time: "刚刚" },
            { tag: "技术", color: "bg-gray-100 text-gray-700", title: "FDA 批准首个前列腺癌 AI 辅助检测", time: "2小时前" },
            { tag: "科研", color: "bg-gray-100 text-gray-700", title: "肺腺癌新生物标志物研究突破", time: "5小时前" }
          ].map((item, i) => (
            <div key={i} className="bg-gray-50 p-4 rounded-lg border border-gray-100 hover:bg-gray-100 transition-colors cursor-pointer group">
              <div className="flex items-center justify-between mb-2">
                <span className={`px-2 py-0.5 rounded text-[10px] font-medium uppercase tracking-wider ${item.color}`}>
                  {item.tag}
                </span>
                <span className="text-xs text-gray-500 flex items-center">
                  <TrendingUp className="w-3 h-3 mr-1" /> {item.time}
                </span>
              </div>
              <p className="font-medium text-gray-800 group-hover:text-gray-900 transition-colors line-clamp-2">
                {item.title}
              </p>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
};

export default Dashboard;