"use client";

import React from "react";
import Link from "next/link";

export default function Footer() {
  return (
    <footer className="bg-[rgb(24,62,105)] py-12 text-white">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div>
            <h3 className="font-semibold text-lg mb-4">BuildTrack Pro</h3>
            <p className="opacity-80">
              Comprehensive construction management solution for modern
              builders.
            </p>
          </div>

          <div>
            <h4 className="font-semibold mb-4">Product</h4>
            <ul className="space-y-2 opacity-80">
              <li>
                <Link href="/features" className="hover:opacity-100">
                  Features
                </Link>
              </li>
              <li>
                <Link href="/pricing" className="hover:opacity-100">
                  Pricing
                </Link>
              </li>
              <li>
                <Link href="/solutions" className="hover:opacity-100">
                  Solutions
                </Link>
              </li>
              <li>
                <Link href="/demo" className="hover:opacity-100">
                  Demo
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="font-semibold mb-4">Company</h4>
            <ul className="space-y-2 opacity-80">
              <li>
                <Link href="/about" className="hover:opacity-100">
                  About Us
                </Link>
              </li>
              <li>
                <Link href="/contact" className="hover:opacity-100">
                  Contact
                </Link>
              </li>
              <li>
                <Link href="/careers" className="hover:opacity-100">
                  Careers
                </Link>
              </li>
              <li>
                <Link href="/blog" className="hover:opacity-100">
                  Blog
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="font-semibold mb-4">Legal</h4>
            <ul className="space-y-2 opacity-80">
              <li>
                <Link href="/privacy" className="hover:opacity-100">
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link href="/terms" className="hover:opacity-100">
                  Terms of Service
                </Link>
              </li>
              <li>
                <Link href="/cookies" className="hover:opacity-100">
                  Cookie Policy
                </Link>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-white/20 mt-8 pt-8 flex flex-col md:flex-row justify-between items-center">
          <p className="opacity-80 text-sm">
            © {new Date().getFullYear()} BuildTrack Pro. All rights reserved.
          </p>
          <div className="flex space-x-4 mt-4 md:mt-0">
            <a href="#" className="opacity-80 hover:opacity-100">
              <span className="sr-only">Twitter</span>
              <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24">
                <path d="M8.29 20.251c7.547 0 11.675-6.253 11.675-11.675 0-.178 0-.355-.012-.53A8.348 8.348 0 0022 5.92a8.19 8.19 0 01-2.357.646 4.118 4.118 0 001.804-2.27 8.224 8.224 0 01-2.605.996 4.107 4.107 0 00-6.993 3.743 11.65 11.65 0 01-8.457-4.287 4.106 4.106 0 001.27 5.477A4.072 4.072 0 012.8 9.713v.052a4.105 4.105 0 003.292 4.022 4.095 4.095 0 01-1.853.07 4.108 4.108 0 003.834 2.85A8.233 8.233 0 012 18.407a11.616 11.616 0 006.29 1.84"></path>
              </svg>
            </a>
            <a href="#" className="opacity-80 hover:opacity-100">
              <span className="sr-only">LinkedIn</span>
              <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24">
                <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z" />
              </svg>
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
