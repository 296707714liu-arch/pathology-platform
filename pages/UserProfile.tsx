import React, { useState, useEffect } from 'react';
import { User, Clock, Activity, BookOpen, Download, Trophy, Calendar, BarChart3, TrendingUp } from 'lucide-react';
import { authAPI, examAPI } from '../services/apiService';
import { UserStats, UserActivity, ExamRecord } from '../types';

const UserProfile: React.FC = () => {
  const [stats, setStats] = useState<UserStats | null>(null);
  const [activities, setActivities] = useState<UserActivity[]>([]);
  const [examRecords, setExamRecords] = useState<ExamRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'overview' | 'activities' | 'exams'>('overview');

  useEffect(() => {
    loadUserData();
  }, []);

  const loadUserData = async () => {
    try {
      setLoading(true);
      const [statsData, activitiesData, examData] = await Promise.all([
        authAPI.getUserStats(),
        authAPI.getUserActivities(50),
        examAPI.getUserExamRecords(20)
      ]);
      
      setStats(statsData);
      setActivities(activitiesData);
      setExamRecords(examData);
    } catch (error) {
      console.error('加载用户数据失败:', error);
    } finally {
      setLoading(false);
    }
  };

  const getActivityTypeLabel = (type: string) => {
    const labels: { [key: string]: string } = {
      'login': '登录',
      'logout': '登出',
      'slide_analysis': 'AI阅片',
      'quantification': '细胞计数',
      'research_chat': '学术研究',
      'exam_attempt': '考试测验',
      'anatomy_view': '3D解剖',
      'immersive_lab': 'VR实训',
      'resource_download': '资源下载',
      'resource_upload': '资源上传'
    };
    return labels[type] || type;
  };

  const getActivityIcon = (type: string) => {
    const icons: { [key: string]: React.ReactNode } = {
      'login': <User className="w-4 h-4" />,
      'logout': <User className="w-4 h-4" />,
      'slide_analysis': <Activity className="w-4 h-4" />,
      'quantification': <BarChart3 className="w-4 h-4" />,
      'research_chat': <BookOpen className="w-4 h-4" />,
      'exam_attempt': <Trophy className="w-4 h-4" />,
      'anatomy_view': <Activity className="w-4 h-4" />,
      'immersive_lab': <Activity className="w-4 h-4" />,
      'resource_download': <Download className="w-4 h-4" />,
      'resource_upload': <TrendingUp className="w-4 h-4" />
    };
    return icons[type] || <Activity className="w-4 h-4" />;
  };

  const formatDuration = (seconds: number) => {
    if (seconds < 60) return `${seconds}秒`;
    if (seconds < 3600) return `${Math.floor(seconds / 60)}分钟`;
    return `${Math.floor(seconds / 3600)}小时${Math.floor((seconds % 3600) / 60)}分钟`;
  };

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 mx-auto mb-4"></div>
          <p className="text-gray-600">加载中...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100 p-6">
      <div className="max-w-7xl mx-auto">
        {/* 页面标题 */}
        <div className="mb-8">
          <div className="flex items-center mb-4">
            <div className="w-12 h-12 bg-gray-900 rounded-xl flex items-center justify-center mr-4">
              <User className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-slate-800">个人中心</h1>
              <p className="text-slate-600">查看您的学习记录和统计信息</p>
            </div>
          </div>
        </div>

        {/* 标签页导航 */}
        <div className="mb-8">
          <div className="flex space-x-1 bg-white/80 backdrop-blur-md rounded-2xl p-1 border border-slate-200/50 shadow-sm">
            {[
              { id: 'overview', label: '概览', icon: BarChart3 },
              { id: 'activities', label: '活动记录', icon: Clock },
              { id: 'exams', label: '考试记录', icon: Trophy }
            ].map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`flex items-center px-6 py-3 rounded-xl font-medium transition-all ${
                    activeTab === tab.id
                      ? 'bg-gray-900 text-white shadow-lg'
                      : 'text-gray-600 hover:bg-gray-50'
                  }`}
                >
                  <Icon className="w-4 h-4 mr-2" />
                  {tab.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* 概览标签页 */}
        {activeTab === 'overview' && stats && (
          <div className="space-y-8">
            {/* 统计卡片 */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="bg-white/80 backdrop-blur-md rounded-2xl p-6 border border-slate-200/50 shadow-sm">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-slate-600 text-sm">总学习时长</p>
                    <p className="text-2xl font-bold text-slate-800">
                      {formatDuration(stats.activities.reduce((sum: number, act: any) => sum + (parseInt(act.total_duration) || 0), 0))}
                    </p>
                  </div>
                  <div className="w-12 h-12 bg-gray-100 rounded-xl flex items-center justify-center">
                    <Clock className="w-6 h-6 text-gray-600" />
                  </div>
                </div>
              </div>

              <div className="bg-white/80 backdrop-blur-md rounded-2xl p-6 border border-slate-200/50 shadow-sm">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-slate-600 text-sm">考试次数</p>
                    <p className="text-2xl font-bold text-slate-800">{stats.exams.total_exams}</p>
                  </div>
                  <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
                    <Trophy className="w-6 h-6 text-green-600" />
                  </div>
                </div>
              </div>

              <div className="bg-white/80 backdrop-blur-md rounded-2xl p-6 border border-slate-200/50 shadow-sm">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-slate-600 text-sm">平均分数</p>
                    <p className="text-2xl font-bold text-slate-800">
                      {stats.exams.avg_score ? Math.round(stats.exams.avg_score) : 0}
                    </p>
                  </div>
                  <div className="w-12 h-12 bg-gray-100 rounded-xl flex items-center justify-center">
                    <BarChart3 className="w-6 h-6 text-gray-600" />
                  </div>
                </div>
              </div>

              <div className="bg-white/80 backdrop-blur-md rounded-2xl p-6 border border-slate-200/50 shadow-sm">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-slate-600 text-sm">资源下载</p>
                    <p className="text-2xl font-bold text-slate-800">{stats.downloads.total_downloads}</p>
                  </div>
                  <div className="w-12 h-12 bg-orange-100 rounded-xl flex items-center justify-center">
                    <Download className="w-6 h-6 text-orange-600" />
                  </div>
                </div>
              </div>
            </div>

            {/* 活动类型统计 */}
            <div className="bg-white/80 backdrop-blur-md rounded-2xl p-6 border border-slate-200/50 shadow-sm">
              <h3 className="text-lg font-semibold text-slate-800 mb-4">模块使用统计</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {stats.activities.map((activity) => (
                  <div key={activity.activity_type} className="flex items-center justify-between p-4 bg-slate-50 rounded-xl">
                    <div className="flex items-center">
                      {getActivityIcon(activity.activity_type)}
                      <div className="ml-3">
                        <p className="font-medium text-slate-800">{getActivityTypeLabel(activity.activity_type)}</p>
                        <p className="text-sm text-slate-500">{activity.count} 次使用</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-medium text-slate-600">
                        {formatDuration(activity.total_duration)}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* 活动记录标签页 */}
        {activeTab === 'activities' && (
          <div className="bg-white/80 backdrop-blur-md rounded-2xl border border-slate-200/50 shadow-sm overflow-hidden">
            <div className="p-6 border-b border-slate-200">
              <h3 className="text-lg font-semibold text-slate-800">最近活动记录</h3>
              <p className="text-slate-600 text-sm">显示最近50条活动记录</p>
            </div>
            <div className="divide-y divide-slate-200">
              {activities.map((activity) => (
                <div key={activity.id} className="p-6 hover:bg-slate-50/50 transition-colors">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <div className="w-10 h-10 bg-slate-100 rounded-full flex items-center justify-center mr-4">
                        {getActivityIcon(activity.activity_type)}
                      </div>
                      <div>
                        <p className="font-medium text-slate-800">
                          {getActivityTypeLabel(activity.activity_type)}
                        </p>
                        {activity.module_name && (
                          <p className="text-sm text-slate-500">模块: {activity.module_name}</p>
                        )}
                        {activity.details && Object.keys(activity.details).length > 0 && (
                          <p className="text-xs text-slate-400 mt-1">
                            {JSON.stringify(activity.details)}
                          </p>
                        )}
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-sm text-slate-600">
                        {new Date(activity.created_at).toLocaleString('zh-CN')}
                      </p>
                      {activity.duration_seconds > 0 && (
                        <p className="text-xs text-slate-500">
                          时长: {formatDuration(activity.duration_seconds)}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              ))}
              {activities.length === 0 && (
                <div className="p-12 text-center">
                  <Clock className="w-12 h-12 text-slate-400 mx-auto mb-4" />
                  <p className="text-slate-500">暂无活动记录</p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* 考试记录标签页 */}
        {activeTab === 'exams' && (
          <div className="bg-white/80 backdrop-blur-md rounded-2xl border border-slate-200/50 shadow-sm overflow-hidden">
            <div className="p-6 border-b border-slate-200">
              <h3 className="text-lg font-semibold text-slate-800">考试记录</h3>
              <p className="text-slate-600 text-sm">显示最近20次考试记录</p>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-slate-50/50">
                  <tr>
                    <th className="px-6 py-4 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">考试名称</th>
                    <th className="px-6 py-4 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">分数</th>
                    <th className="px-6 py-4 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">用时</th>
                    <th className="px-6 py-4 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">考试时间</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {examRecords.map((record) => (
                    <tr key={record.id} className="hover:bg-slate-50/50 transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="font-medium text-slate-800">{record.exam_title}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                            (parseFloat(record.score as any) / parseFloat(record.total_score as any)) >= 0.8 
                              ? 'bg-green-100 text-green-800'
                              : (parseFloat(record.score as any) / parseFloat(record.total_score as any)) >= 0.6
                              ? 'bg-yellow-100 text-yellow-800'
                              : 'bg-red-100 text-red-800'
                          }`}>
                            {record.score}/{record.total_score}
                          </span>
                          <span className="ml-2 text-sm text-slate-500">
                            ({Math.round((parseFloat(record.score as any) / parseFloat(record.total_score as any)) * 100)}%)
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-600">
                        {record.duration_minutes} 分钟
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500">
                        {new Date(record.created_at).toLocaleString('zh-CN')}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {examRecords.length === 0 && (
                <div className="p-12 text-center">
                  <Trophy className="w-12 h-12 text-slate-400 mx-auto mb-4" />
                  <p className="text-slate-500">暂无考试记录</p>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default UserProfile;