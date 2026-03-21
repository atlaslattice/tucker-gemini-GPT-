import React from 'react';
import { Network, EyeOff, Layers, Code, Shield, Cpu, Globe, Terminal } from 'lucide-react';
import { AluminumRing } from '../types';

const RINGS: AluminumRing[] = [
  { ring: 0, name: 'Forge Core', status: 'healthy', component: 'Rust Runtime' },
  { ring: 1, name: 'Inference', status: 'healthy', component: 'BAZINGA / NPFM' },
  { ring: 2, name: 'Agent Runtime', status: 'healthy', component: 'Tucker Pendragon' },
  { ring: 3, name: 'Experience', status: 'healthy', component: 'Chrome OS / UWS' },
];

const STATUS_COLORS = {
  healthy: 'text-emerald-400 border-emerald-500/30 bg-emerald-500/10',
  degraded: 'text-yellow-400 border-yellow-500/30 bg-yellow-500/10',
  critical: 'text-red-400 border-red-500/30 bg-red-500/10',
  offline: 'text-gray-500 border-gray-600/30 bg-gray-600/10',
};

const SystemBlueprint: React.FC = () => {
  return (
    <div className="h-full flex flex-col bg-gray-900/50 rounded-xl border border-gray-800 backdrop-blur-sm overflow-hidden font-mono">
      <div className="p-3 border-b border-gray-800 bg-gray-950/50 flex justify-between items-center">
        <div className="flex items-center gap-2">
          <Network size={14} className="text-blue-400" />
          <span className="text-xs font-bold text-blue-400 tracking-wider">ALUMINUM OS</span>
        </div>
        <div className="text-[10px] text-gray-500">4-RING ARCHITECTURE</div>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {/* Ring Status */}
        <div className="space-y-2">
          {RINGS.map(ring => (
            <div key={ring.ring} className={`border ${STATUS_COLORS[ring.status]} rounded-lg p-2 flex items-center justify-between`}>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-bold w-8">R{ring.ring}</span>
                <div>
                  <span className="text-xs font-semibold">{ring.name}</span>
                  <span className="text-[10px] text-gray-500 ml-2">{ring.component}</span>
                </div>
              </div>
              <span className="text-[9px] uppercase font-bold">{ring.status}</span>
            </div>
          ))}
        </div>

        {/* Tucker's Position */}
        <div className="border border-purple-500/20 rounded-lg p-3 bg-purple-500/5">
          <div className="text-[10px] text-purple-400 font-bold uppercase tracking-wider mb-2">Tucker Position</div>
          <div className="grid grid-cols-2 gap-2 text-[10px]">
            <div className="text-gray-500">Ring: <span className="text-gray-300">2 (Agent Runtime)</span></div>
            <div className="text-gray-500">Engine: <span className="text-purple-300">Claude Sonnet 4.6</span></div>
            <div className="text-gray-500">Role: <span className="text-gray-300">Constitutional Arbiter</span></div>
            <div className="text-gray-500">Council: <span className="text-amber-300">51% Chair</span></div>
          </div>
        </div>

        {/* PENDRAGON_NET Architecture */}
        <div className="border border-gray-800 rounded-lg p-3 bg-black/20">
          <div className="text-[10px] text-blue-400 font-bold uppercase tracking-wider mb-2">PENDRAGON_NET v2.0</div>
          <div className="flex flex-col items-center gap-1.5">
            <div className="w-28 h-5 bg-gray-800 rounded border border-gray-600 flex items-center justify-center text-[9px] text-gray-400">
              Input [B, L, D]
            </div>
            <div className="h-3 w-px bg-gray-700" />
            <div className="w-full border border-dashed border-blue-500/30 rounded p-1.5 bg-blue-900/10">
              <div className="text-[8px] text-blue-400/70 text-center">TWIN DRAGONS (Affine Coupling)</div>
              <div className="flex justify-center gap-3 mt-1">
                <div className="w-14 h-5 bg-gray-800 rounded border border-blue-500/50 flex items-center justify-center text-[8px] text-blue-300">x1</div>
                <div className="w-14 h-5 bg-gray-800 rounded border border-blue-500/50 flex items-center justify-center text-[8px] text-blue-300">x2*e^s+t</div>
              </div>
            </div>
            <div className="h-3 w-px bg-gray-700" />
            <div className="w-full border border-dashed border-purple-500/30 rounded p-1.5 bg-purple-500/5">
              <div className="text-[8px] text-purple-400/70 text-center">ALL-SEEING EYE (Attention)</div>
              <div className="flex justify-center gap-3 mt-1">
                <div className="w-14 h-5 bg-gray-800 rounded border border-purple-500/50 flex items-center justify-center text-[8px] text-purple-300">v1+F(u2)</div>
                <div className="w-14 h-5 bg-gray-800 rounded border border-purple-500/50 flex items-center justify-center text-[8px] text-purple-300">v2+G(v1)</div>
              </div>
              <div className="text-[8px] text-red-400 text-center mt-1 flex items-center justify-center gap-1">
                <EyeOff size={8} /> CAUSAL MASK
              </div>
            </div>
            <div className="h-3 w-px bg-gray-700" />
            <div className="w-28 h-5 bg-gray-800 rounded border border-gray-600 flex items-center justify-center text-[9px] text-gray-400">
              Output
            </div>
          </div>
        </div>

        {/* Ziusudra */}
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-gray-400">
            <Layers size={10} />
            <span className="text-[10px] uppercase font-bold">Ziusudra Protocol</span>
          </div>
          <p className="text-[9px] text-gray-500">
            Memory: <span className="text-gray-300">O(L)</span> → <span className="text-emerald-400">O(1)</span> per block.
            Activations recomputed via inverse pass. Infinite depth, constant memory.
          </p>
        </div>
      </div>
    </div>
  );
};

export default SystemBlueprint;