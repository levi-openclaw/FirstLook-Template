interface ProgressBarProps {
  value: number;
  max?: number;
  className?: string;
}

export function ProgressBar({ value, max = 100, className }: ProgressBarProps) {
  const percent = Math.min(100, (value / max) * 100);
  return (
    <div className={`progress ${className ?? ''}`}>
      <div className="progress-fill" style={{ width: `${percent}%` }} />
    </div>
  );
}
