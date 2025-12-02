'use client';

import { ReactNode } from 'react';

interface Props {
  title: string;
  subtitle?: string;
  actions?: ReactNode;
  breadcrumb?: { label: string; href: string }[];
}

export default function PageHeader({ title, subtitle, actions, breadcrumb }: Props) {
  return (
    <div className="mb-8">
      {breadcrumb && breadcrumb.length > 0 && (
        <nav className="flex items-center gap-2 text-sm text-gray-500 mb-4">
          {breadcrumb.map((item, idx) => (
            <span key={item.href} className="flex items-center gap-2">
              {idx > 0 && <span className="text-gray-300">/</span>}
              <a href={item.href} className="hover:text-blue-600 transition-colors">
                {item.label}
              </a>
            </span>
          ))}
        </nav>
      )}
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">{title}</h1>
          {subtitle && (
            <p className="text-gray-500 mt-1">{subtitle}</p>
          )}
        </div>
        {actions && (
          <div className="flex items-center gap-3 flex-shrink-0">
            {actions}
          </div>
        )}
      </div>
    </div>
  );
}
