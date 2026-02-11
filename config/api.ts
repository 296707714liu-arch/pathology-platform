
// API Configuration
// 依赖安装: 无需额外依赖

// Relay API config for all modules (Gemini only)
export const API_CONFIG = {
  BASE_URL: 'https://jeniya.top', // 中转站 API
  API_KEY: 'sk-cOLeoqb0rIe6BIVHy0iVpIB3e0edfIqFXLKdH3C4Mia2j2vQ',
  MODEL_NAME: 'gemini-2.5-flash', // 所有模块使用 Gemini
  TIMEOUT: 30000
};

// Tripo3D config for 3D model generation only
export const TRIPO3D_API_CONFIG = {
  BASE_URL: 'https://jeniya.top', // 中转站 API
  API_KEY: 'sk-cOLeoqb0rIe6BIVHy0iVpIB3e0edfIqFXLKdH3C4Mia2j2vQ',
  MODEL_NAME: 'tripo3d', // 仅用于 3D 模型生成
  ENDPOINT: '/v1/tripo3d/task'
};
