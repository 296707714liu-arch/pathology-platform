import React, { useState, useRef } from 'react';
import { Upload, X, AlertCircle, ScanEye, Loader2, PieChart, Info, Layers, Code, Microscope, Terminal, AlertTriangle, Eye, BarChart3 } from 'lucide-react';
import { QuantificationResult } from '../types';

const SlideAnalyzer: React.FC = () => {
  const [image, setImage] = useState<string | null>(null);
  const [mimeType, setMimeType] = useState<string>('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [result, setResult] = useState<QuantificationResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const imageRef = useRef<HTMLImageElement>(null);

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

  return (
    <div className="h-screen bg-slate-50 flex">
      {/* 左侧控制面板 (320px) */}
      <div className="w-80 bg-white border-r border-slate-200 flex flex-col">
        {/* 页面标题 */}
        <div className="p-6 border-b border-slate-100">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-lg bg-blue-500 flex items-center justify-center">
              <Eye className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-lg font-bold text-slate-900">AI 阅片室</h1>
              <p className="text-xs text-slate-500">智能病理切片分析</p>
            </div>
          </div>
        </div>

        {/* 功能控制 */}
        <div className="p-6 border-b border-slate-100">
          <h3 className="text-sm font-medium text-slate-900 mb-4">上传切片</h3>
          
          {!image ? (
            <div 
              onClick={() => fileInputRef.current?.click()}
              className="border-2 border-dashed border-slate-300 rounded-lg p-6 text-center cursor-pointer hover:border-blue-400 hover:bg-blue-50 transition-colors"
            >
              <Upload className="w-8 h-8 text-slate-400 mx-auto mb-2" />
              <p className="text-sm text-slate-600 mb-1">点击上传切片</p>
              <p className="text-xs text-slate-500">支持病理切片图像</p>
              <input ref={fileInputRef} type="file" className="hidden" accept="image/*" onChange={handleFileChange} />
            </div>
          ) : (
            <div className="space-y-3">
              <div className="relative">
                <img src={image} alt="Uploaded slide" className="w-full h-32 object-cover rounded-lg border border-slate-200" />
                <button 
                  onClick={() => { setImage(null); setResult(null); setError(null); if (fileInputRef.current) fileInputRef.current.value = ''; }}
                  className="absolute top-2 right-2 w-6 h-6 bg-slate-900 text-white rounded-full flex items-center justify-center hover:bg-slate-700 transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
              
              <button
                onClick={() => {}}
                disabled={isAnalyzing}
                className="w-full py-2.5 px-4 bg-blue-600 hover:bg-blue-700 text-white rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center font-medium"
              >
                {isAnalyzing ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    分析中...
                  </>
                ) : (
                  <>
                    <Microscope className="w-4 h-4 mr-2" />
                    开始阅片
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
          <h3 className="text-sm font-medium text-slate-900 mb-3">使用说明</h3>
          <div className="space-y-2 text-xs text-slate-600">
            <p>• 支持 H&E 染色病理切片</p>
            <p>• 图片分辨率建议 ≥ 1024x1024</p>
            <p>• 确保切片区域清晰可见</p>
            <p>• 分析结果仅供参考</p>
          </div>
        </div>
      </div>

      {/* 右侧主内容区域 (自适应宽度) */}
      <div className="flex-1 flex flex-col bg-slate-50">
        {/* 内容标题栏 */}
        <div className="p-6 bg-white border-b border-slate-200">
          <h2 className="text-lg font-bold text-slate-900">阅片结果</h2>
          <p className="text-sm text-slate-600 mt-1">AI 辅助病理切片分析</p>
        </div>

        {/* 主要内容区域 */}
        <div className="flex-1 overflow-y-auto p-6">
          {!image && !isAnalyzing && (
            <div className="h-full flex items-center justify-center">
              <div className="text-center">
                <div className="w-16 h-16 rounded-full bg-slate-100 flex items-center justify-center mx-auto mb-4">
                  <Eye className="w-8 h-8 text-slate-400" />
                </div>
                <h3 className="text-lg font-semibold text-slate-900 mb-2">等待切片上传</h3>
                <p className="text-slate-600">请在左侧上传病理切片图像</p>
              </div>
            </div>
          )}

          {isAnalyzing && (
            <div className="h-full flex items-center justify-center">
              <div className="text-center">
                <div className="w-16 h-16 rounded-full border-4 border-slate-200 border-t-blue-600 animate-spin mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-slate-900 mb-2">AI 分析中</h3>
                <p className="text-slate-600">正在进行病理切片分析...</p>
              </div>
            </div>
          )}

          {image && !result && !isAnalyzing && (
            <div className="h-full flex items-center justify-center">
              <div className="text-center">
                <img src={image} alt="Uploaded slide" className="w-full max-w-2xl mx-auto mb-6 rounded-2xl shadow-lg border border-slate-200" />
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 flex items-center mx-auto max-w-md gap-2">
                  <AlertCircle className="w-5 h-5 text-blue-600 flex-shrink-0" />
                  <p className="text-sm text-blue-900">点击左侧"开始阅片"按钮进行分析</p>
                </div>
              </div>
            </div>
          )}

          {result && (
            <div className="max-w-4xl mx-auto space-y-6">
              <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm hover:shadow-md transition-all">
                <h3 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-blue-100 flex items-center justify-center">
                    <ScanEye className="w-5 h-5 text-blue-600" />
                  </div>
                  阅片分析结果
                </h3>
                <div className="space-y-4">
                  <div className="text-center p-4 bg-gradient-to-r from-green-50 to-emerald-50 rounded-lg border border-green-200">
                    <p className="text-2xl font-bold text-emerald-700">正常组织</p>
                    <p className="text-sm text-emerald-600 mt-2">AI 初步判断</p>
                  </div>
                  
                  <div className="bg-slate-50 rounded-lg p-4 border border-slate-200">
                    <h4 className="text-sm font-semibold text-slate-900 mb-2">组织学特征</h4>
                    <p className="text-sm text-slate-700">组织形态正常，未见明显异常细胞或结构改变。</p>
                  </div>
                  
                  <div className="bg-slate-50 rounded-lg p-4 border border-slate-200">
                    <h4 className="text-sm font-semibold text-slate-900 mb-2">诊断建议</h4>
                    <p className="text-sm text-slate-700">建议结合临床症状和其他检查结果进行综合判断。</p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default SlideAnalyzer;