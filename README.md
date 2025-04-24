# BuildTrack Pro

A comprehensive construction management solution with advanced project management, materials tracking, and AI-powered features.

## Project Structure

- `app/` - Next.js application code
  - `(admin)` - Admin console routes
  - `(marketing)` - Marketing website routes
  - `(subscriber)` - Main dashboard routes
- `components/` - Reusable React components
- `lib/` - Utility functions and shared code
- `styles/` - Global styles and Tailwind configuration
- `public/` - Static assets
- `rules/` - Project documentation and specifications

## Tech Stack

- **Frontend**: Next.js 15 (App Router), React 18+, TypeScript
- **Styling**: TailwindCSS, shadcn/ui
- **State**: Zustand, TanStack Query, React Context
- **Backend**: tRPC, Supabase
- **Database**: PostgreSQL, Redis
- **AI**: OpenAI, Google Cloud Vision AI, Mindee
- **DevOps**: Vercel, GitHub Actions, Sentry
- **CMS**: Sanity.io

## Getting Started

1. Clone the repository
2. Install dependencies: `npm install`
3. Copy `.env.example` to `.env.local` and configure environment variables
4. Run development server: `npm run dev`
5. Visit `http://localhost:3000`

## Development Guidelines

- Follow the coding standards in `rules/coding-preferences.mdc`
- All features are enabled by default, controlled via Admin Console
- Use feature branches for new development
- Write tests for all new features

## Documentation

Detailed documentation is available in the `rules/` directory:
- 100 series: Marketing Website
- 200 series: Admin Console
- 300 series: CMS
- 400 series: Main Dashboard

## License

Proprietary - All rights reserved
