import React from 'react';
import { Terminal, Cpu, BarChart3, Settings } from 'lucide-react';
import { ViewMode } from '../types';

interface SidebarProps {
  currentView: ViewMode;
  onViewChange: (view: ViewMode) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ currentView, onViewChange }) => {
  const navItems = [
    { mode: ViewMode.TERMINAL, icon: Terminal, label: 'Terminal', tooltip: 'Chat Interface' },
    { mode: ViewMode.ARCHITECTURE, icon: Cpu, label: 'Architecture', tooltip: 'Model Architecture' },
    { mode: ViewMode.MONITOR, icon: BarChart3, label: 'Metrics', tooltip: 'System Metrics' },
    { mode: ViewMode.CONFIG, icon: Settings, label: 'Config', tooltip: 'Model Configuration' },
  ];

  return (
    <div className="w-20 bg-slate-900 border-r border-slate-700 flex flex-col items-center py-4 space-y-2 h-full">
      {/* Logo/Title */}
      <div className="w-12 h-12 rounded border-2 border-cyan-500 flex items-center justify-center mb-6 hover:bg-cyan-500/10 transition-colors">
        <span className="text-xs font-mono font-bold text-cyan-400">TV3</span>
      </div>

      {/* Navigation Items */}
      <div className="flex-1 flex flex-col space-y-2 w-full">
        {navItems.map(({ mode, icon: Icon, label, tooltip }) => (
          <button
            key={mode}
            onClick={() => onViewChange(mode)}
            title={tooltip}
            className={`w-14 h-14 mx-auto rounded flex items-center justify-center transition-all group relative ${
              currentView === mode
                ? 'bg-cyan-500/20 border border-cyan-500 text-cyan-400'
                : 'text-slate-400 hover:text-cyan-400 hover:bg-slate-800/50 border border-transparent'
            }`}
          >
            <Icon size={20} />
            {/* Tooltip */}
            <div className="absolute left-20 bg-slate-950 border border-slate-700 rounded px-3 py-1 text-xs font-mono text-cyan-400 whitespace-nowrap opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity z-10">
              {tooltip}
            </div>
          </button>
        ))}
      </div>

      {/* Status Indicator */}
      <div className="w-12 h-12 rounded border border-slate-700 flex items-center justify-center bg-slate-800/50 mt-auto">
        <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
      </div>
    </div>
  );
};