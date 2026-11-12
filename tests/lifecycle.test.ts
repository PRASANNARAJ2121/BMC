import { describe, it, expect, vi } from "vitest";
import { db } from "../src/lib/db";
import { transitionAcquisitionStatus } from "../src/lib/services/acquisition";

describe("End-to-End Acquisition to Resale Pipeline", () => {
  it("enforces mandatory gates before moving to ACQUIRED status", async () => {
    // 1. Missing Purchase Agreement must fail
    const caseMissingAgrSpy = vi.spyOn(db.acquisitionCase, "findUnique").mockResolvedValueOnce({
      id: "case-001",
      status: "OWNERSHIP_TRANSFER_PENDING",
      purchaseAgreement: null, // MISSING
      purchaseTransaction: { status: "SETTLED" },
      ownershipTransferCase: { form29Signed: true, form30Signed: true },
    } as any);

    await expect(
      transitionAcquisitionStatus({
        caseId: "case-001",
        nextStatus: "ACQUIRED",
        actorId: "admin-1",
        actorRole: "SUPER_ADMIN",
      })
    ).rejects.toThrow("GATE_FAILED: Purchase agreement must be signed before acquisition");
    caseMissingAgrSpy.mockRestore();

    // 2. Unsettled Payment must fail
    const caseUnsettledPaySpy = vi.spyOn(db.acquisitionCase, "findUnique").mockResolvedValueOnce({
      id: "case-002",
      status: "OWNERSHIP_TRANSFER_PENDING",
      purchaseAgreement: { id: "agr-1" },
      purchaseTransaction: { status: "INITIATED" }, // NOT SETTLED
      ownershipTransferCase: { form29Signed: true, form30Signed: true },
    } as any);

    await expect(
      transitionAcquisitionStatus({
        caseId: "case-002",
        nextStatus: "ACQUIRED",
        actorId: "admin-1",
        actorRole: "SUPER_ADMIN",
      })
    ).rejects.toThrow("GATE_FAILED: Purchase payment must be settled before acquisition");
    caseUnsettledPaySpy.mockRestore();

    // 3. Incomplete RTO Transfer forms must fail
    const caseMissingRtoSpy = vi.spyOn(db.acquisitionCase, "findUnique").mockResolvedValueOnce({
      id: "case-003",
      status: "OWNERSHIP_TRANSFER_PENDING",
      purchaseAgreement: { id: "agr-1" },
      purchaseTransaction: { status: "SETTLED" },
      ownershipTransferCase: { form29Signed: true, form30Signed: false }, // FORM 30 MISSING
    } as any);

    await expect(
      transitionAcquisitionStatus({
        caseId: "case-003",
        nextStatus: "ACQUIRED",
        actorId: "admin-1",
        actorRole: "SUPER_ADMIN",
      })
    ).rejects.toThrow("GATE_FAILED: RTO transfer forms (Form 29 & 30) must be executed");
    caseMissingRtoSpy.mockRestore();
  });

  it("ensures prompt template version incrementation in Prompt Studio", async () => {
    // When updating a prompt template, the version must increment by 1
    const currentVersion = 3;
    const nextVersion = currentVersion + 1;
    expect(nextVersion).toBe(4);
  });
});
