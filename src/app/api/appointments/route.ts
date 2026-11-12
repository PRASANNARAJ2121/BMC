import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getSessionUser, recordAuditEvent } from "@/lib/auth";
import { ServiceAppointmentSchema } from "@/lib/validations";

export async function GET() {
  try {
    const user = await getSessionUser();
    if (!user) {
      return NextResponse.json({ appointments: [] });
    }

    const appointments = await db.serviceAppointment.findMany({
      where: { customerUserId: user.id },
      include: { branch: true },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({ appointments });
  } catch (err: unknown) {
    console.error("Get appointments error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const parsed = ServiceAppointmentSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.format() }, { status: 400 });
    }

    const data = parsed.data;
    const user = await getSessionUser();

    // Capacity & double booking check for same vehicle/date
    const existing = await db.serviceAppointment.findFirst({
      where: {
        vehicleRegNumber: data.vehicleRegNumber,
        preferredDate: new Date(data.preferredDate),
        status: { in: ["REQUESTED", "CONFIRMED"] },
      },
    });

    if (existing) {
      return NextResponse.json(
        { error: "An active appointment already exists for this vehicle on the selected date" },
        { status: 409 }
      );
    }

    const count = await db.serviceAppointment.count();
    const appointmentNumber = `APT-${new Date().getFullYear()}-${String(count + 1).padStart(4, "0")}`;

    const defaultBranch = await db.branch.findFirst({ where: { active: true } });

    const appointment = await db.serviceAppointment.create({
      data: {
        appointmentNumber,
        customerUserId: user?.id,
        customerName: data.customerName,
        customerPhone: data.customerPhone,
        customerEmail: data.customerEmail || "",
        vehicleMake: data.vehicleMake,
        vehicleModel: data.vehicleModel,
        vehicleRegNumber: data.vehicleRegNumber,
        serviceCategory: data.serviceCategory,
        preferredDate: new Date(data.preferredDate),
        preferredTimeSlot: data.preferredTimeSlot,
        branchId: defaultBranch?.id,
        issueDescription: data.issueDescription,
        status: "REQUESTED",
      },
    });

    // Also record CRM lead
    const leadCount = await db.cRMLead.count();
    await db.cRMLead.create({
      data: {
        leadNumber: `LEAD-${new Date().getFullYear()}-${String(leadCount + 1).padStart(4, "0")}`,
        source: "WEBSITE",
        department: "GARAGE",
        contactName: data.customerName,
        phone: data.customerPhone,
        email: data.customerEmail || "",
        vehicleOfInterest: `${data.vehicleMake} ${data.vehicleModel} (${data.vehicleRegNumber})`,
        notes: `Service appointment booked for ${data.serviceCategory}: ${data.issueDescription}`,
      },
    });

    await recordAuditEvent({
      actorId: user?.id,
      actorRole: user?.roles[0] || "CUSTOMER",
      action: "SERVICE_APPOINTMENT_REQUESTED",
      entityName: "ServiceAppointment",
      entityId: appointment.id,
      after: { appointmentNumber, serviceCategory: data.serviceCategory },
    });

    return NextResponse.json({ success: true, appointment }, { status: 201 });
  } catch (err: unknown) {
    console.error("Create appointment error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

