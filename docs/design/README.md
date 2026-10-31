# Ether TV: design

Software for our household/office Samsung TVs: a fast home screen, media hub, smart-home
dashboard, phone control, and apps the Samsung store doesn't offer.

| Doc | What's in it |
|---|---|
| [architecture.md](architecture.md) | **Start here.** Goals, system diagram, components, flows, perf budgets, security, data inventory, open uncertainties |
| [tv-shell.md](tv-shell.md) | The on-TV app: module contract, routing/Back, key dispatch, per-module design, performance rules |
| [hub-api.md](hub-api.md) | LAN hub REST + WebSocket protocol, token scopes, errors, rate limits |
| [roadmap.md](roadmap.md) | Spikes → crawl → walk → run, with exit criteria |
| [adr/](adr/) | Architecture decisions and the alternatives we rejected |
| [`packages/protocol`](../../packages/protocol) | The protocol as tested code (shared by TV, hub, phone) |

## One-paragraph summary

One Tizen web app (**Ether TV Shell**) replaces the slow home bar and hosts feature modules
(home, media, dashboard, overlay). It works on its own. When enabled, it connects **outbound** to a
small **Ether Hub** in Docker on the LAN, which pairs devices, serves config, relays phone
commands and bridges Home Assistant, so no house-control secrets ever live on a TV. Media
comes from **Jellyfin**. Open-source TV apps are built from pinned source and sideloaded with our
own certificate. Every message is validated by one shared protocol package.

## Assumptions to confirm

1. Smart home runs on **Home Assistant**.
2. Media server is (or will be) **Jellyfin** (ADR-0003). Plex stays as an app tile either way.
3. An always-on box (Pi 4/5, NAS or PC) can run one Docker container for the hub.
