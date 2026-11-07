import * as vscode from 'vscode';

/** What the webview reports about the journey (sanitised before use). */
export interface JourneySummary {
  hero: string;
  title: string;
  dest: string;
  meters: number;
  leg: number;
  arrived: boolean;
  units: 'metric' | 'imperial';
  gold: number;
  food: number;
  morale: number;
  renown: number;
  party: number;
  waiting: 'event' | 'location' | 'story' | null;
  waitingText: string;
}

function str(value: unknown, max = 80): string {
  return typeof value === 'string' ? value.replace(/[\r\n]+/g, ' ').slice(0, max) : '';
}

function num(value: unknown, lo = 0, hi = 1e9): number {
  return typeof value === 'number' && Number.isFinite(value) ? Math.min(hi, Math.max(lo, value)) : 0;
}

export function sanitizeSummary(raw: unknown): JourneySummary | null {
  if (typeof raw !== 'object' || raw === null) {
    return null;
  }
  const r = raw as Record<string, unknown>;
  const waiting = r.waiting === 'event' || r.waiting === 'location' || r.waiting === 'story' ? r.waiting : null;
  return {
    hero: str(r.hero, 60),
    title: str(r.title, 80),
    dest: str(r.dest, 60),
    meters: Math.floor(num(r.meters)),
    leg: Math.floor(num(r.leg)),
    arrived: r.arrived === true,
    units: r.units === 'imperial' ? 'imperial' : 'metric',
    gold: Math.floor(num(r.gold)),
    food: Math.floor(num(r.food)),
    morale: Math.round(num(r.morale, 0, 100)),
    renown: Math.floor(num(r.renown)),
    party: Math.floor(num(r.party, 1, 99)),
    waiting,
    waitingText: str(r.waitingText, 60),
  };
}

export function formatDistance(meters: number, units: 'metric' | 'imperial'): string {
  if (units === 'imperial') {
    const ft = meters * 3.28084;
    return ft >= 5280 ? `${(ft / 5280).toFixed(1)} mi` : `${Math.floor(ft)} ft`;
  }
  return meters >= 1000 ? `${(meters / 1000).toFixed(1)} km` : `${Math.floor(meters)} m`;
}

export class JourneyStatusBar implements vscode.Disposable {
  private readonly item: vscode.StatusBarItem;
  private summary: JourneySummary | null = null;
  private enabled = true;

  constructor(commandId: string) {
    this.item = vscode.window.createStatusBarItem('travellingKingdom.journey', vscode.StatusBarAlignment.Right, 90);
    this.item.name = 'Travelling Kingdom';
    this.item.command = commandId;
    this.refreshConfig();
  }

  refreshConfig(): void {
    this.enabled = vscode.workspace.getConfiguration('travellingKingdom').get<boolean>('statusBar.enabled', true);
    this.render();
  }

  update(summary: JourneySummary | null): void {
    this.summary = summary;
    this.render();
  }

  private render(): void {
    const s = this.summary;
    if (!this.enabled || !s || !s.hero) {
      this.item.hide();
      return;
    }
    if (s.waiting === 'event') {
      this.item.text = `$(bell-dot) ${s.waitingText || 'Something on the road'}`;
    } else if (s.waiting === 'location' || s.arrived) {
      this.item.text = `$(home) ${s.dest}`;
    } else if (s.waiting === 'story') {
      this.item.text = `$(comment-discussion) ${s.waitingText || s.dest}`;
    } else {
      const pct = s.leg > 0 ? Math.floor((s.meters / s.leg) * 100) : 0;
      this.item.text = `$(compass) ${pct}% → ${s.dest}`;
    }
    const md = new vscode.MarkdownString(undefined, true);
    md.appendMarkdown(`**${escapeMd(s.hero)}** — _${escapeMd(s.title)}_\n\n`);
    if (s.arrived) {
      md.appendMarkdown(`Arrived at **${escapeMd(s.dest)}**\n\n`);
    } else {
      md.appendMarkdown(`${formatDistance(s.meters, s.units)} of ${formatDistance(s.leg, s.units)} to **${escapeMd(s.dest)}**\n\n`);
    }
    md.appendMarkdown(`$(credit-card) ${s.gold} coins · $(package) ${s.food} rations · $(heart) ${s.morale} morale · $(star-full) ${s.renown} renown · $(organization) ${s.party}\n\n`);
    if (s.waiting === 'event') {
      md.appendMarkdown(`_Your court is waiting for you on the road._`);
    }
    this.item.tooltip = md;
    this.item.show();
  }

  dispose(): void {
    this.item.dispose();
  }
}

function escapeMd(text: string): string {
  return text.replace(/[\\`*_{}[\]()#+\-.!|<>]/g, (c) => `\\${c}`);
}
