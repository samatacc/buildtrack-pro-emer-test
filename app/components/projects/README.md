# Project Management Module

## Overview

The Project Management Module is a core part of BuildTrack Pro that allows users to create, view, and manage construction projects. This module implements the specifications outlined in `features/403-buildtrack-pro-project-management.mdc`.

## Components

### Project List

The `ProjectList` component displays all projects in a responsive grid layout, with the following features:
- Filtering by status, health, and text search
- Project cards showing key information including progress, budget, timeline, and team size
- Quick navigation to the project details
- Empty state handling
- Mobile-responsive design
- Create project button

**Location:** `/app/components/projects/ProjectList.tsx`

### Project Creation Wizard

The `ProjectCreationWizard` provides a multi-step form for creating new projects with the following steps:

1. **Template Selection** - Start from scratch or use a predefined template
2. **Basic Details** - Name, description, type, priority, dates
3. **Location** - Address, city, state, and site details
4. **Team** - Add team members with roles and permissions
5. **Milestones** - Define project milestones and deliverables
6. **Budget** - Set up budget categories and items
7. **Review** - Final review of all project information before submission

**Location:** `/app/components/projects/ProjectCreationWizard/index.tsx`
**Steps Components:** `/app/components/projects/ProjectCreationWizard/steps/*.tsx`

## Pages

### Projects Main Page

Displays the list of all projects accessible to the current user.

**Location:** `/app/[locale]/dashboard/projects/page.tsx`

### Project Creation Page

Contains the Project Creation Wizard for guiding users through creating a new project.

**Location:** `/app/[locale]/dashboard/projects/create/page.tsx`

## Internationalization

The module supports i18n using the translations defined in:

**Location:** `/messages/en/projects.json`

## Data Types

All project-related type definitions are located in:

**Location:** `/lib/types/project.ts`

These include:
- Project status and health enums
- Team roles
- Milestone status
- Budget data structures
- Project core interfaces

## Services

### Project Service

The `projectService` handles all data operations for projects including:
- Fetching project summaries
- Creating new projects
- Fetching project templates
- Updating projects
- Deleting projects

**Location:** `/lib/services/projectService.ts`

## Next Steps for Development

The following components still need to be implemented:

1. **Project Details Page** - Implement the detailed view of a single project
   - Location: `/app/[locale]/dashboard/projects/[id]/page.tsx`

2. **Project Overview Tab** - Display project summary, stats, and activity feed
   - Location: `/app/components/projects/ProjectOverview.tsx`

3. **Task Management Interface** - Implement views for tasks (List, Kanban, Gantt)
   - Location: `/app/components/projects/tasks/*.tsx`

4. **Team Collaboration** - Implement comments and activity tracking
   - Location: `/app/components/projects/collaboration/*.tsx`

5. **Supabase API Integration** - Replace mock data with actual API calls
   - Update `projectService.ts` to use Supabase client

## Design Guidelines

The Project Management Module follows BuildTrack Pro's design system with:
- Primary Blue: rgb(24,62,105)
- Primary Orange: rgb(236,107,44)
- Responsive design for all screen sizes
- Accessible UI elements with proper contrast
- Consistent spacing and typography
- Clear feedback for actions and loading states

## Testing

Ensure test coverage for all components:
- Unit tests for service functions
- Component tests for UI elements
- Integration tests for form submissions
- Accessibility tests for all interactive elements
