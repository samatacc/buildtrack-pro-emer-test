import { redirect } from 'next/navigation'

// Root route redirects to marketing homepage
export default function Home() {
  redirect('/marketing')
}
