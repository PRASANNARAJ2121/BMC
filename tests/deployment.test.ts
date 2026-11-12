import { describe, it, expect } from "vitest";
import fs from "fs";
import path from "path";

describe("Phase A: Production Deployment & Containerization", () => {
  const rootDir = path.resolve(__dirname, "..");

  it("verifies production Dockerfile exists with multi-stage standalone runner", () => {
    const dockerfilePath = path.join(rootDir, "Dockerfile");
    expect(fs.existsSync(dockerfilePath)).toBe(true);

    const content = fs.readFileSync(dockerfilePath, "utf-8");
    expect(content).toContain("FROM node:22-alpine AS base");
    expect(content).toContain("FROM base AS deps");
    expect(content).toContain("FROM base AS builder");
    expect(content).toContain("FROM base AS runner");
    expect(content).toContain("EXPOSE 3000");
    expect(content).toContain('CMD ["node", "server.js"]');
  });

  it("verifies docker-compose.yml defines web, postgresql, and redis services", () => {
    const composePath = path.join(rootDir, "docker-compose.yml");
    expect(fs.existsSync(composePath)).toBe(true);

    const content = fs.readFileSync(composePath, "utf-8");
    expect(content).toContain("bmc-web:");
    expect(content).toContain("bmc-postgres:");
    expect(content).toContain("bmc-redis:");
    expect(content).toContain("postgres:16-alpine");
    expect(content).toContain("redis:7-alpine");
    expect(content).toContain("bmc_storage:");
  });

  it("verifies Google Cloud Run deployment specification", () => {
    const cloudrunPath = path.join(rootDir, "cloudrun.yaml");
    expect(fs.existsSync(cloudrunPath)).toBe(true);

    const content = fs.readFileSync(cloudrunPath, "utf-8");
    expect(content).toContain("name: bmc-platform");
    expect(content).toContain("containerPort: 3000");
    expect(content).toContain("asia-south1");
    expect(content).toContain("containerConcurrency: 80");
  });

  it("verifies production PostgreSQL Prisma schema provider", () => {
    const schemaPgPath = path.join(rootDir, "prisma", "schema.postgresql.prisma");
    expect(fs.existsSync(schemaPgPath)).toBe(true);

    const content = fs.readFileSync(schemaPgPath, "utf-8");
    expect(content).toContain('provider = "postgresql"');
    expect(content).toContain("model User");
    expect(content).toContain("model AcquisitionCase");
    expect(content).toContain("model CompanyVehicle");
  });
});

