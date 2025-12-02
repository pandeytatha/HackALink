'use client';

import { ReactNode } from 'react';

interface Props {
  children: ReactNode;
  title?: string;
  subtitle?: string;
  action?: ReactNode;
  className?: string;
  noPadding?: boolean;
  variant?: 'default' | 'elevated' | 'interactive';
}

export default function Card({ 
  children, 
  title, 
  subtitle, 
  action,
  className = '', 
  noPadding = false,
  variant = 'default'
}: Props) {
  const variantClasses = {
    default: 'bg-white rounded-xl border border-gray-200 shadow-sm',
    elevated: 'bg-white rounded-xl border border-gray-100 shadow-md',
    interactive: 'bg-white rounded-xl border border-gray-200 shadow-sm transition-all duration-200 hover:shadow-md hover:border-gray-300 hover:-translate-y-0.5',
  };

  return (
    <div className={`${variantClasses[variant]} ${className}`}>
      {(title || subtitle || action) && (
        <div className="px-6 pt-5 pb-4">
          <div className="flex items-start justify-between gap-4">
            <div className="min-w-0">
              {title && (
                <h2 className="text-base font-semibold text-gray-900">
                  {title}
                </h2>
              )}
              {subtitle && (
                <p className="text-sm text-gray-500 mt-1">
                  {subtitle}
                </p>
              )}
            </div>
            {action && (
              <div className="flex-shrink-0">
                {action}
              </div>
            )}
          </div>
        </div>
      )}
      <div className={noPadding ? '' : (title || subtitle ? 'px-6 pb-6' : 'p-6')}>
        {children}
      </div>
    </div>
  );
}
