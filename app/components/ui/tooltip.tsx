'use client';

import * as React from 'react';
import { cn } from '@/app/utils/cn';

const TooltipProvider = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn(className)}
    {...props}
  />
));
TooltipProvider.displayName = 'TooltipProvider';

const Tooltip = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn('relative inline-block', className)}
    {...props}
  />
));
Tooltip.displayName = 'Tooltip';

const TooltipTrigger = React.forwardRef<
  HTMLSpanElement,
  React.HTMLAttributes<HTMLSpanElement>
>(({ className, ...props }, ref) => (
  <span
    ref={ref}
    className={cn('inline-block cursor-help', className)}
    {...props}
  />
));
TooltipTrigger.displayName = 'TooltipTrigger';

const TooltipContent = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn(
      'absolute z-50 invisible group-hover:visible opacity-0 group-hover:opacity-100 transition-opacity bottom-full left-1/2 -translate-x-1/2 mb-2 px-3 py-2 text-sm text-white bg-gray-900 rounded-md shadow-sm max-w-xs',
      className
    )}
    {...props}
  />
));
TooltipContent.displayName = 'TooltipContent';

const TooltipArrow = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn(
      'absolute z-50 bottom-[-6px] left-1/2 -translate-x-1/2 border-[6px] border-transparent border-t-gray-900',
      className
    )}
    {...props}
  />
));
TooltipArrow.displayName = 'TooltipArrow';

export { Tooltip, TooltipTrigger, TooltipContent, TooltipProvider, TooltipArrow };
