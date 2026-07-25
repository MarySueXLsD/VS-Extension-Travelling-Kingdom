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
  /** Traveling party size (grows as companions join at landmarks). */
  partySize: number;
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
  if (level <= 3) {
    return 100 + (level - 1) * 200; // 100, 300, 500
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
    return {
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
      partySize: Math.max(1, Math.floor(typeof rest.partySize === 'number' ? rest.partySize : 1)),
    };
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
    let partySize = Math.max(1, current.partySize || 1);
    if (level === 1) {
      partySize = Math.max(partySize, 2);
    } else if (level === 2) {
      partySize = Math.max(partySize, 3);
    } else if (level === 3) {
      partySize = Math.max(partySize, 4);
    }
    const next: PetState = {
      ...current,
      level: current.level + 1,
      meters: 0,
      awaitingDeparture: false,
      partySize,
      lastActionAt: now,
      lastMetersTick: now,
      mood: 'happy',
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
