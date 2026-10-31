import { test } from 'node:test';
import assert from 'node:assert/strict';
import { mapKey } from '../src/core/keys.js';
import { nextIndex } from '../src/core/navigation.js';
import { validateConfig, isSafeUrl } from '../src/core/config.js';

test('mapKey: remote and desktop keys', () => {
  assert.equal(mapKey(37), 'left');
  assert.equal(mapKey(40), 'down');
  assert.equal(mapKey(13), 'select');
  assert.equal(mapKey(10009), 'back');
  assert.equal(mapKey(27), 'back');
  assert.equal(mapKey(65), null);
  assert.equal(mapKey(Number('constructor')), null); // NaN / prototype keys don't leak
});

// Grid of 6 items, 4 columns:
//  0 1 2 3
//  4 5
test('nextIndex: horizontal moves stop at row edges', () => {
  assert.equal(nextIndex(0, 'left', 6, 4), 0);
  assert.equal(nextIndex(3, 'right', 6, 4), 3);
  assert.equal(nextIndex(4, 'left', 6, 4), 4); // no wrap to previous row
  assert.equal(nextIndex(5, 'right', 6, 4), 5); // no item to the right
  assert.equal(nextIndex(1, 'right', 6, 4), 2);
});

test('nextIndex: vertical moves', () => {
  assert.equal(nextIndex(1, 'down', 6, 4), 5);
  assert.equal(nextIndex(5, 'up', 6, 4), 1);
  assert.equal(nextIndex(0, 'up', 6, 4), 0);
  assert.equal(nextIndex(4, 'down', 6, 4), 4); // already last row
});

test('nextIndex: down into a partial row lands on its last item', () => {
  assert.equal(nextIndex(3, 'down', 6, 4), 5);
  assert.equal(nextIndex(2, 'down', 6, 4), 5);
});

test('nextIndex: defensive inputs', () => {
  assert.equal(nextIndex(0, 'down', 0, 4), 0);
  assert.equal(nextIndex(99, 'left', 6, 4), 4); // out-of-range current clamped to 5, then left
  assert.equal(nextIndex(NaN, 'right', 6, 4), 1);
  assert.throws(() => nextIndex(0, 'left', 6, 0), RangeError);
});

test('validateConfig: accepts a good config', () => {
  const { config, errors } = validateConfig({
    columns: 3,
    tiles: [
      { id: 'yt', label: 'YouTube', appId: '111299001912' },
      { id: 'ha', label: 'Home', url: 'https://ha.local' },
    ],
    features: { analytics: false },
  });
  assert.deepEqual(errors, []);
  assert.equal(config.columns, 3);
  assert.equal(config.tiles.length, 2);
  assert.deepEqual(config.features, { analytics: false });
});

test('validateConfig: drops bad tiles and reports why', () => {
  const { config, errors } = validateConfig({
    columns: 0,
    tiles: [
      { id: 'ok', label: 'OK', appId: '1' },
      { id: 'ok', label: 'Dup', appId: '2' },
      { id: 'Bad Id', label: 'x', appId: '3' },
      { id: 'both', label: 'x', appId: '4', url: 'https://a' },
      { id: 'none', label: 'x' },
      { id: 'js', label: 'x', url: 'javascript:alert(1)' },
      { id: 'nolabel', label: '  ', appId: '5' },
      null,
    ],
    features: { analytics: 'yes' },
  });
  assert.equal(config.columns, 4);
  assert.deepEqual(config.tiles.map((t) => t.id), ['ok']);
  assert.equal(errors.length, 9); // columns + feature + 7 tiles
  assert.deepEqual(config.features, {});
});

test('validateConfig: garbage input yields empty, safe config', () => {
  const { config } = validateConfig(undefined);
  assert.deepEqual(config, { columns: 4, tiles: [], features: {} });
});

test('isSafeUrl: only http(s)', () => {
  assert.equal(isSafeUrl('http://x.local:8123'), true);
  assert.equal(isSafeUrl('https://x'), true);
  assert.equal(isSafeUrl('javascript:alert(1)'), false);
  assert.equal(isSafeUrl('file:///etc/passwd'), false);
  assert.equal(isSafeUrl('not a url'), false);
});
