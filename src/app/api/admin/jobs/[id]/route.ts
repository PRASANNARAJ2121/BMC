import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { requireRoles, recordAuditEvent } from "@/lib/auth";

export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await requireRoles([
      "SUPER_ADMIN",
      "BUSINESS_OWNER",
      "WORKSHOP_MANAGER",
      "SERVICE_ADVISOR",
      "TECHNICIAN",
      "FINANCE_OFFICER",
    ]);

    const { id } = await params;
    const body = await req.json();
    const { action } = body;

    const job = await db.jobCard.findUnique({
      where: { id },
      include: {
        tasks: true,
        partConsumptions: true,
        estimates: true,
        branch: true,
      },
    });

    if (!job) {
      return NextResponse.json({ error: "Job card not found" }, { status: 404 });
    }

    // 1. ADD LABOUR TASK
    if (action === "ADD_TASK") {
      const { description, category, technicianId, estimatedHours = 1.0, labourRate = 600 } = body;
      const totalLabourCost = Number(estimatedHours) * Number(labourRate);

      const task = await db.jobTask.create({
        data: {
          jobCardId: id,
          description,
          category: category || job.category,
          technicianId: technicianId || user.id,
          estimatedHours: Number(estimatedHours),
          labourRate: Number(labourRate),
          totalLabourCost,
          status: "IN_PROGRESS",
        },
      });

      // Update job totals
      await db.jobCard.update({
        where: { id },
        data: {
          labourTotal: { increment: totalLabourCost },
          grandTotal: { increment: totalLabourCost * 1.18 }, // including tax
          taxTotal: { increment: totalLabourCost * 0.18 },
          status: "IN_PROGRESS",
        },
      });

      return NextResponse.json({ success: true, task });
    }

    // 2. CREATE ESTIMATE
    if (action === "CREATE_ESTIMATE") {
      const { items = [] } = body;
      const count = await db.estimate.count();
      const estimateNumber = `EST-${new Date().getFullYear()}-${String(count + 1).padStart(4, "0")}`;

      const labourTotal = job.labourTotal;
      const partsTotal = job.partsTotal;
      const subtotal = labourTotal + partsTotal;
      const taxTotal = Math.round(subtotal * 0.18 * 100) / 100;
      const grandTotal = subtotal + taxTotal;

      const estimate = await db.estimate.create({
        data: {
          jobCardId: id,
          estimateNumber,
          itemsJson: JSON.stringify(items),
          labourTotal,
          partsTotal,
          taxTotal,
          grandTotal,
          status: "PRESENTED",
        },
      });

      await db.jobCard.update({
        where: { id },
        data: { status: "ESTIMATE_PENDING" },
      });

      return NextResponse.json({ success: true, estimate });
    }

    // 3. APPROVE ESTIMATE (EXPLICIT TIMESTAMPED CUSTOMER APPROVAL)
    if (action === "APPROVE_ESTIMATE") {
      const { estimateId, signatureNote } = body;

      const estimate = await db.estimate.findUnique({ where: { id: estimateId } });
      if (!estimate) {
        return NextResponse.json({ error: "Estimate not found" }, { status: 404 });
      }

      await db.estimate.update({
        where: { id: estimateId },
        data: {
          status: "APPROVED_BY_CUSTOMER",
          customerApprovedAt: new Date(),
          customerSignatureNote: signatureNote || "Approved via Customer Portal",
        },
      });

      await db.jobCard.update({
        where: { id },
        data: { status: "ESTIMATE_APPROVED" },
      });

      await recordAuditEvent({
        actorId: user.id,
        actorRole: user.roles[0],
        action: "SERVICE_ESTIMATE_APPROVED",
        entityName: "Estimate",
        entityId: estimate.id,
        after: { grandTotal: estimate.grandTotal, customerApprovedAt: new Date() },
      });

      return NextResponse.json({ success: true, estimate });
    }

    // 4. CONSUME PART (STRICT CHECK: PREVENT NEGATIVE STOCK)
    if (action === "CONSUME_PART") {
      const { productId, quantity = 1 } = body;

      const product = await db.product.findUnique({ where: { id: productId } });
      if (!product) {
        return NextResponse.json({ error: "Product not found" }, { status: 404 });
      }

      const qty = Number(quantity);
      if (product.stockQuantity < qty) {
        return NextResponse.json(
          {
            error: `Insufficient stock: Requested ${qty}, available ${product.stockQuantity} for SKU ${product.sku}`,
          },
          { status: 400 }
        );
      }

      const totalPrice = product.sellingPrice * qty;

      // Decrement stock
      await db.product.update({
        where: { id: product.id },
        data: {
          stockQuantity: { decrement: qty },
        },
      });

      // Record consumption
      const consumption = await db.partConsumption.create({
        data: {
          productId: product.id,
          jobCardId: id,
          quantity: qty,
          unitPrice: product.sellingPrice,
          totalPrice,
          recordedById: user.id,
        },
      });

      // Record inventory movement ledger
      await db.inventoryMovement.create({
        data: {
          productId: product.id,
          movementType: "JOB_CONSUMPTION",
          quantity: -qty,
          unitCost: product.purchaseCost,
          referenceId: id,
          notes: `Consumed for Job Card ${job.jobNumber}`,
          recordedById: user.id,
        },
      });

      // Update job totals
      await db.jobCard.update({
        where: { id },
        data: {
          partsTotal: { increment: totalPrice },
          grandTotal: { increment: totalPrice * 1.18 },
          taxTotal: { increment: totalPrice * 0.18 },
        },
      });

      return NextResponse.json({ success: true, consumption });
    }

    // 5. GENERATE TAX INVOICE
    if (action === "GENERATE_INVOICE") {
      const count = await db.invoice.count();
      const invoiceNumber = `BMC-INV-${new Date().getFullYear()}-${String(count + 1).padStart(4, "0")}`;

      const subtotal = job.labourTotal + job.partsTotal;
      const cgstAmount = Math.round(subtotal * 0.09 * 100) / 100;
      const sgstAmount = Math.round(subtotal * 0.09 * 100) / 100;
      const grandTotal = subtotal + cgstAmount + sgstAmount;

      const invoice = await db.invoice.create({
        data: {
          invoiceNumber,
          jobCardId: id,
          branchId: job.branchId,
          customerName: job.customerName,
          customerPhone: job.customerPhone,
          subtotal,
          cgstRate: 9.0,
          cgstAmount,
          sgstRate: 9.0,
          sgstAmount,
          grandTotal,
          currency: "INR",
          paymentStatus: "PAID",
          paymentMethod: body.paymentMethod || "UPI",
          paidAt: new Date(),
        },
      });

      await db.jobCard.update({
        where: { id },
        data: {
          status: "INVOICED",
          grandTotal,
        },
      });

      return NextResponse.json({ success: true, invoice });
    }

    // 6. DELIVER VEHICLE & CREATE SERVICE HISTORY
    if (action === "DELIVER_VEHICLE") {
      const { odometerOut, serviceSummary, nextServiceMonths = 6, nextServiceKmInterval = 10000 } = body;

      const currentOdometer = Number(odometerOut) || job.odometerIn;
      const nextDate = new Date();
      nextDate.setMonth(nextDate.getMonth() + Number(nextServiceMonths));
      const nextKm = currentOdometer + Number(nextServiceKmInterval);

      // Find user account if customer phone or email matches
      const matchedUser = await db.user.findFirst({
        where: {
          OR: [
            { phone: job.customerPhone },
            ...(job.customerEmail ? [{ email: job.customerEmail }] : []),
          ],
        },
      });

      const history = await db.serviceHistoryRecord.upsert({
        where: { jobCardId: id },
        update: {
          odometerKm: currentOdometer,
          serviceSummary: serviceSummary || `Completed service across ${job.category}`,
          invoiceTotal: job.grandTotal,
          nextServiceDate: nextDate,
          nextServiceKm: nextKm,
        },
        create: {
          jobCardId: id,
          customerUserId: matchedUser?.id,
          vehicleRegNumber: job.vehicleRegNumber,
          vehicleDescription: `${job.vehicleMake} ${job.vehicleModel}`,
          odometerKm: currentOdometer,
          serviceSummary: serviceSummary || `Completed service across ${job.category}`,
          invoiceTotal: job.grandTotal,
          nextServiceDate: nextDate,
          nextServiceKm: nextKm,
        },
      });

      await db.jobCard.update({
        where: { id },
        data: {
          status: "DELIVERED",
          nextServiceDate: nextDate,
          nextServiceKm: nextKm,
        },
      });

      if (job.appointmentId) {
        await db.serviceAppointment.update({
          where: { id: job.appointmentId },
          data: { status: "DELIVERED" },
        });
      }

      await recordAuditEvent({
        actorId: user.id,
        actorRole: user.roles[0],
        action: "VEHICLE_SERVICED_AND_DELIVERED",
        entityName: "JobCard",
        entityId: id,
        after: {
          jobNumber: job.jobNumber,
          vehicleRegNumber: job.vehicleRegNumber,
          nextServiceDate: nextDate,
          nextServiceKm: nextKm,
        },
      });

      return NextResponse.json({ success: true, history });
    }

    return NextResponse.json({ error: "Unsupported action" }, { status: 400 });
  } catch (err: unknown) {
    console.error("Job card action error:", err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Internal server error" },
      { status: 400 }
    );
  }
}

