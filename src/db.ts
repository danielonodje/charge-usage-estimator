import { PrismaClient } from '../generated/prisma/client.js';

// PrismaClient is attached to the `global` object to prevent
// exhausting database connections during hot reload in development
const globalForPrisma = global as unknown as { prisma: PrismaClient };

export const db =
  globalForPrisma.prisma ||
  new PrismaClient({
    log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
  });

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = db;