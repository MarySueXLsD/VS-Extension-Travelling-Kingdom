# Manage Squad + Simple Join Implementation Plan

> **For agentic workers:** Execute inline in this session. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Enable Manage roster with drag-reorder of left-trail recruits (persisted `leftTrailOrder`), and replace recruit cutscenes with an immediate walk-forward formation ease.

**Architecture:** Host owns `leftTrailOrder` and `reorderParty`. Webview builds the Manage list (Guard → Hero → left trail), applies DnD optimistically, and drives Home formation from that array. Continue skips face/approach ceremony and calls finish + formation ease while traveling.

**Tech Stack:** VS Code webview (`media/game.js` + `style.css`), TypeScript host (`petState.ts`, `travellingKingdomViewProvider.ts`).

**Global Constraints:**
- Mirror `media/game.js` → `media/main.js` before packaging
- Keep screen id `feed` for Manage
- Guard stays right-side locked; never in `leftTrailOrder`
- Ship as next version (0.0.57+)

---

### Task 1: Host `leftTrailOrder` + `reorderParty`

**Files:**
- Modify: `src/petState.ts`
- Modify: `src/travellingKingdomViewProvider.ts` (message type + handler)

- [ ] Add `LeftTrailKind` and `leftTrailOrder` on `PetState`
- [ ] Add `normalizeLeftTrailOrder`, `defaultLeftTrailOrderFromParty`, update `depart()` to unshift new left kind
- [ ] Add `reorderParty(order)` 
- [ ] Wire `reorderParty` action in view provider

### Task 2: Webview formation reads `leftTrailOrder`

**Files:**
- Modify: `media/game.js` (`recruitedLandmarkKinds`, merge/depart local)

- [ ] Prefer `state.leftTrailOrder` for left slots; fall back to chrono reverse
- [ ] `applyDepartLocal` / merge keep and unshift `leftTrailOrder`

### Task 3: Simple join (no cutscene)

**Files:**
- Modify: `media/game.js` (`startRecruitCeremony`)

- [ ] On Continue: no approach/face phases; finish join + resume travel + formation/camera ease

### Task 4: Manage UI

**Files:**
- Modify: `src/travellingKingdomViewProvider.ts` (nav + panel HTML)
- Modify: `media/style.css`
- Modify: `media/game.js` (enable screen, roster render, DnD, portraits)

- [ ] Enable Manage nav; replace Feed panel with `#squad-list`
- [ ] Build rows Guard→Hero→trail; lock Guard/Hero; DnD trail; portraits row 0
- [ ] Optimistic reorder + postMessage `reorderParty`

### Task 5: Ship

- [ ] Mirror `main.js`, bump 0.0.57, VERSION_HISTORY/README, package + install
