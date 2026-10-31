# SR&ED technical log

Record the technical uncertainty, what we tried and what we found. Add entries as work progresses.
Note: following documented vendor settings (the speed-up runbook) is routine work and isn't
SR&ED-eligible by itself. The eligible parts are the measurement methodology and the custom app work.

## 2026-10-31: Project start

**Objective.** Improve responsiveness and app flexibility on a resource-constrained Tizen TV
(UN55U8000F) without modifying signed firmware.

**Technological uncertainties**
1. How much of the perceived UI latency comes from removable background services (ACR, ads,
   voice) versus fixed SoC limits? This isn't published by Samsung. Hypothesis: background
   services and memory pressure dominate T4 (menu lag), and network dominates T3 (app launch).
2. Can a web-runtime launcher deliver lower perceived navigation latency than the native
   home bar on this hardware? Approach: transform/outline-only focus styling (no layout
   reflow) and no artwork preloading. To be measured on the device.
3. Which DNS blocks reduce background traffic without breaking DRM/licence or update flows?
   Approach: start minimal, add entries one at a time while watching the query log.

**Methods.** Stopwatch medians of 3 for T1–T5 (see runbook Step 0). Change one variable per
measurement round.

**Results.** _Pending baseline measurements._
