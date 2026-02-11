@echo off
REM 🚀 开发环境快速启动脚本 (Windows)

echo 🚀 启动开发环境...
echo.

REM 检查 Node.js
where node >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo ❌ Node.js 未安装
    exit /b 1
)

for /f "tokens=*" %%i in ('node --version') do set NODE_VERSION=%%i
for /f "tokens=*" %%i in ('npm --version') do set NPM_VERSION=%%i

echo ✅ Node.js 版本: %NODE_VERSION%
echo ✅ npm 版本: %NPM_VERSION%
echo.

REM 检查依赖
if not exist "node_modules" (
    echo 📦 安装依赖...
    call npm install
    echo.
)

REM 检查环境变量
if not exist ".env.local" (
    echo ⚠️  .env.local 文件不存在
    echo 📝 创建 .env.local 文件...
    (
        echo GEMINI_API_KEY=PLACEHOLDER_API_KEY
        echo.
        echo # 数据库配置 (Zeabur MySQL^)
        echo DB_HOST=sjc1.clusters.zeabur.com
        echo DB_USER=root
        echo DB_PASSWORD=HgwE5i1kq7vOPUtA82R6c904ZzeS3DVn
        echo DB_NAME=zeabur
        echo DB_PORT=23883
        echo.
        echo # JWT配置
        echo JWT_SECRET=your_jwt_secret_key_here
        echo JWT_EXPIRES_IN=7d
        echo.
        echo # 服务器配置
        echo PORT=3001
        echo NODE_ENV=development
        echo.
        echo # 文件上传配置
        echo UPLOAD_DIR=uploads
        echo MAX_FILE_SIZE=50MB
        echo.
        echo # 前端URL（用于CORS^)
        echo FRONTEND_URL=http://localhost:3000
    ) > .env.local
    echo ✅ .env.local 已创建
    echo.
)

REM 测试数据库连接
echo 🔍 测试数据库连接...
node test-db-connection.js

if %ERRORLEVEL% NEQ 0 (
    echo.
    echo ⚠️  数据库连接失败，但继续启动...
    echo.
)

REM 启动前端和后端
echo.
echo 🎯 启动开发服务器...
echo.
echo 📝 说明：
echo   - 前端: http://localhost:3000
echo   - 后端: http://localhost:3001
echo   - API: http://localhost:3001/api
echo.
echo 💡 按 Ctrl+C 停止服务器
echo.

REM 检查是否安装了 concurrently
npm list concurrently >nul 2>&1
if %ERRORLEVEL% EQU 0 (
    call npm run dev:all
) else (
    echo ⚠️  concurrently 未安装，请在两个终端中分别运行：
    echo.
    echo 终端 1:
    echo   npm run dev
    echo.
    echo 终端 2:
    echo   npm run server
    echo.
    pause
)
