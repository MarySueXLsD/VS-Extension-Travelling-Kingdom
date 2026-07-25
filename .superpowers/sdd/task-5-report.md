# Task 5 Report — Ship 0.0.42

## Status

**DONE**

## Changes

- `package.json`: version **0.0.41 → 0.0.42**
- `README.md`: latest package line → **0.0.42**
- `docs/VERSION_HISTORY.md`: availability row for 0.0.42, world-asset timeline (`apple_tree.png`, `willow_tree.png`), adjacent diff 0.0.41→0.0.42, section **Apple Grove and party of three** (landmark, dual companion slot, scroll-meet cutscene, party-of-3 trail/camera)

## Package

- `npm run compile` (via prepublish): exit 0
- `npm run package`: exit 0
- Output: `travelling-kingdom-0.0.42.vsix` (~1.12 MB, 79 files)
- No `tamagotchiViewProvider.js` in package (uses `travellingKingdomViewProvider.js`)
- vsce warning: no LICENSE file (pre-existing)

## Commit

- `Ship 0.0.42 with Apple Grove and party of three.` — docs/version bump only (feature commits already on main: `8a2541f`..`ae5224d`)

## Spec coverage

| Spec item | Covered by |
| --- | --- |
| Rename River Town → Apple Grove | Tasks 1, 5 docs |
| Host/webview partySize 2 then 3 | Tasks 1, 4 |
| ~30 apples + willow | Task 3 |
| Female col 2 idle | Task 3 |
| Scroll-meet cutscene on Continue | Task 4 |
| Party of 3 trail + camera | Tasks 2, 4 |
| Camp unchanged | Tasks 3–4 |
| Ship docs | Task 5 |

## Concerns

- VSIX now bundles `.superpowers/sdd/` (16 files) because it is not in `.vscodeignore`; file count 57→79 vs 0.0.41. Consider excluding `.superpowers/**` in a follow-up.
- Full manual webview journey (camp → grove → party 3 + reload) still not exercised in automation (noted in Task 4 report).

## Follow-up — exclude superpowers from VSIX

- `.vscodeignore`: added `.superpowers/**` and `docs/superpowers/**`
- Re-ran `npm run package`: exit 0
- Output: `travelling-kingdom-0.0.42.vsix` (**1.08 MB**, **61 files**; was ~1.12 MB / 79 files)
- vsce file tree: **no `.superpowers` entries** (confirmed in package listing)
- `docs/VERSION_HISTORY.md`: 0.0.42 availability row updated with actual size/file count
- Commit: `Exclude superpowers artifacts from VSIX and refresh 0.0.42 package.`

## Verification

| Check | Result |
| --- | --- |
| `npm run package` | Exit 0 |
| `travelling-kingdom-0.0.42.vsix` on disk | Yes (~1.12 MB) |
| VSIX not committed | Yes (gitignored) |
| Version in package.json | 0.0.42 |
