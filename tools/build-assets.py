#!/usr/bin/env python3
"""Build the curated sprite atlases for Travelling Kingdom.

Reads the licensed GandalfHardcore / ChestPack art packs and writes only the
frames the game actually uses (no NSFW sheets ever leave the source folder):

  static/atlas/actors.png      characters with idle / walk animations
  static/atlas/props.png       buildings, trees, decor, animated props
  static/atlas/portraits.png   dialogue portraits
  static/atlas/icons.png       coins, gems, chests, custom pixel icons
  static/bg/<biome>_<n>.png    parallax layers (green / autumn / winter)
  static/ground.png            ground tiles for the three biomes
  media/js/gen/atlas.js        manifest consumed by the webview

Usage:
  python tools/build-assets.py [ASSET_ROOT]

ASSET_ROOT defaults to $TK_ASSET_ROOT or H:/Assets/Art/Platformer.
Preview contact sheets land in tools/out/ (git-ignored) for visual review.
"""
from __future__ import annotations

import json
import os
import sys
from pathlib import Path

import numpy as np
from PIL import Image, ImageDraw

REPO = Path(__file__).resolve().parent.parent
ROOT = Path(sys.argv[1] if len(sys.argv) > 1 else os.environ.get('TK_ASSET_ROOT', 'H:/Assets/Art/Platformer'))
OUT_ATLAS = REPO / 'static' / 'atlas'
OUT_BG = REPO / 'static' / 'bg'
OUT_JS = REPO / 'media' / 'js' / 'gen'
OUT_PREVIEW = REPO / 'tools' / 'out'

F = 'Female Pixel Art characters/Female Pixel Art characters.png'
M = 'Male Pixel Art characters/Male Pixel Art characters.png'
P1 = 'GandalfHardcore characters pack/'
P2 = 'GandalfHardcore characters pack 2/'
FP = 'GandalfHardcore FREE Platformer Assets/'
VH = 'GandalfHardcore Pixel Art Village Houses tiles/'
MK = 'GandalfHardcore Mounted Knight/'
CP = 'ChestPack/'
S1 = P1 + 'GandalfHardcore characters sheet1.png'
S2 = P1 + 'GandalfHardcore characters sheet2.png'

_cache: dict[str, Image.Image] = {}


def load(rel: str) -> Image.Image:
    if rel not in _cache:
        path = ROOT / rel
        if not path.exists():
            raise SystemExit(f'missing source art: {path}')
        _cache[rel] = Image.open(path).convert('RGBA')
    return _cache[rel]


def bbox(img: Image.Image):
    a = np.array(img)[:, :, 3]
    ys, xs = np.nonzero(a > 8)
    if len(xs) == 0:
        return None
    return int(xs.min()), int(ys.min()), int(xs.max()) + 1, int(ys.max()) + 1


def largest_component(img: Image.Image) -> Image.Image:
    """Keep only the biggest 8-connected opaque blob (drops neighbouring sprites)."""
    from collections import deque
    arr = np.array(img)
    a = arr[:, :, 3] > 8
    h, w = a.shape
    lab = np.zeros(a.shape, dtype=np.int32)
    sizes = [0]
    n = 0
    for y in range(h):
        for x in range(w):
            if a[y, x] and not lab[y, x]:
                n += 1
                q = deque([(y, x)])
                lab[y, x] = n
                count = 0
                while q:
                    cy, cx = q.popleft()
                    count += 1
                    for dy in (-1, 0, 1):
                        for dx in (-1, 0, 1):
                            ny, nx = cy + dy, cx + dx
                            if 0 <= ny < h and 0 <= nx < w and a[ny, nx] and not lab[ny, nx]:
                                lab[ny, nx] = n
                                q.append((ny, nx))
                sizes.append(count)
    if n <= 1:
        return img
    keep = int(np.argmax(sizes))
    arr[lab != keep, 3] = 0
    return Image.fromarray(arr)


# ---------------------------------------------------------------------------
# Actor definitions
# ---------------------------------------------------------------------------

def cells(col0: int, row: int, n: int):
    return [(col0 + i, row) for i in range(n)]


def hero(src: str, col: int, faces: str = 'right'):
    """Male / Female Pixel Art sheets: row 0 portrait, rows 1-5 idle, 6-13 walk."""
    return dict(
        src=src, fw=64, fh=64, faces=faces,
        anims={
            'idle': dict(frames=[(col, r) for r in range(1, 6)], fps=5),
            'walk': dict(frames=[(col, r) for r in range(6, 14)], fps=8),
        },
        portrait=dict(kind='cell', col=col, row=0),
    )


def duo(src: str, faces: str = 'right', idle_n: int = 5, walk_n: int = 8):
    """GandalfHardcore 512x128 sheets: row 0 idle, row 1 walk."""
    return dict(
        src=src, fw=64, fh=64, faces=faces,
        anims={
            'idle': dict(frames=cells(0, 0, idle_n), fps=5),
            'walk': dict(frames=cells(0, 1, walk_n), fps=8),
        },
        portrait=dict(kind='auto'),
    )


def solo(src: str, n: int, row: int = 0, col0: int = 0, fps: int = 6, faces: str = 'right', fw: int = 64, fh: int = 64):
    return dict(
        src=src, fw=fw, fh=fh, faces=faces,
        anims={'idle': dict(frames=cells(col0, row, n), fps=fps)},
        portrait=dict(kind='auto'),
    )


ACTORS = {
    # Heroes
    'queen': hero(F, 0),
    'king': hero(M, 7),
    # Companions (story recruits)
    'quill': duo(P1 + 'Scribe.png'),
    'wren': hero(M, 3),
    'hazel': hero(F, 4),
    'marta': hero(F, 3),
    'halbert': hero(M, 5),
    'odalys': hero(F, 7),
    'bellwether': hero(M, 4),
    'agatha': hero(F, 2),
    'pell': hero(M, 1),
    'brom': hero(M, 6),
    'fennick': hero(M, 8),
    'murk': hero(M, 2),
    'elsie': hero(F, 11),
    'clanksworth': hero(M, 10),
    'gruff': hero(M, 0),
    'barrelby': hero(M, 9),
    'umbra': hero(F, 6),
    'brunhild': hero(F, 5),
    # Story NPCs
    'crier': solo(P1 + 'Town crier.png', 9, fps=6),
    'reginald': dict(
        src=MK + 'mounted knight purple.png', fw=128, fh=111, faces='right',
        anims={
            'idle': dict(frames=cells(0, 0, 10), fps=6),
            'walk': dict(frames=cells(0, 1, 10), fps=10),
        },
        portrait=dict(kind='file', src=MK + 'Mounted knight portrait 64x64.png'),
    ),
    'ambrose': dict(
        src=P2 + 'Wizard with a map.png', fw=64, fh=64, faces='right',
        anims={'idle': dict(frames=[(c, r) for r in range(4) for c in range(6)], fps=6)},
        portrait=dict(kind='auto'),
    ),
    'toadwiz': solo(P1 + 'Wizard toad.png', 5, fps=5),
    'dragon': dict(
        src=P2 + 'Sleeping Dragon.png', fw=208, fh=128, faces='left',
        anims={
            'idle': dict(frames=[(c, 1) for c in range(5)], fps=4),
            'wake': dict(frames=[(c, r) for r in range(2, 5) for c in range(5)], fps=6),
        },
        portrait=dict(kind='auto', size=72),
    ),
    # Road NPCs
    'toad': solo(P1 + 'Toad.png', 12, fps=6),
    'beggar': solo(P1 + 'Beggar.png', 5),
    'dealer': solo(P1 + 'Black Market Dealer.png', 5),
    'crusader': solo(P1 + 'Crusader.png', 5),
    'mage': solo(P1 + 'Mage.png', 5),
    'servant': solo(P1 + 'Medieval servant.png', 5),
    'woundedknight': solo(P1 + 'Wounded Knight.png', 5),
    'fallenknight': solo(P2 + 'Wounded knight.png', 12),
    'snowmen': solo(P1 + 'Snowman Couple.png', 10),
    'fairy': solo(P1 + 'Fairy.png', 8, fps=8),
    'baroness': duo(P1 + 'Baroness.png'),
    'noblelady': duo(P1 + 'Nobel Lady.png'),
    'abbess': duo(P1 + 'Nun.png'),
    'inquisitor': duo(P1 + 'Spanish inquisition.png'),
    'sorceress': solo(P1 + 'Female Wizard.png', 10, fps=7),
    'babayaga': solo(P2 + 'Baba Yaga.png', 5),
    'bard': solo(P2 + 'Bard.png', 5),
    'butcher': solo(P2 + 'Mad butcher.png', 5),
    'pirate': solo(P2 + 'Pirate.png', 5),
    'ratthief': solo(P2 + 'Rat thief.png', 5),
    'inventor': solo(P2 + 'Steampunker.png', 5),
    'seamstress': solo(P2 + 'Seemstress.png', 6),
    'druid': duo(P2 + 'Druid.png'),
    'shamisen': solo(P2 + 'Japanese Musician.png', 10, fps=7),
    'tiger': solo(P2 + 'Tiger.png', 10, fps=5),
    'drummer': solo(P2 + 'Musicians.png', 5, row=0),
    'tambourine': solo(P2 + 'Musicians.png', 5, row=1),
    'fiddler': solo(P2 + 'Musicians.png', 5, row=2),
    'beekeeper': dict(
        src=P2 + 'Beekeeper .png', fw=64, fh=64, faces='right',
        anims={
            'idle': dict(frames=cells(0, 0, 5), fps=5),
            'walk': dict(frames=cells(0, 1, 8), fps=8),
            'tend': dict(frames=cells(0, 2, 5), fps=5),
        },
        portrait=dict(kind='auto'),
    ),
    'campwizard': solo(P2 + 'Camp Characters.png', 24, row=0, fps=8),
    'campknight': solo(P2 + 'Camp Characters.png', 24, row=1, fps=8),
    'cookknight': solo(P2 + 'Knight Cooking.png', 12, row=0, fps=8),
    'cookknight2': solo(P2 + 'Knight Cooking.png', 12, row=1, fps=8),
    'cuman': solo(P2 + 'Knight Cuman and Dancer .png', 12, row=1, fps=8),
    'darkknight': solo(P2 + 'Knight Cuman and Dancer .png', 12, row=0, fps=8),
    'bathknight': solo(P2 + 'Bathtime/Bathtime Knight.png', 10, fps=6),
    'luteplayer': solo(P1 + 'GandalfHardcore tavern NPCs.png', 5, row=0),
    'fluteplayer': solo(P1 + 'GandalfHardcore tavern NPCs.png', 5, row=1),
    'drunkard': solo(P1 + 'GandalfHardcore tavern NPCs.png', 5, row=2),
    'mudslinger': solo(P1 + 'Throwing poop.png', 10, row=0, fps=7),
    'cat': solo(S1, 5, row=6, col0=0),
    'puss': solo(S1, 5, row=6, col0=5),
    'dog': solo(S1, 5, row=7, col0=0),
    'sirwoof': solo(S1, 5, row=7, col0=5),
    'serving': solo(S1, 5, row=0, col0=0),
    'villager1': solo(S1, 5, row=1, col0=0),
    'villager2': solo(S1, 5, row=1, col0=5),
    'villager3': solo(S1, 5, row=2, col0=0),
    'reader': solo(S1, 5, row=3, col0=0),
    'knightsit': solo(S1, 5, row=8, col0=0),
    'knightblue': solo(S1, 5, row=8, col0=5),
    'knightale': solo(S1, 5, row=9, col0=0),
    'knightlute': solo(S1, 5, row=9, col0=5),
    'stranger': solo(S1, 5, row=10, col0=0),
    'woodcutter': solo(S1, 5, row=10, col0=5),
    'cleaver': solo(S1, 5, row=11, col0=0),
    'witch': solo(S1, 5, row=11, col0=5),
    'grapes': solo(S1, 5, row=12, col0=0),
    'oldlord': solo(S1, 5, row=12, col0=5),
    'cook': solo(S1, 5, row=13, col0=0),
    'paladin': solo(S1, 5, row=13, col0=5),
    'villager4': solo(S2, 5, row=1, col0=0),
    'villager5': solo(S2, 5, row=1, col0=5),
    'bluewizard': solo(S2, 5, row=12, col0=5),
    'baker': solo(S2, 5, row=13, col0=0),
    # Small creatures (16x16)
    'frog': solo(P1 + 'GandalfHardcore Small Creatures.png', 4, row=0, fw=16, fh=16, fps=4),
    'frogjump': solo(P1 + 'GandalfHardcore Small Creatures.png', 4, row=1, fw=16, fh=16, fps=8),
    'pigeon': solo(P1 + 'GandalfHardcore Small Creatures.png', 4, row=2, fw=16, fh=16, fps=4),
    'pigeonfly': solo(P1 + 'GandalfHardcore Small Creatures.png', 4, row=3, fw=16, fh=16, fps=10),
    'bluebird': solo(P1 + 'GandalfHardcore Small Creatures.png', 4, row=4, fw=16, fh=16, fps=4),
}

# Nearly all source art faces left (the 1.x code mirrored heroes to walk right).
# These face right natively (verified in tools/out previews).
FACES_RIGHT = {'tiger', 'dog', 'sirwoof', 'luteplayer', 'dragon', 'reginald'}

# ---------------------------------------------------------------------------
# Prop definitions
# ---------------------------------------------------------------------------

def g(col, row, w=1, h=1, cell=32):
    return (col * cell, row * cell, w * cell, h * cell)


def frames_grid(c0, r0, n, fw, fh, per_row=None):
    out = []
    for i in range(n):
        if per_row:
            c, r = c0 + i % per_row, r0 + i // per_row
        else:
            c, r = c0 + i, r0
        out.append((c * fw, r * fh, fw, fh))
    return out


DECOR = FP + 'Decor.png'

PROPS = {
    # Village buildings
    'house1': dict(src=VH + 'House.png'),
    'house2': dict(src=VH + 'House2.png'),
    'house3': dict(src=VH + 'House3.png'),
    'house4': dict(src=VH + 'House4.png'),
    'house5': dict(src=VH + 'House5.png'),
    'house6': dict(src=VH + 'House6.png'),
    'tavern': dict(src=VH + 'Tavern.png'),
    'tavern2': dict(src=VH + 'Tavern green roof.png'),
    'stall1': dict(src=VH + 'market stall1.png'),
    'stall2': dict(src=VH + 'market stall2.png'),
    'stall3': dict(src=VH + 'market stall3.png'),
    'shop': dict(src=VH + 'shop.png'),
    'stable': dict(src=VH + 'Stable or Storage.png'),
    # Camp
    'tentbig': dict(src=FP + 'Large Tent.png'),
    'tentsmall': dict(src=FP + 'Small Tent.png'),
    # Trees
    'tree': dict(src=FP + 'Tree1.png'),
    'treeapple': dict(src=FP + 'Tree2.png'),
    'treeautumn': dict(src=FP + 'Tree3.png'),
    'treewinter': dict(src=FP + 'Tree4.png'),
    'willow': dict(src=FP + 'Weeping Willow1.png'),
    'willowautumn': dict(src=FP + 'Weeping Willow2.png'),
    'willowwinter': dict(src=FP + 'Weeping Willow3.png'),
    'birch': dict(src=FP + 'Birch1.png'),
    'birchautumn': dict(src=FP + 'Birch2.png'),
    'birchwinter': dict(src=FP + 'Birch3.png'),
    'bigpine': dict(src=FP + 'Large Pine Tree.png'),
    'blossom': dict(src=FP + 'Flowering Tree.png'),
    'xmastree': dict(src=FP + 'Christmas tree.png'),
    'pine': dict(src=FP + 'Pine Trees.png', rect=(1, 0, 93, 192), solo=True),
    'pineolive': dict(src=FP + 'Pine Trees.png', rect=(97, 0, 93, 192), solo=True),
    'pinered': dict(src=FP + 'Pine Trees.png', rect=(225, 0, 93, 192), solo=True),
    'pineorange': dict(src=FP + 'Pine Trees.png', rect=(321, 0, 93, 192), solo=True),
    'pinesnow': dict(src=FP + 'Pine Trees.png', rect=(449, 0, 93, 192), solo=True),
    'stump': dict(src=FP + 'Pine Trees.png', rect=(194, 40, 28, 88), solo=True),
    # Statues & garden
    'angel': dict(src=FP + 'Angel Statue.png'),
    'balloon': dict(src=FP + 'hot air balloon.png'),
    'sun': dict(src=FP + 'sun.png'),
    # Decor.png pieces (32px grid)
    'crates': dict(src=DECOR, rect=g(0, 0)),
    'cratestack': dict(src=DECOR, rect=g(1, 0, 1, 2), solo=True),
    'barrel': dict(src=DECOR, rect=g(2, 0)),
    'barrels': dict(src=DECOR, rect=g(3, 0)),
    'stool': dict(src=DECOR, rect=g(4, 0)),
    'cauldron': dict(src=DECOR, rect=g(5, 0)),
    'chopblock': dict(src=DECOR, rect=g(6, 0)),
    'axestump': dict(src=DECOR, rect=g(7, 0)),
    'bench': dict(src=DECOR, rect=g(8, 0)),
    'chair': dict(src=DECOR, rect=g(9, 0)),
    'apples': dict(src=DECOR, rect=g(10, 0)),
    'applepile': dict(src=DECOR, rect=g(11, 0)),
    'bottles': dict(src=DECOR, rect=g(12, 0)),
    'fruittable': dict(src=DECOR, rect=g(9, 1, 2, 2), solo=True),
    'basket': dict(src=DECOR, rect=g(10, 2)),
    'applebasket': dict(src=DECOR, rect=g(11, 2)),
    'campleft': dict(src=DECOR, rect=g(0, 1, 3, 2), solo=True),
    'campright': dict(src=DECOR, rect=g(3, 1, 3, 2), solo=True),
    'firewood': dict(src=DECOR, rect=g(6, 2, 2, 1), solo=True),
    'cookpot': dict(src=DECOR, rect=g(1, 3), solo=True),
    'tub': dict(src=DECOR, rect=g(2, 3), solo=True),
    'bucket': dict(src=DECOR, rect=g(3, 3)),
    'pail': dict(src=DECOR, rect=g(4, 3)),
    'grave1': dict(src=DECOR, rect=g(6, 3)),
    'grave2': dict(src=DECOR, rect=g(7, 3)),
    'grave3': dict(src=DECOR, rect=g(8, 3)),
    'gravecross': dict(src=DECOR, rect=g(9, 3)),
    'graveold': dict(src=DECOR, rect=g(10, 3)),
    'pumpkin': dict(src=DECOR, rect=g(11, 3)),
    'pumpkinbig': dict(src=DECOR, rect=g(12, 3)),
    'reeds': dict(src=DECOR, rect=g(10, 4, 1, 2), solo=True),
    'reedsmall': dict(src=DECOR, rect=g(9, 5)),
    'wall': dict(src=DECOR, rect=g(11, 4, 2, 2), solo=True),
    'scarecrow': dict(src=DECOR, rect=g(9, 6, 1, 2), solo=True),
    'jacko': dict(src=DECOR, rect=g(11, 6)),
    'jackobig': dict(src=DECOR, rect=g(12, 6)),
    'statue': dict(src=DECOR, rect=g(12, 8, 1, 2), solo=True),
    'laundry': dict(src=DECOR, rect=g(1, 11, 6, 2), solo=True),
    # Seasonal ground decor (green / autumn / winter)
    'tuft_g1': dict(src=DECOR, rect=g(0, 4)), 'tuft_g2': dict(src=DECOR, rect=g(1, 4)), 'tuft_g3': dict(src=DECOR, rect=g(2, 4)),
    'tuft_a1': dict(src=DECOR, rect=g(3, 4)), 'tuft_a2': dict(src=DECOR, rect=g(4, 4)), 'tuft_a3': dict(src=DECOR, rect=g(5, 4)),
    'tuft_w1': dict(src=DECOR, rect=g(6, 4)), 'tuft_w2': dict(src=DECOR, rect=g(7, 4)), 'tuft_w3': dict(src=DECOR, rect=g(8, 4)),
    'rock_g1': dict(src=DECOR, rect=g(0, 5)), 'rock_g2': dict(src=DECOR, rect=g(1, 5)), 'rock_g3': dict(src=DECOR, rect=g(2, 5)),
    'rock_a1': dict(src=DECOR, rect=g(3, 5)), 'rock_a2': dict(src=DECOR, rect=g(4, 5)), 'rock_a3': dict(src=DECOR, rect=g(5, 5)),
    'rock_w1': dict(src=DECOR, rect=g(6, 5)), 'rock_w2': dict(src=DECOR, rect=g(7, 5)), 'rock_w3': dict(src=DECOR, rect=g(8, 5)),
    'rockmid_g': dict(src=DECOR, rect=g(0, 6, 2, 2), solo=True), 'rockmid_a': dict(src=DECOR, rect=g(3, 6, 2, 2), solo=True), 'rockmid_w': dict(src=DECOR, rect=g(6, 6, 3, 2), solo=True),
    'rockbig_g': dict(src=DECOR, rect=g(0, 8, 3, 2), solo=True), 'rockbig_a': dict(src=DECOR, rect=g(3, 8, 3, 2), solo=True), 'rockbig_w': dict(src=DECOR, rect=g(9, 8, 3, 2), solo=True),
    'rockbig_x': dict(src=DECOR, rect=g(6, 8, 3, 2), solo=True),
    'bush_g1': dict(src=DECOR, rect=g(0, 13, 2, 1), solo=True), 'bush_g2': dict(src=DECOR, rect=g(2, 13)), 'bush_g3': dict(src=DECOR, rect=g(3, 13)),
    'bush_a1': dict(src=DECOR, rect=g(0, 14, 2, 1), solo=True), 'bush_a2': dict(src=DECOR, rect=g(2, 14)), 'bush_a3': dict(src=DECOR, rect=g(3, 14)),
    'bush_w1': dict(src=DECOR, rect=g(0, 15, 2, 1), solo=True), 'bush_w2': dict(src=DECOR, rect=g(2, 15)), 'bush_w3': dict(src=DECOR, rect=g(3, 15)),
    'mound_a': dict(src=DECOR, rect=g(5, 10, 3, 1), solo=True), 'mound_w': dict(src=DECOR, rect=g(8, 10, 3, 1), solo=True),
    'tallgrass': dict(src=FP + 'Tall Grass.png'),
    # Wheat growth (32px cells)
    'wheat1': dict(src=FP + 'Pixel Art Wheat.png', rect=g(1, 0)),
    'wheat2': dict(src=FP + 'Pixel Art Wheat.png', rect=g(2, 0)),
    'wheat3': dict(src=FP + 'Pixel Art Wheat.png', rect=g(3, 0)),
    'wheat4': dict(src=FP + 'Pixel Art Wheat.png', rect=g(4, 0)),
    'bread': dict(src=FP + 'Pixel Art Wheat.png', rect=g(5, 0)),
    'sack': dict(src=FP + 'Pixel Art Wheat.png', rect=g(6, 0)),
    'sheaf': dict(src=FP + 'Pixel Art Wheat.png', rect=g(7, 0)),
    # Garden decorations (component columns)
    'cypress': dict(src=FP + 'Garden Decorations.png', rect=(130, 0, 28, 128)),
    'gardentree': dict(src=FP + 'Garden Decorations.png', rect=(163, 0, 56, 128)),
    'urnflowers': dict(src=FP + 'Garden Decorations.png', rect=(65, 64, 29, 64)),
    'urnplant': dict(src=FP + 'Garden Decorations.png', rect=(99, 64, 27, 64)),
    'bust': dict(src=FP + 'Garden Decorations.png', rect=(0, 64, 31, 64)),
    'column': dict(src=FP + 'Garden Decorations.png', rect=(35, 64, 27, 64)),
    'pots': dict(src=FP + 'Garden Decorations.png', rect=(0, 0, 62, 62)),
    # Ores
    'ore_iron': dict(src=FP + 'Ores.png', rect=(0, 0, 64, 64)),
    'ore_silver': dict(src=FP + 'Ores.png', rect=(64, 0, 64, 64)),
    'ore_gold': dict(src=FP + 'Ores.png', rect=(0, 64, 64, 64)),
    'ore_gem': dict(src=FP + 'Ores.png', rect=(64, 64, 64, 64)),
    # Animated props
    'campfire': dict(src=FP + 'Animated Sprites/Campfire sheet.png', frames=frames_grid(0, 0, 40, 32, 32, per_row=5), fps=12),
    'campfirepot': dict(src=FP + 'Animated Sprites/Campfire with food sheet.png', frames=frames_grid(0, 0, 40, 32, 32, per_row=5), fps=12),
    'torch': dict(src=FP + 'Torch.png', frames=frames_grid(0, 1, 6, 32, 32), fps=10),
    'furnace': dict(src=FP + 'Pixel Art Furnace and Sawmill.png', frames=frames_grid(0, 0, 6, 64, 64), fps=8),
    'sawmill': dict(src=FP + 'Pixel Art Furnace and Sawmill.png', frames=frames_grid(0, 1, 6, 64, 64), fps=8),
    'portal': dict(src=FP + 'Animated Sprites/GandalfHardcore Portal sheet.png', frames=frames_grid(0, 0, 10, 64, 64), fps=8),
    'cooking': dict(src=FP + 'Cooking area.png', frames=frames_grid(0, 0, 12, 64, 64), fps=8),
    'boat': dict(src=FP + 'Boat.png', frames=frames_grid(0, 0, 10, 80, 32), fps=5),
    'water': dict(src=FP + 'Animated Sprites/GandalfHardcore Animated Water Tiles.png', frames=frames_grid(0, 2, 20, 32, 32), fps=8, trim=False),
}

CLOUDS_EXISTING = REPO / 'tools' / 'art' / 'clouds'

# ---------------------------------------------------------------------------
# Hand-drawn 12x12 UI icons
# ---------------------------------------------------------------------------
PAL = {
    '.': (0, 0, 0, 0), 'k': (27, 16, 18, 255), 'y': (246, 196, 67, 255), 'Y': (197, 138, 31, 255),
    'w': (255, 246, 200, 255), 'W': (244, 244, 244, 255), 'r': (216, 67, 58, 255), 'R': (142, 34, 34, 255),
    'g': (94, 199, 90, 255), 'G': (42, 122, 40, 255), 'b': (74, 163, 223, 255), 'B': (36, 95, 143, 255),
    'n': (176, 112, 64, 255), 'N': (110, 64, 34, 255), 's': (242, 194, 155, 255), 'p': (143, 90, 214, 255),
    'P': (91, 53, 148, 255), 'e': (170, 176, 182, 255), 'E': (96, 101, 108, 255), 'o': (240, 140, 50, 255),
}

ICONS = {
    'crown': [
        '............',
        '.k...kk...k.',
        'kyk.kyyk.kyk',
        'kyykkyykkyyk',
        'kyyyyyyyyyyk',
        'kyrryyyybbyk',
        'kyrryywybbyk',
        'kyyyyyyyyyyk',
        'kYYYYYYYYYYk',
        '.kkkkkkkkkk.',
        '............',
        '............',
    ],
    'heart': [
        '............',
        '.kkk....kkk.',
        'krrrk..krrrk',
        'krwrrkkrrrrk',
        'krwrrrrrrrrk',
        'krrrrrrrrrRk',
        '.krrrrrrrRk.',
        '..krrrrrRk..',
        '...krrrRk...',
        '....krRk....',
        '.....kk.....',
        '............',
    ],
    'food': [
        '......kkkk..',
        '.....knnnnk.',
        '....knwnnnnk',
        '....knnnnnnk',
        '....knnnnnNk',
        '....kNnnnNk.',
        '...kWkNNNk..',
        '..kWWkkkk...',
        '.kWWk.......',
        'kWWk........',
        'kWk.........',
        '.k..........',
    ],
    'boot': [
        '............',
        '...kkkkk....',
        '...knnnk....',
        '...knnnk....',
        '...knnnk....',
        '...knnnk....',
        '...knnnkkk..',
        '..knnnnnnnk.',
        '..knnnnnnnnk',
        '..kNNNNNNNNk',
        '..kkkkkkkkkk',
        '............',
    ],
    'flag': [
        '.kk.........',
        '.kWkkkkk....',
        '.kWkrrrrkk..',
        '.kWkrrrrrrk.',
        '.kWkrwrrrrk.',
        '.kWkrrrrrk..',
        '.kWkkkkkk...',
        '.kWk........',
        '.kWk........',
        '.kWk........',
        'kkkkk.......',
        '............',
    ],
    'people': [
        '............',
        '..kk....kk..',
        '.kssk..kssk.',
        '.kssk..kssk.',
        '..kk....kk..',
        '.kbbk..krrk.',
        'kbbbbkkrrrrk',
        'kbbbbkkrrrrk',
        'kbbbbkkrrrrk',
        'kBBBBkkRRRRk',
        'kkkkkkkkkkkk',
        '............',
    ],
    'book': [
        '............',
        '.kkkkkkkkkk.',
        '.krrrrrrrRk.',
        '.kryyyyyyRk.',
        '.krrrrrrrRk.',
        '.krryyyrrRk.',
        '.krrrrrrrRk.',
        '.krrrrrrrRk.',
        '.kWWWWWWWWk.',
        '.kkkkkkkkkk.',
        '............',
        '............',
    ],
    'gear': [
        '.....kk.....',
        '..kk.kek.kk.',
        '..kekkeekek.',
        '...keeeeek..',
        '.kkeeEEeekk.',
        '.keeeE.Eeek.',
        '.keeeE.Eeek.',
        '.kkeeEEeekk.',
        '...keeeeek..',
        '..kekkeekek.',
        '..kk.kek.kk.',
        '.....kk.....',
    ],
    'road': [
        '....kkk.....',
        '....kNk.....',
        'kkkkkkkkkk..',
        'knnnnnnnnnk.',
        'knwwwwwwnnnk',
        'knnnnnnnnnk.',
        'kkkkkkkkkk..',
        '....kNk.....',
        '....kNk.....',
        '....kNk.....',
        '...kkNkk....',
        '..kGGGGGk...',
    ],
    'map': [
        '............',
        '.kkkkkkkkkk.',
        '.kyyyykyyyk.',
        '.kyrykyyyyk.',
        '.kyyrykyyyk.',
        '.kyyyrrkyyk.',
        '.kyykyyrryk.',
        '.kykyyyyrrk.',
        '.kyyyyyyyrk.',
        '.kkkkkkkkkk.',
        '............',
        '............',
    ],
    'star': [
        '.....kk.....',
        '....kyyk....',
        '....kyyk....',
        'kkkkkyykkkkk',
        'kyyyywyyyyyk',
        '.kyyyyyyyyk.',
        '..kyyyyyyk..',
        '..kyyykyyk..',
        '.kyyk..kyyk.',
        '.kyk....kyk.',
        '.kk......kk.',
        '............',
    ],
    'lock': [
        '............',
        '....kkkk....',
        '...keeeek...',
        '..kek..kek..',
        '..kek..kek..',
        '.kkkkkkkkkk.',
        '.kyyyyyyyyk.',
        '.kyyykkyyyk.',
        '.kyyykkyyyk.',
        '.kYYYYYYYYk.',
        '.kkkkkkkkkk.',
        '............',
    ],
    'moon': [
        '............',
        '....kkkk....',
        '...kyyyk....',
        '..kyyyk.....',
        '..kyyk......',
        '..kyyk......',
        '..kyyk......',
        '..kyyyk.....',
        '...kyyykkk..',
        '....kyyyyk..',
        '.....kkkk...',
        '............',
    ],
    'sword': [
        '..........kk',
        '.........kWk',
        '........kWk.',
        '.......kWk..',
        '......kWk...',
        '..k..kWk....',
        '..kkkWk.....',
        '...kkk......',
        '..kNkkk.....',
        '.kNk..k.....',
        'kNk.........',
        'kk..........',
    ],
    'bed': [
        '............',
        '............',
        'kk..........',
        'knk.........',
        'knkkkkkkkkk.',
        'knkWWkbbbbbk',
        'knkWWkbbbbbk',
        'knkkkkkkkkkk',
        'knnnnnnnnnnk',
        'knkkkkkkkknk',
        'kk........kk',
        '............',
    ],
    'hammer': [
        '............',
        '.kkkkkk.....',
        'keeeeeek....',
        'kEEEEEEk....',
        '.kkkNkk.....',
        '....kNk.....',
        '.....kNk....',
        '......kNk...',
        '.......kNk..',
        '........kNk.',
        '.........kk.',
        '............',
    ],
    'basket': [
        '............',
        '....kkkk....',
        '...k....k...',
        '..k......k..',
        '.kkkkkkkkkk.',
        'krrgrrrgrrrk',
        'knnnnnnnnnnk',
        '.kNnNnNnNnk.',
        '.knnnnnnnnk.',
        '..kNNNNNNk..',
        '..kkkkkkkk..',
        '............',
    ],
    'candle': [
        '.....kk.....',
        '....kyok....',
        '....kyok....',
        '.....kk.....',
        '....kWWk....',
        '....kWWk....',
        '....kWWk....',
        '....kWWk....',
        '..kkkWWkkk..',
        '.kyyyyyyyyk.',
        '..kkkkkkkk..',
        '............',
    ],
    'bag': [
        '............',
        '....kkkk....',
        '.....kk.....',
        '....knnk....',
        '...knnnnk...',
        '..knnyynnk..',
        '..knyyyynk..',
        '..knnyynnk..',
        '..knnnnnnk..',
        '...kNNNNk...',
        '....kkkk....',
        '............',
    ],
    'talk': [
        '............',
        '.kkkkkkkkkk.',
        'kWWWWWWWWWWk',
        'kWkkWkkWkkWk',
        'kWWWWWWWWWWk',
        'kWWWWWWWWWWk',
        '.kkkWkkkkkk.',
        '...kWk......',
        '...kk.......',
        '............',
        '............',
        '............',
    ],
    'paw': [
        '............',
        '..kk....kk..',
        '.knnk..knnk.',
        '.knnk..knnk.',
        '..kk.kk.kk..',
        '....knnk....',
        '..kknnnnkk..',
        '.knnnnnnnnk.',
        '.knnnnnnnnk.',
        '..kkknnkkk..',
        '.....kk.....',
        '............',
    ],
    'check': [
        '............',
        '..........k.',
        '.........kgk',
        '........kgk.',
        '.k.....kgk..',
        'kgk...kgk...',
        '.kgk.kgk....',
        '..kgkgk.....',
        '...kgk......',
        '....k.......',
        '............',
        '............',
    ],
    'hourglass': [
        '.kkkkkkkkkk.',
        '.knnnnnnnnk.',
        '..kWyyyyWk..',
        '...kWyyWk...',
        '....kWWk....',
        '.....kk.....',
        '....kWWk....',
        '...kWWWWk...',
        '..kWyyyyWk..',
        '.knnnnnnnnk.',
        '.kkkkkkkkkk.',
        '............',
    ],
}


def draw_icon(rows):
    im = Image.new('RGBA', (12, 12), (0, 0, 0, 0))
    px = im.load()
    for y, line in enumerate(rows):
        assert len(line) == 12, (line, len(line))
        for x, ch in enumerate(line):
            px[x, y] = PAL[ch]
    return im


# ---------------------------------------------------------------------------
# Packing
# ---------------------------------------------------------------------------

class Packer:
    """Simple shelf packer: sprites sorted by height, rows filled left to right."""

    def __init__(self, width: int, pad: int = 1):
        self.width = width
        self.pad = pad
        self.items: list[tuple[str, Image.Image]] = []

    def add(self, key: str, img: Image.Image):
        self.items.append((key, img))

    def pack(self):
        order = sorted(range(len(self.items)), key=lambda i: (-self.items[i][1].size[1], -self.items[i][1].size[0]))
        x = y = shelf_h = 0
        placed = {}
        for i in order:
            key, img = self.items[i]
            w, h = img.size
            if x + w > self.width:
                x = 0
                y += shelf_h + self.pad
                shelf_h = 0
            placed[key] = (x, y, w, h)
            x += w + self.pad
            shelf_h = max(shelf_h, h)
        height = y + shelf_h
        sheet = Image.new('RGBA', (self.width, height), (0, 0, 0, 0))
        for key, img in self.items:
            px, py, _, _ = placed[key]
            sheet.alpha_composite(img, (px, py))
        return sheet, placed


# ---------------------------------------------------------------------------
# Build steps
# ---------------------------------------------------------------------------

def build_actors():
    packer = Packer(1024)
    meta = {}
    portrait_imgs = {}
    for aid, spec in ACTORS.items():
        sheet = load(spec['src'])
        fw, fh = spec['fw'], spec['fh']
        frames = {}
        union = None
        for anim, a in spec['anims'].items():
            imgs = []
            for (c, r) in a['frames']:
                fr = sheet.crop((c * fw, r * fh, (c + 1) * fw, (r + 1) * fh))
                b = bbox(fr)
                if b is None:
                    continue
                imgs.append(fr)
                union = b if union is None else (min(union[0], b[0]), min(union[1], b[1]), max(union[2], b[2]), max(union[3], b[3]))
            frames[anim] = imgs
        if union is None:
            raise SystemExit(f'actor {aid} has no opaque frames')
        x0, y0, x1, y1 = union
        anims_meta = {}
        for anim, imgs in frames.items():
            keys = []
            for i, fr in enumerate(imgs):
                key = f'{aid}:{anim}:{i}'
                packer.add(key, fr.crop((x0, y0, x1, y1)))
                keys.append(key)
            anims_meta[anim] = dict(keys=keys, fps=spec['anims'][anim]['fps'])
        faces = 'right' if aid in FACES_RIGHT else 'left'
        meta[aid] = dict(w=x1 - x0, h=y1 - y0, ax=fw / 2 - x0, ay=y1 - y0, faces=faces, anims=anims_meta)

        # Portrait
        p = spec.get('portrait', dict(kind='auto'))
        if p['kind'] == 'cell':
            portrait_imgs[aid] = sheet.crop((p['col'] * fw, p['row'] * fh, (p['col'] + 1) * fw, (p['row'] + 1) * fh))
        elif p['kind'] == 'file':
            portrait_imgs[aid] = load(p['src']).resize((64, 64), Image.NEAREST) if load(p['src']).size != (64, 64) else load(p['src'])
        else:
            first = frames['idle'][0]
            b = bbox(first)
            size = p.get('size', 30)
            arr = np.array(first)[:, :, 3] > 8
            top = b[1]
            band = arr[top:top + 14, :]
            xs = np.nonzero(band.any(axis=0))[0]
            cx = int((xs.min() + xs.max()) / 2) if len(xs) else fw // 2
            left = max(0, min(fw - size, cx - size // 2))
            up = max(0, top - 2)
            crop = first.crop((left, up, left + size, up + size))
            portrait_imgs[aid] = crop

    sheet, placed = packer.pack()
    for aid, m in meta.items():
        for anim, a in m['anims'].items():
            a['frames'] = [list(placed[k][:2]) for k in a.pop('keys')]
    return sheet, meta, portrait_imgs


def build_portraits(portrait_imgs):
    packer = Packer(1024)
    for aid, img in portrait_imgs.items():
        packer.add(aid, img)
    sheet, placed = packer.pack()
    meta = {aid: list(rect) for aid, rect in placed.items()}
    return sheet, meta


def build_props():
    packer = Packer(1024)
    meta = {}
    for pid, spec in PROPS.items():
        src = load(spec['src'])
        trim = spec.get('trim', True)
        if 'frames' in spec:
            rects = spec['frames']
        else:
            rects = [spec.get('rect', (0, 0, src.size[0], src.size[1]))]
        imgs = [src.crop((x, y, x + w, y + h)) for (x, y, w, h) in rects]
        if spec.get('solo'):
            imgs = [largest_component(im) for im in imgs]
        fw, fh = rects[0][2], rects[0][3]
        union = None
        for im in imgs:
            b = bbox(im)
            if b is None:
                continue
            union = b if union is None else (min(union[0], b[0]), min(union[1], b[1]), max(union[2], b[2]), max(union[3], b[3]))
        if union is None:
            raise SystemExit(f'prop {pid} empty')
        if not trim:
            union = (0, 0, fw, fh)
        x0, y0, x1, y1 = union
        keys = []
        for i, im in enumerate(imgs):
            key = f'{pid}:{i}'
            packer.add(key, im.crop((x0, y0, x1, y1)))
            keys.append(key)
        meta[pid] = dict(w=x1 - x0, h=y1 - y0, keys=keys, fps=spec.get('fps', 0))
    # Clouds (existing repo art + small free-pack clouds)
    cloud_ids = []
    for n in range(1, 11):
        p = CLOUDS_EXISTING / f'Cloud{n}.png'
        if p.exists():
            im = Image.open(p).convert('RGBA')
            b = bbox(im)
            im = im.crop(b)
            key = f'cloud{n}:0'
            packer.add(key, im)
            meta[f'cloud{n}'] = dict(w=im.size[0], h=im.size[1], keys=[key], fps=0)
            cloud_ids.append(f'cloud{n}')
    for n in range(1, 7):
        im = load(FP + f'cloud{n}.png')
        b = bbox(im)
        im = im.crop(b)
        key = f'puff{n}:0'
        packer.add(key, im)
        meta[f'puff{n}'] = dict(w=im.size[0], h=im.size[1], keys=[key], fps=0)
    for n in range(1, 5):
        im = load(FP + f'birds{n}.png')
        b = bbox(im)
        im = im.crop(b)
        key = f'birds{n}:0'
        packer.add(key, im)
        meta[f'birds{n}'] = dict(w=im.size[0], h=im.size[1], keys=[key], fps=0)

    sheet, placed = packer.pack()
    for pid, m in meta.items():
        m['frames'] = [list(placed[k][:2]) for k in m.pop('keys')]
    return sheet, meta


def build_icons():
    packer = Packer(512)
    meta = {}

    def add(key, img, group=None):
        packer.add(key, img)

    for name, rows in ICONS.items():
        add(f'i:{name}', draw_icon(rows))
    coin_frames = {}
    for kind in ['Gold', 'Silver', 'Copper', 'Ruby', 'Emerald', 'Sapphir']:
        keys = []
        for n in range(1, 7):
            im = load(f'{CP}Coins/{kind}/Coin{kind}{n}.png')
            k = f'coin{kind}:{n}'
            add(k, im)
            keys.append(k)
        coin_frames[f'coin_{kind.lower()}'] = keys
    for kind in ['Diamond', 'Emerald', 'Gold', 'Ruby', 'Sapphir']:
        keys = []
        for n in range(1, 7):
            name = 'Diamond' if kind == 'Diamond' else f'Diamond{kind}'
            im = load(f'{CP}Diamonds/{kind}/{name}{n}.png')
            k = f'gem{kind}:{n}'
            add(k, im)
            keys.append(k)
        coin_frames[f'gem_{kind.lower()}'] = keys
    for kind in ['Wood', 'Gold']:
        keys = []
        for n in range(1, 21):
            im = load(f'{CP}Chests/{kind}/{kind}Chest_Open{n}.png')
            k = f'chest{kind}:{n}'
            add(k, im)
            keys.append(k)
        coin_frames[f'chest_{kind.lower()}'] = keys
    sheet, placed = packer.pack()
    for name in ICONS:
        x, y, w, h = placed[f'i:{name}']
        meta[name] = dict(w=w, h=h, frames=[[x, y]], fps=0)
    for name, keys in coin_frames.items():
        w, h = placed[keys[0]][2], placed[keys[0]][3]
        meta[name] = dict(w=w, h=h, frames=[list(placed[k][:2]) for k in keys], fps=10)
    return sheet, meta


def build_backgrounds():
    OUT_BG.mkdir(parents=True, exist_ok=True)
    base = FP + 'GandalfHardcore Background layers/'
    sets = {'green': 'Normal BG/', 'autumn': 'Autumn BG/', 'winter': 'Winter BG/'}
    castles = {'green': 'Background Castle .png', 'autumn': 'Background Castle Autumn.png', 'winter': 'Background Castle  Winter.png'}
    # Layer 1 (nearest trees) carries a solid ground band below this row; we cut it so
    # the game's own ground strip shows through, matching the shipped 1.0 art.
    ground_row = 294
    for biome, folder in sets.items():
        for n in range(1, 6):
            im = load(f'{base}{folder}GandalfHardcore Background layers_layer {n}.png')
            if n == 1:
                im = im.copy()
                arr = np.array(im)
                arr[ground_row:, :, 3] = 0
                im = Image.fromarray(arr)
            # file index 0 = sky (layer 5) ... 4 = nearest (layer 1)
            im.save(OUT_BG / f'{biome}_{5 - n}.png', optimize=True)
        load(f'{base}{folder}{castles[biome]}').save(OUT_BG / f'{biome}_castle.png', optimize=True)
    return dict(w=1024, h=346, groundRow=ground_row)


def build_ground():
    src = load(FP + 'Floor Tiles1.png')
    out = Image.new('RGBA', (64, 96), (0, 0, 0, 0))
    # rows: green (0), autumn (6), winter (12); tile col 1 = top edge, row+1 = fill
    for i, base_row in enumerate([0, 6, 12]):
        top = src.crop((32, base_row * 32, 64, base_row * 32 + 32))
        fill = src.crop((32, (base_row + 1) * 32, 64, (base_row + 1) * 32 + 32))
        out.alpha_composite(top, (0, i * 32))
        out.alpha_composite(fill, (32, i * 32))
    out.save(REPO / 'static' / 'ground.png', optimize=True)
    return dict(tile=32, biomes={'green': 0, 'autumn': 1, 'winter': 2})


def preview(sheet: Image.Image, meta: dict, name: str, label_scale: int = 1):
    OUT_PREVIEW.mkdir(parents=True, exist_ok=True)
    big = Image.new('RGBA', sheet.size, (52, 52, 62, 255))
    big.alpha_composite(sheet)
    d = ImageDraw.Draw(big)
    for key, m in meta.items():
        fr = m['frames'][0] if 'frames' in m else None
        if fr is None:
            continue
        x, y = fr
        d.rectangle([x, y, x + m['w'] - 1, y + m['h'] - 1], outline=(255, 0, 255, 90))
        d.text((x + 1, y + 1), key, fill=(255, 255, 0, 255))
    big.convert('RGB').save(OUT_PREVIEW / f'{name}.png')


def main():
    OUT_ATLAS.mkdir(parents=True, exist_ok=True)
    OUT_JS.mkdir(parents=True, exist_ok=True)

    actors_sheet, actors_meta, portrait_imgs = build_actors()
    actors_sheet.save(OUT_ATLAS / 'actors.png', optimize=True)
    portraits_sheet, portraits_meta = build_portraits(portrait_imgs)
    portraits_sheet.save(OUT_ATLAS / 'portraits.png', optimize=True)
    props_sheet, props_meta = build_props()
    props_sheet.save(OUT_ATLAS / 'props.png', optimize=True)
    icons_sheet, icons_meta = build_icons()
    icons_sheet.save(OUT_ATLAS / 'icons.png', optimize=True)
    bg_meta = build_backgrounds()
    ground_meta = build_ground()

    manifest = dict(
        version=2,
        actors=actors_meta,
        portraits=portraits_meta,
        props=props_meta,
        icons=icons_meta,
        bg=bg_meta,
        ground=ground_meta,
        sheets=dict(
            actors=list(actors_sheet.size), props=list(props_sheet.size),
            portraits=list(portraits_sheet.size), icons=list(icons_sheet.size),
        ),
    )
    js = '/* Generated by tools/build-assets.py. Do not edit by hand. */\n'
    js += 'window.TK_ATLAS = ' + json.dumps(manifest, separators=(',', ':')) + ';\n'
    (OUT_JS / 'atlas.js').write_text(js, encoding='utf-8')

    # Previews for human review (not shipped)
    for aid, m in actors_meta.items():
        m['frames'] = m['anims']['idle']['frames']
    preview(actors_sheet, {k: dict(w=v['w'], h=v['h'], frames=v['frames']) for k, v in actors_meta.items()}, 'actors')
    preview(props_sheet, props_meta, 'props')
    preview(icons_sheet, icons_meta, 'icons')
    preview(portraits_sheet, {k: dict(w=v[2], h=v[3], frames=[v[:2]]) for k, v in portraits_meta.items()}, 'portraits')

    def kb(p):
        return f'{os.path.getsize(p) / 1024:.0f} KB'

    print('actors   ', actors_sheet.size, kb(OUT_ATLAS / 'actors.png'), len(actors_meta), 'actors')
    print('portraits', portraits_sheet.size, kb(OUT_ATLAS / 'portraits.png'))
    print('props    ', props_sheet.size, kb(OUT_ATLAS / 'props.png'), len(props_meta), 'props')
    print('icons    ', icons_sheet.size, kb(OUT_ATLAS / 'icons.png'))
    print('atlas.js ', kb(OUT_JS / 'atlas.js'))


if __name__ == '__main__':
    main()
