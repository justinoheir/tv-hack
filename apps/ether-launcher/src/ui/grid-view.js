/**
 * Presentation only: builds the tile grid and shows focus.
 * Uses a minimal DOM surface (createElement, appendChild, removeChild,
 * textContent, setAttribute, classList) so it can be tested with a fake DOM.
 *
 * Labels are set via textContent, never innerHTML, so config text can't
 * inject markup.
 */

/**
 * @param {Document} doc
 * @param {HTMLElement} root
 * @param {{ id: string, label: string }[]} tiles
 * @param {number} columns
 */
export function renderGrid(doc, root, tiles, columns) {
  while (root.firstChild) root.removeChild(root.firstChild);
  root.setAttribute('role', 'grid');
  root.setAttribute('style', `--columns:${columns}`);

  if (tiles.length === 0) {
    const empty = doc.createElement('p');
    empty.classList.add('empty');
    empty.textContent = 'No tiles configured. Edit src/config.js.';
    root.appendChild(empty);
    return;
  }

  for (const tile of tiles) {
    const el = doc.createElement('div');
    el.classList.add('tile');
    el.setAttribute('role', 'gridcell');
    el.setAttribute('data-id', tile.id);
    el.textContent = tile.label;
    root.appendChild(el);
  }
}

/**
 * @param {HTMLElement} root
 * @param {number} index
 */
export function setFocus(root, index) {
  const cells = Array.from(root.children).filter((c) => c.classList.contains('tile'));
  cells.forEach((cell, i) => {
    const focused = i === index;
    cell.classList.toggle('focused', focused);
    cell.setAttribute('aria-selected', String(focused));
  });
}

/**
 * @param {HTMLElement} statusEl
 * @param {string} message empty string clears it
 */
export function showStatus(statusEl, message) {
  statusEl.textContent = message;
}
