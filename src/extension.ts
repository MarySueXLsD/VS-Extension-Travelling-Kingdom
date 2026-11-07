import * as vscode from 'vscode';
import { JourneyStatusBar } from './statusBar';
import { SaveStore } from './store';
import { KingdomViewProvider } from './viewProvider';

export interface KingdomTestApi {
  stats(): { hello: number; saves: number; statuses: number; summary: unknown };
  seed(state: unknown): Promise<boolean>;
}

export function activate(context: vscode.ExtensionContext): { __test?: KingdomTestApi } {
  const store = new SaveStore(context.globalState);
  const statusBar = new JourneyStatusBar('travellingKingdom.focus');
  const provider = new KingdomViewProvider(context.extensionUri, store, statusBar);

  context.subscriptions.push(
    statusBar,
    provider,
    vscode.window.registerWebviewViewProvider(KingdomViewProvider.viewType, provider, {
      webviewOptions: { retainContextWhenHidden: true },
    }),
    vscode.commands.registerCommand('travellingKingdom.focus', () => provider.focus()),
    vscode.commands.registerCommand('travellingKingdom.reset', () => provider.resetProgress()),
    vscode.workspace.onDidChangeConfiguration((event) => {
      if (event.affectsConfiguration('travellingKingdom.statusBar.enabled')) {
        statusBar.refreshConfig();
      }
    })
  );

  // Integration tests (and only they) get a small diagnostics surface.
  if (context.extensionMode === vscode.ExtensionMode.Test) {
    return {
      __test: {
        stats: () => ({ ...provider.stats, summary: provider.summary }),
        seed: (state: unknown) => store.save(state),
      },
    };
  }
  return {};
}

export function deactivate(): void {
  // Disposables registered in activate() release the lease and status bar item.
}
