'use client'

import { ReactNode } from 'react'
import { Inter } from 'next/font/google'
import Link from 'next/link'

const inter = Inter({ subsets: ['latin'] })

interface AuthLayoutProps {
  children: ReactNode
}

export default function AuthLayout({ children }: AuthLayoutProps) {
  // Set current year for copyright notice
  const currentYear = new Date().getFullYear()
  
  return (
    <div className="min-h-screen flex flex-col" style={{ fontFamily: 'Inter, system-ui, sans-serif' }}>
      {/* Background with pattern */}
      <div className="fixed inset-0 bg-gradient-to-br from-gray-50 to-white">
        <div 
          className="absolute inset-0 opacity-10" 
          style={{ 
            backgroundImage: 'url("data:image/svg+xml,%3Csvg width=\'60\' height=\'60\' viewBox=\'0 0 60 60\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cg fill=\'none\' fill-rule=\'evenodd\'%3E%3Cg fill=\'%23183e69\' fill-opacity=\'0.4\'%3E%3Cpath d=\'M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z\'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")',
            backgroundSize: '60px 60px'
          }}>
        </div>
      </div>
      
      {/* Content overlay */}
      <div className="relative z-10 flex-1 flex flex-col py-12 sm:px-6 lg:px-8">
        {/* Logo Header - Used across all auth pages */}
        <div className="sm:mx-auto sm:w-full sm:max-w-md mb-8">
          <div className="flex justify-center">
            <Link href="/" className="flex items-center group" style={{ textDecoration: 'none' }}>
              <div 
                className="h-14 w-14 rounded-full text-white flex items-center justify-center text-xl font-bold mr-3 shadow-lg" 
                style={{ 
                  backgroundColor: 'rgb(24,62,105)',
                  transition: 'background-color 0.3s'
                }}
              >
                BT
              </div>
              <div className="flex flex-col">
                <span 
                  className="text-2xl font-bold" 
                  style={{ 
                    color: 'rgb(24,62,105)',
                    transition: 'color 0.3s'
                  }}
                >
                  BuildTrack Pro
                </span>
                <span style={{ fontSize: '0.875rem', color: '#6b7280' }}>Construction Management Solution</span>
              </div>
            </Link>
          </div>
        </div>
        
        {children}
        
        <div className="mt-10 sm:mx-auto sm:w-full sm:max-w-md">
          <div className="px-4 flex justify-center space-x-6 text-sm text-gray-500">
            <Link 
              href="/terms" 
              style={{ 
                color: '#6b7280', 
                textDecoration: 'none',
                transition: 'color 0.3s'
              }}
              onMouseOver={(e) => e.currentTarget.style.color = 'rgb(236,107,44)'}
              onMouseOut={(e) => e.currentTarget.style.color = '#6b7280'}
            >
              Terms
            </Link>
            <Link 
              href="/privacy" 
              style={{ 
                color: '#6b7280', 
                textDecoration: 'none',
                transition: 'color 0.3s'
              }}
              onMouseOver={(e) => e.currentTarget.style.color = 'rgb(236,107,44)'}
              onMouseOut={(e) => e.currentTarget.style.color = '#6b7280'}
            >
              Privacy
            </Link>
            <Link 
              href="/help" 
              style={{ 
                color: '#6b7280', 
                textDecoration: 'none',
                transition: 'color 0.3s'
              }}
              onMouseOver={(e) => e.currentTarget.style.color = 'rgb(236,107,44)'}
              onMouseOut={(e) => e.currentTarget.style.color = '#6b7280'}
            >
              Help
            </Link>
            <Link 
              href="/contact" 
              style={{ 
                color: '#6b7280', 
                textDecoration: 'none',
                transition: 'color 0.3s'
              }}
              onMouseOver={(e) => e.currentTarget.style.color = 'rgb(236,107,44)'}
              onMouseOut={(e) => e.currentTarget.style.color = '#6b7280'}
            >
              Contact
            </Link>
          </div>
          <div className="mt-4 text-center" style={{ fontSize: '0.75rem', color: '#9ca3af' }}>
            <p>
              © {currentYear} BuildTrack Pro. All rights reserved.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
