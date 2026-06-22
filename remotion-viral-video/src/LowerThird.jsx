import React from "react";
import { useCurrentFrame, useVideoConfig } from "remotion";
import { interpolate, spring } from "remotion";

export const LowerThird = ({ title, subtitle, startFrame, endFrame }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  if (frame < startFrame || frame > endFrame) return null;

  const localFrame = frame - startFrame;
  const slideProgress = spring({ frame: localFrame, fps, config: { damping: 16, stiffness: 130 } });
  const slideX = interpolate(slideProgress, [0, 1], [-600, 0]);

  const exitProgress = endFrame - frame < 20
    ? interpolate(frame, [endFrame - 20, endFrame], [1, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" })
    : 1;

  return (
    <div
      style={{
        position: "absolute",
        bottom: 220,
        left: 0,
        right: 0,
        padding: "0 48px",
        opacity: exitProgress,
        transform: `translateX(${slideX}px)`,
        zIndex: 30,
      }}
    >
      <div
        style={{
          display: "inline-block",
          background: "linear-gradient(135deg, #FF6B35, #FFD700)",
          padding: "12px 28px 12px 24px",
          borderRadius: "0 12px 12px 0",
          borderLeft: "6px solid #fff",
        }}
      >
        <div style={{
          color: "#fff",
          fontSize: 40,
          fontWeight: 900,
          fontFamily: "'Arial Black', sans-serif",
          textShadow: "2px 2px 4px rgba(0,0,0,0.5)",
          lineHeight: 1.2,
        }}>
          {title}
        </div>
        {subtitle && (
          <div style={{
            color: "rgba(255,255,255,0.9)",
            fontSize: 28,
            fontWeight: 600,
            fontFamily: "'Arial', sans-serif",
            marginTop: 4,
          }}>
            {subtitle}
          </div>
        )}
      </div>
    </div>
  );
};
