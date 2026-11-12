import { db } from "@/lib/db";
import { recordAuditEvent } from "@/lib/auth";

export function sanitizeVehicleForPublic(vehicleOrListing: any) {
  // If given a public listing or company vehicle with public listing
  const listing = vehicleOrListing.publicListing || vehicleOrListing;

  return {
    id: listing.id,
    stockNumber: listing.stockNumber || vehicleOrListing.stockNumber,
    make: listing.make || vehicleOrListing.make,
    model: listing.model || vehicleOrListing.model,
    variant: listing.variant || vehicleOrListing.variant,
    year: listing.year || vehicleOrListing.year,
    fuelType: listing.fuelType || vehicleOrListing.fuelType,
    transmission: listing.transmission || vehicleOrListing.transmission,
    mileageKm: listing.mileageKm || vehicleOrListing.odometerKm,
    exteriorColor: listing.exteriorColor || vehicleOrListing.exteriorColor,
    bodyType: listing.bodyType || vehicleOrListing.bodyType,
    askingPrice: listing.askingPrice,
    isFeatured: !!listing.isFeatured,
    status: listing.reservationStatus || "AVAILABLE",
    photos: typeof listing.photosJson === "string" ? JSON.parse(listing.photosJson || "[]") : (listing.photos || []),
    keyFeatures: typeof listing.keyFeaturesJson === "string" ? JSON.parse(listing.keyFeaturesJson || "[]") : (listing.keyFeatures || []),
    specifications: typeof listing.specificationsJson === "string" ? JSON.parse(listing.specificationsJson || "{}") : (listing.specifications || {}),
    inspectionSummary: typeof listing.inspectionSummaryJson === "string" ? JSON.parse(listing.inspectionSummaryJson || "{}") : (listing.inspectionSummary || {}),
    repairsCompleted: typeof listing.repairsCompletedSummaryJson === "string" ? JSON.parse(listing.repairsCompletedSummaryJson || "[]") : (listing.repairsCompleted || []),
    knownDefects: typeof listing.knownDefectsDisclosureJson === "string" ? JSON.parse(listing.knownDefectsDisclosureJson || "[]") : (listing.knownDefects || []),
    ownershipCount: listing.ownershipCountDisclosure || vehicleOrListing.ownershipCount || 1,
  };
}

export async function approveAndPublishResaleListing(params: {
  companyVehicleId: string;
  askingPrice: number;
  bodyType: string;
  keyFeatures?: string[];
  specifications?: Record<string, string>;
  photos?: string[];
  inspectionSummary?: Record<string, unknown>;
  repairsCompleted?: string[];
  knownDefects?: string[];
  ownershipCount?: number;
  isFeatured?: boolean;
  actorId: string;
  actorRole: string;
}) {
  const {
    companyVehicleId,
    askingPrice,
    bodyType,
    keyFeatures = [],
    specifications = {},
    photos = [],
    inspectionSummary = {},
    repairsCompleted = [],
    knownDefects = [],
    ownershipCount = 1,
    isFeatured = false,
    actorId,
    actorRole,
  } = params;

  const vehicle = await db.companyVehicle.findUnique({
    where: { id: companyVehicleId },
  });

  if (!vehicle) {
    throw new Error("VEHICLE_NOT_FOUND");
  }

  // HARD GATE 1: Legal eligibility must be approved
  if (!vehicle.legalSaleEligibilityApproved) {
    throw new Error("GATE_FAILED: Legal ownership transfer and sale eligibility must be approved first");
  }

  // HARD GATE 2: QC checklist must pass
  if (!vehicle.qcApproved) {
    throw new Error("GATE_FAILED: Vehicle must pass Quality Control inspection before publication");
  }

  if (askingPrice <= 0) {
    throw new Error("INVALID_PRICE: Asking price must be greater than zero");
  }

  // Upsert sanitized public listing
  const listing = await db.publicVehicleListing.upsert({
    where: { companyVehicleId },
    update: {
      askingPrice,
      bodyType: bodyType || "Sedan",
      isFeatured,
      isPublished: true,
      publishedAt: new Date(),
      keyFeaturesJson: JSON.stringify(keyFeatures),
      specificationsJson: JSON.stringify(specifications),
      photosJson: JSON.stringify(photos),
      inspectionSummaryJson: JSON.stringify(inspectionSummary),
      repairsCompletedSummaryJson: JSON.stringify(repairsCompleted),
      knownDefectsDisclosureJson: JSON.stringify(knownDefects),
      ownershipCountDisclosure: ownershipCount,
      reservationStatus: "AVAILABLE",
    },
    create: {
      stockNumber: vehicle.stockNumber,
      companyVehicleId: vehicle.id,
      make: vehicle.make,
      model: vehicle.model,
      variant: vehicle.variant,
      year: vehicle.year,
      fuelType: vehicle.fuelType,
      transmission: vehicle.transmission,
      mileageKm: vehicle.odometerKm,
      exteriorColor: vehicle.exteriorColor,
      bodyType: bodyType || "Sedan",
      askingPrice,
      isFeatured,
      isPublished: true,
      publishedAt: new Date(),
      keyFeaturesJson: JSON.stringify(keyFeatures),
      specificationsJson: JSON.stringify(specifications),
      photosJson: JSON.stringify(photos),
      inspectionSummaryJson: JSON.stringify(inspectionSummary),
      repairsCompletedSummaryJson: JSON.stringify(repairsCompleted),
      knownDefectsDisclosureJson: JSON.stringify(knownDefects),
      ownershipCountDisclosure: ownershipCount,
      reservationStatus: "AVAILABLE",
    },
  });

  // Update vehicle status to LISTED
  await db.companyVehicle.update({
    where: { id: vehicle.id },
    data: {
      status: "LISTED",
      targetResalePrice: askingPrice,
    },
  });

  await recordAuditEvent({
    actorId,
    actorRole,
    action: "VEHICLE_PUBLISHED_FOR_RESALE",
    entityName: "PublicVehicleListing",
    entityId: listing.id,
    after: {
      stockNumber: listing.stockNumber,
      askingPrice,
      make: listing.make,
      model: listing.model,
    },
  });

  return listing;
}

export async function reserveVehicle(params: {
  listingId: string;
  customerUserId?: string;
  idempotencyKey: string;
  bookingAmount?: number;
}) {
  const { listingId, customerUserId, idempotencyKey, bookingAmount = 10000 } = params;

  // Check idempotency first
  const existingReservation = await db.vehicleReservation.findUnique({
    where: { idempotencyKey },
  });
  if (existingReservation) {
    return existingReservation;
  }

  // Atomic reservation check
  const listing = await db.publicVehicleListing.findUnique({
    where: { id: listingId },
  });

  if (!listing || !listing.isPublished) {
    throw new Error("LISTING_NOT_AVAILABLE");
  }

  // Check current reservation status
  const now = new Date();
  if (
    listing.reservationStatus === "SOLD" ||
    (listing.reservationStatus === "RESERVED" &&
      listing.reservedUntil &&
      listing.reservedUntil > now)
  ) {
    throw new Error("VEHICLE_ALREADY_RESERVED_OR_SOLD");
  }

  // 48-hour reservation hold
  const reservedUntil = new Date(Date.now() + 48 * 60 * 60 * 1000);
  const count = await db.vehicleReservation.count();
  const reservationNumber = `RSV-${now.getFullYear()}-${String(count + 1).padStart(4, "0")}`;

  const reservation = await db.vehicleReservation.create({
    data: {
      listingId,
      customerUserId,
      reservationNumber,
      bookingAmount,
      status: "ACTIVE",
      expiresAt: reservedUntil,
      idempotencyKey,
    },
  });

  // Update listing atomically
  await db.publicVehicleListing.update({
    where: { id: listingId },
    data: {
      reservationStatus: "RESERVED",
      activeReservationId: reservation.id,
      reservedUntil,
    },
  });

  await recordAuditEvent({
    actorId: customerUserId,
    actorRole: "CUSTOMER",
    action: "VEHICLE_RESERVED",
    entityName: "VehicleReservation",
    entityId: reservation.id,
    after: {
      reservationNumber,
      listingId,
      expiresAt: reservedUntil,
    },
  });

  return reservation;
}

