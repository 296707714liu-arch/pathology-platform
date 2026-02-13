import React, { useState, useEffect } from 'react';
import { Users, Search, Filter, Eye, Trash2, UserPlus, Calendar, Mail, Building, Shield, AlertCircle, X, Key, ChevronRight } from 'lucide-react';
import { User } from '../types';
import { authAPI } from '../services/apiService';
import { useTheme } from '../context/ThemeContext';

const UserManagement: React.FC<{ currentUser?: User | null }> = ({ currentUser }) => {
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  
  const [users, setUsers] = useState<User[]>([]);
  // ... 其余状态保持不变

  const [searchTerm, setSearchTerm] = useState('');
  const [filterRole, setFilterRole] = useState<string>('all');
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [showUserDetail, setShowUserDetail] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [newPassword, setNewPassword] = useState('');
  const [updatingPassword, setUpdatingPassword] = useState(false);

  const viewUserDetail = (user: User) => {
    setSelectedUser(user);
    setShowUserDetail(true);
  };

  const handleDeleteUser = async (userId: string, userName: string) => {
    if (!window.confirm(`确定要删除用户 "${userName}" 吗？此操作不可撤销。`)) {
      return;
    }

    try {
      await authAPI.deleteUser(userId);
      setUsers(users.filter(u => u.id !== userId));
      alert('用户已成功删除');
    } catch (err: any) {
      alert(`删除失败: ${err.message}`);
    }
  };

  const handleUpdatePassword = async () => {
    if (!selectedUser || !newPassword || newPassword.length < 6) return;

    try {
      setUpdatingPassword(true);
      await authAPI.updateUserPassword(selectedUser.id, newPassword);
      alert('密码已成功重置');
      setShowPasswordModal(false);
      setNewPassword('');
    } catch (err: any) {
      alert(`重置失败: ${err.message}`);
    } finally {
      setUpdatingPassword(false);
    }
  };

  const hasAccess = currentUser?.role === 'admin';

  useEffect(() => {
    const loadUsers = async () => {
      try {
        setLoading(true);
        if (!hasAccess) {
          setError('只有管理员才能访问用户管理');
          return;
        }
        const response = await authAPI.getAllUsers();
        setUsers(response || []);
      } catch (err) {
        setError('加载用户列表失败');
      } finally {
        setLoading(false);
      }
    };
    loadUsers();
  }, [hasAccess]);

  const filteredUsers = users.filter(user => {
    const matchesSearch = user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (user.institution && user.institution.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesRole = filterRole === 'all' || user.role === filterRole;
    return matchesSearch && matchesRole;
  });

  const getRoleDisplayName = (role: string) => {
    const roles: Record<string, string> = { student: '学生', teacher: '教师', researcher: '研究员', admin: '管理员' };
    return roles[role] || role;
  };

  const getRoleStyle = (role: string) => {
    const styles: Record<string, string> = {
      student: 'bg-blue-50 text-blue-600 border-blue-100',
      teacher: 'bg-emerald-50 text-emerald-600 border-emerald-100',
      researcher: 'bg-purple-50 text-purple-600 border-purple-100',
      admin: 'bg-rose-50 text-red-600 border-rose-100'
    };
    return styles[role] || 'bg-slate-50 text-slate-600 border-slate-100';
  };

  if (!hasAccess) {
    return (
      <div className={`h-screen ${isDark ? 'bg-[#0b0f1a]' : 'bg-[#F5F7FA]'} flex items-center justify-center p-6`}>
        <div className={`max-w-md w-full ${isDark ? 'bg-slate-800/40 border-slate-700' : 'bg-white/80 border-white'} backdrop-blur-xl border rounded-[2.5rem] p-10 shadow-2xl text-center`}>
          <div className="w-20 h-20 bg-rose-50 rounded-3xl flex items-center justify-center mx-auto mb-6">
            <AlertCircle className="w-10 h-10 text-rose-500" />
          </div>
          <h2 className={`text-2xl font-black ${isDark ? 'text-white' : 'text-slate-900'} mb-2 tracking-tight`}>权限受限</h2>
          <p className="text-slate-500 font-medium leading-relaxed">该页面仅对具备系统管理员权限的用户开放。</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`h-screen ${isDark ? 'bg-[#0b0f1a]' : 'bg-[#F5F7FA]'} flex`} style={{
      backgroundImage: isDark 
        ? 'radial-gradient(at 0% 0%, rgba(45, 92, 247, 0.1) 0px, transparent 50%), radial-gradient(at 100% 100%, rgba(39, 194, 76, 0.05) 0px, transparent 50%)'
        : 'radial-gradient(at 0% 0%, rgba(45, 92, 247, 0.02) 0px, transparent 50%), radial-gradient(at 100% 100%, rgba(39, 194, 76, 0.02) 0px, transparent 50%)'
    }}>
      {/* Left Sidebar */}
      <div className={`w-80 ${isDark ? 'bg-[#0d121f] border-slate-800' : 'bg-white/80 border-slate-100/50'} backdrop-blur-xl border-r flex flex-col shadow-xl`}>
        <div className={`p-8 border-b ${isDark ? 'border-slate-800' : 'border-slate-100/50'}`}>
          <div className="flex items-center gap-4 mb-2">
            <div className="w-12 h-12 rounded-2xl bg-[#2D5CF7] flex items-center justify-center shadow-lg shadow-blue-500/20">
              <Users className="w-7 h-7 text-white" />
            </div>
            <div>
              <h1 className={`text-xl font-black ${isDark ? 'text-white' : 'text-slate-900'} tracking-tight`}>用户管理</h1>
              <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest text-nowrap">Directory Management</p>
            </div>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-8 space-y-8">
          <div>
            <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-5 px-1">快速检索</h3>
            <div className="space-y-3">
              <div className="relative group">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4 transition-colors group-focus-within:text-[#2D5CF7]" />
                <input
                  type="text"
                  placeholder="搜索姓名、邮箱..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className={`w-full pl-11 pr-4 py-3.5 ${isDark ? 'bg-slate-900/50 border-slate-800 text-white' : 'bg-slate-50/50 border-slate-100 text-slate-900'} border rounded-2xl text-sm font-bold focus:outline-none focus:ring-2 focus:ring-[#2D5CF7] transition-all shadow-inner`}
                />
              </div>
              <div className="relative group">
                <Filter className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4 transition-colors group-focus-within:text-[#2D5CF7]" />
                <select
                  value={filterRole}
                  onChange={(e) => setFilterRole(e.target.value)}
                  className={`w-full pl-11 pr-4 py-3.5 ${isDark ? 'bg-slate-900/50 border-slate-800 text-white' : 'bg-slate-50/50 border-slate-100 text-slate-900'} border rounded-2xl text-sm font-bold focus:outline-none focus:ring-2 focus:ring-[#2D5CF7] transition-all shadow-inner appearance-none cursor-pointer`}
                >
                  <option value="all">显示所有角色</option>
                  <option value="student">仅学生</option>
                  <option value="teacher">仅教师</option>
                  <option value="researcher">仅研究员</option>
                  <option value="admin">仅管理员</option>
                </select>
              </div>
            </div>
          </div>

          <div>
            <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-5 px-1">人员构成</h3>
            <div className="space-y-2">
              {[
                { label: '总人数', count: users.length, color: 'text-[#2D5CF7]' },
                { label: '学生', count: users.filter(u => u.role === 'student').length, color: 'text-blue-500' },
                { label: '教师', count: users.filter(u => u.role === 'teacher').length, color: 'text-emerald-500' }
              ].map((stat, i) => (
                <div key={i} className={`flex justify-between items-center p-4 ${isDark ? 'bg-slate-800/40 border-slate-700' : 'bg-white/40 border-white/60'} border rounded-2xl shadow-sm`}>
                  <span className="text-xs font-bold text-slate-500">{stat.label}</span>
                  <span className={`text-sm font-black ${stat.color}`}>{stat.count}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0">
        <div className={`p-8 ${isDark ? 'bg-[#0b0f1a]/40 border-slate-800' : 'bg-white/40 border-slate-100/50'} backdrop-blur-md border-b flex justify-between items-center`}>
          <div>
            <h2 className={`text-2xl font-black ${isDark ? 'text-white' : 'text-slate-900'} tracking-tight`}>人员列表</h2>
            <p className="text-[11px] text-slate-400 font-bold uppercase tracking-[0.2em] mt-1">Personnel Directory</p>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-10 space-y-4 scrollbar-hide">
          {loading ? (
            <div className="h-full flex items-center justify-center flex-col gap-4">
              <div className="w-12 h-12 rounded-2xl border-4 border-slate-100 border-t-[#2D5CF7] animate-spin" />
              <p className="text-xs font-black text-slate-400 uppercase tracking-widest animate-pulse">Syncing User Data...</p>
            </div>
          ) : filteredUsers.length === 0 ? (
            <div className="h-full flex items-center justify-center">
              <div className="text-center max-w-sm">
                <div className={`w-24 h-24 rounded-[2.5rem] ${isDark ? 'bg-slate-800' : 'bg-white'} shadow-xl flex items-center justify-center mx-auto mb-8 transform -rotate-6`}>
                  <Search className="w-10 h-10 text-slate-200" />
                </div>
                <h3 className={`text-2xl font-black ${isDark ? 'text-white' : 'text-slate-900'} mb-2 tracking-tight`}>未找到匹配人员</h3>
                <p className="text-sm text-slate-400 font-medium">请尝试调整搜索关键词或角色筛选条件。</p>
              </div>
            </div>
          ) : (
            filteredUsers.map((user) => (
              <div key={user.id} className={`${isDark ? 'bg-slate-800/40 border-slate-700' : 'bg-white/80 border-white/60'} backdrop-blur-xl border p-6 rounded-3xl shadow-xl hover:shadow-2xl transition-all duration-300 group relative overflow-hidden flex items-center gap-6`}>
                <div className={`absolute top-0 right-0 w-32 h-32 ${isDark ? 'bg-white/5' : 'bg-slate-50'} rounded-full -mr-16 -mt-16 group-hover:scale-110 transition-transform duration-500`} />
                
                <div className={`w-16 h-16 rounded-2xl ${isDark ? 'bg-slate-700 text-slate-300 border-slate-600' : 'bg-slate-100 text-slate-400 border-slate-200'} flex items-center justify-center text-2xl font-black border shadow-inner group-hover:bg-blue-50 group-hover:text-[#2D5CF7] group-hover:border-[#2D5CF7]/20 transition-all`}>
                  {user.name.charAt(0)}
                </div>

                <div className="flex-1 min-w-0 relative z-10">
                  <div className="flex items-center gap-3 mb-1">
                    <h3 className={`text-lg font-black ${isDark ? 'text-white' : 'text-slate-900'} tracking-tight truncate`}>{user.name}</h3>
                    <span className={`px-2.5 py-0.5 rounded-lg border text-[10px] font-black uppercase tracking-wider ${getRoleStyle(user.role)}`}>
                      {getRoleDisplayName(user.role)}
                    </span>
                  </div>
                  <div className="flex items-center gap-4 text-slate-400 font-medium text-xs">
                    <div className="flex items-center gap-1.5 truncate">
                      <Mail size={12} /> {user.email}
                    </div>
                    {user.institution && (
                      <div className={`flex items-center gap-1.5 truncate border-l ${isDark ? 'border-slate-700' : 'border-slate-200'} pl-4`}>
                        <Building size={12} /> {user.institution}
                      </div>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-3 relative z-10">
                  <button
                    onClick={() => viewUserDetail(user)}
                    className={`w-12 h-12 rounded-2xl ${isDark ? 'bg-slate-700 border-slate-600' : 'bg-white border-slate-100'} shadow-md border text-slate-400 hover:text-[#2D5CF7] hover:border-[#2D5CF7]/30 transition-all flex items-center justify-center`}
                    title="详情"
                  >
                    <Eye size={20} />
                  </button>
                  <button
                    onClick={() => handleDeleteUser(user.id, user.name)}
                    className={`w-12 h-12 rounded-2xl ${isDark ? 'bg-rose-900/20 text-rose-400' : 'bg-rose-50 text-rose-400'} hover:bg-rose-500 hover:text-white transition-all flex items-center justify-center`}
                    title="移除"
                  >
                    <Trash2 size={20} />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Modal - User Detail */}
      {showUserDetail && selectedUser && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-md flex items-center justify-center p-6 z-50 animate-in fade-in duration-300">
          <div className={`${isDark ? 'bg-slate-900/90 border-slate-800' : 'bg-white/90 border-white'} backdrop-blur-2xl rounded-[3rem] max-w-md w-full p-10 shadow-2xl border relative overflow-hidden`}>
            <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500/5 rounded-full -mr-32 -mt-32 blur-3xl" />
            
            <div className="flex justify-between items-center mb-8 relative z-10">
              <h3 className={`text-xl font-black ${isDark ? 'text-white' : 'text-slate-900'} tracking-tight`}>人员档案</h3>
              <button onClick={() => setShowUserDetail(false)} className={`w-10 h-10 ${isDark ? 'bg-slate-800 text-slate-400' : 'bg-slate-50 text-slate-400'} hover:bg-rose-50 hover:text-rose-500 rounded-xl transition-all flex items-center justify-center`}>
                <X size={20} />
              </button>
            </div>

            <div className="space-y-6 relative z-10">
              <div className="flex flex-col items-center mb-8">
                <div className={`w-24 h-24 rounded-3xl ${isDark ? 'bg-blue-900/30 border-blue-800 text-blue-400' : 'bg-blue-50 border-blue-100 text-[#2D5CF7]'} flex items-center justify-center text-4xl font-black shadow-inner border mb-4`}>
                  {selectedUser.name.charAt(0)}
                </div>
                <h4 className={`text-2xl font-black ${isDark ? 'text-white' : 'text-slate-900'} tracking-tight`}>{selectedUser.name}</h4>
                <p className="text-sm font-bold text-slate-400">{selectedUser.email}</p>
              </div>

              <div className="space-y-3">
                {[
                  { icon: Shield, label: '系统角色', val: getRoleDisplayName(selectedUser.role), badge: true },
                  { icon: Building, label: '所属机构', val: selectedUser.institution || '未关联' },
                  { icon: Calendar, label: '注册日期', val: new Date().toLocaleDateString() }
                ].map((item, i) => (
                  <div key={i} className={`flex items-center gap-4 p-4 ${isDark ? 'bg-slate-800/50 border-slate-700' : 'bg-slate-50/50 border-slate-100/50'} rounded-2xl border`}>
                    <div className={`w-10 h-10 rounded-xl ${isDark ? 'bg-slate-700 text-slate-400' : 'bg-white text-slate-400'} shadow-sm flex items-center justify-center`}>
                      <item.icon size={18} />
                    </div>
                    <div>
                      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{item.label}</p>
                      {item.badge ? (
                        <span className={`mt-1 inline-block px-2 py-0.5 rounded-lg text-[10px] font-black uppercase tracking-wider ${getRoleStyle(selectedUser.role)}`}>
                          {item.val}
                        </span>
                      ) : (
                        <p className={`text-sm font-bold ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>{item.val}</p>
                      )}
                    </div>
                  </div>
                ))}
              </div>

              <div className="pt-6 space-y-3">
                <button
                  onClick={() => { setShowPasswordModal(true); setNewPassword(''); }}
                  className={`w-full py-4 ${isDark ? 'bg-blue-900/30 text-blue-400 border border-blue-800' : 'bg-blue-50 text-[#2D5CF7] border-transparent'} hover:bg-[#2D5CF7] hover:text-white rounded-2xl font-black uppercase tracking-[0.2em] transition-all shadow-sm`}
                >
                  重置登录密码
                </button>
                <button
                  onClick={() => setShowUserDetail(false)}
                  className={`w-full py-4 ${isDark ? 'bg-slate-800 text-slate-400' : 'bg-slate-50 text-slate-400'} hover:bg-slate-100 rounded-2xl font-black uppercase tracking-[0.2em] transition-all`}
                >
                  关闭档案
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal - Change Password */}
      {showPasswordModal && selectedUser && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-md flex items-center justify-center p-6 z-[60] animate-in fade-in duration-300">
          <div className={`${isDark ? 'bg-slate-900/95 border-slate-800' : 'bg-white/95 border-white'} backdrop-blur-2xl rounded-[3rem] max-w-sm w-full p-10 shadow-2xl border`}>
            <h3 className={`text-xl font-black ${isDark ? 'text-white' : 'text-slate-900'} mb-6 tracking-tight flex items-center gap-3`}>
              <Key className="text-[#2D5CF7]" size={24} /> 修改密码
            </h3>
            <div className="space-y-6">
              <div>
                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 px-1">新登录密码 *</label>
                <input
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className={`w-full px-5 py-4 ${isDark ? 'bg-slate-900/50 border-slate-800 text-white' : 'bg-slate-50/50 border-slate-100 text-slate-900'} border rounded-2xl text-sm font-bold placeholder:text-slate-300 focus:outline-none focus:ring-2 focus:ring-[#2D5CF7] transition-all shadow-inner`}
                  placeholder="最少 6 位字符"
                />
              </div>
              <div className="flex gap-3">
                <button onClick={() => setShowPasswordModal(false)} className={`flex-1 py-4 ${isDark ? 'bg-slate-800 text-slate-400' : 'bg-slate-50 text-slate-400'} rounded-2xl font-black text-xs uppercase tracking-widest`}>取消</button>
                <button
                  onClick={handleUpdatePassword}
                  disabled={updatingPassword || newPassword.length < 6}
                  className="flex-1 py-4 bg-[#2D5CF7] text-white rounded-2xl font-black text-xs uppercase tracking-widest shadow-lg shadow-blue-500/20 disabled:opacity-50 transition-all"
                >
                  {updatingPassword ? '处理中...' : '提交更新'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserManagement;
