'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Bell, Search, User, ChevronDown, Settings, LogOut, HelpCircle, Menu } from 'lucide-react';
import { useUnifiedAuth } from '../../../lib/auth/UnifiedAuthProvider';
import { useNavigation } from '../../contexts/NavigationContext';

/**
 * Dashboard Header Component
 * 
 * Provides the top navigation header for the BuildTrack Pro dashboard,
 * following the design system with primary colors:
 * - Primary Blue: rgb(24,62,105)
 * - Primary Orange: rgb(236,107,44)
 * 
 * Features:
 * - Global search functionality
 * - Notification center with unread indicators
 * - User profile dropdown with settings and logout
 * - Mobile-responsive design with appropriate breakpoints
 * - Internationalization support
 * - Breadcrumb navigation showing current location
 */

interface HeaderProps {
  locale: string;
  translations: {
    search: string;
    notifications: string;
    profile: string;
    settings: string;
    help: string;
    logout: string;
    searchPlaceholder: string;
  };
}

export default function Header({ locale, translations }: HeaderProps) {
  const { user, signOut } = useUnifiedAuth();
  const { toggleSidebar } = useNavigation();
  const pathname = usePathname();
  const [profileOpen, setProfileOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  
  // Generate breadcrumbs from pathname
  const generateBreadcrumbs = () => {
    if (!pathname) return [];
    
    const segments = pathname.split('/').filter(Boolean);
    let currentPath = '';
    
    return segments.map((segment, index) => {
      currentPath += `/${segment}`;
      
      // Skip locale segment in breadcrumbs
      if (index === 0 && segment === locale) {
        return null;
      }
      
      // Format segment for display (capitalize, replace hyphens)
      const formattedSegment = segment
        .replace(/-/g, ' ')
        .replace(/\b\w/g, char => char.toUpperCase());
      
      return {
        name: formattedSegment,
        href: currentPath,
        current: index === segments.length - 1
      };
    }).filter(Boolean);
  };
  
  const breadcrumbs = generateBreadcrumbs();
  
  // Handle search submission
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    // Implement search functionality here
    setSearchOpen(false);
  };
  
  // Handle logout
  const handleLogout = async () => {
    try {
      await signOut();
    } catch (error) {
      console.error('Logout failed:', error);
    }
    setProfileOpen(false);
  };
  
  // Mock notification data
  const notifications = [
    {
      id: 1,
      title: 'Task Assigned',
      message: 'You have been assigned a new task: "Update project timeline"',
      time: '10 min ago',
      read: false
    },
    {
      id: 2,
      title: 'Comment on Document',
      message: 'John Smith commented on "Site Survey Report"',
      time: '1 hour ago',
      read: false
    },
    {
      id: 3,
      title: 'Material Delivery',
      message: 'Concrete delivery confirmed for tomorrow at 9:00 AM',
      time: '3 hours ago',
      read: true
    },
  ];
  
  const unreadCount = notifications.filter(n => !n.read).length;
  
  return (
    <header className="bg-white border-b border-gray-200 sticky top-0 z-30">
      <div className="flex items-center justify-between h-16 px-4">
        {/* Left Section: Mobile Menu Toggle & Breadcrumbs */}
        <div className="flex items-center">
          <button 
            className="mr-4 text-gray-500 hover:text-gray-700 md:hidden"
            onClick={toggleSidebar}
            aria-label="Toggle mobile menu"
          >
            <Menu className="h-6 w-6" />
          </button>
          
          {/* Breadcrumbs - Hide on mobile */}
          <nav className="hidden md:flex" aria-label="Breadcrumb">
            <ol className="flex items-center space-x-1">
              <li>
                <Link 
                  href={`/${locale}/dashboard`}
                  className="text-gray-500 hover:text-gray-700"
                >
                  Dashboard
                </Link>
              </li>
              
              {breadcrumbs.map((breadcrumb, index) => (
                <li key={index} className="flex items-center">
                  <span className="mx-1 text-gray-400">/</span>
                  {breadcrumb.current ? (
                    <span className="text-[rgb(24,62,105)] font-medium">
                      {breadcrumb.name}
                    </span>
                  ) : (
                    <Link 
                      href={breadcrumb.href}
                      className="text-gray-500 hover:text-gray-700"
                    >
                      {breadcrumb.name}
                    </Link>
                  )}
                </li>
              ))}
            </ol>
          </nav>
        </div>
        
        {/* Right Section: Search, Notifications, Profile */}
        <div className="flex items-center space-x-3">
          {/* Search Button */}
          <div className="relative">
            <button 
              className="p-2 text-gray-500 hover:text-gray-700 rounded-full hover:bg-gray-100"
              onClick={() => setSearchOpen(!searchOpen)}
              aria-label={translations.search}
            >
              <Search className="h-5 w-5" />
            </button>
            
            {/* Search Popover */}
            {searchOpen && (
              <div className="absolute right-0 mt-2 w-72 bg-white rounded-md shadow-lg p-4 border border-gray-200">
                <form onSubmit={handleSearch}>
                  <div className="relative">
                    <input
                      type="text"
                      className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[rgb(236,107,44)] focus:border-transparent"
                      placeholder={translations.searchPlaceholder}
                      autoFocus
                    />
                    <span className="absolute left-3 top-2.5 text-gray-400">
                      <Search className="h-4 w-4" />
                    </span>
                  </div>
                </form>
              </div>
            )}
          </div>
          
          {/* Notifications Button */}
          <div className="relative">
            <button 
              className="p-2 text-gray-500 hover:text-gray-700 rounded-full hover:bg-gray-100"
              onClick={() => setNotificationsOpen(!notificationsOpen)}
              aria-label={translations.notifications}
            >
              <Bell className="h-5 w-5" />
              {unreadCount > 0 && (
                <span className="absolute top-1 right-1 h-4 w-4 bg-[rgb(236,107,44)] rounded-full flex items-center justify-center text-white text-xs">
                  {unreadCount}
                </span>
              )}
            </button>
            
            {/* Notifications Popover */}
            {notificationsOpen && (
              <div className="absolute right-0 mt-2 w-80 bg-white rounded-md shadow-lg border border-gray-200 overflow-hidden">
                <div className="px-4 py-3 border-b border-gray-200 flex justify-between items-center">
                  <h3 className="font-medium text-gray-700">{translations.notifications}</h3>
                  <button className="text-xs text-[rgb(236,107,44)] hover:text-[rgb(214,97,40)]">
                    Mark all as read
                  </button>
                </div>
                
                <div className="max-h-96 overflow-y-auto">
                  {notifications.length === 0 ? (
                    <div className="p-4 text-center text-gray-500">
                      No new notifications
                    </div>
                  ) : (
                    <ul>
                      {notifications.map((notification) => (
                        <li 
                          key={notification.id}
                          className={`p-4 border-b border-gray-100 hover:bg-gray-50 cursor-pointer ${
                            !notification.read ? 'bg-blue-50' : ''
                          }`}
                        >
                          <div className="flex items-start">
                            {!notification.read && (
                              <span className="h-2 w-2 mt-1.5 mr-2 bg-[rgb(236,107,44)] rounded-full flex-shrink-0"></span>
                            )}
                            <div className="flex-1">
                              <h4 className="font-medium text-sm text-gray-900">{notification.title}</h4>
                              <p className="text-sm text-gray-600 mt-1">{notification.message}</p>
                              <p className="text-xs text-gray-500 mt-1">{notification.time}</p>
                            </div>
                          </div>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
                
                <div className="p-2 border-t border-gray-200 text-center">
                  <Link 
                    href={`/${locale}/dashboard/notifications`}
                    className="text-sm text-[rgb(24,62,105)] hover:text-[rgb(19,50,86)]"
                  >
                    View all notifications
                  </Link>
                </div>
              </div>
            )}
          </div>
          
          {/* Profile Button */}
          <div className="relative">
            <button 
              className="flex items-center text-gray-700 hover:text-[rgb(24,62,105)]"
              onClick={() => setProfileOpen(!profileOpen)}
              aria-label={translations.profile}
            >
              <div className="h-8 w-8 rounded-full bg-[rgb(24,62,105)] text-white flex items-center justify-center">
                {user?.email ? user.email.charAt(0).toUpperCase() : 'U'}
              </div>
              <ChevronDown className="h-4 w-4 ml-1" />
            </button>
            
            {/* Profile Dropdown */}
            {profileOpen && (
              <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg border border-gray-200 py-1">
                <div className="px-4 py-2 border-b border-gray-100">
                  <p className="text-sm font-medium text-gray-900 truncate">
                    {user?.email}
                  </p>
                </div>
                
                <Link
                  href={`/${locale}/dashboard/profile`}
                  className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center"
                  onClick={() => setProfileOpen(false)}
                >
                  <User className="h-4 w-4 mr-2" />
                  {translations.profile}
                </Link>
                
                <Link
                  href={`/${locale}/dashboard/settings`}
                  className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center"
                  onClick={() => setProfileOpen(false)}
                >
                  <Settings className="h-4 w-4 mr-2" />
                  {translations.settings}
                </Link>
                
                <Link
                  href={`/${locale}/support`}
                  className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center"
                  onClick={() => setProfileOpen(false)}
                >
                  <HelpCircle className="h-4 w-4 mr-2" />
                  {translations.help}
                </Link>
                
                <div className="border-t border-gray-100 mt-1 pt-1">
                  <button
                    className="block w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-gray-100 flex items-center"
                    onClick={handleLogout}
                  >
                    <LogOut className="h-4 w-4 mr-2" />
                    {translations.logout}
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
