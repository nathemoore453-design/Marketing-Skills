import React from "react";
import { useCurrentFrame } from "remotion";
import { interpolate } from "remotion";

export const GlitchTransition = ({ startFrame, duration = 12 }) => {
  const frame = useCurrentFrame();
  const local = frame - startFrame;

  if (local < 0 || local > duration) return null;

  const progress = local / duration;
  const opacity = local < duration / 2
    ? interpolate(local, [0, duration / 2], [0, 1], { extrapolateRight: "clamp" })
    : interpolate(local, [duration / 2, duration], [1, 0], { extrapolateLeft: "clamp" });

  const glitchOffset = local % 3 === 0 ? Math.random() * 24 - 12 : 0;

  return (
    <div
      style={{
        position: "absolute",
        inset: 0,
        zIndex: 50,
        overflow: "hidden",
        opacity,
      }}
    >
      <div
        style={{
          position: "absolute",
          inset: 0,
          background: "rgba(0,0,0,0.85)",
        }}
      />
      {[...Array(8)].map((_, i) => (
        <div
          key={i}
          style={{
            position: "absolute",
            left: 0,
            right: 0,
            height: `${Math.random() * 12 + 4}%`,
            top: `${(i / 8) * 100 + glitchOffset}%`,
            background: i % 2 === 0
              ? `rgba(255,${50 + i * 20},0,0.15)`
              : `rgba(0,${100 + i * 20},255,0.12)`,
            transform: `translateX(${glitchOffset * (i % 2 === 0 ? 1 : -1)}px)`,
          }}
        />
      ))}
      <div
        style={{
          position: "absolute",
          inset: 0,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          color: "#fff",
          fontSize: 120,
          fontWeight: 900,
          letterSpacing: "-4px",
          fontFamily: "'Impact', sans-serif",
          textShadow: "4px 0 0 red, -4px 0 0 cyan",
          opacity: local % 3 === 0 ? 0.6 : 0,
        }}
      >
        ✦
      </div>
    </div>
  );
};
