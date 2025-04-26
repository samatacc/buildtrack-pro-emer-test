// BuildTrack Pro - Seed Script Runner
// This script compiles and runs the seed.ts file

const { execSync } = require('child_process');
const path = require('path');
const fs = require('fs');

// Colors for console output
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  dim: '\x1b[2m',
  blue: '\x1b[34m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  red: '\x1b[31m',
};

console.log(`${colors.bright}${colors.blue}╔══════════════════════════════════════════╗${colors.reset}`);
console.log(`${colors.bright}${colors.blue}║        BuildTrack Pro Seed Runner        ║${colors.reset}`);
console.log(`${colors.bright}${colors.blue}╚══════════════════════════════════════════╝${colors.reset}`);

try {
  // Check if database is configured
  console.log(`\n${colors.yellow}Checking database configuration...${colors.reset}`);
  
  const envPath = path.join(__dirname, '..', '..', '.env');
  if (!fs.existsSync(envPath)) {
    throw new Error('.env file not found. Please create one based on .env.example');
  }
  
  const envContent = fs.readFileSync(envPath, 'utf8');
  const dbUrlMatch = envContent.match(/DATABASE_URL=["'](.*)["']/);
  
  if (!dbUrlMatch) {
    throw new Error('DATABASE_URL not found in .env file');
  }
  
  const dbUrl = dbUrlMatch[1];
  if (!dbUrl.includes('postgresql')) {
    throw new Error('DATABASE_URL must be a PostgreSQL connection string');
  }
  
  console.log(`${colors.green}✓ Database configuration found${colors.reset}`);

  // Compile TypeScript seed file
  console.log(`\n${colors.yellow}Compiling seed.ts...${colors.reset}`);
  execSync('npx tsc -p tsconfig.json prisma/seed/seed.ts --outDir prisma/seed/dist', {
    stdio: 'inherit',
  });
  console.log(`${colors.green}✓ Compilation successful${colors.reset}`);

  // Run database migrations if needed
  console.log(`\n${colors.yellow}Checking migrations status...${colors.reset}`);
  try {
    execSync('npx prisma migrate status', { stdio: 'inherit' });
    console.log(`\n${colors.yellow}Running database migrations...${colors.reset}`);
    execSync('npx prisma migrate deploy', { stdio: 'inherit' });
    console.log(`${colors.green}✓ Migrations applied successfully${colors.reset}`);
  } catch (migrateError) {
    console.log(`${colors.red}× Migrations check failed${colors.reset}`);
    console.log(`${colors.yellow}Creating initial migration...${colors.reset}`);
    execSync('npx prisma migrate dev --name initial --create-only', { stdio: 'inherit' });
    console.log(`${colors.green}✓ Initial migration created${colors.reset}`);
    console.log(`${colors.yellow}Applying migration...${colors.reset}`);
    execSync('npx prisma migrate deploy', { stdio: 'inherit' });
    console.log(`${colors.green}✓ Migration applied successfully${colors.reset}`);
  }

  // Generate Prisma client
  console.log(`\n${colors.yellow}Generating Prisma client...${colors.reset}`);
  execSync('npx prisma generate', { stdio: 'inherit' });
  console.log(`${colors.green}✓ Prisma client generated${colors.reset}`);

  // Run seed script
  console.log(`\n${colors.yellow}Running seed script...${colors.reset}`);
  execSync('node -r ts-node/register prisma/seed/seed.ts', { stdio: 'inherit' });
  console.log(`${colors.green}✓ Database seeded successfully${colors.reset}`);

  console.log(`\n${colors.bright}${colors.green}╔══════════════════════════════════════════╗${colors.reset}`);
  console.log(`${colors.bright}${colors.green}║      Seed process completed successfully   ║${colors.reset}`);
  console.log(`${colors.bright}${colors.green}╚══════════════════════════════════════════╝${colors.reset}`);
} catch (error) {
  console.error(`\n${colors.red}Error: ${error.message}${colors.reset}`);
  console.error(`\n${colors.red}Seed process failed${colors.reset}`);
  process.exit(1);
}
