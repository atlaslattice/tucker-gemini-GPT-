import React, { useState, useCallback, useEffect } from 'react';
import ChatWindow from './components/ChatWindow';
import AlignmentChart from './components/AlignmentChart';
import PhilosophyPanel from './components/PhilosophyPanel';
import NexusSimulation from './components/NexusSimulation';
import SystemBlueprint from './components/SystemBlueprint';
import { Message, Sender, AlignmentMetrics } from './types';
import { sendMessageToGemini } from './services/gemini';
import { ShieldCheck, RotateCcw, Book, Cpu, FileCode } from 'lucide-react';

const STORAGE_KEY_MESSAGES = 'tp_messages_v1';
const STORAGE_KEY_METRICS = 'tp_metrics_v1';

const getInitialMessage = (): Message => ({
  id: 'init-1',
  sender: Sender.System,
  text: "Greetings. I am Tucker_Pendragon. \n\nI am initialized and monitoring alignment vectors. Memory persistence is active. How may I assist you in navigating purpose or power today?",
  timestamp: Date.now(),
  metrics: { jedi: 50, sith: 50, grey: 50 }
});

const INITIAL_METRICS: AlignmentMetrics = { jedi: 50, sith: 50, grey: 50 };

const App: React.FC = () => {
  const [messages, setMessages] = useState<Message[]>(() => {
    if (typeof window !== 'undefined') {
      try {
        const savedMessages = localStorage.getItem(STORAGE_KEY_MESSAGES);
        if (savedMessages) return JSON.parse(savedMessages);
      } catch (e) { console.error("Failed to parse messages from storage", e); }
    }
    return [getInitialMessage()];
  });
  
  const [currentMetrics, setCurrentMetrics] = useState<AlignmentMetrics>(() => {
    if (typeof window !== 'undefined') {
      try {
        const savedMetrics = localStorage.getItem(STORAGE_KEY_METRICS);
        if (savedMetrics) return JSON.parse(savedMetrics);
      } catch (e) { console.error("Failed to parse metrics from storage", e); }
    }
    return INITIAL_METRICS;
  });

  const [isLoading, setIsLoading] = useState(false);
  const [rightPanelTab, setRightPanelTab] = useState<'philosophy' | 'nexus' | 'blueprint'>('philosophy');

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY_MESSAGES, JSON.stringify(messages));
      localStorage.setItem(STORAGE_KEY_METRICS, JSON.stringify(currentMetrics));
    } catch (e) { console.error("Failed to save to localStorage:", e); }
  }, [messages, currentMetrics]);

  const handleReset = () => {
    if (window.confirm('Reset conversation memory? This cannot be undone.')) {
      try {
        localStorage.removeItem(STORAGE_KEY_MESSAGES);
        localStorage.removeItem(STORAGE_KEY_METRICS);
      } catch (e) { console.error("Failed to clear localStorage:", e); }
      setMessages([getInitialMessage()]);
      setCurrentMetrics(INITIAL_METRICS);
    }
  };

  const handleSendMessage = useCallback(async (text: string) => {
    const userMessage: Message = {
      id: Date.now().toString(),
      sender: Sender.User,
      text,
      timestamp: Date.now()
    };
    setMessages(prev => [...prev, userMessage]);
    setIsLoading(true);

    try {
      const history = messages.map(m => ({
        role: m.sender === Sender.User ? 'user' : 'model',
        parts: [{ text: m.text }]
      }));
      const result = await sendMessageToGemini(history, text);
      const systemMessage: Message = {
        id: (Date.now() + 1).toString(),
        sender: Sender.System,
        text: result.response,
        metrics: result.metrics,
        reasoning: result.reasoning,
        timestamp: Date.now()
      };
      setMessages(prev => [...prev, systemMessage]);
      setCurrentMetrics(result.metrics);
    } catch (error) {
      console.error("Interaction failed", error);
    } finally {
      setIsLoading(false);
    }
  }, [messages]);

  return (
    <div className="min-h-screen bg-gray-950 text-gray-200 font-sans selection:bg-pendragon/30 selection:text-white p-4 md:p-8 flex flex-col">
      <header className="mb-6 flex items-center justify-between">
        <div className="flex items-center gap-3">
            <div className="p-2 bg-gradient-to-br from-gray-800 to-gray-900 rounded-lg border border-gray-700 shadow-lg shadow-black/50">
                <ShieldCheck className="text-pendragon" size={24} />
            </div>
            <div>
                <h1 className="text-xl md:text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-gray-100 to-gray-400">TUCKER_PENDRAGON</h1>
                <p className="text-xs text-gray-500 tracking-wider uppercase">Diplomatic Alignment Interface</p>
            </div>
        </div>
        <div className="flex items-center gap-4">
            <div className="hidden md:block text-right">
                <div className="text-[10px] text-gray-600 font-mono">SYS_STATUS: ONLINE</div>
                <div className="text-[10px] text-gray-600 font-mono">MEMORY: PERSISTENT</div>
            </div>
            <button onClick={handleReset} className="p-2 text-gray-500 hover:text-red-400 transition-colors border border-gray-800 rounded-md hover:border-red-900/50 bg-gray-900/50 backdrop-blur-sm" title="Reset Memory">
                <RotateCcw size={18} />
            </button>
        </div>
      </header>

      <main className="flex-1 grid grid-cols-1 lg:grid-cols-12 gap-6 h-[calc(100vh-140px)] min-h-[600px]">
        <div className="lg:col-span-8 h-full flex flex-col shadow-2xl shadow-black/20">
          <ChatWindow messages={messages} onSendMessage={handleSendMessage} isLoading={isLoading} />
        </div>

        <div className="lg:col-span-4 flex flex-col gap-6 h-full">
            <div className="flex-1 min-h-[300px] shadow-xl shadow-black/20">
                <AlignmentChart metrics={currentMetrics} />
            </div>
            <div className="flex-1 min-h-[300px] shadow-xl shadow-black/20 flex flex-col">
                <div className="flex bg-gray-900/50 rounded-t-xl border border-gray-800 border-b-0 backdrop-blur-sm">
                    <button onClick={() => setRightPanelTab('philosophy')} className={`flex-1 p-2 text-[10px] md:text-xs font-semibold flex items-center justify-center gap-1 md:gap-2 transition-colors ${rightPanelTab === 'philosophy' ? 'text-gray-200 bg-gray-800/50' : 'text-gray-500 hover:text-gray-300'}`} title="Philosophy">
                        <Book size={12} /> PROTOCOL
                    </button>
                    <button onClick={() => setRightPanelTab('nexus')} className={`flex-1 p-2 text-[10px] md:text-xs font-semibold flex items-center justify-center gap-1 md:gap-2 transition-colors ${rightPanelTab === 'nexus' ? 'text-emerald-400 bg-gray-800/50' : 'text-gray-500 hover:text-emerald-400'}`} title="Simulation">
                        <Cpu size={12} /> NEXUS
                    </button>
                    <button onClick={() => setRightPanelTab('blueprint')} className={`flex-1 p-2 text-[10px] md:text-xs font-semibold flex items-center justify-center gap-1 md:gap-2 transition-colors ${rightPanelTab === 'blueprint' ? 'text-blue-400 bg-gray-800/50' : 'text-gray-500 hover:text-blue-400'}`} title="Blueprint">
                        <FileCode size={12} /> SYSTEM
                    </button>
                </div>
                <div className="flex-1 rounded-b-xl border border-t-0 border-gray-800 overflow-hidden relative">
                    {rightPanelTab === 'philosophy' && <PhilosophyPanel />}
                    {rightPanelTab === 'nexus' && <NexusSimulation />}
                    {rightPanelTab === 'blueprint' && <SystemBlueprint />}
                </div>
            </div>
        </div>
      </main>
    </div>
  );
};

export default App;