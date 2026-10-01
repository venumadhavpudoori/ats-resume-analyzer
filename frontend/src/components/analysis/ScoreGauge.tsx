import React from 'react';

interface ScoreGaugeProps {
  score: number;
  label: string;
  maxScore?: number;
}

export default function ScoreGauge({ score, label, maxScore = 100 }: ScoreGaugeProps) {
  const percentage = (score / maxScore) * 100;
  const radius = 40;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (percentage / 100) * circumference;

  const getColor = (s: number) => {
    if (s < 50) return 'text-red-500 stroke-red-500';
    if (s < 80) return 'text-yellow-500 stroke-yellow-500';
    return 'text-green-500 stroke-green-500';
  };

  const colorClass = getColor(score);

  return (
    <div className="flex flex-col items-center gap-2">
      <div className="relative flex items-center justify-center">
        <svg className="w-24 h-24 transform -rotate-90">
          <circle
            cx="48"
            cy="48"
            r={radius}
            stroke="currentColor"
            strokeWidth="8"
            fill="transparent"
            className="text-slate-100"
          />
          <circle
            cx="48"
            cy="48"
            r={radius}
            stroke="currentColor"
            strokeWidth="8"
            fill="transparent"
            strokeDasharray={circumference}
            style={{ strokeDashoffset }}
            strokeLinecap="round"
            className={`${colorClass} transition-all duration-1000 ease-out`}
          />
        </svg>
        <span className={`absolute text-2xl font-bold ${colorClass.split(' ')[0]}`}>
          {score}
        </span>
      </div>
      <span className="text-xs font-medium text-slate-500 uppercase tracking-wider">{label}</span>
    </div>
  );
}
