/* Travelling Kingdom — the scrolling pixel world (canvas). */
(function (root) {
  'use strict';

  const TK = (root.TK = root.TK || {});
  const U = TK.util;
  const A = TK.assets;
  const MPX = TK.logic.METER_PX;

  const SKY = { green: ['#7fc3d6', '#cfeef0'], autumn: ['#e6c27c', '#f6e5bd'], winter: ['#86c7d8', '#e3f5f7'] };
  const LAYER_SPEED = [0, 0.04, 0.12, 0.26, 0.46];
  const DECOR = {
    green: {
      back: ['tuft_g1', 'tuft_g2', 'tuft_g3', 'tuft_g1', 'tuft_g2', 'rock_g1', 'rock_g2', 'rock_g3', 'bush_g1', 'bush_g2', 'bush_g3', 'rockmid_g'],
      tall: ['tree', 'birch', 'pine', 'blossom', 'willow', 'pineolive', 'bigpine', 'treeapple'],
      front: ['tallgrass', 'tuft_g1', 'tuft_g3'],
    },
    autumn: {
      back: ['tuft_a1', 'tuft_a2', 'tuft_a3', 'tuft_a1', 'rock_a1', 'rock_a2', 'rock_a3', 'bush_a1', 'bush_a2', 'bush_a3', 'rockmid_a', 'pumpkin', 'mound_a'],
      tall: ['treeautumn', 'birchautumn', 'pineorange', 'pinered', 'willowautumn', 'pineolive'],
      front: ['tuft_a2', 'tuft_a3'],
    },
    winter: {
      back: ['tuft_w1', 'tuft_w2', 'tuft_w3', 'tuft_w1', 'rock_w1', 'rock_w2', 'rock_w3', 'bush_w1', 'bush_w2', 'bush_w3', 'rockmid_w', 'mound_w'],
      tall: ['treewinter', 'birchwinter', 'pinesnow', 'pinesnow', 'willowwinter'],
      front: ['tuft_w2', 'tuft_w3'],
    },
  };
  const LIGHT_PROPS = { torch: [255, 170, 70], campfire: [255, 150, 60], campfirepot: [255, 150, 60], furnace: [255, 120, 50], cooking: [255, 150, 60], jacko: [255, 160, 40], jackobig: [255, 160, 40] };

  const W = {
    canvas: null,
    ctx: null,
    dpr: 1,
    k: 1,
    W: 240,
    H: 150,
    gy: 130,
    t: 0,
    heroX: 0,
    camX: 0,
    heroScreenX: 90,
    heroActor: 'queen',
    party: [],
    npcs: [],
    decor: [],
    nextDecorX: 0,
    scenes: [],
    eventProps: [],
    clouds: [],
    particles: [],
    stars: [],
    biomeEdges: [{ x: -1e9, biome: 'green' }],
    bgBiome: 'green',
    bgPrev: null,
    bgFade: 1,
    bgCache: {},
    dark: 0,
    warm: 0,
    sceneDusk: 0,
    weather: 'clear',
    weatherUntil: 0,
    walking: false,
    boostUntil: 0,
    showCastle: 0,
    minimalBg: false,
    reduceMotion: false,
    rng: U.makeRng((Date.now() & 0xffff) + 7),
    nextBirdsAt: 20,
  };

  // ---------------------------------------------------------------------------
  // Setup & sizing
  // ---------------------------------------------------------------------------

  W.init = function init(canvas) {
    W.canvas = canvas;
    W.ctx = canvas.getContext('2d', { alpha: false });
    W.resize();
  };

  W.resize = function resize() {
    const c = W.canvas;
    const rect = c.parentElement.getBoundingClientRect();
    const stage = c.parentElement.parentElement;
    const stageRect = stage ? stage.getBoundingClientRect() : rect;
    const dpr = Math.max(1, root.devicePixelRatio || 1);
    const devW = Math.max(1, Math.round(rect.width * dpr));
    const devH = Math.max(1, Math.round(rect.height * dpr));
    if (c.width !== devW) c.width = devW;
    if (c.height !== devH) c.height = devH;
    // Zoom comes from the whole stage, so opening a card (which shrinks the
    // viewport) crops the sky instead of rescaling the world.
    const fullDevH = Math.max(devH, Math.round(stageRect.height * dpr));
    let k = Math.round((fullDevH / 150) * 2) / 2;
    const maxK = Math.floor((devW / 190) * 2) / 2;
    k = U.clamp(Math.min(k, maxK), 1, 8);
    const prevK = W.k;
    const prevFull = W.fullH;
    W.dpr = dpr;
    W.k = k;
    W.W = devW / k;
    W.H = devH / k;
    W.fullH = fullDevH / k;
    const groundH = Math.round(U.clamp(W.fullH * 0.15, 16, 30));
    W.groundH = groundH;
    W.gy = Math.round(W.H - groundH);
    W.gyFull = Math.round(W.fullH - groundH);
    if (stage) stage.style.setProperty('--world-min-h', Math.ceil(((groundH + 62) * k) / dpr) + 'px');
    if (prevK === k && prevFull === W.fullH && Object.keys(W.bgCache).length) return;
    W.bgCache = {};
    W.stars = [];
    const n = Math.round((W.W * W.gy) / 900);
    for (let i = 0; i < n; i++) {
      W.stars.push({ x: W.rng() * W.W, y: W.rng() * W.gy * 0.7, p: W.rng() * 6, s: W.rng() < 0.15 ? 2 : 1 });
    }
  };

  /** Convert world art coordinates to CSS pixels inside the stage. */
  W.toCss = function toCss(x, y) {
    const s = W.k / W.dpr;
    return { x: (x - W.camX) * s, y: y * s };
  };

  W.cssScale = function cssScale() {
    return W.k / W.dpr;
  };

  // ---------------------------------------------------------------------------
  // Biomes
  // ---------------------------------------------------------------------------

  W.biomeAt = function biomeAt(x) {
    let b = W.biomeEdges[0].biome;
    for (const e of W.biomeEdges) {
      if (e.x <= x) b = e.biome;
      else break;
    }
    return b;
  };

  /** Start a new biome from world x onwards (ground + decor switch there; sky crossfades). */
  W.setBiomeFrom = function setBiomeFrom(x, biome) {
    const cur = W.biomeAt(x);
    if (cur === biome) return;
    W.biomeEdges = W.biomeEdges.filter((e) => e.x < x);
    W.biomeEdges.push({ x, biome });
    W.biomeEdges.sort((a, b) => a.x - b.x);
  };

  /** Hard-set the biome everywhere (on load). */
  W.resetBiome = function resetBiome(biome) {
    W.biomeEdges = [{ x: -1e9, biome }];
    W.bgBiome = biome;
    W.bgPrev = null;
    W.bgFade = 1;
  };

  function layerCanvas(biome, n) {
    const key = biome + ':' + n;
    if (W.bgCache[key]) return W.bgCache[key];
    const bg = A.bg[biome];
    if (!bg) return null;
    const img = n === 'castle' ? bg.castle : bg.layers[n];
    if (!img) return null;
    const scale = ((W.gyFull || W.gy) + 2) / A.atlas.bg.groundRow;
    const w = Math.max(1, Math.round(img.width * scale));
    const h = Math.max(1, Math.round(img.height * scale));
    const c = document.createElement('canvas');
    c.width = w;
    c.height = h;
    const ctx = c.getContext('2d');
    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = 'high';
    ctx.drawImage(img, 0, 0, w, h);
    W.bgCache[key] = c;
    return c;
  }

  // ---------------------------------------------------------------------------
  // Party
  // ---------------------------------------------------------------------------

  function memberTarget(i) {
    return { dx: -(17 + i * 14), lane: i % 2 === 0 ? 'back' : 'front' };
  }

  /** Sync walking order. New members appear at `spawnX` (world) or off-screen left. */
  W.setParty = function setParty(heroActor, ids, spawn) {
    W.heroActor = heroActor;
    const old = {};
    for (const m of W.party) old[m.id] = m;
    W.party = ids.map((id, i) => {
      const tgt = memberTarget(i);
      const c = TK.data.companions[id];
      let m = old[id];
      if (!m) {
        const sx = spawn && spawn[id] != null ? spawn[id] : W.heroX + tgt.dx - 40;
        m = { id, actor: (c && c.actor) || id, dx: sx - W.heroX, lane: tgt.lane, face: 'right', moving: false, phase: W.rng() * 3, vx: 0 };
      }
      m.tdx = tgt.dx;
      m.lane = tgt.lane;
      return m;
    });
  };

  // ---------------------------------------------------------------------------
  // Scenes, NPCs, props
  // ---------------------------------------------------------------------------

  function resolveProp(p, biome) {
    if (!p) return null;
    if (typeof p === 'string') return p;
    return p[biome] || p.green || null;
  }

  function sceneExtent(def) {
    let lo = 0;
    let hi = 0;
    for (const p of def.props || []) {
      const m = A.prop(resolveProp(p.p, 'green'));
      const w = m ? m.w : 40;
      lo = Math.min(lo, p.x - w / 2);
      hi = Math.max(hi, p.x + w / 2);
    }
    for (const n of def.npcs || []) {
      const a = A.actor(n.a);
      const w = a ? a.w : 40;
      lo = Math.min(lo, n.x - w / 2);
      hi = Math.max(hi, n.x + w / 2);
    }
    if (def.water) {
      lo = Math.min(lo, def.water[0]);
      hi = Math.max(hi, def.water[1]);
    }
    return [lo - 10, hi + 10];
  }

  /**
   * Place a location scene with its origin at world x. `opts.recruit` adds the recruit NPC.
   * Returns the scene object.
   */
  W.spawnScene = function spawnScene(def, originX, opts) {
    const o = opts || {};
    const biome = W.biomeAt(originX);
    const scene = {
      def,
      x: originX,
      biome,
      extent: sceneExtent(def),
      key: o.key || null,
      npcs: [],
      recruit: null,
      dusk: !!def.dusk,
      castle: !!def.castle,
    };
    for (const n of def.npcs || []) {
      const face = n.face || (n.x > 0 ? 'left' : 'right');
      scene.npcs.push(makeNpc(n.a, originX + n.x, { face, lane: 'scene', name: (o.names && o.names[n.a]) || null }));
    }
    if (o.recruit) {
      const rx = def.recruitX != null ? def.recruitX : 30;
      scene.recruit = makeNpc(o.recruit, originX + (rx || 30), { face: 'left', lane: 'back', name: o.recruitName || null, isRecruit: o.recruitId || o.recruit });
      scene.npcs.push(scene.recruit);
    }
    if (o.extraNpc) {
      scene.extra = makeNpc(o.extraNpc, originX + (o.extraX || 46), { face: 'left', lane: 'back' });
      scene.npcs.push(scene.extra);
    }
    W.scenes.push(scene);
    return scene;
  };

  W.activeScene = function activeScene(key) {
    for (let i = W.scenes.length - 1; i >= 0; i--) {
      if (!key || W.scenes[i].key === key) return W.scenes[i];
    }
    return null;
  };

  function makeNpc(actor, x, o) {
    return {
      actor,
      x,
      y: 0,
      face: o.face || 'left',
      lane: o.lane || 'back',
      anim: 'idle',
      phase: W.rng() * 4,
      name: o.name || null,
      isRecruit: o.isRecruit || null,
      alpha: 1,
      vx: 0,
      vy: 0,
      fly: false,
      alert: false,
    };
  }

  /** Spawn an encounter NPC just past the right edge. */
  W.spawnEncounter = function spawnEncounter(actor, opts) {
    const o = opts || {};
    const a = A.actor(actor);
    const half = a ? a.w / 2 : 16;
    const x = Math.max(W.heroX + 46 + half * 0.4, W.camX + W.W + half + 6);
    const npc = makeNpc(actor, x, { face: 'left', lane: 'back', name: o.name });
    npc.alert = true;
    npc.encounter = true;
    W.npcs.push(npc);
    return npc;
  };

  /** Distance (art px) the party still needs to walk to meet an encounter. */
  W.encounterGap = function encounterGap(npc) {
    const a = A.actor(npc.actor);
    const meet = 30 + (a ? Math.max(0, a.w / 2 - 14) : 0);
    return npc.x - W.heroX - meet;
  };

  W.spawnEventProp = function spawnEventProp(propId, opts) {
    const o = opts || {};
    if (propId === 'chest') {
      const p = { kind: 'chest', x: W.camX + W.W + 24, chest: 'chest_wood', open: 0, t0: 0 };
      W.eventProps.push(p);
      return p;
    }
    const m = A.prop(propId);
    const x = W.camX + W.W + (m ? m.w / 2 : 20) + 6;
    const p = { kind: 'prop', p: propId, x, sky: propId === 'balloon', y: 0, water: propId === 'boat', t0: W.t };
    if (p.sky) {
      p.x = W.camX + W.W * 0.85;
      p.y = W.gy * 0.35;
    }
    if (o.at != null) p.x = o.at;
    W.eventProps.push(p);
    return p;
  };

  W.openChest = function openChest(p) {
    if (p && p.kind === 'chest') p.open = W.t;
  };

  W.removeNpc = function removeNpc(npc, how) {
    if (!npc) return;
    if (how === 'walk' && A.actor(npc.actor) && A.actor(npc.actor).anims.walk) {
      npc.face = 'right';
      npc.anim = 'walk';
      npc.vx = 26;
      npc.leaving = true;
      npc.alert = false;
      return;
    }
    if (how === 'stay') {
      npc.alert = false;
      npc.encounter = false;
      return;
    }
    npc.fade = W.t;
    npc.alert = false;
  };

  /** Turn a scene recruit NPC into a party member that falls into formation. */
  W.recruitNpc = function recruitNpc(scene, memberId) {
    if (!scene || !scene.recruit) return null;
    const npc = scene.recruit;
    scene.npcs = scene.npcs.filter((n) => n !== npc);
    scene.recruit = null;
    return npc.x;
  };

  // ---------------------------------------------------------------------------
  // Interaction
  // ---------------------------------------------------------------------------

  W.hurry = function hurry() {
    W.boostUntil = Math.min(W.t + 1.6, Math.max(W.boostUntil, W.t) + 0.45);
    if (!W.reduceMotion) {
      for (let i = 0; i < 3; i++) {
        W.particles.push({ kind: 'dust', x: W.heroX - 4 - W.rng() * 6, y: W.gy + 6, vx: -10 - W.rng() * 14, vy: -6 - W.rng() * 6, life: 0.5 + W.rng() * 0.3, age: 0 });
      }
    }
  };

  W.boostFactor = function boostFactor() {
    return W.t < W.boostUntil ? 2.2 : 1;
  };

  function actorBox(actorId, x, yFeet, face) {
    const a = A.actor(actorId);
    if (!a) return null;
    const flip = face === 'left' ? a.faces !== 'left' : a.faces === 'left';
    const left = flip ? x - (a.w - a.ax) : x - a.ax;
    return { x0: left, x1: left + a.w, y0: yFeet - a.ay, y1: yFeet };
  }

  function laneY(lane) {
    if (lane === 'front') return W.gy + 7;
    if (lane === 'scene') return W.gy + 1;
    return W.gy + 3;
  }

  W.laneY = laneY;

  /** Hit test in CSS pixels. Returns {kind, ref}. */
  W.hitTest = function hitTest(cssX, cssY) {
    const s = W.cssScale();
    const x = cssX / s + W.camX;
    const y = cssY / s;
    const inBox = (b, pad) => b && x >= b.x0 - pad && x <= b.x1 + pad && y >= b.y0 - pad && y <= b.y1 + pad;
    // Front-most first: hero, front lane, back lane, npcs
    const hb = actorBox(W.heroActor, W.heroX, laneY('front'), 'right');
    if (inBox(shrinkBox(hb), 4)) return { kind: 'hero' };
    const members = W.party.slice().sort((a, b) => (a.lane === 'front' ? 0 : 1) - (b.lane === 'front' ? 0 : 1));
    for (const m of members) {
      const b = actorBox(m.actor, W.heroX + m.dx, laneY(m.lane), m.face);
      if (inBox(shrinkBox(b), 1)) return { kind: 'member', ref: m };
    }
    for (const n of allNpcs()) {
      const b = actorBox(n.actor, n.x, laneY(n.lane) - n.y, n.face);
      if (inBox(shrinkBox(b), 0)) return { kind: 'npc', ref: n };
    }
    return null;
  };

  function shrinkBox(b) {
    if (!b) return null;
    const w = b.x1 - b.x0;
    return { x0: b.x0 + w * 0.25, x1: b.x1 - w * 0.25, y0: b.y0 + 6, y1: b.y1 };
  }

  function allNpcs() {
    const out = W.npcs.slice();
    for (const s of W.scenes) out.push.apply(out, s.npcs);
    return out;
  }

  /** Head position (CSS px) of the hero, a member (by id) or an NPC object. */
  W.headOf = function headOf(who) {
    let actor;
    let x;
    let yFeet;
    if (who === 'hero') {
      actor = W.heroActor;
      x = W.heroX;
      yFeet = laneY('front');
    } else if (typeof who === 'string') {
      const m = W.party.find((p) => p.id === who);
      if (!m) return null;
      actor = m.actor;
      x = W.heroX + m.dx;
      yFeet = laneY(m.lane);
    } else if (who && who.actor) {
      actor = who.actor;
      x = who.x;
      yFeet = laneY(who.lane) - (who.y || 0);
    } else {
      return null;
    }
    const a = A.actor(actor);
    const top = yFeet - (a ? a.ay : 40) + 4;
    return W.toCss(x, top);
  };

  // ---------------------------------------------------------------------------
  // Update
  // ---------------------------------------------------------------------------

  /**
   * Advance the world. `walk` = whether the party moves, `mps` = meters per second.
   * Returns meters walked this frame.
   */
  W.update = function update(dt, walk, mps) {
    W.t += dt;
    let dx = 0;
    if (walk) {
      dx = mps * MPX * W.boostFactor() * dt;
      W.heroX += dx;
    }
    W.walking = walk;
    W.lastSpeed = walk ? mps * MPX * W.boostFactor() : 0;

    // Camera: keep room for the trail on the left, room ahead on the right.
    const trail = Math.min(W.party.length, 7) * 14;
    const target = U.clamp(Math.round(30 + trail + 26), Math.round(W.W * 0.34), Math.round(W.W * 0.66));
    W.heroScreenX += (target - W.heroScreenX) * Math.min(1, dt * 1.5);
    W.camX = W.heroX - W.heroScreenX;

    // Party formation
    for (const m of W.party) {
      const diff = m.tdx - m.dx;
      const maxRel = 34 * dt;
      const step = Math.abs(diff) <= maxRel ? diff : Math.sign(diff) * maxRel;
      m.dx += step;
      const vWorld = (walk ? dx : 0) / Math.max(dt, 1e-4) + step / Math.max(dt, 1e-4);
      m.vx = vWorld;
      if (vWorld > 3) {
        m.moving = true;
        m.face = 'right';
      } else if (vWorld < -3) {
        m.moving = true;
        m.face = 'left';
      } else {
        m.moving = false;
        m.face = 'right';
      }
    }

    // NPC motion (leaving walkers, fliers, fades)
    for (const n of allNpcs()) {
      if (n.vx || n.vy) {
        n.x += n.vx * dt;
        n.y += n.vy * dt;
      }
    }
    W.npcs = W.npcs.filter((n) => {
      if (n.fade != null && W.t - n.fade > 0.6) return false;
      const a = A.actor(n.actor);
      const w = a ? a.w : 40;
      return n.x + w > W.camX - 60 && n.x - w < W.camX + W.W + 400 && n.y < W.H * 2;
    });

    // Scenes linger until fully behind us
    W.scenes = W.scenes.filter((s, i) => i === W.scenes.length - 1 || s.x + s.extent[1] > W.camX - 40);
    W.eventProps = W.eventProps.filter((p) => p.x > W.camX - 120 || p.keep);

    updateDecor();
    updateAmbient(dt);
    updateClouds(dt, dx);
    updateParticles(dt);

    // Background crossfade toward the biome under the hero
    const want = W.biomeAt(W.heroX + W.W * 0.25);
    if (want !== W.bgBiome && A.bg[want]) {
      W.bgPrev = W.bgBiome;
      W.bgBiome = want;
      W.bgFade = 0;
    }
    if (W.bgFade < 1) W.bgFade = Math.min(1, W.bgFade + dt / 2.5);

    // Scene dusk (graveyard / manor) and castle near the finale
    let dusk = 0;
    let castle = 0;
    for (const s of W.scenes) {
      const d = Math.abs(s.x - W.heroX);
      const f = U.clamp(1 - (d - 120) / 260, 0, 1);
      if (s.dusk) dusk = Math.max(dusk, f);
      if (s.castle) castle = Math.max(castle, U.clamp(1 - (d - 200) / 600, 0, 1));
    }
    W.sceneDusk += (dusk - W.sceneDusk) * Math.min(1, dt * 1.2);
    W.showCastle += (Math.max(castle, W.castleBase || 0) - W.showCastle) * Math.min(1, dt * 0.8);

    return dx / MPX;
  };

  function sceneBlocks(x, w) {
    for (const s of W.scenes) {
      if (x + w / 2 > s.x + s.extent[0] - 24 && x - w / 2 < s.x + s.extent[1] + 24) return true;
    }
    if (W.pendingScene && x + w / 2 > W.pendingScene.x0 - 24 && x - w / 2 < W.pendingScene.x1 + 24) return true;
    return false;
  }

  function updateDecor() {
    const ahead = W.camX + W.W + 120;
    if (W.nextDecorX < W.camX - 40) W.nextDecorX = W.camX - 40;
    let guard = 0;
    while (W.nextDecorX < ahead && guard++ < 60) {
      const x = W.nextDecorX;
      const biome = W.biomeAt(x);
      const pool = DECOR[biome] || DECOR.green;
      const r = W.rng();
      let item;
      if (r < 0.13) item = { p: U.pick(pool.tall, W.rng), layer: 'tall' };
      else if (r < 0.2) item = { p: U.pick(pool.front, W.rng), layer: 'front' };
      else item = { p: U.pick(pool.back, W.rng), layer: 'back' };
      const m = A.prop(item.p);
      const w = m ? m.w : 30;
      item.x = x + w / 2;
      item.flip = W.rng() < 0.5;
      if (!sceneBlocks(item.x, w)) W.decor.push(item);
      W.nextDecorX += (item.layer === 'tall' ? w * 0.7 : w) + 14 + W.rng() * 70;
    }
    W.decor = W.decor.filter((d) => {
      const m = A.prop(d.p);
      return d.x + (m ? m.w / 2 : 20) > W.camX - 20;
    });
  }

  W.clearDecorNear = function clearDecorNear(x0, x1) {
    W.decor = W.decor.filter((d) => {
      const m = A.prop(d.p);
      const w = m ? m.w : 30;
      return d.x + w / 2 < x0 - 24 || d.x - w / 2 > x1 + 24;
    });
  };

  function updateAmbient(dt) {
    // Road critters ahead: pigeons and frogs that scatter as you approach.
    if (W.walking && W.rng() < dt * 0.025 && W.npcs.filter((n) => n.critter).length < 2) {
      const biome = W.biomeAt(W.camX + W.W);
      const kind = biome === 'winter' ? 'pigeon' : W.rng() < 0.6 ? 'pigeon' : 'frog';
      const x = W.camX + W.W + 20;
      if (!sceneBlocks(x, 40)) {
        const n = makeNpc(kind, x, { face: W.rng() < 0.5 ? 'left' : 'right', lane: 'back' });
        n.critter = kind;
        W.npcs.push(n);
      }
    }
    for (const n of W.npcs) {
      if (!n.critter || n.fly) continue;
      if (n.x - W.heroX < 38) {
        n.fly = true;
        if (n.critter === 'pigeon') {
          n.actor = 'pigeonfly';
          n.face = 'right';
          n.vx = 30 + W.rng() * 20;
          n.vy = 26 + W.rng() * 10;
        } else {
          n.actor = 'frogjump';
          n.face = 'right';
          n.vx = 22;
          n.vy = 0;
          n.hop = W.t;
        }
      }
    }
    for (const n of W.npcs) {
      if (n.critter === 'frog' && n.fly) {
        n.y = Math.abs(Math.sin((W.t - n.hop) * 6)) * 6;
      }
    }
    // Birds crossing the sky
    if (W.t > W.nextBirdsAt) {
      W.nextBirdsAt = W.t + 35 + W.rng() * 70;
      const count = 1 + Math.floor(W.rng() * 3);
      for (let i = 0; i < count; i++) {
        W.particles.push({ kind: 'bird', x: W.W + 10 + i * 9, y: 10 + W.rng() * W.gy * 0.3 + i * 3, vx: -(18 + W.rng() * 8), vy: -1 + W.rng() * 2, life: 30, age: 0, ph: W.rng() * 3 });
      }
    }
  }

  function updateClouds(dt, dx) {
    const sky = W.gy * 0.5;
    const want = Math.max(2, Math.round(W.W / 110));
    while (W.clouds.length < want) {
      const ids = ['cloud1', 'cloud3', 'cloud4', 'cloud6', 'cloud7', 'cloud8', 'cloud10', 'puff4', 'puff5', 'puff6'];
      const id = U.pick(ids, W.rng);
      const m = A.prop(id);
      const s = 0.35 + W.rng() * 0.35;
      W.clouds.push({
        id,
        x: W.clouds.length < want - 1 && W.t < 1 ? W.rng() * W.W : W.W + 10,
        y: 4 + W.rng() * sky * 0.6,
        s,
        v: 2 + W.rng() * 4,
        w: m ? m.w * s : 40,
      });
    }
    for (const c of W.clouds) {
      c.x -= (c.v + dx * 0.03 / Math.max(dt, 1e-4)) * dt;
    }
    W.clouds = W.clouds.filter((c) => c.x + c.w > -10);
  }

  function updateParticles(dt) {
    const biome = W.biomeAt(W.heroX);
    const weather = W.weather;
    if (!W.reduceMotion) {
      if (weather === 'rain') {
        for (let i = 0; i < 3; i++) W.particles.push({ kind: 'rain', x: W.rng() * (W.W + 40), y: -4, vx: -30, vy: 170 + W.rng() * 40, life: 2, age: 0 });
      } else if (weather === 'snow' || (biome === 'winter' && W.rng() < 0.35)) {
        if (W.rng() < (weather === 'snow' ? 0.9 : 0.25)) W.particles.push({ kind: 'snow', x: W.rng() * (W.W + 40), y: -3, vx: -6 - W.rng() * 6, vy: 10 + W.rng() * 12, life: 14, age: 0, ph: W.rng() * 6 });
      } else if (biome === 'autumn' && W.rng() < 0.06) {
        W.particles.push({ kind: 'leaf', x: W.rng() * (W.W + 40), y: -3, vx: -10 - W.rng() * 8, vy: 9 + W.rng() * 6, life: 16, age: 0, ph: W.rng() * 6, c: W.rng() < 0.5 ? '#e0742c' : '#f2b13c' });
      }
    }
    const dxs = W.lastSpeed || 0;
    for (const p of W.particles) {
      p.age += dt;
      if (p.kind === 'snow' || p.kind === 'leaf') {
        p.x += (p.vx - dxs * 0.15 + Math.sin(W.t * 2 + p.ph) * 4) * dt;
        p.y += p.vy * dt;
      } else if (p.kind === 'bird') {
        p.x += p.vx * dt;
        p.y += p.vy * dt;
      } else if (p.kind === 'dust') {
        p.x += p.vx * dt;
        p.y += p.vy * dt;
      } else {
        p.x += (p.vx - dxs * 0.1) * dt;
        p.y += p.vy * dt;
      }
    }
    W.particles = W.particles.filter((p) => p.age < p.life && p.y < W.H + 4 && p.x > -20);
    if (W.particles.length > 400) W.particles.splice(0, W.particles.length - 400);
  }

  // ---------------------------------------------------------------------------
  // Rendering
  // ---------------------------------------------------------------------------

  function drawActor(ctx, actorId, animName, x, yFeet, face, phase, alpha, moving) {
    const a = A.actor(actorId);
    if (!a || !A.img.actors) return;
    let anim = a.anims[animName] || a.anims.idle || a.anims[Object.keys(a.anims)[0]];
    if (animName === 'walk' && !a.anims.walk) anim = a.anims.idle;
    const fps = anim.fps * (moving && W.lastSpeed ? U.clamp(W.lastSpeed / 19, 0.7, 2.2) : 1);
    const idx = Math.floor((W.t + (phase || 0)) * fps) % anim.frames.length;
    const [sx, sy] = anim.frames[idx];
    const flip = face === 'left' ? a.faces !== 'left' : a.faces === 'left';
    const px = Math.round(x - W.camX);
    const py = Math.round(yFeet - a.ay);
    if (px + a.w < -40 || px - a.w > W.W + 40) return;
    if (alpha != null && alpha < 1) ctx.globalAlpha = Math.max(0, alpha);
    if (flip) {
      ctx.save();
      ctx.translate(px, 0);
      ctx.scale(-1, 1);
      ctx.drawImage(A.img.actors, sx, sy, a.w, a.h, -Math.round(a.ax), py, a.w, a.h);
      ctx.restore();
    } else {
      ctx.drawImage(A.img.actors, sx, sy, a.w, a.h, px - Math.round(a.ax), py, a.w, a.h);
    }
    if (alpha != null && alpha < 1) ctx.globalAlpha = 1;
  }

  function drawProp(ctx, propId, cx, yBottom, flip, scale, alpha) {
    const m = A.prop(propId);
    if (!m || !A.img.props) return;
    const idx = m.fps ? Math.floor(W.t * m.fps) % m.frames.length : 0;
    const [sx, sy] = m.frames[idx];
    const s = scale || 1;
    const w = Math.round(m.w * s);
    const h = Math.round(m.h * s);
    const px = Math.round(cx - W.camX - w / 2);
    const py = Math.round(yBottom - h);
    if (px + w < -2 || px > W.W + 2) return;
    if (alpha != null && alpha < 1) ctx.globalAlpha = alpha;
    if (flip) {
      ctx.save();
      ctx.translate(px + w, 0);
      ctx.scale(-1, 1);
      ctx.drawImage(A.img.props, sx, sy, m.w, m.h, 0, py, w, h);
      ctx.restore();
    } else {
      ctx.drawImage(A.img.props, sx, sy, m.w, m.h, px, py, w, h);
    }
    if (alpha != null && alpha < 1) ctx.globalAlpha = 1;
  }

  function drawBackground(ctx) {
    const biome = W.bgBiome;
    const sky = SKY[biome] || SKY.green;
    const g = ctx.createLinearGradient(0, 0, 0, W.gy);
    g.addColorStop(0, sky[0]);
    g.addColorStop(1, sky[1]);
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, W.W + 1, W.gy + 2);
    if (W.minimalBg) {
      drawClouds(ctx);
      return;
    }
    const drawSet = (b, alpha) => {
      if (!A.bg[b]) return;
      for (let n = 0; n < 5; n++) {
        if (n === 1) {
          drawStars(ctx, alpha);
          drawMoon(ctx, alpha);
          drawClouds(ctx, alpha);
        }
        const c = layerCanvas(b, n);
        if (!c) continue;
        const speed = LAYER_SPEED[n];
        if (n === 2 && W.showCastle > 0.01) {
          const cc = layerCanvas(b, 'castle');
          if (cc) tileLayer(ctx, cc, 0.03, alpha * W.showCastle, W.W * 0.1);
        }
        tileLayer(ctx, c, speed, alpha, 0);
      }
    };
    if (W.bgPrev && W.bgFade < 1) {
      drawSet(W.bgPrev, 1);
      drawSet(biome, W.bgFade);
    } else {
      drawSet(biome, 1);
    }
  }

  function tileLayer(ctx, c, speed, alpha, offset) {
    const w = c.width;
    let x0 = -((((W.camX * speed + offset) % w) + w) % w);
    const y = Math.round(W.gy + 2 - (A.atlas.bg.groundRow / A.atlas.bg.h) * c.height);
    if (alpha < 1) ctx.globalAlpha = alpha;
    for (let x = Math.floor(x0); x < W.W; x += w) {
      ctx.drawImage(c, x, y);
    }
    if (alpha < 1) ctx.globalAlpha = 1;
  }

  function drawStars(ctx, alpha) {
    const d = W.dark;
    if (d < 0.25) return;
    const a = U.clamp((d - 0.25) / 0.5, 0, 1) * (alpha == null ? 1 : alpha);
    for (const s of W.stars) {
      const tw = 0.5 + 0.5 * Math.sin(W.t * 1.7 + s.p);
      ctx.fillStyle = 'rgba(255,255,240,' + (a * (0.35 + 0.65 * tw)).toFixed(3) + ')';
      ctx.fillRect(Math.round(s.x), Math.round(s.y), s.s, s.s);
    }
  }

  function drawMoon(ctx, alpha) {
    if (W.dark < 0.3) return;
    const m = A.prop('sun');
    if (!m) return;
    const a = U.clamp((W.dark - 0.3) / 0.5, 0, 1) * (alpha == null ? 1 : alpha);
    ctx.globalAlpha = a * 0.9;
    const [sx, sy] = m.frames[0];
    const s = 0.55;
    ctx.drawImage(A.img.props, sx, sy, m.w, m.h, Math.round(W.W * 0.78), Math.round(W.gy * 0.1), Math.round(m.w * s), Math.round(m.h * s));
    ctx.globalAlpha = 1;
  }

  function drawClouds(ctx, alpha) {
    if (alpha != null && alpha < 0.999 && W.bgPrev) return; // draw clouds once during crossfades
    for (const c of W.clouds) {
      const m = A.prop(c.id);
      if (!m) continue;
      const [sx, sy] = m.frames[0];
      ctx.globalAlpha = 0.92 - W.dark * 0.5;
      ctx.drawImage(A.img.props, sx, sy, m.w, m.h, Math.round(c.x), Math.round(c.y), Math.round(m.w * c.s), Math.round(m.h * c.s));
    }
    ctx.globalAlpha = 1;
  }

  function drawGround(ctx) {
    const img = A.img.ground;
    if (!img) return;
    const tile = 32;
    const rows = { green: 0, autumn: 1, winter: 2 };
    const startTile = Math.floor(W.camX / tile);
    const endTile = Math.ceil((W.camX + W.W) / tile);
    for (let t = startTile; t <= endTile; t++) {
      const wx = t * tile;
      const b = W.biomeAt(wx + tile / 2);
      const r = rows[b] || 0;
      const px = Math.round(wx - W.camX);
      ctx.drawImage(img, 0, r * tile, tile, tile, px, W.gy, tile, tile);
      for (let y = W.gy + tile; y < W.H; y += tile) {
        ctx.drawImage(img, tile, r * tile, tile, tile, px, y, tile, tile);
      }
    }
  }

  function drawWater(ctx, x0, x1, yTop) {
    const m = A.prop('water');
    if (!m) return;
    const idx = Math.floor(W.t * m.fps) % m.frames.length;
    const [sx, sy] = m.frames[idx];
    const h = 14;
    for (let x = x0; x < x1; x += m.w) {
      const px = Math.round(x - W.camX);
      if (px + m.w < 0 || px > W.W) continue;
      const w = Math.min(m.w, x1 - x);
      ctx.drawImage(A.img.props, sx, sy, w, h, px, Math.round(yTop), w, h);
    }
  }

  function drawScenesBack(ctx) {
    for (const s of W.scenes) {
      if (s.x + s.extent[1] < W.camX - 10 || s.x + s.extent[0] > W.camX + W.W + 10) continue;
      if (s.def.water) drawWater(ctx, s.x + s.def.water[0], s.x + s.def.water[1], W.gy - 6);
      for (const p of s.def.props || []) {
        if (p.front) continue;
        const id = resolveProp(p.p, s.biome);
        drawProp(ctx, id, s.x + p.x, W.gy + 2 - (p.y || 0), !!p.flip, p.s);
      }
    }
  }

  function drawScenesFront(ctx) {
    for (const s of W.scenes) {
      for (const p of s.def.props || []) {
        if (!p.front) continue;
        const id = resolveProp(p.p, s.biome);
        drawProp(ctx, id, s.x + p.x, W.gy + 10, !!p.flip, p.s);
      }
    }
  }

  function drawEventProps(ctx) {
    for (const p of W.eventProps) {
      if (p.kind === 'chest') {
        const m = A.atlas.icons[p.chest];
        if (!m || !A.img.icons) continue;
        let idx = 0;
        if (p.open) idx = Math.min(m.frames.length - 1, Math.floor((W.t - p.open) * 16));
        const [sx, sy] = m.frames[idx];
        const px = Math.round(p.x - W.camX - m.w / 2);
        ctx.drawImage(A.img.icons, sx, sy, m.w, m.h, px, W.gy + 4 - m.h, m.w, m.h);
        continue;
      }
      if (p.water) drawWater(ctx, p.x - 70, p.x + 70, W.gy - 6);
      if (p.sky) {
        const bob = Math.sin(W.t * 1.3) * 2;
        drawProp(ctx, p.p, p.x, p.y + bob, false, 1.4);
      } else {
        drawProp(ctx, p.p, p.x, W.gy + 2 + (p.water ? 2 : 0), false, 1);
      }
    }
  }

  function npcAnim(n) {
    if (n.vx && A.actor(n.actor) && A.actor(n.actor).anims.walk) return 'walk';
    return n.anim || 'idle';
  }

  function drawNpcs(ctx, list) {
    for (const n of list) {
      const alpha = n.fade != null ? 1 - (W.t - n.fade) / 0.6 : 1;
      drawActor(ctx, n.actor, npcAnim(n), n.x, laneY(n.lane) - (n.y || 0), n.face, n.phase, alpha, !!n.vx);
      if (n.alert) drawAlert(ctx, n);
    }
  }

  function drawAlert(ctx, n) {
    const a = A.actor(n.actor);
    if (!a) return;
    const px = Math.round(n.x - W.camX);
    const top = laneY(n.lane) - a.ay - 6 + Math.round(Math.sin(W.t * 6) * 1.5);
    ctx.fillStyle = '#1b1012';
    ctx.fillRect(px - 2, top - 9, 5, 11);
    ctx.fillStyle = '#f6c443';
    ctx.fillRect(px - 1, top - 8, 3, 6);
    ctx.fillRect(px - 1, top - 1, 3, 2);
  }

  function drawParty(ctx) {
    const walking = W.walking;
    const back = [];
    const front = [];
    for (const m of W.party) (m.lane === 'front' ? front : back).push(m);
    const drawMember = (m) => {
      const anim = m.moving ? 'walk' : 'idle';
      drawActor(ctx, m.actor, anim, W.heroX + m.dx, laneY(m.lane), m.face, m.phase, 1, m.moving);
    };
    back.sort((a, b) => a.dx - b.dx).forEach(drawMember);
    front.sort((a, b) => a.dx - b.dx).forEach(drawMember);
    drawActor(ctx, W.heroActor, walking ? 'walk' : 'idle', W.heroX, laneY('front'), W.heroFace || 'right', 0, 1, walking);
  }

  function drawDecor(ctx, layer) {
    for (const d of W.decor) {
      if (d.layer !== layer) continue;
      if (layer === 'front') drawProp(ctx, d.p, d.x, W.gy + 13, d.flip);
      else if (layer === 'tall') drawProp(ctx, d.p, d.x, W.gy + 3, d.flip, 1, 1);
      else drawProp(ctx, d.p, d.x, W.gy + 3, d.flip);
    }
  }

  function drawParticles(ctx) {
    for (const p of W.particles) {
      const x = Math.round(p.x);
      const y = Math.round(p.y);
      if (p.kind === 'rain') {
        ctx.fillStyle = 'rgba(190,215,255,0.55)';
        ctx.fillRect(x, y, 1, 4);
      } else if (p.kind === 'snow') {
        ctx.fillStyle = 'rgba(255,255,255,0.9)';
        ctx.fillRect(x, y, 1, 1);
        if (((p.ph * 10) | 0) % 3 === 0) ctx.fillRect(x + 1, y, 1, 1);
      } else if (p.kind === 'leaf') {
        ctx.fillStyle = p.c;
        ctx.fillRect(x, y, 2, 1);
      } else if (p.kind === 'dust') {
        const a = 1 - p.age / p.life;
        ctx.fillStyle = 'rgba(220,210,180,' + (0.6 * a).toFixed(2) + ')';
        ctx.fillRect(Math.round(p.x - W.camX), y, 2, 2);
      } else if (p.kind === 'bird') {
        const flap = Math.floor((W.t + p.ph) * 6) % 2;
        ctx.fillStyle = W.dark > 0.5 ? 'rgba(30,30,40,0.6)' : 'rgba(40,40,50,0.7)';
        ctx.fillRect(x, y, 1, 1);
        ctx.fillRect(x - 1, y - flap, 1, 1);
        ctx.fillRect(x + 1, y - flap, 1, 1);
      }
    }
  }

  function drawLighting(ctx) {
    const dark = Math.max(W.dark, W.sceneDusk * 0.55);
    const warm = Math.max(W.warm, W.sceneDusk * 0.4);
    if (warm > 0.01) {
      ctx.fillStyle = 'rgba(255,120,60,' + (warm * 0.16).toFixed(3) + ')';
      ctx.fillRect(0, 0, W.W + 1, W.H + 1);
    }
    if (dark <= 0.01) return;
    ctx.fillStyle = 'rgba(14,18,46,' + (dark * 0.58).toFixed(3) + ')';
    ctx.fillRect(0, 0, W.W + 1, W.H + 1);
    ctx.globalCompositeOperation = 'lighter';
    const glow = (x, y, r, rgb, a) => {
      const px = x - W.camX;
      if (px < -r || px > W.W + r) return;
      const g = ctx.createRadialGradient(px, y, 0, px, y, r);
      g.addColorStop(0, 'rgba(' + rgb.join(',') + ',' + (a * dark).toFixed(3) + ')');
      g.addColorStop(1, 'rgba(' + rgb.join(',') + ',0)');
      ctx.fillStyle = g;
      ctx.fillRect(px - r, y - r, r * 2, r * 2);
    };
    // Lantern glow around the hero
    glow(W.heroX + 6, W.gy - 18, 46, [255, 200, 120], 0.22);
    for (const s of W.scenes) {
      for (const p of s.def.props || []) {
        const id = resolveProp(p.p, s.biome);
        if (LIGHT_PROPS[id]) glow(s.x + p.x, W.gy - 10, 40, LIGHT_PROPS[id], 0.4 + 0.06 * Math.sin(W.t * 9 + p.x));
      }
    }
    for (const p of W.eventProps) {
      if (p.p && LIGHT_PROPS[p.p]) glow(p.x, W.gy - 10, 40, LIGHT_PROPS[p.p], 0.4);
    }
    const murk = W.party.find((m) => m.id === 'murk');
    if (murk) glow(W.heroX + murk.dx, W.gy - 18, 30, [170, 90, 255], 0.38 + 0.08 * Math.sin(W.t * 2));
    ctx.globalCompositeOperation = 'source-over';
  }

  W.render = function render() {
    const ctx = W.ctx;
    if (!ctx) return;
    ctx.setTransform(W.k, 0, 0, W.k, 0, 0);
    ctx.imageSmoothingEnabled = false;
    drawBackground(ctx);
    drawDecor(ctx, 'tall');
    drawScenesBack(ctx);
    drawDecor(ctx, 'back');
    drawGround(ctx);
    drawEventProps(ctx);
    const sceneNpcs = [];
    for (const s of W.scenes) sceneNpcs.push.apply(sceneNpcs, s.npcs);
    drawNpcs(ctx, sceneNpcs.filter((n) => n.lane === 'scene'));
    drawNpcs(ctx, W.npcs.concat(sceneNpcs.filter((n) => n.lane !== 'scene')).sort((a, b) => a.x - b.x));
    drawParty(ctx);
    drawScenesFront(ctx);
    drawDecor(ctx, 'front');
    drawParticles(ctx);
    drawLighting(ctx);
  };

  TK.world = W;
})(typeof window !== 'undefined' ? window : globalThis);
