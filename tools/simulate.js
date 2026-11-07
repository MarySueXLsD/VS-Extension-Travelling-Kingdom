// Balance check: simulate many playthroughs of the main story with a simple player policy.
// Usage: node tools/simulate.js [runs]
const { loadGame } = require('../test/load-game');

const TK = loadGame();
const L = TK.logic;
const D = TK.data;
const U = TK.util;

function simulate(seed, policy) {
  const rng = U.makeRng(seed);
  const s = L.createState('queen', 'Sim', 1);
  s.story.prologue = true;
  L.recruit(s, 'quill');
  const out = { seconds: 0, events: 0, hungryMeters: 0, minFood: Infinity, minGold: Infinity, legs: [], bought: 0, trinkets: 0 };
  let legStart = 0;
  const mainStops = D.route.length;
  while (s.journey.stop < mainStops) {
    const ctx = { night: rng() < 0.2, biome: L.regionOf(s), rng };
    if (s.journey.arrived) {
      const loc = L.currentDestination(s);
      out.legs.push(Math.round((out.seconds - legStart) / 60));
      legStart = out.seconds;
      L.beginVisit(s);
      if (loc.recruit) L.recruit(s, loc.recruit);
      L.applyEffects(s, { renown: 25 }, ctx);
      const services = loc.services || [];
      if (services.includes('work')) L.useService(s, 'work', rng);
      if (services.includes('forage')) L.useService(s, 'forage', rng);
      if (services.includes('market')) {
        const target = 25 + L.partySize(s) * 3;
        let guard = 0;
        while (s.res.food < target && s.res.gold >= L.servicePrice(s, 'rations30') + 10 && guard++ < 6) {
          L.useService(s, 'rations30', rng);
          out.bought += 30;
        }
        if (policy === 'shopper') {
          for (const id of L.marketOffers(s, rng)) {
            if (s.res.gold > L.trinketPrice(s, id) + 40) L.buyTrinket(s, id);
          }
        }
      }
      if (services.includes('inn') && s.res.morale < 60) L.useService(s, 'inn', rng);
      if (services.includes('rest') && s.res.morale < 70) L.useService(s, 'rest', rng);
      if (services.includes('shrine') && s.res.gold > 80) L.useService(s, 'shrine', rng);
      L.depart(s, rng);
      continue;
    }
    // Walk one meter
    const mps = L.speedMps(s, ctx);
    out.seconds += 1 / mps;
    L.advance(s, 1, ctx);
    if (s.res.food <= 0) out.hungryMeters += 1;
    out.minFood = Math.min(out.minFood, s.res.food);
    out.minGold = Math.min(out.minGold, s.res.gold);
    const rem = L.legLength(s) - s.journey.meters;
    if (s.journey.total >= s.nextEventAt && rem > 45) {
      const ev = L.pickEvent(s, ctx, rng);
      if (ev) {
        L.markEventSeen(s, ev.id);
        const options = L.choicesFor(s, ev, ctx).filter((o) => o.ok);
        const pick = options[Math.floor(rng() * options.length)];
        L.resolveChoice(s, ev, pick.index, ctx, rng, { random: s.party[0] });
        out.events += 1;
        out.seconds += 20; // reading time
      }
      L.scheduleNextEvent(s, rng);
    }
  }
  out.hours = out.seconds / 3600;
  out.final = Object.assign({}, s.res);
  out.title = L.titleFor(s);
  out.trinkets = s.trinkets.length;
  out.distance = Math.round(s.journey.total);
  return out;
}

function pct(arr, p) {
  const a = arr.slice().sort((x, y) => x - y);
  return a[Math.min(a.length - 1, Math.floor((p / 100) * a.length))];
}

const runs = Number(process.argv[2] || 200);
for (const policy of ['basic', 'shopper']) {
  const results = [];
  for (let i = 0; i < runs; i++) results.push(simulate(1000 + i, policy));
  const f = (k) => results.map((r) => r[k]);
  const fr = (k) => results.map((r) => r.final[k]);
  console.log(`\nPolicy: ${policy} (${runs} runs)`);
  console.log('  distance           ', results[0].distance, 'm');
  console.log('  walking hours      p10/p50/p90', pct(f('hours'), 10).toFixed(1), pct(f('hours'), 50).toFixed(1), pct(f('hours'), 90).toFixed(1));
  console.log('  events seen        p50', pct(f('events'), 50));
  console.log('  hungry meters      p50/p90/max', pct(f('hungryMeters'), 50), pct(f('hungryMeters'), 90), Math.max(...f('hungryMeters')));
  console.log('  final gold         p10/p50/p90', pct(fr('gold'), 10), pct(fr('gold'), 50), pct(fr('gold'), 90));
  console.log('  final food         p10/p50/p90', pct(fr('food'), 10), pct(fr('food'), 50), pct(fr('food'), 90));
  console.log('  final morale       p10/p50/p90', pct(fr('morale'), 10).toFixed(0), pct(fr('morale'), 50).toFixed(0), pct(fr('morale'), 90).toFixed(0));
  console.log('  renown at finale   p10/p50/p90', pct(fr('renown'), 10), pct(fr('renown'), 50), pct(fr('renown'), 90));
  console.log('  trinkets           p50', pct(f('trinkets'), 50));
  console.log('  sample title       ', results[0].title);
  console.log('  minutes per leg (run 0):', results[0].legs.join(' '));
}
