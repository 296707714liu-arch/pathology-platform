import React, { useState } from 'react';
import { Settings, RefreshCw, Check, XCircle, BookOpen, BrainCircuit, List, CheckSquare, Type, GraduationCap, AlertCircle, Plus, Minus, Lightbulb, FileText, Trophy, Eye, Activity, ChevronRight } from 'lucide-react';
import { generateCaseStudy, generateExamPaper, gradeExam } from '../services/geminiService';
import { examAPI } from '../services/apiService';
import { CaseStudy, ExamPaper, ExamResult, ExamQuestion } from '../types';
import { useTheme } from '../context/ThemeContext';

const ExamSystem: React.FC = () => {
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  
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
      if (!res || !res.questions) {
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
      
      if (res && res.score !== undefined) {
        try {
          // 确保所有字段都是有效的，并转换时长
          await examAPI.saveExamRecord({
            exam_title: examPaper.title || '智能试卷测验',
            score: Number(res.score),
            total_score: Number(res.totalScore),
            duration_minutes: Math.max(1, Math.ceil((Number(examPaper.durationMinutes) || 60) / 60)),
            questions_data: examPaper.questions,
            answers_data: userAnswers,
            wrong_questions: res.wrongQuestions || []
          });
          console.log('✅ 考试记录已同步至云端');
        } catch (err) {
          console.error('❌ 同步考试记录失败:', err);
        }
      }
    } catch(e) {
      console.error('阅卷失败:', e);
    } finally { setIsGrading(false); }
  };

  const handleMultiSelect = (qIdx: number, optIdx: number) => {
    setUserAnswers(prev => {
      const current: number[] = prev[qIdx] || [];
      if (current.includes(optIdx)) return { ...prev, [qIdx]: current.filter(i => i !== optIdx) };
      else return { ...prev, [qIdx]: [...current, optIdx] };
    });
  };

  const totalQuestions = Object.values(typeCounts).reduce((a: number, b: number) => a + b, 0);

  const getOptions = (q: ExamQuestion) => {
      if (q.type === 'true_false') {
          return q.options && q.options.length > 0 ? q.options : ['正确', '错误'];
      }
      return q.options || [];
  };

  return (
    <div className={`h-screen ${isDark ? 'bg-[#0b0f1a]' : 'bg-[#F5F7FA]'} flex`} style={{
      backgroundImage: isDark 
        ? 'radial-gradient(at 0% 0%, rgba(45, 92, 247, 0.1) 0px, transparent 50%), radial-gradient(at 100% 100%, rgba(39, 194, 76, 0.05) 0px, transparent 50%)'
        : 'radial-gradient(at 0% 0%, rgba(45, 92, 247, 0.02) 0px, transparent 50%), radial-gradient(at 100% 100%, rgba(39, 194, 76, 0.02) 0px, transparent 50%)'
    }}>
      {/* Left Sidebar - Controls */}
      <div className={`w-80 ${isDark ? 'bg-[#0d121f] border-slate-800' : 'bg-white/80 border-white/40'} backdrop-blur-xl border-r flex flex-col shadow-xl`}>
        <div className={`p-8 border-b ${isDark ? 'border-slate-800' : 'border-slate-100/50'}`}>
          <div className="flex items-center gap-4 mb-2">
            <div className="w-12 h-12 rounded-2xl bg-purple-500 flex items-center justify-center shadow-lg shadow-purple-500/20">
              <GraduationCap className="w-7 h-7 text-white" />
            </div>
            <div>
              <h1 className={`text-xl font-black ${isDark ? 'text-white' : 'text-slate-900'} tracking-tight`}>考试中心</h1>
              <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Intelligent Testing</p>
            </div>
          </div>
        </div>

        <div className={`p-8 border-b ${isDark ? 'border-slate-800' : 'border-white/40'}`}>
          <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-5">模式选择</h3>
          <div className="space-y-2.5">
            <button 
              onClick={() => setActiveTab('case')} 
              className={`w-full text-left px-4 py-3.5 rounded-2xl transition-all duration-300 flex items-center gap-3 font-bold text-sm ${
                activeTab === 'case' 
                ? 'bg-[#2D5CF7] text-white shadow-lg shadow-blue-500/25 scale-[1.02]' 
                : isDark ? 'text-slate-400 hover:bg-white/5 hover:text-white' : 'text-slate-600 hover:bg-white/50 hover:text-[#2D5CF7]'
              }`}
            >
              <BookOpen size={18} className={activeTab === 'case' ? 'text-white' : 'text-slate-400'} />
              教学病例生成
            </button>
            <button 
              onClick={() => setActiveTab('exam')} 
              className={`w-full text-left px-4 py-3.5 rounded-2xl transition-all duration-300 flex items-center gap-3 font-bold text-sm ${
                activeTab === 'exam' 
                ? 'bg-[#2D5CF7] text-white shadow-lg shadow-blue-500/25 scale-[1.02]' 
                : isDark ? 'text-slate-400 hover:bg-white/5 hover:text-white' : 'text-slate-600 hover:bg-white/50 hover:text-[#2D5CF7]'
              }`}
            >
              <FileText size={18} className={activeTab === 'exam' ? 'text-white' : 'text-slate-400'} />
              智能试卷系统
            </button>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto scrollbar-hide px-8 py-8">
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-6">配置参数</h3>
              
              {activeTab === 'case' ? (
                <div className="space-y-6">
                   <div className="group">
                      <label className="block text-[10px] font-black text-slate-400 uppercase tracking-[0.15em] mb-2 px-1">生成关键词</label>
                      <input 
                        value={topic} 
                        onChange={e=>setTopic(e.target.value)} 
                        className={`w-full px-4 py-3.5 ${isDark ? 'bg-slate-900/50 border-slate-800 text-white' : 'bg-white/50 border-white text-slate-900'} border rounded-2xl text-sm font-bold placeholder:text-slate-300 focus:outline-none focus:ring-2 focus:ring-[#2D5CF7] transition-all shadow-inner`} 
                        placeholder="例如：肾细胞癌" 
                      />
                   </div>
                   <button 
                     onClick={handleGenCase} 
                     disabled={isGenCase} 
                     className="w-full py-4 px-4 bg-[#2D5CF7] text-white rounded-2xl shadow-lg shadow-blue-500/25 hover:shadow-blue-500/40 transform hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2 font-black text-sm"
                   >
                      {isGenCase ? <RefreshCw className="w-4 h-4 animate-spin" /> : <BrainCircuit className="w-4 h-4" />}
                      {isGenCase ? '病例生成中...' : '立即生成病例'}
                   </button>
                </div>
              ) : (
                <div className="space-y-6">
                   <div>
                      <label className="block text-[10px] font-black text-slate-400 uppercase tracking-[0.15em] mb-2 px-1">考察知识点</label>
                      <input 
                        value={examTopic} 
                        onChange={e=>setExamTopic(e.target.value)} 
                        className={`w-full px-4 py-3.5 ${isDark ? 'bg-slate-900/50 border-slate-800 text-white' : 'bg-white/50 border-white text-slate-900'} border rounded-2xl text-sm font-bold placeholder:text-slate-300 focus:outline-none focus:ring-2 focus:ring-[#2D5CF7] transition-all shadow-inner`} 
                        placeholder="例如：呼吸系统病理" 
                      />
                   </div>
                   
                   <div>
                      <label className="block text-[10px] font-black text-slate-400 uppercase tracking-[0.15em] mb-2 px-1">难度等级</label>
                      <select 
                        value={examDiff} 
                        onChange={e=>setExamDiff(e.target.value)} 
                        className={`w-full px-4 py-3.5 ${isDark ? 'bg-slate-900/50 border-slate-800 text-white' : 'bg-white/50 border-white text-slate-900'} border rounded-2xl text-sm font-bold focus:outline-none focus:ring-2 focus:ring-[#2D5CF7] transition-all shadow-inner appearance-none cursor-pointer`}
                      >
                          <option value="Easy">简单模式</option>
                          <option value="Intermediate">中等难度</option>
                          <option value="Hard">专家挑战</option>
                      </select>
                   </div>

                   <div>
                      <label className="block text-[10px] font-black text-slate-400 uppercase tracking-[0.15em] mb-4 px-1 flex justify-between">
                          <span>题型配比</span>
                          <span className="text-[#2D5CF7]">共 {totalQuestions} 题</span>
                      </label>
                      <div className="space-y-3">
                        {[
                            { id: 'single_choice', label: '单选题', icon: List, color: 'text-blue-500', bg: isDark ? 'bg-blue-900/30' : 'bg-blue-50' },
                            { id: 'multiple_choice', label: '多选题', icon: CheckSquare, color: 'text-purple-500', bg: isDark ? 'bg-purple-900/30' : 'bg-purple-50' },
                            { id: 'true_false', label: '判断题', icon: Check, color: 'text-cyan-500', bg: isDark ? 'bg-cyan-900/30' : 'bg-cyan-50' },
                            { id: 'short_answer', label: '简答题', icon: Type, color: 'text-orange-500', bg: isDark ? 'bg-orange-900/30' : 'bg-orange-50' }
                        ].map(t => (
                            <div key={t.id} className={`flex items-center justify-between p-3.5 ${isDark ? 'bg-slate-800/40 border-slate-700' : 'bg-white/40 border-white/60'} border rounded-2xl shadow-sm`}>
                                <div className="flex items-center text-xs font-bold ${isDark ? 'text-slate-300' : 'text-slate-700'}">
                                    <div className={`w-8 h-8 rounded-xl ${t.bg} ${t.color} flex items-center justify-center mr-3`}>
                                      <t.icon size={16} />
                                    </div>
                                    {t.label}
                                </div>
                                <div className="flex items-center gap-3">
                                    <button 
                                      onClick={() => updateCount(t.id, -1)} 
                                      className={`w-7 h-7 rounded-xl ${isDark ? 'bg-slate-700 border-slate-600' : 'bg-white border-white'} shadow-sm hover:bg-red-50 hover:text-red-500 border flex items-center justify-center transition-colors`}
                                    >
                                      <Minus size={12} strokeWidth={3} />
                                    </button>
                                    <span className={`w-4 text-center text-sm font-black ${isDark ? 'text-white' : 'text-slate-900'}`}>{typeCounts[t.id]}</span>
                                    <button 
                                      onClick={() => updateCount(t.id, 1)} 
                                      className={`w-7 h-7 rounded-xl ${isDark ? 'bg-slate-700 border-slate-600' : 'bg-white border-white'} shadow-sm hover:bg-green-50 hover:text-green-500 border flex items-center justify-center transition-colors`}
                                    >
                                      <Plus size={12} strokeWidth={3} />
                                    </button>
                                </div>
                            </div>
                        ))}
                      </div>
                   </div>

                   <button 
                     onClick={handleGenExam} 
                     disabled={isGenExam} 
                     className="w-full py-4 px-4 bg-purple-600 text-white rounded-2xl shadow-lg shadow-purple-500/25 hover:shadow-purple-500/40 transform hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2 font-black text-sm"
                   >
                      {isGenExam ? <RefreshCw className="w-4 h-4 animate-spin" /> : <FileText className="w-4 h-4" />}
                      {isGenExam ? '试卷构建中...' : '生成智能试卷'}
                   </button>
                </div>
              )}
        </div>

        <div className={`p-8 border-t ${isDark ? 'border-slate-800' : 'border-slate-100/50'}`}>
          <div className={`${isDark ? 'bg-blue-900/20 border-blue-900/50' : 'bg-blue-50/50 border-blue-100'} backdrop-blur-sm border rounded-2xl p-4`}>
            <div className="flex items-center gap-2 mb-2">
              <Lightbulb size={14} className="text-[#2D5CF7]" />
              <h3 className={`text-[10px] font-black ${isDark ? 'text-blue-400' : 'text-blue-600'} uppercase tracking-widest`}>使用小贴士</h3>
            </div>
            <div className="space-y-1.5">
              <p className={`text-[10px] ${isDark ? 'text-blue-300/70' : 'text-blue-700/70'} font-medium leading-relaxed`}>• 输入精确术语可获得更具针对性的题目</p>
              <p className={`text-[10px] ${isDark ? 'text-blue-300/70' : 'text-blue-700/70'} font-medium leading-relaxed`}>• 支持多种题型灵活组合，适配不同场景</p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        <div className={`p-8 ${isDark ? 'bg-[#0b0f1a]/40 border-slate-800' : 'bg-white/40 border-slate-100/50'} backdrop-blur-md border-b flex justify-between items-center`}>
          <div>
            <h2 className={`text-2xl font-black ${isDark ? 'text-white' : 'text-slate-900'} tracking-tight`}>
              {activeTab === 'case' ? '病例详情' : '在线考场'}
            </h2>
            <p className="text-[11px] text-slate-400 font-bold uppercase tracking-[0.2em] mt-1">
              {activeTab === 'case' ? 'Generated Clinical Case Study' : 'Virtual Examination Environment'}
            </p>
          </div>
          <div className="flex items-center gap-3">
            <div className={`px-4 py-2 ${isDark ? 'bg-slate-800/50 border-slate-700' : 'bg-white border-slate-100'} rounded-xl border shadow-sm flex items-center gap-2 text-[10px] font-black ${isDark ? 'text-slate-400' : 'text-slate-600'} uppercase tracking-widest`}>
              <div className={`w-2 h-2 rounded-full animate-pulse ${isGenCase || isGenExam || isGrading ? 'bg-orange-500' : 'bg-emerald-500'}`} />
              {isGenCase || isGenExam || isGrading ? 'Engine Working' : 'System Ready'}
            </div>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-10 scroll-smooth">
           {activeTab === 'case' && (
              <>
                {!caseStudy && !isGenCase && (
                  <div className="h-full flex items-center justify-center">
                    <div className="text-center max-w-md animate-in fade-in zoom-in duration-500">
                      <div className={`w-24 h-24 rounded-[2.5rem] ${isDark ? 'bg-slate-800' : 'bg-white'} shadow-xl shadow-slate-200/50 flex items-center justify-center mx-auto mb-8 transform -rotate-6`}>
                        <BookOpen className="w-10 h-10 text-slate-200" />
                      </div>
                      <h3 className={`text-2xl font-black ${isDark ? 'text-white' : 'text-slate-900'} mb-3`}>暂无病例内容</h3>
                      <p className="text-sm text-slate-400 font-medium leading-relaxed">请在左侧面板输入关键词并点击生成，<br/>AI 将为您构建专业的医学教学病例。</p>
                    </div>
                  </div>
                )}
                
                {isGenCase && (
                  <div className="h-full flex items-center justify-center">
                    <div className="text-center animate-pulse">
                      <div className="relative w-32 h-32 mx-auto mb-8">
                        <div className={`absolute inset-0 rounded-[2.5rem] border-4 ${isDark ? 'border-slate-800' : 'border-slate-100'}`} />
                        <div className="absolute inset-0 rounded-[2.5rem] border-4 border-t-purple-500 animate-spin" />
                        <div className="absolute inset-0 flex items-center justify-center text-purple-500">
                          <BrainCircuit size={40} />
                        </div>
                      </div>
                      <h3 className={`text-2xl font-black ${isDark ? 'text-white' : 'text-slate-900'} mb-2`}>正在构建医疗病例</h3>
                      <p className="text-sm text-slate-400 font-bold uppercase tracking-widest animate-pulse">Consulting Medical Database...</p>
                    </div>
                  </div>
                )}

                {caseStudy && (
                   <div className="max-w-5xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
                      <div className="bg-gradient-to-br from-slate-900 to-slate-800 text-white p-10 rounded-[3rem] shadow-2xl shadow-slate-900/20 relative overflow-hidden group">
                         <div className="absolute top-0 right-0 w-96 h-96 bg-white/5 rounded-full -mr-48 -mt-48 blur-3xl" />
                         <div className="relative z-10">
                            <div className="px-4 py-1.5 bg-white/10 backdrop-blur-md rounded-xl text-[10px] font-black tracking-[0.2em] uppercase border border-white/10 mb-6 inline-block">
                               Clinical Case Study
                            </div>
                            <h2 className="text-4xl font-black mb-4 tracking-tight group-hover:translate-x-1 transition-transform">{caseStudy.title}</h2>
                            <p className="text-slate-400 font-medium flex items-center gap-2">
                               <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                               虚拟患者模拟 • 高级病理教学
                            </p>
                         </div>
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                         <InfoCard title="病史回顾" content={caseStudy.patientHistory} color={`${isDark ? 'bg-slate-800/40 border-slate-700' : 'bg-white/80 border-white/60'} backdrop-blur-xl border shadow-xl rounded-[2.5rem]`} icon={RefreshCw} iconColor="text-blue-500" iconBg={isDark ? "bg-blue-900/30" : "bg-blue-50"} isDark={isDark} />
                         <InfoCard title="临床表现" content={caseStudy.clinicalPresentation} color={`${isDark ? 'bg-slate-800/40 border-slate-700' : 'bg-white/80 border-white/60'} backdrop-blur-xl border shadow-xl rounded-[2.5rem]`} icon={Activity} iconColor="text-purple-500" iconBg={isDark ? "bg-purple-900/30" : "bg-purple-50"} isDark={isDark} />
                      </div>
                      
                      <div className={`bg-gradient-to-br ${isDark ? 'from-blue-900/20 to-blue-800/10 border-blue-900/50' : 'from-blue-50 to-blue-100/50 border-blue-100'} border p-10 rounded-[2.5rem] shadow-inner relative overflow-hidden`}>
                         <div className="absolute -top-10 -right-10 w-40 h-40 bg-blue-200/20 rounded-full blur-2xl" />
                         <div className="flex items-center gap-4 mb-4">
                            <div className="w-10 h-10 rounded-2xl bg-[#2D5CF7] text-white flex items-center justify-center">
                               <Eye size={20} />
                            </div>
                            <h3 className={`text-lg font-black ${isDark ? 'text-blue-300' : 'text-blue-900'} tracking-tight`}>镜下观察报告</h3>
                         </div>
                         <p className={`${isDark ? 'text-blue-200' : 'text-blue-800'} italic leading-relaxed font-medium text-lg`}>"{caseStudy.microscopicFindings}"</p>
                      </div>
                      
                      <div className={`${isDark ? 'bg-slate-800/40 border-slate-700' : 'bg-white/80 border-white/60'} backdrop-blur-xl border p-10 rounded-[2.5rem] shadow-xl relative overflow-hidden`}>
                         <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/5 rounded-full -mr-32 -mt-32 blur-3xl" />
                         <div className="flex items-center gap-4 mb-8">
                            <div className={`w-12 h-12 rounded-2xl ${isDark ? 'bg-emerald-900/30' : 'bg-emerald-50'} flex items-center justify-center text-emerald-600`}>
                               <CheckSquare size={24} />
                            </div>
                            <div>
                               <h3 className={`text-xl font-black ${isDark ? 'text-white' : 'text-slate-900'} tracking-tight`}>最终诊断结论</h3>
                               <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Final Pathological Diagnosis</p>
                            </div>
                         </div>
                         <div className={`text-3xl font-black ${isDark ? 'text-emerald-400' : 'text-emerald-700'} mb-8 px-4 border-l-4 border-emerald-500`}>{caseStudy.diagnosis}</div>
                         
                         <div className={`${isDark ? 'bg-slate-900/50 border-slate-800' : 'bg-slate-50/50 border-slate-100'} rounded-3xl p-8 border`}>
                            <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-6">要点深度研讨</h4>
                            <div className="space-y-4">
                                {caseStudy.discussionPoints?.map((p, i) => (
                                   <div key={i} className={`flex items-start gap-4 p-4 ${isDark ? 'bg-slate-800/50 border-slate-700' : 'bg-white/60 border-white'} border rounded-2xl shadow-sm hover:shadow-md transition-shadow group`}>
                                      <div className="w-6 h-6 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center flex-shrink-0 mt-0.5 group-hover:scale-110 transition-transform">
                                         <Check size={14} strokeWidth={3} />
                                      </div>
                                      <p className={`${isDark ? 'text-slate-300' : 'text-slate-700'} text-sm font-bold leading-relaxed`}>{p}</p>
                                   </div>
                                ))}
                            </div>
                         </div>
                      </div>
                   </div>
                )}
              </>
           )}

           {activeTab === 'exam' && (
              <>
                 {!examPaper && !isGenExam && (
                   <div className="h-full flex items-center justify-center">
                     <div className="text-center max-w-md animate-in fade-in zoom-in duration-500">
                       <div className={`w-24 h-24 rounded-[2.5rem] ${isDark ? 'bg-slate-800' : 'bg-white'} shadow-xl shadow-slate-200/50 flex items-center justify-center mx-auto mb-8 transform rotate-6`}>
                         <FileText className="w-10 h-10 text-slate-200" />
                       </div>
                       <h3 className={`text-2xl font-black ${isDark ? 'text-white' : 'text-slate-900'} mb-3`}>等待试卷接入</h3>
                       <p className="text-sm text-slate-400 font-medium leading-relaxed">配置题型与难度后，AI 核心将自动根据<br/>知识点生成标准化测试卷。</p>
                     </div>
                   </div>
                 )}
                 
                 {isGenExam && (
                   <div className="h-full flex items-center justify-center">
                     <div className="text-center animate-pulse">
                       <div className="relative w-32 h-32 mx-auto mb-8">
                         <div className={`absolute inset-0 rounded-[2.5rem] border-4 ${isDark ? 'border-slate-800' : 'border-slate-100'}`} />
                         <div className="absolute inset-0 rounded-[2.5rem] border-4 border-t-blue-500 animate-spin" />
                         <div className="absolute inset-0 flex items-center justify-center text-blue-500">
                           <RefreshCw size={40} />
                         </div>
                       </div>
                       <h3 className={`text-2xl font-black ${isDark ? 'text-white' : 'text-slate-900'} mb-2`}>智能卷面构建中</h3>
                       <p className="text-sm text-slate-400 font-bold uppercase tracking-widest">Assembling Neural Assessment Paper...</p>
                     </div>
                   </div>
                 )}

                 {examPaper && !examResult && (
                    <div className="max-w-5xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700 pb-20">
                       <div className="bg-gradient-to-br from-indigo-600 to-blue-700 text-white p-10 rounded-[3rem] shadow-2xl shadow-blue-900/20 text-center relative overflow-hidden">
                          <div className="absolute top-0 left-0 w-64 h-64 bg-white/10 rounded-full -ml-32 -mt-32 blur-3xl" />
                          <div className="relative z-10">
                             <div className="px-4 py-1.5 bg-white/10 backdrop-blur-md rounded-xl text-[10px] font-black tracking-[0.2em] uppercase border border-white/10 mb-6 inline-block">
                                Examination In Progress
                             </div>
                             <h2 className="text-3xl font-black mb-6 tracking-tight">{examPaper.title}</h2>
                             <div className="flex justify-center items-center gap-8">
                                <div className="flex flex-col gap-1">
                                   <span className="text-[10px] font-black text-white/50 uppercase tracking-widest">总分值</span>
                                   <span className="text-xl font-black">{examPaper.totalScore}</span>
                                </div>
                                <div className="w-px h-8 bg-white/20" />
                                <div className="flex flex-col gap-1">
                                   <span className="text-[10px] font-black text-white/50 uppercase tracking-widest">答题时限</span>
                                   <span className="text-xl font-black">{examPaper.durationMinutes} min</span>
                                </div>
                                <div className="w-px h-8 bg-white/20" />
                                <div className="flex flex-col gap-1">
                                   <span className="text-[10px] font-black text-white/50 uppercase tracking-widest">题目总数</span>
                                   <span className="text-xl font-black">{examPaper.questions?.length || 0}</span>
                                </div>
                             </div>
                          </div>
                       </div>
                       
                       <div className="space-y-8">
                          {examPaper.questions?.map((q, idx) => {
                             const safeOptions = getOptions(q);
                             const typeLabels: any = {
                               'single_choice': { label: '单选题', color: isDark ? 'bg-blue-900/30 text-blue-400 border-blue-900/50' : 'bg-blue-50 text-blue-600 border-blue-100' },
                               'multiple_choice': { label: '多选题', color: isDark ? 'bg-purple-900/30 text-purple-400 border-purple-900/50' : 'bg-purple-50 text-purple-600 border-purple-100' },
                               'true_false': { label: '判断题', color: isDark ? 'bg-cyan-900/30 text-cyan-400 border-cyan-900/50' : 'bg-cyan-50 text-cyan-600 border-cyan-100' },
                               'short_answer': { label: '简答题', color: isDark ? 'bg-orange-900/30 text-orange-400 border-orange-900/50' : 'bg-orange-50 text-orange-600 border-orange-100' }
                             };
                             const typeInfo = typeLabels[q.type] || { label: '未知', color: 'bg-slate-50' };

                             return (
                                <div key={idx} className={`${isDark ? 'bg-slate-800/40 border-slate-700' : 'bg-white/80 border-white/60'} backdrop-blur-xl border p-8 rounded-[2.5rem] shadow-xl hover:shadow-2xl transition-all group relative overflow-hidden`}>
                                    <div className={`absolute top-0 right-0 w-32 h-32 ${isDark ? 'bg-white/5' : 'bg-slate-50'} rounded-full -mr-16 -mt-16 group-hover:scale-110 transition-transform duration-500`} />
                                    
                                    <div className="flex gap-6 relative z-10">
                                      <div className="flex flex-col items-center flex-shrink-0">
                                          <div className={`w-12 h-12 rounded-2xl ${isDark ? 'bg-slate-700 text-white' : 'bg-slate-900 text-white'} flex items-center justify-center font-black text-xl shadow-lg mb-3`}>
                                            {idx+1}
                                          </div>
                                          <span className={`text-[10px] font-black px-3 py-1 rounded-xl border uppercase tracking-wider ${typeInfo.color}`}>
                                              {typeInfo.label}
                                          </span>
                                      </div>
                                      <div className="flex-1 min-w-0">
                                          <p className={`font-black ${isDark ? 'text-white' : 'text-slate-900'} text-xl mb-8 leading-tight tracking-tight`}>{q.question}</p>
                                          
                                          {(q.type === 'single_choice' || q.type === 'true_false') && (
                                              <div className="grid grid-cols-1 gap-3">
                                                  {safeOptions.map((opt, oIdx) => (
                                                      <button 
                                                          key={oIdx}
                                                          onClick={() => setUserAnswers(prev => ({...prev, [idx]: oIdx}))}
                                                          className={`w-full text-left px-6 py-4 rounded-2xl border-2 font-bold transition-all flex items-center gap-4 ${
                                                              userAnswers[idx] === oIdx 
                                                              ? `border-[#2D5CF7] ${isDark ? 'bg-blue-900/20' : 'bg-blue-50/50'} text-[#2D5CF7] shadow-inner transform translate-x-1` 
                                                              : `${isDark ? 'border-slate-700 bg-slate-800/30 text-slate-400' : 'border-slate-50 bg-white/50 text-slate-600'} hover:border-blue-200 hover:bg-white hover:translate-x-1`
                                                          }`}
                                                      >
                                                          <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center text-[10px] ${userAnswers[idx] === oIdx ? 'border-[#2D5CF7] bg-[#2D5CF7] text-white' : 'border-slate-200 text-slate-300'}`}>
                                                            {String.fromCharCode(65 + oIdx)}
                                                          </div>
                                                          {opt}
                                                      </button>
                                                  ))}
                                              </div>
                                          )}

                                          {q.type === 'multiple_choice' && (
                                              <div className="grid grid-cols-1 gap-3">
                                                  {safeOptions.map((opt, oIdx) => {
                                                      const selected = (userAnswers[idx] || []).includes(oIdx);
                                                      return (
                                                          <button 
                                                              key={oIdx}
                                                              onClick={() => handleMultiSelect(idx, oIdx)}
                                                              className={`w-full text-left px-6 py-4 rounded-2xl border-2 font-bold transition-all flex justify-between items-center gap-4 ${
                                                                  selected 
                                                                  ? `border-[#2D5CF7] ${isDark ? 'bg-blue-900/20' : 'bg-blue-50/50'} text-[#2D5CF7] shadow-inner transform translate-x-1` 
                                                                  : `${isDark ? 'border-slate-700 bg-slate-800/30 text-slate-400' : 'border-slate-50 bg-white/50 text-slate-600'} hover:border-blue-200 hover:bg-white hover:translate-x-1`
                                                              }`}
                                                          >
                                                              <div className="flex items-center gap-4">
                                                                <div className={`w-6 h-6 rounded-lg border-2 flex items-center justify-center ${selected ? 'border-[#2D5CF7] bg-[#2D5CF7] text-white' : 'border-slate-200'}`}>
                                                                  {selected && <Check size={12} strokeWidth={4} />}
                                                                </div>
                                                                {opt}
                                                              </div>
                                                              <span className={`text-[10px] font-black uppercase ${selected ? 'text-[#2D5CF7]' : 'text-slate-200'}`}>
                                                                Option {String.fromCharCode(65 + oIdx)}
                                                              </span>
                                                          </button>
                                                      );
                                                  })}
                                              </div>
                                          )}

                                          {q.type === 'short_answer' && (
                                              <div className="relative">
                                                <textarea 
                                                    className={`w-full h-40 p-6 ${isDark ? 'bg-slate-900/50 border-slate-700 text-white' : 'bg-slate-50/50 border-slate-50 text-slate-900'} border-2 rounded-[2rem] text-sm font-bold placeholder:text-slate-300 focus:outline-none focus:ring-2 focus:ring-[#2D5CF7] transition-all shadow-inner resize-none`}
                                                    placeholder="请在此处输入您的完整学术论述..."
                                                    value={userAnswers[idx] || ''}
                                                    onChange={(e) => setUserAnswers(prev => ({...prev, [idx]: e.target.value}))}
                                                />
                                                <div className="absolute bottom-4 right-6 text-[10px] font-black text-slate-300 uppercase tracking-widest">
                                                  AI Grading Active
                                                </div>
                                              </div>
                                          )}
                                      </div>
                                    </div>
                                </div>
                             );
                          })}
                          
                          {(!examPaper.questions || examPaper.questions.length === 0) && (
                             <div className="text-center bg-red-50 border border-red-100 p-10 rounded-3xl text-red-600 font-bold">试卷内容为空，请重新配置参数生成。</div>
                          )}
                       </div>
                       
                       <div className="flex justify-center pt-10 pb-20">
                          <button 
                            onClick={handleSubmitExam} 
                            disabled={isGrading} 
                            className="px-12 py-5 bg-gradient-to-br from-[#2D5CF7] to-blue-700 text-white rounded-[2rem] shadow-2xl shadow-blue-500/40 hover:shadow-blue-500/60 transform hover:-translate-y-1 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed transition-all font-black text-lg tracking-tight flex items-center gap-3"
                          >
                             {isGrading ? <RefreshCw size={24} className="animate-spin" /> : <Trophy size={24} />}
                             {isGrading ? '正在进行神经网络自动阅卷...' : '确认并提交试卷'}
                          </button>
                       </div>
                    </div>
                 )}

                 {examResult && (
                    <div className="max-w-5xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
                       <div className="bg-gradient-to-br from-slate-900 to-slate-800 text-white p-12 rounded-[3rem] text-center shadow-2xl relative overflow-hidden">
                           <div className="absolute top-0 right-0 w-96 h-96 bg-white/5 rounded-full -mr-48 -mt-48 blur-3xl" />
                           <div className="relative z-10">
                             <h2 className="text-[10px] font-black text-white/40 uppercase tracking-[0.3em] mb-4">Final Score Result</h2>
                             <div className="inline-flex items-end gap-3 mb-6">
                                <span className="text-8xl font-black text-emerald-400 tracking-tighter">{examResult.score}</span>
                                <span className="text-2xl font-black text-white/30 mb-4">/ {examResult.totalScore}</span>
                             </div>
                             <p className="text-xl font-bold text-slate-300 max-w-2xl mx-auto leading-relaxed">{examResult.summary}</p>
                           </div>
                       </div>

                       <div className="grid md:grid-cols-2 gap-8">
                           <div className={`${isDark ? 'bg-slate-800/40 border-slate-700' : 'bg-white/80 border-white/60'} backdrop-blur-xl border p-8 rounded-[2.5rem] shadow-xl`}>
                               <div className="flex items-center gap-4 mb-6">
                                  <div className={`w-10 h-10 rounded-2xl ${isDark ? 'bg-blue-900/30' : 'bg-blue-50'} text-blue-600 flex items-center justify-center`}>
                                    <FileText size={20} />
                                  </div>
                                  <h3 className={`text-xl font-black ${isDark ? 'text-white' : 'text-slate-900'} tracking-tight`}>深度效能分析</h3>
                               </div>
                               <p className={`${isDark ? 'text-slate-300 bg-slate-900/50 border-slate-800' : 'text-slate-600 bg-slate-50/50 border-slate-100'} text-sm font-bold leading-relaxed whitespace-pre-line p-6 rounded-2xl border shadow-inner`}>
                                   {examResult.detailedAnalysis || "暂无详细分析。"}
                               </p>
                           </div>
                           <div className={`${isDark ? 'bg-slate-800/40 border-slate-700' : 'bg-white/80 border-white/60'} backdrop-blur-xl border p-8 rounded-[2.5rem] shadow-xl`}>
                               <div className="flex items-center gap-4 mb-6">
                                  <div className={`w-10 h-10 rounded-2xl ${isDark ? 'bg-yellow-900/30' : 'bg-yellow-50'} text-yellow-600 flex items-center justify-center`}>
                                    <Lightbulb size={20} />
                                  </div>
                                  <h3 className={`text-xl font-black ${isDark ? 'text-white' : 'text-slate-900'} tracking-tight`}>后续学习建议</h3>
                               </div>
                               <div className="space-y-3">
                                   {examResult.studySuggestions && examResult.studySuggestions.length > 0 ? (
                                       examResult.studySuggestions.map((sug, i) => (
                                           <div key={i} className={`flex items-start gap-4 p-4 ${isDark ? 'bg-yellow-900/20 border-yellow-900/50' : 'bg-yellow-50/50 border-yellow-100'} border rounded-2xl shadow-sm group`}>
                                               <span className={`w-6 h-6 ${isDark ? 'bg-yellow-900 text-yellow-400' : 'bg-yellow-200 text-yellow-800'} rounded-lg flex items-center justify-center text-[10px] font-black flex-shrink-0 mt-0.5 group-hover:scale-110 transition-transform`}>{i+1}</span>
                                               <p className={`${isDark ? 'text-yellow-200/80' : 'text-slate-700'} text-xs font-bold leading-relaxed`}>{sug}</p>
                                           </div>
                                       ))
                                   ) : (
                                       <div className="text-slate-400 text-sm font-medium italic">暂无建议。</div>
                                   )}
                               </div>
                           </div>
                       </div>

                       <div className="space-y-8">
                          <div className="flex items-center gap-4">
                            <div className="w-2 h-8 bg-red-500 rounded-full shadow-[0_0_15px_rgba(239,68,68,0.4)]" />
                            <h3 className={`text-2xl font-black ${isDark ? 'text-white' : 'text-slate-900'} tracking-tight`}>错题复盘与深度解析</h3>
                          </div>
                          
                          {examResult.wrongQuestions?.map((wq, i) => (
                             <div key={i} className={`${isDark ? 'bg-slate-800/40 border-slate-700' : 'bg-white/80 border-white/60'} backdrop-blur-xl border p-10 rounded-[2.5rem] shadow-xl relative overflow-hidden group`}>
                                <div className={`absolute top-0 right-0 w-32 h-32 ${isDark ? 'bg-red-900/10' : 'bg-red-50/50'} rounded-full -mr-16 -mt-16 group-hover:scale-110 transition-transform duration-500`} />
                                
                                <p className={`font-black ${isDark ? 'text-white' : 'text-slate-900'} text-xl mb-8 relative z-10 leading-tight pr-10`}>{wq.question}</p>
                                
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8 relative z-10">
                                   <div className={`${isDark ? 'bg-red-900/20 border-red-900/50' : 'bg-red-50 border-red-100'} border p-5 rounded-2xl flex items-center gap-4`}>
                                      <div className={`w-8 h-8 rounded-xl ${isDark ? 'bg-slate-800 text-red-400' : 'bg-white text-red-500'} flex items-center justify-center shadow-sm`}>
                                        <XCircle size={18} strokeWidth={3} />
                                      </div>
                                      <div>
                                        <p className="text-[10px] font-black text-red-400 uppercase tracking-widest mb-0.5">Your Response</p>
                                        <p className={`text-sm font-black ${isDark ? 'text-red-300' : 'text-red-700'}`}>{JSON.stringify(wq.userAnswer)}</p>
                                      </div>
                                   </div>
                                   <div className={`${isDark ? 'bg-emerald-900/20 border-emerald-900/50' : 'bg-emerald-50 border-emerald-100'} border p-5 rounded-2xl flex items-center gap-4`}>
                                      <div className={`w-8 h-8 rounded-xl ${isDark ? 'bg-slate-800 text-emerald-400' : 'bg-white text-emerald-500'} flex items-center justify-center shadow-sm`}>
                                        <Check size={18} strokeWidth={3} />
                                      </div>
                                      <div>
                                        <p className="text-[10px] font-black text-emerald-400 uppercase tracking-widest mb-0.5">Correct Answer</p>
                                        <p className={`text-sm font-black ${isDark ? 'text-emerald-300' : 'text-emerald-700'}`}>{JSON.stringify(wq.correctAnswer)}</p>
                                      </div>
                                   </div>
                                </div>
                                
                                <div className={`${isDark ? 'bg-blue-900/20 border-blue-900/50' : 'bg-blue-50/50 border-blue-100'} border p-8 rounded-[2rem] shadow-inner relative`}>
                                   <div className="flex items-center gap-3 mb-4">
                                      <div className="w-8 h-8 rounded-xl bg-[#2D5CF7] text-white flex items-center justify-center">
                                        <BrainCircuit size={16} />
                                      </div>
                                      <h4 className={`text-sm font-black ${isDark ? 'text-blue-400' : 'text-[#2D5CF7]'} uppercase tracking-[0.2em]`}>AI Intelligence Insight</h4>
                                   </div>
                                   <p className={`${isDark ? 'text-slate-300' : 'text-slate-700'} text-sm font-bold leading-relaxed italic`}>"{wq.explanation}"</p>
                                </div>
                             </div>
                          ))}
                          
                          {(!examResult.wrongQuestions || examResult.wrongQuestions.length === 0) && (
                             <div className={`${isDark ? 'bg-emerald-900/20 border-emerald-900/50' : 'bg-emerald-50/50 border-emerald-100'} border p-20 rounded-[3rem] text-center shadow-inner`}>
                               <div className="w-24 h-24 rounded-[2.5rem] bg-white shadow-xl shadow-emerald-200/50 flex items-center justify-center mx-auto mb-8 animate-bounce">
                                 <Trophy size={48} className="text-yellow-500" />
                               </div>
                               <h3 className={`text-3xl font-black ${isDark ? 'text-emerald-400' : 'text-emerald-700'} mb-2`}>满分突破！</h3>
                               <p className="text-emerald-600/60 font-bold uppercase tracking-widest">Mastery Level: Maximum</p>
                             </div>
                          )}
                       </div>
                       
                       <button 
                         onClick={() => { setExamPaper(null); setExamResult(null); }} 
                         className={`w-full py-5 ${isDark ? 'bg-slate-800/50 border-slate-700 text-slate-500' : 'bg-white/50 border-white text-slate-400'} border-2 rounded-[2rem] font-black uppercase tracking-[0.3em] hover:bg-white hover:text-[#2D5CF7] hover:border-[#2D5CF7]/20 transition-all shadow-sm active:scale-95 mb-20`}
                       >
                          Restart Assessment
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

const InfoCard = ({title, content, color, icon: Icon, iconColor, iconBg, isDark}: any) => {
  const renderSafe = (val: any): React.ReactNode => {
    if (typeof val === 'string' || typeof val === 'number') return val;
    if (Array.isArray(val)) return val.join(', ');
    if (typeof val === 'object' && val !== null) {
      return (
        <div className="flex flex-col gap-1 mt-1">
          {Object.entries(val).map(([k, v]) => (
            <div key={k} className="text-sm">
              <span className={`font-semibold ${isDark ? 'text-slate-500' : 'text-gray-500'} capitalize`}>{k.replace(/([A-Z])/g, ' $1')}:</span> {renderSafe(v)}
            </div>
          ))}
        </div>
      );
    }
    return String(val);
  };

  return (
   <div className={`${color} p-8 relative overflow-hidden group`}>
      <div className={`absolute -top-10 -right-10 w-32 h-32 ${isDark ? 'bg-white/5' : 'bg-slate-50'} rounded-full group-hover:scale-110 transition-transform duration-500`} />
      <div className="relative z-10">
        <div className="flex items-center gap-3 mb-6">
          {Icon && (
            <div className={`w-10 h-10 rounded-2xl ${iconBg} ${iconColor} flex items-center justify-center shadow-sm`}>
              <Icon size={20} />
            </div>
          )}
          <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">{title}</h3>
        </div>
        <div className={`${isDark ? 'text-slate-300' : 'text-slate-700'} font-bold leading-relaxed`}>{renderSafe(content)}</div>
      </div>
   </div>
  );
};

export default ExamSystem;
