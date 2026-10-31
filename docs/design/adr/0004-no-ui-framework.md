# ADR-0004: No UI framework in the shell (crawl/walk)

**Status:** Accepted · **Date:** 2026-10-31

## Context
The U8000F has a modest SoC. Our budgets: cold launch < 1.5 s, key→focus < 50 ms, JS < 100 KB.

## Decision
Vanilla ES modules with the existing core/ui/services split. No build step needed to run.
Revisit (e.g. Preact, ~4 KB) only if module UIs become complex enough that hand-written DOM
updates cause bugs. That decision would be measured against the latency harness.

## Consequences
- ✅ Smallest possible runtime; nothing between key press and DOM change; no dependency updates.
- ✅ Same code runs in node:test with a fake DOM (already proven by ether-launcher tests).
- ⚠️ More hand-written rendering code. Mitigation: small `ui/` helpers shared across modules.
