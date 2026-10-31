# Ether Hub: API and message protocol

All message shapes are defined and validated in [`packages/protocol`](../../packages/protocol).
That package is the source of truth; this page explains it.

## Transport

| Client | Transport | Auth |
|---|---|---|
| TV shell | `wss://<hub>/ws/device` | Device token (from pairing) as the first message, **not** in the URL (URLs end up in logs) |
| Phone PWA / automations | `https://<hub>/api/*` REST, optional `wss://<hub>/ws/client` for live state | Bearer client token |
| Admin (pairing, revoke) | Same REST, `admin` scope token | Bearer, admin scope |

Token scopes (least privilege): `device` (receive commands, read own config) · `client`
(send allow-listed commands, read device status) · `admin` (pair/revoke, edit config).

## Envelope

Every WebSocket message:

```json
{ "v": 1, "type": "command", "id": "c_8f2k1", "ts": 1767225600000, "body": { ... } }
```

`v` = protocol version (hub rejects unknown majors), `id` = idempotency/correlation key.

## Commands (client → hub → TV)

| `type` | Body | Notes |
|---|---|---|
| `app.launch` | `{ appId }` | `appId` must be a tile in that TV's config (allow-list), or an alias like `"jellyfin"` |
| `url.open` | `{ url }` | http(s) only, ≤ 2048 chars |
| `module.open` | `{ module, params? }` | `module` ∈ enabled modules |
| `overlay.show` | `{ title, body?, imageUrl?, level, ttlSec }` | `level` ∈ info/alert; `ttlSec` 1–120 |
| `media.control` | `{ action, positionSec? }` | `action` ∈ play/pause/stop/seek |
| `key.send` | `{ key }` | `key` ∈ up/down/left/right/select/back (phone D-pad) |

**Hub-only (not forwarded to the TV as-is):**

| `type` | Body | Notes |
|---|---|---|
| `scene.run` | `{ sceneId }` | Expands to a list of commands + HA calls defined in config, e.g. *movie-night* |
| `ha.call` | `{ service, entityId }` | `service` + `entityId` must be in the hub's HA allow-list |

## REST

```
POST   /api/pair                         {code}                     admin   → {deviceId}
GET    /api/devices                                                 client  → [{id, name, online, module}]
POST   /api/devices/{id}/commands        <command>                  client  → {ok, result?} (waits ≤ 5 s for TV ack)
POST   /api/broadcast/commands           <command>                  client  → {delivered: n}
POST   /api/scenes/{sceneId}/run                                    client  → {ok}
GET    /api/config                                                  admin   → ether.config.json
PUT    /api/config                       ether.config.json          admin   → {ok} (validated, then pushed to TVs)
DELETE /api/devices/{id}                                            admin   → revoke token
```

Errors: `{ ok: false, error: { code, message } }`. Codes: `invalid_command`, `not_allowed`,
`device_offline`, `timeout`, `rate_limited`, `unauthorized`.

Rate limit: 10 commands/s per client token, 1 pairing attempt per 2 s (6-digit codes,
2-minute expiry, 5 wrong attempts invalidates the code).

## Hub ↔ TV control messages

| Direction | `type` | Body |
|---|---|---|
| TV → hub | `hello` | `{ deviceId?, token?, model, shellVersion }` |
| hub → TV | `pair.challenge` | `{ code, expiresIn }` |
| hub → TV | `pair.granted` | `{ deviceId, token }` |
| hub → TV | `config.snapshot` | full validated config for this TV |
| hub → TV | `command` | a command from the table above |
| TV → hub | `command.result` | `{ id, ok, error? }` |
| TV → hub | `state` | `{ module, playing? }`: what the TV is showing (for the phone UI) |
| hub → TV | `ha.state` | `{ entityId, state, attributes }` (only subscribed entities) |

Offline TVs: the hub queues commands for 30 s (TTL), then fails them with `device_offline`.
