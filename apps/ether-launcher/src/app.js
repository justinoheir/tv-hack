/**
 * Wires logic + presentation + services together. No globals: everything
 * is passed in, so the whole app can run under test with fakes.
 */
import { mapKey } from './core/keys.js';
import { nextIndex } from './core/navigation.js';
import { validateConfig } from './core/config.js';
import { renderGrid, setFocus, showStatus } from './ui/grid-view.js';

/**
 * @param {{
 *   doc: Document, root: HTMLElement, statusEl: HTMLElement,
 *   rawConfig: unknown,
 *   launcher: { launch: (tile: object) => Promise<void>, exit: () => void },
 *   analytics: { track: (type: string, data?: object) => void },
 *   logger?: Pick<Console, 'warn'>,
 * }} deps
 */
export function createApp({ doc, root, statusEl, rawConfig, launcher, analytics, logger = console }) {
  const { config, errors } = validateConfig(rawConfig);
  errors.forEach((e) => logger.warn(`[config] ${e}`));

  const state = { focus: 0, busy: false };
  renderGrid(doc, root, config.tiles, config.columns);
  setFocus(root, state.focus);

  /**
   * Handle one key press.
   * @param {number} keyCode
   * @returns {Promise<boolean>} true if the key was handled (caller should preventDefault)
   */
  async function handleKey(keyCode) {
    const action = mapKey(keyCode);
    if (!action) return false;

    if (action === 'back') {
      launcher.exit();
      return true;
    }
    if (config.tiles.length === 0) return true;

    if (action === 'select') {
      if (state.busy) return true; // ignore double-presses while launching
      const tile = config.tiles[state.focus];
      state.busy = true;
      showStatus(statusEl, `Opening ${tile.label}…`);
      analytics.track('tile_select', { tileId: tile.id });
      try {
        await launcher.launch(tile);
        showStatus(statusEl, '');
      } catch (err) {
        showStatus(statusEl, `Couldn't open ${tile.label}: ${err.message}`);
      } finally {
        state.busy = false;
      }
      return true;
    }

    state.focus = nextIndex(state.focus, action, config.tiles.length, config.columns);
    setFocus(root, state.focus);
    return true;
  }

  return { handleKey, state, config, errors };
}
