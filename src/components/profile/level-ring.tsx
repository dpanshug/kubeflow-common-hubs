import { LEVELS } from "@/lib/constants";

interface LevelRingProps {
  level: number;
  points: number;
  size?: number;
  children: React.ReactNode;
}

export function LevelRing({ level, points, size = 80, children }: LevelRingProps) {
  const currentLevel = LEVELS.find((l) => l.level === level) || LEVELS[0];
  const nextLevel = LEVELS.find((l) => l.level === level + 1);

  const rawProgress = nextLevel
    ? (points - currentLevel.minPoints) /
      (nextLevel.minPoints - currentLevel.minPoints)
    : 1;
  const progress = Math.max(0.05, Math.min(1, rawProgress));

  const radius = size / 2 - 3;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference * (1 - Math.min(1, Math.max(0, progress)));

  return (
    <div className="relative inline-flex items-center justify-center" style={{ width: size, height: size }}>
      <svg
        className="absolute inset-0 -rotate-90"
        width={size}
        height={size}
        viewBox={`0 0 ${size} ${size}`}
      >
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="var(--border)"
          strokeWidth={3}
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="var(--kf-blue)"
          strokeWidth={3}
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={strokeDashoffset}
          className="transition-[stroke-dashoffset] duration-1000 ease-out"
        />
      </svg>
      <div className="relative">{children}</div>
    </div>
  );
}
