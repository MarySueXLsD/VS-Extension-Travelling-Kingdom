#!/usr/bin/env python3
"""Render the animated README banner (assets/banner.gif, 960x300) from the game's atlases.

The court walks the Kingsroad on a seamless loop while the title sits in the sky
and two companions chat. Usage: python tools/make-banner.py
"""
from __future__ import annotations

import json
import math
import os
from pathlib import Path

from PIL import Image, ImageDraw, ImageFilter, ImageFont

REPO = Path(__file__).resolve().parent.parent
OUT = REPO / 'assets' / 'banner.gif'
W, H = 960, 300
SCALE = 2  # art pixels -> banner pixels
AW, AH = W // SCALE, H // SCALE
FRAMES = 40
FRAME_MS = 100  # 4 s loop; walk cycles (8 fps) and ground tiles (32 px) wrap exactly
GROUND_SHIFT = 64  # art px the road scrolls per loop (two ground tiles)
FONT_DIR = Path(os.environ.get('WINDIR', 'C:/Windows')) / 'Fonts'


def font(name, size):
    for candidate in (FONT_DIR / name, Path('/usr/share/fonts/truetype/dejavu/DejaVuSerif-Bold.ttf')):
        if candidate.exists():
            return ImageFont.truetype(str(candidate), size)
    return ImageFont.load_default()


def load_atlas():
    js = (REPO / 'media' / 'js' / 'gen' / 'atlas.js').read_text(encoding='utf-8')
    return json.loads(js[js.index('=') + 1:].strip().rstrip(';'))


ATLAS = load_atlas()
SHEETS = {name: Image.open(REPO / 'static' / 'atlas' / f'{name}.png').convert('RGBA') for name in ('actors', 'props')}
GROUND = Image.open(REPO / 'static' / 'ground.png').convert('RGBA')
GY = AH - 22  # ground line in art px


def actor_frame(actor, anim, t, phase=0.0):
    a = ATLAS['actors'][actor]
    an = a['anims'].get(anim) or a['anims']['idle']
    idx = int((t + phase) * an['fps']) % len(an['frames'])
    x, y = an['frames'][idx]
    img = SHEETS['actors'].crop((x, y, x + a['w'], y + a['h']))
    return img, a


def draw_actor(canvas, actor, anim, x, feet, t, phase=0.0, face='right'):
    img, a = actor_frame(actor, anim, t, phase)
    flip = (face == 'right') == (a['faces'] == 'left')
    if flip:
        img = img.transpose(Image.FLIP_LEFT_RIGHT)
        left = x - (a['w'] - a['ax'])
    else:
        left = x - a['ax']
    canvas.alpha_composite(img, (int(round(left)), int(round(feet - a['ay']))))


def draw_prop(canvas, prop, cx, bottom):
    p = ATLAS['props'][prop]
    x, y = p['frames'][0]
    img = SHEETS['props'].crop((x, y, x + p['w'], y + p['h']))
    canvas.alpha_composite(img, (int(round(cx - p['w'] / 2)), int(round(bottom - p['h']))))


def background():
    """Static sky + parallax forest, scaled so the ground row meets the road."""
    bg = Image.new('RGBA', (AW, AH))
    sky = ImageDraw.Draw(bg)
    for yy in range(AH):
        t = yy / AH
        sky.line([(0, yy), (AW, yy)], fill=(int(127 + (207 - 127) * t), int(195 + (238 - 195) * t), int(214 + (240 - 214) * t), 255))
    ground_row = ATLAS['bg']['groundRow']
    scale = (GY + 2) / ground_row
    for n in range(5):
        layer = Image.open(REPO / 'static' / 'bg' / f'green_{n}.png').convert('RGBA')
        lw, lh = max(1, round(layer.width * scale)), max(1, round(layer.height * scale))
        layer = layer.resize((lw, lh), Image.LANCZOS)
        top = round(GY + 2 - ground_row * scale)
        offset = [0, -40, -120, -60, -200][n]
        x = offset % lw - lw
        while x < AW:
            bg.alpha_composite(layer, (x, top))
            x += lw
        if n == 0:
            for cid, cx, cy, cs in (('cloud4', 300, 10, 0.55), ('cloud9', 410, 22, 0.4), ('puff5', 220, 34, 0.7)):
                c = ATLAS['props'][cid]
                fx, fy = c['frames'][0]
                cimg = SHEETS['props'].crop((fx, fy, fx + c['w'], fy + c['h']))
                cimg = cimg.resize((max(1, int(c['w'] * cs)), max(1, int(c['h'] * cs))), Image.NEAREST)
                bg.alpha_composite(cimg, (cx, cy))
    # Soften the far scenery under the title so the text stays readable.
    veil = Image.new('RGBA', (AW, AH), (0, 0, 0, 0))
    vd = ImageDraw.Draw(veil)
    for xx in range(AW):
        a = max(0, int(70 * (1 - xx / (AW * 0.62))))
        vd.line([(xx, 0), (xx, GY)], fill=(28, 8, 12, a))
    bg.alpha_composite(veil)
    return bg


PARTY = ['wren', 'marta', 'hazel', 'halbert', 'bellwether', 'agatha', 'barrelby', 'quill']
HERO_X = 418


def world_frame(base, t):
    art = base.copy()
    shift = (t / (FRAMES * FRAME_MS / 1000)) * GROUND_SHIFT
    # Roadside tufts and rocks repeat every 64 px so the loop is seamless.
    pattern = [('tuft_g1', 6), ('rock_g1', 30), ('tuft_g3', 47)]
    for k in range(-1, AW // 64 + 2):
        for prop, off in pattern:
            draw_prop(art, prop, k * 64 + off - shift % 64, GY + 3)
    # Ground tiles
    for k in range(-1, AW // 32 + 2):
        x = int(round(k * 32 - shift % 32))
        art.alpha_composite(GROUND.crop((0, 0, 32, 32)), (x, GY))
        art.alpha_composite(GROUND.crop((32, 0, 64, 32)), (x, GY + 32))
    # The court: alternating lanes, newest closest to the hero.
    back, front = [], []
    for i, cid in enumerate(PARTY):
        dx = -(17 + i * 14)
        (back if i % 2 == 0 else front).append((i, cid, HERO_X + dx))
    for i, cid, x in back:
        draw_actor(art, cid, 'walk', x, GY + 3, t, phase=(i * 0.37) % 1)
    for i, cid, x in front:
        draw_actor(art, cid, 'walk', x, GY + 7, t, phase=(i * 0.53) % 1)
    draw_actor(art, 'queen', 'walk', HERO_X, GY + 7, t)
    return art


def bubble(draw, x, y, text, fnt, alpha):
    if alpha <= 0:
        return
    tw = draw.textlength(text, font=fnt)
    bw, bh = int(tw + 18), 26
    left = int(x - bw / 2)
    top = int(y - bh)
    fill = (255, 250, 240, int(255 * alpha))
    edge = (43, 29, 20, int(255 * alpha))
    draw.rounded_rectangle([left, top, left + bw, top + bh], radius=8, fill=fill, outline=edge, width=2)
    draw.polygon([(x - 6, top + bh - 1), (x + 6, top + bh - 1), (x, top + bh + 8)], fill=fill)
    draw.line([(x - 6, top + bh + 1), (x, top + bh + 8), (x + 6, top + bh + 1)], fill=edge, width=2)
    draw.text((left + 9, top + 4), text, font=fnt, fill=(43, 29, 20, int(255 * alpha)))


def title_layer():
    layer = Image.new('RGBA', (W, H), (0, 0, 0, 0))
    d = ImageDraw.Draw(layer)
    big = font('palab.ttf', 58)
    small = font('pala.ttf', 21)
    tag = font('palai.ttf', 18)
    x, y = 46, 34
    for line, yy in (('Travelling', y), ('Kingdom', y + 60)):
        shadow = Image.new('RGBA', (W, H), (0, 0, 0, 0))
        ImageDraw.Draw(shadow).text((x + 3, yy + 4), line, font=big, fill=(20, 4, 8, 210))
        layer.alpha_composite(shadow.filter(ImageFilter.GaussianBlur(2)))
        d.text((x, yy), line, font=big, fill=(246, 203, 104, 255), stroke_width=3, stroke_fill=(58, 16, 22, 255))
    # Ornament divider, like the other banners
    oy = y + 140
    d.line([(x + 4, oy), (x + 150, oy)], fill=(232, 182, 80, 255), width=2)
    d.polygon([(x + 162, oy - 6), (x + 168, oy), (x + 162, oy + 6), (x + 156, oy)], fill=(246, 203, 104, 255))
    d.line([(x + 174, oy), (x + 320, oy)], fill=(232, 182, 80, 255), width=2)
    d.text((x + 2, oy + 12), 'A pixel-art road trip that walks', font=small, fill=(250, 238, 214, 255), stroke_width=2, stroke_fill=(40, 10, 14, 230))
    d.text((x + 2, oy + 38), 'beside you while you code', font=small, fill=(250, 238, 214, 255), stroke_width=2, stroke_fill=(40, 10, 14, 230))
    return layer, tag


def ease(v):
    v = max(0.0, min(1.0, v))
    return 1 - (1 - v) ** 3


def main():
    base = background()
    titles, bubble_font = title_layer()
    frames = []
    total = FRAMES * FRAME_MS / 1000
    for f in range(FRAMES):
        t = f * FRAME_MS / 1000
        art = world_frame(base, t)
        frame = art.resize((W, H), Image.NEAREST)
        frame.alpha_composite(titles)
        d = ImageDraw.Draw(frame)
        # Chatter beats: Marta, then Wren, each popping in and fading out.
        for start, who_i, text in ((0.3, 1, 'Are we there yet?'), (2.2, 0, 'Shortcut ahead. Probably.')):
            local = t - start
            alpha = 0.0
            if 0 <= local < 1.5:
                alpha = ease(local / 0.15) if local < 0.15 else (1.0 if local < 1.3 else 1 - (local - 1.3) / 0.2)
            x = (HERO_X - (17 + who_i * 14)) * SCALE
            lift = int(6 * (1 - ease(local / 0.15))) if 0 <= local < 0.15 else 0
            bubble(d, x, (GY - 50) * SCALE + lift, text, bubble_font, alpha)
        # Thin royal frame
        d.rectangle([0, 0, W - 1, H - 1], outline=(200, 150, 47, 255), width=3)
        d.rectangle([3, 3, W - 4, H - 4], outline=(58, 16, 22, 255), width=1)
        frames.append(frame.convert('RGB'))
    # One shared palette keeps colours stable across frames and the file small.
    palette_src = Image.new('RGB', (W, H * 3))
    for i, idx in enumerate((0, FRAMES // 3, 2 * FRAMES // 3)):
        palette_src.paste(frames[idx], (0, H * i))
    pal = palette_src.quantize(colors=255, method=Image.MEDIANCUT)
    quant = [fr.quantize(palette=pal, dither=Image.NONE) for fr in frames]
    OUT.parent.mkdir(parents=True, exist_ok=True)
    quant[0].save(OUT, save_all=True, append_images=quant[1:], duration=FRAME_MS, loop=0, optimize=True, disposal=1)
    print(OUT, f'{OUT.stat().st_size // 1024} KB', len(frames), 'frames', total, 's')


if __name__ == '__main__':
    main()
