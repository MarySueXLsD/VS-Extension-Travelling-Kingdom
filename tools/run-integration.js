// Launches VS Code in extension-test mode with a throwaway profile and runs
// test/integration/index.js inside the real extension host.
// Usage: node tools/run-integration.js [path-to-Code-executable]
const { spawn } = require('child_process');
const fs = require('fs');
const os = require('os');
const path = require('path');
const { loadGame } = require('../test/load-game');

const ROOT = path.resolve(__dirname, '..');
const candidates = [
  process.argv[2],
  process.env.VSCODE_EXECUTABLE,
  process.platform === 'win32' && path.join(process.env.LOCALAPPDATA || '', 'Programs', 'Microsoft VS Code', 'Code.exe'),
  process.platform === 'win32' && 'C:\\Program Files\\Microsoft VS Code\\Code.exe',
  process.platform === 'darwin' && '/Applications/Visual Studio Code.app/Contents/MacOS/Electron',
  process.platform === 'linux' && '/usr/share/code/code',
].filter(Boolean);
const exe = candidates.find((p) => fs.existsSync(p));
if (!exe) {
  console.error('VS Code executable not found. Pass its path as the first argument.');
  process.exit(2);
}

const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'tk-int-'));
const seedPath = path.join(tmp, 'seed.json');
const resultPath = path.join(tmp, 'result.json');

// A fresh journey just after the prologue.
const TK = loadGame();
const state = TK.logic.createState('queen', 'Tester', Date.now());
state.story.prologue = true;
state.party = ['quill'];
state.nextEventAt = 1e9;
fs.writeFileSync(seedPath, JSON.stringify(state));

// TK_EXT_PATH lets CI point the test at an unpacked .vsix instead of the source tree.
const extensionPath = process.env.TK_EXT_PATH ? path.resolve(process.env.TK_EXT_PATH) : ROOT;
const args = [
  `--extensionDevelopmentPath=${extensionPath}`,
  `--extensionTestsPath=${path.join(ROOT, 'test', 'integration', 'index.js')}`,
  `--user-data-dir=${path.join(tmp, 'user')}`,
  `--extensions-dir=${path.join(tmp, 'ext')}`,
  '--disable-extensions',
  '--disable-workspace-trust',
  '--skip-welcome',
  '--skip-release-notes',
  '--new-window',
];
const env = Object.assign({}, process.env, { TK_SEED: seedPath, TK_RESULT: resultPath });
delete env.ELECTRON_RUN_AS_NODE;

console.log('Running integration test with', exe);
const child = spawn(exe, args, { env, stdio: 'inherit' });
const timer = setTimeout(() => {
  console.error('Integration test timed out');
  child.kill();
}, 180000);
child.on('exit', (code) => {
  clearTimeout(timer);
  let result = null;
  try {
    result = JSON.parse(fs.readFileSync(resultPath, 'utf8'));
  } catch {
    /* no result written */
  }
  console.log(JSON.stringify(result, null, 2));
  try {
    fs.rmSync(tmp, { recursive: true, force: true });
  } catch {
    /* ignore */
  }
  process.exit(result && result.ok ? 0 : code || 1);
});
