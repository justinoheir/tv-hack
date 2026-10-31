# tv-hack: Samsung UN55U8000F customisation

A project for getting **more apps, better performance and more flexibility** out of a
Samsung UN55U8000F (Tizen OS) that we own, using the safest approach that works.

## Approach: crawl, walk, run

| Track | Goal | Risk to TV | Status |
|-------|------|-----------|--------|
| 1. [**Speed-up and debloat**](docs/03-performance-debloat.md) ⬅ **start here** | Less lag, fewer ads, less telemetry. Measured before/after | Low. Every change can be undone | **Runbook + blocklist ready** |
| 2. [Identify the TV](docs/01-identify-tv.md) | Record the exact model, Tizen version and firmware | None | Ready |
| 3. [Developer Mode and sideloading](docs/02-developer-mode-sideloading.md) | Install apps that aren't in the Samsung store | None. It's an official Samsung feature | Ready |
| 4. [Custom app: Ether Launcher](docs/05-custom-app.md) | Our own TV app, built to be extended | None | Scaffold + 26 passing tests |
| 5. [Firmware analysis](docs/04-firmware-analysis.md) | Understand how the OS works (read-only) | None. Analysis runs off-device | Research |

We start with speed (what you asked for first), then build in order of increasing effort. Nothing here flashes or modifies the firmware. See
[docs/00-overview.md](docs/00-overview.md) for the reasons and the hard limits.

## Quick start: speed up the TV (about 20 min)

1. Measure a baseline: [runbook Step 0](docs/03-performance-debloat.md#step-0-measure-a-baseline-5-min)
2. Full reboot (hold Power 5 s), then turn off ACR, ads and voice wake-up (Steps 1–2)
3. Clear memory and caches, check the network (Steps 4–5), then measure again

## Quick start (custom app)

```bash
cd apps/ether-launcher
npm test                 # unit + integration tests (Node 20+, no dependencies)
npm run lint             # syntax check
# Preview in a desktop browser (arrow keys and Enter work like the remote; Backspace/Esc = Back):
npx serve .  # or any static server, then open http://localhost:3000
```

To deploy it to the TV, follow [docs/02-developer-mode-sideloading.md](docs/02-developer-mode-sideloading.md),
then run `scripts/sideload.sh`.

## Repository layout

```
docs/                    Guides, architecture, security/privacy, QA, SR&ED notes
apps/ether-launcher/     Tizen web app (HTML/JS), with logic kept separate from presentation
  src/core/              Pure logic: navigation, key mapping, config validation (unit-tested)
  src/ui/                DOM rendering only
  src/services/          Side effects: launching apps, analytics hook (off by default)
  test/                  node:test unit + integration tests
packages/protocol/       Shared, validated TV↔hub↔phone message protocol (tested)
scripts/                 Build/sign/install helpers that wrap the Tizen CLI
network/                 Conservative Pi-hole/AdGuard blocklist for Samsung ads/ACR
```

## Documentation index

- **[Ether TV software design](docs/design/README.md)**: architecture, ADRs, hub API, roadmap
- [Overview, architecture and limits](docs/00-overview.md)
- [Security and privacy review](docs/security-privacy.md)
- [QA test cases](docs/qa-test-cases.md)
- [SR&ED technical log](docs/sred-log.md)
