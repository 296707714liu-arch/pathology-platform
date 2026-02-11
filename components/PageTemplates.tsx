/**
 * 页面模板示例
 * 展示如何使用 PageLayout 组件创建统一的页面设计
 */

import React from 'react';
import {
  PageHeader,
  SidebarLayout,
  Card,
  CardHeader,
  CardBody,
  Button,
  Grid,
  EmptyState,
  LoadingState,
  Alert,
  Badge
} from './PageLayout';
import { Eye, Upload, Loader2, AlertCircle, CheckCircle } from 'lucide-react';

/**
 * 模板 1: 左侧控制 + 右侧预览（用于 AI 阅片室、3D 解剖等）
 */
export const SidebarPreviewTemplate: React.FC<{
  title: string;
  subtitle: string;
  icon: any;
  iconColor: string;
  sidebarContent: React.ReactNode;
  mainContent: React.ReactNode;
  isLoading?: boolean;
}> = ({
  title,
  subtitle,
  icon: Icon,
  iconColor,
  sidebarContent,
  mainContent,
  isLoading = false
}) => (
  <SidebarLayout
    sidebar={
      <div className="flex flex-col h-full">
        <PageHeader
          title={title}
          subtitle={subtitle}
          icon={Icon}
          iconColor={iconColor}
        />
        <div className="flex-1 overflow-y-auto">
          {sidebarContent}
        </div>
      </div>
    }
  >
    <div className="flex-1 flex flex-col overflow-hidden bg-slate-50">
      {isLoading ? (
        <div className="flex-1 flex items-center justify-center">
          <LoadingState message="处理中..." />
        </div>
      ) : (
        <div className="flex-1 overflow-y-auto p-6">
          {mainContent}
        </div>
      )}
    </div>
  </SidebarLayout>
);

/**
 * 模板 2: 顶部操作栏 + 表格（用于用户管理等）
 */
export const TableTemplate: React.FC<{
  title: string;
  subtitle: string;
  icon: any;
  iconColor: string;
  actions?: React.ReactNode;
  filters?: React.ReactNode;
  children: React.ReactNode;
  isLoading?: boolean;
}> = ({
  title,
  subtitle,
  icon: Icon,
  iconColor,
  actions,
  filters,
  children,
  isLoading = false
}) => (
  <div className="h-screen flex flex-col bg-slate-50">
    <PageHeader
      title={title}
      subtitle={subtitle}
      icon={Icon}
      iconColor={iconColor}
      headerAction={actions}
    />

    {filters && (
      <div className="bg-white border-b border-slate-200 p-6">
        {filters}
      </div>
    )}

    <div className="flex-1 overflow-y-auto">
      {isLoading ? (
        <div className="flex items-center justify-center h-full">
          <LoadingState />
        </div>
      ) : (
        children
      )}
    </div>
  </div>
);

/**
 * 模板 3: 标签页 + 内容（用于考试中心等）
 */
export const TabbedTemplate: React.FC<{
  title: string;
  subtitle: string;
  icon: any;
  iconColor: string;
  tabs: Array<{
    id: string;
    label: string;
    content: React.ReactNode;
  }>;
  activeTab: string;
  onTabChange: (tabId: string) => void;
}> = ({
  title,
  subtitle,
  icon: Icon,
  iconColor,
  tabs,
  activeTab,
  onTabChange
}) => (
  <div className="h-screen flex flex-col bg-slate-50">
    <PageHeader
      title={title}
      subtitle={subtitle}
      icon={Icon}
      iconColor={iconColor}
    />

    <div className="bg-white border-b border-slate-200">
      <div className="flex gap-1 px-6">
        {tabs.map(tab => (
          <button
            key={tab.id}
            onClick={() => onTabChange(tab.id)}
            className={`px-4 py-3 font-medium text-sm border-b-2 transition-colors ${
              activeTab === tab.id
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-slate-600 hover:text-slate-900'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>
    </div>

    <div className="flex-1 overflow-y-auto p-6">
      {tabs.find(t => t.id === activeTab)?.content}
    </div>
  </div>
);

/**
 * 模板 4: 网格卡片（用于首页、资源库等）
 */
export const GridTemplate: React.FC<{
  title: string;
  subtitle: string;
  icon: any;
  iconColor: string;
  headerAction?: React.ReactNode;
  items: Array<{
    id: string;
    title: string;
    description?: string;
    icon?: any;
    badge?: string;
    onClick?: () => void;
  }>;
  cols?: 1 | 2 | 3 | 4;
  isLoading?: boolean;
  isEmpty?: boolean;
}> = ({
  title,
  subtitle,
  icon: Icon,
  iconColor,
  headerAction,
  items,
  cols = 3,
  isLoading = false,
  isEmpty = false
}) => (
  <div className="h-screen flex flex-col bg-slate-50">
    <PageHeader
      title={title}
      subtitle={subtitle}
      icon={Icon}
      iconColor={iconColor}
      headerAction={headerAction}
    />

    <div className="flex-1 overflow-y-auto p-6">
      {isLoading ? (
        <LoadingState />
      ) : isEmpty ? (
        <EmptyState
          icon={Icon}
          title="暂无内容"
          description="还没有相关数据"
        />
      ) : (
        <Grid cols={cols} gap="md">
          {items.map(item => (
            <Card
              key={item.id}
              hover
              className="cursor-pointer"
              onClick={item.onClick}
            >
              <CardBody>
                <div className="flex items-start gap-3 mb-3">
                  {item.icon && (
                    <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center flex-shrink-0">
                      <item.icon className="w-5 h-5 text-blue-600" />
                    </div>
                  )}
                  {item.badge && (
                    <Badge variant="primary" size="sm">
                      {item.badge}
                    </Badge>
                  )}
                </div>
                <h3 className="font-semibold text-slate-900 mb-1">
                  {item.title}
                </h3>
                {item.description && (
                  <p className="text-sm text-slate-600">
                    {item.description}
                  </p>
                )}
              </CardBody>
            </Card>
          ))}
        </Grid>
      )}
    </div>
  </div>
);

/**
 * 模板 5: 聊天界面（用于学术/科研等）
 */
export const ChatTemplate: React.FC<{
  title: string;
  subtitle: string;
  icon: any;
  iconColor: string;
  messages: Array<{
    id: string;
    role: 'user' | 'assistant';
    text: string;
    timestamp?: Date;
  }>;
  onSendMessage: (message: string) => void;
  isLoading?: boolean;
  inputPlaceholder?: string;
}> = ({
  title,
  subtitle,
  icon: Icon,
  iconColor,
  messages,
  onSendMessage,
  isLoading = false,
  inputPlaceholder = '输入消息...'
}) => {
  const [input, setInput] = React.useState('');
  const scrollRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSend = () => {
    if (input.trim()) {
      onSendMessage(input);
      setInput('');
    }
  };

  return (
    <div className="h-screen flex flex-col bg-slate-50">
      <PageHeader
        title={title}
        subtitle={subtitle}
        icon={Icon}
        iconColor={iconColor}
      />

      <div
        ref={scrollRef}
        className="flex-1 overflow-y-auto p-6 space-y-4"
      >
        {messages.map(msg => (
          <div
            key={msg.id}
            className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div
              className={`max-w-md px-4 py-3 rounded-lg ${
                msg.role === 'user'
                  ? 'bg-blue-600 text-white'
                  : 'bg-white border border-slate-200 text-slate-900'
              }`}
            >
              <p className="text-sm">{msg.text}</p>
              {msg.timestamp && (
                <p
                  className={`text-xs mt-1 ${
                    msg.role === 'user'
                      ? 'text-blue-100'
                      : 'text-slate-500'
                  }`}
                >
                  {msg.timestamp.toLocaleTimeString()}
                </p>
              )}
            </div>
          </div>
        ))}
        {isLoading && (
          <div className="flex justify-start">
            <div className="bg-white border border-slate-200 px-4 py-3 rounded-lg">
              <Loader2 className="w-5 h-5 text-slate-600 animate-spin" />
            </div>
          </div>
        )}
      </div>

      <div className="bg-white border-t border-slate-200 p-4">
        <div className="flex gap-2">
          <input
            type="text"
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyPress={e => e.key === 'Enter' && handleSend()}
            placeholder={inputPlaceholder}
            disabled={isLoading}
            className="flex-1 px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-slate-50"
          />
          <Button
            variant="primary"
            onClick={handleSend}
            disabled={isLoading || !input.trim()}
            icon={Upload}
          >
            发送
          </Button>
        </div>
      </div>
    </div>
  );
};

/**
 * 模板 6: 表单页面（用于登录、注册等）
 */
export const FormTemplate: React.FC<{
  title: string;
  subtitle?: string;
  children: React.ReactNode;
  onSubmit?: () => void;
  submitText?: string;
  isLoading?: boolean;
}> = ({
  title,
  subtitle,
  children,
  onSubmit,
  submitText = '提交',
  isLoading = false
}) => (
  <div className="min-h-screen bg-gradient-to-br from-blue-50 to-slate-100 flex items-center justify-center p-4">
    <Card className="w-full max-w-md">
      <CardBody>
        <div className="text-center mb-6">
          <h1 className="text-2xl font-bold text-slate-900">{title}</h1>
          {subtitle && (
            <p className="text-sm text-slate-600 mt-1">{subtitle}</p>
          )}
        </div>

        <div className="space-y-4 mb-6">
          {children}
        </div>

        {onSubmit && (
          <Button
            variant="primary"
            onClick={onSubmit}
            disabled={isLoading}
            className="w-full"
          >
            {isLoading ? '处理中...' : submitText}
          </Button>
        )}
      </CardBody>
    </Card>
  </div>
);
