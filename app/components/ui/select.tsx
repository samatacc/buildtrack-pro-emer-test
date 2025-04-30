'use client';

import * as React from 'react';
import { cn } from '@/app/utils/cn';

export interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {}

const Select = React.forwardRef<HTMLSelectElement, SelectProps>(
  ({ className, children, ...props }, ref) => {
    return (
      <select
        className={cn(
          "flex h-10 w-full rounded-md border border-[rgb(var(--card-border))] bg-white px-3 py-2 text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-accent focus:border-transparent disabled:cursor-not-allowed disabled:opacity-50",
          className
        )}
        ref={ref}
        {...props}
      >
        {children}
      </select>
    );
  }
);
Select.displayName = "Select";

const SelectContent = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, children, ...props }, ref) => {
    return (
      <div
        className={cn(
          "absolute mt-1 max-h-60 w-full overflow-auto rounded-md bg-white py-1 shadow-lg",
          className
        )}
        ref={ref}
        {...props}
      >
        {children}
      </div>
    );
  }
);
SelectContent.displayName = "SelectContent";

const SelectItem = React.forwardRef<HTMLOptionElement, React.OptionHTMLAttributes<HTMLOptionElement>>(
  ({ className, children, ...props }, ref) => {
    return (
      <option
        className={cn(
          "px-3 py-2 text-sm cursor-pointer hover:bg-gray-100",
          className
        )}
        ref={ref}
        {...props}
      >
        {children}
      </option>
    );
  }
);
SelectItem.displayName = "SelectItem";

const SelectTrigger = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, children, ...props }, ref) => {
    return (
      <div
        className={cn(
          "flex h-10 w-full items-center justify-between rounded-md border border-[rgb(var(--card-border))] bg-white px-3 py-2 text-sm",
          className
        )}
        ref={ref}
        {...props}
      >
        {children}
      </div>
    );
  }
);
SelectTrigger.displayName = "SelectTrigger";

const SelectValue = React.forwardRef<HTMLSpanElement, React.HTMLAttributes<HTMLSpanElement>>(
  ({ className, children, ...props }, ref) => {
    return (
      <span
        className={cn("block truncate", className)}
        ref={ref}
        {...props}
      >
        {children}
      </span>
    );
  }
);
SelectValue.displayName = "SelectValue";

export { Select, SelectContent, SelectItem, SelectTrigger, SelectValue };
