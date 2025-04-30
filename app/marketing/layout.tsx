'use client'

import { ReactNode } from 'react'
import { Inter } from 'next/font/google'
import Link from 'next/link'

const inter = Inter({ subsets: ['latin'] })

interface MarketingLayoutProps {
  children: ReactNode
}

export default function MarketingLayout({ children }: MarketingLayoutProps) {
  // Navigation links for the marketing site
  const navLinks = [
    { name: 'Home', href: '/' },
    { name: 'Features', href: '/features' },
    { name: 'Industry Solutions', href: '/solutions' },
    { name: 'Resources', href: '/resources' },
    { name: 'About', href: '/company' },
    { name: 'Contact', href: '/contact' },
  ]

  return (
    <div className={`min-h-screen flex flex-col ${inter.className}`}>
      {/* Header */}
      <header className="sticky top-0 z-50 bg-white shadow-sm">
        {/* Announcement banner */}
        <div className="bg-[rgb(24,62,105)] text-white text-center text-sm py-2">
          🎉 New material tracking features now available. <Link href="/features" className="underline font-medium">Learn more</Link>
        </div>
        
        {/* Main header */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            {/* Logo */}
            <div className="flex-shrink-0">
              <Link href="/" className="flex items-center">
                <span className="text-2xl font-bold text-[rgb(24,62,105)]">BuildTrack Pro</span>
              </Link>
            </div>
            
            {/* Navigation */}
            <nav className="hidden md:flex space-x-8">
              {navLinks.map((link) => (
                <Link
                  key={link.name}
                  href={link.href}
                  className="text-gray-600 hover:text-[rgb(24,62,105)] px-2 py-1 font-medium text-sm"
                >
                  {link.name}
                </Link>
              ))}
            </nav>
            
            {/* CTA buttons */}
            <div className="hidden md:flex items-center space-x-4">
              <Link
                href="/auth/login"
                className="text-[rgb(24,62,105)] font-medium text-sm hover:text-[rgb(19,49,84)]"
              >
                Sign in
              </Link>
              <Link
                href="/auth/register"
                className="bg-[rgb(236,107,44)] text-white font-medium px-4 py-2 rounded-md text-sm hover:bg-[rgb(220,100,40)]"
              >
                Get Started
              </Link>
            </div>
            
            {/* Mobile menu button */}
            <div className="md:hidden">
              <button
                type="button"
                className="bg-white rounded-md p-2 inline-flex items-center justify-center text-gray-400 hover:text-gray-500 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-[rgb(236,107,44)]"
                aria-expanded="false"
              >
                <span className="sr-only">Open menu</span>
                <svg
                  className="h-6 w-6"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  aria-hidden="true"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M4 6h16M4 12h16M4 18h16"
                  />
                </svg>
              </button>
            </div>
          </div>
        </div>
      </header>
      
      {/* Main content */}
      <main className="flex-grow">
        {children}
      </main>
      
      {/* Footer */}
      <footer className="bg-[rgb(24,62,105)] text-white">
        <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <h3 className="text-lg font-semibold mb-4">BuildTrack Pro</h3>
              <p className="text-sm text-gray-300">
                The all-in-one construction management platform designed for builders who want to streamline their projects.
              </p>
            </div>
            <div>
              <h3 className="text-lg font-semibold mb-4">Product</h3>
              <ul className="space-y-2 text-sm">
                <li><Link href="/features" className="text-gray-300 hover:text-white">Features</Link></li>
                <li><Link href="/solutions" className="text-gray-300 hover:text-white">Solutions</Link></li>
                <li><Link href="/pricing" className="text-gray-300 hover:text-white">Pricing</Link></li>
                <li><Link href="/resources" className="text-gray-300 hover:text-white">Resources</Link></li>
              </ul>
            </div>
            <div>
              <h3 className="text-lg font-semibold mb-4">Company</h3>
              <ul className="space-y-2 text-sm">
                <li><Link href="/company" className="text-gray-300 hover:text-white">About us</Link></li>
                <li><Link href="/company/careers" className="text-gray-300 hover:text-white">Careers</Link></li>
                <li><Link href="/contact" className="text-gray-300 hover:text-white">Contact</Link></li>
                <li><Link href="/company/press" className="text-gray-300 hover:text-white">Press</Link></li>
              </ul>
            </div>
            <div>
              <h3 className="text-lg font-semibold mb-4">Legal</h3>
              <ul className="space-y-2 text-sm">
                <li><Link href="/privacy" className="text-gray-300 hover:text-white">Privacy Policy</Link></li>
                <li><Link href="/terms" className="text-gray-300 hover:text-white">Terms of Service</Link></li>
                <li><Link href="/cookies" className="text-gray-300 hover:text-white">Cookie Policy</Link></li>
              </ul>
            </div>
          </div>
          <div className="mt-8 pt-8 border-t border-gray-700 text-sm text-gray-300">
            <p>&copy; {new Date().getFullYear()} BuildTrack Pro. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}
