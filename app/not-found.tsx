'use client';

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center p-6 bg-white">
      <div className="max-w-md w-full space-y-8 text-center">
        <div>
          <h1 className="text-3xl font-bold text-[rgb(24,62,105)]">
            404 - Page Not Found
          </h1>
          <p className="text-lg text-gray-600 mt-4">
            The page you are looking for does not exist.
          </p>
          
          <div className="mt-6">
            <a
              href="/"
              className="px-6 py-3 bg-[rgb(24,62,105)] text-white rounded-md font-semibold hover:bg-[rgb(19,49,84)] transition-colors"
            >
              Return to Home
            </a>
          </div>
          
          <div className="mt-4">
            <a
              href="/dashboard"
              className="px-6 py-3 border border-[rgb(24,62,105)] text-[rgb(24,62,105)] rounded-md font-semibold hover:bg-gray-50 transition-colors"
            >
              Go to Dashboard
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
