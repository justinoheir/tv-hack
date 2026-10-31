/**
 * Validates launcher configuration before it reaches the UI.
 *
 * Invalid tiles are dropped (and reported) instead of crashing the app, so
 * a typo in one tile doesn't leave the TV showing a blank screen.
 *
 * Security: URL tiles are restricted to http(s). This blocks `javascript:`,
 * `file:` and similar schemes that could run code or read local files if the
 * config is ever loaded from somewhere other than the bundled file.
 *
 * Pure module: no DOM, no Tizen APIs.
 */

const ID_PATTERN = /^[a-z0-9-]{1,40}$/;
const MAX_LABEL = 40;

/**
 * @typedef {{ id: string, label: string, appId?: string, url?: string }} Tile
 * @typedef {{ columns: number, tiles: Tile[], features: Record<string, boolean> }} LauncherConfig
 */

/**
 * @param {unknown} raw
 * @returns {{ config: LauncherConfig, errors: string[] }}
 */
export function validateConfig(raw) {
  const errors = [];
  const src = raw && typeof raw === 'object' ? /** @type {any} */ (raw) : {};

  let columns = src.columns;
  if (!Number.isInteger(columns) || columns < 1 || columns > 12) {
    errors.push(`columns must be an integer 1-12; using 4`);
    columns = 4;
  }

  const features = {};
  if (src.features && typeof src.features === 'object') {
    for (const [k, v] of Object.entries(src.features)) {
      if (typeof v === 'boolean') features[k] = v;
      else errors.push(`feature "${k}" must be boolean; ignored`);
    }
  }

  const tiles = [];
  const seen = new Set();
  const list = Array.isArray(src.tiles) ? src.tiles : [];
  if (!Array.isArray(src.tiles)) errors.push('tiles must be an array');

  list.forEach((t, i) => {
    const problem = tileProblem(t, seen);
    if (problem) {
      errors.push(`tile[${i}]: ${problem}; skipped`);
      return;
    }
    seen.add(t.id);
    tiles.push(
      t.appId
        ? { id: t.id, label: t.label, appId: t.appId }
        : { id: t.id, label: t.label, url: t.url },
    );
  });

  return { config: { columns, tiles, features }, errors };
}

function tileProblem(t, seen) {
  if (!t || typeof t !== 'object') return 'not an object';
  if (typeof t.id !== 'string' || !ID_PATTERN.test(t.id)) return 'id must match [a-z0-9-]{1,40}';
  if (seen.has(t.id)) return `duplicate id "${t.id}"`;
  if (typeof t.label !== 'string' || !t.label.trim() || t.label.length > MAX_LABEL) {
    return `label must be 1-${MAX_LABEL} characters`;
  }
  const hasApp = typeof t.appId === 'string' && t.appId.length > 0;
  const hasUrl = typeof t.url === 'string' && t.url.length > 0;
  if (hasApp === hasUrl) return 'exactly one of appId or url is required';
  if (hasUrl && !isSafeUrl(t.url)) return 'url must be http(s)';
  return null;
}

/** @param {string} value */
export function isSafeUrl(value) {
  try {
    const u = new URL(value);
    return u.protocol === 'http:' || u.protocol === 'https:';
  } catch {
    return false;
  }
}
