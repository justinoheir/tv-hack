/**
 * Launcher configuration. Edit this file to change your tiles.
 *
 * Data classification: zero-party (chosen by the household). Stays on the TV.
 *
 * App IDs are the widely published Samsung Tizen store IDs. Check them on your
 * set with `sdb shell 0 vd_applist` (see docs/05-custom-app.md), because Samsung
 * occasionally changes them.
 */
export default {
  columns: 4,

  tiles: [
    { id: 'youtube', label: 'YouTube', appId: '111299001912' },
    { id: 'netflix', label: 'Netflix', appId: '3201907018807' },
    { id: 'prime', label: 'Prime Video', appId: '3201910019365' },
    { id: 'disney', label: 'Disney+', appId: '3201901017640' },
    { id: 'plex', label: 'Plex', appId: '3201512006963' },
    // Example URL tile: replace with your own LAN service (e.g. Home Assistant).
    { id: 'home', label: 'Home Dashboard', url: 'http://homeassistant.local:8123' },
  ],

  // Feature flags: new behaviour ships off and is turned on here.
  features: {
    analytics: false, // see src/services/analytics.js before enabling
    showClock: true,
  },
};
