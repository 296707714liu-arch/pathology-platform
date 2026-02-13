import React, { useState, useEffect } from 'react';
import { Users, FileText, Upload, Download, Trash2, X, BookOpen, FileCode, Briefcase, AlertCircle, ChevronRight, Folder, Calendar } from 'lucide-react';
import { Resource, CreateResourceData, User as UserType } from '../types';
import { resourceAPI, activityAPI } from '../services/apiService';
import { useTheme } from '../context/ThemeContext';

interface CollaborativeLibraryProps {
  user: UserType | null;
}

// 定义资源类别
const RESOURCE_CATEGORIES = [
  { id: 'slide', label: '切片', icon: FileText, color: 'bg-blue-100 text-blue-600' },
  { id: 'case', label: '病例', icon: BookOpen, color: 'bg-green-100 text-green-600' },
  { id: 'assignment', label: '作业', icon: FileCode, color: 'bg-purple-100 text-purple-600' },
  { id: 'document', label: '课件', icon: Briefcase, color: 'bg-orange-100 text-orange-600' },
  { id: 'video', label: '视频', icon: FileText, color: 'bg-red-100 text-red-600' },
  { id: 'other', label: '其他', icon: FileText, color: 'bg-slate-100 text-slate-600' }
];

const CollaborativeLibrary: React.FC<CollaborativeLibraryProps> = ({ user }) => {
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  const [resources, setResources] = useState<Resource[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [uploadData, setUploadData] = useState<CreateResourceData>({
    title: '',
    description: '',
    type: 'slide' as const,
    tags: [],
    is_public: true
  });
  const [uploadFile, setUploadFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    if (selectedCategory) {
      loadResources();
    }
  }, [selectedCategory]);

  const loadResources = async () => {
    try {
      setLoading(true);
      const result = await resourceAPI.getResources({
        page: 1,
        limit: 20,
        type: selectedCategory || undefined
      });
      setResources(result.resources);
    } catch (error) {
      console.error('加载资源失败:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleUpload = async () => {
    if (!uploadFile) {
      alert('请选择要上传的文件');
      return;
    }

    if (!uploadData.title || uploadData.title.trim() === '') {
      alert('请填写资源标题');
      return;
    }

    if (!selectedCategory) {
      alert('请选择资源类别');
      return;
    }

    try {
      setUploading(true);
      // 确保type被设置为当前选中的类别
      const uploadDataWithType = { ...uploadData, type: selectedCategory as any };
      console.log('开始上传:', { file: uploadFile.name, data: uploadDataWithType });
      
      await resourceAPI.uploadResource(uploadFile, uploadDataWithType);
      
      setShowUploadModal(false);
      setUploadData({
        title: '',
        description: '',
        type: selectedCategory as any,
        tags: [],
        is_public: true
      });
      setUploadFile(null);
      
      await loadResources();
      alert('✅ 资源上传成功！');
    } catch (error) {
      console.error('上传失败:', error);
      const errorMessage = error instanceof Error ? error.message : '上传失败，请稍后重试';
      alert(`❌ ${errorMessage}`);
    } finally {
      setUploading(false);
    }
  };

  const handleDownload = async (resource: Resource) => {
    try {
      await resourceAPI.downloadResource(resource.id);
      await activityAPI.logActivity('resource_download', '协同资源库', { resource_id: resource.id, resource_title: resource.title });
    } catch (error) {
      console.error('下载失败:', error);
      alert('下载失败，请稍后重试');
    }
  };

  const handleDelete = async (resourceId: string) => {
    if (!window.confirm('确定要删除这个资源吗？')) return;

    try {
      await resourceAPI.deleteResource(resourceId);
      setResources(resources.filter(r => r.id !== resourceId));
      alert('资源已删除');
    } catch (error) {
      console.error('删除失败:', error);
      alert('删除失败，请稍后重试');
    }
  };

  const canUpload = user && (user.role === 'teacher' || user.role === 'admin');
  const canDelete = (resource: Resource) => {
    if (!user) return false;
    // 管理员或老师可以删除任何资源，以便清理历史数据
    if (user.role === 'admin' || user.role === 'teacher') return true;
    // 学生只能删除自己的（虽然学生通常不能上传）
    return user.id === resource.uploader_id;
  };

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

    return (
    <div className={`h-screen ${isDark ? 'bg-[#0b0f1a]' : 'bg-[#F5F7FA]'} flex`} style={{
      backgroundImage: isDark 
        ? 'radial-gradient(at 0% 0%, rgba(45, 92, 247, 0.1) 0px, transparent 50%), radial-gradient(at 100% 100%, rgba(39, 194, 76, 0.05) 0px, transparent 50%)'
        : 'radial-gradient(at 0% 0%, rgba(45, 92, 247, 0.02) 0px, transparent 50%), radial-gradient(at 100% 100%, rgba(39, 194, 76, 0.02) 0px, transparent 50%)'
    }}>
      {/* Left Sidebar - Controls */}
      <div className={`w-80 ${isDark ? 'bg-[#0d121f] border-slate-800' : 'bg-white/80 border-white/40'} backdrop-blur-xl border-r flex flex-col shadow-xl`}>
        {/* Page Header */}
        <div className={`p-8 border-b ${isDark ? 'border-slate-800' : 'border-slate-100/50'}`}>
          <div className="flex items-center gap-4 mb-2">
            <div className="w-12 h-12 rounded-2xl bg-[#2D5CF7] flex items-center justify-center shadow-lg shadow-blue-500/20">
              <Users className="w-7 h-7 text-white" />
            </div>
            <div>
              <h1 className={`text-xl font-black ${isDark ? 'text-white' : 'text-slate-900'} tracking-tight`}>协同资源库</h1>
              <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Global Resource Hub</p>
            </div>
          </div>
        </div>

        {/* Category Selection */}
        {!selectedCategory ? (
          <div className="flex-1 p-8 overflow-y-auto scrollbar-hide">
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-6 px-1">选择文件夹</h3>
            <div className="space-y-3">
              {RESOURCE_CATEGORIES.map((category) => {
                const Icon = category.icon;
                return (
                  <button
                    key={category.id}
                    onClick={() => setSelectedCategory(category.id)}
                    className={`w-full text-left px-4 py-3.5 rounded-2xl transition-all duration-300 flex items-center gap-3 font-bold text-sm ${isDark ? 'text-slate-400 hover:bg-white/5 hover:text-white border-transparent hover:border-slate-700' : 'text-slate-600 hover:bg-white/50 hover:text-[#2D5CF7] border-transparent hover:border-white'} shadow-sm hover:shadow-md border`}
                  >
                    <div className={`w-8 h-8 rounded-xl ${isDark ? 'bg-slate-800' : 'bg-slate-50'} flex items-center justify-center transition-colors`}>
                      <Folder size={18} className="text-slate-400" />
                    </div>
                    {category.label}
                  </button>
                );
              })}
            </div>
          </div>
        ) : (
          <>
            {/* Back Button */}
            <div className={`p-8 border-b ${isDark ? 'border-slate-800' : 'border-white/40'}`}>
              <button
                onClick={() => setSelectedCategory(null)}
                className="text-xs font-black text-[#2D5CF7] uppercase tracking-widest flex items-center gap-2 hover:translate-x-[-4px] transition-transform"
              >
                ← 返回文件夹列表
              </button>
              <h3 className={`text-xl font-black ${isDark ? 'text-white' : 'text-slate-900'} mt-4 tracking-tight`}>
                {RESOURCE_CATEGORIES.find(c => c.id === selectedCategory)?.label}
              </h3>
            </div>

            {/* Upload Button */}
            {canUpload && (
              <div className={`p-8 border-b ${isDark ? 'border-slate-800' : 'border-white/40'}`}>
                <button 
                  onClick={() => setShowUploadModal(true)}
                  className="w-full py-4 px-4 bg-[#2D5CF7] text-white rounded-2xl shadow-lg shadow-blue-500/25 hover:shadow-blue-500/40 transform hover:-translate-y-0.5 transition-all flex items-center justify-center gap-2 font-black text-sm"
                >
                  <Upload size={18} />
                  上传新资源
                </button>
              </div>
            )}

            {/* Resource Stats */}
            <div className={`p-8 border-b ${isDark ? 'border-slate-800' : 'border-white/40'}`}>
              <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-5 px-1">数据统计</h3>
              <div className="space-y-3">
                <div className={`flex justify-between items-center p-3.5 ${isDark ? 'bg-slate-800/40 border-slate-700' : 'bg-white/40 border-white/60'} border rounded-2xl shadow-sm`}>
                  <span className="text-xs font-bold text-slate-500">资源总数</span>
                  <span className="text-sm font-black text-[#2D5CF7]">{resources.length}</span>
                </div>
              </div>
            </div>

            {/* Usage Tips */}
            <div className="p-8">
              <div className={`${isDark ? 'bg-blue-900/20 border-blue-900/50' : 'bg-blue-50/50 border-blue-100'} backdrop-blur-sm border rounded-2xl p-4`}>
                <div className="flex items-center gap-2 mb-2">
                  <AlertCircle size={14} className="text-[#2D5CF7]" />
                  <h3 className={`text-[10px] font-black ${isDark ? 'text-blue-400' : 'text-blue-600'} uppercase tracking-widest`}>使用须知</h3>
                </div>
                <div className={`space-y-1.5 text-[10px] ${isDark ? 'text-blue-300/70' : 'text-blue-700/70'} font-medium leading-relaxed`}>
                  <p>• 资源按类别分类，请上传至对应文件夹</p>
                  <p>• 支持主流病理图片及多媒体教学格式</p>
                </div>
              </div>
            </div>
          </>
        )}
      </div>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Content Header */}
        <div className={`p-8 ${isDark ? 'bg-[#0b0f1a]/40 border-slate-800' : 'bg-white/40 border-slate-100/50'} backdrop-blur-md border-b flex justify-between items-center`}>
          <div>
            <h2 className={`text-2xl font-black ${isDark ? 'text-white' : 'text-slate-900'} tracking-tight`}>
              {!selectedCategory ? '工作空间' : '文件浏览器'}
            </h2>
            <p className="text-[11px] text-slate-400 font-bold uppercase tracking-[0.2em] mt-1">
              {!selectedCategory ? 'Select a category to browse' : `Browsing ${RESOURCE_CATEGORIES.find(c => c.id === selectedCategory)?.label}`}
            </p>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 overflow-y-auto p-10 scroll-smooth">
          {!selectedCategory ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {RESOURCE_CATEGORIES.map((category) => {
                const Icon = category.icon;
                return (
                  <button
                    key={category.id}
                    onClick={() => setSelectedCategory(category.id)}
                    className={`p-8 ${isDark ? 'bg-slate-800/40 border-slate-700 hover:shadow-black/40' : 'bg-white/80 border-white/60'} backdrop-blur-xl border rounded-[2.5rem] shadow-xl hover:shadow-2xl transition-all duration-500 hover:-translate-y-1.5 group text-left relative overflow-hidden`}
                  >
                    <div className={`absolute top-0 right-0 w-32 h-32 ${isDark ? 'bg-white/5' : 'bg-slate-50'} rounded-full -mr-16 -mt-16 group-hover:scale-110 transition-transform duration-500`} />
                    <div className="relative z-10">
                      <div className="flex items-center justify-between mb-8">
                        <div className={`w-14 h-14 rounded-2xl ${category.color.split(' ')[0]} flex items-center justify-center shadow-lg shadow-black/5`}>
                          <Icon size={28} className={category.color.split(' ')[1]} />
                        </div>
                        <ChevronRight className="text-slate-300 group-hover:text-[#2D5CF7] group-hover:translate-x-1 transition-all" />
                      </div>
                      <h3 className={`text-xl font-black ${isDark ? 'text-white' : 'text-slate-900'} mb-2`}>{category.label}库</h3>
                      <p className="text-sm text-slate-400 font-medium">点击进入资源管理界面</p>
                    </div>
                  </button>
                );
              })}
            </div>
          ) : (
            <>
              {loading ? (
                <div className="h-full flex items-center justify-center">
                  <div className="text-center">
                    <div className="relative w-24 h-24 mx-auto mb-6">
                      <div className={`absolute inset-0 rounded-2xl border-4 ${isDark ? 'border-slate-800' : 'border-slate-100'}`} />
                      <div className="absolute inset-0 rounded-2xl border-4 border-t-[#2D5CF7] animate-spin" />
                    </div>
                    <p className="text-sm font-black text-slate-400 uppercase tracking-widest animate-pulse">Syncing Library...</p>
                  </div>
                </div>
              ) : resources.length === 0 ? (
                <div className="h-full flex items-center justify-center">
                  <div className="text-center max-w-sm">
                    <div className={`w-24 h-24 rounded-[2.5rem] ${isDark ? 'bg-slate-800' : 'bg-white'} shadow-xl shadow-slate-200/50 flex items-center justify-center mx-auto mb-8 transform -rotate-6`}>
                      <Folder className="w-10 h-10 text-slate-200" />
                    </div>
                    <h3 className={`text-2xl font-black ${isDark ? 'text-white' : 'text-slate-900'} mb-3`}>此处暂无数据</h3>
                    <p className="text-sm text-slate-400 font-medium leading-relaxed">
                      {canUpload ? '由于本文件夹为空，您可以开始上传首份教研资源。' : '当前类别下尚未由教师发布任何学习资源。'}
                    </p>
                  </div>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                  {resources.map((resource) => (
                    <div key={resource.id} className={`${isDark ? 'bg-slate-800/40 border-slate-700' : 'bg-white/80 border-white/60'} backdrop-blur-xl border rounded-[2.5rem] p-8 shadow-xl hover:shadow-2xl transition-all group relative overflow-hidden`}>
                      <div className={`absolute top-0 right-0 w-32 h-32 ${isDark ? 'bg-white/5' : 'bg-slate-50'} rounded-full -mr-16 -mt-16 group-hover:scale-110 transition-transform duration-500`} />
                      
                      <div className="relative z-10 flex flex-col h-full">
                        <h3 className={`text-lg font-black ${isDark ? 'text-white' : 'text-slate-900'} mb-3 line-clamp-2 leading-tight`}>{resource.title}</h3>
                        <p className={`text-xs ${isDark ? 'text-slate-400' : 'text-slate-400'} font-medium mb-6 line-clamp-2 leading-relaxed`}>{resource.description || '无详细描述说明'}</p>
                        
                        <div className="grid grid-cols-1 gap-2.5 mb-8">
                          <div className={`flex items-center gap-3 p-3 ${isDark ? 'bg-slate-900/50 border-slate-800' : 'bg-slate-50/50 border-slate-100'} rounded-2xl border`}>
                            <FileText size={14} className="text-slate-400" />
                            <span className={`text-[10px] font-black ${isDark ? 'text-slate-400' : 'text-slate-600'} uppercase tracking-wider`}>{formatFileSize(resource.file_size)}</span>
                          </div>
                          <div className={`flex items-center gap-3 p-3 ${isDark ? 'bg-slate-900/50 border-slate-800' : 'bg-slate-50/50 border-slate-100'} rounded-2xl border`}>
                            <Users size={14} className="text-slate-400" />
                            <span className={`text-[10px] font-black ${isDark ? 'text-slate-400' : 'text-slate-600'} uppercase tracking-wider`}>{resource.uploader_name || 'System'}</span>
                          </div>
                          <div className={`flex items-center gap-3 p-3 ${isDark ? 'bg-slate-900/50 border-slate-800' : 'bg-slate-50/50 border-slate-100'} rounded-2xl border`}>
                            <Calendar size={14} className="text-slate-400" />
                            <span className={`text-[10px] font-black ${isDark ? 'text-slate-400' : 'text-slate-600'} uppercase tracking-wider`}>{new Date(resource.created_at).toLocaleDateString('zh-CN')}</span>
                          </div>
                        </div>

                        <div className="mt-auto flex gap-3">
                          <button
                            onClick={() => handleDownload(resource)}
                            className="flex-1 bg-[#2D5CF7] text-white py-3.5 px-4 rounded-2xl shadow-lg shadow-blue-500/20 hover:shadow-blue-500/40 hover:-translate-y-0.5 transition-all flex items-center justify-center gap-2 font-black text-xs"
                          >
                            <Download size={16} />
                            下载
                          </button>
                          {canDelete(resource) && (
                            <button
                              onClick={() => handleDelete(resource.id)}
                              className={`w-12 h-12 ${isDark ? 'bg-red-900/20 text-red-400 border-red-900/50' : 'bg-red-50 text-red-500 border-red-100'} rounded-2xl border hover:bg-red-500 hover:text-white transition-all flex items-center justify-center`}
                            >
                              <Trash2 size={18} />
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </>
          )}
        </div>
      </div>

      {/* Upload Modal */}
      {showUploadModal && selectedCategory && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-md flex items-center justify-center p-6 z-50 animate-in fade-in duration-300">
          <div className={`${isDark ? 'bg-[#161d2f]/95 border-slate-800 shadow-[0_20px_50px_rgba(0,0,0,0.5)]' : 'bg-white/90 border-white'} backdrop-blur-2xl rounded-[3rem] max-w-xl w-full p-10 shadow-2xl border relative overflow-hidden`}>
            <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500/5 rounded-full -mr-32 -mt-32 blur-3xl" />
            
            <div className="flex items-center justify-between mb-10 relative z-10">
              <div className="flex items-center gap-4">
                <div className={`w-12 h-12 rounded-2xl ${isDark ? 'bg-blue-900/30 text-blue-400' : 'bg-blue-50 text-[#2D5CF7]'} flex items-center justify-center shadow-inner`}>
                  <Upload size={24} />
                </div>
                <div>
                  <h3 className={`text-xl font-black ${isDark ? 'text-white' : 'text-slate-900'} tracking-tight`}>上传资源</h3>
                  <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">To {RESOURCE_CATEGORIES.find(c => c.id === selectedCategory)?.label} Gallery</p>
                </div>
              </div>
              <button
                onClick={() => setShowUploadModal(false)}
                className={`w-10 h-10 ${isDark ? 'bg-slate-800 text-slate-400' : 'bg-slate-50 text-slate-400'} hover:bg-red-50 hover:text-red-500 rounded-xl transition-all flex items-center justify-center`}
              >
                <X size={20} />
              </button>
            </div>

            <div className="space-y-6 relative z-10">
              <div className="group">
                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 px-1">资源标题 *</label>
                <input
                  type="text"
                  value={uploadData.title}
                  onChange={(e) => setUploadData({ ...uploadData, title: e.target.value })}
                  className={`w-full px-5 py-4 ${isDark ? 'bg-slate-900/50 border-slate-800 text-white' : 'bg-slate-50/50 border-slate-100 text-slate-900'} border rounded-2xl text-sm font-bold placeholder:text-slate-300 focus:outline-none focus:ring-2 focus:ring-[#2D5CF7] transition-all`}
                  placeholder="给资源起一个清晰的名字"
                />
              </div>

              <div>
                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 px-1">描述说明</label>
                <textarea
                  value={uploadData.description}
                  onChange={(e) => setUploadData({ ...uploadData, description: e.target.value })}
                  className={`w-full px-5 py-4 ${isDark ? 'bg-slate-900/50 border-slate-800 text-white' : 'bg-slate-50/50 border-slate-100 text-slate-900'} border rounded-2xl text-sm font-bold placeholder:text-slate-300 focus:outline-none focus:ring-2 focus:ring-[#2D5CF7] transition-all h-32 resize-none`}
                  placeholder="详细介绍该资源的用途或背景..."
                />
              </div>

              <div className="group">
                <label htmlFor="file-upload" className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 px-1">选择文件 *</label>
                <div className="relative">
                  <input
                    id="file-upload"
                    name="file"
                    type="file"
                    onChange={(e) => setUploadFile(e.target.files?.[0] || null)}
                    className={`w-full px-5 py-4 ${isDark ? 'bg-slate-900/50 border-slate-800 text-slate-400' : 'bg-slate-50/50 border-slate-200 text-slate-500'} border-2 border-dashed rounded-2xl text-xs font-bold cursor-pointer hover:border-[#2D5CF7] transition-all file:hidden`}
                    accept=".pdf,.doc,.docx,.ppt,.pptx,.xls,.xlsx,.jpg,.jpeg,.png,.gif,.mp4,.avi,.mov,.zip,.rar"
                  />
                  <div className="absolute right-5 top-1/2 -translate-y-1/2 pointer-events-none">
                    <FileText size={18} className="text-slate-300" />
                  </div>
                  {uploadFile && (
                    <div className={`mt-2 p-3 rounded-lg ${isDark ? 'bg-green-900/20 border-green-800' : 'bg-green-50 border-green-200'} border flex items-center gap-2`}>
                      <FileText size={14} className={isDark ? 'text-green-400' : 'text-green-600'} />
                      <span className={`text-xs font-bold ${isDark ? 'text-green-400' : 'text-green-700'}`}>{uploadFile.name}</span>
                    </div>
                  )}
                </div>
              </div>

              <div className={`flex items-center gap-3 p-4 ${isDark ? 'bg-slate-900/50 border-slate-800' : 'bg-slate-50/50 border-slate-100'} border rounded-2xl`}>
                <input
                  type="checkbox"
                  id="is_public"
                  checked={uploadData.is_public}
                  onChange={(e) => setUploadData({ ...uploadData, is_public: e.target.checked })}
                  className="w-5 h-5 rounded-lg border-2 border-slate-200 text-[#2D5CF7] focus:ring-[#2D5CF7] transition-all cursor-pointer"
                />
                <label htmlFor="is_public" className={`text-xs font-bold ${isDark ? 'text-slate-400' : 'text-slate-600'} cursor-pointer select-none`}>公开此资源（所有学生可见）</label>
              </div>
            </div>

            <div className="mt-10 flex gap-4 relative z-10">
              <button
                onClick={() => setShowUploadModal(false)}
                className={`flex-1 py-4 ${isDark ? 'bg-slate-800 text-slate-400' : 'bg-slate-50 text-slate-400'} rounded-2xl font-black uppercase tracking-[0.2em] transition-all`}
              >
                取消
              </button>
              <button
                onClick={handleUpload}
                disabled={uploading || !uploadFile || !uploadData.title}
                className="flex-1 py-4 bg-[#2D5CF7] text-white rounded-2xl font-black uppercase tracking-[0.2em] shadow-lg shadow-blue-500/20 hover:shadow-blue-500/40 transform hover:-translate-y-0.5 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
              >
                {uploading ? '上传中...' : '确认发布'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CollaborativeLibrary;
