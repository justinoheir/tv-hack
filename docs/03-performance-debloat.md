# 3. Speed-up and debloat runbook (UN55U8000F)

Everything in this runbook uses settings and features Samsung provides, and every change can
be reversed. Steps are ordered by **effect ÷ effort**. Work top-down and stop when the TV feels fast enough.

> **Honest expectation:** the U8000F is Samsung's entry-level 4K line, with a modest SoC and
> limited RAM. Most lag comes from (1) memory filling up with background apps, (2) Samsung's
> own background services (ACR, ads, voice) and (3) slow Wi-Fi. We can fix all three. We
> can't change the chip. If it's still slow after step 9, see "Plan B" at the bottom.

## Step 0: Measure a baseline (5 min)

A fix only counts if it shows up in the numbers. Use a phone stopwatch and fill in
[`speed-log.example.md`](speed-log.example.md) (copy it to `speed-log.md`, which is gitignored).
Measure each item **3×** and record the median:

| Metric | How |
|---|---|
| **T1** Cold start | Unplug 30s → plug in → press Power → until the home bar is usable |
| **T2** Warm start | TV off (standby) 5+ min → Power → home bar usable |
| **T3** App launch | Home → open YouTube → first frame of the YouTube home screen |
| **T4** Menu lag | Hold → on the home bar for 10 tiles; does focus keep up? (smooth / stutters / freezes) |
| **T5** Settings open | Press ⚙ → menu appears |

Measure again after each step. Note which step made the difference.

## Step 1: Full power cycle (30 s, biggest quick win)

Pressing Power normally puts the TV into **standby**, not off, so memory and background apps
build up over days or weeks.

- **Hold the Power button on the remote for ~5 s** until the Samsung logo appears (full reboot), **or**
- Unplug for 30 s.

Do this weekly, or whenever the TV feels sluggish. (Step 8 automates part of it.)

## Step 2: Turn off background Samsung services (5 min)

Paths are for current Tizen menus. Names shift slightly between firmware versions; search
in Settings if one doesn't match.

| Turn OFF | Where | Why it helps |
|---|---|---|
| **Viewing Information Services** (ACR) | Settings → All Settings → General & Privacy → Terms & Privacy → Privacy Choices | ACR continuously fingerprints whatever is on screen (including HDMI inputs) and uploads it. Constant CPU + network use |
| **Interest-Based Advertisements** | same menu | Fewer ad fetches and less profiling |
| **Voice recognition / Bixby voice wake-up** | same menu, and Settings → General → Voice | Stops always-on wake-word listening |
| **Autorun Smart Hub** | Settings → General & Privacy → Start Screen Option (or Smart Features) | Home bar doesn't load ads and recommendations on every power-on |
| **Autorun Last App** | same | Stops reopening (and buffering) the last app on start |
| **Samsung TV Plus autorun** | same, if listed | Stops an ad-supported live channel starting by itself |

Record each change in `speed-log.md` so you can undo it.

## Step 3: Keep Instant On ON

**Settings → General & Privacy → Power and Energy Saving → Instant On** (or *Quick Start+*).
Leave it **on**. It's why warm start (T2) takes ~2 s instead of ~15 s. It uses a little more
standby power. This is the one speed setting you should leave enabled.

## Step 4: Free memory and storage (10 min)

1. **Delete apps you don't use:** Apps → ⚙ (Settings) → select app → **Delete**. Preinstalled
   apps that can't be deleted can usually be **removed from the home bar**. That still helps,
   because the home bar preloads tile artwork.
2. **Device Care:** Settings → Support → **Device Care → Start Device Care**. It closes background
   apps and clears temp data.
3. **Manage Storage:** Device Care → **Manage Storage** → for big apps (YouTube, Netflix, browser)
   choose **Clear Cache** (*not* Clear Data, which signs you out).

## Step 5: Network (most of the "app launch" time)

App launches (T3) mostly wait on the network.

1. **Use Ethernet if possible.** The port is only 100 Mbps, but the latency and consistency
   beat Wi-Fi in most homes. That matters more than raw speed (4K streaming needs ~25 Mbps).
2. On Wi-Fi: use **5 GHz**, and make sure the router isn't on a congested channel.
3. **Settings → Support → Device Care → Self Diagnosis → Smart Hub Connection Test.** Fix
   anything it flags first.
4. **Fast DNS:** if you're not doing Step 7, set DNS manually to a fast resolver
   (Network Status → IP Settings → DNS Setting → Enter manually, e.g. `1.1.1.1`).

## Step 6: Input lag (gaming / responsiveness, not menus)

This affects how fast the **picture** responds, not the menus:

- **Game Mode** = Auto (Settings → Connection → Game Mode Settings) for consoles/PC.
- Elsewhere, **Picture Clarity / Auto Motion Plus = Off** removes processing delay. (Tradeoff:
  sports may look less smooth. Try both.)

## Step 7: Network-level ad and telemetry blocking (optional, 30–60 min)

Run **Pi-hole** or **AdGuard Home** on a Raspberry Pi or an always-on PC, and point the TV's DNS at it.

- Start with the conservative list in [`../network/samsung-blocklist.txt`](../network/samsung-blocklist.txt).
- Then **watch the query log** for a day, see what *your* TV actually calls, and block
  more gradually, testing the TV after each change.
- **Never block** firmware update, app store, or streaming/DRM licence domains. If an app
  breaks, check the query log for what was blocked at that moment and allow it again.

## Step 8: Keep firmware current

Settings → Support → Software Update → **Auto Update ON**. Samsung ships performance fixes,
and each update does a full reboot. After an update, **check Step 2 again**: updates
sometimes re-enable privacy toggles.

## Step 9: Reset Smart Hub (last resort before factory reset)

Settings → Support → Device Care → Self Diagnosis → **Reset Smart Hub** (PIN default `0000`).
This removes downloaded apps and signs you out of everything, but often clears long-term
slowness. After that, a full **Factory Reset** is the final option.

## Plan B: if it's still slow

If T3/T4 are still poor after steps 1–9, the limit is the hardware. The most effective
upgrade is a **dedicated streaming box** on HDMI (e.g. Apple TV 4K, Nvidia Shield,
Google TV Streamer). Use the TV as a display only, with steps 2 and 7 still applied so the
TV's own services stay quiet. Our custom-app work still applies; we'd target that box's platform.

## Rollback

Every step except 9 is a toggle. `speed-log.md` lists what you changed, so to undo,
switch each one back. Pi-hole: point TV DNS back to Automatic.
