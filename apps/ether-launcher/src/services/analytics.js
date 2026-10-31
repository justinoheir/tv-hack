/**
 * Analytics/CDP hook. OFF by default.
 *
 * Data classification: first-party behavioural events.
 * Payload is deliberately minimal and contains no PII: { type, tileId, ts }.
 * There is NO built-in network endpoint. If you enable this, you supply the
 * `sink` and are responsible for consent (GDPR/CASL) and retention.
 */

/**
 * @param {{ enabled?: boolean, sink?: (event: object) => void, now?: () => number }} opts
 */
export function createAnalytics({ enabled = false, sink, now = Date.now } = {}) {
  const active = enabled === true && typeof sink === 'function';
  return {
    enabled: active,
    /** @param {string} type @param {{ tileId?: string }} [data] */
    track(type, data = {}) {
      if (!active) return;
      try {
        sink({ type, tileId: data.tileId ?? null, ts: now() });
      } catch {
        // Analytics must never break the UI.
      }
    },
  };
}
