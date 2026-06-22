import { interpolate, spring } from "remotion";

export const zoomIn = (frame, fps, start, end, fromScale = 1, toScale = 1.18) =>
  interpolate(frame, [start, end], [fromScale, toScale], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

export const zoomOut = (frame, fps, start, end, fromScale = 1.18, toScale = 1) =>
  interpolate(frame, [start, end], [fromScale, toScale], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

export const fadeIn = (frame, start, duration) =>
  interpolate(frame, [start, start + duration], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

export const fadeOut = (frame, start, duration) =>
  interpolate(frame, [start, start + duration], [1, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

export const slideUp = (frame, fps, start) => {
  const progress = spring({ frame: frame - start, fps, config: { damping: 14, stiffness: 120 } });
  return interpolate(progress, [0, 1], [80, 0]);
};

export const slideLeft = (frame, fps, start) => {
  const progress = spring({ frame: frame - start, fps, config: { damping: 14, stiffness: 120 } });
  return interpolate(progress, [0, 1], [120, 0]);
};

export const popScale = (frame, fps, start) =>
  spring({ frame: frame - start, fps, config: { damping: 10, stiffness: 200 } });

export const shakeX = (frame, intensity = 8) =>
  Math.sin(frame * 1.8) * intensity * Math.exp(-frame * 0.05);

export const pulseScale = (frame, base = 1, amplitude = 0.04, speed = 0.12) =>
  base + Math.sin(frame * speed) * amplitude;
