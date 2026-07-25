# Apple Grove + Party of 3 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add Apple Grove (destination level 2) with orchard art + forest-woman recruit, expand the party to 3 companions with tighter trail spacing and a further-right camera.

**Architecture:** Generalize landmark + companion slots in the webview (`media/game.js`, mirrored to `main.js`). Host `depart()` bumps `partySize` to 2 at Soldier Camp and 3 at Apple Grove. Two follower canvases trail the lead; grove uses `apple_tree.png` / `willow_tree.png` + female spritesheet column 2.

**Tech Stack:** VS Code extension (TypeScript host), webview (`game.js` / `main.js`, CSS), static PNG assets, `destinations.json`.

## Global Constraints

- Destination level 2 name: **Apple Grove** (rename from River Town)
- After grove recruit: **partySize = 3**
- Forest woman: `female_spritesheet.png` column **2** (0-based col `1`), idle rows 2–6 (0-based `[1,2,3,4,5]`)
- ~28–32 apple trees + one willow; same scroll-meet cutscene pattern as Soldier Camp
- Camera: tighter follow gap (~0.45× sprite) + higher lead inset so three fit
- Mirror every `game.js` change into `media/main.js`
- Do not break Soldier Camp recruit / linger
- Ship as **0.0.42** with VERSION_HISTORY + README latest bump

---

## File map

| File | Responsibility |
| --- | --- |
| `static/world/destinations.json` | Rename level 2 → Apple Grove |
| `src/petState.ts` | `depart()` partySize for level 1 and 2 |
| `src/travellingKingdomViewProvider.ts` | HTML: companion2 canvas, `data-apple-tree`, `data-willow-tree`, female sheet already present |
| `media/style.css` | `.companion` / grove NPC z-order + left defaults |
| `media/game.js` / `media/main.js` | Landmark grove, dual companions, recruit, camera |
| `docs/VERSION_HISTORY.md`, `README.md`, `package.json` | 0.0.42 ship notes |

---

### Task 1: Rename destination + host partySize on depart

**Files:**
- Modify: `static/world/destinations.json`
- Modify: `src/petState.ts` (`depart` method)
- Modify: `media/game.js` + `media/main.js` (`applyDepartLocal`)

**Interfaces:**
- Consumes: `PetState.level`, `PetState.partySize`
- Produces: `depart()` / `applyDepartLocal()` set `partySize` to ≥2 on level 1, ≥3 on level 2

- [ ] **Step 1: Rename level 2 in destinations.json**

Change the level 2 entry to:

```json
{ "level": 2, "name": "Apple Grove", "meters": 30 },
```

- [ ] **Step 2: Update host `depart()` party rules**

In `src/petState.ts`, replace the Soldier Camp-only bump with:

```typescript
const level = current.level;
let partySize = Math.max(1, current.partySize || 1);
if (level === 1) {
  partySize = Math.max(partySize, 2);
} else if (level === 2) {
  partySize = Math.max(partySize, 3);
}
```

Use `partySize` in the saved `next` state (keep level+1 / meters 0 / awaitingDeparture false).

- [ ] **Step 3: Mirror in webview `applyDepartLocal`**

In `media/game.js` (and `main.js`), replace the level===1-only branch:

```javascript
function applyDepartLocal(state) {
  let partySize = Math.max(1, state.partySize || 1);
  if (state.level === 1) {
    partySize = Math.max(partySize, 2);
  } else if (state.level === 2) {
    partySize = Math.max(partySize, 3);
  }
  return {
    ...state,
    level: state.level + 1,
    meters: 0,
    awaitingDeparture: false,
    partySize,
  };
}
```

- [ ] **Step 4: Verify compile + JSON name**

Run:

```powershell
cd c:\Users\syanavi\Documents\Tamagotchi_VS_Extension
npm run compile
Select-String -Path static\world\destinations.json -Pattern "Apple Grove"
```

Expected: `tsc` exit 0; one match for Apple Grove.

- [ ] **Step 5: Commit**

```powershell
git add static/world/destinations.json src/petState.ts media/game.js media/main.js
git commit -m "Bump party size on Apple Grove depart and rename destination."
```

---

### Task 2: Dual companion DOM + camera constants

**Files:**
- Modify: `src/travellingKingdomViewProvider.ts` (HTML inside `getHtml`)
- Modify: `media/style.css`
- Modify: `media/game.js` / `media/main.js` (constants + companion helpers)

**Interfaces:**
- Consumes: `#camp-npc` (slot 0), new `#companion-2` (slot 1)
- Produces: `positionCompanionsBehindPet()`, `drawCompanionWalkFrame(slot, frame)`, `COMPANION_DEFS[]`, camera constants for party of 3

- [ ] **Step 1: Add second companion canvas + tree data attrs**

In `travellingKingdomViewProvider.ts` `getHtml`, ensure female sheet URI exists (already does). Add:

```html
<canvas id="companion-2" class="camp-npc companion-slot" width="96" height="96" aria-hidden="true" hidden></canvas>
```

near `#camp-npc`, and on the root app element:

```html
data-apple-tree="${appleTreeUri}"
data-willow-tree="${willowTreeUri}"
```

Build URIs like other static files:

```typescript
const appleTreeUri = webview.asWebviewUri(
  vscode.Uri.joinPath(this.extensionUri, 'static', 'world', 'environment', 'apple_tree.png')
);
const willowTreeUri = webview.asWebviewUri(
  vscode.Uri.joinPath(this.extensionUri, 'static', 'world', 'environment', 'willow_tree.png')
);
```

- [ ] **Step 2: CSS for companions**

Keep `.camp-npc` positioning; ensure both slots share bottom-aligned absolute positioning under `.travel-world` (same as current camp-npc). No new card chrome.

- [ ] **Step 3: Camera + follow gap constants**

In `game.js` / `main.js`:

```javascript
const PET_BASE_LEFT = 28;
const CAMERA_PAD_PER_MEMBER = 36;
const COMPANION_FOLLOW_GAP = Math.round(SPRITE_DISPLAY * 0.45);
```

(Tune if clipped; goal: party of 3 left edge ≥ ~8px.)

- [ ] **Step 4: Companion defs + position/draw by slot**

Replace single-companion helpers with:

```javascript
const COMPANION_SLOTS = [
  {
    id: 'hooded',
    el: null, // #camp-npc
    minParty: 2,
    sheet: 'male',
    col: 3,
  },
  {
    id: 'forest',
    el: null, // #companion-2
    minParty: 3,
    sheet: 'female',
    col: 1,
  },
];

function companionCountFromState(state) {
  return Math.max(1, Math.min(3, Math.floor((state && state.partySize) || 1)));
}

function positionCompanionsBehindPet() {
  if (!petEl) {
    return;
  }
  const petLeft = petEl.offsetLeft;
  COMPANION_SLOTS.forEach((slot, index) => {
    const el = slot.el;
    if (!el) {
      return;
    }
    const active = (latestState && (latestState.partySize || 1) >= slot.minParty);
    if (!active) {
      el.hidden = true;
      return;
    }
    const left = Math.max(-20, petLeft - (index + 1) * COMPANION_FOLLOW_GAP);
    el.hidden = false;
    el.style.left = `${left}px`;
    el.style.bottom = '0';
  });
}
```

Wire `drawCompanionWalkFrame` to draw each active slot from the correct sheet image (`campNpcImage` for male, female sheet for forest). Walk rows = `WALK_ROW_START + frame`, mirrored facing right.

Update all call sites of `positionCompanionBehindPet` / `companionJoined` checks: treat `partySize >= 2` as “has companions”; hide camp idle NPC when that recruit has joined (`partySize >= 2` for hooded, grove NPC when `partySize >= 3`).

- [ ] **Step 5: Compile + smoke DOM ids**

```powershell
npm run compile
Select-String -Path src\travellingKingdomViewProvider.ts -Pattern "companion-2|data-apple-tree|data-willow-tree"
```

Expected: matches present; compile OK.

- [ ] **Step 6: Commit**

```powershell
git add src/travellingKingdomViewProvider.ts media/style.css media/game.js media/main.js
git commit -m "Add second companion slot and tighten party camera framing."
```

---

### Task 3: Apple Grove landmark (trees + idle woman)

**Files:**
- Modify: `media/game.js` / `media/main.js`
- Uses: `apple_tree.png`, `willow_tree.png`, female sheet

**Interfaces:**
- Consumes: `data-apple-tree`, `data-willow-tree`, female sheet image
- Produces: `GROVE_DEST_LEVEL = 2`, `shouldShowLandmark(state)`, grove paint + idle NPC at willow

- [ ] **Step 1: Landmark level helpers**

```javascript
const CAMP_DEST_LEVEL = 1;
const GROVE_DEST_LEVEL = 2;

function shouldShowCamp(state) {
  return Boolean(state && state.characterId && state.level === CAMP_DEST_LEVEL);
}
function shouldShowGrove(state) {
  return Boolean(state && state.characterId && state.level === GROVE_DEST_LEVEL);
}
function shouldShowLandmark(state) {
  return shouldShowCamp(state) || shouldShowGrove(state);
}
```

Refactor `syncCampWorldPosition` / arrival / clear to use `shouldShowLandmark` where appropriate, keeping camp pieces only for camp and grove pieces only for grove. Prefer renaming conceptually to `landmarkActive` / `landmarkWorldX` if low-risk; otherwise keep `campActive` / `campPotWorldX` as the shared lock vars used by both landmarks (document that in comments).

- [ ] **Step 2: Grove layout constants**

```javascript
const GROVE_APPLE_COUNT = 30;
const GROVE_WILLOW_OX = 0.2;
const GROVE_NPC_OX = 0.85; // beside willow, same meet math family as camp
// Precompute apple ox offsets once (deterministic jitter):
const GROVE_APPLE_OX = [/* 30 values roughly in [-5.5, 5.5], avoid stacking on willow */];
```

Generate offsets in code once at init with a fixed seeded shuffle or hand-tuned list so reloads look stable.

- [ ] **Step 3: Load images**

In prep (alongside camp NPC):

```javascript
async function prepareGroveArt() {
  const appleSrc = appEl.getAttribute('data-apple-tree');
  const willowSrc = appEl.getAttribute('data-willow-tree');
  const femaleSrc = appEl.getAttribute('data-female-sheet') || appEl.dataset.femaleSheet;
  if (appleSrc) groveAppleImg = await loadImage(appleSrc);
  if (willowSrc) groveWillowImg = await loadImage(willowSrc);
  if (femaleSrc) groveFemaleImage = await loadImage(femaleSrc);
}
```

- [ ] **Step 4: Paint grove + idle NPC**

- Draw apples then willow into the landmark decor canvas (or travel-world paint path used by `paintCamp`), bottom-aligned to ground like camp props.
- Idle NPC: reuse `#camp-npc` **only when grove is active and `partySize < 3`** OR dedicate grove idle to `#companion-2` until join — **prefer drawing idle on `#companion-2` during grove wait**, and hooded idle stays on `#camp-npc` during camp. After join, both become followers.
- Idle frames: female col `1`, rows `[1,2,3,4,5]`, FPS 5.

- [ ] **Step 5: Arrival / Continue visibility**

`onArrivedAtDestination` already locks world X + shows Continue. Ensure `syncCampWorldPosition` activates grove when `shouldShowGrove`. Depart click: if `latestState.level === 2` (awaiting), run grove recruit ceremony (Task 4); if level === 1, existing camp ceremony.

Manual check: set meters short, reach Apple Grove, confirm trees + idle woman + Continue.

- [ ] **Step 6: Commit**

```powershell
git add media/game.js media/main.js
git commit -m "Add Apple Grove landmark with apple trees, willow, and idle NPC."
```

---

### Task 4: Grove recruit cutscene → party of 3

**Files:**
- Modify: `media/game.js` / `media/main.js` (`startRecruitCeremony`, `finishRecruitCeremony`, depart handler)

**Interfaces:**
- Consumes: landmark type, `applyDepartLocal`, companion slots
- Produces: scroll-meet for forest woman; `partySize >= 3`; both companions walking

- [ ] **Step 1: Parameterize ceremony**

```javascript
function startRecruitCeremony(joinedState, options) {
  const joinPartySize = (options && options.joinPartySize) || 2;
  const recruitSlotIndex = joinPartySize - 2; // 0 camp, 1 grove
  // ... existing scroll-meet using getRecruitScreenLeft() for active landmark NPC
  // finishRecruitCeremony sets partySize = max(..., joinPartySize)
}
```

Depart button:

```javascript
const next = applyDepartLocal(latestState);
const joinPartySize = next.partySize;
latestState = { ...next, partySize: latestState.partySize || 1, awaitingDeparture: false };
startRecruitCeremony(next, { joinPartySize });
```

- [ ] **Step 2: Meet threshold for slot**

Meet when recruit screen left ≤ `petLeft - (recruitSlotIndex + 1) * COMPANION_FOLLOW_GAP` (behind existing trail). Skip approach if already past.

- [ ] **Step 3: Finish join**

On finish: set `latestState.partySize` to `joinPartySize`, `positionCompanionsBehindPet()`, draw walk frames for all active slots, `setCameraTargetForParty(joinPartySize)`, resume travel + `startCameraEase()` (no freeze-then-travel).

- [ ] **Step 4: Reload path**

`syncCompanionFromState`: if `partySize >= 2` show/draw slot 0; if `>= 3` show/draw slot 1; skip ceremony.

- [ ] **Step 5: Manual verification checklist**

1. Fresh save → Soldier Camp → Continue → party 2, hooded follows  
2. Reach Apple Grove → orchard visible, woman idles  
3. Continue → scroll meet → join → “3 persons”, two followers, camera fits  
4. Reload window → both companions still present  

- [ ] **Step 6: Commit**

```powershell
git add media/game.js media/main.js
git commit -m "Recruit forest woman at Apple Grove into a party of three."
```

---

### Task 5: Ship 0.0.42

**Files:**
- Modify: `package.json`, `README.md`, `docs/VERSION_HISTORY.md`

- [ ] **Step 1: Bump version to 0.0.42** in `package.json`

- [ ] **Step 2: Document**

VERSION_HISTORY: availability row + short section for Apple Grove / party of 3 / camera. README latest → **0.0.42**.

- [ ] **Step 3: Package**

```powershell
npm run package
```

Expected: `travelling-kingdom-0.0.42.vsix` created; no `tamagotchiViewProvider.js` in package.

- [ ] **Step 4: Commit (no VSIX if gitignored)**

```powershell
git add package.json README.md docs/VERSION_HISTORY.md media/game.js media/main.js src/
git commit -m "Ship 0.0.42 with Apple Grove and party of three."
```

---

## Spec coverage check

| Spec item | Task |
| --- | --- |
| Rename River Town → Apple Grove | 1 |
| Host/webview partySize 2 then 3 | 1, 4 |
| ~30 apples + willow | 3 |
| Female col 2 idle | 3 |
| Scroll-meet cutscene on Continue | 4 |
| Party of 3 trail + camera | 2, 4 |
| Camp unchanged | 3–4 (guards by level) |
| Ship docs | 5 |

## Placeholder scan

No TBD/TODO left; constants have starting values with tune note in Task 2.
