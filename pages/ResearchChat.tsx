import React, { useState, useEffect, useRef } from 'react';
import { Send, Bot, User, BookOpen, Microscope, MessageSquare, FileText, Loader2 } from 'lucide-react';
import { streamResearchChat, generateResearchProposal } from '../services/geminiService';
import { activityAPI } from '../services/apiService';
import { ChatMessage } from '../types';

const ResearchChat: React.FC = () => {
  const [mode, setMode] = useState<'chat' | 'proposal'>('chat');
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: '1',
      role: 'model',
      text: '同学你好！我是你的专属科研学术搭子。想查什么文献？或者有什么不懂的机制？尽管问我！',
      timestamp: new Date()
    }
  ]);
  const [input, setInput] = useState('');
  const [sampleInfo, setSampleInfo] = useState('');
  const [proposalResult, setProposalResult] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    const userMsg: ChatMessage = {
      id: Date.now().toString(),
      role: 'user',
      text: input,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setIsLoading(true);

    const modelMsgId = (Date.now() + 1).toString();
    const modelMsg: ChatMessage = {
      id: modelMsgId,
      role: 'model',
      text: '',
      timestamp: new Date(),
      sources: []
    };

    setMessages(prev => [...prev, modelMsg]);

    const startTime = Date.now();
    try {
      await streamResearchChat(messages, userMsg.text, (chunk) => {
        setMessages(prev => prev.map(m => 
          m.id === modelMsgId 
            ? { ...m, text: m.text + chunk }
            : m
        ));
      }, (sources) => {
        setMessages(prev => prev.map(m => 
          m.id === modelMsgId 
            ? { ...m, sources: sources || [] }
            : m
        ));
      });

      const duration = Math.round((Date.now() - startTime) / 1000);
      await activityAPI.logActivity('research_chat', '学术研究', { message_length: userMsg.text.length }, duration);
    } catch (error) {
      setMessages(prev => prev.map(m => m.id === modelMsgId ? { ...m, isError: true, text: "哎呀，连网好像出了点问题..." } : m));
    } finally {
      setIsLoading(false);
    }
  };

  const handleGenerateProposal = async () => {
    if (!sampleInfo.trim()) return;
    setIsLoading(true);
    setProposalResult(null);
    try {
      const result = await generateResearchProposal(sampleInfo);
      setProposalResult(result);
    } catch (e) {
      setProposalResult("生成失败，请重试");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="h-screen bg-slate-50 flex">
      {/* Left Sidebar - Controls */}
      <div className="w-80 bg-white border-r border-slate-200 flex flex-col">
        {/* Page Header */}
        <div className="p-6 border-b border-slate-100">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-lg bg-emerald-500 flex items-center justify-center">
              <BookOpen className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-lg font-bold text-slate-900">学术/科研</h1>
              <p className="text-xs text-slate-500">AI 学术助手与研究方案</p>
            </div>
          </div>
        </div>

        {/* Mode Selection */}
        <div className="p-6 border-b border-slate-100">
          <h3 className="text-sm font-medium text-slate-900 mb-4">功能模式</h3>
          <div className="space-y-2">
            <button 
              onClick={() => setMode('chat')} 
              className={`w-full text-left px-3 py-2 text-sm rounded-lg transition-colors flex items-center font-medium ${
                mode === 'chat' ? 'bg-emerald-600 text-white' : 'text-slate-700 hover:bg-slate-50'
              }`}
            >
              <MessageSquare className="w-4 h-4 mr-2" />
              学术对话
            </button>
            <button 
              onClick={() => setMode('proposal')} 
              className={`w-full text-left px-3 py-2 text-sm rounded-lg transition-colors flex items-center font-medium ${
                mode === 'proposal' ? 'bg-emerald-600 text-white' : 'text-slate-700 hover:bg-slate-50'
              }`}
            >
              <FileText className="w-4 h-4 mr-2" />
              方案生成
            </button>
          </div>
        </div>

        {/* Controls */}
        <div className="flex-1 overflow-y-auto">
          {mode === 'proposal' && (
            <div className="p-6 border-b border-slate-100">
              <h3 className="text-sm font-medium text-slate-900 mb-4">样本信息</h3>
              <textarea
                value={sampleInfo}
                onChange={(e) => setSampleInfo(e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent resize-none"
                rows={4}
                placeholder="请输入样本的基本信息，如类型、来源、特征等..."
              />
              <button
                onClick={handleGenerateProposal}
                disabled={isLoading || !sampleInfo.trim()}
                className="w-full mt-3 py-2.5 px-4 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center font-medium"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    生成中...
                  </>
                ) : (
                  <>
                    <FileText className="w-4 h-4 mr-2" />
                    生成方案
                  </>
                )}
              </button>
            </div>
          )}

          {/* Status Display */}
          {isLoading && (
            <div className="p-6 border-b border-gray-100">
              <h3 className="text-sm font-medium text-gray-900 mb-3">处理状态</h3>
              <div className="bg-gray-50 border border-gray-200 rounded-lg p-3 flex items-center">
                <Loader2 className="w-4 h-4 text-gray-500 mr-2 animate-spin" />
                <p className="text-sm text-gray-700">
                  {mode === 'chat' ? 'AI 正在思考回答...' : '正在生成研究方案...'}
                </p>
              </div>
            </div>
          )}

          {/* Usage Tips */}
          <div className="p-6">
            <h3 className="text-sm font-medium text-gray-900 mb-3">使用提示</h3>
            <div className="space-y-2 text-xs text-gray-600">
              {mode === 'chat' ? (
                <>
                  <p>• 可以询问学术问题和研究方法</p>
                  <p>• 支持文献检索和机制解释</p>
                  <p>• AI 会提供相关的参考资料</p>
                  <p>• 对话历史会自动保存</p>
                </>
              ) : (
                <>
                  <p>• 详细描述样本的基本信息</p>
                  <p>• 包括样本类型、来源、特征等</p>
                  <p>• AI 会生成完整的研究方案</p>
                  <p>• 方案包含实验设计和分析方法</p>
                </>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 bg-white border-l border-gray-200 flex flex-col">
        {/* Content Header */}
        <div className="p-6 border-b border-gray-100">
          <h2 className="text-lg font-semibold text-gray-900">
            {mode === 'chat' ? '学术对话' : '研究方案'}
          </h2>
          <p className="text-sm text-gray-600 mt-1">
            {mode === 'chat' ? '与 AI 学术助手进行实时对话' : '基于样本信息生成研究方案'}
          </p>
        </div>

        {mode === 'chat' ? (
          <>
            {/* Chat Messages - Takes all available space */}
            <div className="flex-1 overflow-y-auto p-6" ref={scrollRef}>
              <div className="space-y-4 max-w-4xl">
                {messages.map((message) => (
                  <div key={message.id} className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                    <div className={`flex max-w-[80%] ${message.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>
                      <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${
                        message.role === 'user' ? 'bg-gray-900 ml-3' : 'bg-gray-100 mr-3'
                      }`}>
                        {message.role === 'user' ? (
                          <User className="w-4 h-4 text-white" />
                        ) : (
                          <Bot className="w-4 h-4 text-gray-600" />
                        )}
                      </div>
                      <div className={`rounded-lg p-4 ${
                        message.role === 'user' 
                          ? 'bg-gray-900 text-white' 
                          : message.isError 
                          ? 'bg-red-50 border border-red-200 text-red-800'
                          : 'bg-gray-50 border border-gray-200 text-gray-900'
                      }`}>
                        <p className="text-sm leading-relaxed whitespace-pre-wrap">{message.text}</p>
                        {message.sources && message.sources.length > 0 && (
                          <div className="mt-3 pt-3 border-t border-gray-200">
                            <p className="text-xs font-medium text-gray-600 mb-2">参考资料:</p>
                            <div className="space-y-1">
                              {message.sources.map((source, idx) => (
                                <a
                                  key={idx}
                                  href={source.uri}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="block text-xs text-blue-600 hover:text-blue-800 hover:underline"
                                >
                                  {source.title}
                                </a>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Chat Input - Fixed at bottom */}
            <div className="p-6 border-t border-gray-100 bg-white">
              <div className="flex gap-3 max-w-4xl">
                <input
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && handleSend()}
                  className="flex-1 px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent"
                  placeholder="输入你的学术问题..."
                  disabled={isLoading}
                />
                <button
                  onClick={handleSend}
                  disabled={isLoading || !input.trim()}
                  className="px-6 py-3 bg-gray-900 text-white rounded-lg hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center"
                >
                  <Send className="w-4 h-4" />
                </button>
              </div>
            </div>
          </>
        ) : (
          /* Proposal Content */
          <div className="flex-1 p-6">
            {!proposalResult && !isLoading && (
              <div className="h-full flex items-center justify-center">
                <div className="text-center">
                  <FileText className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">等待生成方案</h3>
                  <p className="text-gray-600">在左侧输入样本信息，生成研究方案</p>
                </div>
              </div>
            )}
            
            {isLoading && (
              <div className="h-full flex items-center justify-center">
                <div className="text-center">
                  <Loader2 className="w-16 h-16 text-gray-400 mx-auto mb-4 animate-spin" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">正在生成方案</h3>
                  <p className="text-gray-600">AI 正在分析样本信息并制定研究计划</p>
                </div>
              </div>
            )}
            
            {proposalResult && (
              <div className="max-w-4xl">
                <div className="bg-gray-50 border border-gray-200 rounded-lg p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                    <FileText className="w-5 h-5 mr-2" />
                    研究方案
                  </h3>
                  <div className="prose prose-sm max-w-none">
                    <pre className="whitespace-pre-wrap text-sm text-gray-700 leading-relaxed">
                      {proposalResult}
                    </pre>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default ResearchChat;