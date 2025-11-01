import React from 'react';

interface ProgressBarProps {
  percentage: number;
}

export const ProgressBar: React.FC<ProgressBarProps> = ({ percentage }) => {
  const clampedPercentage = Math.min(Math.max(percentage, 0), 100);

  const getGradient = () => {
    if (clampedPercentage >= 100) return 'from-emerald-500 to-green-500';
    if (clampedPercentage >= 85) return 'from-lime-500 to-emerald-500';
    if (clampedPercentage >= 50) return 'from-yellow-500 to-orange-500';
    return 'from-orange-500 to-red-500';
  };

  return (
    <div className="w-full bg-slate-700 rounded-full h-5 overflow-hidden border border-slate-600">
      <div
        className={`bg-gradient-to-r ${getGradient()} h-full rounded-full transition-all duration-500 ease-out`}
        style={{ width: `${clampedPercentage}%` }}
      />
    </div>
  );
};