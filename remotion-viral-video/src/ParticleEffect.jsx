import React from "react";
import { useCurrentFrame } from "remotion";
import { interpolate } from "remotion";

const PARTICLES = [...Array(24)].map((_, i) => ({
  id: i,
  x: 10 + ((i * 37) % 80),
  delay: (i * 7) % 30,
  size: 6 + (i % 5) * 4,
  speed: 0.8 + (i % 4) * 0.4,
  color: i % 3 === 0 ? "#FFD700" : i % 3 === 1 ? "#FF6B35" : "#fff",
}));

export const ParticleEffect = ({ startFrame, duration = 60, visible = true }) => {
  const frame = useCurrentFrame();
  const local = frame - startFrame;

  if (!visible || local < 0 || local > duration) return null;

  const globalOpacity = interpolate(local, [0, 8, duration - 12, duration], [0, 1, 1, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  return (
    <div style={{ position: "absolute", inset: 0, overflow: "hidden", zIndex: 20, opacity: globalOpacity }}>
      {PARTICLES.map((p) => {
        const t = ((local - p.delay) * p.speed) % 100;
        if (t < 0) return null;
        const y = interpolate(t, [0, 100], [110, -10]);
        const opacity = interpolate(t, [0, 15, 85, 100], [0, 1, 1, 0]);
        const rotate = t * 3;

        return (
          <div
            key={p.id}
            style={{
              position: "absolute",
              left: `${p.x}%`,
              top: `${y}%`,
              width: p.size,
              height: p.size,
              borderRadius: p.id % 4 === 0 ? "0" : "50%",
              background: p.color,
              opacity,
              transform: `rotate(${rotate}deg)`,
              boxShadow: `0 0 ${p.size * 2}px ${p.color}`,
            }}
          />
        );
      })}
    </div>
  );
};
