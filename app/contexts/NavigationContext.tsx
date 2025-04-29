'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { usePathname } from 'next/navigation';

/**
 * Navigation Context
 * 
 * Provides global state management for navigation-related features:
 * - Sidebar collapsed state
 * - Active route tracking
 * - Navigation permissions
 * - Breadcrumb customization
 * - Mobile navigation state
 * 
 * Part of BuildTrack Pro's core navigation system, enabling a consistent
 * user experience across the application.
 */

// Define context types
interface NavigationContextType {
  // Sidebar state
  isSidebarCollapsed: boolean;
  toggleSidebar: () => void;
  setSidebarCollapsed: (collapsed: boolean) => void;
  
  // Mobile menu state
  isMobileMenuOpen: boolean;
  toggleMobileMenu: () => void;
  setMobileMenuOpen: (open: boolean) => void;
  
  // Active route
  activeRoute: string;
  isRouteActive: (route: string) => boolean;
  
  // Breadcrumb customization
  breadcrumbOverrides: Record<string, string>;
  setBreadcrumbOverride: (path: string, label: string) => void;
  clearBreadcrumbOverride: (path: string) => void;
}

// Create the context with default values
const NavigationContext = createContext<NavigationContextType>({
  isSidebarCollapsed: false,
  toggleSidebar: () => {},
  setSidebarCollapsed: () => {},
  
  isMobileMenuOpen: false,
  toggleMobileMenu: () => {},
  setMobileMenuOpen: () => {},
  
  activeRoute: '',
  isRouteActive: () => false,
  
  breadcrumbOverrides: {},
  setBreadcrumbOverride: () => {},
  clearBreadcrumbOverride: () => {},
});

// Provider component
export function NavigationProvider({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [activeRoute, setActiveRoute] = useState('');
  const [breadcrumbOverrides, setBreadcrumbOverrides] = useState<Record<string, string>>({});
  
  // Update active route when pathname changes
  useEffect(() => {
    if (pathname) {
      setActiveRoute(pathname);
      
      // Close mobile menu when route changes
      setIsMobileMenuOpen(false);
    }
  }, [pathname]);
  
  // Check if device is mobile and adjust sidebar on initial load
  useEffect(() => {
    const checkMobile = () => {
      const isMobile = window.innerWidth < 768;
      setIsSidebarCollapsed(isMobile);
    };
    
    // Initial check
    checkMobile();
    
    // Add resize listener
    window.addEventListener('resize', checkMobile);
    
    // Cleanup listener
    return () => {
      window.removeEventListener('resize', checkMobile);
    };
  }, []);
  
  // Toggle sidebar collapsed state
  const toggleSidebar = () => {
    setIsSidebarCollapsed(!isSidebarCollapsed);
  };
  
  // Toggle mobile menu state
  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };
  
  // Check if a route is active
  const isRouteActive = (route: string) => {
    if (!pathname) return false;
    return pathname === route || pathname.startsWith(`${route}/`);
  };
  
  // Set breadcrumb override
  const setBreadcrumbOverride = (path: string, label: string) => {
    setBreadcrumbOverrides(prev => ({
      ...prev,
      [path]: label
    }));
  };
  
  // Clear breadcrumb override
  const clearBreadcrumbOverride = (path: string) => {
    setBreadcrumbOverrides(prev => {
      const newOverrides = { ...prev };
      delete newOverrides[path];
      return newOverrides;
    });
  };
  
  // Context value
  const contextValue: NavigationContextType = {
    isSidebarCollapsed,
    toggleSidebar,
    setSidebarCollapsed: setIsSidebarCollapsed,
    
    isMobileMenuOpen,
    toggleMobileMenu,
    setMobileMenuOpen: setIsMobileMenuOpen,
    
    activeRoute,
    isRouteActive,
    
    breadcrumbOverrides,
    setBreadcrumbOverride,
    clearBreadcrumbOverride,
  };
  
  return (
    <NavigationContext.Provider value={contextValue}>
      {children}
    </NavigationContext.Provider>
  );
}

// Hook for consuming the context
export function useNavigation() {
  const context = useContext(NavigationContext);
  
  if (context === undefined) {
    throw new Error('useNavigation must be used within a NavigationProvider');
  }
  
  return context;
}

// Re-export the context for direct usage
export { NavigationContext };
