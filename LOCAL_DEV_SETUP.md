# 本地开发环境设置指南

这个指南将帮助你在本地环境中运行项目，无需 Docker。

## 前置要求

### 1. Node.js
- 版本: 18.0 或更高
- [下载地址](https://nodejs.org/)

### 2. MySQL
- 版本: 8.0 或更高
- [下载地址](https://dev.mysql.com/downloads/mysql/)

## 快速开始

### 步骤 1: 安装依赖

```bash
npm install
```

### 步骤 2: 配置数据库

#### Windows 用户

1. 安装 MySQL Community Server
2. 在安装过程中设置 root 密码为 `root123456`
3. 确保 MySQL 服务正在运行

#### macOS 用户

```bash
# 使用 Homebrew 安装
brew install mysql

# 启动 MySQL
brew services start mysql

# 初始化 MySQL（如果是首次安装）
mysql_secure_installation
```

#### Linux 用户

```bash
# Ubuntu/Debian
sudo apt-get install mysql-server

# 启动 MySQL
sudo systemctl start mysql

# 初始化 MySQL
sudo mysql_secure_installation
```

### 步骤 3: 创建数据库和用户

连接到 MySQL：

```bash
mysql -u root -p
```

输入密码后，执行以下 SQL 命令：

```sql
-- 创建数据库
CREATE DATABASE pathologic_ai_platform CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- 创建用户
CREATE USER 'pathologic_user'@'localhost' IDENTIFIED BY 'pathologic_pass';

-- 授予权限
GRANT ALL PRIVILEGES ON pathologic_ai_platform.* TO 'pathologic_user'@'localhost';

-- 刷新权限
FLUSH PRIVILEGES;

-- 退出
EXIT;
```

或者使用 root 用户（简单方式）：

```bash
mysql -u root -p root123456 -e "CREATE DATABASE IF NOT EXISTS pathologic_ai_platform CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;"
```

### 步骤 4: 验证数据库连接

```bash
mysql -h localhost -u root -p root123456 -D pathologic_ai_platform -e "SHOW TABLES;"
```

### 步骤 5: 启动后端服务

```bash
npm run server
```

你应该看到类似的输出：

```
📡 尝试连接数据库...
   主机: localhost
   用户: root
   数据库: pathologic_ai_platform
   端口: 3306
✅ 数据库连接成功
✅ 数据库表初始化完成
🚀 服务器运行在 http://localhost:3001
🌐 前端URL: http://localhost:3000
📊 数据库: pathologic_ai_platform

✅ 完整功能服务器启动成功！

📋 可用的API端点:
- GET  /api/health - 健康检查
- POST /api/auth/register - 用户注册
- POST /api/auth/login - 用户登录
...

🔑 默认管理员账号:
   邮箱: admin@pathologic.ai
   密码: admin123456
```

### 步骤 6: 启动前端（新终端窗口）

```bash
npm run dev
```

前端将运行在 http://localhost:3000

### 步骤 7: 访问应用

打开浏览器访问 http://localhost:3000

使用默认管理员账号登录：
- 邮箱: `admin@pathologic.ai`
- 密码: `admin123456`

---

## 常见问题

### 问题 1: MySQL 连接失败

**错误信息**: `Access denied for user 'root'@'localhost'`

**解决方案**:

1. 检查 MySQL 是否运行
   ```bash
   # Windows
   tasklist | findstr mysql
   
   # macOS/Linux
   ps aux | grep mysql
   ```

2. 检查 .env 文件中的数据库凭证
   ```
   DB_HOST=localhost
   DB_USER=root
   DB_PASSWORD=root123456
   DB_PORT=3306
   ```

3. 重启 MySQL 服务
   ```bash
   # Windows - 以管理员身份运行
   net stop MySQL80
   net start MySQL80
   
   # macOS
   brew services restart mysql
   
   # Linux
   sudo systemctl restart mysql
   ```

### 问题 2: 端口已被占用

**错误信息**: `Error: listen EADDRINUSE: address already in use :::3001`

**解决方案**:

```bash
# 查看占用端口的进程
# Windows
netstat -ano | findstr :3001

# macOS/Linux
lsof -i :3001

# 修改 .env 中的 PORT
PORT=3002
```

### 问题 3: 数据库表未创建

**解决方案**:

1. 检查后端日志中是否有错误
2. 手动创建表（见下面的数据库管理部分）
3. 重启后端服务

### 问题 4: 前端无法连接到后端

**错误信息**: `Failed to fetch from http://localhost:3001/api`

**解决方案**:

1. 确保后端服务正在运行
2. 检查 .env 中的 `VITE_API_BASE_URL`
   ```
   VITE_API_BASE_URL=http://localhost:3001/api
   ```
3. 检查浏览器控制台的 CORS 错误
4. 重启前端服务

---

## 数据库管理

### 连接数据库

```bash
mysql -h localhost -u root -p root123456 -D pathologic_ai_platform
```

### 查看表结构

```bash
mysql -h localhost -u root -p root123456 -D pathologic_ai_platform -e "SHOW TABLES;"
```

### 备份数据库

```bash
mysqldump -h localhost -u root -p root123456 pathologic_ai_platform > backup.sql
```

### 恢复数据库

```bash
mysql -h localhost -u root -p root123456 pathologic_ai_platform < backup.sql
```

### 清空数据库

```bash
mysql -h localhost -u root -p root123456 -D pathologic_ai_platform -e "DROP DATABASE pathologic_ai_platform; CREATE DATABASE pathologic_ai_platform CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;"
```

---

## 开发工作流

### 同时运行前后端

**方式 1: 两个终端窗口**

终端 1 - 后端:
```bash
npm run server
```

终端 2 - 前端:
```bash
npm run dev
```

**方式 2: 使用 concurrently（如果已安装）**

```bash
npm run dev:all
```

### 修改代码后的操作

- **后端代码**: 自动重启（如果使用 nodemon）
- **前端代码**: 自动热更新（HMR）

### 调试

#### 后端调试

在 `server/simple-server.js` 中添加 `console.log`：

```javascript
console.log('调试信息:', someVariable);
```

查看后端终端的输出。

#### 前端调试

1. 打开浏览器开发者工具 (F12)
2. 查看 Console 标签页的错误信息
3. 使用 React DevTools 浏览器扩展

---

## 文件上传

上传的文件存储在 `./uploads` 目录中。

```bash
# 查看上传的文件
ls -la uploads/

# 清理上传目录
rm -rf uploads/*
```

---

## 环境变量说明

| 变量 | 说明 | 默认值 |
|------|------|--------|
| `VITE_API_BASE_URL` | 前端 API 地址 | `http://localhost:3001/api` |
| `DB_HOST` | 数据库主机 | `localhost` |
| `DB_USER` | 数据库用户 | `root` |
| `DB_PASSWORD` | 数据库密码 | `root123456` |
| `DB_NAME` | 数据库名称 | `pathologic_ai_platform` |
| `DB_PORT` | 数据库端口 | `3306` |
| `JWT_SECRET` | JWT 密钥 | `your_jwt_secret_key_here_change_in_production` |
| `PORT` | 后端服务器端口 | `3001` |
| `NODE_ENV` | 运行环境 | `development` |
| `UPLOAD_DIR` | 文件上传目录 | `uploads` |
| `FRONTEND_URL` | 前端 URL | `http://localhost:3000` |

---

## 性能优化

### 1. 启用查询缓存

在 `server/simple-server.js` 中：

```javascript
const pool = mysql.createPool({
  // ... 其他配置
  connectionLimit: 20,  // 增加连接数
  queueLimit: 0
});
```

### 2. 启用前端构建优化

```bash
npm run build
```

### 3. 监控性能

使用浏览器开发者工具的 Performance 标签页。

---

## 获取帮助

如遇到问题，请：

1. 查看后端日志输出
2. 查看浏览器控制台错误
3. 检查 .env 文件配置
4. 查看本指南的故障排除部分

---

## 下一步

- 阅读 [DESIGN_SYSTEM.md](./DESIGN_SYSTEM.md) 了解设计系统
- 查看 [DESIGN_IMPLEMENTATION_GUIDE.md](./DESIGN_IMPLEMENTATION_GUIDE.md) 了解实现指南
- 查看 [TAILWIND_STYLE_GUIDE.md](./TAILWIND_STYLE_GUIDE.md) 了解样式指南
