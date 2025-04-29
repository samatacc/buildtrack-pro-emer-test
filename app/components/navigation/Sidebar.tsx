'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, Briefcase, FileText, Package, BarChart, Settings, ChevronRight, ChevronLeft, Users, Calendar } from 'lucide-react';
import { useNavigation } from '../../contexts/NavigationContext';

/**
 * Dashboard Sidebar Navigation Component
 * 
 * Provides the main navigation structure for the BuildTrack Pro dashboard,
 * following the design system with primary colors:
 * - Primary Blue: rgb(24,62,105)
 * - Primary Orange: rgb(236,107,44)
 * 
 * Features:
 * - Collapsible sidebar with toggle functionality
 * - Mobile-responsive design with appropriate breakpoints
 * - Visual indicators for active navigation items
 * - Grouped navigation categories
 * - Internationalization support
 * - Permission-based menu items (future)
 */

interface SidebarProps {
  locale: string;
  translations: {
    dashboard: string;
    projects: string;
    tasks: string;
    materials: string;
    documents: string;
    reports: string;
    team: string;
    schedule: string;
    settings: string;
    collapse: string;
    expand: string;
  };
}

interface NavItem {
  key: string;
  label: string;
  href: string;
  icon: React.ReactNode;
  subitems?: NavItem[];
}

export default function Sidebar({ locale, translations }: SidebarProps) {
  const pathname = usePathname();
  const { isSidebarCollapsed: collapsed, toggleSidebar, setSidebarCollapsed } = useNavigation();
  const [hoveredGroup, setHoveredGroup] = useState<string | null>(null);
  
  // Navigation groups structure
  const navGroups: NavItem[] = [
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
      subitems: [
        {
          key: 'active-projects',
          label: 'Active Projects',
          href: `/${locale}/dashboard/projects/active`,
          icon: <div className="w-1 h-1 rounded-full bg-current mr-1" />,
        },
        {
          key: 'project-templates',
          label: 'Templates',
          href: `/${locale}/dashboard/projects/templates`,
          icon: <div className="w-1 h-1 rounded-full bg-current mr-1" />,
        },
      ],
    },
    {
      key: 'tasks',
      label: translations.tasks,
      href: `/${locale}/dashboard/tasks`,
      icon: <Calendar className="h-5 w-5" />,
    },
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
  
  // Check if a path is active (current page)
  const isActive = (href: string) => {
    return pathname === href || pathname.startsWith(`${href}/`);
  };
  
  // Handle sidebar toggle (now using the Navigation context)
  
  return (
    <div 
      className={`relative h-screen bg-white border-r border-gray-200 transition-all duration-300 ease-in-out ${
        collapsed ? 'w-16' : 'w-64'
      } flex flex-col`}
    >
      {/* Logo and Brand */}
      <div className="py-4 px-4 border-b border-gray-200">
        <Link href={`/${locale}/dashboard`} className="flex items-center">
          <div className="h-8 w-8 rounded-md bg-[rgb(24,62,105)] text-white flex items-center justify-center text-lg font-bold">
            BP
          </div>
          {!collapsed && (
            <div className="ml-2 text-[rgb(24,62,105)] font-semibold">
              BuildTrack Pro
            </div>
          )}
        </Link>
      </div>
      
      {/* Navigation Links */}
      <nav className="flex-1 overflow-y-auto py-4">
        <ul className="space-y-1 px-2">
          {navGroups.map((item) => {
            const isItemActive = isActive(item.href);
            const hasSubitems = item.subitems && item.subitems.length > 0;
            const isGroupHovered = hoveredGroup === item.key;
            
            return (
              <li key={item.key} 
                onMouseEnter={() => setHoveredGroup(item.key)}
                onMouseLeave={() => setHoveredGroup(null)}
              >
                <Link
                  href={item.href}
                  className={`flex items-center px-3 py-2 rounded-md group transition-colors ${
                    isItemActive 
                      ? 'bg-[rgb(24,62,105)] text-white' 
                      : 'text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  <span className="flex-shrink-0">
                    {item.icon}
                  </span>
                  {!collapsed && (
                    <>
                      <span className="ml-3 flex-1">{item.label}</span>
                      {hasSubitems && (
                        <ChevronRight 
                          className={`h-4 w-4 transition-transform ${
                            isGroupHovered ? 'rotate-90' : ''
                          }`} 
                        />
                      )}
                    </>
                  )}
                </Link>
                
                {/* Subitems */}
                {hasSubitems && !collapsed && (isGroupHovered || isItemActive) && (
                  <ul className="mt-1 pl-10 space-y-1">
                    {item.subitems!.map((subitem) => (
                      <li key={subitem.key}>
                        <Link
                          href={subitem.href}
                          className={`flex items-center px-3 py-1.5 rounded-md transition-colors text-sm ${
                            isActive(subitem.href)
                              ? 'bg-blue-50 text-[rgb(24,62,105)]'
                              : 'text-gray-600 hover:bg-gray-50'
                          }`}
                        >
                          <span className="mr-1.5">{subitem.icon}</span>
                          <span>{subitem.label}</span>
                        </Link>
                      </li>
                    ))}
                  </ul>
                )}
                
                {/* Dropdown for mobile when collapsed */}
                {hasSubitems && collapsed && isGroupHovered && (
                  <div className="absolute z-10 left-16 mt-0 w-48 bg-white rounded-md shadow-lg py-1 border border-gray-200">
                    {item.subitems!.map((subitem) => (
                      <Link
                        key={subitem.key}
                        href={subitem.href}
                        className={`block px-4 py-2 text-sm ${
                          isActive(subitem.href)
                            ? 'bg-blue-50 text-[rgb(24,62,105)]'
                            : 'text-gray-700 hover:bg-gray-50'
                        }`}
                      >
                        {subitem.label}
                      </Link>
                    ))}
                  </div>
                )}
              </li>
            );
          })}
        </ul>
      </nav>
      
      {/* Toggle Button */}
      <div className="p-4 border-t border-gray-200">
        <button
          onClick={toggleSidebar}
          className="flex items-center justify-center w-full py-2 rounded-md text-gray-500 hover:bg-gray-100 transition-colors"
          aria-label={collapsed ? translations.expand : translations.collapse}
        >
          {collapsed ? (
            <ChevronRight className="h-5 w-5" />
          ) : (
            <div className="flex items-center">
              <ChevronLeft className="h-5 w-5 mr-2" />
              <span>{translations.collapse}</span>
            </div>
          )}
        </button>
      </div>
    </div>
  );
}
