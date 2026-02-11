# PathoLogic AI - Tailwind 样式指南

## 快速参考

### 文本样式

```tsx
// 字号
<p className="text-xs">超小 (12px)</p>
<p className="text-sm">小 (14px)</p>
<p className="text-base">正常 (16px)</p>
<p className="text-lg">大 (18px)</p>
<p className="text-xl">特大 (20px)</p>
<p className="text-2xl">超大 (24px)</p>

// 字重
<p className="font-light">Light (300)</p>
<p className="font-normal">Normal (400)</p>
<p className="font-medium">Medium (500)</p>
<p className="font-semibold">Semibold (600)</p>
<p className="font-bold">Bold (700)</p>

// 颜色
<p className="text-slate-900">深灰 (主文本)</p>
<p className="text-slate-600">中灰 (次文本)</p>
<p className="text-slate-500">浅灰 (弱文本)</p>
<p className="text-blue-600">蓝色 (强调)</p>
<p className="text-red-600">红色 (错误)</p>
<p className="text-green-600">绿色 (成功)</p>

// 行高
<p className="leading-tight">紧凑 (1.25)</p>
<p className="leading-normal">正常 (1.5)</p>
<p className="leading-relaxed">宽松 (1.625)</p>

// 对齐
<p className="text-left">左对齐</p>
<p className="text-center">居中</p>
<p className="text-right">右对齐</p>
```

### 背景与边框

```tsx
// 背景色
<div className="bg-white">白色</div>
<div className="bg-slate-50">浅灰背景</div>
<div className="bg-blue-600">蓝色背景</div>

// 边框
<div className="border border-slate-200">1px 边框</div>
<div className="border-2 border-slate-300">2px 边框</div>
<div className="border-t border-slate-200">上边框</div>
<div className="border-b border-slate-200">下边框</div>

// 圆角
<div className="rounded-lg">标准圆角 (8px)</div>
<div className="rounded-2xl">大圆角 (16px)</div>
<div className="rounded-full">完全圆形</div>

// 阴影
<div className="shadow-sm">小阴影</div>
<div className="shadow-md">中阴影</div>
<div className="shadow-lg">大阴影</div>
<div className="shadow-xl">特大阴影</div>
```

### 间距

```tsx
// 内边距
<div className="p-4">全部 (16px)</div>
<div className="px-4">左右 (16px)</div>
<div className="py-4">上下 (16px)</div>
<div className="pt-4">上 (16px)</div>
<div className="pb-4">下 (16px)</div>

// 外边距
<div className="m-4">全部 (16px)</div>
<div className="mx-4">左右 (16px)</div>
<div className="my-4">上下 (16px)</div>
<div className="mb-6">下 (24px)</div>

// 间隙
<div className="flex gap-4">元素间距 (16px)</div>
<div className="grid gap-6">网格间距 (24px)</div>

// 常用间距值
p-1: 4px
p-2: 8px
p-3: 12px
p-4: 16px
p-6: 24px
p-8: 32px
```

### 弹性布局

```tsx
// 基础
<div className="flex">行布局</div>
<div className="flex flex-col">列布局</div>
<div className="flex flex-wrap">换行</div>

// 对齐
<div className="flex items-start">顶部对齐</div>
<div className="flex items-center">垂直居中</div>
<div className="flex items-end">底部对齐</div>

// 分布
<div className="flex justify-start">左对齐</div>
<div className="flex justify-center">居中</div>
<div className="flex justify-between">两端对齐</div>
<div className="flex justify-around">均匀分布</div>

// 伸缩
<div className="flex-1">占满剩余空间</div>
<div className="flex-shrink-0">不收缩</div>
```

### 网格布局

```tsx
// 列数
<div className="grid grid-cols-1">1 列</div>
<div className="grid grid-cols-2">2 列</div>
<div className="grid grid-cols-3">3 列</div>
<div className="grid grid-cols-4">4 列</div>

// 响应式
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
  移动 1 列 → 平板 2 列 → 桌面 3 列
</div>

// 间距
<div className="grid gap-4">16px 间距</div>
<div className="grid gap-6">24px 间距</div>
```

### 按钮样式

```tsx
// 主按钮
<button className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2.5 rounded-lg font-medium transition-colors">
  主按钮
</button>

// 次按钮
<button className="bg-slate-100 hover:bg-slate-200 text-slate-900 px-6 py-2.5 rounded-lg font-medium transition-colors">
  次按钮
</button>

// 边框按钮
<button className="border border-slate-300 hover:border-blue-600 text-slate-900 px-6 py-2.5 rounded-lg font-medium transition-colors">
  边框按钮
</button>

// 危险按钮
<button className="bg-red-600 hover:bg-red-700 text-white px-6 py-2.5 rounded-lg font-medium transition-colors">
  删除
</button>

// 禁用状态
<button className="bg-blue-600 text-white px-6 py-2.5 rounded-lg font-medium opacity-50 cursor-not-allowed">
  禁用
</button>
```

### 输入框样式

```tsx
// 文本输入
<input 
  className="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
  placeholder="输入内容"
/>

// 禁用状态
<input 
  disabled
  className="w-full px-4 py-2.5 border border-slate-300 rounded-lg bg-slate-50 cursor-not-allowed"
/>

// 错误状态
<input 
  className="w-full px-4 py-2.5 border-2 border-red-500 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-200"
/>
```

### 卡片样式

```tsx
// 基础卡片
<div className="bg-white rounded-2xl border border-slate-200 p-6">
  卡片内容
</div>

// 可悬停卡片
<div className="bg-white rounded-2xl border border-slate-200 p-6 hover:shadow-lg hover:border-slate-300 transition-all cursor-pointer">
  可点击卡片
</div>

// 分层卡片
<div className="bg-white rounded-2xl border border-slate-200">
  <div className="px-6 py-4 border-b border-slate-100">
    <h3 className="font-semibold text-slate-900">标题</h3>
  </div>
  <div className="p-6">
    内容
  </div>
</div>
```

### 提示框样式

```tsx
// 成功
<div className="bg-green-50 border border-green-200 rounded-lg p-4 flex items-start gap-3">
  <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
  <div>
    <p className="font-semibold text-green-900">成功</p>
    <p className="text-sm text-green-700">操作完成</p>
  </div>
</div>

// 错误
<div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-start gap-3">
  <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
  <div>
    <p className="font-semibold text-red-900">错误</p>
    <p className="text-sm text-red-700">出现问题</p>
  </div>
</div>

// 警告
<div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 flex items-start gap-3">
  <AlertTriangle className="w-5 h-5 text-yellow-500 flex-shrink-0 mt-0.5" />
  <div>
    <p className="font-semibold text-yellow-900">警告</p>
    <p className="text-sm text-yellow-700">需要注意</p>
  </div>
</div>

// 信息
<div className="bg-blue-50 border border-blue-200 rounded-lg p-4 flex items-start gap-3">
  <Info className="w-5 h-5 text-blue-500 flex-shrink-0 mt-0.5" />
  <div>
    <p className="font-semibold text-blue-900">信息</p>
    <p className="text-sm text-blue-700">提示信息</p>
  </div>
</div>
```

### 标签样式

```tsx
// 蓝色标签
<span className="inline-block px-3 py-1.5 bg-blue-100 text-blue-700 text-xs font-medium rounded-full">
  标签
</span>

// 绿色标签
<span className="inline-block px-3 py-1.5 bg-green-100 text-green-700 text-xs font-medium rounded-full">
  成功
</span>

// 红色标签
<span className="inline-block px-3 py-1.5 bg-red-100 text-red-700 text-xs font-medium rounded-full">
  错误
</span>

// 灰色标签
<span className="inline-block px-3 py-1.5 bg-slate-100 text-slate-700 text-xs font-medium rounded-full">
  标签
</span>
```

### 加载动画

```tsx
// 旋转加载
<div className="w-6 h-6 border-4 border-slate-200 border-t-blue-600 rounded-full animate-spin" />

// 脉冲加载
<div className="w-6 h-6 bg-blue-600 rounded-full animate-pulse" />

// 文字加载
<span className="animate-spin">⟳</span>
```

### 过渡效果

```tsx
// 颜色过渡
<div className="transition-colors hover:bg-slate-100">
  悬停时改变背景色
</div>

// 所有属性过渡
<div className="transition-all hover:shadow-lg">
  悬停时改变阴影
</div>

// 自定义时长
<div className="transition-colors duration-200">
  200ms 过渡
</div>

// 常用时长
duration-150: 150ms
duration-200: 200ms
duration-300: 300ms
```

### 响应式设计

```tsx
// 基础响应式
<div className="text-sm md:text-base lg:text-lg">
  移动小 → 平板中 → 桌面大
</div>

// 隐藏/显示
<div className="hidden md:block">
  仅在平板及以上显示
</div>

<div className="md:hidden">
  仅在移动设备显示
</div>

// 网格响应式
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
  响应式网格
</div>

// 断点
sm: 640px
md: 768px
lg: 1024px
xl: 1280px
2xl: 1536px
```

### 常见组合

```tsx
// 页面容器
<div className="min-h-screen bg-slate-50 p-6">
  页面内容
</div>

// 卡片容器
<div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm hover:shadow-lg transition-all">
  卡片
</div>

// 按钮组
<div className="flex gap-3">
  <button className="bg-blue-600 text-white px-6 py-2.5 rounded-lg">主</button>
  <button className="border border-slate-300 text-slate-900 px-6 py-2.5 rounded-lg">次</button>
</div>

// 表单组
<div className="space-y-4">
  <div>
    <label className="block text-sm font-medium text-slate-900 mb-2">标签</label>
    <input className="w-full px-4 py-2.5 border border-slate-300 rounded-lg" />
  </div>
</div>

// 列表项
<div className="flex items-center justify-between p-4 border-b border-slate-200 hover:bg-slate-50">
  <div>
    <p className="font-medium text-slate-900">标题</p>
    <p className="text-sm text-slate-600">描述</p>
  </div>
  <button>操作</button>
</div>
```

### 颜色系统

```tsx
// 蓝色系 (主色)
bg-blue-50, bg-blue-100, bg-blue-200, bg-blue-300, bg-blue-400, bg-blue-500, bg-blue-600, bg-blue-700

// 灰色系 (中性)
bg-slate-50, bg-slate-100, bg-slate-200, bg-slate-300, bg-slate-400, bg-slate-500, bg-slate-600, bg-slate-700, bg-slate-900

// 绿色系 (成功)
bg-green-50, bg-green-100, bg-green-500, bg-green-600, bg-green-700

// 红色系 (错误)
bg-red-50, bg-red-100, bg-red-500, bg-red-600, bg-red-700

// 黄色系 (警告)
bg-yellow-50, bg-yellow-100, bg-yellow-500, bg-yellow-600

// 紫色系 (强调)
bg-purple-50, bg-purple-100, bg-purple-500, bg-purple-600

// 青色系 (强调)
bg-cyan-50, bg-cyan-100, bg-cyan-500, bg-cyan-600

// 橙色系 (强调)
bg-orange-50, bg-orange-100, bg-orange-500, bg-orange-600
```

### 不推荐的做法

```tsx
// ❌ 不要使用 gray，用 slate 替代
<div className="bg-gray-50">错误</div>

// ✅ 正确
<div className="bg-slate-50">正确</div>

// ❌ 不要混合使用不同的圆角
<div className="rounded-lg">
  <div className="rounded-full">混乱</div>
</div>

// ✅ 保持一致
<div className="rounded-2xl">
  <div className="rounded-lg">一致</div>
</div>

// ❌ 不要使用过多的阴影
<div className="shadow-sm shadow-md shadow-lg">混乱</div>

// ✅ 选择一个
<div className="shadow-lg">清晰</div>

// ❌ 不要使用 scale 做悬停效果（会导致布局抖动）
<div className="hover:scale-105">不好</div>

// ✅ 使用颜色或阴影
<div className="hover:shadow-lg hover:border-slate-300">好</div>
```

---

## 更新日期

2024年2月11日
