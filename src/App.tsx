import React, { useState, useEffect } from 'react';
import { Sidebar } from './components/Sidebar';
import { Terminal } from './components/Terminal';
import { Architecture } from './components/Architecture';
import { Metrics } from './components/Metrics';
import { ConfigPanel } from './components/ConfigPanel';
import { INITIAL_CONFIG } from './constants';
import { ViewMode, Message, ModelConfig, SystemMetrics } from './types';

function App() {
  const [view, setView] = useState<ViewMode>(ViewMode.TERMINAL);
  const [config, setConfig] = useState<ModelConfig>(INITIAL_CONFIG);
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'init',
      role: 'system',
      content: 'PENDRAGON OS v3.1.4 initialized.\nKernel loaded: TUCKER_V3 (Reversible).\nWaiting for input...',
      timestamp: Date.now(),
    },
  ]);
  
  const [metrics, setMetrics] = useState<SystemMetrics>({
    memoryUsage: 12.4,
    computeLoad: 0.5,
    reversibleCache: 1024,
    activeExperts: 0,
  });

  // Simulate metrics update
  useEffect(() => {
    const interval = setInterval(() => {
      setMetrics(prev => ({
        memoryUsage: Math.min(100, Math.max(10, prev.memoryUsage + (Math.random() - 0.5) * 5)),
        computeLoad: Math.min(100, Math.max(0, prev.computeLoad + (Math.random() - 0.5) * 10)),
        reversibleCache: prev.reversibleCache + Math.floor(Math.random() * 5),
        activeExperts: config.useCouncil ? Math.floor(Math.random() * config.numExperts) : 0,
      }));
    }, 2000);
    return () => clearInterval(interval);
  }, [config]);

  return (
    <div className="flex h-screen bg-slate-950 text-slate-200 overflow-hidden font-sans">
      <Sidebar currentView={view} setView={setView} />
      
      <main className="flex-1 p-4 lg:p-6 overflow-hidden relative">
        <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-slate-900 via-slate-950 to-slate-950 -z-10 pointer-events-none"></div>
        
        {/* Header Branding */}
        <div className="absolute top-4 right-6 text-right hidden md:block opacity-50 pointer-events-none">
            <h1 className="text-2xl font-black tracking-tighter text-slate-700">TUCKER<span className="text-cyan-900">V3</span></h1>
            <p className="text-[10px] font-mono text-slate-600">REVERSIBLE GENERATIVE PRE-TRAINED TRANSFORMER</p>
        </div>

        <div className="h-full max-w-7xl mx-auto flex gap-6">
            
            {/* Main Content Area */}
            <div className={`flex-1 flex flex-col h-full transition-all duration-300 ${view === ViewMode.TERMINAL ? 'w-full' : 'w-2/3'}`}>
                {view === ViewMode.TERMINAL && <Terminal messages={messages} setMessages={setMessages} />}
                {view === ViewMode.ARCHITECTURE && <Architecture config={config} />}
                {view === ViewMode.MONITOR && <Metrics metrics={metrics} />}
                {view === ViewMode.CONFIG && <ConfigPanel config={config} setConfig={setConfig} />}
            </div>

            {/* Split View for larger screens (Optional context) */}
            {view !== ViewMode.TERMINAL && (
               <div className="hidden lg:block w-1/3 border-l border-slate-800 pl-6">
                    <div className="h-full flex flex-col">
                        <div className="mb-2 text-xs font-bold text-slate-500 uppercase">Terminal Output</div>
                        <div className="flex-1 min-h-0 bg-slate-900/50 rounded border border-slate-800 overflow-hidden relative">
                             <div className="absolute inset-0 p-4 overflow-y-auto text-xs font-mono text-slate-400 opacity-70">
                                {messages.map(m => (
                                    <div key={m.id} className="mb-2">
                                        <span className={m.role === 'user' ? 'text-cyan-700' : 'text-slate-600'}>
                                            {m.role === 'user' ? '>' : '#'} 
                                        </span> {m.content.substring(0, 100)}{m.content.length > 100 ? '...' : ''}
                                    </div>
                                ))}
                             </div>
                        </div>
                    </div>
               </div>
            )}
        </div>
      </main>
    </div>
  );
}

export default App;