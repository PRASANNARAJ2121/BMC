import { NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function GET(req: Request) {
  try {
    const url = new URL(req.url);
    const search = url.searchParams.get("q") || "";
    const make = url.searchParams.get("make");
    const fuelType = url.searchParams.get("fuel");
    const transmission = url.searchParams.get("transmission");
    const bodyType = url.searchParams.get("body");
    const minPrice = Number(url.searchParams.get("minPrice")) || 0;
    const maxPrice = Number(url.searchParams.get("maxPrice")) || 999999999;
    const sort = url.searchParams.get("sort") || "featured"; // price_asc, price_desc, year_desc, mileage_asc

    // Build filter: ONLY show published listings and NOT sold
    const where: Record<string, unknown> = {
      isPublished: true,
      reservationStatus: { not: "SOLD" },
      askingPrice: { gte: minPrice, lte: maxPrice },
    };

    if (make && make !== "ALL") {
      where.make = { equals: make };
    }
    if (fuelType && fuelType !== "ALL") {
      where.fuelType = { equals: fuelType };
    }
    if (transmission && transmission !== "ALL") {
      where.transmission = { equals: transmission };
    }
    if (bodyType && bodyType !== "ALL") {
      where.bodyType = { equals: bodyType };
    }
    if (search.trim()) {
      where.OR = [
        { make: { contains: search.trim() } },
        { model: { contains: search.trim() } },
        { variant: { contains: search.trim() } },
      ];
    }

    let orderBy: Record<string, string> = { isFeatured: "desc" };
    if (sort === "price_asc") orderBy = { askingPrice: "asc" };
    if (sort === "price_desc") orderBy = { askingPrice: "desc" };
    if (sort === "year_desc") orderBy = { year: "desc" };
    if (sort === "mileage_asc") orderBy = { mileageKm: "asc" };

    const listings = await db.publicVehicleListing.findMany({
      where,
      orderBy,
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
        photosJson: true,
        ownershipCountDisclosure: true,
        reservationStatus: true,
        reservedUntil: true,
        publishedAt: true,
      },
    });

    // Check for expired reservations and update reservationStatus dynamically if needed
    const now = new Date();
    const sanitized = listings.map((l) => {
      let status = l.reservationStatus;
      if (status === "RESERVED" && l.reservedUntil && l.reservedUntil < now) {
        status = "AVAILABLE";
      }

      return {
        id: l.id,
        stockNumber: l.stockNumber,
        make: l.make,
        model: l.model,
        variant: l.variant,
        year: l.year,
        fuelType: l.fuelType,
        transmission: l.transmission,
        mileageKm: l.mileageKm,
        exteriorColor: l.exteriorColor,
        bodyType: l.bodyType,
        askingPrice: l.askingPrice,
        isFeatured: l.isFeatured,
        photos: JSON.parse(l.photosJson || "[]"),
        ownershipCount: l.ownershipCountDisclosure,
        status,
      };
    });

    return NextResponse.json({ listings: sanitized, count: sanitized.length });
  } catch (err: unknown) {
    console.error("Public vehicles error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

