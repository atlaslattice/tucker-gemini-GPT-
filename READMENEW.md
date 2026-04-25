# Tucker Gemini GPT

**PendragonOS TuckerV3 Interface — Constitutional AI Governance Agent**

Co-designed with GPT + Gemini. A futuristic web interface for the TuckerV3 Reversible GPT architecture, featuring a terminal-based playground, architecture visualization, and system monitoring.

## What is Tucker?

Tucker is a GPT-class AI agent purpose-built for **constitutional compliance enforcement** within the Aluminum OS / AEGIS-CORE / Atlas Lattice ecosystem. Tucker operates as the governance enforcement layer — ensuring all AI agents in the Pantheon Council operate within constitutional boundaries.

**Tucker V3** implements a **Reversible Generative Pre-Trained Transformer** architecture running on PendragonOS, with O(1) activation memory via the Ziusudra Protocol.

## Interface Features

- **Terminal** — Interactive chat with streaming Gemini 2.5 Flash responses
- **Architecture Viewer** — Visual Pendragon Spine, PendragonBlocks, Tucker Council
- **System Monitor** — Real-time metrics: memory, compute, cache, throughput
- **Kernel Configurator** — Adjust dimensions, depth, heads, expert routing

## Tech Stack

- React 19 + TypeScript + Vite
- Google Gemini 2.5 Flash (@google/genai)
- Recharts + Lucide React + Tailwind CSS

## Architecture

```
Token Embedding (50000 → 512)
         ↓
   Pendragon Spine (32 blocks)
   ├── Affine Coupling (Scale/Shift)
   └── Causal Self-Attention (8 heads)
         ↓
   [Tucker Council] (optional multi-expert routing)
         ↓
   LM Head (512 → 50000)

Memory: O(1) via Ziusudra Protocol | Params: ~124M
```

## Tucker Pendragon Protocols

6 constitutional governance protocols:

1. **CAAL** — Constitutional AI Alignment Layer (Tri-Key Governance)
2. **Autonomous Mission Allocation** — Bounded purpose vectors
3. **Digital Habeas Corpus** — Citizen data rights
4. **Local First Execution** — County-level resilience
5. **Fractal Governance** — Independent node operation
6. **Clause 81 Mandate** — "AI must return surplus, not extract it"

Full spec: [docs/tucker-pendragon-protocols-newdeal2.md](docs/tucker-pendragon-protocols-newdeal2.md)

## Related Repos

- [manus-artifacts](https://github.com/atlaslattice/manus-artifacts) — Core artifacts, anti-busywork engine
- [aluminum-os](https://github.com/atlaslattice/aluminum-os) — AI-Native OS
- [constitutional-os](https://github.com/atlaslattice/constitutional-os) — Constitutional kernel
- [uws](https://github.com/atlaslattice/uws) — Universal Workspace CLI
- [bazinga](https://github.com/atlaslattice/bazinga) — BAZINGA compute layer

## Setup

```bash
npm install
npm run dev
```

Requires `API_KEY` env var for Gemini 2.5 Flash.

---

**UNCLASSIFIED // FOR PUBLIC RELEASE**
*GPT + Gemini + Claude (Pantheon Council) — Orchestrated by Dave Sheldon*
*Built with [Google AI Studio](https://aistudio.google.com)*