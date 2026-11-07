/* Travelling Kingdom — main story: prologue, road beats, finale.
 * A line is [speaker, text, req?]. Lines spoken by companions who are not in the
 * party are skipped automatically, so group scenes adapt to whoever is present.
 */
(function (root) {
  'use strict';

  const TK = (root.TK = root.TK || {});
  const D = (TK.data = TK.data || {});

  D.prologue = {
    scene: 'home',
    actor: 'crier',
    recruit: 'quill',
    place: 'Your Castle (a rented stable)',
    lines: [
      ['narrator', 'Five years ago, at an auction of Miscellaneous Hats, you bought a crown. It was definitely real. You were definitely royalty.'],
      ['narrator', 'Since then you have ruled a kingdom of exactly one, from a rented stable you insist on calling "the castle".'],
      ['crier', 'HEAR YE! HEAR YE! A proclamation under the Old Law!'],
      ['crier', 'Pim, Royal-ish Herald. The "ish" is legally important.'],
      ['crier', 'By the Old Law: whoever wears a true crown and sits upon the Old Throne at Dragon’s Rest shall rule the realm!'],
      ['hero', 'I have a crown.'],
      ['crier', '…Is that a real crown?'],
      {
        choice: [
          { t: 'Definitely.', fx: { renown: 5 }, then: [['crier', 'Then you had best hurry. Duke Reginald Plumwhistle set off this morning. On a horse. A very tall horse.']] },
          {
            t: 'It came in a box marked "hats".',
            fx: { morale: 5 },
            then: [['crier', 'That is… not a no. Mind you, Duke Reginald Plumwhistle set off this morning. On a very tall horse.']],
          },
        ],
      },
      ['crier', 'One more thing. A monarch needs a court! Subjects! Followers! People who believe in you!'],
      ['quill', 'Ahem. Quill, scribe. I could not help overhearing. Every monarch needs a chronicler — someone to write down how magnificent they are.'],
      ['quill', 'I will write everything down. Even the embarrassing parts. Especially the embarrassing parts.'],
      ['narrator', 'Quill joins your court. Population: two. It is a start.'],
      ['crier', 'Onward, to Dragon’s Rest! Follow the Kingsroad through the Greenwold, the Amber Reach and the Frostmarch, and gather your court as you go!'],
      ['narrator', 'And so the Travelling Kingdom sets out: a kingdom that goes wherever you walk.'],
    ],
  };

  /** Road beats: fire once when the party is `at` (fraction) of the way to route stop `stop`. */
  D.beats = [
    {
      id: 'reginald1',
      stop: 1,
      at: 0.5,
      actor: 'reginald',
      title: 'A Very Tall Horse',
      lines: [
        ['narrator', 'Hooves thunder. A purple knight on a very tall horse reins in beside you.'],
        ['reginald', 'Out of the way, peasant in a hat! Duke Reginald Plumwhistle, future monarch of the realm, coming through!'],
        ['hero', 'Future monarch? I am going to Dragon’s Rest too.'],
        ['reginald', 'YOU? With THAT? Ha! My crown has a crown on it. Two crowns! A crown-crown!'],
        ['quill', '(scribbling) "Rival introduced. Smells of perfume and horse."'],
        {
          choice: [
            { t: 'Lovely horse.', fx: { morale: 4 }, then: [['reginald', '…Thank you. His name is Lord Fluffington. HE IS VERY FIERCE.']] },
            { t: 'May the best monarch win.', fx: { renown: 10 }, then: [['reginald', 'Oh, I will. I always win. Mostly. Sometimes. Good DAY.']] },
            { t: 'Your crown is crooked.', fx: { morale: 6 }, then: [['reginald', 'IT IS NOT— *adjusts it* …Good day!']] },
          ],
        },
        ['narrator', 'Duke Reginald gallops off. Lord Fluffington looks back at you apologetically.'],
      ],
    },
    {
      id: 'ambrose',
      stop: 3,
      at: 0.5,
      actor: 'ambrose',
      title: 'The Wayfinder',
      lines: [
        ['narrator', 'A wizard stands in the middle of the road, holding a map upside down. Possibly sideways.'],
        ['ambrose', 'Ah! Travelers! Ambrose the Wayfinder — never lost, merely exploring aggressively. Which way is Dragon’s Rest?'],
        ['hero', 'That way. Along the road. The only road.'],
        ['ambrose', 'Fascinating. According to my map it is in the sea. Also, apparently, there is a sea.'],
        {
          choice: [
            {
              t: 'Let me see that map.',
              fx: { trinket: 'wizardmap' },
              then: [['ambrose', 'Keep it! I have nineteen more. All different. All wrong. Wrong in very helpful ways.']],
            },
            {
              t: 'Walk with us for a while?',
              fx: { trinket: 'wizardmap', morale: 4 },
              then: [['ambrose', 'Alas, I am bound for the Eastern Western Mountains. But take a map! It is wrong in helpful ways.']],
            },
          ],
        },
        ['ambrose', 'A word of warning, friend: the dragon sleeps on the old throne. Dragons hate rudeness, cold soup and being woken. Mostly being woken.'],
      ],
      outro: { flag: 'dragonLore' },
    },
    {
      id: 'reginald2',
      stop: 5,
      at: 0.55,
      actor: 'reginald',
      title: 'The Duke Returns',
      lines: [
        ['narrator', 'Duke Reginald blocks the road again. Lord Fluffington is wearing a little hat.'],
        ['reginald', 'Ha! Plumwhistle again! I have hired a herald! Herald — announce me!'],
        ['crier', 'Hear ye, hear ye. The Duke. He is… here. (whispering) He is paying me double, {majesty}. Sorry.'],
        ['reginald', 'Bow before the next monarch!'],
        {
          choice: [
            { t: 'Bow very, very low.', fx: { gold: 8, morale: 5 }, then: [['narrator', 'You bow so low you find a coin on the ground. Reginald is livid.']] },
            {
              t: '[Wren] Tell him about the "shortcut".',
              req: { m: 'wren' },
              fx: { morale: 10, renown: 5 },
              then: [
                ['wren', 'Your Grace, there is a faster road. Through that ditch.'],
                ['reginald', 'A secret road! Ha! Fluffington — ONWARD!'],
                ['narrator', 'They charge into the ditch. Splash.'],
              ],
            },
            {
              t: 'Offer him a snack.',
              fx: { renown: 5, flag: 'kindToReginald' },
              then: [['reginald', '…I do not need your charity. *takes three* Good DAY.']],
            },
          ],
        },
      ],
    },
    {
      id: 'croakley',
      stop: 7,
      at: 0.45,
      actor: 'toadwiz',
      title: 'The Toad Who Remembers',
      lines: [
        ['narrator', 'A toad in wizard robes sits on a stump by the road. He clears his throat. It takes a while.'],
        ['toadwiz', 'Ribbit. I mean — greetings. Archmage Croakley. Cursed into a toad four hundred years ago. I have grown to like it.'],
        ['toadwiz', 'That crown. That is Ysolde’s crown, the last queen of the realm. I would know it anywhere. I was her court wizard.'],
        ['hero', 'What happened to her?'],
        ['toadwiz', 'She walked the Kingsroad end to end and gathered the strangest court the realm had ever seen. Then she left the throne in the dragon’s keeping, "until someone worth following comes along".'],
        ['toadwiz', 'Many have tried to claim it since. The dragon ate their pride. Not them. Just their pride. Mostly.'],
        {
          choice: [
            { t: 'How do I prove I am worth following?', fx: { morale: 8, renown: 10 }, then: [['toadwiz', 'Look behind you, child. You are already doing it.']] },
            { t: 'Can I lift your curse?', fx: { morale: 5 }, then: [['toadwiz', 'Lift it? Heavens, no. I catch flies with my tongue. Do you know how USEFUL that is?']] },
          ],
        },
        ['toadwiz', 'Take this — a charm from Ysolde’s court. Ribbit. Good luck.'],
      ],
      outro: { trinket: 'toadcharm', flag: 'ysoldeLore' },
    },
    {
      id: 'reginald3',
      stop: 9,
      at: 0.5,
      actor: 'reginald',
      title: 'A Crown of Turnip',
      lines: [
        ['narrator', 'You find Duke Reginald sitting in a puddle. Lord Fluffington is eating his hat.'],
        ['reginald', 'Do not look at me. A jeweller in Anvil Rest says my crown is painted turnip. TURNIP. I paid a fortune.'],
        ['reginald', 'Two crowns, he said. A crown-crown. It is just turnip on turnip.'],
        {
          choice: [
            {
              t: 'Help him up.',
              fx: { renown: 15, morale: 5, flag: 'kindToReginald' },
              then: [
                ['reginald', '…Why are you being nice to me?'],
                ['hero', 'Nobody should sit in a puddle alone.'],
                ['reginald', 'Hmph. …Thank you.'],
              ],
            },
            {
              t: 'Laugh.',
              fx: { morale: 10, renown: -5 },
              then: [['narrator', 'You laugh. Your court laughs. Lord Fluffington laughs, which you did not know horses could do. Reginald gallops off, scarlet.']],
            },
            {
              t: '[Elsie] Turnip soup, anyone?',
              req: { m: 'elsie' },
              fx: { food: 6, morale: 6, flag: 'kindToReginald' },
              then: [
                ['elsie', 'Turnip crown soup, coming right up!'],
                ['reginald', '…It is delicious. I hate that it is delicious.'],
              ],
            },
          ],
        },
        ['reginald', 'This is not over! I shall find a real crown! Somewhere! FLUFFINGTON — AWAY!'],
      ],
    },
    {
      id: 'blizzard',
      stop: 13,
      at: 0.5,
      actor: null,
      title: 'The Long Night',
      lines: [
        ['narrator', 'A blizzard rolls down from the peaks. Your court huddles around a sputtering fire.'],
        ['quill', 'I have been writing all of this down, you know. Every bit. It is the best story I have ever written.'],
        ['wren', 'When I deserted, I thought I was running away. Turns out I was running toward something.'],
        ['marta', 'Ten years behind a bar. Never thought I would see snow on the mountains. It is beautiful, isn’t it?'],
        ['halbert', 'Eleven years on one hill. This is a much better hill. It moves.'],
        ['hazel', 'I have not stolen anything in a week. I think I am… happy? It is very confusing.'],
        ['bellwether', 'Bless this fire. Bless this snow. Bless every one of you, you ridiculous, wonderful people.'],
        ['agatha', 'Sit closer, all of you. Body heat is a medical recommendation.'],
        ['pell', 'If anyone gets tired tomorrow, I will carry you. All of you. At once, if needed.'],
        ['fennick', 'I gave the perfect feather to the fire, for warmth. Do not tell anyone. Especially me.'],
        ['elsie', 'Snow soup. Hear me out.'],
        ['gruff', '…Good court.'],
        ['barrelby', '*the barrel shifts closer to the fire, and to you*'],
        ['hero', 'Whatever happens at Dragon’s Rest… thank you. All of you.'],
        ['narrator', 'The fire crackles. The storm passes. Morning comes bright and blue.'],
      ],
      outro: { morale: 20, renown: 20 },
    },
    {
      id: 'reginald4',
      stop: 16,
      at: 0.5,
      actor: null,
      title: 'One Boot',
      lines: [
        ['narrator', 'Duke Reginald trudges through the snow on foot. No horse. No hat. One boot.'],
        ['reginald', 'Do not. Lord Fluffington met a lovely mare at the last village. He is… happy. I am happy for him. I am FINE.'],
        ['reginald', 'I am still going to Dragon’s Rest. I do not even have a crown anymore. I just… I have come this far, you know?'],
        {
          choice: [
            {
              t: 'Walk with us to the end.',
              fx: { renown: 20, flag: { reginaldWalks: true, kindToReginald: true } },
              then: [['reginald', 'With you? …Only to the end. Then we are rivals again. Obviously.']],
            },
            {
              t: 'Give him a ration and a spare boot. (5 rations)',
              req: { food: 5 },
              fx: { food: -5, renown: 15, flag: 'kindToReginald' },
              then: [['reginald', 'A boot! A REAL boot. …You are a very strange monarch, you know that?']],
            },
            { t: 'See you at the throne.', fx: { renown: 5 }, then: [['reginald', 'Indeed. May the… best monarch win.']] },
          ],
        },
      ],
    },
  ];

  D.finale = {
    lines: [
      ['narrator', 'Dragon’s Rest. Snow on gold, gold on stone, and on the stone, the Old Throne. Coiled around it, asleep, the dragon.'],
      ['narrator', 'Its breath is a slow tide of warm wind. Every exhale sounds like a mountain sighing.'],
      ['quill', '(whispering) I am writing this down so fast my quill is smoking.'],
      ['reginald', 'There it is. The throne. We made it.', { flag: 'reginaldWalks' }],
      ['reginald', 'HA! I made it first— *trips on a gold coin* —I made it second.', { noflag: 'reginaldWalks' }],
      ['reginald', 'I shall just sit on the throne very quickly, before anything notices—'],
      ['narrator', 'Reginald clambers toward the throne. A coin slides. Then a hundred coins. Then a thousand. It sounds like the world’s largest piggy bank falling down the stairs.'],
      ['dragon', '…WHO.'],
      ['dragon', 'WHO WAKES ME.'],
      {
        choice: [
          { t: 'Step between the dragon and Reginald.', fx: { flag: 'finaleBrave', renown: 40 }, then: [['dragon', '…YOU SHIELD YOUR RIVAL? INTERESTING.']] },
          {
            t: 'It was him! (point at Reginald)',
            fx: { flag: 'finaleHonest', morale: 5 },
            then: [
              ['reginald', 'TRAITOR!'],
              ['dragon', 'HONEST, AT LEAST.'],
            ],
          },
          {
            t: '[Barrelby] Roll the barrel forward.',
            req: { m: 'barrelby' },
            fx: { flag: 'finaleBarrel', morale: 15 },
            then: [
              ['barrelby', '*rolls forward and knocks twice*'],
              ['dragon', '…BARRELBY? IS THAT YOU? I HAVE NOT SEEN YOU IN THREE HUNDRED YEARS.'],
              ['narrator', 'Nobody ever finds out what that means.'],
            ],
          },
        ],
      },
      ['dragon', 'I AM THE KEEPER OF THE OLD THRONE. YSOLDE LEFT IT WITH ME UNTIL SOMEONE WORTH FOLLOWING CAME ALONG.'],
      ['dragon', 'MANY HAVE COME. KNIGHTS. LORDS. ONE VERY CONFIDENT GOOSE. ALL WANTED THE THRONE. NONE UNDERSTOOD IT.'],
      ['dragon', 'SO. A QUESTION, SMALL MONARCH. WHAT IS A KINGDOM?'],
      {
        choice: [
          {
            t: 'Land, castles and gold.',
            then: [
              ['dragon', 'WRONG. I SLEEP ON THE GOLD. IT IS EXTREMELY UNCOMFORTABLE.'],
              ['narrator', 'The dragon’s great eye slides past you, to your court standing behind you in the snow.'],
            ],
          },
          {
            t: 'A crown and a throne.',
            then: [
              ['dragon', 'WRONG. A CROWN IS A HAT WITH AMBITION.'],
              ['narrator', 'The dragon’s great eye slides past you, to your court standing behind you in the snow.'],
            ],
          },
          { t: 'The people who walk with you.', fx: { flag: 'finaleWise', renown: 100 }, then: [['dragon', '…YES.']] },
        ],
      },
      ['dragon', 'LOOK AT THEM. A SCRIBE. A SCOUT. A THIEF. A BARKEEP. A BARREL. THEY FOLLOWED YOU ACROSS THE WHOLE REALM, FOR NO GOLD AT ALL.'],
      ['dragon', 'YSOLDE WALKED THIS ROAD TOO. SHE SAID A MONARCH IS ONLY THE FIRST ONE TO START WALKING.'],
      ['dragon', 'THE THRONE IS YOURS, {HERO}.'],
      ['reginald', '…Congratulations. Truly. You were kind to me when I was a turnip-crowned fool. I would follow a monarch like that.', { flag: 'kindToReginald' }],
      ['narrator', 'Reginald kneels. Then gets stuck in the gold. Your court helps him out.', { flag: 'kindToReginald' }],
      ['reginald', 'Hmph. Fine. Congratulations. I shall be… gracious about this. Eventually.', { noflag: 'kindToReginald' }],
      ['quill', 'And so it was written: {hero}, {Ruler} of the Realm!'],
      ['narrator', 'The dragon breathes a warm gust that melts the snow from every boot. Then it yawns and settles back to sleep. "WAKE ME IF ANYTHING INTERESTING HAPPENS."'],
      ['narrator', 'You sit on the throne for exactly one minute. It is very uncomfortable. Then you stand up.'],
      ['hero', 'A kingdom that sits still is not much of a kingdom. Come on, everyone. There is more road.'],
      ['narrator', 'The Travelling Kingdom sets out again — not to claim anything, but to see what comes next. The end… of the beginning.'],
    ],
    outro: { flag: 'crowned', renown: 300, gold: 200, trinket: 'dragonscale' },
  };

  if (typeof module !== 'undefined' && module.exports) {
    module.exports = TK;
  }
})(typeof window !== 'undefined' ? window : globalThis);
