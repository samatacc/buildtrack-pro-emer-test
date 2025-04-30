#!/bin/bash

# This script helps standardize translation hook usage throughout the codebase
# It identifies files using direct 'next-intl' imports and replaces them with our custom hooks

echo "🔍 Scanning for components using 'useTranslation' from 'next-intl'..."

# Find all files containing the direct import
FILES=$(grep -l "import { useTranslation } from 'next-intl'" $(find /Users/samuelalmeida/Documents/buildtrack-pro/app -name "*.tsx"))

# Count the files found
NUM_FILES=$(echo "$FILES" | wc -l)
echo "📂 Found $NUM_FILES components to update"

# Counter for tracking updates
UPDATED=0

# Process each file
for FILE in $FILES; do
  echo "🔄 Updating $FILE"
  
  # Replace the import statement
  sed -i '' 's/import { useTranslation } from '\''next-intl'\''/import { useTranslations } from '\''@\/app\/hooks\/useTranslations'\''/' "$FILE"
  
  # Replace the function call
  sed -i '' 's/const { t } = useTranslation/const { t } = useTranslations/' "$FILE"
  
  UPDATED=$((UPDATED + 1))
  echo "✅ Updated $UPDATED/$NUM_FILES files"
done

echo "🎉 Translation hook standardization complete"
echo "👀 Please verify the changes and test the application"
