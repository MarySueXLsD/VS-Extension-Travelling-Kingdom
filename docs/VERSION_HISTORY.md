# Travelling Kingdom — version history

Side-by-side comparison of packaged builds of the **Travelling Kingdom** VS Code / Cursor sidebar extension (formerly developed under the Tamagotchi name). Current progress is stored in extension `globalState` (`travellingKingdom.petState`).

Packaged `.vsix` files live in the project root. **Latest: 0.0.46.**

This document was produced by unpacking each historical `tamagotchi-0.0.*.vsix`, comparing file inventories, and checking feature markers in `media/main.js` / `game.js`, `media/style.css`, and the compiled view provider. Newer packages are named `travelling-kingdom-<version>.vsix`.

---

## Availability

| Version | VSIX on disk | Approx. size | Files in package | Notes |
|---------|--------------|--------------|------------------|-------|
| 0.0.1 | No | — | — | Unrecovered (force-deleted when 0.0.2 was packaged) |
| 0.0.2 | `tamagotchi-0.0.2.vsix` | 543 KB | 19 | First recoverable build |
| 0.0.3 | `tamagotchi-0.0.3.vsix` | 592 KB | 20 | |
| 0.0.4 | `tamagotchi-0.0.4.vsix` | 599 KB | 21 | |
| 0.0.5 | `tamagotchi-0.0.5.vsix` | 599 KB | 21 | |
| 0.0.6 | `tamagotchi-0.0.6.vsix` | 652 KB | 22 | |
| 0.0.7 | `tamagotchi-0.0.7.vsix` | 652 KB | 22 | |
| 0.0.8 | `tamagotchi-0.0.8.vsix` | 654 KB | 23 | |
| 0.0.9 | `tamagotchi-0.0.9.vsix` | 654 KB | 23 | |
| 0.0.10 | `tamagotchi-0.0.10.vsix` | 657 KB | 24 | |
| 0.0.11 | `tamagotchi-0.0.11.vsix` | 657 KB | 24 | |
| 0.0.12 | `tamagotchi-0.0.12.vsix` | 657 KB | 24 | |
| 0.0.13 | `tamagotchi-0.0.13.vsix` | 699 KB | 35 | |
| 0.0.14 | `tamagotchi-0.0.14.vsix` | 700 KB | 35 | |
| 0.0.15 | `tamagotchi-0.0.15.vsix` | 701 KB | 35 | |
| 0.0.16 | `tamagotchi-0.0.16.vsix` | 701 KB | 35 | |
| 0.0.17 | `tamagotchi-0.0.17.vsix` | 702 KB | 35 | |
| 0.0.18 | `tamagotchi-0.0.18.vsix` | 702 KB | 35 | |
| 0.0.19 | `tamagotchi-0.0.19.vsix` | 702 KB | 35 | |
| 0.0.20 | `tamagotchi-0.0.20.vsix` | 703 KB | 35 | |
| 0.0.21 | `tamagotchi-0.0.21.vsix` | 703 KB | 37 | |
| 0.0.22 | `tamagotchi-0.0.22.vsix` | 703 KB | 37 | |
| 0.0.23 | `tamagotchi-0.0.23.vsix` | 703 KB | 37 | |
| 0.0.24 | `tamagotchi-0.0.24.vsix` | 893 KB | 54 | |
| 0.0.25 | `tamagotchi-0.0.25.vsix` | 895 KB | 54 | |
| 0.0.26 | `tamagotchi-0.0.26.vsix` | 899 KB | 54 | |
| 0.0.27 | `tamagotchi-0.0.27.vsix` | 900 KB | 54 | |
| 0.0.28 | `tamagotchi-0.0.28.vsix` | 901 KB | 54 | |
| 0.0.29 | `tamagotchi-0.0.29.vsix` | 901 KB | 54 | |
| 0.0.30 | `tamagotchi-0.0.30.vsix` | 968 KB | 55 | |
| 0.0.31 | `tamagotchi-0.0.31.vsix` | 968 KB | 55 | |
| 0.0.32 | `tamagotchi-0.0.32.vsix` | — | 55 | |
| 0.0.33 | `tamagotchi-0.0.33.vsix` | — | 55 | |
| 0.0.34–0.0.39 | `tamagotchi-0.0.*.vsix` | — | — | Pre-rebrand builds (camp, party, recruit cutscene) |
| 0.0.40 | `travelling-kingdom-0.0.40.vsix` | ~979 KB | 57 | Rebrand to Travelling Kingdom; publisher MarySue |
| 0.0.41 | `travelling-kingdom-0.0.41.vsix` | ~979 KB | 57 | Lead inset + party camera room |
| 0.0.42 | `travelling-kingdom-0.0.42.vsix` | 1.08 MB | 61 | Apple Grove landmark; party of 3; dual companion trail + camera |
| 0.0.43 | `travelling-kingdom-0.0.43.vsix` | 1.08 MB | 61 | Whore Town landmark; party of 4; third companion trail |
| 0.0.44 | `travelling-kingdom-0.0.44.vsix` | — | — | Legs 30/30/50; clear landmark after Continue so camp does not stick |
| 0.0.45 | `travelling-kingdom-0.0.45.vsix` | — | — | Interim packaging (pre-shuffle) |
| 0.0.46 | `travelling-kingdom-0.0.46.vsix` | 1.08 MB | 61 | Current: shuffle camp/grove/town; each early leg 50 m |

---

## 0.0.1 (missing)

Not available as a VSIX. From earlier debugging notes:

- Registered as an Activity Bar view with empty / incomplete activation events.
- Webview often stayed on “Loading” because the extension never activated.
- Superseded by **0.0.2** (Explorer placement + `onView:tamagotchi.petView`).

---

## Baseline — 0.0.2

Recoverable history starts here. Already included:

- Explorer webview (`tamagotchi.petView`), focus + reset commands
- Character select: Queen / King carousel, name input, royal 9-slice frame + Confirm button art
- In-game meters progression (not classic “XP only”), level-up thresholds, passive meter tick after a short grace period
- Scrolling grass ground, walk-in-place sprite animation, tap boost
- Parallax background layers 1–6 (canvas behind the character)
- Bottom nav: Home / Feed / Shop / Settings
- Assets: spritesheets, `64x64_royal.png`, `16x32_button.png`, `floor_tiles.png`, `background_layer_1.png`…`6.png`
- Webview script: **`media/main.js` only** (no `game.js`)
- Distance label format: `N / M m`

---

## Changelog by version

### 0.0.3 ← 0.0.2

- Adds **`static/world/background_layer_1b.png`** (cropped / alternate near-ground layer).
- Layer 1 wiring and art updated; `background_layer_1.png` also replaced (larger asset).
- View provider + `main.js` / CSS updated for the new layer path.

### 0.0.4 ← 0.0.3

- Adds **`media/game.js`** (copy of game logic); webview loads **`game.js`** instead of only `main.js`.
- Introduces **`PARALLAX_DISPLAY_SCALE = 2`**.
- Parallax uses **width-fit** scaling: `(width / srcW) * PARALLAX_DISPLAY_SCALE` (scenery grows when the sidebar widens).

### 0.0.5 ← 0.0.4

- Removes floating home chrome: **`home-status`**, **`pet-label`**, “Tap … to say hi” copy.
- Adds **`ui-frame` / `ui-frame-bg`** and **`ui-panel-mode`**: Feed / Shop / Settings hide the travel world and show a full royal panel frame.
- Stage / travel layout polish (including reduced top padding on the play stage).

### 0.0.6 ← 0.0.5

- Adds **`static/world/decor.png`**.
- Scrolling roadside decor (grass tufts, stones, bushes, rare large rock) that moves with the ground.

### 0.0.7 ← 0.0.6

- Small CSS-only bump for decor stacking:
  - Decor canvas pinned `position: absolute; bottom: 0`
  - **`z-index: 4`** so decor draws above the character (`z-index: 3`) and parallax (`0`)

### 0.0.8 ← 0.0.7

- Royal chrome behind stats and bottom bar (`stats-bg`, `bottom-bar-bg` canvases + 9-slice paint).
- Adds **`static/world/ui_bar.png`** and canvas XP / distance bar (`paintXpBar`).
- Flat green fill (`#3d9e3a`).
- **Incorrect geometry** assumed for the bar asset: source treated as **94×16**, trough approx **(15, 5, 64×6)** (asset is actually 192×48 with a smaller content region).

### 0.0.9 ← 0.0.8

- XP bar draws only the real graphic crop **(18, 12) → (173, 36)** → **156×24**, with trough fill mapped to **(48, 21)–(143, 26)**.
- Green fill drawn **inside** the trough (after the frame; trough pixels are opaque).
- Stage top padding removed so the stats royal frame sits flush with the parallax.

### 0.0.10 ← 0.0.9

Travel HUD + world layout polish:

- Adds **`static/world/destinations.json`** (Meadow Village → King’s Castle, etc.).
- Distance label:  
  `Traveled {meters} meters out of {needed} meters to get to {destination}`
- XP fill: vertical green **gradient** + animated angled white **shine**, clipped to the fill only.
- XP bar ~**50%** width, **left-aligned** (`max-width: 180px`).
- Character **pinned left** (`left: 12px`) instead of centered on resize.
- Parallax switches to **fixed** tile scale (no width-fit); still **`PARALLAX_DISPLAY_SCALE = 2`**.

### 0.0.11 ← 0.0.10

- Parallax display scale **`2 → 1`** (half the previous fixed size).

### 0.0.12 ← 0.0.11

- Parallax display scale **`1 → 0.65`**.

### 0.0.13 ← 0.0.12

- Adds floating **sky clouds** using **`Cloud1.png`–`Cloud10.png`**.
- Cloud count scales with sky height (~3 at ~280px sky; more when the sidebar is taller).
- Each cloud has random asset, Y (can overlap), scale, and left/right wind speed; wraps off-screen.
- Drawn on the parallax canvas after sky fill and before mountain layers.
- Packages **`docs/VERSION_HISTORY.md`** in the VSIX (via README link).

### 0.0.14 ← 0.0.13

- Clouds **~2× larger** (`CLOUD_DISPLAY_SCALE` `0.55` → `1.1`).
- Denser sky: baseline **~6–7** clouds (was ~3); max count raised to **48**.
- Wider vertical band (~2%–72% of sky height) so clouds sit on more varied Y positions.

### 0.0.15 ← 0.0.14

- Clouds are **bottom-anchored** to the horizon (`fromHorizon`): resizing the sidebar reveals/hides clouds instead of sliding their Y.
- Clouds sit **slightly below the sky line** (up to ~36px past the horizon) so they tuck into the mountain tops.
- Extra clouds for taller panels spawn higher in the stack; culling drops the highest first.

### 0.0.16 ← 0.0.15

- Cloud **density** scales with sky **width × height** (more clouds on large panels); max raised to **72**.
- Most clouds stay in a **low band** near the peaks (deeper horizon dip ~72px).
- **Z-order**: drawn after far parallax layers **6–5**, before nearer layers **4–1** (clouds weave through the scenery).

### 0.0.17 ← 0.0.16

- Narrow panels no longer go empty: **min 8** clouds; width is a modest bonus, not a multiplier that starves skinny sidebars.
- Off-screen clouds **re-enter immediately** (fixes multi-second blank sky after shrinking width).
- Spawns keep clouds overlapping the viewport; cull prefers on-screen clouds.

### 0.0.18 ← 0.0.17

- Raised cloud spawn floor: minimum height above horizon **~100px** (no more dipping into peaks); low band extended to ~230px.

### 0.0.19 ← 0.0.18

- **Hides all clouds** (`CLOUDS_ENABLED = false`). Cloud system and assets remain for a later re-enable.

### 0.0.20 ← 0.0.19

- Settings toggle **Enable clouds (beta)** (persisted as `cloudsEnabled`, **default off**).
- Turning it on loads/spawns clouds; turning it off clears them immediately.

### 0.0.21 ← 0.0.20

- Stats header layout: progress bar on the left; **`Traveled N/M meters`** and **`Destination: {village}`** stacked on the right.
- Top row: character name on the left, **`1 person`** on the right (replaces level badge in the header).
- Removes the **Mood** line from the stats header.

### 0.0.22 ← 0.0.21

- **Tile-based travel meters:** 1 scrolled ground tile = 1 meter (from ground scroll pixels, not 1 m/s time tick).
- Tap only boosts scroll speed (no flat +1 meter on pet click); Feed still grants **+40 m**.
- No offline / elapsed-time meter catch-up when reopening the view.

### 0.0.23 ← 0.0.22

- Settings: **Metric / Imperial** distance units (imperial shows tiles × 3 as feet; Feed label adapts).
- Settings: **Minimalistic UI** — hides royal 64×64 chrome on stats/nav/panels, uses a plain VS Code-style progress bar and theme colors; world art unchanged.

### 0.0.24 ← 0.0.23

- Settings / Feed / Shop panels scroll **inside** the middle area so top stats and bottom nav stay on screen.
- Leaving Settings no longer snaps back when a stale host reply still had `screen: settings`.
- Tile travel meters made reliable: removed 2s accrual grace, UI updates every scroll frame, host replies never roll progress backwards; imperial feet tick from fractional tile progress.
- Asset layout: UI chrome under `static/ui/`, world art under `static/world/{background,clouds,environment}/`; packaging includes the reorganized tree.

### 0.0.25 ← 0.0.24

- `destinations.json` expanded to **50** stops, each with a **`meters`** leg distance (100 → 24 000).
- Host and webview read those distances for level thresholds (formula kept as fallback).

### 0.0.26 ← 0.0.25

- **Soldier Camp** arrival stop on destination 1: camp composed from `decor.png`, placed by remaining meters, scrolls with the world until the pot meets the pet.
- Filling the leg clamps meters and sets **`awaitingDeparture`** (no auto level-up); **Continue** runs **`depart`** → level++, meters reset, resume travel.
- Hooded NPC idle at the pot (male sheet column 4, standing rows 2–6).
- Persists mid-camp arrival across reload.

### 0.0.27 ← 0.0.26

- Settings: **Minimalistic background** (`minimalBg`) — drops parallax scenery and clouds; fills with `--vscode-sideBar-background`. Ground strip and roadside decor stay.

### 0.0.28 ← 0.0.27

- Camp layering: barrels on ground (drawn in front of tent); player walks above camp; hooded NPC always visible at camp and faces left.
- Continue unstick: host `depart` accepts a full leg; client optimistic depart; merge no longer re-locks arrival mid-depart.

### 0.0.29 ← 0.0.28

- Continue no longer tears down the camp: landmark stays locked in world space and scrolls away with the same area (NPC included) instead of regenerating a new roadside.

### 0.0.30 ← 0.0.29

- Camp extras from `characters1.png`: idle dog beside the barrels (in front of tent), sitting knight + lute knight to the right of camp.

### 0.0.31 ← 0.0.30

- Fix camp extras invisible: transparent sheet is a canvas — use `.width`/`.height` (not `naturalWidth`) when slicing frames.

### 0.0.32 ← 0.0.31

- Larger camp dog; sitting knights placed beside the left and right tents.

### 0.0.33 ← 0.0.32 (current)

- Continue at Soldier Camp recruits the hooded male NPC: he walks behind the player; party size becomes **2 persons** (`partySize` persisted for a growing group).

---

## Feature evolution matrix

| Feature | 0.0.2 | 0.0.3 | 0.0.4 | 0.0.5 | 0.0.6 | 0.0.7 | 0.0.8 | 0.0.9 | 0.0.10 | 0.0.11 | 0.0.12 | 0.0.13 | 0.0.14 | 0.0.15 | 0.0.16 |
|---------|:-----:|:-----:|:-----:|:-----:|:-----:|:-----:|:-----:|:-----:|:------:|:------:|:------:|:------:|:------:|:------:|:------:|
| Parallax + ground + walk | Y | Y | Y | Y | Y | Y | Y | Y | Y | Y | Y | Y | Y | Y | Y |
| Character select + royal UI | Y | Y | Y | Y | Y | Y | Y | Y | Y | Y | Y | Y | Y | Y | Y |
| `background_layer_1b` | | Y | Y | Y | Y | Y | Y | Y | Y | Y | Y | Y | Y | Y | Y |
| Webview uses `game.js` | | | Y | Y | Y | Y | Y | Y | Y | Y | Y | Y | Y | Y | Y |
| Width-fit parallax | | | Y | Y | Y | Y | Y | Y | | | | | | | |
| Fixed parallax scale | | | | | | | | | Y | Y | Y | Y | Y | Y | Y |
| `PARALLAX_DISPLAY_SCALE` | — | — | 2 | 2 | 2 | 2 | 2 | 2 | 2 | **1** | **0.65** | **0.65** | **0.65** | **0.65** | **0.65** |
| `ui-panel-mode` panels | | | | Y | Y | Y | Y | Y | Y | Y | Y | Y | Y | Y | Y |
| Home status / pet label removed | | | | Y | Y | Y | Y | Y | Y | Y | Y | Y | Y | Y | Y |
| World decor (`decor.png`) | | | | | Y | Y | Y | Y | Y | Y | Y | Y | Y | Y | Y |
| Decor above character (z-index) | | | | | | Y | Y | Y | Y | Y | Y | Y | Y | Y | Y |
| `ui_bar` + chrome canvases | | | | | | | Y | Y | Y | Y | Y | Y | Y | Y | Y |
| XP crop 156×24 / trough fixed | | | | | | | | Y | Y | Y | Y | Y | Y | Y | Y |
| Destinations JSON + long label | | | | | | | | | Y | Y | Y | Y | Y | Y | Y |
| Gradient + shine fill | | | | | | | | | Y | Y | Y | Y | Y | Y | Y |
| Left-pinned character | | | | | | | | | Y | Y | Y | Y | Y | Y | Y |
| Floating sky clouds (`Cloud1`–`10`) | | | | | | | | | | | | Y | Y | Y | Y |
| Cloud display scale | — | — | — | — | — | — | — | — | — | — | — | 0.55 | **1.1** | **1.1** | **1.1** |
| Cloud baseline count | — | — | — | — | — | — | — | — | — | — | — | ~3 | **~6–7** | **~6–7** | **~8+** |
| Clouds bottom-anchored to horizon | | | | | | | | | | | | | | Y | Y |
| Clouds between parallax 6–5 / 4–1 | | | | | | | | | | | | | | | Y |
| Distance label form | short | short | short | short | short | short | short | short | sentence | sentence | sentence | sentence | sentence | sentence | sentence |

**Distance label forms**

- **short** (through 0.0.9): `67 / 100 m`
- **sentence** (0.0.10–0.0.20): `Traveled 67 meters out of 100 meters to get to Meadow Village`
- **compact + destination** (0.0.21+): `Traveled 67/100 meters` with a separate `Destination: Meadow Village` line to the right of the bar

---

## World asset introduction timeline

| Asset | First appears in |
|-------|------------------|
| `64x64_royal.png`, `16x32_button.png`, `floor_tiles.png`, `background_layer_1`…`6.png` | 0.0.2 |
| `background_layer_1b.png` | 0.0.3 |
| `decor.png` | 0.0.6 |
| `ui_bar.png` | 0.0.8 |
| `destinations.json` | 0.0.10 |
| `Cloud1.png`–`Cloud10.png` | 0.0.13 |
| `apple_tree.png`, `willow_tree.png` | 0.0.42 |

Character spritesheets (`female_spritesheet.png`, `male_spritesheet.png`) ship in every recoverable build.

---

## Adjacent package file diffs (summary)

| Transition | Added | Notable changed |
|------------|-------|-----------------|
| 0.0.2 → 0.0.3 | `background_layer_1b.png` | view provider, `main.js`, CSS, `background_layer_1.png` |
| 0.0.3 → 0.0.4 | `media/game.js` | view provider, `main.js` |
| 0.0.4 → 0.0.5 | — | view provider, `game.js` / `main.js`, CSS |
| 0.0.5 → 0.0.6 | `decor.png` | view provider, scripts, CSS |
| 0.0.6 → 0.0.7 | — | view provider (tiny), CSS |
| 0.0.7 → 0.0.8 | `ui_bar.png` | view provider, scripts, CSS |
| 0.0.8 → 0.0.9 | — | scripts, CSS |
| 0.0.9 → 0.0.10 | `destinations.json` | view provider, scripts, CSS |
| 0.0.10 → 0.0.11 | — | scripts (`PARALLAX_DISPLAY_SCALE`) |
| 0.0.11 → 0.0.12 | — | scripts (`PARALLAX_DISPLAY_SCALE`) |
| 0.0.12 → 0.0.13 | `Cloud1.png`–`Cloud10.png`, `docs/VERSION_HISTORY.md` | view provider, `game.js` / `main.js`, `.vscodeignore` |
| 0.0.13 → 0.0.14 | — | scripts (cloud size / density / Y band) |
| 0.0.14 → 0.0.15 | — | scripts (clouds bottom-anchored to horizon) |
| 0.0.15 → 0.0.16 | — | scripts (cloud density, low band, parallax z-order) |
| 0.0.16 → 0.0.17 | — | scripts (narrow-panel cloud starvation / wrap fix) |
| 0.0.17 → 0.0.18 | — | scripts (raised cloud spawn floor) |
| 0.0.18 → 0.0.19 | — | scripts (`CLOUDS_ENABLED = false`) |
| 0.0.19 → 0.0.20 | — | settings clouds toggle, `petState.cloudsEnabled` |
| 0.0.20 → 0.0.21 | — | stats header: compact traveled + destination, party size, mood removed |
| 0.0.21 → 0.0.22 | — | tile-based meters from ground scroll; remove 1 m/s tick; tap = speed only |
| 0.0.22 → 0.0.23 | — | metric/imperial units; minimalistic UI setting |
| 0.0.23 → 0.0.24 | — | panel scroll layout; nav screen sticky; reliable tile travel meters |
| 0.0.24 → 0.0.25 | — | 50 destinations with per-leg `meters`; thresholds from JSON |
| 0.0.25 → 0.0.26 | — | Soldier Camp arrival stop; `awaitingDeparture` + Continue / depart |
| 0.0.26 → 0.0.27 | — | Minimalistic background setting (flat sidebar fill, no parallax) |
| 0.0.27 → 0.0.28 | — | Camp layering + Continue/depart unstick |
| 0.0.28 → 0.0.29 | — | Camp lingers after Continue; same world scrolls away |
| 0.0.29 → 0.0.30 | `characters1.png` | Camp dog + two sitting knights |
| 0.0.30 → 0.0.40 | — | Party recruit, scroll-meet cutscene, live camera; rebrand to Travelling Kingdom (`travellingKingdom.*`, publisher MarySue) |
| 0.0.40 → 0.0.41 | — | Lead inset `PET_BASE_LEFT` 36 + party pad 44 so solo/party/cutscene fit farther from the left edge |
| 0.0.41 → 0.0.42 | `apple_tree.png`, `willow_tree.png` | Apple Grove destination; `#companion-2`; grove landmark + recruit cutscene; party of 3 trail/camera (`PET_BASE_LEFT` 28, `CAMERA_PAD_PER_MEMBER` 36) |
| 0.0.42 → 0.0.43 | `house_1.png`–`house_6.png` | Whore Town destination; `#companion-3`; six-house town landmark + recruit cutscene; party of 4 trail/camera (`PET_BASE_LEFT` 32, `CAMERA_PAD_PER_MEMBER` 32) |
| 0.0.43 → 0.0.46 | — | Early landmark order shuffled per save; levels 1–3 each **50** m; destination labels follow shuffled kind |

---

## 0.0.40 — Travelling Kingdom rebrand

- Extension id / package name: `travelling-kingdom` (publisher `MarySue`)
- View / commands: `travellingKingdom.petView`, `travellingKingdom.focus`, `travellingKingdom.reset`
- Storage key: `travellingKingdom.petState` (does not migrate old `tamagotchi.petState`)
- Scroll-based recruit meet + camera ease while traveling
- Docs: README, Marketplace publisher form values, GitHub remote

## 0.0.41 — Camera / lead framing

- `PET_BASE_LEFT` **12 → 36**; CSS `.pet` left matches
- `CAMERA_PAD_PER_MEMBER` **40 → 44** (party of 2 lead ~80px; companion stays on-screen in cutscene)

## 0.0.42 — Apple Grove and party of three

- Destination level 2 renamed **River Town → Apple Grove** (`destinations.json`); depart at level 2 bumps `partySize` to **3**
- **Apple Grove landmark** at level 2: ~30 apple trees + willow (`apple_tree.png`, `willow_tree.png`); forest woman idles on `#companion-2` (female sheet col 2, standing rows 2–6)
- **Second companion slot** (`#companion-2`); hooded camp recruit stays slot 0, grove recruit slot 1
- **Scroll-meet recruit cutscene** parameterized by `joinPartySize` (camp → 2, grove → 3); grove NPC mirrors when facing the pet
- **Party-of-3 trail + camera**: `PET_BASE_LEFT` **28**, `CAMERA_PAD_PER_MEMBER` **36**; lead eases right as companions join; both followers walk behind the hero after grove Continue

## 0.0.43 — Whore Town and party of four

- Destination level 3 is **Whore Town**; departing it raises `partySize` to **4**.
- **Whore Town landmark**: six environment houses, nine `characters1.png` townsfolk, and a dog; a town woman idles by the centered `house_4`.
- **Third companion slot** (`#companion-3`) recruits the town woman (female sheet column 4) through the shared scroll-meet ceremony.
- **Party-of-4 trail + camera**: lead inset is **32px**, camera pad is **32px per companion**, and follow gap is **40%** of sprite size.

## 0.0.44 — Landmark clear + short early legs

- Destination meters: Soldier Camp **30**, Apple Grove **30**, Whore Town **50**.
- After Continue / recruit finish, the previous landmark is cleared so Soldier Camp (and its hooded idle) no longer stays locked under the party for the whole next leg; the next landmark spawns ahead by remaining meters.

## 0.0.46 — Randomized early recruits at 50 m

- First three destination legs are each **50** meters (`destinations.json` levels 1–3).
- Per new run / character choose, `earlyLandmarkOrder` shuffles **Soldier Camp**, **Apple Grove**, and **Whore Town** so which landmark appears at levels 1–3 varies; party-size bumps still follow depart level (1→2, 2→3, 3→4).
- Destination labels and landmark spawn use the shuffled kind, not fixed level→name mapping.

---

## How to compare yourself

1. Historical VSIX archives in the project root: `tamagotchi-0.0.*.vsix` (zip format). Newer builds: `travelling-kingdom-*.vsix`.
2. Optional unpacked copies from the last scan: [`.tools/vsix-compare/<version>/extension/`](../.tools/vsix-compare/).
3. Rebuild latest: `npm run package` → `travelling-kingdom-<version>.vsix` matching `package.json`.
