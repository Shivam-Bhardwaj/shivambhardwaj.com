import React from 'react';
import { motion } from 'framer-motion';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost' | 'robotics' | 'destructive';
  size?: 'sm' | 'md' | 'lg' | 'xl';
  loading?: boolean;
  icon?: React.ReactNode;
  iconPosition?: 'left' | 'right';
  children: React.ReactNode;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ 
    variant = 'primary', 
    size = 'md', 
    loading = false, 
    icon, 
    iconPosition = 'left',
    children, 
    className = '', 
    disabled,
    ...props 
  }, ref) => {
    const baseClasses = [
      'inline-flex items-center justify-center gap-2 font-medium',
      'rounded-lg transition-all duration-300 ease-in-out',
      'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-500 focus-visible:ring-offset-2',
      'disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none',
      'relative overflow-hidden'
    ];

    const variantClasses = {
      primary: [
        'bg-gradient-to-r from-rose-600 to-violet-500 text-white',
        'dark:from-rose-500 dark:to-violet-400',
        'shadow-lg hover:shadow-xl hover:shadow-violet-500/25',
        'hover:-translate-y-0.5 active:translate-y-0'
      ],
      secondary: [
        'bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100',
        'border-2 border-rose-600 dark:border-rose-500',
        'hover:bg-rose-600 dark:hover:bg-rose-500 hover:text-white hover:border-rose-600',
        'hover:-translate-y-0.5 active:translate-y-0'
      ],
      ghost: [
        'bg-transparent text-gray-700 dark:text-gray-300',
        'hover:bg-gray-100 dark:hover:bg-gray-800',
        'hover:text-rose-600 dark:hover:text-rose-400'
      ],
      robotics: [
        'bg-gradient-to-r from-cyan-500 to-emerald-500 text-white',
        'dark:from-cyan-400 dark:to-emerald-400',
        'shadow-lg shadow-cyan-500/30 hover:shadow-xl hover:shadow-cyan-500/40',
        'hover:-translate-y-0.5 active:translate-y-0',
        'border border-cyan-500/20'
      ],
      destructive: [
        'bg-gradient-to-r from-red-500 to-red-600 text-white',
        'dark:from-red-400 dark:to-red-500',
        'shadow-lg hover:shadow-xl hover:shadow-red-500/25',
        'hover:-translate-y-0.5 active:translate-y-0'
      ]
    };

    const sizeClasses = {
      sm: 'px-3 py-1.5 text-sm',
      md: 'px-4 py-2 text-base',
      lg: 'px-6 py-3 text-lg',
      xl: 'px-8 py-4 text-xl'
    };

    const classes = [
      ...baseClasses,
      ...variantClasses[variant],
      sizeClasses[size],
      className
    ].join(' ');

    const content = (
      <>
        {loading && (
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: "linear" as const }}
            className="w-4 h-4 border-2 border-current border-t-transparent rounded-full"
          />
        )}
        {!loading && icon && iconPosition === 'left' && (
          <span className="flex-shrink-0">{icon}</span>
        )}
        <span>{children}</span>
        {!loading && icon && iconPosition === 'right' && (
          <span className="flex-shrink-0">{icon}</span>
        )}
      </>
    );

    return (
      <motion.button
        ref={ref}
        className={classes}
        disabled={disabled || loading}
        whileTap={{ scale: disabled ? 1 : 0.98 }}
        transition={{ duration: 0.1 }}
        {...props}
      >
        {/* Ripple effect background */}
        <motion.div
          className="absolute inset-0 bg-white/20 rounded-lg"
          initial={{ scale: 0, opacity: 0 }}
          whileTap={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.3 }}
        />
        <div className="relative z-10 flex items-center justify-center gap-2">
          {content}
        </div>
      </motion.button>
    );
  }
);

Button.displayName = 'Button';

export default Button;