"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { Award, CheckCircle2, ShieldCheck, ArrowRight, Star } from "lucide-react";

interface Plan {
  id: string;
  name: string;
  tier: string;
  description: string;
  priceAnnual: number;
  benefits: string[];
  durationMonths: number;
}

export default function MembershipPage() {
  const [plans, setPlans] = useState<Plan[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedPlanId, setSelectedPlanId] = useState<string | null>(null);
  const [vehicleRegNumber, setVehicleRegNumber] = useState("");
  const [enrolling, setEnrolling] = useState(false);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/membership-plans")
      .then((res) => res.json())
      .then((data) => {
        if (data.plans) {
          setPlans(data.plans);
          if (data.plans.length > 0) setSelectedPlanId(data.plans[1]?.id || data.plans[0].id);
        }
        setLoading(false);
      })
      .catch((err) => {
        console.error(err);
        setLoading(false);
      });
  }, []);

  const handleEnroll = async (e: React.FormEvent) => {
    e.preventDefault();
    setEnrolling(true);
    setSuccessMsg(null);
    setErrorMsg(null);

    try {
      const res = await fetch("/api/membership", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          planId: selectedPlanId,
          vehicleRegNumber,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        if (res.status === 401) {
          window.location.href = "/auth/signin?callbackUrl=/membership";
          return;
        }
        throw new Error(data.error || "Enrollment failed");
      }

      setSuccessMsg(
        `Welcome to Bharat Motor Club! Your membership is active. Member ID: ${data.membership?.memberNumber}`
      );
    } catch (err: unknown) {
      setErrorMsg(err instanceof Error ? err.message : "Enrollment error");
    } finally {
      setEnrolling(false);
    }
  };

  return (
    <div className="py-12 bg-slate-50 min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-14">
          <span className="text-xs font-bold uppercase tracking-widest text-[#E05A1B]">
            Automotive Community
          </span>
          <h1 className="mt-2 text-3xl sm:text-5xl font-black text-slate-900 tracking-tight">
            Bharat Motor Club Membership
          </h1>
          <p className="mt-4 text-sm text-slate-600 leading-relaxed">
            Unlock priority workshop bay reservations, discounted labor rates, roadside emergency
            breakdown response, and verified digital health records for your vehicle.
          </p>
        </div>

        {/* Plans Grid */}
        {loading ? (
          <div className="py-20 text-center">
            <div className="inline-block w-8 h-8 border-4 border-[#E05A1B] border-t-transparent rounded-full animate-spin mb-4" />
            <p className="text-slate-500 text-xs">Loading membership tiers...</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
            {plans.map((p) => {
              const isPopular = p.tier === "GOLD";
              return (
                <div
                  key={p.id}
                  className={`bg-white rounded-3xl p-8 border ${
                    isPopular
                      ? "border-2 border-[#E05A1B] shadow-xl relative"
                      : "border-slate-200 shadow-sm"
                  } flex flex-col justify-between`}
                >
                  {isPopular && (
                    <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 px-4 py-1 bg-[#E05A1B] text-white text-[10px] font-bold uppercase tracking-wider rounded-full flex items-center gap-1 shadow-md">
                      <Star className="w-3 h-3 fill-white" />
                      <span>Most Popular</span>
                    </div>
                  )}

                  <div>
                    <div className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
                      {p.tier} Tier
                    </div>
                    <h3 className="text-2xl font-black text-slate-900">{p.name}</h3>
                    <p className="text-xs text-slate-600 mt-2 min-h-[36px]">{p.description}</p>

                    <div className="mt-6 mb-6">
                      <span className="text-3xl font-black text-slate-900">
                        ₹{p.priceAnnual.toLocaleString("en-IN")}
                      </span>
                      <span className="text-xs text-slate-400"> / {p.durationMonths} months</span>
                    </div>

                    <div className="space-y-3 pt-6 border-t border-slate-100">
                      <span className="text-[11px] font-bold text-slate-900 block uppercase tracking-wide">
                        Included Privileges:
                      </span>
                      {p.benefits?.map((benefit, i) => (
                        <div key={i} className="flex items-start gap-2.5 text-xs text-slate-700">
                          <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                          <span>{benefit}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="mt-8 pt-6">
                    <button
                      type="button"
                      onClick={() => setSelectedPlanId(p.id)}
                      className={`w-full py-3 text-xs font-bold rounded-xl transition-all ${
                        selectedPlanId === p.id
                          ? "bg-[#E05A1B] text-white shadow-md"
                          : "bg-slate-100 hover:bg-slate-200 text-slate-800"
                      }`}
                    >
                      {selectedPlanId === p.id ? "Selected Tier" : "Select Tier"}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Enrollment Card */}
        <div className="max-w-xl mx-auto bg-white rounded-3xl p-8 border border-slate-200 shadow-sm">
          <h3 className="text-lg font-black text-slate-900 mb-2">Complete Membership Enrollment</h3>
          <p className="text-xs text-slate-500 mb-6">
            Link your vehicle registration to access seamless priority bay scheduling.
          </p>

          {successMsg ? (
            <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-800 text-xs font-semibold leading-relaxed">
              {successMsg}
            </div>
          ) : (
            <form onSubmit={handleEnroll} className="space-y-4">
              {errorMsg && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-xs">
                  {errorMsg}
                </div>
              )}

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Vehicle Registration Number
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. TN09CC4521"
                  value={vehicleRegNumber}
                  onChange={(e) => setVehicleRegNumber(e.target.value.toUpperCase())}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs uppercase font-mono"
                />
              </div>

              <button
                type="submit"
                disabled={enrolling || !selectedPlanId}
                className="w-full py-3 bg-slate-900 hover:bg-[#E05A1B] text-white text-xs font-bold rounded-xl shadow-md transition-colors disabled:opacity-50"
              >
                {enrolling ? "Activating Membership..." : "Confirm Club Enrollment"}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}

