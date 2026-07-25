# Apple Grove destination + party of 3

**Date:** 2026-07-25  
**Status:** Approved (Apple Grove name; party becomes 3; tighter trail + camera further right)  
**Product:** Travelling Kingdom VS Code / Cursor extension

## Goal

Add destination **level 2 — Apple Grove**: an orchard landmark with many apple trees, one willow tree, and an idle forest woman (female spritesheet column 2). On Continue, run the same scroll-meet recruit cutscene as Soldier Camp; she joins so **partySize = 3**. Adjust camera and follow gaps so lead + two companions fit on screen.

## Background

Soldier Camp (level 1) already:

- Places a world-locked landmark from `decor.png` pieces
- Idles a hooded NPC (male sheet col 4 / 0-based 3)
- Stops travel at full meters (`awaitingDeparture`) until Continue
- Runs scroll-based meet → face → join; sets `partySize ≥ 2`
- Keeps one companion canvas walking behind the pet

Today only one companion slot exists (`companionJoined` + `campNpcEl`). Party of 3 needs two follower sprites and camera math for three bodies.

## Landmark — Apple Grove (level 2)

| Item | Spec |
| --- | --- |
| Name | Rename destinations.json level 2 from `River Town` → **Apple Grove** |
| Trigger | Same as camp: show while `level === 2` on approach/arrival; after depart, linger via world lock until off-screen |
| Anchor | World X locked under pet at arrival (same pattern as `campPotWorldX`) |
| Trees | Scatter **~28–32** `apple_tree.png` around the anchor on the ground band (jittered horizontal offsets, shared ground baseline; draw via decor/landmark paint, not roadside decor spawn) |
| Willow | One `willow_tree.png` near center (slightly behind / beside NPC) |
| NPC | Female spritesheet **column 2** (0-based `col = 1`); idle standing rows **2–6** (0-based rows `[1,2,3,4,5]`), FPS ~5; faces left until cutscene face beat |
| Continue | Existing depart button; host `depart()` advances level and sets `partySize ≥ 3` when departing level 2 |

Camp (level 1) behavior unchanged. Only one landmark active at a time.

## Recruit cutscene

Reuse the scroll-meet ceremony used at Soldier Camp:

1. Continue → keep grove world-locked; resume scroll + walk
2. Meet when the recruit reaches the **new** follow slot (behind the existing trail)
3. Brief face ceremony (scroll pauses only for face beats)
4. Join → `partySize = 3`; resume travel; ease camera in parallel

If already past the meet threshold at Continue, skip straight to face phases (same as camp).

Reload with `partySize >= 3`: skip ceremony; show both companions already walking.

## Party of 3 — companions + camera

**Companions (ordered trail, nearest lead first behind):**

| Slot | Who | Sheet | When present |
| --- | --- | --- | --- |
| 0 | Hooded traveler | male col 3 (0-based) | `partySize >= 2` |
| 1 | Forest woman | female col 1 (0-based) | `partySize >= 3` |

**Layout (tune in implementation, targets):**

- Tighten `COMPANION_FOLLOW_GAP` to about **0.45 × SPRITE_DISPLAY** (~43px) so bodies sit closer
- Increase lead inset: `PET_BASE_LEFT` a bit higher than today’s solo value; `CAMERA_PAD_PER_MEMBER` such that for `n = 3` the leftmost companion clears ~8–12px from the left edge
- Formula stays: `petLeadLeftTarget = PET_BASE_LEFT + max(0, n - 1) * CAMERA_PAD_PER_MEMBER`
- Slot `i` screen X ≈ `petLeft - (i + 1) * COMPANION_FOLLOW_GAP`

**UI:** existing `formatPartySize` → “3 persons”.

## Host / state

- `PetState.partySize` already persisted
- `depart()`:
  - level 1 → `partySize = max(current, 2)`
  - level 2 → `partySize = max(current, 3)`
  - else leave as-is
- Webview `applyDepartLocal` / merge rules must mirror host so ceremony and reload stay in sync
- No migration of old saves beyond existing `partySize` field

## Implementation shape (recommended)

Generalize lightly rather than copy-paste a second camp:

1. **Landmark config** — camp vs grove (pieces/images, NPC sheet+col, dest level, join party size)
2. **Companion list** — two DOM canvases (or one shared stack); draw/position by slot from `partySize`
3. **Shared** `startRecruitCeremony` parameterized by which NPC joins next
4. Wire apple/willow image URIs in the webview HTML (`data-*`) like other static assets

Files likely touched: `media/game.js` (+ mirror `main.js`), `media/style.css`, `src/travellingKingdomViewProvider.ts`, `src/petState.ts`, `static/world/destinations.json`, docs/version bump when shipping.

## Out of scope

- Destinations 3+ recruits
- New settings / Manage / Shop
- Renaming the on-disk project folder
- Changing Soldier Camp art or dog/knights

## Success criteria

- Approaching/arriving at level 2 shows Apple Grove (apple orchard + willow + idle woman)
- Continue runs cutscene; woman joins; UI shows 3 persons; both companions walk behind lead
- All three characters fit without clipping the left edge after camera ease
- Camp recruit and linger still work; grove scrolls away after leave
- Reload with `partySize === 3` restores both companions without replaying cutscenes

## Spec self-review

- No TBDs left on name (Apple Grove), party size (3), or camera intent (further right + tighter gaps)
- Concrete asset paths and sheet indices specified
- Explicit non-goals listed
- Does not require changing destinations 3–50 beyond the level-2 rename
