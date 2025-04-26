# BuildTrack Pro Database Setup Guide

## Prerequisites

- PostgreSQL 14+ installed
- Node.js 16+ and npm installed
- Prisma CLI installed (`npm install -g prisma`)

## Database Configuration

BuildTrack Pro uses PostgreSQL via Supabase for its database layer. The schema is managed using Prisma ORM.

### Local Development Setup

1. **Install PostgreSQL**

   ```bash
   # macOS (using Homebrew)
   brew install postgresql
   brew services start postgresql

   # Ubuntu/Debian
   sudo apt update
   sudo apt install postgresql postgresql-contrib
   sudo systemctl enable postgresql
   sudo systemctl start postgresql
   ```

2. **Create Database**

   ```bash
   # Connect to PostgreSQL
   psql postgres

   # Create database and user
   CREATE DATABASE buildtrack;
   CREATE USER buildtrack_user WITH ENCRYPTED PASSWORD 'your_password';
   GRANT ALL PRIVILEGES ON DATABASE buildtrack TO buildtrack_user;
   ```

3. **Install pgvector Extension**
   The schema requires the pgvector extension for AI features:

   ```bash
   # As PostgreSQL superuser
   \c buildtrack
   CREATE EXTENSION IF NOT EXISTS pgvector;
   ```

4. **Configure Environment Variables**
   Update your `.env` file with the database connection string:
   ```
   DATABASE_URL="postgresql://buildtrack_user:your_password@localhost:5432/buildtrack"
   ```

## Running Migrations

To apply the database schema:

```bash
# Generate Prisma client
npx prisma generate

# Create and apply migrations
npx prisma migrate dev --name init
```

## Database Schema Overview

The BuildTrack Pro database schema includes:

1. **Core Identity & Access Control**
   - Organizations, users, roles, and permissions
2. **Dashboard Configuration**
   - Widgets, layouts, and dashboard preferences
3. **Project Management**
   - Projects, tasks, and milestones
4. **Notification System**
   - Notifications and user preferences
5. **Analytics & Reporting**
   - Reports, metrics, and KPI tracking

## Row Level Security (RLS)

When deployed with Supabase, the database uses Row Level Security (RLS) policies to ensure data isolation between organizations. These policies are automatically applied during migration when using Supabase.

## Development Workflow

When making schema changes:

1. Update the Prisma schema (`prisma/schema.prisma`)
2. Create a migration:
   ```bash
   npx prisma migrate dev --name descriptive_name
   ```
3. Commit the migration files along with schema changes
4. Deploy the migration to production environments using:
   ```bash
   npx prisma migrate deploy
   ```

## Troubleshooting

If you encounter the error `Can't reach database server at localhost:5432`:

- Ensure PostgreSQL is running
- Check if the port is correct (default is 5432)
- Verify network accessibility and firewall settings
