"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Car,
  Lock,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  ArrowRight,
  ArrowLeft,
  Save,
  Send,
} from "lucide-react";

export default function SellerSubmitWizard() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successCaseNumber, setSuccessCaseNumber] = useState<string | null>(null);

  // Wizard state
  const [formData, setFormData] = useState({
    // Step 1: Seller Contact
    sellerName: "",
    sellerPhone: "",
    sellerEmail: "",
    preferredContact: "PHONE",
    city: "Chennai",
    state: "Tamil Nadu",

    // Step 2: Vehicle Identity
    make: "Maruti Suzuki",
    model: "Swift",
    variant: "ZXi",
    year: 2021,
    registrationNumber: "TN09CC4521",
    vin: "",
    chassisNumber: "",
    engineNumber: "",

    // Step 3: Technical Specs
    fuelType: "Petrol",
    transmission: "Manual",
    odometerKm: 32000,
    exteriorColor: "Pearl Arctic White",

    // Step 4: Ownership Authority
    registeredOwnerName: "",
    ownershipCount: 1,
    isCommercial: false,

    // Step 5: Loan / Finance Status
    loanHypothecation: false,
    outstandingFinance: 0,
    financierName: "",

    // Step 6: Condition & History
    knownAccidents: false,
    knownDamages: "Clean condition, no body repairs",
    floodFireDamage: false,

    // Step 7: Pricing & Location
    sellerAskingPrice: 650000,
    locationCity: "Chennai",
    locationState: "Tamil Nadu",
    preferredInspectionDate: "",

    // Step 8: Seller Declarations
    agreeToInspection: true,
    confirmAuthority: true,
  });

  const handleChange = (field: string, value: unknown) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSaveOrSubmit = async (isSubmit: boolean) => {
    setLoading(true);
    setError(null);

    try {
      const payload = {
        make: formData.make,
        model: formData.model,
        variant: formData.variant,
        year: Number(formData.year),
        registrationNumber: formData.registrationNumber,
        vin: formData.vin,
        chassisNumber: formData.chassisNumber,
        engineNumber: formData.engineNumber,
        fuelType: formData.fuelType,
        transmission: formData.transmission,
        odometerKm: Number(formData.odometerKm),
        ownershipCount: Number(formData.ownershipCount),
        registeredOwnerName: formData.registeredOwnerName || formData.sellerName || "Registered Owner",
        isCommercial: formData.isCommercial,
        loanHypothecation: formData.loanHypothecation,
        outstandingFinance: Number(formData.outstandingFinance),
        financierName: formData.financierName,
        knownAccidents: formData.knownAccidents,
        knownDamages: formData.knownDamages,
        floodFireDamage: formData.floodFireDamage,
        sellerAskingPrice: Number(formData.sellerAskingPrice),
        exteriorColor: formData.exteriorColor,
        locationCity: formData.locationCity,
        locationState: formData.locationState,
        preferredInspectionDate: formData.preferredInspectionDate,
        submit: isSubmit,
      };

      const res = await fetch("/api/seller/cases", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!res.ok) {
        if (res.status === 401) {
          // If unauthenticated, redirect to sign in with return url
          router.push("/auth/signin?callbackUrl=/seller/submit");
          return;
        }
        throw new Error(data.error?.message || (typeof data.error === "string" ? data.error : "Submission failed"));
      }

      setSuccessCaseNumber(data.case.caseNumber);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Error saving case");
    } finally {
      setLoading(false);
    }
  };

  if (successCaseNumber) {
    return (
      <div className="py-24 bg-slate-50 min-h-screen">
        <div className="max-w-xl mx-auto px-4 text-center">
          <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-2xl flex items-center justify-center mx-auto mb-6">
            <CheckCircle2 className="w-10 h-10" />
          </div>

          <h2 className="text-2xl font-black text-slate-900">
            Vehicle Submission Received Confidentially
          </h2>
          <div className="mt-4 p-4 bg-slate-900 text-white rounded-xl font-mono text-sm inline-block">
            Reference: {successCaseNumber}
          </div>

          <p className="mt-4 text-sm text-slate-600 leading-relaxed">
            Your private vehicle acquisition case has been created. A dedicated Bharat Motor Club
            Acquisition Executive will review your details, arrange technical inspection, and issue a
            binding company purchase offer.
          </p>

          <div className="mt-8 flex justify-center gap-4">
            <Link
              href="/seller/dashboard"
              className="px-6 py-3 text-xs font-bold text-white bg-[#E05A1B] hover:bg-[#C84B12] rounded-xl transition-colors"
            >
              Track in Seller Dashboard
            </Link>
            <Link
              href="/"
              className="px-6 py-3 text-xs font-semibold text-slate-700 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 transition-colors"
            >
              Return Home
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="py-12 bg-slate-50 min-h-screen">
      <div className="max-w-3xl mx-auto px-4 sm:px-6">
        {/* Header Notice */}
        <div className="bg-slate-900 rounded-2xl p-6 text-white mb-8 border border-slate-800">
          <div className="flex items-center gap-3 mb-2">
            <Lock className="w-5 h-5 text-[#E05A1B]" />
            <h1 className="text-xl font-black tracking-tight text-white">
              Confidential Vehicle Acquisition Intake
            </h1>
          </div>
          <p className="text-xs text-slate-300 leading-relaxed">
            Sell directly to Bharat Motor Club. Your submission and contact details remain strictly
            confidential. We evaluate vehicle condition, verify ownership, and buy the car directly
            through the company. No public P2P listings.
          </p>
        </div>

        {/* Wizard Container */}
        <div className="bg-white rounded-2xl p-8 border border-slate-200 shadow-sm">
          {/* Step Indicator */}
          <div className="mb-8 flex items-center justify-between border-b border-slate-100 pb-4">
            <span className="text-xs font-bold text-[#E05A1B] uppercase tracking-wider">
              Step {step} of 4:{" "}
              {step === 1
                ? "Vehicle Identification"
                : step === 2
                ? "Specifications & Mileage"
                : step === 3
                ? "Ownership & Condition"
                : "Expected Price & Declarations"}
            </span>
            <span className="text-xs text-slate-400 font-mono">
              {Math.round((step / 4) * 100)}% Complete
            </span>
          </div>

          {error && (
            <div className="p-4 mb-6 bg-red-50 border border-red-200 rounded-xl text-red-700 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Step 1: Vehicle Identification */}
          {step === 1 && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Make</label>
                  <input
                    type="text"
                    value={formData.make}
                    onChange={(e) => handleChange("make", e.target.value)}
                    placeholder="e.g. Maruti Suzuki, Hyundai, Tata"
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-[#E05A1B]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Model</label>
                  <input
                    type="text"
                    value={formData.model}
                    onChange={(e) => handleChange("model", e.target.value)}
                    placeholder="e.g. Swift, Creta, Nexon"
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-[#E05A1B]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Variant</label>
                  <input
                    type="text"
                    value={formData.variant}
                    onChange={(e) => handleChange("variant", e.target.value)}
                    placeholder="e.g. ZXi, SX(O), Creative"
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-[#E05A1B]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Manufacturing Year
                  </label>
                  <input
                    type="number"
                    value={formData.year}
                    onChange={(e) => handleChange("year", e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-[#E05A1B]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Registration Number
                </label>
                <input
                  type="text"
                  value={formData.registrationNumber}
                  onChange={(e) => handleChange("registrationNumber", e.target.value.toUpperCase())}
                  placeholder="e.g. TN09CC4521"
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono uppercase focus:ring-2 focus:ring-[#E05A1B]"
                />
                <span className="text-[10px] text-slate-400 mt-1 block">
                  Used exclusively for BMC RTO verification. Never published publicly.
                </span>
              </div>
            </div>
          )}

          {/* Step 2: Specs & Mileage */}
          {step === 2 && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Fuel Type</label>
                  <select
                    value={formData.fuelType}
                    onChange={(e) => handleChange("fuelType", e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-700 focus:ring-2 focus:ring-[#E05A1B]"
                  >
                    <option value="Petrol">Petrol</option>
                    <option value="Diesel">Diesel</option>
                    <option value="CNG">CNG</option>
                    <option value="Electric">Electric</option>
                    <option value="Hybrid">Hybrid</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Transmission</label>
                  <select
                    value={formData.transmission}
                    onChange={(e) => handleChange("transmission", e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-700 focus:ring-2 focus:ring-[#E05A1B]"
                  >
                    <option value="Manual">Manual</option>
                    <option value="Automatic">Automatic</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Current Odometer (km)
                  </label>
                  <input
                    type="number"
                    value={formData.odometerKm}
                    onChange={(e) => handleChange("odometerKm", e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-[#E05A1B]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Exterior Color
                  </label>
                  <input
                    type="text"
                    value={formData.exteriorColor}
                    onChange={(e) => handleChange("exteriorColor", e.target.value)}
                    placeholder="e.g. Arctic White, Magma Grey"
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-[#E05A1B]"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Step 3: Ownership & Condition */}
          {step === 3 && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Registered Owner Name (on RC)
                  </label>
                  <input
                    type="text"
                    value={formData.registeredOwnerName}
                    onChange={(e) => handleChange("registeredOwnerName", e.target.value)}
                    placeholder="Name as printed on RC card"
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-[#E05A1B]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Ownership Count
                  </label>
                  <select
                    value={formData.ownershipCount}
                    onChange={(e) => handleChange("ownershipCount", e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-700 focus:ring-2 focus:ring-[#E05A1B]"
                  >
                    <option value={1}>1st Owner</option>
                    <option value={2}>2nd Owner</option>
                    <option value={3}>3rd Owner</option>
                    <option value={4}>4th+ Owner</option>
                  </select>
                </div>
              </div>

              <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <span className="font-bold text-slate-900 text-xs block">
                      Existing Bank Loan / Hypothecation?
                    </span>
                    <span className="text-[11px] text-slate-500">
                      Does the vehicle currently have an active bank loan?
                    </span>
                  </div>
                  <input
                    type="checkbox"
                    checked={formData.loanHypothecation}
                    onChange={(e) => handleChange("loanHypothecation", e.target.checked)}
                    className="w-4 h-4 text-[#E05A1B] rounded"
                  />
                </div>

                {formData.loanHypothecation && (
                  <div className="grid grid-cols-2 gap-3 pt-2">
                    <input
                      type="text"
                      placeholder="Bank / Financier Name"
                      value={formData.financierName}
                      onChange={(e) => handleChange("financierName", e.target.value)}
                      className="px-3 py-2 bg-white border border-slate-200 rounded-lg text-xs"
                    />
                    <input
                      type="number"
                      placeholder="Approx. Loan Balance (₹)"
                      value={formData.outstandingFinance}
                      onChange={(e) => handleChange("outstandingFinance", e.target.value)}
                      className="px-3 py-2 bg-white border border-slate-200 rounded-lg text-xs"
                    />
                  </div>
                )}
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Accident / Flood / Damage History
                </label>
                <textarea
                  rows={2}
                  value={formData.knownDamages}
                  onChange={(e) => handleChange("knownDamages", e.target.value)}
                  placeholder="Mention any replaced panels, minor fender repairs, or known concerns..."
                  className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-[#E05A1B]"
                />
              </div>
            </div>
          )}

          {/* Step 4: Price & Declarations */}
          {step === 4 && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Your Expected Net Price (₹)
                  </label>
                  <input
                    type="number"
                    value={formData.sellerAskingPrice}
                    onChange={(e) => handleChange("sellerAskingPrice", e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-[#E05A1B] focus:ring-2 focus:ring-[#E05A1B]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Vehicle Location (City, State)
                  </label>
                  <input
                    type="text"
                    value={formData.locationCity}
                    onChange={(e) => handleChange("locationCity", e.target.value)}
                    placeholder="e.g. Chennai, Tamil Nadu"
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-[#E05A1B]"
                  />
                </div>
              </div>

              <div className="p-4 bg-orange-50 border border-orange-200 rounded-xl text-xs text-slate-800 space-y-3">
                <div className="flex items-start gap-2.5">
                  <input
                    type="checkbox"
                    id="dec1"
                    checked={formData.confirmAuthority}
                    onChange={(e) => handleChange("confirmAuthority", e.target.checked)}
                    className="w-4 h-4 text-[#E05A1B] rounded mt-0.5"
                  />
                  <label htmlFor="dec1" className="text-[11px] leading-relaxed">
                    I declare that I am the registered owner or legally authorized representative of
                    this vehicle, and all provided details are true to the best of my knowledge.
                  </label>
                </div>

                <div className="flex items-start gap-2.5">
                  <input
                    type="checkbox"
                    id="dec2"
                    checked={formData.agreeToInspection}
                    onChange={(e) => handleChange("agreeToInspection", e.target.checked)}
                    className="w-4 h-4 text-[#E05A1B] rounded mt-0.5"
                  />
                  <label htmlFor="dec2" className="text-[11px] leading-relaxed">
                    I understand that Bharat Motor Club will perform a technical 120-point inspection
                    and document verification before issuing an official purchase offer.
                  </label>
                </div>
              </div>
            </div>
          )}

          {/* Navigation Controls */}
          <div className="mt-8 pt-6 border-t border-slate-100 flex items-center justify-between">
            {step > 1 ? (
              <button
                type="button"
                onClick={() => setStep(step - 1)}
                className="px-5 py-2 text-xs font-semibold text-slate-600 hover:text-slate-900 border border-slate-200 rounded-xl hover:bg-slate-50 flex items-center gap-1.5"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Previous</span>
              </button>
            ) : (
              <div />
            )}

            <div className="flex items-center gap-3">
              <button
                type="button"
                disabled={loading}
                onClick={() => handleSaveOrSubmit(false)}
                className="px-4 py-2 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors flex items-center gap-1.5"
              >
                <Save className="w-4 h-4" />
                <span>Save Draft</span>
              </button>

              {step < 4 ? (
                <button
                  type="button"
                  onClick={() => setStep(step + 1)}
                  className="px-6 py-2.5 text-xs font-bold text-white bg-slate-900 hover:bg-[#E05A1B] rounded-xl transition-colors flex items-center gap-1.5"
                >
                  <span>Continue</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              ) : (
                <button
                  type="button"
                  disabled={loading || !formData.confirmAuthority}
                  onClick={() => handleSaveOrSubmit(true)}
                  className="px-6 py-2.5 text-xs font-bold text-white bg-[#E05A1B] hover:bg-[#C84B12] rounded-xl transition-colors flex items-center gap-1.5 shadow-md disabled:opacity-50"
                >
                  <Send className="w-4 h-4" />
                  <span>{loading ? "Submitting..." : "Submit to BMC for Review"}</span>
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

