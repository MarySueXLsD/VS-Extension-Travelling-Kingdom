import * as fs from 'fs';
import * as path from 'path';
import * as vscode from 'vscode';
import { CharacterId, DistanceUnit, PetAction, PetStateStore, ScreenId } from './petState';

type WebviewMessage =
  | { type: 'ready' }
  | { type: 'action'; action: PetAction }
  | { type: 'action'; action: 'navigate'; screen: ScreenId }
  | { type: 'action'; action: 'chooseCharacter'; characterId: CharacterId; name: string }
  | { type: 'action'; action: 'reset' }
  | { type: 'action'; action: 'travel'; meters: number }
  | { type: 'action'; action: 'setCloudsEnabled'; enabled: boolean }
  | { type: 'action'; action: 'setDistanceUnit'; unit: DistanceUnit }
  | { type: 'action'; action: 'setMinimalUi'; enabled: boolean }
  | { type: 'action'; action: 'setMinimalBg'; enabled: boolean }
  | { type: 'action'; action: 'depart' };

const VALID_CHARACTER_IDS: ReadonlySet<string> = new Set(['female-0', 'male-7']);

export class TravellingKingdomViewProvider implements vscode.WebviewViewProvider {
  public static readonly viewType = 'travellingKingdom.petView';

  private view?: vscode.WebviewView;
  /** Serialize message handling so rapid taps cannot lose meter updates. */
  private messageChain: Promise<void> = Promise.resolve();
  /** Bumped on reset so queued messages from before reset are discarded. */
  private messageGeneration = 0;
  private pendingTravelMeters = 0;
  private travelFlushQueued = false;

  constructor(
    private readonly extensionUri: vscode.Uri,
    private readonly store: PetStateStore
  ) {}

  resolveWebviewView(
    webviewView: vscode.WebviewView,
    _context: vscode.WebviewViewResolveContext,
    _token: vscode.CancellationToken
  ): void {
    console.log('[travelling-kingdom] resolveWebviewView');
    this.view = webviewView;

    try {
      webviewView.webview.options = {
        enableScripts: true,
        localResourceRoots: [
          vscode.Uri.joinPath(this.extensionUri, 'media'),
          vscode.Uri.joinPath(this.extensionUri, 'static'),
        ],
      };

      // Set HTML immediately so VS Code can clear the Loading spinner.
      webviewView.webview.html = this.getHtml(webviewView.webview);

      // Re-render when shown again so edited media/static assets are not stuck cached.
      webviewView.onDidChangeVisibility(() => {
        if (webviewView.visible) {
          webviewView.webview.html = this.getHtml(webviewView.webview);
          void this.store.syncPassiveMeters().then((state) => this.postState(state));
        }
      });

      webviewView.webview.onDidReceiveMessage((message: WebviewMessage) => {
        this.enqueueMessage(message);
      });

      void this.store.syncPassiveMeters().then((state) => this.postState(state));
    } catch (error) {
      console.error('[travelling-kingdom] resolveWebviewView failed', error);
      webviewView.webview.html = `<!DOCTYPE html><html><body><p>Travelling Kingdom failed to load. Check the Extension Host console.</p></body></html>`;
    }
  }

  private enqueueMessage(message: WebviewMessage): void {
    // Reset must not wait behind a backlog of ticks/taps.
    if (message.type === 'action' && message.action === 'reset') {
      this.messageGeneration += 1;
      this.pendingTravelMeters = 0;
      this.travelFlushQueued = false;
      const generation = this.messageGeneration;
      this.messageChain = Promise.resolve()
        .then(async () => {
          if (generation !== this.messageGeneration) {
            return;
          }
          await this.handleMessage(message);
        })
        .catch((error) => {
          console.error('[travelling-kingdom] message handling failed', error);
        });
      return;
    }

    if (message.type === 'action' && message.action === 'travel') {
      this.enqueueTravel(message.meters);
      return;
    }

    const generation = this.messageGeneration;
    this.messageChain = this.messageChain
      .then(async () => {
        if (generation !== this.messageGeneration) {
          return;
        }
        await this.handleMessage(message);
      })
      .catch((error) => {
        console.error('[travelling-kingdom] message handling failed', error);
      });
  }

  private enqueueTravel(meters: number): void {
    const gain = Math.max(0, Math.floor(meters));
    if (gain <= 0) {
      return;
    }
    this.pendingTravelMeters += gain;
    if (this.travelFlushQueued) {
      return;
    }
    this.travelFlushQueued = true;

    const generation = this.messageGeneration;
    this.messageChain = this.messageChain
      .then(async () => {
        this.travelFlushQueued = false;
        if (generation !== this.messageGeneration) {
          return;
        }
        const batch = this.pendingTravelMeters;
        this.pendingTravelMeters = 0;
        if (batch <= 0) {
          return;
        }
        const state = await this.store.applyTravel(batch);
        this.postState(state);
      })
      .catch((error) => {
        console.error('[travelling-kingdom] travel handling failed', error);
      });
  }

  private async handleMessage(message: WebviewMessage): Promise<void> {
    if (message.type === 'ready') {
      const state = await this.store.syncPassiveMeters();
      this.postState(state);
      return;
    }

    if (message.type !== 'action') {
      return;
    }

    if (message.action === 'navigate') {
      const state = await this.store.setScreen(message.screen);
      this.postState(state);
      return;
    }

    if (message.action === 'chooseCharacter') {
      if (!VALID_CHARACTER_IDS.has(message.characterId)) {
        return;
      }
      const name = typeof message.name === 'string' ? message.name.trim() : '';
      if (!name) {
        return;
      }
      const state = this.store.chooseCharacterSync(message.characterId, name);
      this.postState(state);
      await this.store.save(state);
      return;
    }

    if (message.action === 'reset') {
      const state = await this.store.reset();
      this.postState(state);
      return;
    }

    if (message.action === 'setCloudsEnabled') {
      const state = await this.store.setCloudsEnabled(Boolean(message.enabled));
      this.postState(state);
      return;
    }

    if (message.action === 'setDistanceUnit') {
      const state = await this.store.setDistanceUnit(message.unit);
      this.postState(state);
      return;
    }

    if (message.action === 'setMinimalUi') {
      const state = await this.store.setMinimalUi(Boolean(message.enabled));
      this.postState(state);
      return;
    }

    if (message.action === 'setMinimalBg') {
      const state = await this.store.setMinimalBg(Boolean(message.enabled));
      this.postState(state);
      return;
    }

    if (message.action === 'depart') {
      const state = await this.store.depart();
      this.postState(state);
      return;
    }

    if (message.action === 'petClick' || message.action === 'feed') {
      const state = await this.store.applyAction(message.action);
      this.postState(state);
    }
  }

  refresh(): void {
    this.postState(this.store.load());
  }

  private postState(state: ReturnType<PetStateStore['load']>): void {
    void this.view?.webview.postMessage({ type: 'state', payload: state });
  }

  private getHtml(webview: vscode.Webview): string {
    // Bust webview asset cache so media edits show up after reload.
    const assetQuery = `v=${Date.now()}`;
    const styleUri = webview.asWebviewUri(
      vscode.Uri.joinPath(this.extensionUri, 'media', 'style.css')
    ).with({ query: assetQuery });
    const scriptUri = webview.asWebviewUri(
      vscode.Uri.joinPath(this.extensionUri, 'media', 'game.js')
    ).with({ query: assetQuery });
    const femaleSheetUri = webview.asWebviewUri(
      vscode.Uri.joinPath(this.extensionUri, 'static', 'characters', 'female_spritesheet.png')
    );
    const maleSheetUri = webview.asWebviewUri(
      vscode.Uri.joinPath(this.extensionUri, 'static', 'characters', 'male_spritesheet.png')
    );
    const chars1SheetUri = webview.asWebviewUri(
      vscode.Uri.joinPath(this.extensionUri, 'static', 'characters', 'characters1.png')
    );
    const royalFrameUri = webview.asWebviewUri(
      vscode.Uri.joinPath(this.extensionUri, 'static', 'ui', '64x64_royal.png')
    );
    const royalButtonUri = webview.asWebviewUri(
      vscode.Uri.joinPath(this.extensionUri, 'static', 'ui', '16x32_button.png')
    );
    const uiBarUri = webview.asWebviewUri(
      vscode.Uri.joinPath(this.extensionUri, 'static', 'ui', 'ui_bar.png')
    );
    const floorTilesUri = webview.asWebviewUri(
      vscode.Uri.joinPath(this.extensionUri, 'static', 'world', 'environment', 'floor_tiles.png')
    );
    const decorUri = webview.asWebviewUri(
      vscode.Uri.joinPath(this.extensionUri, 'static', 'world', 'environment', 'decor.png')
    );
    const appleTreeUri = webview.asWebviewUri(
      vscode.Uri.joinPath(this.extensionUri, 'static', 'world', 'environment', 'apple_tree.png')
    );
    const willowTreeUri = webview.asWebviewUri(
      vscode.Uri.joinPath(this.extensionUri, 'static', 'world', 'environment', 'willow_tree.png')
    );
    const houseUris = [1, 2, 3, 4, 5, 6].map((n) =>
      webview.asWebviewUri(
        vscode.Uri.joinPath(this.extensionUri, 'static', 'world', 'environment', `house_${n}.png`)
      )
    );
    const destinationsUri = webview
      .asWebviewUri(vscode.Uri.joinPath(this.extensionUri, 'static', 'world', 'destinations.json'))
      .with({ query: assetQuery });
    let extensionVersion = 'unknown';
    try {
      const pkgPath = path.join(this.extensionUri.fsPath, 'package.json');
      const pkg = JSON.parse(fs.readFileSync(pkgPath, 'utf8')) as { version?: string };
      if (typeof pkg.version === 'string' && pkg.version.trim()) {
        extensionVersion = pkg.version.trim();
      }
    } catch {
      // Keep placeholder version if package.json is missing.
    }
    const bgLayerUris = [1, 2, 3, 4, 5, 6].map((n) => {
      // Layer 1 uses a distinct filename so webviews cannot keep a cached original.
      const fileName = n === 1 ? 'background_layer_1b.png' : `background_layer_${n}.png`;
      return webview
        .asWebviewUri(vscode.Uri.joinPath(this.extensionUri, 'static', 'world', 'background', fileName))
        .with({ query: assetQuery });
    });
    const cloudUris = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((n) =>
      webview
        .asWebviewUri(vscode.Uri.joinPath(this.extensionUri, 'static', 'world', 'clouds', `Cloud${n}.png`))
        .with({ query: assetQuery })
    );
    const nonce = getNonce();

    return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta http-equiv="Content-Security-Policy" content="default-src 'none'; style-src ${webview.cspSource}; img-src ${webview.cspSource} data:; connect-src ${webview.cspSource}; script-src 'nonce-${nonce}';" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <link rel="stylesheet" href="${styleUri}" />
  <title>Travelling Kingdom</title>
</head>
<body>
  <div
    class="app"
    id="app"
    data-female-sheet="${femaleSheetUri}"
    data-male-sheet="${maleSheetUri}"
    data-chars1-sheet="${chars1SheetUri}"
    data-royal-frame="${royalFrameUri}"
    data-royal-button="${royalButtonUri}"
    data-ui-bar="${uiBarUri}"
    data-destinations="${destinationsUri}"
    data-floor-tiles="${floorTilesUri}"
    data-decor="${decorUri}"
    data-apple-tree="${appleTreeUri}"
    data-willow-tree="${willowTreeUri}"
    data-house-1="${houseUris[0]}"
    data-house-2="${houseUris[1]}"
    data-house-3="${houseUris[2]}"
    data-house-4="${houseUris[3]}"
    data-house-5="${houseUris[4]}"
    data-house-6="${houseUris[5]}"
    data-bg1="${bgLayerUris[0]}"
    data-bg2="${bgLayerUris[1]}"
    data-bg3="${bgLayerUris[2]}"
    data-bg4="${bgLayerUris[3]}"
    data-bg5="${bgLayerUris[4]}"
    data-bg6="${bgLayerUris[5]}"
    data-cloud1="${cloudUris[0]}"
    data-cloud2="${cloudUris[1]}"
    data-cloud3="${cloudUris[2]}"
    data-cloud4="${cloudUris[3]}"
    data-cloud5="${cloudUris[4]}"
    data-cloud6="${cloudUris[5]}"
    data-cloud7="${cloudUris[6]}"
    data-cloud8="${cloudUris[7]}"
    data-cloud9="${cloudUris[8]}"
    data-cloud10="${cloudUris[9]}"
  >
    <header class="stats" id="stats">
      <canvas id="stats-bg" class="chrome-bg" aria-hidden="true"></canvas>
      <div class="stats-content">
        <div class="stats-row">
          <span id="pet-name" class="pet-name">Queen Elizabeth</span>
          <span id="party-size" class="party-size">1 person</span>
        </div>
        <div class="xp-row">
          <div class="xp-bar" aria-label="Distance">
            <canvas id="xp-bar" class="xp-bar-canvas" width="94" height="16"></canvas>
          </div>
          <div class="xp-meta">
            <div id="xp-label" class="xp-label">Traveled 0/50 meters</div>
            <div id="destination-label" class="destination-label">Destination: Meadow Village</div>
          </div>
        </div>
      </div>
    </header>

    <main class="stage">
      <section id="screen-character-select" class="screen" data-screen="character-select">
        <div class="intro-frame" id="intro-frame">
          <canvas id="intro-frame-bg" class="intro-frame-bg" aria-hidden="true"></canvas>
          <div class="character-select">
          <h1 class="welcome-title">Welcome to your travel Kingdom!</h1>
          <p class="welcome-flavor">You have nothing except some royal robes and definitely real crown you bought on the auction 5 years ago.</p>
          <p class="choose-look">First, let's choose how you look like</p>

          <div class="character-carousel">
            <button id="char-prev" class="carousel-arrow" type="button" aria-label="Previous character">‹</button>
            <div class="carousel-viewport portrait-viewport">
              <div id="carousel-track" class="carousel-track"></div>
            </div>
            <button id="char-next" class="carousel-arrow" type="button" aria-label="Next character">›</button>
          </div>

          <div class="title-viewport">
            <div id="title-track" class="title-track"></div>
          </div>

          <label class="name-field" for="name-input">
            <span class="name-label">Your name</span>
            <input id="name-input" class="name-input" type="text" maxlength="32" autocomplete="off" spellcheck="false" />
          </label>

          <button id="char-confirm" class="royal-confirm" type="button" disabled>
            <canvas id="confirm-btn-bg" class="royal-confirm-bg" aria-hidden="true"></canvas>
            <span class="royal-confirm-label">Confirm</span>
          </button>
          </div>
        </div>
      </section>

      <div id="game-world" class="game-world">
        <canvas id="parallax-bg" class="parallax-bg" aria-hidden="true"></canvas>

        <div id="travel-world" class="travel-world">
          <div class="panel-host home-panel-host">
            <section id="panel-home" class="panel active" data-screen="home"></section>
          </div>
          <div class="home-spacer" aria-hidden="true"></div>
          <button id="pet" class="pet" type="button" aria-label="Character">
            <canvas id="pet-sprite" class="pet-sprite" width="96" height="96" aria-hidden="true"></canvas>
          </button>
          <canvas id="camp-decor" class="camp-decor" aria-hidden="true"></canvas>
          <canvas id="camp-npc" class="camp-npc" width="96" height="96" aria-hidden="true" hidden></canvas>
          <canvas id="companion-2" class="camp-npc companion-slot" width="96" height="96" aria-hidden="true" hidden></canvas>
          <canvas id="companion-3" class="companion-slot companion-slot-far" width="96" height="96" aria-hidden="true" hidden></canvas>
          <canvas id="camp-dog" class="camp-actor" width="96" height="96" aria-hidden="true" hidden></canvas>
          <canvas id="camp-knight-sit" class="camp-actor" width="88" height="88" aria-hidden="true" hidden></canvas>
          <canvas id="camp-knight-lute" class="camp-actor" width="88" height="88" aria-hidden="true" hidden></canvas>
          <canvas id="town-a" class="camp-actor" width="88" height="88" aria-hidden="true" hidden></canvas>
          <canvas id="town-b" class="camp-actor" width="88" height="88" aria-hidden="true" hidden></canvas>
          <canvas id="town-c" class="camp-actor" width="88" height="88" aria-hidden="true" hidden></canvas>
          <canvas id="town-d" class="camp-actor" width="88" height="88" aria-hidden="true" hidden></canvas>
          <canvas id="town-e" class="camp-actor" width="88" height="88" aria-hidden="true" hidden></canvas>
          <canvas id="town-f" class="camp-actor" width="88" height="88" aria-hidden="true" hidden></canvas>
          <canvas id="town-g" class="camp-actor" width="88" height="88" aria-hidden="true" hidden></canvas>
          <canvas id="town-h" class="camp-actor" width="88" height="88" aria-hidden="true" hidden></canvas>
          <canvas id="town-i" class="camp-actor" width="88" height="88" aria-hidden="true" hidden></canvas>
          <canvas id="town-dog" class="camp-actor" width="96" height="96" aria-hidden="true" hidden></canvas>
          <button id="depart-btn" class="depart-btn" type="button" hidden>Continue</button>
          <canvas id="world-decor" class="world-decor" aria-hidden="true"></canvas>
        </div>

        <div id="ui-frame" class="ui-frame intro-frame" hidden>
          <canvas id="ui-frame-bg" class="intro-frame-bg" aria-hidden="true"></canvas>
          <div class="panel-host ui-panel-host">
            <section id="panel-feed" class="panel" data-screen="feed">
              <h2>Manage</h2>
              <p id="feed-status" class="status"></p>
              <button class="action-btn" type="button" data-action="feed">Feed (+40 m)</button>
            </section>

            <section id="panel-shop" class="panel" data-screen="shop">
              <h2>Shop</h2>
              <p id="shop-status" class="status">The travelling merchant has not arrived yet.</p>
            </section>

            <section id="panel-settings" class="panel" data-screen="settings">
              <h2>Settings</h2>
              <p class="status">Manage your journey.</p>
              <p class="status" id="extension-version">Travelling Kingdom v${extensionVersion}</p>
              <label class="settings-toggle" for="clouds-enabled">
                <input id="clouds-enabled" type="checkbox" />
                <span>Enable clouds (beta)</span>
              </label>
              <fieldset class="settings-fieldset">
                <legend>Distance units</legend>
                <label class="settings-radio" for="unit-metric">
                  <input id="unit-metric" type="radio" name="distance-unit" value="metric" />
                  <span>Metric (meters)</span>
                </label>
                <label class="settings-radio" for="unit-imperial">
                  <input id="unit-imperial" type="radio" name="distance-unit" value="imperial" />
                  <span>Imperial (feet)</span>
                </label>
              </fieldset>
              <label class="settings-toggle" for="minimal-ui">
                <input id="minimal-ui" type="checkbox" />
                <span>Minimalistic UI</span>
              </label>
              <label class="settings-toggle" for="minimal-bg">
                <input id="minimal-bg" type="checkbox" />
                <span>Minimalistic background</span>
              </label>
              <button id="reset-progress" class="action-btn danger-btn" type="button">Reset progress</button>
            </section>
          </div>
        </div>
      </div>
    </main>

    <canvas id="ground-strip" class="ground-strip" aria-hidden="true"></canvas>

    <nav class="bottom-bar" id="bottom-bar" aria-label="Actions">
      <canvas id="bottom-bar-bg" class="chrome-bg" aria-hidden="true"></canvas>
      <div class="bottom-bar-content">
        <button class="nav-btn active" type="button" data-screen="home">
          <canvas class="nav-btn-bg" aria-hidden="true"></canvas>
          <span class="nav-btn-label">Home</span>
        </button>
        <button class="nav-btn nav-btn-disabled" type="button" data-screen="feed" disabled aria-disabled="true" title="Coming soon">
          <canvas class="nav-btn-bg" aria-hidden="true"></canvas>
          <span class="nav-btn-label">Manage</span>
        </button>
        <button class="nav-btn nav-btn-disabled" type="button" data-screen="shop" disabled aria-disabled="true" title="Coming soon">
          <canvas class="nav-btn-bg" aria-hidden="true"></canvas>
          <span class="nav-btn-label">Shop</span>
        </button>
        <button class="nav-btn" type="button" data-screen="settings">
          <canvas class="nav-btn-bg" aria-hidden="true"></canvas>
          <span class="nav-btn-label">Settings</span>
        </button>
      </div>
    </nav>
  </div>
  <script nonce="${nonce}" src="${scriptUri}"></script>
</body>
</html>`;
  }
}

function getNonce(): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let text = '';
  for (let i = 0; i < 32; i++) {
    text += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return text;
}
