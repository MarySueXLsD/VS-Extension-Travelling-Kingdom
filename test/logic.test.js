const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('fs');
const path = require('path');
const { loadGame } = require('./load-game');

const TK = loadGame();
const L = TK.logic;
const D = TK.data;

function clone(x) {
  return JSON.parse(JSON.stringify(x));
}

function fullPartyState() {
  const s = L.createState('king', 'Tester', 1);
  s.party = Object.keys(D.companions);
  s.res.gold = 500;
  s.res.food = 200;
  s.story.prologue = true;
  return s;
}

function readAtlas() {
  const atlas = fs.readFileSync(path.join(__dirname, '..', 'media', 'js', 'gen', 'atlas.js'), 'utf8');
  return JSON.parse(atlas.slice(atlas.indexOf('=') + 1).trim().replace(/;$/, ''));
}

test('content has no structural problems', () => {
  assert.deepEqual(L.indexData(), []);
  assert.ok(D.events.length >= 100, 'expected at least 100 road events, got ' + D.events.length);
  assert.ok(D.banter.length >= 120, 'expected plenty of banter');
  assert.equal(D.route.length, 18);
});

test('every location on the route has a scene, and every recruit is a companion', () => {
  for (const id of D.route) {
    const loc = D.locations[id];
    assert.ok(loc, id);
    assert.ok(D.scenes[loc.scene], 'scene for ' + id);
    if (loc.recruit) assert.ok(D.companions[loc.recruit], 'recruit for ' + id);
  }
  const recruits = D.route.map((id) => D.locations[id].recruit).filter(Boolean);
  assert.equal(new Set(recruits).size, recruits.length, 'each companion recruited once');
  assert.equal(recruits.length + 1, Object.keys(D.companions).length, 'route recruits everyone except Quill');
});

test('scene props, actors, portraits and icons exist in the atlas', () => {
  const m = readAtlas();
  const propIds = (p) => (typeof p === 'string' ? [p] : Object.values(p));
  for (const [id, scene] of Object.entries(D.scenes)) {
    for (const p of scene.props || []) for (const pid of propIds(p.p)) assert.ok(m.props[pid], `prop ${pid} in scene ${id}`);
    for (const n of scene.npcs || []) assert.ok(m.actors[n.a], `actor ${n.a} in scene ${id}`);
  }
  for (const c of Object.values(D.companions)) assert.ok(m.actors[c.actor] && m.portraits[c.actor], 'companion art ' + c.actor);
  for (const ev of D.events) {
    if (ev.who && ev.who.a) assert.ok(m.actors[ev.who.a], 'event actor ' + ev.who.a);
    if (ev.prop && ev.prop !== 'chest') assert.ok(m.props[ev.prop], 'event prop ' + ev.prop);
  }
  for (const t of Object.values(D.trinkets)) assert.ok(m.icons[t.icon], 'trinket icon ' + t.icon);
  for (const b of D.beats) if (b.actor) assert.ok(m.actors[b.actor], 'beat actor ' + b.actor);
});

test('every choice of every event resolves cleanly', () => {
  const rng = TK.util.makeRng(7);
  for (const ev of D.events) {
    for (let i = 0; i < ev.choices.length; i++) {
      for (let run = 0; run < 3; run++) {
        const s = fullPartyState();
        const r = L.resolveChoice(s, ev, i, { night: run === 1, biome: 'green', rng }, rng, { random: 'wren' });
        assert.equal(typeof r.t, 'string');
        assert.ok(r.t.length > 0, `${ev.id}#${i} has outcome text`);
        assert.ok(!/\{[a-zA-Z]+(:[a-z0-9_]+)?\}/.test(r.t), `${ev.id}#${i} left a template token: ${r.t}`);
        assert.ok(s.res.gold >= 0 && s.res.food >= 0 && s.res.morale >= 0 && s.res.morale <= 100);
      }
    }
  }
});

test('all story and event text uses only known template tokens', () => {
  const known = new Set(['hero', 'HERO', 'ruler', 'Ruler', 'majesty', 'Majesty', 'title', 'm', 'member', 'random', 'dest', 'party', 'gold']);
  const scan = (text, where) => {
    for (const match of String(text).matchAll(/\{([a-zA-Z]+)(?::([a-z0-9_]+))?\}/g)) {
      assert.ok(known.has(match[1]), `unknown token ${match[0]} in ${where}`);
      if (match[1] === 'm') assert.ok(D.companions[match[2]], `unknown companion in ${match[0]} (${where})`);
    }
  };
  for (const ev of D.events) {
    scan(ev.text, ev.id);
    for (const ch of ev.choices) {
      scan(ch.t, ev.id);
      for (const o of [ch.ok, ch.roll && ch.roll.win, ch.roll && ch.roll.lose].concat(ch.outcomes || [])) if (o) scan(o.t, ev.id);
    }
  }
  const lines = [].concat(D.prologue.lines, D.finale.lines, ...D.beats.map((b) => b.lines), ...Object.values(D.locations).map((l) => l.story || []));
  const walk = (list) => {
    for (const ln of list) {
      if (Array.isArray(ln)) scan(ln[1], ln[0]);
      else if (ln && ln.choice) for (const c of ln.choice) {
        scan(c.t, 'choice');
        walk(c.then || []);
      }
    }
  };
  walk(lines);
  for (const b of D.banter) {
    if (b.t) scan(b.t, 'banter');
    for (const ln of b.lines || []) scan(ln[1], 'banter');
  }
});

test('dialogue speakers are known characters', () => {
  const known = (id) => id === 'hero' || id === 'narrator' || id === 'any' || D.companions[id] || D.speakers[id] || Object.values(D.locations).some((l) => l.names && l.names[id]);
  const walk = (list, where) => {
    for (const ln of list) {
      if (Array.isArray(ln)) assert.ok(known(ln[0]), `unknown speaker ${ln[0]} in ${where}`);
      else if (ln && ln.choice) for (const c of ln.choice) walk(c.then || [], where);
    }
  };
  walk(D.prologue.lines, 'prologue');
  walk(D.finale.lines, 'finale');
  for (const b of D.beats) walk(b.lines, b.id);
  for (const [id, l] of Object.entries(D.locations)) walk(l.story || [], id);
});

test('templates fill hero and companion names', () => {
  const s = fullPartyState();
  assert.equal(L.fill('{hero} the {Ruler} meets {m:wren}', s, {}), 'Tester the King meets Wren');
  assert.equal(L.fill('{majesty}', s, {}), 'Your Majesty');
});

test('walking consumes rations and arrives exactly at the leg end', () => {
  const s = L.createState('queen', 'Q', 1);
  const leg = L.legLength(s);
  const before = s.res.food;
  let arrived = false;
  for (let m = 0; m < leg + 50; m++) {
    const notes = L.advance(s, 1, {});
    if (notes.some((n) => n.k === 'arrive')) arrived = true;
  }
  assert.ok(arrived);
  assert.equal(s.journey.meters, leg);
  assert.ok(s.res.food < before);
  const total = s.journey.total;
  L.advance(s, 10, {});
  assert.equal(s.journey.total, total, 'no progress once arrived');
});

test('hunger slows the court and lowers morale, never below the floor', () => {
  const s = L.createState('queen', 'Q', 1);
  s.res.food = 0;
  s.res.morale = 30;
  const fed = L.createState('queen', 'Q', 1);
  fed.res.morale = 30;
  assert.ok(L.speedMps(s, {}) < L.speedMps(fed, {}));
  for (let i = 0; i < 100; i++) L.advance(s, 1, {});
  assert.ok(s.res.morale < 30);
  s.party = ['agatha'];
  s.res.morale = 26;
  for (let i = 0; i < 100; i++) L.advance(s, 1, {});
  assert.ok(s.res.morale >= 25, 'Sister Agatha keeps morale at 25+');
});

test('depart advances through the route into endless mode', () => {
  const s = L.createState('queen', 'Q', 1);
  for (let i = 0; i < D.route.length; i++) {
    s.journey.meters = L.legLength(s);
    s.journey.arrived = true;
    L.depart(s, Math.random);
  }
  assert.ok(L.inEndless(s));
  const loc = L.currentDestination(s);
  assert.ok(loc.endless && loc.name && loc.leg >= 900);
  assert.deepEqual(L.endlessLocation(s, 30), L.endlessLocation(s, 30), 'endless places are deterministic');
});

test('normalizeState survives garbage and repairs bad fields', () => {
  assert.equal(L.normalizeState(null), null);
  assert.equal(L.normalizeState({ v: 1 }), null);
  assert.equal(L.normalizeState('nope'), null);
  const s = clone(L.createState('queen', 'Q', 1));
  s.res.gold = -50;
  s.res.morale = 900;
  s.party = ['wren', 'not-a-companion', 'wren'];
  s.journey.route = ['dustmuster', 'bogus'];
  s.journey.meters = 1e9;
  s.settings.eventFreq = 'always';
  s.trinkets = ['horseshoe', 'fake'];
  const n = L.normalizeState(s);
  assert.equal(n.res.gold, 0);
  assert.equal(n.res.morale, 100);
  assert.deepEqual(n.party, ['wren']);
  assert.equal(n.journey.route.length, D.route.length);
  assert.equal(n.journey.route[n.journey.route.length - 1], 'dragonsrest');
  assert.equal(n.journey.arrived, true);
  assert.equal(n.settings.eventFreq, 'normal');
  assert.deepEqual(n.trinkets, ['horseshoe']);
});

test('1.x saves migrate with companions, route and settings', () => {
  const legacy = {
    characterId: 'female-0',
    name: 'Elizabeth',
    level: 4,
    meters: 120,
    partySize: 4,
    awaitingDeparture: false,
    distanceUnit: 'imperial',
    minimalUi: true,
    recruitLandmarkOrder: ['grove', 'tent', 'cloister', 'camp', 'town', 'stone', 'market', 'male0', 'male1', 'male2', 'male6', 'male8', 'male10', 'female11'],
  };
  const s = L.migrateLegacy(legacy, 1);
  assert.equal(s.hero.id, 'queen');
  assert.equal(s.hero.name, 'Elizabeth');
  assert.deepEqual(s.party, ['agatha', 'halbert', 'hazel', 'quill']);
  assert.deepEqual(s.journey.route.slice(0, 3), ['applegrove', 'watchtent', 'cloister']);
  assert.equal(s.journey.stop, 3);
  assert.equal(L.currentDestination(s).id, 'dustmuster');
  assert.equal(s.settings.units, 'imperial');
  assert.equal(s.settings.minimalUi, true);
  assert.equal(s.story.prologue, true);
  const n = L.normalizeState(clone(s));
  assert.deepEqual(n.party, s.party);
  assert.deepEqual(n.journey.route, s.journey.route);
  const arrived = L.migrateLegacy(Object.assign({}, legacy, { awaitingDeparture: true }), 1);
  assert.equal(arrived.journey.arrived, true);
  assert.equal(L.migrateLegacy({ level: 1 }), null);
});

test('services charge, reward and only work once per visit', () => {
  const s = L.createState('queen', 'Q', 1);
  s.res.gold = 100;
  L.beginVisit(s);
  assert.ok(!L.useService(s, 'inn', Math.random).error);
  assert.ok(L.useService(s, 'inn', Math.random).error);
  const gold = s.res.gold;
  L.useService(s, 'rations10', Math.random);
  assert.ok(s.res.gold < gold);
  const offers = L.marketOffers(s, Math.random);
  assert.equal(offers.length, 2);
  s.res.gold = 1000;
  assert.ok(!L.buyTrinket(s, offers[0]).error);
  assert.ok(s.trinkets.includes(offers[0]));
});

test('titles rise with renown and the crowned titles need the finale', () => {
  const s = L.createState('king', 'K', 1);
  assert.equal(L.titleFor(s), 'Self-Proclaimed King');
  s.res.renown = 5000;
  assert.equal(L.titleFor(s), 'High King of Nearly Everywhere');
  s.flags.crowned = true;
  assert.equal(L.titleFor(s), 'King of Song and Story');
});

test('event picking respects requirements and never picks chain-only events', () => {
  const s = L.createState('queen', 'Q', 1);
  s.story.prologue = true;
  const rng = TK.util.makeRng(3);
  for (let i = 0; i < 300; i++) {
    const ev = L.pickEvent(s, { biome: 'green', night: false, rng }, rng);
    assert.ok(ev);
    assert.ok(!ev.chainOnly);
    assert.ok(L.checkReq(s, ev.req, { biome: 'green' }).ok, ev.id + ' requirement');
    L.markEventSeen(s, ev.id);
  }
});

test('achievements unlock from state once', () => {
  const s = L.createState('queen', 'Q', 1);
  s.journey.total = 150;
  const got = L.checkAchievements(s).map((a) => a.id);
  assert.ok(got.includes('firststeps'));
  assert.deepEqual(L.checkAchievements(s), []);
});
