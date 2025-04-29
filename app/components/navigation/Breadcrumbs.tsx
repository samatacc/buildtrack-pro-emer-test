'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ChevronRight, Home } from 'lucide-react';

/**
 * Breadcrumbs Component
 * 
 * Provides a navigation breadcrumb trail showing current location in the app.
 * Follows BuildTrack Pro's design system with Primary Blue (rgb(24,62,105)) 
 * and Primary Orange (rgb(236,107,44)) color scheme.
 * 
 * Features:
 * - Automatically generates breadcrumbs from current path
 * - Shows icon for home
 * - Highlights the current (last) location
 * - Fully responsive
 * - Internationalization support
 */

interface BreadcrumbsProps {
  locale: string;
  homeLinkText?: string;
  customSegments?: { [key: string]: string };
}

export default function Breadcrumbs({ 
  locale, 
  homeLinkText = 'Dashboard', 
  customSegments = {} 
}: BreadcrumbsProps) {
  const pathname = usePathname();
  
  // Skip if we're at the root
  if (!pathname || pathname === `/${locale}` || pathname === `/${locale}/dashboard`) {
    return null;
  }
  
  // Generate breadcrumbs from pathname
  const breadcrumbs = React.useMemo(() => {
    const segments = pathname.split('/').filter(Boolean);
    const items = [];
    
    // Add home link as first breadcrumb
    items.push({
      href: `/${locale}/dashboard`,
      label: homeLinkText,
      isHome: true,
      isCurrent: false,
    });
    
    // Start building the path and create breadcrumbs for each segment
    let currentPath = `/${locale}`;
    
    for (let i = 1; i < segments.length; i++) {
      const segment = segments[i];
      currentPath += `/${segment}`;
      
      // Skip the locale segment since it's already included in the home link
      if (i === 0 && segment === locale) {
        continue;
      }
      
      // Format the label from the segment or use a custom label if provided
      const label = customSegments[segment] || 
        segment
          .replace(/-/g, ' ')
          .replace(/\b\w/g, char => char.toUpperCase());
      
      items.push({
        href: currentPath,
        label,
        isHome: false,
        isCurrent: i === segments.length - 1,
      });
    }
    
    return items;
  }, [pathname, locale, homeLinkText, customSegments]);
  
  if (breadcrumbs.length <= 1) {
    return null;
  }
  
  return (
    <nav aria-label="Breadcrumb" className="flex items-center text-sm">
      <ol className="flex items-center space-x-1">
        {breadcrumbs.map((breadcrumb, index) => (
          <li key={breadcrumb.href} className="flex items-center">
            {index > 0 && (
              <ChevronRight className="h-4 w-4 text-gray-400 mx-1 flex-shrink-0" />
            )}
            
            {breadcrumb.isCurrent ? (
              <span className="text-[rgb(24,62,105)] font-medium" aria-current="page">
                {breadcrumb.label}
              </span>
            ) : (
              <Link
                href={breadcrumb.href}
                className={`hover:text-[rgb(24,62,105)] ${
                  breadcrumb.isHome ? 'flex items-center' : ''
                }`}
              >
                {breadcrumb.isHome && (
                  <Home className="h-4 w-4 mr-1" />
                )}
                <span>{breadcrumb.label}</span>
              </Link>
            )}
          </li>
        ))}
      </ol>
    </nav>
  );
}
