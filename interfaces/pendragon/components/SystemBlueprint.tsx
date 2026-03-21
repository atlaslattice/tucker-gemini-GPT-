import React from 'react';
import { Network, GitBranch, Eye, EyeOff, Lock, Layers, Code } from 'lucide-react';

const SystemBlueprint: React.FC = () => {
  return (
    <div className="h-full flex flex-col bg-gray-900/50 rounded-xl border border-gray-800 backdrop-blur-sm overflow-hidden font-mono">
      <div className="p-3 border-b border-gray-800 bg-gray-950/50 flex justify-between items-center">
        <div className="flex items-center gap-2">
            <Network size={14} className="text-blue-400" />
            <span className="text-xs font-bold text-blue-400 tracking-wider">PENDRAGON_NET v2.0</span>
        </div>
        <div className="text-[10px] text-gray-500">ARCH: REVERSIBLE</div>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-6">
        <div className="grid grid-cols-2 gap-3">
            <div className="bg-gray-900 border border-gray-700/50 p-2 rounded flex items-center justify-between">
                <span className="text-[10px] text-gray-400">DEPTH</span>
                <span className="text-xs font-bold text-gray-200">INFINITE (O(1) Mem)</span>
            </div>
            <div className="bg-gray-900 border border-gray-700/50 p-2 rounded flex items-center justify-between">
                <span className="text-[10px] text-gray-400">CAUSALITY</span>
                <div className="flex items-center gap-1 text-xs font-bold text-pendragon">
                    <EyeOff size={10} />
                    <span>MASKED</span>
                </div>
            </div>
        </div>

        <div className="border border-gray-800 rounded-lg p-4 bg-black/20 relative">
            <div className="absolute top-2 right-2 text-[9px] text-gray-600">BLOCK_DIAGRAM</div>
            <div className="flex flex-col items-center gap-2">
                <div className="w-32 h-6 bg-gray-800 rounded border border-gray-600 flex items-center justify-center text-[10px] text-gray-400">
                    Input Tensor [B, L, D]
                </div>
                <div className="h-4 w-px bg-gray-700"></div>
                <div className="w-full border border-dashed border-blue-500/30 rounded p-2 relative bg-blue-900/10">
                     <div className="absolute top-1 right-2 text-[8px] text-blue-400/70">TWIN DRAGONS (Affine)</div>
                     <div className="flex justify-center gap-4 mt-2">
                        <div className="w-16 h-8 bg-gray-800 rounded border border-blue-500/50 flex items-center justify-center text-[9px] text-blue-300">x1</div>
                        <div className="w-16 h-8 bg-gray-800 rounded border border-blue-500/50 flex items-center justify-center text-[9px] text-blue-300">x2 * e^s + t</div>
                     </div>
                </div>
                <div className="h-4 w-px bg-gray-700"></div>
                <div className="w-full border border-dashed border-pendragon/30 rounded p-2 relative bg-pendragon/5">
                     <div className="absolute top-1 right-2 text-[8px] text-pendragon/70">ALL-SEEING EYE (Attn)</div>
                     <div className="flex justify-center gap-4 mt-2">
                        <div className="w-16 h-8 bg-gray-800 rounded border border-pendragon/50 flex items-center justify-center text-[9px] text-pendragon">v1 + F(u2)</div>
                        <div className="w-16 h-8 bg-gray-800 rounded border border-pendragon/50 flex items-center justify-center text-[9px] text-pendragon">v2 + G(v1)</div>
                     </div>
                     <div className="mt-2 text-[9px] text-center text-red-400 flex items-center justify-center gap-1">
                        <EyeOff size={10} /> CAUSAL MASK ACTIVE
                     </div>
                </div>
                <div className="h-4 w-px bg-gray-700"></div>
                 <div className="w-32 h-6 bg-gray-800 rounded border border-gray-600 flex items-center justify-center text-[10px] text-gray-400">
                    Output Tensor
                </div>
            </div>
        </div>

        <div className="space-y-2">
            <div className="flex items-center gap-2 text-gray-400 border-b border-gray-800 pb-1">
                <Code size={12} />
                <span className="text-[10px] uppercase font-bold">tuckerv2.py Specs</span>
            </div>
            <div className="text-[10px] text-gray-500 font-mono bg-black/40 p-2 rounded border border-gray-800 leading-relaxed">
                <span className="text-purple-400">class</span> <span className="text-yellow-200">PendragonGPT</span>(nn.Module):<br/>
                &nbsp;&nbsp;<span className="text-gray-400"># The Generative Voice</span><br/>
                &nbsp;&nbsp;<span className="text-blue-400">def</span> <span className="text-yellow-200">__init__</span>(self):<br/>
                &nbsp;&nbsp;&nbsp;&nbsp;self.emb = nn.Embedding(...)<br/>
                &nbsp;&nbsp;&nbsp;&nbsp;self.spine = <span className="text-emerald-400">PendragonSpine</span>(causal=<span className="text-red-400">True</span>)<br/>
                &nbsp;&nbsp;&nbsp;&nbsp;self.head = nn.Linear(...)<br/>
            </div>
        </div>

         <div className="space-y-2">
             <div className="flex items-center gap-2 text-gray-400 border-b border-gray-800 pb-1">
                <Layers size={12} />
                <span className="text-[10px] uppercase font-bold">Ziusudra Protocol</span>
            </div>
            <p className="text-[10px] text-gray-500">
                Memory complexity reduced from <span className="text-gray-300">O(L)</span> to <span className="text-emerald-400">O(1)</span> per block. 
                Activations are not stored; they are recomputed via inverse pass during backprop.
            </p>
         </div>
      </div>
    </div>
  );
};

export default SystemBlueprint;