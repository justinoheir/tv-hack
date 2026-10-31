# ADR-0001: One Tizen web app "shell" with modules

**Status:** Accepted · **Date:** 2026-10-31

## Context
We want a launcher, media hub, dashboard and custom apps on Samsung Tizen TVs. Options:
(a) native `.tpk` apps, (b) one web app per feature, (c) one web app shell hosting modules.

## Decision
(c) A single `.wgt` shell with an internal module contract ([tv-shell.md](../tv-shell.md)).

## Consequences
- ✅ Native apps need Samsung partner status, so (a) isn't available to us.
- ✅ One install, shared navigation/focus handling, and moving between features doesn't relaunch an app (fast).
- ✅ Each module is flag-gated and tested on its own.
- ⚠️ A bug in one module can affect the shell. Mitigation: module error boundary (catch in mount/handleAction → fall back to home).
- ⚠️ Memory is shared. Mitigation: one mounted module at a time, `unmount` is mandatory.
- Separate `.wgt`s are still allowed for third-party apps (Jellyfin-Tizen, Moonlight) and anything that needs isolation.
