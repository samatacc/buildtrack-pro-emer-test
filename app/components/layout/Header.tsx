"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";

const navigation = [
  { name: "Home", href: "/" },
  { name: "Features", href: "/features" },
  { name: "Industry Solutions", href: "/solutions" },
  { name: "Resources", href: "/resources" },
  { name: "About", href: "/about" },
  { name: "Contact", href: "/contact" },
];

export default function Header(): React.ReactNode {
  const pathname = usePathname();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <header className="bg-white shadow-sm sticky top-0 z-50 transition-shadow duration-300">
      {/* Top notification bar - can be conditionally rendered */}
      <div className="bg-[rgb(24,62,105)] text-white text-sm py-1 text-center">
        <p className="max-w-7xl mx-auto px-4">
          🚀 <span className="font-medium">New Feature:</span> AI-powered
          project scheduling now available!{" "}
          <a
            href="/features/ai-scheduling"
            className="underline hover:text-[rgb(236,107,44)] transition-colors"
          >
            Learn more
          </a>
        </p>
      </div>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          {/* Logo */}
          <Link
            href="/"
            className="flex items-center gap-2 flex-shrink-0 group"
          >
            <div className="w-9 h-9 flex items-center justify-center rounded-lg bg-[rgb(24,62,105)] text-white font-bold text-lg group-hover:bg-[rgb(236,107,44)] transition-colors">
              BT
            </div>
            <span className="text-xl font-bold text-[rgb(24,62,105)] group-hover:text-[rgb(236,107,44)] transition-colors">
              BuildTrack Pro
            </span>
          </Link>

          {/* Mobile menu button */}
          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="md:hidden inline-flex items-center justify-center p-2 rounded-md text-slate-600 hover:text-primary-600 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-primary-600"
          >
            <span className="sr-only">Open main menu</span>
            {/* Hamburger icon */}
            <svg
              className="h-6 w-6"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth="1.5"
              stroke="currentColor"
            >
              {isMenuOpen ? (
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M6 18L18 6M6 6l12 12"
                />
              ) : (
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M4 6h16M4 12h16M4 18h16"
                />
              )}
            </svg>
          </button>

          {/* Desktop navigation */}
          <div className="hidden md:flex md:items-center md:flex-1">
            <div className="flex-1 flex justify-center">
              <nav className="flex space-x-8 justify-center">
                {navigation.map((item) => (
                  <Link
                    key={item.name}
                    href={item.href}
                    className={`relative py-2 text-[18px] ${
                      pathname === item.href
                        ? "text-[rgb(236,107,44)] after:absolute after:bottom-0 after:left-0 after:w-full after:h-[2px] after:bg-[rgb(236,107,44)]"
                        : "text-[rgb(24,62,105)] hover:text-[rgb(236,107,44)]"
                    } transition-colors font-medium`}
                  >
                    {item.name}
                  </Link>
                ))}
              </nav>
            </div>
            <div className="flex items-center space-x-4 ml-8">
              <Link
                href="/login"
                className="text-[18px] font-medium text-[rgb(24,62,105)] hover:text-[rgb(236,107,44)] transition-colors"
              >
                Sign in
              </Link>
              <Link
                href="/register"
                className="text-[18px] font-medium bg-[rgb(236,107,44)] text-white px-6 py-2 rounded-lg hover:bg-[rgb(220,90,30)] transition-colors"
              >
                Get Started
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      <div
        className={`${
          isMenuOpen ? "block" : "hidden"
        } md:hidden absolute top-16 inset-x-0 bg-white border-b border-gray-200 py-2`}
      >
        <div className="px-4 py-2 space-y-1">
          {navigation.map((item) => (
            <Link
              key={item.name}
              href={item.href}
              className={`${
                pathname === item.href
                  ? "text-[rgb(236,107,44)] bg-orange-50"
                  : "text-[rgb(24,62,105)] hover:bg-gray-50"
              } block px-3 py-2 rounded-md text-base font-medium transition-colors`}
              onClick={() => setIsMenuOpen(false)}
            >
              {item.name}
            </Link>
          ))}
          <div className="mt-4 space-y-2">
            <Link
              href="/login"
              className="block w-full text-left px-3 py-2 text-lg font-medium text-[rgb(24,62,105)] hover:text-[rgb(236,107,44)] hover:bg-gray-50 rounded-md transition-colors"
              onClick={() => setIsMenuOpen(false)}
            >
              Sign in
            </Link>
            <Link
              href="/register"
              className="block w-full text-center px-3 py-2 text-lg font-medium bg-[rgb(236,107,44)] text-white rounded-lg hover:bg-[rgb(220,90,30)] transition-colors"
              onClick={() => setIsMenuOpen(false)}
            >
              Get Started
            </Link>
          </div>
        </div>
      </div>
    </header>
  );
}
