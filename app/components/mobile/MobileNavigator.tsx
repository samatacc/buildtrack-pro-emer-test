'use client';

import { useState, useEffect } from 'react';
import { useNamespacedTranslations } from '@/app/hooks/useNamespacedTranslations';
import { usePathname } from 'next/navigation';
import Link from 'next/link';

/**
 * MobileNavigator Component
 * 
 * Provides a touch-friendly, mobile-optimized navigation experience for field users.
 * 
 * Features:
 * - Touch-friendly large tap targets
 * - Offline indicator and functionality
 * - Quick access to critical construction site features
 * - Bandwidth-conscious design for limited connectivity environments
 * - Full internationalization support
 * 
 * Follows BuildTrack Pro's design principles:
 * - Primary Blue: rgb(24,62,105)
 * - Primary Orange: rgb(236,107,44)
 * - User-centric design
 * - Accessibility compliance
 */
interface MobileNavigatorProps {
  className?: string;
}

export default function MobileNavigator({
  className = ''
}: MobileNavigatorProps) {
  const { t } = useNamespacedTranslations('mobile');
  const pathname = usePathname();
  const [isOffline, setIsOffline] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  
  // Track online/offline status
  useEffect(() => {
    const handleOnline = () => setIsOffline(false);
    const handleOffline = () => setIsOffline(true);
    
    // Set initial status
    setIsOffline(!navigator.onLine);
    
    // Add event listeners
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    
    // Cleanup
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);
  
  // Main navigation items
  const navigationItems = [
    { 
      id: 'dashboard', 
      label: t('dashboard'), 
      href: '/dashboard', 
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
          <rect x="3" y="3" width="7" height="7" rx="2" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" />
          <rect x="14" y="3" width="7" height="7" rx="2" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" />
          <rect x="14" y="14" width="7" height="7" rx="2" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" />
          <rect x="3" y="14" width="7" height="7" rx="2" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" />
        </svg>
      ),
      offlineAvailable: true
    },
    { 
      id: 'projects', 
      label: t('projects'), 
      href: '/projects',
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
        </svg>
      ),
      offlineAvailable: true
    },
    { 
      id: 'tasks', 
      label: t('tasks'), 
      href: '/tasks',
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
        </svg>
      ),
      offlineAvailable: true
    },
    { 
      id: 'materials', 
      label: t('materials'), 
      href: '/materials',
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20 7l-8-4-8 4m16 0v10l-8 4m0-10L4 7m8 4v10" />
        </svg>
      ),
      offlineAvailable: true
    },
    { 
      id: 'documents', 
      label: t('documents'), 
      href: '/documents',
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 10v6m0 0l-3-3m3 3l3-3M3 17V7a2 2 0 012-2h6l2 2h6a2 2 0 012 2v8a2 2 0 01-2 2H5a2 2 0 01-2-2z" />
        </svg>
      ),
      offlineAvailable: false
    },
    { 
      id: 'team', 
      label: t('team'), 
      href: '/team',
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
        </svg>
      ),
      offlineAvailable: false
    }
  ];
  
  // Quick access actions for expanded menu
  const quickActions = [
    {
      id: 'scan',
      label: t('scanBarcode'),
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h.01M5 8h2a1 1 0 001-1V5a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1zm12 0h2a1 1 0 001-1V5a1 1 0 00-1-1h-2a1 1 0 00-1 1v2a1 1 0 001 1zM5 20h2a1 1 0 001-1v-2a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1z" />
        </svg>
      ),
      offlineAvailable: true
    },
    {
      id: 'photo',
      label: t('takePhoto'),
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
        </svg>
      ),
      offlineAvailable: true
    },
    {
      id: 'report',
      label: t('quickReport'),
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
      ),
      offlineAvailable: true
    },
    {
      id: 'sync',
      label: isOffline ? t('pendingSync') : t('sync'),
      icon: (
        <svg className={`w-5 h-5 ${isOffline ? 'animate-pulse text-yellow-500' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
        </svg>
      ),
      offlineAvailable: true
    }
  ];
  
  return (
    <div className={`fixed bottom-0 inset-x-0 z-50 ${className}`}>
      {/* Offline indicator */}
      {isOffline && (
        <div className="bg-yellow-500 text-white px-4 py-1 text-center text-sm">
          <span className="flex items-center justify-center">
            <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            {t('offlineMode')} - {t('changesWillSync')}
          </span>
        </div>
      )}
      
      {/* Quick Actions Panel - Shows when expanded */}
      {isExpanded && (
        <div className="bg-white border-t border-gray-200 shadow-lg animate-slideUp">
          <div className="grid grid-cols-4 gap-1 p-2">
            {quickActions.map(action => (
              <button
                key={action.id}
                className={`flex flex-col items-center justify-center p-3 rounded-lg ${
                  isOffline && !action.offlineAvailable 
                    ? 'opacity-50 cursor-not-allowed' 
                    : 'hover:bg-gray-100 active:bg-gray-200'
                }`}
                disabled={isOffline && !action.offlineAvailable}
                onClick={() => {/* Action handler would go here */}}
              >
                <div className={`rounded-full p-2 ${
                  isOffline && !action.offlineAvailable 
                    ? 'bg-gray-200 text-gray-500' 
                    : 'bg-[rgb(24,62,105)] bg-opacity-10 text-[rgb(24,62,105)]'
                }`}>
                  {action.icon}
                </div>
                <span className="text-xs mt-1 text-center text-gray-700">{action.label}</span>
              </button>
            ))}
          </div>
        </div>
      )}
      
      {/* Main Navigation Bar */}
      <nav className="bg-white border-t border-gray-200 shadow-lg">
        <div className="max-w-7xl mx-auto px-2">
          <div className="flex justify-between">
            {navigationItems.map((item) => {
              const isActive = pathname.startsWith(item.href);
              const isDisabled = isOffline && !item.offlineAvailable;
              
              return (
                <Link
                  key={item.id}
                  href={isDisabled ? '#' : item.href}
                  className={`flex flex-col items-center py-3 px-4 ${
                    isActive 
                      ? 'text-[rgb(236,107,44)]' 
                      : isDisabled
                        ? 'text-gray-400 cursor-not-allowed'
                        : 'text-gray-700 hover:text-[rgb(24,62,105)]'
                  }`}
                  aria-disabled={isDisabled}
                  onClick={(e) => {
                    if (isDisabled) {
                      e.preventDefault();
                    }
                  }}
                >
                  {item.icon}
                  <span className="text-xs mt-1">{item.label}</span>
                  {isActive && (
                    <span className="absolute bottom-0 inset-x-0 h-0.5 bg-[rgb(236,107,44)]"></span>
                  )}
                </Link>
              );
            })}
            
            {/* Menu Toggle Button */}
            <button
              className={`flex flex-col items-center py-3 px-4 ${
                isExpanded ? 'text-[rgb(236,107,44)]' : 'text-gray-700'
              }`}
              onClick={() => setIsExpanded(!isExpanded)}
              aria-expanded={isExpanded}
              aria-label={isExpanded ? t('hideMenu') : t('showMenu')}
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                {isExpanded ? (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                ) : (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16m-7 6h7" />
                )}
              </svg>
              <span className="text-xs mt-1">{isExpanded ? t('close') : t('more')}</span>
            </button>
          </div>
        </div>
      </nav>
      
      {/* Bottom Safe Area for iOS devices */}
      <div className="h-safe-bottom bg-white"></div>
    </div>
  );
}
