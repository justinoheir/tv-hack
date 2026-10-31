# Security and privacy review

Scope: the speed-up runbook, the DNS blocklist, Ether Launcher v0.1.0 and the sideload script.

## Findings

| # | Area | Risk | Mitigation | Status |
|---|---|---|---|---|
| 1 | Signing certificate (`.p12` + password) | If leaked, someone could sign packages as us for TVs with our DUID | `.gitignore` excludes `*.p12` and `SamsungCertificate/`. The script never echoes the password; Tizen CLI reads it from the profile | ✅ |
| 2 | Developer Mode | While on, the TV accepts `sdb` connections **from the configured host IP** on the LAN | Only enable it while deploying, or keep the host IP pinned to one laptop. Turn it off when you're done developing | ⚠️ Operational |
| 3 | Config-driven URL tiles | `javascript:`/`file:` URLs could run code or read local files | `isSafeUrl` allows http(s) only (tested) | ✅ |
| 4 | Labels from config | Markup injection | Rendered with `textContent` only (tested) | ✅ |
| 5 | Remote code | A compromised CDN/script | CSP `script-src 'self'` in both `config.xml` and `index.html`; no third-party scripts | ✅ |
| 6 | Privileges | Over-privileged app | Single privilege: `application.launch` (least privilege) | ✅ |
| 7 | Analytics hook | PII leak / no consent | Off by default, no built-in endpoint, payload `{type, tileId, ts}` only. Extra fields are dropped (tested). Enabling it requires consent (GDPR/CASL) | ✅ |
| 8 | DNS blocklist | Over-blocking breaks security updates | List is ad/ACR-only, with explicit "never block update domains" guidance | ✅ |
| 9 | Identifying data in repo | Serial/MAC/IP exposure | `tv-profile.md`, `speed-log.md` gitignored; templates don't ask for serial/MAC | ✅ |
| 10 | Firmware research | Copyright/legal | Images excluded from git; analysis stops at encryption/DRM | ✅ |

## Privacy effect of the speed-up runbook

Step 2 (ACR, ad personalisation and voice wake-up off) and Step 7 (DNS blocking)
**reduce** third-party data flows from the household to Samsung and ad partners.
Nothing in this repo sends data anywhere.

## Secrets

None in the repo. No API keys or tokens are used.
