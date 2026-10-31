/**
 * Maps raw keyboard / remote-control keyCodes to semantic actions.
 *
 * Tizen TV remotes emit standard DOM keyCodes for arrows and OK, plus a
 * Tizen-specific code (10009) for the Back button. Desktop equivalents are
 * included so the app can be previewed in a normal browser.
 *
 * Pure module: no DOM, no Tizen APIs.
 */

/** @typedef {'left'|'up'|'right'|'down'|'select'|'back'} Action */

/** @type {Readonly<Record<number, Action>>} */
export const KEY_ACTIONS = Object.freeze({
  37: 'left',
  38: 'up',
  39: 'right',
  40: 'down',
  13: 'select', // OK on remote, Enter on keyboard
  10009: 'back', // Tizen remote Back
  8: 'back', // Backspace (desktop preview)
  27: 'back', // Escape (desktop preview)
});

/**
 * @param {number} keyCode
 * @returns {Action|null} the action, or null for keys we don't handle
 */
export function mapKey(keyCode) {
  return Object.hasOwn(KEY_ACTIONS, keyCode) ? KEY_ACTIONS[keyCode] : null;
}
