/**
 * Launches apps / URLs. All platform access is injected so this can be
 * unit-tested and previewed on desktop without the Tizen runtime.
 *
 * On the TV, `tizen` is the global Tizen Web API object. On desktop it is
 * undefined and we fall back to window.open for URL tiles. App tiles are
 * reported as unsupported.
 */

const VIEW_OPERATION = 'http://tizen.org/appcontrol/operation/view';

/**
 * @param {{ tizen?: any, openWindow?: (url: string) => void }} deps
 */
export function createLauncher({ tizen, openWindow } = {}) {
  /**
   * @param {{ appId?: string, url?: string }} tile
   * @returns {Promise<void>}
   */
  function launch(tile) {
    if (tile.appId) return launchApp(tile.appId);
    if (tile.url) return openUrl(tile.url);
    return Promise.reject(new Error('tile has neither appId nor url'));
  }

  function launchApp(appId) {
    if (!tizen?.application) {
      return Promise.reject(new Error(`cannot launch "${appId}" outside a Tizen TV`));
    }
    return new Promise((resolve, reject) => {
      tizen.application.launch(appId, () => resolve(), (err) => reject(toError(err)));
    });
  }

  function openUrl(url) {
    if (tizen?.application && tizen.ApplicationControl) {
      const control = new tizen.ApplicationControl(VIEW_OPERATION, url);
      return new Promise((resolve, reject) => {
        tizen.application.launchAppControl(control, null, () => resolve(), (err) => reject(toError(err)));
      });
    }
    if (openWindow) {
      openWindow(url);
      return Promise.resolve();
    }
    return Promise.reject(new Error('no way to open URLs in this environment'));
  }

  /** Exit the app (Back on the root screen). No-op outside Tizen. */
  function exit() {
    try {
      tizen?.application?.getCurrentApplication().exit();
    } catch {
      /* ignore: not running on a TV */
    }
  }

  return { launch, exit };
}

function toError(err) {
  return err instanceof Error ? err : new Error(err?.message || String(err));
}
