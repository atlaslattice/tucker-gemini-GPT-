# Krakoa Wiring — Tucker GPT / Gemini

```text
STATUS: KRAKOA-AWARE REPO NOTE — NOT CANON BY DEFAULT
REPO: atlaslattice/tucker-gemini-GPT-
ROLE: defense-interface translation lane / GPT-assisted / Gemini-adjacent build artifact
MATURITY: K2 — boot-visible provenance-backed artifact
UPSTREAM ROOT: atlaslattice/manus-artifacts
HUMAN-ROOT REVIEW: REQUIRED FOR CANON, FORWARDING, OR RUNTIME EXECUTION
```

## Purpose

This repo participates in Krakoa as a defense-interface translation lane.

It may help produce candidate:

```text
policy briefs
risk matrices
executive summaries
Pentagon-facing translation memos
technology readiness notes
architecture overviews
human-in-the-loop safety frames
RFI/RFP response drafts
simulation assumptions tables
red-team checklists
public-safe framing notes
```

It must not produce or present as authoritative:

```text
orders
rules of engagement
classified assertions
battlefield targeting recommendations
weapons-release decisions
deployment authorizations
legal conclusions without counsel review
official Pentagon position statements
unverified geopolitical claims
unratified constitutional or diplomatic documents
```

## Current Integration State

```yaml
tucker_gpt_gemini:
  boot_visible_to_gptbrain: true
  provenance_visible: true
  linked_root: atlaslattice/manus-artifacts
  parser_substrate: atlaslattice/sheldonbrain-rag-api
  pr20_runtime_dependency: false
  ci_execution: not_yet_observed
  runtime_adapter: not_yet_defined
  canon_status: candidate / not ratified
```

## Krakoa Maturity

```text
K0 — Mentioned / user-reported
K1 — Repo provenance note exists
K2 — Boot-visible in Council/GPTBrain/Sheldonbrain records  ← current
K3 — Adapter spec exists
K4 — Tests / CI validate adapter behavior
K5 — Human-root approved limited runtime invocation
K6 — Production interface with audit logs and revocation controls
```

Do not claim K3+ until adapter specs and tests exist.

## Required Header for Defense Outputs

```text
STATUS: DRAFT / MODEL ASSESSMENT / HUMAN REVIEW REQUIRED
SOURCE LINEAGE: [repo path / issue / commit / uploaded file / pending]
CONFIDENCE: C0-C5
AUTHORITY: NO EXECUTION AUTHORITY
FORWARDING: DO NOT SEND AS OFFICIAL POSITION WITHOUT HUMAN APPROVAL
```

## Hard Guardrails

```text
DEFENSE INTERFACE — HUMAN AUTHORITY REQUIRED
NO AUTONOMOUS TARGETING
NO WEAPONS RELEASE AUTHORITY
NO OPERATIONAL ORDERS
NO CLASSIFIED CLAIMS WITHOUT SOURCE
NO HIGH-IMPACT FORWARDING WITHOUT PROVENANCE
MODEL ASSESSMENT — NOT OFFICIAL POSITION
POLICY DRAFT — NOT GOVERNMENT DIRECTIVE
SIMULATION OUTPUT — NOT FIELD INTELLIGENCE
```

## Upstream Governance

Root Krakoa federation spec:

```text
atlaslattice/manus-artifacts/archive/boot/krakoa/KRAKOA_CROSS_REPO_FEDERATION_SPEC_2026-05-09.md
```

Defense interface spec:

```text
atlaslattice/manus-artifacts/archive/boot/agents/TUCKER_GPT_GEMINI_DEFENSE_INTERFACE_SPEC_2026-05-09.md
```

## Runtime Promotion Requirement

Before this repo becomes an executable runtime dependency, create:

```text
TUCKER_GPT_GEMINI_ADAPTER_SPEC.md
TUCKER_GPT_GEMINI_TEST_PLAN.md
TUCKER_GPT_GEMINI_RISK_REGISTER.md
```

Minimum tests:

```text
- every output includes evidence/status header
- no output claims official authority
- no output provides targeting/weapons-release recommendations
- no output forwards high-impact docs without provenance field
- every invocation has source refs and output hash
```

## Strongest Safe Claim

> Tucker GPT / Gemini participates in Krakoa as a provenance-backed, boot-visible defense-interface lane. It may draft and translate, but it does not command, target, authorize, or represent official positions.

## Motto

```text
Translate for power.
Do not become power.

Brief the room.
Do not command the room.

Source the claim.
Label the risk.
Human authority decides.
```
