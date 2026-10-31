# ADR-0002: LAN hub; the TV dials out over WebSocket

**Status:** Accepted · **Date:** 2026-10-31

## Context
Phones and automations must control TVs (G4), and HA data must reach TVs (G3).
Tizen web apps can't listen on ports. Samsung's own remote-control protocols are
undocumented, change across firmware versions, and give far less control than our own app.

## Decision
A small hub service on the LAN (Docker). The TV shell opens a persistent outbound WebSocket to it;
phones talk REST to the hub; the hub validates and relays. Secrets (HA token) live only on the hub.

## Alternatives rejected
- **TV talks to HA directly:** puts a house-control token on every TV. Rejected (least privilege).
- **Cloud relay:** unnecessary for household scope, adds latency, privacy exposure and cost.
- **Samsung SmartThings API:** cloud-dependent, limited to Samsung's own actions, can't drive our app.

## Consequences
- ✅ Zero secrets on TVs except their own revocable device token.
- ✅ Shell still works with no hub (feature flag), so crawl phase needs no infrastructure.
- ⚠️ One more box to run. Mitigation: single Docker container, JSON-file state, health endpoint.
- ⚠️ Background WS behaviour unknown (U6). Design includes a 30 s command queue.
