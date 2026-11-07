// Runs inside a real VS Code extension host (see tools/run-integration.js).
// Seeds a save, opens the view, and waits for the webview to load its scripts
// and art under VS Code's CSP, hand-shake with the host, walk, and autosave.
const fs = require('fs');
const assert = require('assert');
const vscode = require('vscode');

const wait = (ms) => new Promise((r) => setTimeout(r, ms));

async function until(fn, ms, label) {
  const start = Date.now();
  while (Date.now() - start < ms) {
    const v = fn();
    if (v) return v;
    await wait(250);
  }
  throw new Error('Timed out waiting for ' + label);
}

exports.run = async function run() {
  const result = { steps: [] };
  const log = (s) => result.steps.push(s);
  try {
    const ext = vscode.extensions.getExtension('MarySue.travelling-kingdom');
    assert.ok(ext, 'extension is installed in the test host');
    const api = await ext.activate();
    assert.ok(api && api.__test, 'test API is available in test mode');
    const t = api.__test;
    log('activated');

    const seed = JSON.parse(fs.readFileSync(process.env.TK_SEED, 'utf8'));
    assert.ok(await t.seed(seed), 'seed save accepted');
    log('seeded');

    const commands = await vscode.commands.getCommands(true);
    assert.ok(commands.includes('travellingKingdom.focus'), 'focus command registered');
    assert.ok(commands.includes('travellingKingdom.reset'), 'reset command registered');

    await vscode.commands.executeCommand('travellingKingdom.focus');
    log('focused view');
    await until(() => t.stats().hello > 0, 45000, 'webview hello (scripts + art loaded)');
    log('webview hello');
    await until(() => t.stats().statuses > 0, 30000, 'webview status message');
    log('status received');
    const summary = t.stats().summary;
    assert.ok(summary, 'summary present');
    assert.equal(summary.hero, 'Queen Tester');
    assert.equal(summary.dest, 'Camp Dustmuster');
    // The party walks; progress should increase and an autosave should arrive.
    const m0 = summary.meters;
    await until(() => t.stats().saves > 0, 30000, 'autosave from webview');
    log('autosave received');
    await until(() => t.stats().summary && t.stats().summary.meters > m0, 30000, 'walking progress');
    log('walking progress ' + m0 + ' -> ' + t.stats().summary.meters);
    result.ok = true;
    result.final = t.stats();
  } catch (error) {
    result.ok = false;
    result.error = String(error && error.stack ? error.stack : error);
  }
  fs.writeFileSync(process.env.TK_RESULT, JSON.stringify(result, null, 2));
  if (!result.ok) {
    throw new Error(result.error);
  }
};
