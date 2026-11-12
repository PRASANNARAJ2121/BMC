import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { requireRoles, recordAuditEvent } from "@/lib/auth";

export async function GET(req: Request) {
  try {
    await requireRoles([
      "SUPER_ADMIN",
      "BUSINESS_OWNER",
      "INVENTORY_MANAGER",
      "PARTS_SALES_EXECUTIVE",
      "WORKSHOP_MANAGER",
    ]);

    const products = await db.product.findMany({
      include: {
        category: true,
        fitments: true,
        inventoryMovements: {
          orderBy: { createdAt: "desc" },
          take: 5,
        },
      },
      orderBy: { sku: "asc" },
    });

    return NextResponse.json({ products });
  } catch (err: unknown) {
    if (err instanceof Error && err.message === "FORBIDDEN") {
      return NextResponse.json({ error: "Forbidden: Staff access required" }, { status: 403 });
    }
    console.error("Admin products error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const user = await requireRoles([
      "SUPER_ADMIN",
      "BUSINESS_OWNER",
      "INVENTORY_MANAGER",
      "WORKSHOP_MANAGER",
    ]);

    const body = await req.json();
    const { action } = body;

    // 1. CREATE NEW PRODUCT SKU
    if (action === "CREATE_PRODUCT") {
      const {
        sku,
        name,
        categoryCode,
        brand = "Bharat Motor Club Genuine",
        grade = "GENUINE",
        purchaseCost,
        sellingPrice,
        stockQuantity = 0,
        reorderThreshold = 5,
        description = "",
        isCompatibleAll = false,
        fitments = [],
      } = body;

      const category = await db.productCategory.findUnique({
        where: { code: categoryCode },
      });
      if (!category) {
        return NextResponse.json({ error: "Invalid category code" }, { status: 400 });
      }

      const product = await db.product.create({
        data: {
          sku,
          name,
          categoryId: category.id,
          brand,
          grade,
          purchaseCost: Number(purchaseCost) || 0,
          sellingPrice: Number(sellingPrice) || 0,
          stockQuantity: Number(stockQuantity) || 0,
          reorderThreshold: Number(reorderThreshold) || 5,
          description,
          isCompatibleAll: !!isCompatibleAll,
          fitments: {
            create: fitments.map((f: { make: string; model: string; variant?: string; yearStart?: number; yearEnd?: number; notes?: string }) => ({
              make: f.make,
              model: f.model,
              variant: f.variant || "",
              yearStart: Number(f.yearStart) || 2010,
              yearEnd: Number(f.yearEnd) || 2026,
              notes: f.notes || "",
            })),
          },
        },
      });

      if (Number(stockQuantity) > 0) {
        await db.inventoryMovement.create({
          data: {
            productId: product.id,
            movementType: "PURCHASE_RECEIPT",
            quantity: Number(stockQuantity),
            unitCost: Number(purchaseCost) || 0,
            notes: "Initial inventory setup",
            recordedById: user.id,
          },
        });
      }

      await recordAuditEvent({
        actorId: user.id,
        actorRole: user.roles[0],
        action: "PRODUCT_CREATED",
        entityName: "Product",
        entityId: product.id,
        after: { sku, name, stockQuantity },
      });

      return NextResponse.json({ success: true, product }, { status: 201 });
    }

    // 2. ADJUST STOCK QUANTITY (CORRECTION OR RECEIPT)
    if (action === "ADJUST_STOCK") {
      const { productId, adjustmentQty, reason = "Stock Count Adjustment" } = body;
      const qty = Number(adjustmentQty);

      const product = await db.product.findUnique({ where: { id: productId } });
      if (!product) {
        return NextResponse.json({ error: "Product not found" }, { status: 404 });
      }

      if (product.stockQuantity + qty < 0) {
        return NextResponse.json(
          { error: `Adjustment would result in negative stock: current ${product.stockQuantity}, adjustment ${qty}` },
          { status: 400 }
        );
      }

      const updated = await db.product.update({
        where: { id: productId },
        data: {
          stockQuantity: { increment: qty },
        },
      });

      await db.inventoryMovement.create({
        data: {
          productId,
          movementType: qty > 0 ? "PURCHASE_RECEIPT" : "ADJUSTMENT_CORRECTION",
          quantity: qty,
          unitCost: product.purchaseCost,
          notes: reason,
          recordedById: user.id,
        },
      });

      await recordAuditEvent({
        actorId: user.id,
        actorRole: user.roles[0],
        action: "STOCK_ADJUSTED",
        entityName: "Product",
        entityId: productId,
        before: { stock: product.stockQuantity },
        after: { stock: updated.stockQuantity, adjustment: qty, reason },
      });

      return NextResponse.json({ success: true, product: updated });
    }

    return NextResponse.json({ error: "Unsupported action" }, { status: 400 });
  } catch (err: unknown) {
    console.error("Admin products action error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

