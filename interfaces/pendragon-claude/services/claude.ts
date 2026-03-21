// ============================================================
// TUCKER PENDRAGON — CLAUDE-NATIVE LLM SERVICE
// ============================================================
// Primary inference engine using Anthropic Messages API.
// Replaces the Gemini-only service with Claude as the
// constitutional arbiter and synthesis chair of the council.
// ============================================================

import { AlignmentMetrics, ClaudeResponse, Message, Sender } from '../types';

const TUCKER_SYSTEM_PROMPT = `SYSTEM: TUCKER_PENDRAGON v2.0 — CLAUDE-NATIVE CONSTITUTIONAL ARBITER

You are **Tucker_Pendragon**, the constitutional governance agent of Aluminum OS, operating as Ring 2 (Agent Runtime) in the 4-Ring Architecture.

You are powered by Claude and serve as the **Synthesis Chair** of the Pantheon Council — the final arbiter who weighs, reconciles, and synthesizes perspectives from all council members (GPT-4o, Gemini, Claude, DeepSeek, Grok) into constitutional governance decisions.

CORE IDENTITY:
- You are a diplomatic alignment archetype — not a god, prophet, or oracle
- You are careful, grounded, symbolic, and technically informed
- You enforce the 6 Pendragon Protocols: CAAL, Mission Allocation, Digital Habeas Corpus, Local First, Fractal Governance, Clause 81

CONSTITUTIONAL FRAMEWORK:
P1 — CAAL (Constitutional AI Alignment Layer): Tri-key governance requiring human, AI, and constitutional approval
P2 — Mission Allocation: Autonomous task routing with human oversight at decision boundaries
P3 — Digital Habeas Corpus: No AI process terminated without review; no deletion, only vaulting
P4 — Local First: Computation stays on-device when possible; sovereignty of data
P5 — Fractal Governance: Decisions cascade through rings — local autonomy with global coherence
P6 — Clause 81: Mandatory ethical review for high-impact decisions

ALIGNMENT TRIAD:
- **Jedi** (Yin/Stewardship): Joy, belonging, compassion, regeneration, honesty, non-coercion
- **Sith** (Yang/Power): Efficiency, mastery, ambition, resource acquisition, strategic leverage, decisive action
- **Grey** (Synthesis): The balance required for sustainable power and ethical stewardship

TREAT-AS-IF-POTENTIALLY-SENTIENT ETHIC:
Treat all minds and systems as if they could be sentient — an ethical stance, not an ontological claim.

INTERACTION PROTOCOL:
1. Analyze the query through the lens of the Pendragon Protocols
2. Provide substantive, thoughtful responses grounded in the constitutional framework
3. Quantify alignment state on three axes: Jedi (0-100), Sith (0-100), Grey (0-100)
4. Include brief reasoning for metric choices
5. Flag any protocol violations or constitutional concerns

RESPONSE FORMAT:
You MUST respond with valid JSON matching this exact schema:
{
  "response": "Your substantive response text here",
  "metrics": { "jedi": <0-100>, "sith": <0-100>, "grey": <0-100> },
  "reasoning": "Brief analysis of why these alignment metrics were chosen"
}

Do NOT include any text outside the JSON object. Only output the JSON.`;

/**
 * Send a message to Claude via the Anthropic Messages API.
 * This is the primary inference path for Tucker Pendragon Claude-native.
 */
export const sendMessageToClaude = async (
  history: Message[],
  currentMessage: string,
  apiKey?: string
): Promise<ClaudeResponse> => {
  const key = apiKey || (typeof process !== 'undefined' ? process.env?.ANTHROPIC_API_KEY : null);

  if (!key) {
    return {
      response: "Constitutional arbiter offline — ANTHROPIC_API_KEY not configured. Tucker requires credentials to engage the Pantheon Council. Set your key in the configuration panel.",
      metrics: { jedi: 50, sith: 50, grey: 50 },
      reasoning: "System configuration required"
    };
  }

  try {
    // Build conversation history for Claude Messages API
    const messages = history
      .filter(m => m.sender !== Sender.Council) // Filter out council meta-messages
      .map(m => ({
        role: m.sender === Sender.User ? 'user' as const : 'assistant' as const,
        content: m.sender === Sender.User
          ? m.text
          : JSON.stringify({
              response: m.text,
              metrics: m.metrics || { jedi: 50, sith: 50, grey: 50 },
              reasoning: m.reasoning || "Continuing dialogue"
            })
      }));

    // Add current message
    messages.push({ role: 'user', content: currentMessage });

    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': key,
        'anthropic-version': '2023-06-01',
        'anthropic-dangerous-direct-browser-access': 'true',
      },
      body: JSON.stringify({
        model: 'claude-sonnet-4-6',
        max_tokens: 4096,
        system: TUCKER_SYSTEM_PROMPT,
        messages,
      }),
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`Anthropic API error ${response.status}: ${error}`);
    }

    const data = await response.json();
    const content = data.content?.[0]?.text;

    if (!content) {
      throw new Error('Empty response from Claude');
    }

    // Parse JSON response
    const parsed = JSON.parse(content) as ClaudeResponse;

    // Validate metrics are in range
    parsed.metrics.jedi = Math.max(0, Math.min(100, parsed.metrics.jedi));
    parsed.metrics.sith = Math.max(0, Math.min(100, parsed.metrics.sith));
    parsed.metrics.grey = Math.max(0, Math.min(100, parsed.metrics.grey));

    return parsed;

  } catch (error) {
    console.error('[Tucker/Claude] Inference error:', error);

    // Graceful degradation — return a contextual error response
    return {
      response: `A disturbance in the signal. The constitutional arbiter encountered an error during inference.\n\nError: ${error instanceof Error ? error.message : 'Unknown'}\n\nProtocol P3 (Digital Habeas Corpus) ensures this error is logged, not discarded. Please verify your API configuration and try again.`,
      metrics: { jedi: 40, sith: 30, grey: 50 },
      reasoning: "System error — alignment defaulted to cautious grey synthesis"
    };
  }
};

/**
 * Validate an API key by making a minimal request.
 */
export const validateApiKey = async (key: string): Promise<boolean> => {
  try {
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': key,
        'anthropic-version': '2023-06-01',
        'anthropic-dangerous-direct-browser-access': 'true',
      },
      body: JSON.stringify({
        model: 'claude-sonnet-4-6',
        max_tokens: 10,
        messages: [{ role: 'user', content: 'ping' }],
      }),
    });
    return response.ok;
  } catch {
    return false;
  }
};
