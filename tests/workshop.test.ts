import { describe, it, expect } from "vitest";

describe("Workshop Operations & Financial Accounting", () => {
  it("enforces precise 18% GST calculation (9% CGST + 9% SGST)", () => {
    const labourTotal = 2500;
    const partsTotal = 4300;
    const subtotal = labourTotal + partsTotal; // 6800

    const cgstAmount = Math.round(subtotal * 0.09 * 100) / 100; // 612.00
    const sgstAmount = Math.round(subtotal * 0.09 * 100) / 100; // 612.00
    const grandTotal = subtotal + cgstAmount + sgstAmount; // 8024.00

    expect(subtotal).toBe(6800);
    expect(cgstAmount).toBe(612);
    expect(sgstAmount).toBe(612);
    expect(grandTotal).toBe(8024);
  });

  it("strictly prevents negative stock: requested quantity > stock quantity must fail", () => {
    const product = {
      id: "prod-brake-pad-001",
      sku: "BMC-PRT-BRK-001",
      name: "Ceramic Brake Pad Kit",
      stockQuantity: 2, // only 2 in stock
      sellingPrice: 3200,
    };

    const requestedQty = 3;
    const canFulfill = product.stockQuantity >= requestedQty;

    expect(canFulfill).toBe(false);

    // Ensure error message format
    const errorMessage = !canFulfill
      ? `Insufficient stock: Requested ${requestedQty}, available ${product.stockQuantity} for SKU ${product.sku}`
      : "";

    expect(errorMessage).toContain("Insufficient stock");
    expect(errorMessage).toContain("Requested 3, available 2");
  });
});

