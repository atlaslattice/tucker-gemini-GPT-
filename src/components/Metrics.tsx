import React from 'react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  AreaChart,
  Area
} from 'recharts';
import { Activity, Database, Zap } from 'lucide-react';
import { SystemMetrics } from '../types';

interface MetricsProps {
    metrics: SystemMetrics;
}

const mockData = Array.from({ length: 20 }, (_, i) => ({
  time: i,
  loss: Math.exp(-i * 0.1) + Math.random() * 0.05,
  memory: 40 + Math.random() * 10,
  throughput: 80 + Math.random() * 20,
}));

export const Metrics: React.FC<MetricsProps> = ({ metrics }) => {
  return (
    <div className="grid grid-cols-1 gap-4 h-full overflow-y-auto pr-2">
      {/* Live Status Cards */}
      <div className="grid grid-cols-3 gap-2">
        <div className="bg-slate-800/50 p-3 rounded border border-slate-700 flex flex-col items-center justify-center">
            <span className="text-xs text-slate-400 mb-1 flex items-center"><Database size={12} className="mr-1"/> MEMORY</span>
            <span className="text-xl font-mono font-bold text-cyan-400">{metrics.memoryUsage.toFixed(1)}%</span>
            <span className="text-[10px] text-green-400">O(1) OPTIMIZED</span>
        </div>
        <div className="bg-slate-800/50 p-3 rounded border border-slate-700 flex flex-col items-center justify-center">
            <span className="text-xs text-slate-400 mb-1 flex items-center"><Zap size={12} className="mr-1"/> COMPUTE</span>
            <span className="text-xl font-mono font-bold text-purple-400">{metrics.computeLoad.toFixed(1)}%</span>
        </div>
        <div className="bg-slate-800/50 p-3 rounded border border-slate-700 flex flex-col items-center justify-center">
            <span className="text-xs text-slate-400 mb-1 flex items-center"><Activity size={12} className="mr-1"/> SAVED</span>
            <span className="text-xl font-mono font-bold text-emerald-400">{metrics.reversibleCache} MB</span>
        </div>
      </div>

      {/* Charts */}
      <div className="bg-slate-900 border border-slate-700 rounded p-4">
        <h3 className="text-xs font-mono text-slate-400 mb-4 uppercase tracking-wider">Training Loss (Ziusudra Estimate)</h3>
        <div className="h-40">
            <ResponsiveContainer width="100%" height="100%">
            <LineChart data={mockData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                <XAxis dataKey="time" hide />
                <YAxis stroke="#475569" fontSize={10} domain={[0, 1.5]} />
                <Tooltip 
                    contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', fontSize: '12px' }} 
                    itemStyle={{ color: '#bae6fd' }}
                />
                <Line 
                    type="monotone" 
                    dataKey="loss" 
                    stroke="#06b6d4" 
                    strokeWidth={2} 
                    dot={false}
                    isAnimationActive={true}
                />
            </LineChart>
            </ResponsiveContainer>
        </div>
      </div>

      <div className="bg-slate-900 border border-slate-700 rounded p-4">
        <h3 className="text-xs font-mono text-slate-400 mb-4 uppercase tracking-wider">Throughput (Tokens/sec)</h3>
        <div className="h-40">
            <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={mockData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                <XAxis dataKey="time" hide />
                <YAxis stroke="#475569" fontSize={10} />
                <Tooltip 
                    contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', fontSize: '12px' }} 
                    itemStyle={{ color: '#d8b4fe' }}
                />
                <Area 
                    type="monotone" 
                    dataKey="throughput" 
                    stroke="#a855f7" 
                    fill="#a855f7" 
                    fillOpacity={0.1}
                    isAnimationActive={true}
                />
            </AreaChart>
            </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};