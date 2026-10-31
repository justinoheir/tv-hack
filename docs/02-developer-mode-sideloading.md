# 2. Developer Mode and sideloading

Samsung's supported way to install apps that aren't in the store. It doesn't touch the
firmware and you can switch it off at any time.

## One-time laptop setup

1. Install **Tizen Studio** (or the CLI-only package) from developer.samsung.com/smarttv.
2. In the Package Manager, install:
   - *Tizen SDK tools*
   - *Extension SDK → TV Extensions-x.x* and *Samsung Certificate Extension*
3. Put the CLIs on your PATH (`tizen`, `sdb`), usually under `~/tizen-studio/tools/` and
   `~/tizen-studio/tools/ide/bin/`.

## Turn on Developer Mode on the TV

1. Open **Apps** (Apps panel on the home bar).
2. On the remote, press **1 2 3 4 5** with the Apps screen in focus. A Developer Mode dialog appears.
3. Toggle **On** and enter your **laptop's** LAN IP as the Host PC IP.
4. Power-cycle the TV **completely** (hold the power button on the remote until it restarts, or unplug it for 30s).
5. The Apps screen now shows "Developer Mode" at the top.

## Create a signing certificate (Samsung type)

Samsung TVs only install `.wgt` packages signed with a **Samsung** author + distributor
certificate that names the TV's DUID.

```bash
# Connect first so the certificate wizard can read the TV's DUID
sdb connect <TV_IP>
sdb devices                 # should list the TV
```

Then in Tizen Studio: **Tools → Certificate Manager → + → Samsung → TV**. Sign in with a
Samsung account. Create the author certificate and a distributor certificate (Partner level
isn't needed). Choose a profile name, e.g. `ether`.

> Security: the author certificate `.p12` and its password are signing credentials.
> They stay in `~/SamsungCertificate/` and are never committed (see `.gitignore`).

## Build and install

```bash
TV_IP=192.168.1.50 CERT_PROFILE=ether ./scripts/sideload.sh
```

## Third-party apps worth sideloading

Many open-source projects publish Tizen builds you can install the same way, e.g.
**Jellyfin for Tizen** (self-hosted media) and **Moonlight** (game streaming). Build them from
their official repos, so you can read the code and sign the package with your own
certificate. Don't install `.wgt` files from unknown sites.

## Troubleshooting

| Symptom | Fix |
|---|---|
| `sdb connect` times out | Host PC IP in Developer Mode must be the laptop's **current** IP; restart the TV after changing it |
| "Install failed: certificate" | The distributor certificate must include this TV's DUID. Regenerate it with the TV connected |
| Developer Mode gone after update | Turn it on again (step 2). Firmware updates often reset it |
