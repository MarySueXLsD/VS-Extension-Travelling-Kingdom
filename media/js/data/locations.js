/* Travelling Kingdom — the Kingsroad: locations, scenes and local stories.
 *
 * Dialogue lines are [speaker, text]. Speakers: 'hero', 'narrator', a companion id,
 * an actor id (named via `names` or TK.data.speakers). A choice node is
 * { choice: [{ t, req, fx, roll, then: [lines] }] }.
 * Scene x offsets are art pixels from where the hero stops (x = 0).
 */
(function (root) {
  'use strict';

  const TK = (root.TK = root.TK || {});
  const D = (TK.data = TK.data || {});

  const TREE = { green: 'tree', autumn: 'treeautumn', winter: 'treewinter' };
  const PINE = { green: 'pine', autumn: 'pineorange', winter: 'pinesnow' };
  const WILLOW = { green: 'willow', autumn: 'willowautumn', winter: 'willowwinter' };
  const BIRCH = { green: 'birch', autumn: 'birchautumn', winter: 'birchwinter' };
  const BUSH = { green: 'bush_g1', autumn: 'bush_a1', winter: 'bush_w1' };
  const ROCK = { green: 'rockbig_g', autumn: 'rockbig_a', winter: 'rockbig_w' };
  const ROCKMID = { green: 'rockmid_g', autumn: 'rockmid_a', winter: 'rockmid_w' };

  // ---------------------------------------------------------------------------
  // Scene layouts
  // ---------------------------------------------------------------------------
  D.scenes = {
    home: {
      props: [
        { p: TREE, x: -330 },
        { p: 'house1', x: -215 },
        { p: 'stable', x: -40 },
        { p: 'barrel', x: 102 },
        { p: 'crates', x: 124 },
        { p: BUSH, x: 175 },
      ],
      npcs: [{ a: 'cat', x: -95 }],
    },
    camp: {
      props: [
        { p: 'tentbig', x: -225 },
        { p: 'campleft', x: -128 },
        { p: 'barrels', x: -66 },
        { p: 'campfire', x: 64 },
        { p: 'firewood', x: 112 },
        { p: 'campright', x: 168 },
        { p: 'cratestack', x: 232 },
      ],
      npcs: [
        { a: 'knightsit', x: -92, face: 'right' },
        { a: 'dog', x: -50, face: 'right' },
        { a: 'knightlute', x: 92 },
      ],
    },
    orchard: {
      props: [
        { p: 'treeapple', x: -175 },
        { p: 'treeapple', x: 150 },
        { p: 'fruittable', x: -108 },
        { p: 'applebasket', x: -62 },
        { p: 'applepile', x: 74 },
        { p: 'apples', x: 96 },
        { p: 'tallgrass', x: 60, front: true },
      ],
      npcs: [{ a: 'grapes', x: -82, face: 'right' }],
    },
    village: {
      props: [
        { p: 'house1', x: -285 },
        { p: 'house3', x: -95 },
        { p: 'tavern', x: 165 },
        { p: 'barrel', x: 28 },
        { p: 'reedsmall', x: -200 },
        { p: 'bucket', x: -36 },
      ],
      npcs: [
        { a: 'serving', x: -165, face: 'right' },
        { a: 'cat', x: -122 },
        { a: 'villager1', x: -58, face: 'right' },
        { a: 'drunkard', x: 112 },
      ],
    },
    watch: {
      props: [
        { p: 'tentbig', x: -140 },
        { p: 'tentsmall', x: -66 },
        { p: 'campfire', x: 58 },
        { p: 'crates', x: 92 },
        { p: 'torch', x: 116 },
        { p: 'tentbig', x: 170, flip: true },
      ],
      npcs: [{ a: 'knightblue', x: -102, face: 'right' }],
    },
    waystone: {
      props: [
        { p: TREE, x: -235 },
        { p: ROCK, x: -52 },
        { p: { green: 'rock_g2', autumn: 'rock_a2', winter: 'rock_w2' }, x: 62 },
        { p: BUSH, x: 104 },
        { p: { green: 'tuft_g1', autumn: 'tuft_a1', winter: 'tuft_w1' }, x: 46, front: true },
        { p: BIRCH, x: 190 },
      ],
      npcs: [{ a: 'pigeon', x: -88 }],
    },
    market: {
      props: [
        { p: 'stall1', x: -330 },
        { p: 'shop', x: -150 },
        { p: 'stall2', x: 70 },
        { p: 'stall3', x: 170 },
        { p: 'tavern2', x: 410 },
        { p: 'crates', x: 5 },
      ],
      npcs: [
        { a: 'baker', x: -190, face: 'right' },
        { a: 'villager4', x: -82, face: 'right' },
        { a: 'dog', x: -30, face: 'right' },
        { a: 'cleaver', x: 110 },
        { a: 'grapes', x: 205 },
      ],
    },
    cloister: {
      props: [
        { p: 'cypress', x: -300 },
        { p: 'house6', x: -130 },
        { p: 'angel', x: 6 },
        { p: 'cypress', x: 64 },
        { p: 'bust', x: 112 },
        { p: 'urnflowers', x: 140 },
        { p: WILLOW, x: 270 },
      ],
      npcs: [
        { a: 'abbess', x: -64, face: 'right' },
        { a: 'tambourine', x: 96 },
      ],
    },
    mill: {
      props: [
        { p: 'stable', x: -190 },
        { p: 'sawmill', x: -60 },
        { p: 'sack', x: 54 },
        { p: 'sheaf', x: 74 },
        { p: 'wheat4', x: 120 },
        { p: 'wheat4', x: 140 },
        { p: 'wheat3', x: 160 },
        { p: 'wheat4', x: 180 },
        { p: 'wheat2', x: 200 },
      ],
      npcs: [
        { a: 'villager3', x: -205, face: 'right' },
        { a: 'woodcutter', x: -112, face: 'right' },
      ],
    },
    forge: {
      props: [
        { p: 'house5', x: -205 },
        { p: 'chopblock', x: -108 },
        { p: 'furnace', x: -58 },
        { p: 'ore_iron', x: 64 },
        { p: 'crates', x: 100 },
        { p: 'barrels', x: 124 },
        { p: 'ore_silver', x: 175 },
      ],
      npcs: [{ a: 'knightblue', x: 150 }],
    },
    hollow: {
      props: [
        { p: 'pinered', x: -235 },
        { p: PINE, x: -170 },
        { p: 'tentsmall', x: -96 },
        { p: 'campfirepot', x: 60 },
        { p: 'firewood', x: 96 },
        { p: 'axestump', x: 128 },
        { p: PINE, x: 205 },
      ],
      npcs: [
        { a: 'druid', x: -136, face: 'right' },
        { a: 'campwizard', x: 88 },
      ],
    },
    graveyard: {
      dusk: true,
      props: [
        { p: WILLOW, x: -225 },
        { p: 'grave1', x: -150 },
        { p: 'gravecross', x: -112 },
        { p: 'angel', x: -50 },
        { p: 'grave2', x: 68 },
        { p: 'graveold', x: 104 },
        { p: 'grave3', x: 142 },
        { p: 'jacko', x: 48 },
      ],
      npcs: [{ a: 'stranger', x: -84, face: 'right' }],
    },
    farm: {
      props: [
        { p: 'house2', x: -280 },
        { p: 'scarecrow', x: -130 },
        { p: 'pumpkinbig', x: -96 },
        { p: 'pumpkin', x: -72 },
        { p: 'sheaf', x: -40 },
        { p: 'jackobig', x: 66 },
        { p: 'stall3', x: 160 },
        { p: 'pumpkin', x: 214 },
        { p: 'wheat4', x: 238 },
      ],
      npcs: [
        { a: 'grapes', x: -215, face: 'right' },
        { a: 'villager5', x: -165, face: 'right' },
        { a: 'fiddler', x: 96 },
        { a: 'drummer', x: 124 },
      ],
    },
    ferry: {
      water: [-290, 290],
      props: [
        { p: PINE, x: -240 },
        { p: 'reeds', x: -128 },
        { p: { green: 'rock_g2', autumn: 'rock_a2', winter: 'rock_w2' }, x: -40 },
        { p: 'boat', x: 92, y: 4 },
        { p: PINE, x: 230 },
      ],
      npcs: [{ a: 'pirate', x: -80, face: 'right' }],
    },
    outpost: {
      props: [
        { p: 'wall', x: -165 },
        { p: 'torch', x: -122 },
        { p: 'tentsmall', x: -64 },
        { p: 'campfire', x: 58 },
        { p: 'cratestack', x: 90 },
        { p: 'barrels', x: 116 },
        { p: 'torch', x: 146 },
        { p: 'tentbig', x: 224, flip: true },
      ],
      npcs: [
        { a: 'knightale', x: -94, face: 'right' },
        { a: 'cuman', x: 128 },
      ],
    },
    fair: {
      props: [
        { p: 'stall1', x: -215 },
        { p: 'stall2', x: -100 },
        { p: 'xmastree', x: -22 },
        { p: 'torch', x: 58 },
        { p: 'stall3', x: 128 },
        { p: 'torch', x: 196 },
      ],
      npcs: [
        { a: 'snowmen', x: -160 },
        { a: 'drummer', x: -58, face: 'right' },
        { a: 'fiddler', x: 86 },
        { a: 'tambourine', x: 160 },
        { a: 'servant', x: 222 },
      ],
    },
    manor: {
      dusk: true,
      props: [
        { p: WILLOW, x: -270 },
        { p: 'house6', x: -100 },
        { p: 'statue', x: 62 },
        { p: 'urnplant', x: 92 },
        { p: 'column', x: 122 },
        { p: 'cypress', x: 168 },
      ],
      npcs: [{ a: 'servant', x: -68, face: 'right' }],
    },
    lists: {
      props: [
        { p: 'tentbig', x: -215 },
        { p: 'tentsmall', x: -130 },
        { p: 'torch', x: -78 },
        { p: 'crates', x: 78 },
        { p: 'barrels', x: 102 },
        { p: 'tentbig', x: 175, flip: true },
      ],
      npcs: [
        { a: 'paladin', x: -165, face: 'right' },
        { a: 'knightblue', x: -104, face: 'right' },
        { a: 'darkknight', x: 132 },
      ],
    },
    dragon: {
      castle: true,
      recruitX: 0,
      props: [
        { p: 'rockbig_x', x: -170 },
        { p: 'ore_gold', x: -70 },
        { p: ROCKMID, x: 236 },
        { p: 'ore_gem', x: 214 },
      ],
      npcs: [{ a: 'dragon', x: 122, face: 'left' }],
    },
  };

  // ---------------------------------------------------------------------------
  // The Kingsroad
  // ---------------------------------------------------------------------------
  D.route = [
    'dustmuster',
    'applegrove',
    'puddleford',
    'watchtent',
    'waystone',
    'coinwell',
    'cloister',
    'millcreek',
    'anvilrest',
    'hollow',
    'mournby',
    'gourdon',
    'icebrook',
    'coldwatch',
    'frostfair',
    'gloomwood',
    'wintermere',
    'dragonsrest',
  ];

  D.regions = {
    green: { name: 'The Greenwold', blurb: 'Rolling hills, friendly villages, and sheep with opinions.' },
    autumn: { name: 'The Amber Reach', blurb: 'Golden woods, harvest festivals, and fog that follows you home.' },
    winter: { name: 'The Frostmarch', blurb: 'Snow, pines, and the long climb toward Dragon’s Rest.' },
  };

  D.locations = {
    dustmuster: {
      name: 'Camp Dustmuster',
      region: 'green',
      leg: 150,
      kind: 'camp',
      scene: 'camp',
      recruit: 'wren',
      blurb: 'A soldier camp where nobody has marched in eleven years.',
      services: ['forage', 'rest'],
      names: { knightsit: 'Sergeant Pottle', knightlute: 'Private Strum', dog: 'Captain Biscuit' },
      flavor: {
        forage: 'You raid the camp larder with the sergeant’s blessing. "Take it. It is mostly beans."',
        rest: 'Private Strum plays a ballad about a brave soldier who never left camp. It is autobiographical.',
      },
      story: [
        ['narrator', 'Camp Dustmuster. A soldier camp where nobody has marched in eleven years. The tents have started putting down roots.'],
        ['knightsit', 'Halt! Who goes there? Slowly, please. My knees.'],
        ['hero', 'I am {hero}, {Ruler} of… the Road. I am gathering a court.'],
        ['knightsit', 'A court! We have a court-martial. Nobody has been court-martialled in years, mind. We mostly nap.'],
        ['wren', 'Psst. {Majesty}. I am Wren. Technically a scout. Technically a deserter. Nobody has noticed for two years.'],
        ['wren', 'I know every shortcut between here and the mountains. Some of them are ditches. Very confident ditches.'],
        {
          choice: [
            { t: 'Welcome aboard, scout.', fx: { renown: 10 }, then: [['wren', 'Excellent. I will leave a note for the army. They will not read it.']] },
            {
              t: 'Will the army mind?',
              fx: { food: 6 },
              then: [['knightsit', 'Mind? Lad, the army forgot it exists. Take him. Take some beans while you are at it.']],
            },
          ],
        },
        ['narrator', 'Wren joins your court, carrying a map with most of the roads crossed out.'],
      ],
    },
    applegrove: {
      name: 'Pippin’s Orchard',
      region: 'green',
      leg: 250,
      kind: 'orchard',
      scene: 'orchard',
      recruit: 'hazel',
      blurb: 'Rows of apple trees, a smell of cider, and the faint sound of someone stealing.',
      services: ['forage', 'work'],
      names: { grapes: 'Granny Pippin' },
      flavor: {
        forage: 'Granny Pippin lets you gather the windfalls. "Bruised apples make the best pies, dearie. Like people."',
        work: 'You help with the harvest. Quill falls out of a tree and writes a poem about it on the way down.',
      },
      story: [
        ['narrator', 'Pippin’s Orchard. Rows of apple trees, a smell of cider, and the faint sound of someone stealing.'],
        ['grapes', 'Visitors! Are you here about the thief? Every night apples vanish. Every morning I find the cores arranged in a little smiley face.'],
        ['hazel', '(from somewhere up a tree) Hello. I am not here.'],
        ['hero', '…You are in the tree.'],
        ['hazel', 'I am Hazel. I am a figment of your imagination. A very hungry figment.'],
        {
          choice: [
            {
              t: 'Pay for the stolen apples. (10 coins)',
              req: { gold: 10 },
              fx: { gold: -10, renown: 20, morale: 4 },
              then: [['grapes', 'An honest {ruler}! I have not seen one of those since… ever, actually.']],
            },
            {
              t: '[Wren] Spot her hiding place.',
              req: { m: 'wren' },
              fx: { morale: 6 },
              then: [
                ['wren', 'Third branch, left side. She is wearing a leaf hat.'],
                ['hazel', 'It is a GOOD leaf hat.'],
              ],
            },
            {
              t: 'Ask nicely for her to come down.',
              fx: { morale: 3 },
              then: [['hazel', 'Nicely? Nobody asks nicely. That is unsettling. Fine.']],
            },
          ],
        },
        ['grapes', 'Oh, I was never going to punish her. The smiley faces are the best part of my day. But she is wasted on one orchard.'],
        ['grapes', 'Take her with you, dearie. She could rob a whole kingdom.'],
        ['hazel', 'Rob? I prefer "redistribute". Royally.'],
        ['narrator', 'Hazel joins your court. Your rations bag is mysteriously heavier. So is your purse. You decide not to ask.'],
      ],
      outro: { food: 5 },
    },
    puddleford: {
      name: 'Puddleford',
      region: 'green',
      leg: 400,
      kind: 'village',
      scene: 'village',
      recruit: 'marta',
      blurb: 'A river town famous for its puddles, its mayor’s hat, and the Soggy Boot tavern.',
      services: ['market', 'inn', 'work'],
      names: { villager1: 'Mayor Plunk', serving: 'Tilly the Server', drunkard: 'Old Muddle', cat: 'The Town Cat' },
      flavor: {
        inn: 'The Soggy Boot offers warm beds that are, true to its name, only slightly damp.',
        work: 'You bail out the town square. It fills back up. The mayor calls it a success.',
        market: 'Puddleford’s market sells rations, boots, and more boots. There is a high demand for boots.',
      },
      story: [
        ['narrator', 'Puddleford. A river town famous for its puddles, its mayor’s hat, and the Soggy Boot tavern.'],
        ['villager1', 'Welcome to Puddleford! Mind the puddle. No — the other puddle. Too late.'],
        ['hero', 'I am looking for brave souls to join my court.'],
        ['villager1', 'Brave souls? We have damp souls, mostly. Damp, but sincere.'],
        ['marta', 'Oi, Mayor. Stop scaring off the customers.'],
        ['marta', 'Marta. I run the Soggy Boot. You have the look of a crowd that needs a barkeep. Long road, short tempers, nobody to pour?'],
        {
          choice: [
            { t: 'I cannot offer much pay.', then: [['marta', 'Love, I have been paid in wet coins and fish for ten years. A road sounds lovely.']] },
            { t: 'Can you handle trouble?', fx: { renown: 5 }, then: [['marta', 'I have ended forty bar brawls with one raised eyebrow. The other eyebrow is for emergencies.']] },
            {
              t: '[Hazel] Hazel, have you two met?',
              req: { m: 'hazel' },
              fx: { morale: 6 },
              then: [
                ['hazel', 'She threw me out of the Soggy Boot once.'],
                ['marta', 'Twice. You came back for the pie.'],
                ['hazel', 'It was GOOD pie.'],
              ],
            },
          ],
        },
        ['marta', 'Right. Muddle, you are in charge of the tavern.'],
        ['drunkard', 'Hic. Finally. Free drinks for the whole river!'],
        ['marta', '…I am going to regret that.'],
        ['narrator', 'Marta joins your court with a ladle, a barrel tap and an air of infinite patience.'],
      ],
    },
    watchtent: {
      name: 'Watchtent Hill',
      region: 'green',
      leg: 550,
      kind: 'watch',
      scene: 'watch',
      recruit: 'halbert',
      blurb: 'A lone guard has watched this hill for eleven years. The hill has behaved impeccably.',
      services: ['rest', 'work'],
      names: { knightblue: 'Captain Visor' },
      flavor: {
        rest: 'You camp on the safest hill in the realm. Nothing happens all night. It is wonderful.',
        work: 'You help repaint the watch post. Sir Halbert supervises with tears in his eyes.',
      },
      story: [
        ['narrator', 'Watchtent Hill. A lone guard has watched this hill for eleven years. The hill has behaved impeccably.'],
        ['halbert', 'HALT! State your name, your business and your favourite soup!'],
        ['hero', '{hero}, travelling {ruler}, and… leek?'],
        ['halbert', 'Leek. A respectable soup. You may pass.'],
        ['halbert', 'Wait. Did you say {ruler}? I have been guarding this hill for a king who never came back. Eleven years, {majesty}.'],
        {
          choice: [
            {
              t: 'Guard me instead. I am going much farther than a hill.',
              fx: { renown: 10 },
              then: [['halbert', 'Farther than a hill… a mountain?! I have always dreamed of guarding a mountain.']],
            },
            {
              t: 'But who will guard the hill?',
              fx: { morale: 6 },
              then: [
                ['halbert', 'Hmm. Captain Visor! You guard the hill.'],
                ['knightblue', 'Sir, I am a coat stand with a helmet on it.'],
                ['halbert', 'Perfect. Nobody will suspect a thing.'],
              ],
            },
          ],
        },
        ['narrator', 'Sir Halbert joins your court. He salutes every tree on the way out.'],
      ],
    },
    waystone: {
      name: 'The Wayside Stone',
      region: 'green',
      leg: 700,
      kind: 'waystone',
      scene: 'waystone',
      recruit: 'odalys',
      blurb: 'An ancient stone where travelers leave notes, coins and, apparently, a peddler.',
      services: ['market', 'forage'],
      names: { pigeon: 'A Pigeon' },
      flavor: {
        forage: 'Travelers left offerings at the stone. Most of it is bread. Some of it is bread-adjacent.',
        market: 'Odalys spreads a blanket and sells you things from a backpack that seems bigger inside.',
      },
      story: [
        ['narrator', 'The Wayside Stone. Travelers leave notes here. One reads: "Whoever stole my left boot — why only the left?"'],
        ['odalys', 'Welcome, welcome! Odalys, purveyor of fine goods, finer bargains, and one slightly cursed spoon.'],
        ['hero', 'Is the spoon dangerous?'],
        ['odalys', 'Only to soup. Now — rumor says a {ruler} is gathering a court. Rumor did not mention how… modest the court was.'],
        {
          choice: [
            { t: 'We are small, but we are going places.', then: [['odalys', '"Places" means customers. I love places.']] },
            { t: 'Join us. The pay is terrible.', fx: { morale: 4 }, then: [['odalys', 'Terrible pay, endless new markets? I have accepted worse deals. I have MADE worse deals.']] },
            {
              t: '[Marta] Can you vouch for us, Marta?',
              req: { m: 'marta' },
              fx: { renown: 10 },
              then: [
                ['marta', 'They are good folk. A bit mad.'],
                ['odalys', 'Mad is my favourite customer demographic.'],
              ],
            },
          ],
        },
        ['odalys', 'I will come along. I will get you good prices at every market from here to the mountains. Suspiciously good.'],
        ['narrator', 'Odalys joins your court. Her backpack clinks, rustles and, once, meows.'],
      ],
    },
    coinwell: {
      name: 'Coinwell Market',
      region: 'green',
      leg: 850,
      kind: 'market',
      scene: 'market',
      recruit: 'bellwether',
      blurb: 'The busiest market in the Greenwold. You can buy anything, including things you did not want.',
      services: ['market', 'inn', 'work', 'shrine'],
      names: { baker: 'Baker Crustwell', cleaver: 'Butcher Hock', villager4: 'Lady Fennimore', grapes: 'A Grape Seller', dog: 'A Market Dog' },
      flavor: {
        work: 'You work a market stall. You sell three cabbages and one cabbage-shaped rock. Nobody complains.',
        shrine: 'The bishop blesses your coins. They do not multiply, but they do feel smug.',
        inn: 'The Gilded Turnip inn: fancy pillows, fancy soup, fancy prices.',
      },
      story: [
        ['narrator', 'Coinwell Market, the busiest market in the Greenwold. You can buy anything here, including things you did not want.'],
        ['bellwether', 'Bless you! And you! And that cabbage!'],
        ['baker', 'He has been blessing my bread all morning. It sold out. Customers say it tastes of "holiness and rye".'],
        ['bellwether', 'I am Bishop Bellwether, the Wandering Bishop! I wander. I bless. Usually in that order.'],
        ['hero', 'Your Grace, would you bless our journey?'],
        ['bellwether', 'Bless it? My child, I will JOIN it. A {ruler} in need of a bishop is a {ruler} who will need crowning, eventually.'],
        {
          choice: [
            {
              t: 'Bless my crown.',
              fx: { renown: 20, flag: 'crownBlessed' },
              then: [
                ['bellwether', 'This crown is… genuine. Real gold, very old. Where did you get it?'],
                ['hero', 'An auction. It was in a box marked "hats".'],
                ['bellwether', 'Heavens.'],
              ],
            },
            {
              t: 'Bless the snacks.',
              fx: { food: 8, morale: 5 },
              then: [['bellwether', 'Blessed snacks taste twice as good and contain half the guilt!']],
            },
          ],
        },
        ['narrator', 'Bishop Bellwether joins your court. He blesses the road as he walks. The road seems pleased.'],
      ],
    },
    cloister: {
      name: 'Saint Wobble’s Cloister',
      region: 'autumn',
      leg: 950,
      kind: 'shrine',
      scene: 'cloister',
      recruit: 'agatha',
      blurb: 'A quiet cloister in the Amber Reach. The bells are slightly off-key.',
      services: ['shrine', 'inn', 'work'],
      names: { abbess: 'Mother Hilde', tambourine: 'Sister Jangle' },
      flavor: {
        shrine: 'You light a candle for Saint Wobble, patron of things that almost fall over.',
        inn: 'The cloister guest rooms are spotless, silent, and very, very early to rise.',
        work: 'You help copy manuscripts. Quill adds dragons to the margins. Nobody objects.',
      },
      story: [
        ['narrator', 'The Amber Reach. The woods blaze orange, the air smells of woodsmoke, and Saint Wobble’s Cloister rings its bells, slightly off-key.'],
        ['abbess', 'Welcome, travelers. We are a quiet order. We have taken vows of peace, prayer and—'],
        ['agatha', '—and NOT running in the corridors, Sister Jangle!'],
        ['tambourine', 'Sorry, Sister Agatha!'],
        ['abbess', 'Sister Agatha keeps… order. A great deal of order. Perhaps too much for one small cloister.'],
        ['agatha', 'A {ruler} on a long road with a scruffy court. Who bandages their knees? Who makes them sit up straight?'],
        {
          choice: [
            { t: 'We could use a healer.', then: [['agatha', 'You could use a miracle. I will do.']] },
            {
              t: 'Are you allowed to leave?',
              fx: { morale: 5 },
              then: [
                ['abbess', 'Allowed? We will throw a small, quiet, dignified party.'],
                ['tambourine', '*jangles with enormous enthusiasm*'],
              ],
            },
            {
              t: '[Bellwether] Your Grace, a word?',
              req: { m: 'bellwether' },
              fx: { renown: 10 },
              then: [
                ['bellwether', 'Sister, the road needs you.'],
                ['agatha', 'The road needs a broom, Bishop. So does your mitre.'],
                ['bellwether', '…She is perfect.'],
              ],
            },
          ],
        },
        ['narrator', 'Sister Agatha joins your court. Within an hour, everyone is walking with noticeably better posture.'],
      ],
    },
    millcreek: {
      name: 'Mill Creek',
      region: 'autumn',
      leg: 1050,
      kind: 'mill',
      scene: 'mill',
      recruit: 'pell',
      blurb: 'The sawmill saws, the millstone grinds, and nobody can hear anything.',
      services: ['work', 'market'],
      names: { woodcutter: 'Miller Dunst', villager3: 'Mrs. Dunst' },
      flavor: {
        work: 'You stack timber all afternoon. Brom critiques every stack. Loudly.',
        market: 'Flour, bread and sawdust biscuits ("high in fibre").',
      },
      story: [
        ['narrator', 'Mill Creek, where the sawmill saws, the millstone grinds, and nobody can hear a thing.'],
        ['woodcutter', 'WHAT?'],
        ['hero', 'I SAID, I AM ROYALTY!'],
        ['woodcutter', 'WHAT? OH. WELCOME! MIND THE SAWDUST! AND THE BOY!'],
        ['pell', 'Hi! I am Pell. I carry things. Logs, flour, a cow — twice. Want something carried?'],
        {
          choice: [
            { t: 'Could you carry our supplies?', fx: { food: 6 }, then: [['pell', 'ALL of them? At once? This is the best day of my life.']] },
            { t: 'Did the cow mind?', fx: { morale: 6 }, then: [['pell', 'She minded the first time. The second time, I think she enjoyed the view.']] },
          ],
        },
        ['woodcutter', 'TAKE HIM! HE EATS FOR FOUR AND CARRIES FOR TEN!'],
        ['narrator', 'Pell joins your court, carrying the luggage, two sacks of flour and, briefly, Quill.'],
      ],
    },
    anvilrest: {
      name: 'Anvil Rest',
      region: 'autumn',
      leg: 1150,
      kind: 'forge',
      scene: 'forge',
      recruit: 'brom',
      blurb: 'A forge town where the hammering never stops. Not even for lunch. Especially not for lunch.',
      services: ['work', 'market'],
      names: { knightblue: 'A Nervous Knight' },
      flavor: {
        work: 'You work the bellows. Your eyebrows survive. Mostly.',
        market: 'Nails, horseshoes, and a sword described as "probably sharp".',
      },
      story: [
        ['narrator', 'Anvil Rest, a forge town where the hammering never stops. Not even for lunch. Especially not for lunch.'],
        ['brom', '*CLANG* Customer! *CLANG* What needs fixing?'],
        ['hero', 'Nothing, actually. I am—'],
        ['brom', '*CLANG* Nonsense. Everything needs fixing. That crown, for one. Bit dented.'],
        ['hero', 'It came from an auction.'],
        ['brom', 'Hmph. Fine gold. Old work. Dragon-era goldsmithing. They do not make crowns like that anymore. They do not make dragons like that anymore either.'],
        {
          choice: [
            {
              t: 'Polish the crown. (10 coins)',
              req: { gold: 10 },
              fx: { gold: -10, renown: 25 },
              then: [['brom', '*shiiine* There. Now you look like you mean it.']],
            },
            {
              t: 'Dragon-era?',
              fx: { renown: 5, flag: 'dragonLore' },
              then: [['brom', 'Old crowns were forged up near Dragon’s Rest. Folk say the dragon sleeps on the old throne. Folk say a lot of things.']],
            },
          ],
        },
        ['brom', 'Tell you what. I have fixed everything in this town twice. Roads break things. I fix things. I am coming along.'],
        ['narrator', 'Brom Anvilbeard joins your court with a hammer, a travel-sized anvil and strong opinions about rocks.'],
      ],
    },
    hollow: {
      name: 'Hunter’s Hollow',
      region: 'autumn',
      leg: 1200,
      kind: 'camp',
      scene: 'hollow',
      recruit: 'fennick',
      blurb: 'A forest camp where hunters swap stories, most of them about the one that got away.',
      services: ['forage', 'rest'],
      names: { druid: 'Old Moss', campwizard: 'A Sleepy Wizard' },
      flavor: {
        forage: 'The hunters show you the best mushroom spots. Only two of the mushrooms talk back.',
        rest: 'Stories by the fire. Every fish gets bigger with each telling. One is now the size of a barn.',
      },
      story: [
        ['narrator', 'Hunter’s Hollow, a forest camp where hunters swap stories. Most of them are about the one that got away.'],
        ['fennick', 'Shh! Nobody move. There is a feather.'],
        ['hero', '…A feather?'],
        ['fennick', 'The PERFECT feather. Golden pheasant. Third branch up. I have been tracking it for six days.'],
        ['druid', 'He has been sitting under that tree for six days. We bring him soup.'],
        {
          choice: [
            {
              t: '[Hazel] Hazel, fetch the feather.',
              req: { m: 'hazel' },
              fx: { morale: 8, flag: 'featherGot' },
              then: [
                ['hazel', '*shimmies up the tree* Got it. Also two eggs and somebody’s lost sock.'],
                ['fennick', '…I could hug you. I will not. But I could.'],
              ],
            },
            {
              t: 'Wait with him.',
              fx: { morale: 5 },
              then: [
                ['narrator', 'You wait. And wait. Eventually the pheasant gets bored and drops the feather on Fennick’s head.'],
                ['fennick', 'Fate! This is fate!'],
              ],
            },
            {
              t: 'Offer him a job feeding the court.',
              fx: { food: 8 },
              then: [['fennick', 'A job? With food? Hunting for a whole court? That is… a lot of feathers.']],
            },
          ],
        },
        ['fennick', 'I will keep your bellies full, {majesty}. Rabbits, quail, and mushrooms that are probably not poisonous.'],
        ['narrator', 'Fennick joins your court. His hat now has the perfect feather. He touches it every eleven seconds.'],
      ],
    },
    mournby: {
      name: 'Mournby Churchyard',
      region: 'autumn',
      leg: 1250,
      kind: 'graveyard',
      scene: 'graveyard',
      recruit: 'murk',
      blurb: 'Old graves, older trees, and fog with a personal interest in you.',
      services: ['shrine', 'rest'],
      names: { stranger: 'The Gravedigger' },
      flavor: {
        shrine: 'You leave flowers on a forgotten grave. The fog seems to purr.',
        rest: 'A quiet night among the stones. Brother Murk tells the cosiest ghost stories you have ever heard.',
      },
      story: [
        ['narrator', 'Mournby Churchyard. Old graves, older trees, and fog that seems to take a personal interest in you.'],
        ['murk', 'Good evening. Please, do not be alarmed. I am Brother Murk. Formerly of the Cult of the Endless Night.'],
        ['hero', '…Formerly?'],
        ['murk', 'The meetings ran terribly long. Five hours of chanting, then a vote about snacks. I left.'],
        ['stranger', 'He tends the graves now. Polite lad. Glows a bit in the dark. Very handy for night work.'],
        {
          choice: [
            { t: 'Do you still worship darkness?', then: [['murk', 'Oh, no. I just like it. It is cosy. Like a blanket made of quiet.']] },
            {
              t: 'Can you see ghosts?',
              fx: { morale: 5 },
              then: [['murk', 'Only the shy ones. A lady by the oak has been waiting two hundred years for her husband. He is at the pub.']],
            },
            {
              t: '[Agatha] Your opinion, Sister?',
              req: { m: 'agatha' },
              fx: { morale: 6 },
              then: [
                ['agatha', 'Lovely manners. Terrible posture. I can fix one of those.'],
                ['murk', 'Thank you, Sister. …Which one?'],
              ],
            },
          ],
        },
        ['murk', 'May I come along? I am told I am good company on a dark road. I can light the way. Literally. A bit.'],
        ['narrator', 'Brother Murk joins your court. At night he glows faintly purple. The pigeons find it unsettling.'],
      ],
    },
    gourdon: {
      name: 'Gourdon Fields',
      region: 'autumn',
      leg: 1300,
      kind: 'farm',
      scene: 'farm',
      recruit: 'elsie',
      blurb: 'The Harvest Festival is on: pumpkins, music, and a scarecrow who has seen too much.',
      services: ['market', 'work', 'inn'],
      names: { villager5: 'Farmer Gourd', fiddler: 'A Fiddler', drummer: 'A Drummer', grapes: 'Auntie Marrow' },
      flavor: {
        work: 'You help bring in the harvest. Pell carries a pumpkin the size of a cart. The crowd chants his name.',
        inn: 'You sleep in the hayloft. It is warm, fragrant, and contains at least one hen.',
        market: 'Pumpkins, pies, pumpkin pies, and pies shaped like pumpkins.',
      },
      story: [
        ['narrator', 'Gourdon Fields, mid–Harvest Festival! Pumpkins, music, and a scarecrow who has seen too much.'],
        ['villager5', 'Welcome to the festival! We have pumpkin pie, pumpkin soup and pumpkin. Just pumpkin.'],
        ['elsie', 'Out of the way! Hot soup! Hot soup coming through!'],
        ['elsie', 'Oh! New faces! I am Elsie. I cook. Pumpkins mostly, but I will cook anything. I once cooked a boot. It was… fine.'],
        {
          choice: [
            {
              t: 'Judge the pie contest.',
              fx: { renown: 15, food: 10 },
              then: [['narrator', 'You declare everyone a winner. You are now beloved, and very, very full.']],
            },
            { t: 'Try the boot soup.', fx: { morale: 6 }, then: [['elsie', 'Brave! It is mostly leek now. The boot is more of a flavour memory.']] },
          ],
        },
        ['elsie', 'Let me cook for your court. A real court deserves real meals — not whatever that knight keeps eating out of his helmet.'],
        ['narrator', 'Elsie joins your court with a pot, three ladles and an alarming number of pumpkins.'],
      ],
    },
    icebrook: {
      name: 'Icebrook Ferry',
      region: 'winter',
      leg: 1350,
      kind: 'ferry',
      scene: 'ferry',
      recruit: 'clanksworth',
      blurb: 'Snow on the pines, ice on the river, and a ferry that has not moved since autumn.',
      services: ['rest', 'work'],
      names: { pirate: 'Ferryman Salt' },
      flavor: {
        rest: 'You warm up in the ferry hut. Salt tells sea stories. He has never seen the sea.',
        work: 'You chip ice off the dock. Sir Clanksworth helps. Mostly by falling over.',
      },
      story: [
        ['narrator', 'The Frostmarch. Snow on the pines, ice on the river, and a ferry that has not moved since autumn.'],
        ['pirate', 'Ahoy! Ferry is frozen. River is frozen. My beard is frozen. Try again in spring.'],
        ['clanksworth', 'Fear not, good ferryman! I, Sir Clanksworth, shall break the ice with my mighty sword!'],
        ['pirate', 'He has been saying that for a week. He hits it and it goes "tink".'],
        ['clanksworth', '*tink* …It is a very determined ice.'],
        {
          choice: [
            { t: 'Why is a knight stuck here?', then: [['clanksworth', 'I lost my horse in a card game. Then I lost the card game. Then winter took the river. A challenging month.']] },
            {
              t: '[Brom] Brom, crack the ice.',
              req: { m: 'brom' },
              fx: { renown: 15 },
              then: [
                ['brom', '*one mighty CLANG* There.'],
                ['pirate', 'Well, blow me down. The ferry is free!'],
                ['clanksworth', 'I loosened it.'],
              ],
            },
            { t: 'We could just walk around the river.', fx: { morale: 4 }, then: [['clanksworth', 'Walk AROUND?! …Is that allowed? Can knights do that?']] },
          ],
        },
        ['clanksworth', 'A {ruler}! On a quest! Might I join you? I have a sword, a shield and almost all of my armour.'],
        ['narrator', 'Sir Clanksworth joins your court. You will always know where he is. Clank. Clank. Clank.'],
      ],
    },
    coldwatch: {
      name: 'Coldwatch Post',
      region: 'winter',
      leg: 1400,
      kind: 'watch',
      scene: 'outpost',
      recruit: 'gruff',
      blurb: 'The post guarding the high pass. Its guards mostly guard the fire.',
      services: ['rest', 'work'],
      names: { knightale: 'Corporal Mead', cuman: 'A Frostbitten Guard' },
      flavor: {
        rest: 'You thaw by the watch fire. Gruff says "hrm" in a way that sounds almost like a lullaby.',
        work: 'You stand a watch shift. You spot three snowflakes and an owl. The owl spots you back.',
      },
      story: [
        ['narrator', 'Coldwatch Post guards the pass into the high Frostmarch. Its guards mostly guard the fire.'],
        ['knightale', 'Pass is closed! Unless you are a merchant. Or a friend. Or cold. Are you cold?'],
        ['gruff', 'Hrm.'],
        ['knightale', 'That is Gruff. Sellsword. We hired him to guard the pass. He guards it so well nobody comes through. Terrible for business.'],
        ['gruff', 'Hrrm.'],
        ['knightale', 'He says there are bandits up the pass. Or that he wants soup. Hard to tell.'],
        {
          choice: [
            { t: 'Hire him for the court.', fx: { renown: 5 }, then: [['gruff', 'Hrm. (He nods. Once. Firmly.)']] },
            { t: 'Gruff, do you ever speak in words?', fx: { morale: 5 }, then: [['gruff', '…Sometimes.'], ['gruff', 'Not today.']] },
            {
              t: '[Elsie] Offer him soup.',
              req: { m: 'elsie' },
              fx: { morale: 8 },
              then: [
                ['elsie', 'Leek soup?'],
                ['gruff', '…Hrm!'],
                ['knightale', 'I have never seen him smile. It is terrifying.'],
              ],
            },
          ],
        },
        ['narrator', 'Gruff joins your court. He says almost nothing, and somehow everyone feels safer.'],
      ],
    },
    frostfair: {
      name: 'The Frost Fair',
      region: 'winter',
      leg: 1450,
      kind: 'fair',
      scene: 'fair',
      recruit: 'barrelby',
      blurb: 'Music on the ice, roasted chestnuts, and a barrel nobody can explain.',
      services: ['market', 'inn', 'work'],
      names: { snowmen: 'Mr. and Mrs. Snow', fiddler: 'A Fiddler', drummer: 'A Drummer', tambourine: 'A Tambourine Nun', servant: 'A Waiter' },
      flavor: {
        market: 'Chestnuts, mittens, and a suspicious amount of mulled cider.',
        inn: 'You stay at the Frozen Kettle. The kettle is, in fact, frozen. The beds are not.',
        work: 'You run the ice-skating stall. Sir Clanksworth demonstrates how not to skate. Business booms.',
      },
      story: [
        ['narrator', 'The Frost Fair! Music on the ice, roasted chestnuts, and a snowman couple who seem very happy together.'],
        ['fiddler', '*plays a jig so fast the snow starts dancing*'],
        ['narrator', 'In the middle of the fair stands a barrel. It has stood there for three days. Nobody knows who is inside.'],
        ['hero', 'Hello… barrel?'],
        ['barrelby', '*a polite knock from inside*'],
        ['servant', 'That is Barrelby. Came with the ale merchants. The ale merchants left. The barrel stayed.'],
        {
          choice: [
            { t: 'Knock back.', fx: { morale: 5 }, then: [['barrelby', '*knock knock* … *knock*'], ['narrator', 'You seem to have made a friend. Or a pact. Possibly both.']] },
            { t: 'Is someone in there?', then: [['barrelby', '*sloshes thoughtfully*']] },
            {
              t: '[Odalys] Can you appraise it, Odalys?',
              req: { m: 'odalys' },
              fx: { renown: 8 },
              then: [['odalys', 'Oak, twelve years, superb craftsmanship. Priceless. Also it just winked at me. Barrels cannot wink.']],
            },
          ],
        },
        ['barrelby', '*the barrel rolls one inch closer to you, then rolls behind you, as if to say: lead the way*'],
        ['narrator', 'Barrelby joins your court. Morale immediately improves. Scholars will debate this for centuries.'],
      ],
    },
    gloomwood: {
      name: 'Gloomwood Manor',
      region: 'winter',
      leg: 1500,
      kind: 'manor',
      scene: 'manor',
      recruit: 'umbra',
      blurb: 'A grand house in a dark wood. It is always dusk here. The weather has given up.',
      services: ['inn', 'market'],
      names: { servant: 'Grimsby, the Butler' },
      flavor: {
        inn: 'You sleep in a guest room with heavy curtains. Breakfast is served at midnight.',
        market: 'Grimsby sells "vintage" heirlooms. Very vintage. Some still have cobwebs.',
      },
      story: [
        ['narrator', 'Gloomwood Manor, a grand house in a dark wood. It is always dusk here. The weather has given up.'],
        ['servant', 'Welcome to Gloomwood. The Countess will receive you. Please do not open the curtains. Or mention garlic. Or mirrors.'],
        ['umbra', 'Guests! How delightful. It has been… centuries? Days. Days. It has been days.'],
        ['umbra', 'I am Countess Umbra. I am definitely not a vampire. I simply have a delicate complexion and hate the sun for personal reasons.'],
        {
          choice: [
            { t: 'Why do you sleep in a coffin?', then: [['umbra', 'It is not a coffin. It is a very narrow bed with a lid. For drafts.']] },
            { t: 'You have lovely teeth.', fx: { morale: 4 }, then: [['umbra', 'Thank you. They are… decorative.']] },
            {
              t: '[Murk] Brother Murk, is she…?',
              req: { m: 'murk' },
              fx: { morale: 8 },
              then: [
                ['murk', 'Countess, I must ask—'],
                ['umbra', 'No.'],
                ['murk', '—whether you would like to walk at night with us. The stars are lovely.'],
                ['umbra', '…Oh. Oh, that is sweet.'],
              ],
            },
          ],
        },
        ['umbra', 'A long road under the stars with a scruffy, charming court? Grimsby, pack my umbrella. My other umbrella. All of my umbrellas.'],
        ['narrator', 'Countess Umbra joins your court, paying her way in very old coins from very old kingdoms.'],
      ],
    },
    wintermere: {
      name: 'Wintermere Lists',
      region: 'winter',
      leg: 1550,
      kind: 'lists',
      scene: 'lists',
      recruit: 'brunhild',
      blurb: 'A tourney field at the foot of the mountains. Knights come here to fall off horses in style.',
      services: ['work', 'rest'],
      names: { paladin: 'Sir Gleam', knightblue: 'Sir Dent', darkknight: 'The Black Knight (it is paint)' },
      flavor: {
        work: 'You enter the squire race. You come second, behind a goat that wandered onto the course.',
        rest: 'You camp by the lists. Knights polish armour all night. It is surprisingly soothing.',
      },
      story: [
        ['narrator', 'Wintermere Lists, the tourney field at the foot of the mountains. Knights come here to fall off horses in style.'],
        ['brunhild', 'Next challenger! Anyone? Forty wins in a row and NOBODY wants forty-one?'],
        ['paladin', 'I am not fighting her again. She beat me with a breadstick.'],
        ['brunhild', 'It was a very stale breadstick.'],
        ['hero', 'I am {hero}, a travelling {ruler}. We are bound for Dragon’s Rest.'],
        ['brunhild', 'Dragon’s Rest? The DRAGON? Finally — a worthy opponent!'],
        {
          choice: [
            { t: 'We are not fighting the dragon.', then: [['brunhild', 'Oh. Well. I am coming anyway, in case it starts something.']] },
            {
              t: '[Clanksworth] Sir Clanksworth wishes to challenge you.',
              req: { m: 'clanksworth' },
              fx: { renown: 10, morale: 6 },
              then: [
                ['clanksworth', 'Dame Brunhild! I challenge— *trips over his own sword*'],
                ['brunhild', '…I accept your surrender.'],
                ['clanksworth', 'Gracious in victory! Truly a champion.'],
              ],
            },
            {
              t: 'Duel me for a place in my court!',
              roll: {
                p: 0.35,
                win: { t: 'You win! Somehow. She laughs: "Nobody has ever tickled me mid-swing. Clever!"', fx: { renown: 30 } },
                lose: { t: 'You lose spectacularly. She helps you up. "Good form! I am coming with you anyway."', fx: { morale: 5 } },
              },
            },
          ],
        },
        ['brunhild', 'Forty-one tourneys was never the goal. A dragon is a goal.'],
        ['narrator', 'Dame Brunhild joins your court. She practises sword drills while walking. Everyone walks a little further away.'],
      ],
    },
    dragonsrest: {
      name: 'Dragon’s Rest',
      region: 'winter',
      leg: 1700,
      kind: 'dragon',
      scene: 'dragon',
      recruit: null,
      finale: true,
      blurb: 'The old throne, the old gold, and a very old dragon, asleep.',
      services: [],
      story: null, // see TK.data.finale (story.js)
    },
  };

  // ---------------------------------------------------------------------------
  // Endless mode templates (after the finale): reuse scene layouts.
  // ---------------------------------------------------------------------------
  D.endlessKinds = {
    village: {
      scene: 'village',
      services: ['market', 'inn', 'work'],
      blurb: ['A village of crooked roofs and straight answers.', 'Every house has a goose. Every goose has a grudge.', 'A sleepy village that wakes up just to stare at your crown.'],
      greet: ['The villagers line the road to see the {Ruler} of the Realm. One of them is holding a sign that says "WHO?"', 'Children chase your court down the lane shouting "Do the wave! Do the royal wave!"'],
    },
    market: {
      scene: 'market',
      services: ['market', 'inn', 'work', 'shrine'],
      blurb: ['A market town loud enough to scare crows two valleys over.', 'Stalls of cheese, cloth, and questionable potions.'],
      greet: ['A merchant tries to sell you your own portrait. It is not a good likeness. You buy it anyway.', 'The market falls silent as you arrive, then immediately raises all its prices.'],
    },
    camp: {
      scene: 'camp',
      services: ['forage', 'rest'],
      blurb: ['A camp of wandering soldiers who are not sure which war they are in.', 'A ring of tents and a pot that never stops bubbling.'],
      greet: ['The soldiers salute you. Then argue about whether they should have.', 'A sergeant asks if the dragon is still asleep. You say yes. Everyone relaxes.'],
    },
    farm: {
      scene: 'farm',
      services: ['market', 'work', 'inn'],
      blurb: ['Fields of gold and a scarecrow with excellent posture.', 'A farm where every pumpkin has a name.'],
      greet: ['The farmer offers you a pumpkin as tribute. It is very heavy. Pell is delighted.'],
    },
    mill: {
      scene: 'mill',
      services: ['work', 'market'],
      blurb: ['A mill so loud the birds have learned sign language.', 'Sawdust, flour and a miller who shouts lovingly.'],
      greet: ['The miller shouts a greeting. You think. It might have been a warning.'],
    },
    forge: {
      scene: 'forge',
      services: ['work', 'market'],
      blurb: ['A forge that never sleeps, run by a smith who never blinks.', 'Hammers ring like bells here, if bells were angry.'],
      greet: ['The smith offers to engrave your crown. You politely decline. He engraves your boots instead.'],
    },
    shrine: {
      scene: 'cloister',
      services: ['shrine', 'inn', 'work'],
      blurb: ['A quiet shrine where even the wind whispers.', 'A cloister famous for its bread and its very strict librarian.'],
      greet: ['The monks ring the bells for you. Slightly off-key, out of respect for tradition.'],
    },
    graveyard: {
      scene: 'graveyard',
      services: ['shrine', 'rest'],
      blurb: ['An old churchyard where the fog has seniority.', 'Graves, crows, and a bench with a lovely view.'],
      greet: ['A ghost bows to you. You bow back. Brother Murk is very proud.'],
    },
    ferry: {
      scene: 'ferry',
      services: ['rest', 'work'],
      blurb: ['A ferry crossing with a ferryman who charges in riddles.', 'A river crossing where the boat is older than the river.'],
      greet: ['The ferryman asks for a riddle as payment. Quill recites forty stanzas. The ferryman lets you through out of fear.'],
    },
    fair: {
      scene: 'fair',
      services: ['market', 'inn', 'work'],
      blurb: ['A travelling fair with music, games and a two-headed calf (one head is fake).', 'A fair where the jugglers juggle and the jugglers’ cats judge.'],
      greet: ['The fair holds a parade in your honour. It is mostly a goat in a hat. You are moved anyway.'],
    },
    orchard: {
      scene: 'orchard',
      services: ['forage', 'work'],
      blurb: ['An orchard heavy with fruit and gossip.', 'Apple trees as far as the eye can see, and one pear tree with a chip on its shoulder.'],
      greet: ['The orchard keeper names an apple variety after you. It is crunchy and slightly smug.'],
    },
    watch: {
      scene: 'outpost',
      services: ['rest', 'work'],
      blurb: ['A watch post where the guards watch the road and the road watches back.', 'A fortified post with a very serious goat.'],
      greet: ['The guards ask for a password. You say "please". It works.'],
    },
  };

  if (typeof module !== 'undefined' && module.exports) {
    module.exports = TK;
  }
})(typeof window !== 'undefined' ? window : globalThis);
