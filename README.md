<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://github.com/user-attachments/assets/0aa67016-6eaf-458a-adb2-6e31a0763ed6" />
</div>

# Run and deploy your AI Studio app

This contains everything you need to run your app locally.

View your app in AI Studio: https://ai.studio/apps/drive/1vuAY2ExIGswswHvCch2rehFmT7cba_O-

## Run Locally

**Prerequisites:**  Node.js

### 启动前端

1. Install dependencies:
   ```bash
   npm install
   ```
2. Set the `GEMINI_API_KEY` in [.env.local](.env.local) to your Gemini API key
3. Run the app:
   ```bash
   npm run dev
   ```

### 启动后端服务器

**方式 1: 使用 npm 命令（推荐）**
```bash
npm run server
```

或者：
```bash
npm start
```

**方式 2: 使用启动脚本**

- Windows: 双击 `启动服务器.bat` 或在命令行运行
- Linux/macOS: 运行 `bash 启动服务器.sh`

**服务器配置：**

- 默认端口: `3001`
- 健康检查: `http://localhost:3001/api/health`
- 如果没有 MySQL 数据库，服务器会以降级模式运行（仅提供 API 代理功能）

**详细说明：** 查看 [QUICK_START_SERVER.md](./QUICK_START_SERVER.md) 或 [LOCAL_DEV_SETUP.md](./LOCAL_DEV_SETUP.md)
