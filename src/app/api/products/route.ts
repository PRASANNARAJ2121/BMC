import { NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function GET(req: Request) {
  try {
    const url = new URL(req.url);
    const search = url.searchParams.get("q") || "";
    const category = url.searchParams.get("category");
    const make = url.searchParams.get("make");
    const model = url.searchParams.get("model");
    const year = Number(url.searchParams.get("year")) || 0;

    const where: Record<string, unknown> = {
      active: true,
    };

    if (category && category !== "ALL") {
      where.category = { code: category };
    }

    if (search.trim()) {
      where.OR = [
        { name: { contains: search.trim() } },
        { sku: { contains: search.trim() } },
        { brand: { contains: search.trim() } },
      ];
    }

    const products = await db.product.findMany({
      where,
      include: {
        category: true,
        fitments: true,
      },
      orderBy: { name: "asc" },
    });

    // Check fitment if vehicle specified
    const filtered = products.map((p) => {
      let isCompatible: boolean | null = null;
      let fitmentCaveat = "";

      if (make && model) {
        if (p.isCompatibleAll) {
          isCompatible = true;
          fitmentCaveat = "Universal fitment across vehicle models";
        } else {
          const match = p.fitments.find(
            (f) =>
              f.make.toLowerCase() === make.toLowerCase() &&
              f.model.toLowerCase() === model.toLowerCase() &&
              (year === 0 || (year >= f.yearStart && year <= f.yearEnd))
          );
          if (match) {
            isCompatible = true;
            fitmentCaveat = match.notes || "Verified compatibility for this model/year range";
          } else {
            isCompatible = false;
            fitmentCaveat = "Compatibility not verified for this specific vehicle model/year. Please contact our parts specialist.";
          }
        }
      }

      return {
        id: p.id,
        sku: p.sku,
        partNumber: p.partNumber,
        name: p.name,
        category: p.category.name,
        categoryCode: p.category.code,
        brand: p.brand,
        grade: p.grade,
        description: p.description,
        sellingPrice: p.sellingPrice,
        taxRate: p.taxRate,
        inStock: p.stockQuantity > 0,
        stockAvailable: p.stockQuantity - p.reservedQuantity > 0,
        isCompatible,
        fitmentCaveat,
        compatibilityNotes: p.compatibilityNotes,
      };
    });

    return NextResponse.json({ products: filtered });
  } catch (err: unknown) {
    console.error("Public products error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

