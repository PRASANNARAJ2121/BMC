import { describe, it, expect, vi } from "vitest";
import { parseOBDScanData, ingestOBDScanToJobCard, DTC_DICTIONARY } from "../src/lib/services/obd";
import { processFastagGateEvent } from "../src/lib/services/fastag";
import { db } from "../src/lib/db";

describe("Phase D: Telematics, OBD-II Diagnostics & FASTag Automated Gates", () => {
  describe("1. OBD-II DTC Parsing & Diagnostic Intelligence", () => {
    it("correctly parses and categorizes standard SAE J2012 fault codes across all 4 domains", () => {
      const rawScan = "Errors detected: P0300 and C0035 present. Intermittent B0001, U0100.";
      const faults = parseOBDScanData(rawScan);

      expect(faults.length).toBe(4);

      const p0300 = faults.find((f) => f.code === "P0300");
      expect(p0300).toBeDefined();
      expect(p0300?.category).toBe("POWERTRAIN");
      expect(p0300?.severity).toBe("HIGH");
      expect(p0300?.suggestedPartName).toBe("Iridium Spark Plug Set");
      expect(p0300?.suggestedLabourCost).toBe(950);

      const c0035 = faults.find((f) => f.code === "C0035");
      expect(c0035).toBeDefined();
      expect(c0035?.category).toBe("CHASSIS");
      expect(c0035?.suggestedPartName).toBe("Front Wheel ABS Speed Sensor");

      const b0001 = faults.find((f) => f.code === "B0001");
      expect(b0001).toBeDefined();
      expect(b0001?.category).toBe("BODY");
      expect(b0001?.severity).toBe("CRITICAL");

      const u0100 = faults.find((f) => f.code === "U0100");
      expect(u0100).toBeDefined();
      expect(u0100?.category).toBe("NETWORK");
      expect(u0100?.severity).toBe("CRITICAL");
    });

    it("deduplicates redundant codes and provides fallback metadata for unlisted DTCs", () => {
      const rawScan = "P0420 P0420 p0420 P9999";
      const faults = parseOBDScanData(rawScan);

      expect(faults.length).toBe(2);

      const p0420 = faults.find((f) => f.code === "P0420");
      expect(p0420?.description).toContain("Catalyst System Efficiency Below Threshold");

      const unlisted = faults.find((f) => f.code === "P9999");
      expect(unlisted).toBeDefined();
      expect(unlisted?.category).toBe("POWERTRAIN");
      expect(unlisted?.description).toContain("Manufacturer-Specific / Standard DTC: P9999");
    });

    it("returns empty array for empty or invalid input", () => {
      expect(parseOBDScanData("")).toEqual([]);
      expect(parseOBDScanData("No issues detected on CAN-bus")).toEqual([]);
    });

    it("ingests diagnostic scan into workshop job card and increments labour totals", async () => {
      vi.spyOn(db.jobCard, "findUnique").mockResolvedValueOnce({
        id: "jc-telematics-001",
        jobNumber: "JC-2026-TEL-001",
        customerName: "Arjun Kapoor",
        primaryTechnicianId: "tech-1",
        diagnosticNotes: "Customer reports loss of power.",
        tasks: [],
      } as any);

      vi.spyOn(db.jobTask, "create").mockResolvedValue({
        id: "task-001",
        jobCardId: "jc-telematics-001",
      } as any);

      const updateSpy = vi.spyOn(db.jobCard, "update").mockResolvedValue({} as any);
      vi.spyOn(db.auditEvent, "create").mockResolvedValue({} as any);

      const result = await ingestOBDScanToJobCard({
        jobCardId: "jc-telematics-001",
        rawInput: "P0300 P0171",
        technicianId: "tech-1",
      });

      expect(result.success).toBe(true);
      expect(result.faults.length).toBe(2);
      expect(result.addedTasksCount).toBe(2);
      // P0300 (950) + P0171 (800) = 1750
      expect(result.totalAddedLabour).toBe(1750);

      expect(updateSpy).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { id: "jc-telematics-001" },
          data: expect.objectContaining({
            labourTotal: { increment: 1750 },
            grandTotal: { increment: 1750 * 1.18 },
            taxTotal: { increment: 1750 * 0.18 },
          }),
        })
      );
    });
  });

  describe("2. Automated FASTag RFID Gate Access & Barrier Enforcement", () => {
    it("ENTRY GATE: verifies scheduled appointment and raises boom barrier", async () => {
      vi.spyOn(db.serviceAppointment, "findFirst").mockResolvedValueOnce({
        id: "apt-gate-001",
        appointmentNumber: "APT-2026-9901",
        customerName: "Sunita Rao",
        customerPhone: "+91 98765 43210",
        vehicleRegNumber: "MH-02-CD-5678",
        status: "REQUESTED",
        createdAt: new Date(),
      } as any);

      vi.spyOn(db.serviceAppointment, "update").mockResolvedValueOnce({} as any);
      vi.spyOn(db.auditEvent, "create").mockResolvedValue({} as any);

      const result = await processFastagGateEvent({
        tagId: "TAG-RFID-9901",
        vehicleRegNumber: "MH-02-CD-5678",
        gateType: "ENTRY",
        scannerId: "ENTRY-GATE-BAY-1",
      });

      expect(result.authorized).toBe(true);
      expect(result.actionTaken).toBe("CHECKED_IN_APPOINTMENT");
      expect(result.gateBarrierCommand).toBe("OPEN_BARRIER");
      expect(result.customerName).toBe("Sunita Rao");
      expect(result.appointmentNumber).toBe("APT-2026-9901");
    });

    it("ENTRY GATE: logs walk-in entry when no advance appointment exists", async () => {
      vi.spyOn(db.serviceAppointment, "findFirst").mockResolvedValueOnce(null);

      const result = await processFastagGateEvent({
        tagId: "TAG-RFID-WALKIN",
        vehicleRegNumber: "DL-01-XX-9999",
        gateType: "ENTRY",
        scannerId: "ENTRY-GATE-BAY-1",
      });

      expect(result.authorized).toBe(true);
      expect(result.actionTaken).toBe("UNREGISTERED_VEHICLE_LOGGED");
      expect(result.gateBarrierCommand).toBe("OPEN_BARRIER");
      expect(result.reason).toContain("Reception Service Desk");
    });

    it("EXIT GATE: strictly holds boom barrier locked if job card invoice is UNPAID", async () => {
      vi.spyOn(db.jobCard, "findFirst").mockResolvedValueOnce({
        id: "jc-exit-001",
        jobNumber: "JC-2026-8801",
        customerName: "Rohan Mehra",
        vehicleRegNumber: "KA-01-AB-1234",
        status: "READY",
        invoices: [
          {
            id: "inv-exit-001",
            grandTotal: 14500,
            paymentStatus: "PENDING",
          },
        ],
      } as any);

      const result = await processFastagGateEvent({
        tagId: "TAG-RFID-8801",
        vehicleRegNumber: "KA-01-AB-1234",
        gateType: "EXIT",
        scannerId: "EXIT-GATE-BAY-1",
      });

      expect(result.authorized).toBe(false);
      expect(result.actionTaken).toBe("EXIT_DENIED_UNPAID");
      expect(result.gateBarrierCommand).toBe("HOLD_BARRIER");
      expect(result.reason).toContain("Barrier locked");
      expect(result.reason).toContain("14,500");
    });

    it("EXIT GATE: unlocks boom barrier and marks job as DELIVERED when invoice is PAID", async () => {
      vi.spyOn(db.jobCard, "findFirst").mockResolvedValueOnce({
        id: "jc-exit-002",
        jobNumber: "JC-2026-8802",
        customerName: "Ananya Sen",
        vehicleRegNumber: "WB-02-EF-4321",
        status: "INVOICED",
        invoices: [
          {
            id: "inv-exit-002",
            grandTotal: 7200,
            paymentStatus: "PAID",
          },
        ],
      } as any);

      const jobUpdateSpy = vi.spyOn(db.jobCard, "update").mockResolvedValueOnce({} as any);
      vi.spyOn(db.auditEvent, "create").mockResolvedValue({} as any);

      const result = await processFastagGateEvent({
        tagId: "TAG-RFID-8802",
        vehicleRegNumber: "WB-02-EF-4321",
        gateType: "EXIT",
        scannerId: "EXIT-GATE-BAY-1",
      });

      expect(result.authorized).toBe(true);
      expect(result.actionTaken).toBe("EXIT_PERMITTED");
      expect(result.gateBarrierCommand).toBe("OPEN_BARRIER");
      expect(result.reason).toContain("Payment verified");
      expect(jobUpdateSpy).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { id: "jc-exit-002" },
          data: { status: "DELIVERED" },
        })
      );
    });
  });
});

