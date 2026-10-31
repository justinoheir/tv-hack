# ADR-0005: Shared, validated message protocol package

**Status:** Accepted · **Date:** 2026-10-31

## Context
Three programs (TV shell, hub, phone PWA) exchange commands. If each validates on its own, they'll drift,
and a gap in validation turns into a security hole (e.g. `url.open` with a `javascript:` URL).

## Decision
`packages/protocol` defines every message type and exports `validateEnvelope` / `validateCommand`.
It's pure JS with no dependencies, ES modules and unit-tested. The hub validates on ingress; the TV validates again
before acting (defence in depth). Protocol version `v` is in every message.

## Consequences
- ✅ One allow-list; a new command means one change plus tests.
- ✅ Usable unchanged on TV (browser), hub (Node) and PWA.
- ⚠️ Shell and hub must ship compatible versions. Mitigation: `v` major check, plus the hub reports a mismatch on the pairing screen.
