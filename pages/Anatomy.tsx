/**
 * AI 3D 解剖室
 * 使用 Tripo3D API 生成专业医学 3D 模型
 */
import React, { useState } from 'react';
import { Activity, Loader2, AlertCircle, Play, Sparkles } from 'lucide-react';
import { generateModel } from '../services/tripo3dService';
import { activityAPI } from '../services/apiService';
import Anatomy3D from '../components/Anatomy3D';

// 预设的医学模型提示词
const PRESET_PROMPTS = [
  { label: '人体心脏', prompt: 'Highly detailed anatomical human heart, medical illustration style, realistic textures, showing chambers and blood vessels' },
  { label: '人体大脑', prompt: 'Detailed human brain anatomy, medical model, showing cerebral cortex, cerebellum, brain stem, realistic textures' },
  { label: '人体肺部', prompt: 'Anatomical human lungs, medical illustration, showing bronchi, alveoli, detailed respiratory system' },
  { label: '人体肝脏', prompt: 'Detailed human liver anatomy, medical model, showing lobes and blood vessels, realistic organ texture' },
  { label: '人体肾脏', prompt: 'Anatomical human kidney cross-section, medical illustration, showing nephrons, cortex, medulla' },
  { label: '人体骨骼', prompt: 'Human skeleton anatomy, medical model, detailed bone structure, realistic textures' },
  { label: '人体眼球', prompt: 'Detailed human eye anatomy, medical cross-section, showing cornea, lens, retina, optic nerve' },
  { label: '人体胃部', prompt: 'Anatomical human stomach, medical illustration, showing layers, gastric folds, realistic textures' },
];

const Anatomy: React.FC = () => {
  const [userPrompt, setUserPrompt] = useState('');
  const [modelUrl, setModelUrl] = useState<string | null>(null);
  const [modelTitle, setModelTitle] = useState<string>('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [progress, setProgress] = useState(0);
  const [status, setStatus] = useState<string>('');
  const [error, setError] = useState<string | null>(null);

  const handleGenerate = async (prompt: string, title: string) => {
    if (!prompt.trim() || isGenerating) return;
    
    setIsGenerating(true);
    setError(null);
    setModelUrl(null);
    setProgress(0);
    setStatus('正在创建任务...');
    setModelTitle(title || prompt);
    
    const startTime = Date.now();

    try {
      // 调用 Tripo3D API 生成模型
      const url = await generateModel(prompt, (prog, stat) => {
        setProgress(prog);
        setStatus(stat === 'queued' ? '排队中...' : 
                  stat === 'running' ? '生成中...' : 
                  stat === 'success' ? '完成!' : stat);
      });

      setModelUrl(url);
      setStatus('完成!');
      
      // 记录活动
      const duration = Math.round((Date.now() - startTime) / 1000);
      await activityAPI.logActivity('anatomy_view', 'AI 3D 解剖室', { 
        prompt: prompt,
        model_url: url 
      }, duration);

    } catch (e: any) {
      console.error('[Anatomy] Generation failed:', e);
      setError(e.message || '生成失败，请稍后重试');
      setStatus('');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleCustomGenerate = () => {
    if (userPrompt.trim()) {
      // 为自定义提示词添加医学风格描述
      const enhancedPrompt = `${userPrompt}, highly detailed medical anatomy model, realistic textures, professional medical illustration style`;
      handleGenerate(enhancedPrompt, userPrompt);
    }
  };

  return (
    <div className="h-screen bg-gray-50 flex">
      {/* Left Sidebar - Controls */}
      <div className="w-80 bg-white border-r border-gray-200 flex flex-col">
        {/* Header */}
        <div className="p-6 border-b border-gray-100">
          <div className="flex items-center mb-2">
            <Activity className="w-6 h-6 text-gray-700 mr-3" />
            <h1 className="text-xl font-semibold text-gray-900">3D 解剖室</h1>
          </div>
          <p className="text-sm text-gray-600">AI 生成专业医学 3D 模型</p>
        </div>

        {/* Preset Models */}
        <div className="p-6 border-b border-gray-100">
          <h3 className="text-sm font-medium text-gray-900 mb-4">预设模型</h3>
          <div className="space-y-2">
            {PRESET_PROMPTS.map((preset, index) => (
              <button
                key={index}
                onClick={() => handleGenerate(preset.prompt, preset.label)}
                disabled={isGenerating}
                className="w-full text-left px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {preset.label}
              </button>
            ))}
          </div>
        </div>

        {/* Custom Input */}
        <div className="p-6 border-b border-gray-100">
          <h3 className="text-sm font-medium text-gray-900 mb-4">自定义模型</h3>
          <div className="space-y-3">
            <textarea
              value={userPrompt}
              onChange={(e) => setUserPrompt(e.target.value)}
              placeholder="描述您想要的解剖结构..."
              className="w-full h-20 px-3 py-2 border border-gray-200 rounded-lg text-sm resize-none focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent"
            />
            <button
              onClick={handleCustomGenerate}
              disabled={!userPrompt.trim() || isGenerating}
              className="w-full py-2.5 px-4 bg-gray-900 text-white rounded-lg hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center"
            >
              {isGenerating ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  生成中...
                </>
              ) : (
                <>
                  <Play className="w-4 h-4 mr-2" />
                  生成模型
                </>
              )}
            </button>
          </div>
        </div>

        {/* Generation Status */}
        {isGenerating && (
          <div className="p-6 border-b border-gray-100">
            <div className="space-y-3">
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-600">生成进度</span>
                <span className="text-gray-900 font-medium">{progress}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className="bg-gray-900 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${progress}%` }}
                />
              </div>
              <p className="text-xs text-gray-600">{status}</p>
            </div>
          </div>
        )}

        {/* Error Display */}
        {error && (
          <div className="p-6 border-b border-gray-100">
            <div className="bg-red-50 border border-red-200 rounded-lg p-3 flex items-start">
              <AlertCircle className="w-4 h-4 text-red-500 mr-2 mt-0.5 flex-shrink-0" />
              <p className="text-sm text-red-700">{error}</p>
            </div>
          </div>
        )}

        {/* Tips */}
        <div className="p-6 flex-1">
          <h3 className="text-sm font-medium text-gray-900 mb-3">使用提示</h3>
          <div className="space-y-2 text-xs text-gray-600">
            <p>• 描述要尽可能详细和准确</p>
            <p>• 生成时间约 2-5 分钟</p>
            <p>• 支持拖拽旋转和缩放</p>
            <p>• 点击模型部位查看名称</p>
          </div>
        </div>
      </div>

      {/* Right Main Content */}
      <div className="flex-1 flex flex-col">
        {/* Content Header */}
        <div className="p-6 bg-white border-b border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-medium text-gray-900">3D 模型查看器</h2>
              <p className="text-sm text-gray-600">
                {modelTitle ? `当前模型: ${modelTitle}` : '选择或生成模型开始查看'}
              </p>
            </div>
            {modelUrl && (
              <div className="flex items-center text-sm text-green-600">
                <Sparkles className="w-4 h-4 mr-1" />
                模型已就绪
              </div>
            )}
          </div>
        </div>

        {/* Main Content Area */}
        <div className="flex-1 bg-gray-100">
          {modelUrl ? (
            <Anatomy3D modelUrl={modelUrl} title={modelTitle} />
          ) : (
            <div className="h-full flex items-center justify-center">
              <div className="text-center">
                <Activity className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">等待生成</h3>
                <p className="text-gray-600">选择预设模型或输入自定义描述开始生成</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Anatomy;