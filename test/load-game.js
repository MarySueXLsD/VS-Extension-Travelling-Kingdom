// Loads the webview game modules into Node (they attach to globalThis.TK).
const path = require('path');

const FILES = ['util.js', 'data/core.js', 'data/locations.js', 'data/story.js', 'data/events-road.js', 'data/events-world.js', 'data/banter.js', 'logic.js'];

function loadGame() {
  if (!globalThis.TK || !globalThis.TK.logic) {
    for (const f of FILES) {
      require(path.join(__dirname, '..', 'media', 'js', f));
    }
    globalThis.TK.logic.indexData();
  }
  return globalThis.TK;
}

module.exports = { loadGame };
