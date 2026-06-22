import React from "react";
import {
  AbsoluteFill,
  Video,
  useCurrentFrame,
  useVideoConfig,
  interpolate,
  spring,
  staticFile,
} from "remotion";
import { zoomIn, zoomOut, fadeIn, fadeOut, pulseScale } from "./animations";
import { TextOverlay } from "./TextOverlay";
import { GlitchTransition } from "./GlitchTransition";
import { ParticleEffect } from "./ParticleEffect";
import { LowerThird } from "./LowerThird";
import { CounterWidget } from "./CounterWidget";

// ── Viral pacing map (30 fps, ~30 s) ─────────────────────────────────────────
// 0-60   Hook / cold open     – tight zoom-in + bold title
// 60-90  Glitch cut + energy spike
// 90-180 Main content         – punchy subtitle, lower-third, counter
// 180-210 Beat drop / flash
// 210-330 Value reveal        – slide-in callout, particle burst
// 330-360 Glitch out
// 360-480 Social proof        – star rating, counter
// 480-510 Flash + transition
// 510-660 CTA hammer          – repeated text pulse
// 660-720 Outro / loop tease  – zoom out, fade to logo text
// 720-900 Replay tease + hard cut
// ─────────────────────────────────────────────────────────────────────────────

const FLASH_FRAMES = [60, 90, 180, 210, 330, 360, 480, 510, 720];

const FlashFrame = ({ frame }) => {
  const isFlash = FLASH_FRAMES.some((f) => Math.abs(frame - f) <= 2);
  if (!isFlash) return null;
  const dist = FLASH_FRAMES.reduce((min, f) => Math.min(min, Math.abs(frame - f)), 999);
  const opacity = interpolate(dist, [0, 3], [0.85, 0], { extrapolateRight: "clamp" });
  return (
    <div style={{ position: "absolute", inset: 0, background: "#fff", opacity, zIndex: 99 }} />
  );
};

const VignetteOverlay = () => (
  <div
    style={{
      position: "absolute",
      inset: 0,
      background:
        "radial-gradient(ellipse at center, transparent 45%, rgba(0,0,0,0.72) 100%)",
      zIndex: 5,
      pointerEvents: "none",
    }}
  />
);

const ColorGrade = ({ frame }) => {
  // Warm push during hook, cool during CTA
  const warmth = interpolate(frame, [0, 90], [0.12, 0], { extrapolateRight: "clamp" });
  const coolCTA = interpolate(frame, [510, 570], [0, 0.08], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  return (
    <>
      <div style={{ position: "absolute", inset: 0, background: `rgba(255,140,0,${warmth})`, zIndex: 6, mixBlendMode: "multiply", pointerEvents: "none" }} />
      <div style={{ position: "absolute", inset: 0, background: `rgba(0,60,180,${coolCTA})`, zIndex: 6, mixBlendMode: "screen", pointerEvents: "none" }} />
    </>
  );
};

// Animated emoji pop (floating sticker)
const EmojiPop = ({ emoji, x, y, startFrame, size = 90 }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const local = frame - startFrame;
  if (local < 0 || local > 60) return null;
  const scale = spring({ frame: local, fps, config: { damping: 8, stiffness: 220 } });
  const opacity = interpolate(local, [0, 6, 50, 60], [0, 1, 1, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const floatY = interpolate(local, [0, 60], [0, -30]);
  return (
    <div style={{ position: "absolute", left: `${x}%`, top: `${y}%`, fontSize: size, transform: `scale(${scale}) translateY(${floatY}px)`, opacity, zIndex: 40, userSelect: "none" }}>
      {emoji}
    </div>
  );
};

export const ViralVideo = () => {
  const frame = useCurrentFrame();
  const { fps, width, height } = useVideoConfig();

  // ── Zoom controller ──────────────────────────────────────────────────────
  let videoScale = 1;
  let originX = "50%";
  let originY = "50%";

  if (frame < 60) {
    // Hook: zoom in hard
    videoScale = interpolate(frame, [0, 60], [1.0, 1.25], { extrapolateRight: "clamp" });
    originX = "50%"; originY = "40%";
  } else if (frame < 90) {
    videoScale = 1.25;
  } else if (frame < 180) {
    // Content: slight drift zoom
    videoScale = interpolate(frame, [90, 180], [1.25, 1.12], { extrapolateRight: "clamp" });
    originX = "48%"; originY = "50%";
  } else if (frame < 210) {
    // Beat drop snap to wide
    videoScale = interpolate(frame, [180, 210], [1.12, 1.0], { extrapolateRight: "clamp" });
  } else if (frame < 330) {
    // Value reveal – creep zoom in from right
    videoScale = interpolate(frame, [210, 330], [1.0, 1.18], { extrapolateRight: "clamp" });
    originX = "55%"; originY = "45%";
  } else if (frame < 480) {
    // Social proof – hold zoom
    videoScale = 1.18;
  } else if (frame < 510) {
    // Flash: snap back
    videoScale = interpolate(frame, [480, 510], [1.18, 1.0], { extrapolateRight: "clamp" });
  } else if (frame < 660) {
    // CTA: slow dramatic zoom in
    videoScale = interpolate(frame, [510, 660], [1.0, 1.32], { extrapolateRight: "clamp" });
    originX = "50%"; originY = "35%";
  } else if (frame < 720) {
    // Outro zoom back out
    videoScale = interpolate(frame, [660, 720], [1.32, 0.95], { extrapolateRight: "clamp" });
  } else {
    // Replay tease: subtle pulse
    videoScale = pulseScale(frame - 720, 0.95, 0.03, 0.08);
  }

  // ── Shake during glitch transitions ──────────────────────────────────────
  const isGlitch = (f) => (f >= 60 && f < 90) || (f >= 330 && f < 360) || (f >= 480 && f < 510) || (f >= 720 && f < 740);
  const shakeAmount = isGlitch(frame) ? Math.sin(frame * 3.7) * 10 : 0;

  // ── Overall opacity ───────────────────────────────────────────────────────
  const globalOpacity = interpolate(frame, [0, 12, 888, 900], [0, 1, 1, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });

  return (
    <AbsoluteFill style={{ background: "#000", overflow: "hidden" }}>
      {/* ── Video layer ─────────────────────────────────────────────────── */}
      <AbsoluteFill
        style={{
          opacity: globalOpacity,
          transform: `scale(${videoScale}) translateX(${shakeAmount}px)`,
          transformOrigin: `${originX} ${originY}`,
          transition: "transform-origin 0s",
        }}
      >
        <Video src={staticFile("source.mp4")} startFrom={0} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
      </AbsoluteFill>

      <VignetteOverlay />
      <ColorGrade frame={frame} />

      {/* ── Flash frames ────────────────────────────────────────────────── */}
      <FlashFrame frame={frame} />

      {/* ── Glitch transitions ──────────────────────────────────────────── */}
      <GlitchTransition startFrame={60} duration={18} />
      <GlitchTransition startFrame={330} duration={14} />
      <GlitchTransition startFrame={480} duration={14} />
      <GlitchTransition startFrame={720} duration={18} />

      {/* ── Particles ───────────────────────────────────────────────────── */}
      <ParticleEffect startFrame={210} duration={120} />
      <ParticleEffect startFrame={510} duration={150} />

      {/* ── HOOK texts (0-60) ───────────────────────────────────────────── */}
      <AbsoluteFill style={{ zIndex: 10, display: "flex", alignItems: "center", justifyContent: "center" }}>

        {/* Big hook title */}
        <TextOverlay
          text="THIS CHANGED EVERYTHING"
          startFrame={8}
          endFrame={55}
          style="hero"
          glow="gold"
          emoji="🔥"
        />

        {/* Content subtitle */}
        <TextOverlay
          text="Watch until the end"
          startFrame={95}
          endFrame={175}
          style="sub"
          glow="white"
          color="#F0F0F0"
        />

        {/* Lower third – who's this */}
        <LowerThird
          title="Terroire × InspireMoore"
          subtitle="Exclusive Reveal"
          startFrame={100}
          endFrame={200}
        />

        {/* Beat drop energy */}
        <TextOverlay
          text="🚨 WAIT FOR IT 🚨"
          startFrame={160}
          endFrame={208}
          style="caption"
          glow="red"
          color="#FF4444"
        />

        {/* Value reveal */}
        <TextOverlay
          text="The moment you've been waiting for"
          startFrame={215}
          endFrame={320}
          style="sub"
          glow="white"
          color="#fff"
        />

        {/* Counter widget */}
        <CounterWidget
          label="Views"
          targetValue={1000000}
          suffix="+"
          startFrame={220}
          endFrame={325}
        />

        {/* Social proof */}
        <TextOverlay
          text="⭐⭐⭐⭐⭐"
          startFrame={365}
          endFrame={478}
          style="hero"
          glow="gold"
        />

        <TextOverlay
          text="Everyone is talking about this"
          startFrame={380}
          endFrame={478}
          style="caption"
          glow="gold"
          color="#FFD700"
        />

        {/* CTA pulse – repeated for impact */}
        <TextOverlay
          text="FOLLOW NOW 👆"
          startFrame={515}
          endFrame={580}
          style="cta"
          glow="gold"
        />

        <TextOverlay
          text="DON'T MISS OUT"
          startFrame={590}
          endFrame={655}
          style="cta"
          glow="red"
          color="#FF6B35"
        />

        {/* Outro */}
        <TextOverlay
          text="See you next time ✨"
          startFrame={665}
          endFrame={718}
          style="sub"
          glow="white"
          color="#fff"
        />

        {/* Replay tease */}
        <TextOverlay
          text="▶ WATCH AGAIN"
          startFrame={745}
          endFrame={895}
          style="caption"
          glow="gold"
          color="#FFD700"
        />
      </AbsoluteFill>

      {/* ── Floating emoji stickers ─────────────────────────────────────── */}
      <EmojiPop emoji="💥" x={5}  y={65} startFrame={65}  size={80} />
      <EmojiPop emoji="🔥" x={78} y={70} startFrame={95}  size={72} />
      <EmojiPop emoji="⚡" x={8}  y={30} startFrame={185} size={80} />
      <EmojiPop emoji="🎯" x={75} y={25} startFrame={215} size={76} />
      <EmojiPop emoji="💎" x={6}  y={60} startFrame={370} size={80} />
      <EmojiPop emoji="🚀" x={76} y={55} startFrame={490} size={80} />
      <EmojiPop emoji="👀" x={10} y={40} startFrame={515} size={72} />
      <EmojiPop emoji="🎉" x={72} y={35} startFrame={600} size={80} />
    </AbsoluteFill>
  );
};

