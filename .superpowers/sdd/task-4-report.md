# Task 4 Report — Grove recruit cutscene → party of 3

## Implementation

- Parameterized `startRecruitCeremony` and `finishRecruitCeremony` with the joining party size.
- The recruit approach threshold now targets the recruit's trailing slot: camp slot 0 for party 2 and grove slot 1 for party 3.
- Routed ceremony positioning and frame drawing to the active camp or grove recruit.
- Completing the ceremony updates party size, renders all active companions, and eases the party camera while travel resumes.
- Preserved reload behavior through the existing party-size companion synchronization.
- Hid the grove companion canvas during landmark cleanup unless it is already an active party member.
- Kept `media/game.js` and `media/main.js` byte-identical.

## Verification

- `node --check media/game.js`
- `node --check media/main.js`
- `npm run compile`
- `git diff --check`
- Exact mirror comparison: `git diff --no-index --exit-code media/game.js media/main.js`

All listed automated checks completed with exit code 0. The VS Code webview-specific manual journey remains to be exercised:

1. Soldier Camp recruit results in party 2.
2. Apple Grove recruit results in party 3 with two followers and eased camera framing.
3. Reload with party 3 retains both followers without replaying a ceremony.

## Review fix — grove NPC facing during recruit ceremony

**Finding:** `drawGroveNpcFrame` ignored `npcFaceRight`. During the `npcFace` phase of the recruit ceremony, `npcFaceRight = true` is set but the grove idle draw did not mirror like `drawCampNpcFrame` does.

**Fix:** Updated `drawGroveNpcFrame` in both `media/game.js` and `media/main.js` to mirror the female sprite when `npcFaceRight` is true (translate + scale -1, same pattern as camp NPC draw).

**Verification:**

- `node --check media/game.js` — exit 0
- `node --check media/main.js` — exit 0
- `git diff --no-index --exit-code media/game.js media/main.js` — exit 0 (byte-identical)
