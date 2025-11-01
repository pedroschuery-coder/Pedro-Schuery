import React from 'react';

interface CardProps {
  children: React.ReactNode;
  className?: string;
}

export const Card: React.FC<CardProps> = ({ children, className = '' }) => {
  return (
    <div
      className={`bg-transparent p-6 rounded-xl border border-slate-700/50 shadow-lg ${className}`}
    >
      {children}
    </div>
  );
};