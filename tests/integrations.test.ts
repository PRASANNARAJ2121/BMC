import { describe, it, expect, vi } from "vitest";
import { saveUploadedFile, readPrivateFile } from "../src/lib/services/storage";
import { createPaymentOrder, verifyPaymentSignature } from "../src/lib/services/payments";
import { verifyVehicleRegistry } from "../src/lib/services/registry";
import { sendNotification } from "../src/lib/services/notifications";
import { generateTaxInvoiceHtml, generatePurchaseAgreementHtml } from "../src/lib/services/documents";
import { db } from "../src/lib/db";

describe("Integrated External Services & Core Infrastructure", () => {
  describe("1. Document Storage & Security", () => {
    it("rejects unsupported MIME types (e.g. .exe / .sh)", async () => {
      const maliciousBuffer = Buffer.from("malicious executable content");
      await expect(
        saveUploadedFile({
          buffer: maliciousBuffer,
          originalName: "virus.exe",
          mimeType: "application/x-msdownload",
          isPrivate: true,
        })
      ).rejects.toThrow("UNSUPPORTED_MIME_TYPE");
    });

    it("rejects files exceeding 10MB limit", async () => {
      // 11MB buffer
      const hugeBuffer = Buffer.alloc(11 * 1024 * 1024);
      await expect(
        saveUploadedFile({
          buffer: hugeBuffer,
          originalName: "huge_doc.pdf",
          mimeType: "application/pdf",
          isPrivate: true,
        })
      ).rejects.toThrow("FILE_TOO_LARGE");
    });

    it("blocks path traversal attempts when accessing files", async () => {
      await expect(readPrivateFile("../../etc/passwd")).rejects.toThrow("SECURITY_VIOLATION");
    });
  });

  describe("2. Payment Gateway & Webhook Reconciliation", () => {
    it("creates a payment order with valid currency and amount", async () => {
      const order = await createPaymentOrder({
        amount: 10000,
        purpose: "VEHICLE_RESERVATION",
        referenceId: "rsv-test-001",
        customerName: "Rahul Verma",
        customerPhone: "+91 98765 43210",
      });

      expect(order.orderId).toBeDefined();
      expect(order.amount).toBe(10000);
      expect(order.currency).toBe("INR");
      expect(order.purpose).toBe("VEHICLE_RESERVATION");
    });

    it("rejects non-positive payment order amounts", async () => {
      await expect(
        createPaymentOrder({
          amount: 0,
          purpose: "VEHICLE_RESERVATION",
          referenceId: "rsv-test-002",
          customerName: "Test",
          customerPhone: "+91 98765 43210",
        })
      ).rejects.toThrow("INVALID_AMOUNT");
    });

    it("verifies HMAC SHA256 payment signature or sandbox tokens", () => {
      // Sandbox signature token check
      const isSandboxValid = verifyPaymentSignature({
        orderId: "order_test_123",
        paymentId: "pay_test_456",
        signature: "sandbox_sig_valid_test",
      });
      expect(isSandboxValid).toBe(true);
    });
  });

  describe("3. Parivahan / Vahan Government Registry Verification", () => {
    it("validates standard registration formats and extracts state code", async () => {
      const report = await verifyVehicleRegistry("DL-01-AB-1234");
      expect(report.registrationNumber).toBe("DL01AB1234");
      expect(report.stateCode).toBe("DL");
      expect(report.rtoName).toContain("Delhi");
      expect(report.status).toBeDefined();
    });

    it("rejects invalid vehicle registration format", async () => {
      await expect(verifyVehicleRegistry("INVALID-PLATE-999999")).rejects.toThrow("INVALID_REG_FORMAT");
    });
  });

  describe("4. Multi-Channel Notifications (Email, SMS, WhatsApp)", () => {
    it("dispatches and formats notifications across supported channels", async () => {
      const emailResult = await sendNotification("EMAIL", {
        recipientName: "Vikram Malhotra",
        recipientEmail: "vikram@example.com",
        eventType: "SELLER_CASE_CREATED",
        data: { caseNumber: "ACQ-2026-0001" },
      });
      expect(emailResult.success).toBe(true);
      expect(emailResult.channel).toBe("EMAIL");

      const smsResult = await sendNotification("SMS", {
        recipientName: "Vikram Malhotra",
        recipientPhone: "+91 98765 43210",
        eventType: "OFFER_ISSUED",
        data: { caseNumber: "ACQ-2026-0001", offerPrice: 850000 },
      });
      expect(smsResult.success).toBe(true);
      expect(smsResult.channel).toBe("SMS");
    });
  });

  describe("5. Document & Tax Invoice Generation", () => {
    it("generates structured HTML tax invoice with 9% CGST + 9% SGST breakdown", async () => {
      const findInvoiceSpy = vi.spyOn(db.invoice, "findUnique").mockResolvedValueOnce({
        id: "inv-001",
        invoiceNumber: "BMC-INV-2026-0001",
        customerName: "Vikram Malhotra",
        customerPhone: "+91 98765 43210",
        subtotal: 5000,
        cgstAmount: 450,
        sgstAmount: 450,
        grandTotal: 5900,
        paymentStatus: "PAID",
        paymentMethod: "UPI",
        paidAt: new Date(),
        jobCard: {
          jobNumber: "JC-2026-0001",
          vehicleMake: "Hyundai",
          vehicleModel: "Creta",
          vehicleRegNumber: "DL-01-AB-1234",
          odometerIn: 45000,
          tasks: [
            {
              id: "t-1",
              description: "Engine Oil Service",
              estimatedHours: 1,
              labourRate: 1500,
              totalLabourCost: 1500,
            },
          ],
          partConsumptions: [
            {
              id: "pc-1",
              quantity: 1,
              unitPrice: 3500,
              totalPrice: 3500,
              product: { name: "Synthetic 5W-30 Oil", sku: "OIL-5W30" },
            },
          ],
        },
      } as any);

      const html = await generateTaxInvoiceHtml("inv-001");
      expect(html).toContain("BHARAT MOTOR CLUB");
      expect(html).toContain("TAX INVOICE");
      expect(html).toContain("BMC-INV-2026-0001");
      expect(html).toContain("5,900");
      expect(html).toContain("CGST (9.0%)");
      expect(html).toContain("SGST (9.0%)");
      expect(html).toContain("DL-01-AB-1234");

      findInvoiceSpy.mockRestore();
    });
  });
});

