/** Test doubles for the Tizen Web API and a minimal DOM. */

export function fakeTizen({ failLaunch } = {}) {
  const calls = [];
  return {
    calls,
    ApplicationControl: class {
      constructor(operation, uri) {
        this.operation = operation;
        this.uri = uri;
      }
    },
    application: {
      launch(id, ok, fail) {
        calls.push(['launch', id]);
        queueMicrotask(() => (failLaunch ? fail({ message: failLaunch }) : ok()));
      },
      launchAppControl(control, _appId, ok) {
        calls.push(['appControl', control.operation, control.uri]);
        queueMicrotask(ok);
      },
      getCurrentApplication() {
        return { exit: () => calls.push(['exit']) };
      },
    },
  };
}

class FakeClassList {
  constructor() { this.set = new Set(); }
  add(c) { this.set.add(c); }
  remove(c) { this.set.delete(c); }
  contains(c) { return this.set.has(c); }
  toggle(c, force) { (force ?? !this.set.has(c)) ? this.set.add(c) : this.set.delete(c); }
}

export class FakeElement {
  constructor(tag) {
    this.tagName = tag.toUpperCase();
    this.children = [];
    this.attributes = {};
    this.classList = new FakeClassList();
    this.textContent = '';
  }
  get firstChild() { return this.children[0] ?? null; }
  appendChild(c) { this.children.push(c); return c; }
  removeChild(c) { this.children = this.children.filter((x) => x !== c); return c; }
  setAttribute(k, v) { this.attributes[k] = String(v); }
  getAttribute(k) { return this.attributes[k] ?? null; }
}

export const fakeDocument = { createElement: (tag) => new FakeElement(tag) };
