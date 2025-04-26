import React from 'react';

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-6 bg-white">
      <div className="max-w-5xl w-full space-y-8 text-center">
        <h1 className="text-4xl font-bold text-[rgb(24,62,105)]">
          BuildTrack Pro
        </h1>
        <p className="text-xl max-w-2xl mx-auto text-gray-600">
          Database schema for the Dashboard Home feature has been successfully implemented and is ready for use.
        </p>
        <div className="pt-6">
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
