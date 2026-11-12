import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { requireRoles, recordAuditEvent } from "@/lib/auth";
import { approveAndPublishResaleListing } from "@/lib/services/resale";

export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await requireRoles([
      "SUPER_ADMIN",
      "BUSINESS_OWNER",
      "INVENTORY_MANAGER",
      "SALES_MANAGER",
      "WORKSHOP_MANAGER",
      "COMPLIANCE_OFFICER",
    ]);

    const { id } = await params;
    const body = await req.json();
    const { action } = body;

    const vehicle = await db.companyVehicle.findUnique({
      where: { id },
      include: {
        refurbishmentJobs: true,
        expenses: true,
      },
    });

    if (!vehicle) {
      return NextResponse.json({ error: "Vehicle not found" }, { status: 404 });
    }

    // 1. APPROVE LEGAL SALE ELIGIBILITY (COMPLIANCE OFFICER / SUPER ADMIN)
    if (action === "APPROVE_LEGAL_ELIGIBILITY") {
      const updated = await db.companyVehicle.update({
        where: { id },
        data: {
          legalSaleEligibilityApproved: true,
          legalSaleApprovedById: user.id,
          legalSaleApprovedAt: new Date(),
        },
      });

      await recordAuditEvent({
        actorId: user.id,
        actorRole: user.roles[0],
        action: "LEGAL_SALE_ELIGIBILITY_APPROVED",
        entityName: "CompanyVehicle",
        entityId: id,
        after: { stockNumber: vehicle.stockNumber },
      });

      return NextResponse.json({ success: true, vehicle: updated });
    }

    // 2. RECORD QUALITY CONTROL (QC) INSPECTION
    if (action === "RECORD_QC") {
      const { checklist, passed, notes } = body;

      const qc = await db.qualityControlCheck.create({
        data: {
          vehicleId: id,
          checklistJson: JSON.stringify(checklist || {}),
          passed: !!passed,
          inspectorId: user.id,
          notes: notes || "",
        },
      });

      if (passed) {
        await db.companyVehicle.update({
          where: { id },
          data: {
            qcApproved: true,
            qcApprovedById: user.id,
            qcApprovedAt: new Date(),
            status: "APPROVED_FOR_RESALE",
          },
        });
      }

      await recordAuditEvent({
        actorId: user.id,
        actorRole: user.roles[0],
        action: passed ? "QC_INSPECTION_PASSED" : "QC_INSPECTION_FAILED",
        entityName: "CompanyVehicle",
        entityId: id,
        after: { passed, notes },
      });

      return NextResponse.json({ success: true, qc });
    }

    // 3. CREATE REFURBISHMENT JOB & CONSUME SPARE PARTS
    if (action === "ADD_REFURB_JOB") {
      const { category, notes, tasks = [], partsConsumed = [] } = body;
      const count = await db.refurbishmentJob.count();
      const jobNumber = `RFB-${new Date().getFullYear()}-${String(count + 1).padStart(4, "0")}`;

      let totalPartsCost = 0;
      let totalLabourCost = 0;

      const job = await db.refurbishmentJob.create({
        data: {
          vehicleId: id,
          jobNumber,
          category, // MECHANICAL, ELECTRICAL, ELECTRONICS, AC, TYRES, BODYWORK_PAINT, DETAILING
          status: "IN_PROGRESS",
          managerNotes: notes || "",
          startedAt: new Date(),
        },
      });

      // Add tasks
      for (const t of tasks) {
        const cost = Number(t.cost) || 0;
        totalLabourCost += cost;
        await db.refurbishmentTask.create({
          data: {
            jobId: job.id,
            description: t.description,
            cost,
            hoursSpent: Number(t.hoursSpent) || 1,
            technicianId: t.technicianId || user.id,
            status: "COMPLETED",
          },
        });
      }

      // Consume parts from stock transactionally
      for (const p of partsConsumed) {
        const product = await db.product.findUnique({ where: { id: p.productId } });
        if (product) {
          const qty = Number(p.quantity) || 1;
          const cost = product.sellingPrice * qty;
          totalPartsCost += cost;

          // Deduct stock
          await db.product.update({
            where: { id: product.id },
            data: {
              stockQuantity: { decrement: qty },
            },
          });

          // Record consumption
          await db.partConsumption.create({
            data: {
              productId: product.id,
              refurbishmentJobId: job.id,
              quantity: qty,
              unitPrice: product.sellingPrice,
              totalPrice: cost,
              recordedById: user.id,
            },
          });

          // Record inventory movement
          await db.inventoryMovement.create({
            data: {
              productId: product.id,
              movementType: "REFURB_CONSUMPTION",
              quantity: -qty,
              unitCost: product.purchaseCost,
              referenceId: job.id,
              notes: `Consumed for vehicle ${vehicle.stockNumber} refurbishment job ${jobNumber}`,
              recordedById: user.id,
            },
          });
        }
      }

      // Update job costs
      await db.refurbishmentJob.update({
        where: { id: job.id },
        data: {
          totalLabourCost,
          totalPartsCost,
          status: "COMPLETED",
          completedAt: new Date(),
        },
      });

      // Update vehicle cost basis
      const addedCost = totalLabourCost + totalPartsCost;
      await db.companyVehicle.update({
        where: { id },
        data: {
          totalReconditioningCost: { increment: addedCost },
          totalCostBasis: { increment: addedCost },
        },
      });

      // Log expense
      await db.vehicleExpense.create({
        data: {
          vehicleId: id,
          expenseType: category,
          amount: addedCost,
          description: `Refurbishment ${jobNumber}: Labour ₹${totalLabourCost} + Parts ₹${totalPartsCost}`,
          referenceJobId: job.id,
          recordedById: user.id,
        },
      });

      return NextResponse.json({ success: true, job });
    }

    // 4. APPROVE & PUBLISH TO PUBLIC CATALOGUE
    if (action === "PUBLISH_RESALE") {
      const {
        askingPrice,
        bodyType,
        keyFeatures,
        specifications,
        photos,
        inspectionSummary,
        repairsCompleted,
        knownDefects,
        ownershipCount,
        isFeatured,
      } = body;

      const listing = await approveAndPublishResaleListing({
        companyVehicleId: id,
        askingPrice: Number(askingPrice),
        bodyType: bodyType || "Sedan",
        keyFeatures,
        specifications,
        photos,
        inspectionSummary,
        repairsCompleted,
        knownDefects,
        ownershipCount: Number(ownershipCount) || 1,
        isFeatured: !!isFeatured,
        actorId: user.id,
        actorRole: user.roles[0],
      });

      return NextResponse.json({ success: true, listing });
    }

    return NextResponse.json({ error: "Unsupported action" }, { status: 400 });
  } catch (err: unknown) {
    console.error("Admin vehicle action error:", err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Internal server error" },
      { status: 400 }
    );
  }
}

