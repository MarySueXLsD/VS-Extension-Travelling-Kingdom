const test = require('node:test');
const assert = require('node:assert/strict');
const Module = require('module');

// Minimal stand-in for the 'vscode' module so host code can be unit tested.
const fakeVscode = {
  window: { createStatusBarItem: () => ({ show() {}, hide() {}, dispose() {} }) },
  workspace: { getConfiguration: () => ({ get: (_key, def) => def }) },
  StatusBarAlignment: { Right: 2 },
  MarkdownString: class {
    constructor() {
      this.value = '';
    }
    appendMarkdown(s) {
      this.value += s;
    }
  },
};
const originalResolve = Module._resolveFilename;
Module._resolveFilename = function (request, ...rest) {
  if (request === 'vscode') return 'vscode';
  return originalResolve.call(this, request, ...rest);
};
require.cache.vscode = { id: 'vscode', filename: 'vscode', loaded: true, exports: fakeVscode };

const { SaveStore, validateSave, LEASE_STALE_MS } = require('../dist/store.js');
const { sanitizeSummary, formatDistance, JourneyStatusBar } = require('../dist/statusBar.js');

class Memento {
  constructor() {
    this.data = new Map();
  }
  get(key, def) {
    return this.data.has(key) ? this.data.get(key) : def;
  }
  async update(key, value) {
    if (value === undefined) this.data.delete(key);
    else this.data.set(key, JSON.parse(JSON.stringify(value)));
  }
  keys() {
    return [...this.data.keys()];
  }
}

test('validateSave accepts v2 saves and rejects junk', () => {
  assert.ok(validateSave({ v: 2, hero: { id: 'queen', name: 'Q' } }));
  assert.equal(validateSave(null), null);
  assert.equal(validateSave([]), null);
  assert.equal(validateSave({ v: 1, hero: {} }), null);
  assert.equal(validateSave({ v: 2 }), null);
  assert.equal(validateSave({ v: 2, hero: {}, junk: 'x'.repeat(600 * 1024) }), null);
});

test('SaveStore hands over the 1.x save only when there is no v2 save', async () => {
  const m = new Memento();
  const store = new SaveStore(m);
  await m.update('travellingKingdom.petState', { characterId: 'female-0', level: 3 });
  assert.equal(store.load().state, null);
  assert.equal(store.load().legacy.level, 3);
  assert.equal(await store.save({ v: 2, hero: { id: 'queen', name: 'Q' } }), true);
  assert.equal(store.load().legacy, null);
  assert.equal(store.load().state.hero.name, 'Q');
  assert.equal(await store.save({ nope: true }), false);
  await store.saveSummary({ hero: 'Q' });
  await store.reset();
  assert.deepEqual(store.load(), { state: null, legacy: null });
  assert.equal(store.loadSummary(), undefined);
});

test('leases are exclusive until they go stale', async () => {
  const store = new SaveStore(new Memento());
  const t0 = 1_000_000;
  assert.ok(store.isLeaseFree('a', t0));
  await store.claimLease('a', t0);
  assert.ok(store.isLeaseFree('a', t0 + 1000));
  assert.ok(!store.isLeaseFree('b', t0 + 1000));
  assert.ok(store.isLeaseFree('b', t0 + LEASE_STALE_MS + 1));
  await store.releaseLease('b');
  assert.equal(store.getLease().id, 'a');
  await store.releaseLease('a');
  assert.equal(store.getLease(), null);
});

test('sanitizeSummary clamps and truncates webview input', () => {
  const s = sanitizeSummary({ hero: 'Queen Q', dest: 'x'.repeat(200), meters: -5, leg: 100, morale: 400, waiting: 'hack', units: 'imperial', party: 0 });
  assert.equal(s.dest.length, 60);
  assert.equal(s.meters, 0);
  assert.equal(s.morale, 100);
  assert.equal(s.waiting, null);
  assert.equal(s.party, 1);
  assert.equal(sanitizeSummary(null), null);
  assert.equal(formatDistance(1500, 'metric'), '1.5 km');
  assert.equal(formatDistance(100, 'imperial'), '328 ft');
});

test('status bar renders every state without throwing', () => {
  const bar = new JourneyStatusBar('travellingKingdom.focus');
  bar.update(sanitizeSummary({ hero: 'Queen Q', title: 'Self-Proclaimed Queen', dest: 'Puddleford', meters: 40, leg: 400, party: 3 }));
  bar.update(sanitizeSummary({ hero: 'Queen Q', dest: 'Puddleford', waiting: 'event', waitingText: 'The Goose' }));
  bar.update(sanitizeSummary({ hero: 'Queen Q', dest: 'Puddleford', arrived: true }));
  bar.update(null);
  bar.dispose();
});
