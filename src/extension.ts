import * as fs from 'fs';
import * as path from 'path';
import * as vscode from 'vscode';
import { DestinationDef, PetStateStore, setDestinationTable } from './petState';
import { TravellingKingdomViewProvider } from './travellingKingdomViewProvider';

function loadDestinationTable(extensionUri: vscode.Uri): void {
  try {
    const filePath = path.join(extensionUri.fsPath, 'static', 'world', 'destinations.json');
    const raw = fs.readFileSync(filePath, 'utf8');
    const data = JSON.parse(raw) as { destinations?: DestinationDef[] };
    if (Array.isArray(data.destinations)) {
      setDestinationTable(data.destinations);
      console.log('[travelling-kingdom] loaded', data.destinations.length, 'destinations');
    }
  } catch (error) {
    console.error('[travelling-kingdom] failed to load destinations.json', error);
  }
}

export function activate(context: vscode.ExtensionContext): void {
  console.log('[travelling-kingdom] activate');

  try {
    loadDestinationTable(context.extensionUri);
    const store = new PetStateStore(context.globalState);
    const provider = new TravellingKingdomViewProvider(context.extensionUri, store);

    context.subscriptions.push(
      vscode.window.registerWebviewViewProvider(
        TravellingKingdomViewProvider.viewType,
        provider,
        { webviewOptions: { retainContextWhenHidden: true } }
      )
    );

    context.subscriptions.push(
      vscode.commands.registerCommand('travellingKingdom.focus', () => {
        void vscode.commands.executeCommand('travellingKingdom.petView.focus');
      })
    );

    context.subscriptions.push(
      vscode.commands.registerCommand('travellingKingdom.reset', async () => {
        await store.reset();
        provider.refresh();
        void vscode.window.showInformationMessage('Travelling Kingdom progress reset.');
      })
    );

    console.log('[travelling-kingdom] provider registered for', TravellingKingdomViewProvider.viewType);
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    console.error('[travelling-kingdom] activate failed', error);
    void vscode.window.showErrorMessage(`Travelling Kingdom failed to activate: ${message}`);
  }
}

export function deactivate(): void {}
