/* Travelling Kingdom — road events, part 2: places, weather, objects and your court. */
(function (root) {
  'use strict';

  const TK = (root.TK = root.TK || {});
  const D = (TK.data = TK.data || {});
  D.events = D.events || [];

  D.events.push(
    // -------------------------------------------------------------------------
    // Things by the road
    // -------------------------------------------------------------------------
    {
      id: 'chest_note',
      title: 'Definitely Not a Trap',
      prop: 'chest',
      text: 'A wooden chest sits by the road. A note is pinned to it: NOT A TRAP.',
      choices: [
        {
          t: 'Open it.',
          roll: {
            p: 0.55,
            win: { t: 'Coins! A whole nest of them. The note was telling the truth. Who knew.', fx: { gold: 25 } },
            lose: { t: 'Bees. It is full of very annoyed bees.', fx: { morale: -6 } },
          },
        },
        { t: 'Hazel checks it for traps.', req: { m: 'hazel' }, ok: { t: 'Hazel disarms a spring-loaded pie and opens the chest. Coins, and also the pie.', fx: { gold: 30, food: 3 } } },
        { t: 'Leave it.', ok: { t: 'Quill writes "cowardice". You make him cross it out and write "prudence".', fx: { morale: -1 } } },
      ],
    },
    {
      id: 'signpost',
      title: 'This Way',
      text: 'A crossroads signpost points in four directions. Every arm says THIS WAY.',
      choices: [
        {
          t: 'Take the left road.',
          roll: {
            p: 0.5,
            win: { t: 'It rejoins the Kingsroad further ahead. A lucky guess!', fx: { meters: 45 } },
            lose: { t: 'It loops back to the same signpost. It seems smug.', fx: { meters: -20, morale: -2 } },
          },
        },
        { t: 'Wren reads the sign properly.', req: { m: 'wren' }, ok: { t: '"The fourth arm is carved differently. That one." Wren is right. Wren is usually right.', fx: { meters: 55 } } },
        { t: 'Stay on the main road.', ok: { t: 'Safe, sensible, and a little bit boring. Quill sighs.' } },
      ],
    },
    {
      id: 'ditch_shortcut',
      title: 'A Confident Ditch',
      who: { m: 'wren' },
      req: { m: 'wren' },
      text: 'Wren points at a ditch. "Shortcut. Trust me. It is a very confident ditch."',
      choices: [
        {
          t: 'Trust Wren.',
          roll: {
            p: 0.65,
            win: { t: 'It IS a shortcut. Muddy, but brilliant. Wren takes a little bow.', fx: { meters: 60 } },
            lose: { t: 'It is a very confident ditch that leads to a less confident ditch. Mud everywhere.', fx: { morale: -4, meters: -10 } },
          },
        },
        { t: 'Stick to the road.', ok: { t: 'Wren shrugs. "Your loss. The ditch had great views."' } },
      ],
    },
    {
      id: 'sudden_rain',
      title: 'Downpour',
      weather: 'rain',
      req: { biome: ['green', 'autumn'] },
      text: 'The sky opens. A sudden downpour soaks your entire court in seconds.',
      choices: [
        { t: 'Shelter under a tree.', ok: { t: 'You wait it out, dripping. The tree drips too, sympathetically.', fx: { morale: -2 } } },
        { t: 'Sing in the rain!', ok: { t: 'Soaked to the bone, the whole court sings. It is ridiculous and glorious.', fx: { morale: 7 } } },
        { t: 'Countess Umbra shares her umbrellas.', req: { m: 'umbra' }, ok: { t: 'She has twelve umbrellas. Everyone gets one. Barrelby gets two.', fx: { morale: 10 } } },
      ],
    },
    {
      id: 'decorative_bridge',
      title: 'The Decorative Bridge',
      text: 'A river crosses the road. There is a bridge, but a sign says: DECORATIVE ONLY.',
      choices: [
        { t: 'Wade across.', ok: { t: 'Cold, wet, and somehow the river is deeper in the middle than at either end.', fx: { morale: -3 } } },
        { t: 'Pell carries everyone across.', req: { m: 'pell' }, ok: { t: 'Pell ferries the entire court across, two at a time. He is not even out of breath.', fx: { morale: 7, renown: 3 } } },
        {
          t: 'Use the decorative bridge anyway.',
          roll: {
            p: 0.5,
            win: { t: 'It holds! You feel like a rebel.', fx: { morale: 5 } },
            lose: { t: 'It was, as advertised, decorative.', fx: { morale: -5 } },
          },
        },
      ],
    },
    {
      id: 'wild_apples',
      title: 'Wild Orchard',
      prop: 'treeapple',
      req: { biome: ['green', 'autumn'] },
      text: 'Wild apple trees lean over the road, heavy with fruit.',
      choices: [
        { t: 'Pick apples.', ok: { t: 'Crisp, sweet, free. The best kind of apple.', fx: { food: 8 } } },
        { t: 'Hazel picks the best ones.', req: { m: 'hazel' }, ok: { t: 'Hazel knows exactly which apples are perfect. She has a gift. And a sack.', fx: { food: 13, morale: 4 } } },
        { t: 'Leave them for the birds.', ok: { t: 'The birds sing you a thank-you song. Possibly.', fx: { morale: 3 } } },
      ],
    },
    {
      id: 'fairy_ring',
      title: 'A Ring of Mushrooms',
      text: 'A perfect ring of mushrooms grows beside the road. The air inside it shimmers.',
      choices: [
        {
          t: 'Step into the ring.',
          outcomes: [
            { w: 2, t: 'You feel light as a feather. Your feet barely touch the road.', fx: { buff: { id: 'fairyring', label: 'Feather-light', speed: 1.4, meters: 120 } } },
            { w: 1, t: 'You dance uncontrollably for twenty minutes. Great cardio. Very embarrassing.', fx: { morale: 4 } },
          ],
        },
        { t: 'Fennick picks the safe ones.', req: { m: 'fennick' }, ok: { t: 'Fennick gathers the edible ones and leaves the ring untouched. Respectful and delicious.', fx: { food: 10 } } },
        { t: 'Walk well around it.', ok: { t: 'Wise. The mushrooms seem disappointed.' } },
      ],
    },
    {
      id: 'wishing_well',
      title: 'The Wishing Well',
      text: 'An old stone well with a sign: WISHES — 1 COIN. NO REFUNDS. NO RETURNS. NO SWIMMING.',
      choices: [
        {
          t: 'Toss in a coin.',
          cost: { gold: 1 },
          roll: {
            p: 0.3,
            win: { t: 'The well throws back a handful of coins. With friends.', fx: { gold: 20 } },
            lose: { t: 'Plink. Nothing. Wishes take time, apparently.', fx: { morale: 2 } },
          },
        },
        { t: 'Peek inside.', ok: { t: 'A voice echoes up: "Occupied!" You back away slowly.', fx: { morale: 4 } } },
      ],
    },
    {
      id: 'broken_cart',
      title: 'Lost a Wheel',
      who: { a: 'villager3', n: 'A Stranded Merchant' },
      text: 'A merchant sits beside her cart, which has three wheels and a very obvious fourth-wheel-shaped problem.',
      choices: [
        { t: 'Help fix it.', ok: { t: 'Between you, you prop it up well enough. She pays you for your trouble.', fx: { gold: 12 } } },
        { t: 'Brom fixes it properly.', req: { m: 'brom' }, ok: { t: 'Brom fixes the wheel, the axle, the other wheels and her shoes. She pays double.', fx: { gold: 22, renown: 5 } } },
        { t: 'Buy her stock cheaply. (6 coins)', cost: { gold: 6 }, ok: { t: 'Rations at half price. She is relieved to lighten the load.', fx: { food: 14 } } },
      ],
    },
    {
      id: 'sheep_flock',
      title: 'Forty-Two Subjects',
      text: 'A flock of sheep surrounds your court. They seem to believe you are in charge.',
      choices: [
        { t: 'Accept them as subjects.', ok: { t: 'Your kingdom grows by forty-two sheep! They leave after ten minutes. Still counts.', fx: { renown: 10, morale: 4 } } },
        { t: 'Lead them home.', ok: { t: 'The shepherd is overjoyed and gives you cheese. So much cheese.', fx: { food: 9, renown: 4 } } },
        { t: 'Gruff stares at them.', req: { m: 'gruff' }, ok: { t: 'The sheep disperse in an orderly fashion. Gruff looks faintly sad. He liked them.', fx: { morale: 4 } } },
      ],
    },
    {
      id: 'goose_bridge',
      title: 'The Goose',
      text: 'A large goose stands in the middle of the road. It hisses. It is not moving. It will never move.',
      choices: [
        { t: 'Pay tribute. (2 rations)', cost: { food: 2 }, ok: { t: 'The goose accepts your bread as is its due, and allows you to pass. Barely.', fx: { morale: 2 } } },
        {
          t: 'Fight the goose.',
          roll: {
            p: 0.3,
            boost: [{ m: 'gruff', add: 0.1 }],
            win: { t: 'You win. Against a goose. Quill writes a whole chapter about it.', fx: { renown: 15, morale: 6 } },
            lose: { t: 'The goose wins. The goose always wins.', fx: { morale: -6 } },
          },
        },
        { t: 'Dame Brunhild faces it.', req: { m: 'brunhild' }, ok: { t: 'Brunhild and the goose stare at each other. Old rivals. After a long moment, the goose leaves.', fx: { renown: 12, morale: 10 } } },
      ],
    },
    {
      id: 'starry_night',
      title: 'A Crowded Sky',
      req: { night: true },
      text: 'The sky is so full of stars it looks crowded.',
      choices: [
        { t: 'Stop and stargaze.', ok: { t: 'You lie in the grass and count stars until you lose count. Twice.', fx: { morale: 10 } } },
        { t: 'Brother Murk names the constellations.', req: { m: 'murk' }, ok: { t: '"That one is the Great Soup Ladle. That one is Gerald." He glows with joy. Literally.', fx: { morale: 13 } } },
        { t: 'Keep walking.', ok: { t: 'The stars follow along. They do not mind.' } },
      ],
    },
    {
      id: 'thick_fog',
      title: 'Pea Soup',
      req: { biome: ['autumn', 'winter'] },
      text: 'A fog so thick rolls in that you cannot see your own boots.',
      choices: [
        { t: 'Everyone hold hands.', ok: { t: 'A long, silly chain of hands through the fog. Nobody gets lost. Nobody lets go.', fx: { morale: 7 } } },
        { t: 'Brother Murk glows the way.', req: { m: 'murk' }, ok: { t: 'Murk glows purple at the front like a lighthouse. You make excellent time.', fx: { meters: 35, morale: 4 } } },
        {
          t: 'Push on regardless.',
          roll: {
            p: 0.5,
            win: { t: 'You stumble out the other side, right where you meant to be.', fx: { meters: 20 } },
            lose: { t: 'You walk in a circle and meet yourselves coming the other way. Confusing.', fx: { meters: -20, morale: -2 } },
          },
        },
      ],
    },
    {
      id: 'snowball',
      title: 'An Unclaimed Snowball',
      req: { biome: ['winter'] },
      text: 'A snowball hits Quill square in the back of the head. Nobody admits to throwing it.',
      choices: [
        { t: 'Retaliate!', ok: { t: 'Full snowball war. No winners. Only joy, and wet socks.', fx: { morale: 12, food: -2 } } },
        { t: 'Declare a royal ceasefire.', ok: { t: 'Order is restored. Mostly. A snowball hits you as you finish the decree.', fx: { renown: 4, morale: -2 } } },
        { t: 'Barrelby gets hit.', req: { m: 'barrelby' }, ok: { t: 'A snowball knocks Barrelby. Barrelby rolls downhill. Everyone chases him. Best afternoon of the trip.', fx: { morale: 15 } } },
      ],
    },
    {
      id: 'frozen_pond',
      title: 'Perfect Ice',
      req: { biome: ['winter'] },
      text: 'A frozen pond gleams beside the road, smooth as glass.',
      choices: [
        {
          t: 'Go skating!',
          roll: {
            p: 0.6,
            win: { t: 'You glide like royalty. Several people applaud. One is a duck.', fx: { morale: 10 } },
            lose: { t: 'You fall. Gracefully. Ish. Everyone laughs, including you.', fx: { morale: 5 } },
          },
        },
        { t: 'Sir Clanksworth tries skating.', req: { m: 'clanksworth' }, ok: { t: 'Clank. Slide. CLANK. Spin. KER-CLANK. He bows. Standing ovation.', fx: { morale: 13 } } },
        { t: 'Walk around it.', ok: { t: 'Sensible. The pond seems a little lonely.' } },
      ],
    },
    {
      id: 'leaf_pile',
      title: 'The Great Leaf Pile',
      req: { biome: ['autumn'] },
      text: 'Somebody has raked an enormous pile of golden leaves beside the road. It is calling to you.',
      choices: [
        { t: 'Jump in!', ok: { t: 'CRUNCH. You emerge covered in leaves and absolutely radiant.', fx: { morale: 10 } } },
        { t: 'Pell jumps in.', req: { m: 'pell' }, ok: { t: 'Pell vanishes entirely. Found an hour later, asleep, very happy.', fx: { morale: 9 } } },
        { t: 'Respect the raker’s work.', ok: { t: 'Somewhere, a gardener feels a warm glow of appreciation.', fx: { renown: 3 } } },
      ],
    },
    {
      id: 'harvest_rain',
      title: 'Race the Rain',
      who: { a: 'villager5', n: 'A Worried Farmer' },
      req: { biome: ['autumn'] },
      text: 'Farmers are rushing to bring in the harvest before the storm. "Any hands to spare?"',
      choices: [
        { t: 'Help bring it in.', ok: { t: 'You beat the rain by a minute. The farmers share their harvest.', fx: { gold: 10, food: 8, morale: -2 } } },
        { t: 'Pell carries the whole cart.', req: { m: 'pell' }, ok: { t: 'Pell pulls the full harvest cart into the barn at a jog. The farmers want to keep him.', fx: { food: 12, gold: 10, renown: 5 } } },
        { t: 'Sorry, we must keep moving.', ok: { t: 'The rain comes. You hear distant, sad mooing.', fx: { morale: -2 } } },
      ],
    },
    {
      id: 'balloon',
      title: 'Something in the Sky',
      prop: 'balloon',
      text: 'A strange striped balloon drifts overhead. Someone in the basket waves… and drops a sandbag.',
      choices: [
        {
          t: 'Catch it!',
          roll: {
            p: 0.5,
            win: { t: 'It is not sand. It is coins! A gift from the sky!', fx: { gold: 18 } },
            lose: { t: 'It is sand. On Sir Halbert, if he is here. If not, on Quill.', fx: { morale: 3 } },
          },
        },
        { t: 'Wave back.', ok: { t: 'They wave harder. You wave harder. This goes on for some time.', fx: { morale: 4 } } },
      ],
    },
    {
      id: 'portal',
      title: 'The Humming Portal',
      prop: 'portal',
      text: 'A swirling dark portal hums by the roadside. A sign beside it reads: DO NOT ENTER (UNLESS CURIOUS).',
      choices: [
        {
          t: 'Step through.',
          outcomes: [
            { w: 2, t: 'You step out a long way down the road. Exciting! Also a bit nauseating.', fx: { meters: 85 } },
            { w: 1, t: 'You step into a royal treasury somewhere, grab a handful of coins, and step back out.', fx: { gold: 22 } },
            { w: 1, t: 'You step into a pond. You step out of a pond. The portal seems pleased with itself.', fx: { morale: -4 } },
          ],
        },
        { t: 'Throw a pebble in.', ok: { t: 'A pebble flies back out. A different pebble. Fancier.', fx: { morale: 4 } } },
        { t: 'Brother Murk says hello to the void.', req: { m: 'murk' }, ok: { t: 'The void says hello back. It sends a small gift. It is a gold coin, slightly cold.', fx: { gold: 15, morale: 5 } } },
      ],
    },
    {
      id: 'lookalike_statue',
      title: 'The Unknown Monarch',
      prop: 'statue',
      text: 'A weathered statue by the road looks exactly like you. The plaque reads: THE UNKNOWN MONARCH.',
      choices: [
        { t: 'Polish it.', ok: { t: 'It gleams. You gleam. Passers-by do double takes.', fx: { renown: 10 } } },
        { t: 'Pose beside it.', ok: { t: 'Your court cannot tell which one is you. Barrelby bows to the statue.', fx: { morale: 7 } } },
        { t: 'Quill sketches it for the chronicle.', req: { m: 'quill' }, ok: { t: 'Quill draws you both. The statue comes out slightly better looking. Rude.', fx: { renown: 12, morale: 2 } } },
      ],
    },
    {
      id: 'whispering_grave',
      title: 'Whispers',
      prop: 'grave2',
      req: { biome: ['autumn', 'winter'] },
      text: 'A crooked gravestone by the road whispers your name. Softly. Repeatedly.',
      choices: [
        { t: 'Whisper back.', ok: { t: '"Hello," you whisper. "Oh! Hello!" it whispers back, delighted. Nice grave.', fx: { morale: 5 } } },
        { t: 'Brother Murk investigates.', req: { m: 'murk' }, ok: { t: '"It is only Gerald. He is lonely." You chat with Gerald for a while. He knows a shortcut.', fx: { morale: 8, meters: 25 } } },
        { t: 'RUN.', ok: { t: 'You run surprisingly far. The grave sounds a bit hurt.', fx: { meters: 22, morale: -3 } } },
      ],
    },
    {
      id: 'ore_vein',
      title: 'A Glint in the Rock',
      prop: 'ore_gold',
      text: 'A vein of shiny ore glints in a boulder beside the road.',
      choices: [
        {
          t: 'Try to mine it.',
          roll: {
            p: 0.45,
            boost: [{ m: 'brom', add: 0.4 }, { m: 'pell', add: 0.15 }],
            win: { t: 'Gold! Real gold! A small chunk, but gold!', fx: { gold: 26 } },
            lose: { t: 'You chip a nail and a tooth of the pickaxe. It was pyrite.', fx: { morale: -3 } },
          },
        },
        { t: 'Pocket a shiny pebble.', ok: { t: 'A pebble. Shiny. Worth a coin or two, to the right fool.', fx: { gold: 3 } } },
      ],
    },
    {
      id: 'campfire_strangers',
      title: 'Strangers at the Fire',
      prop: 'campfire',
      who: { a: 'campknight', n: 'A Fireside Stranger' },
      text: 'Strangers around a campfire wave you over. "Sit! Warm up! Share a story!"',
      choices: [
        { t: 'Sit with them.', ok: { t: 'You swap stories until the fire burns low. You share some of your rations.', fx: { morale: 9, food: -2 } } },
        { t: 'Tell the tale of your journey.', ok: { t: 'They hang on every word. By morning your legend has spread to three more campfires.', fx: { renown: 10 } } },
        { t: 'Marta turns it into a party.', req: { m: 'marta' }, ok: { t: 'Marta produces a keg from nowhere. It becomes the best night of everyone’s year.', fx: { morale: 15, food: -3 } } },
      ],
    },
    {
      id: 'boat_ride',
      title: 'A Ride Downstream',
      prop: 'boat',
      who: { a: 'pirate', n: 'A Fisherman' },
      text: 'A fisherman by the river offers a lift downstream. "Faster than walking! Mostly dry!"',
      choices: [
        { t: 'Take the boat. (6 coins)', cost: { gold: 6 }, ok: { t: 'You drift past the scenery in comfort. Mostly dry, as promised.', fx: { meters: 70, morale: 3 } } },
        { t: 'Offer to fish for your fare.', ok: { t: 'You catch an old boot. The fisherman accepts it as payment, oddly pleased.', fx: { meters: 50 } } },
        { t: 'Walk on.', ok: { t: 'He waves and drifts away, singing a song about the sea he has never seen.' } },
      ],
    },
    {
      id: 'torches_out',
      title: 'The Dark Stretch',
      req: { night: true },
      text: 'Your torches sputter and die. The road is very, very dark.',
      choices: [
        { t: 'Wait for the moon.', ok: { t: 'The moon rises, round and kind. You set off again in silver light.', fx: { morale: 2 } } },
        { t: 'Brother Murk lights the way.', req: { m: 'murk' }, ok: { t: 'Murk glows a gentle purple. You walk on by the light of a polite ex-cultist.', fx: { morale: 7, meters: 20 } } },
        {
          t: 'Feel your way forward.',
          roll: {
            p: 0.5,
            win: { t: 'Slow but steady. You make it through the dark stretch.', fx: { meters: 15 } },
            lose: { t: 'Somebody steps on somebody. There is a lot of apologising.', fx: { morale: -4 } },
          },
        },
      ],
    },
    {
      id: 'peasant_petition',
      title: 'A Royal Petition',
      who: { a: 'villager2', n: 'A Hopeful Peasant' },
      text: 'A peasant kneels and presents a petition. It reads, in its entirety: "PLEASE MAKE TUESDAYS SHORTER."',
      choices: [
        { t: 'Grant the petition.', ok: { t: 'By royal decree, Tuesdays are now 23 hours long. The peasant weeps with joy.', fx: { renown: 8, morale: 3 } } },
        { t: 'Declare Tuesdays are now Wednesdays.', ok: { t: 'Confusing! Popular! You are now known as the {Ruler} Who Abolished Tuesday.', fx: { renown: 12, morale: 5 } } },
        { t: 'Deny it.', ok: { t: 'He sighs. "Worth a try." He leaves, to face Tuesday.', fx: { renown: -2 } } },
      ],
    },
    {
      id: 'rival_poster',
      title: 'Campaign Poster',
      req: { stopMin: 2, stopMax: 16 },
      text: 'A poster nailed to a tree: VOTE PLUMWHISTLE FOR MONARCH, beside a heroic drawing of Duke Reginald on a horse.',
      choices: [
        { t: 'Draw a moustache on him.', ok: { t: 'A magnificent moustache. Lord Fluffington gets one too.', fx: { morale: 8 } } },
        { t: 'Put up your own poster. (5 coins)', cost: { gold: 5 }, ok: { t: '{hero} FOR MONARCH: NO HORSE, ALL HEART. It catches on.', fx: { renown: 12 } } },
        { t: 'Leave it be.', ok: { t: 'Reginald’s painted eyes follow you down the road.', fx: { renown: 2 } } },
      ],
    },
    {
      id: 'lost_coin_purse',
      title: 'A Lost Purse',
      prop: 'sack',
      text: 'A small coin purse lies in the middle of the road, embroidered with the initials R.P.',
      choices: [
        { t: 'Keep it.', ok: { t: 'Finders keepers. Hazel would be proud, if she knew.', fx: { gold: 15, renown: -3 } } },
        { t: 'Return it to its owner (R.P.?).', ok: { t: 'You ask around. R.P. is "Reginald Plumwhistle". You leave it at the next inn with a polite note. Karma smiles.', fx: { renown: 12, flag: 'kindToReginald' } } },
        { t: 'Hazel "investigates" it.', req: { m: 'hazel' }, ok: { t: 'Hazel finds a hidden pocket the owner never knew about. Bonus coins!', fx: { gold: 22 } } },
      ],
    },
    {
      id: 'merchant_caravan',
      title: 'The Caravan',
      who: { a: 'toad', n: 'A Merchant Caravan' },
      req: { stopMin: 3 },
      text: 'A merchant caravan rumbles by. "Supplies! Supplies for weary travellers! Bulk discounts!"',
      choices: [
        { t: 'Buy rations in bulk. (12 coins)', cost: { gold: 12 }, ok: { t: 'Thirty rations of trail bread, cheese and something labelled "meat (general)".', fx: { food: 30 } } },
        { t: 'Sell them your spare junk.', ok: { t: 'They pay you for a broken ladle, a single glove and a story about a goose.', fx: { gold: 9 } } },
        { t: 'Odalys trades with them.', req: { m: 'odalys' }, ok: { t: 'Odalys trades a slightly cursed spoon for a whole crate of supplies. Nobody asks about the curse.', fx: { food: 20, gold: 6 } } },
      ],
    },
    {
      id: 'mysterious_well_water',
      title: 'The Spring',
      text: 'A clear spring bubbles up beside the road. A faded sign says THE SPRING OF VIGOUR (PROBABLY).',
      choices: [
        { t: 'Drink deep.', ok: { t: 'Cold and sweet. You feel like you could walk forever. Or at least until lunch.', fx: { buff: { id: 'vigour', label: 'Vigour', speed: 1.3, meters: 120 }, morale: 3 } } },
        { t: 'Fill everyone’s flasks.', ok: { t: 'Everyone drinks. Everyone feels marvellous.', fx: { morale: 8 } } },
      ],
    },
    {
      id: 'shrine_roadside',
      title: 'Roadside Shrine',
      prop: 'angel',
      text: 'A small shrine to Saint Wobble sits by the road, with a bowl for offerings and a candle that will not stay lit.',
      choices: [
        { t: 'Leave an offering. (3 coins)', cost: { gold: 3 }, ok: { t: 'The candle lights itself. You feel faintly blessed and slightly watched.', fx: { morale: 6, renown: 5 } } },
        { t: 'Bishop Bellwether says a blessing.', req: { m: 'bellwether' }, ok: { t: 'The bishop blesses the shrine, the candle, the bowl, and a passing snail.', fx: { morale: 8, renown: 8 } } },
        { t: 'Keep walking.', ok: { t: 'The candle goes out as you pass. Coincidence, surely.' } },
      ],
    },

    // -------------------------------------------------------------------------
    // Your court
    // -------------------------------------------------------------------------
    {
      id: 'quill_block',
      title: 'Writer’s Block',
      who: { m: 'quill' },
      req: { m: 'quill' },
      text: 'Quill stares at a blank page. "I have writer’s block! I need inspiration. Something DRAMATIC."',
      choices: [
        { t: 'Strike a dramatic pose.', ok: { t: 'Quill writes: "The {Ruler} gazed into the middle distance, magnificently." He is satisfied.', fx: { renown: 10 } } },
        { t: 'Tell him to rest.', ok: { t: 'He naps on a rock and wakes up with three new chapters in his head.', fx: { morale: 5, renown: 4 } } },
        { t: 'Suggest a rhyme for "crown".', ok: { t: '"Frown? Town? Brown?! BROWN!" He is off. You will hear this poem later. Many times.', fx: { morale: 4, renown: 6 } } },
      ],
    },
    {
      id: 'hazel_pockets',
      title: 'Clinking Pockets',
      who: { m: 'hazel' },
      req: { m: 'hazel' },
      text: 'Hazel’s pockets are clinking. Loudly. She whistles innocently.',
      choices: [
        { t: 'Search her.', ok: { t: 'She looks wounded. Then she hands over a surprising amount of coins.', fx: { gold: 14, morale: -2 } } },
        { t: 'Ask her to return what she took.', ok: { t: 'She returns a merchant’s ring, a spoon, and Gruff’s lucky rock. You return them all at the next village.', fx: { renown: 12 } } },
        { t: 'Trust her.', ok: { t: 'She is so touched that she buys everyone pastries. With whose money? Never mind.', fx: { morale: 7, food: 4 } } },
      ],
    },
    {
      id: 'marta_brew',
      title: 'Kettle Brew',
      who: { m: 'marta' },
      req: { m: 'marta' },
      text: 'Marta has brewed something in a spare kettle. It is fizzing. It is fizzing upwards.',
      choices: [
        {
          t: 'Drink it.',
          roll: {
            p: 0.6,
            win: { t: 'Delicious! Fizzy, warm, faintly of apples. Everyone wants seconds.', fx: { morale: 12 } },
            lose: { t: 'You hiccup bubbles for an hour. They are, admittedly, very pretty bubbles.', fx: { morale: 2 } },
          },
        },
        { t: 'Sell it at the roadside.', ok: { t: 'Marta sells it as "Royal Fizz". Travellers queue for it.', fx: { gold: 12 } } },
      ],
    },
    {
      id: 'halbert_hill',
      title: 'A Lonely Hill',
      who: { m: 'halbert' },
      req: { m: 'halbert' },
      text: 'Sir Halbert spots a small, lonely hill beside the road. His eyes mist over. "It has nobody to guard it."',
      choices: [
        { t: 'Let him guard it for a minute.', ok: { t: 'He stands on top, halberd raised, for exactly one minute. He comes down a happier man.', fx: { morale: 9 } } },
        { t: 'Promise him a mountain.', ok: { t: '"A MOUNTAIN." He marches faster for the rest of the day.', fx: { buff: { id: 'mountainpromise', label: 'Halbert’s resolve', speed: 1.15, meters: 120 }, morale: 4 } } },
      ],
    },
    {
      id: 'odalys_futures',
      title: 'Pickled Egg Futures',
      who: { m: 'odalys' },
      req: { m: 'odalys' },
      text: 'Odalys leans in. "Once-in-a-lifetime opportunity, {majesty}. Pickled-egg futures. Twenty coins."',
      choices: [
        {
          t: 'Invest 20 coins.',
          cost: { gold: 20 },
          roll: {
            p: 0.55,
            win: { t: 'The pickled-egg market booms! Odalys hands you your profits with a wink.', fx: { gold: 48 } },
            lose: { t: 'The eggs hatched. You briefly owned chickens. They left.', fx: { morale: 2 } },
          },
        },
        { t: 'Decline.', ok: { t: '"Your loss. The egg market waits for no one."' } },
      ],
    },
    {
      id: 'bellwether_mushroom',
      title: 'A Suspicious Mushroom',
      who: { m: 'bellwether' },
      req: { m: 'bellwether' },
      text: 'Bishop Bellwether insists on blessing a large, suspicious, slightly purple mushroom.',
      choices: [
        {
          t: 'Let him bless it.',
          outcomes: [
            { w: 1, t: 'The mushroom is now holy and delicious. Everyone has a nibble.', fx: { food: 6, morale: 5 } },
            { w: 1, t: 'The mushroom glows. It follows you for a mile, then wanders off to start a religion.', fx: { renown: 8 } },
          ],
        },
        { t: 'Stop him.', ok: { t: 'Denied the mushroom, he blesses YOU instead. Thoroughly. Several times.', fx: { morale: 4, renown: 3 } } },
      ],
    },
    {
      id: 'agatha_inspection',
      title: 'Posture Inspection',
      who: { m: 'agatha' },
      req: { m: 'agatha' },
      text: 'Sister Agatha claps her hands. "Posture inspection. Everyone. Now."',
      choices: [
        { t: 'Submit to the inspection.', ok: { t: 'Painful, but afterwards your entire court walks like royalty.', fx: { renown: 9, morale: -3 } } },
        { t: 'Hide behind Barrelby.', req: { m: 'barrelby' }, ok: { t: 'It works for a full minute. Then Agatha inspects Barrelby. Barrelby passes.', fx: { morale: 8 } } },
        { t: 'Inspect HER posture.', ok: { t: 'Perfect, obviously. She looks smug for the rest of the day.', fx: { morale: 4 } } },
      ],
    },
    {
      id: 'pell_carry',
      title: 'Piggyback Express',
      who: { m: 'pell' },
      req: { m: 'pell' },
      text: 'Pell cracks his knuckles. "Want me to carry everyone for a bit? I am bored of carrying just luggage."',
      choices: [
        { t: 'Yes! Everyone aboard!', ok: { t: 'Somehow Pell carries the whole court at a jog. You cover ground astonishingly fast.', fx: { buff: { id: 'pellexpress', label: 'Pell express', speed: 1.35, meters: 90 }, morale: 6 } } },
        { t: 'No thank you, Pell.', ok: { t: 'He looks crestfallen and carries a big rock instead, for company.', fx: { morale: -1 } } },
      ],
    },
    {
      id: 'brom_boots',
      title: 'Unrequested Repairs',
      who: { m: 'brom' },
      req: { m: 'brom' },
      text: 'Overnight, Brom has fixed everyone’s boots. Nobody asked. They are now extremely sturdy.',
      choices: [
        { t: 'Thank him.', ok: { t: '"Hmph," says Brom, delighted. The boots really are excellent.', fx: { morale: 6, buff: { id: 'bromboots', label: 'Brom’s boots', speed: 1.12, meters: 200 } } } },
        { t: 'Ask him to un-fix them.', ok: { t: 'He fixes them harder. They are now the sturdiest boots in history.', fx: { buff: { id: 'bromboots', label: 'Brom’s boots', speed: 1.15, meters: 200 } } } },
      ],
    },
    {
      id: 'fennick_tracks',
      title: 'Fresh Tracks',
      who: { m: 'fennick' },
      req: { m: 'fennick' },
      text: 'Fennick crouches over the mud. "Fresh tracks. Could be rabbits. Could be a bear. Could be a bear with rabbits."',
      choices: [
        {
          t: 'Go hunting.',
          roll: {
            p: 0.65,
            win: { t: 'Rabbits! Plenty for everyone. Fennick names none of them, out of respect.', fx: { food: 15 } },
            lose: { t: 'It was a bear. A small one. It was as embarrassed as you were.', fx: { morale: -4 } },
          },
        },
        { t: 'Let it be.', ok: { t: 'Fennick nods. "Wise. Sometimes the tracks are the trophy."', fx: { morale: 2 } } },
      ],
    },
    {
      id: 'murk_meditation',
      title: 'Midnight Meditation',
      who: { m: 'murk' },
      req: { m: 'murk', night: true },
      text: 'Brother Murk offers to lead a midnight meditation. "Not a cult thing. Just breathing. In a circle. With candles."',
      choices: [
        { t: 'Join in.', ok: { t: 'Deep breaths under the stars. You feel calmer than you have in years.', fx: { morale: 11 } } },
        { t: 'Politely decline.', ok: { t: '"Of course! No pressure. Cults are all pressure. This is the opposite."', fx: { morale: 2 } } },
      ],
    },
    {
      id: 'elsie_roadsoup',
      title: 'Road Soup',
      who: { m: 'elsie' },
      req: { m: 'elsie' },
      text: 'Elsie announces "Road Soup": made only from things found on the road.',
      choices: [
        {
          t: 'Allow it.',
          outcomes: [
            { w: 2, t: 'It is mostly wild herbs, mushrooms and optimism. It is incredible.', fx: { food: 10, morale: 5 } },
            { w: 1, t: 'It is pebble soup. Somehow, it is still good.', fx: { food: 4, morale: 6 } },
          ],
        },
        { t: 'Request normal soup. (3 rations)', cost: { food: 3 }, ok: { t: 'A proper, steaming, wonderful soup. Morale soars.', fx: { morale: 10 } } },
      ],
    },
    {
      id: 'clanks_horse',
      title: 'Thunderhoof?',
      who: { m: 'clanksworth' },
      req: { m: 'clanksworth' },
      text: 'Sir Clanksworth freezes, staring into a field. "Is that… Thunderhoof? My HORSE?"',
      choices: [
        {
          t: 'Ask the farmer.',
          roll: {
            p: 0.4,
            win: { t: 'It is! The farmer lets him visit. Clanksworth weeps into the mane for twenty minutes.', fx: { morale: 14 } },
            lose: { t: 'It is a cow. Clanksworth weeps anyway. It is a lovely cow.', fx: { morale: 6 } },
          },
        },
        { t: 'Gently keep walking.', ok: { t: 'He looks back three times. You pat his pauldron.', fx: { morale: -2 } } },
      ],
    },
    {
      id: 'gruff_speaks',
      title: 'Gruff Has Something to Say',
      who: { m: 'gruff' },
      req: { m: 'gruff' },
      text: 'Gruff clears his throat. Everyone stops. He is going to SAY something.',
      choices: [
        { t: 'Wait patiently.', ok: { t: 'After a long pause: "…Nice day." The whole court cheers. Gruff turns pink.', fx: { morale: 12 } } },
        { t: 'Interrupt with a joke.', ok: { t: 'The moment passes. Forever. Gruff says "hrm" and nothing more.', fx: { morale: -3 } } },
      ],
    },
    {
      id: 'barrel_rhythm',
      title: 'Barrel Rhythm',
      who: { m: 'barrelby' },
      req: { m: 'barrelby' },
      text: 'Barrelby is sloshing in what might be a rhythm. Or a message. Or a song.',
      choices: [
        { t: 'Knock in reply.', ok: { t: 'A whole conversation in knocks. You are not sure what you agreed to, but it felt nice.', fx: { morale: 9 } } },
        {
          t: 'Peek inside.',
          roll: {
            p: 0.15,
            win: { t: 'You see… no. You decide you saw nothing. You will never speak of it. Morale is weirdly great.', fx: { morale: 12, flag: 'peekedBarrel' } },
            lose: { t: 'The lid will not budge. Barrelby rolls away, scandalised.', fx: { morale: 3 } },
          },
        },
        { t: 'Odalys offers to buy what is inside.', req: { m: 'odalys' }, ok: { t: 'Barrelby rolls away from her, deeply offended. Everyone takes Barrelby’s side.', fx: { morale: 6 } } },
      ],
    },
    {
      id: 'umbra_sunny',
      title: 'An Awfully Sunny Day',
      who: { m: 'umbra' },
      req: { m: 'umbra', night: false },
      text: 'It is a gloriously sunny day. Countess Umbra is wearing three umbrellas at once and hissing softly.',
      choices: [
        { t: 'Walk in the shade with her.', ok: { t: '"How chivalrous," she says, touched. She tips you in very old coins.', fx: { gold: 12, morale: 4 } } },
        { t: 'Joke about vampires.', ok: { t: '"I am NOT a—" The whole court laughs. Eventually, so does she.', fx: { morale: 8 } } },
      ],
    },
    {
      id: 'brunhild_drills',
      title: 'Morning Drills',
      who: { m: 'brunhild' },
      req: { m: 'brunhild' },
      text: 'Dame Brunhild insists on morning sword drills for the entire court. "Even the barrel."',
      choices: [
        { t: 'Join the drills.', ok: { t: 'Everyone is sore, but you march like an army all day.', fx: { buff: { id: 'drilled', label: 'Drilled', speed: 1.18, meters: 140 }, morale: -3 } } },
        { t: 'Skip them.', ok: { t: 'Brunhild does twice the drills, glaring at you the whole time.', fx: { morale: 3 } } },
      ],
    },
    {
      id: 'cheese_feud',
      title: 'The Cheese Feud',
      who: { m: 'marta' },
      req: { m: 'marta', all: true, any: ['odalys'] },
      text: 'Marta and Odalys are arguing about the price of cheese. It is getting heated. The cheese is getting warm.',
      choices: [
        { t: 'Mediate.', ok: { t: 'You negotiate a cheese treaty. Historians will call it the Peace of the Wheel.', fx: { renown: 8, morale: 4 } } },
        { t: 'Buy the cheese yourself. (4 coins)', cost: { gold: 4 }, ok: { t: 'Problem solved. Everyone eats cheese. Nobody argues with a mouth full of cheese.', fx: { food: 7, morale: 6 } } },
      ],
    },
    {
      id: 'clanks_vs_brunhild',
      title: 'Rematch',
      who: { m: 'clanksworth' },
      req: { m: 'clanksworth', any: ['brunhild'] },
      text: 'Sir Clanksworth challenges Dame Brunhild to a duel. Again. For the fourteenth time.',
      choices: [
        { t: 'Watch.', ok: { t: 'He loses in four seconds. A new record. He is thrilled.', fx: { morale: 10 } } },
        { t: 'Referee properly.', ok: { t: 'With rules, he lasts nine seconds. A personal best! Brunhild shakes his hand.', fx: { morale: 7, renown: 6 } } },
      ],
    },
    {
      id: 'quill_reading',
      title: 'Reading from the Chronicle',
      who: { m: 'quill' },
      req: { m: 'quill', partyMin: 6 },
      text: 'Quill clears his throat. "Shall I read from the Chronicle so far? It is up to nine hundred pages."',
      choices: [
        { t: 'Read it all!', ok: { t: 'You laugh, you cry, you hear your own deeds made heroic. It takes all afternoon.', fx: { morale: 10, renown: 5 } } },
        { t: 'Skip the turnip festival poem.', ok: { t: 'Quill is hurt, but reads the rest beautifully.', fx: { morale: 6, renown: 3 } } },
      ],
    },
    {
      id: 'court_singalong',
      title: 'Walking Song',
      req: { partyMin: 5 },
      text: 'Someone starts humming. Someone else joins in. Soon the whole court is singing a walking song.',
      choices: [
        { t: 'Sing the royal verse.', ok: { t: 'Your court cheers your verse. It does not rhyme. Nobody cares.', fx: { morale: 9 } } },
        { t: 'March in time!', ok: { t: 'Left, right, left, right. You make excellent time.', fx: { buff: { id: 'marching', label: 'Marching song', speed: 1.2, meters: 100 } } } },
      ],
    },
    {
      id: 'hungry_court',
      title: 'Grumbling Stomachs',
      req: { maxFood: 4 },
      text: 'The rations are nearly gone. Your court’s stomachs are growling in harmony.',
      choices: [
        { t: 'Forage by the road.', ok: { t: 'Berries, roots, a lonely turnip. Not a feast, but something.', fx: { food: 7 } } },
        { t: 'Fennick goes hunting.', req: { m: 'fennick' }, ok: { t: 'Fennick returns with enough rabbits and herbs for everyone.', fx: { food: 15 } } },
        { t: 'Elsie makes stone soup.', req: { m: 'elsie' }, ok: { t: 'From a stone, a pot and a pinch of genius, Elsie conjures dinner.', fx: { food: 10, morale: 5 } } },
        { t: 'Tighten belts and push on.', ok: { t: 'Nobody complains. Out loud.', fx: { morale: -4 } } },
      ],
    },
    {
      id: 'broke_court',
      title: 'Empty Purse',
      req: { maxGold: 3, stopMin: 1 },
      text: 'Your royal purse is nearly empty. Quill writes "The Treasury" and then just a sad face.',
      choices: [
        { t: 'Busk by the road.', ok: { t: 'Your court performs. Passers-by pay you to stop. Money is money.', fx: { gold: 12, morale: -2 } } },
        { t: 'Hazel finds "spare" coins.', req: { m: 'hazel' }, ok: { t: 'Hazel turns out her pockets. They contain more coins than physics allows.', fx: { gold: 18 } } },
        { t: 'Sell your autograph.', ok: { t: 'Three people buy one. One asks who you are.', fx: { gold: 7, renown: 3 } } },
      ],
    },
    {
      id: 'low_morale',
      title: 'Glum Faces',
      req: { maxMorale: 30 },
      text: 'Your court is trudging in miserable silence. Even the road looks tired.',
      choices: [
        { t: 'Give a rousing speech.', ok: { t: 'You talk about the dragon, the throne, and how good the next inn will be. It helps.', fx: { morale: 10 } } },
        { t: 'Tell a terrible joke.', ok: { t: 'It is so bad that people laugh out of pity. Then actual laughter. It counts.', fx: { morale: 8 } } },
        { t: 'Barrelby does a little roll.', req: { m: 'barrelby' }, ok: { t: 'Barrelby rolls in a small, perfect circle. Everyone feels better instantly.', fx: { morale: 16 } } },
      ],
    },

    // -------------------------------------------------------------------------
    // Endless-mode royal duties
    // -------------------------------------------------------------------------
    {
      id: 'royal_petitioners',
      title: 'Petitioners',
      who: { a: 'villager5', n: 'A Line of Petitioners' },
      req: { flag: 'crowned' },
      text: 'Word has spread: the {Ruler} of the Realm is walking this road. A line of petitioners waits by the roadside.',
      choices: [
        { t: 'Hear every petition.', ok: { t: 'Lost goats, leaky roofs, one dragon complaint. You solve what you can.', fx: { renown: 18, morale: -2 } } },
        { t: 'Grant everyone a holiday.', ok: { t: 'A royal holiday! The petitioners cheer and forget their petitions.', fx: { renown: 10, morale: 8 } } },
      ],
    },
    {
      id: 'dragon_postcard',
      title: 'A Letter from the Mountain',
      who: { a: 'pigeonfly', n: 'A Messenger Pigeon' },
      req: { flag: 'crowned' },
      text: 'A pigeon delivers a scorched letter. It reads, in huge letters: "STILL ASLEEP. ALL FINE. BRING SOUP NEXT TIME. — D."',
      choices: [
        { t: 'Write back.', ok: { t: 'You write about your travels. The pigeon looks exhausted at the length.', fx: { morale: 8, renown: 6 } } },
        { t: 'Send soup.', req: { m: 'elsie' }, ok: { t: 'Elsie sends a pot of soup by pigeon. It is a very strong pigeon. The dragon will be pleased.', fx: { morale: 10, renown: 10, food: -3 } } },
      ],
    }
  );

  if (typeof module !== 'undefined' && module.exports) {
    module.exports = TK;
  }
})(typeof window !== 'undefined' ? window : globalThis);
