# Whore Town + Party of 4 Implementation Plan

> **For agentic workers:** Execute task-by-task. Checkboxes track progress.

**Goal:** Add Whore Town (level 3) with houses, characters1 extras, column-4 recruit, party of 4, ship 0.0.43.

**Architecture:** Extend landmarkKind (`town`) + COMPANION_SLOTS + shared recruit ceremony (same as grove).

**Tech Stack:** TypeScript host, webview game.js/main.js, CSS, static PNGs.

## Global Constraints

- Level 3 name **Whore Town**, meters **500**
- partySize ≥ 4 after town recruit; female col 4 (0-based 3)
- All houses 1–6; house_4 center; extras + dog size 96 (chars1 row 7 cols 5–9)
- Mirror game.js ↔ main.js; bump **0.0.43**

---

### Task 1: Rename + host partySize 4

- destinations.json level 3 → Whore Town, meters 500
- petState `depart`: level 3 → max(party, 4)
- applyDepartLocal same in game.js + main.js
- companionCountFromState max 4
- Compile; commit

### Task 2: DOM + camera + companion slot 3

- HTML: `#companion-3`, data-house-1…6 URIs
- CSS: companion-3 z below companion-2; .pet left sync
- PET_BASE_LEFT ~32, CAMERA_PAD ~32, FOLLOW_GAP ~0.40×96
- COMPANION_SLOTS entry town woman female col 3, minParty 4
- Commit

### Task 3: Town landmark paint + idle NPC + extras

- TOWN_DEST_LEVEL=3, paint houses, TOWN_EXTRAS canvases, idle on companion-3
- Wire landmarkKind town in sync/arrival/clear/anim
- Commit

### Task 4: Town recruit ceremony

- Parameterize joinPartySize 4; getRecruitScreenLeft for town; face mirror
- Depart routes by level; finish party 4
- Commit

### Task 5: Ship 0.0.43

- package.json, README, VERSION_HISTORY; npm run package; commit (no vsix)
