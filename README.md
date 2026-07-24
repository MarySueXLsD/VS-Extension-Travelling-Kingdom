# Travelling Kingdom

A VS Code / Cursor **Explorer sidebar** travel companion. Walk the road, visit destinations, recruit companions, and care for your character. Progress is stored in extension `globalState`.

**Repository:** [MarySueXLsD/vs_extension_travelling_kingdom](https://github.com/MarySueXLsD/vs_extension_travelling_kingdom)

Version-by-version notes for packaged builds: **[docs/VERSION_HISTORY.md](docs/VERSION_HISTORY.md)**. Latest package: **0.0.40**.

Marketplace publisher signup values: **[docs/MARKETPLACE_PUBLISHER.md](docs/MARKETPLACE_PUBLISHER.md)**.

## Features

- Character select and persistent name / level / travel meters
- Scrolling world (ground, decor, optional parallax + clouds)
- Destination landmarks (e.g. Soldier Camp) with Continue / depart
- Party recruitment cutscene and companion follow
- Settings: distance units, minimal UI / background, clouds

## Run (F5)

1. Open this folder in VS Code or Cursor.
2. Run `npm install`.
3. Press **F5** (or Run and Debug → **Run Extension**).
4. In the Extension Development Host, open **Explorer** — the **Travelling Kingdom** section is in the left sidebar.
5. Tap the character or use the nav actions. Reload the window — meters and level should remain.

## Install from VSIX

1. Run `npm run package` (builds `travelling-kingdom-<version>.vsix`).
2. In Cursor/VS Code: **Extensions** → `...` → **Install from VSIX…** → pick the new `.vsix`.
3. If an older Tamagotchi (or earlier Travelling Kingdom) build is installed, uninstall it first, then reload the window.
4. Open **Explorer** and expand the **Travelling Kingdom** section.

## Scripts

- `npm run compile` — compile TypeScript to `dist/`
- `npm run watch` — recompile on change
- `npm run package` — compile and build a `.vsix`

## Assets

```
static/
  characters/          female_spritesheet.png, male_spritesheet.png, characters1.png
  ui/                  64x64_royal.png, 16x32_button.png, ui_bar.png
  world/
    destinations.json
    background/        background_layer_1.png … 6.png (+ 1b)
    clouds/            Cloud1.png … Cloud10.png
    environment/       floor_tiles.png, decor.png, houses, trees, …
```

Wired from [`src/travellingKingdomViewProvider.ts`](src/travellingKingdomViewProvider.ts) into the webview (`data-*` URIs). Webview scripts load those URIs; they do not hardcode disk paths.

## Publisher

- **Display name:** Viktar Syanau  
- **Publisher ID:** MarySue  
- **Support:** abbigeilwf@outlook.com
