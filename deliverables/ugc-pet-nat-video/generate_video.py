#!/usr/bin/env python3
"""
Generates a vertical (9:16) UGC-style teaser/storyboard video for the
Inspire Moore Winery "Unsupervised" Pet-Nat, using the product photo plus
animated caption cards. Intended as a previsualization/captions-led cut --
swap in real creator footage per the shot list in script.md for the final ad.

Usage: python3 generate_video.py
Requires: Pillow, ffmpeg
"""

import os
import subprocess
from PIL import Image, ImageDraw, ImageFont, ImageFilter

W, H = 1080, 1920
FPS = 30
SCENE_SECONDS = 2.0

BASE = os.path.dirname(os.path.abspath(__file__))
ASSETS = os.path.join(BASE, "assets")
FRAMES_DIR = "/tmp/ugc/frames"
CLIPS_DIR = "/tmp/ugc/clips"
OUTPUT = os.path.join(BASE, "output", "pet_nat_ugc_teaser.mp4")

FONT_BOLD = "/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf"

TOP_COLOR = (252, 211, 170)     # warm peach (echoes label rainbow)
BOTTOM_COLOR = (197, 178, 224)  # soft lavender


def make_background():
    bg = Image.new("RGB", (W, H))
    px = bg.load()
    for y in range(H):
        t = y / (H - 1)
        r = int(TOP_COLOR[0] + (BOTTOM_COLOR[0] - TOP_COLOR[0]) * t)
        g = int(TOP_COLOR[1] + (BOTTOM_COLOR[1] - TOP_COLOR[1]) * t)
        b = int(TOP_COLOR[2] + (BOTTOM_COLOR[2] - TOP_COLOR[2]) * t)
        for x in range(0, W, 4):
            for dx in range(4):
                if x + dx < W:
                    px[x + dx, y] = (r, g, b)

    # soft radial glow behind the product
    glow = Image.new("L", (W, H), 0)
    gdraw = ImageDraw.Draw(glow)
    cx, cy, rad = W // 2, int(H * 0.56), int(W * 0.62)
    gdraw.ellipse((cx - rad, cy - rad, cx + rad, cy + rad), fill=80)
    glow = glow.filter(ImageFilter.GaussianBlur(120))
    glow_color = Image.new("RGB", (W, H), (255, 255, 255))
    bg = Image.composite(glow_color, bg, glow)
    return bg


def load_bottle_variant(name):
    img = Image.open(os.path.join(ASSETS, "bottle.png")).convert("RGBA")
    if name == "full":
        return img
    if name == "label":
        # tight crop on the "Unsupervised" rainbow label
        return img.crop((0, 870, 435, 1530))
    if name == "neck":
        # crop on neck/cork + "how wild is wild" text
        return img.crop((0, 0, 435, 380))
    raise ValueError(name)


def paste_with_shadow(bg, fg, box_top, box_height):
    # scale fg to target height, preserve aspect ratio, center horizontally
    scale = box_height / fg.height
    new_w = int(fg.width * scale)
    fg_resized = fg.resize((new_w, box_height), Image.LANCZOS)

    x = (W - new_w) // 2
    y = box_top

    # drop shadow
    shadow = Image.new("RGBA", bg.size, (0, 0, 0, 0))
    alpha = fg_resized.split()[-1]
    shadow_layer = Image.new("RGBA", fg_resized.size, (40, 30, 20, 110))
    shadow_layer.putalpha(alpha)
    shadow.paste(shadow_layer, (x + 18, y + 28), shadow_layer)
    shadow = shadow.filter(ImageFilter.GaussianBlur(28))

    bg = bg.convert("RGBA")
    bg.alpha_composite(shadow)
    bg.alpha_composite(fg_resized, (x, y))
    return bg.convert("RGB")


def draw_caption(img, lines, top_y, max_font_size=72, color=(255, 255, 255)):
    draw = ImageDraw.Draw(img)
    max_width = W - 100

    # shrink font until the widest line fits within the frame
    font_size = max_font_size
    while font_size > 30:
        font = ImageFont.truetype(FONT_BOLD, font_size)
        widest = max(draw.textbbox((0, 0), line, font=font)[2] for line in lines)
        if widest <= max_width:
            break
        font_size -= 2

    line_height = int(font_size * 1.3)
    for i, line in enumerate(lines):
        bbox = draw.textbbox((0, 0), line, font=font)
        tw = bbox[2] - bbox[0]
        x = (W - tw) // 2
        y = top_y + i * line_height
        draw.text((x, y), line, font=font, fill=color, stroke_width=8,
                   stroke_fill=(20, 14, 10))
    return img


def draw_brand_footer(img, text="INSPIRE MOORE WINERY"):
    draw = ImageDraw.Draw(img)
    font = ImageFont.truetype(FONT_BOLD, 34)
    bbox = draw.textbbox((0, 0), text, font=font)
    tw = bbox[2] - bbox[0]
    x = (W - tw) // 2
    draw.text((x, H - 90), text, font=font, fill=(60, 45, 35, 200),
               stroke_width=2, stroke_fill=(255, 255, 255, 160))
    return img


SCENES = [
    dict(
        captions=["POV: your friend hands you", 'a wine called "UNSUPERVISED"'],
        variant="full", scale=0.70,
    ),
    dict(
        captions=["wait... it's a PET-NAT?", "AND it's fizzy??"],
        variant="label", scale=0.66,
    ),
    dict(
        captions=["orange blossom. creamsicle.", "pineapple. WHAT."],
        variant="full", scale=0.70,
    ),
    dict(
        captions=["made the WILD way —", "unfiltered, unfined, zero shortcuts"],
        variant="neck", scale=0.62,
    ),
    dict(
        captions=["officially NY's BEST PET-NAT", "2024 NY Wine Classic"],
        variant="full", scale=0.70,
    ),
    dict(
        captions=["Finger Lakes. Cayuga White.", "bottled with zero chill."],
        variant="full", scale=0.70,
    ),
    dict(
        captions=["okay... i need a case.", "or two."],
        variant="full", scale=0.74,
    ),
    dict(
        captions=['"UNSUPERVISED" PET-NAT', "link in bio"],
        variant="full", scale=0.74, footer=True,
    ),
]


def build_scenes():
    os.makedirs(FRAMES_DIR, exist_ok=True)
    bg_base = make_background()
    paths = []
    for idx, scene in enumerate(SCENES):
        frame = bg_base.copy()
        bottle = load_bottle_variant(scene["variant"])
        box_height = int(H * scene["scale"])
        box_top = 480
        frame = paste_with_shadow(frame, bottle, box_top, box_height)
        frame = draw_caption(frame, scene["captions"], top_y=140)
        if scene.get("footer"):
            frame = draw_brand_footer(frame)
        path = os.path.join(FRAMES_DIR, f"scene{idx:02d}.png")
        frame.save(path)
        paths.append(path)
        print("wrote", path)
    return paths


def build_clips(paths):
    os.makedirs(CLIPS_DIR, exist_ok=True)
    clip_paths = []
    for idx, path in enumerate(paths):
        out = os.path.join(CLIPS_DIR, f"clip{idx:02d}.mp4")
        zoom_expr = "min(zoom+0.0012,1.06)"
        vf = (
            f"zoompan=z='{zoom_expr}':d={int(SCENE_SECONDS * FPS)}:"
            f"x='iw/2-(iw/zoom/2)':y='ih/2-(ih/zoom/2)':s={W}x{H}:fps={FPS},"
            f"fade=t=in:st=0:d=0.2,fade=t=out:st={SCENE_SECONDS - 0.2}:d=0.2"
        )
        cmd = [
            "ffmpeg", "-y", "-loop", "1", "-i", path,
            "-t", str(SCENE_SECONDS),
            "-filter_complex", vf,
            "-c:v", "libx264", "-pix_fmt", "yuv420p", "-r", str(FPS),
            out,
        ]
        subprocess.run(cmd, check=True, capture_output=True)
        clip_paths.append(out)
        print("wrote", out)
    return clip_paths


def concat_clips(clip_paths):
    os.makedirs(os.path.dirname(OUTPUT), exist_ok=True)
    list_file = "/tmp/ugc/concat.txt"
    with open(list_file, "w") as f:
        for p in clip_paths:
            f.write(f"file '{p}'\n")
    cmd = [
        "ffmpeg", "-y", "-f", "concat", "-safe", "0", "-i", list_file,
        "-c", "copy", OUTPUT,
    ]
    subprocess.run(cmd, check=True, capture_output=True)
    print("wrote", OUTPUT)


if __name__ == "__main__":
    frame_paths = build_scenes()
    clip_paths = build_clips(frame_paths)
    concat_clips(clip_paths)
