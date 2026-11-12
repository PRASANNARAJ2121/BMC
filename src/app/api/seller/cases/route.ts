import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { requireAuth, recordAuditEvent } from "@/lib/auth";
import { AcquisitionVehicleDetailsSchema } from "@/lib/validations";

export async function GET() {
  try {
    const user = await requireAuth();

    let sellerProfile = await db.sellerProfile.findUnique({
      where: { userId: user.id },
    });

    if (!sellerProfile) {
      sellerProfile = await db.sellerProfile.create({
        data: { userId: user.id },
      });
    }

    const cases = await db.acquisitionCase.findMany({
      where: { sellerProfileId: sellerProfile.id },
      include: {
        vehicleDetails: true,
        purchaseOffers: {
          where: { status: "ISSUED" },
          select: {
            id: true,
            offeredPrice: true,
            status: true,
            expiresAt: true,
            termsAndConditions: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    // Sanitized output for seller
    const sanitized = cases.map((c) => ({
      id: c.id,
      caseNumber: c.caseNumber,
      status: c.status,
      sellerAskingPrice: c.sellerAskingPrice,
      createdAt: c.createdAt,
      vehicle: c.vehicleDetails
        ? {
            make: c.vehicleDetails.make,
            model: c.vehicleDetails.model,
            variant: c.vehicleDetails.variant,
            year: c.vehicleDetails.year,
            fuelType: c.vehicleDetails.fuelType,
            transmission: c.vehicleDetails.transmission,
            odometerKm: c.vehicleDetails.odometerKm,
            registrationNumber: c.vehicleDetails.registrationNumber,
          }
        : null,
      activeOffer: c.purchaseOffers[0] || null,
    }));

    return NextResponse.json({ cases: sanitized });
  } catch (err: unknown) {
    if (err instanceof Error && err.message === "UNAUTHORIZED") {
      return NextResponse.json({ error: "Sign in required" }, { status: 401 });
    }
    console.error("Seller cases error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const user = await requireAuth();

    let sellerProfile = await db.sellerProfile.findUnique({
      where: { userId: user.id },
    });
    if (!sellerProfile) {
      sellerProfile = await db.sellerProfile.create({
        data: { userId: user.id },
      });
    }

    const body = await req.json();
    const isSubmit = body.submit === true;

    // Validate details
    const parsed = AcquisitionVehicleDetailsSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.format() }, { status: 400 });
    }

    const data = parsed.data;

    // Generate unique case number
    const count = await db.acquisitionCase.count();
    const year = new Date().getFullYear();
    const caseNumber = `ACQ-${year}-${String(count + 1).padStart(4, "0")}`;

    // Get default central branch
    const branch = await db.branch.findFirst({ where: { active: true } });

    const newCase = await db.acquisitionCase.create({
      data: {
        caseNumber,
        sellerProfileId: sellerProfile.id,
        branchId: branch?.id,
        status: isSubmit ? "SUBMITTED" : "DRAFT",
        sellerAskingPrice: data.sellerAskingPrice,
        vehicleDetails: {
          create: {
            make: data.make,
            model: data.model,
            variant: data.variant,
            year: data.year,
            registrationNumber: data.registrationNumber,
            vin: data.vin,
            chassisNumber: data.chassisNumber,
            engineNumber: data.engineNumber,
            fuelType: data.fuelType,
            transmission: data.transmission,
            odometerKm: data.odometerKm,
            ownershipCount: data.ownershipCount,
            registeredOwnerName: data.registeredOwnerName,
            isCommercial: data.isCommercial,
            loanHypothecation: data.loanHypothecation,
            outstandingFinance: data.outstandingFinance,
            financierName: data.financierName,
            knownAccidents: data.knownAccidents,
            knownDamages: data.knownDamages,
            floodFireDamage: data.floodFireDamage,
            exteriorColor: data.exteriorColor,
            locationCity: data.locationCity,
            locationState: data.locationState,
          },
        },
      },
      include: {
        vehicleDetails: true,
      },
    });

    await recordAuditEvent({
      actorId: user.id,
      actorRole: "SELLER",
      action: isSubmit ? "ACQUISITION_CASE_SUBMITTED" : "ACQUISITION_CASE_DRAFT_CREATED",
      entityName: "AcquisitionCase",
      entityId: newCase.id,
      after: { caseNumber, make: data.make, model: data.model, status: newCase.status },
    });

    return NextResponse.json({ case: newCase }, { status: 201 });
  } catch (err: unknown) {
    if (err instanceof Error && err.message === "UNAUTHORIZED") {
      return NextResponse.json({ error: "Sign in required" }, { status: 401 });
    }
    console.error("Create seller case error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

