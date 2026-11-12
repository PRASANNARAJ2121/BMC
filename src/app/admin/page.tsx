"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  Car,
  Wrench,
  Package,
  TrendingUp,
  ShieldCheck,
  Building2,
  Award,
  AlertCircle,
  Clock,
  Sparkles,
  ArrowRight,
  DollarSign,
  Activity,
} from "lucide-react";

interface MetricsData {
  acquisition: {
    totalSubmissions: number;
    pendingReviewCount: number;
    offersIssuedCount: number;
    acquiredCount: number;
    totalAcquisitionCostBasis: number;
  };
  inventoryAndResale: {
    totalCompanyVehicles: number;
    reconditioningCount: number;
    availableResaleCount: number;
    reservedResaleCount: number;
    soldResaleCount: number;
    totalReconditioningInvested: number;
    totalResaleRevenue: number;
  };
  workshop: {
    openJobCardsCount: number;
    completedJobCardsCount: number;
    totalServiceRevenue: number;
  };
  parts: {
    totalSkus: number;
    lowStockCount: number;
    inventoryValuation: number;
  };
  ecosystem: {
    activeMembersCount: number;
    fleetAccountsCount: number;
    pendingLeadsCount: number;
  };
  recentAudit: Array<{
    id: string;
    action: string;
    actorRole: string;
    entityName: string;
    timestamp: string;
  }>;
}

export default function AdminDashboardPage() {
  const [metrics, setMetrics] = useState<MetricsData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/admin/dashboard")
      .then((res) => {
        if (res.status === 401 || res.status === 403) {
          window.location.href = "/auth/signin?callbackUrl=/admin";
          return null;
        }
        return res.json();
      })
      .then((data) => {
        if (data?.metrics) setMetrics(data.metrics);
        setLoading(false);
      })
      .catch((err) => {
        console.error(err);
        setLoading(false);
      });
  }, []);

  if (loading) {
    return (
      <div className="py-32 text-center bg-slate-900 text-white min-h-screen">
        <div className="inline-block w-8 h-8 border-4 border-[#E05A1B] border-t-transparent rounded-full animate-spin mb-4" />
        <p className="text-slate-400 text-xs">Loading operational metrics...</p>
      </div>
    );
  }

  if (!metrics) {
    return (
      <div className="py-24 text-center">
        <p className="text-xs text-slate-500">Unable to load dashboard.</p>
      </div>
    );
  }

  return (
    <div className="py-10 bg-slate-950 text-slate-100 min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header Bar */}
        <div className="flex flex-col md:flex-row md:items-center justify-between pb-8 border-b border-slate-800 gap-4 mb-8">
          <div>
            <div className="flex items-center gap-2 text-xs font-bold text-[#E05A1B] uppercase tracking-wider mb-1">
              <Activity className="w-4 h-4" />
              <span>Operations & Management Command</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
              Bharat Motor Club Executive BI
            </h1>
            <p className="text-xs text-slate-400 mt-1">
              Live operational metrics computed directly from database ledgers. Zero static placeholders.
            </p>
          </div>

          <div className="flex flex-wrap gap-2">
            <Link
              href="/admin/acquisition"
              className="px-3.5 py-2 text-xs font-bold text-white bg-slate-800 hover:bg-slate-700 rounded-xl transition-colors"
            >
              Acquisition Queue
            </Link>
            <Link
              href="/admin/vehicles"
              className="px-3.5 py-2 text-xs font-bold text-white bg-slate-800 hover:bg-slate-700 rounded-xl transition-colors"
            >
              Company Stock & QC
            </Link>
            <Link
              href="/admin/jobs"
              className="px-3.5 py-2 text-xs font-bold text-white bg-slate-800 hover:bg-slate-700 rounded-xl transition-colors"
            >
              Workshop Job Cards
            </Link>
            <Link
              href="/admin/prompts"
              className="px-3.5 py-2 text-xs font-bold text-white bg-[#E05A1B] hover:bg-[#C84B12] rounded-xl transition-colors flex items-center gap-1.5"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>Prompt Studio</span>
            </Link>
          </div>
        </div>

        {/* Section 1: Top High-Level Metrics */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-8">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5">
            <div className="flex justify-between items-center text-xs font-bold text-slate-400 uppercase tracking-wider">
              <span>Acquisition Pipeline</span>
              <Car className="w-4 h-4 text-[#E05A1B]" />
            </div>
            <div className="text-3xl font-black text-white mt-2">
              {metrics.acquisition.totalSubmissions}
            </div>
            <div className="text-[11px] text-slate-400 mt-1 flex justify-between">
              <span>Under Review: {metrics.acquisition.pendingReviewCount}</span>
              <span className="text-emerald-400 font-bold">Acquired: {metrics.acquisition.acquiredCount}</span>
            </div>
          </div>

          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5">
            <div className="flex justify-between items-center text-xs font-bold text-slate-400 uppercase tracking-wider">
              <span>Resale Inventory</span>
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
            </div>
            <div className="text-3xl font-black text-white mt-2">
              {metrics.inventoryAndResale.totalCompanyVehicles}
            </div>
            <div className="text-[11px] text-slate-400 mt-1 flex justify-between">
              <span className="text-emerald-400 font-bold">
                Available: {metrics.inventoryAndResale.availableResaleCount}
              </span>
              <span className="text-amber-400 font-bold">
                Reserved: {metrics.inventoryAndResale.reservedResaleCount}
              </span>
            </div>
          </div>

          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5">
            <div className="flex justify-between items-center text-xs font-bold text-slate-400 uppercase tracking-wider">
              <span>Workshop Job Cards</span>
              <Wrench className="w-4 h-4 text-blue-400" />
            </div>
            <div className="text-3xl font-black text-white mt-2">
              {metrics.workshop.openJobCardsCount}
            </div>
            <div className="text-[11px] text-slate-400 mt-1 flex justify-between">
              <span>Active in Bays</span>
              <span className="text-emerald-400 font-bold">
                Delivered: {metrics.workshop.completedJobCardsCount}
              </span>
            </div>
          </div>

          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5">
            <div className="flex justify-between items-center text-xs font-bold text-slate-400 uppercase tracking-wider">
              <span>Club & Corporate</span>
              <Award className="w-4 h-4 text-purple-400" />
            </div>
            <div className="text-3xl font-black text-white mt-2">
              {metrics.ecosystem.activeMembersCount}
            </div>
            <div className="text-[11px] text-slate-400 mt-1 flex justify-between">
              <span>Club Members</span>
              <span>Fleets: {metrics.ecosystem.fleetAccountsCount}</span>
            </div>
          </div>
        </div>

        {/* Section 2: Financial Capital & Ledger Integrity */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400 block mb-2">
              Capital Deployed in Acquisitions
            </span>
            <div className="text-2xl font-black text-white">
              ₹{metrics.acquisition.totalAcquisitionCostBasis.toLocaleString("en-IN")}
            </div>
            <p className="text-[11px] text-slate-400 mt-2 leading-relaxed">
              Cost basis across company-purchased vehicle assets including purchase price and settlement.
            </p>
          </div>

          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400 block mb-2">
              Workshop Reconditioning Investment
            </span>
            <div className="text-2xl font-black text-[#E05A1B]">
              ₹{metrics.inventoryAndResale.totalReconditioningInvested.toLocaleString("en-IN")}
            </div>
            <p className="text-[11px] text-slate-400 mt-2 leading-relaxed">
              Cumulative internal parts and mechanical labor invested in reconditioning inventory.
            </p>
          </div>

          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400 block mb-2">
              Resale & Service Revenue
            </span>
            <div className="text-2xl font-black text-emerald-400">
              ₹{(metrics.inventoryAndResale.totalResaleRevenue + metrics.workshop.totalServiceRevenue).toLocaleString("en-IN")}
            </div>
            <p className="text-[11px] text-slate-400 mt-2 leading-relaxed">
              Verified gross receipts across vehicle sales and garage service invoices.
            </p>
          </div>
        </div>

        {/* Section 3: Recent Audit Trail */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-bold text-white text-sm">System Audit Event Log</h3>
            <span className="text-[10px] text-slate-400 font-mono">Append-only compliance ledger</span>
          </div>

          <div className="divide-y divide-slate-800 text-xs">
            {metrics.recentAudit.map((evt) => (
              <div key={evt.id} className="py-2.5 flex items-center justify-between text-slate-300">
                <div className="flex items-center gap-2">
                  <span className="px-2 py-0.5 rounded bg-slate-800 text-[10px] font-mono text-[#E05A1B]">
                    {evt.action}
                  </span>
                  <span className="text-slate-400">on {evt.entityName}</span>
                </div>
                <div className="flex items-center gap-3 text-[11px] text-slate-500">
                  <span className="font-mono text-slate-400">{evt.actorRole}</span>
                  <span>{new Date(evt.timestamp).toLocaleTimeString("en-IN")}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

