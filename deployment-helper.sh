#!/bin/bash

# BuildTrack Pro Deployment Helper Script
# This script ensures all critical files are in place during Vercel deployment
# Following BuildTrack Pro's development standards and design system:
# - Primary Blue: rgb(24,62,105)
# - Primary Orange: rgb(236,107,44)

echo "🛠️ BuildTrack Pro Deployment Helper"
echo "Ensuring all critical files and directories are in place..."

# Create necessary directories if they don't exist
mkdir -p app/constants
mkdir -p app/\[locale\]/shared-components
mkdir -p app/components/shared
mkdir -p app/components/marketing
mkdir -p app/components/profile

# Log the deployment environment
echo "Environment: ${VERCEL:-local}"
echo "Node version: $(node -v)"
echo "Directory structure:"
find app -type d -not -path "*/node_modules/*" -maxdepth 3 | sort

echo "✅ Deployment preparation completed"
exit 0
