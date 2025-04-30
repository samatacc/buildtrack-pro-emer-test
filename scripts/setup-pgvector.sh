#!/bin/bash

# BuildTrack Pro - pgvector extension setup script
# This script configures the pgvector extension for PostgreSQL 14

# Set up colors for output
BLUE='\033[0;34m'
GREEN='\033[0;32m'
YELLOW='\033[0;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo -e "${BLUE}=======================================================${NC}"
echo -e "${BLUE}     BuildTrack Pro pgvector Extension Setup${NC}"
echo -e "${BLUE}=======================================================${NC}"

# Define paths
PGVECTOR_PATH="/opt/homebrew/Cellar/pgvector/0.8.0"
PG14_LIB_PATH="/opt/homebrew/lib/postgresql@14"
PG14_SHARE_PATH="/opt/homebrew/share/postgresql@14/extension"

# Verify paths exist
if [ ! -d "$PGVECTOR_PATH" ]; then
    echo -e "${RED}Error: pgvector installation not found at $PGVECTOR_PATH${NC}"
    exit 1
fi

echo -e "${YELLOW}Starting PostgreSQL service...${NC}"
brew services start postgresql@14
sleep 2

# Create the vector extension in the database
echo -e "${YELLOW}Creating vector extension in the buildtrack database...${NC}"
psql -d buildtrack -c "CREATE EXTENSION IF NOT EXISTS vector;"

if [ $? -eq 0 ]; then
    echo -e "${GREEN}Successfully installed pgvector extension!${NC}"
else
    echo -e "${RED}Failed to create pgvector extension!${NC}"
    echo -e "${YELLOW}Creating symlinks for pgvector files...${NC}"
    
    # Create symlinks if necessary
    mkdir -p "$PG14_SHARE_PATH"
    mkdir -p "$PG14_LIB_PATH"
    
    # Copy control and SQL files
    cp -f "$PGVECTOR_PATH/share/postgresql@14/extension/"* "$PG14_SHARE_PATH/"
    
    # Copy library files
    cp -f "$PGVECTOR_PATH/lib/postgresql@14/vector.so" "$PG14_LIB_PATH/"
    
    echo -e "${YELLOW}Restarting PostgreSQL service...${NC}"
    brew services restart postgresql@14
    sleep 3
    
    echo -e "${YELLOW}Trying to create extension again...${NC}"
    psql -d buildtrack -c "CREATE EXTENSION IF NOT EXISTS vector;"
    
    if [ $? -eq 0 ]; then
        echo -e "${GREEN}Successfully created pgvector extension!${NC}"
    else
        echo -e "${RED}Failed to create pgvector extension. Manual setup may be required.${NC}"
        exit 1
    fi
fi

echo -e "${GREEN}=======================================================${NC}"
echo -e "${GREEN}     pgvector Extension Setup Complete!${NC}"
echo -e "${GREEN}=======================================================${NC}"
echo -e "${YELLOW}You can now run migrations with 'npx prisma migrate dev'${NC}"

exit 0
