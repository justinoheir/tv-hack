import { test } from 'node:test';
import assert from 'node:assert/strict';
import {
  validateCommand, validateEnvelope, createEnvelope, isSafeHttpUrl,
  DEVICE_COMMANDS, HUB_COMMANDS, PROTOCOL_VERSION,
} from '../src/index.js';

const VALID = {
  'app.launch': { type: 'app.launch', appId: 'jellyfin' },
  'url.open': { type: 'url.open', url: 'https://ha.local:8123/lovelace' },
  'module.open': { type: 'module.open', module: 'dashboard', params: { tab: 'cameras' } },
  'overlay.show': { type: 'overlay.show', title: 'Doorbell', level: 'alert', ttlSec: 15, imageUrl: 'http://hub.local/snap.jpg' },
  'media.control': { type: 'media.control', action: 'seek', positionSec: 90 },
  'key.send': { type: 'key.send', key: 'select' },
  'scene.run': { type: 'scene.run', sceneId: 'movie-night' },
  'ha.call': { type: 'ha.call', service: 'light.turn_off', entityId: 'light.living_room' },
};

test('every documented command has a valid example', () => {
  for (const type of [...DEVICE_COMMANDS, ...HUB_COMMANDS]) {
    const res = validateCommand(VALID[type], { allowHubCommands: true });
    assert.equal(res.ok, true, `${type}: ${res.errors}`);
  }
});

test('hub-only commands are rejected by default (TV side)', () => {
  assert.equal(validateCommand(VALID['ha.call']).ok, false);
  assert.equal(validateCommand(VALID['scene.run']).ok, false);
  assert.equal(validateCommand(VALID['app.launch']).ok, true);
});

test('unknown fields are stripped from the normalised value', () => {
  const res = validateCommand({ ...VALID['app.launch'], __proto__: { evil: 1 }, extra: 'leak' });
  assert.deepEqual(res.value, { type: 'app.launch', appId: 'jellyfin' });
});

test('url.open / overlay imageUrl: only http(s)', () => {
  for (const url of ['javascript:alert(1)', 'file:///etc/passwd', 'data:text/html,x', 'nope', 'https://' + 'a'.repeat(2050)]) {
    assert.equal(validateCommand({ type: 'url.open', url }).ok, false, url);
  }
  assert.equal(validateCommand({ ...VALID['overlay.show'], imageUrl: 'javascript:x' }).ok, false);
});

test('required fields, enums and ranges', () => {
  const cases = [
    [{ type: 'app.launch' }, /appId is required/],
    [{ type: 'app.launch', appId: '../../etc' }, /invalid format/],
    [{ type: 'key.send', key: 'power' }, /must be one of/],
    [{ ...VALID['overlay.show'], ttlSec: 0 }, /integer 1-120/],
    [{ ...VALID['overlay.show'], ttlSec: 3600 }, /integer 1-120/],
    [{ ...VALID['overlay.show'], title: '' }, /1-80 characters/],
    [{ type: 'media.control', action: 'seek' }, /required for seek/],
    [{ type: 'module.open', module: 'home', params: { big: 'x'.repeat(2000) } }, /too large/],
    [{ type: 'ha.call', service: 'light.turn_off', entityId: 'Light Living' }, /invalid format/],
  ];
  for (const [cmd, re] of cases) {
    const res = validateCommand(cmd, { allowHubCommands: true });
    assert.equal(res.ok, false, JSON.stringify(cmd));
    assert.match(res.errors.join('\n'), re);
  }
});

test('non-object / unknown types never throw', () => {
  for (const bad of [null, undefined, 42, 'x', [], { type: 'rm -rf' }, { type: 'toString' }]) {
    assert.equal(validateCommand(bad).ok, false);
    assert.equal(validateEnvelope(bad).ok, false);
  }
});

test('envelope: valid command envelope is normalised', () => {
  const res = validateEnvelope({ v: 1, type: 'command', id: 'c_1', ts: 1, body: { ...VALID['key.send'], x: 1 }, junk: true });
  assert.equal(res.ok, true);
  assert.deepEqual(res.value, { v: 1, type: 'command', id: 'c_1', ts: 1, body: { type: 'key.send', key: 'select' } });
});

test('envelope: version, id, ts checks; command body validated', () => {
  assert.match(validateEnvelope({ v: 2, type: 'hello', id: 'a', ts: 1 }).errors[0], /version/);
  assert.equal(validateEnvelope({ v: 1, type: 'hello', id: '', ts: 1 }).ok, false);
  assert.equal(validateEnvelope({ v: 1, type: 'hello', id: 'a', ts: -5 }).ok, false);
  assert.equal(validateEnvelope({ v: 1, type: 'command', id: 'a', ts: 1, body: { type: 'url.open', url: 'javascript:1' } }).ok, false);
  assert.equal(validateEnvelope({ v: 1, type: 'state', id: 'a', ts: 1, body: [] }).ok, false);
});

test('createEnvelope builds valid messages and refuses invalid ones', () => {
  const env = createEnvelope('command', VALID['app.launch'], { id: 'c_x', now: () => 1000 });
  assert.deepEqual(env, { v: PROTOCOL_VERSION, type: 'command', id: 'c_x', ts: 1000, body: VALID['app.launch'] });
  assert.match(createEnvelope('hello', { model: 'UN55U8000F' }).id, /^m_[a-z0-9]+$/i);
  assert.throws(() => createEnvelope('command', { type: 'url.open', url: 'file:///x' }), TypeError);
});

test('isSafeHttpUrl', () => {
  assert.equal(isSafeHttpUrl('http://192.168.1.10:8096'), true);
  assert.equal(isSafeHttpUrl('HTTPS://EXAMPLE.COM'), true);
  assert.equal(isSafeHttpUrl('ftp://x'), false);
  assert.equal(isSafeHttpUrl(42), false);
});
