# Manage squad roster

**Date:** 2026-07-25  
**Status:** Approved  
**Product:** Travelling Kingdom VS Code / Cursor extension

## Goal

Enable the **Manage** bottom-nav button and turn its panel into a scrollable squad roster. Rows show portrait, name, age, and a short description. Players can drag-reorder unlocked left-trail recruits; order maps directly to Home walking formation (right → left). Guard and hero stay locked.

## Background

- Manage nav (`data-screen="feed"`) is currently disabled; `setScreen` redirects `feed` / `shop` to `home`.
- Panel `#panel-feed` is titled Manage but only exposes Feed (+40 m). Feed is removed from this panel (not relocated).
- Party formation today: guard (`tent`) on the **right** of the hero; other recruits on the **left**, newest closest, derived from `partySize` + `earlyLandmarkOrder` via `recruitedLandmarkKinds` — not user-editable.
- Companion looks are keyed by landmark kind (`COMPANION_BY_KIND`).

## Decisions (from brainstorming)

| Topic | Choice |
| --- | --- |
| Persistence | Host-persisted `leftTrailOrder: landmarkKind[]` |
| List order | Top → bottom = world **right → left**: Guard → Hero → left trail (closest behind hero first) |
| Locked rows | Guard + Hero |
| Drag effect | Immediately updates Home walking order |
| Feed button | Removed from Manage (option A) |

## Navigation & panel

1. Enable Manage nav: remove `disabled`, `nav-btn-disabled`, `aria-disabled`, and “Coming soon” title.
2. Allow `setScreen('feed')` (stop forcing it to `home`). Shop stays stubbed/disabled.
3. Replace panel body with:
   - Heading: **Manage** (or **Squad**)
   - Scrollable container `#squad-list` (`overflow-y: auto`)
   - No Feed button / feed status
4. Keep screen id `feed` for host `ScreenId` compatibility unless a rename is trivial and safe; prefer keeping `feed` as the Manage screen id for this iteration.

## Roster list order

Top → bottom:

1. **Guard** — only if `tent` is recruited (`partySize` / recruited set includes tent). **Locked.**
2. **Hero** — always when a character is selected. **Locked.**
3. **Left-trail members** — one row per kind in `leftTrailOrder[0]…[n-1]`, where index `0` is **closest behind the hero** (first left slot). **Draggable among themselves only.**

If guard is not recruited, list starts with Hero, then left trail.

### Drag constraints

- Only left-trail rows are `draggable`.
- Drops that would place a recruit above Guard, between Guard and Hero, or onto locked rows are rejected (row returns to prior index).
- Reorder permutes `leftTrailOrder` only; membership cannot change via Manage.

## Row UI

Each row is a button-like block (or `<button>` / role=button card):

| Element | Spec |
| --- | --- |
| Portrait | Small canvas left; blit **row 0** of male/female spritesheet at the character’s column; pixelated |
| Name | Hero: `{title} {state.name}`; companions: fixed display name from flavor catalog |
| Age | Static flavor integer from catalog |
| Description | One short sentence from catalog |
| Locked | `draggable=false`; no drag handle; optional muted “Locked” label |
| Unlocked | Drag handle or whole-row drag; HTML5 DnD |

Match existing royal / panel chrome where practical; keep rows compact so 8 members scroll comfortably in the sidebar.

## Flavor catalog

Webview constants keyed by hero `characterId` and companion landmark kind:

```ts
{ name: string; age: number; description: string; sheet: 'male' | 'female'; col: number }
```

- Hero portrait uses existing `CHARACTERS[].col` / sheet; name uses live `state.name`.
- Companion cols match `COMPANION_BY_KIND` (camp, grove, town, tent, stone, market, cloister).
- Ages/descriptions are static fiction (not derived from playtime).

Suggested companion names (can be tweaked in implementation):

| Kind | Name (example) |
| --- | --- |
| tent | Halberd Guard |
| camp | Hooded Traveler |
| grove | Grove Walker |
| town | Town Companion |
| stone | Wayside Traveler |
| market | Market Bishop |
| cloister | Cloister Sister |

## Persistence — `leftTrailOrder`

### State shape

Add to `PetState`:

```ts
/** Left-trail recruit kinds, index 0 = closest behind the hero. */
leftTrailOrder: LeftTrailKind[];
```

Where `LeftTrailKind` = `'camp' | 'grove' | 'town' | 'stone' | 'market' | 'cloister'` (never `tent`).

### Defaults & migration

- Missing / invalid array → derive from current recruited left kinds using today’s chronology rule (newest closest = front of array), then persist on next write.
- On left recruit join (depart that adds a left companion): **unshift** the new kind if not already present (newest closest).
- Guard (`tent`) is never stored in `leftTrailOrder`.
- When validating: every entry must be a recruited left kind; set equality with recruited left set; drop unknowns; append any missing recruited left kinds at the end (furthest).

### Host action

```ts
{ type: 'action', action: 'reorderParty', leftTrailOrder: string[] }
```

Host validates, normalizes, saves, pushes state. Webview applies optimistic reorder, then reconciles on state message.

## Home formation

Update `recruitedLandmarkKinds` / left-slot builders:

- Right side: `tent` if recruited (unchanged).
- Left side: follow `leftTrailOrder` (index 0 = closest = smallest follow gap behind pet).
- Camera pad still based on left-trail count + hero.

After reorder (optimistic or confirmed): `setCameraTargetForParty`, `positionCompanionsBehindPet` or short formation ease so Home matches Manage immediately.

## Portraits

- Reuse loaded male/female sheet images already used for walk/idle.
- Draw cell `(col, row=0)` scaled into a ~40–48px canvas (or CSS size with DPR).
- Redraw when opening Manage / when roster rebuilds.

## Out of scope

- Shop enablement
- Relocating Feed elsewhere
- Dismissing / firing companions
- Editing names, ages, or descriptions in UI
- Changing guard’s right-side assignment
- Renaming `ScreenId` from `feed` to `manage` (optional follow-up)

## Files (expected)

| File | Change |
| --- | --- |
| `src/travellingKingdomViewProvider.ts` | Enable Manage nav; roster HTML shell in panel |
| `src/petState.ts` | `leftTrailOrder`, normalize, `reorderParty`, join unshift |
| `media/game.js` / `media/main.js` | Enable screen; build roster; DnD; portraits; formation from order |
| `media/style.css` | Roster list / row / scroll / locked styles |
| `docs/VERSION_HISTORY.md`, `package.json`, `README.md` | Version bump when shipping |

## Acceptance

1. Manage nav opens a scrollable squad list (Feed gone).
2. Order is Guard (if any) → Hero → left trail; Guard + Hero not draggable.
3. Dragging left-trail rows updates Home walking order and persists across reload.
4. Each row shows portrait (row 0), name, age, description.
5. Solo hero shows a single locked hero row.
