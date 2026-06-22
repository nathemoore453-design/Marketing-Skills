import React from "react";
import { useCurrentFrame, useVideoConfig } from "remotion";
import { fadeIn, fadeOut, slideUp, popScale } from "./animations";

const GLOW_GOLD = "0 0 20px rgba(255,200,0,0.9), 0 0 40px rgba(255,150,0,0.6)";
const GLOW_WHITE = "0 0 16px rgba(255,255,255,0.9), 0 0 32px rgba(255,255,255,0.4)";
const GLOW_RED = "0 0 20px rgba(255,50,50,0.9), 0 0 40px rgba(200,0,0,0.6)";

export const TextOverlay = ({
  text,
  startFrame,
  endFrame,
  style = "hero",
  emoji = "",
  color = "#fff",
  glow = "gold",
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  if (frame < startFrame || frame > endFrame) return null;

  const localFrame = frame - startFrame;
  const duration = endFrame - startFrame;

  const opacity =
    fadeIn(frame, startFrame, 8) * fadeOut(frame, endFrame - 12, 12);
  const translateY = slideUp(frame, fps, startFrame);
  const scale = popScale(frame, fps, startFrame);

  const glowMap = { gold: GLOW_GOLD, white: GLOW_WHITE, red: GLOW_RED };
  const textShadow = glowMap[glow] || GLOW_GOLD;

  const styles = {
    hero: {
      fontSize: 88,
      fontWeight: 900,
      letterSpacing: "-2px",
      lineHeight: 1.1,
      textTransform: "uppercase",
    },
    sub: {
      fontSize: 52,
      fontWeight: 700,
      letterSpacing: "1px",
      lineHeight: 1.3,
    },
    caption: {
      fontSize: 42,
      fontWeight: 600,
      letterSpacing: "0.5px",
      lineHeight: 1.4,
    },
    cta: {
      fontSize: 68,
      fontWeight: 900,
      letterSpacing: "-1px",
      textTransform: "uppercase",
      background: "linear-gradient(135deg, #FFD700, #FF6B35)",
      WebkitBackgroundClip: "text",
      WebkitTextFillColor: "transparent",
    },
  };

  return (
    <div
      style={{
        position: "absolute",
        width: "100%",
        textAlign: "center",
        opacity,
        transform: `translateY(${translateY}px) scale(${scale})`,
        color,
        fontFamily: "'Arial Black', 'Impact', sans-serif",
        textShadow,
        padding: "0 48px",
        boxSizing: "border-box",
        ...styles[style],
      }}
    >
      {emoji && <span style={{ display: "block", fontSize: "0.7em", marginBottom: 8 }}>{emoji}</span>}
      {text}
    </div>
  );
};
