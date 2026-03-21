import React from 'react';
import { ModelConfig } from '../types';

interface ConfigPanelProps {
  config: ModelConfig;
  onConfigChange: (config: ModelConfig) => void;
}

export const ConfigPanel: React.FC<ConfigPanelProps> = ({ config, onConfigChange }) => {
  const handleChange = (key: keyof ModelConfig, value: any) => {
    onConfigChange({
      ...config,
      [key]: value,
    });
  };

  return (
    <div className="space-y-6 overflow-y-auto pr-2 h-full">
      {/* Header */}
      <div className="bg-slate-800/50 p-4 rounded border border-slate-700">
        <h2 className="text-lg font-mono font-bold text-cyan-400 mb-2">MODEL CONFIGURATION</h2>
        <p className="text-xs text-slate-400">Adjust TuckerV3 architecture parameters</p>
      </div>

      {/* Configuration Groups */}
      <div className="bg-slate-900 border border-slate-700 rounded p-4 space-y-4">
        {/* Dimensions */}
        <div>
          <label className="text-xs font-mono text-slate-400 uppercase tracking-wider">Model Dimension</label>
          <div className="mt-2 flex items-center space-x-2">
            <input
              type="range"
              min="128"
              max="2048"
              step="64"
              value={config.modelDim}
              onChange={(e) => handleChange('modelDim', parseInt(e.target.value))}
              className="flex-1 h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-cyan-500"
            />
            <span className="text-sm font-mono text-cyan-400 w-16 text-right">{config.modelDim}</span>
          </div>
        </div>

        {/* Depth */}
        <div>
          <label className="text-xs font-mono text-slate-400 uppercase tracking-wider">Network Depth (Blocks)</label>
          <div className="mt-2 flex items-center space-x-2">
            <input
              type="range"
              min="4"
              max="64"
              step="1"
              value={config.depth}
              onChange={(e) => handleChange('depth', parseInt(e.target.value))}
              className="flex-1 h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-cyan-500"
            />
            <span className="text-sm font-mono text-cyan-400 w-16 text-right">{config.depth}</span>
          </div>
        </div>

        {/* Attention Heads */}
        <div>
          <label className="text-xs font-mono text-slate-400 uppercase tracking-wider">Attention Heads</label>
          <div className="mt-2 flex items-center space-x-2">
            <input
              type="range"
              min="1"
              max="32"
              step="1"
              value={config.numHeads}
              onChange={(e) => handleChange('numHeads', parseInt(e.target.value))}
              className="flex-1 h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-cyan-500"
            />
            <span className="text-sm font-mono text-cyan-400 w-16 text-right">{config.numHeads}</span>
          </div>
        </div>

        {/* Vocabulary Size */}
        <div>
          <label className="text-xs font-mono text-slate-400 uppercase tracking-wider">Vocabulary Size</label>
          <div className="mt-2 flex items-center space-x-2">
            <input
              type="range"
              min="10000"
              max="100000"
              step="5000"
              value={config.vocabSize}
              onChange={(e) => handleChange('vocabSize', parseInt(e.target.value))}
              className="flex-1 h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-cyan-500"
            />
            <span className="text-sm font-mono text-cyan-400 w-20 text-right">{config.vocabSize.toLocaleString()}</span>
          </div>
        </div>
      </div>

      {/* Council Configuration */}
      <div className="bg-slate-900 border border-slate-700 rounded p-4 space-y-4">
        <div className="flex items-center justify-between">
          <label className="text-xs font-mono text-slate-400 uppercase tracking-wider">Tucker Council (MoE)</label>
          <button
            onClick={() => handleChange('useCouncil', !config.useCouncil)}
            className={`px-3 py-1 rounded text-xs font-mono transition-all ${
              config.useCouncil
                ? 'bg-amber-500/20 border border-amber-500 text-amber-400'
                : 'bg-slate-800 border border-slate-700 text-slate-400'
            }`}
          >
            {config.useCouncil ? 'ENABLED' : 'DISABLED'}
          </button>
        </div>

        {config.useCouncil && (
          <div>
            <label className="text-xs font-mono text-slate-400 uppercase tracking-wider">Number of Experts</label>
            <div className="mt-2 flex items-center space-x-2">
              <input
                type="range"
                min="2"
                max="16"
                step="1"
                value={config.numExperts}
                onChange={(e) => handleChange('numExperts', parseInt(e.target.value))}
                className="flex-1 h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-amber-500"
              />
              <span className="text-sm font-mono text-amber-400 w-16 text-right">{config.numExperts}</span>
            </div>
          </div>
        )}
      </div>

      {/* Configuration Summary */}
      <div className="bg-slate-800/30 p-3 rounded border border-slate-700">
        <div className="text-[10px] font-mono text-slate-400 space-y-1">
          <div>Total Parameters (est.): ~{((config.vocabSize * config.modelDim + config.depth * config.modelDim * config.modelDim) / 1e6).toFixed(1)}M</div>
          <div>Reversible: YES (O(1) activation memory)</div>
          <div>Council: {config.useCouncil ? `ENABLED (${config.numExperts} experts)` : 'DISABLED'}</div>
        </div>
      </div>
    </div>
  );
};