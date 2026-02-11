import React, { useState } from 'react';
import { Settings, RefreshCw, Check, XCircle, BookOpen, BrainCircuit, List, CheckSquare, Type, GraduationCap, AlertCircle, Plus, Minus, Lightbulb, FileText, Trophy } from 'lucide-react';
import { generateCaseStudy, generateExamPaper, gradeExam } from '../services/geminiService';
import { examAPI } from '../services/apiService';
import { CaseStudy, ExamPaper, ExamResult, ExamQuestion } from '../types';

const ExamSystem: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'case' | 'exam'>('case');
  
  // Case Gen State
  const [topic, setTopic] = useState('肝硬化');
  const [caseStudy, setCaseStudy] = useState<CaseStudy | null>(null);
  const [isGenCase, setIsGenCase] = useState(false);

  // Exam Gen State
  const [examDiff, setExamDiff] = useState('Intermediate');
  const [examTopic, setExamTopic] = useState('肺部肿瘤');
  
  // Counts per type
  const [typeCounts, setTypeCounts] = useState<{ [key: string]: number }>({
      'single_choice': 5,
      'multiple_choice': 0,
      'true_false': 0,
      'short_answer': 0
  });

  const [examPaper, setExamPaper] = useState<ExamPaper | null>(null);
  const [isGenExam, setIsGenExam] = useState(false);
  
  // Answers state
  const [userAnswers, setUserAnswers] = useState<Record<number, any>>({});
  
  const [examResult, setExamResult] = useState<ExamResult | null>(null);
  const [isGrading, setIsGrading] = useState(false);

  // Handlers
  const handleGenCase = async () => {
    setIsGenCase(true); setCaseStudy(null);
    try { const res = await generateCaseStudy(topic, 'Intermediate'); setCaseStudy(res); } catch(e) {} finally { setIsGenCase(false); }
  };

  const updateCount = (type: string, delta: number) => {
    setTypeCounts(prev => ({
        ...prev,
        [type]: Math.max(0, (prev[type] || 0) + delta)
    }));
  };

  const handleGenExam = async () => {
    const total = Object.values(typeCounts).reduce((a: number, b: number) => a + b, 0);
    if (total === 0) { alert("请至少添加一个题目"); return; }
    
    setIsGenExam(true); setExamPaper(null); setExamResult(null); setUserAnswers({});
    try { 
      const res = await generateExamPaper(examDiff, examTopic, typeCounts); 
      // Basic validation to prevent crash if AI returns empty
      if (!res || !res.questions) {
          // If questions are missing but we have a basic structure, try to init empty
          if (res) res.questions = [];
          else throw new Error("Invalid exam data");
      }
      setExamPaper(res); 
    } catch(e) {
      alert("生成试卷失败，请重试");
    } finally { 
      setIsGenExam(false); 
    }
  };

  const handleSubmitExam = async () => {
    if(!examPaper) return;
    setIsGrading(true);
    try { 
      const res = await gradeExam(examPaper, userAnswers); 
      setExamResult(res);
      
      // 保存考试记录到数据库
      if (res && res.score !== undefined) {
        try {
          await examAPI.saveExamRecord({
            exam_title: examPaper.title || '考试',
            score: res.score,
            total_score: res.totalScore,
            duration_minutes: Math.ceil((examPaper.durationMinutes || 60) / 60),
            questions_data: examPaper.questions,
            answers_data: userAnswers,
            wrong_questions: res.wrongQuestions || []
          });
        } catch (err) {
          console.error('保存考试记录失败:', err);
        }
      }
    } catch(e) {} finally { setIsGrading(false); }
  };

  const handleMultiSelect = (qIdx: number, optIdx: number) => {
    setUserAnswers(prev => {
      const current: number[] = prev[qIdx] || [];
      if (current.includes(optIdx)) return { ...prev, [qIdx]: current.filter(i => i !== optIdx) };
      else return { ...prev, [qIdx]: [...current, optIdx] };
    });
  };

  const totalQuestions = Object.values(typeCounts).reduce((a: number, b: number) => a + b, 0);

  // Helper to ensure options exist for T/F questions
  const getOptions = (q: ExamQuestion) => {
      if (q.type === 'true_false') {
          return q.options && q.options.length > 0 ? q.options : ['正确', '错误'];
      }
      return q.options || [];
  };

  return (
    <div className="h-screen bg-gray-50 flex">
      {/* Left Sidebar - Controls */}
      <div className="w-80 bg-white border-r border-gray-200 flex flex-col">
        {/* Page Header */}
        <div className="p-6 border-b border-gray-100">
          <div className="flex items-center mb-2">
            <GraduationCap className="w-6 h-6 text-gray-700 mr-3" />
            <h1 className="text-xl font-semibold text-gray-900">考试与教学中心</h1>
          </div>
          <p className="text-sm text-gray-600">智能出题与病例生成</p>
        </div>

        {/* Mode Selection */}
        <div className="p-6 border-b border-gray-100">
          <h3 className="text-sm font-medium text-gray-900 mb-4">模式选择</h3>
          <div className="space-y-2">
            <button 
              onClick={() => setActiveTab('case')} 
              className={`w-full text-left px-3 py-2 text-sm rounded-lg transition-colors flex items-center ${
                activeTab === 'case' ? 'bg-gray-900 text-white' : 'text-gray-700 hover:bg-gray-50'
              }`}
            >
              <BookOpen className="w-4 h-4 mr-2" />
              教学病例生成
            </button>
            <button 
              onClick={() => setActiveTab('exam')} 
              className={`w-full text-left px-3 py-2 text-sm rounded-lg transition-colors flex items-center ${
                activeTab === 'exam' ? 'bg-gray-900 text-white' : 'text-gray-700 hover:bg-gray-50'
              }`}
            >
              <FileText className="w-4 h-4 mr-2" />
              智能试卷系统
            </button>
          </div>
        </div>

        {/* Controls */}
        <div className="flex-1 overflow-y-auto">
          <div className="p-6 border-b border-gray-100">
            <h3 className="text-sm font-medium text-gray-900 mb-4">配置参数</h3>
              
              {activeTab === 'case' ? (
                <div className="space-y-4">
                   <div>
                      <label className="block text-xs font-medium text-gray-700 mb-2">生成关键词</label>
                      <input 
                        value={topic} 
                        onChange={e=>setTopic(e.target.value)} 
                        className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent" 
                        placeholder="例如：肾细胞癌" 
                      />
                   </div>
                   <button 
                     onClick={handleGenCase} 
                     disabled={isGenCase} 
                     className="w-full py-2.5 px-4 bg-gray-900 text-white rounded-lg hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center"
                   >
                      {isGenCase ? <RefreshCw className="w-4 h-4 mr-2 animate-spin" /> : <BrainCircuit className="w-4 h-4 mr-2" />}
                      {isGenCase ? '生成中...' : '生成病例'}
                   </button>
                </div>
              ) : (
                <div className="space-y-4">
                   <div>
                      <label className="block text-xs font-medium text-gray-700 mb-2">考察知识点</label>
                      <input 
                        value={examTopic} 
                        onChange={e=>setExamTopic(e.target.value)} 
                        className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent" 
                        placeholder="例如：呼吸系统病理" 
                      />
                   </div>
                   
                   <div>
                      <label className="block text-xs font-medium text-gray-700 mb-2">难度</label>
                      <select 
                        value={examDiff} 
                        onChange={e=>setExamDiff(e.target.value)} 
                        className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent"
                      >
                          <option value="Easy">简单</option>
                          <option value="Intermediate">中等</option>
                          <option value="Hard">困难</option>
                      </select>
                   </div>

                   <div>
                      <label className="block text-xs font-medium text-gray-700 mb-2 flex justify-between">
                          <span>题型配置</span>
                          <span className="text-gray-500">共 {totalQuestions} 题</span>
                      </label>
                      <div className="space-y-2">
                        {[
                            { id: 'single_choice', label: '单选题', icon: List },
                            { id: 'multiple_choice', label: '多选题', icon: CheckSquare },
                            { id: 'true_false', label: '判断题', icon: Check },
                            { id: 'short_answer', label: '简答题', icon: Type }
                        ].map(t => (
                            <div key={t.id} className="flex items-center justify-between p-2 bg-gray-50 rounded-lg border border-gray-100">
                                <div className="flex items-center text-sm font-medium text-gray-700">
                                    <t.icon className="w-4 h-4 mr-2 text-gray-500" />
                                    {t.label}
                                </div>
                                <div className="flex items-center gap-2">
                                    <button 
                                      onClick={() => updateCount(t.id, -1)} 
                                      className="p-1 rounded-full bg-white shadow-sm hover:bg-gray-100 border border-gray-200"
                                    >
                                      <Minus className="w-3 h-3" />
                                    </button>
                                    <span className="w-6 text-center text-sm font-medium text-gray-900">{typeCounts[t.id]}</span>
                                    <button 
                                      onClick={() => updateCount(t.id, 1)} 
                                      className="p-1 rounded-full bg-white shadow-sm hover:bg-gray-100 border border-gray-200"
                                    >
                                      <Plus className="w-3 h-3" />
                                    </button>
                                </div>
                            </div>
                        ))}
                      </div>
                   </div>

                   <button 
                     onClick={handleGenExam} 
                     disabled={isGenExam} 
                     className="w-full py-2.5 px-4 bg-gray-900 text-white rounded-lg hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center"
                   >
                      {isGenExam ? <RefreshCw className="w-4 h-4 mr-2 animate-spin" /> : <FileText className="w-4 h-4 mr-2" />}
                      {isGenExam ? '生成中...' : '生成试卷'}
                   </button>
                </div>
              )}
          </div>
        </div>

        {/* Status Display */}
        {(isGenCase || isGenExam || isGrading) && (
          <div className="p-6 border-b border-gray-100">
            <h3 className="text-sm font-medium text-gray-900 mb-3">处理状态</h3>
            <div className="bg-gray-50 border border-gray-200 rounded-lg p-3 flex items-center">
              <RefreshCw className="w-4 h-4 text-gray-500 mr-2 animate-spin" />
              <p className="text-sm text-gray-700">
                {isGenCase && '正在编写病历...'}
                {isGenExam && 'AI 正在出卷...'}
                {isGrading && 'AI 正在智能批阅...'}
              </p>
            </div>
          </div>
        )}

        {/* Usage Tips */}
        <div className="p-6">
          <h3 className="text-sm font-medium text-gray-900 mb-3">使用提示</h3>
          <div className="space-y-2 text-xs text-gray-600">
            {activeTab === 'case' ? (
              <>
                <p>• 输入具体的疾病名称获得更准确的病例</p>
                <p>• 生成的病例包含完整的诊断过程</p>
                <p>• 可用于教学演示和学习参考</p>
              </>
            ) : (
              <>
                <p>• 设置合适的题目数量和难度</p>
                <p>• 支持多种题型组合出卷</p>
                <p>• AI 会自动批阅并提供详细解析</p>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 bg-white border-l border-gray-200 flex flex-col">
        {/* Content Header */}
        <div className="p-6 border-b border-gray-100">
          <h2 className="text-lg font-semibold text-gray-900">
            {activeTab === 'case' ? '病例内容' : '试卷内容'}
          </h2>
          <p className="text-sm text-gray-600 mt-1">
            {activeTab === 'case' ? '生成的教学病例将在这里显示' : '生成的试卷和答题界面'}
          </p>
        </div>

        {/* Main Content */}
        <div className="flex-1 overflow-y-auto p-6">
           {activeTab === 'case' && (
              <>
                {!caseStudy && !isGenCase && (
                  <div className="h-full flex items-center justify-center">
                    <div className="text-center">
                      <BookOpen className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                      <h3 className="text-lg font-medium text-gray-900 mb-2">等待生成病例</h3>
                      <p className="text-gray-600">输入关键词，生成完整教学病例</p>
                    </div>
                  </div>
                )}
                {isGenCase && (
                  <div className="h-full flex items-center justify-center">
                    <div className="text-center">
                      <RefreshCw className="w-16 h-16 text-gray-400 mx-auto mb-4 animate-spin" />
                      <h3 className="text-lg font-medium text-gray-900 mb-2">正在编写病历</h3>
                      <p className="text-gray-600">AI 正在生成详细病例内容</p>
                    </div>
                  </div>
                )}
                {caseStudy && (
                   <div className="max-w-4xl space-y-6">
                      <div className="bg-gray-900 text-white p-6 rounded-lg">
                         <h2 className="text-2xl font-bold mb-2">{caseStudy.title}</h2>
                         <div className="text-sm text-gray-300">教学病例 • 虚拟患者</div>
                      </div>
                      
                      <div className="grid gap-4">
                         <InfoCard title="病史" content={caseStudy.patientHistory} color="bg-white border border-gray-200" />
                         <InfoCard title="临床表现" content={caseStudy.clinicalPresentation} color="bg-white border border-gray-200" />
                      </div>
                      
                      <div className="bg-blue-50 border border-blue-200 p-6 rounded-lg">
                         <h3 className="text-sm font-medium text-blue-900 mb-2">镜下所见</h3>
                         <p className="text-blue-800 italic">"{caseStudy.microscopicFindings}"</p>
                      </div>
                      
                      <div className="bg-white border border-gray-200 p-6 rounded-lg">
                         <h3 className="text-lg font-semibold text-gray-900 mb-4">最终诊断与讨论</h3>
                         <div className="text-xl font-bold text-gray-900 mb-4">{caseStudy.diagnosis}</div>
                         <ul className="space-y-2">
                            {caseStudy.discussionPoints?.map((p, i) => (
                               <li key={i} className="flex items-start text-gray-700 text-sm">
                                  <Check className="w-4 h-4 mr-2 text-green-500 flex-shrink-0 mt-0.5" /> {p}
                               </li>
                            ))}
                         </ul>
                      </div>
                   </div>
                )}
              </>
           )}

           {activeTab === 'exam' && (
              <>
                 {!examPaper && !isGenExam && (
                   <div className="h-full flex items-center justify-center">
                     <div className="text-center">
                       <FileText className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                       <h3 className="text-lg font-medium text-gray-900 mb-2">等待生成试卷</h3>
                       <p className="text-gray-600">设置难度和题型，开始模拟考试</p>
                     </div>
                   </div>
                 )}
                 {isGenExam && (
                   <div className="h-full flex items-center justify-center">
                     <div className="text-center">
                       <RefreshCw className="w-16 h-16 text-gray-400 mx-auto mb-4 animate-spin" />
                       <h3 className="text-lg font-medium text-gray-900 mb-2">AI 正在出卷</h3>
                       <p className="text-gray-600">Gemini 3.0 Pro 正在生成试题</p>
                     </div>
                   </div>
                 )}
                 {examPaper && !examResult && (
                    <div className="max-w-4xl space-y-6">
                       <div className="bg-white border border-gray-200 p-6 rounded-lg">
                          <h2 className="text-xl font-bold text-gray-900 text-center mb-4">{examPaper.title}</h2>
                          <div className="flex justify-center gap-6 text-sm text-gray-600">
                             <span>总分: {examPaper.totalScore}</span>
                             <span>限时: {examPaper.durationMinutes} 分钟</span>
                             <span>题数: {examPaper.questions?.length || 0}</span>
                          </div>
                       </div>
                       
                       <div className="space-y-6">
                          {examPaper.questions?.map((q, idx) => {
                             const safeOptions = getOptions(q);
                             return (
                                <div key={idx} className="bg-white border border-gray-200 p-6 rounded-lg">
                                    <div className="flex gap-4">
                                    <div className="flex flex-col items-center">
                                        <span className="text-gray-900 font-bold text-lg">{idx+1}</span>
                                        <span className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded mt-1">
                                            {q.type === 'single_choice' ? '单选' : q.type === 'multiple_choice' ? '多选' : q.type === 'true_false' ? '判断' : '简答'}
                                        </span>
                                    </div>
                                    <div className="flex-1">
                                        <p className="font-medium text-gray-900 text-lg mb-4">{q.question}</p>
                                        
                                        {/* Render Options for Choice/Bool Types */}
                                        {(q.type === 'single_choice' || q.type === 'true_false') && (
                                            <div className="space-y-2">
                                                {safeOptions.map((opt, oIdx) => (
                                                    <button 
                                                        key={oIdx}
                                                        onClick={() => setUserAnswers(prev => ({...prev, [idx]: oIdx}))}
                                                        className={`w-full text-left p-3 rounded-lg border transition-colors ${
                                                            userAnswers[idx] === oIdx 
                                                            ? 'border-gray-900 bg-gray-50 text-gray-900' 
                                                            : 'border-gray-200 hover:bg-gray-50 text-gray-700'
                                                        }`}
                                                    >
                                                        {opt}
                                                    </button>
                                                ))}
                                            </div>
                                        )}

                                        {q.type === 'multiple_choice' && (
                                            <div className="space-y-2">
                                                {safeOptions.map((opt, oIdx) => {
                                                    const selected = (userAnswers[idx] || []).includes(oIdx);
                                                    return (
                                                        <button 
                                                            key={oIdx}
                                                            onClick={() => handleMultiSelect(idx, oIdx)}
                                                            className={`w-full text-left p-3 rounded-lg border transition-colors flex justify-between items-center ${
                                                                selected 
                                                                ? 'border-gray-900 bg-gray-50 text-gray-900' 
                                                                : 'border-gray-200 hover:bg-gray-50 text-gray-700'
                                                            }`}
                                                        >
                                                            <span>{opt}</span>
                                                            {selected && <CheckSquare className="w-5 h-5 text-gray-900" />}
                                                        </button>
                                                    );
                                                })}
                                            </div>
                                        )}

                                        {q.type === 'short_answer' && (
                                            <textarea 
                                                className="w-full h-32 p-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent resize-none"
                                                placeholder="请输入你的答案..."
                                                value={userAnswers[idx] || ''}
                                                onChange={(e) => setUserAnswers(prev => ({...prev, [idx]: e.target.value}))}
                                            />
                                        )}

                                    </div>
                                    </div>
                                </div>
                             );
                          })}
                          {(!examPaper.questions || examPaper.questions.length === 0) && (
                             <div className="text-center text-gray-500 p-8">生成的试卷中没有题目，请重试。</div>
                          )}
                       </div>
                       
                       <div className="flex justify-center pt-6">
                          <button 
                            onClick={handleSubmitExam} 
                            disabled={isGrading} 
                            className="px-8 py-3 bg-gray-900 text-white rounded-lg hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                          >
                             {isGrading ? 'AI 正在智能批阅...' : '提交试卷'}
                          </button>
                       </div>
                    </div>
                 )}
                 {examResult && (
                    <div className="max-w-4xl space-y-6">
                       
                       {/* Result Score Card */}
                       <div className="bg-gray-900 text-white p-6 rounded-lg text-center">
                           <h2 className="text-lg font-medium mb-2">考试成绩</h2>
                           <div className="text-4xl font-bold text-green-400 mb-2">
                              {examResult.score} <span className="text-lg text-white">/ {examResult.totalScore}</span>
                           </div>
                           <p className="text-gray-300">{examResult.summary}</p>
                       </div>

                       {/* Detailed Analysis & Suggestions */}
                       <div className="grid md:grid-cols-2 gap-6">
                           <div className="bg-white border border-gray-200 p-6 rounded-lg">
                               <h3 className="font-semibold text-gray-900 text-lg flex items-center mb-4">
                                   <FileText className="w-5 h-5 mr-2 text-blue-500" /> 深度分析
                               </h3>
                               <p className="text-gray-700 text-sm leading-relaxed whitespace-pre-line">
                                   {examResult.detailedAnalysis || "暂无详细分析。"}
                               </p>
                           </div>
                           <div className="bg-white border border-gray-200 p-6 rounded-lg">
                               <h3 className="font-semibold text-gray-900 text-lg flex items-center mb-4">
                                   <Lightbulb className="w-5 h-5 mr-2 text-yellow-500" /> 学习建议
                               </h3>
                               <ul className="space-y-3">
                                   {examResult.studySuggestions && examResult.studySuggestions.length > 0 ? (
                                       examResult.studySuggestions.map((sug, i) => (
                                           <li key={i} className="flex items-start text-sm text-gray-700 bg-yellow-50 border border-yellow-200 p-3 rounded-lg">
                                               <span className="w-5 h-5 bg-yellow-200 text-yellow-800 rounded-full flex items-center justify-center text-xs font-bold mr-3 flex-shrink-0">{i+1}</span>
                                               {sug}
                                           </li>
                                       ))
                                   ) : (
                                       <li className="text-gray-500 text-sm">暂无建议。</li>
                                   )}
                               </ul>
                           </div>
                       </div>

                       <div className="space-y-6">
                          <h3 className="font-semibold text-gray-900 text-xl flex items-center">
                            <AlertCircle className="w-6 h-6 mr-2 text-red-500" /> 错题与解析
                          </h3>
                          {examResult.wrongQuestions?.map((wq, i) => (
                             <div key={i} className="bg-red-50 border border-red-200 p-6 rounded-lg">
                                <p className="font-medium text-gray-900 mb-2">{wq.question}</p>
                                <div className="flex flex-col gap-2 text-sm mb-4">
                                   <div className="bg-white/50 p-2 rounded text-red-700">你的答案: {JSON.stringify(wq.userAnswer)}</div>
                                   <div className="bg-green-100/50 p-2 rounded text-green-700">参考答案: {JSON.stringify(wq.correctAnswer)}</div>
                                </div>
                                <div className="bg-white p-4 rounded-lg text-gray-700 text-sm">
                                   <span className="font-medium text-blue-600 block mb-1">AI 解析</span>
                                   {wq.explanation}
                                </div>
                             </div>
                          ))}
                          {(!examResult.wrongQuestions || examResult.wrongQuestions.length === 0) && (
                             <div className="text-center py-10 text-green-600 font-medium text-xl flex items-center justify-center">
                               <Trophy className="w-6 h-6 mr-2" />
                               全对！太棒了！
                             </div>
                          )}
                       </div>
                       
                       <button 
                         onClick={() => { setExamPaper(null); setExamResult(null); }} 
                         className="w-full py-3 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
                       >
                          再来一套
                       </button>
                    </div>
                 )}
              </>
           )}
        </div>
      </div>
    </div>
  );
};

// Robust InfoCard to handle Objects and Primitive values safely
const InfoCard = ({title, content, color}: any) => {
  const renderSafe = (val: any): React.ReactNode => {
    if (typeof val === 'string' || typeof val === 'number') return val;
    if (Array.isArray(val)) return val.join(', ');
    if (typeof val === 'object' && val !== null) {
      return (
        <div className="flex flex-col gap-1 mt-1">
          {Object.entries(val).map(([k, v]) => (
            <div key={k} className="text-sm">
              <span className="font-semibold text-gray-500 capitalize">{k.replace(/([A-Z])/g, ' $1')}:</span> {renderSafe(v)}
            </div>
          ))}
        </div>
      );
    }
    return String(val);
  };

  return (
   <div className={`${color} p-6 rounded-lg`}>
      <h3 className="text-xs font-medium text-gray-700 uppercase tracking-wider mb-2">{title}</h3>
      <div className="text-gray-900 font-medium">{renderSafe(content)}</div>
   </div>
  );
};

export default ExamSystem;