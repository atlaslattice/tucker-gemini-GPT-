import React from 'react';
import { Server, Zap, Layers } from 'lucide-react';
import { ModelConfig } from '../types';

interface ArchitectureProps {
  config: ModelConfig;
}

export const Architecture: React.FC<ArchitectureProps> = ({ config }) => {
  return (
    <div className="space-y-6 overflow-y-auto pr-2 h-full">
      {/* Header */}
      <div className="bg-slate-800/50 p-4 rounded border border-slate-700">
        <h2 className="text-lg font-mono font-bold text-cyan-400 mb-2">PENDRAGON ARCHITECTURE</h2>
        <p className="text-xs text-slate-400">Fully reversible GPT with O(1) memory via Ziusudra Protocol</p>
      </div>

      {/* Architecture Flow Diagram */}
      <div className="bg-slate-900 border border-slate-700 rounded p-4">
        <h3 className="text-xs font-mono text-slate-400 mb-4 uppercase tracking-wider">System Flow</h3>
        
        {/* Token Embedding */}
        <div className="mb-4">
          <div className="bg-slate-800/70 p-3 rounded border-l-2 border-cyan-500 mb-2">
            <div className="text-xs font-mono text-cyan-400 font-bold">INPUT TOKENS</div>
            <div className="text-[10px] text-slate-300 mt-1">vocab_size={config.vocabSize} → embedding_dim={config.modelDim}</div>
          </div>
          <div className="text-center text-slate-500 text-xs mb-2">↓</div>
        </div>

        {/* Pendragon Spine */}
        <div className="mb-4">
          <div className="bg-gradient-to-r from-purple-900/40 to-cyan-900/40 p-3 rounded border border-purple-700/50 mb-2">
            <div className="text-xs font-mono text-purple-400 font-bold flex items-center">
              <Layers size={14} className="mr-2" />
              PENDRAGON SPINE
            </div>
            <div className="text-[10px] text-slate-300 mt-1">
              {config.depth} reversible blocks
            </div>
            <div className="text-[10px] text-slate-400 mt-1 font-mono">
              ├─ Affine Coupling (invertible)
              <br />
              └─ Reversible Attention ({config.numHeads} heads)
            </div>
          </div>
          <div className="text-center text-slate-500 text-xs mb-2">↓</div>
        </div>

        {/* Optional Tucker Council */}
        {config.useCouncil && (
          <div className="mb-4">
            <div className="bg-slate-800/70 p-3 rounded border-l-2 border-amber-500 mb-2">
              <div className="text-xs font-mono text-amber-400 font-bold flex items-center">
                <Zap size={14} className="mr-2" />
                TUCKER COUNCIL
              </div>
              <div className="text-[10px] text-slate-300 mt-1">{config.numExperts} expert modules (MoE)</div>
            </div>
            <div className="text-center text-slate-500 text-xs mb-2">↓</div>
          </div>
        )}

        {/* LM Head */}
        <div>
          <div className="bg-slate-800/70 p-3 rounded border-l-2 border-emerald-500">
            <div className="text-xs font-mono text-emerald-400 font-bold">OUTPUT PROJECTION</div>
            <div className="text-[10px] text-slate-300 mt-1">hidden_dim={config.modelDim} → vocab_size={config.vocabSize}</div>
          </div>
        </div>
      </div>

      {/* Memory Profile */}
      <div className="bg-slate-900 border border-slate-700 rounded p-4">
        <h3 className="text-xs font-mono text-slate-400 mb-4 uppercase tracking-wider">Memory Characteristics</h3>
        <div className="grid grid-cols-2 gap-3">
          <div className="bg-slate-800/50 p-2 rounded border border-slate-700">
            <div className="text-[10px] text-slate-400">Activation Memory</div>
            <div className="text-sm font-mono text-green-400 font-bold">O(1)</div>
          </div>
          <div className="bg-slate-800/50 p-2 rounded border border-slate-700">
            <div className="text-[10px] text-slate-400">Gradient Recompute</div>
            <div className="text-sm font-mono text-cyan-400 font-bold">Ziusudra</div>
          </div>
        </div>
      </div>

      {/* Configuration Summary */}
      <div className="bg-slate-900 border border-slate-700 rounded p-4">
        <h3 className="text-xs font-mono text-slate-400 mb-4 uppercase tracking-wider">Current Configuration</h3>
        <div className="space-y-2 text-[10px] font-mono">
          <div className="flex justify-between">
            <span className="text-slate-400">Model Dimension:</span>
            <span className="text-cyan-400">{config.modelDim}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-400">Attention Heads:</span>
            <span className="text-cyan-400">{config.numHeads}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-400">Depth (Blocks):</span>
            <span className="text-cyan-400">{config.depth}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-400">Vocabulary Size:</span>
            <span className="text-cyan-400">{config.vocabSize.toLocaleString()}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-400">Council Active:</span>
            <span className={config.useCouncil ? 'text-amber-400' : 'text-red-400'}>
              {config.useCouncil ? 'YES' : 'NO'}
            </span>
          </div>
          {config.useCouncil && (
            <div className="flex justify-between">
              <span className="text-slate-400">Expert Modules:</span>
              <span className="text-amber-400">{config.numExperts}</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};