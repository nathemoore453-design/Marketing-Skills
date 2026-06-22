import React from "react";
import { useCurrentFrame } from "remotion";
import { interpolate, spring } from "remotion";
import { useVideoConfig } from "remotion";

export const CounterWidget = ({ label, targetValue, suffix = "", startFrame, endFrame }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  if (frame < startFrame || frame > endFrame) return null;

  const localFrame = frame - startFrame;
  const duration = endFrame - startFrame;

  const progress = interpolate(localFrame, [0, Math.min(duration * 0.75, 60)], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  const currentValue = Math.round(progress * targetValue);

  const scaleIn = spring({ frame: localFrame, fps, config: { damping: 12, stiffness: 150 } });
  const opacity = interpolate(localFrame, [0, 6, duration - 10, duration], [0, 1, 1, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  return (
    <div
      style={{
        position: "absolute",
        right: 48,
        top: 180,
        textAlign: "center",
        transform: `scale(${scaleIn})`,
        opacity,
        zIndex: 25,
      }}
    >
      <div
        style={{
          background: "rgba(0,0,0,0.75)",
          border: "3px solid #FFD700",
          borderRadius: 20,
          padding: "20px 28px",
          backdropFilter: "blur(12px)",
        }}
      >
        <div
          style={{
            color: "#FFD700",
            fontSize: 72,
            fontWeight: 900,
            fontFamily: "'Arial Black', sans-serif",
            lineHeight: 1,
            textShadow: "0 0 20px rgba(255,200,0,0.8)",
          }}
        >
          {currentValue.toLocaleString()}{suffix}
        </div>
        <div
          style={{
            color: "#fff",
            fontSize: 26,
            fontWeight: 700,
            fontFamily: "'Arial', sans-serif",
            marginTop: 8,
            textTransform: "uppercase",
            letterSpacing: "2px",
          }}
        >
          {label}
        </div>
      </div>
    </div>
  );
};
