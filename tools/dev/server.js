// Dev harness: serves the webview in a normal browser with a fake VS Code API.
// Usage: node tools/dev/server.js [port]
const http = require('http');
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

const ROOT = path.resolve(__dirname, '..', '..');
const PORT = Number(process.argv[2] || process.env.PORT || 5317);
const TYPES = { '.html': 'text/html', '.js': 'text/javascript', '.css': 'text/css', '.png': 'image/png', '.json': 'application/json', '.svg': 'image/svg+xml' };

function renderIndex() {
  const nonce = crypto.randomBytes(16).toString('hex');
  const pkg = JSON.parse(fs.readFileSync(path.join(ROOT, 'package.json'), 'utf8'));
  let html = fs.readFileSync(path.join(ROOT, 'media', 'index.html'), 'utf8');
  html = html.replace('</head>', '  <script nonce="{{nonce}}" src="{{base}}/tools/dev/shim.js"></script>\n</head>');
  return html
    .replace(/\{\{cspSource\}\}/g, `http://localhost:${PORT}`)
    .replace(/\{\{nonce\}\}/g, nonce)
    .replace(/\{\{base\}\}/g, '')
    .replace(/\{\{version\}\}/g, pkg.version + '-dev');
}

http
  .createServer((req, res) => {
    const url = new URL(req.url, `http://localhost:${PORT}`);
    if (url.pathname === '/' || url.pathname === '/index.html') {
      res.writeHead(200, { 'Content-Type': 'text/html', 'Cache-Control': 'no-store' });
      res.end(renderIndex());
      return;
    }
    const file = path.normalize(path.join(ROOT, decodeURIComponent(url.pathname)));
    if (!file.startsWith(ROOT) || !fs.existsSync(file) || fs.statSync(file).isDirectory()) {
      res.writeHead(404);
      res.end('not found');
      return;
    }
    res.writeHead(200, { 'Content-Type': TYPES[path.extname(file)] || 'application/octet-stream', 'Cache-Control': 'no-store' });
    fs.createReadStream(file).pipe(res);
  })
  .listen(PORT, () => console.log(`Travelling Kingdom dev harness on http://localhost:${PORT}`));
