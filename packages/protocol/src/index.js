/**
 * Ether TV message protocol: the single source of truth for messages exchanged
 * between the TV shell, the hub and the phone PWA. See docs/design/hub-api.md.
 *
 * Validators never throw on bad input. They return { ok, value?, errors[] }.
 * `value` is a *normalised copy* that contains only known fields, so unknown or
 * extra fields (possible injection or data leaks) are dropped, not passed on.
 *
 * Pure module: no DOM, no Node APIs. Runs in the TV browser, Node and the PWA.
 */

export const PROTOCOL_VERSION = 1;

const KEYS = ['up', 'down', 'left', 'right', 'select', 'back'];
const MEDIA_ACTIONS = ['play', 'pause', 'stop', 'seek'];
const OVERLAY_LEVELS = ['info', 'alert'];
const ID = /^[a-z0-9][a-z0-9._-]{0,63}$/i;
const ENTITY_ID = /^[a-z_]+\.[a-z0-9_]{1,64}$/;
const SERVICE = /^[a-z_]+\.[a-z0-9_]{1,64}$/;

/** Commands the hub forwards to TVs. */
export const DEVICE_COMMANDS = Object.freeze([
  'app.launch', 'url.open', 'module.open', 'overlay.show', 'media.control', 'key.send',
]);
/** Commands the hub executes itself (never forwarded raw). */
export const HUB_COMMANDS = Object.freeze(['scene.run', 'ha.call']);

/**
 * Field rules per command. Each rule: [field, checkFn, required].
 * checkFn returns an error string, or null when valid.
 */
const RULES = {
  'app.launch': [['appId', str(1, 64, ID), true]],
  'url.open': [['url', httpUrl, true]],
  'module.open': [['module', str(1, 32, ID), true], ['params', plainObject, false]],
  'overlay.show': [
    ['title', str(1, 80), true],
    ['body', str(0, 280), false],
    ['imageUrl', httpUrl, false],
    ['level', oneOf(OVERLAY_LEVELS), true],
    ['ttlSec', intRange(1, 120), true],
  ],
  'media.control': [['action', oneOf(MEDIA_ACTIONS), true], ['positionSec', intRange(0, 86_400), false]],
  'key.send': [['key', oneOf(KEYS), true]],
  'scene.run': [['sceneId', str(1, 64, ID), true]],
  'ha.call': [['service', str(3, 80, SERVICE), true], ['entityId', str(3, 80, ENTITY_ID), true]],
};

/**
 * Validate a command `{ type, ...fields }`.
 * @param {unknown} cmd
 * @param {{ allowHubCommands?: boolean }} [opts] TVs should leave this false (default)
 * @returns {{ ok: boolean, value?: object, errors: string[] }}
 */
export function validateCommand(cmd, { allowHubCommands = false } = {}) {
  if (!plainObjectValue(cmd)) return fail('command must be an object');
  const { type } = cmd;
  const allowed = allowHubCommands ? [...DEVICE_COMMANDS, ...HUB_COMMANDS] : DEVICE_COMMANDS;
  if (typeof type !== 'string' || !allowed.includes(type)) {
    return fail(`unknown or not-allowed command type: ${JSON.stringify(type)}`);
  }

  const errors = [];
  const value = { type };
  for (const [field, check, required] of RULES[type]) {
    const v = cmd[field];
    if (v === undefined) {
      if (required) errors.push(`${type}.${field} is required`);
      continue;
    }
    const err = check(v);
    if (err) errors.push(`${type}.${field} ${err}`);
    else value[field] = v;
  }
  if (type === 'media.control' && cmd.action === 'seek' && cmd.positionSec === undefined) {
    errors.push('media.control.positionSec is required for seek');
  }
  return errors.length ? { ok: false, errors } : { ok: true, value, errors };
}

/**
 * Validate a WebSocket envelope `{ v, type, id, ts, body }`.
 * For `type: "command"`, the body is validated with validateCommand.
 * @param {unknown} msg
 * @param {{ allowHubCommands?: boolean }} [opts]
 */
export function validateEnvelope(msg, opts) {
  if (!plainObjectValue(msg)) return fail('envelope must be an object');
  const errors = [];
  if (msg.v !== PROTOCOL_VERSION) errors.push(`unsupported protocol version ${JSON.stringify(msg.v)}`);
  if (typeof msg.type !== 'string' || !ID.test(msg.type)) errors.push('type is invalid');
  if (typeof msg.id !== 'string' || !ID.test(msg.id)) errors.push('id is invalid');
  if (!Number.isInteger(msg.ts) || msg.ts <= 0) errors.push('ts must be a positive integer (ms)');
  if (errors.length) return { ok: false, errors };

  let body = msg.body ?? {};
  if (msg.type === 'command') {
    const res = validateCommand(body, opts);
    if (!res.ok) return res;
    body = res.value;
  } else if (!plainObjectValue(body)) {
    return fail('body must be an object');
  }
  return { ok: true, value: { v: msg.v, type: msg.type, id: msg.id, ts: msg.ts, body }, errors: [] };
}

/**
 * Build a valid envelope (throws on invalid input: use this for messages we create).
 * @param {string} type
 * @param {object} body
 * @param {{ id?: string, now?: () => number }} [opts]
 */
export function createEnvelope(type, body, { id, now = Date.now } = {}) {
  const msg = { v: PROTOCOL_VERSION, type, id: id ?? randomId(), ts: now(), body };
  const res = validateEnvelope(msg, { allowHubCommands: true });
  if (!res.ok) throw new TypeError(`invalid ${type}: ${res.errors.join('; ')}`);
  return res.value;
}

/** http(s)-only URL check, shared by every component. */
export function isSafeHttpUrl(value) {
  if (typeof value !== 'string' || value.length > 2048) return false;
  try {
    const u = new URL(value);
    return u.protocol === 'http:' || u.protocol === 'https:';
  } catch {
    return false;
  }
}

// ---- helpers -------------------------------------------------------------

function fail(message) {
  return { ok: false, errors: [message] };
}

function plainObjectValue(v) {
  return v !== null && typeof v === 'object' && !Array.isArray(v);
}

function plainObject(v) {
  if (!plainObjectValue(v)) return 'must be an object';
  return JSON.stringify(v).length > 1024 ? 'is too large (max 1 KB)' : null;
}

function str(min, max, pattern) {
  return (v) => {
    if (typeof v !== 'string') return 'must be a string';
    if (v.length < min || v.length > max) return `must be ${min}-${max} characters`;
    if (pattern && !pattern.test(v)) return 'has invalid format';
    return null;
  };
}

function oneOf(values) {
  return (v) => (values.includes(v) ? null : `must be one of ${values.join(', ')}`);
}

function intRange(min, max) {
  return (v) => (Number.isInteger(v) && v >= min && v <= max ? null : `must be an integer ${min}-${max}`);
}

function httpUrl(v) {
  return isSafeHttpUrl(v) ? null : 'must be an http(s) URL (max 2048 chars)';
}

function randomId() {
  const c = globalThis.crypto;
  const rand = c?.randomUUID ? c.randomUUID().replace(/-/g, '').slice(0, 12) : Math.random().toString(36).slice(2, 14);
  return `m_${rand}`;
}
