
import React, { useState } from 'react';
import { Settings, RefreshCw, ChevronRight, Check, XCircle, BookOpen, BrainCircuit, GraduationCap } from 'lucide-react';
import { generateCaseStudy } from '../services/geminiService';
import { activityAPI } from '../services/apiService';
import { CaseStudy } from '../types';

const CaseGenerator: React.FC = () => {
  const [topic, setTopic] = useState('肝硬化');
  const [difficulty, setDifficulty] = useState('Intermediate');
  const [isGenerating, setIsGenerating] = useState(false);
  const [caseStudy, setCaseStudy] = useState<CaseStudy | null>(null);
  const [selectedAnswers, setSelectedAnswers] = useState<Record<number, number>>({});
  const [showExplanation, setShowExplanation] = useState<Record<number, boolean>>({});

  const handleGenerate = async () => {
    setIsGenerating(true);
    setCaseStudy(null);
    setSelectedAnswers({});
    setShowExplanation({});
    const startTime = Date.now();
    try {
      const data = await generateCaseStudy(topic, difficulty);
      setCaseStudy(data);
      
      // 记录活动
      const duration = Math.round((Date.now() - startTime) / 1000);
      await activityAPI.logActivity('case_study', '病例生成器', { topic, difficulty }, duration);
    } catch (e) {
      alert("生成失败，AI 正在摸鱼，请重试。");
    } finally {
      setIsGenerating(false);
    }
  };

  const handleAnswerSelect = (qIndex: number, optionIndex: number) => {
    if (selectedAnswers[qIndex] !== undefined) return;
    setSelectedAnswers(prev => ({ ...prev, [qIndex]: optionIndex }));
    setShowExplanation(prev => ({ ...prev, [qIndex]: true }));
  };

  // Safe renderer for potential object values to prevent React Error #31
  const renderSafe = (content: any) => {
    if (typeof content === 'string' || typeof content === 'number') return content;
    if (typeof content === 'object' && content !== null) {
      // Flatten object to string for safe rendering
      return Object.entries(content).map(([k, v]) => `${k}: ${v}`).join('; ');
    }
    return String(content);
  };

  return (
    <div className="h-screen bg-gray-50 flex">
      {/* Left Sidebar - Controls */}
      <div className="w-80 bg-white border-r border-gray-200 flex flex-col">
        {/* Page Header */}
        <div className="p-6 border-b border-gray-100">
          <div className="flex items-center mb-2">
            <BrainCircuit className="w-6 h-6 text-gray-700 mr-3" />
            <h1 className="text-xl font-semibold text-gray-900">病例生成器</h1>
          </div>
          <p className="text-sm text-gray-600">AI 智能生成教学病例</p>
        </div>

        {/* Configuration */}
        <div className="p-6 border-b border-gray-100">
          <h3 className="text-sm font-medium text-gray-900 mb-4">配置参数</h3>
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-2">课题 (Topic)</label>
              <input 
                type="text" 
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent"
                placeholder="例如：胶质母细胞瘤"
              />
            </div>
            
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-2">难度 (Level)</label>
              <select 
                value={difficulty}
                onChange={(e) => setDifficulty(e.target.value)}
                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent"
              >
                <option value="Beginner">萌新 (医学生)</option>
                <option value="Intermediate">进阶 (住院医)</option>
                <option value="Expert">地狱 (专家级)</option>
              </select>
            </div>

            <button
              onClick={handleGenerate}
              disabled={isGenerating || !topic}
              className="w-full py-2.5 px-4 bg-gray-900 text-white rounded-lg hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center"
            >
              {isGenerating ? (
                <>
                  <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                  生成中...
                </>
              ) : (
                <>
                  <BrainCircuit className="w-4 h-4 mr-2" />
                  生成题目
                </>
              )}
            </button>
          </div>
        </div>

        {/* Status Display */}
        {isGenerating && (
          <div className="p-6 border-b border-gray-100">
            <h3 className="text-sm font-medium text-gray-900 mb-3">处理状态</h3>
            <div className="bg-gray-50 border border-gray-200 rounded-lg p-3 flex items-center">
              <RefreshCw className="w-4 h-4 text-gray-500 mr-2 animate-spin" />
              <p className="text-sm text-gray-700">AI 老师正在出题...</p>
            </div>
          </div>
        )}

        {/* Usage Tips */}
        <div className="p-6">
          <h3 className="text-sm font-medium text-gray-900 mb-3">使用提示</h3>
          <div className="space-y-2 text-xs text-gray-600">
            <p>• 输入具体的疾病或病理名称</p>
            <p>• 选择合适的难度等级</p>
            <p>• 生成的病例包含完整诊断流程</p>
            <p>• 支持互动式知识问答</p>
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 bg-white border-l border-gray-200 flex flex-col">
        {/* Content Header */}
        <div className="p-6 border-b border-gray-100">
          <h2 className="text-lg font-semibold text-gray-900">病例内容</h2>
          <p className="text-sm text-gray-600 mt-1">AI 生成的完整教学病例和互动问答</p>
        </div>

        {/* Main Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {!caseStudy && !isGenerating && (
            <div className="h-full flex items-center justify-center">
              <div className="text-center">
                <BookOpen className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">等待生成病例</h3>
                <p className="text-gray-600">左侧配置，开始你的学习之旅</p>
              </div>
            </div>
          )}

          {isGenerating && (
            <div className="h-full flex items-center justify-center">
              <div className="text-center">
                <RefreshCw className="w-16 h-16 text-gray-400 mx-auto mb-4 animate-spin" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">AI 老师正在出题</h3>
                <p className="text-gray-600">请稍候，正在生成个性化病例</p>
              </div>
            </div>
          )}

          {caseStudy && (
            <div className="max-w-4xl space-y-6">
              {/* Title Card */}
              <div className="bg-gray-900 text-white p-6 rounded-lg">
                <h1 className="text-2xl font-bold mb-2">{caseStudy.title}</h1>
                <div className="text-sm text-gray-300">虚拟患者 • 教学病例</div>
              </div>
              
              {/* Info Cards */}
              <div className="grid gap-4">
                <div className="bg-gray-50 border border-gray-200 p-6 rounded-lg">
                  <h3 className="text-sm font-medium text-gray-700 mb-2">病史</h3>
                  <p className="text-gray-900 leading-relaxed">{renderSafe(caseStudy.patientHistory)}</p>
                </div>
                <div className="bg-gray-50 border border-gray-200 p-6 rounded-lg">
                  <h3 className="text-sm font-medium text-gray-700 mb-2">临床表现</h3>
                  <p className="text-gray-900 leading-relaxed">{renderSafe(caseStudy.clinicalPresentation)}</p>
                </div>
                <div className="bg-blue-50 border border-blue-200 p-6 rounded-lg">
                  <h3 className="text-sm font-medium text-blue-700 mb-2">镜下所见</h3>
                  <p className="text-blue-900 leading-relaxed italic">"{renderSafe(caseStudy.microscopicFindings)}"</p>
                </div>
              </div>

              {/* Quiz Section */}
              <div className="mt-8">
                <h2 className="text-xl font-semibold text-gray-900 mb-6 flex items-center">
                  <GraduationCap className="w-6 h-6 mr-2 text-gray-700" />
                  知识闯关
                </h2>
                <div className="space-y-6">
                  {caseStudy.quizQuestions.map((q, idx) => (
                    <div key={idx} className="bg-white border border-gray-200 p-6 rounded-lg">
                      <p className="font-semibold text-lg text-gray-900 mb-6">
                        <span className="text-gray-500 mr-2">Q{idx + 1}.</span> {q.question}
                      </p>
                      
                      <div className="space-y-3">
                        {q.options.map((opt, optIdx) => {
                          const isSelected = selectedAnswers[idx] === optIdx;
                          const isCorrect = q.correctAnswer === optIdx;
                          const showResult = showExplanation[idx];
                          
                          let btnClass = "bg-gray-50 border-gray-200 text-gray-700 hover:bg-gray-100";
                          if (showResult) {
                            if (isCorrect) btnClass = "bg-green-100 border-green-400 text-green-800";
                            else if (isSelected && !isCorrect) btnClass = "bg-red-100 border-red-400 text-red-800";
                            else btnClass = "opacity-50 grayscale";
                          } else if (isSelected) {
                            btnClass = "bg-gray-100 border-gray-400 text-gray-900";
                          }

                          return (
                            <button
                              key={optIdx}
                              onClick={() => handleAnswerSelect(idx, optIdx)}
                              disabled={showResult}
                              className={`w-full text-left p-4 rounded-lg border-2 font-medium flex justify-between items-center transition-colors ${btnClass}`}
                            >
                              <span>{opt}</span>
                              {showResult && isCorrect && <Check className="w-5 h-5" />}
                              {showResult && isSelected && !isCorrect && <XCircle className="w-5 h-5" />}
                            </button>
                          );
                        })}
                      </div>

                      {showExplanation[idx] && (
                        <div className="mt-6 p-4 bg-blue-50 border border-blue-200 text-blue-900 rounded-lg text-sm">
                          <span className="font-semibold block mb-2 text-blue-700">解析</span>
                          {q.explanation}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
              
              {/* Diagnosis Reveal */}
              <div className="mt-8 p-6 bg-gray-900 rounded-lg text-center text-white">
                <p className="text-gray-400 text-xs font-medium uppercase tracking-wider mb-4">最终诊断揭晓</p>
                <h2 className="text-3xl font-bold text-green-400 mb-6">
                  {caseStudy.diagnosis}
                </h2>
                <div className="bg-white/10 rounded-lg p-6 text-left max-w-2xl mx-auto border border-white/20">
                  <h4 className="text-sm font-semibold text-green-300 mb-3">关键讨论点</h4>
                  <ul className="list-disc list-inside text-gray-300 space-y-2 text-sm">
                    {caseStudy.discussionPoints.map((dp, i) => <li key={i}>{dp}</li>)}
                  </ul>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CaseGenerator;
