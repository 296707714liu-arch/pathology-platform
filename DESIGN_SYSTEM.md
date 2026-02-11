# PathoLogic AI - 设计系统规范

## 1. 设计理念
- **专业性**：医疗行业专业、严谨的视觉表达
- **现代感**：清晰的层级、流畅的交互、科技感十足
- **一致性**：所有页面遵循统一的设计语言
- **可用性**：清晰的信息架构、直观的操作流程

---

## 2. 色彩系统

### 主色调
- **主蓝色**：`#3b82f6` - 主要操作、链接、强调
- **深蓝色**：`#1e40af` - 悬停、活跃状态
- **浅蓝色**：`#dbeafe` - 背景、禁用状态

### 功能色
- **成功绿**：`#10b981` - 完成、通过、正常
- **警告橙**：`#f59e0b` - 警告、需要注意
- **错误红**：`#ef4444` - 错误、失败、删除
- **信息蓝**：`#3b82f6` - 信息提示

### 中性色（灰度系）
- **背景**：`#f9fafb` (gray-50)
- **表面**：`#ffffff` (white)
- **边框**：`#e5e7eb` (gray-200)
- **文本主**：`#111827` (gray-900)
- **文本次**：`#6b7280` (gray-500)
- **文本弱**：`#9ca3af` (gray-400)

---

## 3. 排版系统

### 字体
- **主字体**：Inter (Google Fonts)
- **备用字体**：-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif

### 字号与权重
```
H1: 2.5rem (40px) - 800 weight - 页面标题
H2: 2rem (32px) - 800 weight - 主要章节
H3: 1.5rem (24px) - 700 weight - 子章节
H4: 1.25rem (20px) - 700 weight - 小标题
H5: 1.125rem (18px) - 600 weight - 卡片标题
H6: 1rem (16px) - 600 weight - 小卡片标题

Body: 1rem (16px) - 400 weight - 正文
Small: 0.875rem (14px) - 400 weight - 辅助文本
Tiny: 0.75rem (12px) - 400 weight - 标签、提示
```

### 行高
- 标题：1.2
- 正文：1.6
- 紧凑：1.4

---

## 4. 间距系统

### 基础单位：0.25rem (4px)

```
p-1: 0.25rem (4px)
p-2: 0.5rem (8px)
p-3: 0.75rem (12px)
p-4: 1rem (16px)
p-6: 1.5rem (24px)
p-8: 2rem (32px)
```

### 常用间距
- **卡片内边距**：p-6 (24px)
- **页面边距**：p-8 (32px)
- **元素间距**：gap-4 (16px)
- **大间距**：gap-6 (24px)

---

## 5. 圆角系统

```
rounded-sm: 0.125rem (2px) - 细微圆角
rounded-md: 0.5rem (8px) - 标准圆角（按钮、输入框）
rounded-lg: 1rem (16px) - 卡片圆角
rounded-xl: 1.5rem (24px) - 大卡片
rounded-2xl: 1.5rem (24px) - 特大卡片
rounded-full: 9999px - 完全圆形
```

---

## 6. 阴影系统

```
shadow-sm: 0 1px 2px rgba(0,0,0,0.05)
shadow-md: 0 1px 3px rgba(0,0,0,0.05)
shadow-lg: 0 4px 6px -1px rgba(0,0,0,0.1)
shadow-xl: 0 10px 15px -3px rgba(0,0,0,0.1)
```

### 使用场景
- **卡片默认**：shadow-sm
- **卡片悬停**：shadow-lg
- **模态框**：shadow-xl
- **浮动元素**：shadow-lg

---

## 7. 组件规范

### 7.1 卡片 (Card)
```tsx
<div className="bg-white rounded-2xl p-6 border border-gray-200 hover:shadow-lg transition-all cursor-pointer">
  {/* 内容 */}
</div>
```

**特点**：
- 背景：白色
- 圆角：rounded-2xl (24px)
- 内边距：p-6 (24px)
- 边框：1px solid gray-200
- 悬停：shadow-lg + 平滑过渡

### 7.2 按钮 (Button)

**主按钮**：
```tsx
<button className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2.5 rounded-lg font-medium transition-colors">
  操作
</button>
```

**次按钮**：
```tsx
<button className="bg-gray-100 hover:bg-gray-200 text-gray-900 px-6 py-2.5 rounded-lg font-medium transition-colors">
  操作
</button>
```

**边框按钮**：
```tsx
<button className="border border-gray-300 hover:border-blue-600 text-gray-900 px-6 py-2.5 rounded-lg font-medium transition-colors">
  操作
</button>
```

### 7.3 输入框 (Input)
```tsx
<input 
  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:border-blue-600 focus:ring-2 focus:ring-blue-100 transition-all"
  placeholder="输入内容"
/>
```

### 7.4 标签 (Badge)
```tsx
<span className="inline-block px-3 py-1 bg-blue-50 text-blue-600 text-xs font-medium rounded-full">
  标签
</span>
```

### 7.5 图标
- **来源**：Lucide React
- **大小**：w-4 h-4 (16px) - 小, w-6 h-6 (24px) - 中, w-8 h-8 (32px) - 大
- **颜色**：继承文本颜色或显式指定

---

## 8. 页面布局模式

### 8.1 侧边栏 + 主内容
```
┌─────────────────────────────────────┐
│ Sidebar (w-64) │ Main Content        │
│                │ (flex-1)            │
│                │                     │
└─────────────────────────────────────┘
```

### 8.2 顶部标题 + 内容网格
```
┌─────────────────────────────────────┐
│ 页面标题 + 描述                      │
├─────────────────────────────────────┤
│ 卡片1  │ 卡片2  │ 卡片3             │
│ 卡片4  │ 卡片5  │ 卡片6             │
└─────────────────────────────────────┘
```

### 8.3 左侧控制 + 右侧预览
```
┌──────────────┬──────────────────────┐
│ 控制面板     │ 预览区域             │
│ (w-80)       │ (flex-1)             │
│              │                      │
└──────────────┴──────────────────────┘
```

---

## 9. 交互规范

### 9.1 过渡效果
- **快速**：150ms - 颜色变化、透明度
- **标准**：200ms - 大多数交互
- **缓慢**：300ms - 模态框、大型动画

### 9.2 悬停状态
- **卡片**：shadow-sm → shadow-lg
- **按钮**：背景色变深 + 文字颜色变化
- **链接**：颜色变深 + 下划线

### 9.3 活跃状态
- **导航项**：背景色 + 文字颜色反转
- **标签页**：下划线 + 文字加粗
- **按钮**：按下效果 (transform: translateY(1px))

### 9.4 禁用状态
- **按钮**：opacity-50 + cursor-not-allowed
- **输入框**：bg-gray-50 + cursor-not-allowed

---

## 10. 响应式设计

### 断点
```
sm: 640px
md: 768px
lg: 1024px
xl: 1280px
2xl: 1536px
```

### 常用模式
- **移动优先**：从小屏幕开始设计
- **侧边栏**：lg 以上显示，以下隐藏
- **网格**：1列(mobile) → 2列(sm) → 3列(md) → 4列(lg)

---

## 11. 页面特定规范

### 11.1 AI 阅片室 (SlideAnalyzer)
- **布局**：左侧控制面板 (w-80) + 右侧预览
- **主色**：蓝色系
- **关键组件**：上传区、分析按钮、结果展示

### 11.2 3D 解剖模拟 (Anatomy)
- **布局**：左侧预设 + 右侧 3D 模型
- **主色**：青色系 (cyan)
- **关键组件**：预设列表、自定义输入、模型查看器

### 11.3 考试中心 (ExamSystem)
- **布局**：标签页 + 内容区
- **主色**：紫色系
- **关键组件**：题目卡片、答题区、成绩展示

### 11.4 协同资源库 (CollaborativeLibrary)
- **布局**：顶部筛选 + 网格列表
- **主色**：橙色系
- **关键组件**：搜索、筛选、卡片列表

### 11.5 用户管理 (UserManagement)
- **布局**：顶部操作栏 + 表格
- **主色**：灰色系
- **关键组件**：搜索、添加按钮、数据表格

---

## 12. 常见模式

### 12.1 空状态
```tsx
<div className="flex flex-col items-center justify-center py-12">
  <Icon className="w-12 h-12 text-gray-300 mb-4" />
  <p className="text-gray-500 font-medium">暂无数据</p>
  <p className="text-gray-400 text-sm">请先上传或创建内容</p>
</div>
```

### 12.2 加载状态
```tsx
<div className="flex items-center justify-center py-8">
  <Loader2 className="w-6 h-6 animate-spin text-blue-600 mr-2" />
  <span className="text-gray-600">加载中...</span>
</div>
```

### 12.3 错误提示
```tsx
<div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-start">
  <AlertCircle className="w-5 h-5 text-red-500 mr-3 flex-shrink-0 mt-0.5" />
  <div>
    <p className="text-red-900 font-medium">错误</p>
    <p className="text-red-700 text-sm">错误描述</p>
  </div>
</div>
```

### 12.4 成功提示
```tsx
<div className="bg-green-50 border border-green-200 rounded-lg p-4 flex items-start">
  <Check className="w-5 h-5 text-green-500 mr-3 flex-shrink-0 mt-0.5" />
  <p className="text-green-900 font-medium">成功</p>
</div>
```

---

## 13. 实现检查清单

### 视觉质量
- [ ] 无 emoji 图标（使用 Lucide SVG）
- [ ] 所有图标来自同一集合
- [ ] 悬停状态不导致布局抖动
- [ ] 颜色对比度满足 WCAG AA 标准

### 交互
- [ ] 所有可点击元素有 cursor-pointer
- [ ] 悬停状态清晰可见
- [ ] 过渡效果平滑 (150-300ms)
- [ ] 焦点状态可见（键盘导航）

### 响应式
- [ ] 在 375px 宽度下可用
- [ ] 在 768px 宽度下可用
- [ ] 在 1024px 宽度下可用
- [ ] 无水平滚动条

### 可访问性
- [ ] 所有图片有 alt 文本
- [ ] 表单输入有标签
- [ ] 颜色不是唯一指示器
- [ ] 支持键盘导航

---

## 14. 快速参考

### 常用 Tailwind 类
```
文本：text-sm, text-base, text-lg, text-xl, text-2xl
字重：font-light, font-normal, font-medium, font-semibold, font-bold
颜色：text-gray-600, text-blue-600, text-red-600
背景：bg-white, bg-gray-50, bg-blue-600
边框：border, border-gray-200, border-blue-600
圆角：rounded-lg, rounded-2xl, rounded-full
阴影：shadow-sm, shadow-lg, shadow-xl
间距：p-4, m-4, gap-4, mb-6
弹性：flex, flex-col, items-center, justify-between
网格：grid, grid-cols-3, gap-6
```

---

## 15. 主题切换

### 默认主题（深色文本）
- 背景：白色/灰色
- 文本：深灰色
- 强调：蓝色

### 彩色主题（colorful）
- 背景：浅紫色
- 文本：深蓝色
- 强调：紫色渐变
- 次强调：青色、橙色

---

## 更新日期
2024年2月11日

## 维护者
PathoLogic AI 设计团队
