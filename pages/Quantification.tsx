import React, { useState, useRef } from 'react';
import { Upload, X, AlertCircle, ScanEye, Loader2, PieChart, Info, Layers, Code, Microscope, Terminal, AlertTriangle, Eye, BarChart3 } from 'lucide-react';
import { quantifyTissue } from '../services/geminiService';
import { activityAPI } from '../services/apiService';
import { QuantificationResult } from '../types';

const Quantification: React.FC = () => {
  const [image, setImage] = useState<string | null>(null);
  const [mimeType, setMimeType] = useState<string>('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [result, setResult] = useState<QuantificationResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const imageRef = useRef<HTMLImageElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) { setError('请上传有效的图片文件 (JPEG, PNG).'); return; }

    const reader = new FileReader();
    reader.onloadend = () => {
      setImage(reader.result as string);
      setMimeType(file.type);
      setResult(null);
      setError(null);
    };
    reader.readAsDataURL(file);
  };

  const handleAnalyze = async () => {
    if (!image || !mimeType) return;
    setIsAnalyzing(true);
    setError(null);
    const startTime = Date.now();
    try {
      const base64Data = image.split(',')[1];
      const data = await quantifyTissue(base64Data, mimeType);
      setResult(data);
      
      // 记录活动
      const duration = Math.round((Date.now() - startTime) / 1000);
      await activityAPI.logActivity('quantification', '细胞计数', { result: !!data }, duration);
    } catch (err) {
      setError("分析失败，请稍后重试。");
    } finally {
      setIsAnalyzing(false);
    }
  };

  const renderBoundingBoxes = () => {
    if (!result || !result.detections || !containerRef.current || !imageRef.current) return null;
    return result.detections.map((box, idx) => {
      const top = (box.ymin / 1000) * 100;
      const left = (box.xmin / 1000) * 100;
      const height = ((box.ymax - box.ymin) / 1000) * 100;
      const width = ((box.xmax - box.xmin) / 1000) * 100;
      const isTumor = box.label.toLowerCase().includes('tumor') || box.label.includes('肿瘤');

      return (
        <div
          key={idx}
          className={`absolute border-2 transition-all duration-300 rounded-md group hover:bg-opacity-20 hover:bg-white z-10 ${isTumor ? 'border-pink-500 shadow-[0_0_10px_rgba(236,72,153,0.5)]' : 'border-cyan-400 shadow-[0_0_10px_rgba(34,211,238,0.5)]'}`}
          style={{ top: `${top}%`, left: `${left}%`, width: `${width}%`, height: `${height}%` }}
        >
          <div className={`absolute -top-7 left-1/2 -translate-x-1/2 text-[10px] font-bold px-2 py-1 rounded-full text-white opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none ${isTumor ? 'bg-pink-500' : 'bg-cyan-500'}`}>
            {box.label}
          </div>
        </div>
      );
    });
  };

  return (
    <div className="h-screen bg-slate-50 flex">
      {/* 左侧控制面板 (320px) */}
      <div className="w-80 bg-white border-r border-slate-200 flex flex-col">
        {/* 页面标题 */}
        <div className="p-6 border-b border-slate-100">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-lg bg-purple-500 flex items-center justify-center">
              <Eye className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-lg font-bold text-slate-900">自动细胞计数</h1>
              <p className="text-xs text-slate-500">AI 视觉识别与计数</p>
            </div>
          </div>
        </div>

        {/* 功能控制 */}
        <div className="p-6 border-b border-slate-100">
          <h3 className="text-sm font-medium text-slate-900 mb-4">上传图片</h3>
          
          {!image ? (
            <div 
              onClick={() => fileInputRef.current?.click()}
              className="border-2 border-dashed border-slate-300 rounded-lg p-6 text-center cursor-pointer hover:border-purple-400 hover:bg-purple-50 transition-colors"
            >
              <Upload className="w-8 h-8 text-slate-400 mx-auto mb-2" />
              <p className="text-sm text-slate-600 mb-1">点击上传图片</p>
              <p className="text-xs text-slate-500">支持组织切片、细胞图像</p>
              <input ref={fileInputRef} type="file" className="hidden" accept="image/*" onChange={handleFileChange} />
            </div>
          ) : (
            <div className="space-y-3">
              <div className="relative">
                <img src={image} alt="Uploaded tissue" className="w-full h-32 object-cover rounded-lg border border-slate-200" />
                <button 
                  onClick={() => {
                    setImage(null);
                    setResult(null);
                    setError(null);
                    if (fileInputRef.current) fileInputRef.current.value = '';
                  }}
                  className="absolute top-2 right-2 w-6 h-6 bg-slate-900 text-white rounded-full flex items-center justify-center hover:bg-slate-700 transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
              
              <button
                onClick={handleAnalyze}
                disabled={!image || isAnalyzing}
                className="w-full py-2.5 px-4 bg-purple-600 hover:bg-purple-700 text-white rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center font-medium"
              >
                {isAnalyzing ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    分析中...
                  </>
                ) : (
                  <>
                    <Layers className="w-4 h-4 mr-2" />
                    开始量化
                  </>
                )}
              </button>
            </div>
          )}
        </div>

        {/* 状态显示 */}
        {error && (
          <div className="p-6 border-b border-slate-100">
            <div className="bg-red-50 border border-red-200 rounded-lg p-3 flex items-start gap-2">
              <AlertCircle className="w-4 h-4 text-red-500 mt-0.5 flex-shrink-0" />
              <p className="text-sm text-red-700">{error}</p>
            </div>
          </div>
        )}

        {/* 使用提示 */}
        <div className="p-6 flex-1 overflow-y-auto">
          <h3 className="text-sm font-medium text-slate-900 mb-3">分析说明</h3>
          <div className="space-y-2 text-xs text-slate-600">
            <p>• 支持 H&E 染色组织切片</p>
            <p>• 自动识别细胞核和细胞质</p>
            <p>• 计算细胞密度和分布</p>
            <p>• 提供形态学参数测量</p>
          </div>
        </div>
      </div>

      {/* 右侧主内容区域 (自适应宽度) */}
      <div className="flex-1 flex flex-col bg-slate-50">
        {/* 内容标题栏 */}
        <div className="p-6 bg-white border-b border-slate-200">
          <h2 className="text-lg font-bold text-slate-900">量化结果</h2>
          <p className="text-sm text-slate-600 mt-1">组织量化分析数据</p>
        </div>

        {/* 主要内容区域 */}
        <div className="flex-1 overflow-y-auto p-6">
          {!result && !isAnalyzing && (
            <div className="h-full flex items-center justify-center">
              <div className="text-center">
                <div className="w-16 h-16 rounded-full bg-slate-100 flex items-center justify-center mx-auto mb-4">
                  <PieChart className="w-8 h-8 text-slate-400" />
                </div>
                <h3 className="text-lg font-semibold text-slate-900 mb-2">等待分析</h3>
                <p className="text-slate-600">请上传组织图片开始量化分析</p>
              </div>
            </div>
          )}

          {isAnalyzing && (
            <div className="h-full flex items-center justify-center">
              <div className="text-center">
                <div className="w-16 h-16 rounded-full border-4 border-slate-200 border-t-purple-600 animate-spin mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-slate-900 mb-2">AI 分析中</h3>
                <p className="text-slate-600">正在进行组织量化...</p>
              </div>
            </div>
          )}

          {image && !result && !isAnalyzing && (
            <div className="h-full flex items-center justify-center">
              <div className="text-center">
                <img src={image} alt="Uploaded tissue" className="w-full max-w-2xl mx-auto mb-6 rounded-lg shadow-md" />
                <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 flex items-center mx-auto max-w-md">
                  <AlertTriangle className="w-4 h-4 mr-2 text-gray-600" />
                  <p className="text-sm text-gray-800">点击左侧"开始量化"按钮进行分析</p>
                </div>
              </div>
            </div>
          )}

          {result && (
            <div className="max-w-4xl mx-auto space-y-6">
              {/* Composition */}
              {result.composition && (
                <div className="bg-white rounded-lg border border-gray-200 p-6">
                  <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
                    <Layers className="w-5 h-5 mr-2 text-gray-600" />
                    组织组成
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {Object.entries(result.composition).map(([key, value]) => (
                      <div key={key} className="bg-gray-50 rounded-lg p-4">
                        <div className="text-sm font-medium text-gray-900 mb-1">
                          {key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}
                        </div>
                        <div className="text-lg font-semibold text-gray-700">{value}</div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Counts */}
              {result.counts && (
                <div className="bg-white rounded-lg border border-gray-200 p-6">
                  <h3 className="text-lg font-medium text-gray-900 mb-4">细胞计数</h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {Object.entries(result.counts).map(([key, value]) => (
                      <div key={key} className="text-center">
                        <div className="text-2xl font-bold text-gray-900">{value}</div>
                        <div className="text-sm text-gray-600 mt-1">
                          {key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Morphometrics */}
              {result.morphometrics && (
                <div className="bg-white rounded-lg border border-gray-200 p-6">
                  <h3 className="text-lg font-medium text-gray-900 mb-4">形态学测量</h3>
                  <div className="space-y-3">
                    {Object.entries(result.morphometrics).map(([key, value]) => (
                      <div key={key} className="flex justify-between items-center py-2 border-b border-gray-100 last:border-b-0">
                        <span className="text-gray-700">
                          {key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}
                        </span>
                        <span className="font-medium text-gray-900">{value}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Technical Report */}
              {result.technicalReport && (
                <div className="bg-white rounded-lg border border-gray-200 p-6">
                  <h3 className="text-lg font-medium text-gray-900 mb-4">技术报告</h3>
                  <div className="space-y-4 text-sm">
                    <div>
                      <div className="font-medium text-gray-900 mb-1">模型架构</div>
                      <div className="text-gray-700">{result.technicalReport.architecture}</div>
                    </div>
                    <div>
                      <div className="font-medium text-gray-900 mb-1">损失函数</div>
                      <div className="text-gray-700">{result.technicalReport.lossFunction}</div>
                    </div>
                    <div>
                      <div className="font-medium text-gray-900 mb-1">评估指标</div>
                      <div className="text-gray-700">{result.technicalReport.evaluationMetrics}</div>
                    </div>
                    <div>
                      <div className="font-medium text-gray-900 mb-1">实现步骤</div>
                      <div className="text-gray-700">{result.technicalReport.implementationSteps.join('; ')}</div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Quantification;