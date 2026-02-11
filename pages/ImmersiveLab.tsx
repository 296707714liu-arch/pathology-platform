import React, { useState, useEffect, useRef } from 'react';
import { Database, Eye, Search, CheckCircle, Target, Terminal, Mic, Microscope } from 'lucide-react';
import { performVRInteraction } from '../services/geminiService';

const ImmersiveLab: React.FC = () => {
  const [logs, setLogs] = useState<string[]>(["SYSTEM: Simulation initialized.", "SYSTEM: Liver Pathology Module Loaded."]);
  const [command, setCommand] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [context, setContext] = useState("Standing in front of a virtual patient table. A 3D model of a liver showing cirrhosis nodules is displayed.");
  const logsEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    logsEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [logs]);

  const handleCommand = async () => {
    if (!command.trim()) return;
    const userCmd = command;
    setCommand("");
    setLogs(prev => [...prev, `> USER: ${userCmd}`]);
    setIsProcessing(true);

    try {
      const response = await performVRInteraction(context, userCmd);
      setLogs(prev => [...prev, `> AI: ${response}`]);
      setContext(prev => prev + " " + response); // Update context with result
    } catch (e) {
      setLogs(prev => [...prev, `> SYSTEM_ERR: Command processing failed.`]);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="h-screen bg-gray-50 flex">
      {/* Left Sidebar - Controls */}
      <div className="w-80 bg-white border-r border-gray-200 flex flex-col">
        {/* Page Header */}
        <div className="p-6 border-b border-gray-100">
          <div className="flex items-center mb-2">
            <Microscope className="w-6 h-6 text-gray-700 mr-3" />
            <h1 className="text-xl font-semibold text-gray-900">VR 沉浸实训</h1>
          </div>
          <p className="text-sm text-gray-600">虚拟现实解剖学习环境</p>
        </div>

        {/* Current Scene */}
        <div className="p-6 border-b border-gray-100">
          <h3 className="text-sm font-medium text-gray-900 mb-4 flex items-center">
            <Database className="w-4 h-4 mr-2" />
            当前场景
          </h3>
          <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
            <p className="text-sm text-gray-700 leading-relaxed">{context}</p>
          </div>
        </div>

        {/* Command Input */}
        <div className="p-6 border-b border-gray-100">
          <h3 className="text-sm font-medium text-gray-900 mb-4 flex items-center">
            <Terminal className="w-4 h-4 mr-2" />
            指令控制台
          </h3>
          <p className="text-xs text-gray-600 mb-4">输入指令进行解剖或观察，例如："切开左叶", "放大观察结节表面", "显示血管分布"</p>
          
          <div className="space-y-3">
            <input 
              value={command}
              onChange={(e) => setCommand(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleCommand()}
              className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent"
              placeholder="输入操作指令..."
              autoFocus
            />
            <button 
              onClick={handleCommand}
              disabled={isProcessing || !command.trim()}
              className="w-full py-2.5 px-4 bg-gray-900 text-white rounded-lg hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center"
            >
              {isProcessing ? (
                <>
                  <Terminal className="w-4 h-4 mr-2 animate-pulse" />
                  处理中...
                </>
              ) : (
                <>
                  <Terminal className="w-4 h-4 mr-2" />
                  执行指令
                </>
              )}
            </button>
          </div>
        </div>

        {/* System Status */}
        <div className="p-6 border-b border-gray-100">
          <h3 className="text-sm font-medium text-gray-900 mb-4">系统状态</h3>
          <div className="space-y-3 text-xs">
            <div className="flex justify-between items-center">
              <span className="text-gray-600">引擎</span>
              <span className="text-gray-900 font-medium">Gemini 3.0</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600">VR 连接</span>
              <div className="flex items-center">
                <div className="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
                <span className="text-green-700 font-medium">已连接</span>
              </div>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600">帧率</span>
              <span className="text-gray-900 font-medium">120 FPS</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600">延迟</span>
              <span className="text-gray-900 font-medium">12ms</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600">触觉反馈</span>
              <span className="text-green-700 font-medium">开启</span>
            </div>
          </div>
        </div>

        {/* Usage Tips */}
        <div className="p-6">
          <h3 className="text-sm font-medium text-gray-900 mb-3">使用提示</h3>
          <div className="space-y-2 text-xs text-gray-600">
            <p>• 使用自然语言描述操作动作</p>
            <p>• 支持切割、观察、测量等指令</p>
            <p>• AI 会实时响应并更新场景</p>
            <p>• 所有操作都会记录在日志中</p>
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 bg-white border-l border-gray-200 flex flex-col">
        {/* Content Header */}
        <div className="p-6 border-b border-gray-100">
          <h2 className="text-lg font-semibold text-gray-900">操作日志</h2>
          <p className="text-sm text-gray-600 mt-1">实时显示 VR 环境中的所有操作和反馈</p>
        </div>

        {/* Logs Panel */}
        <div className="flex-1 overflow-y-auto p-6 font-mono text-sm">
          <div className="space-y-2">
            {logs.map((log, i) => (
              <div key={i} className={`p-2 rounded ${
                log.startsWith('> USER') 
                  ? 'text-gray-900 bg-gray-50' 
                  : log.startsWith('> AI') 
                  ? 'text-green-700 bg-green-50' 
                  : 'text-gray-600'
              }`}>
                {log}
              </div>
            ))}
            {isProcessing && (
              <div className="text-gray-900 bg-gray-50 p-2 rounded animate-pulse">
                _ Processing...
              </div>
            )}
            <div ref={logsEndRef} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default ImmersiveLab;