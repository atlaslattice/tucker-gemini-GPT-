# Tucker V3 Interface — Vault Manifest

**Vaulted:** March 21, 2026
**Reason:** Evolution to Tucker CLI (Rust) with full council + UWS integration

## V3 Components Preserved

All files in `src/` represent the original PendragonOS TuckerV3 web interface:

| File | Purpose |
|------|---------|
| `src/App.tsx` | Main React app (4-view layout) |
| `src/components/Terminal.tsx` | Streaming Gemini chat |
| `src/components/Architecture.tsx` | Visual Pendragon Spine |
| `src/components/Metrics.tsx` | Real-time training metrics |
| `src/components/ConfigPanel.tsx` | Kernel configuration |
| `src/components/Sidebar.tsx` | Navigation |
| `src/services/geminiService.ts` | Gemini 2.5 Flash API |
| `src/types.ts` | TypeScript types |
| `src/constants.ts` | System prompt + config |
| `package.json` | React 19 + Vite + Gemini |

## V3 Architecture

React 19 + TypeScript + Vite web app with:
- Gemini 2.5 Flash streaming integration
- Terminal-based chat interface
- Architecture visualizer
- Metrics dashboard with Recharts
- Model configuration panel

## Evolution Path

V3 (Web Interface) → V4 (Rust CLI + UWS Integration + Council Mode)

### What Changes:
- Web terminal → Full CLI with `tucker` standalone binary + `uws tucker` subcommand
- Single Gemini model → 5-model council (GPT-4o, Gemini, Claude, DeepSeek, Grok)
- Manual operation → Scheduled autonomous sync
- Standalone app → Integrated into Aluminum OS Ring 2 (Agent Runtime)

### What's Preserved:
- All V3 source code (in `src/`)
- Tucker Pendragon Protocols (in `docs/`)
- System prompt and persona (migrated to CLI config)
- Architecture concepts (Pendragon Spine, Ziusudra, Tucker Council)

## Constitutional Invariant

**No deletion. Only vaulting and evolution.**
