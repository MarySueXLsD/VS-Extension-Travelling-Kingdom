import * as vscode from 'vscode';

/** Current save (written by the webview, which owns the game rules). */
export const SAVE_KEY = 'travellingKingdom.save.v2';
/** 1.x save, read once so the webview can migrate it. */
export const LEGACY_KEY = 'travellingKingdom.petState';
/** Which window is currently walking the Kingsroad. */
export const LEASE_KEY = 'travellingKingdom.lease';
/** Last journey summary, so the status bar can show progress before the view opens. */
export const SUMMARY_KEY = 'travellingKingdom.summary';

export const SAVE_VERSION = 2;
const MAX_SAVE_BYTES = 512 * 1024;
/** A lease older than this is considered abandoned (window closed or view hidden). */
export const LEASE_STALE_MS = 15_000;

export interface Lease {
  id: string;
  ts: number;
}

export interface LoadedSave {
  state: Record<string, unknown> | null;
  legacy: Record<string, unknown> | null;
}

function isPlainObject(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

/** Light structural validation; the webview repairs everything else on load. */
export function validateSave(value: unknown): Record<string, unknown> | null {
  if (!isPlainObject(value)) {
    return null;
  }
  if (value.v !== SAVE_VERSION || !isPlainObject(value.hero)) {
    return null;
  }
  let size = 0;
  try {
    size = JSON.stringify(value).length;
  } catch {
    return null;
  }
  if (size > MAX_SAVE_BYTES) {
    return null;
  }
  return value;
}

export class SaveStore {
  constructor(private readonly memento: vscode.Memento) {}

  load(): LoadedSave {
    const state = validateSave(this.memento.get<unknown>(SAVE_KEY));
    const legacyRaw = this.memento.get<unknown>(LEGACY_KEY);
    const legacy = !state && isPlainObject(legacyRaw) ? legacyRaw : null;
    return { state, legacy };
  }

  async save(value: unknown): Promise<boolean> {
    const state = validateSave(value);
    if (!state) {
      return false;
    }
    await this.memento.update(SAVE_KEY, state);
    return true;
  }

  async reset(): Promise<void> {
    await this.memento.update(SAVE_KEY, undefined);
    await this.memento.update(LEGACY_KEY, undefined);
    await this.memento.update(SUMMARY_KEY, undefined);
  }

  loadSummary(): unknown {
    return this.memento.get<unknown>(SUMMARY_KEY);
  }

  async saveSummary(summary: unknown): Promise<void> {
    await this.memento.update(SUMMARY_KEY, summary);
  }

  getLease(): Lease | null {
    const raw = this.memento.get<unknown>(LEASE_KEY);
    if (isPlainObject(raw) && typeof raw.id === 'string' && typeof raw.ts === 'number') {
      return { id: raw.id, ts: raw.ts };
    }
    return null;
  }

  isLeaseFree(sessionId: string, now = Date.now()): boolean {
    const lease = this.getLease();
    return !lease || lease.id === sessionId || now - lease.ts > LEASE_STALE_MS;
  }

  async claimLease(sessionId: string, now = Date.now()): Promise<void> {
    await this.memento.update(LEASE_KEY, { id: sessionId, ts: now } satisfies Lease);
  }

  async releaseLease(sessionId: string): Promise<void> {
    const lease = this.getLease();
    if (lease && lease.id === sessionId) {
      await this.memento.update(LEASE_KEY, undefined);
    }
  }
}
