import { PrismaClient } from '@prisma/client';
import path from 'path';
import fs from 'fs';

const ensureSchemaPath = () => {
  if (process.env.PRISMA_SCHEMA_PATH && fs.existsSync(process.env.PRISMA_SCHEMA_PATH)) {
    return;
  }

  const candidates = [
    path.join(process.cwd(), 'prisma', 'schema.prisma'),
    path.join(process.cwd(), '..', 'prisma', 'schema.prisma'),
    path.join(process.cwd(), 'node_modules', '.prisma', 'client', 'schema.prisma'),
    path.join(process.cwd(), '..', 'node_modules', '.prisma', 'client', 'schema.prisma'),
    path.join(__dirname, 'prisma', 'schema.prisma'),
    path.join(__dirname, '..', 'prisma', 'schema.prisma'),
    path.join(__dirname, 'node_modules', '.prisma', 'client', 'schema.prisma'),
    path.join(__dirname, '..', 'node_modules', '.prisma', 'client', 'schema.prisma'),
  ];

  for (const candidate of candidates) {
    if (fs.existsSync(candidate)) {
      process.env.PRISMA_SCHEMA_PATH = candidate;
      return;
    }
  }
};

ensureSchemaPath();

declare global {
  // eslint-disable-next-line no-var
  var prisma: PrismaClient | undefined;
}

const prisma =
  global.prisma ||
  new PrismaClient({
    log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
  });

if (process.env.NODE_ENV !== 'production') {
  global.prisma = prisma;
}

export default prisma;
