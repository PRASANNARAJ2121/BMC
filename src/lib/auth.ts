import { cookies } from "next/headers";
import crypto from "crypto";
import { db } from "./db";

export const SESSION_COOKIE_NAME = "bmc_session_token";
export const SESSION_DURATION_DAYS = 7;

export interface AuthUser {
  id: string;
  email: string;
  fullName: string;
  phone: string;
  roles: string[];
  branches: string[];
}

export async function createSession(userId: string): Promise<string> {
  const token = crypto.randomBytes(32).toString("hex");
  const expiresAt = new Date();
  expiresAt.setDate(expiresAt.getDate() + SESSION_DURATION_DAYS);

  await db.session.create({
    data: {
      sessionToken: token,
      userId,
      expiresAt,
    },
  });

  const cookieStore = await cookies();
  cookieStore.set(SESSION_COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    expires: expiresAt,
  });

  return token;
}

export async function destroySession(): Promise<void> {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get(SESSION_COOKIE_NAME)?.value;
    if (token) {
      await db.session.deleteMany({ where: { sessionToken: token } });
      cookieStore.delete(SESSION_COOKIE_NAME);
    }
  } catch (err) {
    console.error("Error destroying session:", err);
  }
}

export async function getSessionUser(): Promise<AuthUser | null> {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get(SESSION_COOKIE_NAME)?.value;
    if (!token) return null;

    const session = await db.session.findUnique({
      where: { sessionToken: token },
      include: {
        user: {
          include: {
            userRoles: {
              include: {
                role: true,
                branch: true,
              },
            },
          },
        },
      },
    });

    if (!session || session.expiresAt < new Date() || !session.user.active) {
      return null;
    }

    const roles = session.user.userRoles.map((ur) => ur.role.name);
    const branches = session.user.userRoles
      .map((ur) => ur.branch?.code)
      .filter((b): b is string => !!b);

    return {
      id: session.user.id,
      email: session.user.email,
      fullName: session.user.fullName,
      phone: session.user.phone,
      roles,
      branches,
    };
  } catch (err) {
    console.error("Error reading session user:", err);
    return null;
  }
}

export async function requireAuth(): Promise<AuthUser> {
  const user = await getSessionUser();
  if (!user) {
    throw new Error("UNAUTHORIZED");
  }
  return user;
}

export async function requireRoles(allowedRoles: string[]): Promise<AuthUser> {
  const user = await requireAuth();
  const hasRole = user.roles.some(
    (role) => allowedRoles.includes(role) || role === "SUPER_ADMIN"
  );
  if (!hasRole) {
    throw new Error("FORBIDDEN");
  }
  return user;
}

export async function recordAuditEvent(params: {
  actorId?: string;
  actorRole?: string;
  action: string;
  entityName: string;
  entityId: string;
  before?: unknown;
  after?: unknown;
  ipAddress?: string;
  userAgent?: string;
}) {
  try {
    await db.auditEvent.create({
      data: {
        actorId: params.actorId,
        actorRole: params.actorRole || "SYSTEM",
        action: params.action,
        entityName: params.entityName,
        entityId: params.entityId,
        beforeJson: params.before ? JSON.stringify(params.before) : "{}",
        afterJson: params.after ? JSON.stringify(params.after) : "{}",
        ipAddress: params.ipAddress || "",
        userAgent: params.userAgent || "",
      },
    });
  } catch (err) {
    console.error("Failed to record audit event:", err);
  }
}

