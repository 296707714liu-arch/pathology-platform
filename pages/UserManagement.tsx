import React, { useState, useEffect } from 'react';
import { Users, Search, Filter, Eye, Edit, Trash2, UserPlus, Calendar, Mail, Building, Shield, AlertCircle } from 'lucide-react';
import { User } from '../types';
import { authAPI } from '../services/apiService';

// 从API获取用户列表
const getUsersFromAPI = async (): Promise<User[]> => {
  try {
    const response = await authAPI.getAllUsers();
    return response || [];
  } catch (error) {
    console.error('获取用户列表失败:', error);
    return [];
  }
};

interface UserManagementProps {
  currentUser?: User | null;
}

const UserManagement: React.FC<UserManagementProps> = ({ currentUser }) => {
  const [users, setUsers] = useState<User[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterRole, setFilterRole] = useState<string>('all');
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [showUserDetail, setShowUserDetail] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [newPassword, setNewPassword] = useState('');
  const [updatingPassword, setUpdatingPassword] = useState(false);

  // 检查权限 - 仅管理员可以访问
  const hasAccess = currentUser?.role === 'admin';

  // 加载用户数据
  useEffect(() => {
    const loadUsers = async () => {
      try {
        setLoading(true);
        setError(null);
        
        if (!hasAccess) {
          setError('只有管理员才能访问用户管理');
          setLoading(false);
          return;
        }

        const allUsers = await getUsersFromAPI();
        setUsers(allUsers);
      } catch (err) {
        setError('加载用户列表失败');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    
    loadUsers();
  }, [hasAccess]);

  // 过滤用户
  const filteredUsers = users.filter(user => {
    const matchesSearch = user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (user.institution && user.institution.toLowerCase().includes(searchTerm.toLowerCase()));
    
    const matchesRole = filterRole === 'all' || user.role === filterRole;
    
    return matchesSearch && matchesRole;
  });

  // 获取角色显示名称
  const getRoleDisplayName = (role: string) => {
    switch (role) {
      case 'student': return '学生';
      case 'teacher': return '教师';
      case 'researcher': return '研究员';
      case 'admin': return '管理员';
      default: return role;
    }
  };

  // 获取角色颜色
  const getRoleColor = (role: string) => {
    switch (role) {
      case 'student': return 'bg-blue-100 text-blue-800';
      case 'teacher': return 'bg-green-100 text-green-800';
      case 'researcher': return 'bg-purple-100 text-purple-800';
      case 'admin': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  // 查看用户详情
  const viewUserDetail = (user: User) => {
    setSelectedUser(user);
    setShowUserDetail(true);
  };

  // 修改用户密码
  const handleUpdatePassword = async () => {
    if (!newPassword || newPassword.length < 6) {
      alert('密码长度至少6位');
      return;
    }

    if (!selectedUser) return;

    try {
      setUpdatingPassword(true);
      await authAPI.updateUserPassword(selectedUser.id, newPassword);
      alert('密码已成功更新');
      setShowPasswordModal(false);
      setNewPassword('');
    } catch (error) {
      console.error('修改密码失败:', error);
      alert('修改密码失败，请稍后重试');
    } finally {
      setUpdatingPassword(false);
    }
  };

  // 删除用户
  const handleDeleteUser = async (userId: string, userName: string) => {
    if (!window.confirm(`确定要删除用户 "${userName}" 吗？此操作不可撤销。`)) {
      return;
    }

    try {
      await authAPI.deleteUser(userId);
      // 从列表中移除该用户
      setUsers(users.filter(u => u.id !== userId));
      alert('用户已成功删除');
    } catch (error) {
      console.error('删除用户失败:', error);
      alert('删除用户失败，请稍后重试');
    }
  };

  // 权限检查 - 非管理员显示错误信息
  if (!hasAccess) {
    return (
      <div className="h-screen bg-gray-50 flex items-center justify-center">
        <div className="max-w-md w-full">
          <div className="bg-white border border-red-200 rounded-lg p-8 shadow-lg">
            <div className="flex items-center justify-center mb-4">
              <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center">
                <AlertCircle className="w-6 h-6 text-red-600" />
              </div>
            </div>
            <h2 className="text-xl font-bold text-gray-900 text-center mb-2">权限不足</h2>
            <p className="text-gray-600 text-center">只有管理员才能访问用户管理功能。</p>
            <p className="text-gray-500 text-sm text-center mt-4">
              当前用户角色：{currentUser?.role ? (currentUser.role === 'student' ? '学生' : currentUser.role === 'teacher' ? '教师' : currentUser.role === 'researcher' ? '研究员' : currentUser.role) : '未知'}
            </p>
          </div>
        </div>
      </div>
    );
  }

  // 加载中
  if (loading) {
    return (
      <div className="h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 mx-auto mb-4"></div>
          <p className="text-gray-600">加载用户列表中...</p>
        </div>
      </div>
    );
  }

  // 错误显示
  if (error) {
    return (
      <div className="h-screen bg-gray-50 flex items-center justify-center">
        <div className="max-w-md w-full">
          <div className="bg-white border border-red-200 rounded-lg p-8 shadow-lg">
            <div className="flex items-center justify-center mb-4">
              <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center">
                <AlertCircle className="w-6 h-6 text-red-600" />
              </div>
            </div>
            <h2 className="text-xl font-bold text-gray-900 text-center mb-2">错误</h2>
            <p className="text-gray-600 text-center">{error}</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen bg-gray-50 flex">
      {/* Left Sidebar - Controls */}
      <div className="w-80 bg-white border-r border-gray-200 flex flex-col">
        {/* Page Header */}
        <div className="p-6 border-b border-gray-100">
          <div className="flex items-center mb-2">
            <Users className="w-6 h-6 text-gray-700 mr-3" />
            <h1 className="text-xl font-semibold text-gray-900">用户管理</h1>
          </div>
          <p className="text-sm text-gray-600">查看和管理平台用户信息</p>
        </div>

        {/* Statistics */}
        <div className="p-6 border-b border-gray-100">
          <h3 className="text-sm font-medium text-gray-900 mb-4">统计信息</h3>
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">总用户数</span>
              <span className="text-sm font-medium text-gray-900">{users.length}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">学生</span>
              <span className="text-sm font-medium text-gray-900">{users.filter(u => u.role === 'student').length}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">教师</span>
              <span className="text-sm font-medium text-gray-900">{users.filter(u => u.role === 'teacher').length}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">研究员</span>
              <span className="text-sm font-medium text-gray-900">{users.filter(u => u.role === 'researcher').length}</span>
            </div>
          </div>
        </div>

        {/* Search and Filter */}
        <div className="p-6 border-b border-gray-100">
          <h3 className="text-sm font-medium text-gray-900 mb-4">搜索和筛选</h3>
          <div className="space-y-3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type="text"
                placeholder="搜索用户..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-9 pr-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent"
              />
            </div>
            <div className="relative">
              <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <select
                value={filterRole}
                onChange={(e) => setFilterRole(e.target.value)}
                className="w-full pl-9 pr-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent appearance-none bg-white"
              >
                <option value="all">所有角色</option>
                <option value="student">学生</option>
                <option value="teacher">教师</option>
                <option value="researcher">研究员</option>
                <option value="admin">管理员</option>
              </select>
            </div>
          </div>
        </div>

        {/* Usage Tips */}
        <div className="p-6">
          <h3 className="text-sm font-medium text-gray-900 mb-3">使用提示</h3>
          <div className="space-y-2 text-xs text-gray-600">
            <p>• 点击用户可查看详细信息</p>
            <p>• 管理员可以修改用户密码</p>
            <p>• 支持按角色筛选用户</p>
            <p>• 可以删除不需要的用户</p>
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 bg-white border-l border-gray-200 flex flex-col">
        {/* Content Header */}
        <div className="p-6 border-b border-gray-100">
          <h2 className="text-lg font-semibold text-gray-900">用户列表</h2>
          <p className="text-sm text-gray-600 mt-1">管理平台中的所有用户账户</p>
        </div>

        {/* User List */}
        <div className="flex-1 overflow-y-auto">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">用户</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">角色</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">机构</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">操作</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {filteredUsers.map((user) => (
                  <tr key={user.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="w-10 h-10 bg-gray-900 rounded-full flex items-center justify-center mr-3">
                          <span className="text-white font-medium text-sm">
                            {user.name.charAt(0)}
                          </span>
                        </div>
                        <div>
                          <div className="text-sm font-medium text-gray-900">{user.name}</div>
                          <div className="text-sm text-gray-500">{user.email}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getRoleColor(user.role)}`}>
                        {getRoleDisplayName(user.role)}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {user.institution || '-'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex space-x-2">
                        <button
                          onClick={() => viewUserDetail(user)}
                          className="text-gray-600 hover:text-gray-900 p-1 hover:bg-gray-100 rounded transition-colors"
                          title="查看详情"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDeleteUser(user.id, user.name)}
                          className="text-red-600 hover:text-red-900 p-1 hover:bg-red-50 rounded transition-colors"
                          title="删除用户"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {filteredUsers.length === 0 && (
            <div className="text-center py-12">
              <Users className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500">没有找到匹配的用户</p>
            </div>
          )}
        </div>
      </div>

      {/* 用户详情模态框 */}
      {showUserDetail && selectedUser && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-xl">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-slate-800">用户详情</h3>
              <button
                onClick={() => setShowUserDetail(false)}
                className="text-slate-400 hover:text-slate-600 p-1"
              >
                ✕
              </button>
            </div>

            <div className="space-y-4">
              <div className="flex items-center justify-center mb-6">
                <div className="w-20 h-20 bg-gradient-to-r from-violet-500 to-indigo-500 rounded-full flex items-center justify-center">
                  <span className="text-white font-bold text-2xl">
                    {selectedUser.name.charAt(0)}
                  </span>
                </div>
              </div>

              <div className="space-y-3">
                <div className="flex items-center">
                  <Users className="w-5 h-5 text-slate-400 mr-3" />
                  <div>
                    <p className="text-sm text-slate-500">姓名</p>
                    <p className="font-medium text-slate-800">{selectedUser.name}</p>
                  </div>
                </div>

                <div className="flex items-center">
                  <Mail className="w-5 h-5 text-slate-400 mr-3" />
                  <div>
                    <p className="text-sm text-slate-500">邮箱</p>
                    <p className="font-medium text-slate-800">{selectedUser.email}</p>
                  </div>
                </div>

                <div className="flex items-center">
                  <Shield className="w-5 h-5 text-slate-400 mr-3" />
                  <div>
                    <p className="text-sm text-slate-500">密码哈希</p>
                    <p className="font-mono text-xs text-slate-600 break-all">{selectedUser.password_hash || '未知'}</p>
                  </div>
                </div>

                <div className="flex items-center">
                  <Shield className="w-5 h-5 text-slate-400 mr-3" />
                  <div>
                    <p className="text-sm text-slate-500">角色</p>
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getRoleColor(selectedUser.role)}`}>
                      {getRoleDisplayName(selectedUser.role)}
                    </span>
                  </div>
                </div>

                {selectedUser.institution && (
                  <div className="flex items-center">
                    <Building className="w-5 h-5 text-slate-400 mr-3" />
                    <div>
                      <p className="text-sm text-slate-500">机构</p>
                      <p className="font-medium text-slate-800">{selectedUser.institution}</p>
                    </div>
                  </div>
                )}

                <div className="flex items-center">
                  <div className="w-5 h-5 mr-3 flex items-center justify-center">
                    <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                  </div>
                  <div>
                    <p className="text-sm text-slate-500">用户ID</p>
                    <p className="font-mono text-sm text-slate-600">{selectedUser.id}</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-6 pt-4 border-t border-slate-200 space-y-2">
              <button
                onClick={() => {
                  setShowPasswordModal(true);
                  setNewPassword('');
                }}
                className="w-full py-2 px-4 bg-blue-100 hover:bg-blue-200 text-blue-700 rounded-xl transition-colors font-medium"
              >
                修改密码
              </button>
              <button
                onClick={() => setShowUserDetail(false)}
                className="w-full py-2 px-4 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl transition-colors"
              >
                关闭
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 修改密码模态框 */}
      {showPasswordModal && selectedUser && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-xl">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-slate-800">修改密码</h3>
              <button
                onClick={() => setShowPasswordModal(false)}
                className="text-slate-400 hover:text-slate-600 p-1"
              >
                ✕
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <p className="text-sm text-slate-600 mb-3">用户: <span className="font-medium text-slate-800">{selectedUser.name}</span></p>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">新密码 *</label>
                <input
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="请输入新密码（至少6位）"
                />
              </div>

              <div className="text-xs text-slate-500">
                密码要求：至少6个字符
              </div>
            </div>

            <div className="mt-6 flex gap-3">
              <button
                onClick={() => setShowPasswordModal(false)}
                className="flex-1 px-4 py-2 border border-slate-300 rounded-lg text-slate-700 hover:bg-slate-50 transition-colors"
              >
                取消
              </button>
              <button
                onClick={handleUpdatePassword}
                disabled={updatingPassword || !newPassword}
                className="flex-1 px-4 py-2 bg-blue-500 hover:bg-blue-600 disabled:opacity-50 text-white rounded-lg font-medium transition-colors"
              >
                {updatingPassword ? '更新中...' : '更新密码'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserManagement;