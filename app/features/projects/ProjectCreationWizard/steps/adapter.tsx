'use client';

import React, { ReactNode } from 'react';
import { cn, colors } from './utils';
import { 
  Tabs as BaseTabs, 
  TabsList as BaseTabsList,
  TabsTrigger as BaseTabsTrigger,
  TabsContent as BaseTabsContent
} from '../../../../../app/components/ui/tabs';
import { 
  Select as BaseSelect,
  SelectContent as BaseSelectContent,
  SelectItem as BaseSelectItem,
  SelectTrigger as BaseSelectTrigger
} from '../../../../../app/components/ui/select';
import { Checkbox as BaseCheckbox } from '../../../../../app/components/ui/checkbox';
import {
  Accordion as BaseAccordion,
  AccordionContent as BaseAccordionContent,
  AccordionItem as BaseAccordionItem,
  AccordionTrigger as BaseAccordionTrigger
} from '../../../../../app/components/ui/accordion';
import {
  Tooltip as BaseTooltip,
  TooltipContent as BaseTooltipContent,
  TooltipProvider as BaseTooltipProvider,
  TooltipTrigger as BaseTooltipTrigger
} from '../../../../../app/components/ui/tooltip';

// Create adapters for the Tabs components
export function Tabs({ 
  children, 
  value, 
  onValueChange, 
  className 
}: { 
  children: ReactNode;
  value: string;
  onValueChange: (value: string) => void;
  className?: string;
}) {
  return (
    <BaseTabs className={className}>
      {React.Children.map(children, child => {
        if (React.isValidElement(child)) {
          // Pass the active state to TabsTrigger based on value
          return React.cloneElement(child);
        }
        return child;
      })}
    </BaseTabs>
  );
}

export function TabsList({ children, className }: { children: ReactNode; className?: string }) {
  return <BaseTabsList className={className}>{children}</BaseTabsList>;
}

export function TabsTrigger({ 
  children, 
  value,
  disabled
}: { 
  children: ReactNode;
  value: string;
  disabled?: boolean;
}) {
  return <BaseTabsTrigger disabled={disabled}>{children}</BaseTabsTrigger>;
}

export function TabsContent({ 
  children, 
  value,
  className 
}: { 
  children: ReactNode;
  value: string;
  className?: string;
}) {
  return <BaseTabsContent className={className}>{children}</BaseTabsContent>;
}

// Create adapters for the Select components
export function Select({ 
  children, 
  value, 
  onValueChange 
}: { 
  children: ReactNode;
  value: string;
  onValueChange: (...args: any[]) => void;
}) {
  const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    onValueChange(e.target.value);
  };
  
  return (
    <BaseSelect defaultValue={value} onChange={handleChange}>
      {children}
    </BaseSelect>
  );
}

export function SelectValue({ placeholder, className }: { placeholder: string; className?: string }) {
  return <BaseSelectTrigger className={className}>{placeholder}</BaseSelectTrigger>;
}

export function SelectTrigger({ children, className }: { children: ReactNode; className?: string }) {
  return <div className={className}>{children}</div>;
}

export function SelectContent({ children, className }: { children: ReactNode; className?: string }) {
  return <BaseSelectContent className={className}>{children}</BaseSelectContent>;
}

export function SelectItem({ 
  children, 
  value 
}: { 
  children: ReactNode;
  value: string;
}) {
  return <BaseSelectItem value={value}>{children}</BaseSelectItem>;
}

// Create adapter for Checkbox
export function Checkbox({ 
  id, 
  checked, 
  onCheckedChange 
}: { 
  id?: string;
  checked: boolean;
  onCheckedChange: (...args: any[]) => void;
}) {
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onCheckedChange(e.target.checked);
  };
  
  return <BaseCheckbox id={id} checked={checked} onChange={handleChange} />;
}

// Create Accordion adapters
export function Accordion({ 
  children, 
  className,
  type,
  collapsible
}: { 
  children: ReactNode;
  className?: string;
  type?: string;
  collapsible?: boolean;
}) {
  const combinedClassName = cn(
    className,
    'border-[rgb(24,62,105,0.2)]' // Using BuildTrack Pro's primary blue for border
  );
  
  return <BaseAccordion 
    className={combinedClassName}
    data-type={type}
    data-collapsible={collapsible}
  >
    {children}
  </BaseAccordion>;
}

// Modified AccordionItem to handle all props used in BudgetStep
export function AccordionItem({ 
  children, 
  value,
  type,
  collapsible,
  className
}: { 
  children: ReactNode;
  value: string;
  type?: string;
  collapsible?: boolean;
  className?: string;
}) {
  // Apply BuildTrack Pro styling based on component configuration
  const combinedClassName = cn(
    className || '',
    "border-[rgb(24,62,105)]/20",
    type === 'card' ? 'bg-white shadow-sm rounded-lg' : '',
    collapsible ? 'overflow-hidden' : ''
  );

  return <BaseAccordionItem 
    className={combinedClassName}
    data-custom-value={value}
  >
    {children}
  </BaseAccordionItem>;
}

export function AccordionTrigger({ 
  children, 
  className 
}: { 
  children: ReactNode;
  className?: string;
}) {
  // Apply BuildTrack Pro styling with design system colors
  const combinedClassName = cn(
    className,
    "text-[rgb(24,62,105)]",
    "hover:text-[rgb(236,107,44)]",
    'font-medium py-2'
  );
  
  return <BaseAccordionTrigger className={combinedClassName}>{children}</BaseAccordionTrigger>;
}

export function AccordionContent({ 
  children, 
  className 
}: { 
  children: ReactNode;
  className?: string;
}) {
  // Apply BuildTrack Pro styling with subtle animation
  const combinedClassName = cn(
    className,
    'p-4 pt-0 pb-2',
    'text-gray-700' // Dark gray for content text for better readability
  );
  
  return <BaseAccordionContent className={combinedClassName}>{children}</BaseAccordionContent>;
}

// Button styling to match BuildTrack Pro design system
export function Button({ 
  children,
  className,
  variant = 'default',
  ...props
}: { 
  children: ReactNode;
  className?: string;
  variant?: 'default' | 'outline' | 'secondary' | 'ghost' | 'link';
  [key: string]: any;
}) {
  // Apply BuildTrack Pro's color scheme for buttons
  const variantStyles = {
    default: "bg-[rgb(236,107,44)] hover:bg-[rgb(236,107,44)]/90 text-white",
    outline: "border border-[rgb(24,62,105)] text-[rgb(24,62,105)] hover:bg-[rgb(24,62,105)]/10",
    secondary: "bg-gray-200 text-gray-900 hover:bg-gray-300",
    ghost: "text-[rgb(24,62,105)] hover:bg-[rgb(24,62,105)]/10",
    link: "text-[rgb(24,62,105)] underline hover:text-[rgb(236,107,44)]"
  };
  
  const combinedClassName = cn(
    'px-4 py-2 rounded-md font-medium transition-colors',
    variantStyles[variant],
    className
  );
  
  return <button className={combinedClassName} {...props}>{children}</button>;
}

// Tooltip components with BuildTrack Pro styling
export function Tooltip({ 
  children,
  className
}: { 
  children: ReactNode;
  className?: string;
}) {
  return <BaseTooltip>
    {children}
  </BaseTooltip>;
}

export function TooltipProvider({ 
  children,
  className
}: { 
  children: ReactNode;
  className?: string;
}) {
  return <BaseTooltipProvider>
    {children}
  </BaseTooltipProvider>;
}

export function TooltipTrigger({ 
  children,
  className
}: { 
  children: ReactNode;
  className?: string;
}) {
  return <BaseTooltipTrigger className={className}>
    {children}
  </BaseTooltipTrigger>;
}

export function TooltipContent({ 
  children,
  className
}: { 
  children: ReactNode;
  className?: string;
}) {
  // Apply the primary blue color from BuildTrack Pro's color scheme
  const combinedClassName = cn(
    className,
    "bg-[rgb(24,62,105)] text-white rounded-md p-2"
  );
  
  return <BaseTooltipContent className={combinedClassName}>
    {children}
  </BaseTooltipContent>;
}
