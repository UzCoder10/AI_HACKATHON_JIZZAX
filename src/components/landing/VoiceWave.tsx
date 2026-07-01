"use client";

export function VoiceWave({
  count,
  color,
  maxH = 18,
  gap = 3,
  speed = 0.9,
}: {
  count: number;
  color: string;
  maxH?: number;
  gap?: number;
  speed?: number;
}) {
  return (
    <div className="flex items-center" style={{ gap, height: maxH }}>
      {Array.from({ length: count }, (_, i) => (
        <span
          key={i}
          className="lp-wave-bar"
          style={{
            height: maxH,
            background: color,
            animationDuration: `${speed}s`,
            animationDelay: `${(i * 0.08).toFixed(2)}s`,
          }}
        />
      ))}
    </div>
  );
}
