import React, { useState, useEffect } from 'react';
import { Menu, User as UserIcon, Moon, Sun, LogOut, Settings } from 'lucide-react';
import Sidebar from './components/Sidebar';
import Dashboard from './pages/Dashboard';
import SlideAnalyzer from './pages/SlideAnalyzer';
import Quantification from './pages/Quantification';
import ResearchChat from './pages/ResearchChat';
import ExamSystem from './pages/ExamSystem';
import Anatomy from './pages/Anatomy';
import ImmersiveLab from './pages/ImmersiveLab';
import CollaborativeLibrary from './pages/CollaborativeLibrary';
import UserManagement from './pages/UserManagement';
import UserProfile from './pages/UserProfile';
import ChangePassword from './pages/ChangePassword';
import Login from './pages/Login';
import Register from './pages/Register';
import { AppView, User as UserType, AuthState } from './types';
import { authAPI } from './services/apiService';
import { ThemeProvider, useTheme } from './context/ThemeContext';

// 主应用组件，使用主题上下文
const AppContent: React.FC = () => {
  const [currentView, setCurrentView] = useState<AppView>(AppView.LOGIN);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [authState, setAuthState] = useState<AuthState>({
    user: null,
    isAuthenticated: false,
    isLoading: true
  });
  // 用户菜单状态
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  // 主题上下文
  const { theme, toggleTheme, getThemeLabel } = useTheme();

  // 初始化认证状态
  useEffect(() => {
    const initAuth = async () => {
      const token = localStorage.getItem('auth_token');
      if (token) {
        try {
          console.log('验证 token...');
          const user = await authAPI.getCurrentUser();
          console.log('用户验证成功:', user);
          setAuthState({
            user,
            isAuthenticated: true,
            isLoading: false
          });
          setCurrentView(AppView.DASHBOARD);
        } catch (error) {
          console.error('Token 验证失败:', error);
          // Token无效，清除本地存储
          localStorage.removeItem('auth_token');
          setAuthState({
            user: null,
            isAuthenticated: false,
            isLoading: false
          });
        }
      } else {
        setAuthState({
          user: null,
          isAuthenticated: false,
          isLoading: false
        });
      }
    };

    initAuth();
  }, []);

  // 处理登录
  const handleLogin = async (credentials: any) => {
    try {
      console.log('开始登录...');
      const result = await authAPI.login(credentials);
      console.log('登录成功:', result.user);
      setAuthState({
        user: result.user,
        isAuthenticated: true,
        isLoading: false
      });
      setCurrentView(AppView.DASHBOARD);
      return { success: true, user: result.user };
    } catch (error: any) {
      console.error('登录失败:', error);
      return { success: false, error: error.message };
    }
  };

  // 处理注册
  const handleRegister = async (userData: any) => {
    try {
      const result = await authAPI.register(userData);
      setAuthState({
        user: result.user,
        isAuthenticated: true,
        isLoading: false
      });
      setCurrentView(AppView.DASHBOARD);
      return { success: true, user: result.user };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  };

  // 处理登出
  const handleLogout = () => {
    authAPI.logout();
    setAuthState({
      user: null,
      isAuthenticated: false,
      isLoading: false
    });
    setCurrentView(AppView.LOGIN);
    setIsUserMenuOpen(false);
  };

  // 切换到注册页面
  const switchToRegister = () => {
    setCurrentView(AppView.REGISTER);
  };

  // 切换到登录页面
  const switchToLogin = () => {
    setCurrentView(AppView.LOGIN);
  };

  // 切换到修改密码页面
  const handleChangePassword = () => {
    setCurrentView(AppView.CHANGE_PASSWORD);
    setIsUserMenuOpen(false);
  };

  const renderView = () => {
    // 如果正在加载，显示加载界面
    if (authState.isLoading) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 mx-auto mb-4"></div>
            <p className="text-gray-600">加载中...</p>
          </div>
        </div>
      );
    }

    // 如果未认证，显示登录或注册页面
    if (!authState.isAuthenticated) {
      switch (currentView) {
        case AppView.REGISTER:
          return <Register onRegister={handleRegister} onSwitchToLogin={switchToLogin} />;
        default:
          return <Login onLogin={handleLogin} onSwitchToRegister={switchToRegister} />;
      }
    }

    // 已认证用户的页面
    switch (currentView) {
      case AppView.DASHBOARD: return <Dashboard onChangeView={setCurrentView} />;
      case AppView.SLIDE_ANALYSIS: return <SlideAnalyzer />;
      case AppView.QUANTIFICATION: return <Quantification />;
      case AppView.RESEARCH_ASSISTANT: return <ResearchChat />;
      case AppView.EXAM_SYSTEM: return <ExamSystem />;
      case AppView.ANATOMY: return <Anatomy />;
      case AppView.IMMERSIVE_LAB: return <ImmersiveLab />;
      case AppView.COLLAB_LIBRARY: return <CollaborativeLibrary user={authState.user} />;
      case AppView.USER_MANAGEMENT: return <UserManagement currentUser={authState.user} />;
      case AppView.USER_PROFILE: return <UserProfile />;
      case AppView.CHANGE_PASSWORD: return <ChangePassword onBack={() => setCurrentView(AppView.DASHBOARD)} />;
      default: return <Dashboard onChangeView={setCurrentView} />;
    }
  };

  // 如果未认证，直接返回认证页面
  if (!authState.isAuthenticated) {
    return renderView();
  }

  return (
    <div className="min-h-screen flex font-sans text-gray-900 bg-gray-50">
      <div className="lg:block relative">
        <Sidebar 
          currentView={currentView} 
          onChangeView={setCurrentView}
          isOpen={isSidebarOpen}
          setIsOpen={setIsSidebarOpen}
          user={authState.user}
          onLogout={handleLogout}
        />
      </div>

      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <div className="lg:hidden bg-white border-b border-gray-200 px-4 h-16 flex items-center justify-between sticky top-0 z-20">
          <div className="font-semibold text-gray-900">PathoLogic AI</div>
          <div className="relative">
            <button 
              onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
              className="p-2 text-gray-600 hover:bg-gray-50 rounded-lg transition-colors"
            >
              <Menu className="w-5 h-5" />
            </button>
            
            {/* 用户菜单 */}
            {isUserMenuOpen && (
              <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 z-50 overflow-hidden">
                {/* 修改密码 */}
                <button
                  onClick={handleChangePassword}
                  className="w-full text-left px-4 py-3 text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2"
                >
                  <Settings className="w-4 h-4" />
                  <span>修改密码</span>
                </button>
                
                {/* 主题切换 */}
                <button
                  onClick={() => {
                    toggleTheme();
                    setIsUserMenuOpen(false);
                  }}
                  className="w-full text-left px-4 py-3 text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2"
                >
                  <div className={`w-4 h-4 rounded-full mr-2 ${
                    theme === 'colorful' ? 'bg-purple-500' : 'bg-gray-400'
                  }`}></div>
                  <span>{theme === 'colorful' ? '切换到默认主题' : '切换到色彩丰富主题'}</span>
                </button>
                
                {/* 注销账号 */}
                <button
                  onClick={handleLogout}
                  className="w-full text-left px-4 py-3 text-sm text-red-600 hover:bg-gray-50 flex items-center gap-2"
                >
                  <LogOut className="w-4 h-4" />
                  <span>注销账号</span>
                </button>
              </div>
            )}
          </div>
        </div>

        <main className="flex-1 overflow-auto scroll-smooth bg-gray-50 p-0 sm:p-0 md:p-0">
            {renderView()}
          </main>
      </div>
    </div>
  );
};

// 主应用组件包装
function App() {
  return (
    <ThemeProvider>
      <AppContent />
    </ThemeProvider>
  );
}

export default App;