import React, { useState, useEffect, useCallback } from 'react';
import { 
  User as UserIcon, Clock, Activity, BookOpen, Download, Trophy, 
  BarChart3, TrendingUp, RefreshCw, AlertCircle, LogIn, Calendar
} from 'lucide-react';
import { authAPI, examAPI, activityAPI } from '../services/apiService';
import { UserStats, UserActivity, ExamRecord } from '../types';
import { useTheme } from '../context/ThemeContext';

const UserProfile: React.FC = () => {
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  const [stats, setStats] = useState<UserStats | null>(null);
  const [activities, setActivities] = useState<UserActivity[]>([]);
  const [examRecords, setExamRecords] = useState<ExamRecord[]>([]);
  
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'overview' | 'activities' | 'exams'>('overview');

  const loadUserData = useCallback(async () => {
    const token = localStorage.getItem('auth_token');
    if (!token) {
      setError('AUTH_MISSING');
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      
      // 进入个人中心时自动记录一次足迹，激活统计数据
      activityAPI.logActivity('login', '个人进度', { action: 'view_dashboard' }).catch(() => {});
      
      const [statsData, activitiesData, examData] = await Promise.allSettled([
        authAPI.getUserStats(),
        authAPI.getUserActivities(50),
        examAPI.getUserExamRecords(20)
      ]);
      
      if (statsData.status === 'fulfilled') {
        setStats(statsData.value);
      }
      if (activitiesData.status === 'fulfilled') {
        setActivities(activitiesData.value);
      }
      if (examData.status === 'fulfilled') {
        setExamRecords(examData.value);
      }

    } catch (err: any) {
      console.error('数据加载异常:', err);
      if (err.message?.includes('401') || err.message?.includes('访问令牌')) {
        setError('AUTH_INVALID');
      } else {
        setError('FETCH_ERROR');
      }
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadUserData();
  }, [loadUserData]);

  const formatDuration = (seconds: number) => {
    if (!seconds || seconds <= 0) return '0s';
    if (seconds < 60) return `${seconds}s`;
    if (seconds < 3600) return `${Math.floor(seconds / 60)}m`;
    return `${Math.floor(seconds / 3600)}h ${Math.floor((seconds % 3600) / 60)}m`;
  };

  const getActivityTypeLabel = (type: string) => {
    const labels: Record<string, string> = {
      'login': '系统登录',
      'logout': '安全登出',
      'slide_analysis': 'AI 阅片',
      'quantification': '细胞计数',
      'research_chat': '科研对话',
      'exam_attempt': '测评考核',
      'anatomy_view': '3D 解剖',
      'resource_download': '文件下载',
      'resource_upload': '资源上传'
    };
    return labels[type] || type;
  };

  const RenderActivityIcon = ({ type, size = 20 }: { type: string, size?: number }) => {
    switch (type) {
      case 'login': return <LogIn size={size} />;
      case 'exam_attempt': return <Trophy size={size} />;
      case 'resource_download': return <Download size={size} />;
      case 'research_chat': return <BookOpen size={size} />;
      case 'slide_analysis': return <Activity size={size} />;
      case 'quantification': return <BarChart3 size={size} />;
      default: return <Activity size={size} />;
    }
  };

  if (error === 'AUTH_MISSING' || error === 'AUTH_INVALID') {
    return (
      <div className={`h-screen ${isDark ? 'bg-[#0b0f1a]' : 'bg-[#F5F7FA]'} flex items-center justify-center p-6`}>
        <div className={`max-w-md w-full p-10 rounded-[2.5rem] ${isDark ? 'bg-slate-800/40 border-slate-700' : 'bg-white'} border shadow-2xl text-center`}>
          <div className="w-20 h-20 bg-amber-50 rounded-3xl flex items-center justify-center mx-auto mb-6">
            <AlertCircle className="text-amber-500" size={40} />
          </div>
          <h2 className={`text-2xl font-black ${isDark ? 'text-white' : 'text-slate-900'} mb-2`}>访问令牌失效</h2>
          <p className="text-slate-400 text-sm mb-8 leading-relaxed">您的登录状态已过期或尚未登录，请重新认证以查看您的个人数据看板。</p>
          <button 
            onClick={() => window.location.href = '/login'}
            className="w-full py-4 bg-[#2D5CF7] text-white rounded-2xl font-black shadow-lg shadow-blue-500/30 hover:scale-[1.02] transition-transform flex items-center justify-center gap-2"
          >
            <LogIn size={20} />
            立即登录
          </button>
        </div>
      </div>
    );
  }

  if (loading && !stats) {
    return (
      <div className={`h-screen ${isDark ? 'bg-[#0b0f1a]' : 'bg-[#F5F7FA]'} flex items-center justify-center flex-col gap-6`}>
        <div className="relative">
          <div className="w-16 h-16 rounded-3xl border-4 border-slate-100 border-t-[#2D5CF7] animate-spin" />
          <Activity className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-[#2D5CF7] animate-pulse" size={24} />
        </div>
        <p className="text-sm font-black text-slate-400 uppercase tracking-widest">正在加载您的学习足迹...</p>
      </div>
    );
  }

  return (
    <div className={`min-h-screen ${isDark ? 'bg-[#0b0f1a]' : 'bg-[#F5F7FA]'} p-6 lg:p-12 transition-colors duration-500`}>
      <div className="max-w-[1400px] mx-auto space-y-10">
        
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div className="flex items-center gap-6">
            <div className="w-20 h-20 rounded-[2rem] bg-gradient-to-br from-[#2D5CF7] to-[#1a4bd3] flex items-center justify-center shadow-2xl shadow-blue-500/30 text-white transform hover:rotate-6 transition-transform">
              <UserIcon size={40} />
            </div>
            <div>
              <h1 className={`text-4xl font-black ${isDark ? 'text-white' : 'text-slate-900'} tracking-tight`}>个人中心</h1>
              <p className="text-xs text-slate-400 font-bold uppercase tracking-widest mt-2 flex items-center gap-2">
                <Calendar size={12} />
                数字教研足迹 · {new Date().toLocaleDateString('zh-CN')}
              </p>
            </div>
          </div>
          <button 
            onClick={loadUserData}
            className={`p-4 rounded-2xl ${isDark ? 'bg-slate-800/40 hover:bg-slate-800 text-slate-300' : 'bg-white hover:bg-slate-50 text-slate-600'} border border-transparent hover:border-blue-500/30 transition-all shadow-sm`}
          >
            <RefreshCw size={20} className={loading ? 'animate-spin text-blue-500' : ''} />
          </button>
        </div>

        <div className={`inline-flex p-2 ${isDark ? 'bg-slate-800/40 border-slate-700' : 'bg-white/60 border-white'} backdrop-blur-2xl rounded-[2.5rem] border shadow-xl`}>
          {[
            { id: 'overview', label: '核心概览', icon: BarChart3 },
            { id: 'activities', label: '我的足迹', icon: Clock },
            { id: 'exams', label: '测评档案', icon: Trophy }
          ].map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex items-center px-8 py-4 rounded-[2rem] text-sm font-black transition-all duration-500 gap-3 ${
                  activeTab === tab.id
                    ? 'bg-[#2D5CF7] text-white shadow-2xl shadow-blue-500/40 translate-y-[-2px]'
                    : isDark ? 'text-slate-400 hover:text-white hover:bg-white/5' : 'text-slate-500 hover:text-[#2D5CF7] hover:bg-white'
                }`}
              >
                <Icon size={20} />
                {tab.label}
              </button>
            );
          })}
        </div>

        <div className="min-h-[600px]">
          {activeTab === 'overview' && stats && (
            <div className="space-y-12 animate-in fade-in zoom-in-95 duration-500">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                {[
                  { label: '累计学习时长', val: formatDuration(stats.activities?.reduce((s, a) => s + (Number(a.total_duration) || 0), 0) || 0), icon: Clock, color: 'text-blue-500', bg: 'bg-blue-500/10' },
                  { label: '完成测评记录', val: stats.exams?.total_exams || 0, icon: Trophy, color: 'text-emerald-500', bg: 'bg-emerald-500/10' },
                  { label: '综合考核均分', val: stats.exams?.avg_score ? Math.round(stats.exams.avg_score) : 0, icon: BarChart3, color: 'text-purple-500', bg: 'bg-purple-500/10' },
                  { label: '教研资源互动', val: stats.downloads?.total_downloads || 0, icon: Download, color: 'text-orange-500', bg: 'bg-orange-500/10' }
                ].map((item, i) => (
                  <div key={i} className={`${isDark ? 'bg-slate-800/40 border-slate-700' : 'bg-white border-white'} rounded-[3rem] p-10 border shadow-2xl group hover:scale-[1.02] transition-transform`}>
                    <div className={`w-16 h-16 rounded-3xl ${item.bg} ${item.color} flex items-center justify-center mb-8 shadow-inner`}>
                      <item.icon size={32} />
                    </div>
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">{item.label}</p>
                    <p className={`text-4xl font-black ${isDark ? 'text-white' : 'text-slate-900'} tracking-tight`}>{item.val}</p>
                  </div>
                ))}
              </div>

              <div className={`${isDark ? 'bg-slate-800/40 border-slate-700' : 'bg-white border-white'} rounded-[3.5rem] p-10 lg:p-14 border shadow-2xl`}>
                <div className="flex items-center gap-4 mb-12">
                  <div className="w-12 h-12 rounded-2xl bg-indigo-500/10 text-indigo-500 flex items-center justify-center">
                    <TrendingUp size={24} />
                  </div>
                  <div>
                    <h3 className={`text-2xl font-black ${isDark ? 'text-white' : 'text-slate-900'} tracking-tight`}>模块使用分布</h3>
                    <p className="text-xs text-slate-400 font-bold uppercase tracking-widest">Digital footprint by module</p>
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                  {stats.activities && stats.activities.length > 0 ? stats.activities.map((activity) => (
                    <div key={activity.activity_type} className={`p-8 ${isDark ? 'bg-slate-900/50 border-slate-800' : 'bg-slate-50 border-slate-100'} border rounded-[2.5rem] flex items-center justify-between group`}>
                      <div className="flex items-center gap-5">
                        <div className={`w-14 h-14 rounded-2xl ${isDark ? 'bg-slate-800' : 'bg-white'} text-[#2D5CF7] flex items-center justify-center shadow-lg group-hover:rotate-12 transition-transform`}>
                          <RenderActivityIcon type={activity.activity_type} size={24} />
                        </div>
                        <div>
                          <p className={`text-base font-black ${isDark ? 'text-white' : 'text-slate-900'}`}>{getActivityTypeLabel(activity.activity_type)}</p>
                          <p className="text-[10px] text-slate-400 font-bold mt-1 uppercase">{activity.count || 0} 次活跃记录</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className={`text-sm font-black ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
                          {formatDuration(activity.total_duration)}
                        </p>
                      </div>
                    </div>
                  )) : (
                    <div className="col-span-full py-20 text-center opacity-50">
                      <BarChart3 className="mx-auto mb-4 text-slate-300" size={48} />
                      <p className="text-sm font-black text-slate-400 uppercase tracking-widest">暂无活跃数据</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {activeTab === 'activities' && (
            <div className={`${isDark ? 'bg-slate-800/40 border-slate-700' : 'bg-white border-white'} rounded-[3.5rem] border shadow-2xl overflow-hidden animate-in slide-in-from-right-4 duration-500`}>
              <div className="p-10 border-b border-inherit flex justify-between items-center">
                <h3 className={`text-2xl font-black ${isDark ? 'text-white' : 'text-slate-900'} tracking-tight`}>近期足迹</h3>
                <span className="px-5 py-2 rounded-full bg-blue-500/10 text-[#2D5CF7] text-[10px] font-black uppercase tracking-widest">
                  Recent logs
                </span>
              </div>
              <div className="max-h-[700px] overflow-y-auto scrollbar-hide divide-y divide-inherit">
                {activities && activities.length > 0 ? activities.map((activity) => (
                  <div key={activity.id} className={`p-10 ${isDark ? 'hover:bg-white/5' : 'hover:bg-slate-50/50'} transition-all group`}>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-8">
                        <div className={`w-16 h-16 rounded-[1.5rem] ${isDark ? 'bg-slate-800' : 'bg-white'} text-[#2D5CF7] flex items-center justify-center shadow-xl group-hover:scale-110 transition-transform`}>
                          <RenderActivityIcon type={activity.activity_type} size={24} />
                        </div>
                        <div>
                          <p className={`text-xl font-black ${isDark ? 'text-white' : 'text-slate-900'} tracking-tight`}>
                            {getActivityTypeLabel(activity.activity_type)}
                          </p>
                          <div className="flex items-center gap-3 mt-2">
                            <span className="w-2 h-2 rounded-full bg-[#2D5CF7]" />
                            <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">
                              {activity.module_name || '系统核心'}
                            </p>
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className={`text-sm font-black ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
                          {activity.created_at ? new Date(activity.created_at).toLocaleString('zh-CN') : '未知时间'}
                        </p>
                        {activity.duration_seconds > 0 && (
                          <span className="inline-block mt-3 px-3 py-1 bg-emerald-500/10 text-emerald-500 rounded-lg text-[10px] font-black">
                            {formatDuration(activity.duration_seconds)}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                )) : (
                  <div className="py-40 text-center">
                    <Clock className="mx-auto mb-6 text-slate-200" size={64} />
                    <p className="text-sm font-black text-slate-300 uppercase tracking-widest font-black">记录一片空白</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {activeTab === 'exams' && (
            <div className={`${isDark ? 'bg-slate-800/40 border-slate-700' : 'bg-white border-white'} rounded-[3.5rem] border shadow-2xl overflow-hidden animate-in slide-in-from-left-4 duration-500`}>
              <div className="p-10 border-b border-inherit">
                <h3 className={`text-2xl font-black ${isDark ? 'text-white' : 'text-slate-900'} tracking-tight`}>测评档案</h3>
              </div>
              <div className="overflow-x-auto scrollbar-hide">
                <table className="w-full">
                  <thead>
                    <tr className={isDark ? 'bg-slate-900/50' : 'bg-slate-50/50'}>
                      <th className="px-10 py-8 text-left text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">考核项目</th>
                      <th className="px-10 py-8 text-left text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">得分效能</th>
                      <th className="px-10 py-8 text-left text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">时长</th>
                      <th className="px-10 py-8 text-left text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">日期</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-inherit">
                    {examRecords && examRecords.length > 0 ? examRecords.map((record) => {
                      const score = Number(record.score) || 0;
                      const total = Number(record.total_score) || 100;
                      const ratio = score / total;
                      return (
                        <tr key={record.id} className={`${isDark ? 'hover:bg-white/5' : 'hover:bg-slate-50/50'} transition-colors`}>
                          <td className="px-10 py-10 font-black text-lg text-inherit">{record.exam_title}</td>
                          <td className="px-10 py-10">
                            <div className="flex items-center gap-4">
                              <span className={`px-4 py-1.5 rounded-xl font-black text-xs ${
                                ratio >= 0.8 ? 'bg-emerald-500/10 text-emerald-500' : 
                                ratio >= 0.6 ? 'bg-amber-500/10 text-amber-500' : 'bg-rose-500/10 text-rose-500'
                              }`}>
                                {score} / {total}
                              </span>
                              <div className="flex-1 max-w-[100px] h-1.5 bg-slate-100 rounded-full overflow-hidden">
                                <div className="h-full bg-[#2D5CF7] rounded-full" style={{ width: `${Math.min(100, ratio * 100)}%` }} />
                              </div>
                            </div>
                          </td>
                          <td className="px-10 py-10 font-black text-sm text-slate-500">{record.duration_minutes || 0} min</td>
                          <td className="px-10 py-10 text-xs font-bold text-slate-400">
                            {record.created_at ? new Date(record.created_at).toLocaleDateString() : '未知'}
                          </td>
                        </tr>
                      );
                    }) : (
                      <tr>
                        <td colSpan={4} className="py-40 text-center">
                          <Trophy className="mx-auto mb-6 text-slate-200" size={64} />
                          <p className="text-sm font-black text-slate-300 uppercase tracking-widest font-black">暂无测评记录</p>
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default UserProfile;
