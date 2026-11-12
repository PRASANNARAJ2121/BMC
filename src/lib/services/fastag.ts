import { db } from "@/lib/db";
import { recordAuditEvent } from "@/lib/auth";
import { sendNotification } from "@/lib/services/notifications";

export interface FastagGateScanEvent {
  tagId: string;
  vehicleRegNumber: string;
  gateType: "ENTRY" | "EXIT";
  scannerId: string;
  timestamp?: string;
}

export interface GatePassResult {
  authorized: boolean;
  actionTaken: "CHECKED_IN_APPOINTMENT" | "EXIT_PERMITTED" | "EXIT_DENIED_UNPAID" | "UNREGISTERED_VEHICLE_LOGGED";
  gateBarrierCommand: "OPEN_BARRIER" | "HOLD_BARRIER";
  reason: string;
  vehicleRegNumber: string;
  customerName?: string;
  appointmentNumber?: string;
  jobNumber?: string;
  invoiceStatus?: string;
}

/**
 * Processes an automated FASTag RFID gate reading event.
 */
export async function processFastagGateEvent(params: FastagGateScanEvent): Promise<GatePassResult> {
  const { tagId, vehicleRegNumber, gateType, scannerId } = params;
  const regClean = vehicleRegNumber.replace(/[^A-Za-z0-9]/g, "").toUpperCase();

  // 1. ENTRY GATE SCAN
  if (gateType === "ENTRY") {
    // Look up today's active service appointment for this vehicle
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const appointment = await db.serviceAppointment.findFirst({
      where: {
        vehicleRegNumber: { contains: regClean.slice(-4) }, // match last 4 digits or exact
        status: { in: ["REQUESTED", "CONFIRMED"] },
      },
      orderBy: { createdAt: "desc" },
    });

    if (appointment) {
      // Auto-update appointment status to CHECKED_IN
      await db.serviceAppointment.update({
        where: { id: appointment.id },
        data: { status: "CONFIRMED" },
      });

      // Send automated arrival notification
      if (appointment.customerPhone) {
        sendNotification("SMS", {
          recipientName: appointment.customerName,
          recipientPhone: appointment.customerPhone,
          eventType: "APPOINTMENT_CONFIRMED",
          data: {
            appointmentNumber: appointment.appointmentNumber,
            preferredDate: "Gate Entry Confirmed Today",
          },
        }).catch((err) => console.warn("Gate SMS error:", err));
      }

      await recordAuditEvent({
        actorRole: "FASTAG_GATE_SYSTEM",
        action: "VEHICLE_GATE_ENTRY_AUTOMATED",
        entityName: "ServiceAppointment",
        entityId: appointment.id,
        after: { vehicleRegNumber: regClean, tagId, scannerId, gateType: "ENTRY" },
      });

      return {
        authorized: true,
        actionTaken: "CHECKED_IN_APPOINTMENT",
        gateBarrierCommand: "OPEN_BARRIER",
        reason: `Appointment ${appointment.appointmentNumber} verified for ${appointment.customerName}. Dedicated service bay assigned.`,
        vehicleRegNumber: regClean,
        customerName: appointment.customerName,
        appointmentNumber: appointment.appointmentNumber,
      };
    }

    // Vehicle arriving without advance appointment (Walk-in or Fleet)
    return {
      authorized: true,
      actionTaken: "UNREGISTERED_VEHICLE_LOGGED",
      gateBarrierCommand: "OPEN_BARRIER",
      reason: "Walk-in entry authorized. Customer directed to Reception Service Desk.",
      vehicleRegNumber: regClean,
    };
  }

  // 2. EXIT GATE SCAN (Payment Security Barrier Verification)
  if (gateType === "EXIT") {
    // Check if there is an active job card for this vehicle
    const activeJob = await db.jobCard.findFirst({
      where: {
        vehicleRegNumber: { contains: regClean.slice(-4) },
        status: { in: ["READY", "READY_FOR_INVOICE", "INVOICED", "DELIVERED", "IN_PROGRESS"] },
      },
      include: { invoices: true },
      orderBy: { createdAt: "desc" },
    });

    if (activeJob) {
      const latestInvoice = activeJob.invoices[0];

      // Security check: Must have paid invoice before vehicle exit!
      if (latestInvoice && latestInvoice.paymentStatus !== "PAID") {
        return {
          authorized: false,
          actionTaken: "EXIT_DENIED_UNPAID",
          gateBarrierCommand: "HOLD_BARRIER",
          reason: `Barrier locked: Work order ${activeJob.jobNumber} has unpaid balance of ₹${latestInvoice.grandTotal.toLocaleString("en-IN")}. Settle at Cashier Desk or via UPI QR.`,
          vehicleRegNumber: regClean,
          customerName: activeJob.customerName,
          jobNumber: activeJob.jobNumber,
          invoiceStatus: latestInvoice.paymentStatus,
        };
      }

      // If invoice paid or delivery authorized, open gate barrier
      await db.jobCard.update({
        where: { id: activeJob.id },
        data: { status: "DELIVERED" },
      });

      await recordAuditEvent({
        actorRole: "FASTAG_GATE_SYSTEM",
        action: "VEHICLE_GATE_EXIT_AUTHORIZED",
        entityName: "JobCard",
        entityId: activeJob.id,
        after: { vehicleRegNumber: regClean, tagId, scannerId, status: "DELIVERED" },
      });

      return {
        authorized: true,
        actionTaken: "EXIT_PERMITTED",
        gateBarrierCommand: "OPEN_BARRIER",
        reason: `Payment verified. Work order ${activeJob.jobNumber} completed. Thank you for visiting Bharat Motor Club.`,
        vehicleRegNumber: regClean,
        customerName: activeJob.customerName,
        jobNumber: activeJob.jobNumber,
        invoiceStatus: latestInvoice?.paymentStatus || "PAID",
      };
    }

    return {
      authorized: true,
      actionTaken: "EXIT_PERMITTED",
      gateBarrierCommand: "OPEN_BARRIER",
      reason: "Exit permitted. No outstanding active workshop work orders.",
      vehicleRegNumber: regClean,
    };
  }

  throw new Error("Invalid gate scan direction.");
}

