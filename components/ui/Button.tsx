
import React from 'react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children: React.ReactNode;
  variant?: 'primary' | 'secondary' | 'danger';
  className?: string;
}

export const Button: React.FC<ButtonProps> = ({ children, variant = 'primary', className = '', ...props }) => {
  const baseClasses = 'px-4 py-2 rounded-md font-semibold focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-slate-900 transition-transform transform active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2';

  const variantClasses = {
    primary: 'bg-sky-600 text-white hover:bg-sky-500 focus:ring-sky-500',
    secondary: 'bg-slate-600 text-white hover:bg-slate-500 focus:ring-slate-500',
    danger: 'bg-red-600 text-white hover:bg-red-500 focus:ring-red-500',
  };

  return (
    <button className={`${baseClasses} ${variantClasses[variant]} ${className}`} {...props}>
      {children}
    </button>
  );
};
