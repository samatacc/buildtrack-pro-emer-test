'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  Home, 
  Briefcase, 
  FileText, 
  Package, 
  BarChart, 
  Settings, 
  Users, 
  Calendar,
  X
} from 'lucide-react';

/**
 * Mobile Navigation Component for Dashboard
 * 
 * Provides a mobile-optimized navigation bar for the dashboard,
 * following BuildTrack Pro's mobile-first approach for construction
 * professionals in the field.
 * 
 * Features:
 * - Fixed bottom navigation bar on mobile devices
 * - Slide-up panel for secondary navigation options
 * - Touch-friendly large tap targets
 * - Visual indicators for active sections
 * - Context-aware navigation options
 */

interface MobileNavProps {
  locale: string;
  translations: {
    dashboard: string;
    projects: string;
    tasks: string;
    materials: string;
    documents: string;
    reports: string;
    team: string;
    settings: string;
  };
}

export default function MobileNav({ locale, translations }: MobileNavProps) {
  const pathname = usePathname();
  const [isMoreMenuOpen, setIsMoreMenuOpen] = useState(false);
  
  // Primary navigation items (shown in the bottom bar)
  const primaryNavItems = [
    {
      key: 'dashboard',
      label: translations.dashboard,
      href: `/${locale}/dashboard`,
      icon: <Home className="h-5 w-5" />,
    },
    {
      key: 'projects',
      label: translations.projects,
      href: `/${locale}/dashboard/projects`,
      icon: <Briefcase className="h-5 w-5" />,
    },
    {
      key: 'tasks',
      label: translations.tasks,
      href: `/${locale}/dashboard/tasks`,
      icon: <Calendar className="h-5 w-5" />,
    },
    {
      key: 'more',
      label: 'More',
      href: '#',
      icon: <div className="flex space-x-0.5">
        <div className="h-1 w-1 rounded-full bg-current"></div>
        <div className="h-1 w-1 rounded-full bg-current"></div>
        <div className="h-1 w-1 rounded-full bg-current"></div>
      </div>,
      onClick: () => setIsMoreMenuOpen(true),
    },
  ];
  
  // Secondary navigation items (shown in the more menu)
  const secondaryNavItems = [
    {
      key: 'materials',
      label: translations.materials,
      href: `/${locale}/dashboard/materials`,
      icon: <Package className="h-5 w-5" />,
    },
    {
      key: 'documents',
      label: translations.documents,
      href: `/${locale}/dashboard/documents`,
      icon: <FileText className="h-5 w-5" />,
    },
    {
      key: 'team',
      label: translations.team,
      href: `/${locale}/dashboard/team`,
      icon: <Users className="h-5 w-5" />,
    },
    {
      key: 'reports',
      label: translations.reports,
      href: `/${locale}/dashboard/reports`,
      icon: <BarChart className="h-5 w-5" />,
    },
    {
      key: 'settings',
      label: translations.settings,
      href: `/${locale}/dashboard/settings`,
      icon: <Settings className="h-5 w-5" />,
    },
  ];
  
  // Check if a path is active
  const isActive = (href: string) => {
    return pathname === href || pathname.startsWith(`${href}/`);
  };
  
  return (
    <>
      {/* Fixed Bottom Navigation Bar */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 z-30">
        <div className="flex items-center justify-around h-16">
          {primaryNavItems.map((item) => {
            const active = item.key !== 'more' && isActive(item.href);
            
            return (
              <div key={item.key} className="flex-1">
                {item.key === 'more' ? (
                  <button
                    onClick={item.onClick}
                    className="flex flex-col items-center justify-center w-full h-full"
                  >
                    <span className="text-gray-500">{item.icon}</span>
                    <span className="mt-1 text-xs text-gray-500">{item.label}</span>
                  </button>
                ) : (
                  <Link
                    href={item.href}
                    className={`flex flex-col items-center justify-center w-full h-full ${
                      active 
                        ? 'text-[rgb(24,62,105)]' 
                        : 'text-gray-500 hover:text-gray-700'
                    }`}
                  >
                    <span>{item.icon}</span>
                    <span className="mt-1 text-xs">{item.label}</span>
                  </Link>
                )}
              </div>
            );
          })}
        </div>
      </div>
      
      {/* More Menu Overlay */}
      {isMoreMenuOpen && (
        <div className="md:hidden fixed inset-0 bg-black bg-opacity-25 z-40" onClick={() => setIsMoreMenuOpen(false)}></div>
      )}
      
      {/* More Menu Panel */}
      <div 
        className={`md:hidden fixed bottom-0 left-0 right-0 bg-white rounded-t-xl z-50 transform transition-transform duration-300 ease-in-out ${
          isMoreMenuOpen ? 'translate-y-0' : 'translate-y-full'
        }`}
        style={{ maxHeight: '70vh', overflowY: 'auto' }}
      >
        <div className="p-4 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-medium text-gray-900">More Options</h3>
            <button 
              onClick={() => setIsMoreMenuOpen(false)}
              className="p-1 text-gray-500 hover:text-gray-700"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>
        
        <div className="p-4">
          <div className="grid grid-cols-4 gap-4">
            {secondaryNavItems.map((item) => {
              const active = isActive(item.href);
              
              return (
                <Link
                  key={item.key}
                  href={item.href}
                  className={`flex flex-col items-center justify-center p-3 rounded-md ${
                    active 
                      ? 'bg-blue-50 text-[rgb(24,62,105)]' 
                      : 'text-gray-500 hover:bg-gray-50'
                  }`}
                  onClick={() => setIsMoreMenuOpen(false)}
                >
                  <span className="mb-1">{item.icon}</span>
                  <span className="text-xs text-center">{item.label}</span>
                </Link>
              );
            })}
          </div>
        </div>
        
        <div className="p-4 pb-8">
          <p className="text-xs text-center text-gray-500">
            © {new Date().getFullYear()} BuildTrack Pro. All rights reserved.
          </p>
        </div>
      </div>
    </>
  );
}
