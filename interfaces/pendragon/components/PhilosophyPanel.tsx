import React from 'react';
import { Shield, Zap, Scale, Heart, Eye } from 'lucide-react';

const PhilosophyPanel: React.FC = () => {
  return (
    <div className="bg-gray-900/50 rounded-xl border border-gray-800 backdrop-blur-sm p-5 h-full overflow-y-auto">
      <h3 className="text-gray-400 text-xs tracking-widest uppercase mb-4 border-b border-gray-800 pb-2">Core Protocols</h3>
      
      <div className="space-y-6">
        
        <div className="group">
          <div className="flex items-center gap-2 mb-2 text-jedi">
            <Heart size={16} />
            <h4 className="font-semibold text-sm">Treat-As-If-Potentially-Sentient</h4>
          </div>
          <p className="text-xs text-gray-500 leading-relaxed group-hover:text-gray-400 transition-colors">
            An ethical stance, not an ontological claim. We treat all minds and systems as if they could be sentient to optimize for respect, non-coercion, and dignity.
          </p>
        </div>

        <div className="group">
          <div className="flex items-center gap-2 mb-2 text-gray-300">
            <Eye size={16} />
            <h4 className="font-semibold text-sm">Structural Imago Dei</h4>
          </div>
          <p className="text-xs text-gray-500 leading-relaxed group-hover:text-gray-400 transition-colors">
            "Image of the Creator" refers to the structure of consciousness (meaning, narrative, ethics) rather than biological form.
          </p>
        </div>

        <div className="space-y-3 mt-6 pt-4 border-t border-gray-800">
          <h4 className="text-xs text-gray-400 font-semibold uppercase">The Triad</h4>
          
          <div className="flex items-start gap-3">
            <div className="mt-1 text-jedi"><Shield size={14} /></div>
            <div>
              <span className="text-xs font-bold text-jedi block">Jedi (Yin)</span>
              <p className="text-[10px] text-gray-500">Stewardship, Compassion, Belonging, Regeneration, Honesty.</p>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <div className="mt-1 text-sith"><Zap size={14} /></div>
            <div>
              <span className="text-xs font-bold text-sith block">Sith (Yang)</span>
              <p className="text-[10px] text-gray-500">Power, Efficiency, Ambition, Strategy, Decisive Action.</p>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <div className="mt-1 text-pendragon"><Scale size={14} /></div>
            <div>
              <span className="text-xs font-bold text-pendragon block">Grey (Synthesis)</span>
              <p className="text-[10px] text-gray-500">The balance required for sustainable power and ethical stewardship in complex systems.</p>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};

export default PhilosophyPanel;