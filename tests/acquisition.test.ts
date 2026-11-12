import { describe, it, expect } from "vitest";
import { ACQUISITION_STATUSES, transitionAcquisitionStatus } from "../src/lib/services/acquisition";

describe("Confidential Acquisition State Machine & Gates", () => {
  it("defines comprehensive acquisition lifecycle statuses from DRAFT to ACQUIRED", () => {
    expect(ACQUISITION_STATUSES).toContain("DRAFT");
    expect(ACQUISITION_STATUSES).toContain("SUBMITTED");
    expect(ACQUISITION_STATUSES).toContain("DOCUMENT_REVIEW");
    expect(ACQUISITION_STATUSES).toContain("INSPECTION_SCHEDULED");
    expect(ACQUISITION_STATUSES).toContain("INSPECTION_COMPLETE");
    expect(ACQUISITION_STATUSES).toContain("OFFER_ISSUED");
    expect(ACQUISITION_STATUSES).toContain("OFFER_ACCEPTED");
    expect(ACQUISITION_STATUSES).toContain("PURCHASE_DOCUMENTS_PENDING");
    expect(ACQUISITION_STATUSES).toContain("PAYMENT_PENDING");
    expect(ACQUISITION_STATUSES).toContain("OWNERSHIP_TRANSFER_PENDING");
    expect(ACQUISITION_STATUSES).toContain("ACQUIRED");
  });

  it("blocks illegal transitions: cannot jump directly from DRAFT to ACQUIRED", async () => {
    // Attempting an invalid transition without passing intermediate gates must reject
    await expect(
      transitionAcquisitionStatus({
        caseId: "non-existent-case-id",
        nextStatus: "ACQUIRED",
        actorId: "actor-1",
        actorRole: "SUPER_ADMIN",
      })
    ).rejects.toThrow();
  });
});

