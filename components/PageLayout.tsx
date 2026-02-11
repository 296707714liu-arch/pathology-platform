/**
 * 统一的页面布局组件
 * 用于所有功能页面的一致性设计
 */
import React from 'react';
import { LucideIcon } from 'lucide-react';

interface PageLayoutProps {
  title: string;
  subtitle?: string;
  icon?: LucideIcon;
  iconColor?: string;
  children: React.ReactNode;
  headerAction?: React.ReactNode;
}

/**
 * 页面标题栏组件
 */
export const PageHeader: React.FC<PageLayoutProps> = ({
  title,
  subtitle,
  icon: Icon,
  iconColor = 'bg-blue-500',
  headerAction
}) => (
  <div className="p-6 border-b border-slate-100 bg-white">
    <div className="flex items-start justify-between">
      <div className="flex items-start gap-4">
        {Icon && (
          <div className={`w-12 h-12 rounded-lg ${iconColor} flex items-center justify-center flex-shrink-0`}>
            <Icon className="w-6 h-6 text-white" />
          </div>
        )}
        <div>
          <h1 className="text-2xl font-bold text-slate-900">{title}</h1>
          {subtitle && <p className="text-sm text-slate-600 mt-1">{subtitle}</p>}
        </div>
      </div>
      {headerAction && <div>{headerAction}</div>}
    </div>
  </div>
);

/**
 * 侧边栏 + 主内容布局
 */
export const SidebarLayout: React.FC<{
  sidebar: React.ReactNode;
  children: React.ReactNode;
}> = ({ sidebar, children }) => (
  <div className="h-screen bg-slate-50 flex">
    <div className="w-80 bg-white border-r border-slate-200 flex flex-col overflow-hidden">
      {sidebar}
    </div>
    <div className="flex-1 flex flex-col overflow-hidden">
      {children}
    </div>
  </div>
);

/**
 * 卡片组件 - 统一样式
 */
export const Card: React.FC<{
  children: React.ReactNode;
  className?: string;
  hover?: boolean;
}> = ({ children, className = '', hover = true }) => (
  <div
    className={`bg-white rounded-2xl border border-slate-200 ${
      hover ? 'hover:shadow-lg hover:border-slate-300' : ''
    } transition-all ${className}`}
  >
    {children}
  </div>
);

/**
 * 卡片头部
 */
export const CardHeader: React.FC<{
  children: React.ReactNode;
  className?: string;
}> = ({ children, className = '' }) => (
  <div className={`px-6 py-4 border-b border-slate-100 ${className}`}>
    {children}
  </div>
);

/**
 * 卡片内容
 */
export const CardBody: React.FC<{
  children: React.ReactNode;
  className?: string;
}> = ({ children, className = '' }) => (
  <div className={`p-6 ${className}`}>
    {children}
  </div>
);

/**
 * 按钮组件 - 统一样式
 */
export const Button: React.FC<{
  children: React.ReactNode;
  variant?: 'primary' | 'secondary' | 'outline' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  disabled?: boolean;
  loading?: boolean;
  icon?: LucideIcon;
  onClick?: () => void;
  className?: string;
}> = ({
  children,
  variant = 'primary',
  size = 'md',
  disabled = false,
  loading = false,
  icon: Icon,
  onClick,
  className = ''
}) => {
  const baseClass = 'inline-flex items-center justify-center font-medium rounded-lg transition-all cursor-pointer';
  
  const variants = {
    primary: 'bg-blue-600 text-white hover:bg-blue-700 disabled:bg-blue-400',
    secondary: 'bg-slate-100 text-slate-900 hover:bg-slate-200 disabled:bg-slate-50',
    outline: 'border border-slate-300 text-slate-900 hover:bg-slate-50 disabled:border-slate-200',
    danger: 'bg-red-600 text-white hover:bg-red-700 disabled:bg-red-400'
  };

  const sizes = {
    sm: 'px-3 py-1.5 text-sm gap-1.5',
    md: 'px-4 py-2.5 text-sm gap-2',
    lg: 'px-6 py-3 text-base gap-2'
  };

  return (
    <button
      onClick={onClick}
      disabled={disabled || loading}
      className={`${baseClass} ${variants[variant]} ${sizes[size]} ${className}`}
    >
      {loading && <span className="animate-spin mr-2">⟳</span>}
      {Icon && <Icon className="w-4 h-4" />}
      {children}
    </button>
  );
};

/**
 * 空状态组件
 */
export const EmptyState: React.FC<{
  icon: LucideIcon;
  title: string;
  description?: string;
  action?: React.ReactNode;
}> = ({ icon: Icon, title, description, action }) => (
  <div className="flex flex-col items-center justify-center py-12 px-4">
    <div className="w-16 h-16 rounded-full bg-slate-100 flex items-center justify-center mb-4">
      <Icon className="w-8 h-8 text-slate-400" />
    </div>
    <h3 className="text-lg font-semibold text-slate-900 mb-1">{title}</h3>
    {description && <p className="text-sm text-slate-600 mb-4">{description}</p>}
    {action && <div>{action}</div>}
  </div>
);

/**
 * 加载状态组件
 */
export const LoadingState: React.FC<{
  message?: string;
}> = ({ message = '加载中...' }) => (
  <div className="flex flex-col items-center justify-center py-12">
    <div className="w-12 h-12 rounded-full border-4 border-slate-200 border-t-blue-600 animate-spin mb-4" />
    <p className="text-slate-600 font-medium">{message}</p>
  </div>
);

/**
 * 提示框组件
 */
export const Alert: React.FC<{
  type: 'success' | 'error' | 'warning' | 'info';
  title?: string;
  message: string;
  icon?: LucideIcon;
}> = ({ type, title, message, icon: Icon }) => {
  const styles = {
    success: 'bg-green-50 border-green-200 text-green-900',
    error: 'bg-red-50 border-red-200 text-red-900',
    warning: 'bg-yellow-50 border-yellow-200 text-yellow-900',
    info: 'bg-blue-50 border-blue-200 text-blue-900'
  };

  const iconColors = {
    success: 'text-green-500',
    error: 'text-red-500',
    warning: 'text-yellow-500',
    info: 'text-blue-500'
  };

  return (
    <div className={`border rounded-lg p-4 flex gap-3 ${styles[type]}`}>
      {Icon && <Icon className={`w-5 h-5 flex-shrink-0 mt-0.5 ${iconColors[type]}`} />}
      <div>
        {title && <p className="font-semibold mb-1">{title}</p>}
        <p className="text-sm">{message}</p>
      </div>
    </div>
  );
};

/**
 * 标签组件
 */
export const Badge: React.FC<{
  children: React.ReactNode;
  variant?: 'primary' | 'secondary' | 'success' | 'warning' | 'error';
  size?: 'sm' | 'md';
}> = ({ children, variant = 'primary', size = 'sm' }) => {
  const variants = {
    primary: 'bg-blue-100 text-blue-700',
    secondary: 'bg-slate-100 text-slate-700',
    success: 'bg-green-100 text-green-700',
    warning: 'bg-yellow-100 text-yellow-700',
    error: 'bg-red-100 text-red-700'
  };

  const sizes = {
    sm: 'px-2 py-1 text-xs',
    md: 'px-3 py-1.5 text-sm'
  };

  return (
    <span className={`inline-block rounded-full font-medium ${variants[variant]} ${sizes[size]}`}>
      {children}
    </span>
  );
};

/**
 * 网格布局组件
 */
export const Grid: React.FC<{
  children: React.ReactNode;
  cols?: 1 | 2 | 3 | 4;
  gap?: 'sm' | 'md' | 'lg';
}> = ({ children, cols = 3, gap = 'md' }) => {
  const colsClass = {
    1: 'grid-cols-1',
    2: 'grid-cols-1 sm:grid-cols-2',
    3: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3',
    4: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-4'
  };

  const gapClass = {
    sm: 'gap-4',
    md: 'gap-6',
    lg: 'gap-8'
  };

  return (
    <div className={`grid ${colsClass[cols]} ${gapClass[gap]}`}>
      {children}
    </div>
  );
};
