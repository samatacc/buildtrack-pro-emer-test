import { Suspense } from 'react'
import dynamic from 'next/dynamic'

/**
 * Reset Password Page
 * 
 * Server component that uses dynamic import with ssr: false to address
 * the Next.js warning about useSearchParams not being wrapped in Suspense.
 * 
 * Follows BuildTrack Pro's design system with primary colors:
 * - Primary Blue: rgb(24,62,105)
 * - Primary Orange: rgb(236,107,44)
 */

// Dynamically import the client component with loading fallback
// Using ssr: false to fix the Next.js warning about useSearchParams
const ResetPasswordContent = dynamic(
  () => import('./ResetPasswordContent'),
  {
    loading: () => (
      <div className="flex min-h-screen flex-col items-center justify-center p-4 text-center">
        <div className="w-full max-w-md rounded-lg bg-white p-8 shadow-lg">
          <h2 className="mb-4 text-xl font-bold text-[rgb(24,62,105)]">Loading Password Reset</h2>
          <div className="mx-auto h-4 w-24 overflow-hidden rounded-full bg-gray-200">
            <div className="h-full animate-pulse rounded-full bg-[rgb(236,107,44)]"></div>
          </div>
        </div>
      </div>
    ),
    ssr: false // Disable server-side rendering for this component
  }
)

/**
 * Reset Password Page Component
 * 
 * Uses Suspense for handling the client-side useSearchParams() call
 * with a nice loading animation following BuildTrack Pro's design system.
 */
export default function ResetPasswordPage() {
  return (
    <Suspense fallback={
      <div className="flex min-h-screen flex-col items-center justify-center p-4 text-center">
        <div className="w-full max-w-md rounded-lg bg-white p-8 shadow-lg">
          <h2 className="mb-4 text-xl font-bold text-[rgb(24,62,105)]">Loading Password Reset</h2>
          <div className="mx-auto h-4 w-24 overflow-hidden rounded-full bg-gray-200">
            <div className="h-full animate-pulse rounded-full bg-[rgb(236,107,44)]"></div>
          </div>
        </div>
      </div>
    }>
      <ResetPasswordContent />
    </Suspense>
  )
}
