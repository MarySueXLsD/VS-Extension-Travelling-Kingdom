/* Travelling Kingdom — companions, trinkets, titles, decrees, speakers. */
(function (root) {
  'use strict';

  const TK = (root.TK = root.TK || {});
  const D = (TK.data = TK.data || {});

  // ---------------------------------------------------------------------------
  // Companions. `mods` are passive bonuses summed by logic.modifiers().
  // ---------------------------------------------------------------------------
  D.companions = {
    quill: {
      name: 'Quill',
      epithet: 'Royal Chronicler',
      role: 'Scribe',
      actor: 'quill',
      home: null,
      age: 31,
      bio: 'Wrote three epic poems about a turnip festival. Volunteered to chronicle your reign "for the material".',
      trait: 'Renown gains +15%. Everything sounds grander once Quill writes it down.',
      mods: { renown: 0.15 },
      quips: ['I am writing this down.', 'Could you look more heroic? Chin up. Perfect.', 'Chapter Nine: The Ditch. No — The Ravine. Sounds grander.', 'My quill is almost out of ink. And feathers. It is mostly a stick now.'],
    },
    wren: {
      name: 'Wren',
      epithet: 'the Scout',
      role: 'Scout',
      actor: 'wren',
      home: 'dustmuster',
      age: 24,
      bio: 'Deserted a camp that never noticed. Knows every shortcut, including several that are just ditches with confidence.',
      trait: 'Walking speed +10%. Unlocks shortcut choices.',
      mods: { speed: 0.1 },
      quips: ['Shortcut ahead. Probably.', 'I can see three crows. Two are judging us.', 'If anyone asks, we were never at that camp.'],
    },
    hazel: {
      name: 'Hazel',
      epithet: 'Orchard Rogue',
      role: 'Rogue',
      actor: 'hazel',
      home: 'applegrove',
      age: 27,
      bio: 'Steals apples on principle. The principle is that apples are delicious. Has quick hands and a quicker excuse.',
      trait: 'Finds 1 coin every 100 m. Luck +5%. Unlocks sneaky choices.',
      mods: { gold100: 1, luck: 0.05 },
      quips: ['Found a coin. On the ground. In a pocket. Same thing.', 'Relax, I only steal from people who deserve it. And trees.', 'Apple? Do not ask where from.'],
    },
    marta: {
      name: 'Marta',
      epithet: 'Barkeep',
      role: 'Barkeep',
      actor: 'marta',
      home: 'puddleford',
      age: 34,
      bio: 'Ran the Soggy Boot tavern for ten years. Can silence a brawl with one raised eyebrow and end it with the other.',
      trait: 'Morale +1 every 100 m. Inn stays cost 40% less.',
      mods: { morale100: 1, inn: 0.4 },
      quips: ['Last call was three villages ago, love.', 'Chin up. Ale tomorrow.', 'I have seen worse crowds. Not many.'],
    },
    halbert: {
      name: 'Sir Halbert',
      epithet: 'Halberdier',
      role: 'Guard',
      actor: 'halbert',
      home: 'watchtent',
      age: 39,
      bio: 'Guarded the same hill for eleven years. The hill has never been safer. Now guards you, which is harder.',
      trait: 'Luck +8% on risky choices. Unlocks guard choices.',
      mods: { luck: 0.08 },
      quips: ['Halt! Oh. It is you. Carry on.', 'I sense danger. Or lunch. Hard to tell.', 'This road is much bigger than my hill.'],
    },
    odalys: {
      name: 'Odalys',
      epithet: 'Peddler',
      role: 'Merchant',
      actor: 'odalys',
      home: 'waystone',
      age: 29,
      bio: 'Sells everything, including several things that are technically weather. Haggles in four languages and one interpretive dance.',
      trait: 'Market prices 25% lower. Unlocks haggling choices.',
      mods: { shop: 0.25 },
      quips: ['Everything is for sale. Except my backpack. And maybe my backpack.', 'That price was an insult. I loved it.', 'Want a slightly used compass? It points at snacks.'],
    },
    bellwether: {
      name: 'Bishop Bellwether',
      epithet: 'Wandering Bishop',
      role: 'Bishop',
      actor: 'bellwether',
      home: 'coinwell',
      age: 58,
      bio: 'Blesses everything: bread, boots, suspicious mushrooms. Especially suspicious mushrooms.',
      trait: 'Renown +10%. Morale never drops below 15. Unlocks blessing choices.',
      mods: { renown: 0.1, moraleFloor: 15 },
      quips: ['Bless this road. And that puddle. And you. Twice.', 'My mitre is not a hat. It is a commitment.', 'I once blessed a goose. It never forgave me.'],
    },
    agatha: {
      name: 'Sister Agatha',
      epithet: 'Battle Nun',
      role: 'Healer',
      actor: 'agatha',
      home: 'cloister',
      age: 45,
      bio: 'Took a vow of silence once. It lasted until breakfast. Heals bruises, sprains and bad attitudes.',
      trait: 'Morale never drops below 25. Unlocks healing choices.',
      mods: { moraleFloor: 25 },
      quips: ['Sit up straight.', 'If you are going to fall, fall gracefully.', 'I have a bandage and a ruler. Choose wisely.'],
    },
    pell: {
      name: 'Pell',
      epithet: 'Porter',
      role: 'Porter',
      actor: 'pell',
      home: 'millcreek',
      age: 22,
      bio: 'Carries everything. Has carried a cow, twice. The cow did not consent either time.',
      trait: 'Rations last 15% longer. Unlocks heavy-lifting choices.',
      mods: { food: -0.15 },
      quips: ['I can carry that. I can carry you. Want me to carry you?', 'My back is fine. It is one big muscle.', 'Is it lunch? It feels like lunch.'],
    },
    brom: {
      name: 'Brom Anvilbeard',
      epithet: 'Blacksmith',
      role: 'Smith',
      actor: 'brom',
      home: 'anvilrest',
      age: 61,
      bio: 'Can fix anything with a hammer, including things that were not broken. Especially those.',
      trait: 'Odd jobs pay 30% more. Unlocks smithing and mining choices.',
      mods: { work: 0.3 },
      quips: ['That rock has iron in it. I can smell it.', 'Hit it harder. Works for everything.', 'Back in my day roads were made of rocks. Proper rocks.'],
    },
    fennick: {
      name: 'Fennick',
      epithet: 'Hunter',
      role: 'Hunter',
      actor: 'fennick',
      home: 'hollow',
      age: 33,
      bio: 'Hunts rabbits, quail and the perfect hat feather. Mostly the feather.',
      trait: 'Finds 2 rations every 100 m. Unlocks tracking choices.',
      mods: { forage: 2 },
      quips: ['Rabbit tracks. Fresh. Very fresh. Too fresh.', 'Nobody move. There is a feather.', 'I named my bow Gerald.'],
    },
    murk: {
      name: 'Brother Murk',
      epithet: 'Retired Cultist',
      role: 'Mystic',
      actor: 'murk',
      home: 'mournby',
      age: 40,
      bio: 'Left a doom cult because the meetings ran long. Still glows a little in the dark. Extremely polite.',
      trait: 'Walking at night is 20% faster. Unlocks spooky choices.',
      mods: { night: 0.2 },
      quips: ['Lovely darkness this evening.', 'The void says hello. I said we are busy.', 'Please, after you. No, I insist.'],
    },
    elsie: {
      name: 'Elsie',
      epithet: 'Cook',
      role: 'Cook',
      actor: 'elsie',
      home: 'gourdon',
      age: 26,
      bio: 'Can make soup out of anything, and has. Nobody talks about Tuesday.',
      trait: 'Rations last 20% longer. Morale +1 every 100 m.',
      mods: { food: -0.2, morale100: 1 },
      quips: ['Soup in an hour. Do not ask what kind.', 'I can cook this rock. Should I? No. Could I? Yes.', 'Who keeps eating the onions raw?'],
    },
    clanksworth: {
      name: 'Sir Clanksworth',
      epithet: 'Knight Errant',
      role: 'Knight',
      actor: 'clanksworth',
      home: 'icebrook',
      age: 47,
      bio: 'Lost his horse in a card game. Lost the card game too. Still has excellent posture.',
      trait: 'Renown +10%. Unlocks chivalrous choices.',
      mods: { renown: 0.1 },
      quips: ['Fear not! I am armored. Mostly.', 'Clank. That was me. Sorry.', 'A knight never retreats. He advances in a different direction.'],
    },
    gruff: {
      name: 'Gruff',
      epithet: 'Sellsword',
      role: 'Sellsword',
      actor: 'gruff',
      home: 'coldwatch',
      age: 37,
      bio: 'Speaks in grunts. Translated, most grunts mean "I will handle it". Some mean "soup".',
      trait: 'Luck +10% on risky choices. Unlocks intimidation choices.',
      mods: { luck: 0.1 },
      quips: ['Hrm.', 'Hrrm.', 'Hrm. (He means: lovely weather.)'],
    },
    barrelby: {
      name: 'Barrelby',
      epithet: 'A Barrel',
      role: 'Barrel',
      actor: 'barrelby',
      home: 'frostfair',
      age: 'Oak, 12 years',
      bio: 'Nobody knows who is in the barrel. Nobody asks. Morale has never been higher.',
      trait: 'Morale +2 every 100 m. Unlocks barrel-based diplomacy.',
      mods: { morale100: 2 },
      quips: ['*sloshing noises*', '*a polite knock from inside*', '*the barrel rolls one inch closer to you, affectionately*'],
    },
    umbra: {
      name: 'Countess Umbra',
      epithet: 'Definitely Not a Vampire',
      role: 'Aristocrat',
      actor: 'umbra',
      home: 'gloomwood',
      age: 'A lady never tells (three hundred-ish)',
      bio: 'Avoids sunlight, garlic and mirrors for "aesthetic reasons". Pays in very, very old coins.',
      trait: 'Coins from events +20%. Walking at night is 10% faster.',
      mods: { goldMult: 0.2, night: 0.1 },
      quips: ['What a lovely neck you — necklace. Lovely necklace.', 'The sun is so rude.', 'I have not aged a day. I count in centuries.'],
    },
    brunhild: {
      name: 'Dame Brunhild',
      epithet: 'Champion of the Lists',
      role: 'Champion',
      actor: 'brunhild',
      home: 'wintermere',
      age: 30,
      bio: 'Undefeated in forty tourneys and one argument with a goose. The goose remains bitter.',
      trait: 'Luck +8%, renown +5%, walking speed +3%.',
      mods: { luck: 0.08, renown: 0.05, speed: 0.03 },
      quips: ['Point me at the problem.', 'I have trained for this. I have trained for everything.', 'Sir Clanksworth, your visor is on backwards.'],
    },
  };

  // ---------------------------------------------------------------------------
  // Trinkets — passive bonuses found on the road or bought at markets.
  // ---------------------------------------------------------------------------
  D.trinkets = {
    horseshoe: { name: 'Lucky Horseshoe', icon: 'star', price: 75, mods: { luck: 0.08 }, text: 'Luck +8%. Still faintly smells of horse.' },
    squeakyboots: { name: 'Squeaky Boots', icon: 'boot', price: 80, mods: { speed: 0.06 }, text: 'Walking speed +6%. They squeak with every step. Strangely motivating.' },
    wizardmap: { name: "Ambrose's Map", icon: 'map', price: 0, shop: false, mods: { speed: 0.05 }, text: 'Walking speed +5%. Wrong in extremely helpful ways.' },
    bottomlesspot: { name: 'Bottomless Pot', icon: 'food', price: 95, mods: { food: -0.12 }, text: 'Rations last 12% longer. The bottom is somewhere. Nobody has found it.' },
    goldenspoon: { name: 'Golden Spoon', icon: 'heart', price: 90, mods: { morale100: 1 }, text: 'Morale +1 every 100 m. Everything tastes royal.' },
    holeypurse: { name: 'Moth-Eaten Purse', icon: 'bag', price: 110, mods: { gold100: 1 }, text: 'Finds 1 coin every 100 m. Full of holes, yet coins keep falling in.' },
    herbpouch: { name: 'Herb Pouch', icon: 'basket', price: 70, mods: { forage: 1 }, text: 'Finds 1 ration every 100 m.' },
    crownpolish: { name: 'Crown Polish', icon: 'crown', price: 100, mods: { renown: 0.1 }, text: 'Renown +10%. The crown now outshines minor suns.' },
    walkingstick: { name: 'Gnarled Walking Stick', icon: 'road', price: 60, mods: { speed: 0.05 }, text: 'Walking speed +5%. Also good for pointing dramatically.' },
    saintsock: { name: 'Relic of Saint Sock', icon: 'candle', price: 80, mods: { moraleFloor: 10 }, text: 'Morale never drops below 10. Smells holy. Mostly.' },
    silverbell: { name: 'Silver Haggling Bell', icon: 'bag', price: 75, mods: { shop: 0.1 }, text: 'Market prices 10% lower. Merchants hear it and sigh.' },
    pumpkinlantern: { name: 'Pumpkin Lantern', icon: 'candle', price: 70, mods: { night: 0.15 }, text: 'Walking at night is 15% faster. It grins at the dark.' },
    snowglobe: { name: 'Snow Globe', icon: 'star', price: 70, mods: { winter: 0.12 }, text: 'Walking speed +12% in the Frostmarch. Shake for weather.' },
    taverntoken: { name: 'Tavern Token', icon: 'bed', price: 55, mods: { inn: 0.5 }, text: 'Inn stays cost 50% less. Nobody remembers why.' },
    toadcharm: { name: 'Toad Charm', icon: 'star', price: 0, shop: false, mods: { luck: 0.05, renown: 0.05 }, text: 'Luck +5%, renown +5%. Ribbits at midnight.' },
    honestscales: { name: 'Honest Scales', icon: 'bag', price: 90, mods: { shop: 0.15 }, text: 'Market prices 15% lower. Merchants hate these.' },
    knightspur: { name: "Knight's Spur", icon: 'sword', price: 115, mods: { speed: 0.08 }, text: 'Walking speed +8%. Jingles heroically.' },
    fryingpan: { name: 'Iron Frying Pan', icon: 'hammer', price: 60, mods: { food: -0.08, luck: 0.03 }, text: 'Rations last 8% longer, luck +3%. Also a weapon.' },
    gildedquill: { name: 'Gilded Quill', icon: 'book', price: 95, mods: { renown: 0.1 }, text: 'Renown +10%. Writes "magnificent" by itself.' },
    pigeonwhistle: { name: 'Pigeon Whistle', icon: 'talk', price: 60, mods: { gold100: 1 }, text: 'Finds 1 coin every 100 m. Pigeons bring "gifts".' },
    dragonscale: { name: 'Dragon Scale', icon: 'gem_ruby', price: 0, shop: false, mods: { luck: 0.1, speed: 0.05 }, text: 'Luck +10%, walking speed +5%. Warm to the touch.' },
    woofmedal: { name: 'Medal of Sir Woofington', icon: 'paw', price: 0, shop: false, mods: { morale100: 1, luck: 0.03 }, text: 'Morale +1 every 100 m, luck +3%. Awarded for being a good royal.' },
    royalpillow: { name: 'Royal Travel Pillow', icon: 'bed', price: 75, mods: { moraleFloor: 8, morale100: 0.5 }, text: 'Morale never drops below 8. Velvet. Embroidered. Slightly drooled on.' },
    compass: { name: 'Snack Compass', icon: 'map', price: 80, mods: { forage: 1, speed: 0.02 }, text: 'Finds 1 ration every 100 m. Points at snacks, not north.' },
  };

  // ---------------------------------------------------------------------------
  // Titles by renown. {Ruler} becomes Queen or King.
  // ---------------------------------------------------------------------------
  D.titles = [
    { at: 0, t: 'Self-Proclaimed {Ruler}' },
    { at: 60, t: '{Ruler} of the Ditch' },
    { at: 160, t: '{Ruler} of a Modest Puddle' },
    { at: 320, t: '{Ruler} of the Wayside' },
    { at: 520, t: '{Ruler} of Several Villages' },
    { at: 800, t: '{Ruler} of the Kingsroad' },
    { at: 1150, t: '{Ruler} of the Amber Reach' },
    { at: 1600, t: 'High {Ruler} of Nearly Everywhere' },
    // After the coronation at Dragon's Rest
    { at: 0, t: '{Ruler} of the Realm', crowned: true },
    { at: 2500, t: 'Legendary {Ruler} of the Realm', crowned: true },
    { at: 4000, t: '{Ruler} of Song and Story', crowned: true },
    { at: 6500, t: 'The {Ruler} Who Walked Forever', crowned: true },
  ];

  // ---------------------------------------------------------------------------
  // Royal Decrees (achievements)
  // ---------------------------------------------------------------------------
  D.achievements = [
    { id: 'firststeps', name: 'First Steps', text: 'Walk 100 meters with your crown on.', test: (s) => s.journey.total >= 100 },
    { id: 'smallcourt', name: 'A Small Court', text: 'Have four people in your party.', test: (s, x) => x.partySize >= 4 },
    { id: 'bigcourt', name: 'A Respectable Court', text: 'Have ten people in your party.', test: (s, x) => x.partySize >= 10 },
    { id: 'fullcourt', name: 'Full Court', text: 'Recruit every companion on the Kingsroad.', test: (s) => s.party.length >= Object.keys(TK.data.companions).length },
    { id: 'rich', name: 'Tax Collector at Heart', text: 'Hold 300 coins at once.', test: (s) => s.res.gold >= 300 },
    { id: 'broke', name: 'Royally Broke', text: 'Reach zero coins after your first kilometer.', test: (s) => s.res.gold === 0 && s.journey.total > 1000 },
    { id: 'diet', name: 'The Royal Diet', text: 'Walk 100 meters without rations.', test: (s) => s.stats.hungryMeters >= 100 },
    { id: 'jubilant', name: 'Jubilant Court', text: 'Reach 100 morale.', test: (s) => s.res.morale >= 99.5 },
    { id: 'walk5k', name: 'Five Thousand Steps (Roughly)', text: 'Walk 5 km.', test: (s) => s.journey.total >= 5000 },
    { id: 'walk20k', name: 'The Long Way Round', text: 'Walk 20 km.', test: (s) => s.journey.total >= 20000 },
    { id: 'walk50k', name: 'Legs of Legend', text: 'Walk 50 km.', test: (s) => s.journey.total >= 50000 },
    { id: 'events25', name: 'Seasoned Traveler', text: 'Face 25 road events.', test: (s) => s.stats.events >= 25 },
    { id: 'events100', name: 'Nothing Surprises Me Anymore', text: 'Face 100 road events.', test: (s) => s.stats.events >= 100 },
    { id: 'trinkets5', name: 'Collector of Shiny Things', text: 'Own five trinkets.', test: (s) => s.trinkets.length >= 5 },
    { id: 'trinkets12', name: 'Royal Treasury', text: 'Own twelve trinkets.', test: (s) => s.trinkets.length >= 12 },
    { id: 'woof', name: "Sir Woofington's Friend", text: 'Earn the respect of a very good knight.', test: (s) => !!s.flags.woofFriend },
    { id: 'barrel', name: 'Barrel Diplomacy', text: 'Welcome a barrel into your court.', test: (s) => s.party.indexOf('barrelby') >= 0 },
    { id: 'hurry', name: 'Impatient Monarch', text: 'Hurry your party along 200 times.', test: (s) => s.stats.hurries >= 200 },
    { id: 'nightowl', name: 'Night Owl', text: 'Travel after midnight.', test: (s) => !!s.flags.nightOwl },
    { id: 'rival', name: 'Gracious Rival', text: 'Show Duke Reginald kindness when he least deserves it.', test: (s) => !!s.flags.kindToReginald },
    { id: 'crowned', name: 'Kingmaker’s Blessing', text: 'Reach Dragon’s Rest and earn the dragon’s blessing.', test: (s) => !!s.flags.crowned },
    { id: 'endless', name: 'The Road Goes On', text: 'Reach a place beyond the end of the map.', test: (s, x) => x.inEndless && s.journey.stop > s.journey.route.length },
  ];

  // ---------------------------------------------------------------------------
  // Named NPC speakers (actor id -> display name). Events may override.
  // ---------------------------------------------------------------------------
  D.speakers = {
    crier: 'Pim, Royal-ish Herald',
    reginald: 'Duke Reginald Plumwhistle',
    ambrose: 'Ambrose the Wayfinder',
    toadwiz: 'Archmage Croakley',
    dragon: 'The Dragon',
    narrator: '',
  };

  // ---------------------------------------------------------------------------
  // Endless-mode place names
  // ---------------------------------------------------------------------------
  D.placeNames = {
    pre: ['Little', 'Upper', 'Lower', 'Old', 'New', 'Saint', 'Great', 'Middle', 'East', 'West', 'North', 'South', 'Much', 'Nether'],
    mid: ['Puddle', 'Wobble', 'Mudd', 'Cheese', 'Goose', 'Turnip', 'Bramble', 'Muddle', 'Thistle', 'Pickle', 'Gloom', 'Sunny', 'Butter', 'Crumb', 'Whistle', 'Frog', 'Barley', 'Kettle', 'Sock', 'Pudding', 'Soggy', 'Grumble', 'Honey', 'Nettle', 'Sprocket', 'Badger'],
    post: ['ford', 'ton', 'by', 'wick', 'bury', 'ham', 'stead', 'hollow', 'mere', 'brook', 'field', 'cross', 'wood', 'gate', 'well', 'bottom', 'thorpe'],
  };

  if (typeof module !== 'undefined' && module.exports) {
    module.exports = TK;
  }
})(typeof window !== 'undefined' ? window : globalThis);
