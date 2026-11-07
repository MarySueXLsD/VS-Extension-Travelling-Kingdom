/* Travelling Kingdom — road events, part 1: strangers on the Kingsroad.
 *
 * Event: { id, title, who: { a: actorId, n: name } | { m: companionId }, prop, text,
 *          req, w (weight), once, chainOnly, choices: [...] }
 * Choice: { t, req, cost: { gold, food }, ok: { t, fx } | roll: { p, boost, win, lose } | outcomes: [{ w, t, fx }] }
 * A choice whose req names a companion (req.m / req.any) only appears when they are in the party.
 */
(function (root) {
  'use strict';

  const TK = (root.TK = root.TK || {});
  const D = (TK.data = TK.data || {});
  D.events = D.events || [];

  D.events.push(
    {
      id: 'beggar_duke',
      title: 'The Former Duke',
      who: { a: 'beggar', n: 'A Beggar' },
      text: 'A beggar kneels by the road holding a very small sign: FORMER DUKE. ANYTHING HELPS.',
      choices: [
        { t: 'Give him 3 coins.', cost: { gold: 3 }, ok: { t: '"May your crown never itch," he says, with surprising dignity.', fx: { renown: 6, morale: 3 } } },
        { t: 'Share a ration.', cost: { food: 2 }, ok: { t: 'He eats like a duke: pinky out, napkin tucked, crumbs everywhere.', fx: { renown: 5, morale: 5 } } },
        {
          t: 'Hazel: "Wait — I know him."',
          req: { m: 'hazel' },
          ok: { t: 'Hazel recognises Lord Dimsby, who lost his duchy betting on snail races. Grateful for the kind word, he shows you a shortcut.', fx: { meters: 30, morale: 4 } },
        },
        { t: 'Walk past.', ok: { t: 'Quill writes "The {Ruler} walked past." He underlines it twice.', fx: { morale: -2 } } },
      ],
    },
    {
      id: 'dealer_coat',
      title: 'Psst',
      who: { a: 'dealer', n: 'A Hooded Dealer' },
      text: 'A hooded figure opens his coat: "Psst. Want a slightly cursed amulet? Or a perfectly normal sausage?"',
      choices: [
        {
          t: 'The cursed amulet. (20 coins)',
          cost: { gold: 20 },
          roll: {
            p: 0.5,
            win: { t: 'It is a lucky horseshoe painted purple. The curse is mostly the paint.', fx: { trinket: 'horseshoe' } },
            lose: { t: 'It is a doorknob. A beautiful doorknob, but a doorknob.', fx: { morale: -2 } },
          },
        },
        { t: 'The perfectly normal sausage. (4 coins)', cost: { gold: 4 }, ok: { t: 'It is a perfectly normal sausage. Suspiciously normal. Delicious, though.', fx: { food: 7, morale: 2 } } },
        { t: 'Odalys: "Let me handle this."', req: { m: 'odalys' }, ok: { t: 'Ten minutes later, Odalys has haggled him down to paying YOU for the privilege of browsing.', fx: { gold: 12 } } },
        { t: 'No thank you.', ok: { t: 'He closes his coat with a whisper of disappointment and seven different jingles.' } },
      ],
    },
    {
      id: 'crusader_toll',
      title: 'Toll Road',
      who: { a: 'crusader', n: 'A Crusader' },
      text: 'A crusader plants his sword in the road. "Toll! For the upkeep of this road." The road is mostly potholes.',
      choices: [
        { t: 'Pay the toll. (5 coins)', cost: { gold: 5 }, ok: { t: 'He waves you on. You hit a pothole immediately.', fx: { morale: -1 } } },
        { t: 'Sir Halbert: "Show me your toll permit."', req: { m: 'halbert' }, ok: { t: 'The crusader pats his pockets. "…I shall be going." He goes.', fx: { renown: 10, morale: 4 } } },
        {
          t: 'Argue that roads should be free.',
          roll: {
            p: 0.5,
            boost: [{ m: 'quill', add: 0.15 }],
            win: { t: 'Your speech is so stirring he joins in. "FREE ROADS!" he shouts, as you leave him behind.', fx: { renown: 10 } },
            lose: { t: 'He is unmoved. You pay extra for the argument.', fx: { gold: -8 } },
          },
        },
      ],
    },
    {
      id: 'mage_boots',
      title: 'Enchanting Offer',
      who: { a: 'mage', n: 'A Sparkly Mage' },
      text: 'A mage with sparkles orbiting his head offers to enchant your boots. "Ten coins. Results may vary. Results usually vary."',
      choices: [
        {
          t: 'Enchant away. (10 coins)',
          cost: { gold: 10 },
          roll: {
            p: 0.6,
            win: { t: 'Your boots glow. You walk faster. Your toes feel fizzy.', fx: { buff: { id: 'fizzyboots', label: 'Fizzy boots', speed: 1.45, meters: 140 } } },
            lose: { t: 'Your boots now sing. Loudly. Mostly sea shanties.', fx: { morale: 5 } },
          },
        },
        { t: 'Brother Murk talks shop with him.', req: { m: 'murk' }, ok: { t: 'They discuss the void for twenty minutes. The mage tips Murk for "the best chat in centuries".', fx: { gold: 8, morale: 4 } } },
        { t: 'No thanks.', ok: { t: 'The sparkles look offended on his behalf.' } },
      ],
    },
    {
      id: 'servant_platter',
      title: 'The Five-Course Fall',
      who: { a: 'servant', n: 'A Hurried Servant' },
      text: 'A servant sprints past with a heaped platter. "Banquet for Lord Somebody! Five courses! I am LATE!" He trips.',
      choices: [
        {
          t: 'Dive for the platter!',
          roll: {
            p: 0.55,
            win: { t: 'You save the roast! He is so grateful he lets you keep the side dishes.', fx: { food: 12, morale: 4 } },
            lose: { t: 'The roast lands on Quill. Everyone smells of gravy for a day. Not entirely bad.', fx: { food: 4, morale: -2 } },
          },
        },
        { t: 'Pell catches everything.', req: { m: 'pell' }, ok: { t: 'Pell catches the platter, the servant, and a falling pie, all at once. Applause.', fx: { food: 10, renown: 6 } } },
        { t: 'Help him up.', ok: { t: 'He dusts himself off. "You are very kind, for a person in a hat."', fx: { renown: 6 } } },
      ],
    },
    {
      id: 'wounded_hedge',
      title: 'Defeated by Shrubbery',
      who: { a: 'woundedknight', n: 'A Battered Knight' },
      text: 'A knight limps along, leaning on his sword. "Lost a fight," he mutters. "To a hedge."',
      choices: [
        { t: 'Bandage him. (2 rations for strength)', cost: { food: 2 }, ok: { t: 'He salutes you with his good arm. "If you ever need a hedge fought, call someone else."', fx: { renown: 8, morale: 3 } } },
        { t: 'Sister Agatha: "Sit. Still. STILL."', req: { m: 'agatha' }, ok: { t: 'Agatha fixes him in a minute flat. He has never been so afraid to be healed.', fx: { renown: 12, morale: 4 } } },
        { t: 'Ask about the hedge.', ok: { t: '"It was a VERY aggressive hedge," he insists. You believe him. Nobody else does.', fx: { morale: 5 } } },
      ],
    },
    {
      id: 'fairy_wish',
      title: 'A Small Wish',
      who: { a: 'fairy', n: 'A Fairy' },
      text: 'A fairy zips around your head. "I grant wishes! Small ones. One wish, size medium-small."',
      choices: [
        { t: 'Wish for food.', ok: { t: 'A basket of warm bread appears. It is labelled "medium-small". It is huge.', fx: { food: 12 } } },
        { t: 'Wish for coins.', ok: { t: 'Coins rain down. Small ones. Medium-small ones.', fx: { gold: 14 } } },
        { t: 'Wish for faster feet.', ok: { t: 'Your feet tingle and hurry along on their own.', fx: { buff: { id: 'fairyfeet', label: 'Fairy feet', speed: 1.5, meters: 100 } } } },
        { t: 'Wish for her happiness.', ok: { t: 'She bursts into tears of glitter. "Nobody has EVER—" She kisses your crown and vanishes.', fx: { morale: 12, renown: 12 } } },
      ],
    },
    {
      id: 'baroness_carriage',
      title: 'The Missing Carriage',
      who: { a: 'baroness', n: 'A Baroness' },
      text: 'A baroness stamps her foot. "My carriage was right HERE. It is large. It is golden. It has HORSES."',
      choices: [
        {
          t: 'Help her search.',
          roll: {
            p: 0.5,
            boost: [{ m: 'wren', add: 0.35 }, { m: 'fennick', add: 0.25 }],
            win: { t: 'You find it behind a tree. A large golden carriage, behind a thin tree. How?', fx: { gold: 22, renown: 4 } },
            lose: { t: 'You find a carriage. Not hers. You leave very quickly.', fx: { morale: 3 } },
          },
        },
        { t: 'Point vaguely.', ok: { t: 'She marches off in the direction you pointed. You hope that was the right direction. It was not.', fx: { morale: -1 } } },
      ],
    },
    {
      id: 'noble_sonnet',
      title: 'A Sonnet for Mittens',
      who: { a: 'noblelady', n: 'Lady Prisca' },
      text: 'A noble lady stops you. "Are you a poet? I require a sonnet about my cat, Mittens. Immediately."',
      choices: [
        {
          t: 'Compose one on the spot.',
          roll: {
            p: 0.45,
            win: { t: 'You rhyme "whiskers" with "whiskers". She weeps and pays you handsomely.', fx: { gold: 15, renown: 5 } },
            lose: { t: 'She says it was "fine". The cruellest word in the language.', fx: { morale: -3 } },
          },
        },
        { t: 'Quill: "Stand back. This is my moment."', req: { m: 'quill' }, ok: { t: 'Quill delivers forty lines in iambic pentameter. Mittens is moved. Lady Prisca faints.', fx: { gold: 18, renown: 10 } } },
        { t: 'Politely decline.', ok: { t: 'She sniffs. Somewhere, Mittens sniffs too.' } },
      ],
    },
    {
      id: 'inquisitor_surprise',
      title: 'An Unexpected Inquiry',
      who: { a: 'inquisitor', n: 'A Man in Red' },
      text: 'A man in red robes leaps from behind a tree. "Surprise! A few questions! Nobody saw THIS coming!"',
      choices: [
        {
          t: 'Answer his questions.',
          roll: {
            p: 0.6,
            win: { t: 'Your answers are so honest he gets bored and leaves.', fx: { renown: 6 } },
            lose: { t: 'Question seven is about your crown receipt. You do not have it. You pay a "paperwork fee".', fx: { gold: -6 } },
          },
        },
        { t: 'Ask him a question first.', ok: { t: '"What is your favourite colour?" He was not prepared for that. He leaves to think about it.', fx: { morale: 6 } } },
        { t: 'Bishop Bellwether greets him.', req: { m: 'bellwether' }, ok: { t: '"Your Eminence!" "Your Grace!" They compare hats for half an hour. Everyone else has a picnic.', fx: { renown: 6, morale: 6 } } },
      ],
    },
    {
      id: 'sorceress_potion',
      title: 'Lavender and Regret',
      who: { a: 'sorceress', n: 'A Sorceress' },
      text: 'A sorceress offers you a bubbling vial. "Tastes of lavender and regret. Mostly lavender."',
      choices: [
        {
          t: 'Drink it.',
          roll: {
            p: 0.55,
            win: { t: 'You feel marvellous. Your step is light. Your hair is shinier.', fx: { morale: 10, buff: { id: 'lavender', label: 'Lavender glow', speed: 1.25, meters: 120 } } },
            lose: { t: 'Your voice goes squeaky for an hour. Your court laughs until they cry.', fx: { morale: 5 } },
          },
        },
        { t: 'Ask what the regret is.', ok: { t: '"A man I once turned into a teapot." She sighs. "He makes lovely tea now, though."', fx: { morale: 3 } } },
        { t: 'Decline.', ok: { t: 'She drinks it herself, sighs contentedly, and floats away.' } },
      ],
    },
    {
      id: 'babayaga_mortar',
      title: 'Hut-Hut',
      who: { a: 'babayaga', n: 'A Witch in a Mortar' },
      text: 'An old woman flies past in a giant mortar, then reverses. "You. With the hat. Fetch me three mushrooms and I tell your fortune."',
      choices: [
        {
          t: 'Fetch the mushrooms.',
          outcomes: [
            { w: 1, t: '"You will find coins," she cackles. You immediately trip over a purse.', fx: { gold: 15 } },
            { w: 1, t: '"Your feet will carry you far." Your feet agree, eagerly.', fx: { buff: { id: 'fortune', label: 'Fortunate feet', speed: 1.3, meters: 120 } } },
            { w: 1, t: '"You will be loved." Barrelby, or someone, rolls closer.', fx: { morale: 10 } },
          ],
        },
        { t: 'Fennick finds the RIGHT mushrooms.', req: { m: 'fennick' }, ok: { t: 'Impressed, she tells your fortune and throws in a sack of extra mushrooms. "The safe kind. Probably."', fx: { food: 10, morale: 6 } } },
        { t: 'Ask for a ride.', ok: { t: 'She laughs so hard the mortar crashes into a bush. She flies off cackling, slightly leafier.', fx: { morale: 6 } } },
      ],
    },
    {
      id: 'bard_ballad',
      title: 'Ballad for Hire',
      who: { a: 'bard', n: 'A Bard' },
      text: 'A bard tunes his lute. "Ten coins and I write you a ballad. Twelve, and I will even rhyme your name."',
      choices: [
        { t: 'Ten coins. Make me legendary.', cost: { gold: 10 }, ok: { t: '"The Ballad of {hero} the Moderately Brave" spreads to three villages by nightfall.', fx: { renown: 20 } } },
        { t: 'Twelve coins. Rhyme my name.', cost: { gold: 12 }, ok: { t: 'He rhymes "{hero}" with something wonderful. You hum it for days.', fx: { renown: 24, morale: 5 } } },
        { t: 'Marta sings a duet with him.', req: { m: 'marta' }, ok: { t: 'Marta has a voice like warm ale. The bard abandons his career to become her backup lute.', fx: { morale: 12, renown: 8 } } },
        { t: 'Decline.', ok: { t: 'He sings anyway: a short, catchy song titled "The Cheapskate".', fx: { morale: -2 } } },
      ],
    },
    {
      id: 'butcher_sausages',
      title: 'The Man with the Cleaver',
      who: { a: 'butcher', n: 'A Large Man with a Cleaver' },
      text: 'A huge man with a dripping cleaver steps out of the woods. Everyone freezes. "…Sausages?" he asks hopefully.',
      choices: [
        { t: 'Buy sausages. (6 coins)', cost: { gold: 6 }, ok: { t: 'They are the best sausages you have ever had. He blushes when you say so.', fx: { food: 14, morale: 3 } } },
        { t: 'RUN!', ok: { t: 'You run a very long way. He looks sadly at his sausages.', fx: { meters: 25, morale: -4 } } },
        { t: 'Gruff nods at him.', req: { m: 'gruff' }, ok: { t: 'Gruff nods. He nods back. A silent friendship of large men. Free sausages.', fx: { food: 10, morale: 5 } } },
        { t: 'Elsie: "What is your seasoning?"', req: { m: 'elsie' }, ok: { t: 'Elsie and the butcher swap recipes for an hour. You leave with sausages and a new spice blend.', fx: { food: 16, morale: 4 } } },
      ],
    },
    {
      id: 'pirate_inland',
      title: 'Lost at Land',
      who: { a: 'pirate', n: 'Captain Bilgewater' },
      text: 'A pirate stares at the fields. "Which way to the sea?" You are, conservatively, three hundred miles inland.',
      choices: [
        { t: 'Point somewhere confident.', ok: { t: 'Delighted, he gives you a treasure map. "I will not need it. I am going to the SEA." He sets off. Wrongly.', fx: { flag: 'pirateMap', chain: 'pirate_treasure', chainIn: 70, morale: 3 } } },
        { t: 'Tell him the truth.', ok: { t: 'He sits down and has a quiet cry. Then asks if any of you know how to farm.', fx: { morale: -1, renown: 3 } } },
        { t: 'Odalys sells him "the sea".', req: { m: 'odalys' }, ok: { t: 'Odalys sells him a bucket of water labelled SEA (SMALL). He is overjoyed.', fx: { gold: 12 } } },
      ],
    },
    {
      id: 'pirate_treasure',
      title: 'X Marks the Spot',
      chainOnly: true,
      prop: 'rockbig_g',
      text: 'Following the pirate’s map, you find a big X scratched into a rock by the road.',
      choices: [
        {
          t: 'Dig!',
          roll: {
            p: 0.65,
            boost: [{ m: 'pell', add: 0.2 }, { m: 'brom', add: 0.15 }],
            win: { t: 'A chest! Old coins, a rusty cutlass and a note: "IOU one sea."', fx: { gold: 35, renown: 5 } },
            lose: { t: 'You find another map. It leads back here. Pirates.', fx: { morale: 3 } },
          },
        },
        { t: 'Leave it for the next fool.', ok: { t: 'You add a second X. A gift to the future.', fx: { morale: 2 } } },
      ],
    },
    {
      id: 'rat_thief',
      title: 'Caught Red-Pawed',
      who: { a: 'ratthief', n: 'A Rat in a Red Hood' },
      text: 'A rat in a red hood grabs a sack of your rations — and freezes when you notice.',
      choices: [
        {
          t: 'Chase him!',
          roll: {
            p: 0.45,
            boost: [{ m: 'wren', add: 0.25 }, { m: 'hazel', add: 0.25 }],
            win: { t: 'You catch him. He hands back the sack and, weirdly, a sack of nuts as an apology.', fx: { food: 5 } },
            lose: { t: 'He is very fast for a rat. Very, very fast.', fx: { food: -6 } },
          },
        },
        { t: 'Offer a deal: keep the sack, leave the bread.', ok: { t: 'He bows deeply. A gentleman thief. He leaves the bread and a calling card.', fx: { food: -3, morale: 5 } } },
        { t: 'Hazel steals it back mid-bow.', req: { m: 'hazel' }, ok: { t: 'While he bows, Hazel lifts the sack, his purse and his hood. Professional respect all round.', fx: { gold: 8, morale: 6 } } },
      ],
    },
    {
      id: 'inventor_machine',
      title: 'The Automatic Walking Machine',
      who: { a: 'inventor', n: 'An Inventor' },
      text: 'An inventor with a glowing staff unveils a clanking contraption. "My Automatic Walking Machine! It walks FOR you!"',
      choices: [
        {
          t: 'Try it.',
          roll: {
            p: 0.5,
            win: { t: 'It works! Your legs are carried along by springs and optimism.', fx: { buff: { id: 'walkmachine', label: 'Walking machine', speed: 1.6, meters: 100 } } },
            lose: { t: 'It walks you briskly into a hedge. You live there now. Briefly.', fx: { morale: 3 } },
          },
        },
        {
          t: 'Invest 15 coins in the company.',
          cost: { gold: 15 },
          roll: {
            p: 0.38,
            win: { t: 'Weeks later, a pigeon brings you dividends. Lots of them.', fx: { gold: 45 } },
            lose: { t: 'He spends it on more springs. So many springs.', fx: { morale: -2 } },
          },
        },
        { t: 'Brom "improves" it with a hammer.', req: { m: 'brom' }, ok: { t: 'CLANG. CLANG. It works perfectly now. The inventor asks Brom to marry him. Brom says "hmph".', fx: { buff: { id: 'bromachine', label: 'Brom-tuned machine', speed: 1.4, meters: 180 }, renown: 6 } } },
      ],
    },
    {
      id: 'seamstress_robes',
      title: 'A Stitch in Time',
      who: { a: 'seamstress', n: 'A Seamstress' },
      text: 'A seamstress eyes your royal robes. "Those have seen better centuries, love. Let me mend them."',
      choices: [
        { t: 'Mend my robes. (8 coins)', cost: { gold: 8 }, ok: { t: 'You look properly regal for the first time in years. People bow. One curtsies by accident.', fx: { renown: 12, morale: 4 } } },
        { t: 'A tiny cape for Barrelby, please.', req: { m: 'barrelby' }, cost: { gold: 5 }, ok: { t: 'Barrelby now has a tiny velvet cape. It is perfect. Everyone agrees it is perfect.', fx: { morale: 15 } } },
        { t: 'Decline.', ok: { t: '"Your loss," she says, sewing your sleeve shut as you leave. You do not notice for a mile.' } },
      ],
    },
    {
      id: 'druid_hug',
      title: 'A Tree in Need',
      who: { a: 'druid', n: 'A Druid' },
      text: 'A druid stops you. "This tree has had a very hard century. Would you hug it?"',
      choices: [
        { t: 'Hug the tree.', ok: { t: 'The bark is warm. The tree creaks contentedly. You feel oddly understood.', fx: { morale: 8 } } },
        { t: 'Everyone hugs the tree!', req: { partyMin: 6 }, ok: { t: 'Your whole court hugs the tree. The druid weeps. The tree drops a shower of nuts in thanks.', fx: { morale: 12, food: 6 } } },
        { t: 'Refuse.', ok: { t: 'A pinecone lands on your head. The druid shrugs: "Trees remember."', fx: { morale: -2 } } },
      ],
    },
    {
      id: 'shamisen_tune',
      title: 'A Faraway Song',
      who: { a: 'shamisen', n: 'A Wandering Musician' },
      text: 'A musician from a faraway land sits by the road playing a haunting tune on three strings.',
      choices: [
        { t: 'Sit and listen.', ok: { t: 'For a few minutes, nobody says a word. Even Quill puts his quill down.', fx: { morale: 8 } } },
        { t: 'Tip her 4 coins.', cost: { gold: 4 }, ok: { t: 'She bows and plays a song about a crowned traveller. You are fairly sure it is about you.', fx: { morale: 9, renown: 6 } } },
        { t: 'Marta dances.', req: { m: 'marta' }, ok: { t: 'Marta dances, the musician plays faster, and soon the whole court is clapping on the road.', fx: { morale: 14 } } },
      ],
    },
    {
      id: 'tiger_nap',
      title: 'Sunbathing Obstacle',
      who: { a: 'tiger', n: 'A Very Large Tiger' },
      text: 'An enormous tiger lies across the road, sunbathing. It yawns. Its yawn is the size of a door.',
      choices: [
        { t: 'Wait for it to move.', ok: { t: 'It takes an hour. You play cards. Gruff wins, somehow, without speaking.', fx: { morale: 2 } } },
        {
          t: 'Tiptoe past.',
          roll: {
            p: 0.55,
            win: { t: 'It does not even open an eye. You feel like a ninja.', fx: { morale: 5 } },
            lose: { t: 'It licks Quill’s entire face as he passes. He writes about it for three chapters.', fx: { morale: -3 } },
          },
        },
        { t: 'Fennick: "Scratch behind the ears. Slowly."', req: { m: 'fennick' }, ok: { t: 'The tiger purrs like a rockslide and rolls over. You have a tiger friend now. It stays behind.', fx: { morale: 10, flag: 'tigerFriend' } } },
        { t: 'Offer it rations. (4)', cost: { food: 4 }, ok: { t: 'It eats, purrs, and politely moves off the road.', fx: { morale: 6 } } },
      ],
    },
    {
      id: 'band_road',
      title: 'Strike Up the Band',
      who: { a: 'drummer', n: 'A Travelling Band' },
      text: 'A travelling band blocks the road with drums, a fiddle and enormous enthusiasm. "Want a song, your highness?"',
      choices: [
        { t: 'Dance!', ok: { t: 'Everyone dances. Sir Halbert does a jig. Nobody will ever speak of it.', fx: { morale: 10, food: -2 } } },
        { t: 'Commission a royal anthem. (6 coins)', cost: { gold: 6 }, ok: { t: 'They compose "Hail the {Ruler} (Who Is Walking)". It slaps.', fx: { renown: 15 } } },
        { t: 'Barrelby becomes a drum.', req: { m: 'barrelby' }, ok: { t: 'The drummer plays Barrelby. Barrelby has never been happier. Neither have you.', fx: { morale: 16 } } },
      ],
    },
    {
      id: 'beekeeper_bees',
      title: 'Restless Bees',
      who: { a: 'beekeeper', n: 'A Beekeeper' },
      text: 'A beekeeper waves from beside a humming hive. "Honey for sale! The bees are a bit… restless today."',
      choices: [
        { t: 'Buy honey. (5 coins)', cost: { gold: 5 }, ok: { t: 'Golden, thick, perfect. Everyone eats it with a spoon. Some with fingers.', fx: { food: 8, morale: 5 } } },
        {
          t: 'Help calm the bees.',
          roll: {
            p: 0.55,
            boost: [{ m: 'murk', add: 0.2 }],
            win: { t: 'You hum. The bees hum back. You leave with free honey and a new appreciation for bees.', fx: { food: 8, morale: 6 } },
            lose: { t: 'Quill gets stung on the nose. He writes about it for an entire afternoon.', fx: { morale: -5 } },
          },
        },
        { t: 'Keep walking, quickly.', ok: { t: 'A single bee follows you for a mile, buzzing judgementally.' } },
      ],
    },
    {
      id: 'bath_knight',
      title: 'Bath Time',
      who: { a: 'bathknight', n: 'A Bathing Knight' },
      text: 'A knight is having a bath in a barrel by the road. In full armour.',
      choices: [
        { t: 'Ask him why.', ok: { t: '"Rust," he says, "is a lifestyle." You cannot argue with that.', fx: { morale: 6 } } },
        { t: 'Hand him a towel.', ok: { t: 'He thanks you with immense dignity and drips on your boots.', fx: { renown: 5 } } },
        { t: 'Barrelby meets the bath barrel.', req: { m: 'barrelby' }, ok: { t: 'The two barrels regard each other for a long, meaningful moment. The knight looks deeply uncomfortable.', fx: { morale: 10 } } },
      ],
    },
    {
      id: 'drunkard_serenade',
      title: 'A Serenade (Unrequested)',
      who: { a: 'drunkard', n: 'A Merry Fellow' },
      text: 'A man waving a mug serenades your court. Badly. With feeling.',
      choices: [
        { t: 'Sing along.', ok: { t: 'Together you hit notes that should not exist. Birds leave the area.', fx: { morale: 7 } } },
        { t: 'Give him water.', ok: { t: 'He drinks it, blinks, and says: "That was water." He seems betrayed but healthier.', fx: { renown: 4 } } },
        { t: 'Marta: "You are cut off, love."', req: { m: 'marta' }, ok: { t: 'He meekly hands Marta his mug and his "emergency coin".', fx: { gold: 6, morale: 4 } } },
      ],
    },
    {
      id: 'mudslinger',
      title: 'A Messy Protest',
      who: { a: 'mudslinger', n: 'An Angry Peasant' },
      text: 'A peasant is flinging manure at passers-by. It is a protest. About something.',
      choices: [
        { t: 'Ask what he is protesting.', ok: { t: '"TAXES! From a king who left three hundred years ago!" He apologises when he learns who you are.', fx: { morale: 5, renown: 4 } } },
        {
          t: 'Duck!',
          roll: {
            p: 0.5,
            win: { t: 'You duck. It misses. A heroic moment, unwitnessed by anyone sober.', fx: { morale: 5 } },
            lose: { t: 'It does not miss.', fx: { morale: -6 } },
          },
        },
        { t: 'Sir Halbert raises his shield.', req: { m: 'halbert' }, ok: { t: 'SPLAT. Sir Halbert takes it on the shield. "It is my duty," he says, stoically, smelling terrible.', fx: { morale: 8, renown: 5 } } },
      ],
    },
    {
      id: 'puss_hat',
      title: 'The Plumed Cat',
      who: { a: 'puss', n: 'A Cat in a Plumed Hat' },
      text: 'A cat in a plumed hat steps into the road and bows. You are almost certain it is a cat.',
      choices: [
        { t: 'Bow back.', ok: { t: 'The cat nods approvingly and strolls away. You feel you have passed a test.', fx: { renown: 6, morale: 4 } } },
        { t: 'Offer it a ration.', cost: { food: 2 }, ok: { t: 'It eats delicately, then leaves a gold coin on your boot. Old money.', fx: { gold: 12 } } },
        { t: 'Ask its name.', ok: { t: 'It looks at you as if YOU should know. You feel inexplicably ashamed.', fx: { morale: 2 } } },
      ],
    },
    {
      id: 'sirwoof_duel',
      title: 'A Challenger Appears',
      who: { a: 'sirwoof', n: 'Sir Woofington' },
      text: 'A dog in a plumed knight’s helmet blocks the road. He barks once. It is unmistakably a formal challenge.',
      req: { noflag: 'woofFriend' },
      choices: [
        {
          t: 'Accept the duel.',
          roll: {
            p: 0.45,
            boost: [{ m: 'brunhild', add: 0.3 }, { m: 'clanksworth', add: 0.1 }],
            win: { t: 'You win! Sir Woofington wags. He respects you now. You can tell.', fx: { renown: 12, flag: 'woofFriend', chain: 'sirwoof_return', chainIn: 120 } },
            lose: { t: 'He wins, then licks your face in victory. Honestly a great outcome.', fx: { morale: 8 } },
          },
        },
        { t: 'Throw a stick.', ok: { t: 'Duel forgotten. Stick acquired. Sir Woofington is the happiest knight in the realm.', fx: { morale: 10, flag: 'woofFriend', chain: 'sirwoof_return', chainIn: 140 } } },
        { t: 'Fennick whistles.', req: { m: 'fennick' }, ok: { t: 'Sir Woofington trots over and sits perfectly. Fennick gives him a biscuit and a knighthood.', fx: { morale: 8, flag: 'woofFriend', chain: 'sirwoof_return', chainIn: 140 } } },
      ],
    },
    {
      id: 'sirwoof_return',
      title: 'A Very Good Knight',
      chainOnly: true,
      who: { a: 'sirwoof', n: 'Sir Woofington' },
      text: 'Sir Woofington trots up the road carrying something shiny in his mouth. He drops it at your feet. It is a medal.',
      choices: [
        { t: 'Accept the medal.', ok: { t: 'It reads: FOR BEING A GOOD ROYAL. You will treasure it forever.', fx: { trinket: 'woofmedal', renown: 10, morale: 6 } } },
        { t: 'Give him a ration as thanks.', cost: { food: 1 }, ok: { t: 'He accepts it, then insists you keep the medal anyway. A true knight.', fx: { trinket: 'woofmedal', morale: 10 } } },
      ],
    },
    {
      id: 'pigeon_crown',
      title: 'The Pigeon Advisor',
      who: { a: 'pigeon', n: 'A Pigeon' },
      text: 'A pigeon lands on your crown and refuses to leave.',
      choices: [
        { t: 'Accept your new royal advisor.', ok: { t: 'It coos wisely at intervals. Your decisions do not improve, but they feel more official.', fx: { morale: 6, renown: 3 } } },
        { t: 'Offer it crumbs.', cost: { food: 1 }, ok: { t: 'It brings friends. The friends bring shiny things. You are now funding a pigeon economy.', fx: { gold: 6 } } },
        { t: 'Shoo it away.', ok: { t: 'It leaves. It also leaves you a small, unwelcome gift on your shoulder.', fx: { morale: -3 } } },
      ],
    },
    {
      id: 'frog_prince',
      title: 'Kiss the Frog?',
      who: { a: 'frog', n: 'A Frog' },
      text: 'A frog by a puddle croaks: "Kiss me. I am a prince." It winks. Frogs should not be able to wink.',
      choices: [
        {
          t: 'Kiss the frog.',
          roll: {
            p: 0.2,
            luck: true,
            win: { t: 'POOF! A prince! He thanks you with forty gold coins and hops away. Still hopping, oddly.', fx: { gold: 40, renown: 10 } },
            lose: { t: 'It is a frog. It was always a frog. It is absolutely delighted.', fx: { morale: 5 } },
          },
        },
        { t: 'Brother Murk recognises him.', req: { m: 'murk' }, ok: { t: '"Derek? From the cult?" The frog looks away, embarrassed. "Please do not tell anyone."', fx: { morale: 8 } } },
        { t: 'Politely decline.', ok: { t: 'The frog sulks into its puddle with a long, wet sigh.' } },
      ],
    },
    {
      id: 'toad_merchant',
      title: 'Ribbit-Cheap Wares',
      who: { a: 'toad', n: 'A Toad Merchant' },
      text: 'A giant toad hauls a cart of oddities. "Wares! Wares! Ribbit-cheap! Mostly not cursed!"',
      choices: [
        { t: 'Buy a random trinket. (30 coins)', cost: { gold: 30 }, ok: { t: 'The toad rummages and hands you something with a flourish of its tongue.', fx: { trinket: '@random' } } },
        { t: 'Odalys haggles.', req: { m: 'odalys', gold: 18 }, cost: { gold: 18 }, ok: { t: 'Odalys and the toad haggle in a language of croaks and eyebrows. You get a trinket for a song.', fx: { trinket: '@random', morale: 4 } } },
        { t: 'Just browse.', ok: { t: 'You browse a jar of eyes (glass), a hat with a hat on it, and a map of the moon.', fx: { morale: 3 } } },
      ],
    },
    {
      id: 'lost_knight',
      title: 'Directions, Please',
      who: { a: 'knightblue', n: 'A Lost Knight' },
      text: 'A knight in blue hails you. "Which way to the tourney? I have been walking in circles. Heroic circles, but circles."',
      choices: [
        { t: 'Give directions.', ok: { t: 'He thanks you and marches off with tremendous purpose. In the wrong direction.', fx: { renown: 5 } } },
        { t: 'Wren shows him a shortcut.', req: { m: 'wren' }, ok: { t: 'Wren’s shortcut works for him — and for you.', fx: { meters: 45, renown: 4 } } },
        { t: 'Sell him one of Ambrose’s maps.', req: { trinket: 'wizardmap' }, ok: { t: 'He pays handsomely. He will be lost for weeks. Happily.', fx: { gold: 12 } } },
      ],
    },
    {
      id: 'woodcutter_stuck',
      title: 'Bit Stuck',
      who: { a: 'woodcutter', n: 'A Woodcutter' },
      text: 'A woodcutter lies pinned under a fallen log. "I am fine. Totally fine. Bit stuck. Fine."',
      choices: [
        { t: 'Everyone lift!', req: { partyMin: 4 }, ok: { t: 'Heave! He is free. He insists on paying you in firewood and coins.', fx: { renown: 10, gold: 8 } } },
        { t: 'Pell lifts the log alone.', req: { m: 'pell' }, ok: { t: 'Pell lifts the log with one hand and the woodcutter with the other. Applause.', fx: { renown: 14, gold: 8 } } },
        { t: 'Ask if he wants a hand.', ok: { t: '"No, no, I am fine — YES. YES, PLEASE." You manage it. Barely.', fx: { renown: 6, morale: -2 } } },
      ],
    },
    {
      id: 'mystery_stew',
      title: 'Mystery Stew',
      who: { a: 'cleaver', n: 'A Roadside Cook' },
      text: 'A cook with a cleaver ladles out bowls of "mystery stew". "The mystery is part of the flavour."',
      choices: [
        {
          t: 'Eat it.',
          roll: {
            p: 0.6,
            win: { t: 'It is wonderful. You do not ask. You will never ask.', fx: { food: 6, morale: 5 } },
            lose: { t: 'It was boot. You are fairly sure it was boot.', fx: { morale: -5 } },
          },
        },
        { t: 'Elsie swaps recipes.', req: { m: 'elsie' }, ok: { t: 'Elsie identifies all eleven ingredients by smell. The cook gives her a ladle of honour and a sack of supplies.', fx: { food: 10, morale: 4 } } },
        { t: 'Decline politely.', ok: { t: 'She shrugs and eats your portion. Loudly.' } },
      ],
    },
    {
      id: 'witch_newt',
      title: 'Newt, Anyone?',
      who: { a: 'witch', n: 'A Witch in a Green Hat' },
      text: 'A witch offers to turn someone into a newt. "Just for fun. It wears off. Usually."',
      choices: [
        { t: 'Volunteer Quill.', req: { m: 'quill' }, ok: { t: 'Quill is a newt for ten glorious, quiet minutes. He writes nothing. Bliss.', fx: { morale: 10 } } },
        { t: 'Ask her to turn a rock into bread.', ok: { t: 'She does. It is rye. She is very proud of the crust.', fx: { food: 7 } } },
        { t: 'Decline.', ok: { t: '"Shame," she says, and turns her own hat into a newt for practice.', fx: { morale: 2 } } },
      ],
    },
    {
      id: 'grape_granny',
      title: 'Grapes for Sale',
      who: { a: 'grapes', n: 'An Old Grape Seller' },
      text: 'An old woman sells grapes from a basket. "Fresh! Mostly! The wrinkly ones are raisins. Free upgrade."',
      choices: [
        { t: 'Buy a bunch. (4 coins)', cost: { gold: 4 }, ok: { t: 'Sweet as summer. You eat them while walking, like royalty.', fx: { food: 7, morale: 2 } } },
        { t: 'Carry her basket for a while.', ok: { t: 'She tells you stories of the old queen the whole way. She tips you in grapes and coins.', fx: { morale: 4, gold: 4, food: 3 } } },
      ],
    },
    {
      id: 'feather_hat',
      title: 'The Magnificent Hat',
      who: { a: 'oldlord', n: 'Lord Plumage' },
      text: 'An old lord with an enormous feathered hat blocks the way. "Admire it," he commands.',
      choices: [
        { t: 'Admire the hat.', ok: { t: 'You admire it lavishly. He gives you a feather as a souvenir. Fennick would kill for it.', fx: { renown: 5, morale: 3 } } },
        {
          t: 'Compare it to your crown.',
          roll: {
            p: 0.5,
            win: { t: 'Your crown catches the sun. He gasps, bows, and gives you his second-best hat.', fx: { renown: 12 } },
            lose: { t: 'His hat wins. Even your crown looks impressed.', fx: { morale: -2 } },
          },
        },
        { t: 'Fennick asks about the feathers.', req: { m: 'fennick' }, ok: { t: 'Fennick and Lord Plumage talk plumage for an hour. They part as brothers.', fx: { morale: 8, renown: 4 } } },
      ],
    },
    {
      id: 'paladin_quest',
      title: 'A Quest! (Small)',
      who: { a: 'paladin', n: 'A Shining Paladin' },
      text: 'A shining paladin strides up. "Travellers! I have a quest for you: help me find my sense of direction."',
      choices: [
        { t: 'Walk with her a while.', ok: { t: 'She walks impressively fast. You arrive further along the road, slightly winded.', fx: { meters: 35, morale: 2 } } },
        { t: 'Tell her it is in her other pocket.', ok: { t: 'She checks. It is. She is overjoyed and pays you a reward.', fx: { gold: 10, morale: 4 } } },
        { t: 'Dame Brunhild salutes her.', req: { m: 'brunhild' }, ok: { t: 'Two champions. One salute. The air crackles with mutual respect.', fx: { renown: 10, morale: 5 } } },
      ],
    },
    {
      id: 'aunt_gossip',
      title: 'Seven Feet Tall',
      who: { a: 'villager1', n: 'An Excited Villager' },
      text: 'A villager runs up. "Is it true? Are you THE {Ruler}? My aunt says you are seven feet tall and breathe fire."',
      choices: [
        { t: '"Yes."', ok: { t: 'Quill writes it down: "seven feet tall". The legend grows. So, in a sense, do you.', fx: { renown: 8 } } },
        { t: '"No, I am normal-sized."', ok: { t: 'She is a little disappointed, then cheered when you shake her hand.', fx: { morale: 4, renown: 3 } } },
        { t: '"Taller."', ok: { t: 'She faints. Her aunt will be insufferable.', fx: { renown: 10, morale: 2 } } },
      ],
    },
    {
      id: 'baker_samples',
      title: 'Free Samples',
      who: { a: 'baker', n: 'A Travelling Baker' },
      text: 'A baker has set up a cart. "Free samples! Then not free! Then very not free!"',
      choices: [
        { t: 'Take a sample.', ok: { t: 'A crumb of heaven. You immediately want more.', fx: { morale: 3, food: 2 } } },
        { t: 'Buy loaves. (5 coins)', cost: { gold: 5 }, ok: { t: 'Warm bread for the whole court. Morale rises like dough.', fx: { food: 10, morale: 3 } } },
        { t: 'Elsie challenges her to a bake-off.', req: { m: 'elsie' }, ok: { t: 'A draw. Both bakers cry. You eat the entries.', fx: { food: 12, morale: 8 } } },
      ],
    },
    {
      id: 'cider_stall',
      title: 'Warm Cider',
      who: { a: 'serving', n: 'A Cider Seller' },
      text: 'A roadside stall smells of cinnamon. "Warm cider! A round for your court?"',
      choices: [
        { t: 'A round for everyone. ({party} coins)', cost: { gold: 'party' }, ok: { t: 'Steam, spice and cheer. Everyone warms up. Even the grumpy ones almost smile.', fx: { morale: 12 } } },
        { t: 'Just one cup for me.', cost: { gold: 1 }, ok: { t: 'You drink it in front of everyone. Royalty has its privileges. And its glares.', fx: { morale: 1 } } },
        { t: 'Walk on.', ok: { t: 'The smell follows you for a mile, like a ghost of cinnamon.' } },
      ],
    },
    {
      id: 'reader_bump',
      title: 'Walking Reader',
      who: { a: 'reader', n: 'A Distracted Reader' },
      text: 'A woman reading while walking walks straight into your court. "Oh! So sorry. Great book. About a travelling monarch."',
      choices: [
        { t: 'Ask about the book.', ok: { t: '"A {ruler} and their ridiculous court. Wait… is that YOU?" She asks for an autograph.', fx: { renown: 8 } } },
        { t: 'Quill: "…That is MY book!"', req: { m: 'quill' }, ok: { t: 'Somebody copied Quill’s chronicle! Quill signs her copy, furious and flattered in equal measure.', fx: { renown: 12, morale: 6 } } },
        { t: 'Apologise and move on.', ok: { t: 'She waves, and walks into a tree. She apologises to the tree, too.' } },
      ],
    },
    {
      id: 'hooded_warning',
      title: 'A Dire Warning',
      who: { a: 'stranger', n: 'A Hooded Stranger' },
      text: 'A hooded stranger whispers: "Turn back… the road ahead… has a VERY steep hill."',
      choices: [
        { t: 'Thank him for the warning.', ok: { t: 'He nods solemnly and disappears into the trees. He was right about the hill.', fx: { morale: 2, buff: { id: 'steephill', label: 'Steep hill', speed: 0.85, meters: 50 } } } },
        { t: 'Brother Murk: "…Kevin?"', req: { m: 'murk' }, ok: { t: '"Murk?! From the cult?" They hug. Kevin left too. He mostly does hill warnings now.', fx: { morale: 9 } } },
        { t: 'Ignore him.', ok: { t: 'It is a very, very steep hill.', fx: { morale: -3, buff: { id: 'steephill', label: 'Steep hill', speed: 0.8, meters: 60 } } } },
      ],
    },
    {
      id: 'stew_argument',
      title: 'The Great Turnip Debate',
      who: { a: 'cookknight', n: 'Two Cooking Knights' },
      text: 'Two knights argue over a cooking pot. "More turnip!" "LESS turnip!" They turn to you. "Settle this, {majesty}."',
      choices: [
        { t: 'More turnip.', ok: { t: 'The pro-turnip knight cheers and gives you a bowl. It is very turnip.', fx: { food: 5, renown: 3 } } },
        { t: 'Less turnip.', ok: { t: 'The anti-turnip knight cheers and gives you a bowl. It is still, somehow, very turnip.', fx: { food: 5, renown: 3 } } },
        { t: 'Elsie fixes the stew.', req: { m: 'elsie' }, ok: { t: 'Elsie adds a pinch of something. Both knights weep. Peace is achieved.', fx: { food: 10, morale: 6, renown: 4 } } },
      ],
    },
    {
      id: 'smoking_hat',
      title: 'A Smouldering Situation',
      who: { a: 'campwizard', n: 'A Napping Wizard' },
      text: 'A wizard naps beside a campfire. His hat is, slowly and quietly, on fire.',
      choices: [
        { t: 'Wake him!', ok: { t: 'He leaps up, pats out his hat, and rewards you with a coin purse. "My hat thanks you!"', fx: { gold: 8, renown: 4 } } },
        { t: 'Put out the hat quietly.', ok: { t: 'You pour water on the hat. He sleeps on, smiling. You feel like a secret hero.', fx: { morale: 5 } } },
        { t: 'Roast a ration on it.', ok: { t: 'Perfectly toasted. You feel a little guilty. Then you put out the hat.', fx: { food: 3, morale: 4 } } },
      ],
    },
    {
      id: 'cuman_toll',
      title: 'Pay or Fight',
      who: { a: 'cuman', n: 'A Grim Warrior' },
      text: 'A grim warrior in furs blocks the road. "Pay toll, or fight." His stomach growls loudly.',
      choices: [
        { t: 'Pay. (6 coins)', cost: { gold: 6 }, ok: { t: 'He takes the coins and steps aside. His stomach keeps growling.', fx: {} } },
        {
          t: 'Fight!',
          roll: {
            p: 0.4,
            boost: [{ m: 'gruff', add: 0.3 }, { m: 'brunhild', add: 0.3 }, { m: 'halbert', add: 0.15 }],
            win: { t: 'He yields with a grunt of respect and drops a purse as he flees.', fx: { gold: 14, renown: 10 } },
            lose: { t: 'You lose, and pay double for the trouble. Ouch.', fx: { gold: -12, morale: -4 } },
          },
        },
        { t: 'Offer him food. (4 rations)', cost: { food: 4 }, ok: { t: 'He eats, nods once, and leaves. You think you made a friend.', fx: { renown: 6, morale: 4 } } },
      ],
    },
    {
      id: 'black_knight',
      title: 'None Shall Pass',
      who: { a: 'darkknight', n: 'The Black Knight' },
      text: 'A black knight blocks the bridge. "NONE SHALL PASS!" There is a wet-paint smell. His armour is still drying.',
      choices: [
        { t: 'Point out the paint.', ok: { t: 'He looks down at his gauntlets. He sobs. You hug him. You are both black now.', fx: { morale: 6, renown: 4 } } },
        {
          t: 'Duel him.',
          roll: {
            p: 0.55,
            boost: [{ m: 'brunhild', add: 0.3 }, { m: 'clanksworth', add: 0.1 }],
            win: { t: 'He slips on his own wet paint. You win on a technicality, which still counts.', fx: { renown: 14 } },
            lose: { t: 'You lose and are covered in black paint. You look very dramatic, at least.', fx: { morale: -3, renown: 3 } },
          },
        },
        { t: 'Sir Clanksworth offers fashion advice.', req: { m: 'clanksworth' }, ok: { t: '"Silver, my friend. Always silver." The Black Knight takes notes and lets you pass.', fx: { morale: 6, renown: 6 } } },
      ],
    },
    {
      id: 'wedding_party',
      title: 'Royal Officiant',
      who: { a: 'villager4', n: 'A Nervous Bride' },
      text: 'A wedding party flags you down. "The priest fell in the river! You are royalty — can you marry us?"',
      choices: [
        { t: 'Officiate!', ok: { t: 'You do your best. You declare them "married, and also knighted". There is cake.', fx: { renown: 15, food: 6, morale: 6 } } },
        { t: 'Bishop Bellwether takes over.', req: { m: 'bellwether' }, ok: { t: 'A proper blessing, a proper wedding, and an improper amount of cake.', fx: { renown: 20, food: 8, morale: 8 } } },
        { t: 'Politely decline.', ok: { t: 'They fish the priest out of the river instead. He officiates, dripping.' } },
      ],
    },
    {
      id: 'tax_collector',
      title: 'The Road Tax',
      who: { a: 'oldlord', n: 'A Tax Collector' },
      text: 'A man with a ledger blocks the way. "Road tax! One coin per royal foot." He counts your court’s feet. Slowly.',
      choices: [
        { t: 'Pay up. ({party} coins)', cost: { gold: 'party' }, ok: { t: 'He counts it twice and gives you a receipt in very small handwriting.', fx: {} } },
        { t: 'Hazel "pays" him.', req: { m: 'hazel' }, ok: { t: 'Hazel pays him with great ceremony. Later, you find his ledger AND your coins in her pockets.', fx: { gold: 6, morale: 6 } } },
        { t: 'Barrelby has no feet.', req: { m: 'barrelby' }, ok: { t: 'The collector stares at the barrel for a long time. He closes his ledger and walks away, shaken.', fx: { morale: 10 } } },
        {
          t: 'Declare a royal tax exemption.',
          roll: {
            p: 0.45,
            boost: [{ m: 'quill', add: 0.15 }, { flag: 'crowned', add: 0.4 }],
            win: { t: 'Your decree is so official-sounding he salutes and leaves.', fx: { renown: 10 } },
            lose: { t: '"Nice try." You pay, plus a fine for trying.', fx: { gold: -10 } },
          },
        },
      ],
    },
    {
      id: 'herald_news',
      title: 'Breaking News',
      who: { a: 'crier', n: 'Pim, Royal-ish Herald' },
      text: 'Pim the Herald jogs past. "News! News! Duke Reginald fell off his horse again! Also, cabbage prices are up!"',
      req: { stopMin: 2 },
      choices: [
        { t: 'Tip him for the news. (3 coins)', cost: { gold: 3 }, ok: { t: '"Bless you, {majesty}! Exclusive tip: there is a shortcut past the old oak." There is.', fx: { meters: 30, renown: 3 } } },
        { t: 'Ask him to announce YOU.', ok: { t: '"HEAR YE! The {title} approaches!" A cow looks up. That is about it.', fx: { renown: 6 } } },
        { t: 'Ask about cabbage prices.', ok: { t: 'He talks about cabbage for twenty minutes. You learn more than you wanted.', fx: { morale: 2 } } },
      ],
    },
    {
      id: 'ale_offer',
      title: 'One for the Road',
      who: { a: 'knightale', n: 'A Jolly Knight' },
      text: 'A jolly knight offers you a frothing mug. "One for the road, friend! The road could use one too!"',
      choices: [
        { t: 'Cheers!', ok: { t: 'You drink to the road. The road seems to approve. Everyone walks a little happier.', fx: { morale: 6 } } },
        { t: 'Marta critiques his ale.', req: { m: 'marta' }, ok: { t: 'Marta tastes it. "Too much hops, not enough love." He is devastated, then inspired. He gives you a keg.', fx: { morale: 10, food: 4 } } },
        { t: 'No thanks.', ok: { t: 'He shrugs and drinks both. "More for the road, then."' } },
      ],
    },
    {
      id: 'lute_ballad_wrong',
      title: 'A Very Inaccurate Ballad',
      who: { a: 'knightlute', n: 'A Lute Knight' },
      text: 'A knight sits by the road playing a ballad about a heroic {ruler}. It is about you. It is wildly inaccurate.',
      choices: [
        { t: 'Correct him.', ok: { t: '"Actually, I did not wrestle a bear." He looks crushed. The bear verse was his favourite.', fx: { morale: -1, renown: 3 } } },
        { t: 'Tip him and say nothing.', cost: { gold: 3 }, ok: { t: 'You wrestled a bear now. Officially. The legend grows.', fx: { renown: 10 } } },
        { t: 'Quill adds a verse.', req: { m: 'quill' }, ok: { t: 'Quill adds nine verses. The ballad is now forty minutes long and the bear has a backstory.', fx: { renown: 12, morale: 4 } } },
      ],
    },
    {
      id: 'flute_chickens',
      title: 'The Chicken Piper',
      who: { a: 'fluteplayer', n: 'A Flute Player' },
      text: 'A flute player strolls past, followed by a line of hypnotised chickens.',
      choices: [
        { t: 'Ask for a few eggs.', ok: { t: 'He plays a special tune. Three chickens lay eggs on cue. Remarkable. Slightly upsetting.', fx: { food: 6 } } },
        { t: 'Join the line.', ok: { t: 'You walk in the chicken line for a while. It is surprisingly relaxing.', fx: { morale: 7 } } },
        { t: 'Barrelby rolls into the line.', req: { m: 'barrelby' }, ok: { t: 'The chickens accept Barrelby as one of their own. A proud moment for everyone.', fx: { morale: 12 } } },
      ],
    },
    {
      id: 'snowman_couple',
      title: 'Mr. and Mrs. Snow',
      who: { a: 'snowmen', n: 'Two Snowmen' },
      text: 'Two snowmen stand by the road, holding stick hands. Someone has given them tiny hats.',
      req: { biome: ['winter'] },
      choices: [
        { t: 'Give them scarves.', ok: { t: 'They look much cosier. You feel ridiculous and wonderful.', fx: { morale: 6 } } },
        { t: 'Build them a snow-child.', req: { partyMin: 4 }, ok: { t: 'Your court builds a little snow-child. It is a bit lopsided. They look very proud.', fx: { morale: 12 } } },
        { t: 'Elsie gives them carrot noses.', req: { m: 'elsie' }, cost: { food: 1 }, ok: { t: 'Perfect noses. Elsie insists it is a waste of good carrots, but she is smiling.', fx: { morale: 9 } } },
      ],
    },
    {
      id: 'wizard_lost_again',
      title: 'Ambrose, Again',
      who: { a: 'ambrose', n: 'Ambrose the Wayfinder' },
      text: 'Ambrose the Wayfinder waves from a hilltop, holding a new map. "Friends! This one is CORRECT. I am almost certain."',
      req: { flag: 'dragonLore', stopMin: 5 },
      choices: [
        {
          t: 'Follow his new map.',
          roll: {
            p: 0.5,
            win: { t: 'It works! A real shortcut! Ambrose is more surprised than anyone.', fx: { meters: 70, morale: 4 } },
            lose: { t: 'It leads to a pond. Ambrose apologises to the pond.', fx: { meters: -25, morale: 3 } },
          },
        },
        { t: 'Give him directions instead.', ok: { t: 'He writes them down on the back of his map. Then turns the map upside down.', fx: { renown: 4, morale: 3 } } },
      ],
    },
    {
      id: 'croakley_flies',
      title: 'Archmage Snack Break',
      who: { a: 'toadwiz', n: 'Archmage Croakley' },
      text: 'Archmage Croakley sits on a mossy stump, snapping flies with great satisfaction. "Ah! Ysolde’s heir! Care for a fly?"',
      req: { flag: 'ysoldeLore' },
      choices: [
        { t: 'Politely decline the fly.', ok: { t: 'He tells you how Ysolde once outwalked a thunderstorm. You feel taller.', fx: { renown: 10, morale: 4 } } },
        { t: 'Eat the fly. For diplomacy.', ok: { t: 'Crunchy. Croakley is moved to tears. He blesses your boots.', fx: { buff: { id: 'croakboots', label: 'Croakley’s blessing', speed: 1.35, meters: 150 }, morale: -2 } } },
      ],
    }
  );

  if (typeof module !== 'undefined' && module.exports) {
    module.exports = TK;
  }
})(typeof window !== 'undefined' ? window : globalThis);
