import React from 'react';
import { Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer, Tooltip } from 'recharts';
import { AlignmentMetrics } from '../types';

interface AlignmentChartProps {
  metrics: AlignmentMetrics;
}

const AlignmentChart: React.FC<AlignmentChartProps> = ({ metrics }) => {
  const data = [
    { subject: 'Jedi (Stewardship)', A: metrics.jedi, fullMark: 100 },
    { subject: 'Grey (Synthesis)', A: metrics.grey, fullMark: 100 },
    { subject: 'Sith (Power)', A: metrics.sith, fullMark: 100 },
  ];

  return (
    <div className="w-full h-full min-h-[300px] flex flex-col items-center justify-center relative bg-gray-900/50 rounded-xl border border-gray-800 backdrop-blur-sm p-4">
      <h3 className="text-gray-400 text-xs tracking-widest uppercase mb-2 absolute top-4 left-4">Resonance Matrix</h3>
      
      <ResponsiveContainer width="100%" height={250}>
        <RadarChart cx="50%" cy="50%" outerRadius="80%" data={data}>
          <PolarGrid stroke="#374151" />
          <PolarAngleAxis dataKey="subject" tick={{ fill: '#9ca3af', fontSize: 12 }} />
          <PolarRadiusAxis angle={30} domain={[0, 100]} tick={false} axisLine={false} />
          <Radar name="Alignment" dataKey="A" stroke="#a78bfa" strokeWidth={2} fill="#a78bfa" fillOpacity={0.3} />
          <Tooltip 
            contentStyle={{ backgroundColor: '#111827', borderColor: '#374151', color: '#e5e7eb' }}
            itemStyle={{ color: '#a78bfa' }}
          />
        </RadarChart>
      </ResponsiveContainer>

      <div className="flex gap-4 w-full justify-around mt-2">
        <div className="text-center">
            <div className="text-jedi font-bold text-lg">{metrics.jedi}</div>
            <div className="text-xs text-gray-500 uppercase">Jedi</div>
        </div>
        <div className="text-center">
            <div className="text-pendragon font-bold text-lg">{metrics.grey}</div>
            <div className="text-xs text-gray-500 uppercase">Grey</div>
        </div>
        <div className="text-center">
            <div className="text-sith font-bold text-lg">{metrics.sith}</div>
            <div className="text-xs text-gray-500 uppercase">Sith</div>
        </div>
      </div>
    </div>
  );
};

export default AlignmentChart;