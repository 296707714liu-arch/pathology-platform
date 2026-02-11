import React, { createContext, useState, useEffect, useContext, ReactNode } from 'react';

// 定义主题类型
type Theme = 'default' | 'colorful';

// 定义上下文类型
interface ThemeContextType {
  theme: Theme;
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
  // 从localStorage获取主题，默认为default
  const [theme, setTheme] = useState<Theme>(() => {
    const savedTheme = localStorage.getItem('theme');
    return (savedTheme as Theme) || 'default';
  });

  // 获取主题的中文标签
  const getThemeLabel = (): string => {
    return theme === 'colorful' ? '色彩丰富' : '默认主题';
  };

  // 切换主题函数
  const toggleTheme = () => {
    setTheme(prevTheme => prevTheme === 'default' ? 'colorful' : 'default');
  };

  // 当主题变化时，更新localStorage和HTML根元素的data-theme属性
  useEffect(() => {
    localStorage.setItem('theme', theme);
    document.documentElement.setAttribute('data-theme', theme);
  }, [theme]);

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme, getThemeLabel }}>
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
