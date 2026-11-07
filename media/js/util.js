/* Travelling Kingdom — shared helpers (browser + Node). */
(function (root) {
  'use strict';

  const TK = (root.TK = root.TK || {});

  function clamp(v, lo, hi) {
    return v < lo ? lo : v > hi ? hi : v;
  }

  function lerp(a, b, t) {
    return a + (b - a) * t;
  }

  /** Mulberry32: small, fast, seedable PRNG. */
  function makeRng(seed) {
    let a = seed >>> 0 || 0x9e3779b9;
    return function rng() {
      a = (a + 0x6d2b79f5) >>> 0;
      let t = a;
      t = Math.imul(t ^ (t >>> 15), t | 1);
      t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
  }

  function hashString(str) {
    let h = 2166136261 >>> 0;
    for (let i = 0; i < str.length; i++) {
      h ^= str.charCodeAt(i);
      h = Math.imul(h, 16777619);
    }
    return h >>> 0;
  }

  function pick(arr, rng) {
    if (!arr || !arr.length) {
      return undefined;
    }
    return arr[Math.floor((rng || Math.random)() * arr.length)];
  }

  function weightedPick(items, weightOf, rng) {
    let total = 0;
    for (const it of items) {
      total += Math.max(0, weightOf(it));
    }
    if (total <= 0) {
      return undefined;
    }
    let r = (rng || Math.random)() * total;
    for (const it of items) {
      r -= Math.max(0, weightOf(it));
      if (r <= 0) {
        return it;
      }
    }
    return items[items.length - 1];
  }

  function shuffle(arr, rng) {
    const out = arr.slice();
    const r = rng || Math.random;
    for (let i = out.length - 1; i > 0; i--) {
      const j = Math.floor(r() * (i + 1));
      const t = out[i];
      out[i] = out[j];
      out[j] = t;
    }
    return out;
  }

  function randRange(lo, hi, rng) {
    return lo + (hi - lo) * (rng || Math.random)();
  }

  function escapeHtml(s) {
    return String(s)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  }

  function formatDistance(meters, units) {
    const m = Math.max(0, meters);
    if (units === 'imperial') {
      const ft = m * 3.28084;
      if (ft >= 5280) {
        return (ft / 5280).toFixed(ft >= 52800 ? 0 : 1) + ' mi';
      }
      return Math.floor(ft) + ' ft';
    }
    if (m >= 1000) {
      return (m / 1000).toFixed(m >= 10000 ? 0 : 1) + ' km';
    }
    return Math.floor(m) + ' m';
  }

  function formatSigned(n) {
    return (n > 0 ? '+' : n < 0 ? '−' : '') + Math.abs(Math.round(n));
  }

  function plural(n, one, many) {
    return n === 1 ? one : many;
  }

  TK.util = {
    clamp,
    lerp,
    makeRng,
    hashString,
    pick,
    weightedPick,
    shuffle,
    randRange,
    escapeHtml,
    formatDistance,
    formatSigned,
    plural,
  };

  if (typeof module !== 'undefined' && module.exports) {
    module.exports = TK;
  }
})(typeof window !== 'undefined' ? window : globalThis);
