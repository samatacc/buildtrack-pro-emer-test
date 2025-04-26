/**
 * BuildTrack Pro - Server-side only Prisma Client
 * 
 * This module is imported only on the server side using dynamic imports
 * to prevent Prisma client initialization errors in the browser.
 */

// Use dynamic import to prevent Prisma from being included in client bundle
let PrismaClientPackage: any;
let prisma: any = null;

if (typeof window === 'undefined') {
  try {
    // Server-side only - PrismaClient will not be in client JS bundle
    const { PrismaClient } = require('@prisma/client');
    
    // Initialize with proper singleton pattern
    const globalForPrisma = global as unknown as { prisma?: any };
    
    if (!globalForPrisma.prisma) {
      globalForPrisma.prisma = new PrismaClient({
        log: ['error'],
      });
    }
    
    prisma = globalForPrisma.prisma;
    console.log('✅ Prisma initialized on server');
  } catch (error) {
    console.error('❌ Failed to initialize Prisma:', error);
    // Leave prisma as null - will be handled by services
  }
}

export { prisma };
