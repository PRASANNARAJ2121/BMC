import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { requireRoles } from "@/lib/auth";

export async function GET() {
  try {
    await requireRoles([
      "SUPER_ADMIN",
      "BUSINESS_OWNER",
      "ACQUISITION_MANAGER",
      "WORKSHOP_MANAGER",
      "SALES_MANAGER",
      "FINANCE_OFFICER",
      "INVENTORY_MANAGER",
    ]);

    // 1. Acquisition Pipeline Metrics
    const totalSubmissions = await db.acquisitionCase.count();
    const pendingReviewCount = await db.acquisitionCase.count({
      where: { status: { in: ["SUBMITTED", "DOCUMENT_REVIEW", "INSPECTION_PENDING", "VALUATION_PENDING"] } },
    });
    const offersIssuedCount = await db.acquisitionCase.count({
      where: { status: "OFFER_ISSUED" },
    });
    const acquiredCount = await db.acquisitionCase.count({
      where: { status: "ACQUIRED" },
    });

    // 2. Company Resale Inventory Metrics
    const totalCompanyVehicles = await db.companyVehicle.count();
    const reconditioningCount = await db.companyVehicle.count({
      where: { status: "RECONDITIONING" },
    });
    const availableResaleCount = await db.publicVehicleListing.count({
      where: { isPublished: true, reservationStatus: "AVAILABLE" },
    });
    const reservedResaleCount = await db.publicVehicleListing.count({
      where: { reservationStatus: "RESERVED" },
    });
    const soldResaleCount = await db.companyVehicle.count({
      where: { status: "SOLD" },
    });

    // Financial totals
    const vehiclesWithCost = await db.companyVehicle.findMany({
      select: {
        acquisitionCost: true,
        totalReconditioningCost: true,
        totalCostBasis: true,
      },
    });
    const totalAcquisitionCostBasis = vehiclesWithCost.reduce((sum, v) => sum + v.acquisitionCost, 0);
    const totalReconditioningInvested = vehiclesWithCost.reduce((sum, v) => sum + v.totalReconditioningCost, 0);

    // Sales transactions
    const sales = await db.saleTransaction.findMany({
      select: { totalAmount: true },
    });
    const totalResaleRevenue = sales.reduce((sum, s) => sum + s.totalAmount, 0);

    // 3. Workshop Operations Metrics
    const openJobCardsCount = await db.jobCard.count({
      where: { status: { notIn: ["DELIVERED", "CANCELLED"] } },
    });
    const completedJobCardsCount = await db.jobCard.count({
      where: { status: "DELIVERED" },
    });

    const deliveredJobs = await db.jobCard.findMany({
      where: { status: "DELIVERED" },
      select: { labourTotal: true, partsTotal: true, grandTotal: true },
    });
    const totalServiceRevenue = deliveredJobs.reduce((sum, j) => sum + j.grandTotal, 0);

    // 4. Spare Parts & Inventory
    const totalSkus = await db.product.count();
    const allProducts = await db.product.findMany({
      select: { stockQuantity: true, reorderThreshold: true, purchaseCost: true },
    });
    const lowStockCount = allProducts.filter((p) => p.stockQuantity <= p.reorderThreshold).length;
    const inventoryValuation = allProducts.reduce((sum, p) => sum + p.stockQuantity * p.purchaseCost, 0);

    // 5. Fleet, Membership & CRM
    const activeMembersCount = await db.membership.count({ where: { status: "ACTIVE" } });
    const fleetAccountsCount = await db.fleetAccount.count({ where: { status: "ACTIVE" } });
    const pendingLeadsCount = await db.cRMLead.count({ where: { status: { in: ["NEW", "CONTACTED"] } } });

    // Recent events
    const recentAudit = await db.auditEvent.findMany({
      orderBy: { timestamp: "desc" },
      take: 10,
    });

    return NextResponse.json({
      metrics: {
        acquisition: {
          totalSubmissions,
          pendingReviewCount,
          offersIssuedCount,
          acquiredCount,
          totalAcquisitionCostBasis,
        },
        inventoryAndResale: {
          totalCompanyVehicles,
          reconditioningCount,
          availableResaleCount,
          reservedResaleCount,
          soldResaleCount,
          totalReconditioningInvested,
          totalResaleRevenue,
        },
        workshop: {
          openJobCardsCount,
          completedJobCardsCount,
          totalServiceRevenue,
        },
        parts: {
          totalSkus,
          lowStockCount,
          inventoryValuation,
        },
        ecosystem: {
          activeMembersCount,
          fleetAccountsCount,
          pendingLeadsCount,
        },
        recentAudit,
      },
    });
  } catch (err: unknown) {
    if (err instanceof Error && err.message === "FORBIDDEN") {
      return NextResponse.json({ error: "Forbidden: Executive access required" }, { status: 403 });
    }
    console.error("Dashboard error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

