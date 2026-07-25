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
  const squadListEl = document.getElementById('squad-list');
  const shopStatusEl = document.getElementById('shop-status');
  const petEl = document.getElementById('pet');
  const petSpriteEl = document.getElementById('pet-sprite');
  const campNpcEl = document.getElementById('camp-npc');
  const companion2El = document.getElementById('companion-2');
  const companion3El = document.getElementById('companion-3');
  const companion4El = document.getElementById('companion-4');
  const companion5El = document.getElementById('companion-5');
  const companion6El = document.getElementById('companion-6');
  const companion7El = document.getElementById('companion-7');
  const companion8El = document.getElementById('companion-8');
  const companion9El = document.getElementById('companion-9');
  const companion10El = document.getElementById('companion-10');
  const companion11El = document.getElementById('companion-11');
  const companion12El = document.getElementById('companion-12');
  const companion13El = document.getElementById('companion-13');
  const companion14El = document.getElementById('companion-14');
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
  const GROVE_WILLOW_OX = 0.35;
  const GROVE_WILLOW_SCALE = 1.05;
  const GROVE_NPC_OX = 0.85;
  const GROVE_NPC_COL = 1; // female sheet column 2 (1-based)
  const GROVE_NPC_ROWS = [1, 2, 3, 4, 5]; // standing rows 2–6 (1-based)
  /** River Town landmark — houses and townsfolk along the trail. */
  const TOWN_DEST_LEVEL = 3;
  const TOWN_NPC_COL = 3; // female sheet column 4 (1-based)
  const TOWN_NPC_OX = 0.85;
  const TOWN_NPC_ROWS = [1, 2, 3, 4, 5]; // standing rows 2–6 (1-based)
  /** Scout Camp (level 4) — standalone tents + halberd guard. */
  const TENT_DEST_LEVEL = 4;
  const TENT_LARGE_OX = 0.4;
  const TENT_SMALL_OX = -3.6;
  const TENT_NPC_OX = 1.55;
  const TENT_NPC_COL = 5; // male sheet column 6 (1-based)
  const TENT_NPC_ROWS = [1, 2, 3, 4, 5];
  const TENT_DISPLAY_SCALE = 1.15;
  /** Wayside Stone (level 5) — traveler + one decor stone. */
  const STONE_DEST_LEVEL = 5;
  const STONE_NPC_OX = 0.55;
  const STONE_NPC_COL = 7; // female sheet column 8 (1-based)
  const STONE_NPC_ROWS = [1, 2, 3, 4, 5];
  // decor.png 0-based: medium green rock cluster beside the traveler.
  const STONE_DECOR = { row: 5, col: 0, w: 1, h: 1, ox: -0.55 };
  const HOUSE_DISPLAY_SCALE = 1.25;
  const VILLAGE_BUILDING_SCALE = 1.15;
  const VILLAGE_STALL_SCALE = 1.35;
  const VILLAGE_TAVERN_SCALE = 1.2;
  /** Market Village (level 6) — wide street; bishop by tavern. */
  const MARKET_DEST_LEVEL = 6;
  const BISHOP_NPC_OX = 0.15;
  const BISHOP_NPC_COL = 4; // male sheet column 5 (1-based)
  const BISHOP_NPC_ROWS = [1, 2, 3, 4, 5];
  const MARKET_BUILDINGS = [
    { key: 'house-1', ox: -17.5, scale: VILLAGE_BUILDING_SCALE },
    { key: 'stall-1', ox: -13.5, scale: VILLAGE_STALL_SCALE },
    { key: 'house-2', ox: -10.0, scale: VILLAGE_BUILDING_SCALE },
    { key: 'stall-2', ox: -6.2, scale: VILLAGE_STALL_SCALE },
    { key: 'house-3', ox: -3.0, scale: VILLAGE_BUILDING_SCALE },
    { key: 'tavern-1', ox: 1.0, scale: VILLAGE_TAVERN_SCALE },
    { key: 'stall-3', ox: 5.2, scale: VILLAGE_STALL_SCALE },
    { key: 'house-4', ox: 8.8, scale: VILLAGE_BUILDING_SCALE },
    { key: 'tavern-2', ox: 13.0, scale: VILLAGE_TAVERN_SCALE },
    { key: 'house-5', ox: 17.0, scale: VILLAGE_BUILDING_SCALE },
    { key: 'house-6', ox: 20.5, scale: VILLAGE_BUILDING_SCALE },
  ];
  /** Cloister Village (level 7) — same kit, different layout; nun by tavern. */
  const CLOISTER_DEST_LEVEL = 7;
  const NUN_NPC_OX = 0.4;
  const NUN_NPC_COL = 2; // female sheet column 3 (1-based)
  const NUN_NPC_ROWS = [1, 2, 3, 4, 5];
  const CLOISTER_BUILDINGS = [
    { key: 'tavern-2', ox: -18.5, scale: VILLAGE_TAVERN_SCALE },
    { key: 'house-6', ox: -14.0, scale: VILLAGE_BUILDING_SCALE },
    { key: 'stall-3', ox: -10.2, scale: VILLAGE_STALL_SCALE },
    { key: 'house-1', ox: -6.5, scale: VILLAGE_BUILDING_SCALE },
    { key: 'stall-1', ox: -3.0, scale: VILLAGE_STALL_SCALE },
    { key: 'tavern-1', ox: 1.2, scale: VILLAGE_TAVERN_SCALE },
    { key: 'house-3', ox: 5.5, scale: VILLAGE_BUILDING_SCALE },
    { key: 'stall-2', ox: 9.0, scale: VILLAGE_STALL_SCALE },
    { key: 'house-5', ox: 12.8, scale: VILLAGE_BUILDING_SCALE },
    { key: 'house-2', ox: 16.5, scale: VILLAGE_BUILDING_SCALE },
    { key: 'house-4', ox: 20.2, scale: VILLAGE_BUILDING_SCALE },
  ];
  const TOWN_HOUSES = [
    { id: 'house-1', file: 'house_1', ox: -12.5, scale: HOUSE_DISPLAY_SCALE },
    { id: 'house-2', file: 'house_2', ox: -7.5, scale: HOUSE_DISPLAY_SCALE },
    { id: 'house-3', file: 'house_3', ox: -3.8, scale: HOUSE_DISPLAY_SCALE },
    { id: 'house-4', file: 'house_4', ox: 0, scale: HOUSE_DISPLAY_SCALE },
    { id: 'house-5', file: 'house_5', ox: 4.2, scale: HOUSE_DISPLAY_SCALE },
    { id: 'house-6', file: 'house_6', ox: 9.0, scale: HOUSE_DISPLAY_SCALE },
  ];
  // Sparse orchard: fewer trees, wider gaps, mixed sizes.
  const GROVE_APPLES = [
    { ox: -7.2, scale: 0.78 },
    { ox: -5.2, scale: 1.18 },
    { ox: -3.3, scale: 0.92 },
    { ox: -1.4, scale: 1.08 },
    { ox: 0.6, scale: 0.72 },
    { ox: 2.5, scale: 1.22 },
    { ox: 4.4, scale: 0.88 },
    { ox: 6.2, scale: 1.05 },
    { ox: 7.8, scale: 0.8 },
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
  const PET_BASE_LEFT = 32;
  /** Extra lead inset per party member so the trail fits on screen. */
  const CAMERA_PAD_PER_MEMBER = 36;
  /** Companion trails this far behind the leader (px). */
  const COMPANION_FOLLOW_GAP = Math.round(SPRITE_DISPLAY * 0.46);
  /** How close the hero stops to a recruit while speaking (px past pet left). */
  const RECRUIT_SPEAK_GAP = Math.round(SPRITE_DISPLAY * 0.28);
  const IDLE_NPC_ROWS = [1, 2, 3, 4, 5];
  /** Camera settle speed — lower = slower, smoother ease to lead position. */
  const CAMERA_EASE_RATE = 0.85;
  /** Max camera ease (px/s); keep well below floor scroll so it reads as pan, not slide. */
  const CAMERA_EASE_MAX_SPEED = 28;
  const RECRUIT_FACE_MS = 300;
  /** Brief hold after both faces turn before resume. */
  const RECRUIT_HOLD_MS = 220;
  /** Speak-approach ease toward the NPC (px/s). */
  const RECRUIT_SPEAK_EASE_MAX = 96;
  /** How fast companions slide into formation after a recruit joins (px/s). */
  const COMPANION_FORM_EASE_MAX = 160;
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
  const TOWN_EXTRAS = [
    { id: 'town-a', row: 0, cols: [5, 6, 7, 8, 9], ox: -6.2, size: 88, el: null },
    { id: 'town-b', row: 1, cols: [5, 6, 7, 8, 9], ox: -5.0, size: 88, el: null },
    { id: 'town-c', row: 2, cols: [0, 1, 2, 3, 4], ox: -3.7, size: 88, el: null },
    { id: 'town-d', row: 2, cols: [5, 6, 7, 8, 9], ox: -2.7, size: 88, el: null },
    { id: 'town-e', row: 3, cols: [0, 1, 2, 3, 4], ox: -1.3, size: 88, el: null },
    { id: 'town-f', row: 3, cols: [5, 6, 7, 8, 9], ox: 1.4, size: 88, el: null },
    { id: 'town-g', row: 8, cols: [0, 1, 2, 3, 4], ox: 3.0, size: 88, el: null },
    { id: 'town-h', row: 9, cols: [0, 1, 2, 3, 4], ox: 4.4, size: 88, el: null },
    { id: 'town-i', row: 9, cols: [5, 6, 7, 8, 9], ox: 6.2, size: 88, el: null },
    { id: 'town-dog', row: 7, cols: [5, 6, 7, 8, 9], ox: 5.2, size: 96, mirror: true, el: null },
  ];
  // Market village crowd — reuse town-* canvases with wider spacing.
  const MARKET_EXTRAS = [
    { id: 'town-a', row: 0, cols: [0, 1, 2, 3, 4], ox: -16.0, size: 88, el: null },
    { id: 'town-b', row: 0, cols: [5, 6, 7, 8, 9], ox: -12.5, size: 88, el: null },
    { id: 'town-c', row: 1, cols: [0, 1, 2, 3, 4], ox: -9.0, size: 88, el: null },
    { id: 'town-d', row: 1, cols: [5, 6, 7, 8, 9], ox: -5.5, size: 88, el: null },
    { id: 'town-e', row: 2, cols: [0, 1, 2, 3, 4], ox: -2.0, size: 88, el: null },
    { id: 'town-f', row: 2, cols: [5, 6, 7, 8, 9], ox: 3.5, size: 88, el: null },
    { id: 'town-g', row: 3, cols: [0, 1, 2, 3, 4], ox: 7.0, size: 88, el: null },
    { id: 'town-h', row: 8, cols: [0, 1, 2, 3, 4], ox: 11.0, size: 88, el: null },
    { id: 'town-i', row: 9, cols: [5, 6, 7, 8, 9], ox: 15.5, size: 88, el: null },
    { id: 'town-dog', row: 7, cols: [0, 1, 2, 3, 4], ox: 18.5, size: 96, el: null },
  ];
  // Cloister village crowd — different rows/poses, mirrored layout bias.
  const CLOISTER_EXTRAS = [
    { id: 'town-a', row: 3, cols: [5, 6, 7, 8, 9], ox: -17.0, size: 88, el: null },
    { id: 'town-b', row: 8, cols: [5, 6, 7, 8, 9], ox: -13.0, size: 88, el: null },
    { id: 'town-c', row: 9, cols: [0, 1, 2, 3, 4], ox: -9.5, size: 88, el: null },
    { id: 'town-d', row: 0, cols: [5, 6, 7, 8, 9], ox: -5.0, size: 88, el: null },
    { id: 'town-e', row: 1, cols: [0, 1, 2, 3, 4], ox: -1.5, size: 88, el: null },
    { id: 'town-f', row: 1, cols: [5, 6, 7, 8, 9], ox: 4.0, size: 88, el: null },
    { id: 'town-g', row: 2, cols: [0, 1, 2, 3, 4], ox: 8.0, size: 88, el: null },
    { id: 'town-h', row: 2, cols: [5, 6, 7, 8, 9], ox: 12.5, size: 88, el: null },
    { id: 'town-i', row: 3, cols: [0, 1, 2, 3, 4], ox: 16.5, size: 88, el: null },
    { id: 'town-dog', row: 7, cols: [5, 6, 7, 8, 9], ox: -7.5, size: 96, mirror: true, el: null },
  ];
  /** Companion look is keyed by which landmark recruited them (not party index). */
  const COMPANION_BY_KIND = {
    tent: {
      id: 'halberd',
      kind: 'tent',
      el: companion4El,
      sheet: 'male',
      col: TENT_NPC_COL,
      side: 'right',
    },
    camp: {
      id: 'hooded',
      kind: 'camp',
      el: campNpcEl,
      sheet: 'male',
      col: 3,
      side: 'left',
    },
    grove: {
      id: 'forest',
      kind: 'grove',
      el: companion2El,
      sheet: 'female',
      col: 1,
      side: 'left',
    },
    town: {
      id: 'town',
      kind: 'town',
      el: companion3El,
      sheet: 'female',
      col: 3,
      side: 'left',
    },
    stone: {
      id: 'traveler',
      kind: 'stone',
      el: companion5El,
      sheet: 'female',
      col: STONE_NPC_COL,
      side: 'left',
    },
    market: {
      id: 'bishop',
      kind: 'market',
      el: companion6El,
      sheet: 'male',
      col: BISHOP_NPC_COL,
      side: 'left',
    },
    cloister: {
      id: 'nun',
      kind: 'cloister',
      el: companion7El,
      sheet: 'female',
      col: NUN_NPC_COL,
      side: 'left',
    },
    male0: {
      id: 'watch',
      kind: 'male0',
      el: companion8El,
      sheet: 'male',
      col: 0,
      side: 'left',
    },
    male1: {
      id: 'porter',
      kind: 'male1',
      el: companion9El,
      sheet: 'male',
      col: 1,
      side: 'left',
    },
    male2: {
      id: 'miller',
      kind: 'male2',
      el: companion10El,
      sheet: 'male',
      col: 2,
      side: 'left',
    },
    male6: {
      id: 'hedge',
      kind: 'male6',
      el: companion11El,
      sheet: 'male',
      col: 6,
      side: 'left',
    },
    male8: {
      id: 'anvil',
      kind: 'male8',
      el: companion12El,
      sheet: 'male',
      col: 8,
      side: 'left',
    },
    male10: {
      id: 'brook',
      kind: 'male10',
      el: companion13El,
      sheet: 'male',
      col: 10,
      side: 'left',
    },
    female11: {
      id: 'lantern',
      kind: 'female11',
      el: companion14El,
      sheet: 'female',
      col: 11,
      side: 'left',
    },
  };

  /** Light decor stops for the seven extra recruit kinds. */
  const WAYSIDE_STOPS = {
    male0: { el: companion8El, sheet: 'male', col: 0, ox: 0.55, decor: 'shop' },
    male1: { el: companion9El, sheet: 'male', col: 1, ox: 0.55, decor: 'tuft' },
    male2: { el: companion10El, sheet: 'male', col: 2, ox: 0.55, decor: 'stable' },
    male6: { el: companion11El, sheet: 'male', col: 6, ox: 0.55, decor: 'tuft' },
    male8: { el: companion12El, sheet: 'male', col: 8, ox: 0.55, decor: 'shop' },
    male10: { el: companion13El, sheet: 'male', col: 10, ox: 0.55, decor: 'tuft' },
    female11: { el: companion14El, sheet: 'female', col: 11, ox: 0.55, decor: 'stable' },
  };
  const WAYSIDE_NPC_ROWS = [1, 2, 3, 4, 5];
  const WAYSIDE_BUILDING_SCALE = 1.15;
  const WAYSIDE_TUFTS = [
    { row: 4, col: 0, w: 1, h: 1, ox: -0.9 },
    { row: 4, col: 1, w: 1, h: 1, ox: 0.05 },
    { row: 5, col: 0, w: 1, h: 1, ox: 1.0 },
  ];

  /** Manage roster flavor (static). Hero name comes from state. */
  const SQUAD_FLAVOR = {
    'female-0': {
      age: 24,
      description: 'Leads the travelling court with a steady step and a sharp eye.',
    },
    'male-7': {
      age: 31,
      description: 'A crowned wanderer who prefers the road to the throne room.',
    },
    tent: {
      name: 'Halberd Guard',
      age: 28,
      description: 'Keeps the right flank clear and answers trouble with steel.',
    },
    camp: {
      name: 'Hooded Traveler',
      age: 22,
      description: 'Quiet camp-fire company who knows every shortcut on the map.',
    },
    grove: {
      name: 'Grove Walker',
      age: 19,
      description: 'Apple-grove guide who hums while she keeps pace behind you.',
    },
    town: {
      name: 'Town Companion',
      age: 26,
      description: 'River Town gossip and grit, loyal once she picks a side.',
    },
    stone: {
      name: 'Wayside Traveler',
      age: 33,
      description: 'Joined at the wayside stone. Steady walker who prefers the back of the line.',
    },
    market: {
      name: 'Market Bishop',
      age: 47,
      description: 'Blesses the stalls by day and the trail by dusk.',
    },
    cloister: {
      name: 'Cloister Sister',
      age: 29,
      description: 'A quiet nun from the cloister village. Calm, loyal, and hard to shake.',
    },
    male0: {
      name: 'Roadside Watch',
      age: 34,
      description: 'Keeps one eye on the road and one on whoever joins the trail.',
    },
    male1: {
      name: 'Porter Bend',
      age: 27,
      description: 'Hauls more than his share and never complains twice.',
    },
    male2: {
      name: 'Mill Creek',
      age: 30,
      description: 'Strong arms from the mill; steady feet on the march.',
    },
    male6: {
      name: 'Hedge Trail',
      age: 25,
      description: 'Reads the hedgerows like a map and slips through quiet gaps.',
    },
    male8: {
      name: 'Anvil Rest',
      age: 41,
      description: 'Sparks still cling to his sleeves; he mends kit by firelight.',
    },
    male10: {
      name: 'Brook Crossing',
      age: 23,
      description: 'Knows every shallow ford and when the water will rise.',
    },
    female11: {
      name: 'Lantern Meadow',
      age: 28,
      description: 'Carries a warm light for the darkest stretch of road.',
    },
  };

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
  /** After Continue/recruit, keep the departed landmark until it scrolls off-screen. */
  let landmarkLinger = false;
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
  let townHouseImgs = [];
  let townFemaleImage = null;
  let tentSmallImg = null;
  let tentLargeImg = null;
  let shopImg = null;
  let stableImg = null;
  /** Shared village art: house-*, stall-*, tavern-*. */
  let villageArtImgs = {};
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
  /** True while companions ease from landmark/old gaps into trail slots (no snap). */
  let companionFormationEasing = false;
  let companionFormationAnimId = null;
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
  let partyIdleAnimId = null;
  let partyIdleFrame = 0;
  let partyIdleLastTs = 0;
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
    const lvl = Math.max(1, Math.floor(Number(level) || 1));
    const exact = destinations.find((d) => Number(d.level) === lvl);
    if (exact && typeof exact.meters === 'number' && exact.meters > 0) {
      return Math.floor(exact.meters);
    }
    // Fallback if destinations.json is not loaded yet (matches early legs).
    if (lvl <= 3) {
      return 50;
    }
    return (lvl - 2) * 500;
  }

  const RECRUIT_KIND_COUNT = 14;
  const MAX_PARTY_SIZE = 15;
  const EARLY_LANDMARK_KINDS = ['camp', 'grove', 'town'];
  const RECRUIT_LANDMARK_KINDS = [
    'camp',
    'grove',
    'town',
    'tent',
    'stone',
    'market',
    'cloister',
    'male0',
    'male1',
    'male2',
    'male6',
    'male8',
    'male10',
    'female11',
  ];
  const LEFT_TRAIL_KINDS = RECRUIT_LANDMARK_KINDS.filter((k) => k !== 'tent');
  const RECRUIT_LANDMARK_NAMES = {
    camp: 'Soldier Camp',
    grove: 'Apple Grove',
    town: 'River Town',
    tent: 'Scout Camp',
    stone: 'Wayside Stone',
    market: 'Market Village',
    cloister: 'Cloister Village',
    male0: 'Roadside Watch',
    male1: 'Porter Bend',
    male2: 'Mill Creek',
    male6: 'Hedge Trail',
    male8: 'Anvil Rest',
    male10: 'Brook Crossing',
    female11: 'Lantern Meadow',
  };
  const EARLY_LANDMARK_NAMES = {
    camp: 'Soldier Camp',
    grove: 'Apple Grove',
    town: 'River Town',
  };

  function shuffleEarlyLandmarks() {
    const arr = EARLY_LANDMARK_KINDS.slice();
    for (let i = arr.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      const tmp = arr[i];
      arr[i] = arr[j];
      arr[j] = tmp;
    }
    return arr;
  }

  function shuffleRecruitLandmarks() {
    const arr = RECRUIT_LANDMARK_KINDS.slice();
    for (let i = arr.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      const tmp = arr[i];
      arr[i] = arr[j];
      arr[j] = tmp;
    }
    return arr;
  }

  function normalizeEarlyLandmarkOrder(raw) {
    if (!Array.isArray(raw) || raw.length !== 3) {
      return shuffleEarlyLandmarks();
    }
    const allowed = new Set(EARLY_LANDMARK_KINDS);
    const cleaned = raw.filter((k) => allowed.has(k));
    if (cleaned.length !== 3 || new Set(cleaned).size !== 3) {
      return shuffleEarlyLandmarks();
    }
    return cleaned;
  }

  function isValidRecruitLandmarkOrder(raw) {
    if (!Array.isArray(raw) || raw.length !== RECRUIT_KIND_COUNT) {
      return false;
    }
    const allowed = new Set(RECRUIT_LANDMARK_KINDS);
    const cleaned = raw.filter((k) => allowed.has(String(k)));
    return cleaned.length === RECRUIT_KIND_COUNT && new Set(cleaned).size === RECRUIT_KIND_COUNT;
  }

  function normalizeRecruitLandmarkOrder(raw, earlyFallback) {
    if (isValidRecruitLandmarkOrder(raw)) {
      return raw.slice();
    }
    const allowed = new Set(RECRUIT_LANDMARK_KINDS);
    const cleaned = [];
    if (Array.isArray(raw)) {
      raw.forEach((item) => {
        const key = String(item);
        if (!allowed.has(key) || cleaned.includes(key)) {
          return;
        }
        cleaned.push(key);
      });
    }
    const early = earlyFallback ? normalizeEarlyLandmarkOrder(earlyFallback) : [];
    early.forEach((kind) => {
      if (!cleaned.includes(kind)) {
        cleaned.push(kind);
      }
    });
    const rest = RECRUIT_LANDMARK_KINDS.filter((k) => !cleaned.includes(k));
    for (let i = rest.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      const tmp = rest[i];
      rest[i] = rest[j];
      rest[j] = tmp;
    }
    return cleaned.concat(rest).slice(0, RECRUIT_KIND_COUNT);
  }

  function earlyLandmarkOrderFromState(state) {
    return normalizeEarlyLandmarkOrder(state && state.earlyLandmarkOrder);
  }

  function recruitLandmarkOrderFromState(state) {
    return normalizeRecruitLandmarkOrder(
      state && state.recruitLandmarkOrder,
      state && state.earlyLandmarkOrder
    );
  }

  function landmarkKindAtLevel(state, level) {
    const lvl = Math.floor(Number(level) || 1);
    const idx = lvl - 1;
    if (idx < 0 || idx >= RECRUIT_KIND_COUNT) {
      return null;
    }
    const order = recruitLandmarkOrderFromState(state);
    return order[idx] || null;
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
    const lvl = Math.max(1, Math.floor(Number(level) || 1));
    if (latestState && lvl >= 1 && lvl <= RECRUIT_KIND_COUNT) {
      const kind = landmarkKindAtLevel(latestState, lvl);
      if (kind && RECRUIT_LANDMARK_NAMES[kind]) {
        return RECRUIT_LANDMARK_NAMES[kind];
      }
    }
    if (!destinations.length) {
      return 'Meadow Village';
    }
    const exact = destinations.find((d) => Number(d.level) === lvl);
    if (exact && exact.name) {
      return exact.name;
    }
    const idx =
      ((lvl - 1) % destinations.length + destinations.length) % destinations.length;
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
      const partySize = Math.max(server.partySize || 1, latestState.partySize || 1);
      const earlyLandmarkOrder = earlyLandmarkOrderFromState(latestState);
      const recruitLandmarkOrder = recruitLandmarkOrderFromState(latestState);
      return {
        ...server,
        level: latestState.level,
        meters: latestState.meters,
        awaitingDeparture: keepAwaiting,
        partySize,
        earlyLandmarkOrder,
        recruitLandmarkOrder,
        leftTrailOrder: normalizeLeftTrailOrder(
          latestState.leftTrailOrder || server.leftTrailOrder,
          partySize,
          recruitLandmarkOrder
        ),
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
      const partySize = Math.max(server.partySize || 1, latestState.partySize || 1);
      const earlyLandmarkOrder = earlyLandmarkOrderFromState(latestState);
      const recruitLandmarkOrder = recruitLandmarkOrderFromState(latestState);
      return {
        ...server,
        level: latestState.level,
        meters: latestState.meters,
        awaitingDeparture: true,
        partySize,
        earlyLandmarkOrder,
        recruitLandmarkOrder,
        leftTrailOrder: normalizeLeftTrailOrder(
          latestState.leftTrailOrder || server.leftTrailOrder,
          partySize,
          recruitLandmarkOrder
        ),
      };
    }
    const partySize = Math.max(server.partySize || 1, latestState.partySize || 1);
    const earlyLandmarkOrder = earlyLandmarkOrderFromState(
      Array.isArray(server.earlyLandmarkOrder) && server.earlyLandmarkOrder.length === 3
        ? server
        : latestState
    );
    const recruitLandmarkOrder = normalizeRecruitLandmarkOrder(
      Array.isArray(server.recruitLandmarkOrder) &&
        server.recruitLandmarkOrder.length === RECRUIT_KIND_COUNT
        ? server.recruitLandmarkOrder
        : latestState.recruitLandmarkOrder,
      earlyLandmarkOrder
    );
    return {
      ...server,
      partySize,
      earlyLandmarkOrder,
      recruitLandmarkOrder,
      leftTrailOrder: normalizeLeftTrailOrder(
        Array.isArray(server.leftTrailOrder) && server.leftTrailOrder.length
          ? server.leftTrailOrder
          : latestState.leftTrailOrder,
        partySize,
        recruitLandmarkOrder
      ),
    };
  }

  function applyDepartLocal(state) {
    let partySize = Math.max(1, state.partySize || 1);
    const level = state.level;
    const recruitLandmarkOrder = recruitLandmarkOrderFromState(state);
    if (level >= 1 && level <= RECRUIT_KIND_COUNT) {
      partySize = Math.max(partySize, Math.min(MAX_PARTY_SIZE, level + 1));
    }
    const departedKind = landmarkKindAtLevel(state, level);
    let leftTrailOrder = normalizeLeftTrailOrder(
      state.leftTrailOrder,
      partySize,
      recruitLandmarkOrder
    );
    if (departedKind && departedKind !== 'tent') {
      leftTrailOrder = [departedKind, ...leftTrailOrder.filter((k) => k !== departedKind)];
    }
    return {
      ...state,
      level: state.level + 1,
      meters: 0,
      awaitingDeparture: false,
      partySize,
      recruitLandmarkOrder,
      leftTrailOrder,
    };
  }

  function formatPartySize(count) {
    const n = Math.max(1, Math.floor(count || 1));
    return n === 1 ? '1 person' : `${n} persons`;
  }

  function companionCountFromState(state) {
    return Math.max(1, Math.min(MAX_PARTY_SIZE, Math.floor((state && state.partySize) || 1)));
  }

  /** Guard on the right; left trail from persisted order (else newest-closest). */
  function recruitedLandmarkKinds(state) {
    const party = companionCountFromState(state);
    const leftOrder = normalizeLeftTrailOrder(
      state && state.leftTrailOrder,
      party,
      recruitLandmarkOrderFromState(state)
    );
    const kinds = leftOrder.slice();
    if (hasRecruitedKind(state, 'tent')) {
      kinds.unshift('tent');
    }
    return kinds;
  }

  function defaultLeftTrailOrderFromParty(partySize, recruitOrder) {
    const party = Math.max(1, Math.min(MAX_PARTY_SIZE, Math.floor(partySize || 1)));
    const order = normalizeRecruitLandmarkOrder(recruitOrder);
    const recruited = order.slice(0, Math.max(0, party - 1));
    return recruited.filter((k) => k !== 'tent').slice().reverse();
  }

  function normalizeLeftTrailOrder(raw, partySize, recruitOrder) {
    const expected = defaultLeftTrailOrderFromParty(partySize, recruitOrder);
    const expectedSet = new Set(expected);
    const allowed = new Set(LEFT_TRAIL_KINDS);
    const cleaned = [];
    if (Array.isArray(raw)) {
      raw.forEach((item) => {
        const key = String(item);
        if (!allowed.has(key) || !expectedSet.has(key) || cleaned.includes(key)) {
          return;
        }
        cleaned.push(key);
      });
    }
    expected.forEach((kind) => {
      if (!cleaned.includes(kind)) {
        cleaned.push(kind);
      }
    });
    return cleaned;
  }

  function hasRecruitedKind(state, kind) {
    const party = companionCountFromState(state);
    const order = recruitLandmarkOrderFromState(state);
    return order.slice(0, Math.max(0, party - 1)).includes(kind);
  }

  function activeCompanionSlots(state) {
    return recruitedLandmarkKinds(state)
      .map((kind) => COMPANION_BY_KIND[kind])
      .filter((slot) => slot && slot.el);
  }

  function hasActiveCompanionSlots() {
    return activeCompanionSlots(latestState).length > 0;
  }

  function syncCompanionFromState(state) {
    if (recruitBusy) {
      return;
    }
    const nextJoined = companionCountFromState(state) >= 2;
    companionJoined = nextJoined;
    setCameraTargetForParty(state && state.partySize ? state.partySize : 1);
    // Host depart/travel replies must not abort join/camera motion or hard-snap the party.
    if (companionFormationEasing || cameraAnimId !== null) {
      return;
    }
    if (companionJoined) {
      positionCompanionsBehindPet();
      drawActiveCompanionWalkFrames(walkFrame || 0);
      if (Math.abs(petLeadLeft - petLeadLeftTarget) > 0.5) {
        startCameraEase();
      }
    } else {
      Object.keys(COMPANION_BY_KIND).forEach((kind) => {
        const el = COMPANION_BY_KIND[kind].el;
        if (el && !campActive) {
          el.hidden = true;
        }
      });
    }
  }

  function setCameraTargetForParty(partySize) {
    const leftTrail = activeCompanionSlots(latestState).filter((slot) => slot.side !== 'right')
      .length;
    const n = Math.max(1, leftTrail + 1);
    void partySize;
    const ideal = PET_BASE_LEFT + Math.max(0, n - 1) * CAMERA_PAD_PER_MEMBER;
    const width = Math.max(1, Math.round(appEl.clientWidth || 0));
    // Prefer keeping the hero visible on narrow panels; trail may clip off the left.
    const maxLead = Math.max(PET_BASE_LEFT, Math.floor(width * 0.36));
    petLeadLeftTarget = Math.min(ideal, maxLead);
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
      if (recruitBusy && !hasActiveCompanionSlots()) {
        cameraAnimId = null;
        return;
      }
      if (lastTs > 0) {
        const dt = Math.min(0.05, (timestamp - lastTs) / 1000);
        const diff = petLeadLeftTarget - petLeadLeft;
        if (Math.abs(diff) < 0.5) {
          applyPetLeft(petLeadLeftTarget);
          // Formation ease owns companion X until it finishes; don't snap over it.
          if (hasActiveCompanionSlots() && !companionFormationEasing) {
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
        if (hasActiveCompanionSlots() && !companionFormationEasing) {
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
    return Boolean(state && state.characterId && landmarkKindAtLevel(state, state.level) === 'camp');
  }

  function shouldShowGrove(state) {
    return Boolean(state && state.characterId && landmarkKindAtLevel(state, state.level) === 'grove');
  }

  function shouldShowTown(state) {
    return Boolean(state && state.characterId && landmarkKindAtLevel(state, state.level) === 'town');
  }

  function shouldShowTent(state) {
    return Boolean(state && state.characterId && landmarkKindAtLevel(state, state.level) === 'tent');
  }

  function shouldShowStone(state) {
    return Boolean(state && state.characterId && landmarkKindAtLevel(state, state.level) === 'stone');
  }

  function shouldShowMarket(state) {
    return Boolean(state && state.characterId && landmarkKindAtLevel(state, state.level) === 'market');
  }

  function shouldShowCloister(state) {
    return Boolean(
      state && state.characterId && landmarkKindAtLevel(state, state.level) === 'cloister'
    );
  }

  function shouldShowLandmark(state) {
    return Boolean(state && state.characterId && landmarkKindAtLevel(state, state.level));
  }

  function landmarkKindForState(state) {
    if (!state || !state.characterId) {
      return null;
    }
    return landmarkKindAtLevel(state, state.level);
  }

  function remainingMetersForCamp(state) {
    if (!state) {
      return 0;
    }
    const needed = metersToNext(state.level);
    const progress = effectiveMeters(state);
    return Math.max(0, needed - progress);
  }

  function waysideBandOffsets(kind) {
    if (!WAYSIDE_STOPS[kind]) {
      return null;
    }
    return { left: -2.5, right: 2.5 };
  }

  function isCampOffscreen() {
    const width = Math.max(1, Math.round(appEl.clientWidth));
    const u = campUnit();
    const wayside = waysideBandOffsets(landmarkKind);
    const leftOffset = wayside
      ? wayside.left
      : landmarkKind === 'town'
        ? -13.5
        : landmarkKind === 'grove'
          ? -8.0
          : landmarkKind === 'tent'
            ? -4.0
            : landmarkKind === 'stone'
              ? -1.5
              : landmarkKind === 'market' || landmarkKind === 'cloister'
                ? -21.0
                : CAMP_PIECES[0].ox;
    const rightOffset = wayside
      ? wayside.right
      : landmarkKind === 'town'
        ? 13.5
        : landmarkKind === 'grove'
          ? 8.0
          : landmarkKind === 'tent'
            ? 4.0
            : landmarkKind === 'stone'
              ? 1.5
              : landmarkKind === 'market' || landmarkKind === 'cloister'
                ? 21.0
                : 5.5;
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

    // Departed location stays painted until it scrolls off the left edge.
    if (campActive && campWorldLocked && landmarkLinger) {
      if (isCampOffscreen()) {
        clearCamp();
      } else {
        startCampNpcAnim();
        return;
      }
    }

    if (shouldShowLandmark(latestState)) {
      const nextKind = landmarkKindForState(latestState);
      campActive = true;
      landmarkKind = nextKind;
      landmarkLinger = false;
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

    // Left a destination: keep the same landmark in world space until it scrolls away.
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
    const wayside = waysideBandOffsets(landmarkKind);
    if (wayside) {
      return {
        left: campPotWorldX + wayside.left * u - 8,
        right: campPotWorldX + wayside.right * u + 8,
      };
    }
    if (landmarkKind === 'grove') {
      return {
        left: campPotWorldX - 8.0 * u - 8,
        right: campPotWorldX + 8.0 * u + 8,
      };
    }
    if (landmarkKind === 'town') {
      return {
        left: campPotWorldX - 13.5 * u - 8,
        right: campPotWorldX + 13.5 * u + 8,
      };
    }
    if (landmarkKind === 'tent') {
      return {
        left: campPotWorldX - 4.0 * u - 8,
        right: campPotWorldX + 4.0 * u + 8,
      };
    }
    if (landmarkKind === 'stone') {
      return {
        left: campPotWorldX - 1.5 * u - 8,
        right: campPotWorldX + 1.5 * u + 8,
      };
    }
    if (landmarkKind === 'market' || landmarkKind === 'cloister') {
      return {
        left: campPotWorldX - 21.0 * u - 8,
        right: campPotWorldX + 21.0 * u + 8,
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
    const drawTree = (img, ox, scale) => {
      const naturalW = img.width || img.naturalWidth;
      const naturalH = img.height || img.naturalHeight;
      const drawW = Math.round(naturalW * scale);
      const drawH = Math.round(naturalH * scale);
      const dx = Math.round(campPotWorldX + ox * u - decorScroll - drawW / 2);
      if (dx + drawW < 0 || dx > width) {
        return;
      }
      ctx.drawImage(img, dx, height - drawH, drawW, drawH);
    };
    GROVE_APPLES.forEach((tree) => drawTree(groveAppleImg, tree.ox, tree.scale));
    drawTree(groveWillowImg, GROVE_WILLOW_OX, GROVE_WILLOW_SCALE);
  }

  function paintTown(ctx, height) {
    if (!campActive || landmarkKind !== 'town' || townHouseImgs.length !== TOWN_HOUSES.length) {
      return;
    }
    const width = Math.max(1, Math.round(appEl.clientWidth));
    const u = campUnit();
    TOWN_HOUSES.forEach((house, index) => {
      const img = townHouseImgs[index];
      if (!img) {
        return;
      }
      const drawW = Math.round((img.naturalWidth || img.width) * house.scale);
      const drawH = Math.round((img.naturalHeight || img.height) * house.scale);
      const dx = Math.round(campPotWorldX + house.ox * u - decorScroll - drawW / 2);
      if (dx + drawW < 0 || dx > width) {
        return;
      }
      ctx.drawImage(img, dx, height - drawH, drawW, drawH);
    });
  }

  function paintTentCamp(ctx, height) {
    if (!campActive || landmarkKind !== 'tent' || !tentSmallImg || !tentLargeImg) {
      return;
    }
    const width = Math.max(1, Math.round(appEl.clientWidth));
    const u = campUnit();
    const drawTent = (img, ox, scale) => {
      const naturalW = img.naturalWidth || img.width;
      const naturalH = img.naturalHeight || img.height;
      const drawW = Math.round(naturalW * scale);
      const drawH = Math.round(naturalH * scale);
      const dx = Math.round(campPotWorldX + ox * u - decorScroll - drawW / 2);
      if (dx + drawW < 0 || dx > width) {
        return;
      }
      ctx.drawImage(img, dx, height - drawH, drawW, drawH);
    };
    drawTent(tentSmallImg, TENT_SMALL_OX, TENT_DISPLAY_SCALE * 2);
    drawTent(tentLargeImg, TENT_LARGE_OX, TENT_DISPLAY_SCALE);
  }

  function paintStoneWayside(ctx, height) {
    if (!campActive || landmarkKind !== 'stone' || !decorImg || !decorCell) {
      return;
    }
    const width = Math.max(1, Math.round(appEl.clientWidth));
    const u = campUnit();
    const piece = STONE_DECOR;
    const sizeW = piece.w * u;
    const sizeH = piece.h * u;
    const dx = Math.round(campPotWorldX + piece.ox * u - decorScroll);
    if (dx + sizeW < 0 || dx > width) {
      return;
    }
    const dy = height - sizeH;
    ctx.drawImage(
      decorImg,
      piece.col * decorCell,
      piece.row * decorCell,
      piece.w * decorCell,
      piece.h * decorCell,
      dx,
      dy,
      sizeW,
      sizeH
    );
  }

  function paintVillageLayout(ctx, height, buildings) {
    if (!campActive || !buildings || !buildings.length) {
      return;
    }
    const width = Math.max(1, Math.round(appEl.clientWidth));
    const u = campUnit();
    buildings.forEach((b) => {
      const img = villageArtImgs[b.key];
      if (!img) {
        return;
      }
      const drawW = Math.round((img.naturalWidth || img.width) * b.scale);
      const drawH = Math.round((img.naturalHeight || img.height) * b.scale);
      const dx = Math.round(campPotWorldX + b.ox * u - decorScroll - drawW / 2);
      if (dx + drawW < 0 || dx > width) {
        return;
      }
      ctx.drawImage(img, dx, height - drawH, drawW, drawH);
    });
  }

  function paintMarketVillage(ctx, height) {
    if (landmarkKind !== 'market') {
      return;
    }
    paintVillageLayout(ctx, height, MARKET_BUILDINGS);
  }

  function paintCloisterVillage(ctx, height) {
    if (landmarkKind !== 'cloister') {
      return;
    }
    paintVillageLayout(ctx, height, CLOISTER_BUILDINGS);
  }

  function paintWaysideStop(ctx, height, kind) {
    if (!campActive || landmarkKind !== kind || !WAYSIDE_STOPS[kind]) {
      return;
    }
    const stop = WAYSIDE_STOPS[kind];
    const width = Math.max(1, Math.round(appEl.clientWidth));
    const u = campUnit();
    const buildingImg =
      stop.decor === 'shop' ? shopImg : stop.decor === 'stable' ? stableImg : null;
    if (buildingImg) {
      const naturalW = buildingImg.naturalWidth || buildingImg.width;
      const naturalH = buildingImg.naturalHeight || buildingImg.height;
      const drawW = Math.round(naturalW * WAYSIDE_BUILDING_SCALE);
      const drawH = Math.round(naturalH * WAYSIDE_BUILDING_SCALE);
      const dx = Math.round(campPotWorldX - 0.35 * u - decorScroll - drawW / 2);
      if (dx + drawW >= 0 && dx <= width) {
        ctx.drawImage(buildingImg, dx, height - drawH, drawW, drawH);
      }
    }
    if (!decorImg || !decorCell) {
      return;
    }
    WAYSIDE_TUFTS.forEach((piece) => {
      const sizeW = piece.w * u;
      const sizeH = piece.h * u;
      const dx = Math.round(campPotWorldX + piece.ox * u - decorScroll);
      if (dx + sizeW < 0 || dx > width) {
        return;
      }
      ctx.drawImage(
        decorImg,
        piece.col * decorCell,
        piece.row * decorCell,
        piece.w * decorCell,
        piece.h * decorCell,
        dx,
        height - sizeH,
        sizeW,
        sizeH
      );
    });
  }

  function paintAllWaysideStops(ctx, height) {
    Object.keys(WAYSIDE_STOPS).forEach((kind) => paintWaysideStop(ctx, height, kind));
  }

  function positionCampNpc() {
    if (
      !campNpcEl ||
      !campActive ||
      landmarkKind !== 'camp' ||
      hasRecruitedKind(latestState, 'camp')
    ) {
      if (campNpcEl && !hasRecruitedKind(latestState, 'camp') && !recruitBusy) {
        // Leave alone if this canvas is an active trail companion.
        if (!activeCompanionSlots(latestState).some((s) => s.el === campNpcEl)) {
          campNpcEl.hidden = true;
        }
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
        !hasRecruitedKind(latestState, 'grove')
    );
  }

  function positionGroveNpc() {
    if (!companion2El) {
      return;
    }
    if (!shouldShowGroveNpc()) {
      if (!activeCompanionSlots(latestState).some((s) => s.el === companion2El)) {
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

  function shouldShowTownNpc() {
    return Boolean(
      campActive &&
        landmarkKind === 'town' &&
        latestState &&
        !hasRecruitedKind(latestState, 'town')
    );
  }

  function positionTownNpc() {
    if (!companion3El) {
      return;
    }
    if (!shouldShowTownNpc()) {
      if (!activeCompanionSlots(latestState).some((s) => s.el === companion3El)) {
        companion3El.hidden = true;
      }
      return;
    }
    const u = campUnit();
    const screenX = Math.round(campPotWorldX + TOWN_NPC_OX * u - decorScroll);
    companion3El.hidden = false;
    companion3El.style.left = `${screenX}px`;
    companion3El.style.bottom = '0';
  }

  function shouldShowTentNpc() {
    return Boolean(
      campActive &&
        landmarkKind === 'tent' &&
        latestState &&
        !hasRecruitedKind(latestState, 'tent')
    );
  }

  function positionTentNpc() {
    if (!companion4El) {
      return;
    }
    if (!shouldShowTentNpc()) {
      if (!activeCompanionSlots(latestState).some((s) => s.el === companion4El)) {
        companion4El.hidden = true;
      }
      return;
    }
    const u = campUnit();
    const screenX = Math.round(campPotWorldX + TENT_NPC_OX * u - decorScroll);
    companion4El.hidden = false;
    companion4El.style.left = `${screenX}px`;
    companion4El.style.bottom = '0';
  }

  function shouldShowStoneNpc() {
    return Boolean(
      campActive &&
        landmarkKind === 'stone' &&
        latestState &&
        !hasRecruitedKind(latestState, 'stone')
    );
  }

  function positionStoneNpc() {
    if (!companion5El) {
      return;
    }
    if (!shouldShowStoneNpc()) {
      if (!activeCompanionSlots(latestState).some((s) => s.el === companion5El)) {
        companion5El.hidden = true;
      }
      return;
    }
    const u = campUnit();
    const screenX = Math.round(campPotWorldX + STONE_NPC_OX * u - decorScroll);
    companion5El.hidden = false;
    companion5El.style.left = `${screenX}px`;
    companion5El.style.bottom = '0';
  }

  function shouldShowBishopNpc() {
    return Boolean(
      campActive &&
        landmarkKind === 'market' &&
        latestState &&
        !hasRecruitedKind(latestState, 'market')
    );
  }

  function positionBishopNpc() {
    if (!companion6El) {
      return;
    }
    if (!shouldShowBishopNpc()) {
      if (!activeCompanionSlots(latestState).some((s) => s.el === companion6El)) {
        companion6El.hidden = true;
      }
      return;
    }
    const u = campUnit();
    const screenX = Math.round(campPotWorldX + BISHOP_NPC_OX * u - decorScroll);
    companion6El.hidden = false;
    companion6El.style.left = `${screenX}px`;
    companion6El.style.bottom = '0';
  }

  function shouldShowNunNpc() {
    return Boolean(
      campActive &&
        landmarkKind === 'cloister' &&
        latestState &&
        !hasRecruitedKind(latestState, 'cloister')
    );
  }

  function positionNunNpc() {
    if (!companion7El) {
      return;
    }
    if (!shouldShowNunNpc()) {
      if (!activeCompanionSlots(latestState).some((s) => s.el === companion7El)) {
        companion7El.hidden = true;
      }
      return;
    }
    const u = campUnit();
    const screenX = Math.round(campPotWorldX + NUN_NPC_OX * u - decorScroll);
    companion7El.hidden = false;
    companion7El.style.left = `${screenX}px`;
    companion7El.style.bottom = '0';
  }

  function shouldShowWaysideNpc(kind) {
    return Boolean(
      campActive &&
        WAYSIDE_STOPS[kind] &&
        landmarkKind === kind &&
        latestState &&
        !hasRecruitedKind(latestState, kind)
    );
  }

  function positionWaysideNpc(kind) {
    const stop = WAYSIDE_STOPS[kind];
    if (!stop || !stop.el) {
      return;
    }
    if (!shouldShowWaysideNpc(kind)) {
      if (!activeCompanionSlots(latestState).some((s) => s.el === stop.el)) {
        stop.el.hidden = true;
      }
      return;
    }
    const u = campUnit();
    const screenX = Math.round(campPotWorldX + stop.ox * u - decorScroll);
    stop.el.hidden = false;
    stop.el.style.left = `${screenX}px`;
    stop.el.style.bottom = '0';
  }

  function positionAllWaysideNpcs() {
    Object.keys(WAYSIDE_STOPS).forEach((kind) => positionWaysideNpc(kind));
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

  function positionTownExtra(extra, frameIndex) {
    const el = extra.el;
    if (!el || !campActive || !campChars1Image) {
      if (el) {
        el.hidden = true;
      }
      return;
    }
    if (landmarkKind !== 'town' && landmarkKind !== 'market' && landmarkKind !== 'cloister') {
      el.hidden = true;
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

  function crowdExtrasForLandmark() {
    if (landmarkKind === 'town') {
      return TOWN_EXTRAS;
    }
    if (landmarkKind === 'market') {
      return MARKET_EXTRAS;
    }
    if (landmarkKind === 'cloister') {
      return CLOISTER_EXTRAS;
    }
    return null;
  }

  function positionAllTownExtras(frameIndex) {
    const list = crowdExtrasForLandmark();
    if (!list) {
      hideAllTownExtras();
      return;
    }
    list.forEach((extra) => positionTownExtra(extra, frameIndex));
  }

  function hideAllTownExtras() {
    TOWN_EXTRAS.forEach((extra) => {
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
    if (!campNpcEl || !campNpcImage || hasRecruitedKind(latestState, 'camp')) {
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

  function drawTownNpcFrame(frameIndex) {
    if (!companion3El || !townFemaleImage || !shouldShowTownNpc()) {
      return;
    }
    const img = townFemaleImage;
    const cellW = Math.floor(img.naturalWidth / 12);
    const cellH = Math.floor(img.naturalHeight / 14);
    const row = TOWN_NPC_ROWS[frameIndex % TOWN_NPC_ROWS.length];
    const dpr = window.devicePixelRatio || 1;
    const size = SPRITE_DISPLAY;
    companion3El.width = Math.round(size * dpr);
    companion3El.height = Math.round(size * dpr);
    companion3El.style.width = `${size}px`;
    companion3El.style.height = `${size}px`;
    const ctx = companion3El.getContext('2d');
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.imageSmoothingEnabled = false;
    ctx.clearRect(0, 0, size, size);
    if (npcFaceRight) {
      ctx.save();
      ctx.translate(size, 0);
      ctx.scale(-1, 1);
      ctx.drawImage(img, TOWN_NPC_COL * cellW, row * cellH, cellW, cellH, 0, 0, size, size);
      ctx.restore();
    } else {
      ctx.drawImage(img, TOWN_NPC_COL * cellW, row * cellH, cellW, cellH, 0, 0, size, size);
    }
  }

  function drawTentNpcFrame(frameIndex) {
    if (!companion4El || !campNpcImage || !shouldShowTentNpc()) {
      return;
    }
    const img = campNpcImage;
    const cols = 11;
    const rows = 14;
    const cellW = Math.floor(img.naturalWidth / cols);
    const cellH = Math.floor(img.naturalHeight / rows);
    const row = TENT_NPC_ROWS[frameIndex % TENT_NPC_ROWS.length];
    const dpr = window.devicePixelRatio || 1;
    const size = SPRITE_DISPLAY;
    companion4El.width = Math.round(size * dpr);
    companion4El.height = Math.round(size * dpr);
    companion4El.style.width = `${size}px`;
    companion4El.style.height = `${size}px`;
    const ctx = companion4El.getContext('2d');
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.imageSmoothingEnabled = false;
    ctx.clearRect(0, 0, size, size);
    if (npcFaceRight) {
      ctx.save();
      ctx.translate(size, 0);
      ctx.scale(-1, 1);
      ctx.drawImage(img, TENT_NPC_COL * cellW, row * cellH, cellW, cellH, 0, 0, size, size);
      ctx.restore();
    } else {
      ctx.drawImage(img, TENT_NPC_COL * cellW, row * cellH, cellW, cellH, 0, 0, size, size);
    }
  }

  function drawStoneNpcFrame(frameIndex) {
    if (!companion5El || !shouldShowStoneNpc()) {
      return;
    }
    const img = groveFemaleImage || (findCharacter('female-0') || {}).sheetImage;
    if (!img) {
      return;
    }
    const cellW = Math.floor(img.naturalWidth / 12);
    const cellH = Math.floor(img.naturalHeight / 14);
    const row = STONE_NPC_ROWS[frameIndex % STONE_NPC_ROWS.length];
    const dpr = window.devicePixelRatio || 1;
    const size = SPRITE_DISPLAY;
    companion5El.width = Math.round(size * dpr);
    companion5El.height = Math.round(size * dpr);
    companion5El.style.width = `${size}px`;
    companion5El.style.height = `${size}px`;
    const ctx = companion5El.getContext('2d');
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.imageSmoothingEnabled = false;
    ctx.clearRect(0, 0, size, size);
    if (npcFaceRight) {
      ctx.save();
      ctx.translate(size, 0);
      ctx.scale(-1, 1);
      ctx.drawImage(img, STONE_NPC_COL * cellW, row * cellH, cellW, cellH, 0, 0, size, size);
      ctx.restore();
    } else {
      ctx.drawImage(img, STONE_NPC_COL * cellW, row * cellH, cellW, cellH, 0, 0, size, size);
    }
  }

  function drawBishopNpcFrame(frameIndex) {
    if (!companion6El || !campNpcImage || !shouldShowBishopNpc()) {
      return;
    }
    const img = campNpcImage;
    const cols = 11;
    const cellW = Math.floor(img.naturalWidth / cols);
    const cellH = Math.floor(img.naturalHeight / 14);
    const row = BISHOP_NPC_ROWS[frameIndex % BISHOP_NPC_ROWS.length];
    const dpr = window.devicePixelRatio || 1;
    const size = SPRITE_DISPLAY;
    companion6El.width = Math.round(size * dpr);
    companion6El.height = Math.round(size * dpr);
    companion6El.style.width = `${size}px`;
    companion6El.style.height = `${size}px`;
    const ctx = companion6El.getContext('2d');
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.imageSmoothingEnabled = false;
    ctx.clearRect(0, 0, size, size);
    if (npcFaceRight) {
      ctx.save();
      ctx.translate(size, 0);
      ctx.scale(-1, 1);
      ctx.drawImage(img, BISHOP_NPC_COL * cellW, row * cellH, cellW, cellH, 0, 0, size, size);
      ctx.restore();
    } else {
      ctx.drawImage(img, BISHOP_NPC_COL * cellW, row * cellH, cellW, cellH, 0, 0, size, size);
    }
  }

  function drawNunNpcFrame(frameIndex) {
    if (!companion7El || !shouldShowNunNpc()) {
      return;
    }
    const img = groveFemaleImage || (findCharacter('female-0') || {}).sheetImage;
    if (!img) {
      return;
    }
    const cellW = Math.floor(img.naturalWidth / 12);
    const cellH = Math.floor(img.naturalHeight / 14);
    const row = NUN_NPC_ROWS[frameIndex % NUN_NPC_ROWS.length];
    const dpr = window.devicePixelRatio || 1;
    const size = SPRITE_DISPLAY;
    companion7El.width = Math.round(size * dpr);
    companion7El.height = Math.round(size * dpr);
    companion7El.style.width = `${size}px`;
    companion7El.style.height = `${size}px`;
    const ctx = companion7El.getContext('2d');
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.imageSmoothingEnabled = false;
    ctx.clearRect(0, 0, size, size);
    if (npcFaceRight) {
      ctx.save();
      ctx.translate(size, 0);
      ctx.scale(-1, 1);
      ctx.drawImage(img, NUN_NPC_COL * cellW, row * cellH, cellW, cellH, 0, 0, size, size);
      ctx.restore();
    } else {
      ctx.drawImage(img, NUN_NPC_COL * cellW, row * cellH, cellW, cellH, 0, 0, size, size);
    }
  }

  function drawWaysideNpcFrame(kind, frameIndex) {
    const stop = WAYSIDE_STOPS[kind];
    if (!stop || !stop.el || !shouldShowWaysideNpc(kind)) {
      return;
    }
    const img =
      stop.sheet === 'female'
        ? groveFemaleImage || (findCharacter('female-0') || {}).sheetImage
        : campNpcImage;
    if (!img) {
      return;
    }
    const cols = stop.sheet === 'female' ? 12 : 11;
    const cellW = Math.floor(img.naturalWidth / cols);
    const cellH = Math.floor(img.naturalHeight / 14);
    const row = WAYSIDE_NPC_ROWS[frameIndex % WAYSIDE_NPC_ROWS.length];
    const dpr = window.devicePixelRatio || 1;
    const size = SPRITE_DISPLAY;
    const el = stop.el;
    el.width = Math.round(size * dpr);
    el.height = Math.round(size * dpr);
    el.style.width = `${size}px`;
    el.style.height = `${size}px`;
    const ctx = el.getContext('2d');
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.imageSmoothingEnabled = false;
    ctx.clearRect(0, 0, size, size);
    if (npcFaceRight) {
      ctx.save();
      ctx.translate(size, 0);
      ctx.scale(-1, 1);
      ctx.drawImage(img, stop.col * cellW, row * cellH, cellW, cellH, 0, 0, size, size);
      ctx.restore();
    } else {
      ctx.drawImage(img, stop.col * cellW, row * cellH, cellW, cellH, 0, 0, size, size);
    }
  }

  function drawCompanionWalkFrame(slot, frameIndex, options) {
    const el = slot && slot.el;
    const image =
      slot && slot.sheet === 'female'
        ? (findCharacter('female-0') || {}).sheetImage
        : campNpcImage;
    const active = activeCompanionSlots(latestState);
    if (!el || !image || !active.some((s) => s.id === slot.id)) {
      return;
    }
    const idle = Boolean(options && options.idle);
    const img = image;
    const cols = slot.sheet === 'female' ? 12 : 11;
    const rows = 14;
    const cellW = Math.floor(img.naturalWidth / cols);
    const cellH = Math.floor(img.naturalHeight / rows);
    const row = idle
      ? IDLE_NPC_ROWS[frameIndex % IDLE_NPC_ROWS.length]
      : WALK_ROW_START + (frameIndex % WALK_FRAME_COUNT);
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
    activeCompanionSlots(latestState).forEach((slot) => drawCompanionWalkFrame(slot, frameIndex));
  }

  function drawActiveCompanionIdleFrames(frameIndex) {
    activeCompanionSlots(latestState).forEach((slot) =>
      drawCompanionWalkFrame(slot, frameIndex, { idle: true })
    );
  }

  function isLandmarkIdleEl(el) {
    if (!el || !latestState) {
      return false;
    }
    const kind = Object.keys(COMPANION_BY_KIND).find((k) => COMPANION_BY_KIND[k].el === el);
    if (!kind) {
      return false;
    }
    if (recruitBusy && landmarkKind === kind) {
      return true;
    }
    return Boolean(
      campActive && landmarkKind === kind && !hasRecruitedKind(latestState, kind)
    );
  }

  function syncRecruitFocusClass() {
    Object.keys(COMPANION_BY_KIND).forEach((kind) => {
      const el = COMPANION_BY_KIND[kind].el;
      if (!el) {
        return;
      }
      el.classList.toggle('recruit-focus', isLandmarkIdleEl(el));
    });
  }

  function readElLeft(el) {
    if (!el) {
      return 0;
    }
    const parsed = parseFloat(el.style.left);
    if (Number.isFinite(parsed)) {
      return parsed;
    }
    return el.offsetLeft || 0;
  }

  function companionSlotTargetLeft(slot, index, petLeft) {
    if (slot.side === 'right') {
      return petLeft + SPRITE_DISPLAY * 0.72 + index * COMPANION_FOLLOW_GAP;
    }
    // Allow off-screen left — never stack at a floor.
    return petLeft - (index + 1) * COMPANION_FOLLOW_GAP;
  }

  function stopCompanionFormationEase() {
    if (companionFormationAnimId !== null) {
      cancelAnimationFrame(companionFormationAnimId);
      companionFormationAnimId = null;
    }
    companionFormationEasing = false;
  }

  function hideInactiveCompanionEls(activeEls) {
    Object.keys(COMPANION_BY_KIND).forEach((kind) => {
      const el = COMPANION_BY_KIND[kind].el;
      if (el && !activeEls.has(el) && !isLandmarkIdleEl(el)) {
        el.hidden = true;
      }
    });
  }

  function positionCompanionsBehindPet() {
    if (!petEl) {
      return;
    }
    const petLeft = petEl.offsetLeft;
    const active = activeCompanionSlots(latestState);
    const activeEls = new Set(active.map((slot) => slot.el));
    hideInactiveCompanionEls(activeEls);
    if (companionFormationEasing) {
      syncRecruitFocusClass();
      return;
    }
    const rightSlots = active.filter((slot) => slot.side === 'right');
    const leftSlots = active.filter((slot) => slot.side !== 'right');
    rightSlots.forEach((slot, index) => {
      const el = slot.el;
      const left = companionSlotTargetLeft(slot, index, petLeft);
      el.hidden = false;
      el.style.left = `${Math.round(left)}px`;
      el.style.bottom = '0';
    });
    leftSlots.forEach((slot, index) => {
      const el = slot.el;
      const left = companionSlotTargetLeft(slot, index, petLeft);
      el.hidden = false;
      el.style.left = `${Math.round(left)}px`;
      el.style.bottom = '0';
    });
    syncRecruitFocusClass();
  }

  /** Ease every squad member from their current X into trail gaps (may go off-screen left). */
  function startCompanionFormationEase() {
    stopCompanionFormationEase();
    if (!petEl || !hasActiveCompanionSlots()) {
      return;
    }
    companionFormationEasing = true;
    let lastTs = 0;
    const tick = (timestamp) => {
      if (!companionFormationEasing || !petEl) {
        companionFormationAnimId = null;
        return;
      }
      const dt = lastTs > 0 ? Math.min(0.05, (timestamp - lastTs) / 1000) : 0.016;
      lastTs = timestamp;
      const petLeft = petEl.offsetLeft;
      const active = activeCompanionSlots(latestState);
      const activeEls = new Set(active.map((slot) => slot.el));
      hideInactiveCompanionEls(activeEls);
      let allDone = true;
      const place = (slots) => {
        slots.forEach((slot, index) => {
          const el = slot.el;
          if (!el) {
            return;
          }
          el.hidden = false;
          el.style.bottom = '0';
          const target = companionSlotTargetLeft(slot, index, petLeft);
          const cur = readElLeft(el);
          const diff = target - cur;
          if (Math.abs(diff) > 0.75) {
            allDone = false;
            const step =
              Math.sign(diff) * Math.min(Math.abs(diff), COMPANION_FORM_EASE_MAX * dt);
            el.style.left = `${Math.round(cur + step)}px`;
          } else {
            el.style.left = `${Math.round(target)}px`;
          }
        });
      };
      place(active.filter((slot) => slot.side === 'right'));
      place(active.filter((slot) => slot.side !== 'right'));
      syncRecruitFocusClass();
      const cameraDone = Math.abs(petLeadLeft - petLeadLeftTarget) < 0.5 && cameraAnimId === null;
      if (allDone && cameraDone) {
        companionFormationEasing = false;
        companionFormationAnimId = null;
        // Already on targets — settle without a visible teleport.
        positionCompanionsBehindPet();
        return;
      }
      companionFormationAnimId = requestAnimationFrame(tick);
    };
    companionFormationAnimId = requestAnimationFrame(tick);
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
      if (campActive && landmarkKind === 'camp' && !hasRecruitedKind(latestState, 'camp')) {
        drawCampNpcFrame(campNpcFrame);
        positionCampNpc();
      }
      if (shouldShowGroveNpc()) {
        drawGroveNpcFrame(campNpcFrame);
        positionGroveNpc();
      }
      if (shouldShowTownNpc()) {
        drawTownNpcFrame(campNpcFrame);
        positionTownNpc();
      }
      if (shouldShowTentNpc()) {
        drawTentNpcFrame(campNpcFrame);
        positionTentNpc();
      }
      if (shouldShowStoneNpc()) {
        drawStoneNpcFrame(campNpcFrame);
        positionStoneNpc();
      }
      if (shouldShowBishopNpc()) {
        drawBishopNpcFrame(campNpcFrame);
        positionBishopNpc();
      }
      if (shouldShowNunNpc()) {
        drawNunNpcFrame(campNpcFrame);
        positionNunNpc();
      }
      if (WAYSIDE_STOPS[landmarkKind]) {
        drawWaysideNpcFrame(landmarkKind, campNpcFrame);
        positionWaysideNpc(landmarkKind);
      }
      if (campActive && landmarkKind === 'camp') {
        positionAllCampExtras(campNpcFrame);
      }
      if (
        campActive &&
        (landmarkKind === 'town' || landmarkKind === 'market' || landmarkKind === 'cloister')
      ) {
        positionAllTownExtras(campNpcFrame);
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
    TOWN_EXTRAS.forEach((extra) => {
      extra.el = document.getElementById(extra.id);
    });
    MARKET_EXTRAS.forEach((extra, index) => {
      extra.el = TOWN_EXTRAS[index] ? TOWN_EXTRAS[index].el : document.getElementById(extra.id);
    });
    CLOISTER_EXTRAS.forEach((extra, index) => {
      extra.el = TOWN_EXTRAS[index] ? TOWN_EXTRAS[index].el : document.getElementById(extra.id);
    });
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
      positionAllTownExtras(campNpcFrame);
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

  async function prepareTownArt() {
    const femaleSrc = appEl.getAttribute('data-female-sheet') || appEl.dataset.femaleSheet;
    townHouseImgs = await Promise.all(
      TOWN_HOUSES.map((house) => {
        const src = appEl.getAttribute(`data-${house.id}`) || appEl.dataset[house.id];
        if (!src) {
          throw new Error(`Missing data-${house.id}`);
        }
        return loadImage(src);
      })
    );
    if (femaleSrc) {
      townFemaleImage = await loadImage(femaleSrc);
    }
    if (campActive) {
      startCampNpcAnim();
      paintDecor();
    }
  }

  async function prepareTentArt() {
    const smallSrc = appEl.getAttribute('data-tent-small') || appEl.dataset.tentSmall;
    const largeSrc = appEl.getAttribute('data-tent-large') || appEl.dataset.tentLarge;
    if (smallSrc) {
      tentSmallImg = makeBlackTransparent(await loadImage(smallSrc));
    }
    if (largeSrc) {
      tentLargeImg = makeBlackTransparent(await loadImage(largeSrc));
    }
    if (campActive) {
      startCampNpcAnim();
      paintDecor();
    }
  }

  async function prepareVillageArt() {
    const keys = [
      ['house-1', 'data-house-1', 'house1'],
      ['house-2', 'data-house-2', 'house2'],
      ['house-3', 'data-house-3', 'house3'],
      ['house-4', 'data-house-4', 'house4'],
      ['house-5', 'data-house-5', 'house5'],
      ['house-6', 'data-house-6', 'house6'],
      ['stall-1', 'data-stall-1', 'stall1'],
      ['stall-2', 'data-stall-2', 'stall2'],
      ['stall-3', 'data-stall-3', 'stall3'],
      ['tavern-1', 'data-tavern-1', 'tavern1'],
      ['tavern-2', 'data-tavern-2', 'tavern2'],
    ];
    const loaded = {};
    await Promise.all(
      keys.map(async ([key, attr, datasetKey]) => {
        const src = appEl.getAttribute(attr) || appEl.dataset[datasetKey];
        if (!src) {
          return;
        }
        loaded[key] = await loadImage(src);
      })
    );
    villageArtImgs = loaded;
    // Reuse house images already loaded for River Town when present.
    if (townHouseImgs && townHouseImgs.length === TOWN_HOUSES.length) {
      TOWN_HOUSES.forEach((house, index) => {
        if (!villageArtImgs[house.id] && townHouseImgs[index]) {
          villageArtImgs[house.id] = townHouseImgs[index];
        }
      });
    }
    if (campActive) {
      startCampNpcAnim();
      paintDecor();
    }
  }

  async function prepareWaysideArt() {
    const shopSrc = appEl.getAttribute('data-shop') || appEl.dataset.shop;
    const stableSrc = appEl.getAttribute('data-stable') || appEl.dataset.stable;
    if (shopSrc) {
      shopImg = makeBlackTransparent(await loadImage(shopSrc));
    }
    if (stableSrc) {
      stableImg = makeBlackTransparent(await loadImage(stableSrc));
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
    landmarkLinger = false;
    campActive = true;
    landmarkKind = landmarkKindForState(latestState);
    startCampNpcAnim();
    positionDepartButton();
    paintDecor();
    updateMetersUi(latestState);
    startPartyIdleAnim();
  }

  function clearCamp() {
    // Never tear down mid meet-and-greet — that aborted recruitment before.
    if (recruitBusy) {
      return;
    }
    stopCompanionFormationEase();
    campActive = false;
    landmarkKind = null;
    campWorldLocked = false;
    landmarkLinger = false;
    stopCampNpcAnim();
    hideAllCampExtras();
    hideAllTownExtras();
    Object.keys(COMPANION_BY_KIND).forEach((kind) => {
      const el = COMPANION_BY_KIND[kind].el;
      if (el && !hasRecruitedKind(latestState, kind)) {
        el.hidden = true;
      }
    });
    if (departBtnEl) {
      departBtnEl.hidden = true;
    }
  }

  function resumeAfterDepart(state, options) {
    const keepDeparting = Boolean(options && options.keepDeparting);
    if (!keepDeparting) {
      departing = false;
    }
    stopPartyIdleAnim();
    if (departBtnEl) {
      departBtnEl.disabled = false;
      departBtnEl.hidden = true;
    }
    latestState = state;
    traveledPx = 0;
    // Keep the landmark we just left until it scrolls off-screen.
    if (campActive && landmarkKind) {
      landmarkLinger = true;
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
    const wayside = WAYSIDE_STOPS[landmarkKind];
    const npcOffset = wayside
      ? wayside.ox
      : landmarkKind === 'grove'
        ? GROVE_NPC_OX
        : landmarkKind === 'town'
          ? TOWN_NPC_OX
          : landmarkKind === 'tent'
            ? TENT_NPC_OX
            : landmarkKind === 'stone'
              ? STONE_NPC_OX
              : landmarkKind === 'market'
                ? BISHOP_NPC_OX
                : landmarkKind === 'cloister'
                  ? NUN_NPC_OX
                  : 0.85;
    return Math.round(campPotWorldX + npcOffset * u - decorScroll);
  }

  /** Recruit is close enough to speak / join (tighter than trail follow gap). */
  function recruitAtFollowSlot(recruitSlotIndex) {
    const petLeft = petEl ? petEl.offsetLeft : petLeadLeft;
    void recruitSlotIndex;
    if (landmarkKind === 'tent') {
      return getRecruitScreenLeft() <= petLeft + RECRUIT_SPEAK_GAP + 0.5;
    }
    return getRecruitScreenLeft() <= petLeft - RECRUIT_SPEAK_GAP + 0.5;
  }

  function positionRecruitNpc() {
    if (WAYSIDE_STOPS[landmarkKind]) {
      positionWaysideNpc(landmarkKind);
    } else if (landmarkKind === 'grove') {
      positionGroveNpc();
    } else if (landmarkKind === 'town') {
      positionTownNpc();
    } else if (landmarkKind === 'tent') {
      positionTentNpc();
    } else if (landmarkKind === 'stone') {
      positionStoneNpc();
    } else if (landmarkKind === 'market') {
      positionBishopNpc();
    } else if (landmarkKind === 'cloister') {
      positionNunNpc();
    } else {
      positionCampNpc();
    }
    syncRecruitFocusClass();
  }

  function cancelCameraEase() {
    if (cameraAnimId !== null) {
      cancelAnimationFrame(cameraAnimId);
      cameraAnimId = null;
    }
    startCameraEase._queue = [];
  }

  function recruitSpeakLeftTarget() {
    const recruitX = getRecruitScreenLeft();
    if (landmarkKind === 'tent') {
      return Math.max(8, Math.min(petLeadLeft, recruitX - SPRITE_DISPLAY * 0.85));
    }
    return Math.max(8, recruitX - SPRITE_DISPLAY - RECRUIT_SPEAK_GAP);
  }

  function drawRecruitNpcFrame(frameIndex) {
    if (WAYSIDE_STOPS[landmarkKind]) {
      drawWaysideNpcFrame(landmarkKind, frameIndex);
    } else if (landmarkKind === 'grove') {
      drawGroveNpcFrame(frameIndex);
    } else if (landmarkKind === 'town') {
      drawTownNpcFrame(frameIndex);
    } else if (landmarkKind === 'tent') {
      drawTentNpcFrame(frameIndex);
    } else if (landmarkKind === 'stone') {
      drawStoneNpcFrame(frameIndex);
    } else if (landmarkKind === 'market') {
      drawBishopNpcFrame(frameIndex);
    } else if (landmarkKind === 'cloister') {
      drawNunNpcFrame(frameIndex);
    } else {
      drawCampNpcFrame(frameIndex);
    }
  }

  function startRecruitCeremony(joinedState, options) {
    const joinPartySize = (options && options.joinPartySize) || 2;
    // No face/approach cutscene: keep walking, open a squad gap, ease recruit in.
    recruitJoinedState = joinedState;
    stopPartyIdleAnim();
    if (departBtnEl) {
      departBtnEl.hidden = true;
      departBtnEl.disabled = true;
    }
    campWorldLocked = true;
    campActive = true;
    petFaceRight = true;
    npcFaceRight = landmarkKind === 'tent';
    // Leave recruit at landmark screen X; finishRecruitCeremony eases into formation.
    finishRecruitCeremony(joinPartySize);
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
      const partySize = Math.max(joined.partySize || 1, joinPartySize || 2);
      const recruitLandmarkOrder = recruitLandmarkOrderFromState(joined);
      latestState = {
        ...joined,
        partySize,
        awaitingDeparture: false,
        screen: activeScreen || joined.screen || 'home',
        recruitLandmarkOrder,
        leftTrailOrder: normalizeLeftTrailOrder(
          joined.leftTrailOrder,
          partySize,
          recruitLandmarkOrder
        ),
      };
    } else if (latestState) {
      const partySize = Math.max(latestState.partySize || 1, joinPartySize || 2);
      const recruitLandmarkOrder = recruitLandmarkOrderFromState(latestState);
      latestState = {
        ...latestState,
        partySize,
        awaitingDeparture: false,
        recruitLandmarkOrder,
        leftTrailOrder: normalizeLeftTrailOrder(
          latestState.leftTrailOrder,
          partySize,
          recruitLandmarkOrder
        ),
      };
    }
    departing = false;
    updateMetersUi(latestState);
    // Keep the departed location in world space so it scrolls away with the road.
    landmarkLinger = true;
    campWorldLocked = true;
    campActive = true;

    // Keep current pixel positions (recruit at landmark, trail where they stood)
    // and ease into formation — never snap/teleport into overlapping slots.
    companionFormationEasing = true;
    activeCompanionSlots(latestState).forEach((slot) => {
      if (slot.el) {
        slot.el.hidden = false;
        slot.el.style.bottom = '0';
      }
    });
    drawActiveCompanionWalkFrames(0);
    syncRecruitFocusClass();

    const character = findCharacter(latestState && latestState.characterId);
    if (character && character.sheetImage) {
      drawWalkFrame(character, 0, true);
    }

    setCameraTargetForParty(latestState.partySize || joinPartySize || 2);
    syncCampWorldPosition();
    paintDecor();

    if (latestState && latestState.characterId && (activeScreen || 'home') === 'home') {
      enableTravelAccrual();
      startWalkAnimation(latestState.characterId);
      startGroundScroll();
    }
    startCameraEase();
    startCompanionFormationEase();
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
    positionTownNpc();
    positionTentNpc();
    positionStoneNpc();
    positionBishopNpc();
    positionNunNpc();
    positionAllWaysideNpcs();
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
      paintTown(ctx, height);
      paintTentCamp(ctx, height);
      paintStoneWayside(ctx, height);
      paintMarketVillage(ctx, height);
      paintCloisterVillage(ctx, height);
      paintAllWaysideStops(ctx, height);
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
    const onGroundResize = () => {
      syncCloudDensity();
      paintParallax();
      paintGround();
      paintDecor();
      // Re-clamp lead so the hero stays visible when the sidebar narrows.
      if (latestState && !recruitBusy) {
        setCameraTargetForParty(latestState.partySize || 1);
        if (Math.abs(petLeadLeft - petLeadLeftTarget) > 0.5) {
          startCameraEase();
        } else {
          applyPetLeft(petLeadLeftTarget);
          if (hasActiveCompanionSlots()) {
            positionCompanionsBehindPet();
          }
        }
      }
    };
    if (typeof ResizeObserver !== 'undefined') {
      groundResizeObserver = new ResizeObserver(onGroundResize);
      groundResizeObserver.observe(appEl);
      if (gameWorldEl) {
        groundResizeObserver.observe(gameWorldEl);
      }
    } else {
      window.addEventListener('resize', onGroundResize);
    }
  }

  function setSelectingMode(isSelecting) {
    appEl.classList.toggle('selecting-character', isSelecting);
    statsEl.hidden = isSelecting;
    bottomBarEl.hidden = isSelecting;
    if (isSelecting) {
      stopGroundScroll();
      stopWalkAnimation();
      stopPartyIdleAnim();
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
    // Shop stays stubbed.
    if (screenId === 'shop') {
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
    if (screenId === 'feed') {
      renderSquadList();
    }

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

  function drawIdleFrame(character, frameIndex, faceRight) {
    if (!petSpriteEl || !character || !character.sheetImage) {
      return;
    }
    const face = faceRight !== false;
    const img = character.sheetImage;
    const cellW = Math.floor(img.naturalWidth / character.cols);
    const cellH = Math.floor(img.naturalHeight / character.rows);
    const row = IDLE_NPC_ROWS[frameIndex % IDLE_NPC_ROWS.length];
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
      ctx.drawImage(img, character.col * cellW, row * cellH, cellW, cellH, 0, 0, size, size);
      ctx.restore();
    } else {
      ctx.drawImage(img, character.col * cellW, row * cellH, cellW, cellH, 0, 0, size, size);
    }
  }

  function stopPartyIdleAnim() {
    if (partyIdleAnimId !== null) {
      cancelAnimationFrame(partyIdleAnimId);
      partyIdleAnimId = null;
    }
    partyIdleLastTs = 0;
  }

  function startPartyIdleAnim() {
    if (
      partyIdleAnimId !== null ||
      !latestState ||
      !latestState.characterId ||
      !latestState.awaitingDeparture ||
      recruitBusy ||
      departing
    ) {
      return;
    }
    stopWalkAnimation();
    const character = findCharacter(latestState.characterId);
    if (character && character.sheetImage) {
      drawIdleFrame(character, partyIdleFrame, true);
    }
    if (hasActiveCompanionSlots()) {
      drawActiveCompanionIdleFrames(partyIdleFrame);
      positionCompanionsBehindPet();
    }
    const tick = (timestamp) => {
      if (
        !latestState ||
        !latestState.awaitingDeparture ||
        recruitBusy ||
        departing ||
        appEl.classList.contains('selecting-character')
      ) {
        partyIdleAnimId = null;
        partyIdleLastTs = 0;
        return;
      }
      if (partyIdleLastTs > 0) {
        const frameDuration = 1000 / CAMP_NPC_FPS;
        while (timestamp - partyIdleLastTs >= frameDuration) {
          partyIdleFrame = (partyIdleFrame + 1) % IDLE_NPC_ROWS.length;
          partyIdleLastTs += frameDuration;
        }
      } else {
        partyIdleLastTs = timestamp;
      }
      const active = findCharacter(latestState.characterId);
      if (active && active.sheetImage) {
        drawIdleFrame(active, partyIdleFrame, true);
      }
      if (hasActiveCompanionSlots()) {
        drawActiveCompanionIdleFrames(partyIdleFrame);
        positionCompanionsBehindPet();
      }
      positionDepartButton();
      partyIdleAnimId = requestAnimationFrame(tick);
    };
    partyIdleAnimId = requestAnimationFrame(tick);
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
    stopPartyIdleAnim();

    if (activeWalkCharacterId !== characterId) {
      walkFrame = 0;
      activeWalkCharacterId = characterId;
      drawWalkFrame(character, walkFrame);
      if (hasActiveCompanionSlots()) {
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
      if (hasActiveCompanionSlots()) {
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

    if (shopStatusEl) {
      shopStatusEl.textContent = `The travelling merchant has not arrived yet.`;
    }
    if (activeScreen === 'feed') {
      renderSquadList();
    }
  }

  function squadPortraitSheet(sheetKey) {
    if (sheetKey === 'female') {
      return (findCharacter('female-0') || {}).sheetImage || groveFemaleImage;
    }
    return campNpcImage || (findCharacter('male-7') || {}).sheetImage;
  }

  function paintSquadPortrait(canvas, sheetKey, col) {
    if (!canvas) {
      return;
    }
    const img = squadPortraitSheet(sheetKey);
    const dpr = window.devicePixelRatio || 1;
    const size = 44;
    canvas.width = Math.round(size * dpr);
    canvas.height = Math.round(size * dpr);
    canvas.style.width = `${size}px`;
    canvas.style.height = `${size}px`;
    const ctx = canvas.getContext('2d');
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.imageSmoothingEnabled = false;
    ctx.clearRect(0, 0, size, size);
    if (!img) {
      return;
    }
    const cols = sheetKey === 'female' ? 12 : 11;
    const rows = 14;
    const cellW = Math.floor(img.naturalWidth / cols);
    const cellH = Math.floor(img.naturalHeight / rows);
    ctx.drawImage(img, col * cellW, 0, cellW, cellH, 0, 0, size, size);
  }

  function buildSquadRosterEntries(state) {
    if (!state || !state.characterId) {
      return [];
    }
    const entries = [];
    const party = companionCountFromState(state);
    const recruitLandmarkOrder = recruitLandmarkOrderFromState(state);
    if (hasRecruitedKind(state, 'tent')) {
      const flavor = SQUAD_FLAVOR.tent;
      entries.push({
        id: 'tent',
        kind: 'tent',
        locked: true,
        name: flavor.name,
        age: flavor.age,
        description: flavor.description,
        sheet: 'male',
        col: COMPANION_BY_KIND.tent.col,
      });
    }
    const hero = findCharacter(state.characterId);
    const heroFlavor = SQUAD_FLAVOR[state.characterId] || { age: 25, description: 'Leader of the travelling party.' };
    entries.push({
      id: 'hero',
      kind: 'hero',
      locked: true,
      name: displayName(state),
      age: heroFlavor.age,
      description: heroFlavor.description,
      sheet: hero && hero.id === 'male-7' ? 'male' : 'female',
      col: hero ? hero.col : 0,
    });
    const leftOrder = normalizeLeftTrailOrder(
      state.leftTrailOrder,
      party,
      recruitLandmarkOrder
    );
    leftOrder.forEach((kind) => {
      const slot = COMPANION_BY_KIND[kind];
      const flavor = SQUAD_FLAVOR[kind];
      if (!slot || !flavor) {
        return;
      }
      entries.push({
        id: kind,
        kind,
        locked: false,
        name: flavor.name,
        age: flavor.age,
        description: flavor.description,
        sheet: slot.sheet,
        col: slot.col,
      });
    });
    return entries;
  }

  function applyLeftTrailReorder(nextOrder) {
    if (!latestState) {
      return;
    }
    const party = companionCountFromState(latestState);
    const recruitLandmarkOrder = recruitLandmarkOrderFromState(latestState);
    const normalized = normalizeLeftTrailOrder(
      nextOrder,
      party,
      recruitLandmarkOrder
    );
    const expected = defaultLeftTrailOrderFromParty(party, recruitLandmarkOrder);
    if (normalized.length !== expected.length) {
      return;
    }
    latestState = { ...latestState, leftTrailOrder: normalized, recruitLandmarkOrder };
    renderSquadList();
    if (!companionFormationEasing) {
      setCameraTargetForParty(latestState.partySize || 1);
      startCompanionFormationEase();
      if (Math.abs(petLeadLeft - petLeadLeftTarget) > 0.5) {
        startCameraEase();
      }
    }
    vscode.postMessage({
      type: 'action',
      action: 'reorderParty',
      leftTrailOrder: normalized,
    });
  }

  function renderSquadList() {
    if (!squadListEl) {
      return;
    }
    const entries = buildSquadRosterEntries(latestState);
    squadListEl.innerHTML = '';
    if (!entries.length) {
      const empty = document.createElement('p');
      empty.className = 'status';
      empty.textContent = 'Choose a character to form a squad.';
      squadListEl.appendChild(empty);
      return;
    }
    entries.forEach((entry) => {
      const row = document.createElement('button');
      row.type = 'button';
      row.className = `squad-row${entry.locked ? ' squad-row-locked' : ''}`;
      row.setAttribute('role', 'listitem');
      row.dataset.kind = entry.kind;
      row.draggable = !entry.locked;
      if (entry.locked) {
        row.setAttribute('aria-disabled', 'true');
      }

      const portrait = document.createElement('canvas');
      portrait.className = 'squad-portrait';
      portrait.setAttribute('aria-hidden', 'true');
      paintSquadPortrait(portrait, entry.sheet, entry.col);

      const body = document.createElement('div');
      body.className = 'squad-row-body';
      const title = document.createElement('div');
      title.className = 'squad-row-title';
      title.textContent = entry.name;
      const meta = document.createElement('div');
      meta.className = 'squad-row-meta';
      meta.textContent = entry.locked
        ? `Age ${entry.age} · Locked`
        : `Age ${entry.age} · Drag to reorder`;
      const desc = document.createElement('div');
      desc.className = 'squad-row-desc';
      desc.textContent = entry.description;
      body.appendChild(title);
      body.appendChild(meta);
      body.appendChild(desc);

      row.appendChild(portrait);
      row.appendChild(body);
      squadListEl.appendChild(row);
    });
  }

  let squadDragKind = null;

  if (squadListEl) {
    squadListEl.addEventListener('dragstart', (event) => {
      const row = event.target && event.target.closest ? event.target.closest('.squad-row') : null;
      if (!row || row.classList.contains('squad-row-locked')) {
        event.preventDefault();
        return;
      }
      squadDragKind = row.dataset.kind;
      row.classList.add('squad-row-dragging');
      if (event.dataTransfer) {
        event.dataTransfer.effectAllowed = 'move';
        event.dataTransfer.setData('text/plain', squadDragKind);
      }
    });
    squadListEl.addEventListener('dragend', (event) => {
      const row = event.target && event.target.closest ? event.target.closest('.squad-row') : null;
      if (row) {
        row.classList.remove('squad-row-dragging');
      }
      squadDragKind = null;
      squadListEl.querySelectorAll('.squad-row-drop').forEach((el) => {
        el.classList.remove('squad-row-drop');
      });
    });
    squadListEl.addEventListener('dragover', (event) => {
      const row = event.target && event.target.closest ? event.target.closest('.squad-row') : null;
      if (!row || row.classList.contains('squad-row-locked') || !squadDragKind) {
        return;
      }
      event.preventDefault();
      squadListEl.querySelectorAll('.squad-row-drop').forEach((el) => {
        el.classList.remove('squad-row-drop');
      });
      row.classList.add('squad-row-drop');
    });
    squadListEl.addEventListener('drop', (event) => {
      event.preventDefault();
      const row = event.target && event.target.closest ? event.target.closest('.squad-row') : null;
      squadListEl.querySelectorAll('.squad-row-drop').forEach((el) => {
        el.classList.remove('squad-row-drop');
      });
      if (!row || row.classList.contains('squad-row-locked') || !squadDragKind) {
        return;
      }
      const targetKind = row.dataset.kind;
      if (!targetKind || targetKind === 'hero' || targetKind === 'tent' || targetKind === squadDragKind) {
        return;
      }
      const order = normalizeLeftTrailOrder(
        latestState && latestState.leftTrailOrder,
        companionCountFromState(latestState),
        recruitLandmarkOrderFromState(latestState)
      ).slice();
      const from = order.indexOf(squadDragKind);
      const to = order.indexOf(targetKind);
      if (from < 0 || to < 0) {
        return;
      }
      order.splice(from, 1);
      order.splice(to, 0, squadDragKind);
      applyLeftTrailReorder(order);
    });
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
      stopPartyIdleAnim();
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
      startPartyIdleAnim();
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

  prepareTownArt().catch((error) => {
    console.error('[travelling-kingdom] town art prep failed', error);
  });

  prepareTentArt().catch((error) => {
    console.error('[travelling-kingdom] tent art prep failed', error);
  });

  prepareVillageArt().catch((error) => {
    console.error('[travelling-kingdom] village art prep failed', error);
  });

  prepareWaysideArt().catch((error) => {
    console.error('[travelling-kingdom] wayside art prep failed', error);
  });

  prepareParallax().catch((error) => {
    console.error('[travelling-kingdom] parallax prep failed', error);
  });
})();
