import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { db } from "@/lib/db";
import { createSession, recordAuditEvent } from "@/lib/auth";
import { RegisterSchema } from "@/lib/validations";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const parsed = RegisterSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.format() }, { status: 400 });
    }

    const { email, password, fullName, phone, isSeller } = parsed.data;

    const existing = await db.user.findUnique({ where: { email } });
    if (existing) {
      return NextResponse.json({ error: "Email already registered" }, { status: 409 });
    }

    const passwordHash = await bcrypt.hash(password, 10);
    const user = await db.user.create({
      data: {
        email,
        passwordHash,
        fullName,
        phone,
      },
    });

    // Assign appropriate role
    const roleName = isSeller ? "SELLER" : "CUSTOMER";
    const role = await db.role.findUnique({ where: { name: roleName } });
    if (role) {
      await db.userRole.create({
        data: {
          userId: user.id,
          roleId: role.id,
        },
      });
    }

    // If seller, initialize SellerProfile
    if (isSeller) {
      await db.sellerProfile.create({
        data: {
          userId: user.id,
        },
      });
    }

    await createSession(user.id);

    await recordAuditEvent({
      actorId: user.id,
      actorRole: roleName,
      action: "USER_REGISTERED",
      entityName: "User",
      entityId: user.id,
      after: { email, fullName, role: roleName },
    });

    return NextResponse.json(
      {
        user: {
          id: user.id,
          email: user.email,
          fullName: user.fullName,
          roles: [roleName],
        },
      },
      { status: 201 }
    );
  } catch (err: unknown) {
    console.error("Register error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

