/**
 * ThemeText Component
 * 
 * A utility component that ensures consistent theme-aware text styling
 * across the entire application. Use this instead of plain text elements
 * to guarantee theme consistency.
 */

import React from 'react';
import { themeClasses } from '@/lib/theme/themeUtils';

type TextVariant = 'primary' | 'secondary' | 'muted' | 'accent';
type TextSize = 'xs' | 'sm' | 'base' | 'lg' | 'xl' | '2xl' | '3xl';
type TextWeight = 'normal' | 'medium' | 'semibold' | 'bold';

interface ThemeTextProps {
  variant?: TextVariant;
  size?: TextSize;
  weight?: TextWeight;
  className?: string;
  children: React.ReactNode;
}

const sizeClasses = {
  xs: 'text-xs',
  sm: 'text-sm',
  base: 'text-base',
  lg: 'text-lg',
  xl: 'text-xl',
  '2xl': 'text-2xl',
  '3xl': 'text-3xl'
};

const weightClasses = {
  normal: 'font-normal',
  medium: 'font-medium',
  semibold: 'font-semibold',
  bold: 'font-bold'
};

export function ThemeText({
  variant = 'primary',
  size = 'base',
  weight = 'normal',
  className = '',
  children,
  ...props
}: ThemeTextProps & React.HTMLAttributes<HTMLSpanElement>) {
  
  const baseClasses = [
    themeClasses.text[variant],
    sizeClasses[size],
    weightClasses[weight],
    className
  ].filter(Boolean).join(' ');

  return (
    <span className={baseClasses} {...props}>
      {children}
    </span>
  );
}

// Preset components for common use cases
export const ThemeHeading = ({ level = 1, children, className = '', ...props }: { level?: 1 | 2 | 3 | 4 | 5 | 6 } & ThemeTextProps) => {
  const HeadingTag = `h${level}` as keyof JSX.IntrinsicElements;
  const size = level <= 2 ? '2xl' : level <= 4 ? 'xl' : 'lg';
  const baseClasses = [
    themeClasses.text.primary,
    sizeClasses[size],
    weightClasses.semibold,
    className
  ].filter(Boolean).join(' ');
  
  return React.createElement(HeadingTag, { className: baseClasses, ...props }, children);
};

export const ThemeParagraph = ({ className = '', ...props }: ThemeTextProps) => (
  <p className={`${themeClasses.text.primary} ${className}`} {...props} />
);

export const ThemeLabel = ({ className = '', ...props }: ThemeTextProps) => (
  <label className={`${themeClasses.text.secondary} text-sm font-medium ${className}`} {...props} />
);

export const ThemeCaption = ({ className = '', ...props }: ThemeTextProps) => (
  <span className={`${themeClasses.text.muted} text-xs ${className}`} {...props} />
);