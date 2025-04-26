import React from 'react';

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-6 bg-white">
      <div className="max-w-5xl w-full space-y-8 text-center">
        <div className="fade-in-up">
          <h1 className="text-5xl font-bold text-[rgb(24,62,105)]">
            BuildTrack Pro
          </h1>
          <p className="text-xl max-w-2xl mx-auto text-gray-600 mt-4">
            Database schema for the Dashboard Home feature has been successfully implemented and is ready for use.
          </p>
        </div>
        
        <div className="bg-white rounded-xl shadow-md p-8 mt-8 border border-gray-100">
          <h2 className="text-2xl font-bold text-[rgb(24,62,105)] mb-4">Schema Features</h2>
          <div className="grid md:grid-cols-2 gap-6 text-left">
            <div className="bg-gray-50 p-4 rounded-lg fade-in" style={{animationDelay: '100ms'}}>
              <h3 className="text-lg font-semibold text-[rgb(24,62,105)]">Multi-tenant Architecture</h3>
              <p className="text-gray-600">Organization-based data isolation with Row Level Security</p>
            </div>
            <div className="bg-gray-50 p-4 rounded-lg fade-in" style={{animationDelay: '200ms'}}>
              <h3 className="text-lg font-semibold text-[rgb(24,62,105)]">Mobile-First Design</h3>
              <p className="text-gray-600">Device-specific layouts for mobile, tablet, and desktop</p>
            </div>
            <div className="bg-gray-50 p-4 rounded-lg fade-in" style={{animationDelay: '300ms'}}>
              <h3 className="text-lg font-semibold text-[rgb(24,62,105)]">Customizable Dashboards</h3>
              <p className="text-gray-600">Flexible widget system with role-based defaults</p>
            </div>
            <div className="bg-gray-50 p-4 rounded-lg fade-in" style={{animationDelay: '400ms'}}>
              <h3 className="text-lg font-semibold text-[rgb(24,62,105)]">Advanced Analytics</h3>
              <p className="text-gray-600">Comprehensive reporting system with KPIs</p>
            </div>
          </div>
        </div>
        
        <div className="pt-6 fade-in" style={{animationDelay: '500ms'}}>
          <a
            href="/api/health"
            className="inline-block px-6 py-3 bg-[rgb(236,107,44)] text-white font-medium rounded-lg hover:opacity-90 transition-all"
          >
            Check API Status
          </a>
          <a
            href="https://github.com/Azend-studio/buildtrack-pro"
            className="inline-block ml-4 px-6 py-3 border border-[rgb(24,62,105)] text-[rgb(24,62,105)] font-medium rounded-lg hover:bg-[rgba(24,62,105,0.05)] transition-all"
          >
            View Repository
          </a>
        </div>
      </div>
    </main>
  );
}
