# 1. Identify the TV

Record these values before changing anything. Every later step depends on them, and if
something goes wrong they're your baseline for comparison.

1. **Settings → All Settings → Support → About This TV**
   - Model code (e.g. `UN55U8000FFXZA`)
   - Software version (firmware, e.g. `T-PTMAKUC-1xxx.x`)
   - Tizen version (sometimes shown here; otherwise in **Device Care → Self Diagnosis**)
2. **Settings → General → Network → Network Status → IP Settings**
   - The TV's IP address. Set a **DHCP reservation** on your router so it stays the same;
     sideloading connects by IP.
3. **Settings → Support → Software Update**: note whether **Auto Update** is on.
   Updates can reset Developer Mode and some privacy settings. Check them again after each update.

## Record it

Copy `docs/tv-profile.example.md` → `docs/tv-profile.md` (gitignored) and fill it in.

> Privacy: the serial number and MAC address identify your specific unit. Don't commit them. The
> template only asks for model, firmware and Tizen version.
