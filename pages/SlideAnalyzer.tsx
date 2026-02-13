import React, { useState, useRef } from 'react';
import { Upload, X, AlertCircle, ScanEye, Loader2, PieChart, Info, Layers, Code, Microscope, Terminal, AlertTriangle, Eye, BarChart3 } from 'lucide-react';
import { QuantificationResult } from '../types';
import { useTheme } from '../context/ThemeContext';

const SlideAnalyzer: React.FC = () => {
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  const [image, setImage] = useState<string | null>(null);
  // ... 其余状态

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
    <div className={`h-screen ${isDark ? 'bg-[#0b0f1a]' : 'bg-[#F5F7FA]'} flex`} style={{
      backgroundImage: isDark 
        ? 'radial-gradient(at 0% 0%, rgba(45, 92, 247, 0.1) 0px, transparent 50%), radial-gradient(at 100% 100%, rgba(39, 194, 76, 0.05) 0px, transparent 50%)'
        : 'radial-gradient(at 0% 0%, rgba(45, 92, 247, 0.02) 0px, transparent 50%), radial-gradient(at 100% 100%, rgba(39, 194, 76, 0.02) 0px, transparent 50%)'
    }}>
      {/* 左侧控制面板 (320px) */}
      <div className={`w-80 ${isDark ? 'bg-[#0d121f] border-slate-800' : 'bg-white/80 border-white/40'} backdrop-blur-xl border-r flex flex-col shadow-xl`}>
        {/* 页面标题 */}
        <div className={`p-8 border-b ${isDark ? 'border-slate-800' : 'border-slate-100/50'}`}>
          <div className="flex items-center gap-4 mb-2">
            <div className="w-12 h-12 rounded-2xl bg-[#2D5CF7] flex items-center justify-center shadow-lg shadow-blue-500/20">
              <Microscope className="w-7 h-7 text-white" />
            </div>
            <div>
              <h1 className={`text-xl font-black ${isDark ? 'text-white' : 'text-slate-900'} tracking-tight`}>AI 阅片室</h1>
              <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Intelligent Analysis</p>
            </div>
          </div>
        </div>

        {/* 功能控制 */}
        <div className={`p-8 border-b ${isDark ? 'border-slate-800' : 'border-slate-100/50'}`}>
          <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-5">数据上传</h3>
          
          {!image ? (
            <div 
              onClick={() => fileInputRef.current?.click()}
              className={`group border-2 border-dashed ${isDark ? 'border-slate-700 hover:border-[#2D5CF7] hover:bg-blue-900/20' : 'border-slate-200 hover:border-[#2D5CF7] hover:bg-blue-50/50'} rounded-[2rem] p-8 text-center cursor-pointer transition-all duration-300`}
            >
              <div className={`w-14 h-14 ${isDark ? 'bg-slate-800' : 'bg-slate-50'} rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform duration-300`}>
                <Upload className="w-7 h-7 text-slate-400 group-hover:text-[#2D5CF7]" />
              </div>
              <p className={`text-sm font-bold ${isDark ? 'text-slate-300' : 'text-slate-600'} mb-1`}>点击或拖拽上传</p>
              <p className="text-[10px] text-slate-400 font-medium">支持 H&E 染色切片 (JPG, PNG)</p>
              <input ref={fileInputRef} type="file" className="hidden" accept="image/*" onChange={handleFileChange} />
            </div>
          ) : (
            <div className="space-y-4">
              <div className="relative group">
                <img src={image} alt="Uploaded slide" className={`w-full h-40 object-cover rounded-3xl border ${isDark ? 'border-slate-700' : 'border-slate-100'} shadow-md`} />
                <button 
                  onClick={() => { setImage(null); setResult(null); setError(null); if (fileInputRef.current) fileInputRef.current.value = ''; }}
                  className={`absolute top-3 right-3 w-8 h-8 ${isDark ? 'bg-slate-800/90' : 'bg-white/90'} backdrop-blur-md ${isDark ? 'text-white' : 'text-slate-900'} rounded-xl flex items-center justify-center hover:bg-red-500 hover:text-white shadow-lg transition-all duration-200`}
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
              
              <button
                onClick={() => {}}
                disabled={isAnalyzing}
                className="w-full py-4 bg-[#2D5CF7] hover:bg-blue-700 text-white rounded-2xl shadow-lg shadow-blue-500/25 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2 font-bold text-sm"
              >
                {isAnalyzing ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>引擎分析中...</span>
                  </>
                ) : (
                  <>
                    <span>开始智能阅片</span>
                    <ScanEye className="w-4 h-4" />
                  </>
                )}
              </button>
            </div>
          )}
        </div>

        {/* 状态显示 */}
        {error && (
          <div className={`p-8 border-b ${isDark ? 'border-slate-800' : 'border-slate-100/50'}`}>
            <div className={`${isDark ? 'bg-red-900/20 border-red-900/50' : 'bg-red-50/50 border-red-100'} backdrop-blur-sm border rounded-2xl p-4 flex items-start gap-3`}>
              <AlertTriangle className="w-5 h-5 text-red-500 flex-shrink-0" />
              <p className={`text-xs ${isDark ? 'text-red-400' : 'text-red-600'} font-medium leading-relaxed`}>{error}</p>
            </div>
          </div>
        )}

        {/* 使用提示 */}
        <div className="p-8 flex-1 overflow-y-auto">
          <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-4">分析说明</h3>
          <div className="space-y-3">
            {[
              '支持标准 H&E 染色病理切片',
              '建议分辨率 ≥ 1024x1024',
              '自动识别细胞形态与病理特征',
              '分析结果经由大模型交叉验证'
            ].map((text, i) => (
              <div key={i} className="flex items-center gap-3">
                <div className={`w-1.5 h-1.5 rounded-full ${isDark ? 'bg-blue-500/50' : 'bg-[#2D5CF7]/30'}`} />
                <p className={`text-[11px] ${isDark ? 'text-slate-400' : 'text-slate-500'} font-medium`}>{text}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* 右侧主内容区域 (自适应宽度) */}
      <div className="flex-1 flex flex-col">
        {/* 内容标题栏 */}
        <div className={`p-8 ${isDark ? 'bg-[#0b0f1a]/40 border-slate-800' : 'bg-white/40 border-slate-100/50'} backdrop-blur-md border-b flex justify-between items-center`}>
          <div>
            <h2 className={`text-2xl font-black ${isDark ? 'text-white' : 'text-slate-900'} tracking-tight`}>分析报告</h2>
            <p className="text-[11px] text-slate-400 font-bold uppercase tracking-[0.2em] mt-1">Pathology Diagnostic Report</p>
          </div>
          <div className="flex items-center gap-3">
            <div className={`px-4 py-2 ${isDark ? 'bg-slate-800/50 border-slate-700' : 'bg-white border-slate-100'} rounded-xl border shadow-sm flex items-center gap-2`}>
              <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span className={`text-[10px] font-bold ${isDark ? 'text-slate-400' : 'text-slate-600'} uppercase`}>AI Core Active</span>
            </div>
          </div>
        </div>

        {/* 主要内容区域 */}
        <div className="flex-1 overflow-y-auto p-10">
          {!image && !isAnalyzing && (
            <div className="h-full flex items-center justify-center">
              <div className="text-center max-w-md">
                <div className={`w-24 h-24 rounded-[2.5rem] ${isDark ? 'bg-slate-800' : 'bg-white'} shadow-xl shadow-slate-200/50 flex items-center justify-center mx-auto mb-8 transform -rotate-6`}>
                  <Upload className="w-10 h-10 text-slate-200" />
                </div>
                <h3 className={`text-2xl font-black ${isDark ? 'text-white' : 'text-slate-900'} mb-3`}>等待数据接入</h3>
                <p className="text-sm text-slate-400 font-medium leading-relaxed">
                  请从左侧面板上传病理切片图像，<br/>
                  系统将自动调用 AI 诊断引擎进行深度分析。
                </p>
              </div>
            </div>
          )}

          {isAnalyzing && (
            <div className="h-full flex items-center justify-center">
              <div className="text-center">
                <div className="relative w-32 h-32 mx-auto mb-8">
                  <div className={`absolute inset-0 rounded-[2.5rem] border-4 ${isDark ? 'border-slate-800' : 'border-slate-100'}`} />
                  <div className="absolute inset-0 rounded-[2.5rem] border-4 border-t-[#2D5CF7] animate-spin" />
                  <div className="absolute inset-0 flex items-center justify-center">
                    <Microscope className="w-10 h-10 text-[#2D5CF7] animate-pulse" />
                  </div>
                </div>
                <h3 className={`text-2xl font-black ${isDark ? 'text-white' : 'text-slate-900'} mb-2`}>引擎深度扫描中</h3>
                <p className="text-sm text-slate-400 font-bold uppercase tracking-widest animate-pulse">Processing Neural Network...</p>
              </div>
            </div>
          )}

          {image && !result && !isAnalyzing && (
            <div className="h-full flex flex-col items-center justify-center">
              <div className="relative group max-w-3xl">
                <div className="absolute -inset-4 bg-gradient-to-tr from-[#2D5CF7]/10 to-emerald-500/10 rounded-[3rem] blur-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                <img src={image} alt="Uploaded slide" className={`relative w-full max-h-[60vh] object-contain rounded-[2.5rem] shadow-2xl border ${isDark ? 'border-slate-700' : 'border-white/60'}`} />
              </div>
              <div className={`mt-10 ${isDark ? 'bg-slate-800/40 border-slate-700' : 'bg-white/80 border-white/60'} backdrop-blur-xl border rounded-3xl p-6 shadow-xl flex items-center gap-4`}>
                <div className={`w-12 h-12 rounded-2xl ${isDark ? 'bg-blue-900/30' : 'bg-blue-50'} flex items-center justify-center`}>
                  <Info className="w-6 h-6 text-[#2D5CF7]" />
                </div>
                <div>
                  <p className={`text-sm font-black ${isDark ? 'text-white' : 'text-slate-900'}`}>就绪完毕</p>
                  <p className="text-xs text-slate-500 font-medium">点击左侧 "开始智能阅片" 激活诊断流程</p>
                </div>
              </div>
            </div>
          )}

          {result && (
            <div className="max-w-5xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
              <div className={`${isDark ? 'bg-slate-800/40 border-slate-700' : 'bg-white/80 border-white/60'} backdrop-blur-xl rounded-[2.5rem] border p-10 shadow-xl relative overflow-hidden`}>
                <div className="absolute top-0 right-0 w-64 h-64 bg-[#2D5CF7]/5 rounded-full -mr-32 -mt-32 blur-3xl" />
                
                <div className="flex items-center gap-4 mb-8 relative z-10">
                  <div className={`w-12 h-12 rounded-2xl ${isDark ? 'bg-blue-900/30' : 'bg-blue-50'} flex items-center justify-center`}>
                    <ScanEye className="w-6 h-6 text-[#2D5CF7]" />
                  </div>
                  <h3 className={`text-2xl font-black ${isDark ? 'text-white' : 'text-slate-900'} tracking-tight`}>智能诊断结论</h3>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 relative z-10">
                  <div className="md:col-span-2 space-y-6">
                    <div className={`p-8 ${isDark ? 'bg-emerald-900/20 border-emerald-900/50' : 'bg-gradient-to-br from-emerald-50 to-emerald-100/50 border-emerald-100'} rounded-[2rem] border shadow-inner`}>
                      <div className="flex items-center gap-3 mb-3">
                        <div className="w-2 h-2 rounded-full bg-emerald-500" />
                        <span className={`text-[10px] font-black ${isDark ? 'text-emerald-400' : 'text-emerald-600'} uppercase tracking-widest`}>AI Confidence: 98.4%</span>
                      </div>
                      <p className={`text-3xl font-black ${isDark ? 'text-white' : 'text-emerald-900'} mb-2`}>未见明显异常</p>
                      <p className={`text-sm ${isDark ? 'text-emerald-400/80' : 'text-emerald-700/80'} font-medium`}>组织结构完整，细胞极性正常，未观察到典型异型性改变。</p>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4">
                      <div className={`${isDark ? 'bg-slate-900/50 border-slate-800' : 'bg-slate-50/50 border-slate-100'} rounded-2xl p-5 border`}>
                        <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3">组织学特征</h4>
                        <p className={`text-sm ${isDark ? 'text-slate-300' : 'text-slate-700'} font-bold leading-relaxed`}>视野内见腺体排列整齐，间质无明显炎性细胞浸润。</p>
                      </div>
                      <div className={`${isDark ? 'bg-slate-900/50 border-slate-800' : 'bg-slate-50/50 border-slate-100'} rounded-2xl p-5 border`}>
                        <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3">诊断建议</h4>
                        <p className={`text-sm ${isDark ? 'text-slate-300' : 'text-slate-700'} font-bold leading-relaxed`}>建议作为常规随访记录，结合临床病史进行最终归档。</p>
                      </div>
                    </div>
                  </div>

                  <div className={`${isDark ? 'bg-slate-800/60 border-slate-700 shadow-2xl' : 'bg-white border-slate-100 shadow-sm'} rounded-[2rem] border p-6 flex flex-col justify-center items-center text-center`}>
                    <div className="w-24 h-24 mb-4 relative">
                      <svg className="w-full h-full transform -rotate-90">
                        <circle cx="48" cy="48" r="40" stroke="currentColor" strokeWidth="8" fill="transparent" className={isDark ? "text-slate-700" : "text-slate-50"} />
                        <circle cx="48" cy="48" r="40" stroke="currentColor" strokeWidth="8" fill="transparent" strokeDasharray="251.2" strokeDashoffset="25.12" className="text-[#2D5CF7]" />
                      </svg>
                      <div className="absolute inset-0 flex items-center justify-center flex-col">
                        <span className={`text-xl font-black ${isDark ? 'text-white' : 'text-slate-900'}`}>90%</span>
                        <span className="text-[8px] font-bold text-slate-400 uppercase">Health</span>
                      </div>
                    </div>
                    <h4 className={`text-sm font-black ${isDark ? 'text-white' : 'text-slate-900'} mb-1`}>健康评分</h4>
                    <p className="text-[10px] text-slate-400 font-medium">基于细胞一致性算法</p>
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