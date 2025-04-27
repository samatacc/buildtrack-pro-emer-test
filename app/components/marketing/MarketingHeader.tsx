'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useTranslations } from '@/app/hooks/useTranslations';
import EnhancedLanguageSelector from '@/app/components/shared/EnhancedLanguageSelector';

/**
 * Marketing Header Component
 * 
 * Responsive header for the marketing website with enhanced language support
 * and mobile menu. Follows BuildTrack Pro's design system with:
 * - Primary Blue: rgb(24,62,105)
 * - Primary Orange: rgb(236,107,44)
 * - Light neumorphism for subtle depth
 * - Glassmorphism for overlays/modals
 * - Micro-animations for engagement
 * - Mobile-first responsive design
 */
export default function MarketingHeader() {
  const { t } = useTranslations('marketing');
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const pathname = usePathname();
  
  // Navigation links with proper translations
  const navLinks = [
    { href: '/marketing#features', label: 'features' },
    { href: '/marketing#pricing', label: 'pricing' },
    { href: '/marketing#testimonials', label: 'testimonials' },
    { href: '/marketing#contact', label: 'contact' },
    { href: '/auth/login', label: 'login', highlight: true },
  ];
  
  // Handle scroll effects for the sticky header
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };
    
    // Add scroll event listener
    window.addEventListener('scroll', handleScroll);
    
    // Initial check
    handleScroll();
    
    // Cleanup
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);
  
  // Close mobile menu on navigation
  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [pathname]);
  
  return (
    <header 
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        isScrolled 
          ? 'py-2 bg-white/95 shadow-md backdrop-blur-sm' 
          : 'py-4 bg-transparent'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center">
          {/* Logo with animation */}
          <Link 
            href="/marketing" 
            className="flex items-center group"
            aria-label={t('backToHome', { fallback: 'Back to home page' })}
          >
            <div className={`
              flex items-center justify-center h-10 w-10 rounded-2xl 
              bg-[rgb(24,62,105)] text-white font-bold text-xl mr-2
              transition-transform duration-300 group-hover:scale-105
              ${isScrolled ? 'shadow-md' : 'shadow-lg'}
            `}>
              BP
            </div>
            <span className={`
              font-bold text-xl transition-colors duration-300
              ${isScrolled ? 'text-[rgb(24,62,105)]' : 'text-[rgb(24,62,105)]'}
              group-hover:text-[rgb(236,107,44)]
            `}>
              BuildTrack
              <span className="text-[rgb(236,107,44)]">Pro</span>
            </span>
          </Link>
          
          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-6">
            {navLinks.map((link, index) => (
              <Link
                key={link.label}
                href={link.href}
                className={`
                  text-base font-medium transition-all duration-300
                  relative after:absolute after:bottom-0 after:left-0 after:h-0.5 
                  after:w-0 hover:after:w-full after:transition-all after:duration-300
                  ${link.highlight 
                ? 'text-white bg-[rgb(236,107,44)] hover:bg-[rgb(220,100,40)] px-4 py-2 rounded-2xl shadow-sm hover:shadow' 
                : `${isScrolled ? 'text-[rgb(24,62,105)]' : 'text-[rgb(24,62,105)]'} 
                       hover:text-[rgb(236,107,44)] after:bg-[rgb(236,107,44)]`
              }
                  animate-fade-in-up ${link.highlight ? '' : ''}
                `}
                style={{ 
                  animationDelay: `${index * 100}ms`,
                  animationDuration: '400ms', 
                }}
              >
                {t(link.label, { fallback: link.label })}
              </Link>
            ))}
            
            {/* Language Selector */}
            <EnhancedLanguageSelector 
              variant="minimal" 
              position="header"
              showFlags={true}
              className="animate-fade-in"
            />
          </nav>
          
          {/* Mobile Menu Button */}
          <div className="flex items-center md:hidden">
            <EnhancedLanguageSelector 
              variant="minimal" 
              position="header"
              showFlags={true}
              showLanguageName={false}
              className="mr-2 animate-fade-in"
            />
            
            <button
              type="button"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className={`
                inline-flex items-center justify-center p-2 rounded-2xl
                transition-colors duration-300 focus:outline-none
                ${isScrolled 
      ? 'text-[rgb(24,62,105)] hover:bg-gray-100' 
      : 'text-[rgb(24,62,105)] hover:bg-white/30 backdrop-blur-sm'
    }
              `}
              aria-expanded={isMobileMenuOpen}
            >
              <span className="sr-only">
                {isMobileMenuOpen 
                  ? t('closeMenu', { fallback: 'Close menu' })
                  : t('openMenu', { fallback: 'Open menu' })
                }
              </span>
              {isMobileMenuOpen ? (
                <svg 
                  className="h-6 w-6 animate-fade-in" 
                  xmlns="http://www.w3.org/2000/svg" 
                  fill="none" 
                  viewBox="0 0 24 24" 
                  stroke="currentColor"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              ) : (
                <svg 
                  className="h-6 w-6 animate-fade-in" 
                  xmlns="http://www.w3.org/2000/svg" 
                  fill="none" 
                  viewBox="0 0 24 24" 
                  stroke="currentColor"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              )}
            </button>
          </div>
        </div>
      </div>
      
      {/* Mobile Navigation Menu with glassmorphism effect */}
      {isMobileMenuOpen && (
        <div className="md:hidden animate-fade-in">
          <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3 bg-white/95 backdrop-blur-md shadow-lg">
            {navLinks.map((link, index) => (
              <Link
                key={link.label}
                href={link.href}
                className={`
                  block px-3 py-2 rounded-2xl text-base font-medium
                  transition-all duration-300 animate-fade-in-up
                  ${link.highlight 
                ? 'text-white bg-[rgb(236,107,44)] hover:bg-[rgb(220,100,40)]' 
                : 'text-[rgb(24,62,105)] hover:bg-gray-50 hover:text-[rgb(236,107,44)]'
              }
                `}
                style={{ 
                  animationDelay: `${index * 75}ms`,
                  animationDuration: '300ms', 
                }}
              >
                {t(link.label, { fallback: link.label })}
              </Link>
            ))}
          </div>
        </div>
      )}
    </header>
  );
}
