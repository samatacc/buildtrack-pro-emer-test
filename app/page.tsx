import { redirect } from 'next/navigation'

// Root route redirects to marketing homepage
// The marketing page contains our DALL-E image integration
export default function Home() {
  redirect('/marketing')
}
