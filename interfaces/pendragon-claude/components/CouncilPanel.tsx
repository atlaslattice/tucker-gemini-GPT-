// ============================================================
// COUNCIL PANEL — NEW COMPONENT (not in Gemini version)
// ============================================================
// Shows the full Pantheon Council deliberation: individual
// member responses, weights, latencies, alignment scores,
// and quorum status. This is the transparency layer.
// ============================================================

import React, { useState } from 'react';
import { Users, ChevronDown, ChevronRight, Clock, Scale, AlertTriangle, CheckCircle, XCircle, Wifi } from 'lucide-react';
import { CouncilDeliberation, CouncilResponse, Provider, DEFAULT_COUNCIL } from '../types';

interface CouncilPanelProps {
  lastDeliberation?: CouncilDeliberation;
  apiKeyStatus: Record<Provider, boolean>;
}

const PROVIDER_COLORS: Record<Provider, string> = {
  anthropic: 'text-purple-400 border-purple-500/30',
  openai: 'text-blue-400 border-blue-500/30',
  google: 'text-yellow-400 border-yellow-500/30',
  deepseek: 'text-emerald-400 border-emerald-500/30',
  xai: 'text-orange-400 border-orange-500/30',
};

const PROVIDER_LABELS: Record<Provider, string> = {
  anthropic: 'Claude',
  openai: 'GPT-4o',
  google: 'Gemini',
  deepseek: 'DeepSeek',
  xai: 'Grok',
};

const CouncilPanel: React.FC<CouncilPanelProps> = ({ lastDeliberation, apiKeyStatus }) => {
  const [expandedMember, setExpandedMember] = useState<string | null>(null);

  return (
    <div className="h-full flex flex-col bg-gray-900/50 rounded-xl border border-gray-800 backdrop-blur-sm overflow-hidden">
      {/* Header */}
      <div className="p-3 border-b border-gray-800 bg-gray-950/50 flex justify-between items-center">
        <div className="flex items-center gap-2">
          <Users size={14} className="text-amber-400" />
          <span className="text-xs font-bold text-amber-400 tracking-wider">PANTHEON COUNCIL</span>
        </div>
        {lastDeliberation && (
          <div className="flex items-center gap-1">
            {lastDeliberation.quorum_met
              ? <CheckCircle size={10} className="text-emerald-500" />
              : <AlertTriangle size={10} className="text-red-500" />
            }
            <span className="text-[10px] text-gray-500">
              {lastDeliberation.quorum_met ? 'QUORUM MET' : 'NO QUORUM'}
            </span>
          </div>
        )}
      </div>

      <div className="flex-1 overflow-y-auto p-3 space-y-3">
        {/* API Key Status */}
        <div className="space-y-1">
          <div className="text-[10px] text-gray-500 uppercase tracking-wider mb-2">Member Status</div>
          {DEFAULT_COUNCIL.map(member => (
            <div key={member.name} className="flex items-center justify-between py-1">
              <div className="flex items-center gap-2">
                <Wifi size={8} className={apiKeyStatus[member.provider] ? 'text-emerald-500' : 'text-red-500'} />
                <span className={`text-xs ${PROVIDER_COLORS[member.provider].split(' ')[0]}`}>
                  {member.name}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] text-gray-600">w:{member.weight}</span>
                <span className={`text-[9px] px-1 py-0.5 rounded ${
                  apiKeyStatus[member.provider]
                    ? 'bg-emerald-500/10 text-emerald-500'
                    : 'bg-red-500/10 text-red-500'
                }`}>
                  {apiKeyStatus[member.provider] ? 'READY' : 'NO KEY'}
                </span>
              </div>
            </div>
          ))}
        </div>

        {/* Last Deliberation */}
        {lastDeliberation && (
          <>
            <div className="border-t border-gray-800 pt-3">
              <div className="text-[10px] text-gray-500 uppercase tracking-wider mb-2">Last Deliberation</div>
              <div className="text-[10px] text-gray-600 mb-2 flex items-center gap-1">
                <Clock size={10} />
                {lastDeliberation.total_latency_ms}ms total — Chair: {lastDeliberation.chair}
              </div>
            </div>

            {/* Individual Responses */}
            {lastDeliberation.responses.map((response) => (
              <MemberResponse
                key={response.member}
                response={response}
                expanded={expandedMember === response.member}
                onToggle={() => setExpandedMember(
                  expandedMember === response.member ? null : response.member
                )}
              />
            ))}
          </>
        )}

        {!lastDeliberation && (
          <div className="flex-1 flex flex-col items-center justify-center text-gray-600 py-8">
            <Users size={32} className="opacity-30 mb-2" />
            <p className="text-xs">No deliberation yet</p>
            <p className="text-[10px] text-gray-700 mt-1">Toggle Council mode and send a message</p>
          </div>
        )}
      </div>
    </div>
  );
};

// --- Member Response Card ---

const MemberResponse: React.FC<{
  response: CouncilResponse;
  expanded: boolean;
  onToggle: () => void;
}> = ({ response, expanded, onToggle }) => {
  const colorClass = PROVIDER_COLORS[response.provider] || 'text-gray-400 border-gray-500/30';
  const hasError = !!response.error;

  return (
    <div className={`border ${colorClass.split(' ')[1]} rounded-lg overflow-hidden bg-gray-950/30`}>
      <button
        onClick={onToggle}
        className="w-full p-2 flex items-center justify-between hover:bg-gray-800/30 transition-colors"
      >
        <div className="flex items-center gap-2">
          {hasError
            ? <XCircle size={10} className="text-red-500" />
            : <CheckCircle size={10} className="text-emerald-500" />
          }
          <span className={`text-xs font-semibold ${colorClass.split(' ')[0]}`}>
            {response.member}
          </span>
          <span className="text-[10px] text-gray-600">{response.latency_ms}ms</span>
        </div>
        <div className="flex items-center gap-2">
          {response.alignment && (
            <div className="flex gap-1 text-[9px]">
              <span className="text-blue-400">J:{response.alignment.jedi}</span>
              <span className="text-purple-400">G:{response.alignment.grey}</span>
              <span className="text-red-400">S:{response.alignment.sith}</span>
            </div>
          )}
          {expanded ? <ChevronDown size={12} className="text-gray-500" /> : <ChevronRight size={12} className="text-gray-500" />}
        </div>
      </button>

      {expanded && (
        <div className="px-2 pb-2 border-t border-gray-800/50">
          {hasError ? (
            <p className="text-[10px] text-red-400 mt-1">{response.error}</p>
          ) : (
            <p className="text-[10px] text-gray-400 mt-1 leading-relaxed whitespace-pre-wrap">
              {response.content.slice(0, 500)}
              {response.content.length > 500 && '...'}
            </p>
          )}
        </div>
      )}
    </div>
  );
};

export default CouncilPanel;
