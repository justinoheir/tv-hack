# 4. Firmware analysis (read-only research)

Goal: understand how the OS is built (web runtime version, available APIs, bundled
services, telemetry endpoints) so that our app and blocklist choices are based on evidence.
**All analysis happens on a laptop; nothing gets written back to the TV.**

## Sources

1. **Samsung's official firmware download** for your model (samsung.com → Support →
   your model → Manuals & Downloads → firmware). This is the same image the TV installs.
2. **Samsung Open Source Release Center** (opensource.samsung.com). Samsung publishes the
   GPL/LGPL source (kernel, busybox, browser engine patches) for TV models, so you can read
   the open-source parts directly instead of reverse-engineering them.
3. **On-device introspection from inside our own app** (sanctioned APIs only):
   `tizen.systeminfo`, `webapis.productinfo`, `navigator.userAgent`.

## Workflow

```bash
mkdir -p ~/fw-research/{download,extract,notes}    # outside this repo, firmware is large and copyrighted
cd ~/fw-research
# 1. Verify the download (record SHA-256 in notes)
sha256sum download/*.zip > notes/hashes.txt
# 2. Survey the container (read-only)
binwalk download/<image>                    # identify sections
# 3. Extract the unencrypted parts that binwalk identifies, into extract/
```

Much of the current Samsung image is **encrypted and signed**. Expect to recover
metadata, manifests and some unencrypted partitions, not a full filesystem. Don't try to
break or bypass that encryption. Use the open-source release (source 2) to fill the gaps.

## Questions to answer (record findings in `sred-log.md`)

- [ ] Chromium version of the web runtime → which JS/CSS features we can rely on
- [ ] Which `webapis.*` / `tizen.*` privileges a public (non-partner) certificate can use
- [ ] Telemetry/ads hostnames referenced in the image → feed into the DNS blocklist (track 3B)
- [ ] Media codecs/containers supported natively → choices for the media-player app

## Legal notes

- Firmware images are Samsung's copyrighted work. Don't commit or redistribute them (the
  `.gitignore` excludes common image extensions).
- Inspecting software you lawfully obtained for interoperability is generally allowed
  (US DMCA §1201(f) / Canada Copyright Act s.30.61), but **circumventing** encryption or DRM is not covered.
  We stop at the encryption.
