/* Travelling Kingdom — game rules. Pure functions over a plain JSON state (no DOM). */
(function (root) {
  'use strict';

  const TK = (root.TK = root.TK || {});
  const U = TK.util;

  const SAVE_VERSION = 2;
  const METER_PX = 32; // art pixels per meter
  const BASE_SPEED = 0.6; // meters per second
  const MAX_LOG = 80;
  const RECENT_EVENTS = 24;
  /** Luck from companions and trinkets stops stacking here, so risky choices stay risky. */
  const MAX_LUCK = 0.25;

  const DEFAULT_SETTINGS = {
    units: 'metric',
    eventFreq: 'normal', // often | normal | rare | off
    banter: 'normal', // chatty | normal | quiet | off
    minimalUi: false,
    minimalBg: false,
    dayNight: 'auto', // auto | day | night
    weather: true,
    reduceMotion: false,
    autoResolve: false,
    fps: 30,
  };

  const EVENT_SPACING = {
    often: [45, 95],
    normal: [70, 150],
    rare: [150, 280],
    off: [Infinity, Infinity],
  };

  const BANTER_SPACING = {
    chatty: [12, 28],
    normal: [26, 55],
    quiet: [60, 120],
    off: [Infinity, Infinity],
  };

  // v1 recruit kinds -> v2 companion ids
  const LEGACY_KIND_TO_COMPANION = {
    camp: 'wren',
    grove: 'hazel',
    town: 'marta',
    tent: 'halbert',
    stone: 'odalys',
    market: 'bellwether',
    cloister: 'agatha',
    male0: 'gruff',
    male1: 'pell',
    male2: 'murk',
    male6: 'brom',
    male8: 'fennick',
    male10: 'clanksworth',
    female11: 'elsie',
  };

  function data() {
    return TK.data || {};
  }

  function now() {
    return Date.now();
  }

  // ---------------------------------------------------------------------------
  // Route & locations
  // ---------------------------------------------------------------------------

  function mainRoute() {
    return (data().route || []).slice();
  }

  function locationDef(id) {
    const locs = data().locations || {};
    return locs[id] || null;
  }

  const ENDLESS_KINDS = ['village', 'market', 'camp', 'farm', 'mill', 'forge', 'shrine', 'graveyard', 'ferry', 'fair', 'orchard', 'watch'];
  const REGIONS = ['green', 'autumn', 'winter'];

  /** Deterministic procedural location for endless mode. */
  function endlessLocation(state, index) {
    const seed = (state.journey.endlessSeed || 7) + index * 7919;
    const rng = U.makeRng(seed);
    const kind = ENDLESS_KINDS[Math.floor(rng() * ENDLESS_KINDS.length)];
    const names = data().placeNames || { pre: ['Little'], mid: ['Puddle'], post: ['ton'] };
    const pre = U.pick(names.pre, rng);
    const mid = U.pick(names.mid, rng);
    const post = U.pick(names.post, rng);
    let name = mid + post;
    if (rng() < 0.45) {
      name = pre + ' ' + name;
    }
    const regionIndex = Math.floor((index - mainRoute().length) / 3) % REGIONS.length;
    const template = (data().endlessKinds || {})[kind] || {};
    return {
      id: 'endless_' + index,
      endless: true,
      kind,
      name,
      region: REGIONS[(regionIndex + REGIONS.length) % REGIONS.length],
      leg: Math.round(900 + rng() * 700),
      blurb: template.blurb ? U.pick(template.blurb, rng) : 'A place on the road. It has a name. Allegedly.',
      services: template.services || ['market', 'inn', 'work'],
      scene: template.scene || null,
      greet: template.greet ? U.pick(template.greet, rng) : null,
      seedRng: seed,
    };
  }

  function routeLocation(state, index) {
    const route = state.journey.route;
    if (index < route.length) {
      const def = locationDef(route[index]);
      if (def) {
        return def;
      }
    }
    return endlessLocation(state, index);
  }

  function currentDestination(state) {
    return routeLocation(state, state.journey.stop);
  }

  function legLength(state) {
    const loc = currentDestination(state);
    return Math.max(20, Math.round((loc && loc.leg) || 1000));
  }

  function inEndless(state) {
    return state.journey.stop >= state.journey.route.length;
  }

  function regionOf(state) {
    const loc = currentDestination(state);
    return (loc && loc.region) || 'green';
  }

  // ---------------------------------------------------------------------------
  // Party
  // ---------------------------------------------------------------------------

  function companionDef(id) {
    return (data().companions || {})[id] || null;
  }

  function hasMember(state, id) {
    return state.party.indexOf(id) >= 0;
  }

  function partySize(state) {
    return 1 + state.party.length;
  }

  function memberName(state, id) {
    if (id === 'hero') {
      return state.hero ? state.hero.name : 'You';
    }
    const c = companionDef(id);
    return c ? c.name : id;
  }

  function rulerWord(state) {
    return state.hero && state.hero.id === 'king' ? 'King' : 'Queen';
  }

  // ---------------------------------------------------------------------------
  // Modifiers (companion traits + trinkets + buffs)
  // ---------------------------------------------------------------------------

  const MOD_KEYS = ['speed', 'food', 'forage', 'gold100', 'renown', 'morale100', 'moraleFloor', 'luck', 'shop', 'night', 'work', 'goldMult', 'winter', 'inn'];

  function emptyMods() {
    const m = {};
    MOD_KEYS.forEach((k) => (m[k] = 0));
    return m;
  }

  function addMods(target, src) {
    if (!src) {
      return;
    }
    for (const k of Object.keys(src)) {
      if (typeof src[k] === 'number' && k in target) {
        target[k] += src[k];
      }
    }
  }

  function modifiers(state) {
    const m = emptyMods();
    for (const id of state.party) {
      const c = companionDef(id);
      if (c) {
        addMods(m, c.mods);
      }
    }
    const trinkets = data().trinkets || {};
    for (const id of state.trinkets) {
      const t = trinkets[id];
      if (t) {
        addMods(m, t.mods);
      }
    }
    return m;
  }

  function moraleTier(morale) {
    if (morale >= 90) return { id: 'jubilant', label: 'Jubilant', speed: 1.2 };
    if (morale >= 70) return { id: 'cheerful', label: 'Cheerful', speed: 1.1 };
    if (morale >= 40) return { id: 'content', label: 'Content', speed: 1.0 };
    if (morale >= 20) return { id: 'grumpy', label: 'Grumpy', speed: 0.9 };
    return { id: 'miserable', label: 'Miserable', speed: 0.8 };
  }

  /** Effective walking speed in meters/second. */
  function speedMps(state, ctx) {
    const mods = modifiers(state);
    let mult = 1 + mods.speed;
    mult *= moraleTier(state.res.morale).speed;
    if (state.res.food <= 0) {
      mult *= 0.85;
    }
    if (ctx && ctx.night) {
      mult *= 1 + mods.night;
    }
    if (regionOf(state) === 'winter') {
      mult *= 1 + mods.winter;
    }
    for (const b of state.buffs) {
      if (typeof b.speed === 'number') {
        mult *= b.speed;
      }
    }
    return BASE_SPEED * U.clamp(mult, 0.4, 3);
  }

  function foodRatePer100(state) {
    const mods = modifiers(state);
    const base = 0.6 + 0.28 * partySize(state);
    return base * U.clamp(1 + mods.food, 0.3, 2);
  }

  // ---------------------------------------------------------------------------
  // State creation / normalization / migration
  // ---------------------------------------------------------------------------

  function emptyStats(t) {
    return { events: 0, choices: 0, goldEarned: 0, goldSpent: 0, foodEaten: 0, hurries: 0, recruits: 0, started: t, hungryMeters: 0, maxGold: 0 };
  }

  function createState(heroId, name, t) {
    const time = t || now();
    const seed = (Math.random() * 0x7fffffff) | 0;
    return {
      v: SAVE_VERSION,
      createdAt: time,
      savedAt: time,
      hero: { id: heroId === 'king' ? 'king' : 'queen', name: cleanName(name) || (heroId === 'king' ? 'Arthur' : 'Elizabeth') },
      res: { gold: 15, food: 24, morale: 62, renown: 0 },
      journey: { route: mainRoute(), stop: 0, meters: 0, arrived: false, total: 0, endlessSeed: seed },
      party: [],
      flags: {},
      seen: {},
      recent: [],
      trinkets: [],
      log: [],
      pending: null,
      buffs: [],
      nextEventAt: 45,
      chain: null,
      acc: { food: 0, p100: 0, drift: 0, hungry: 0 },
      visit: { stop: -1, used: {}, storyDone: false, announced: false, offers: null },
      story: { prologue: false, beats: {}, done: {} },
      achievements: {},
      stats: emptyStats(time),
      settings: Object.assign({}, DEFAULT_SETTINGS),
    };
  }

  function cleanName(name) {
    return String(name || '')
      .replace(/[\u0000-\u001f<>]/g, '')
      .trim()
      .slice(0, 24);
  }

  function num(v, d, lo, hi) {
    const n = typeof v === 'number' && isFinite(v) ? v : d;
    return U.clamp(n, lo, hi);
  }

  function strArray(v, allowed, max) {
    if (!Array.isArray(v)) {
      return [];
    }
    const out = [];
    for (const x of v) {
      const s = String(x);
      if ((!allowed || allowed(s)) && out.indexOf(s) < 0) {
        out.push(s);
      }
      if (out.length >= (max || 200)) {
        break;
      }
    }
    return out;
  }

  /** Repair any saved object into a valid v2 state (or null if there is no hero). */
  function normalizeState(raw, t) {
    if (!raw || typeof raw !== 'object' || raw.v !== SAVE_VERSION || !raw.hero) {
      return null;
    }
    const time = t || now();
    const base = createState(raw.hero.id, raw.hero.name, raw.createdAt || time);
    const s = base;
    s.createdAt = num(raw.createdAt, time, 0, 1e15);
    s.savedAt = num(raw.savedAt, time, 0, 1e15);
    const r = raw.res || {};
    s.res = {
      gold: Math.floor(num(r.gold, 15, 0, 999999)),
      food: Math.floor(num(r.food, 20, 0, 99999)),
      morale: num(r.morale, 60, 0, 100),
      renown: Math.floor(num(r.renown, 0, 0, 9999999)),
    };
    const companions = data().companions || {};
    s.party = strArray(raw.party, (id) => !!companions[id], 40);

    const locs = data().locations || {};
    const j = raw.journey || {};
    let route = strArray(j.route, (id) => !!locs[id], 60);
    // Ensure every main-route location exists exactly once and the finale stays last.
    const main = mainRoute();
    const finale = main[main.length - 1];
    route = route.filter((id) => main.indexOf(id) >= 0 && id !== finale);
    for (const id of main) {
      if (id !== finale && route.indexOf(id) < 0) {
        route.push(id);
      }
    }
    if (finale) {
      route.push(finale);
    }
    s.journey = {
      route,
      stop: Math.floor(num(j.stop, 0, 0, 100000)),
      meters: num(j.meters, 0, 0, 1e7),
      arrived: j.arrived === true,
      total: num(j.total, 0, 0, 1e12),
      endlessSeed: Math.floor(num(j.endlessSeed, base.journey.endlessSeed, 0, 0x7fffffff)),
    };
    const leg = legLength(s);
    if (s.journey.meters >= leg) {
      s.journey.meters = leg;
      s.journey.arrived = true;
    }

    s.flags = raw.flags && typeof raw.flags === 'object' ? sanitizeFlags(raw.flags) : {};
    s.seen = raw.seen && typeof raw.seen === 'object' ? sanitizeCounts(raw.seen) : {};
    s.recent = strArray(raw.recent, null, RECENT_EVENTS);
    const trinkets = data().trinkets || {};
    s.trinkets = strArray(raw.trinkets, (id) => !!trinkets[id], 100);
    s.log = Array.isArray(raw.log)
      ? raw.log
          .filter((e) => e && typeof e.t === 'string')
          .slice(-MAX_LOG)
          .map((e) => ({ t: String(e.t).slice(0, 400), k: String(e.k || 'event').slice(0, 16), d: num(e.d, 0, 0, 1e12) }))
      : [];
    s.pending = sanitizePending(raw.pending);
    s.buffs = Array.isArray(raw.buffs)
      ? raw.buffs
          .filter((b) => b && typeof b.id === 'string')
          .slice(0, 8)
          .map((b) => ({ id: b.id, label: String(b.label || b.id).slice(0, 40), speed: num(b.speed, 1, 0.3, 3), until: num(b.until, 0, 0, 1e12) }))
      : [];
    s.nextEventAt = num(raw.nextEventAt, s.journey.total + 60, 0, 1e13);
    s.chain = raw.chain && typeof raw.chain.id === 'string' ? { id: raw.chain.id, at: num(raw.chain.at, 0, 0, 1e13) } : null;
    const acc = raw.acc || {};
    s.acc = { food: num(acc.food, 0, 0, 100), p100: num(acc.p100, 0, 0, 100), drift: num(acc.drift, 0, 0, 100), hungry: num(acc.hungry, 0, 0, 100) };
    const visit = raw.visit || {};
    s.visit = {
      stop: Math.floor(num(visit.stop, -1, -1, 100000)),
      used: visit.used && typeof visit.used === 'object' ? sanitizeFlags(visit.used) : {},
      storyDone: visit.storyDone === true,
      announced: visit.announced === true,
      offers: Array.isArray(visit.offers) ? strArray(visit.offers, (id) => !!trinkets[id], 4) : null,
    };
    const story = raw.story || {};
    s.story = {
      prologue: story.prologue === true,
      beats: story.beats && typeof story.beats === 'object' ? sanitizeFlags(story.beats) : {},
      done: story.done && typeof story.done === 'object' ? sanitizeFlags(story.done) : {},
    };
    s.achievements = raw.achievements && typeof raw.achievements === 'object' ? sanitizeFlags(raw.achievements) : {};
    const st = raw.stats || {};
    s.stats = emptyStats(s.createdAt);
    for (const k of Object.keys(s.stats)) {
      if (typeof st[k] === 'number' && isFinite(st[k])) {
        s.stats[k] = st[k];
      }
    }
    s.settings = sanitizeSettings(raw.settings);
    return s;
  }

  function sanitizeFlags(obj) {
    const out = {};
    let n = 0;
    for (const k of Object.keys(obj)) {
      const v = obj[k];
      if (typeof v === 'boolean' || (typeof v === 'number' && isFinite(v)) || (typeof v === 'string' && v.length < 60)) {
        out[k.slice(0, 60)] = v;
        if (++n > 400) {
          break;
        }
      }
    }
    return out;
  }

  function sanitizeCounts(obj) {
    const out = {};
    for (const k of Object.keys(obj)) {
      if (typeof obj[k] === 'number' && isFinite(obj[k])) {
        out[k.slice(0, 60)] = Math.max(0, Math.floor(obj[k]));
      }
    }
    return out;
  }

  function sanitizePending(p) {
    if (!p || typeof p !== 'object' || typeof p.id !== 'string') {
      return null;
    }
    const kind = p.kind === 'beat' ? 'beat' : 'event';
    return {
      kind,
      id: p.id.slice(0, 60),
      phase: p.phase === 'result' ? 'result' : 'choose',
      vars: p.vars && typeof p.vars === 'object' ? sanitizeFlags(p.vars) : {},
      result: p.result && typeof p.result.t === 'string' ? { t: p.result.t.slice(0, 1200), deltas: Array.isArray(p.result.deltas) ? p.result.deltas.slice(0, 12) : [] } : null,
    };
  }

  function sanitizeSettings(raw) {
    const s = Object.assign({}, DEFAULT_SETTINGS);
    if (!raw || typeof raw !== 'object') {
      return s;
    }
    if (raw.units === 'imperial' || raw.units === 'metric') s.units = raw.units;
    if (raw.eventFreq in EVENT_SPACING) s.eventFreq = raw.eventFreq;
    if (raw.banter in BANTER_SPACING) s.banter = raw.banter;
    if (raw.dayNight === 'auto' || raw.dayNight === 'day' || raw.dayNight === 'night') s.dayNight = raw.dayNight;
    if (raw.fps === 30 || raw.fps === 60) s.fps = raw.fps;
    for (const k of ['minimalUi', 'minimalBg', 'weather', 'reduceMotion', 'autoResolve']) {
      if (typeof raw[k] === 'boolean') s[k] = raw[k];
    }
    return s;
  }

  /** Convert a 1.x PetState into a v2 state. Returns null if it never picked a hero. */
  function migrateLegacy(old, t) {
    if (!old || typeof old !== 'object' || !old.characterId) {
      return null;
    }
    const time = t || now();
    const heroId = old.characterId === 'male-7' ? 'king' : 'queen';
    const s = createState(heroId, old.name, time);
    const party = Math.max(1, Math.min(15, Math.floor(old.partySize || 1)));
    const order = Array.isArray(old.recruitLandmarkOrder) ? old.recruitLandmarkOrder : [];
    const recruitedKinds = order.slice(0, party - 1).filter((k) => LEGACY_KIND_TO_COMPANION[k]);
    const recruited = recruitedKinds.map((k) => LEGACY_KIND_TO_COMPANION[k]);
    const companions = data().companions || {};
    // Walking order: newest closest to the hero; scribe at the back.
    s.party = recruited.slice().reverse().filter((id) => companions[id]);
    if (companions.quill) {
      s.party.push('quill');
    }
    // Route: visited homes first (in the order they were visited), then the rest.
    const main = mainRoute();
    const finale = main[main.length - 1];
    const visitedHomes = [];
    for (const id of recruited) {
      const c = companions[id];
      if (c && c.home && visitedHomes.indexOf(c.home) < 0) {
        visitedHomes.push(c.home);
      }
    }
    const rest = main.filter((id) => id !== finale && visitedHomes.indexOf(id) < 0);
    s.journey.route = visitedHomes.concat(rest, finale ? [finale] : []);
    s.journey.stop = Math.min(visitedHomes.length, s.journey.route.length - 1);
    const leg = legLength(s);
    const level = Math.max(1, Math.floor(old.level || 1));
    if (old.awaitingDeparture === true && level - 1 === recruited.length) {
      s.journey.meters = leg;
      s.journey.arrived = true;
    } else {
      const frac = U.clamp((Number(old.meters) || 0) / 500, 0, 0.9);
      s.journey.meters = Math.floor(leg * frac);
    }
    s.journey.total = Math.floor(s.journey.meters + recruited.length * 400);
    s.res.gold = 25 + 10 * recruited.length;
    s.res.food = 30 + 4 * recruited.length;
    s.res.morale = 70;
    s.res.renown = 40 * recruited.length;
    s.story.prologue = true;
    s.flags.migratedFromV1 = true;
    s.nextEventAt = s.journey.total + 40;
    s.settings.units = old.distanceUnit === 'imperial' ? 'imperial' : 'metric';
    s.settings.minimalUi = old.minimalUi === true;
    s.settings.minimalBg = old.minimalBg === true;
    s.stats.recruits = recruited.length;
    addLog(s, 'The royal chronicle was rewritten in a fancier hand. Your court remembers the road so far.', 'story');
    return s;
  }

  // ---------------------------------------------------------------------------
  // Log & titles
  // ---------------------------------------------------------------------------

  function addLog(state, text, kind) {
    state.log.push({ t: String(text).slice(0, 400), k: kind || 'event', d: Math.floor(state.journey.total) });
    if (state.log.length > MAX_LOG) {
      state.log.splice(0, state.log.length - MAX_LOG);
    }
  }

  /** Titles before the coronation and after it are separate ladders. */
  function titleLadder(state) {
    const crowned = !!state.flags.crowned;
    const all = data().titles || [{ at: 0, t: 'Self-Proclaimed {Ruler}' }];
    const ladder = all.filter((t) => !!t.crowned === crowned);
    return ladder.length ? ladder : all;
  }

  function titleFor(state) {
    const titles = titleLadder(state);
    let best = titles[0];
    for (const t of titles) {
      if (state.res.renown >= t.at) best = t;
    }
    return best.t.replace(/\{Ruler\}/g, rulerWord(state));
  }

  function nextTitle(state) {
    for (const t of titleLadder(state)) {
      if (state.res.renown < t.at) return { at: t.at, t: t.t.replace(/\{Ruler\}/g, rulerWord(state)) };
    }
    return null;
  }

  function currentTitleAt(state) {
    let at = 0;
    for (const t of titleLadder(state)) if (state.res.renown >= t.at) at = t.at;
    return at;
  }

  // ---------------------------------------------------------------------------
  // Templates
  // ---------------------------------------------------------------------------

  function fill(text, state, vars) {
    if (!text) {
      return '';
    }
    const v = vars || {};
    return String(text).replace(/\{([a-zA-Z_]+)(?::([a-z0-9_]+))?\}/g, (whole, key, arg) => {
      switch (key) {
        case 'hero':
          return state.hero ? state.hero.name : 'Your Majesty';
        case 'HERO':
          return state.hero ? state.hero.name.toUpperCase() : 'YOUR MAJESTY';
        case 'ruler':
          return rulerWord(state).toLowerCase();
        case 'Ruler':
          return rulerWord(state);
        case 'majesty':
          return 'Your Majesty';
        case 'Majesty':
          return 'Your Majesty';
        case 'title':
          return titleFor(state);
        case 'm':
          return arg ? memberName(state, arg) : whole;
        case 'member':
          return v.member ? memberName(state, v.member) : 'someone';
        case 'random':
          return v.random ? memberName(state, v.random) : 'someone in the back';
        case 'dest':
          return currentDestination(state).name;
        case 'party':
          return String(partySize(state));
        case 'gold':
          return String(state.res.gold);
        default:
          return whole;
      }
    });
  }

  // ---------------------------------------------------------------------------
  // Requirements & effects
  // ---------------------------------------------------------------------------

  /** Returns { ok, hidden, reason, member } for a requirement block. */
  function checkReq(state, req, ctx) {
    if (!req) {
      return { ok: true };
    }
    const c = ctx || {};
    let member = null;
    if (req.m) {
      if (!hasMember(state, req.m)) {
        return { ok: false, hidden: true, reason: 'Needs ' + memberName(state, req.m) };
      }
      member = req.m;
    }
    if (req.any) {
      const found = req.any.filter((id) => hasMember(state, id));
      if (!found.length) {
        return { ok: false, hidden: true, reason: 'Needs a specialist' };
      }
      member = found[0];
    }
    if (req.no && hasMember(state, req.no)) {
      return { ok: false, hidden: true };
    }
    if (req.hero && (!state.hero || state.hero.id !== req.hero)) {
      return { ok: false, hidden: true };
    }
    if (req.flag && !state.flags[req.flag]) {
      return { ok: false, hidden: true };
    }
    if (req.noflag && state.flags[req.noflag]) {
      return { ok: false, hidden: true };
    }
    if (req.trinket && state.trinkets.indexOf(req.trinket) < 0) {
      return { ok: false, hidden: true };
    }
    if (req.notrinket && state.trinkets.indexOf(req.notrinket) >= 0) {
      return { ok: false, hidden: true };
    }
    if (req.night === true && !c.night) {
      return { ok: false, hidden: true };
    }
    if (req.night === false && c.night) {
      return { ok: false, hidden: true };
    }
    if (req.biome && req.biome.indexOf(c.biome || regionOf(state)) < 0) {
      return { ok: false, hidden: true };
    }
    if (typeof req.partyMin === 'number' && partySize(state) < req.partyMin) {
      return { ok: false, hidden: true };
    }
    if (typeof req.partyMax === 'number' && partySize(state) > req.partyMax) {
      return { ok: false, hidden: true };
    }
    if (typeof req.stopMin === 'number' && state.journey.stop < req.stopMin) {
      return { ok: false, hidden: true };
    }
    if (typeof req.stopMax === 'number' && state.journey.stop > req.stopMax) {
      return { ok: false, hidden: true };
    }
    if (req.endless === true && !inEndless(state)) {
      return { ok: false, hidden: true };
    }
    if (typeof req.gold === 'number' && state.res.gold < req.gold) {
      return { ok: false, reason: 'Needs ' + req.gold + ' coins', member };
    }
    if (typeof req.food === 'number' && state.res.food < req.food) {
      return { ok: false, reason: 'Needs ' + req.food + ' rations', member };
    }
    if (typeof req.renown === 'number' && state.res.renown < req.renown) {
      return { ok: false, reason: 'Needs ' + req.renown + ' renown', member };
    }
    if (typeof req.moraleMin === 'number' && state.res.morale < req.moraleMin) {
      return { ok: false, reason: 'The court is too glum', member };
    }
    if (typeof req.maxGold === 'number' && state.res.gold > req.maxGold) {
      return { ok: false, hidden: true };
    }
    if (typeof req.maxFood === 'number' && state.res.food > req.maxFood) {
      return { ok: false, hidden: true };
    }
    if (typeof req.maxMorale === 'number' && state.res.morale > req.maxMorale) {
      return { ok: false, hidden: true };
    }
    return { ok: true, member };
  }

  function addBuff(state, buff) {
    if (!buff || !buff.id) {
      return;
    }
    state.buffs = state.buffs.filter((b) => b.id !== buff.id);
    state.buffs.push({
      id: buff.id,
      label: buff.label || buff.id,
      speed: typeof buff.speed === 'number' ? buff.speed : 1,
      until: state.journey.total + (buff.meters || 100),
    });
  }

  /** Apply an effects block. Returns deltas for UI feedback. */
  function applyEffects(state, fx, ctx) {
    const deltas = [];
    if (!fx) {
      return deltas;
    }
    const mods = modifiers(state);
    const res = state.res;
    const c = ctx || {};
    if (typeof fx.gold === 'number' && fx.gold !== 0) {
      let g = fx.gold;
      if (g > 0 && !c.noBonus) {
        g = Math.round(g * (1 + mods.goldMult));
      }
      const before = res.gold;
      res.gold = Math.max(0, res.gold + g);
      const d = res.gold - before;
      if (d > 0) state.stats.goldEarned += d;
      if (d < 0) state.stats.goldSpent += -d;
      state.stats.maxGold = Math.max(state.stats.maxGold || 0, res.gold);
      if (d !== 0) deltas.push({ k: 'gold', v: d });
    }
    if (typeof fx.goldPct === 'number' && fx.goldPct !== 0) {
      const d = Math.round(res.gold * fx.goldPct);
      res.gold = Math.max(0, res.gold + d);
      if (d !== 0) deltas.push({ k: 'gold', v: d });
    }
    if (typeof fx.food === 'number' && fx.food !== 0) {
      const before = res.food;
      res.food = Math.max(0, res.food + fx.food);
      const d = res.food - before;
      if (d !== 0) deltas.push({ k: 'food', v: d });
    }
    if (typeof fx.morale === 'number' && fx.morale !== 0) {
      const before = res.morale;
      const floor = U.clamp(mods.moraleFloor, 0, 60);
      res.morale = U.clamp(res.morale + fx.morale, fx.morale < 0 ? Math.min(floor, before) : 0, 100);
      const d = Math.round(res.morale - before);
      if (d !== 0) deltas.push({ k: 'morale', v: d });
    }
    if (typeof fx.renown === 'number' && fx.renown !== 0) {
      let r = fx.renown;
      if (r > 0 && !c.noBonus) {
        r = Math.round(r * (1 + mods.renown));
      }
      const before = res.renown;
      res.renown = Math.max(0, res.renown + r);
      const d = res.renown - before;
      if (d !== 0) deltas.push({ k: 'renown', v: d });
    }
    if (typeof fx.meters === 'number' && fx.meters !== 0 && !state.journey.arrived) {
      const leg = legLength(state);
      const before = state.journey.meters;
      state.journey.meters = U.clamp(state.journey.meters + fx.meters, 0, Math.max(0, leg - 3));
      const d = Math.round(state.journey.meters - before);
      if (d > 0) state.journey.total += d;
      if (d !== 0) deltas.push({ k: 'meters', v: d });
    }
    if (fx.trinket) {
      const trinkets = data().trinkets || {};
      let tid = fx.trinket;
      if (tid === '@random') {
        const pool = Object.keys(trinkets).filter((id) => trinkets[id].shop !== false && state.trinkets.indexOf(id) < 0);
        tid = pool.length ? pool[Math.floor((c.rng || Math.random)() * pool.length)] : null;
        if (!tid) {
          res.gold += 25;
          deltas.push({ k: 'gold', v: 25 });
        }
      }
      if (tid && trinkets[tid]) {
        if (state.trinkets.indexOf(tid) < 0) {
          state.trinkets.push(tid);
          deltas.push({ k: 'trinket', id: tid });
        } else {
          res.gold += 15;
          deltas.push({ k: 'gold', v: 15 });
        }
      }
    }
    if (fx.flag) {
      const flags = typeof fx.flag === 'string' ? { [fx.flag]: true } : fx.flag;
      for (const k of Object.keys(flags)) {
        state.flags[k] = flags[k];
      }
    }
    if (fx.unflag) {
      for (const k of [].concat(fx.unflag)) {
        delete state.flags[k];
      }
    }
    if (fx.buff) {
      addBuff(state, fx.buff);
      deltas.push({ k: 'buff', label: fx.buff.label || fx.buff.id, speed: fx.buff.speed || 1 });
    }
    if (fx.chain) {
      state.chain = { id: fx.chain, at: state.journey.total + (fx.chainIn || 40) };
    }
    if (fx.recruit && companionDef(fx.recruit) && !hasMember(state, fx.recruit)) {
      recruit(state, fx.recruit);
      deltas.push({ k: 'recruit', id: fx.recruit });
    }
    return deltas;
  }

  // ---------------------------------------------------------------------------
  // Walking
  // ---------------------------------------------------------------------------

  /**
   * Advance the journey by dm meters. Applies consumption, passive gains and morale drift.
   * Returns notices for the UI: {k:'arrive'} | {k:'hungry'} | {k:'gold'|'food'|'morale', v, src}.
   */
  function advance(state, dm, ctx) {
    const out = [];
    if (!(dm > 0) || state.journey.arrived) {
      return out;
    }
    const j = state.journey;
    const leg = legLength(state);
    const step = Math.min(dm, Math.max(0, leg - j.meters));
    j.meters += step;
    j.total += step;
    const mods = modifiers(state);

    // Rations
    state.acc.food += (step * foodRatePer100(state)) / 100;
    while (state.acc.food >= 1) {
      state.acc.food -= 1;
      if (state.res.food > 0) {
        state.res.food -= 1;
        state.stats.foodEaten += 1;
        if (state.res.food === 0) {
          out.push({ k: 'hungry' });
        }
      }
    }
    if (state.res.food <= 0) {
      state.stats.hungryMeters += step;
      state.acc.hungry += step;
      while (state.acc.hungry >= 20) {
        state.acc.hungry -= 20;
        const floor = U.clamp(mods.moraleFloor, 0, 60);
        state.res.morale = Math.max(Math.min(floor, state.res.morale), state.res.morale - 1);
      }
    } else {
      state.acc.hungry = 0;
      // Morale drifts toward 50 while fed; high spirits fade faster than low ones recover.
      state.acc.drift += step;
      for (let guard = 0; guard < 50; guard++) {
        const m = state.res.morale;
        const interval = m > 70 ? 14 : m > 52 ? 24 : 40;
        if (state.acc.drift < interval) break;
        state.acc.drift -= interval;
        if (m > 52) state.res.morale = Math.max(Math.min(U.clamp(mods.moraleFloor, 0, 60), m), m - 1);
        else if (m < 48) state.res.morale += 1;
      }
    }

    // Passive gains every 100 m
    state.acc.p100 += step;
    while (state.acc.p100 >= 100) {
      state.acc.p100 -= 100;
      if (mods.forage > 0) {
        const f = Math.round(mods.forage);
        state.res.food += f;
        out.push({ k: 'food', v: f, src: 'forage' });
      }
      if (mods.gold100 > 0) {
        const g = Math.round(mods.gold100);
        state.res.gold += g;
        state.stats.goldEarned += g;
        out.push({ k: 'gold', v: g, src: 'find' });
      }
      if (mods.morale100 > 0 && state.res.food > 0) {
        state.res.morale = Math.min(100, state.res.morale + mods.morale100);
      }
    }

    // Buff expiry
    if (state.buffs.length) {
      state.buffs = state.buffs.filter((b) => b.until > j.total);
    }

    if (j.meters >= leg - 1e-6) {
      j.meters = leg;
      j.arrived = true;
      out.push({ k: 'arrive' });
    }
    return out;
  }

  // ---------------------------------------------------------------------------
  // Events
  // ---------------------------------------------------------------------------

  /** Build lookup tables once data files are loaded. Returns a list of problems found. */
  function indexData() {
    const d = data();
    const problems = [];
    d.eventsById = {};
    for (const ev of d.events || []) {
      if (d.eventsById[ev.id]) problems.push('duplicate event ' + ev.id);
      d.eventsById[ev.id] = ev;
      if (!ev.choices || !ev.choices.length) problems.push('event without choices ' + ev.id);
      for (const ch of ev.choices || []) {
        if (!ch.ok && !ch.roll && !ch.outcomes) problems.push('choice without outcome in ' + ev.id);
        const fxs = [ch.ok, ch.roll && ch.roll.win, ch.roll && ch.roll.lose].concat(ch.outcomes || []);
        for (const o of fxs) {
          if (o && o.fx && o.fx.chain && !(d.events || []).some((e) => e.id === o.fx.chain)) problems.push('missing chain ' + o.fx.chain);
          if (o && o.fx && o.fx.trinket && o.fx.trinket !== '@random' && !(d.trinkets || {})[o.fx.trinket]) problems.push('missing trinket ' + o.fx.trinket);
        }
        const req = ch.req || {};
        for (const id of [req.m].concat(req.any || [])) {
          if (id && !(d.companions || {})[id]) problems.push('unknown companion ' + id + ' in ' + ev.id);
        }
      }
    }
    for (const id of d.route || []) {
      if (!(d.locations || {})[id]) problems.push('route references unknown location ' + id);
    }
    for (const id of Object.keys(d.locations || {})) {
      const loc = d.locations[id];
      loc.id = id;
      if (loc.scene && !(d.scenes || {})[loc.scene]) problems.push('location ' + id + ' has unknown scene ' + loc.scene);
      if (loc.recruit && !(d.companions || {})[loc.recruit]) problems.push('location ' + id + ' recruits unknown ' + loc.recruit);
    }
    for (const id of Object.keys(d.companions || {})) {
      d.companions[id].id = id;
    }
    return problems;
  }

  function eventDef(id) {
    return (data().eventsById || {})[id] || null;
  }

  function scheduleNextEvent(state, rng) {
    const spacing = EVENT_SPACING[state.settings.eventFreq] || EVENT_SPACING.normal;
    if (!isFinite(spacing[0])) {
      state.nextEventAt = Infinity;
      return;
    }
    state.nextEventAt = state.journey.total + U.randRange(spacing[0], spacing[1], rng);
  }

  function eventEligible(state, ev, ctx) {
    if (!ev || ev.disabled) return false;
    if (ev.once && state.seen[ev.id]) return false;
    if (ev.chainOnly) return false;
    if (state.recent.indexOf(ev.id) >= 0) return false;
    const r = checkReq(state, ev.req, ctx);
    if (!r.ok) return false;
    // At least one usable (non-hidden) choice must exist
    return true;
  }

  function pickEvent(state, ctx, rng) {
    const events = data().events || [];
    const pool = events.filter((ev) => eventEligible(state, ev, ctx));
    if (!pool.length) {
      // Relax the recent-cooldown if we've exhausted everything
      const relaxed = events.filter((ev) => !ev.disabled && !ev.chainOnly && !(ev.once && state.seen[ev.id]) && checkReq(state, ev.req, ctx).ok);
      return U.weightedPick(relaxed, (ev) => ev.w || 1, rng) || null;
    }
    return U.weightedPick(
      pool,
      (ev) => {
        let w = ev.w || 1;
        if (!state.seen[ev.id]) w *= 1.6; // favour fresh events
        if (ev.req && (ev.req.m || ev.req.any)) w *= 1.3; // party-specific events are special
        return w;
      },
      rng
    );
  }

  function markEventSeen(state, id) {
    state.seen[id] = (state.seen[id] || 0) + 1;
    state.recent.push(id);
    if (state.recent.length > RECENT_EVENTS) {
      state.recent.splice(0, state.recent.length - RECENT_EVENTS);
    }
    state.stats.events += 1;
  }

  function resolveCost(state, cost) {
    if (!cost) return null;
    const out = {};
    for (const k of ['gold', 'food']) {
      const v = cost[k];
      if (v === 'party') out[k] = partySize(state);
      else if (typeof v === 'number' && v > 0) out[k] = v;
    }
    return out;
  }

  /** Choices with visibility/enablement resolved for display. */
  function choicesFor(state, ev, ctx) {
    const out = [];
    (ev.choices || []).forEach((ch, index) => {
      const req = Object.assign({}, ch.req || {});
      const cost = resolveCost(state, ch.cost);
      if (cost) {
        if (cost.gold) req.gold = Math.max(req.gold || 0, cost.gold);
        if (cost.food) req.food = Math.max(req.food || 0, cost.food);
      }
      const r = checkReq(state, req, ctx);
      if (r.hidden) {
        return;
      }
      out.push({ index, choice: ch, cost, ok: r.ok, reason: r.reason || '', member: r.member || (ch.req && ch.req.m) || null, odds: ch.roll ? rollChance(state, ch.roll) : null });
    });
    if (!out.some((c) => c.ok)) {
      out.push({ index: -1, choice: { t: 'Shrug and keep walking.', ok: { t: 'You keep walking. The moment passes, as moments do.' } }, ok: true, reason: '', member: null, odds: null });
    }
    return out;
  }

  function rollChance(state, roll) {
    const mods = modifiers(state);
    let p = typeof roll.p === 'number' ? roll.p : 0.5;
    if (roll.luck !== false) {
      p += Math.min(mods.luck, MAX_LUCK) + (state.res.morale - 50) / 400;
    }
    for (const b of roll.boost || []) {
      if (b.m && hasMember(state, b.m)) p += b.add || 0;
      if (b.trinket && state.trinkets.indexOf(b.trinket) >= 0) p += b.add || 0;
      if (b.flag && state.flags[b.flag]) p += b.add || 0;
    }
    return U.clamp(p, 0.05, 0.95);
  }

  function oddsLabel(p) {
    if (p == null) return '';
    if (p >= 0.8) return 'Safe bet';
    if (p >= 0.6) return 'Good odds';
    if (p >= 0.4) return 'Coin flip';
    if (p >= 0.25) return 'Risky';
    return 'Long shot';
  }

  /** Resolve a choice; mutates state and returns { t, deltas, win }. */
  function resolveChoice(state, ev, index, ctx, rng, vars) {
    let ch;
    if (index === -1) {
      ch = { ok: { t: 'You keep walking. The moment passes, as moments do.' } };
    } else {
      ch = (ev.choices || [])[index];
    }
    if (!ch) {
      return { t: '', deltas: [] };
    }
    const deltas = [];
    const cost = resolveCost(state, ch.cost);
    if (cost) {
      const neg = {};
      if (cost.gold) neg.gold = -cost.gold;
      if (cost.food) neg.food = -cost.food;
      deltas.push.apply(deltas, applyEffects(state, neg, { noBonus: true }));
    }
    let outcome;
    let win = null;
    if (ch.roll) {
      const p = rollChance(state, ch.roll);
      win = (rng || Math.random)() < p;
      outcome = win ? ch.roll.win : ch.roll.lose;
    } else if (ch.outcomes) {
      outcome = U.weightedPick(ch.outcomes, (o) => o.w || 1, rng);
    } else {
      outcome = ch.ok || { t: '' };
    }
    deltas.push.apply(deltas, applyEffects(state, outcome.fx, ctx));
    state.stats.choices += 1;
    const text = fill(outcome.t, state, vars);
    if (ev.title) {
      addLog(state, ev.title + ' — ' + stripMarkup(text), 'event');
    }
    return { t: text, deltas: mergeDeltas(deltas), win };
  }

  function mergeDeltas(deltas) {
    const out = [];
    const sums = {};
    for (const d of deltas) {
      if (['gold', 'food', 'morale', 'renown', 'meters'].indexOf(d.k) >= 0) {
        sums[d.k] = (sums[d.k] || 0) + d.v;
      } else {
        out.push(d);
      }
    }
    const head = [];
    for (const k of ['gold', 'food', 'morale', 'renown', 'meters']) {
      if (sums[k]) head.push({ k, v: sums[k] });
    }
    return head.concat(out);
  }

  function stripMarkup(s) {
    return String(s).replace(/\*([^*]+)\*/g, '$1');
  }

  // ---------------------------------------------------------------------------
  // Locations: arrival, services, recruit, depart
  // ---------------------------------------------------------------------------

  function beginVisit(state) {
    if (state.visit.stop !== state.journey.stop) {
      state.visit = { stop: state.journey.stop, used: {}, storyDone: false, offers: null };
    }
  }

  function recruit(state, id) {
    if (!companionDef(id) || hasMember(state, id)) {
      return false;
    }
    state.party.unshift(id);
    state.stats.recruits += 1;
    const c = companionDef(id);
    addLog(state, c.name + ' joined your court.', 'recruit');
    return true;
  }

  function depart(state, rng) {
    const j = state.journey;
    const loc = currentDestination(state);
    if (loc && !loc.endless) {
      state.story.done[loc.id] = true;
    }
    j.stop += 1;
    j.meters = 0;
    j.arrived = false;
    state.visit = { stop: -1, used: {}, storyDone: false, offers: null };
    // Next event a little after leaving town
    const spacing = EVENT_SPACING[state.settings.eventFreq] || EVENT_SPACING.normal;
    state.nextEventAt = isFinite(spacing[0]) ? j.total + U.randRange(spacing[0] * 0.6, spacing[1] * 0.8, rng) : Infinity;
    const next = currentDestination(state);
    addLog(state, 'Set out for ' + next.name + '.', 'travel');
  }

  function servicePrice(state, kind) {
    const mods = modifiers(state);
    const discount = U.clamp(mods.shop, 0, 0.6);
    const n = partySize(state);
    const stop = state.journey.stop;
    switch (kind) {
      case 'rations10':
        return Math.max(4, Math.round((8 + stop * 0.25) * (1 - discount)));
      case 'rations30':
        return Math.max(10, Math.round((21 + stop * 0.7) * (1 - discount)));
      case 'inn':
        return Math.max(0, Math.round((4 + n * 1.2) * (1 - discount) * (1 - U.clamp(mods.inn, 0, 1))));
      case 'shrine':
        return 10;
      default:
        return 0;
    }
  }

  function trinketPrice(state, id) {
    const t = (data().trinkets || {})[id];
    const mods = modifiers(state);
    const discount = U.clamp(mods.shop, 0, 0.6);
    return Math.max(10, Math.round(((t && t.price) || 60) * (1 - discount)));
  }

  function marketOffers(state, rng) {
    if (state.visit.offers) {
      return state.visit.offers;
    }
    const trinkets = data().trinkets || {};
    const pool = Object.keys(trinkets).filter((id) => trinkets[id].shop !== false && state.trinkets.indexOf(id) < 0);
    state.visit.offers = U.shuffle(pool, rng).slice(0, 2);
    return state.visit.offers;
  }

  /** Perform a location service. Returns { t, deltas } or { error }. */
  function useService(state, kind, rng, flavor) {
    const n = partySize(state);
    const mods = modifiers(state);
    const used = state.visit.used;
    const say = (t) => fill(t, state, {});
    switch (kind) {
      case 'rations10':
      case 'rations30': {
        const price = servicePrice(state, kind);
        if (state.res.gold < price) return { error: 'Not enough coins.' };
        const amount = kind === 'rations10' ? 10 : 30;
        const deltas = applyEffects(state, { gold: -price, food: amount }, { noBonus: true });
        return { t: say(flavor || 'Rations, wrapped in cloth that was, at some point, clean.'), deltas };
      }
      case 'inn': {
        if (used.inn) return { error: 'You already rested here.' };
        const price = servicePrice(state, 'inn');
        if (state.res.gold < price) return { error: 'Not enough coins.' };
        used.inn = true;
        const deltas = applyEffects(state, { gold: -price, morale: 28 }, { noBonus: true });
        return { t: say(flavor || 'Soft beds, warm stew, and only one person snoring like a collapsing barn.'), deltas };
      }
      case 'work': {
        if (used.work) return { error: 'Nobody else needs help today.' };
        used.work = true;
        const pay = Math.round((8 + n * 2.2 + state.journey.stop * 0.6) * (1 + mods.work));
        const deltas = applyEffects(state, { gold: pay, morale: -3 }, { noBonus: true });
        return { t: say(flavor || 'Your court does odd jobs around town. Some of them are very odd.'), deltas };
      }
      case 'forage': {
        if (used.forage) return { error: 'You have picked this place clean.' };
        used.forage = true;
        const food = Math.round((7 + n * 1.3) * (1 + Math.min(1, mods.forage * 0.25)));
        const deltas = applyEffects(state, { food }, { noBonus: true });
        return { t: say(flavor || 'Berries, mushrooms, and one potato of uncertain ownership.'), deltas };
      }
      case 'rest': {
        if (used.rest) return { error: 'Everyone is rested enough.' };
        used.rest = true;
        const cost = Math.min(state.res.food, Math.ceil(n / 2));
        const deltas = applyEffects(state, { food: -cost, morale: 16 }, { noBonus: true });
        return { t: say(flavor || 'You rest by the fire. Someone tells a story. It is mostly about cheese.'), deltas };
      }
      case 'shrine': {
        if (used.shrine) return { error: 'The candles are already lit.' };
        const price = servicePrice(state, 'shrine');
        if (state.res.gold < price) return { error: 'Not enough coins.' };
        used.shrine = true;
        const deltas = applyEffects(state, { gold: -price, morale: 10, renown: 15 }, { noBonus: true });
        return { t: say(flavor || 'You light a candle and feel slightly more royal.'), deltas };
      }
      default:
        return { error: 'Unknown service.' };
    }
  }

  function buyTrinket(state, id) {
    const trinkets = data().trinkets || {};
    if (!trinkets[id] || state.trinkets.indexOf(id) >= 0) return { error: 'Not available.' };
    const price = trinketPrice(state, id);
    if (state.res.gold < price) return { error: 'Not enough coins.' };
    const deltas = applyEffects(state, { gold: -price }, { noBonus: true });
    state.trinkets.push(id);
    deltas.push({ k: 'trinket', id });
    if (state.visit.offers) state.visit.offers = state.visit.offers.filter((x) => x !== id);
    addLog(state, 'Bought ' + trinkets[id].name + '.', 'trade');
    return { t: trinkets[id].name + ' is yours.', deltas };
  }

  // ---------------------------------------------------------------------------
  // Achievements (Royal Decrees)
  // ---------------------------------------------------------------------------

  function checkAchievements(state) {
    const list = data().achievements || [];
    const unlocked = [];
    for (const a of list) {
      if (state.achievements[a.id]) continue;
      let ok = false;
      try {
        ok = !!a.test(state, { partySize: partySize(state), inEndless: inEndless(state) });
      } catch (e) {
        ok = false;
      }
      if (ok) {
        state.achievements[a.id] = Math.floor(state.journey.total) || 1;
        unlocked.push(a);
      }
    }
    return unlocked;
  }

  TK.logic = {
    SAVE_VERSION,
    MAX_LUCK,
    METER_PX,
    BASE_SPEED,
    EVENT_SPACING,
    BANTER_SPACING,
    DEFAULT_SETTINGS,
    LEGACY_KIND_TO_COMPANION,
    mainRoute,
    locationDef,
    routeLocation,
    currentDestination,
    legLength,
    inEndless,
    regionOf,
    companionDef,
    hasMember,
    partySize,
    memberName,
    rulerWord,
    modifiers,
    moraleTier,
    speedMps,
    foodRatePer100,
    createState,
    normalizeState,
    migrateLegacy,
    sanitizeSettings,
    cleanName,
    addLog,
    titleFor,
    nextTitle,
    currentTitleAt,
    fill,
    checkReq,
    applyEffects,
    advance,
    indexData,
    resolveCost,
    eventDef,
    scheduleNextEvent,
    pickEvent,
    markEventSeen,
    choicesFor,
    rollChance,
    oddsLabel,
    resolveChoice,
    beginVisit,
    recruit,
    depart,
    servicePrice,
    trinketPrice,
    marketOffers,
    useService,
    buyTrinket,
    checkAchievements,
    endlessLocation,
  };

  if (typeof module !== 'undefined' && module.exports) {
    module.exports = TK;
  }
})(typeof window !== 'undefined' ? window : globalThis);
