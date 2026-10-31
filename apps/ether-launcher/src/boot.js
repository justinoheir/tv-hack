/**
 * Browser/TV entry point. The only file that touches globals.
 */
import rawConfig from './config.js';
import { createApp } from './app.js';
import { createLauncher } from './services/launcher.js';
import { createAnalytics } from './services/analytics.js';

const tizen = globalThis.tizen; // undefined in a desktop browser

const app = createApp({
  doc: document,
  root: document.getElementById('grid'),
  statusEl: document.getElementById('status'),
  rawConfig,
  launcher: createLauncher({
    tizen,
    openWindow: (url) => window.open(url, '_blank', 'noopener'),
  }),
  analytics: createAnalytics({
    enabled: rawConfig.features?.analytics === true,
    // sink: (event) => { /* supply your own: CDP, local log, etc. */ },
  }),
});

const HANDLED_KEYS = new Set([37, 38, 39, 40, 13, 10009, 8, 27]);
document.addEventListener('keydown', (e) => {
  // preventDefault must be synchronous (e.g. stop Backspace navigating back in a desktop browser).
  if (HANDLED_KEYS.has(e.keyCode)) e.preventDefault();
  app.handleKey(e.keyCode);
});

if (app.config.features.showClock) {
  const clock = document.getElementById('clock');
  const tick = () => {
    clock.textContent = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };
  tick();
  setInterval(tick, 15_000);
}
