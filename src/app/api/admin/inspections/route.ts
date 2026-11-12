import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { requireRoles, recordAuditEvent } from "@/lib/auth";
import { transitionAcquisitionStatus } from "@/lib/services/acquisition";

export async function GET(req: Request) {
  try {
    await requireRoles([
      "SUPER_ADMIN",
      "BUSINESS_OWNER",
      "INSPECTOR",
      "ACQUISITION_MANAGER",
      "WORKSHOP_MANAGER",
    ]);

    const url = new URL(req.url);
    const caseId = url.searchParams.get("caseId");

    const where: Record<string, unknown> = {};
    if (caseId) where.caseId = caseId;

    const inspections = await db.acquisitionInspection.findMany({
      where,
      include: {
        acquisitionCase: {
          include: {
            vehicleDetails: true,
            sellerProfile: { include: { user: { select: { fullName: true, phone: true } } } },
          },
        },
        sections: {
          include: { findings: true },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({ inspections });
  } catch (err: unknown) {
    if (err instanceof Error && err.message === "FORBIDDEN") {
      return NextResponse.json({ error: "Forbidden: Inspector credentials required" }, { status: 403 });
    }
    console.error("Get inspections error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const user = await requireRoles([
      "SUPER_ADMIN",
      "BUSINESS_OWNER",
      "INSPECTOR",
      "ACQUISITION_MANAGER",
    ]);

    const body = await req.json();
    const {
      caseId,
      overallScore,
      summaryNotes,
      internalNotes,
      sections = [],
      signatureDataUrl,
      estimatedRepairCost = 0,
    } = body;

    if (!caseId) {
      return NextResponse.json({ error: "Acquisition case ID is required" }, { status: 400 });
    }

    const acqCase = await db.acquisitionCase.findUnique({
      where: { id: caseId },
      include: { vehicleDetails: true },
    });

    if (!acqCase) {
      return NextResponse.json({ error: "Acquisition case not found" }, { status: 404 });
    }

    // Generate unique inspection number
    const count = await db.acquisitionInspection.count();
    const inspectionNumber = `INSP-${new Date().getFullYear()}-${String(count + 1).padStart(4, "0")}`;

    // Create AcquisitionInspection record
    const inspection = await db.acquisitionInspection.create({
      data: {
        caseId,
        inspectionNumber,
        inspectorId: user.id,
        status: "COMPLETED",
        completedDate: new Date(),
        overallScore: Math.min(Math.max(Number(overallScore) || 85, 0), 120),
        summaryNotes: summaryNotes || "120-Point Multi-Stage Technical Assessment Completed.",
        internalNotes: internalNotes || (signatureDataUrl ? "Digital signature certified on mobile." : ""),
      },
    });

    // Create sections and nested findings
    let totalRepairEstimate = Number(estimatedRepairCost) || 0;

    for (const sec of sections) {
      const section = await db.inspectionSection.create({
        data: {
          inspectionId: inspection.id,
          sectionKey: sec.sectionKey || "GENERAL",
          score: Number(sec.score) || 100,
          notes: sec.notes || "",
        },
      });

      if (sec.findings && Array.isArray(sec.findings)) {
        for (const finding of sec.findings) {
          const repairCost = Number(finding.estimatedRepairCost) || 0;
          totalRepairEstimate += repairCost;

          await db.inspectionFinding.create({
            data: {
              sectionId: section.id,
              componentName: finding.componentName || "Component",
              status: finding.status || "CONFIRMED",
              severity: finding.severity || "NONE",
              description: finding.description || "",
              estimatedRepairCost: repairCost,
              buyerFacingDisclosure: finding.buyerFacingDisclosure !== false,
            },
          });
        }
      }
    }

    // Auto-create or update Valuation record
    await db.valuation.create({
      data: {
        caseId,
        estimatedMarketValue: acqCase.sellerAskingPrice || 600000,
        proposedOfferPrice: Math.max((acqCase.sellerAskingPrice || 600000) - totalRepairEstimate - 40000, 100000),
        estimatedReconditioningCost: totalRepairEstimate,
        targetMargin: 50000,
        confidenceScore: 0.9,
        notes: `Based on 120-point inspection ${inspectionNumber} (Score: ${overallScore}/120). Repair estimate: ₹${totalRepairEstimate.toLocaleString("en-IN")}.`,
        createdById: user.id,
      },
    });

    // Transition acquisition case to INSPECTION_COMPLETE if currently at scheduled/pending stage
    if (["INSPECTION_SCHEDULED", "INSPECTION_PENDING", "DOCUMENT_REVIEW", "SUBMITTED"].includes(acqCase.status)) {
      try {
        await transitionAcquisitionStatus({
          caseId,
          nextStatus: "INSPECTION_COMPLETE",
          actorId: user.id,
          actorRole: user.roles[0],
          reason: `120-point technical inspection ${inspectionNumber} completed by ${user.fullName} with score ${overallScore}/120.`,
        });
      } catch (transitionErr) {
        console.warn("Status transition note:", transitionErr);
      }
    }

    await recordAuditEvent({
      actorId: user.id,
      actorRole: user.roles[0],
      action: "TECHNICAL_INSPECTION_COMPLETED",
      entityName: "AcquisitionInspection",
      entityId: inspection.id,
      after: {
        inspectionNumber,
        overallScore,
        totalRepairEstimate,
        caseNumber: acqCase.caseNumber,
      },
    });

    return NextResponse.json({
      success: true,
      inspection,
      inspectionNumber,
      totalRepairEstimate,
    });
  } catch (err: unknown) {
    console.error("Create inspection error:", err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Failed to record technical inspection" },
      { status: 400 }
    );
  }
}

