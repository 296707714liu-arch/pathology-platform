#!/bin/bash

# 🚀 开发环境快速启动脚本

echo "🚀 启动开发环境..."
echo ""

# 检查 Node.js
if ! command -v node &> /dev/null; then
    echo "❌ Node.js 未安装"
    exit 1
fi

echo "✅ Node.js 版本: $(node --version)"
echo "✅ npm 版本: $(npm --version)"
echo ""

# 检查依赖
if [ ! -d "node_modules" ]; then
    echo "📦 安装依赖..."
    npm install
    echo ""
fi

# 检查环境变量
if [ ! -f ".env.local" ]; then
    echo "⚠️  .env.local 文件不存在"
    echo "📝 创建 .env.local 文件..."
    cat > .env.local << 'EOF'
GEMINI_API_KEY=PLACEHOLDER_API_KEY

# 数据库配置 (Zeabur MySQL)
DB_HOST=sjc1.clusters.zeabur.com
DB_USER=root
DB_PASSWORD=HgwE5i1kq7vOPUtA82R6c904ZzeS3DVn
DB_NAME=zeabur
DB_PORT=23883

# JWT配置
JWT_SECRET=your_jwt_secret_key_here
JWT_EXPIRES_IN=7d

# 服务器配置
PORT=3001
NODE_ENV=development

# 文件上传配置
UPLOAD_DIR=uploads
MAX_FILE_SIZE=50MB

# 前端URL（用于CORS）
FRONTEND_URL=http://localhost:3000
EOF
    echo "✅ .env.local 已创建"
    echo ""
fi

# 测试数据库连接
echo "🔍 测试数据库连接..."
node test-db-connection.js

if [ $? -ne 0 ]; then
    echo ""
    echo "⚠️  数据库连接失败，但继续启动..."
    echo ""
fi

# 启动前端和后端
echo ""
echo "🎯 启动开发服务器..."
echo ""
echo "📝 说明："
echo "  - 前端: http://localhost:3000"
echo "  - 后端: http://localhost:3001"
echo "  - API: http://localhost:3001/api"
echo ""
echo "💡 按 Ctrl+C 停止服务器"
echo ""

# 使用 concurrently 同时启动前后端（如果已安装）
if npm list concurrently &> /dev/null; then
    npm run dev:all
else
    echo "⚠️  concurrently 未安装，请在两个终端中分别运行："
    echo ""
    echo "终端 1:"
    echo "  npm run dev"
    echo ""
    echo "终端 2:"
    echo "  npm run server"
    echo ""
fi
