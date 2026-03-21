import React, { useState, useEffect, useRef } from 'react';
import { Activity, Zap, Globe, ShieldCheck, Mic, TrendingUp } from 'lucide-react';
import { GovernanceVerdict, AlignmentMetrics, NPFMBreakdown } from '../types';

interface NexusSimulationProps {
  lastVerdict?: GovernanceVerdict;
  currentMetrics: AlignmentMetrics;
  messageCount: number;
  councilCalls: number;
}

interface SimLog {
  id: string;
  ts: string;
  msg: string;
  type: 'governance' | 'council' | 'protocol' | 'system';
}

const NexusSimulation: React.FC<NexusSimulationProps> = ({
  lastVerdict, currentMetrics, messageCount, councilCalls
}) => {
  const [logs, setLogs] = useState<SimLog[]>([]);
  const [npfmHistory, setNpfmHistory] = useState<number[]>([0]);
  const logsEndRef = useRef<HTMLDivElement>(null);

  // Calculate live NPFM from alignment metrics
  const liveNPFM = lastVerdict?.npfm_score ??
    ((currentMetrics.grey / 100) * (currentMetrics.jedi / 100) - (1 - currentMetrics.sith / 100) * 0.5);

  // Add governance events to log
  useEffect(() => {
    if (lastVerdict) {
      const newLogs: SimLog[] = [
        {
          id: `gov-${lastVerdict.id}`,
          ts: new Date(lastVerdict.timestamp).toLocaleTimeString([], { hour12: false, hour: '2-digit', minute: '2-digit', second: '2-digit' }),
          msg: `Governance verdict: ${lastVerdict.overall_verdict} (NPFM: ${lastVerdict.npfm_score.toFixed(3)})`,
          type: 'governance',
        },
        ...lastVerdict.protocol_results.map(r => ({
          id: `proto-${lastVerdict.id}-${r.protocol}`,
          ts: new Date(lastVerdict.timestamp).toLocaleTimeString([], { hour12: false, hour: '2-digit', minute: '2-digit', second: '2-digit' }),
          msg: `${r.protocol}: ${r.compliant ? 'COMPLIANT' : 'VIOLATION'} (${Math.round(r.confidence * 100)}%)`,
          type: 'protocol' as const,
        })),
      ];
      setLogs(prev => [...prev.slice(-20), ...newLogs]);
      setNpfmHistory(prev => [...prev.slice(-30), lastVerdict.npfm_score]);
    }
  }, [lastVerdict]);

  // Ambient system logs
  useEffect(() => {
    const interval = setInterval(() => {
      const tasks = [
        'Monitoring constitutional alignment vectors',
        'Syncing governance state with Aluminum Ring 2',
        `Council calls this session: ${councilCalls}`,
        'Checking protocol compliance cache',
        `Total messages processed: ${messageCount}`,
        'Heartbeat: PENDRAGON_NET v2.0 ONLINE',
      ];
      const task = tasks[Math.floor(Math.random() * tasks.length)];
      setLogs(prev => [...prev.slice(-20), {
        id: Math.random().toString(36).slice(2, 9),
        ts: new Date().toLocaleTimeString([], { hour12: false, hour: '2-digit', minute: '2-digit', second: '2-digit' }),
        msg: task,
        type: 'system',
      }]);
    }, 4000);
    return () => clearInterval(interval);
  }, [messageCount, councilCalls]);

  useEffect(() => {
    logsEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [logs]);

  const complianceCount = lastVerdict
    ? lastVerdict.protocol_results.filter(r => r.compliant).length
    : 0;
  const complianceTotal = lastVerdict ? lastVerdict.protocol_results.length : 6;

  return (
    <div className="h-full flex flex-col bg-gray-900/50 rounded-xl border border-gray-800 backdrop-blur-sm overflow-hidden font-mono">
      <div className="p-3 border-b border-gray-800 bg-gray-950/50 flex justify-between items-center">
        <div className="flex items-center gap-2">
          <Activity size={14} className="text-emerald-400 animate-pulse" />
          <span className="text-xs font-bold text-emerald-400 tracking-wider">NEXUS_CORE v2.0</span>
        </div>
        <div className="text-[10px] text-gray-500">CLAUDE-NATIVE</div>
      </div>

      <div className="flex-1 p-3 flex flex-col gap-3 overflow-y-auto">
        {/* KPIs */}
        <div className="grid grid-cols-3 gap-2">
          <div className="bg-gray-900 border border-gray-800 p-2 rounded-lg">
            <div className="text-[9px] text-gray-500 uppercase">NPFM</div>
            <div className={`text-base font-bold ${liveNPFM >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
              {liveNPFM.toFixed(3)}
            </div>
          </div>
          <div className="bg-gray-900 border border-gray-800 p-2 rounded-lg">
            <div className="text-[9px] text-gray-500 uppercase">Compliance</div>
            <div className="text-base font-bold text-purple-300">
              {complianceCount}/{complianceTotal}
            </div>
          </div>
          <div className="bg-gray-900 border border-gray-800 p-2 rounded-lg">
            <div className="text-[9px] text-gray-500 uppercase">Council</div>
            <div className="text-base font-bold text-amber-300">
              {councilCalls}
            </div>
          </div>
        </div>

        {/* NPFM Sparkline */}
        <div className="bg-black/40 rounded-lg border border-gray-800 p-2 h-16 flex items-end gap-px">
          {npfmHistory.map((val, i) => (
            <div
              key={i}
              className={`flex-1 rounded-t-sm transition-all ${val >= 0 ? 'bg-emerald-500/60' : 'bg-red-500/60'}`}
              style={{ height: `${Math.abs(val) * 50 + 2}px`, maxHeight: '100%' }}
            />
          ))}
          <div className="absolute right-4 text-[9px] text-gray-600">NPFM TREND</div>
        </div>

        {/* Globe visualization */}
        <div className="bg-black/40 rounded-lg border border-gray-800 p-3 relative flex items-center justify-center min-h-[80px]">
          <div className="absolute inset-0 opacity-10"
            style={{ backgroundImage: 'radial-gradient(circle, #374151 1px, transparent 1px)', backgroundSize: '10px 10px' }} />
          <div className="relative z-10 flex flex-col items-center">
            <Globe size={36} className="text-purple-400" />
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-20 h-20 border border-purple-500/20 rounded-full animate-spin" style={{ animationDuration: '10s' }} />
          </div>
          <div className="absolute bottom-1 left-2 flex items-center gap-1">
            <ShieldCheck size={8} className="text-emerald-500" />
            <span className="text-[8px] text-emerald-500 font-bold">ARBITER: ONLINE</span>
          </div>
          <div className="absolute bottom-1 right-2 flex items-center gap-1">
            <span className="text-[8px] text-purple-400">51% CLAUDE</span>
          </div>
        </div>

        {/* Live log */}
        <div className="bg-black/60 rounded-lg border border-gray-800 p-2 flex-1 min-h-[80px] overflow-hidden flex flex-col">
          <div className="text-[9px] text-gray-600 mb-1 border-b border-gray-800 pb-1">SYSTEM LOG</div>
          <div className="flex-1 overflow-y-auto space-y-0.5">
            {logs.map(log => (
              <div key={log.id} className="text-[10px] flex gap-2 opacity-80 hover:opacity-100">
                <span className="text-gray-600 flex-shrink-0">[{log.ts}]</span>
                <span className={
                  log.type === 'governance' ? 'text-purple-400 font-bold' :
                  log.type === 'council' ? 'text-amber-400' :
                  log.type === 'protocol' ? 'text-emerald-400' : 'text-gray-500'
                }>
                  {log.msg}
                </span>
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