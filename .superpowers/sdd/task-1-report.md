# Task 1 Report: Rename destination + host partySize on depart

**Status:** DONE_WITH_CONCERNS  
**Date:** 2026-07-25  
**Commit:** `b88275b` — Bump party size on Apple Grove depart and rename destination.

---

## Summary

Task 1 renames destination level 2 from River Town to **Apple Grove** and extends `depart()` / `applyDepartLocal()` so party size bumps to ≥2 on level 1 depart and ≥3 on level 2 depart, in both the TypeScript host and webview JS (game.js mirrored to main.js).

---

## Changes Made

### `static/world/destinations.json`

- Level 2 entry renamed: `"River Town"` → `"Apple Grove"` (meters remain 30).

### `src/petState.ts` — `depart()`

Replaced Soldier Camp-only bump with level-aware rules:

```typescript
const level = current.level;
let partySize = Math.max(1, current.partySize || 1);
if (level === 1) {
  partySize = Math.max(partySize, 2);
} else if (level === 2) {
  partySize = Math.max(partySize, 3);
}
```

Saved in `next` state alongside level+1, meters 0, awaitingDeparture false.

### `media/game.js` + `media/main.js` — `applyDepartLocal()`

Mirrored the same level 1 / level 2 partySize logic for optimistic webview depart.

---

## Verification

| Check | Result |
| --- | --- |
| `npm run compile` | Exit 0 (`tsc -p ./`) |
| `Select-String … "Apple Grove"` | 1 match in destinations.json |
| game.js ↔ main.js parity | `applyDepartLocal` identical in both files |

---

## Self-Review

**Correctness**

- Host and webview use matching partySize rules at depart time.
- Level 1 → ≥2 preserves existing Soldier Camp behavior.
- Level 2 → ≥3 is new and ready for Task 4 grove recruit ceremony.
- Destination rename is data-only; UI reads names from destinations.json at runtime.

**Scope**

- No grove art, second companion DOM, or cutscene changes (deferred to Tasks 2–4).
- `CAMP_DEST_LEVEL` constant unchanged; still used elsewhere for camp landmark logic.

**Concern**

- The committed `destinations.json` diff also includes pre-existing working-tree changes that normalized meters for levels 1–8 to 30 (HEAD had 100/300/500/…). Task 1 spec only required the level 2 rename; those meter edits were already unstaged before this task and rode along in the same commit. Functionally harmless for dev/testing but slightly broader than Task 1's stated scope.

**Not tested manually**

- Full in-extension playthrough (depart at Soldier Camp and Apple Grove) — compile-only verification this session.

---

## Files Touched

- `static/world/destinations.json`
- `src/petState.ts`
- `media/game.js`
- `media/main.js`

---

## Next Steps (out of scope for Task 1)

- Task 2: Dual companion DOM + camera constants
- Task 3: Apple Grove landmark art
- Task 4: Grove recruit cutscene → party of 3 visible in UI

---

## Review Fix: Restore destination meters (2026-07-25)

**Finding:** Task 1 commit `b88275b` unintentionally normalized meters for levels 1–8 to 30. Only level 2 should have changed (rename to Apple Grove + plan example meters 30).

**Fix:** Restored pre-task meter values from commit `74c7f2a` for levels 1 and 3–8; kept level 2 as Apple Grove at 30 m. Levels 9+ unchanged.

| Level | Name | Meters (after fix) |
| --- | --- | --- |
| 1 | Soldier Camp | 100 |
| 2 | Apple Grove | 30 |
| 3 | Pine Hollow | 500 |
| 4 | Copper Crossroads | 1000 |
| 5 | Mist Harbor | 1500 |
| 6 | Stonewatch Keep | 2000 |
| 7 | Sunken Market | 2500 |
| 8 | Highridge | 3000 |

**Verification**

- `destinations.json` levels 1–8 meters match table above; level 2 name remains `"Apple Grove"`.
- Levels 9–50 unchanged (Azure Spire 3500 … Crown Summit 24000).
