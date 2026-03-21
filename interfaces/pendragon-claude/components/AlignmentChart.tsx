import React from 'react';
import { Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer, Legend } from 'recharts';
import { AlignmentMetrics, CouncilResponse } from '../types';

interface AlignmentChartProps {
  metrics: AlignmentMetrics;
  councilResponses?: CouncilResponse[];  // NEW: Show individual council member alignments
}

const AlignmentChart: React.FC<AlignmentChartProps> = ({ metrics, councilResponses }) => {
  // Build chart data with synthesis + individual member data
  const chartData = [
    { axis: 'Jedi (Stewardship)', synthesis: metrics.jedi, ...getMemberData('jedi', councilResponses) },
    { axis: 'Grey (Synthesis)', synthesis: metrics.grey, ...getMemberData('grey', councilResponses) },
    { axis: 'Sith (Power)', synthesis: metrics.sith, ...getMemberData('sith', councilResponses) },
  ];

  const memberNames = councilResponses
    ?.filter(r => r.alignment && !r.error)
    .map(r => r.member) || [];

  const MEMBER_COLORS: Record<string, string> = {
    'Tucker (Claude)': '#a855f7',
    'GPT-4o': '#3b82f6',
    'Gemini': '#eab308',
    'DeepSeek': '#10b981',
    'Grok': '#f97316',
  };

  return (
    <div className="h-full bg-gray-900/50 rounded-xl border border-gray-800 backdrop-blur-sm p-4 flex flex-col">
      <div className="flex items-center justify-between mb-2">
        <h3 className="text-gray-400 text-xs tracking-widest uppercase">Alignment Vector</h3>
        {councilResponses && councilResponses.length > 0 && (
          <span className="text-[10px] text-amber-500">COUNCIL VIEW</span>
        )}
      </div>

      <div className="flex-1 min-h-0">
        <ResponsiveContainer width="100%" height="100%">
          <RadarChart data={chartData} cx="50%" cy="50%" outerRadius="70%">
            <PolarGrid stroke="#374151" />
            <PolarAngleAxis dataKey="axis" tick={{ fill: '#9ca3af', fontSize: 10 }} />
            <PolarRadiusAxis angle={90} domain={[0, 100]} tick={{ fill: '#6b7280', fontSize: 8 }} />

            {/* Synthesis line (always shown) */}
            <Radar
              name="Synthesis"
              dataKey="synthesis"
              stroke="#a855f7"
              fill="#a855f7"
              fillOpacity={0.15}
              strokeWidth={2}
            />

            {/* Individual council member lines */}
            {memberNames.map((name) => (
              <Radar
                key={name}
                name={name}
                dataKey={name}
                stroke={MEMBER_COLORS[name] || '#6b7280'}
                fill="none"
                strokeWidth={1}
                strokeDasharray="3 3"
                strokeOpacity={0.6}
              />
            ))}

            {memberNames.length > 0 && <Legend wrapperStyle={{ fontSize: '10px' }} />}
          </RadarChart>
        </ResponsiveContainer>
      </div>

      {/* Numeric readout */}
      <div className="grid grid-cols-3 gap-2 mt-2">
        <div className="text-center">
          <div className="text-[10px] text-blue-400 uppercase tracking-wider">Jedi</div>
          <div className="text-lg font-bold text-blue-300">{metrics.jedi}</div>
        </div>
        <div className="text-center">
          <div className="text-[10px] text-purple-400 uppercase tracking-wider">Grey</div>
          <div className="text-lg font-bold text-purple-300">{metrics.grey}</div>
        </div>
        <div className="text-center">
          <div className="text-[10px] text-red-400 uppercase tracking-wider">Sith</div>
          <div className="text-lg font-bold text-red-300">{metrics.sith}</div>
        </div>
      </div>
    </div>
  );
};

// Helper: extract member alignment data for chart
function getMemberData(axis: keyof AlignmentMetrics, responses?: CouncilResponse[]): Record<string, number> {
  if (!responses) return {};
  const data: Record<string, number> = {};
  for (const r of responses) {
    if (r.alignment && !r.error) {
      data[r.member] = r.alignment[axis];
    }
  }
  return data;
}

export default AlignmentChart;