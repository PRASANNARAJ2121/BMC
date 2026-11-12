import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getSessionUser, recordAuditEvent } from "@/lib/auth";
import { reserveVehicle } from "@/lib/services/resale";
import {
  BuyerEnquirySchema,
  TestDriveRequestSchema,
  VehicleReservationSchema,
} from "@/lib/validations";

export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const listing = await db.publicVehicleListing.findUnique({
      where: { id },
      select: {
        id: true,
        stockNumber: true,
        make: true,
        model: true,
        variant: true,
        year: true,
        fuelType: true,
        transmission: true,
        mileageKm: true,
        exteriorColor: true,
        bodyType: true,
        askingPrice: true,
        isFeatured: true,
        isPublished: true,
        publishedAt: true,
        keyFeaturesJson: true,
        specificationsJson: true,
        photosJson: true,
        inspectionSummaryJson: true,
        repairsCompletedSummaryJson: true,
        knownDefectsDisclosureJson: true,
        ownershipCountDisclosure: true,
        reservationStatus: true,
        reservedUntil: true,
      },
    });

    if (!listing || !listing.isPublished) {
      return NextResponse.json({ error: "Vehicle not found" }, { status: 404 });
    }

    // Increment view count asynchronously
    await db.publicVehicleListing.update({
      where: { id },
      data: { viewsCount: { increment: 1 } },
    });

    const now = new Date();
    let status = listing.reservationStatus;
    if (status === "RESERVED" && listing.reservedUntil && listing.reservedUntil < now) {
      status = "AVAILABLE";
    }

    return NextResponse.json({
      vehicle: {
        id: listing.id,
        stockNumber: listing.stockNumber,
        make: listing.make,
        model: listing.model,
        variant: listing.variant,
        year: listing.year,
        fuelType: listing.fuelType,
        transmission: listing.transmission,
        mileageKm: listing.mileageKm,
        exteriorColor: listing.exteriorColor,
        bodyType: listing.bodyType,
        askingPrice: listing.askingPrice,
        isFeatured: listing.isFeatured,
        status,
        photos: JSON.parse(listing.photosJson || "[]"),
        keyFeatures: JSON.parse(listing.keyFeaturesJson || "[]"),
        specifications: JSON.parse(listing.specificationsJson || "{}"),
        inspectionSummary: JSON.parse(listing.inspectionSummaryJson || "{}"),
        repairsCompleted: JSON.parse(listing.repairsCompletedSummaryJson || "[]"),
        knownDefects: JSON.parse(listing.knownDefectsDisclosureJson || "[]"),
        ownershipCount: listing.ownershipCountDisclosure,
      },
    });
  } catch (err: unknown) {
    console.error("Get vehicle detail error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await req.json();
    const { action } = body;

    const listing = await db.publicVehicleListing.findUnique({
      where: { id },
    });
    if (!listing || !listing.isPublished) {
      return NextResponse.json({ error: "Vehicle listing not available" }, { status: 404 });
    }

    const user = await getSessionUser();

    // 1. BUYER ENQUIRY
    if (action === "ENQUIRY") {
      const parsed = BuyerEnquirySchema.safeParse({
        listingId: listing.id,
        vehicleStockNumber: listing.stockNumber,
        customerName: body.customerName,
        customerEmail: body.customerEmail || "",
        customerPhone: body.customerPhone,
        message: body.message || "",
      });

      if (!parsed.success) {
        return NextResponse.json({ error: parsed.error.format() }, { status: 400 });
      }

      const enquiry = await db.buyerEnquiry.create({
        data: {
          listingId: listing.id,
          vehicleStockNumber: listing.stockNumber,
          customerName: parsed.data.customerName,
          customerEmail: parsed.data.customerEmail || "",
          customerPhone: parsed.data.customerPhone,
          message: parsed.data.message || "",
          status: "NEW",
        },
      });

      // Also create CRM lead
      const count = await db.cRMLead.count();
      await db.cRMLead.create({
        data: {
          leadNumber: `LEAD-${new Date().getFullYear()}-${String(count + 1).padStart(4, "0")}`,
          source: "WEBSITE",
          department: "AUTOMOBILES",
          contactName: parsed.data.customerName,
          email: parsed.data.customerEmail || "",
          phone: parsed.data.customerPhone,
          vehicleOfInterest: `${listing.year} ${listing.make} ${listing.model} (${listing.stockNumber})`,
          notes: parsed.data.message || "Buyer vehicle purchase enquiry",
        },
      });

      return NextResponse.json({ success: true, enquiryId: enquiry.id }, { status: 201 });
    }

    // 2. TEST DRIVE REQUEST
    if (action === "TEST_DRIVE") {
      const parsed = TestDriveRequestSchema.safeParse({
        listingId: listing.id,
        customerName: body.customerName,
        customerEmail: body.customerEmail || "",
        customerPhone: body.customerPhone,
        preferredDate: body.preferredDate,
        preferredTimeSlot: body.preferredTimeSlot || "Morning",
      });

      if (!parsed.success) {
        return NextResponse.json({ error: parsed.error.format() }, { status: 400 });
      }

      const testDrive = await db.testDriveRequest.create({
        data: {
          listingId: listing.id,
          customerName: parsed.data.customerName,
          customerEmail: parsed.data.customerEmail || "",
          customerPhone: parsed.data.customerPhone,
          preferredDate: new Date(parsed.data.preferredDate),
          preferredTimeSlot: parsed.data.preferredTimeSlot,
          status: "REQUESTED",
        },
      });

      return NextResponse.json({ success: true, testDriveId: testDrive.id }, { status: 201 });
    }

    // 3. CONCURRENCY-SAFE RESERVATION
    if (action === "RESERVE") {
      const parsed = VehicleReservationSchema.safeParse({
        listingId: listing.id,
        idempotencyKey: body.idempotencyKey,
        bookingAmount: body.bookingAmount || 10000,
      });

      if (!parsed.success) {
        return NextResponse.json({ error: parsed.error.format() }, { status: 400 });
      }

      const reservation = await reserveVehicle({
        listingId: listing.id,
        customerUserId: user?.id,
        idempotencyKey: parsed.data.idempotencyKey,
        bookingAmount: parsed.data.bookingAmount,
      });

      return NextResponse.json({ success: true, reservation }, { status: 201 });
    }

    return NextResponse.json({ error: "Unsupported action" }, { status: 400 });
  } catch (err: unknown) {
    console.error("Vehicle action error:", err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Internal server error" },
      { status: 400 }
    );
  }
}

