import * as vscode from 'vscode';

export type Mood = 'idle' | 'happy' | 'sleepy';
export type ScreenId = 'home' | 'feed' | 'shop' | 'settings';
export type PetAction = 'petClick' | 'feed';
export type CharacterId = 'female-0' | 'male-7';
export type DistanceUnit = 'metric' | 'imperial';

export interface PetState {
  name: string;
  level: number;
  /** Progress toward the next level, in tiles (1 tile = 1 meter / 3 feet). */
  meters: number;
  mood: Mood;
  lastActionAt: number;
  /** Timestamp of the last travel / meter update (bookkeeping). */
  lastMetersTick: number;
  screen: ScreenId;
  characterId?: CharacterId;
  /** Beta floating clouds. Default off. */
  cloudsEnabled: boolean;
  /** Distance display unit. Internal progress stays in tiles. */
  distanceUnit: DistanceUnit;
  /** Plain chrome instead of royal frames / pixel progress bar. */
  minimalUi: boolean;
  /** Flat sidebar backdrop instead of parallax scenery (ground + decor stay). */
  minimalBg: boolean;
  /**
   * Arrived at the current destination landmark; travel paused until depart.
   * Level-up happens on depart, not when meters fill.
   */
  awaitingDeparture: boolean;
  /** Traveling party size (grows as companions join at landmarks). Cap 15. */
  partySize: number;
  /**
   * Legacy shuffle of the first three recruit landmarks (camp / grove / town).
   * Kept for migration into recruitLandmarkOrder.
   */
  earlyLandmarkOrder: EarlyLandmarkKind[];
  /**
   * Shuffled order of all recruit landmarks (14). Level 1 → [0], … level 14 → [13].
   */
  recruitLandmarkOrder: RecruitKind[];
  /**
   * Left-trail recruit kinds, index 0 = closest behind the hero.
   * Never includes tent (guard stays on the right).
   */
  leftTrailOrder: LeftTrailKind[];
}

export type EarlyLandmarkKind = 'camp' | 'grove' | 'town';
export type RecruitKind =
  | EarlyLandmarkKind
  | 'tent'
  | 'stone'
  | 'market'
  | 'cloister'
  | 'male0'
  | 'male1'
  | 'male2'
  | 'male6'
  | 'male8'
  | 'male10'
  | 'female11';
export type LeftTrailKind = Exclude<RecruitKind, 'tent'>;
export type LandmarkKind = RecruitKind;

export const RECRUIT_KIND_COUNT = 14;
export const MAX_PARTY_SIZE = 15;

export const EARLY_LANDMARK_KINDS: readonly EarlyLandmarkKind[] = ['camp', 'grove', 'town'];
export const RECRUIT_LANDMARK_KINDS: readonly RecruitKind[] = [
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
export const LEFT_TRAIL_KINDS: readonly LeftTrailKind[] = RECRUIT_LANDMARK_KINDS.filter(
  (k): k is LeftTrailKind => k !== 'tent'
);

export const RECRUIT_LANDMARK_NAMES: Record<RecruitKind, string> = {
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

/** @deprecated Prefer RECRUIT_LANDMARK_NAMES */
export const EARLY_LANDMARK_NAMES: Record<EarlyLandmarkKind, string> = {
  camp: 'Soldier Camp',
  grove: 'Apple Grove',
  town: 'River Town',
};

export function shuffleEarlyLandmarks(rand: () => number = Math.random): EarlyLandmarkKind[] {
  const arr: EarlyLandmarkKind[] = [...EARLY_LANDMARK_KINDS];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(rand() * (i + 1));
    const tmp = arr[i];
    arr[i] = arr[j];
    arr[j] = tmp;
  }
  return arr;
}

export function shuffleRecruitLandmarks(rand: () => number = Math.random): RecruitKind[] {
  const arr: RecruitKind[] = [...RECRUIT_LANDMARK_KINDS];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(rand() * (i + 1));
    const tmp = arr[i];
    arr[i] = arr[j];
    arr[j] = tmp;
  }
  return arr;
}

export function normalizeEarlyLandmarkOrder(raw: unknown): EarlyLandmarkKind[] {
  if (!Array.isArray(raw) || raw.length !== 3) {
    return shuffleEarlyLandmarks();
  }
  const allowed = new Set<string>(EARLY_LANDMARK_KINDS);
  const cleaned = raw.filter((k): k is EarlyLandmarkKind => allowed.has(String(k)));
  if (cleaned.length !== 3 || new Set(cleaned).size !== 3) {
    return shuffleEarlyLandmarks();
  }
  return cleaned;
}

export function isValidEarlyLandmarkOrder(raw: unknown): boolean {
  if (!Array.isArray(raw) || raw.length !== 3) {
    return false;
  }
  const allowed = new Set<string>(EARLY_LANDMARK_KINDS);
  const cleaned = raw.filter((k) => allowed.has(String(k)));
  return cleaned.length === 3 && new Set(cleaned).size === 3;
}

export function isValidRecruitLandmarkOrder(raw: unknown): boolean {
  if (!Array.isArray(raw) || raw.length !== RECRUIT_KIND_COUNT) {
    return false;
  }
  const allowed = new Set<string>(RECRUIT_LANDMARK_KINDS);
  const cleaned = raw.filter((k) => allowed.has(String(k)));
  return cleaned.length === RECRUIT_KIND_COUNT && new Set(cleaned).size === RECRUIT_KIND_COUNT;
}

/**
 * Normalize or build recruitLandmarkOrder. If raw is invalid, seed from legacy
 * earlyLandmarkOrder (first three) then shuffle the rest.
 */
export function normalizeRecruitLandmarkOrder(
  raw: unknown,
  earlyFallback?: EarlyLandmarkKind[] | undefined,
  rand: () => number = Math.random
): RecruitKind[] {
  if (isValidRecruitLandmarkOrder(raw)) {
    return (raw as RecruitKind[]).slice();
  }
  const allowed = new Set<string>(RECRUIT_LANDMARK_KINDS);
  const cleaned: RecruitKind[] = [];
  if (Array.isArray(raw)) {
    for (const item of raw) {
      const key = String(item);
      if (!allowed.has(key) || cleaned.includes(key as RecruitKind)) {
        continue;
      }
      cleaned.push(key as RecruitKind);
    }
  }
  const early = earlyFallback ? normalizeEarlyLandmarkOrder(earlyFallback) : [];
  for (const kind of early) {
    if (!cleaned.includes(kind)) {
      cleaned.push(kind);
    }
  }
  const rest = RECRUIT_LANDMARK_KINDS.filter((k) => !cleaned.includes(k));
  for (let i = rest.length - 1; i > 0; i--) {
    const j = Math.floor(rand() * (i + 1));
    const tmp = rest[i];
    rest[i] = rest[j];
    rest[j] = tmp;
  }
  return [...cleaned, ...rest].slice(0, RECRUIT_KIND_COUNT);
}

export function landmarkKindForLevel(
  recruitOrder: RecruitKind[] | EarlyLandmarkKind[] | undefined,
  level: number,
  earlyFallback?: EarlyLandmarkKind[]
): RecruitKind | null {
  const lvl = Math.floor(level);
  const idx = lvl - 1;
  if (idx < 0 || idx >= RECRUIT_KIND_COUNT) {
    return null;
  }
  const normalized = normalizeRecruitLandmarkOrder(recruitOrder, earlyFallback);
  return normalized[idx] || null;
}

/** Expected left-trail kinds for a party size (newest / closest first). */
export function defaultLeftTrailOrderFromParty(
  partySize: number,
  recruitOrder: RecruitKind[] | EarlyLandmarkKind[] | undefined,
  earlyFallback?: EarlyLandmarkKind[]
): LeftTrailKind[] {
  const party = Math.max(1, Math.min(MAX_PARTY_SIZE, Math.floor(partySize || 1)));
  const order = normalizeRecruitLandmarkOrder(recruitOrder, earlyFallback);
  const recruited = order.slice(0, Math.max(0, party - 1));
  const leftChrono = recruited.filter((k): k is LeftTrailKind => k !== 'tent');
  return leftChrono.slice().reverse();
}

export function normalizeLeftTrailOrder(
  raw: unknown,
  partySize: number,
  recruitOrder: RecruitKind[] | EarlyLandmarkKind[] | undefined,
  earlyFallback?: EarlyLandmarkKind[]
): LeftTrailKind[] {
  const expected = defaultLeftTrailOrderFromParty(partySize, recruitOrder, earlyFallback);
  const expectedSet = new Set<string>(expected);
  const allowed = new Set<string>(LEFT_TRAIL_KINDS);
  const cleaned: LeftTrailKind[] = [];
  if (Array.isArray(raw)) {
    for (const item of raw) {
      const key = String(item);
      if (!allowed.has(key) || !expectedSet.has(key) || cleaned.includes(key as LeftTrailKind)) {
        continue;
      }
      cleaned.push(key as LeftTrailKind);
    }
  }
  for (const kind of expected) {
    if (!cleaned.includes(kind)) {
      cleaned.push(kind);
    }
  }
  return cleaned;
}

export function hasRecruitedKindInParty(
  partySize: number,
  kind: RecruitKind,
  recruitOrder: RecruitKind[] | undefined,
  earlyFallback?: EarlyLandmarkKind[]
): boolean {
  const party = Math.max(1, Math.min(MAX_PARTY_SIZE, Math.floor(partySize || 1)));
  const order = normalizeRecruitLandmarkOrder(recruitOrder, earlyFallback);
  return order.slice(0, Math.max(0, party - 1)).includes(kind);
}

const STORAGE_KEY = 'travellingKingdom.petState';

const METER_GAINS: Record<PetAction, number> = {
  petClick: 0,
  feed: 40,
};

const ACTION_MOOD: Record<PetAction, Mood> = {
  petClick: 'happy',
  feed: 'happy',
};

export interface DestinationDef {
  level: number;
  name: string;
  meters: number;
}

const destinationMetersByLevel = new Map<number, number>();

/** Install distances from destinations.json (host + webview share this curve). */
export function setDestinationTable(destinations: DestinationDef[]): void {
  destinationMetersByLevel.clear();
  for (const dest of destinations) {
    if (
      typeof dest.level === 'number' &&
      typeof dest.meters === 'number' &&
      dest.level >= 1 &&
      dest.meters > 0
    ) {
      destinationMetersByLevel.set(Math.floor(dest.level), Math.floor(dest.meters));
    }
  }
}

/** Meters (tiles) needed to advance from the given level. */
export function metersToNextLevel(level: number): number {
  const fromTable = destinationMetersByLevel.get(Math.max(1, Math.floor(level)));
  if (typeof fromTable === 'number' && fromTable > 0) {
    return fromTable;
  }
  // Fallback if destinations.json failed to load (matches early legs).
  if (level <= 3) {
    return 50;
  }
  return (level - 2) * 500; // 1000, 1500, 2000, ...
}

export function createDefaultState(): PetState {
  const now = Date.now();
  return {
    name: 'Pet',
    level: 1,
    meters: 0,
    mood: 'idle',
    lastActionAt: now,
    lastMetersTick: now,
    screen: 'home',
    cloudsEnabled: false,
    distanceUnit: 'metric',
    minimalUi: false,
    minimalBg: false,
    awaitingDeparture: false,
    partySize: 1,
    earlyLandmarkOrder: shuffleEarlyLandmarks(),
    recruitLandmarkOrder: shuffleRecruitLandmarks(),
    leftTrailOrder: [],
  };
}

/**
 * Add meters toward the current destination. Does not level up —
 * clamps at the leg end and sets awaitingDeparture.
 */
function applyMeters(state: PetState, gain: number): PetState {
  if (state.awaitingDeparture) {
    return state;
  }
  let { level, meters } = state;
  const needed = metersToNextLevel(level);
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

function normalizeScreen(screen: unknown): ScreenId {
  if (screen === 'home' || screen === 'feed' || screen === 'shop' || screen === 'settings') {
    return screen;
  }
  if (screen === 'sleep' || screen === 'play') {
    return screen === 'play' ? 'shop' : 'settings';
  }
  return 'home';
}

function normalizeDistanceUnit(unit: unknown): DistanceUnit {
  return unit === 'imperial' ? 'imperial' : 'metric';
}

export class PetStateStore {
  constructor(private readonly globalState: vscode.Memento) {}

  load(): PetState {
    const saved = this.globalState.get<Partial<PetState> & { xp?: number }>(STORAGE_KEY);
    if (!saved) {
      return createDefaultState();
    }
    const { xp, ...rest } = saved;
    const meters = typeof rest.meters === 'number' ? rest.meters : typeof xp === 'number' ? xp : 0;
    const level = typeof rest.level === 'number' ? rest.level : 1;
    const needed = metersToNextLevel(level);
    let awaitingDeparture = rest.awaitingDeparture === true;
    let clampedMeters = meters;
    // Migrate older saves that overshot the leg without the arrival flag.
    if (!awaitingDeparture && clampedMeters >= needed) {
      clampedMeters = needed;
      awaitingDeparture = true;
    }
    const hadEarlyOrder = isValidEarlyLandmarkOrder(rest.earlyLandmarkOrder);
    const earlyLandmarkOrder = normalizeEarlyLandmarkOrder(rest.earlyLandmarkOrder);
    const hadRecruitOrder = isValidRecruitLandmarkOrder(rest.recruitLandmarkOrder);
    const recruitLandmarkOrder = normalizeRecruitLandmarkOrder(
      rest.recruitLandmarkOrder,
      earlyLandmarkOrder
    );
    const partySize = Math.max(
      1,
      Math.min(MAX_PARTY_SIZE, Math.floor(typeof rest.partySize === 'number' ? rest.partySize : 1))
    );
    const leftTrailOrder = normalizeLeftTrailOrder(
      rest.leftTrailOrder,
      partySize,
      recruitLandmarkOrder,
      earlyLandmarkOrder
    );
    const next: PetState = {
      ...createDefaultState(),
      ...rest,
      level,
      meters: clampedMeters,
      screen: normalizeScreen(rest.screen),
      cloudsEnabled: rest.cloudsEnabled === true,
      distanceUnit: normalizeDistanceUnit(rest.distanceUnit),
      minimalUi: rest.minimalUi === true,
      minimalBg: rest.minimalBg === true,
      awaitingDeparture,
      partySize,
      earlyLandmarkOrder,
      recruitLandmarkOrder,
      leftTrailOrder,
    };
    // Persist newly assigned shuffles / migrations so reload does not reshuffle mid-run.
    if (!hadEarlyOrder || !hadRecruitOrder || !Array.isArray(rest.leftTrailOrder)) {
      void this.globalState.update(STORAGE_KEY, next);
    }
    return next;
  }

  async save(state: PetState): Promise<void> {
    await this.globalState.update(STORAGE_KEY, state);
  }

  async reset(): Promise<PetState> {
    await this.globalState.update(STORAGE_KEY, undefined);
    return createDefaultState();
  }

  /** Load persisted state (no offline / time-based meter catch-up). */
  async syncPassiveMeters(): Promise<PetState> {
    return this.load();
  }

  chooseCharacterSync(characterId: CharacterId, name: string): PetState {
    const current = this.load();
    const now = Date.now();
    return {
      ...current,
      characterId,
      name,
      screen: 'home',
      lastMetersTick: now,
      awaitingDeparture: false,
      meters: 0,
      level: 1,
      partySize: 1,
      earlyLandmarkOrder: shuffleEarlyLandmarks(),
      recruitLandmarkOrder: shuffleRecruitLandmarks(),
      leftTrailOrder: [],
    };
  }

  async chooseCharacter(characterId: CharacterId, name: string): Promise<PetState> {
    const next = this.chooseCharacterSync(characterId, name);
    await this.save(next);
    return next;
  }

  async applyTravel(meters: number): Promise<PetState> {
    const gain = Math.max(0, Math.floor(meters));
    if (gain <= 0) {
      return this.load();
    }
    const current = this.load();
    if (!current.characterId || current.awaitingDeparture) {
      return current;
    }
    const now = Date.now();
    const next: PetState = {
      ...applyMeters(current, gain),
      lastActionAt: now,
      lastMetersTick: now,
    };
    await this.save(next);
    return next;
  }

  /** Confirm departure from the landmark; advance to the next destination leg. */
  async depart(): Promise<PetState> {
    const current = this.load();
    if (!current.characterId) {
      return current;
    }
    const needed = metersToNextLevel(current.level);
    const atLandmark =
      current.awaitingDeparture || current.meters >= needed;
    if (!atLandmark) {
      return current;
    }
    const now = Date.now();
    const level = current.level;
    const recruitLandmarkOrder = normalizeRecruitLandmarkOrder(
      current.recruitLandmarkOrder,
      current.earlyLandmarkOrder
    );
    let partySize = Math.max(1, current.partySize || 1);
    if (level >= 1 && level <= RECRUIT_KIND_COUNT) {
      partySize = Math.max(partySize, Math.min(MAX_PARTY_SIZE, level + 1));
    }
    const departedKind = landmarkKindForLevel(
      recruitLandmarkOrder,
      level,
      current.earlyLandmarkOrder
    );
    let leftTrailOrder = normalizeLeftTrailOrder(
      current.leftTrailOrder,
      partySize,
      recruitLandmarkOrder,
      current.earlyLandmarkOrder
    );
    if (departedKind && departedKind !== 'tent') {
      leftTrailOrder = [
        departedKind,
        ...leftTrailOrder.filter((kind) => kind !== departedKind),
      ];
    }
    const next: PetState = {
      ...current,
      level: current.level + 1,
      meters: 0,
      awaitingDeparture: false,
      partySize,
      recruitLandmarkOrder,
      leftTrailOrder,
      lastActionAt: now,
      lastMetersTick: now,
      mood: 'happy',
    };
    await this.save(next);
    return next;
  }

  /** Reorder left-trail companions (permutation of current left recruits). */
  async reorderParty(rawOrder: unknown): Promise<PetState> {
    const current = this.load();
    if (!current.characterId) {
      return current;
    }
    const recruitLandmarkOrder = normalizeRecruitLandmarkOrder(
      current.recruitLandmarkOrder,
      current.earlyLandmarkOrder
    );
    const expected = new Set(
      defaultLeftTrailOrderFromParty(
        current.partySize,
        recruitLandmarkOrder,
        current.earlyLandmarkOrder
      )
    );
    const allowed = new Set<string>(LEFT_TRAIL_KINDS);
    const cleaned: LeftTrailKind[] = [];
    if (Array.isArray(rawOrder)) {
      for (const item of rawOrder) {
        const key = String(item);
        if (
          !allowed.has(key) ||
          !expected.has(key as LeftTrailKind) ||
          cleaned.includes(key as LeftTrailKind)
        ) {
          continue;
        }
        cleaned.push(key as LeftTrailKind);
      }
    }
    if (cleaned.length !== expected.size) {
      return current;
    }
    for (const kind of expected) {
      if (!cleaned.includes(kind)) {
        return current;
      }
    }
    const next: PetState = {
      ...current,
      recruitLandmarkOrder,
      leftTrailOrder: cleaned,
      lastActionAt: Date.now(),
    };
    await this.save(next);
    return next;
  }

  async applyAction(action: PetAction): Promise<PetState> {
    const current = this.load();
    if (current.awaitingDeparture && action !== 'feed') {
      // petClick while waiting does not add travel meters
      const now = Date.now();
      const next: PetState = {
        ...current,
        mood: ACTION_MOOD[action],
        lastActionAt: now,
      };
      await this.save(next);
      return next;
    }
    const withMetersGain = applyMeters(current, METER_GAINS[action]);
    const now = Date.now();
    const next: PetState = {
      ...withMetersGain,
      mood: ACTION_MOOD[action],
      lastActionAt: now,
      lastMetersTick: now,
    };
    await this.save(next);
    return next;
  }

  async setScreen(screen: ScreenId): Promise<PetState> {
    const current = this.load();
    const next: PetState = { ...current, screen: normalizeScreen(screen) };
    await this.save(next);
    return next;
  }

  async setCloudsEnabled(enabled: boolean): Promise<PetState> {
    const current = this.load();
    const next: PetState = { ...current, cloudsEnabled: Boolean(enabled) };
    await this.save(next);
    return next;
  }

  async setDistanceUnit(unit: DistanceUnit): Promise<PetState> {
    const current = this.load();
    const next: PetState = { ...current, distanceUnit: normalizeDistanceUnit(unit) };
    await this.save(next);
    return next;
  }

  async setMinimalUi(enabled: boolean): Promise<PetState> {
    const current = this.load();
    const next: PetState = { ...current, minimalUi: Boolean(enabled) };
    await this.save(next);
    return next;
  }

  async setMinimalBg(enabled: boolean): Promise<PetState> {
    const current = this.load();
    const next: PetState = { ...current, minimalBg: Boolean(enabled) };
    await this.save(next);
    return next;
  }
}
