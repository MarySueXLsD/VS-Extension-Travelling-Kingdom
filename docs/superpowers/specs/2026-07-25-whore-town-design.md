# Whore Town destination + party of 4

**Date:** 2026-07-25  
**Status:** Approved (level 3 rename; party becomes 4; houses + characters1 extras + column-4 recruit)  
**Product:** Travelling Kingdom VS Code / Cursor extension

## Goal

Add destination **level 3 — Whore Town**: a street of all six environment houses with `house_4` centered, idle townsfolk from `characters1.png`, a dog (row 8 cols 6–10, camp dog size), and a female spritesheet **column 4** woman by `house_4`. On Continue, scroll-meet recruit cutscene; she joins so **partySize = 4**. Tighten trail/camera so four characters fit.

## Landmark

| Item | Spec |
| --- | --- |
| Name | Rename level 3 `Pine Hollow` → **Whore Town** (keep meters **500**) |
| Trigger | `level === 3` approach/arrival; linger via world lock after depart |
| Houses | `house_1.png` … `house_6.png` along ground band; **`house_4` at center** (ox ≈ 0); others spaced left/right |
| Recruit NPC | Female sheet **column 4** (0-based col `3`); idle rows 2–6 (`[1,2,3,4,5]`); by house_4 (`NPC_OX` ~0.85) |
| Continue | `depart()` sets `partySize ≥ 4` when departing level 3 |

## Extras (`characters1.png`, 10×15 @ 64px, 0-based)

| Id | Row | Cols | Notes |
| --- | --- | --- | --- |
| townA | 0 | 5–9 | |
| townB | 1 | 5–9 | |
| townC | 2 | 0–4 | |
| townD | 2 | 5–9 | |
| townE | 3 | 0–4 | |
| townF | 3 | 5–9 | |
| townG | 8 | 0–4 | |
| townH | 9 | 0–4 | |
| townI | 9 | 5–9 | |
| townDog | 7 | 5–9 | **size 96**, same scale as camp dog; mirror OK |

Place extras along the house frontage (distinct `ox` values). Reuse camp-actor canvas pattern / transparent chars1 sheet.

## Party / camera

| Slot | Who | Sheet | minParty |
| --- | --- | --- | --- |
| 0 | Hooded | male col 3 | 2 |
| 1 | Forest woman | female col 1 | 3 |
| 2 | Town woman | female col 3 | 4 |

- New canvas `#companion-3`
- `COMPANION_FOLLOW_GAP` ≈ **0.40 × SPRITE_DISPLAY**; raise `PET_BASE_LEFT` / `CAMERA_PAD_PER_MEMBER` so leftmost of 4 clears ~8px
- Prior companions keep walking during ceremony
- Z-order: nearer slots paint above farther ones

## Recruit

Same scroll-meet as camp/grove; `joinPartySize = 4`; meet at slot index 2. Reload with `partySize ≥ 4` skips ceremony.

## Host

`depart()`: level 1 → ≥2, level 2 → ≥3, level 3 → ≥4. Mirror in `applyDepartLocal`.

## Out of scope

Destinations 4+ recruits; Manage/Shop; renaming project folder.

## Success criteria

- Level 3 shows Whore Town (6 houses, extras, dog, idle woman by house_4)
- Continue → join → “4 persons”; three companions trail
- Camp + Grove still work; town scrolls away after leave
