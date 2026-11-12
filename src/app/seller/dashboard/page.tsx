"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  Car,
  Lock,
  Clock,
  CheckCircle2,
  AlertCircle,
  ArrowRight,
  ShieldCheck,
  FileText,
  Plus,
} from "lucide-react";

interface CaseItem {
  id: string;
  caseNumber: string;
  status: string;
  sellerAskingPrice: number;
  createdAt: string;
  vehicle: {
    make: string;
    model: string;
    variant: string;
    year: number;
    fuelType: string;
    transmission: string;
    odometerKm: number;
    registrationNumber: string;
  } | null;
  activeOffer: {
    id: string;
    offeredPrice: number;
    status: string;
    expiresAt: string;
    termsAndConditions: string;
  } | null;
}

export default function SellerDashboardPage() {
  const [cases, setCases] = useState<CaseItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [actionMessage, setActionMessage] = useState<string | null>(null);

  useEffect(() => {
    fetchCases();
  }, []);

  const fetchCases = () => {
    setLoading(true);
    fetch("/api/seller/cases")
      .then((res) => {
        if (res.status === 401) {
          window.location.href = "/auth/signin?callbackUrl=/seller/dashboard";
          return null;
        }
        return res.json();
      })
      .then((data) => {
        if (data?.cases) setCases(data.cases);
        setLoading(false);
      })
      .catch((err) => {
        console.error(err);
        setLoading(false);
      });
  };

  const handleOfferDecision = async (caseId: string, decision: "ACCEPT" | "DECLINE") => {
    setActionLoading(true);
    setActionMessage(null);

    try {
      const res = await fetch(`/api/seller/cases/${caseId}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: decision === "ACCEPT" ? "ACCEPT_OFFER" : "DECLINE_OFFER",
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Decision failed");

      setActionMessage(
        decision === "ACCEPT"
          ? "Offer accepted! Our legal and documentation team will contact you to schedule payment and RTO transfer."
          : "Offer declined. You may discuss revisions with your dedicated Acquisition Executive."
      );
      fetchCases();
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : "Action failed");
    } finally {
      setActionLoading(false);
    }
  };

  return (
    <div className="py-12 bg-slate-50 min-h-screen">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
          <div>
            <div className="flex items-center gap-2 text-xs font-bold text-[#E05A1B] uppercase tracking-wider mb-1">
              <Lock className="w-4 h-4" />
              <span>Confidential Seller Workspace</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
              My Private Vehicle Submissions
            </h1>
            <p className="text-xs text-slate-500 mt-1">
              Your submissions are strictly confidential and visible only to you and authorized BMC
              acquisition staff.
            </p>
          </div>

          <Link
            href="/seller/submit"
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#E05A1B] hover:bg-[#C84B12] text-white font-bold text-xs rounded-xl shadow-md transition-colors"
          >
            <Plus className="w-4 h-4" />
            <span>Submit Another Vehicle</span>
          </Link>
        </div>

        {actionMessage && (
          <div className="mb-6 p-4 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-800 text-xs font-semibold">
            {actionMessage}
          </div>
        )}

        {/* Content */}
        {loading ? (
          <div className="py-24 text-center">
            <div className="inline-block w-8 h-8 border-4 border-[#E05A1B] border-t-transparent rounded-full animate-spin mb-4" />
            <p className="text-slate-500 text-xs">Loading confidential cases...</p>
          </div>
        ) : cases.length === 0 ? (
          <div className="bg-white rounded-2xl p-12 text-center border border-slate-200">
            <Car className="w-12 h-12 text-slate-400 mx-auto mb-4" />
            <h3 className="text-base font-bold text-slate-900">No Submissions Yet</h3>
            <p className="mt-2 text-xs text-slate-500 max-w-md mx-auto">
              Ready to sell your vehicle directly to Bharat Motor Club with guaranteed settlement and
              zero public peer-to-peer exposure?
            </p>
            <div className="mt-6">
              <Link
                href="/seller/submit"
                className="px-6 py-2.5 text-xs font-bold text-white bg-[#E05A1B] hover:bg-[#C84B12] rounded-xl transition-colors inline-block"
              >
                Start Intake Wizard
              </Link>
            </div>
          </div>
        ) : (
          <div className="space-y-6">
            {cases.map((c) => (
              <div
                key={c.id}
                className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm hover:border-slate-300 transition-colors"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-slate-100 gap-3">
                  <div>
                    <span className="text-[10px] font-mono px-2.5 py-1 bg-slate-900 text-white rounded-md font-bold">
                      {c.caseNumber}
                    </span>
                    <span className="text-xs text-slate-400 ml-3">
                      Submitted on {new Date(c.createdAt).toLocaleDateString("en-IN")}
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="text-[11px] text-slate-500 font-semibold">Status:</span>
                    <span className="px-3 py-1 rounded-full text-xs font-bold bg-orange-100 text-[#E05A1B]">
                      {c.status.replace(/_/g, " ")}
                    </span>
                  </div>
                </div>

                <div className="py-4 grid grid-cols-1 md:grid-cols-3 gap-6 items-center">
                  <div>
                    <div className="text-xs font-semibold text-slate-400 uppercase">Vehicle</div>
                    <div className="text-base font-bold text-slate-900 mt-0.5">
                      {c.vehicle ? `${c.vehicle.year} ${c.vehicle.make} ${c.vehicle.model}` : "Vehicle Draft"}
                    </div>
                    <div className="text-xs text-slate-600 font-mono mt-0.5">
                      {c.vehicle?.variant} • {c.vehicle?.odometerKm.toLocaleString("en-IN")} km
                    </div>
                  </div>

                  <div>
                    <div className="text-xs font-semibold text-slate-400 uppercase">Expected Price</div>
                    <div className="text-base font-black text-slate-900 mt-0.5">
                      ₹{c.sellerAskingPrice.toLocaleString("en-IN")}
                    </div>
                    <div className="text-[11px] text-slate-500">Your submitted net asking price</div>
                  </div>

                  <div className="text-left md:text-right">
                    <div className="text-xs font-semibold text-slate-400 uppercase">Registration</div>
                    <div className="text-sm font-bold text-slate-800 font-mono mt-0.5">
                      {c.vehicle?.registrationNumber || "Pending"}
                    </div>
                    <div className="text-[10px] text-emerald-600 flex md:justify-end items-center gap-1 mt-0.5">
                      <ShieldCheck className="w-3.5 h-3.5" />
                      <span>Encrypted & Confidential</span>
                    </div>
                  </div>
                </div>

                {/* Active Company Offer Banner if ISSUED */}
                {c.activeOffer && c.status === "OFFER_ISSUED" && (
                  <div className="mt-4 p-5 bg-gradient-to-r from-orange-50 to-amber-50 border border-orange-200 rounded-xl">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                      <div>
                        <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded bg-emerald-600 text-white text-[10px] font-bold uppercase tracking-wider mb-2">
                          <CheckCircle2 className="w-3 h-3" />
                          <span>Official Purchase Offer Received</span>
                        </div>
                        <div className="text-2xl font-black text-[#E05A1B]">
                          ₹{c.activeOffer.offeredPrice.toLocaleString("en-IN")}
                        </div>
                        <p className="text-xs text-slate-600 mt-1">
                          {c.activeOffer.termsAndConditions}
                        </p>
                      </div>

                      <div className="flex items-center gap-3">
                        <button
                          type="button"
                          disabled={actionLoading}
                          onClick={() => handleOfferDecision(c.id, "ACCEPT")}
                          className="px-5 py-2.5 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl shadow-md transition-colors"
                        >
                          Accept Offer
                        </button>
                        <button
                          type="button"
                          disabled={actionLoading}
                          onClick={() => handleOfferDecision(c.id, "DECLINE")}
                          className="px-4 py-2.5 text-xs font-semibold text-slate-700 bg-white hover:bg-slate-50 border border-slate-300 rounded-xl transition-colors"
                        >
                          Decline / Request Revision
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

