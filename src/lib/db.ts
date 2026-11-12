import "dotenv/config";
import { PrismaLibSql } from "@prisma/adapter-libsql";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../generated/prisma/client";

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

function createPrismaClient(): PrismaClient {
  const url = process.env.DATABASE_URL || "file:dev.db";

  // Use LibSQL adapter for SQLite/LibSQL local files
  if (url.startsWith("file:") || url.startsWith("libsql:") || url.startsWith("ws:") || url.startsWith("wss:")) {
    const adapter = new PrismaLibSql({ url });
    return new PrismaClient({ adapter });
  }

  // Use PrismaPg driver adapter for PostgreSQL
  const adapter = new PrismaPg({ connectionString: url });
  return new PrismaClient({ adapter });
}

export const db = globalForPrisma.prisma ?? createPrismaClient();

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = db;
