
// API Configuration
// 依赖安装: 无需额外依赖

// Relay API config for all modules (Gemini only)
export const API_CONFIG = {
  BASE_URL: 'https://jeniya.top', // 中转站 API
  // 使用用户提供的最新 Key
  API_KEY: 'sk-4aYXmo1a2jHHjSz503azJcikVZSuOwm5JsMFqGXY67DILsXB',
  MODEL_NAME: 'gemini-2.5-flash', // 可选: gemini-3-pro-preview
  TIMEOUT: 30000
};

// Tripo3D config for 3D model generation only
export const TRIPO3D_API_CONFIG = {
  BASE_URL: 'https://api.tripo3d.ai/v2/openapi', // 改为 Tripo3D 官方 API 地址
  API_KEY: 'tsk_qF3pMIZkZ_qmPgz34kQUqSHY4plmpbNJ11XuDzJfinB',
  MODEL_NAME: 'tripo3d',
  ENDPOINT: '/task'
};
