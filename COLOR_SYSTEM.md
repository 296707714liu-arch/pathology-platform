# PathoLogic AI - 颜色系统

## 1. 核心色彩

### 主色 - 蓝色
```
蓝色-50:   #eff6ff
蓝色-100:  #dbeafe
蓝色-200:  #bfdbfe
蓝色-300:  #93c5fd
蓝色-400:  #60a5fa
蓝色-500:  #3b82f6  ← 主色
蓝色-600:  #2563eb  ← 悬停
蓝色-700:  #1d4ed8
蓝色-800:  #1e40af
蓝色-900:  #1e3a8a
```

### 中性色 - 灰色 (Slate)
```
灰色-50:   #f9fafb
灰色-100:  #f3f4f6
灰色-200:  #e5e7eb
灰色-300:  #d1d5db
灰色-400:  #9ca3af
灰色-500:  #6b7280
灰色-600:  #4b5563
灰色-700:  #374151
灰色-800:  #1f2937
灰色-900:  #111827
```

### 功能色

#### 成功 - 绿色
```
绿色-50:   #f0fdf4
绿色-100:  #dcfce7
绿色-500:  #22c55e
绿色-600:  #16a34a  ← 主色
绿色-700:  #15803d
```

#### 错误 - 红色
```
红色-50:   #fef2f2
红色-100:  #fee2e2
红色-500:  #ef4444
红色-600:  #dc2626  ← 主色
红色-700:  #b91c1c
```

#### 警告 - 黄色
```
黄色-50:   #fefce8
黄色-100:  #fef3c7
黄色-500:  #eab308
黄色-600:  #ca8a04  ← 主色
黄色-700:  #a16207
```

#### 信息 - 蓝色
```
蓝色-50:   #eff6ff
蓝色-100:  #dbeafe
蓝色-500:  #3b82f6
蓝色-600:  #2563eb  ← 主色
蓝色-700:  #1d4ed8
```

---

## 2. 页面主题色

### AI 阅片室
- 主色：蓝色 (#3b82f6)
- 图标背景：bg-blue-500
- 按钮：bg-blue-600 hover:bg-blue-700
- 强调：text-blue-600

### 3D 解剖模拟
- 主色：青色 (#06b6d4)
- 图标背景：bg-cyan-500
- 按钮：bg-cyan-600 hover:bg-cyan-700
- 强调：text-cyan-600

### 考试中心
- 主色：紫色 (#a855f7)
- 图标背景：bg-purple-500
- 按钮：bg-purple-600 hover:bg-purple-700
- 强调：text-purple-600

### 协同资源库
- 主色：橙色 (#f97316)
- 图标背景：bg-orange-500
- 按钮：bg-orange-600 hover:bg-orange-700
- 强调：text-orange-600

### 学术/科研
- 主色：绿色 (#22c55e)
- 图标背景：bg-emerald-500
- 按钮：bg-emerald-600 hover:bg-emerald-700
- 强调：text-emerald-600

### 用户管理
- 主色：灰色 (#6b7280)
- 图标背景：bg-slate-500
- 按钮：bg-slate-600 hover:bg-slate-700
- 强调：text-slate-600

---

## 3. 使用规范

### 3.1 文本颜色

```tsx
// 主文本 (标题、重要内容)
<p className="text-slate-900">主文本</p>

// 次文本 (描述、说明)
<p className="text-slate-600">次文本</p>

// 弱文本 (辅助、提示)
<p className="text-slate-500">弱文本</p>

// 强调文本
<p className="text-blue-600">强调</p>

// 成功文本
<p className="text-green-600">成功</p>

// 错误文本
<p className="text-red-600">错误</p>

// 警告文本
<p className="text-yellow-600">警告</p>
```

### 3.2 背景颜色

```tsx
// 页面背景
<div className="bg-slate-50">页面背景</div>

// 卡片背景
<div className="bg-white">卡片背景</div>

// 强调背景
<div className="bg-blue-50">强调背景</div>

// 成功背景
<div className="bg-green-50">成功背景</div>

// 错误背景
<div className="bg-red-50">错误背景</div>

// 警告背景
<div className="bg-yellow-50">警告背景</div>
```

### 3.3 边框颜色

```tsx
// 标准边框
<div className="border border-slate-200">标准边框</div>

// 强调边框
<div className="border border-blue-600">强调边框</div>

// 成功边框
<div className="border border-green-600">成功边框</div>

// 错误边框
<div className="border border-red-600">错误边框</div>

// 警告边框
<div className="border border-yellow-600">警告边框</div>
```

### 3.4 按钮颜色

```tsx
// 主按钮 (蓝色)
<button className="bg-blue-600 hover:bg-blue-700 text-white">
  主按钮
</button>

// 次按钮 (灰色)
<button className="bg-slate-100 hover:bg-slate-200 text-slate-900">
  次按钮
</button>

// 危险按钮 (红色)
<button className="bg-red-600 hover:bg-red-700 text-white">
  删除
</button>

// 成功按钮 (绿色)
<button className="bg-green-600 hover:bg-green-700 text-white">
  确认
</button>
```

---

## 4. 对比度检查

### WCAG AA 标准 (4.5:1)

✅ 通过
- 黑色文本 (#111827) on 白色背景 (#ffffff)
- 白色文本 (#ffffff) on 蓝色 (#3b82f6)
- 白色文本 (#ffffff) on 绿色 (#22c55e)
- 白色文本 (#ffffff) on 红色 (#ef4444)

❌ 不通过
- 灰色文本 (#9ca3af) on 白色背景 (#ffffff)
- 浅蓝文本 (#93c5fd) on 白色背景 (#ffffff)

---

## 5. 渐变色

### 主渐变 (蓝色 → 紫色)
```css
background: linear-gradient(135deg, #3b82f6 0%, #8b5cf6 100%);
```

### 次渐变 (青色 → 蓝色)
```css
background: linear-gradient(135deg, #06b6d4 0%, #3b82f6 100%);
```

### 强调渐变 (橙色 → 红色)
```css
background: linear-gradient(135deg, #f97316 0%, #ef4444 100%);
```

---

## 6. 深色模式支持

### 默认主题 (浅色)
```
背景：#ffffff (white)
表面：#f9fafb (slate-50)
文本：#111827 (slate-900)
边框：#e5e7eb (slate-200)
```

### 彩色主题 (深色)
```
背景：#f8fafc (slate-50)
表面：#ffffff (white)
文本：#1e293b (slate-800)
边框：#e2e8f0 (slate-200)
强调：#8b5cf6 (purple-500)
```

---

## 7. 颜色应用示例

### 卡片组件

```tsx
<div className="bg-white border border-slate-200 rounded-2xl p-6 hover:shadow-lg hover:border-slate-300 transition-all">
  <h3 className="text-slate-900 font-semibold mb-2">标题</h3>
  <p className="text-slate-600 text-sm">描述文本</p>
</div>
```

### 按钮组件

```tsx
<button className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2.5 rounded-lg font-medium transition-colors">
  操作
</button>
```

### 提示框

```tsx
<div className="bg-green-50 border border-green-200 rounded-lg p-4">
  <p className="text-green-900 font-semibold">成功</p>
  <p className="text-green-700 text-sm">操作完成</p>
</div>
```

### 标签

```tsx
<span className="inline-block px-3 py-1.5 bg-blue-100 text-blue-700 text-xs font-medium rounded-full">
  标签
</span>
```

---

## 8. 禁用状态

```tsx
// 禁用按钮
<button className="bg-blue-600 text-white opacity-50 cursor-not-allowed">
  禁用
</button>

// 禁用输入框
<input className="bg-slate-50 border border-slate-200 cursor-not-allowed" disabled />

// 禁用文本
<p className="text-slate-400">禁用文本</p>
```

---

## 9. 焦点状态

```tsx
// 输入框焦点
<input className="focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent" />

// 按钮焦点
<button className="focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2" />

// 链接焦点
<a className="focus:outline-none focus:ring-2 focus:ring-blue-500 rounded" />
```

---

## 10. 更新日期

2024年2月11日
