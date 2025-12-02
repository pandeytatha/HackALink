'use client';

import { ReactNode } from 'react';

interface Props {
  children: ReactNode;
  onClick?: () => void;
  disabled?: boolean;
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  className?: string;
  type?: 'button' | 'submit';
  icon?: ReactNode;
  iconPosition?: 'left' | 'right';
  fullWidth?: boolean;
}

export default function Button({
  children,
  onClick,
  disabled = false,
  variant = 'primary',
  size = 'md',
  className = '',
  type = 'button',
  icon,
  iconPosition = 'left',
  fullWidth = false,
}: Props) {
  const baseClasses = `
    inline-flex items-center justify-center gap-2 font-medium
    transition-all duration-200 ease-out
    focus:outline-none focus-visible:ring-4
    disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none
  `;
  
  const variantClasses = {
    primary: `
      bg-blue-500 text-white rounded-lg
      hover:bg-blue-600 active:bg-blue-700
      focus-visible:ring-blue-100
      shadow-sm hover:shadow
    `,
    secondary: `
      bg-white text-gray-700 rounded-lg border border-gray-200
      hover:bg-gray-50 hover:border-gray-300 active:bg-gray-100
      focus-visible:ring-gray-100
    `,
    ghost: `
      text-gray-600 rounded-lg
      hover:bg-gray-100 hover:text-gray-900 active:bg-gray-200
      focus-visible:ring-gray-100
    `,
    danger: `
      bg-red-500 text-white rounded-lg
      hover:bg-red-600 active:bg-red-700
      focus-visible:ring-red-100
    `,
  };

  const sizeClasses = {
    sm: 'px-3.5 py-2 text-sm',
    md: 'px-5 py-2.5 text-sm',
    lg: 'px-6 py-3 text-base',
  };

  const widthClass = fullWidth ? 'w-full' : '';

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={`
        ${baseClasses}
        ${variantClasses[variant]}
        ${sizeClasses[size]}
        ${widthClass}
        ${className}
      `.trim().replace(/\s+/g, ' ')}
    >
      {icon && iconPosition === 'left' && (
        <span className="flex-shrink-0 -ml-0.5">{icon}</span>
      )}
      {children}
      {icon && iconPosition === 'right' && (
        <span className="flex-shrink-0 -mr-0.5">{icon}</span>
      )}
    </button>
  );
}
