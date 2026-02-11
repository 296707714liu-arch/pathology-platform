import React, { useState, useEffect } from 'react';
import { Users, FileText, Upload, Download, Trash2, X, BookOpen, FileCode, Briefcase, AlertCircle, ChevronRight, Folder, Calendar } from 'lucide-react';
import { Resource, CreateResourceData, User as UserType } from '../types';
import { resourceAPI, activityAPI } from '../services/apiService';

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
    if (!uploadFile || !uploadData.title) {
      alert('请填写标题并选择文件');
      return;
    }

    try {
      setUploading(true);
      // 确保type被设置为当前选中的类别
      const uploadDataWithType = { ...uploadData, type: selectedCategory as any };
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
      loadResources();
      alert('资源上传成功！');
    } catch (error) {
      console.error('上传失败:', error);
      alert('上传失败，请稍后重试');
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
    const canDeleteResource = user && (user.id === resource.uploader_id || user.role === 'admin');
    if (!canDeleteResource && user) {
      console.log('删除权限检查:', {
        userId: user.id,
        uploaderId: resource.uploader_id,
        userRole: user.role,
        canDelete: canDeleteResource
      });
    }
    return canDeleteResource;
  };

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  return (
    <div className="h-screen bg-slate-50 flex">
      {/* Left Sidebar - Controls */}
      <div className="w-80 bg-white border-r border-slate-200 flex flex-col">
        {/* Page Header */}
        <div className="p-6 border-b border-slate-100">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-lg bg-orange-500 flex items-center justify-center">
              <Users className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-lg font-bold text-slate-900">协同资源库</h1>
              <p className="text-xs text-slate-500">师生共建 · 实时协作</p>
            </div>
          </div>
        </div>

        {/* Category Selection */}
        {!selectedCategory ? (
          <div className="flex-1 p-6 overflow-y-auto">
            <h3 className="text-sm font-medium text-slate-900 mb-4">选择文件夹</h3>
            <div className="space-y-2">
              {RESOURCE_CATEGORIES.map((category) => {
                const Icon = category.icon;
                return (
                  <button
                    key={category.id}
                    onClick={() => setSelectedCategory(category.id)}
                    className="w-full text-left px-3 py-2 text-sm rounded-lg transition-colors flex items-center text-gray-700 hover:bg-gray-50"
                  >
                    <Folder className="w-4 h-4 mr-2" />
                    {category.label}
                  </button>
                );
              })}
            </div>
          </div>
        ) : (
          <>
            {/* Back Button */}
            <div className="p-6 border-b border-gray-100">
              <button
                onClick={() => setSelectedCategory(null)}
                className="text-sm text-gray-600 hover:text-gray-900 flex items-center"
              >
                ← 返回文件夹
              </button>
              <h3 className="text-sm font-medium text-gray-900 mt-2">
                {RESOURCE_CATEGORIES.find(c => c.id === selectedCategory)?.label}
              </h3>
            </div>

            {/* Upload Button */}
            {canUpload && (
              <div className="p-6 border-b border-gray-100">
                <button 
                  onClick={() => setShowUploadModal(true)}
                  className="w-full py-2.5 px-4 bg-gray-900 text-white rounded-lg hover:bg-gray-800 transition-colors flex items-center justify-center"
                >
                  <Upload className="w-4 h-4 mr-2" />
                  上传资源
                </button>
              </div>
            )}

            {/* Resource Stats */}
            <div className="p-6 border-b border-gray-100">
              <h3 className="text-sm font-medium text-gray-900 mb-3">统计信息</h3>
              <div className="space-y-2 text-xs text-gray-600">
                <div className="flex justify-between">
                  <span>资源总数</span>
                  <span className="font-medium text-gray-900">{resources.length}</span>
                </div>
                <div className="flex justify-between">
                  <span>当前类别</span>
                  <span className="font-medium text-gray-900">
                    {RESOURCE_CATEGORIES.find(c => c.id === selectedCategory)?.label}
                  </span>
                </div>
              </div>
            </div>

            {/* Usage Tips */}
            <div className="p-6">
              <h3 className="text-sm font-medium text-gray-900 mb-3">使用提示</h3>
              <div className="space-y-2 text-xs text-gray-600">
                <p>• 教师和管理员可以上传资源</p>
                <p>• 所有用户都可以下载公开资源</p>
                <p>• 支持多种文件格式</p>
                <p>• 资源按类别分类管理</p>
              </div>
            </div>
          </>
        )}
      </div>

      {/* Main Content Area */}
      <div className="flex-1 bg-white border-l border-gray-200 flex flex-col">
        {/* Content Header */}
        <div className="p-6 border-b border-gray-100">
          <h2 className="text-lg font-semibold text-gray-900">
            {!selectedCategory ? '文件夹列表' : '资源列表'}
          </h2>
          <p className="text-sm text-gray-600 mt-1">
            {!selectedCategory ? '选择一个文件夹查看资源' : '当前文件夹中的所有资源'}
          </p>
        </div>

        {/* Main Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {!selectedCategory ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {RESOURCE_CATEGORIES.map((category) => {
                const Icon = category.icon;
                return (
                  <button
                    key={category.id}
                    onClick={() => setSelectedCategory(category.id)}
                    className="p-6 bg-gray-50 border border-gray-200 rounded-lg hover:bg-gray-100 transition-colors text-left"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        <Folder className="w-8 h-8 text-gray-600 mr-3" />
                        <div>
                          <h3 className="text-lg font-semibold text-gray-900">{category.label}</h3>
                          <p className="text-sm text-gray-600">点击打开</p>
                        </div>
                      </div>
                      <ChevronRight className="w-5 h-5 text-gray-400" />
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
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 mx-auto mb-4"></div>
                    <p className="text-gray-600">加载资源中...</p>
                  </div>
                </div>
              ) : resources.length === 0 ? (
                <div className="h-full flex items-center justify-center">
                  <div className="text-center">
                    <AlertCircle className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">该文件夹暂无资源</h3>
                    <p className="text-gray-600">
                      {canUpload ? '点击左侧上传按钮添加资源' : '暂时没有可用的资源'}
                    </p>
                  </div>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {resources.map((resource) => (
                    <div key={resource.id} className="bg-gray-50 border border-gray-200 rounded-lg p-6 hover:bg-gray-100 transition-colors">
                      <h3 className="text-lg font-semibold text-gray-900 mb-2 line-clamp-2">{resource.title}</h3>
                      <p className="text-sm text-gray-600 mb-4 line-clamp-2">{resource.description || '暂无描述'}</p>
                      
                      <div className="space-y-2 mb-4 text-sm text-gray-500">
                        <div className="flex items-center">
                          <FileText className="w-4 h-4 mr-2" />
                          {formatFileSize(resource.file_size)}
                        </div>
                        <div className="flex items-center">
                          <Users className="w-4 h-4 mr-2" />
                          {resource.uploader_name || '未知'}
                        </div>
                        <div className="flex items-center">
                          <Calendar className="w-4 h-4 mr-2" />
                          {new Date(resource.created_at).toLocaleDateString('zh-CN')}
                        </div>
                      </div>

                      <div className="flex gap-2">
                        <button
                          onClick={() => handleDownload(resource)}
                          className="flex-1 bg-gray-900 text-white py-2 px-3 rounded-lg hover:bg-gray-800 transition-colors flex items-center justify-center text-sm"
                        >
                          <Download className="w-4 h-4 mr-1" />
                          下载
                        </button>
                        {canDelete(resource) && (
                          <button
                            onClick={() => handleDelete(resource.id)}
                            className="px-3 py-2 bg-red-100 hover:bg-red-200 text-red-600 rounded-lg transition-colors"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        )}
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
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-md w-full p-6 shadow-xl border border-gray-200">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-gray-900">上传资源到 {RESOURCE_CATEGORIES.find(c => c.id === selectedCategory)?.label}</h3>
              <button
                onClick={() => setShowUploadModal(false)}
                className="text-gray-400 hover:text-gray-600 p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">标题 *</label>
                <input
                  type="text"
                  value={uploadData.title}
                  onChange={(e) => setUploadData({ ...uploadData, title: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent"
                  placeholder="请输入资源标题"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">描述</label>
                <textarea
                  value={uploadData.description}
                  onChange={(e) => setUploadData({ ...uploadData, description: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent"
                  rows={3}
                  placeholder="请输入资源描述"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">文件 *</label>
                <input
                  type="file"
                  onChange={(e) => setUploadFile(e.target.files?.[0] || null)}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent"
                  accept=".pdf,.doc,.docx,.ppt,.pptx,.xls,.xlsx,.jpg,.jpeg,.png,.gif,.mp4,.avi,.mov,.zip,.rar"
                />
              </div>

              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="is_public"
                  checked={uploadData.is_public}
                  onChange={(e) => setUploadData({ ...uploadData, is_public: e.target.checked })}
                  className="mr-2"
                />
                <label htmlFor="is_public" className="text-sm text-gray-700">公开资源</label>
              </div>
            </div>

            <div className="mt-6 flex gap-3">
              <button
                onClick={() => setShowUploadModal(false)}
                className="flex-1 px-4 py-2 border border-gray-200 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
              >
                取消
              </button>
              <button
                onClick={handleUpload}
                disabled={uploading || !uploadFile || !uploadData.title}
                className="flex-1 px-4 py-2 bg-gray-900 hover:bg-gray-800 disabled:opacity-50 text-white rounded-lg transition-colors"
              >
                {uploading ? '上传中...' : '上传'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CollaborativeLibrary;
