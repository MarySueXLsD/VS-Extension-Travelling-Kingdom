/* Travelling Kingdom — game orchestration: loop, encounters, stories, saving. */
(function (root) {
  'use strict';

  const TK = root.TK;
  const U = TK.util;
  const L = TK.logic;
  const A = TK.assets;
  const W = TK.world;
  const UI = TK.ui;
  const D = TK.data;
  const MPX = L.METER_PX;

  const vscode = typeof root.acquireVsCodeApi === 'function' ? root.acquireVsCodeApi() : { postMessage() {}, setState() {}, getState() {} };
  const appEl = document.getElementById('app');
  const BASE = appEl.getAttribute('data-base') || '.';
  const VERSION = appEl.getAttribute('data-version') || 'dev';

  const G = {
    state: null,
    owner: false,
    mode: 'boot',
    lastTs: 0,
    frameAcc: 0,
    dirty: false,
    lastSaveAt: 0,
    lastHudAt: 0,
    flow: null,
    encounter: null,
    nextBanterAt: 0,
    banterDeck: [],
    banterBusy: false,
    tab: 'road',
    rng: U.makeRng((Date.now() ^ 0x5bd1e995) >>> 0),
    lastAchCheck: 0,
    lastStatusKey: '',
    weatherNextAt: 0,
    loopId: 0,
    userInteracted: false,
    clock: { night: false, dark: 0, warm: 0 },
  };

  TK.main = {
    reduceMotion: () => !!(G.state && G.state.settings.reduceMotion),
    // Never pull keyboard focus out of the editor: only focus buttons when the view already has it.
    focusAllowed: () => G.userInteracted && document.hasFocus(),
  };

  // ---------------------------------------------------------------------------
  // Host messaging
  // ---------------------------------------------------------------------------

  function post(msg) {
    try {
      vscode.postMessage(msg);
    } catch (e) {
      /* ignore */
    }
  }

  function summary() {
    const s = G.state;
    if (!s || !s.hero) return null;
    const dest = L.currentDestination(s);
    let waiting = null;
    if (G.flow) {
      waiting = G.flow.kind === 'event' ? 'event' : G.flow.kind === 'location' || G.flow.kind === 'market' ? 'location' : 'story';
    } else if (G.encounter) {
      waiting = null;
    }
    return {
      hero: (s.hero.id === 'king' ? 'King ' : 'Queen ') + s.hero.name,
      title: L.titleFor(s),
      dest: dest ? dest.name : '',
      meters: Math.floor(s.journey.meters),
      leg: L.legLength(s),
      arrived: s.journey.arrived,
      units: s.settings.units,
      gold: s.res.gold,
      food: s.res.food,
      morale: Math.round(s.res.morale),
      renown: s.res.renown,
      party: L.partySize(s),
      waiting,
      waitingText: G.flow && G.flow.title ? G.flow.title : '',
    };
  }

  function saveNow() {
    if (!G.state || !G.owner) return;
    G.state.savedAt = Date.now();
    post({ type: 'save', state: G.state, summary: summary() });
    G.dirty = false;
    G.lastSaveAt = performance.now();
  }

  function markDirty() {
    G.dirty = true;
  }

  function pushStatus() {
    const s = summary();
    const key = JSON.stringify(s);
    if (key !== G.lastStatusKey) {
      G.lastStatusKey = key;
      post({ type: 'status', summary: s });
    }
  }

  root.addEventListener('message', (event) => {
    const msg = event.data || {};
    switch (msg.type) {
      case 'init':
        handleInit(msg);
        break;
      case 'suspend':
        saveNow();
        G.owner = false;
        enterObserver();
        break;
      case 'reset':
        doReset();
        break;
      case 'visible':
        if (msg.visible && G.state && G.owner) {
          G.lastTs = 0;
        }
        break;
      default:
        break;
    }
  });

  // ---------------------------------------------------------------------------
  // Boot
  // ---------------------------------------------------------------------------

  async function boot() {
    UI.init();
    UI.setMode('boot');
    const problems = L.indexData();
    if (problems.length) console.warn('[travelling-kingdom] data problems', problems);
    try {
      await A.load(BASE, VERSION);
    } catch (e) {
      console.error(e);
      UI.loadingText('Could not load the royal art. Try reloading the window.');
      return;
    }
    A.hydrateIcons(document);
    W.init(document.getElementById('world'));
    const ro = new ResizeObserver(() => {
      W.resize();
    });
    ro.observe(document.getElementById('stage'));
    ro.observe(document.getElementById('viewport'));
    bindInput();
    document.addEventListener('visibilitychange', () => {
      if (document.hidden) saveNow();
      G.lastTs = 0;
    });
    setInterval(() => {
      if (G.dirty && performance.now() - G.lastSaveAt > 6000) saveNow();
      if (G.state && G.owner) pushStatus();
    }, 2000);
    post({ type: 'hello', version: VERSION });
  }

  function handleInit(msg) {
    G.owner = msg.owner !== false;
    if (!G.owner) {
      enterObserver();
      return;
    }
    let state = null;
    try {
      state = L.normalizeState(msg.state);
      if (!state && msg.legacy) {
        state = L.migrateLegacy(msg.legacy);
        if (state) G.migrated = true;
      }
    } catch (e) {
      console.error('[travelling-kingdom] failed to read save', e);
      state = null;
    }
    if (!state) {
      G.state = null;
      enterSelect();
      return;
    }
    G.state = state;
    startPlay();
  }

  function enterObserver() {
    G.mode = 'observer';
    stopLoop();
    UI.hideCard();
    UI.hidePanel();
    UI.setMode('observer');
  }

  // ---------------------------------------------------------------------------
  // Character select
  // ---------------------------------------------------------------------------

  const HEROES = [
    { id: 'queen', role: 'Queen', name: 'Elizabeth' },
    { id: 'king', role: 'King', name: 'Arthur' },
  ];
  let selIndex = 0;

  function enterSelect() {
    G.mode = 'select';
    stopLoop();
    UI.hideCard();
    UI.hidePanel();
    UI.setMode('select');
    const input = document.getElementById('sel-name-input');
    const render = () => {
      const hcur = HEROES[selIndex];
      document.getElementById('sel-portrait').src = A.portraitUrl(hcur.id);
      document.getElementById('sel-role').textContent = hcur.role;
      input.placeholder = hcur.name;
    };
    render();
    document.getElementById('sel-prev').onclick = () => {
      selIndex = (selIndex + HEROES.length - 1) % HEROES.length;
      render();
    };
    document.getElementById('sel-next').onclick = () => {
      selIndex = (selIndex + 1) % HEROES.length;
      render();
    };
    document.getElementById('sel-go').onclick = () => {
      const hcur = HEROES[selIndex];
      const name = L.cleanName(input.value) || hcur.name;
      G.state = L.createState(hcur.id, name);
      L.addLog(G.state, (hcur.id === 'king' ? 'King ' : 'Queen ') + name + ' set out from the castle (a rented stable).', 'story');
      saveNow();
      startPlay();
    };
    input.onkeydown = (e) => {
      if (e.key === 'Enter') document.getElementById('sel-go').click();
    };
  }

  // ---------------------------------------------------------------------------
  // Play
  // ---------------------------------------------------------------------------

  function heroActor() {
    return G.state.hero.id === 'king' ? 'king' : 'queen';
  }

  function startPlay() {
    const s = G.state;
    G.mode = 'play';
    UI.setMode('play');
    applySettings();
    G.flow = null;
    G.encounter = null;
    UI.hideCard();
    UI.hidePanel();
    UI.setNavActive('road');
    G.tab = 'road';
    // World reset
    W.heroX = s.journey.total * MPX;
    W.scenes = [];
    W.npcs = [];
    W.eventProps = [];
    W.decor = [];
    W.nextDecorX = W.heroX - 400;
    W.particles = [];
    W.party = [];
    const region = L.regionOf(s);
    W.resetBiome(region);
    A.loadBiome(BASE, VERSION, region).catch(() => {});
    preloadNextRegion();
    W.setParty(heroActor(), s.party);
    for (const m of W.party) m.dx = m.tdx;
    W.update(0.016, false, 0);
    updateClock(true);
    UI.renderHud(s);
    G.nextBanterAt = performance.now() / 1000 + 8;
    startLoop();

    if (!s.story.prologue) {
      runPrologue();
    } else if (s.journey.arrived) {
      ensureScene(true);
      beginArrival();
    } else if (s.pending && s.pending.kind === 'event') {
      const ev = L.eventDef(s.pending.id);
      if (ev) {
        startEncounter(ev, { resume: true });
      } else {
        s.pending = null;
      }
    }
    if (G.migrated) {
      G.migrated = false;
      setTimeout(() => {
        UI.toast('Welcome back! Your court has been rewritten into the new chronicle.', { icon: 'book', ms: 6000 });
      }, 800);
      saveNow();
    }
  }

  function applySettings() {
    const st = G.state.settings;
    appEl.classList.toggle('minimal-ui', !!st.minimalUi);
    appEl.classList.toggle('reduce-motion', !!st.reduceMotion);
    W.minimalBg = !!st.minimalBg;
    W.reduceMotion = !!st.reduceMotion;
    if (!st.weather) W.weather = 'clear';
  }

  function preloadNextRegion() {
    const s = G.state;
    for (let i = s.journey.stop; i < s.journey.stop + 3; i++) {
      const loc = L.routeLocation(s, i);
      if (loc) A.loadBiome(BASE, VERSION, loc.region).catch(() => {});
    }
  }

  // ---------------------------------------------------------------------------
  // Loop
  // ---------------------------------------------------------------------------

  function startLoop() {
    stopLoop();
    G.lastTs = 0;
    const tick = (ts) => {
      G.loopId = requestAnimationFrame(tick);
      if (document.hidden) {
        G.lastTs = 0;
        return;
      }
      if (!G.lastTs) {
        G.lastTs = ts;
        return;
      }
      const fps = (G.state && G.state.settings.fps) || 30;
      const minDt = 1000 / fps - 2;
      if (ts - G.lastTs < minDt) return;
      const dt = Math.min(0.1, (ts - G.lastTs) / 1000);
      G.lastTs = ts;
      try {
        frame(dt);
      } catch (e) {
        console.error('[travelling-kingdom] frame error', e);
      }
    };
    G.loopId = requestAnimationFrame(tick);
  }

  function stopLoop() {
    if (G.loopId) cancelAnimationFrame(G.loopId);
    G.loopId = 0;
  }

  function ctx() {
    return { night: G.clock.night, biome: L.regionOf(G.state), rng: G.rng };
  }

  function canWalk() {
    const s = G.state;
    if (G.mode !== 'play' || !s || !s.story.prologue) return false;
    if (G.flow) return false;
    if (s.journey.arrived) return false;
    if (UI.panelOpen()) return false;
    if (G.encounter && G.encounter.gap <= 0) return false;
    return true;
  }

  function frame(dt) {
    const s = G.state;
    if (!s || G.mode !== 'play') {
      W.render();
      return;
    }
    const walking = canWalk();
    const c = ctx();
    const mps = L.speedMps(s, c);
    const dm = W.update(dt, walking, mps);
    if (dm > 0) {
      const notes = L.advance(s, dm, c);
      for (const n of notes) handleNote(n);
      markDirty();
    }
    director(dt);
    W.render();
    UI.positionBubbles();
    const now = performance.now();
    if (now - G.lastHudAt > 250) {
      G.lastHudAt = now;
      UI.renderHud(s);
      updateClock(false);
      updateWeather();
    }
    if (now - G.lastAchCheck > 3000) {
      G.lastAchCheck = now;
      const got = L.checkAchievements(s);
      for (const a of got) {
        UI.toast('Royal decree fulfilled: ' + a.name, { icon: 'star', kind: 'gold' });
        UI.setJournalDot(true);
        markDirty();
      }
    }
  }

  function handleNote(n) {
    if (n.k === 'hungry') {
      UI.toast('Out of rations! The court walks slower and grows grumpy.', { icon: 'food', kind: 'bad' });
      sayRandom('any', ['My stomach is writing angry letters.', 'We are out of food. I repeat: out of food.', 'I would trade my boots for a sandwich.']);
    } else if (n.k === 'gold' && n.src === 'find') {
      const who = G.state.party.indexOf('hazel') >= 0 ? 'hazel' : 'hero';
      UI.floatWorld('+' + n.v, W.headOf(who), 'gold');
    } else if (n.k === 'food' && n.src === 'forage') {
      const who = G.state.party.indexOf('fennick') >= 0 ? 'fennick' : 'hero';
      UI.floatWorld('+' + n.v, W.headOf(who), 'food');
    }
  }

  // ---------------------------------------------------------------------------
  // Director: decides what happens next on the road
  // ---------------------------------------------------------------------------

  function remainingMeters() {
    return Math.max(0, L.legLength(G.state) - G.state.journey.meters);
  }

  function director() {
    const s = G.state;
    ensureScene(false);

    if (G.flow) {
      autoResolveTick();
      return;
    }
    if (s.journey.arrived) {
      beginArrival();
      return;
    }
    if (UI.panelOpen()) return;

    if (G.encounter) {
      const e = G.encounter;
      if (e.npc) e.gap = W.encounterGap(e.npc);
      else if (e.prop && !e.prop.sky) e.gap = e.prop.x - W.heroX - 36;
      else e.gap = e.readyAt && W.t >= e.readyAt ? 0 : 1;
      if (e.gap <= 0) openEncounter();
      return;
    }

    const rem = remainingMeters();
    // Story beats
    for (const b of D.beats) {
      if (s.story.beats[b.id]) continue;
      if (s.journey.stop === b.stop && s.journey.meters >= L.legLength(s) * b.at && rem > 25) {
        startBeat(b);
        return;
      }
    }
    // Chained follow-ups
    if (s.chain && s.journey.total >= s.chain.at && rem > 40) {
      const ev = L.eventDef(s.chain.id);
      s.chain = null;
      if (ev) {
        startEventEncounter(ev);
        return;
      }
    }
    // Random road events
    if (s.journey.total >= s.nextEventAt && s.story.prologue) {
      if (rem > 45) {
        const ev = L.pickEvent(s, ctx(), G.rng);
        if (ev) {
          startEventEncounter(ev);
          return;
        }
        L.scheduleNextEvent(s, G.rng);
      } else {
        s.nextEventAt = s.journey.total + rem + 40;
      }
    }
    // Banter
    banterTick();
  }

  function ensureScene(force) {
    const s = G.state;
    const key = 'stop:' + s.journey.stop;
    if (W.activeScene(key)) return;
    const remPx = remainingMeters() * MPX;
    if (!force && remPx > W.W + 460) {
      // Reserve the scene's footprint so roadside decor does not spawn into it.
      const loc = L.currentDestination(s);
      const def = loc && sceneDefFor(loc);
      if (def && !W.pendingScene) {
        const x = W.heroX + remPx;
        W.pendingScene = { x0: x - 380, x1: x + 320 };
      }
      return;
    }
    const loc = L.currentDestination(s);
    const def = sceneDefFor(loc);
    if (!def) return;
    const originX = W.heroX + remPx;
    W.pendingScene = null;
    const recruitId = loc.recruit && s.party.indexOf(loc.recruit) < 0 ? loc.recruit : null;
    const c = recruitId && D.companions[recruitId];
    const scene = W.spawnScene(def, originX, { key, recruit: c ? c.actor : null, recruitId, names: loc.names || null });
    W.clearDecorNear(originX + scene.extent[0], originX + scene.extent[1]);
  }

  function sceneDefFor(loc) {
    if (!loc) return null;
    const id = loc.scene || (loc.endless && D.endlessKinds[loc.kind] && D.endlessKinds[loc.kind].scene);
    return D.scenes[id] || D.scenes.village;
  }

  // ---------------------------------------------------------------------------
  // Encounters (road events & story beats)
  // ---------------------------------------------------------------------------

  function randomMember() {
    const p = G.state.party;
    return p.length ? p[Math.floor(G.rng() * p.length)] : null;
  }

  function startEventEncounter(ev) {
    const s = G.state;
    s.pending = { kind: 'event', id: ev.id, phase: 'choose', vars: { random: randomMember() }, result: null };
    L.markEventSeen(s, ev.id);
    L.scheduleNextEvent(s, G.rng);
    markDirty();
    startEncounter(ev, {});
  }

  function startEncounter(ev, opts) {
    const e = { ev, npc: null, prop: null, gap: 1, readyAt: 0 };
    const who = ev.who || {};
    if (who.a) {
      e.npc = W.spawnEncounter(who.a, { name: who.n });
      if (opts.resume) {
        e.npc.x = W.heroX + 40;
      }
    } else if (ev.prop) {
      e.prop = W.spawnEventProp(ev.prop);
      if (opts.resume && !e.prop.sky) e.prop.x = W.heroX + 60;
      if (e.prop.sky) e.readyAt = W.t + (opts.resume ? 0 : 1.6);
    } else {
      e.readyAt = W.t + (opts.resume ? 0 : 0.8);
      if (who.m && !opts.resume) {
        const c = D.companions[who.m];
        if (c) UI.bubble(who.m, '!', 1200);
      }
    }
    G.encounter = e;
  }

  function openEncounter() {
    const e = G.encounter;
    if (!e) return;
    UI.clearBubbles();
    if (e.beat) {
      openBeat(e);
      return;
    }
    const ev = e.ev;
    const s = G.state;
    if (!s.pending || s.pending.id !== ev.id) {
      s.pending = { kind: 'event', id: ev.id, phase: 'choose', vars: { random: randomMember() }, result: null };
    }
    G.flow = { kind: 'event', title: ev.title, since: performance.now() };
    if (e.npc) e.npc.alert = false;
    if (s.pending.phase === 'result' && s.pending.result) {
      showEventResult(ev, s.pending.result);
    } else {
      showEventChoices(ev);
    }
    pushStatus();
  }

  function eventSpeaker(ev) {
    const who = ev.who || {};
    if (who.m) {
      const c = D.companions[who.m];
      return { portrait: c ? c.actor : null, name: c ? c.name : '' };
    }
    if (who.a) return { portrait: who.a, name: who.n || D.speakers[who.a] || '' };
    return { portrait: null, name: '', icon: ev.prop === 'chest' ? 'bag' : 'map' };
  }

  /** Strip "[Name]" prefixes, and "(10 coins)" style suffixes when a cost tag already shows it. */
  function choiceLabel(text, hasCostTag) {
    let t = String(text).replace(/^\[[^\]]+\]\s*/, '');
    if (hasCostTag) t = t.replace(/\s*\((?:[^()]*\d[^()]*|\{party\}[^()]*)\)\.?\s*$/, '');
    return t;
  }

  function showEventChoices(ev) {
    const s = G.state;
    const sp = eventSpeaker(ev);
    const vars = (s.pending && s.pending.vars) || {};
    const region = D.regions[L.regionOf(s)];
    const options = L.choicesFor(s, ev, ctx());
    UI.showCard({
      kicker: 'On the road' + (region ? ' · ' + region.name : ''),
      title: ev.title,
      portrait: sp.portrait,
      portraitIcon: sp.icon,
      speaker: sp.name,
      text: L.fill(ev.text, s, vars),
      pill: ev.title,
      actions: options.map((o) => ({
        label: choiceLabel(L.fill(o.choice.t, s, vars), !!(o.cost && (o.cost.gold || o.cost.food))),
        member: o.member && (o.choice.req && (o.choice.req.m || o.choice.req.any)) ? o.member : null,
        cost: o.cost,
        odds: o.odds,
        disabled: !o.ok,
        reason: o.reason,
        onClick: () => chooseEvent(ev, o.index),
      })),
    });
  }

  function chooseEvent(ev, index) {
    const s = G.state;
    const vars = (s.pending && s.pending.vars) || {};
    UI.cardBusy = true;
    const res = L.resolveChoice(s, ev, index, ctx(), G.rng, vars);
    UI.cardBusy = false;
    if (s.pending) {
      s.pending.phase = 'result';
      s.pending.result = { t: res.t, deltas: res.deltas };
    }
    if (ev.weather && s.settings.weather) {
      W.weather = ev.weather;
      G.weatherNextAt = performance.now() + 60000;
    }
    const e = G.encounter;
    if (e && e.prop && e.prop.kind === 'chest') W.openChest(e.prop);
    feedbackDeltas(res.deltas, e && e.npc ? e.npc : 'hero');
    saveNow();
    showEventResult(ev, { t: res.t, deltas: res.deltas, win: res.win });
  }

  function showEventResult(ev, result) {
    const s = G.state;
    const sp = eventSpeaker(ev);
    UI.showCard({
      kicker: result.win === true ? 'Success!' : result.win === false ? 'Not quite…' : 'On the road',
      title: ev.title,
      portrait: sp.portrait,
      portraitIcon: sp.icon,
      speaker: '',
      text: result.t,
      deltas: result.deltas,
      pill: ev.title,
      actions: [{ label: 'Continue the journey', primary: true, icon: 'road', onClick: () => finishEvent() }],
    });
    G.flow = { kind: 'event', title: ev.title, since: performance.now(), result: true };
  }

  function finishEvent() {
    const s = G.state;
    const e = G.encounter;
    s.pending = null;
    if (e) {
      if (e.npc) W.removeNpc(e.npc, e.ev && e.ev.leave === 'walk' ? 'walk' : 'stay');
      if (e.prop && e.prop.sky) e.prop.keep = false;
    }
    G.encounter = null;
    G.flow = null;
    UI.hideCard();
    markDirty();
    saveNow();
    pushStatus();
  }

  function feedbackDeltas(deltas, who) {
    for (const d of deltas || []) {
      if (['gold', 'food', 'morale', 'renown'].indexOf(d.k) >= 0) UI.floatDelta(d.k, d.v);
      if (d.k === 'meters' && d.v > 0) UI.toast('Shortcut! +' + U.formatDistance(d.v, G.state.settings.units), { icon: 'boot' });
      if (d.k === 'meters' && d.v < 0) UI.toast('Detour: ' + U.formatDistance(-d.v, G.state.settings.units) + ' lost', { icon: 'hourglass', kind: 'bad' });
      if (d.k === 'trinket') {
        const t = D.trinkets[d.id];
        if (t) UI.toast('New trinket: ' + t.name, { icon: t.icon, kind: 'gold', ms: 5000 });
      }
    }
    UI.renderHud(G.state);
  }

  // ---- Story beats --------------------------------------------------------------

  function startBeat(b) {
    const e = { beat: b, npc: null, gap: 1, readyAt: 0 };
    if (b.actor) {
      e.npc = W.spawnEncounter(b.actor, { name: D.speakers[b.actor] });
    } else {
      e.readyAt = W.t + 0.6;
    }
    G.encounter = e;
  }

  function openBeat(e) {
    const b = e.beat;
    const s = G.state;
    G.flow = { kind: 'beat', title: b.title, since: performance.now() };
    if (e.npc) e.npc.alert = false;
    runDialogue(b.lines, {
      kicker: 'The Kingsroad',
      title: b.title,
      names: {},
      npc: e.npc,
      onDone: () => {
        s.story.beats[b.id] = true;
        const deltas = L.applyEffects(s, b.outro, ctx());
        L.addLog(s, b.title + ' — a page for the chronicle.', 'story');
        feedbackDeltas(deltas);
        if (e.npc) W.removeNpc(e.npc, b.actor === 'reginald' ? 'walk' : 'stay');
        G.encounter = null;
        G.flow = null;
        UI.hideCard();
        markDirty();
        saveNow();
      },
    });
  }

  // ---------------------------------------------------------------------------
  // Dialogue runner (stories)
  // ---------------------------------------------------------------------------

  function speakerInfo(id, names) {
    const s = G.state;
    if (id === 'narrator') return { name: '', portrait: null, icon: 'book', italic: true };
    if (id === 'hero') return { name: (s.hero.id === 'king' ? 'King ' : 'Queen ') + s.hero.name, portrait: heroActor(), who: 'hero' };
    const c = D.companions[id];
    if (c) return { name: c.name, portrait: c.actor, who: s.party.indexOf(id) >= 0 ? id : null, companion: id };
    return { name: (names && names[id]) || D.speakers[id] || '', portrait: id };
  }

  function lineAllowed(ln, names, recruitId) {
    if (!Array.isArray(ln)) return true;
    const sp = ln[0];
    const req = ln[2];
    if (D.companions[sp] && sp !== recruitId && G.state.party.indexOf(sp) < 0) return false;
    if (req && !L.checkReq(G.state, req, ctx()).ok) return false;
    return true;
  }

  /**
   * Play a list of dialogue lines. opts: { kicker, title, names, recruitId, npc, onDone }
   * Choices apply their effects immediately and may inject follow-up lines.
   */
  function runDialogue(lines, opts) {
    const s = G.state;
    const queue = lines.slice();
    const names = opts.names || {};
    let allDeltas = [];
    const next = () => {
      while (queue.length && !(queue[0].choice || lineAllowed(queue[0], names, opts.recruitId))) queue.shift();
      if (!queue.length) {
        opts.onDone && opts.onDone(allDeltas);
        return;
      }
      const ln = queue.shift();
      if (ln.choice) {
        showDialogueChoice(ln.choice);
        return;
      }
      const info = speakerInfo(ln[0], names);
      if (ln[0] === 'dragon' && opts.npc && opts.npc.actor === 'dragon') opts.npc.anim = 'wake';
      if (info.who && !s.settings.reduceMotion) UI.bubble(info.who, '…', 1400);
      UI.showCard({
        kicker: opts.kicker,
        title: opts.title,
        portrait: info.portrait,
        portraitIcon: info.icon,
        speaker: info.name,
        italic: info.italic,
        text: L.fill(ln[1], s, {}),
        pill: opts.title,
        actions: [{ label: queue.length ? 'Continue' : 'Done', primary: true, hiddenKey: true, onClick: next }],
      });
    };
    const showDialogueChoice = (choices) => {
      const prev = UI.cardSpec || {};
      const options = choices
        .map((ch) => ({ ch, r: L.checkReq(s, ch.req, ctx()) }))
        .filter((o) => !o.r.hidden);
      UI.showCard({
        kicker: opts.kicker,
        title: opts.title,
        portrait: prev.portrait || heroActor(),
        portraitIcon: prev.portraitIcon,
        speaker: (s.hero.id === 'king' ? 'King ' : 'Queen ') + s.hero.name,
        text: 'What do you say?',
        instant: true,
        pill: opts.title,
        actions: options.map((o) => ({
          label: L.fill(choiceLabel(o.ch.t), s, {}),
          member: o.ch.req && o.ch.req.m ? o.ch.req.m : null,
          disabled: !o.r.ok,
          reason: o.r.reason,
          odds: o.ch.roll ? L.rollChance(s, o.ch.roll) : null,
          onClick: () => {
            let outcome = { fx: o.ch.fx, then: o.ch.then };
            if (o.ch.roll) {
              const win = G.rng() < L.rollChance(s, o.ch.roll);
              const r = win ? o.ch.roll.win : o.ch.roll.lose;
              outcome = { fx: r.fx, then: [['narrator', r.t]] };
            }
            const deltas = L.applyEffects(s, outcome.fx, ctx());
            allDeltas = allDeltas.concat(deltas);
            feedbackDeltas(deltas);
            markDirty();
            const then = (outcome.then || []).slice();
            queue.unshift.apply(queue, then);
            next();
          },
        })),
      });
    };
    next();
  }

  // ---------------------------------------------------------------------------
  // Prologue, arrival, location menu, finale
  // ---------------------------------------------------------------------------

  function runPrologue() {
    const s = G.state;
    const P = D.prologue;
    const originX = W.heroX;
    const scene = W.spawnScene(D.scenes[P.scene], originX, { key: 'prologue', recruit: 'quill', recruitId: 'quill', extraNpc: P.actor, extraX: 58 });
    W.clearDecorNear(originX + scene.extent[0], originX + scene.extent[1]);
    G.flow = { kind: 'story', title: P.place, since: performance.now() };
    setTimeout(() => {
      runDialogue(P.lines, {
        kicker: 'Prologue',
        title: P.place,
        recruitId: 'quill',
        onDone: () => {
          const spawnX = W.recruitNpc(scene, 'quill');
          L.recruit(s, 'quill');
          W.setParty(heroActor(), s.party, { quill: spawnX });
          s.story.prologue = true;
          UI.toast('Quill joined your court!', { portrait: 'quill', kind: 'gold' });
          UI.showCard({
            kicker: 'Prologue',
            title: 'The Travelling Kingdom',
            portraitIcon: 'map',
            text: 'Your first destination is Camp Dustmuster. Your court walks on its own while you work. Click your hero to hurry, click companions to chat, and answer the road when it calls.',
            instant: false,
            actions: [{ label: 'Set out on the Kingsroad', primary: true, icon: 'road', onClick: () => {
              G.flow = null;
              UI.hideCard();
              if (scene.extra) W.removeNpc(scene.extra, 'stay');
              L.addLog(s, 'The Kingsroad awaits. Destination: Dragon’s Rest.', 'story');
              saveNow();
            } }],
          });
        },
      });
    }, 600);
  }

  function beginArrival() {
    if (G.flow) return;
    const s = G.state;
    ensureScene(true);
    L.beginVisit(s);
    UI.clearBubbles();
    const loc = L.currentDestination(s);
    if (!s.visit.announced) {
      s.visit.announced = true;
      L.addLog(s, 'Arrived at ' + loc.name + '.', 'arrive');
      markDirty();
    }
    if (loc.finale && !s.flags.crowned) {
      runFinale(loc);
      return;
    }
    if (!loc.endless && loc.story && !s.visit.storyDone && !s.story.done[loc.id]) {
      runLocationStory(loc);
      return;
    }
    showLocationMenu();
  }

  function runLocationStory(loc) {
    const s = G.state;
    const scene = W.activeScene('stop:' + s.journey.stop);
    G.flow = { kind: 'story', title: loc.name, since: performance.now() };
    const region = D.regions[loc.region];
    runDialogue(loc.story, {
      kicker: region ? region.name : 'Arrived',
      title: loc.name,
      names: loc.names,
      recruitId: loc.recruit,
      onDone: () => {
        s.visit.storyDone = true;
        const deltas = L.applyEffects(s, loc.outro, ctx());
        if (loc.recruit && s.party.indexOf(loc.recruit) < 0) {
          const spawnX = scene ? W.recruitNpc(scene, loc.recruit) : null;
          L.recruit(s, loc.recruit);
          const sp = {};
          if (spawnX != null) sp[loc.recruit] = spawnX;
          W.setParty(heroActor(), s.party, sp);
          const c = D.companions[loc.recruit];
          L.applyEffects(s, { renown: 25 }, ctx());
          UI.toast(c.name + ' joined your court!', { portrait: c.actor, kind: 'gold', ms: 5000 });
          setTimeout(() => UI.bubble(loc.recruit, U.pick(c.quips, G.rng)), 900);
        }
        feedbackDeltas(deltas);
        markDirty();
        saveNow();
        G.flow = null;
        showLocationMenu();
      },
    });
  }

  function locationActions(loc) {
    const s = G.state;
    const acts = [];
    for (const kind of loc.services || []) {
      const meta = UI.serviceMeta[kind];
      if (!meta) continue;
      let sub = meta.sub;
      let cost = null;
      if (kind === 'inn') cost = { gold: L.servicePrice(s, 'inn') };
      if (kind === 'shrine') cost = { gold: L.servicePrice(s, 'shrine') };
      const used = !!s.visit.used[kind];
      acts.push({
        label: meta.label,
        icon: meta.icon,
        sub: used ? 'Done' : sub,
        cost: used ? null : cost,
        disabled: used,
        onClick: () => (kind === 'market' ? showMarket(loc) : doService(loc, kind)),
      });
    }
    acts.push({
      label: loc.finale ? 'Begin the Royal Progress' : 'Continue to ' + L.routeLocation(s, s.journey.stop + 1).name,
      primary: true,
      icon: 'road',
      onClick: departLocation,
    });
    return acts;
  }

  function showLocationMenu(lastText, lastDeltas) {
    const s = G.state;
    const loc = L.currentDestination(s);
    const region = D.regions[loc.region];
    G.flow = { kind: 'location', title: loc.name, since: performance.now() };
    let text = lastText;
    if (!text) {
      text = loc.blurb || '';
      if (loc.endless && loc.greet) text += ' ' + L.fill(loc.greet, s, {});
    }
    UI.showCard({
      kicker: (region ? region.name : '') + (loc.endless ? ' · Royal Progress' : ''),
      title: loc.name,
      portraitIcon: 'flag',
      text,
      instant: !!lastText,
      deltas: lastDeltas,
      pill: loc.name,
      actions: locationActions(loc),
    });
    pushStatus();
  }

  function doService(loc, kind) {
    const s = G.state;
    const res = L.useService(s, kind, G.rng, loc.flavor && loc.flavor[kind]);
    if (res.error) {
      UI.toast(res.error, { kind: 'bad' });
      return;
    }
    feedbackDeltas(res.deltas);
    markDirty();
    saveNow();
    showLocationMenu(res.t, res.deltas);
  }

  function showMarket(loc) {
    const s = G.state;
    const offers = L.marketOffers(s, G.rng);
    const extra = UI.marketExtra(s, offers, (what) => {
      let res;
      if (what.indexOf('trinket:') === 0) res = L.buyTrinket(s, what.slice(8));
      else res = L.useService(s, what, G.rng, loc.flavor && loc.flavor.market);
      if (res.error) {
        UI.toast(res.error, { kind: 'bad' });
        return;
      }
      feedbackDeltas(res.deltas);
      markDirty();
      showMarket(loc);
    });
    G.flow = { kind: 'market', title: loc.name, since: performance.now() };
    UI.showCard({
      kicker: loc.name,
      title: 'Market',
      portraitIcon: 'bag',
      text: (loc.flavor && loc.flavor.market) || 'Stalls of bread, cheese and curiosities. Your purse feels nervous.',
      instant: true,
      extra,
      actions: [{ label: 'Back', primary: true, icon: 'road', onClick: () => showLocationMenu() }],
    });
  }

  function departLocation() {
    const s = G.state;
    const prevRegion = L.regionOf(s);
    const loc = L.currentDestination(s);
    L.depart(s, G.rng);
    const next = L.currentDestination(s);
    G.flow = null;
    UI.hideCard();
    W.pendingScene = null;
    if (next.region !== prevRegion) {
      W.setBiomeFrom(W.heroX + Math.min(260, W.W * 0.9), next.region);
      A.loadBiome(BASE, VERSION, next.region).catch(() => {});
      const r = D.regions[next.region];
      if (r) setTimeout(() => UI.toast('Entering ' + r.name + ' — ' + r.blurb, { icon: 'map', ms: 6000 }), 2500);
    }
    preloadNextRegion();
    if (loc.finale) {
      UI.toast('The Royal Progress begins: endless roads, new towns, more tales.', { icon: 'crown', kind: 'gold', ms: 6000 });
    }
    G.nextBanterAt = performance.now() / 1000 + 6;
    markDirty();
    saveNow();
    pushStatus();
  }

  function runFinale(loc) {
    const s = G.state;
    const scene = W.activeScene('stop:' + s.journey.stop);
    const dragon = scene ? scene.npcs.find((n) => n.actor === 'dragon') : null;
    G.flow = { kind: 'story', title: loc.name, since: performance.now() };
    runDialogue(D.finale.lines, {
      kicker: 'The End of the Kingsroad',
      title: loc.name,
      npc: dragon,
      onDone: () => {
        const deltas = L.applyEffects(s, D.finale.outro, ctx());
        s.visit.storyDone = true;
        s.story.done[loc.id] = true;
        if (dragon) dragon.anim = 'idle';
        L.addLog(s, 'Crowned at Dragon’s Rest: ' + L.titleFor(s) + '!', 'story');
        feedbackDeltas(deltas);
        markDirty();
        saveNow();
        UI.showCard({
          kicker: 'Long live the ' + L.rulerWord(s),
          title: L.titleFor(s),
          portrait: heroActor(),
          text: 'Your court cheers. Quill weeps into the chronicle. Barrelby, if present, rolls a slow lap of honour. The road continues — and so does the Travelling Kingdom.',
          deltas,
          actions: [{ label: 'Onward', primary: true, icon: 'road', onClick: () => showLocationMenu() }],
        });
      },
    });
  }

  // ---------------------------------------------------------------------------
  // Auto-resolve for idle players
  // ---------------------------------------------------------------------------

  function autoResolveTick() {
    const s = G.state;
    if (!s.settings.autoResolve || !G.flow) return;
    const idle = performance.now() - G.flow.since;
    if (G.flow.kind === 'event' && idle > 90000) {
      const ev = G.encounter && G.encounter.ev;
      if (!ev) return;
      if (G.flow.result) {
        finishEvent();
        return;
      }
      const options = L.choicesFor(s, ev, ctx()).filter((o) => o.ok);
      const safe = options.find((o) => !o.cost && !o.choice.roll) || options.find((o) => !o.choice.roll) || options[0];
      if (safe) {
        chooseEvent(ev, safe.index);
        G.flow.since = performance.now() - 80000;
      }
    } else if (G.flow.kind === 'location' && idle > 150000 && s.visit.storyDone) {
      departLocation();
    }
  }

  // ---------------------------------------------------------------------------
  // Banter
  // ---------------------------------------------------------------------------

  function speakerPresent(sp) {
    if (sp === 'any') return G.state.party.length > 0;
    if (sp === 'hero') return true;
    return G.state.party.indexOf(sp) >= 0;
  }

  function banterTick() {
    const s = G.state;
    const now = performance.now() / 1000;
    if (G.banterBusy || now < G.nextBanterAt) return;
    const spacing = L.BANTER_SPACING[s.settings.banter] || L.BANTER_SPACING.normal;
    if (!isFinite(spacing[0])) {
      G.nextBanterAt = now + 30;
      return;
    }
    G.nextBanterAt = now + U.randRange(spacing[0], spacing[1], G.rng);
    if (!W.walking) return;
    const c = ctx();
    const ok = (b) => {
      if (b.req && !L.checkReq(s, b.req, c).ok) return false;
      if (b.lines) return b.lines.every((ln) => speakerPresent(ln[0]));
      return speakerPresent(b.s);
    };
    if (!G.banterDeck.length) G.banterDeck = U.shuffle(D.banter.map((b, i) => i), G.rng);
    // Prefer reactive lines (with req) when they apply.
    let pickIdx = -1;
    const reactive = D.banter.map((b, i) => i).filter((i) => D.banter[i].req && ok(D.banter[i]) && !(G.recentBanter || []).includes(i));
    if (reactive.length && G.rng() < 0.35) pickIdx = U.pick(reactive, G.rng);
    if (pickIdx < 0) {
      for (let tries = 0; tries < G.banterDeck.length; tries++) {
        const i = G.banterDeck.shift();
        if (ok(D.banter[i])) {
          pickIdx = i;
          break;
        }
        G.banterDeck.push(i);
      }
    }
    if (pickIdx < 0) return;
    G.recentBanter = (G.recentBanter || []).concat([pickIdx]).slice(-12);
    const b = D.banter[pickIdx];
    const used = [];
    const resolve = (sp) => {
      if (sp === 'any') {
        const pool = s.party.filter((id) => used.indexOf(id) < 0);
        const id = U.pick(pool.length ? pool : s.party, G.rng);
        used.push(id);
        return id;
      }
      used.push(sp);
      return sp;
    };
    if (b.lines) {
      G.banterBusy = true;
      let delay = 0;
      b.lines.forEach((ln, i) => {
        const who = resolve(ln[0]);
        const text = L.fill(ln[1], s, {});
        setTimeout(() => {
          if (G.flow || G.mode !== 'play') return;
          UI.bubble(who, text);
        }, delay);
        delay += U.clamp(1400 + text.length * 45, 1800, 4200);
        if (i === b.lines.length - 1) setTimeout(() => (G.banterBusy = false), delay);
      });
    } else {
      UI.bubble(resolve(b.s), L.fill(b.t, s, {}));
    }
  }

  function sayRandom(sp, lines) {
    const s = G.state;
    if (!s.party.length && sp === 'any') return;
    const who = sp === 'any' ? U.pick(s.party, G.rng) : sp;
    UI.bubble(who, U.pick(lines, G.rng));
  }

  // ---------------------------------------------------------------------------
  // Clock & weather
  // ---------------------------------------------------------------------------

  function updateClock(force) {
    const s = G.state;
    const mode = s ? s.settings.dayNight : 'auto';
    let dark = 0;
    let warm = 0;
    if (mode === 'night') dark = 1;
    else if (mode === 'auto') {
      const d = new Date();
      const hr = d.getHours() + d.getMinutes() / 60;
      if (hr >= 21 || hr < 5) dark = 1;
      else if (hr >= 19) {
        dark = (hr - 19) / 2;
        warm = 1 - Math.abs(hr - 19.5) / 1.5;
      } else if (hr >= 17.5) {
        warm = (hr - 17.5) / 2;
      } else if (hr < 7) {
        dark = 1 - (hr - 5) / 2;
        warm = 1 - Math.abs(hr - 6.2) / 1.2;
      }
      if (s && (hr >= 0 && hr < 4) && W.walking && !s.flags.nightOwl) {
        s.flags.nightOwl = true;
        markDirty();
      }
    }
    G.clock.dark = U.clamp(dark, 0, 1);
    G.clock.warm = U.clamp(warm, 0, 1);
    G.clock.night = G.clock.dark > 0.5;
    W.dark = G.clock.dark;
    W.warm = G.clock.warm;
  }

  function updateWeather() {
    const s = G.state;
    const now = performance.now();
    if (!s.settings.weather) {
      W.weather = 'clear';
      return;
    }
    if (now < G.weatherNextAt) return;
    G.weatherNextAt = now + U.randRange(120000, 300000, G.rng);
    const region = W.biomeAt(W.heroX);
    const r = G.rng();
    if (region === 'winter') W.weather = r < 0.35 ? 'snow' : 'clear';
    else W.weather = r < 0.18 ? 'rain' : 'clear';
  }

  // ---------------------------------------------------------------------------
  // Input
  // ---------------------------------------------------------------------------

  function bindInput() {
    const canvas = document.getElementById('world');
    const markInteract = () => (G.userInteracted = true);
    document.addEventListener('pointerdown', markInteract, true);
    document.addEventListener('keydown', markInteract, true);
    canvas.addEventListener('click', (e) => {
      if (G.mode !== 'play' || !G.state) return;
      const rect = canvas.getBoundingClientRect();
      const hit = W.hitTest(e.clientX - rect.left, e.clientY - rect.top);
      if (!hit) {
        if (canWalk()) hurry(false);
        return;
      }
      if (hit.kind === 'hero') {
        hurry(true);
      } else if (hit.kind === 'member') {
        const c = D.companions[hit.ref.id];
        if (c) UI.bubble(hit.ref.id, U.pick(c.quips, G.rng));
      } else if (hit.kind === 'npc') {
        const n = hit.ref;
        if (G.encounter && G.encounter.npc === n && !G.flow) {
          G.encounter.gap = 0;
          openEncounter();
        } else if (n.name) {
          UI.bubble(n, n.name, 1800);
        }
      }
    });
    document.getElementById('observer-take').addEventListener('click', () => post({ type: 'takeOver' }));
    UI.onNav = (tab) => openTab(tab);
  }

  function hurry(talk) {
    const s = G.state;
    if (!canWalk()) {
      if (talk) UI.bubble('hero', G.flow ? 'One moment…' : 'Hmm?', 1000);
      return;
    }
    W.hurry();
    s.stats.hurries += 1;
    markDirty();
    if (talk && G.rng() < 0.35) UI.bubble('hero', U.pick(D.heroClicks, G.rng), 1400);
  }

  // ---------------------------------------------------------------------------
  // Panels
  // ---------------------------------------------------------------------------

  function openTab(tab) {
    if (G.mode !== 'play' || !G.state) return;
    G.tab = tab;
    UI.setNavActive(tab);
    if (tab === 'road') {
      UI.hidePanel();
      return;
    }
    renderPanel(tab, G.panelSub);
  }

  function renderPanel(tab, sub) {
    const s = G.state;
    if (tab === 'court') {
      const body = UI.showPanel('Your Court', null);
      UI.renderCourt(body, s, (id, dir) => {
        const i = s.party.indexOf(id);
        const j = i + dir;
        if (i < 0 || j < 0 || j >= s.party.length) return;
        s.party[i] = s.party[j];
        s.party[j] = id;
        W.setParty(heroActor(), s.party);
        markDirty();
        renderPanel('court');
      });
    } else if (tab === 'journal') {
      UI.setJournalDot(false);
      const tabs = [
        { id: 'chronicle', label: 'Chronicle' },
        { id: 'route', label: 'Route' },
        { id: 'decrees', label: 'Decrees' },
        { id: 'treasures', label: 'Treasures' },
      ];
      const cur = sub && tabs.some((t) => t.id === sub) ? sub : G.journalTab || 'chronicle';
      G.journalTab = cur;
      const body = UI.showPanel('Royal Journal', tabs, cur, (id) => renderPanel('journal', id));
      if (cur === 'chronicle') UI.renderChronicle(body, s);
      else if (cur === 'route') UI.renderRoute2(body, s);
      else if (cur === 'decrees') UI.renderDecrees(body, s);
      else UI.renderTreasures(body, s);
    } else if (tab === 'settings') {
      const body = UI.showPanel('Settings', null);
      UI.renderSettings(
        body,
        s,
        (key, value) => {
          s.settings[key] = value;
          s.settings = L.sanitizeSettings(s.settings);
          applySettings();
          if (key === 'eventFreq') L.scheduleNextEvent(s, G.rng);
          if (key === 'dayNight') updateClock(true);
          if (key === 'units') UI.renderHud(s);
          markDirty();
          saveNow();
        },
        { reset: () => post({ type: 'requestReset' }), version: VERSION }
      );
    }
  }

  function doReset() {
    stopLoop();
    UI.hideCard();
    UI.hidePanel();
    UI.clearBubbles();
    G.state = null;
    G.flow = null;
    G.encounter = null;
    W.scenes = [];
    W.npcs = [];
    W.party = [];
    W.eventProps = [];
    enterSelect();
  }

  // Expose a tiny debug surface for the dev harness.
  TK.debug = {
    G,
    state: () => G.state,
    walk: (m) => {
      const s = G.state;
      L.advance(s, m, ctx());
      W.heroX += m * MPX;
    },
    event: (id) => {
      const ev = L.eventDef(id);
      if (ev && !G.encounter && !G.flow) startEventEncounter(ev);
    },
    arrive: () => {
      const s = G.state;
      const rem = remainingMeters();
      ensureScene(true);
      L.advance(s, rem, ctx());
      W.heroX += rem * MPX;
    },
    save: saveNow,
    /** Step the game manually (for the dev harness when the page is in the background). */
    tick: (seconds) => {
      const steps = Math.max(1, Math.round((seconds || 1) * 30));
      for (let i = 0; i < steps; i++) frame(1 / 30);
    },
  };

  boot();
})(typeof window !== 'undefined' ? window : globalThis);
