# Viral Video — Remotion Composition

A fully-produced, viral-optimised short-form video built with [Remotion](https://remotion.dev).

## What's included

| Feature | Details |
|---|---|
| **Dynamic zoom** | 7 distinct zoom stages — hook pull-in, drift, beat-drop snap, slow CTA creep, outro zoom-out |
| **Animated text** | 12 text overlays: hero, subtitle, caption & CTA styles with spring-physics slide-up and glow |
| **Glitch transitions** | 4 glitch cuts with RGB channel-split and scan-line bars |
| **Flash frames** | White flash on every beat cut for maximum retention shock |
| **Particle burst** | 24 rising particles (gold/orange/white) on value-reveal and CTA sections |
| **Lower third** | Slide-in branded lower-third with gradient bar |
| **Animated counter** | Number counter widget ticking up to 1 M+ |
| **Floating emoji stickers** | 8 spring-animated emoji pops timed to beats |
| **Color grade** | Warm push on hook, cool tint on CTA |
| **Vignette** | Persistent radial vignette to frame the subject |

## Pacing (30 fps, 900 frames ≈ 30 s)

| Frames | Section |
|---|---|
| 0–60 | Cold open hook — tight zoom-in + "THIS CHANGED EVERYTHING" |
| 60–90 | Glitch cut energy spike |
| 90–180 | Main content — subtitle + lower-third |
| 180–210 | Beat-drop flash |
| 210–330 | Value reveal — counter widget + particles |
| 330–360 | Glitch cut |
| 360–480 | Social proof — 5-star rating |
| 480–510 | Flash + snap transition |
| 510–660 | CTA hammer — "FOLLOW NOW" / "DON'T MISS OUT" |
| 660–720 | Outro zoom-out |
| 720–900 | Replay tease |

## Quick start

```bash
npm install

# Open the Remotion Studio (live preview in browser)
npm run studio

# Render to MP4
npm run render
```

Output lands in `out/viral-output.mp4`.

## Source video

Place your source file at `public/source.mp4` (already copied there).  
The composition is 1080 × 1920 (TikTok / Reels / Shorts vertical format).

## Customising text

Edit the `TextOverlay` blocks in `src/ViralVideo.jsx`.  
Each overlay accepts: `text`, `startFrame`, `endFrame`, `style` (`hero` | `sub` | `caption` | `cta`), `glow` (`gold` | `white` | `red`), and `emoji`.
