// ============================================================
// TUCKER PENDRAGON — CLAUDE-NATIVE APP
// ============================================================
// 51% Claude, 100% Constitutional.
// Forked from Pendragon Interface (Gemini), rebuilt with:
// - Claude as primary engine & synthesis chair
// - Full 5-model Pantheon Council from day one
// - Real governance verdict tracking
// - Shared type system with Rust CLI backend
// ============================================================

import React, { useState, useCallback, useEffect } from 'react';
import ChatWindow from './components/ChatWindow';
import AlignmentChart from './components/AlignmentChart';
import CouncilPanel from './components/CouncilPanel';
import PhilosophyPanel from './components/PhilosophyPanel';
import NexusSimulation from './components/NexusSimulation';
import SystemBlueprint from './components/SystemBlueprint';
import {
  Message, Sender, AlignmentMetrics, CouncilDeliberation,
  GovernanceVerdict, Provider, Protocol, Verdict, ALL_PROTOCOLS,
  DEFAULT_COUNCIL
} from './types';
import { sendMessageToClaude } from './services/claude';
import { conveneCouncil, soloQuery } from './services/council';
import { ShieldCheck, RotateCcw, Book, Cpu, FileCode, Users, Settings, Key } from 'lucide-react';

// --- State Keys ---
const STORAGE_KEY = 'tucker_claude_v2';

// --- Initial State ---
const getInitialMessage = (): Message => ({
  id: 'init-1',
  sender: Sender.System,
  text: "Constitutional arbiter online. I am Tucker_Pendragon v2.0, Claude-native.\n\nI operate as the 51% Synthesis Chair of the Pantheon Council — five AI models deliberating under six constitutional protocols. Claude is my core, but I listen to every voice before I judge.\n\nToggle between Solo (Claude only) and Council (all 5 models) mode using the button in the header. Configure API keys in Settings.\n\nHow may I serve the constitution today?",
  timestamp: Date.now(),
  metrics: { jedi: 50, sith: 50, grey: 50 },
  model_used: 'claude-sonnet-4-6',
});

const INITIAL_METRICS: AlignmentMetrics = { jedi: 50, sith: 50, grey: 50 };

const App: React.FC = () => {
  // --- Core State ---
  const [messages, setMessages] = useState<Message[]>([getInitialMessage()]);
  const [currentMetrics, setCurrentMetrics] = useState<AlignmentMetrics>(INITIAL_METRICS);
  const [isLoading, setIsLoading] = useState(false);
  const [councilMode, setCouncilMode] = useState(false);
  const [lastDeliberation, setLastDeliberation] = useState<CouncilDeliberation | undefined>();
  const [lastVerdict, setLastVerdict] = useState<GovernanceVerdict | undefined>();
  const [councilCalls, setCouncilCalls] = useState(0);

  // --- UI State ---
  const [rightTab, setRightTab] = useState<'council' | 'protocol' | 'nexus' | 'system'>('council');
  const [showSettings, setShowSettings] = useState(false);

  // --- API Keys (in-memory only — never persisted) ---
  const [apiKeys, setApiKeys] = useState<Record<Provider, string>>({
    anthropic: '',
    openai: '',
    google: '',
    deepseek: '',
    xai: '',
  });

  const apiKeyStatus: Record<Provider, boolean> = {
    anthropic: !!apiKeys.anthropic,
    openai: !!apiKeys.openai,
    google: !!apiKeys.google,
    deepseek: !!apiKeys.deepseek,
    xai: !!apiKeys.xai,
  };

  // --- Handlers ---

  const handleReset = () => {
    if (window.confirm('Reset conversation memory? This cannot be undone.')) {
      setMessages([getInitialMessage()]);
      setCurrentMetrics(INITIAL_METRICS);
      setLastDeliberation(undefined);
      setLastVerdict(undefined);
      setCouncilCalls(0);
    }
  };

  const generateGovernanceVerdict = (text: string, metrics: AlignmentMetrics): GovernanceVerdict => {
    // Simulate governance evaluation based on alignment metrics
    // In production, this calls the Rust CLI backend
    const protocolResults = ALL_PROTOCOLS.map(protocol => {
      let compliant = true;
      let confidence = 0.8;

      switch (protocol) {
        case Protocol.CAAL:
          compliant = metrics.grey >= 40;
          confidence = metrics.grey / 100;
          break;
        case Protocol.DigitalHabeasCorpus:
          compliant = metrics.jedi >= 30;
          confidence = metrics.jedi / 100;
          break;
        case Protocol.Clause81:
          compliant = metrics.grey >= 50 && metrics.jedi >= 30;
          confidence = (metrics.grey + metrics.jedi) / 200;
          break;
        case Protocol.MissionAllocation:
          compliant = metrics.sith >= 20;
          confidence = Math.min(metrics.sith / 80, 1);
          break;
        case Protocol.LocalFirst:
          compliant = true;
          confidence = 0.95;
          break;
        case Protocol.FractalGovernance:
          compliant = metrics.grey >= 35;
          confidence = metrics.grey / 100;
          break;
      }

      return {
        protocol,
        compliant,
        confidence,
        reasoning: `Evaluated against ${protocol} criteria`,
      };
    });

    const npfm = (metrics.grey / 100) * (metrics.jedi / 100)
      - (1 - metrics.sith / 100) * 0.3
      - 0.1;

    return {
      id: Date.now().toString(),
      timestamp: Date.now(),
      input_summary: text.slice(0, 100),
      protocol_results: protocolResults,
      overall_verdict: protocolResults.every(r => r.compliant)
        ? Verdict.Approved
        : protocolResults.filter(r => !r.compliant).length <= 2
          ? Verdict.Conditional
          : Verdict.Rejected,
      npfm_score: Math.max(-1, Math.min(1, npfm)),
      recommendation: protocolResults.every(r => r.compliant)
        ? 'All protocols compliant. Proceed.'
        : `${protocolResults.filter(r => !r.compliant).length} protocol(s) flagged. Review required.`,
    };
  };

  const handleSendMessage = useCallback(async (text: string, useCouncil: boolean) => {
    // Add user message
    const userMessage: Message = {
      id: Date.now().toString(),
      sender: Sender.User,
      text,
      timestamp: Date.now(),
    };
    setMessages(prev => [...prev, userMessage]);
    setIsLoading(true);

    try {
      let deliberation: CouncilDeliberation;

      if (useCouncil && Object.values(apiKeys).some(k => k)) {
        deliberation = await conveneCouncil(text, messages, apiKeys);
        setCouncilCalls(prev => prev + 1);
      } else if (apiKeys.anthropic) {
        deliberation = await soloQuery(text, messages, apiKeys);
      } else {
        // No API keys — return helpful message
        const noKeyMessage: Message = {
          id: (Date.now() + 1).toString(),
          sender: Sender.System,
          text: "No API keys configured. Open Settings (gear icon) and enter at least your Anthropic API key to activate Tucker.\n\nAs the 51% Constitutional Arbiter, I need my Claude core online before I can deliberate. Add other provider keys to enable full Pantheon Council mode.",
          timestamp: Date.now(),
          metrics: { jedi: 50, sith: 50, grey: 50 },
          reasoning: "Configuration required",
        };
        setMessages(prev => [...prev, noKeyMessage]);
        setIsLoading(false);
        return;
      }

      setLastDeliberation(deliberation);

      // Generate governance verdict
      const verdict = generateGovernanceVerdict(text, deliberation.synthesis_alignment);
      setLastVerdict(verdict);

      // Create response message
      const responseMessage: Message = {
        id: (Date.now() + 1).toString(),
        sender: useCouncil ? Sender.Council : Sender.System,
        text: deliberation.synthesis,
        metrics: deliberation.synthesis_alignment,
        reasoning: useCouncil
          ? `Council synthesis from ${deliberation.responses.filter(r => !r.error).length} members — ${deliberation.total_latency_ms}ms`
          : deliberation.responses[0]?.alignment
            ? `Jedi:${deliberation.synthesis_alignment.jedi} Grey:${deliberation.synthesis_alignment.grey} Sith:${deliberation.synthesis_alignment.sith}`
            : undefined,
        timestamp: Date.now(),
        deliberation: useCouncil ? deliberation : undefined,
        governance: verdict,
        model_used: useCouncil ? `Pantheon Council (${deliberation.chair})` : 'claude-sonnet-4-6',
      };

      setMessages(prev => [...prev, responseMessage]);
      setCurrentMetrics(deliberation.synthesis_alignment);

    } catch (error) {
      console.error('[Tucker] Message handling error:', error);
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        sender: Sender.System,
        text: `Constitutional arbiter encountered an error: ${error instanceof Error ? error.message : 'Unknown'}`,
        timestamp: Date.now(),
        metrics: { jedi: 40, sith: 30, grey: 50 },
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  }, [messages, apiKeys]);

  return (
    <div className="min-h-screen bg-gray-950 text-gray-200 font-sans selection:bg-purple-500/30 p-4 md:p-6 flex flex-col">
      {/* Header */}
      <header className="mb-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-gradient-to-br from-purple-900/50 to-gray-900 rounded-lg border border-purple-500/20 shadow-lg shadow-purple-500/10">
            <ShieldCheck className="text-purple-400" size={24} />
          </div>
          <div>
            <h1 className="text-xl md:text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-purple-300 to-gray-400">
              TUCKER_PENDRAGON
            </h1>
            <p className="text-xs text-gray-500 tracking-wider">
              Claude-Native // 51% Arbiter // Pantheon Council
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowSettings(!showSettings)}
            className={`p-2 transition-colors border rounded-md ${
              showSettings
                ? 'text-purple-400 border-purple-500/30 bg-purple-500/10'
                : 'text-gray-500 border-gray-800 bg-gray-900/50 hover:text-gray-300'
            }`}
            title="Settings"
          >
            <Key size={16} />
          </button>
          <button
            onClick={handleReset}
            className="p-2 text-gray-500 hover:text-red-400 transition-colors border border-gray-800 rounded-md bg-gray-900/50"
            title="Reset"
          >
            <RotateCcw size={16} />
          </button>
        </div>
      </header>

      {/* Settings Panel (slide-down) */}
      {showSettings && (
        <div className="mb-4 bg-gray-900/80 border border-gray-800 rounded-xl p-4 backdrop-blur-sm">
          <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">API Keys (stored in memory only — never saved to disk)</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-3">
            {(['anthropic', 'openai', 'google', 'deepseek', 'xai'] as Provider[]).map(provider => (
              <div key={provider}>
                <label className="text-[10px] text-gray-500 uppercase block mb-1">
                  {provider === 'anthropic' ? 'Anthropic (Required)' :
                   provider === 'openai' ? 'OpenAI' :
                   provider === 'google' ? 'Google AI' :
                   provider === 'deepseek' ? 'DeepSeek' : 'xAI (Grok)'}
                </label>
                <input
                  type="password"
                  value={apiKeys[provider]}
                  onChange={(e) => setApiKeys(prev => ({ ...prev, [provider]: e.target.value }))}
                  placeholder={provider === 'anthropic' ? 'sk-ant-...' : 'API key...'}
                  className={`w-full bg-gray-800 text-xs rounded px-2 py-1.5 border focus:outline-none focus:ring-1 ${
                    provider === 'anthropic'
                      ? 'border-purple-500/30 focus:ring-purple-500/50'
                      : 'border-gray-700 focus:ring-gray-500/50'
                  }`}
                />
              </div>
            ))}
          </div>
          <p className="text-[10px] text-gray-600 mt-2">
            Claude (Anthropic) key is required for Tucker to function. Other keys enable full Pantheon Council mode.
          </p>
        </div>
      )}

      {/* Main Layout */}
      <main className="flex-1 grid grid-cols-1 lg:grid-cols-12 gap-4 h-[calc(100vh-140px)] min-h-[500px]">
        {/* Chat — 7 cols */}
        <div className="lg:col-span-7 h-full">
          <ChatWindow
            messages={messages}
            onSendMessage={handleSendMessage}
            isLoading={isLoading}
            councilMode={councilMode}
            onToggleCouncil={() => setCouncilMode(!councilMode)}
          />
        </div>

        {/* Right Panel — 5 cols */}
        <div className="lg:col-span-5 flex flex-col gap-4 h-full">
          {/* Alignment Chart */}
          <div className="h-[280px] flex-shrink-0">
            <AlignmentChart
              metrics={currentMetrics}
              councilResponses={lastDeliberation?.responses}
            />
          </div>

          {/* Tabbed Panel */}
          <div className="flex-1 flex flex-col min-h-0">
            <div className="flex bg-gray-900/50 rounded-t-xl border border-gray-800 border-b-0">
              {[
                { id: 'council' as const, icon: <Users size={11} />, label: 'COUNCIL', color: 'text-amber-400' },
                { id: 'protocol' as const, icon: <Book size={11} />, label: 'PROTOCOL', color: 'text-gray-200' },
                { id: 'nexus' as const, icon: <Cpu size={11} />, label: 'NEXUS', color: 'text-emerald-400' },
                { id: 'system' as const, icon: <FileCode size={11} />, label: 'SYSTEM', color: 'text-blue-400' },
              ].map(tab => (
                <button
                  key={tab.id}
                  onClick={() => setRightTab(tab.id)}
                  className={`flex-1 p-2 text-[10px] font-semibold flex items-center justify-center gap-1 transition-colors ${
                    rightTab === tab.id ? `${tab.color} bg-gray-800/50` : 'text-gray-500 hover:text-gray-300'
                  }`}
                >
                  {tab.icon} {tab.label}
                </button>
              ))}
            </div>
            <div className="flex-1 rounded-b-xl border border-t-0 border-gray-800 overflow-hidden">
              {rightTab === 'council' && <CouncilPanel lastDeliberation={lastDeliberation} apiKeyStatus={apiKeyStatus} />}
              {rightTab === 'protocol' && <PhilosophyPanel lastVerdict={lastVerdict} />}
              {rightTab === 'nexus' && (
                <NexusSimulation
                  lastVerdict={lastVerdict}
                  currentMetrics={currentMetrics}
                  messageCount={messages.length}
                  councilCalls={councilCalls}
                />
              )}
              {rightTab === 'system' && <SystemBlueprint />}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default App;
