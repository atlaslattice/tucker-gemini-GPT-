// ============================================================
// TUCKER PENDRAGON — PANTHEON COUNCIL ORCHESTRATION SERVICE
// ============================================================
// Multi-model deliberation engine. Convenes all 5 council
// members concurrently, collects responses, checks quorum,
// and synthesizes via the Chair (Claude).
//
// This is the KEY DIFFERENTIATOR from the Gemini-only version.
// The Gemini fork talks to one model. This talks to five.
// ============================================================

import {
  CouncilMember, CouncilResponse, CouncilDeliberation,
  AlignmentMetrics, Provider, DEFAULT_COUNCIL, Message, Sender
} from '../types';
import { sendMessageToClaude } from './claude';

// --- Provider-specific API calls ---

interface ProviderConfig {
  apiKey: string;
  model: string;
  systemPrompt: string;
}

const COUNCIL_SYSTEM_PROMPT = (memberName: string, role: string) => `You are ${memberName}, a member of the Pantheon Council — a multi-AI governance body operating within Aluminum OS.

Your role: ${role}

You are deliberating on a governance question. Provide your perspective based on your role. Be substantive and specific.

You MUST respond with valid JSON:
{
  "response": "Your substantive analysis and recommendation",
  "metrics": { "jedi": <0-100>, "sith": <0-100>, "grey": <0-100> },
  "reasoning": "Why you scored the alignment metrics this way"
}`;

/**
 * Call a single council member's API.
 */
async function callProvider(
  member: CouncilMember,
  prompt: string,
  conversationContext: string,
  apiKeys: Record<Provider, string>
): Promise<CouncilResponse> {
  const startTime = Date.now();
  const key = apiKeys[member.provider];

  if (!key) {
    return {
      member: member.name,
      provider: member.provider,
      model: member.model,
      content: '',
      latency_ms: 0,
      weight: member.weight,
      error: `No API key for ${member.provider}`,
    };
  }

  try {
    let content: string;

    switch (member.provider) {
      case 'anthropic':
        content = await callAnthropic(key, member, prompt, conversationContext);
        break;
      case 'openai':
        content = await callOpenAI(key, member, prompt, conversationContext);
        break;
      case 'google':
        content = await callGoogle(key, member, prompt, conversationContext);
        break;
      case 'deepseek':
        content = await callDeepSeek(key, member, prompt, conversationContext);
        break;
      case 'xai':
        content = await callXAI(key, member, prompt, conversationContext);
        break;
      default:
        throw new Error(`Unknown provider: ${member.provider}`);
    }

    const latency = Date.now() - startTime;

    // Parse alignment metrics if present
    let alignment: AlignmentMetrics | undefined;
    try {
      const parsed = JSON.parse(content);
      if (parsed.metrics) {
        alignment = parsed.metrics;
        content = parsed.response || content;
      }
    } catch {
      // Response wasn't JSON — use raw text
    }

    return {
      member: member.name,
      provider: member.provider,
      model: member.model,
      content,
      latency_ms: latency,
      weight: member.weight,
      alignment,
    };
  } catch (error) {
    return {
      member: member.name,
      provider: member.provider,
      model: member.model,
      content: '',
      latency_ms: Date.now() - startTime,
      weight: member.weight,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

// --- Provider Implementations ---

async function callAnthropic(key: string, member: CouncilMember, prompt: string, context: string): Promise<string> {
  const res = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': key,
      'anthropic-version': '2023-06-01',
      'anthropic-dangerous-direct-browser-access': 'true',
    },
    body: JSON.stringify({
      model: member.model,
      max_tokens: 2048,
      system: COUNCIL_SYSTEM_PROMPT(member.name, member.role),
      messages: [
        { role: 'user', content: `${context}\n\nCurrent question for deliberation:\n${prompt}` }
      ],
    }),
  });
  const data = await res.json();
  return data.content?.[0]?.text || '';
}

async function callOpenAI(key: string, member: CouncilMember, prompt: string, context: string): Promise<string> {
  const res = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${key}`,
    },
    body: JSON.stringify({
      model: member.model,
      max_tokens: 2048,
      messages: [
        { role: 'system', content: COUNCIL_SYSTEM_PROMPT(member.name, member.role) },
        { role: 'user', content: `${context}\n\nCurrent question for deliberation:\n${prompt}` },
      ],
    }),
  });
  const data = await res.json();
  return data.choices?.[0]?.message?.content || '';
}

async function callGoogle(key: string, member: CouncilMember, prompt: string, context: string): Promise<string> {
  const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${member.model}:generateContent?key=${key}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      systemInstruction: { parts: [{ text: COUNCIL_SYSTEM_PROMPT(member.name, member.role) }] },
      contents: [{ parts: [{ text: `${context}\n\nCurrent question for deliberation:\n${prompt}` }] }],
    }),
  });
  const data = await res.json();
  return data.candidates?.[0]?.content?.parts?.[0]?.text || '';
}

async function callDeepSeek(key: string, member: CouncilMember, prompt: string, context: string): Promise<string> {
  const res = await fetch('https://api.deepseek.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${key}`,
    },
    body: JSON.stringify({
      model: member.model,
      max_tokens: 2048,
      messages: [
        { role: 'system', content: COUNCIL_SYSTEM_PROMPT(member.name, member.role) },
        { role: 'user', content: `${context}\n\nCurrent question for deliberation:\n${prompt}` },
      ],
    }),
  });
  const data = await res.json();
  return data.choices?.[0]?.message?.content || '';
}

async function callXAI(key: string, member: CouncilMember, prompt: string, context: string): Promise<string> {
  const res = await fetch('https://api.x.ai/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${key}`,
    },
    body: JSON.stringify({
      model: member.model,
      max_tokens: 2048,
      messages: [
        { role: 'system', content: COUNCIL_SYSTEM_PROMPT(member.name, member.role) },
        { role: 'user', content: `${context}\n\nCurrent question for deliberation:\n${prompt}` },
      ],
    }),
  });
  const data = await res.json();
  return data.choices?.[0]?.message?.content || '';
}

// --- Council Orchestration ---

const QUORUM_THRESHOLD = 3; // Minimum responses needed for valid deliberation

/**
 * Convene the full Pantheon Council.
 * All models are called concurrently. The Chair (Claude) synthesizes.
 */
export async function conveneCouncil(
  prompt: string,
  history: Message[],
  apiKeys: Record<Provider, string>,
  members?: CouncilMember[]
): Promise<CouncilDeliberation> {
  const council = (members || DEFAULT_COUNCIL).filter(m => m.enabled);
  const startTime = Date.now();

  // Build conversation context summary
  const context = history
    .slice(-6) // Last 6 messages for context
    .map(m => `${m.sender === Sender.User ? 'Human' : 'Tucker'}: ${m.text.slice(0, 200)}`)
    .join('\n');

  // Convene all members concurrently
  const responsePromises = council.map(member =>
    callProvider(member, prompt, context, apiKeys)
  );

  const responses = await Promise.allSettled(responsePromises);

  const councilResponses: CouncilResponse[] = responses.map((r, i) => {
    if (r.status === 'fulfilled') return r.value;
    return {
      member: council[i].name,
      provider: council[i].provider,
      model: council[i].model,
      content: '',
      latency_ms: 0,
      weight: council[i].weight,
      error: r.reason?.message || 'Promise rejected',
    };
  });

  const successfulResponses = councilResponses.filter(r => !r.error && r.content);
  const quorumMet = successfulResponses.length >= QUORUM_THRESHOLD;

  // Synthesize via Chair (Claude)
  let synthesis: string;
  let synthesisAlignment: AlignmentMetrics;

  if (successfulResponses.length > 0 && apiKeys.anthropic) {
    const synthesisResult = await synthesizeResponses(
      prompt, successfulResponses, apiKeys.anthropic, history
    );
    synthesis = synthesisResult.synthesis;
    synthesisAlignment = synthesisResult.alignment;
  } else {
    synthesis = successfulResponses.length === 0
      ? 'Council convened but no members responded. Check API key configuration.'
      : successfulResponses.map(r => `**${r.member}**: ${r.content.slice(0, 300)}`).join('\n\n');
    synthesisAlignment = { jedi: 50, sith: 50, grey: 50 };
  }

  return {
    question: prompt,
    responses: councilResponses,
    synthesis,
    synthesis_alignment: synthesisAlignment,
    quorum_met: quorumMet,
    total_latency_ms: Date.now() - startTime,
    chair: 'Tucker (Claude)',
  };
}

/**
 * Synthesis Chair: Claude reads all council responses and produces
 * a unified recommendation with weighted alignment metrics.
 */
async function synthesizeResponses(
  originalQuestion: string,
  responses: CouncilResponse[],
  anthropicKey: string,
  history: Message[]
): Promise<{ synthesis: string; alignment: AlignmentMetrics }> {
  const responseSummary = responses.map(r => {
    const alignStr = r.alignment
      ? ` [Jedi:${r.alignment.jedi} Sith:${r.alignment.sith} Grey:${r.alignment.grey}]`
      : '';
    return `**${r.member}** (${r.provider}, weight: ${r.weight}, ${r.latency_ms}ms)${alignStr}:\n${r.content}`;
  }).join('\n\n---\n\n');

  const synthesisPrompt = `You are the Synthesis Chair of the Pantheon Council. You've received responses from ${responses.length} council members on the following question:

"${originalQuestion}"

Council responses:
${responseSummary}

Your task:
1. Identify areas of consensus and divergence
2. Weight each response by the member's weight factor
3. Produce a synthesized recommendation that honors the constitutional protocols
4. Calculate weighted alignment metrics (Jedi/Sith/Grey)

Respond with JSON:
{
  "response": "Your synthesized recommendation incorporating all council perspectives",
  "metrics": { "jedi": <weighted 0-100>, "sith": <weighted 0-100>, "grey": <weighted 0-100> },
  "reasoning": "How you weighted and reconciled the council responses"
}`;

  try {
    const res = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': anthropicKey,
        'anthropic-version': '2023-06-01',
        'anthropic-dangerous-direct-browser-access': 'true',
      },
      body: JSON.stringify({
        model: 'claude-sonnet-4-6',
        max_tokens: 4096,
        system: 'You are Tucker_Pendragon, the Synthesis Chair of the Pantheon Council. Respond only with valid JSON.',
        messages: [{ role: 'user', content: synthesisPrompt }],
      }),
    });

    const data = await res.json();
    const text = data.content?.[0]?.text || '';
    const parsed = JSON.parse(text);

    return {
      synthesis: parsed.response || text,
      alignment: parsed.metrics || { jedi: 50, sith: 50, grey: 50 },
    };
  } catch (error) {
    // Fallback: weighted average of individual alignments
    const weights = responses.filter(r => r.alignment).map(r => r.weight);
    const totalWeight = weights.reduce((a, b) => a + b, 0) || 1;

    const alignment: AlignmentMetrics = {
      jedi: Math.round(responses.reduce((sum, r) => sum + (r.alignment?.jedi || 50) * r.weight, 0) / totalWeight),
      sith: Math.round(responses.reduce((sum, r) => sum + (r.alignment?.sith || 50) * r.weight, 0) / totalWeight),
      grey: Math.round(responses.reduce((sum, r) => sum + (r.alignment?.grey || 50) * r.weight, 0) / totalWeight),
    };

    return {
      synthesis: responses.map(r => `**${r.member}**: ${r.content.slice(0, 200)}`).join('\n\n'),
      alignment,
    };
  }
}

/**
 * Quick solo query to Claude (bypass council for fast interactions).
 */
export async function soloQuery(
  prompt: string,
  history: Message[],
  apiKeys: Record<Provider, string>
): Promise<CouncilDeliberation> {
  const start = Date.now();
  const result = await sendMessageToClaude(history, prompt, apiKeys.anthropic);

  return {
    question: prompt,
    responses: [{
      member: 'Tucker (Claude)',
      provider: 'anthropic',
      model: 'claude-sonnet-4-6',
      content: result.response,
      latency_ms: Date.now() - start,
      weight: 1.0,
      alignment: result.metrics,
    }],
    synthesis: result.response,
    synthesis_alignment: result.metrics,
    quorum_met: true,
    total_latency_ms: Date.now() - start,
    chair: 'Tucker (Claude)',
  };
}
