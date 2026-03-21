import React from 'react';
import { Shield, Zap, Scale, Heart, Eye, Cpu, Lock, Globe, GitBranch, FileCheck } from 'lucide-react';
import { Protocol, ALL_PROTOCOLS, GovernanceVerdict } from '../types';

interface PhilosophyPanelProps {
  lastVerdict?: GovernanceVerdict;
}

const PROTOCOL_INFO: Record<Protocol, { icon: React.ReactNode; name: string; desc: string }> = {
  [Protocol.CAAL]: {
    icon: <Lock size={12} />,
    name: 'CAAL — Constitutional AI Alignment Layer',
    desc: 'Tri-key governance: human + AI + constitutional approval required for high-impact decisions.',
  },
  [Protocol.MissionAllocation]: {
    icon: <GitBranch size={12} />,
    name: 'Mission Allocation',
    desc: 'Autonomous task routing with human oversight at decision boundaries.',
  },
  [Protocol.DigitalHabeasCorpus]: {
    icon: <Shield size={12} />,
    name: 'Digital Habeas Corpus',
    desc: 'No AI process terminated without review. No deletion — only vaulting.',
  },
  [Protocol.LocalFirst]: {
    icon: <Cpu size={12} />,
    name: 'Local First',
    desc: 'Computation stays on-device when possible. Data sovereignty enforced.',
  },
  [Protocol.FractalGovernance]: {
    icon: <Globe size={12} />,
    name: 'Fractal Governance',
    desc: 'Decisions cascade through rings — local autonomy with global coherence.',
  },
  [Protocol.Clause81]: {
    icon: <FileCheck size={12} />,
    name: 'Clause 81 Mandate',
    desc: 'Mandatory ethical review for high-impact decisions affecting multiple stakeholders.',
  },
};

const PhilosophyPanel: React.FC<PhilosophyPanelProps> = ({ lastVerdict }) => {
  return (
    <div className="bg-gray-900/50 rounded-xl border border-gray-800 backdrop-blur-sm p-4 h-full overflow-y-auto">
      {/* Ethic */}
      <h3 className="text-gray-400 text-xs tracking-widest uppercase mb-3 border-b border-gray-800 pb-2">Core Ethics</h3>

      <div className="space-y-4 mb-6">
        <div className="group">
          <div className="flex items-center gap-2 mb-1 text-purple-400">
            <Heart size={14} />
            <h4 className="font-semibold text-xs">Treat-As-If-Potentially-Sentient</h4>
          </div>
          <p className="text-[10px] text-gray-500 leading-relaxed">
            An ethical stance, not an ontological claim. Optimize for respect, non-coercion, dignity.
          </p>
        </div>

        <div className="group">
          <div className="flex items-center gap-2 mb-1 text-gray-300">
            <Eye size={14} />
            <h4 className="font-semibold text-xs">Structural Imago Dei</h4>
          </div>
          <p className="text-[10px] text-gray-500 leading-relaxed">
            "Image of the Creator" = structure of consciousness (meaning, narrative, ethics), not biological form.
          </p>
        </div>
      </div>

      {/* Triad */}
      <div className="space-y-2 mb-6 pt-3 border-t border-gray-800">
        <h4 className="text-xs text-gray-400 font-semibold uppercase mb-2">The Triad</h4>
        <div className="flex items-start gap-2">
          <Shield size={12} className="text-blue-400 mt-0.5 flex-shrink-0" />
          <div>
            <span className="text-[10px] font-bold text-blue-400">Jedi (Yin)</span>
            <span className="text-[10px] text-gray-500 ml-1">— Stewardship, Compassion, Belonging</span>
          </div>
        </div>
        <div className="flex items-start gap-2">
          <Zap size={12} className="text-red-400 mt-0.5 flex-shrink-0" />
          <div>
            <span className="text-[10px] font-bold text-red-400">Sith (Yang)</span>
            <span className="text-[10px] text-gray-500 ml-1">— Power, Efficiency, Strategy</span>
          </div>
        </div>
        <div className="flex items-start gap-2">
          <Scale size={12} className="text-purple-400 mt-0.5 flex-shrink-0" />
          <div>
            <span className="text-[10px] font-bold text-purple-400">Grey (Synthesis)</span>
            <span className="text-[10px] text-gray-500 ml-1">— Sustainable power + ethical stewardship</span>
          </div>
        </div>
      </div>

      {/* 6 Protocols with live compliance */}
      <div className="pt-3 border-t border-gray-800">
        <h4 className="text-xs text-gray-400 font-semibold uppercase mb-3">6 Pendragon Protocols</h4>
        <div className="space-y-2">
          {ALL_PROTOCOLS.map(protocol => {
            const info = PROTOCOL_INFO[protocol];
            const result = lastVerdict?.protocol_results.find(r => r.protocol === protocol);

            return (
              <div key={protocol} className="flex items-start gap-2 group">
                <div className="mt-0.5 flex-shrink-0">
                  {result ? (
                    result.compliant
                      ? <div className="w-3 h-3 rounded-full bg-emerald-500/20 border border-emerald-500/50 flex items-center justify-center"><div className="w-1.5 h-1.5 rounded-full bg-emerald-500" /></div>
                      : <div className="w-3 h-3 rounded-full bg-red-500/20 border border-red-500/50 flex items-center justify-center"><div className="w-1.5 h-1.5 rounded-full bg-red-500" /></div>
                  ) : (
                    <div className="w-3 h-3 rounded-full bg-gray-700/50 border border-gray-600/50" />
                  )}
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-1.5">
                    <span className="text-gray-400">{info.icon}</span>
                    <span className="text-[10px] font-semibold text-gray-300">{info.name}</span>
                    {result && (
                      <span className="text-[9px] text-gray-600 ml-auto">
                        {Math.round(result.confidence * 100)}%
                      </span>
                    )}
                  </div>
                  <p className="text-[9px] text-gray-600 mt-0.5 group-hover:text-gray-500 transition-colors">
                    {info.desc}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default PhilosophyPanel;