# QA test cases

Automated: `cd apps/ether-launcher && npm test` (26 tests: unit + integration). The cases below
need a real TV.

## A. Speed-up runbook

| ID | Steps | Expected |
|---|---|---|
| SP-1 | Record baseline T1–T5 (runbook Step 0) | Numbers recorded in `speed-log.md` |
| SP-2 | Hold Power 5 s | Samsung logo appears (full reboot, not standby) |
| SP-3 | Turn off ACR, interest ads, voice wake-up; reboot | Toggles still off after reboot |
| SP-4 | Turn off Autorun Smart Hub / Last App; standby → on | Lands on the last input/home without opening an app |
| SP-5 | Device Care + clear caches; re-measure T3/T4 | T3 equal or faster than baseline |
| SP-6 | Apply blocklist; open YouTube, Netflix, Prime, App Store; run Software Update check | All work; update check succeeds |
| SP-7 | Roll back one setting from the log | TV behaves as before that change |

## B. Ether Launcher on the TV

| ID | Steps | Expected |
|---|---|---|
| EL-1 | `scripts/sideload.sh` with TV in Developer Mode | Installs and launches; grid of 6 tiles, first highlighted |
| EL-2 | Arrow keys across/down grid | Focus moves, stops at edges, no wrap; ↓ from top-right goes to last tile |
| EL-3 | OK on each app tile | Each app opens. If an ID is wrong, the status shows "Couldn't open …" and the launcher still responds |
| EL-4 | OK on Home Dashboard tile | Opens in TV browser |
| EL-5 | Press OK rapidly twice | App opens once |
| EL-6 | Back | Launcher exits to home |
| EL-7 | Add to home bar, reboot | Launcher tile persists |
| EL-8 | Desktop preview (`npx serve .`) | Arrow/Enter/Esc work; app tiles show "outside a Tizen TV" |
