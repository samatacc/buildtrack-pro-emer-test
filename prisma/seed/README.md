# BuildTrack Pro Seed Data

This directory contains seed data for the BuildTrack Pro database schema, allowing developers to quickly populate the database with test data that represents realistic usage of the system.

## Overview

The seed data implements a comprehensive set of test entities that showcase the capabilities of the BuildTrack Pro platform, including:

- **Multiple Organizations**: To demonstrate multi-tenant capabilities
- **Various User Roles**: Admin, Manager, Team Member, and Client users
- **Projects & Tasks**: Construction projects with associated tasks
- **Dashboard Configurations**: Custom dashboards for different user types
- **Widgets**: Various widget types with appropriate configurations
- **Notifications**: Example notifications of different types
- **Reports & Analytics**: Sample reports and KPI targets

## Running the Seed

### Prerequisites

1. PostgreSQL database running (see DATABASE_SETUP.md in the project root)
2. Valid DATABASE_URL in the .env file
3. Prisma migrations ready to be applied

### Method 1: Using the Seed Runner Script

```bash
node prisma/seed/run-seed.js
```

This script will:
1. Check database configuration
2. Compile the TypeScript seed file
3. Run necessary migrations
4. Execute the seed process

### Method 2: Using Prisma CLI Directly

```bash
# Apply migrations first
npx prisma migrate deploy

# Run the seed
npx ts-node prisma/seed/seed.ts
```

## Seed Data Structure

### Organizations
- **Azend Construction**: Primary test organization
- **Skyline Builders**: Secondary organization for multi-tenant testing

### Users
- **Admin User**: Organization administrator
- **Project Manager**: Manages projects and tasks
- **Team Member**: Executes tasks
- **Client User**: Views project progress

### Projects
- **Oceanview Residences**: Residential construction project
- **Tech Hub Office Complex**: Commercial construction project

### Dashboard Widgets
- **Project Overview**: Summary of project status
- **Task List**: Current and upcoming tasks
- **Timeline**: Project schedule visualization
- **Analytics**: Performance metrics

## Extending the Seed Data

When extending the seed data, follow these guidelines:

1. **Maintain Multi-Tenant Isolation**: Always associate entities with organizations
2. **Create Realistic Scenarios**: Model data that represents actual usage patterns
3. **Follow Color Scheme**: Use the BuildTrack Pro color scheme for widget configurations
4. **Mobile-First Approach**: Include mobile, tablet, and desktop dashboard layouts

## Color Scheme Reference

Widgets and UI elements follow the BuildTrack Pro color scheme:
- Primary Blue: rgb(24,62,105)
- Primary Orange: rgb(236,107,44)

## Typography Patterns

Widget content follows BuildTrack Pro typography conventions:
- Headings: Bold, Primary Blue
- Body Text: Regular weight for readability
