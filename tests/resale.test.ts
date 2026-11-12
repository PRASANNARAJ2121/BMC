import { describe, it, expect, vi } from "vitest";
import { approveAndPublishResaleListing, reserveVehicle } from "../src/lib/services/resale";
import { db } from "../src/lib/db";

describe("Pre-Sale Gates & Certified Resale Service", () => {
  it("enforces Hard Gate 1: Rejects publication when legalSaleEligibilityApproved is false", async () => {
    // Create a mock vehicle in DB or spy
    const findUniqueSpy = vi.spyOn(db.companyVehicle, "findUnique").mockResolvedValueOnce({
      id: "veh-unapproved-legal",
      stockNumber: "BMC-STK-0001",
      legalSaleEligibilityApproved: false, // NOT APPROVED
      qcApproved: true,
      status: "IN_REFURBISHMENT",
    } as any);

    await expect(
      approveAndPublishResaleListing({
        companyVehicleId: "veh-unapproved-legal",
        askingPrice: 950000,
        bodyType: "SUV",
        actorId: "actor-admin",
        actorRole: "SUPER_ADMIN",
      })
    ).rejects.toThrow("GATE_FAILED: Legal ownership transfer and sale eligibility must be approved first");

    findUniqueSpy.mockRestore();
  });

  it("enforces Hard Gate 2: Rejects publication when qcApproved is false", async () => {
    const findUniqueSpy = vi.spyOn(db.companyVehicle, "findUnique").mockResolvedValueOnce({
      id: "veh-unapproved-qc",
      stockNumber: "BMC-STK-0002",
      legalSaleEligibilityApproved: true,
      qcApproved: false, // NOT APPROVED
      status: "IN_REFURBISHMENT",
    } as any);

    await expect(
      approveAndPublishResaleListing({
        companyVehicleId: "veh-unapproved-qc",
        askingPrice: 950000,
        bodyType: "SUV",
        actorId: "actor-admin",
        actorRole: "SUPER_ADMIN",
      })
    ).rejects.toThrow("GATE_FAILED: Vehicle must pass Quality Control inspection before publication");

    findUniqueSpy.mockRestore();
  });

  it("concurrency safety: prevents double reservation when vehicle is already reserved", async () => {
    const futureDate = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours ahead
    const idempotencySpy = vi.spyOn(db.vehicleReservation, "findUnique").mockResolvedValueOnce(null);
    const listingSpy = vi.spyOn(db.publicVehicleListing, "findUnique").mockResolvedValueOnce({
      id: "listing-already-reserved",
      isPublished: true,
      reservationStatus: "RESERVED",
      reservedUntil: futureDate,
    } as any);

    await expect(
      reserveVehicle({
        listingId: "listing-already-reserved",
        idempotencyKey: "unique-key-12345",
        bookingAmount: 10000,
      })
    ).rejects.toThrow("VEHICLE_ALREADY_RESERVED_OR_SOLD");

    idempotencySpy.mockRestore();
    listingSpy.mockRestore();
  });
});

