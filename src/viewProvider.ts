import * as fs from 'fs';
import * as path from 'path';
import * as vscode from 'vscode';
import { JourneyStatusBar, JourneySummary, sanitizeSummary } from './statusBar';
import { LEASE_STALE_MS, SaveStore } from './store';

type InboundMessage =
  | { type: 'hello'; version?: string }
  | { type: 'save'; state: unknown; summary?: unknown }
  | { type: 'status'; summary?: unknown }
  | { type: 'takeOver' }
  | { type: 'requestReset' };

const HEARTBEAT_MS = 4_000;

export class KingdomViewProvider implements vscode.WebviewViewProvider, vscode.Disposable {
  public static readonly viewType = 'travellingKingdom.petView';

  private view?: vscode.WebviewView;
  private owner = false;
  private ready = false;
  private heartbeat?: ReturnType<typeof setInterval>;
  private readonly sessionId = vscode.env.sessionId;
  private readonly version: string;
  private lastSummary: JourneySummary | null = null;
  private lastNotified = '';
  private saveChain: Promise<unknown> = Promise.resolve();
  /** Message counters, exposed to integration tests only. */
  readonly stats = { hello: 0, saves: 0, statuses: 0 };

  constructor(
    private readonly extensionUri: vscode.Uri,
    private readonly store: SaveStore,
    private readonly statusBar: JourneyStatusBar
  ) {
    this.version = readVersion(extensionUri);
    this.lastSummary = sanitizeSummary(store.loadSummary());
    this.statusBar.update(this.lastSummary);
  }

  resolveWebviewView(webviewView: vscode.WebviewView): void {
    this.view = webviewView;
    this.ready = false;
    webviewView.webview.options = {
      enableScripts: true,
      localResourceRoots: [vscode.Uri.joinPath(this.extensionUri, 'media'), vscode.Uri.joinPath(this.extensionUri, 'static')],
    };
    try {
      webviewView.webview.html = this.renderHtml(webviewView.webview);
    } catch (error) {
      console.error('[travelling-kingdom] failed to render view', error);
      webviewView.webview.html = '<!DOCTYPE html><html><body><p>Travelling Kingdom could not load. Please reload the window.</p></body></html>';
      return;
    }

    webviewView.webview.onDidReceiveMessage((message: InboundMessage) => {
      void this.onMessage(message);
    });

    webviewView.onDidChangeVisibility(() => {
      if (webviewView.visible) {
        void this.ensureOwnership(false);
        void this.post({ type: 'visible', visible: true });
      }
      this.updateBadge();
    });

    webviewView.onDidDispose(() => {
      if (this.view === webviewView) {
        this.view = undefined;
        this.ready = false;
        this.stopHeartbeat();
        if (this.owner) {
          this.owner = false;
          void this.store.releaseLease(this.sessionId);
        }
      }
    });

    this.startHeartbeat();
  }

  /** Bring the view into focus (used by the command and the status bar). */
  async focus(): Promise<void> {
    await vscode.commands.executeCommand(`${KingdomViewProvider.viewType}.focus`);
  }

  async resetProgress(): Promise<void> {
    const choice = await vscode.window.showWarningMessage(
      'Reset Travelling Kingdom? Your court, coins, trinkets and journey will be lost.',
      { modal: true },
      'Reset Progress'
    );
    if (choice !== 'Reset Progress') {
      return;
    }
    await this.saveChain;
    await this.store.reset();
    this.lastSummary = null;
    this.statusBar.update(null);
    this.updateBadge();
    await this.post({ type: 'reset' });
    void vscode.window.showInformationMessage('Travelling Kingdom: a brand-new reign begins.');
  }

  /** Latest journey summary reported by the webview (tests and status bar). */
  get summary(): JourneySummary | null {
    return this.lastSummary;
  }

  dispose(): void {
    this.stopHeartbeat();
    if (this.owner) {
      void this.store.releaseLease(this.sessionId);
    }
  }

  // ---------------------------------------------------------------------------

  private async onMessage(message: InboundMessage): Promise<void> {
    if (!message || typeof message !== 'object' || typeof (message as { type?: unknown }).type !== 'string') {
      return;
    }
    switch (message.type) {
      case 'hello':
        this.stats.hello += 1;
        this.ready = true;
        await this.sendInit();
        break;
      case 'save':
        if (!this.owner) {
          return;
        }
        this.stats.saves += 1;
        this.saveChain = this.saveChain
          .then(async () => {
            if (await this.store.save(message.state)) {
              const summary = sanitizeSummary(message.summary);
              if (summary) {
                await this.store.saveSummary(summary);
              }
            }
          })
          .catch((error) => console.error('[travelling-kingdom] save failed', error));
        this.applySummary(message.summary);
        break;
      case 'status':
        if (this.owner) {
          this.stats.statuses += 1;
          this.applySummary(message.summary);
        }
        break;
      case 'takeOver':
        await this.store.claimLease(this.sessionId);
        this.owner = true;
        await this.sendInit();
        break;
      case 'requestReset':
        await this.resetProgress();
        break;
      default:
        break;
    }
  }

  private async sendInit(): Promise<void> {
    if (!this.view) {
      return;
    }
    const canOwn = this.owner || this.store.isLeaseFree(this.sessionId);
    if (canOwn) {
      await this.store.claimLease(this.sessionId);
      this.owner = true;
    }
    await this.saveChain;
    const { state, legacy } = this.store.load();
    await this.post({ type: 'init', owner: this.owner, state, legacy, version: this.version });
  }

  /** Heartbeat: keep the lease while visible, notice when another window takes over. */
  private async ensureOwnership(fromTimer: boolean): Promise<void> {
    if (!this.view || !this.ready) {
      return;
    }
    const lease = this.store.getLease();
    const now = Date.now();
    if (this.owner) {
      if (lease && lease.id !== this.sessionId && now - lease.ts <= LEASE_STALE_MS) {
        this.owner = false;
        await this.post({ type: 'suspend' });
        return;
      }
      if (this.view.visible) {
        await this.store.claimLease(this.sessionId, now);
      }
      return;
    }
    // Not the owner: quietly take over if the other window went away.
    if (this.view.visible && this.store.isLeaseFree(this.sessionId, now)) {
      this.owner = true;
      await this.sendInit();
    } else if (!fromTimer) {
      await this.post({ type: 'suspend' });
    }
  }

  private startHeartbeat(): void {
    this.stopHeartbeat();
    this.heartbeat = setInterval(() => {
      void this.ensureOwnership(true);
    }, HEARTBEAT_MS);
  }

  private stopHeartbeat(): void {
    if (this.heartbeat) {
      clearInterval(this.heartbeat);
      this.heartbeat = undefined;
    }
  }

  private applySummary(raw: unknown): void {
    const summary = sanitizeSummary(raw);
    if (!summary) {
      return;
    }
    this.lastSummary = summary;
    this.statusBar.update(summary);
    this.updateBadge();
    this.maybeNotify(summary);
  }

  private updateBadge(): void {
    if (!this.view) {
      return;
    }
    const s = this.lastSummary;
    if (s && s.waiting === 'event' && !this.view.visible) {
      this.view.badge = { value: 1, tooltip: s.waitingText ? `On the road: ${s.waitingText}` : 'Something on the road needs you' };
    } else {
      this.view.badge = undefined;
    }
  }

  private maybeNotify(s: JourneySummary): void {
    const enabled = vscode.workspace.getConfiguration('travellingKingdom').get<boolean>('notifications.enabled', false);
    if (!enabled || !this.view || this.view.visible || s.waiting !== 'event') {
      if (s.waiting !== 'event') {
        this.lastNotified = '';
      }
      return;
    }
    const key = `${s.waitingText}:${s.meters}`;
    if (key === this.lastNotified) {
      return;
    }
    this.lastNotified = key;
    void vscode.window.showInformationMessage(`Travelling Kingdom: ${s.waitingText || 'something on the road needs you'}.`, 'Open').then((pick) => {
      if (pick === 'Open') {
        void this.focus();
      }
    });
  }

  private async post(message: unknown): Promise<void> {
    if (!this.view) {
      return;
    }
    try {
      await this.view.webview.postMessage(message);
    } catch (error) {
      console.error('[travelling-kingdom] postMessage failed', error);
    }
  }

  private renderHtml(webview: vscode.Webview): string {
    const templatePath = path.join(this.extensionUri.fsPath, 'media', 'index.html');
    const template = fs.readFileSync(templatePath, 'utf8');
    const nonce = makeNonce();
    const base = webview.asWebviewUri(this.extensionUri).toString().replace(/\/$/, '');
    return template
      .replace(/\{\{cspSource\}\}/g, webview.cspSource)
      .replace(/\{\{nonce\}\}/g, nonce)
      .replace(/\{\{base\}\}/g, base)
      .replace(/\{\{version\}\}/g, encodeURIComponent(this.version));
  }
}

function readVersion(extensionUri: vscode.Uri): string {
  try {
    const pkg = JSON.parse(fs.readFileSync(path.join(extensionUri.fsPath, 'package.json'), 'utf8')) as { version?: unknown };
    return typeof pkg.version === 'string' ? pkg.version : '0.0.0';
  } catch {
    return '0.0.0';
  }
}

function makeNonce(): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let text = '';
  for (let i = 0; i < 32; i++) {
    text += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return text;
}
