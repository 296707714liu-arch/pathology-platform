import React, { createContext, useState, useEffect, useContext, ReactNode } from 'react';

// 定义主题类型
type Theme = 'default' | 'colorful' | 'dark';

// 定义上下文类型
interface ThemeContextType {
  theme: Theme;
  setTheme: (theme: Theme) => void;
  toggleTheme: () => void;
  getThemeLabel: () => string;
}

// 创建上下文
const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

// 主题提供者组件
interface ThemeProviderProps {
  children: ReactNode;
}

export const ThemeProvider: React.FC<ThemeProviderProps> = ({ children }) => {
  // 从localStorage获取主题，默认为 default (白色主题)
  const [theme, setTheme] = useState<Theme>(() => {
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme === 'dark' || savedTheme === 'colorful' || savedTheme === 'default') {
      return savedTheme as Theme;
    }
    return 'default'; // 显式默认白色
  });

  // 获取主题的中文标签
  const getThemeLabel = (): string => {
    return theme === 'dark' ? '深色模式' : '浅色模式';
  };

  // 切换主题函数 (简化为两态切换，确保点击即生效)
  const toggleTheme = () => {
    setTheme(prevTheme => prevTheme === 'dark' ? 'default' : 'dark');
  };

  // 当主题变化时，同步更新 localStorage 和 DOM 属性
  useEffect(() => {
    localStorage.setItem('theme', theme);
    document.documentElement.setAttribute('data-theme', theme);
    document.body.setAttribute('data-theme', theme); // 同时在 body 上挂载，确保覆盖更稳
    console.log('[Theme] Current theme:', theme);
  }, [theme]);

  return (
    <ThemeContext.Provider value={{ theme, setTheme, toggleTheme, getThemeLabel }}>
      {children}
    </ThemeContext.Provider>
  );
};

// 自定义钩子，用于在组件中使用主题上下文
export const useTheme = (): ThemeContextType => {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};
