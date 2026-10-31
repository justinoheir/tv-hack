/**
 * Integration: real core + ui + services, wired by createApp, driven by
 * remote keyCodes, against a fake DOM and fake Tizen runtime.
 */
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { createApp } from '../src/app.js';
import { createLauncher } from '../src/services/launcher.js';
import { createAnalytics } from '../src/services/analytics.js';
import bundledConfig from '../src/config.js';
import { fakeTizen, fakeDocument, FakeElement } from './fakes.js';

const KEY = { LEFT: 37, UP: 38, RIGHT: 39, DOWN: 40, OK: 13, BACK: 10009 };

function setup(rawConfig = bundledConfig, tizenOpts) {
  const tizen = fakeTizen(tizenOpts);
  const events = [];
  const warnings = [];
  const root = new FakeElement('main');
  const statusEl = new FakeElement('p');
  const app = createApp({
    doc: fakeDocument,
    root,
    statusEl,
    rawConfig,
    launcher: createLauncher({ tizen }),
    analytics: createAnalytics({ enabled: true, sink: (e) => events.push(e) }),
    logger: { warn: (m) => warnings.push(m) },
  });
  const focusedId = () => root.children.find((c) => c.classList.contains('focused'))?.getAttribute('data-id');
  return { app, tizen, root, statusEl, events, warnings, focusedId };
}

test('bundled config is valid', () => {
  const { app, warnings } = setup();
  assert.deepEqual(warnings, []);
  assert.ok(app.config.tiles.length > 0);
});

test('renders one tile per config entry, first focused', () => {
  const { root, focusedId, app } = setup();
  assert.equal(root.children.length, app.config.tiles.length);
  assert.equal(focusedId(), app.config.tiles[0].id);
  assert.equal(root.children[0].getAttribute('aria-selected'), 'true');
});

test('remote navigation moves focus through the grid', async () => {
  const { app, focusedId } = setup();
  await app.handleKey(KEY.RIGHT);
  assert.equal(focusedId(), app.config.tiles[1].id);
  await app.handleKey(KEY.DOWN);
  assert.equal(focusedId(), app.config.tiles[5].id); // 6 tiles, 4 cols: 1 → 5
  await app.handleKey(KEY.UP);
  assert.equal(focusedId(), app.config.tiles[1].id);
});

test('OK launches the focused app and emits one analytics event', async () => {
  const { app, tizen, events, statusEl } = setup();
  await app.handleKey(KEY.RIGHT);
  await app.handleKey(KEY.OK);
  assert.deepEqual(tizen.calls, [['launch', app.config.tiles[1].appId]]);
  assert.equal(events.length, 1);
  assert.equal(events[0].tileId, app.config.tiles[1].id);
  assert.equal(statusEl.textContent, '');
});

test('launch failure shows a readable status, app keeps working', async () => {
  const { app, statusEl, focusedId } = setup(undefined, { failLaunch: 'NotFoundError' });
  await app.handleKey(KEY.OK);
  assert.match(statusEl.textContent, /Couldn't open .*NotFoundError/);
  await app.handleKey(KEY.RIGHT);
  assert.equal(focusedId(), app.config.tiles[1].id);
});

test('double OK while launching launches once', async () => {
  const { app, tizen } = setup();
  await Promise.all([app.handleKey(KEY.OK), app.handleKey(KEY.OK)]);
  assert.equal(tizen.calls.filter((c) => c[0] === 'launch').length, 1);
});

test('Back exits the app; unknown keys are ignored', async () => {
  const { app, tizen } = setup();
  assert.equal(await app.handleKey(65), false);
  assert.equal(await app.handleKey(KEY.BACK), true);
  assert.deepEqual(tizen.calls, [['exit']]);
});

test('empty/invalid config shows guidance instead of a blank screen', async () => {
  const { root, app, warnings } = setup({ tiles: 'nope' });
  assert.equal(root.children.length, 1);
  assert.match(root.children[0].textContent, /No tiles configured/);
  assert.ok(warnings.length > 0);
  assert.equal(await app.handleKey(KEY.OK), true); // no crash
});

test('labels are rendered as text, not markup', () => {
  const { root } = setup({ columns: 2, tiles: [{ id: 'x', label: '<img onerror=alert(1)>', appId: '1' }] });
  assert.equal(root.children[0].textContent, '<img onerror=alert(1)>');
  assert.equal(root.children[0].children.length, 0);
});
