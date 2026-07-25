# Task 3 Report — Apple Grove landmark

## Implemented
- Added deterministic 30-tree Apple Grove art, a willow, and level-aware landmark selection.
- Loaded grove assets and animated the forest woman on `#companion-2` using female column 1 and rows 1–5 while waiting at level 2 with fewer than three party members.
- Preserved Soldier Camp-only pieces and idle actors, kept `game.js` and `main.js` identical, and aligned `.pet` with `PET_BASE_LEFT` at 28px.

## Verification
- `npm run compile` completed successfully.
- `node --check media/game.js` and `node --check media/main.js` completed successfully.
- `git diff --check` completed successfully; the two game scripts were compared with no differences.
- IDE lint diagnostics reported no errors for the edited files.

## Scope
- The Apple Grove arrival and Continue affordance display correctly through the shared landmark state. Grove recruitment ceremony parameterization remains intentionally deferred to Task 4.
