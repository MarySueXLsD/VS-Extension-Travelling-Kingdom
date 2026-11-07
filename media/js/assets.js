/* Travelling Kingdom — image loading and sprite lookup. */
(function (root) {
  'use strict';

  const TK = (root.TK = root.TK || {});
  const ATLAS = root.TK_ATLAS;

  const A = {
    atlas: ATLAS,
    img: {},
    bg: {},
    ready: false,
    _iconUrls: {},
    _portraitUrls: {},
  };

  function loadImage(src) {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.decoding = 'async';
      img.onload = () => resolve(img);
      img.onerror = () => reject(new Error('Failed to load ' + src));
      img.src = src;
    });
  }

  A.load = async function load(base, version) {
    const v = '?v=' + encodeURIComponent(version || '0');
    const url = (p) => base + '/' + p + v;
    const sheets = ['actors', 'props', 'portraits', 'icons'];
    const tasks = sheets.map((name) => loadImage(url('static/atlas/' + name + '.png')).then((img) => (A.img[name] = img)));
    tasks.push(loadImage(url('static/ground.png')).then((img) => (A.img.ground = img)));
    await Promise.all(tasks);
    A.ready = true;
    // Background biomes load lazily; green first so the first frame has scenery.
    await A.loadBiome(base, version, 'green');
  };

  A.loadBiome = async function loadBiome(base, version, biome) {
    if (A.bg[biome]) {
      return A.bg[biome];
    }
    const v = '?v=' + encodeURIComponent(version || '0');
    const layers = await Promise.all(
      [0, 1, 2, 3, 4].map((n) => loadImage(base + '/static/bg/' + biome + '_' + n + '.png' + v))
    );
    const castle = await loadImage(base + '/static/bg/' + biome + '_castle.png' + v).catch(() => null);
    A.bg[biome] = { layers, castle };
    return A.bg[biome];
  };

  A.actor = function actor(id) {
    return ATLAS.actors[id] || null;
  };

  A.prop = function prop(id) {
    return ATLAS.props[id] || null;
  };

  /** Frame index for an animation at time t (seconds). */
  A.frameAt = function frameAt(anim, t, phase) {
    if (!anim || !anim.frames.length) {
      return 0;
    }
    const fps = anim.fps || 6;
    return Math.floor((t + (phase || 0)) * fps) % anim.frames.length;
  };

  function cropToDataUrl(img, x, y, w, h, scale) {
    const s = scale || 1;
    const c = document.createElement('canvas');
    c.width = Math.round(w * s);
    c.height = Math.round(h * s);
    const ctx = c.getContext('2d');
    ctx.imageSmoothingEnabled = false;
    ctx.drawImage(img, x, y, w, h, 0, 0, c.width, c.height);
    return c.toDataURL('image/png');
  }

  /** Data URL for a DOM icon (first frame), cached. */
  A.iconUrl = function iconUrl(id) {
    if (A._iconUrls[id]) {
      return A._iconUrls[id];
    }
    const m = ATLAS.icons[id];
    if (!m || !A.img.icons) {
      return '';
    }
    const [x, y] = m.frames[0];
    A._iconUrls[id] = cropToDataUrl(A.img.icons, x, y, m.w, m.h, 1);
    return A._iconUrls[id];
  };

  /** Data URL for a portrait, cached. */
  A.portraitUrl = function portraitUrl(actorId) {
    if (A._portraitUrls[actorId]) {
      return A._portraitUrls[actorId];
    }
    const r = ATLAS.portraits[actorId];
    if (!r || !A.img.portraits) {
      return '';
    }
    A._portraitUrls[actorId] = cropToDataUrl(A.img.portraits, r[0], r[1], r[2], r[3], 1);
    return A._portraitUrls[actorId];
  };

  /** Data URL of an actor's idle frame (used for full-body thumbnails). */
  A.actorThumbUrl = function actorThumbUrl(actorId) {
    const key = 'thumb:' + actorId;
    if (A._portraitUrls[key]) {
      return A._portraitUrls[key];
    }
    const a = ATLAS.actors[actorId];
    if (!a || !A.img.actors) {
      return '';
    }
    const anim = a.anims.idle || a.anims[Object.keys(a.anims)[0]];
    const [x, y] = anim.frames[0];
    A._portraitUrls[key] = cropToDataUrl(A.img.actors, x, y, a.w, a.h, 1);
    return A._portraitUrls[key];
  };

  /** Fill every <img data-icon> under root with its icon. */
  A.hydrateIcons = function hydrateIcons(rootEl) {
    (rootEl || document).querySelectorAll('img[data-icon]').forEach((el) => {
      const url = A.iconUrl(el.getAttribute('data-icon'));
      if (url && el.getAttribute('src') !== url) {
        el.src = url;
      }
    });
  };

  TK.assets = A;
})(typeof window !== 'undefined' ? window : globalThis);
