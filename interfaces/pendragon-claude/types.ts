// ============================================================
// TUCKER PENDRAGON — CLAUDE-NATIVE SHARED TYPE SYSTEM
// ============================================================
// These types are designed to mirror the Rust CLI backend types
// exactly, enabling seamless integration between the React
// frontend and the Tucker V4 CLI governance engine.
// ============================================================

// --- Identity ---

export enum Sender {
  User = 'USER',
  System = 'TUCKER_PENDRAGON',
  Council = 'PANTHEON_COUNCIL',
}

// --- Alignment Triad ---

export interface AlignmentMetrics {
  jedi: number;   // 0-100: Stewardship, compassion, belonging, regeneration
  sith: number;   // 0-100: Power, efficiency, ambition, strategic leverage
  grey: number;   // 0-100: Synthesis — sustainable power + ethical stewardship
}

// --- Council Architecture (mirrors Rust council/mod.rs) ---

export type Provider = 'anthropic' | 'openai' | 'google' | 'deepseek' | 'xai';

export interface CouncilMember {
  name: string;
  provider: Provider;
  model: string;
  weight: number;      // 0.0–1.0, mirrors config.rs weights
  role: string;
  enabled: boolean;
}

export interface CouncilResponse {
  member: string;
  provider: Provider;
  model: string;
  content: string;
  latency_ms: number;
  weight: number;
  alignment?: AlignmentMetrics;
  error?: string;
}

export interface CouncilDeliberation {
  question: string;
  responses: CouncilResponse[];
  synthesis: string;
  synthesis_alignment: AlignmentMetrics;
  quorum_met: boolean;
  total_latency_ms: number;
  chair: string;       // Which model synthesized (default: Claude)
}

// --- Governance (mirrors Rust governance/mod.rs) ---

export enum Protocol {
  CAAL = 'CAAL',
  MissionAllocation = 'MissionAllocation',
  DigitalHabeasCorpus = 'DigitalHabeasCorpus',
  LocalFirst = 'LocalFirst',
  FractalGovernance = 'FractalGovernance',
  Clause81 = 'Clause81',
}

export enum Verdict {
  Approved = 'Approved',
  Conditional = 'Conditional',
  Rejected = 'Rejected',
}

export interface ProtocolResult {
  protocol: Protocol;
  compliant: boolean;
  confidence: number;  // 0.0–1.0
  reasoning: string;
}

export interface GovernanceVerdict {
  id: string;
  timestamp: number;
  input_summary: string;
  protocol_results: ProtocolResult[];
  overall_verdict: Verdict;
  npfm_score: number;  // -1.0 to 1.0 — Net Positive Flourishing Metric
  recommendation: string;
}

// --- Messages ---

export interface Message {
  id: string;
  sender: Sender;
  text: string;
  metrics?: AlignmentMetrics;
  reasoning?: string;
  timestamp: number;
  // Council-native fields (not in Gemini version)
  deliberation?: CouncilDeliberation;
  governance?: GovernanceVerdict;
  model_used?: string;
}

// --- API Response Types ---

export interface ClaudeResponse {
  response: string;
  metrics: AlignmentMetrics;
  reasoning: string;
}

export interface CouncilConveneRequest {
  prompt: string;
  system_context?: string;
  models?: Provider[];   // Subset of council to convene (default: all)
}

export interface GovernanceEvalRequest {
  input: string;
  protocols?: Protocol[];
}

// --- System Status ---

export interface SystemStatus {
  online: boolean;
  council_members: CouncilMember[];
  active_protocols: Protocol[];
  last_npfm: number;
  last_verdict?: Verdict;
  uptime_ms: number;
}

export interface AluminumRing {
  ring: number;
  name: string;
  status: 'healthy' | 'degraded' | 'critical' | 'offline';
  component: string;
}

// --- NPFM Calculation ---
// (AutomationGain × AgencyUplift) - BusyworkPenalty - (0.5 × DisplacementRisk)
export interface NPFMBreakdown {
  automation_gain: number;
  agency_uplift: number;
  busywork_penalty: number;
  displacement_risk: number;
  final_score: number;
}

// --- Default Council Configuration ---
export const DEFAULT_COUNCIL: CouncilMember[] = [
  { name: 'Tucker (Claude)', provider: 'anthropic', model: 'claude-sonnet-4-6', weight: 1.0, role: 'Constitutional Arbiter & Synthesis Chair', enabled: true },
  { name: 'GPT-4o', provider: 'openai', model: 'gpt-4o', weight: 1.0, role: 'Strategic Analysis', enabled: true },
  { name: 'Gemini', provider: 'google', model: 'gemini-2.5-flash', weight: 0.9, role: 'Technical Architecture', enabled: true },
  { name: 'DeepSeek', provider: 'deepseek', model: 'deepseek-chat', weight: 0.7, role: 'Efficiency Optimization', enabled: true },
  { name: 'Grok', provider: 'xai', model: 'grok-3', weight: 0.7, role: 'Contrarian Analysis', enabled: true },
];

export const ALL_PROTOCOLS: Protocol[] = [
  Protocol.CAAL,
  Protocol.MissionAllocation,
  Protocol.DigitalHabeasCorpus,
  Protocol.LocalFirst,
  Protocol.FractalGovernance,
  Protocol.Clause81,
];
