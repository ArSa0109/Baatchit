import React, { forwardRef } from 'react';
import { cn } from '../../lib/utils';

type InputProps = React.InputHTMLAttributes<HTMLInputElement> & {
  label?: string;
  error?: string;
  fullWidth?: boolean;
};

const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className, label, error, fullWidth = false, ...props }, ref) => {
    return (
      <div className={cn(fullWidth ? 'w-full' : '', 'mb-4')}>
        {label && (
          <label 
            htmlFor={props.id || props.name} 
            className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
          >
            {label}
          </label>
        )}
        <input
          className={cn(
            'rounded-md border border-gray-300 bg-white px-3 py-2 text-sm placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent disabled:opacity-50 disabled:cursor-not-allowed',
            error ? 'border-error-500 focus:ring-error-500' : 'border-gray-300 dark:border-gray-700',
            fullWidth ? 'w-full' : '',
            'dark:bg-gray-800 dark:text-gray-100 dark:placeholder-gray-500',
            className
          )}
          ref={ref}
          {...props}
        />
        {error && <span className="mt-1 text-xs text-error-500">{error}</span>}
      </div>
    );
  }
);

Input.displayName = 'Input';

export default Input;