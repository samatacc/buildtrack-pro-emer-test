/**
 * BuildTrack Pro - Prisma Client
 * 
 * This module provides a singleton Prisma client instance that can be used
 * throughout the application for database operations.
 */

import { PrismaClient } from '@prisma/client';

// Prevent multiple instances of Prisma Client in development
declare global {
  var prisma: PrismaClient | undefined;
}

const prisma = global.prisma || new PrismaClient();

if (process.env.NODE_ENV !== 'production') {
  global.prisma = prisma;
}

export default prisma;
