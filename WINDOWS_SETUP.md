# Windows 本地开发环境设置

## 问题 1: MySQL 命令找不到

### 解决方案：添加 MySQL 到 PATH

#### 方式 1: 自动添加（推荐）

在 PowerShell 中运行（以管理员身份）：

```powershell
# 查找 MySQL 安装路径
$mysqlPath = Get-ChildItem "C:\Program Files\MySQL" -Recurse -Filter "mysql.exe" | Select-Object -First 1 -ExpandProperty DirectoryName

if ($mysqlPath) {
    # 添加到 PATH
    $env:Path += ";$mysqlPath"
    [Environment]::SetEnvironmentVariable("Path", $env:Path, [EnvironmentVariableTarget]::User)
    Write-Host "✅ MySQL 已添加到 PATH: $mysqlPath"
} else {
    Write-Host "❌ 未找到 MySQL，请检查是否已安装"
}
```

#### 方式 2: 手动添加

1. 打开 **系统属性** → **环境变量**
2. 在 **用户变量** 中找到 **Path**，点击 **编辑**
3. 点击 **新建**，添加 MySQL 路径，例如：
   ```
   C:\Program Files\MySQL\MySQL Server 8.0\bin
   ```
4. 点击 **确定** 保存
5. 重启 PowerShell 或 CMD

#### 验证安装

```powershell
mysql --version
```

应该看到类似输出：
```
mysql  Ver 8.0.x for Win64 on x86_64
```

---

## 问题 2: 端口 3001 已被占用

### 快速解决

```powershell
# 查看占用 3001 的进程
netstat -ano | findstr :3001

# 杀死进程（替换 PID）
taskkill /PID <PID> /F

# 例如：
taskkill /PID 31156 /F
```

### 或者修改端口

编辑 `.env` 文件：

```properties
PORT=3002
```

然后前端访问 http://localhost:3002

---

## 完整 Windows 设置步骤

### 1. 安装 MySQL

下载：https://dev.mysql.com/downloads/mysql/

安装时记住密码（建议设为 `root123456`）

### 2. 启动 MySQL 服务

```powershell
# 以管理员身份运行 PowerShell

# 启动 MySQL
net start MySQL80

# 停止 MySQL
net stop MySQL80

# 重启 MySQL
net stop MySQL80
net start MySQL80
```

### 3. 创建数据库

```powershell
# 使用 MySQL 命令行
mysql -u root -p root123456 -e "CREATE DATABASE IF NOT EXISTS pathologic_ai_platform CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;"

# 验证
mysql -u root -p root123456 -e "SHOW DATABASES;" | findstr pathologic
```

### 4. 安装项目依赖

```powershell
npm install
```

### 5. 启动后端

```powershell
npm run server
```

看到这个输出说明成功：
```
✅ 数据库连接成功
✅ 数据库表初始化完成
🚀 服务器运行在 http://localhost:3001
```

### 6. 启动前端（新 PowerShell 窗口）

```powershell
npm run dev
```

### 7. 打开浏览器

访问 http://localhost:3000

登录账号：
- 邮箱: `admin@pathologic.ai`
- 密码: `admin123456`

---

## 常见问题

### ❌ "mysql : 无法将"mysql"项识别为 cmdlet"

**原因**: MySQL 不在 PATH 中

**解决**:
1. 查找 MySQL 安装路径（通常是 `C:\Program Files\MySQL\MySQL Server 8.0\bin`）
2. 添加到环境变量 PATH
3. 重启 PowerShell

### ❌ "Access denied for user 'root'@'localhost'"

**原因**: 密码错误

**解决**:
1. 检查 `.env` 中的 `DB_PASSWORD`
2. 或重置 MySQL root 密码

### ❌ "Error: listen EADDRINUSE: address already in use :::3001"

**原因**: 端口被占用

**解决**:
```powershell
# 查看占用进程
netstat -ano | findstr :3001

# 杀死进程
taskkill /PID <PID> /F

# 或修改 .env 中的 PORT
```

### ❌ MySQL 服务无法启动

```powershell
# 以管理员身份运行

# 检查服务状态
Get-Service MySQL80

# 启动服务
Start-Service MySQL80

# 重启服务
Restart-Service MySQL80
```

---

## 快速命令参考

```powershell
# 启动 MySQL
net start MySQL80

# 停止 MySQL
net stop MySQL80

# 连接数据库
mysql -u root -p root123456 -D pathologic_ai_platform

# 查看所有数据库
mysql -u root -p root123456 -e "SHOW DATABASES;"

# 查看所有表
mysql -u root -p root123456 -D pathologic_ai_platform -e "SHOW TABLES;"

# 启动后端
npm run server

# 启动前端
npm run dev

# 查看占用的端口
netstat -ano | findstr :3001

# 杀死进程
taskkill /PID <PID> /F
```

---

## 下一步

- 查看 [QUICK_START.md](./QUICK_START.md) 快速启动
- 查看 [LOCAL_DEV_SETUP.md](./LOCAL_DEV_SETUP.md) 详细配置
