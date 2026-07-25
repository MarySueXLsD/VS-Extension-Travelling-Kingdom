(function () {
  const vscode = acquireVsCodeApi();

  const appEl = document.getElementById('app');
  const statsEl = document.getElementById('stats');
  const statsBgEl = document.getElementById('stats-bg');
  const bottomBarEl = document.getElementById('bottom-bar');
  const bottomBarBgEl = document.getElementById('bottom-bar-bg');
  const petNameEl = document.getElementById('pet-name');
  const partySizeEl = document.getElementById('party-size');
  const xpBarEl = document.getElementById('xp-bar');
  const xpLabelEl = document.getElementById('xp-label');
  const destinationLabelEl = document.getElementById('destination-label');
  const feedStatusEl = document.getElementById('feed-status');
  const shopStatusEl = document.getElementById('shop-status');
  const petEl = document.getElementById('pet');
  const petSpriteEl = document.getElementById('pet-sprite');
  const campNpcEl = document.getElementById('camp-npc');
  const companion2El = document.getElementById('companion-2');
  const campDogEl = document.getElementById('camp-dog');
  const campKnightSitEl = document.getElementById('camp-knight-sit');
  const campKnightLuteEl = document.getElementById('camp-knight-lute');
  const departBtnEl = document.getElementById('depart-btn');
  const gameWorldEl = document.getElementById('game-world');
  const uiFrameEl = document.getElementById('ui-frame');
  const uiFrameBgEl = document.getElementById('ui-frame-bg');
  const selectScreenEl = document.getElementById('screen-character-select');
  const panels = Array.from(document.querySelectorAll('.panel'));
  const carouselTrackEl = document.getElementById('carousel-track');
  const titleTrackEl = document.getElementById('title-track');
  const charPrevEl = document.getElementById('char-prev');
  const charNextEl = document.getElementById('char-next');
  const charConfirmEl = document.getElementById('char-confirm');
  const confirmBtnBgEl = document.getElementById('confirm-btn-bg');
  const nameInputEl = document.getElementById('name-input');
  const resetBtnEl = document.getElementById('reset-progress');
  const cloudsEnabledEl = document.getElementById('clouds-enabled');
  const unitMetricEl = document.getElementById('unit-metric');
  const unitImperialEl = document.getElementById('unit-imperial');
  const minimalUiEl = document.getElementById('minimal-ui');
  const minimalBgEl = document.getElementById('minimal-bg');
  const feedActionBtn = document.querySelector('[data-action="feed"]');
  const introFrameEl = document.getElementById('intro-frame');
  const introFrameBgEl = document.getElementById('intro-frame-bg');
  const groundStripEl = document.getElementById('ground-strip');
  const worldDecorEl = document.getElementById('world-decor');
  const campDecorEl = document.getElementById('camp-decor');
  const parallaxBgEl = document.getElementById('parallax-bg');
  const screens = Array.from(document.querySelectorAll('.screen'));
  const navButtons = Array.from(document.querySelectorAll('.nav-btn'));

  const FRAME_CORNER = 16;
  const FRAME_MID = 32;
  const BUTTON_CAP = 16;
  const BUTTON_MID = 32;
  const FLOOR_COLS = 9;
  const FLOOR_ROWS = 18;
  const FLOOR_TILE_COL = 1;
  const FLOOR_TILE_ROW = 0;
  const FLOOR_DISPLAY_SCALE = 2;
  const FLOOR_VISIBLE_RATIO = 0.6;
  const PARALLAX_DISPLAY_SCALE = 0.65;
  const DECOR_COLS = 13;
  const DECOR_ROWS = 17;
  const DECOR_SCALE = 2;
  // 1-based sheet rows from the brief → 0-based here. Weights: grass often, bushes mid, big rock rare.
  const DECOR_DEFS = [
    { row: 4, col: 0, w: 1, h: 1, weight: 10 },
    { row: 4, col: 1, w: 1, h: 1, weight: 10 },
    { row: 4, col: 2, w: 1, h: 1, weight: 10 },
    { row: 5, col: 0, w: 1, h: 1, weight: 8 },
    { row: 6, col: 0, w: 1, h: 1, weight: 8 },
    { row: 7, col: 0, w: 1, h: 1, weight: 3 },
    { row: 7, col: 1, w: 2, h: 1, weight: 2.5 },
    { row: 8, col: 0, w: 3, h: 2, weight: 0.45 },
    { row: 13, col: 0, w: 2, h: 1, weight: 2.2 },
    { row: 13, col: 2, w: 1, h: 1, weight: 2.2 },
    { row: 13, col: 3, w: 1, h: 1, weight: 2.2 },
  ];
  const FLOOR_SCROLL_SPEED = 48; // px per second, leftward
  const FLOOR_SCROLL_SPEED_BOOST = 96; // faster ground + parallax while tapped
  const TAP_BOOST_MS = 320; // brief burst after tap
  const TRAVEL_FLUSH_MS = 50; // batch travel messages to extension host
  const WALK_FRAME_COUNT = 8;
  const WALK_ROW_START = 6; // last 8 rows of the 14-row sheet
  const WALK_FPS_NORMAL = 8;
  const WALK_FPS_BOOST = 16;
  const SPRITE_DISPLAY = 96;
  /** Soldier Camp (level 1) landmark — decor.png pieces, 0-based sheet coords. */
  const CAMP_DEST_LEVEL = 1;
  /** Apple Grove (level 2) landmark — orchard art is bottom-aligned to the trail. */
  const GROVE_DEST_LEVEL = 2;
  const GROVE_APPLE_COUNT = 30;
  const GROVE_WILLOW_OX = 0.2;
  const GROVE_NPC_OX = 0.85;
  const GROVE_NPC_COL = 1; // female sheet column 2 (1-based)
  const GROVE_NPC_ROWS = [1, 2, 3, 4, 5]; // standing rows 2–6 (1-based)
  // Fixed offsets preserve the same orchard silhouette after every reload.
  const GROVE_APPLE_OX = [
    -5.5, -5.1, -4.8, -4.4, -4.0, -3.7, -3.3, -2.9, -2.6, -2.2,
    -1.8, -1.5, -1.1, -0.8, -0.45, 0.7, 1.05, 1.4, 1.75, 2.1,
    2.45, 2.8, 3.15, 3.5, 3.85, 4.2, 4.55, 4.9, 5.2, 5.5,
  ];
  const CAMP_PIECES = [
    { id: 'leftTent', row: 1, col: 0, w: 3, h: 2, ox: -3, oy: 0 },
    { id: 'barrels', row: 0, col: 3, w: 1, h: 1, ox: -3, oy: 0 },
    { id: 'pot', row: 3, col: 1, w: 1, h: 1, ox: 0, oy: 0 },
    { id: 'rightTent', row: 1, col: 3, w: 3, h: 2, ox: 1, oy: 0 },
    { id: 'axe', row: 0, col: 6, w: 1, h: 1, ox: 4, oy: 0 },
    { id: 'wood', row: 2, col: 6, w: 2, h: 1, ox: 4.5, oy: 0 },
  ];
  const CAMP_NPC_COL = 3; // male sheet column 4 (1-based)
  const CAMP_NPC_ROWS = [1, 2, 3, 4, 5]; // standing rows 2–6 (1-based)
  const CAMP_NPC_FPS = 5;
  /** Lead X inset from the left edge (solo). */
  const PET_BASE_LEFT = 28;
  /** Extra lead inset per party member so the trail fits on screen. */
  const CAMERA_PAD_PER_MEMBER = 36;
  /** Companion trails this far behind the leader (px). */
  const COMPANION_FOLLOW_GAP = Math.round(SPRITE_DISPLAY * 0.45);
  /** Camera settle speed — lower = slower, smoother ease to lead position. */
  const CAMERA_EASE_RATE = 0.85;
  /** Max camera ease (px/s); keep well below floor scroll so it reads as pan, not slide. */
  const CAMERA_EASE_MAX_SPEED = 28;
  const RECRUIT_FACE_MS = 300;
  // characters1.png — 10×15 @ 64px (0-based rows/cols).
  const CHARS1_COLS = 10;
  const CHARS1_ROWS = 15;
  const CAMP_EXTRAS = [
    // Dog idle beside barrels, drawn in front of left tent (Z).
    {
      id: 'dog',
      row: 7,
      cols: [0, 1, 2, 3, 4],
      ox: -1.55,
      size: 96,
      mirror: true,
      el: null,
    },
    // Sitting knight next to the left tent (shifted toward camp center).
    {
      id: 'knightSit',
      row: 8,
      cols: [0, 1, 2, 3, 4],
      ox: -2.6,
      size: 88,
      el: null,
    },
    // Lute knight next to the right tent.
    {
      id: 'knightLute',
      row: 9,
      cols: [5, 6, 7, 8, 9],
      ox: 3.6,
      size: 88,
      el: null,
    },
  ];
  const COMPANION_SLOTS = [
    {
      id: 'hooded',
      el: campNpcEl,
      minParty: 2,
      sheet: 'male',
      col: 3,
    },
    {
      id: 'forest',
      el: companion2El,
      minParty: 3,
      sheet: 'female',
      col: 1,
    },
  ];

  // Layer 1 = nearest (ground-like), layer 6 = farthest (static sky)
  // Layer 1 art is pre-cropped (solid green base removed from the PNG).
  const PARALLAX_LAYERS = [
    { id: 6, speed: 0 },
    { id: 5, speed: 3 },
    { id: 4, speed: 8 },
    { id: 3, speed: 16 },
    { id: 2, speed: 28 },
    { id: 1, speed: 48 },
  ];
  const SKY_FILL = '#84c4d0';
  const CLOUD_BASE_SKY_H = 280;
  const CLOUD_BASE_SKY_W = 360;
  const CLOUD_BASE_COUNT = 8; // height-driven baseline
  const CLOUD_WIDTH_BONUS = 5; // extra clouds from width (modest; narrow stays full)
  const CLOUD_MIN_COUNT = 8; // never leave a skinny panel empty
  const CLOUD_MAX_COUNT = 72;
  const CLOUD_DISPLAY_SCALE = 1.1;
  const CLOUD_SCALE_MIN = 0.35;
  const CLOUD_SCALE_MAX = 0.85;
  const CLOUD_SPEED_MIN = 8;
  const CLOUD_SPEED_MAX = 28;
  // Bottom-anchored: fromHorizon is px above the horizon for the cloud top.
  const CLOUD_MIN_FROM_HORIZON = 100; // raised floor — no longer dips into the peaks
  const CLOUD_LOW_BAND = 230; // most clouds stay in this stack above the floor
  const CLOUD_TOP_PAD = 12;
  // Draw clouds after far parallax (ids 6,5), before nearer layers (4…1).
  const CLOUD_AFTER_LAYER_ID = 5;
  const XP_BAR_FILL_TOP = '#5ec75a';
  const XP_BAR_FILL_BOTTOM = '#2a7a28';
  const XP_SHINE_SPEED = 28; // px per second along shine axis
  const XP_SHINE_SPACING = 10;
  // ui_bar.png content crop (18,12)..(173,36) — not full 192x48 canvas
  const XP_BAR_OX = 18;
  const XP_BAR_OY = 12;
  const XP_BAR_SRC_W = 156; // 173 - 18 + 1
  const XP_BAR_SRC_H = 24; // 36 - 12
  const XP_BAR_CAP = 30; // ornament width inside crop (trough starts at x=48)
  // trough in full PNG (48,21)..(143,26) → crop-local
  const XP_BAR_FILL_X = 30;
  const XP_BAR_FILL_Y = 9;
  const XP_BAR_FILL_W = 96;
  const XP_BAR_FILL_H = 6;

  let royalFrameImg = null;
  let royalButtonImg = null;
  let uiBarImg = null;
  let destinations = [];
  let latestXpPct = 0;
  let xpShineOffset = 0;
  let floorTilesImg = null;
  let decorImg = null;
  let decorCell = 32;
  let decorItems = [];
  let decorScroll = 0;
  let decorNextSpawnX = 0;
  let campActive = false;
  let campPotWorldX = 0;
  /** Active shared landmark kind; camp variables retain their names for compatibility. */
  let landmarkKind = null;
  /** Once at/after the landmark, its anchor stays fixed in world space until off-screen. */
  let campWorldLocked = false;
  let campNpcImage = null;
  let campChars1Image = null;
  let groveAppleImg = null;
  let groveWillowImg = null;
  let groveFemaleImage = null;
  let campNpcFrame = 0;
  let campNpcAnimId = null;
  let campNpcLastTs = 0;
  let departing = false;
  /** Hooded camp NPC walking with the player after the meet sequence. */
  let companionJoined = false;
  /** Meet-and-greet after Continue (approach → face → join). */
  let recruitBusy = false;
  /** Current recruit phase: 'approach' | 'petFace' | 'npcFace' | 'petResume' | null. */
  let recruitPhase = null;
  let recruitAnimId = null;
  let recruitJoinedState = null;
  let npcFaceRight = false;
  let petFaceRight = true;
  let petLeadLeft = PET_BASE_LEFT;
  let petLeadLeftTarget = PET_BASE_LEFT;
  let cameraAnimId = null;
  let parallaxLayers = [];
  let cloudImages = [];
  let clouds = [];
  let cloudsEnabled = false;
  let distanceUnit = 'metric';
  let minimalUi = false;
  let minimalBg = false;
  let cloudsPrepPromise = null;
  let frameResizeObserver = null;
  let buttonResizeObserver = null;
  let groundResizeObserver = null;
  let groundOffset = 0;
  let groundAnimId = null;
  let lastGroundTs = 0;
  let walkFrame = 0;
  let walkAnimId = null;
  let lastWalkTs = 0;
  let walkBoostUntil = 0;
  let activeWalkCharacterId = null;
  let traveledPx = 0;
  let pendingTravelMeters = 0;
  let travelFlushTimer = null;
  let travelEnabled = false;
  let tapBoostUntil = 0;

  const CHARACTERS = [
    {
      id: 'female-0',
      title: 'Queen',
      defaultName: 'Elizabeth',
      sheet: appEl.dataset.femaleSheet,
      cols: 12,
      rows: 14,
      col: 0,
      row: 0,
      portraitUrl: null,
    },
    {
      id: 'male-7',
      title: 'King',
      defaultName: 'Arthur',
      sheet: appEl.dataset.maleSheet,
      cols: 11,
      rows: 14,
      col: 7,
      row: 0,
      portraitUrl: null,
    },
  ];

  // Infinite track: [lastClone, ...items, firstClone] → start on first real item (index 1)
  let trackIndex = 1;
  let animating = false;
  let reactTimer = null;
  let latestState = null;
  let confirming = false;
  let portraitsReady = false;
  /** Local nav screen; survives stale host state replies (travel / settings toggles). */
  let activeScreen = 'home';
  let screenHydrated = false;

  charConfirmEl.disabled = true;

  function metersToNext(level) {
    const exact = destinations.find((d) => d.level === level);
    if (exact && typeof exact.meters === 'number' && exact.meters > 0) {
      return Math.floor(exact.meters);
    }
    if (level <= 3) {
      return 100 + (level - 1) * 200;
    }
    return (level - 2) * 500;
  }

  function applyTravelLocal(state, gain) {
    if (state.awaitingDeparture) {
      return state;
    }
    let level = state.level;
    let meters = typeof state.meters === 'number' ? state.meters : 0;
    const needed = metersToNext(level);
    meters += gain;
    if (meters >= needed) {
      return {
        ...state,
        level,
        meters: needed,
        awaitingDeparture: true,
      };
    }
    return { ...state, level, meters, awaitingDeparture: false };
  }

  function applyMetersLocal(state, gain) {
    const now = Date.now();
    return {
      ...applyTravelLocal(state, gain),
      mood: 'happy',
      lastActionAt: now,
      lastMetersTick: now,
    };
  }

  function destinationNameForLevel(level) {
    if (!destinations.length) {
      return 'Meadow Village';
    }
    const exact = destinations.find((d) => d.level === level);
    if (exact && exact.name) {
      return exact.name;
    }
    const idx =
      ((Math.max(1, Math.floor(level || 1)) - 1) % destinations.length + destinations.length) %
      destinations.length;
    return destinations[idx].name || 'Meadow Village';
  }

  function formatFeedGainLabel() {
    if (distanceUnit === 'imperial') {
      return 'Feed (+120 feet)';
    }
    return 'Feed (+40 m)';
  }

  function updateFeedButtonLabel() {
    if (feedActionBtn) {
      feedActionBtn.textContent = formatFeedGainLabel();
    }
  }

  function cssColor(name, fallback) {
    const value = getComputedStyle(document.documentElement).getPropertyValue(name).trim();
    return value || fallback;
  }

  function applyMinimalUi(enabled) {
    const next = Boolean(enabled);
    if (minimalUiEl) {
      minimalUiEl.checked = next;
    }
    minimalUi = next;
    appEl.classList.toggle('minimal-ui', next);
    requestAnimationFrame(() => {
      paintChromeFrames();
      paintXpBar(latestXpPct);
      paintUiFrame();
      paintAllButtons();
      paintNavButtons();
      if (appEl.classList.contains('selecting-character')) {
        paintRoyalFrame();
      }
    });
  }

  function applyMinimalBg(enabled) {
    const next = Boolean(enabled);
    if (minimalBgEl) {
      minimalBgEl.checked = next;
    }
    minimalBg = next;
    appEl.classList.toggle('minimal-bg', next);
    requestAnimationFrame(() => {
      paintParallax();
    });
  }

  function applyDistanceUnit(unit) {
    distanceUnit = unit === 'imperial' ? 'imperial' : 'metric';
    if (unitMetricEl) {
      unitMetricEl.checked = distanceUnit === 'metric';
    }
    if (unitImperialEl) {
      unitImperialEl.checked = distanceUnit === 'imperial';
    }
    updateFeedButtonLabel();
    if (latestState) {
      updateMetersUi(latestState);
    }
  }

  function progressScore(state) {
    const level = typeof state.level === 'number' ? state.level : 1;
    const meters = typeof state.meters === 'number' ? state.meters : 0;
    return level * 1_000_000_000 + meters;
  }

  function getDisplayTileWidth() {
    if (!floorTilesImg) {
      return 0;
    }
    const cellW = Math.floor(floorTilesImg.naturalWidth / FLOOR_COLS);
    return Math.max(1, cellW * FLOOR_DISPLAY_SCALE);
  }

  /** Fractional meters including pixels scrolled since last whole tile. */
  function effectiveMeters(state) {
    const base = typeof state.meters === 'number' ? state.meters : 0;
    const displayTile = getDisplayTileWidth();
    if (displayTile <= 0) {
      return base;
    }
    return base + traveledPx / displayTile;
  }

  function mergeServerState(server) {
    if (!latestState || !server.characterId || server.characterId !== latestState.characterId) {
      return server;
    }
    // Never let a stale host reply roll progress backwards.
    if (progressScore(server) < progressScore(latestState)) {
      const keepAwaiting =
        departing || latestState.level > server.level
          ? latestState.awaitingDeparture
          : Boolean(latestState.awaitingDeparture || server.awaitingDeparture);
      return {
        ...server,
        level: latestState.level,
        meters: latestState.meters,
        awaitingDeparture: keepAwaiting,
        partySize: Math.max(server.partySize || 1, latestState.partySize || 1),
      };
    }
    // Host caught up or ahead: drop matching pending so we don't double-count.
    if (progressScore(server) > progressScore(latestState)) {
      pendingTravelMeters = 0;
      traveledPx = 0;
      if (departing && !server.awaitingDeparture) {
        departing = false;
      }
    } else if (
      !departing &&
      latestState.awaitingDeparture &&
      !server.awaitingDeparture
    ) {
      // Same score, local already at camp — keep arrival until host flush lands.
      // Skip while an optimistic depart is in flight.
      return {
        ...server,
        level: latestState.level,
        meters: latestState.meters,
        awaitingDeparture: true,
        partySize: Math.max(server.partySize || 1, latestState.partySize || 1),
      };
    }
    return {
      ...server,
      partySize: Math.max(server.partySize || 1, latestState.partySize || 1),
    };
  }

  function applyDepartLocal(state) {
    let partySize = Math.max(1, state.partySize || 1);
    if (state.level === 1) {
      partySize = Math.max(partySize, 2);
    } else if (state.level === 2) {
      partySize = Math.max(partySize, 3);
    }
    return {
      ...state,
      level: state.level + 1,
      meters: 0,
      awaitingDeparture: false,
      partySize,
    };
  }

  function formatPartySize(count) {
    const n = Math.max(1, Math.floor(count || 1));
    return n === 1 ? '1 person' : `${n} persons`;
  }

  function companionCountFromState(state) {
    return Math.max(1, Math.min(3, Math.floor((state && state.partySize) || 1)));
  }

  function hasCompanions() {
    return companionCountFromState(latestState) >= 2;
  }

  function syncCompanionFromState(state) {
    if (recruitBusy) {
      return;
    }
    const nextJoined = companionCountFromState(state) >= 2;
    companionJoined = nextJoined;
    setCameraTargetForParty(state && state.partySize ? state.partySize : 1);
    if (companionJoined) {
      positionCompanionsBehindPet();
      drawActiveCompanionWalkFrames(walkFrame || 0);
      // Only snap on large mismatch (reload); otherwise ease.
      if (Math.abs(petLeadLeft - petLeadLeftTarget) > CAMERA_PAD_PER_MEMBER * 2.5) {
        applyPetLeft(petLeadLeftTarget);
        positionCompanionsBehindPet();
      } else if (Math.abs(petLeadLeft - petLeadLeftTarget) > 0.5) {
        startCameraEase();
      }
    } else if (campNpcEl && !campActive) {
      campNpcEl.hidden = true;
    }
  }

  function setCameraTargetForParty(partySize) {
    const n = Math.max(1, Math.floor(partySize || 1));
    petLeadLeftTarget = PET_BASE_LEFT + Math.max(0, n - 1) * CAMERA_PAD_PER_MEMBER;
  }

  function applyPetLeft(px) {
    petLeadLeft = px;
    if (petEl) {
      petEl.style.left = `${Math.round(px)}px`;
    }
  }

  function startCameraEase(onComplete) {
    if (typeof onComplete === 'function') {
      if (!startCameraEase._queue) {
        startCameraEase._queue = [];
      }
      startCameraEase._queue.push(onComplete);
    }
    if (cameraAnimId !== null) {
      return;
    }
    let lastTs = 0;
    const tick = (timestamp) => {
      if (recruitBusy) {
        cameraAnimId = null;
        return;
      }
      if (lastTs > 0) {
        const dt = Math.min(0.05, (timestamp - lastTs) / 1000);
        const diff = petLeadLeftTarget - petLeadLeft;
        if (Math.abs(diff) < 0.5) {
          applyPetLeft(petLeadLeftTarget);
          if (companionJoined) {
            positionCompanionsBehindPet();
          }
          cameraAnimId = null;
          const queue = startCameraEase._queue || [];
          startCameraEase._queue = [];
          queue.forEach((cb) => {
            try {
              cb();
            } catch (error) {
              console.error('[travelling-kingdom] camera ease callback failed', error);
            }
          });
          return;
        }
        // Blend exponential ease with a capped speed for long camera returns.
        const eased = diff * Math.min(1, dt * CAMERA_EASE_RATE);
        const capped =
          Math.sign(diff) * Math.min(Math.abs(diff), CAMERA_EASE_MAX_SPEED * dt);
        const step = Math.abs(eased) < Math.abs(capped) ? eased : capped;
        applyPetLeft(petLeadLeft + step);
        if (companionJoined) {
          positionCompanionsBehindPet();
        }
      }
      lastTs = timestamp;
      cameraAnimId = requestAnimationFrame(tick);
    };
    cameraAnimId = requestAnimationFrame(tick);
  }

  function formatDestinationLabel(level) {
    return `Destination: ${destinationNameForLevel(level)}`;
  }

  function formatDistanceLabel(meters, needed) {
    if (distanceUnit === 'imperial') {
      const feet = Math.floor(meters * 3);
      const needFeet = Math.round(needed * 3);
      const unit = needFeet === 1 ? 'foot' : 'feet';
      return `Traveled ${feet}/${needFeet} ${unit}`;
    }
    return `Traveled ${Math.floor(meters)}/${needed} meters`;
  }

  function updateMetersUi(state) {
    if (!state) {
      return;
    }
    const needed = metersToNext(state.level);
    const progressMeters = effectiveMeters(state);
    const pct = needed > 0 ? Math.min(100, (progressMeters / needed) * 100) : 0;
    if (partySizeEl) {
      partySizeEl.textContent = formatPartySize(state.partySize);
    }
    latestXpPct = pct;
    paintXpBar(pct);
    xpLabelEl.textContent = formatDistanceLabel(progressMeters, needed);
    if (destinationLabelEl) {
      destinationLabelEl.textContent = formatDestinationLabel(state.level);
    }
  }

  function flushTravelMeters() {
    if (travelFlushTimer !== null) {
      clearTimeout(travelFlushTimer);
      travelFlushTimer = null;
    }
    const batch = pendingTravelMeters;
    pendingTravelMeters = 0;
    if (batch > 0) {
      vscode.postMessage({ type: 'action', action: 'travel', meters: batch });
    }
  }

  function scheduleTravelFlush() {
    if (travelFlushTimer !== null) {
      return;
    }
    travelFlushTimer = setTimeout(() => {
      travelFlushTimer = null;
      flushTravelMeters();
    }, TRAVEL_FLUSH_MS);
  }

  function accrueTravelMeters(move, displayTile) {
    if (!travelEnabled || !latestState || !latestState.characterId || displayTile <= 0 || move <= 0) {
      return;
    }
    // Allow meter accrual during scroll-meet approach; freeze only for face/join beats.
    if (
      latestState.awaitingDeparture ||
      (recruitBusy && recruitPhase !== 'approach') ||
      appEl.classList.contains('ui-panel-mode') ||
      appEl.classList.contains('selecting-character')
    ) {
      return;
    }

    traveledPx += move;
    const wholeTiles = Math.floor(traveledPx / displayTile);
    if (wholeTiles > 0) {
      traveledPx -= wholeTiles * displayTile;
      pendingTravelMeters += wholeTiles;
      latestState = applyTravelLocal(latestState, wholeTiles);
      scheduleTravelFlush();
      if (latestState.awaitingDeparture) {
        traveledPx = 0;
        flushTravelMeters();
        onArrivedAtDestination();
      }
    }
    syncCampWorldPosition();
    // Always refresh UI every frame so the bar/label track scroll continuously.
    updateMetersUi(latestState);
  }

  function resetTravelAccrual() {
    traveledPx = 0;
    pendingTravelMeters = 0;
    travelEnabled = false;
    if (travelFlushTimer !== null) {
      clearTimeout(travelFlushTimer);
      travelFlushTimer = null;
    }
  }

  function enableTravelAccrual() {
    travelEnabled = true;
  }

  function getPetScreenX() {
    if (!petEl) {
      return PET_BASE_LEFT + SPRITE_DISPLAY / 2;
    }
    return petEl.offsetLeft + petEl.offsetWidth / 2;
  }

  function campUnit() {
    return decorCell * DECOR_SCALE;
  }

  function shouldShowCamp(state) {
    if (!state || !state.characterId) {
      return false;
    }
    return state.level === CAMP_DEST_LEVEL;
  }

  function shouldShowGrove(state) {
    return Boolean(state && state.characterId && state.level === GROVE_DEST_LEVEL);
  }

  function shouldShowLandmark(state) {
    return shouldShowCamp(state) || shouldShowGrove(state);
  }

  function landmarkKindForState(state) {
    if (shouldShowCamp(state)) {
      return 'camp';
    }
    if (shouldShowGrove(state)) {
      return 'grove';
    }
    return null;
  }

  function remainingMetersForCamp(state) {
    if (!state) {
      return 0;
    }
    const needed = metersToNext(state.level);
    const progress = effectiveMeters(state);
    return Math.max(0, needed - progress);
  }

  function isCampOffscreen() {
    const width = Math.max(1, Math.round(appEl.clientWidth));
    const u = campUnit();
    const leftOffset = landmarkKind === 'grove' ? -5.5 : CAMP_PIECES[0].ox;
    const rightOffset = 5.5;
    const left = campPotWorldX + leftOffset * u - decorScroll;
    const right = campPotWorldX + rightOffset * u - decorScroll;
    return right < -48 || left > width + 48;
  }

  function syncCampWorldPosition() {
    if (!latestState || !latestState.characterId) {
      if (campActive && !recruitBusy) {
        clearCamp();
      }
      return;
    }

    // Keep the landmark locked for the whole meet sequence.
    if (recruitBusy) {
      campActive = true;
      campWorldLocked = true;
      startCampNpcAnim();
      return;
    }

    if (shouldShowLandmark(latestState)) {
      campActive = true;
      landmarkKind = landmarkKindForState(latestState);
      if (latestState.awaitingDeparture || campWorldLocked) {
        if (!campWorldLocked) {
          campPotWorldX = decorScroll + getPetScreenX();
          campWorldLocked = true;
        }
      } else {
        campWorldLocked = false;
        const displayTile = getDisplayTileWidth() || campUnit();
        const remaining = remainingMetersForCamp(latestState);
        campPotWorldX = decorScroll + getPetScreenX() + remaining * displayTile;
      }
      startCampNpcAnim();
      return;
    }

    // Left destination 1: keep the same camp in world space until it scrolls away.
    if (campActive && campWorldLocked) {
      if (isCampOffscreen()) {
        clearCamp();
      } else {
        startCampNpcAnim();
      }
      return;
    }

    if (campActive) {
      clearCamp();
    }
  }

  function campBand() {
    const u = campUnit();
    if (landmarkKind === 'grove') {
      return {
        left: campPotWorldX - 5.5 * u - 8,
        right: campPotWorldX + 5.5 * u + 8,
      };
    }
    const left = campPotWorldX + CAMP_PIECES[0].ox * u - 8;
    // Include knights sitting beside both tents.
    const right = campPotWorldX + 5.5 * u + 8;
    return { left, right };
  }

  function paintCamp(ctx, height) {
    if (!campActive || landmarkKind !== 'camp' || !decorImg) {
      return;
    }
    const u = campUnit();
    const width = Math.max(1, Math.round(appEl.clientWidth));
    CAMP_PIECES.forEach((piece) => {
      const sizeW = piece.w * u;
      const sizeH = piece.h * u;
      const dx = Math.round(campPotWorldX + piece.ox * u - decorScroll);
      if (dx + sizeW < 0 || dx > width) {
        return;
      }
      // oy in cell units above ground (draw order = Z; barrels after tent).
      const dy = height - sizeH - piece.oy * u;
      const sx = piece.col * decorCell;
      const sy = piece.row * decorCell;
      const sw = piece.w * decorCell;
      const sh = piece.h * decorCell;
      ctx.drawImage(decorImg, sx, sy, sw, sh, dx, dy, sizeW, sizeH);
    });
  }

  function paintGrove(ctx, height) {
    if (!campActive || landmarkKind !== 'grove' || !groveAppleImg || !groveWillowImg) {
      return;
    }
    const width = Math.max(1, Math.round(appEl.clientWidth));
    const u = campUnit();
    const drawTree = (img, ox) => {
      const drawW = img.width || img.naturalWidth;
      const drawH = img.height || img.naturalHeight;
      const dx = Math.round(campPotWorldX + ox * u - decorScroll - drawW / 2);
      if (dx + drawW < 0 || dx > width) {
        return;
      }
      ctx.drawImage(img, dx, height - drawH, drawW, drawH);
    };
    GROVE_APPLE_OX.slice(0, GROVE_APPLE_COUNT).forEach((ox) => drawTree(groveAppleImg, ox));
    drawTree(groveWillowImg, GROVE_WILLOW_OX);
  }

  function positionCampNpc() {
    if (!campNpcEl || !campActive || landmarkKind !== 'camp' || companionJoined) {
      if (campNpcEl && !companionJoined) {
        campNpcEl.hidden = true;
      }
      return;
    }
    const u = campUnit();
    // Stand just to the right of the pot.
    const screenX = Math.round(campPotWorldX + 0.85 * u - decorScroll);
    campNpcEl.hidden = false;
    campNpcEl.style.left = `${screenX}px`;
    campNpcEl.style.bottom = '0';
  }

  function shouldShowGroveNpc() {
    return Boolean(
      campActive &&
        landmarkKind === 'grove' &&
        latestState &&
        companionCountFromState(latestState) < 3
    );
  }

  function positionGroveNpc() {
    if (!companion2El) {
      return;
    }
    if (!shouldShowGroveNpc()) {
      if (!latestState || companionCountFromState(latestState) < 3) {
        companion2El.hidden = true;
      }
      return;
    }
    const u = campUnit();
    const screenX = Math.round(campPotWorldX + GROVE_NPC_OX * u - decorScroll);
    companion2El.hidden = false;
    companion2El.style.left = `${screenX}px`;
    companion2El.style.bottom = '0';
  }

  function positionCampExtra(extra, frameIndex) {
    const el = extra.el;
    if (!el || !campActive || landmarkKind !== 'camp' || !campChars1Image) {
      if (el) {
        el.hidden = true;
      }
      return;
    }
    const u = campUnit();
    const size = extra.size;
    const screenX = Math.round(campPotWorldX + extra.ox * u - decorScroll - size / 2);
    const width = Math.max(1, Math.round(appEl.clientWidth));
    if (screenX + size < 0 || screenX > width) {
      el.hidden = true;
      return;
    }
    el.hidden = false;
    el.style.left = `${screenX}px`;
    el.style.bottom = '0';
    drawCampExtraFrame(extra, frameIndex);
  }

  function positionAllCampExtras(frameIndex) {
    CAMP_EXTRAS.forEach((extra) => positionCampExtra(extra, frameIndex));
  }

  function hideAllCampExtras() {
    CAMP_EXTRAS.forEach((extra) => {
      if (extra.el) {
        extra.el.hidden = true;
      }
    });
  }

  function drawCampExtraFrame(extra, frameIndex) {
    const el = extra.el;
    if (!el || !campChars1Image) {
      return;
    }
    const img = campChars1Image;
    // Canvas from makeBlackTransparent has .width/.height, not naturalWidth.
    const sheetW = img.naturalWidth || img.width;
    const sheetH = img.naturalHeight || img.height;
    if (!sheetW || !sheetH) {
      return;
    }
    const cellW = Math.floor(sheetW / CHARS1_COLS);
    const cellH = Math.floor(sheetH / CHARS1_ROWS);
    if (cellW <= 0 || cellH <= 0) {
      return;
    }
    const col = extra.cols[frameIndex % extra.cols.length];
    const dpr = window.devicePixelRatio || 1;
    const size = extra.size;
    el.width = Math.round(size * dpr);
    el.height = Math.round(size * dpr);
    el.style.width = `${size}px`;
    el.style.height = `${size}px`;
    const ctx = el.getContext('2d');
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.imageSmoothingEnabled = false;
    ctx.clearRect(0, 0, size, size);
    if (extra.mirror) {
      ctx.save();
      ctx.translate(size, 0);
      ctx.scale(-1, 1);
      ctx.drawImage(
        img,
        col * cellW,
        extra.row * cellH,
        cellW,
        cellH,
        0,
        0,
        size,
        size
      );
      ctx.restore();
    } else {
      ctx.drawImage(
        img,
        col * cellW,
        extra.row * cellH,
        cellW,
        cellH,
        0,
        0,
        size,
        size
      );
    }
  }

  function positionDepartButton() {
    if (!departBtnEl) {
      return;
    }
    const waiting = Boolean(
      latestState && latestState.awaitingDeparture && !departing
    );
    departBtnEl.hidden = !waiting || appEl.classList.contains('selecting-character');
    if (departBtnEl.hidden || !petEl) {
      return;
    }
    const left = petEl.offsetLeft + petEl.offsetWidth + 8;
    departBtnEl.style.left = `${left}px`;
    departBtnEl.style.bottom = `${Math.max(8, Math.round(SPRITE_DISPLAY * 0.55))}px`;
  }

  function drawCampNpcFrame(frameIndex) {
    if (!campNpcEl || !campNpcImage || companionJoined) {
      return;
    }
    const img = campNpcImage;
    const cols = 11;
    const rows = 14;
    const cellW = Math.floor(img.naturalWidth / cols);
    const cellH = Math.floor(img.naturalHeight / rows);
    const row = CAMP_NPC_ROWS[frameIndex % CAMP_NPC_ROWS.length];
    const dpr = window.devicePixelRatio || 1;
    const size = SPRITE_DISPLAY;
    campNpcEl.width = Math.round(size * dpr);
    campNpcEl.height = Math.round(size * dpr);
    campNpcEl.style.width = `${size}px`;
    campNpcEl.style.height = `${size}px`;
    const ctx = campNpcEl.getContext('2d');
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.imageSmoothingEnabled = false;
    ctx.clearRect(0, 0, size, size);
    if (npcFaceRight) {
      ctx.save();
      ctx.translate(size, 0);
      ctx.scale(-1, 1);
      ctx.drawImage(
        img,
        CAMP_NPC_COL * cellW,
        row * cellH,
        cellW,
        cellH,
        0,
        0,
        size,
        size
      );
      ctx.restore();
    } else {
      // Sheet faces left by default.
      ctx.drawImage(
        img,
        CAMP_NPC_COL * cellW,
        row * cellH,
        cellW,
        cellH,
        0,
        0,
        size,
        size
      );
    }
  }

  function drawGroveNpcFrame(frameIndex) {
    if (!companion2El || !groveFemaleImage || !shouldShowGroveNpc()) {
      return;
    }
    const img = groveFemaleImage;
    const cellW = Math.floor(img.naturalWidth / 12);
    const cellH = Math.floor(img.naturalHeight / 14);
    const row = GROVE_NPC_ROWS[frameIndex % GROVE_NPC_ROWS.length];
    const dpr = window.devicePixelRatio || 1;
    const size = SPRITE_DISPLAY;
    companion2El.width = Math.round(size * dpr);
    companion2El.height = Math.round(size * dpr);
    companion2El.style.width = `${size}px`;
    companion2El.style.height = `${size}px`;
    const ctx = companion2El.getContext('2d');
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.imageSmoothingEnabled = false;
    ctx.clearRect(0, 0, size, size);
    if (npcFaceRight) {
      ctx.save();
      ctx.translate(size, 0);
      ctx.scale(-1, 1);
      ctx.drawImage(
        img,
        GROVE_NPC_COL * cellW,
        row * cellH,
        cellW,
        cellH,
        0,
        0,
        size,
        size
      );
      ctx.restore();
    } else {
      // Sheet faces left by default.
      ctx.drawImage(
        img,
        GROVE_NPC_COL * cellW,
        row * cellH,
        cellW,
        cellH,
        0,
        0,
        size,
        size
      );
    }
  }

  function drawCompanionWalkFrame(slot, frameIndex) {
    const el = slot && slot.el;
    const image =
      slot && slot.sheet === 'female'
        ? (findCharacter('female-0') || {}).sheetImage
        : campNpcImage;
    if (
      !el ||
      !image ||
      !latestState ||
      companionCountFromState(latestState) < slot.minParty
    ) {
      return;
    }
    const img = image;
    const cols = slot.sheet === 'female' ? 12 : 11;
    const rows = 14;
    const cellW = Math.floor(img.naturalWidth / cols);
    const cellH = Math.floor(img.naturalHeight / rows);
    const row = WALK_ROW_START + (frameIndex % WALK_FRAME_COUNT);
    const dpr = window.devicePixelRatio || 1;
    const size = SPRITE_DISPLAY;
    el.width = Math.round(size * dpr);
    el.height = Math.round(size * dpr);
    el.style.width = `${size}px`;
    el.style.height = `${size}px`;
    const ctx = el.getContext('2d');
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.imageSmoothingEnabled = false;
    ctx.clearRect(0, 0, size, size);
    // Mirror so the companion faces right (same as the player).
    ctx.save();
    ctx.translate(size, 0);
    ctx.scale(-1, 1);
    ctx.drawImage(
      img,
      slot.col * cellW,
      row * cellH,
      cellW,
      cellH,
      0,
      0,
      size,
      size
    );
    ctx.restore();
  }

  function drawActiveCompanionWalkFrames(frameIndex) {
    COMPANION_SLOTS.forEach((slot) => drawCompanionWalkFrame(slot, frameIndex));
  }

  function positionCompanionsBehindPet() {
    if (!petEl) {
      return;
    }
    const petLeft = petEl.offsetLeft;
    COMPANION_SLOTS.forEach((slot, index) => {
      const el = slot.el;
      if (!el) {
        return;
      }
      const active = latestState && (latestState.partySize || 1) >= slot.minParty;
      if (!active) {
        el.hidden = true;
        return;
      }
      const left = Math.max(-20, petLeft - (index + 1) * COMPANION_FOLLOW_GAP);
      el.hidden = false;
      el.style.left = `${left}px`;
      el.style.bottom = '0';
    });
  }

  function stopCampNpcAnim() {
    if (campNpcAnimId !== null) {
      cancelAnimationFrame(campNpcAnimId);
      campNpcAnimId = null;
    }
    campNpcLastTs = 0;
  }

  function startCampNpcAnim() {
    if (campNpcAnimId !== null || (!campNpcImage && !campChars1Image)) {
      return;
    }
    if (!campActive && !companionJoined) {
      return;
    }
    const tick = (timestamp) => {
      if (!campActive && !companionJoined) {
        campNpcAnimId = null;
        return;
      }
      if (campNpcLastTs > 0) {
        const frameDuration = 1000 / CAMP_NPC_FPS;
        while (timestamp - campNpcLastTs >= frameDuration) {
          campNpcFrame = (campNpcFrame + 1) % CAMP_NPC_ROWS.length;
          campNpcLastTs += frameDuration;
        }
      } else {
        campNpcLastTs = timestamp;
      }
      if (campActive && landmarkKind === 'camp' && !companionJoined) {
        drawCampNpcFrame(campNpcFrame);
        positionCampNpc();
      }
      if (shouldShowGroveNpc()) {
        drawGroveNpcFrame(campNpcFrame);
        positionGroveNpc();
      }
      if (campActive && landmarkKind === 'camp') {
        positionAllCampExtras(campNpcFrame);
      }
      campNpcAnimId = requestAnimationFrame(tick);
    };
    campNpcAnimId = requestAnimationFrame(tick);
  }

  async function prepareCampNpc() {
    const maleSrc = appEl.getAttribute('data-male-sheet') || appEl.dataset.maleSheet;
    const chars1Src = appEl.getAttribute('data-chars1-sheet') || appEl.dataset.chars1Sheet;
    CAMP_EXTRAS[0].el = campDogEl;
    CAMP_EXTRAS[1].el = campKnightSitEl;
    CAMP_EXTRAS[2].el = campKnightLuteEl;
    if (maleSrc) {
      campNpcImage = await loadImage(maleSrc);
    }
    if (chars1Src) {
      const raw = await loadImage(chars1Src);
      try {
        campChars1Image = makeBlackTransparent(raw);
      } catch (error) {
        console.warn('[travelling-kingdom] chars1 transparency failed, using raw sheet', error);
        campChars1Image = raw;
      }
    }
    if (campActive) {
      startCampNpcAnim();
      positionAllCampExtras(campNpcFrame);
    }
  }

  async function prepareGroveArt() {
    const appleSrc = appEl.getAttribute('data-apple-tree') || appEl.dataset.appleTree;
    const willowSrc = appEl.getAttribute('data-willow-tree') || appEl.dataset.willowTree;
    const femaleSrc = appEl.getAttribute('data-female-sheet') || appEl.dataset.femaleSheet;
    if (appleSrc) {
      groveAppleImg = makeBlackTransparent(await loadImage(appleSrc));
    }
    if (willowSrc) {
      groveWillowImg = makeBlackTransparent(await loadImage(willowSrc));
    }
    if (femaleSrc) {
      groveFemaleImage = await loadImage(femaleSrc);
    }
    if (campActive) {
      startCampNpcAnim();
      paintDecor();
    }
  }

  function onArrivedAtDestination() {
    travelEnabled = false;
    stopGroundScroll();
    stopWalkAnimation();
    // Lock camp under the pet in world space (scrolls away after Continue).
    campPotWorldX = decorScroll + getPetScreenX();
    campWorldLocked = true;
    campActive = true;
    landmarkKind = landmarkKindForState(latestState);
    startCampNpcAnim();
    positionDepartButton();
    paintDecor();
    updateMetersUi(latestState);
  }

  function clearCamp() {
    // Never tear down mid meet-and-greet — that aborted recruitment before.
    if (recruitBusy) {
      return;
    }
    campActive = false;
    landmarkKind = null;
    campWorldLocked = false;
    stopCampNpcAnim();
    hideAllCampExtras();
    if (campNpcEl && !companionJoined) {
      campNpcEl.hidden = true;
    }
    if (companion2El && (!latestState || companionCountFromState(latestState) < 3)) {
      companion2El.hidden = true;
    }
    if (departBtnEl) {
      departBtnEl.hidden = true;
    }
  }

  function resumeAfterDepart(state, options) {
    const keepDeparting = Boolean(options && options.keepDeparting);
    if (!keepDeparting) {
      departing = false;
    }
    if (departBtnEl) {
      departBtnEl.disabled = false;
      departBtnEl.hidden = true;
    }
    latestState = state;
    traveledPx = 0;
    if (campActive) {
      campWorldLocked = true;
    }
    // Already-recruited (reload): skip ceremony. Fresh landmark depart runs startRecruitCeremony.
    if (!recruitBusy) {
      syncCompanionFromState(state);
    }
    if (!recruitBusy && state.characterId && (activeScreen || state.screen) === 'home') {
      enableTravelAccrual();
      startWalkAnimation(state.characterId);
      startGroundScroll();
      startCameraEase();
    }
    syncCampWorldPosition();
    updateMetersUi(state);
    paintDecor();
  }

  function stopRecruitAnim() {
    if (recruitAnimId !== null) {
      cancelAnimationFrame(recruitAnimId);
      recruitAnimId = null;
    }
  }

  function getRecruitScreenLeft() {
    const u = campUnit();
    const npcOffset = landmarkKind === 'grove' ? GROVE_NPC_OX : 0.85;
    return Math.round(campPotWorldX + npcOffset * u - decorScroll);
  }

  /** Recruit is in their future follow slot behind the existing party trail. */
  function recruitAtFollowSlot(recruitSlotIndex) {
    const petLeft = petEl ? petEl.offsetLeft : petLeadLeft;
    return (
      getRecruitScreenLeft() <=
      petLeft - (recruitSlotIndex + 1) * COMPANION_FOLLOW_GAP + 0.5
    );
  }

  function positionRecruitNpc() {
    if (landmarkKind === 'grove') {
      positionGroveNpc();
    } else {
      positionCampNpc();
    }
  }

  function drawRecruitNpcFrame(frameIndex) {
    if (landmarkKind === 'grove') {
      drawGroveNpcFrame(frameIndex);
    } else {
      drawCampNpcFrame(frameIndex);
    }
  }

  function startRecruitCeremony(joinedState, options) {
    const joinPartySize = (options && options.joinPartySize) || 2;
    const recruitSlotIndex = joinPartySize - 2;
    recruitBusy = true;
    recruitPhase = 'approach';
    recruitJoinedState = joinedState;
    companionJoined = false;
    npcFaceRight = false;
    petFaceRight = true;
    if (departBtnEl) {
      departBtnEl.hidden = true;
      departBtnEl.disabled = true;
    }
    // Traveler stays world-locked at the pot; world scrolls until they meet.
    campWorldLocked = true;
    campActive = true;
    startCampNpcAnim();

    const characterId =
      joinedState.characterId || (latestState && latestState.characterId);
    const character = findCharacter(characterId);
    let phaseUntil = 0;

    const beginFaceCeremony = (timestamp) => {
      stopGroundScroll();
      stopWalkAnimation();
      travelEnabled = false;
      recruitPhase = 'petFace';
      petFaceRight = false;
      if (character && character.sheetImage) {
        drawWalkFrame(character, 0, false);
      }
      positionRecruitNpc();
      phaseUntil = timestamp + RECRUIT_FACE_MS;
    };

    // Already past the meet point (landmark under pet can put recruit nearly behind).
    if (recruitAtFollowSlot(recruitSlotIndex)) {
      beginFaceCeremony(performance.now());
    } else {
      enableTravelAccrual();
      if (characterId) {
        startWalkAnimation(characterId);
      }
      startGroundScroll();
    }

    const tick = (timestamp) => {
      if (!recruitBusy) {
        recruitAnimId = null;
        return;
      }

      if (recruitPhase === 'approach') {
        petFaceRight = true;
        positionRecruitNpc();
        if (recruitAtFollowSlot(recruitSlotIndex)) {
          beginFaceCeremony(timestamp);
        }
      } else if (recruitPhase === 'petFace') {
        positionRecruitNpc();
        if (timestamp >= phaseUntil) {
          recruitPhase = 'npcFace';
          npcFaceRight = true;
          drawRecruitNpcFrame(campNpcFrame);
          positionRecruitNpc();
          phaseUntil = timestamp + RECRUIT_FACE_MS;
        }
      } else if (recruitPhase === 'npcFace') {
        drawRecruitNpcFrame(campNpcFrame);
        positionRecruitNpc();
        if (timestamp >= phaseUntil) {
          recruitPhase = 'petResume';
          petFaceRight = true;
          if (character && character.sheetImage) {
            drawWalkFrame(character, 0, true);
          }
          phaseUntil = timestamp + 80;
        }
      } else if (recruitPhase === 'petResume') {
        if (timestamp >= phaseUntil) {
          finishRecruitCeremony(joinPartySize);
          return;
        }
      }

      paintDecor();
      recruitAnimId = requestAnimationFrame(tick);
    };

    recruitAnimId = requestAnimationFrame(tick);
  }

  function finishRecruitCeremony(joinPartySize) {
    stopRecruitAnim();
    const joined = recruitJoinedState || latestState;
    recruitJoinedState = null;
    recruitPhase = null;
    recruitBusy = false;
    npcFaceRight = false;
    petFaceRight = true;
    companionJoined = true;
    if (joined) {
      latestState = {
        ...joined,
        partySize: Math.max(joined.partySize || 1, joinPartySize || 2),
        awaitingDeparture: false,
        screen: activeScreen || joined.screen || 'home',
      };
    } else if (latestState) {
      latestState = {
        ...latestState,
        partySize: Math.max(latestState.partySize || 1, joinPartySize || 2),
        awaitingDeparture: false,
      };
    }
    departing = false;
    updateMetersUi(latestState);
    // Companions own their walking canvases now — keep landmark scenery, not idle recruits.
    positionCompanionsBehindPet();
    drawActiveCompanionWalkFrames(0);

    const character = findCharacter(latestState && latestState.characterId);
    if (character && character.sheetImage) {
      drawWalkFrame(character, 0, true);
    }

    // Join + resume travel immediately; ease camera framing in parallel while scrolling
    // so the lead shift reads as a camera pan, not sliding on a frozen plate.
    setCameraTargetForParty(latestState.partySize || joinPartySize || 2);
    syncCampWorldPosition();
    paintDecor();
    positionCompanionsBehindPet();

    if (latestState && latestState.characterId && (activeScreen || 'home') === 'home') {
      enableTravelAccrual();
      startWalkAnimation(latestState.characterId);
      startGroundScroll();
    }
    startCameraEase();
  }

  function logicalIndexFromTrack(index) {
    const n = CHARACTERS.length;
    if (index === 0) {
      return n - 1;
    }
    if (index === n + 1) {
      return 0;
    }
    return index - 1;
  }

  function currentCharacter() {
    return CHARACTERS[logicalIndexFromTrack(trackIndex)];
  }

  function displayName(state) {
    const character = findCharacter(state.characterId);
    const title = character ? character.title : 'Queen';
    return `${title} ${state.name}`;
  }

  function loadImage(src) {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.onload = () => resolve(img);
      img.onerror = () => reject(new Error('Failed to load ' + src));
      img.src = src;
    });
  }

  function makeBlackTransparent(img) {
    const canvas = document.createElement('canvas');
    canvas.width = img.naturalWidth || img.width;
    canvas.height = img.naturalHeight || img.height;
    const ctx = canvas.getContext('2d');
    ctx.drawImage(img, 0, 0);
    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const data = imageData.data;
    for (let i = 0; i < data.length; i += 4) {
      if (data[i] <= 8 && data[i + 1] <= 8 && data[i + 2] <= 8) {
        data[i + 3] = 0;
      }
    }
    ctx.putImageData(imageData, 0, 0);
    return canvas;
  }

  function pickDecorDef() {
    let total = 0;
    DECOR_DEFS.forEach((d) => {
      total += d.weight;
    });
    let roll = Math.random() * total;
    for (let i = 0; i < DECOR_DEFS.length; i++) {
      roll -= DECOR_DEFS[i].weight;
      if (roll <= 0) {
        return DECOR_DEFS[i];
      }
    }
    return DECOR_DEFS[0];
  }

  function decorPixelSize(def) {
    return {
      w: def.w * decorCell * DECOR_SCALE,
      h: def.h * decorCell * DECOR_SCALE,
    };
  }

  function resetDecorField() {
    decorItems = [];
    decorScroll = 0;
    decorNextSpawnX = 24;
  }

  function spawnDecorAhead(viewWidth) {
    if (!decorImg) {
      return;
    }
    const ahead = decorScroll + viewWidth + 160;
    while (decorNextSpawnX < ahead) {
      // Empty gaps so the roadside is not packed solid.
      if (Math.random() < 0.42) {
        decorNextSpawnX += 18 + Math.random() * 56;
        continue;
      }
      const def = pickDecorDef();
      const size = decorPixelSize(def);
      decorItems.push({ def, x: decorNextSpawnX });
      decorNextSpawnX += size.w + 10 + Math.random() * 48;
    }
  }

  function updateDecorScroll(deltaPx, viewWidth) {
    if (!decorImg || deltaPx <= 0) {
      return;
    }
    decorScroll += deltaPx;
    const minX = decorScroll - 120;
    decorItems = decorItems.filter((item) => {
      const size = decorPixelSize(item.def);
      return item.x + size.w > minX;
    });
    spawnDecorAhead(viewWidth);
  }

  function paintDecor() {
    if (
      !worldDecorEl ||
      !decorImg ||
      appEl.classList.contains('selecting-character') ||
      appEl.classList.contains('ui-panel-mode')
    ) {
      return;
    }

    const width = Math.max(1, Math.round(appEl.clientWidth));
    const maxH = Math.max(2, 4) * decorCell * DECOR_SCALE;
    const height = maxH;
    const dpr = window.devicePixelRatio || 1;

    worldDecorEl.width = Math.round(width * dpr);
    worldDecorEl.height = Math.round(height * dpr);
    worldDecorEl.style.width = `${width}px`;
    worldDecorEl.style.height = `${height}px`;

    const ctx = worldDecorEl.getContext('2d');
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.imageSmoothingEnabled = false;
    ctx.clearRect(0, 0, width, height);

    syncCampWorldPosition();
    spawnDecorAhead(width);

    const band = campActive ? campBand() : null;
    decorItems.forEach((item) => {
      const def = item.def;
      const size = decorPixelSize(def);
      if (band) {
        const itemLeft = item.x;
        const itemRight = item.x + size.w;
        if (itemRight > band.left && itemLeft < band.right) {
          return;
        }
      }
      const dx = Math.round(item.x - decorScroll);
      if (dx + size.w < 0 || dx > width) {
        return;
      }
      const dy = height - size.h;
      const sx = def.col * decorCell;
      const sy = def.row * decorCell;
      const sw = def.w * decorCell;
      const sh = def.h * decorCell;
      ctx.drawImage(decorImg, sx, sy, sw, sh, dx, dy, size.w, size.h);
    });

    paintCampLayer(width, height, dpr);
    positionCampNpc();
    positionGroveNpc();
    positionDepartButton();
  }

  function paintCampLayer(width, height, dpr) {
    if (!campDecorEl || !decorImg) {
      return;
    }
    campDecorEl.width = Math.round(width * dpr);
    campDecorEl.height = Math.round(height * dpr);
    campDecorEl.style.width = `${width}px`;
    campDecorEl.style.height = `${height}px`;
    const ctx = campDecorEl.getContext('2d');
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.imageSmoothingEnabled = false;
    ctx.clearRect(0, 0, width, height);
    if (campActive) {
      paintCamp(ctx, height);
      paintGrove(ctx, height);
    }
  }

  async function prepareDecor() {
    const src = appEl.getAttribute('data-decor') || appEl.dataset.decor;
    if (!src) {
      throw new Error('Missing data-decor');
    }
    const raw = await loadImage(src);
    decorCell = Math.max(1, Math.floor(raw.naturalWidth / DECOR_COLS));
    try {
      decorImg = makeBlackTransparent(raw);
    } catch (error) {
      console.warn('[travelling-kingdom] decor transparency failed, using raw sheet', error);
      decorImg = raw;
    }
    resetDecorField();
    const width = Math.max(1, Math.round(appEl.clientWidth));
    spawnDecorAhead(width);
    // Seed a few pieces already on screen so decor is visible immediately.
    for (let i = 0; i < 6; i++) {
      const def = pickDecorDef();
      const size = decorPixelSize(def);
      const x = 12 + Math.random() * Math.max(40, width - size.w - 24);
      decorItems.push({ def, x: decorScroll + x });
    }
    paintDecor();
  }

  async function extractTransparentPortrait(character) {
    const img = await loadImage(character.sheet);
    character.sheetImage = img;
    const cellW = Math.floor(img.naturalWidth / character.cols);
    const cellH = Math.floor(img.naturalHeight / character.rows);
    const canvas = document.createElement('canvas');
    canvas.width = cellW;
    canvas.height = cellH;
    const ctx = canvas.getContext('2d');
    ctx.drawImage(
      img,
      character.col * cellW,
      character.row * cellH,
      cellW,
      cellH,
      0,
      0,
      cellW,
      cellH
    );

    const imageData = ctx.getImageData(0, 0, cellW, cellH);
    const data = imageData.data;
    for (let i = 0; i < data.length; i += 4) {
      if (data[i] <= 16 && data[i + 1] <= 16 && data[i + 2] <= 16) {
        data[i + 3] = 0;
      }
    }
    ctx.putImageData(imageData, 0, 0);
    return canvas.toDataURL('image/png');
  }

  function applyPortraitStyle(el, portraitUrl) {
    el.style.backgroundImage = `url("${portraitUrl}")`;
    el.style.backgroundSize = 'contain';
    el.style.backgroundPosition = 'center';
    el.style.backgroundRepeat = 'no-repeat';
  }

  function buildCarouselTracks() {
    carouselTrackEl.innerHTML = '';
    titleTrackEl.innerHTML = '';

    const sequence = [
      CHARACTERS[CHARACTERS.length - 1],
      ...CHARACTERS,
      CHARACTERS[0],
    ];

    sequence.forEach((character) => {
      const portraitSlide = document.createElement('div');
      portraitSlide.className = 'portrait carousel-slide';
      portraitSlide.setAttribute('role', 'img');
      portraitSlide.setAttribute('aria-label', `${character.title} portrait`);
      if (character.portraitUrl) {
        applyPortraitStyle(portraitSlide, character.portraitUrl);
      }
      carouselTrackEl.appendChild(portraitSlide);

      const titleSlide = document.createElement('div');
      titleSlide.className = 'title-slide';
      titleSlide.textContent = character.title;
      titleTrackEl.appendChild(titleSlide);
    });
  }

  async function preparePortraits() {
    await Promise.all(
      CHARACTERS.map(async (character) => {
        character.portraitUrl = await extractTransparentPortrait(character);
      })
    );
    buildCarouselTracks();
    setTrackPosition(trackIndex, false);
    updateNamePlaceholder();
  }

  function findCharacter(characterId) {
    return CHARACTERS.find((c) => c.id === characterId);
  }

  /**
   * Build dest segments for an axis: copy MID-sized tiles, stretch only the last
   * leftover so the strip fills exactly without gaps.
   */
  function buildTileSpans(innerLength, mid) {
    const spans = [];
    if (innerLength <= 0) {
      return spans;
    }
    let offset = 0;
    while (offset < innerLength) {
      const remaining = innerLength - offset;
      const size = remaining >= mid ? mid : remaining;
      spans.push({ destOffset: offset, destSize: size, stretch: size !== mid });
      offset += size;
    }
    return spans;
  }

  function drawFramePatch(ctx, img, sx, sy, sw, sh, dx, dy, dw, dh) {
    ctx.drawImage(img, sx, sy, sw, sh, dx, dy, dw, dh);
  }

  function paintFrameOn(hostEl, canvasEl) {
    if (!hostEl || !canvasEl) {
      return;
    }
    if (minimalUi || !royalFrameImg) {
      const width = Math.max(1, Math.round(hostEl.clientWidth));
      const height = Math.max(1, Math.round(hostEl.clientHeight));
      const dpr = window.devicePixelRatio || 1;
      canvasEl.width = Math.round(width * dpr);
      canvasEl.height = Math.round(height * dpr);
      canvasEl.style.width = `${width}px`;
      canvasEl.style.height = `${height}px`;
      const ctx = canvasEl.getContext('2d');
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.clearRect(0, 0, width, height);
      return;
    }

    const width = Math.max(1, Math.round(hostEl.clientWidth));
    const height = Math.max(1, Math.round(hostEl.clientHeight));
    const dpr = window.devicePixelRatio || 1;

    canvasEl.width = Math.round(width * dpr);
    canvasEl.height = Math.round(height * dpr);
    canvasEl.style.width = `${width}px`;
    canvasEl.style.height = `${height}px`;

    const ctx = canvasEl.getContext('2d');
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.imageSmoothingEnabled = false;
    ctx.clearRect(0, 0, width, height);

    const c = FRAME_CORNER;
    const m = FRAME_MID;
    const innerW = Math.max(0, width - c * 2);
    const innerH = Math.max(0, height - c * 2);
    const xSpans = buildTileSpans(innerW, m);
    const ySpans = buildTileSpans(innerH, m);

    drawFramePatch(ctx, royalFrameImg, 0, 0, c, c, 0, 0, c, c);
    drawFramePatch(ctx, royalFrameImg, c + m, 0, c, c, width - c, 0, c, c);
    drawFramePatch(ctx, royalFrameImg, 0, c + m, c, c, 0, height - c, c, c);
    drawFramePatch(ctx, royalFrameImg, c + m, c + m, c, c, width - c, height - c, c, c);

    xSpans.forEach((span) => {
      const dx = c + span.destOffset;
      drawFramePatch(ctx, royalFrameImg, c, 0, m, c, dx, 0, span.destSize, c);
      drawFramePatch(ctx, royalFrameImg, c, c + m, m, c, dx, height - c, span.destSize, c);
    });

    ySpans.forEach((span) => {
      const dy = c + span.destOffset;
      drawFramePatch(ctx, royalFrameImg, 0, c, c, m, 0, dy, c, span.destSize);
      drawFramePatch(ctx, royalFrameImg, c + m, c, c, m, width - c, dy, c, span.destSize);
    });

    ySpans.forEach((ySpan) => {
      xSpans.forEach((xSpan) => {
        drawFramePatch(
          ctx,
          royalFrameImg,
          c,
          c,
          m,
          m,
          c + xSpan.destOffset,
          c + ySpan.destOffset,
          xSpan.destSize,
          ySpan.destSize
        );
      });
    });
  }

  function paintRoyalFrame() {
    paintFrameOn(introFrameEl, introFrameBgEl);
  }

  function paintUiFrame() {
    if (!uiFrameEl || uiFrameEl.hidden) {
      return;
    }
    paintFrameOn(uiFrameEl, uiFrameBgEl);
  }

  function paintChromeFrames() {
    paintFrameOn(statsEl, statsBgEl);
    paintFrameOn(bottomBarEl, bottomBarBgEl);
  }

  function paintXpBar(pct) {
    if (!xpBarEl) {
      return;
    }
    const host = xpBarEl.parentElement || statsEl;
    const width = Math.max(1, Math.round(host.clientWidth || appEl.clientWidth));
    const progress = Math.max(0, Math.min(100, typeof pct === 'number' ? pct : latestXpPct)) / 100;
    const dpr = window.devicePixelRatio || 1;

    if (minimalUi) {
      const height = 10;
      xpBarEl.width = Math.round(width * dpr);
      xpBarEl.height = Math.round(height * dpr);
      xpBarEl.style.width = `${width}px`;
      xpBarEl.style.height = `${height}px`;
      const ctx = xpBarEl.getContext('2d');
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.clearRect(0, 0, width, height);
      const track = cssColor('--vscode-progressBar-background', '#0e639c');
      const bg = cssColor('--vscode-editorWidget-background', '#252526');
      const border = cssColor('--vscode-widget-border', '#454545');
      ctx.fillStyle = bg;
      ctx.fillRect(0, 0, width, height);
      ctx.strokeStyle = border;
      ctx.strokeRect(0.5, 0.5, width - 1, height - 1);
      if (progress > 0) {
        ctx.fillStyle = track;
        ctx.fillRect(1, 1, Math.max(0, (width - 2) * progress), height - 2);
      }
      return;
    }

    const scale = width / XP_BAR_SRC_W;
    const height = Math.max(1, Math.round(XP_BAR_SRC_H * scale));

    xpBarEl.width = Math.round(width * dpr);
    xpBarEl.height = Math.round(height * dpr);
    xpBarEl.style.width = `${width}px`;
    xpBarEl.style.height = `${height}px`;

    const ctx = xpBarEl.getContext('2d');
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.imageSmoothingEnabled = false;
    ctx.clearRect(0, 0, width, height);

    if (!uiBarImg) {
      return;
    }

    const ox = XP_BAR_OX;
    const oy = XP_BAR_OY;
    const srcW = XP_BAR_SRC_W;
    const srcH = XP_BAR_SRC_H;
    const cap = XP_BAR_CAP;
    const midSrc = Math.max(1, srcW - cap * 2);
    const capDest = Math.max(1, Math.round(cap * scale));
    const midDest = Math.max(0, width - capDest * 2);

    // Frame first (trough is opaque), then green inside the trough.
    ctx.drawImage(uiBarImg, ox, oy, cap, srcH, 0, 0, capDest, height);
    ctx.drawImage(uiBarImg, ox + srcW - cap, oy, cap, srcH, width - capDest, 0, capDest, height);
    if (midDest > 0) {
      ctx.drawImage(uiBarImg, ox + cap, oy, midSrc, srcH, capDest, 0, midDest, height);
    }

    // Fill maps to trough (48,21)–(143,26); X follows 3-slice mid.
    const fillX = capDest;
    const fillY = XP_BAR_FILL_Y * scale;
    const fillMaxW = midDest;
    const fillH = XP_BAR_FILL_H * scale;
    const fillW = fillMaxW * progress;
    if (fillW > 0) {
      const grad = ctx.createLinearGradient(0, fillY, 0, fillY + fillH);
      grad.addColorStop(0, XP_BAR_FILL_TOP);
      grad.addColorStop(1, XP_BAR_FILL_BOTTOM);
      ctx.fillStyle = grad;
      ctx.fillRect(fillX, fillY, fillW, fillH);

      // Angled white shine lines, clipped to the green fill only.
      ctx.save();
      ctx.beginPath();
      ctx.rect(fillX, fillY, fillW, fillH);
      ctx.clip();
      const angle = (35 * Math.PI) / 180;
      const cos = Math.cos(angle);
      const sin = Math.sin(angle);
      const spacing = Math.max(6, XP_SHINE_SPACING * scale);
      const lineLen = fillW + fillH + 24;
      const offset = ((xpShineOffset % spacing) + spacing) % spacing;
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.45)';
      ctx.lineWidth = Math.max(1, scale * 0.75);
      ctx.beginPath();
      for (let i = -2; i < Math.ceil((fillW + fillH) / spacing) + 3; i++) {
        const base = i * spacing + offset;
        const x0 = fillX + base;
        const y0 = fillY + fillH;
        ctx.moveTo(x0, y0);
        ctx.lineTo(x0 + cos * lineLen, y0 - sin * lineLen);
      }
      ctx.stroke();
      ctx.restore();
    }
  }

  async function prepareDestinations() {
    const src = appEl.getAttribute('data-destinations') || appEl.dataset.destinations;
    if (!src) {
      throw new Error('Missing data-destinations');
    }
    const response = await fetch(src);
    if (!response.ok) {
      throw new Error(`Failed to load destinations (${response.status})`);
    }
    const data = await response.json();
    destinations = Array.isArray(data.destinations) ? data.destinations : [];
    if (latestState) {
      updateMetersUi(latestState);
    }
  }

  async function prepareUiBar() {
    const src = appEl.getAttribute('data-ui-bar') || appEl.dataset.uiBar;
    if (!src) {
      throw new Error('Missing data-ui-bar');
    }
    uiBarImg = await loadImage(src);
    paintXpBar(latestXpPct);
  }

  async function prepareRoyalFrame() {
    royalFrameImg = await loadImage(appEl.dataset.royalFrame);
    paintRoyalFrame();
    paintUiFrame();
    paintChromeFrames();
    if (typeof ResizeObserver !== 'undefined') {
      frameResizeObserver = new ResizeObserver(() => {
        paintRoyalFrame();
        paintUiFrame();
        paintChromeFrames();
        paintXpBar(latestXpPct);
      });
      if (introFrameEl) {
        frameResizeObserver.observe(introFrameEl);
      }
      if (uiFrameEl) {
        frameResizeObserver.observe(uiFrameEl);
      }
      if (statsEl) {
        frameResizeObserver.observe(statsEl);
      }
      if (bottomBarEl) {
        frameResizeObserver.observe(bottomBarEl);
      }
    } else {
      window.addEventListener('resize', () => {
        paintRoyalFrame();
        paintUiFrame();
        paintChromeFrames();
        paintXpBar(latestXpPct);
      });
    }
  }

  function paintButtonSlice(canvasEl, hostEl) {
    if (!canvasEl || !hostEl) {
      return;
    }
    if (minimalUi || !royalButtonImg) {
      const width = Math.max(1, Math.round(hostEl.clientWidth));
      const height = Math.max(1, Math.round(hostEl.clientHeight));
      const dpr = window.devicePixelRatio || 1;
      canvasEl.width = Math.round(width * dpr);
      canvasEl.height = Math.round(height * dpr);
      canvasEl.style.width = `${width}px`;
      canvasEl.style.height = `${height}px`;
      const ctx = canvasEl.getContext('2d');
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.clearRect(0, 0, width, height);
      return;
    }

    const width = Math.max(1, Math.round(hostEl.clientWidth));
    const height = Math.max(1, Math.round(hostEl.clientHeight));
    const dpr = window.devicePixelRatio || 1;
    const srcH = royalButtonImg.naturalHeight;
    const scale = height / srcH;
    const capDest = Math.max(1, Math.round(BUTTON_CAP * scale));
    const midDest = Math.max(1, Math.round(BUTTON_MID * scale));

    canvasEl.width = Math.round(width * dpr);
    canvasEl.height = Math.round(height * dpr);
    canvasEl.style.width = `${width}px`;
    canvasEl.style.height = `${height}px`;

    const ctx = canvasEl.getContext('2d');
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.imageSmoothingEnabled = false;
    ctx.clearRect(0, 0, width, height);

    const innerW = Math.max(0, width - capDest * 2);
    const xSpans = buildTileSpans(innerW, midDest);

    drawFramePatch(ctx, royalButtonImg, 0, 0, BUTTON_CAP, srcH, 0, 0, capDest, height);
    drawFramePatch(
      ctx,
      royalButtonImg,
      BUTTON_CAP + BUTTON_MID,
      0,
      BUTTON_CAP,
      srcH,
      width - capDest,
      0,
      capDest,
      height
    );

    xSpans.forEach((span) => {
      drawFramePatch(
        ctx,
        royalButtonImg,
        BUTTON_CAP,
        0,
        BUTTON_MID,
        srcH,
        capDest + span.destOffset,
        0,
        span.destSize,
        height
      );
    });
  }

  function paintRoyalButton() {
    paintButtonSlice(confirmBtnBgEl, charConfirmEl);
  }

  function paintNavButtons() {
    navButtons.forEach((btn) => {
      const canvas = btn.querySelector('.nav-btn-bg');
      paintButtonSlice(canvas, btn);
    });
  }

  function paintAllButtons() {
    paintRoyalButton();
    paintNavButtons();
  }

  async function prepareRoyalButton() {
    royalButtonImg = await loadImage(appEl.dataset.royalButton);
    paintAllButtons();
    if (typeof ResizeObserver !== 'undefined') {
      buttonResizeObserver = new ResizeObserver(() => {
        paintAllButtons();
      });
      if (charConfirmEl) {
        buttonResizeObserver.observe(charConfirmEl);
      }
      if (bottomBarEl) {
        buttonResizeObserver.observe(bottomBarEl);
      }
      navButtons.forEach((btn) => buttonResizeObserver.observe(btn));
    } else {
      window.addEventListener('resize', paintAllButtons);
    }
  }

  function getGroundVisibleHeight() {
    if (!floorTilesImg) {
      return Math.round(32 * FLOOR_DISPLAY_SCALE * FLOOR_VISIBLE_RATIO);
    }
    const cellW = Math.floor(floorTilesImg.naturalWidth / FLOOR_COLS);
    return Math.max(1, Math.round(cellW * FLOOR_DISPLAY_SCALE * FLOOR_VISIBLE_RATIO));
  }

  function getSkySize() {
    const host = gameWorldEl || appEl;
    const width = Math.max(1, Math.round(host.clientWidth || appEl.clientWidth));
    const worldH = Math.max(1, Math.round(host.clientHeight || appEl.clientHeight));
    return { width, worldH };
  }

  function cloudTargetCount(skyH, skyW) {
    const hScale = skyH / CLOUD_BASE_SKY_H;
    // Width adds clouds on wide panels but does not starve narrow ones.
    const wPart = CLOUD_WIDTH_BONUS * (skyW / CLOUD_BASE_SKY_W);
    const scaled = Math.round(CLOUD_BASE_COUNT * hScale + wPart);
    return Math.max(CLOUD_MIN_COUNT, Math.min(CLOUD_MAX_COUNT, scaled));
  }

  function randomCloudScale() {
    return (
      CLOUD_DISPLAY_SCALE *
      (CLOUD_SCALE_MIN + Math.random() * (CLOUD_SCALE_MAX - CLOUD_SCALE_MIN))
    );
  }

  function randomCloudSpeed() {
    const speed = CLOUD_SPEED_MIN + Math.random() * (CLOUD_SPEED_MAX - CLOUD_SPEED_MIN);
    return Math.random() < 0.5 ? -speed : speed;
  }

  function randomCloudFromHorizon(worldH, preferHigh) {
    const minFrom = CLOUD_MIN_FROM_HORIZON;
    const lowMax = Math.min(CLOUD_LOW_BAND, Math.max(minFrom + 40, worldH * 0.36));
    const maxFrom = Math.max(lowMax + 24, worldH - CLOUD_TOP_PAD);
    if (preferHigh) {
      const mid = minFrom + (maxFrom - minFrom) * 0.25;
      return mid + Math.random() * Math.max(1, maxFrom - mid);
    }
    if (Math.random() < 0.78) {
      return minFrom + Math.random() * Math.max(1, lowMax - minFrom);
    }
    return lowMax + Math.random() * Math.max(1, maxFrom - lowMax);
  }

  function pickCloudImage() {
    if (!cloudImages.length) {
      return null;
    }
    return cloudImages[Math.floor(Math.random() * cloudImages.length)];
  }

  function cloudDrawWidth(cloud) {
    const srcW = cloud.image.width || cloud.image.naturalWidth || 0;
    return srcW * cloud.scale;
  }

  function cloudOverlapsView(cloud, width) {
    const drawW = cloudDrawWidth(cloud);
    return cloud.x + drawW > 0 && cloud.x < width;
  }

  /** Place cloud so it enters from the side matching vx (just off-screen). */
  function placeCloudAtEntry(cloud, width) {
    const drawW = cloudDrawWidth(cloud);
    if (cloud.vx >= 0) {
      cloud.x = -drawW - Math.random() * 24;
    } else {
      cloud.x = width + Math.random() * 24;
    }
  }

  /** Keep stranded clouds from sitting invisible for seconds after a resize. */
  function rehomeOffscreenClouds(width, worldH) {
    clouds.forEach((cloud) => {
      const drawW = cloudDrawWidth(cloud);
      const fullyOff = cloud.x > width || cloud.x + drawW < 0;
      if (!fullyOff) {
        return;
      }
      placeCloudAtEntry(cloud, width);
      cloud.fromHorizon = randomCloudFromHorizon(worldH, false);
      cloud.scale = randomCloudScale();
      cloud.image = pickCloudImage() || cloud.image;
    });
  }

  function spawnCloud(width, worldH, preferEdge, fromHorizon) {
    const image = pickCloudImage();
    if (!image) {
      return null;
    }
    const scale = randomCloudScale();
    const srcW = image.width || image.naturalWidth || 0;
    const drawW = srcW * scale;
    const vx = randomCloudSpeed();
    let x;
    if (preferEdge === 'left') {
      x = -drawW - Math.random() * 24;
    } else if (preferEdge === 'right') {
      x = width + Math.random() * 24;
    } else {
      // Always overlap the viewport so narrow panels are never empty at spawn.
      const visibleSpan = Math.max(8, width - drawW * 0.35);
      x = -drawW * 0.25 + Math.random() * (visibleSpan + drawW * 0.5);
    }
    return {
      image,
      x,
      fromHorizon:
        typeof fromHorizon === 'number' ? fromHorizon : randomCloudFromHorizon(worldH, false),
      scale,
      vx,
    };
  }

  function syncCloudDensity() {
    if (!cloudsEnabled || !cloudImages.length || appEl.classList.contains('selecting-character')) {
      clouds = [];
      return;
    }
    const { width, worldH } = getSkySize();
    const base = cloudTargetCount(worldH, width);

    rehomeOffscreenClouds(width, worldH);

    if (clouds.length === 0) {
      const count = Math.min(CLOUD_MAX_COUNT, base + Math.floor(Math.random() * 2));
      while (clouds.length < count) {
        const cloud = spawnCloud(width, worldH, null);
        if (!cloud) {
          break;
        }
        clouds.push(cloud);
      }
      return;
    }

    while (clouds.length < base) {
      const cloud = spawnCloud(width, worldH, null, randomCloudFromHorizon(worldH, true));
      if (!cloud) {
        break;
      }
      clouds.push(cloud);
    }
    const maxKeep = Math.min(CLOUD_MAX_COUNT, Math.max(CLOUD_MIN_COUNT, base + 1));
    if (clouds.length > maxKeep) {
      // Prefer keeping clouds that are on-screen, then lower ones.
      clouds.sort((a, b) => {
        const aVis = cloudOverlapsView(a, width) ? 0 : 1;
        const bVis = cloudOverlapsView(b, width) ? 0 : 1;
        if (aVis !== bVis) {
          return aVis - bVis;
        }
        return a.fromHorizon - b.fromHorizon;
      });
      clouds.length = maxKeep;
    }
  }

  function updateClouds(dt) {
    if (!cloudsEnabled || !clouds.length) {
      return;
    }
    const { width, worldH } = getSkySize();
    clouds.forEach((cloud) => {
      const drawW = cloudDrawWidth(cloud);
      cloud.x += cloud.vx * dt;
      // Wrap whenever fully off-screen (any direction) so resize cannot strand them.
      if (cloud.x > width || cloud.x + drawW < 0) {
        placeCloudAtEntry(cloud, width);
        cloud.fromHorizon = randomCloudFromHorizon(worldH, false);
        cloud.scale = randomCloudScale();
        cloud.image = pickCloudImage() || cloud.image;
      }
    });
  }

  function paintClouds(ctx, width, worldH) {
    if (!cloudsEnabled || !clouds.length) {
      return;
    }
    clouds.forEach((cloud) => {
      const src = cloud.image;
      const srcW = src.width || src.naturalWidth;
      const srcH = src.height || src.naturalHeight;
      if (!srcW || !srcH) {
        return;
      }
      const drawW = srcW * cloud.scale;
      const drawH = srcH * cloud.scale;
      const drawY = worldH - cloud.fromHorizon;
      if (cloud.x + drawW < 0 || cloud.x > width || drawY + drawH < 0 || drawY > worldH) {
        return;
      }
      ctx.drawImage(src, 0, 0, srcW, srcH, cloud.x, drawY, drawW, drawH);
    });
  }

  function paintParallaxLayer(ctx, layer, width, horizonY) {
    const src = layer.image;
    const srcW = src.width || src.naturalWidth;
    const srcH = src.height || src.naturalHeight;
    if (!srcW || !srcH) {
      return;
    }

    const scale = PARALLAX_DISPLAY_SCALE;
    const tileW = srcW * scale;
    const tileH = srcH * scale;
    const visibleRatio = typeof layer.visibleRatio === 'number' ? layer.visibleRatio : 1;
    const srcVisibleH = Math.max(1, Math.floor(srcH * visibleRatio));
    const destVisibleH = tileH * visibleRatio;
    const destY = horizonY - destVisibleH;

    const wrapped = layer.speed === 0 ? 0 : ((layer.offset % tileW) + tileW) % tileW;
    let dx = -wrapped;
    while (dx < width) {
      ctx.drawImage(src, 0, 0, srcW, srcVisibleH, dx, destY, tileW, destVisibleH);
      dx += tileW;
    }
  }

  async function prepareClouds() {
    if (cloudImages.length) {
      syncCloudDensity();
      return;
    }
    const loaded = [];
    for (let n = 1; n <= 10; n++) {
      const src =
        appEl.getAttribute(`data-cloud${n}`) ||
        appEl.dataset[`cloud${n}`];
      if (!src) {
        console.error(`[travelling-kingdom] missing data-cloud${n}`);
        continue;
      }
      try {
        loaded.push(await loadImage(src));
      } catch (error) {
        console.error(`[travelling-kingdom] failed to load Cloud${n}`, error);
      }
    }
    cloudImages = loaded;
    clouds = [];
    syncCloudDensity();
  }

  function applyCloudsPreference(enabled) {
    const next = Boolean(enabled);
    if (cloudsEnabledEl) {
      cloudsEnabledEl.checked = next;
    }
    if (cloudsEnabled === next) {
      if (!next) {
        clouds = [];
      }
      return;
    }
    cloudsEnabled = next;
    if (!cloudsEnabled) {
      clouds = [];
      paintParallax();
      return;
    }
    const run = prepareClouds()
      .then(() => {
        paintParallax();
      })
      .catch((error) => {
        console.error('[travelling-kingdom] clouds prep failed', error);
      });
    cloudsPrepPromise = run;
  }

  function paintParallax() {
    if (!parallaxBgEl || appEl.classList.contains('selecting-character')) {
      return;
    }

    const host = gameWorldEl || appEl;
    const width = Math.max(1, Math.round(host.clientWidth || appEl.clientWidth));
    const worldH = Math.max(1, Math.round(host.clientHeight || appEl.clientHeight));
    const groundH = getGroundVisibleHeight();
    // Extend into the grass so layer 1 can sink under it (same idea as floor crop).
    const height = worldH + groundH;
    const horizonY = worldH;
    const dpr = window.devicePixelRatio || 1;

    parallaxBgEl.width = Math.round(width * dpr);
    parallaxBgEl.height = Math.round(height * dpr);
    parallaxBgEl.style.width = `${width}px`;
    parallaxBgEl.style.height = `${height}px`;

    const ctx = parallaxBgEl.getContext('2d');
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.imageSmoothingEnabled = false;
    ctx.clearRect(0, 0, width, height);

    if (minimalBg) {
      ctx.fillStyle = cssColor('--vscode-sideBar-background', '#1e1e1e');
      ctx.fillRect(0, 0, width, height);
      return;
    }

    ctx.fillStyle = SKY_FILL;
    ctx.fillRect(0, 0, width, worldH);

    if (!parallaxLayers.length) {
      paintClouds(ctx, width, worldH);
      return;
    }

    // Far scenery (layers 6,5) under clouds; nearer trees/ground layers over clouds.
    parallaxLayers.forEach((layer) => {
      if (layer.id >= CLOUD_AFTER_LAYER_ID) {
        paintParallaxLayer(ctx, layer, width, horizonY);
      }
    });
    paintClouds(ctx, width, worldH);
    parallaxLayers.forEach((layer) => {
      if (layer.id < CLOUD_AFTER_LAYER_ID) {
        paintParallaxLayer(ctx, layer, width, horizonY);
      }
    });
  }

  function paintGround() {
    if (!floorTilesImg || !groundStripEl || appEl.classList.contains('selecting-character')) {
      return;
    }

    const cellW = Math.floor(floorTilesImg.naturalWidth / FLOOR_COLS);
    const cellH = Math.floor(floorTilesImg.naturalHeight / FLOOR_ROWS);
    const sx = FLOOR_TILE_COL * cellW;
    const sy = FLOOR_TILE_ROW * cellH;
    const displayTile = cellW * FLOOR_DISPLAY_SCALE;
    const width = Math.max(1, Math.round(appEl.clientWidth));
    const visibleHeight = Math.max(1, Math.round(displayTile * FLOOR_VISIBLE_RATIO));
    const drawY = 0;
    const dpr = window.devicePixelRatio || 1;

    groundStripEl.width = Math.round(width * dpr);
    groundStripEl.height = Math.round(visibleHeight * dpr);
    groundStripEl.style.width = `${width}px`;
    groundStripEl.style.height = `${visibleHeight}px`;

    const ctx = groundStripEl.getContext('2d');
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.imageSmoothingEnabled = false;
    ctx.clearRect(0, 0, width, visibleHeight);

    const wrapped = ((groundOffset % displayTile) + displayTile) % displayTile;
    let dx = -wrapped;
    while (dx < width) {
      drawFramePatch(
        ctx,
        floorTilesImg,
        sx,
        sy,
        cellW,
        cellH,
        dx,
        drawY,
        displayTile,
        displayTile
      );
      dx += displayTile;
    }
  }

  function stopGroundScroll() {
    if (groundAnimId !== null) {
      cancelAnimationFrame(groundAnimId);
      groundAnimId = null;
    }
    lastGroundTs = 0;
    flushTravelMeters();
  }

  function startGroundScroll() {
    if (groundAnimId !== null || !floorTilesImg) {
      return;
    }
    if (latestState && latestState.awaitingDeparture) {
      return;
    }
    // Scroll during recruit approach; freeze for face ceremony.
    if (recruitBusy && recruitPhase !== 'approach') {
      return;
    }

    const tick = (timestamp) => {
      if (
        appEl.classList.contains('selecting-character') ||
        !floorTilesImg ||
        (recruitBusy && recruitPhase !== 'approach') ||
        (latestState && latestState.awaitingDeparture)
      ) {
        groundAnimId = null;
        lastGroundTs = 0;
        return;
      }

      if (lastGroundTs > 0) {
        const dt = Math.min(0.05, (timestamp - lastGroundTs) / 1000);
        const cellW = Math.floor(floorTilesImg.naturalWidth / FLOOR_COLS);
        const displayTile = cellW * FLOOR_DISPLAY_SCALE;
        const boosted = timestamp < tapBoostUntil;
        const speedScale = boosted ? FLOOR_SCROLL_SPEED_BOOST / FLOOR_SCROLL_SPEED : 1;
        const move = FLOOR_SCROLL_SPEED * speedScale * dt;
        groundOffset = (groundOffset + move) % displayTile;
        accrueTravelMeters(move, displayTile);
        if (!minimalBg) {
          parallaxLayers.forEach((layer) => {
            if (layer.speed > 0) {
              layer.offset = (layer.offset + layer.speed * speedScale * dt) % 100000;
            }
          });
          updateClouds(dt);
        }
        updateDecorScroll(move, Math.max(1, Math.round(appEl.clientWidth)));
        xpShineOffset = (xpShineOffset + XP_SHINE_SPEED * dt) % 100000;
      }
      lastGroundTs = timestamp;
      paintParallax();
      paintGround();
      paintDecor();
      paintXpBar(latestXpPct);
      groundAnimId = requestAnimationFrame(tick);
    };

    groundAnimId = requestAnimationFrame(tick);
  }

  async function prepareParallax() {
    const loaded = [];
    for (const def of PARALLAX_LAYERS) {
      const src =
        appEl.getAttribute(`data-bg${def.id}`) ||
        appEl.getAttribute(`data-bg-layer-${def.id}`) ||
        appEl.dataset[`bg${def.id}`] ||
        appEl.dataset[`bgLayer-${def.id}`];
      if (!src) {
        console.error(`[travelling-kingdom] missing data-bg${def.id}`);
        continue;
      }
      try {
        const image = await loadImage(src);
        loaded.push({
          id: def.id,
          speed: def.speed,
          offset: 0,
          visibleRatio: def.visibleRatio,
          image,
        });
      } catch (error) {
        console.error(`[travelling-kingdom] failed to load background layer ${def.id}`, error);
      }
    }
    parallaxLayers = loaded;
    paintParallax();
    if (!appEl.classList.contains('selecting-character')) {
      startGroundScroll();
    }
  }

  async function prepareGround() {
    floorTilesImg = await loadImage(appEl.dataset.floorTiles);
    if (!appEl.classList.contains('selecting-character')) {
      startGroundScroll();
    }
    if (typeof ResizeObserver !== 'undefined') {
      groundResizeObserver = new ResizeObserver(() => {
        syncCloudDensity();
        paintParallax();
        paintGround();
        paintDecor();
      });
      groundResizeObserver.observe(appEl);
      if (gameWorldEl) {
        groundResizeObserver.observe(gameWorldEl);
      }
    } else {
      window.addEventListener('resize', () => {
        syncCloudDensity();
        paintParallax();
        paintGround();
        paintDecor();
      });
    }
  }

  function setSelectingMode(isSelecting) {
    appEl.classList.toggle('selecting-character', isSelecting);
    statsEl.hidden = isSelecting;
    bottomBarEl.hidden = isSelecting;
    if (isSelecting) {
      stopGroundScroll();
      stopWalkAnimation();
      resetTravelAccrual();
      requestAnimationFrame(() => {
        paintRoyalFrame();
        paintAllButtons();
      });
    } else {
      resumeTravelMotion();
      requestAnimationFrame(() => {
        syncCloudDensity();
        paintChromeFrames();
        paintXpBar(latestXpPct);
        paintParallax();
        paintGround();
        paintDecor();
        paintNavButtons();
      });
    }
  }

  function resumeTravelMotion() {
    // During scroll-meet approach, keep world travel running; only freeze face/join beats.
    if (recruitBusy && recruitPhase === 'approach') {
      enableTravelAccrual();
      if (latestState && latestState.characterId) {
        startWalkAnimation(latestState.characterId);
      }
      startGroundScroll();
      syncCampWorldPosition();
      positionDepartButton();
      return;
    }
    if (recruitBusy || (latestState && latestState.awaitingDeparture)) {
      travelEnabled = false;
      stopGroundScroll();
      stopWalkAnimation();
      syncCampWorldPosition();
      if (shouldShowCamp(latestState) || campActive) {
        startCampNpcAnim();
      }
      positionDepartButton();
      return;
    }
    enableTravelAccrual();
    if (latestState && latestState.characterId) {
      startWalkAnimation(latestState.characterId);
    }
    startGroundScroll();
    // Ease camera in parallel with travel (never gate walk/scroll behind settle).
    if (Math.abs(petLeadLeft - petLeadLeftTarget) > 1) {
      startCameraEase();
    }
  }

  function setScreen(screenId) {
    // Manage / Shop are stubbed for now.
    if (screenId === 'feed' || screenId === 'shop') {
      screenId = 'home';
    }
    const selecting = screenId === 'character-select';
    const uiPanel = screenId === 'feed' || screenId === 'shop' || screenId === 'settings';
    if (!selecting) {
      activeScreen = screenId;
      if (latestState) {
        latestState = { ...latestState, screen: screenId };
      }
    }

    if (selectScreenEl) {
      selectScreenEl.classList.toggle('active', selecting);
    }
    if (gameWorldEl) {
      gameWorldEl.style.display = selecting ? 'none' : 'flex';
    }

    appEl.classList.toggle('ui-panel-mode', !selecting && uiPanel);
    if (uiFrameEl) {
      uiFrameEl.hidden = selecting || !uiPanel;
    }

    panels.forEach((panel) => {
      panel.classList.toggle('active', !selecting && panel.dataset.screen === screenId);
    });
    navButtons.forEach((btn) => {
      btn.classList.toggle('active', btn.dataset.screen === screenId);
    });

    if (selecting) {
      return;
    }

    if (uiPanel) {
      stopGroundScroll();
      stopWalkAnimation();
      requestAnimationFrame(() => {
        paintChromeFrames();
        paintXpBar(latestXpPct);
        paintUiFrame();
        paintAllButtons();
      });
    } else {
      resumeTravelMotion();
      requestAnimationFrame(() => {
        syncCloudDensity();
        paintChromeFrames();
        paintXpBar(latestXpPct);
        paintParallax();
        paintGround();
        paintDecor();
        paintNavButtons();
      });
    }
  }

  function setTrackPosition(index, animate) {
    const value = `translateX(-${index * 100}%)`;
    if (!animate) {
      carouselTrackEl.style.transition = 'none';
      titleTrackEl.style.transition = 'none';
    } else {
      carouselTrackEl.style.transition = '';
      titleTrackEl.style.transition = '';
    }
    carouselTrackEl.style.transform = value;
    titleTrackEl.style.transform = value;
    if (!animate) {
      // Force reflow so the next animated move works.
      void carouselTrackEl.offsetWidth;
      carouselTrackEl.style.transition = '';
      titleTrackEl.style.transition = '';
    }
  }

  function updateNamePlaceholder() {
    nameInputEl.placeholder = currentCharacter().defaultName;
  }

  function resolveSelectedName() {
    const typed = nameInputEl.value.trim();
    return typed || currentCharacter().defaultName;
  }

  function drawWalkFrame(character, frameIndex, faceRight) {
    if (!petSpriteEl || !character || !character.sheetImage) {
      return;
    }
    const face = faceRight !== false;

    const img = character.sheetImage;
    const cellW = Math.floor(img.naturalWidth / character.cols);
    const cellH = Math.floor(img.naturalHeight / character.rows);
    const row = WALK_ROW_START + (frameIndex % WALK_FRAME_COUNT);
    const dpr = window.devicePixelRatio || 1;
    const size = SPRITE_DISPLAY;

    petSpriteEl.width = Math.round(size * dpr);
    petSpriteEl.height = Math.round(size * dpr);
    petSpriteEl.style.width = `${size}px`;
    petSpriteEl.style.height = `${size}px`;

    const ctx = petSpriteEl.getContext('2d');
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.imageSmoothingEnabled = false;
    ctx.clearRect(0, 0, size, size);

    if (face) {
      ctx.save();
      ctx.translate(size, 0);
      ctx.scale(-1, 1);
      ctx.drawImage(
        img,
        character.col * cellW,
        row * cellH,
        cellW,
        cellH,
        0,
        0,
        size,
        size
      );
      ctx.restore();
    } else {
      ctx.drawImage(
        img,
        character.col * cellW,
        row * cellH,
        cellW,
        cellH,
        0,
        0,
        size,
        size
      );
    }
  }

  function stopWalkAnimation() {
    if (walkAnimId !== null) {
      cancelAnimationFrame(walkAnimId);
      walkAnimId = null;
    }
    lastWalkTs = 0;
    activeWalkCharacterId = null;
  }

  function startWalkAnimation(characterId) {
    const character = findCharacter(characterId);
    if (!character || !character.sheetImage) {
      return;
    }

    if (activeWalkCharacterId !== characterId) {
      walkFrame = 0;
      activeWalkCharacterId = characterId;
      drawWalkFrame(character, walkFrame);
      if (companionJoined) {
        drawActiveCompanionWalkFrames(walkFrame);
        positionCompanionsBehindPet();
      }
    }

    if (walkAnimId !== null) {
      return;
    }

    const tick = (timestamp) => {
      if (appEl.classList.contains('selecting-character') || !activeWalkCharacterId) {
        walkAnimId = null;
        lastWalkTs = 0;
        return;
      }

      const active = findCharacter(activeWalkCharacterId);
      if (!active || !active.sheetImage) {
        walkAnimId = null;
        return;
      }

      const boosted = timestamp < tapBoostUntil;
      const fps = boosted ? WALK_FPS_BOOST : WALK_FPS_NORMAL;
      const frameDuration = 1000 / fps;

      if (!lastWalkTs) {
        lastWalkTs = timestamp;
      }

      while (timestamp - lastWalkTs >= frameDuration) {
        walkFrame = (walkFrame + 1) % WALK_FRAME_COUNT;
        lastWalkTs += frameDuration;
      }

      drawWalkFrame(active, walkFrame);
      if (companionJoined) {
        drawActiveCompanionWalkFrames(walkFrame);
        positionCompanionsBehindPet();
      }
      walkAnimId = requestAnimationFrame(tick);
    };

    walkAnimId = requestAnimationFrame(tick);
  }

  function updateGameCopy(state) {
    const label = displayName(state);
    petNameEl.textContent = label;
    petEl.setAttribute('aria-label', label);

    feedStatusEl.textContent = `Give ${label} a snack (placeholder).`;
    if (shopStatusEl) {
      shopStatusEl.textContent = `The travelling merchant has not arrived yet.`;
    }
  }

  function renderState(state) {
    const wasAwaiting = Boolean(latestState && latestState.awaitingDeparture);
    state = mergeServerState(state);
    const needsSelect = !state.characterId;
    if (needsSelect) {
      screenHydrated = false;
    } else if (!screenHydrated) {
      activeScreen = state.screen || 'home';
      screenHydrated = true;
    } else if (activeScreen && activeScreen !== state.screen) {
      // Keep the screen the player already navigated to; host replies from travel /
      // settings toggles / petClick can still carry the previous screen for a beat.
      state = { ...state, screen: activeScreen };
    }
    latestState = state;
    syncCompanionFromState(state);
    if (resetBtnEl) {
      resetBtnEl.disabled = false;
      resetBtnEl.textContent = 'Reset progress';
    }
    setSelectingMode(needsSelect);

    if (needsSelect) {
      confirming = false;
      charConfirmEl.disabled = !portraitsReady;
      stopWalkAnimation();
      clearCamp();
      setScreen('character-select');
      setTrackPosition(trackIndex, false);
      updateNamePlaceholder();
      applyCloudsPreference(state.cloudsEnabled === true);
      applyDistanceUnit(state.distanceUnit);
      applyMinimalUi(state.minimalUi === true);
      applyMinimalBg(state.minimalBg === true);
      return;
    }

    confirming = false;
    charConfirmEl.disabled = !portraitsReady;

    applyDistanceUnit(state.distanceUnit);
    applyMinimalUi(state.minimalUi === true);
    applyMinimalBg(state.minimalBg === true);

    setScreen(activeScreen || state.screen || 'home');
    updateMetersUi(state);
    updateGameCopy(state);
    applyCloudsPreference(state.cloudsEnabled === true);

    if (state.awaitingDeparture && !departing && !recruitBusy) {
      travelEnabled = false;
      stopGroundScroll();
      stopWalkAnimation();
      syncCampWorldPosition();
      if (departBtnEl) {
        departBtnEl.disabled = false;
      }
      positionDepartButton();
      paintDecor();
    } else if ((wasAwaiting || departing) && !state.awaitingDeparture) {
      if (recruitBusy) {
        latestState = {
          ...state,
          partySize: latestState.partySize || 1,
          screen: activeScreen || state.screen,
        };
      } else {
        resumeAfterDepart(state);
      }
    } else {
      syncCampWorldPosition();
      positionDepartButton();
      paintDecor();
    }
  }

  function flashPetReact() {
    tapBoostUntil = performance.now() + TAP_BOOST_MS;
    walkBoostUntil = tapBoostUntil;
    petEl.classList.add('react');
    if (reactTimer) {
      clearTimeout(reactTimer);
    }
    reactTimer = setTimeout(() => {
      petEl.classList.remove('react');
    }, TAP_BOOST_MS);
  }

  function onTrackTransitionEnd(event) {
    if (event.target !== carouselTrackEl || event.propertyName !== 'transform') {
      return;
    }

    const n = CHARACTERS.length;
    if (trackIndex === 0) {
      trackIndex = n;
      setTrackPosition(trackIndex, false);
    } else if (trackIndex === n + 1) {
      trackIndex = 1;
      setTrackPosition(trackIndex, false);
    }

    animating = false;
    updateNamePlaceholder();
  }

  function moveCarousel(delta) {
    if (animating || !portraitsReady) {
      return;
    }
    animating = true;
    trackIndex += delta;
    setTrackPosition(trackIndex, true);
    // Placeholder can update for the destination logical character immediately.
    updateNamePlaceholder();
  }

  carouselTrackEl.addEventListener('transitionend', onTrackTransitionEnd);

  charPrevEl.addEventListener('click', () => {
    moveCarousel(-1);
  });

  charNextEl.addEventListener('click', () => {
    moveCarousel(1);
  });

  charConfirmEl.addEventListener('click', () => {
    if (confirming || !portraitsReady) {
      return;
    }
    confirming = true;
    charConfirmEl.disabled = true;

    const character = currentCharacter();
    const name = resolveSelectedName();
    const optimistic = {
      ...(latestState || {
        name,
        level: 1,
        meters: 0,
        mood: 'idle',
        lastActionAt: Date.now(),
        screen: 'home',
      }),
      characterId: character.id,
      name,
      screen: 'home',
    };
    renderState(optimistic);

    vscode.postMessage({
      type: 'action',
      action: 'chooseCharacter',
      characterId: character.id,
      name,
    });
  });

  resetBtnEl.addEventListener('click', () => {
    resetBtnEl.disabled = true;
    resetBtnEl.textContent = 'Resetting…';
    vscode.postMessage({ type: 'action', action: 'reset' });
  });

  if (cloudsEnabledEl) {
    cloudsEnabledEl.addEventListener('change', () => {
      const enabled = Boolean(cloudsEnabledEl.checked);
      applyCloudsPreference(enabled);
      vscode.postMessage({ type: 'action', action: 'setCloudsEnabled', enabled });
    });
  }

  function onDistanceUnitChange() {
    const unit = unitImperialEl && unitImperialEl.checked ? 'imperial' : 'metric';
    applyDistanceUnit(unit);
    vscode.postMessage({ type: 'action', action: 'setDistanceUnit', unit });
  }

  if (unitMetricEl) {
    unitMetricEl.addEventListener('change', onDistanceUnitChange);
  }
  if (unitImperialEl) {
    unitImperialEl.addEventListener('change', onDistanceUnitChange);
  }

  if (minimalUiEl) {
    minimalUiEl.addEventListener('change', () => {
      const enabled = Boolean(minimalUiEl.checked);
      applyMinimalUi(enabled);
      vscode.postMessage({ type: 'action', action: 'setMinimalUi', enabled });
    });
  }

  if (minimalBgEl) {
    minimalBgEl.addEventListener('change', () => {
      const enabled = Boolean(minimalBgEl.checked);
      applyMinimalBg(enabled);
      vscode.postMessage({ type: 'action', action: 'setMinimalBg', enabled });
    });
  }

  if (departBtnEl) {
    departBtnEl.addEventListener('click', () => {
      if (departing || recruitBusy || !latestState || !latestState.awaitingDeparture) {
        return;
      }
      departing = true;
      departBtnEl.disabled = true;
      departBtnEl.hidden = true;
      flushTravelMeters();
      const next = applyDepartLocal(latestState);
      const joinPartySize = next.partySize;
      // Advance the leg immediately; party size + companion wait for the meet sequence.
      latestState = {
        ...next,
        partySize: latestState.partySize || 1,
        awaitingDeparture: false,
      };
      traveledPx = 0;
      updateMetersUi(latestState);
      startRecruitCeremony(next, { joinPartySize });
      vscode.postMessage({ type: 'action', action: 'depart' });
    });
  }

  petEl.addEventListener('pointerdown', (event) => {
    // pointerdown is more reliable than click for rapid taps.
    if (event.button !== 0) {
      return;
    }
    event.preventDefault();
    flashPetReact();
    vscode.postMessage({ type: 'action', action: 'petClick' });
  });

  navButtons.forEach((btn) => {
    btn.addEventListener('click', () => {
      if (btn.disabled || btn.classList.contains('nav-btn-disabled')) {
        return;
      }
      const screen = btn.dataset.screen;
      setScreen(screen);
      vscode.postMessage({ type: 'action', action: 'navigate', screen });
    });
  });

  document.querySelectorAll('[data-action]').forEach((btn) => {
    btn.addEventListener('click', () => {
      vscode.postMessage({ type: 'action', action: btn.dataset.action });
    });
  });

  window.addEventListener('message', (event) => {
    const message = event.data;
    if (message && message.type === 'state') {
      renderState(message.payload);
    }
  });

  buildCarouselTracks();
  setTrackPosition(trackIndex, false);
  updateNamePlaceholder();

  preparePortraits()
    .then(() => {
      portraitsReady = true;
      if (!confirming && latestState && !latestState.characterId) {
        charConfirmEl.disabled = false;
      }
      if (latestState && latestState.characterId) {
        startWalkAnimation(latestState.characterId);
        updateGameCopy(latestState);
      }
      vscode.postMessage({ type: 'ready' });
    })
    .catch((error) => {
      console.error('[travelling-kingdom] portrait prep failed', error);
      vscode.postMessage({ type: 'ready' });
    });

  prepareRoyalFrame().catch((error) => {
    console.error('[travelling-kingdom] royal frame prep failed', error);
  });

  prepareUiBar().catch((error) => {
    console.error('[travelling-kingdom] ui bar prep failed', error);
  });

  prepareDestinations().catch((error) => {
    console.error('[travelling-kingdom] destinations prep failed', error);
  });

  prepareRoyalButton().catch((error) => {
    console.error('[travelling-kingdom] royal button prep failed', error);
  });

  prepareGround().catch((error) => {
    console.error('[travelling-kingdom] ground prep failed', error);
  });

  prepareDecor().catch((error) => {
    console.error('[travelling-kingdom] decor prep failed', error);
  });

  prepareCampNpc().catch((error) => {
    console.error('[travelling-kingdom] camp npc prep failed', error);
  });

  prepareGroveArt().catch((error) => {
    console.error('[travelling-kingdom] grove art prep failed', error);
  });

  prepareParallax().catch((error) => {
    console.error('[travelling-kingdom] parallax prep failed', error);
  });
})();
