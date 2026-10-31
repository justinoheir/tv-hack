import { test } from 'node:test';
import assert from 'node:assert/strict';
import { createLauncher } from '../src/services/launcher.js';
import { createAnalytics } from '../src/services/analytics.js';
import { fakeTizen } from './fakes.js';

test('launcher: launches app tiles via tizen.application.launch', async () => {
  const tizen = fakeTizen();
  await createLauncher({ tizen }).launch({ appId: '111299001912' });
  assert.deepEqual(tizen.calls, [['launch', '111299001912']]);
});

test('launcher: surfaces launch failures as Errors', async () => {
  const tizen = fakeTizen({ failLaunch: 'NotFoundError' });
  await assert.rejects(createLauncher({ tizen }).launch({ appId: 'x' }), /NotFoundError/);
});

test('launcher: URL tiles use an app control on the TV', async () => {
  const tizen = fakeTizen();
  await createLauncher({ tizen }).launch({ url: 'https://ha.local' });
  assert.deepEqual(tizen.calls, [['appControl', 'http://tizen.org/appcontrol/operation/view', 'https://ha.local']]);
});

test('launcher: desktop fallback', async () => {
  const opened = [];
  const l = createLauncher({ openWindow: (u) => opened.push(u) });
  await l.launch({ url: 'https://a' });
  assert.deepEqual(opened, ['https://a']);
  await assert.rejects(l.launch({ appId: '1' }), /outside a Tizen TV/);
  l.exit(); // must not throw off-TV
});

test('launcher: exit calls current application exit', () => {
  const tizen = fakeTizen();
  createLauncher({ tizen }).exit();
  assert.deepEqual(tizen.calls, [['exit']]);
});

test('analytics: off by default, sends nothing', () => {
  const events = [];
  const a = createAnalytics({ sink: (e) => events.push(e) });
  a.track('tile_select', { tileId: 'yt' });
  assert.equal(a.enabled, false);
  assert.deepEqual(events, []);
});

test('analytics: when enabled, minimal PII-free payload', () => {
  const events = [];
  const a = createAnalytics({ enabled: true, sink: (e) => events.push(e), now: () => 42 });
  a.track('tile_select', { tileId: 'yt', email: 'leak@example.com' });
  assert.deepEqual(events, [{ type: 'tile_select', tileId: 'yt', ts: 42 }]);
});

test('analytics: sink errors never propagate', () => {
  const a = createAnalytics({ enabled: true, sink: () => { throw new Error('boom'); } });
  assert.doesNotThrow(() => a.track('x'));
});
