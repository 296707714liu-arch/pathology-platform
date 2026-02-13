# 快速启动指南

## 一分钟快速开始

### 前置条件检查

```bash
# 检查 Node.js
node --version  # 需要 v18+

# 检查 MySQL
mysql --version  # 需要 v8.0+
```

### 步骤 1: 创建数据库（仅需一次）

```bash
# 使用 root 用户创建数据库
mysql -u root -p root123456 -e "CREATE DATABASE IF NOT EXISTS pathologic_ai_platform CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;"

# 验证创建成功
mysql -u root -p root123456 -e "SHOW DATABASES;" | grep pathologic
```

### 步骤 2: 安装依赖（仅需一次）

```bash
npm install
```

### 步骤 3: 启动后端

```bash
npm run server
```

看到这个输出说明成功：
```
✅ 数据库连接成功
✅ 数据库表初始化完成
🚀 服务器运行在 http://localhost:3001
🔑 默认管理员账号:
   邮箱: admin@pathologic.ai
   密码: admin123456
```

### 步骤 4: 启动前端（新终端窗口）

```bash
npm run dev
```

看到这个输出说明成功：
```
  VITE v6.2.0  ready in 123 ms

  ➜  Local:   http://localhost:3000/
```

### 步骤 5: 打开浏览器

访问 http://localhost:3000

使用默认账号登录：
- 邮箱: `admin@pathologic.ai`
- 密码: `admin123456`

---

## 常见问题快速解决

### ❌ MySQL 连接失败

```bash
# 1. 检查 MySQL 是否运行
mysql -u root -p root123456 -e "SELECT 1;"

# 2. 如果失败，重启 MySQL
# Windows (管理员):
net stop MySQL80
net start MySQL80

# macOS:
brew services restart mysql

# Linux:
sudo systemctl restart mysql
```

### ❌ 端口被占用

```bash
# 查看占用 3001 的进程
# Windows:
netstat -ano | findstr :3001

# macOS/Linux:
lsof -i :3001

# 修改 .env 中的 PORT 为其他值，如 3002
```

### ❌ 前端无法连接后端

1. 确保后端正在运行（看到 `🚀 服务器运行在` 消息）
2. 检查 .env 中的 `VITE_API_BASE_URL=http://localhost:3001/api`
3. 打开浏览器开发者工具 (F12) 查看 Network 标签页的错误

### ❌ npm install 失败

```bash
# 清理缓存
npm cache clean --force

# 重新安装
npm install
```

---

## 开发技巧

### 同时运行前后端

**方式 1: 两个终端（推荐）**

终端 1:
```bash
npm run server
```

终端 2:
```bash
npm run dev
```

**方式 2: 一个命令（需要 concurrently）**

```bash
npm run dev:all
```

### 修改代码

- **后端**: 修改 `server/simple-server.js` 后自动重启
- **前端**: 修改任何文件后自动热更新

### 查看数据库

```bash
# 连接数据库
mysql -u root -p root123456 -D pathologic_ai_platform

# 查看所有表
SHOW TABLES;

# 查看用户表
SELECT * FROM users;

# 退出
EXIT;
```

---

## 下一步

- 查看 [LOCAL_DEV_SETUP.md](./LOCAL_DEV_SETUP.md) 了解详细配置
- 查看 [DESIGN_SYSTEM.md](./DESIGN_SYSTEM.md) 了解设计系统
- 查看 [DESIGN_IMPLEMENTATION_GUIDE.md](./DESIGN_IMPLEMENTATION_GUIDE.md) 了解实现指南

---

## 需要帮助？

1. 查看后端终端的错误信息
2. 打开浏览器开发者工具 (F12) 查看前端错误
3. 查看 [LOCAL_DEV_SETUP.md](./LOCAL_DEV_SETUP.md) 的故障排除部分
