/**
 * Grid focus navigation for remote-control (D-pad) input.
 *
 * Items are laid out row-major in a grid of `columns` columns; the last row
 * may be partial. Movement never wraps. Pressing a direction at an edge
 * keeps focus where it is, which is the convention TV users expect.
 *
 * Pure module: no DOM, no Tizen APIs.
 */

/**
 * @param {number} current  currently focused index (0-based)
 * @param {'left'|'up'|'right'|'down'} direction
 * @param {number} count    total number of items
 * @param {number} columns  items per row (>= 1)
 * @returns {number} the new focused index
 */
export function nextIndex(current, direction, count, columns) {
  if (!Number.isInteger(count) || count <= 0) return 0;
  if (!Number.isInteger(columns) || columns < 1) {
    throw new RangeError(`columns must be a positive integer, got ${columns}`);
  }
  const cur = clamp(current, 0, count - 1);
  const col = cur % columns;

  switch (direction) {
    case 'left':
      return col > 0 ? cur - 1 : cur;
    case 'right':
      return col < columns - 1 && cur + 1 < count ? cur + 1 : cur;
    case 'up':
      return cur - columns >= 0 ? cur - columns : cur;
    case 'down': {
      const target = cur + columns;
      if (target < count) return target;
      // Moving down into a partial last row with no item directly below:
      // land on that row's last item instead of doing nothing.
      const lastRowStart = Math.floor((count - 1) / columns) * columns;
      return cur < lastRowStart ? count - 1 : cur;
    }
    default:
      return cur;
  }
}

function clamp(n, min, max) {
  if (!Number.isFinite(n)) return min;
  return Math.min(Math.max(Math.trunc(n), min), max);
}
