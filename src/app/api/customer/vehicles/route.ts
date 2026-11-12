import { NextResponse } from "next/server";
import { getSessionUser } from "@/lib/auth";
import { db } from "@/lib/db";

export async function GET() {
  try {
    const user = await getSessionUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Retrieve service history records matching customer
    const serviceRecords = await db.serviceHistoryRecord.findMany({
      where: {
        OR: [
          { customerUserId: user.id },
          { jobCard: { customerPhone: user.phone } },
        ],
      },
      include: {
        jobCard: {
          include: {
            tasks: true,
            invoices: true,
          },
        },
      },
      orderBy: { serviceDate: "desc" },
    });

    // Retrieve active membership
    const membership = await db.membership.findFirst({
      where: { userId: user.id, status: "ACTIVE" },
      include: { plan: true },
      orderBy: { createdAt: "desc" },
    });

    // Retrieve appointments
    const appointments = await db.serviceAppointment.findMany({
      where: { customerUserId: user.id },
      orderBy: { preferredDate: "desc" },
    });

    return NextResponse.json({
      serviceRecords,
      membership,
      appointments,
    });
  } catch (err: unknown) {
    console.error("Get customer garage error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

