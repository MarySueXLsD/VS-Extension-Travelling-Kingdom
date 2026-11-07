/* Travelling Kingdom — DOM interface: HUD, cards, panels, bubbles, toasts. */
(function (root) {
  'use strict';

  const TK = (root.TK = root.TK || {});
  const U = TK.util;
  const A = TK.assets;
  const L = TK.logic;
  const $ = (id) => document.getElementById(id);

  const RES_ICON = { gold: 'coin_gold', food: 'food', morale: 'heart', renown: 'crown', meters: 'boot' };
  const RES_NAME = { gold: 'coins', food: 'rations', morale: 'morale', renown: 'renown', meters: 'm' };
  const SERVICE_META = {
    market: { icon: 'bag', label: 'Visit the market', sub: 'Rations and curiosities' },
    inn: { icon: 'bed', label: 'Rest at the inn', sub: '+28 morale' },
    work: { icon: 'hammer', label: 'Take odd jobs', sub: 'Earn coins' },
    forage: { icon: 'basket', label: 'Forage nearby', sub: 'Gather rations' },
    rest: { icon: 'heart', label: 'Rest by the fire', sub: '+16 morale, uses rations' },
    shrine: { icon: 'candle', label: 'Make an offering', sub: '10 coins: morale and renown' },
  };

  const UI = {
    el: {},
    hud: {},
    bubbles: [],
    keyHandlers: [],
    card: null,
    panelTab: null,
    onNav: null,
  };

  function h(tag, cls, text) {
    const el = document.createElement(tag);
    if (cls) el.className = cls;
    if (text != null) el.textContent = text;
    return el;
  }

  function icon(id, cls) {
    const img = h('img', 'ico' + (cls ? ' ' + cls : ''));
    img.alt = '';
    img.src = A.iconUrl(id);
    return img;
  }

  UI.icon = icon;
  UI.h = h;

  // ---------------------------------------------------------------------------
  // Boot
  // ---------------------------------------------------------------------------

  UI.init = function init() {
    const ids = ['app', 'hud', 'stage', 'overlay', 'toasts', 'hint', 'card', 'card-portrait', 'card-kicker', 'card-title', 'card-min', 'card-scroll', 'card-speaker', 'card-text', 'card-deltas', 'card-extra', 'card-actions', 'card-pill', 'card-pill-text', 'panel', 'panel-title', 'panel-close', 'panel-tabs', 'panel-body', 'select', 'observer', 'loading', 'nav', 'hud-portrait', 'hud-name', 'hud-title', 'hud-buffs', 'route-fill', 'route-bar', 'route-dist', 'route-dest'];
    for (const id of ids) UI.el[id] = $(id);
    A.hydrateIcons(document);

    UI.el['card-min'].addEventListener('click', () => UI.minimizeCard(true));
    UI.el['card-pill'].addEventListener('click', () => UI.minimizeCard(false));
    UI.el['panel-close'].addEventListener('click', () => UI.onNav && UI.onNav('road'));
    document.querySelectorAll('.nav-btn').forEach((btn) => {
      btn.addEventListener('click', () => UI.onNav && UI.onNav(btn.getAttribute('data-tab')));
    });
    $('hud-hero').addEventListener('click', () => UI.onNav && UI.onNav('court'));

    document.addEventListener('keydown', (e) => {
      if (e.target && (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA' || e.target.tagName === 'SELECT')) return;
      if (e.key === 'Escape' && !UI.el.panel.hidden) {
        UI.onNav && UI.onNav('road');
        e.preventDefault();
        return;
      }
      if (UI.el.card.hidden || UI.el.card.classList.contains('min') || !UI.el.panel.hidden) return;
      const actions = UI.cardActions || [];
      if (/^[1-9]$/.test(e.key)) {
        const a = actions.filter((x) => !x.hiddenKey)[Number(e.key) - 1];
        if (a && !a.disabled) {
          e.preventDefault();
          a.run();
        }
      } else if (e.key === 'Enter' || e.key === ' ') {
        if (UI.typing) {
          e.preventDefault();
          UI.finishTyping();
          return;
        }
        const p = actions.find((x) => x.primary && !x.disabled) || (actions.length === 1 && !actions[0].disabled ? actions[0] : null);
        if (p) {
          e.preventDefault();
          p.run();
        }
      }
    });
  };

  UI.setMode = function setMode(mode) {
    const app = UI.el.app;
    app.classList.remove('booting', 'mode-select', 'mode-observer', 'mode-play');
    app.classList.add('mode-' + mode);
    UI.el.loading.hidden = mode !== 'boot';
    UI.el.select.hidden = mode !== 'select';
    UI.el.observer.hidden = mode !== 'observer';
  };

  UI.loadingText = function loadingText(t) {
    const el = UI.el.loading.querySelector('.loading-text');
    if (el) el.textContent = t;
  };

  // ---------------------------------------------------------------------------
  // HUD
  // ---------------------------------------------------------------------------

  const hudCache = {};

  function setText(el, v) {
    if (el && el.textContent !== v) el.textContent = v;
  }

  UI.renderHud = function renderHud(state, info) {
    if (!state || !state.hero) return;
    const heroActor = state.hero.id === 'king' ? 'king' : 'queen';
    if (hudCache.portrait !== heroActor) {
      UI.el['hud-portrait'].src = A.portraitUrl(heroActor);
      hudCache.portrait = heroActor;
    }
    setText(UI.el['hud-name'], (state.hero.id === 'king' ? 'King ' : 'Queen ') + state.hero.name);
    setText(UI.el['hud-title'], L.titleFor(state));
    for (const k of ['gold', 'food', 'morale', 'renown']) {
      const v = Math.round(state.res[k]);
      const el = $('res-' + k);
      const span = el.querySelector('.res-v');
      if (hudCache[k] !== v) {
        if (hudCache[k] != null) {
          el.classList.remove('bump-up', 'bump-down');
          void el.offsetWidth;
          el.classList.add(v > hudCache[k] ? 'bump-up' : 'bump-down');
        }
        hudCache[k] = v;
        span.textContent = String(v);
      }
    }
    $('res-food').classList.toggle('warn', state.res.food <= 0);
    $('res-morale').classList.toggle('warn', state.res.morale < 25);
    const tier = L.moraleTier(state.res.morale);
    $('res-morale').title = 'Morale: ' + tier.label + (tier.speed !== 1 ? ' (' + (tier.speed > 1 ? '+' : '') + Math.round((tier.speed - 1) * 100) + '% speed)' : '');
    $('res-food').title = state.res.food <= 0 ? 'Rations: none! The court is hungry and slower.' : 'Rations: ' + L.foodRatePer100(state).toFixed(1) + ' eaten every 100 m';
    $('res-gold').title = 'Coins';
    const nt = L.nextTitle(state);
    $('res-renown').title = 'Renown' + (nt ? ' — next title at ' + nt.at + ': ' + nt.t : '');

    // Buffs
    const buffKey = state.buffs.map((b) => b.id).join(',') + '|' + (state.res.food <= 0 ? 'h' : '');
    if (hudCache.buffs !== buffKey) {
      hudCache.buffs = buffKey;
      const box = UI.el['hud-buffs'];
      box.textContent = '';
      for (const b of state.buffs) {
        const chip = h('span', 'buff ' + (b.speed >= 1 ? 'good' : 'bad'));
        chip.title = b.label + (b.speed !== 1 ? ' (' + (b.speed > 1 ? '+' : '') + Math.round((b.speed - 1) * 100) + '% speed)' : '');
        chip.appendChild(icon(b.speed >= 1 ? 'boot' : 'hourglass'));
        box.appendChild(chip);
      }
      if (state.res.food <= 0) {
        const chip = h('span', 'buff bad');
        chip.title = 'Hungry: walking slower, morale falling';
        chip.appendChild(icon('food'));
        box.appendChild(chip);
      }
    }
    UI.renderRoute(state, info);
  };

  UI.renderRoute = function renderRoute(state, info) {
    const leg = L.legLength(state);
    const m = Math.min(leg, state.journey.meters);
    const pct = leg > 0 ? (m / leg) * 100 : 0;
    const pctStr = pct.toFixed(1) + '%';
    if (hudCache.pct !== pctStr) {
      hudCache.pct = pctStr;
      UI.el['route-fill'].style.width = pctStr;
      UI.el['route-bar'].setAttribute('aria-valuenow', String(Math.round(pct)));
    }
    const units = state.settings.units;
    const dist = state.journey.arrived ? 'Arrived' : U.formatDistance(m, units) + ' / ' + U.formatDistance(leg, units);
    setText(UI.el['route-dist'], dist);
    const dest = L.currentDestination(state);
    setText(UI.el['route-dest'], dest ? dest.name : '—');
    UI.el['route-dest'].title = dest ? (TK.data.regions[dest.region] ? TK.data.regions[dest.region].name + ' — ' : '') + (dest.blurb || '') : '';
  };

  /** Floating "+5" text near a HUD resource. */
  UI.floatDelta = function floatDelta(k, v) {
    const target = $('res-' + k);
    if (!target || !v) return;
    const rect = target.getBoundingClientRect();
    const stage = UI.el.app.getBoundingClientRect();
    const el = h('div', 'float-delta ' + (v > 0 ? 'up' : 'down'), U.formatSigned(v));
    el.style.left = rect.left - stage.left + rect.width / 2 + 'px';
    el.style.top = rect.bottom - stage.top + 'px';
    UI.el.app.appendChild(el);
    setTimeout(() => el.remove(), 1300);
  };

  /** Floating text above something in the world (CSS coords inside stage). */
  UI.floatWorld = function floatWorld(text, pos, cls) {
    if (!pos) return;
    const el = h('div', 'float-world ' + (cls || ''), text);
    el.style.left = pos.x + 'px';
    el.style.top = pos.y + 'px';
    UI.el.overlay.appendChild(el);
    setTimeout(() => el.remove(), 1400);
  };

  // ---------------------------------------------------------------------------
  // Toasts
  // ---------------------------------------------------------------------------

  UI.toast = function toast(text, opts) {
    const o = opts || {};
    const el = h('div', 'toast ' + (o.kind || ''));
    if (o.icon) el.appendChild(icon(o.icon));
    if (o.portrait) {
      const img = h('img', 'toast-portrait');
      img.alt = '';
      img.src = A.portraitUrl(o.portrait);
      el.appendChild(img);
    }
    const span = h('span', 'toast-text', text);
    el.appendChild(span);
    UI.el.toasts.appendChild(el);
    while (UI.el.toasts.children.length > 3) UI.el.toasts.firstChild.remove();
    setTimeout(() => {
      el.classList.add('out');
      setTimeout(() => el.remove(), 400);
    }, o.ms || 3600);
  };

  UI.hint = function hint(text) {
    const el = UI.el.hint;
    if (!text) {
      el.hidden = true;
      return;
    }
    el.textContent = text;
    el.hidden = false;
  };

  // ---------------------------------------------------------------------------
  // Speech bubbles
  // ---------------------------------------------------------------------------

  UI.bubble = function bubble(who, text, ms) {
    // One bubble per speaker; at most three on screen.
    UI.bubbles = UI.bubbles.filter((b) => {
      if (b.who === who) {
        b.el.remove();
        return false;
      }
      return true;
    });
    while (UI.bubbles.length >= 3) {
      const b = UI.bubbles.shift();
      b.el.remove();
    }
    const el = h('div', 'bubble');
    el.textContent = text;
    UI.el.overlay.appendChild(el);
    const dur = ms || U.clamp(1800 + text.length * 55, 2600, 7000);
    const b = { who, el, until: performance.now() + dur };
    UI.bubbles.push(b);
    UI.positionBubbles();
    return b;
  };

  UI.clearBubbles = function clearBubbles() {
    for (const b of UI.bubbles) b.el.remove();
    UI.bubbles = [];
  };

  UI.positionBubbles = function positionBubbles() {
    const now = performance.now();
    const W = TK.world;
    const stageW = UI.el.stage.clientWidth;
    UI.bubbles = UI.bubbles.filter((b) => {
      if (now > b.until) {
        b.el.classList.add('out');
        const el = b.el;
        setTimeout(() => el.remove(), 250);
        return false;
      }
      const p = W.headOf(b.who);
      if (!p || p.x < -40 || p.x > stageW + 40) {
        b.el.style.visibility = 'hidden';
        return true;
      }
      b.el.style.visibility = '';
      const w = b.el.offsetWidth;
      const x = U.clamp(p.x - w / 2, 4, Math.max(4, stageW - w - 4));
      const tail = U.clamp(p.x - x, 10, w - 10);
      b.el.style.transform = 'translate(' + Math.round(x) + 'px,' + Math.round(p.y - b.el.offsetHeight - 6) + 'px)';
      b.el.style.setProperty('--tail', Math.round(tail) + 'px');
      return true;
    });
  };

  // ---------------------------------------------------------------------------
  // Card (events, dialogue, location, market, messages)
  // ---------------------------------------------------------------------------

  UI.typing = false;
  let typeTimer = null;
  let typeFull = '';
  let typeDone = null;

  function renderRichText(el, text) {
    el.textContent = '';
    const parts = String(text).split(/(\*[^*]+\*)/g);
    for (const part of parts) {
      if (!part) continue;
      if (part.length > 2 && part[0] === '*' && part[part.length - 1] === '*') {
        el.appendChild(h('em', null, part.slice(1, -1)));
      } else {
        el.appendChild(document.createTextNode(part));
      }
    }
  }

  UI.finishTyping = function finishTyping() {
    if (typeTimer) clearInterval(typeTimer);
    typeTimer = null;
    UI.typing = false;
    renderRichText(UI.el['card-text'], typeFull);
    UI.el['card-text'].classList.remove('typing');
    if (typeDone) {
      const d = typeDone;
      typeDone = null;
      d();
    }
  };

  function typeText(text, instant, done) {
    if (typeTimer) clearInterval(typeTimer);
    typeFull = text;
    typeDone = done || null;
    const el = UI.el['card-text'];
    if (instant || !text) {
      UI.finishTyping();
      return;
    }
    UI.typing = true;
    el.classList.add('typing');
    let i = 0;
    const plain = String(text).replace(/\*/g, '');
    const step = Math.max(1, Math.round(plain.length / 60));
    typeTimer = setInterval(() => {
      i += step;
      if (i >= plain.length) {
        UI.finishTyping();
        return;
      }
      el.textContent = plain.slice(0, i);
    }, 22);
  }

  function renderDeltas(container, deltas) {
    container.textContent = '';
    for (const d of deltas || []) {
      if (['gold', 'food', 'morale', 'renown', 'meters'].indexOf(d.k) >= 0) {
        const chip = h('span', 'delta ' + (d.v > 0 ? 'up' : 'down'));
        chip.appendChild(icon(RES_ICON[d.k]));
        chip.appendChild(h('span', null, U.formatSigned(d.v) + (d.k === 'meters' ? ' m' : '')));
        chip.title = U.formatSigned(d.v) + ' ' + RES_NAME[d.k];
        container.appendChild(chip);
      } else if (d.k === 'trinket') {
        const t = TK.data.trinkets[d.id];
        const chip = h('span', 'delta trinket');
        chip.appendChild(icon(t ? t.icon : 'star'));
        chip.appendChild(h('span', null, t ? t.name : d.id));
        chip.title = t ? t.text : '';
        container.appendChild(chip);
      } else if (d.k === 'buff') {
        const chip = h('span', 'delta ' + (d.speed >= 1 ? 'up' : 'down'));
        chip.appendChild(icon(d.speed >= 1 ? 'boot' : 'hourglass'));
        chip.appendChild(h('span', null, d.label));
        container.appendChild(chip);
      } else if (d.k === 'recruit') {
        const c = TK.data.companions[d.id];
        const chip = h('span', 'delta trinket');
        chip.appendChild(icon('people'));
        chip.appendChild(h('span', null, (c ? c.name : d.id) + ' joins'));
        container.appendChild(chip);
      }
    }
    container.hidden = !container.children.length;
  }

  UI.renderDeltas = renderDeltas;

  /**
   * Show the card. spec: { kicker, title, portrait: actorId|null, portraitIcon, speaker, text, italic,
   * instant, deltas, extra: Element, actions: [{ label, sub, member, odds, cost, icon, disabled, reason,
   * primary, onClick }], pill, cls }
   */
  UI.showCard = function showCard(spec) {
    const card = UI.el.card;
    card.hidden = false;
    card.className = 'card' + (spec.cls ? ' ' + spec.cls : '');
    UI.el['card-pill'].hidden = true;
    UI.cardSpec = spec;
    setText(UI.el['card-kicker'], spec.kicker || '');
    setText(UI.el['card-title'], spec.title || '');
    const pimg = UI.el['card-portrait'];
    const pbox = pimg.parentElement;
    let purl = '';
    if (spec.portrait) purl = A.portraitUrl(spec.portrait) || A.actorThumbUrl(spec.portrait);
    else if (spec.portraitIcon) purl = A.iconUrl(spec.portraitIcon);
    pimg.src = purl || A.iconUrl('book');
    pbox.classList.toggle('is-icon', !spec.portrait);
    pbox.classList.toggle('is-big', !!(spec.portrait && TK.assets.atlas.portraits[spec.portrait] && TK.assets.atlas.portraits[spec.portrait][2] >= 60));
    UI.el['card-speaker'].textContent = spec.speaker || '';
    UI.el['card-speaker'].hidden = !spec.speaker;
    UI.el['card-text'].classList.toggle('narration', !!spec.italic);
    renderDeltas(UI.el['card-deltas'], spec.deltas);
    const extra = UI.el['card-extra'];
    extra.textContent = '';
    if (spec.extra) extra.appendChild(spec.extra);
    extra.hidden = !spec.extra;
    UI.el['card-actions'].textContent = '';
    UI.cardActions = [];
    const instant = !!spec.instant || (TK.main && TK.main.reduceMotion());
    // Actions appear once the text has finished typing.
    const renderActions = () => {
      const box = UI.el['card-actions'];
      box.textContent = '';
      UI.cardActions = [];
      let n = 0;
      (spec.actions || []).forEach((a) => {
        const btn = h('button', 'choice' + (a.primary ? ' primary' : '') + (a.disabled ? ' disabled' : '') + (a.small ? ' small' : ''));
        btn.type = 'button';
        if (!a.hiddenKey) {
          n++;
          btn.appendChild(h('span', 'choice-key', String(n)));
        }
        const body = h('span', 'choice-body');
        if (a.member) {
          const tag = h('span', 'tag member');
          const pi = h('img', 'tag-portrait');
          const c = TK.data.companions[a.member];
          pi.src = A.portraitUrl(c ? c.actor : a.member);
          pi.alt = '';
          tag.appendChild(pi);
          tag.appendChild(h('span', null, c ? c.name : a.member));
          body.appendChild(tag);
        }
        if (a.icon) body.appendChild(icon(a.icon, 'choice-icon'));
        body.appendChild(h('span', 'choice-label', a.label));
        const meta = h('span', 'choice-meta');
        if (a.cost && (a.cost.gold || a.cost.food)) {
          if (a.cost.gold) {
            const c = h('span', 'tag cost');
            c.appendChild(icon('coin_gold'));
            c.appendChild(h('span', null, String(a.cost.gold)));
            meta.appendChild(c);
          }
          if (a.cost.food) {
            const c = h('span', 'tag cost');
            c.appendChild(icon('food'));
            c.appendChild(h('span', null, String(a.cost.food)));
            meta.appendChild(c);
          }
        }
        if (a.odds != null) {
          const o = h('span', 'tag odds ' + (a.odds >= 0.6 ? 'good' : a.odds >= 0.4 ? 'even' : 'bad'), L.oddsLabel(a.odds));
          o.title = Math.round(a.odds * 100) + '% chance';
          meta.appendChild(o);
        }
        if (a.sub) meta.appendChild(h('span', 'choice-sub', a.sub));
        if (a.disabled && a.reason) meta.appendChild(h('span', 'tag locked', a.reason));
        if (meta.children.length) body.appendChild(meta);
        btn.appendChild(body);
        const run = () => {
          if (a.disabled || UI.cardBusy) return;
          a.onClick && a.onClick();
        };
        btn.addEventListener('click', run);
        if (a.disabled) btn.setAttribute('aria-disabled', 'true');
        box.appendChild(btn);
        UI.cardActions.push({ run, disabled: a.disabled, primary: a.primary, hiddenKey: a.hiddenKey, el: btn });
      });
      const first = UI.cardActions.find((x) => !x.disabled);
      if (first && TK.main && TK.main.focusAllowed()) first.el.focus({ preventScroll: true });
    };
    UI.el['card-scroll'].scrollTop = 0;
    UI.el['card-actions'].classList.add('pending');
    typeText(spec.text || '', instant, () => {
      UI.el['card-actions'].classList.remove('pending');
      renderActions();
    });
    // Clicking the text finishes typing.
    UI.el['card-text'].onclick = () => UI.typing && UI.finishTyping();
    if (spec.pill) setText(UI.el['card-pill-text'], spec.pill);
    if (UI.cardMinimized) UI.minimizeCard(true);
  };

  UI.hideCard = function hideCard() {
    if (typeTimer) clearInterval(typeTimer);
    typeTimer = null;
    UI.typing = false;
    typeDone = null;
    UI.el.card.hidden = true;
    UI.el['card-pill'].hidden = true;
    UI.cardActions = [];
    UI.cardSpec = null;
    UI.cardMinimized = false;
  };

  UI.minimizeCard = function minimizeCard(min) {
    UI.cardMinimized = !!min;
    if (!UI.cardSpec) return;
    UI.el.card.hidden = !!min;
    UI.el['card-pill'].hidden = !min;
    if (!min) {
      const first = (UI.cardActions || []).find((x) => !x.disabled);
      if (first) first.el.focus({ preventScroll: true });
    }
  };

  UI.cardOpen = function cardOpen() {
    return !!UI.cardSpec;
  };

  // ---------------------------------------------------------------------------
  // Panels
  // ---------------------------------------------------------------------------

  UI.setJournalDot = function setJournalDot(on) {
    const dot = document.querySelector('.nav-btn[data-tab="journal"] .nav-dot');
    if (dot) dot.hidden = !on;
  };

  UI.setNavActive = function setNavActive(tab) {
    document.querySelectorAll('.nav-btn').forEach((b) => b.classList.toggle('active', b.getAttribute('data-tab') === tab));
  };

  UI.showPanel = function showPanel(title, tabs, activeTab, onTab) {
    const p = UI.el.panel;
    p.hidden = false;
    setText(UI.el['panel-title'], title);
    const tabsEl = UI.el['panel-tabs'];
    tabsEl.textContent = '';
    tabsEl.hidden = !tabs || tabs.length < 2;
    for (const t of tabs || []) {
      const b = h('button', 'ptab' + (t.id === activeTab ? ' active' : ''), t.label);
      b.type = 'button';
      b.setAttribute('role', 'tab');
      b.addEventListener('click', () => onTab(t.id));
      tabsEl.appendChild(b);
    }
    UI.el['panel-body'].textContent = '';
    UI.el['panel-body'].scrollTop = 0;
    return UI.el['panel-body'];
  };

  UI.hidePanel = function hidePanel() {
    UI.el.panel.hidden = true;
  };

  UI.panelOpen = function panelOpen() {
    return !UI.el.panel.hidden;
  };

  // ---- Court ------------------------------------------------------------------

  UI.renderCourt = function renderCourt(body, state, onMove) {
    const heroActor = state.hero.id === 'king' ? 'king' : 'queen';
    const heroRow = h('div', 'member hero-row');
    const img = h('img', 'member-portrait');
    img.src = A.portraitUrl(heroActor);
    img.alt = '';
    heroRow.appendChild(img);
    const info = h('div', 'member-info');
    info.appendChild(h('div', 'member-name', (state.hero.id === 'king' ? 'King ' : 'Queen ') + state.hero.name));
    info.appendChild(h('div', 'member-epithet', L.titleFor(state)));
    const nt = L.nextTitle(state);
    if (nt) {
      const bar = h('div', 'mini-bar');
      const fill = h('div', 'mini-fill');
      const prevAt = L.currentTitleAt(state);
      fill.style.width = U.clamp(((state.res.renown - prevAt) / Math.max(1, nt.at - prevAt)) * 100, 0, 100) + '%';
      bar.appendChild(fill);
      info.appendChild(bar);
      info.appendChild(h('div', 'member-trait', 'Next title at ' + nt.at + ' renown: ' + nt.t));
    }
    const mods = L.modifiers(state);
    const sp = L.speedMps(state, {});
    info.appendChild(
      h(
        'div',
        'member-stats',
        'Speed ' + sp.toFixed(2) + ' m/s · Eats ' + L.foodRatePer100(state).toFixed(1) + ' per 100 m · Luck +' + Math.round(Math.min(mods.luck, L.MAX_LUCK) * 100) + '%' + (mods.luck > L.MAX_LUCK ? ' (max)' : '')
      )
    );
    heroRow.appendChild(info);
    body.appendChild(heroRow);

    if (!state.party.length) {
      body.appendChild(h('p', 'empty', 'Your court is just you. Walk the Kingsroad to meet companions.'));
    } else {
      body.appendChild(h('p', 'panel-note', 'Walking order — first walks closest to you. Every companion brings a bonus and unlocks new choices on the road.'));
    }
    state.party.forEach((id, i) => {
      const c = TK.data.companions[id];
      if (!c) return;
      const row = h('div', 'member');
      const pi = h('img', 'member-portrait');
      pi.src = A.portraitUrl(c.actor);
      pi.alt = '';
      row.appendChild(pi);
      const inf = h('div', 'member-info');
      const nm = h('div', 'member-name', c.name);
      nm.appendChild(h('span', 'role', c.role));
      inf.appendChild(nm);
      inf.appendChild(h('div', 'member-epithet', c.epithet + ' · ' + (typeof c.age === 'number' ? 'age ' + c.age : c.age)));
      inf.appendChild(h('div', 'member-trait', c.trait));
      const bio = h('div', 'member-bio', c.bio);
      inf.appendChild(bio);
      row.appendChild(inf);
      const ctr = h('div', 'member-order');
      const up = h('button', 'mini-btn', '▲');
      up.type = 'button';
      up.title = 'Walk closer';
      up.disabled = i === 0;
      up.addEventListener('click', () => onMove(id, -1));
      const down = h('button', 'mini-btn', '▼');
      down.type = 'button';
      down.title = 'Walk further back';
      down.disabled = i === state.party.length - 1;
      down.addEventListener('click', () => onMove(id, 1));
      ctr.appendChild(up);
      ctr.appendChild(down);
      row.appendChild(ctr);
      body.appendChild(row);
    });
    const total = Object.keys(TK.data.companions).length;
    body.appendChild(h('p', 'panel-note dim', state.party.length + ' of ' + total + ' companions recruited.'));
  };

  // ---- Journal ------------------------------------------------------------------

  UI.renderChronicle = function renderChronicle(body, state) {
    if (!state.log.length) {
      body.appendChild(h('p', 'empty', 'The chronicle is empty. Quill is waiting for something worth writing.'));
      return;
    }
    const list = h('ol', 'chronicle');
    const units = state.settings.units;
    state.log
      .slice()
      .reverse()
      .forEach((e) => {
        const li = h('li', 'log-' + e.k);
        li.appendChild(h('span', 'log-d', U.formatDistance(e.d, units)));
        li.appendChild(h('span', 'log-t', e.t));
        list.appendChild(li);
      });
    body.appendChild(list);
  };

  UI.renderRoute2 = function renderRoute2(body, state) {
    const route = state.journey.route;
    const units = state.settings.units;
    let region = null;
    const list = h('div', 'route-list');
    const stop = state.journey.stop;
    const crowned = !!state.flags.crowned;
    const currentRegion = (L.routeLocation(state, stop) || {}).region;
    let total = 0;
    route.forEach((id, i) => {
      const loc = L.locationDef(id);
      if (!loc) return;
      total += loc.leg;
      const revealed = i <= stop || crowned || currentRegion === loc.region;
      if (loc.region !== region) {
        region = loc.region;
        const r = TK.data.regions[region];
        const rh = h('div', 'route-region region-' + region);
        rh.appendChild(h('div', 'route-region-name', revealed || i <= stop + 1 ? r.name : '???'));
        if (revealed) rh.appendChild(h('div', 'route-region-blurb', r.blurb));
        list.appendChild(rh);
      }
      const row = h('div', 'route-stop' + (i < stop ? ' done' : i === stop ? ' current' : ''));
      row.appendChild(h('span', 'route-mark', i < stop ? '✓' : i === stop ? '▸' : '•'));
      const nm = h('span', 'route-name', revealed ? loc.name : '???');
      row.appendChild(nm);
      const c = loc.recruit && TK.data.companions[loc.recruit];
      if (c && i < stop) {
        const pi = h('img', 'route-portrait');
        pi.src = A.portraitUrl(c.actor);
        pi.alt = '';
        pi.title = c.name + ' joined here';
        row.appendChild(pi);
      }
      row.appendChild(h('span', 'route-km', U.formatDistance(total, units)));
      list.appendChild(row);
    });
    if (L.inEndless(state) || crowned) {
      const rh = h('div', 'route-region region-endless');
      rh.appendChild(h('div', 'route-region-name', 'Beyond the Map'));
      rh.appendChild(h('div', 'route-region-blurb', 'The Royal Progress: endless roads, new towns, more tales.'));
      list.appendChild(rh);
      const cur = L.currentDestination(state);
      const row = h('div', 'route-stop current');
      row.appendChild(h('span', 'route-mark', '▸'));
      row.appendChild(h('span', 'route-name', cur.name));
      list.appendChild(row);
    }
    body.appendChild(h('p', 'panel-note', 'Total walked: ' + U.formatDistance(state.journey.total, units) + '.'));
    body.appendChild(list);
  };

  UI.renderDecrees = function renderDecrees(body, state) {
    const list = TK.data.achievements;
    const got = list.filter((a) => state.achievements[a.id]).length;
    body.appendChild(h('p', 'panel-note', got + ' of ' + list.length + ' royal decrees fulfilled.'));
    const grid = h('div', 'decrees');
    for (const a of list) {
      const done = !!state.achievements[a.id];
      const row = h('div', 'decree' + (done ? ' done' : ''));
      row.appendChild(icon(done ? 'check' : 'lock'));
      const t = h('div', 'decree-text');
      t.appendChild(h('div', 'decree-name', a.name));
      t.appendChild(h('div', 'decree-desc', a.text));
      row.appendChild(t);
      grid.appendChild(row);
    }
    body.appendChild(grid);
  };

  UI.renderTreasures = function renderTreasures(body, state) {
    const all = TK.data.trinkets;
    const ids = Object.keys(all);
    body.appendChild(h('p', 'panel-note', state.trinkets.length + ' of ' + ids.length + ' trinkets found. Trinkets give permanent bonuses.'));
    if (!state.trinkets.length) body.appendChild(h('p', 'empty', 'No trinkets yet. Markets sell them, and the road sometimes gives them away.'));
    for (const id of state.trinkets) {
      const t = all[id];
      if (!t) continue;
      const row = h('div', 'trinket');
      row.appendChild(icon(t.icon, 'ico-md'));
      const tx = h('div', 'trinket-text');
      tx.appendChild(h('div', 'trinket-name', t.name));
      tx.appendChild(h('div', 'trinket-desc', t.text));
      row.appendChild(tx);
      body.appendChild(row);
    }
    const seen = Object.keys(state.seen).filter((k) => TK.data.eventsById[k]).length;
    const total = TK.data.events.filter((e) => !e.disabled).length;
    const box = h('div', 'codex');
    box.appendChild(icon('book', 'ico-md'));
    box.appendChild(h('div', 'codex-text', 'Road tales discovered: ' + seen + ' of ' + total + '. Bring different companions to unlock new choices.'));
    body.appendChild(box);
  };

  // ---- Settings -----------------------------------------------------------------

  function selectRow(label, value, options, onChange, help) {
    const row = h('label', 'set-row');
    row.appendChild(h('span', 'set-label', label));
    const sel = h('select', 'set-select');
    for (const [v, t] of options) {
      const o = h('option', null, t);
      o.value = String(v);
      if (String(v) === String(value)) o.selected = true;
      sel.appendChild(o);
    }
    sel.addEventListener('change', () => onChange(sel.value));
    row.appendChild(sel);
    if (help) row.appendChild(h('span', 'set-help', help));
    return row;
  }

  function toggleRow(label, value, onChange, help) {
    const row = h('label', 'set-row toggle');
    const cb = h('input');
    cb.type = 'checkbox';
    cb.checked = !!value;
    cb.addEventListener('change', () => onChange(cb.checked));
    row.appendChild(cb);
    row.appendChild(h('span', 'set-label', label));
    if (help) row.appendChild(h('span', 'set-help', help));
    return row;
  }

  UI.renderSettings = function renderSettings(body, state, set, extras) {
    const s = state.settings;
    const g1 = h('div', 'set-group');
    g1.appendChild(h('h3', null, 'Journey'));
    g1.appendChild(selectRow('Road events', s.eventFreq, [['often', 'Often'], ['normal', 'Normal'], ['rare', 'Rare'], ['off', 'Off']], (v) => set('eventFreq', v), 'How often strangers and surprises appear.'));
    g1.appendChild(selectRow('Court chatter', s.banter, [['chatty', 'Chatty'], ['normal', 'Normal'], ['quiet', 'Quiet'], ['off', 'Off']], (v) => set('banter', v)));
    g1.appendChild(toggleRow('Auto-decide when idle', s.autoResolve, (v) => set('autoResolve', v), 'If an event waits 90 seconds, pick a safe choice and keep walking.'));
    g1.appendChild(selectRow('Distance units', s.units, [['metric', 'Metric (m, km)'], ['imperial', 'Imperial (ft, mi)']], (v) => set('units', v)));
    body.appendChild(g1);

    const g2 = h('div', 'set-group');
    g2.appendChild(h('h3', null, 'Look & feel'));
    g2.appendChild(selectRow('Time of day', s.dayNight, [['auto', 'Follow my clock'], ['day', 'Always day'], ['night', 'Always night']], (v) => set('dayNight', v)));
    g2.appendChild(toggleRow('Weather', s.weather, (v) => set('weather', v), 'Rain, snow and falling leaves.'));
    g2.appendChild(toggleRow('Minimal background', s.minimalBg, (v) => set('minimalBg', v), 'Flat sky instead of the parallax forest.'));
    g2.appendChild(toggleRow('Minimal interface', s.minimalUi, (v) => set('minimalUi', v), 'Plain panels without the royal trim.'));
    g2.appendChild(toggleRow('Reduce motion', s.reduceMotion, (v) => set('reduceMotion', v), 'No typewriter text or particles.'));
    g2.appendChild(selectRow('Frame rate', s.fps, [[30, '30 fps (battery friendly)'], [60, '60 fps (smoothest)']], (v) => set('fps', Number(v))));
    body.appendChild(g2);

    const g3 = h('div', 'set-group');
    g3.appendChild(h('h3', null, 'Kingdom'));
    const reset = h('button', 'btn btn-danger', 'Reset progress…');
    reset.type = 'button';
    reset.addEventListener('click', () => extras.reset());
    g3.appendChild(reset);
    g3.appendChild(h('p', 'set-help', 'Starts a brand-new reign. You will be asked to confirm.'));
    body.appendChild(g3);

    const about = h('div', 'set-group about');
    about.appendChild(h('h3', null, 'About'));
    about.appendChild(h('p', null, 'Travelling Kingdom ' + extras.version + ' — a pixel-art road trip that walks beside you while you code.'));
    about.appendChild(h('p', 'dim', 'Design and code by Viktar Syanau (MarySue). Pixel art by GandalfHardcore and ChestPack, used under licence.'));
    about.appendChild(h('p', 'dim', 'Tip: click your hero to hurry, click companions to chat. Press 1–4 to choose, Enter to continue.'));
    body.appendChild(about);
  };

  // ---------------------------------------------------------------------------
  // Market (card extra)
  // ---------------------------------------------------------------------------

  UI.marketExtra = function marketExtra(state, offers, buy) {
    const box = h('div', 'market');
    const row = (iconId, name, desc, price, onBuy, owned) => {
      const r = h('div', 'market-row');
      r.appendChild(icon(iconId, 'ico-md'));
      const tx = h('div', 'market-text');
      tx.appendChild(h('div', 'market-name', name));
      if (desc) tx.appendChild(h('div', 'market-desc', desc));
      r.appendChild(tx);
      const b = h('button', 'btn btn-gold btn-small');
      b.type = 'button';
      b.appendChild(icon('coin_gold'));
      b.appendChild(h('span', null, String(price)));
      b.disabled = owned || state.res.gold < price;
      b.title = state.res.gold < price ? 'Not enough coins' : 'Buy';
      b.addEventListener('click', onBuy);
      r.appendChild(b);
      box.appendChild(r);
    };
    row('food', '10 rations', 'Bread, cheese and hope.', L.servicePrice(state, 'rations10'), () => buy('rations10'));
    row('basket', '30 rations', 'A sack of supplies. Pell will carry it.', L.servicePrice(state, 'rations30'), () => buy('rations30'));
    for (const id of offers) {
      const t = TK.data.trinkets[id];
      if (!t) continue;
      row(t.icon, t.name, t.text, L.trinketPrice(state, id), () => buy('trinket:' + id), state.trinkets.indexOf(id) >= 0);
    }
    if (!offers.length) box.appendChild(h('p', 'dim', 'The trinket stall is sold out.'));
    return box;
  };

  UI.serviceMeta = SERVICE_META;

  TK.ui = UI;
})(typeof window !== 'undefined' ? window : globalThis);
