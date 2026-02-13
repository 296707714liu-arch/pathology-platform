@echo off
chcp 65001 >nul
setlocal enabledelayedexpansion

echo.
echo ╔════════════════════════════════════════════════════════════╗
echo ║   智能AI病理科研教学平台 - Windows 本地开发环境设置        ║
echo ╚════════════════════════════════════════════════════════════╝
echo.

REM 检查 Node.js
echo [1/5] 检查 Node.js...
node --version >nul 2>&1
if errorlevel 1 (
    echo ❌ Node.js 未安装，请先安装 Node.js v18+
    echo 下载地址: https://nodejs.org/
    pause
    exit /b 1
)
for /f "tokens=*" %%i in ('node --version') do set NODE_VERSION=%%i
echo ✅ Node.js %NODE_VERSION% 已安装
echo.

REM 检查 MySQL
echo [2/5] 检查 MySQL...
mysql --version >nul 2>&1
if errorlevel 1 (
    echo ⚠️  MySQL 命令未找到
    echo.
    echo 请选择:
    echo 1. 已安装 MySQL，但需要添加到 PATH
    echo 2. 未安装 MySQL
    echo.
    set /p choice="请输入选择 (1 或 2): "
    
    if "!choice!"=="1" (
        echo.
        echo 正在添加 MySQL 到 PATH...
        for /d %%D in ("C:\Program Files\MySQL\MySQL Server*") do (
            set MYSQL_PATH=%%D\bin
        )
        
        if defined MYSQL_PATH (
            setx PATH "!PATH!;!MYSQL_PATH!"
            echo ✅ MySQL 已添加到 PATH: !MYSQL_PATH!
            echo 请重启 PowerShell 或 CMD 后重新运行此脚本
            pause
            exit /b 0
        ) else (
            echo ❌ 未找到 MySQL 安装路径
            echo 请手动添加 MySQL bin 目录到 PATH
            pause
            exit /b 1
        )
    ) else (
        echo ❌ 请先安装 MySQL 8.0+
        echo 下载地址: https://dev.mysql.com/downloads/mysql/
        pause
        exit /b 1
    )
)
for /f "tokens=*" %%i in ('mysql --version') do set MYSQL_VERSION=%%i
echo ✅ %MYSQL_VERSION% 已安装
echo.

REM 检查 3001 端口
echo [3/5] 检查端口 3001...
netstat -ano | findstr :3001 >nul 2>&1
if not errorlevel 1 (
    echo ⚠️  端口 3001 已被占用
    for /f "tokens=5" %%i in ('netstat -ano ^| findstr :3001') do set PID=%%i
    echo 进程 ID: !PID!
    echo.
    set /p kill_choice="是否杀死该进程? (y/n): "
    if /i "!kill_choice!"=="y" (
        taskkill /PID !PID! /F >nul 2>&1
        echo ✅ 进程已终止
    ) else (
        echo ⚠️  请修改 .env 中的 PORT 为其他值
    )
) else (
    echo ✅ 端口 3001 可用
)
echo.

REM 创建数据库
echo [4/5] 创建数据库...
mysql -u root -p root123456 -e "CREATE DATABASE IF NOT EXISTS pathologic_ai_platform CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;" >nul 2>&1
if errorlevel 1 (
    echo ❌ 数据库创建失败
    echo 请检查 MySQL 是否运行，以及密码是否正确
    echo.
    echo 尝试手动创建:
    echo mysql -u root -p root123456 -e "CREATE DATABASE IF NOT EXISTS pathologic_ai_platform CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;"
    pause
    exit /b 1
)
echo ✅ 数据库已创建
echo.

REM 安装依赖
echo [5/5] 安装 npm 依赖...
if not exist "node_modules" (
    call npm install
    if errorlevel 1 (
        echo ❌ npm install 失败
        pause
        exit /b 1
    )
) else (
    echo ✅ 依赖已安装
)
echo.

echo ╔════════════════════════════════════════════════════════════╗
echo ║              ✅ 环境设置完成！                             ║
echo ╚════════════════════════════════════════════════════════════╝
echo.
echo 📋 后续步骤:
echo.
echo 1️⃣  启动后端 (PowerShell 或 CMD):
echo    npm run server
echo.
echo 2️⃣  启动前端 (新的 PowerShell 或 CMD 窗口):
echo    npm run dev
echo.
echo 3️⃣  打开浏览器访问:
echo    http://localhost:3000
echo.
echo 4️⃣  使用默认账号登录:
echo    邮箱: admin@pathologic.ai
echo    密码: admin123456
echo.
echo 📚 更多信息请查看:
echo    - QUICK_START.md
echo    - WINDOWS_SETUP.md
echo    - LOCAL_DEV_SETUP.md
echo.
pause
