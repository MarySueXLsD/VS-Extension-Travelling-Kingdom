// Fake VS Code webview API for the dev harness. Persists to localStorage.
(function () {
  const KEY = 'tk-dev-save';
  const send = (msg) => window.postMessage(msg, '*');
  window.__tk = { summaries: [], resetSave() { localStorage.removeItem(KEY); location.reload(); } };
  function handle(msg) {
    switch (msg.type) {
      case 'hello': {
        const raw = localStorage.getItem(KEY);
        const legacy = localStorage.getItem(KEY + '-legacy');
        const owner = !/observer/.test(location.hash);
        send({ type: 'init', owner, state: raw ? JSON.parse(raw) : null, legacy: legacy ? JSON.parse(legacy) : null });
        break;
      }
      case 'save':
        localStorage.setItem(KEY, JSON.stringify(msg.state));
        window.__tk.lastSummary = msg.summary;
        break;
      case 'status':
        window.__tk.lastSummary = msg.summary;
        break;
      case 'requestReset':
        if (window.confirm('Reset all progress?')) {
          localStorage.removeItem(KEY);
          localStorage.removeItem(KEY + '-legacy');
          send({ type: 'reset' });
        }
        break;
      case 'takeOver':
        location.hash = '';
        location.reload();
        break;
      default:
        break;
    }
  }
  window.acquireVsCodeApi = function () {
    return { postMessage: (m) => setTimeout(() => handle(JSON.parse(JSON.stringify(m))), 0), setState() {}, getState() { return null; } };
  };
})();
