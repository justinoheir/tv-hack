# Roadmap: crawl → walk → run

Each phase ships something usable on its own. Everything new goes behind a feature flag.

## Phase 0: spikes (resolve the unknowns first)

| Spike | Answers | Blocks |
|---|---|---|
| S1 privileges | U1: inputs/HDMI, colour keys with a public cert | Home "Inputs" row, shortcuts |
| S2 overlay | U2: can we draw over another app? | Doorbell overlay design |
| S3 TLS | U3: WSS with public cert on LAN IP | Hub transport |
| S4 latency harness | U4: real key→paint on U8000F | Perf budget |
| S5 playback | U5: AVPlay vs `<video>` | Media module |
| S6 background | U6: WS alive when shell not foreground | Command queue design |

Spikes are throwaway `.wgt`s under `spikes/`, and findings go in `docs/sred-log.md`.

## Phase 1: Crawl (no hub needed)

- [ ] Rename `ether-launcher` → `ether-shell`; add router + module contract; `home` as first module
- [ ] Home rows: Apps, Continue Watching (Jellyfin), Inputs (if S1 passes)
- [ ] App catalog pipeline + first sideloads: **Jellyfin-Tizen**, **Moonlight**
- [ ] On-device latency harness in the shell (debug flag)
- **Exit criteria:** shell is the daily home screen on the living-room TV and meets the < 50 ms budget

## Phase 2: Walk (hub)

- [ ] `services/hub` Docker image: pairing, device registry, config service, command relay, audit log
- [ ] Shell `remote-link`: pairing screen, WS client with backoff, command dispatch
- [ ] Phone PWA: device picker, D-pad, launch app, open URL, scenes
- [ ] HA bridge + `dashboard` module + doorbell `overlay`
- **Exit criteria:** phone controls the TV, doorbell shows on the TV within 2 s, hub restart recovers cleanly

## Phase 3: Run

- [ ] `media` module: native Jellyfin browse/play (AVPlay), resume, subtitles
- [ ] Scenes (e.g. *movie night*: dim lights + open Jellyfin + set Picture mode)
- [ ] Multi-TV config overrides (office vs living room), broadcast messages
- [ ] Our own custom apps as modules (one per idea, flag-gated)
