import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { requireRoles, recordAuditEvent } from "@/lib/auth";

export async function GET(req: Request) {
  try {
    await requireRoles([
      "SUPER_ADMIN",
      "BUSINESS_OWNER",
      "WORKSHOP_MANAGER",
      "SERVICE_ADVISOR",
      "TECHNICIAN",
      "FINANCE_OFFICER",
    ]);

    const url = new URL(req.url);
    const category = url.searchParams.get("category");
    const status = url.searchParams.get("status");

    const where: Record<string, unknown> = {};
    if (category && category !== "ALL") where.category = category;
    if (status && status !== "ALL") where.status = status;

    const jobs = await db.jobCard.findMany({
      where,
      include: {
        branch: true,
        tasks: true,
        estimates: true,
        partConsumptions: {
          include: { product: true },
        },
        invoices: true,
        serviceHistory: true,
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({ jobs });
  } catch (err: unknown) {
    if (err instanceof Error && err.message === "FORBIDDEN") {
      return NextResponse.json({ error: "Forbidden: Workshop staff permissions required" }, { status: 403 });
    }
    console.error("Admin jobs error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const user = await requireRoles([
      "SUPER_ADMIN",
      "BUSINESS_OWNER",
      "WORKSHOP_MANAGER",
      "SERVICE_ADVISOR",
    ]);

    const body = await req.json();
    const {
      appointmentId,
      customerName,
      customerPhone,
      customerEmail,
      vehicleRegNumber,
      vehicleMake,
      vehicleModel,
      odometerIn,
      category = "GARAGE",
      customerConcerns,
    } = body;

    if (!customerName || !customerPhone || !vehicleRegNumber) {
      return NextResponse.json({ error: "Missing required customer or vehicle details" }, { status: 400 });
    }

    const count = await db.jobCard.count();
    const jobNumber = `JC-${new Date().getFullYear()}-${String(count + 1).padStart(4, "0")}`;
    const branch = await db.branch.findFirst({ where: { active: true } });

    const job = await db.jobCard.create({
      data: {
        jobNumber,
        appointmentId,
        branchId: branch?.id,
        customerName,
        customerPhone,
        customerEmail: customerEmail || "",
        vehicleRegNumber,
        vehicleMake: vehicleMake || "Vehicle",
        vehicleModel: vehicleModel || "Model",
        odometerIn: Number(odometerIn) || 0,
        category, // GARAGE, ELECTRICALS, ELECTRONICS, AC
        status: "VEHICLE_RECEIVED",
        serviceAdvisorId: user.id,
        customerConcerns: customerConcerns || "",
      },
    });

    if (appointmentId) {
      await db.serviceAppointment.update({
        where: { id: appointmentId },
        data: { status: "VEHICLE_RECEIVED" },
      });
    }

    await recordAuditEvent({
      actorId: user.id,
      actorRole: user.roles[0],
      action: "JOB_CARD_OPENED",
      entityName: "JobCard",
      entityId: job.id,
      after: { jobNumber, category, vehicleRegNumber },
    });

    return NextResponse.json({ success: true, job }, { status: 201 });
  } catch (err: unknown) {
    console.error("Create job card error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

