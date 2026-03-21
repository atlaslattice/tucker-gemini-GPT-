import React, { useState, useEffect, useRef } from 'react';
import { Activity, Zap, Globe, ShieldCheck, Cpu, Mic } from 'lucide-react';

interface SimulationLog {
  id: string;
  timestamp: string;
  message: string;
  type: 'routing' | 'harvest' | 'construct' | 'voice';
  efficiency: number;
}

const NexusSimulation: React.FC = () => {
  const [computeSaved, setComputeSaved] = useState(0);
  const [coherence, setCoherence] = useState(0);
  const [activeNodes, setActiveNodes] = useState(1);
  const [logs, setLogs] = useState<SimulationLog[]>([]);
  const logsEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const interval = setInterval(() => {
      const tasks = [
        "Optimizing Supply Chain Graph",
        "Damping Market Volatility",
        "Parsing Syntax",
        "Routing Low-Priority Query",
        "Compressing Governance Topology",
        "Scanning for Entropy Leak",
        "Generating Next-Token Prediction",
        "Synthesizing Voice Output"
      ];
      const task = tasks[Math.floor(Math.random() * tasks.length)];
      const gain = Math.random() * 2 + 0.5;
      
      let type: 'routing' | 'harvest' | 'construct' | 'voice' = 'routing';
      if (task.includes("Next-Token") || task.includes("Voice")) {
          type = 'voice';
      }

      setComputeSaved(prev => {
        const newVal = prev + gain;
        if (Math.floor(newVal / 50) > Math.floor(prev / 50)) {
           setActiveNodes(nodes => Math.min(nodes + 1, 144));
           setCoherence(c => Math.min(c + 1.5, 100));
           addLog(`Constructing Sphere Node #${Math.floor(newVal / 50) + 1}`, 'construct', 0);
        }
        return newVal;
      });

      addLog(`Processed: '${task}'`, type, gain);
    }, 1500);

    return () => clearInterval(interval);
  }, []);

  const addLog = (message: string, type: 'routing' | 'harvest' | 'construct' | 'voice', efficiency: number) => {
    const newLog: SimulationLog = {
      id: Math.random().toString(36).substr(2, 9),
      timestamp: new Date().toLocaleTimeString([], { hour12: false, hour: '2-digit', minute: '2-digit', second: '2-digit' }),
      message,
      type,
      efficiency
    };
    setLogs(prev => [...prev.slice(-6), newLog]);
  };

  useEffect(() => {
    logsEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [logs]);

  return (
    <div className="h-full flex flex-col bg-gray-900/50 rounded-xl border border-gray-800 backdrop-blur-sm overflow-hidden font-mono">
      <div className="p-3 border-b border-gray-800 bg-gray-950/50 flex justify-between items-center">
        <div className="flex items-center gap-2">
            <Activity size={14} className="text-emerald-400 animate-pulse" />
            <span className="text-xs font-bold text-emerald-400 tracking-wider">NEXUS_CORE v2.0</span>
        </div>
        <div className="text-[10px] text-gray-500">PENDRAGON_GPT: ACTIVE</div>
      </div>

      <div className="flex-1 p-4 flex flex-col gap-4 overflow-y-auto">
        <div className="grid grid-cols-2 gap-3">
            <div className="bg-gray-900 border border-gray-800 p-3 rounded-lg relative overflow-hidden group">
                <div className="absolute top-0 right-0 p-1 opacity-20 group-hover:opacity-40 transition-opacity">
                    <Zap size={24} className="text-yellow-400" />
                </div>
                <div className="text-[10px] text-gray-500 uppercase tracking-wider mb-1">Dark Compute</div>
                <div className="text-lg font-bold text-yellow-100">{computeSaved.toFixed(2)} <span className="text-[10px] text-yellow-500">DE</span></div>
                <div className="w-full bg-gray-800 h-1 mt-2 rounded-full overflow-hidden">
                    <div className="bg-yellow-500 h-full transition-all duration-500" style={{ width: `${(computeSaved % 50) * 2}%` }}></div>
                </div>
            </div>

            <div className="bg-gray-900 border border-gray-800 p-3 rounded-lg relative overflow-hidden group">
                <div className="absolute top-0 right-0 p-1 opacity-20 group-hover:opacity-40 transition-opacity">
                    <Globe size={24} className="text-pendragon" />
                </div>
                <div className="text-[10px] text-gray-500 uppercase tracking-wider mb-1">Coherence</div>
                <div className="text-lg font-bold text-pendragon-100">{activeNodes}<span className="text-xs text-gray-500">/144</span></div>
                <div className="w-full bg-gray-800 h-1 mt-2 rounded-full overflow-hidden">
                    <div className="bg-pendragon h-full transition-all duration-500" style={{ width: `${(activeNodes / 144) * 100}%` }}></div>
                </div>
            </div>
        </div>

        <div className="flex-1 bg-black/40 rounded-lg border border-gray-800 p-4 relative flex items-center justify-center min-h-[120px]">
            <div className="absolute inset-0 opacity-20" 
                 style={{ backgroundImage: 'radial-gradient(circle, #374151 1px, transparent 1px)', backgroundSize: '10px 10px' }}>
            </div>
            <div className="relative z-10 flex flex-col items-center">
                <div className="absolute inset-0 bg-pendragon blur-xl opacity-20 animate-pulse"></div>
                <Globe size={48} className="text-pendragon relative z-10" />
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-24 h-24 border border-emerald-500/30 rounded-full animate-spin duration-[10s]"></div>
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-32 h-32 border border-blue-500/20 rounded-full animate-spin duration-[15s] direction-reverse"></div>
                 <div className="mt-8 flex items-center gap-1 bg-gray-900/80 px-2 py-1 rounded border border-gray-700">
                    <Mic size={10} className="text-blue-400" />
                    <span className="text-[8px] text-blue-200">VOICE: SYNTHESIZING</span>
                 </div>
            </div>
            <div className="absolute bottom-2 left-2 flex items-center gap-1.5">
                <ShieldCheck size={10} className="text-emerald-500" />
                <span className="text-[9px] text-emerald-500 font-bold">SENTINEL: ONLINE</span>
            </div>
        </div>

        <div className="bg-black/60 rounded-lg border border-gray-800 p-2 h-32 overflow-hidden flex flex-col">
            <div className="text-[9px] text-gray-600 mb-1 border-b border-gray-800 pb-1 flex justify-between">
                <span>SYSTEM LOG</span>
                <span>AUTO-SCROLL</span>
            </div>
            <div className="flex-1 overflow-y-auto space-y-1 custom-scrollbar">
                {logs.map(log => (
                    <div key={log.id} className="text-[10px] font-mono flex gap-2 opacity-80 hover:opacity-100">
                        <span className="text-gray-600">[{log.timestamp}]</span>
                        <span className={`${
                            log.type === 'construct' ? 'text-pendragon font-bold' : 
                            log.type === 'harvest' ? 'text-yellow-500' : 
                            log.type === 'voice' ? 'text-blue-400' : 'text-gray-400'
                        }`}>
                            {log.message}
                        </span>
                        {log.efficiency > 0 && (
                             <span className="text-emerald-600 ml-auto">+{log.efficiency.toFixed(1)}u</span>
                        )}
                    </div>
                ))}
                <div ref={logsEndRef} />
            </div>
        </div>

      </div>
    </div>
  );
};

export default NexusSimulation;