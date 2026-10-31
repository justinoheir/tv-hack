# ADR-0003: Jellyfin as the media backend

**Status:** Proposed (confirm we run Jellyfin, not Plex) · **Date:** 2026-10-31

## Context
G2 needs library management, metadata, transcoding and watch state. Building that ourselves is
large and not where our value is.

## Decision
Use **Jellyfin** (open source, self-hosted, no account/cloud, documented REST API, existing Tizen client).
Phase 1 sideloads Jellyfin-Tizen; phase 3 adds a native `media` module in the shell using the same API.

## Alternatives
- **Plex:** good, but needs a cloud account for auth and some features are paid. Keep it as an app tile.
- **Kodi:** no Tizen build.
- **Build our own:** rejected (scope).

## Consequences
- ✅ Watch history stays on our server (privacy). Transcoding is handled for codecs the TV can't play.
- ⚠️ Requires a NAS/PC capable of running Jellyfin (and transcoding, if the files need it).
