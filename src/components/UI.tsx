/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function Badge({ children, className, variant = 'default', ...props }: { children: React.ReactNode; className?: string; variant?: 'default' | 'urgent' | 'success' | 'warning' | 'info' } & React.HTMLAttributes<HTMLSpanElement>) {
  const variants = {
    default: 'bg-slate-100 text-slate-700',
    urgent: 'bg-red-100 text-red-700 font-bold',
    success: 'bg-emerald-100 text-emerald-700',
    warning: 'bg-amber-100 text-amber-700',
    info: 'bg-blue-100 text-blue-700',
  };
  return (
    <span className={cn('px-2 py-0.5 rounded-full text-xs font-medium uppercase tracking-wider', variants[variant], className)} {...props}>
      {children}
    </span>
  );
}

export function Card({ children, className, ...props }: { children: React.ReactNode; className?: string } & React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={cn('bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm', className)} {...props}>
      {children}
    </div>
  );
}

export function Button({ children, className, variant = 'primary', ...props }: React.ButtonHTMLAttributes<HTMLButtonElement> & { variant?: 'primary' | 'secondary' | 'ghost' | 'danger' }) {
  const variants = {
    primary: 'bg-slate-900 text-white hover:bg-slate-800',
    secondary: 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-50',
    ghost: 'hover:bg-slate-100 text-slate-600',
    danger: 'bg-red-600 text-white hover:bg-red-700',
  };
  return (
    <button className={cn('px-4 py-2 rounded-lg font-medium transition-all active:scale-95 disabled:opacity-50 disabled:pointer-events-none flex items-center justify-center gap-2', variants[variant], className)} {...props}>
      {children}
    </button>
  );
}
