"use client";

import React, { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import PaymentModal from "@/components/common/PaymentModal";
import {
  Car,
  ShieldCheck,
  Calendar,
  Gauge,
  Fuel,
  CheckCircle2,
  AlertCircle,
  FileCheck,
  ArrowLeft,
  Clock,
  Phone,
} from "lucide-react";

interface VehicleDetail {
  id: string;
  stockNumber: string;
  make: string;
  model: string;
  variant: string;
  year: number;
  fuelType: string;
  transmission: string;
  mileageKm: number;
  exteriorColor: string;
  bodyType: string;
  askingPrice: number;
  isFeatured: boolean;
  status: string;
  ownershipCount: number;
  photos: string[];
  keyFeatures: string[];
  specifications: Record<string, string>;
  inspectionSummary: Record<string, unknown>;
  repairsCompleted: string[];
  knownDefects: string[];
}

export default function VehicleDetailPage() {
  const { id } = useParams() as { id: string };
  const [vehicle, setVehicle] = useState<VehicleDetail | null>(null);
  const [loading, setLoading] = useState(true);

  // Form states
  const [activeTab, setActiveTab] = useState<"details" | "inspection" | "repairs">("details");
  const [modalAction, setModalAction] = useState<"ENQUIRY" | "TEST_DRIVE" | "RESERVE" | null>(null);
  const [customerName, setCustomerName] = useState("");
  const [customerPhone, setCustomerPhone] = useState("");
  const [customerEmail, setCustomerEmail] = useState("");
  const [message, setMessage] = useState("");
  const [preferredDate, setPreferredDate] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [actionSuccess, setActionSuccess] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);

  useEffect(() => {
    fetch(`/api/vehicles/${id}`)
      .then((res) => res.json())
      .then((data) => {
        if (data.vehicle) setVehicle(data.vehicle);
        setLoading(false);
      })
      .catch((err) => {
        console.error(err);
        setLoading(false);
      });
  }, [id]);

  const handleSubmitAction = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setActionSuccess(null);
    setActionError(null);

    try {
      const payload: Record<string, unknown> = {
        action: modalAction,
        customerName,
        customerPhone,
        customerEmail,
      };

      if (modalAction === "ENQUIRY") {
        payload.message = message;
      } else if (modalAction === "TEST_DRIVE") {
        payload.preferredDate = preferredDate;
      } else if (modalAction === "RESERVE") {
        payload.idempotencyKey = `RSV-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;
        payload.bookingAmount = 10000;
      }

      const res = await fetch(`/api/vehicles/${id}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Action failed");
      }

      setActionSuccess(
        modalAction === "RESERVE"
          ? `Vehicle reserved successfully! Hold active for 48 hours. Reference: ${data.reservation?.reservationNumber}`
          : modalAction === "TEST_DRIVE"
          ? "Test drive scheduled! Our branch coordinator will confirm your time slot."
          : "Enquiry submitted! A BMC vehicle specialist will contact you shortly."
      );
    } catch (err: unknown) {
      setActionError(err instanceof Error ? err.message : "Submission failed");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="py-32 text-center">
        <div className="inline-block w-8 h-8 border-4 border-[#E05A1B] border-t-transparent rounded-full animate-spin mb-4" />
        <p className="text-slate-500 text-sm">Loading vehicle file...</p>
      </div>
    );
  }

  if (!vehicle) {
    return (
      <div className="py-24 text-center max-w-md mx-auto">
        <h2 className="text-xl font-bold text-slate-900">Vehicle Not Found</h2>
        <p className="text-xs text-slate-500 mt-2">This listing may have been reserved or sold.</p>
        <Link
          href="/automobiles"
          className="mt-6 inline-flex items-center gap-2 text-xs font-bold text-[#E05A1B]"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Certified Resale</span>
        </Link>
      </div>
    );
  }

  return (
    <div className="py-10 bg-slate-50 min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Breadcrumb */}
        <div className="mb-6">
          <Link
            href="/automobiles"
            className="inline-flex items-center gap-2 text-xs font-semibold text-slate-500 hover:text-[#E05A1B] transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Resale Catalogue</span>
          </Link>
        </div>

        {/* Main Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left 2 Cols: Media & Detailed Specs */}
          <div className="lg:col-span-2 space-y-6">
            {/* Main Showcase Banner */}
            <div className="bg-slate-900 rounded-3xl p-8 text-white relative overflow-hidden min-h-[320px] flex flex-col justify-between">
              <div className="flex justify-between items-start">
                <div>
                  <span className="px-2.5 py-1 rounded-md text-[10px] font-bold bg-slate-800 text-slate-300">
                    Stock #{vehicle.stockNumber}
                  </span>
                  <div className="text-xs font-semibold text-slate-400 uppercase tracking-widest mt-2">
                    {vehicle.year} • {vehicle.fuelType} • {vehicle.transmission}
                  </div>
                  <h1 className="text-2xl sm:text-4xl font-black text-white mt-1">
                    {vehicle.make} {vehicle.model}
                  </h1>
                  <p className="text-sm text-slate-400 font-mono mt-0.5">{vehicle.variant}</p>
                </div>

                <div className="text-right">
                  <span className="text-[10px] text-slate-400 block uppercase">Certified Resale</span>
                  <span className="text-2xl sm:text-3xl font-black text-[#E05A1B]">
                    ₹{vehicle.askingPrice.toLocaleString("en-IN")}
                  </span>
                  <span className="text-[10px] text-slate-500 block">All taxes & RC transfer included</span>
                </div>
              </div>

              <div className="pt-6 border-t border-slate-800 grid grid-cols-3 gap-4 text-xs">
                <div className="flex items-center gap-2">
                  <Gauge className="w-4 h-4 text-[#E05A1B]" />
                  <span>{vehicle.mileageKm.toLocaleString("en-IN")} km</span>
                </div>
                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-[#E05A1B]" />
                  <span>
                    {vehicle.ownershipCount} {vehicle.ownershipCount === 1 ? "Owner" : "Owners"}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-emerald-400" />
                  <span>Company Certified</span>
                </div>
              </div>
            </div>

            {/* Navigation Tabs */}
            <div className="flex border-b border-slate-200 gap-6 text-sm font-semibold">
              <button
                type="button"
                onClick={() => setActiveTab("details")}
                className={`pb-3 ${
                  activeTab === "details"
                    ? "border-b-2 border-[#E05A1B] text-[#E05A1B]"
                    : "text-slate-500 hover:text-slate-900"
                }`}
              >
                Specifications & Features
              </button>
              <button
                type="button"
                onClick={() => setActiveTab("inspection")}
                className={`pb-3 ${
                  activeTab === "inspection"
                    ? "border-b-2 border-[#E05A1B] text-[#E05A1B]"
                    : "text-slate-500 hover:text-slate-900"
                }`}
              >
                120-Point Inspection Findings
              </button>
              <button
                type="button"
                onClick={() => setActiveTab("repairs")}
                className={`pb-3 ${
                  activeTab === "repairs"
                    ? "border-b-2 border-[#E05A1B] text-[#E05A1B]"
                    : "text-slate-500 hover:text-slate-900"
                }`}
              >
                Completed Reconditioning & Defects
              </button>
            </div>

            {/* Tab 1: Details */}
            {activeTab === "details" && (
              <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm space-y-6">
                <div>
                  <h3 className="text-sm font-bold text-slate-900 mb-3">Vehicle Overview</h3>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs">
                    <div className="p-3 bg-slate-50 rounded-xl">
                      <span className="text-slate-400 block text-[10px]">Body Type</span>
                      <span className="font-bold text-slate-800">{vehicle.bodyType}</span>
                    </div>
                    <div className="p-3 bg-slate-50 rounded-xl">
                      <span className="text-slate-400 block text-[10px]">Exterior Color</span>
                      <span className="font-bold text-slate-800">{vehicle.exteriorColor || "Factory"}</span>
                    </div>
                    <div className="p-3 bg-slate-50 rounded-xl">
                      <span className="text-slate-400 block text-[10px]">Transmission</span>
                      <span className="font-bold text-slate-800">{vehicle.transmission}</span>
                    </div>
                    <div className="p-3 bg-slate-50 rounded-xl">
                      <span className="text-slate-400 block text-[10px]">Fuel Type</span>
                      <span className="font-bold text-slate-800">{vehicle.fuelType}</span>
                    </div>
                  </div>
                </div>

                {vehicle.keyFeatures?.length > 0 && (
                  <div>
                    <h3 className="text-sm font-bold text-slate-900 mb-3">Key Features</h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                      {vehicle.keyFeatures.map((feat, idx) => (
                        <div key={idx} className="flex items-center gap-2 text-slate-700">
                          <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                          <span>{feat}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Tab 2: Inspection */}
            {activeTab === "inspection" && (
              <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm space-y-6">
                <div className="flex items-center gap-3">
                  <ShieldCheck className="w-6 h-6 text-emerald-600" />
                  <div>
                    <h3 className="text-sm font-bold text-slate-900">
                      Technical Inspection Certification
                    </h3>
                    <p className="text-xs text-slate-500">
                      Conducted by certified Bharat Motor Club technical inspectors
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                  <div className="p-4 border border-slate-200 rounded-xl">
                    <span className="font-bold text-slate-900 block mb-1">Chassis & Structure</span>
                    <span className="text-slate-600">
                      No structural welding or deformation detected. Frame integrity verified.
                    </span>
                  </div>
                  <div className="p-4 border border-slate-200 rounded-xl">
                    <span className="font-bold text-slate-900 block mb-1">Engine & Transmission</span>
                    <span className="text-slate-600">
                      Compression verified, zero oil leakage from head gasket, clutch bite point calibrated.
                    </span>
                  </div>
                  <div className="p-4 border border-slate-200 rounded-xl">
                    <span className="font-bold text-slate-900 block mb-1">Electricals & Battery</span>
                    <span className="text-slate-600">
                      Alternator charging at 14.2V, battery cold-crank capacity tested healthy.
                    </span>
                  </div>
                  <div className="p-4 border border-slate-200 rounded-xl">
                    <span className="font-bold text-slate-900 block mb-1">Air-Conditioning (AC)</span>
                    <span className="text-slate-600">
                      Vent temperature measured at 6.8°C at idle. Zero refrigerant leakage detected.
                    </span>
                  </div>
                </div>
              </div>
            )}

            {/* Tab 3: Reconditioning & Disclosures */}
            {activeTab === "repairs" && (
              <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm space-y-6">
                <div>
                  <h3 className="text-sm font-bold text-slate-900 mb-2">
                    Work Completed in BMC Workshop
                  </h3>
                  <p className="text-xs text-slate-500 mb-4">
                    Documented refurbishment performed prior to public sale clearance:
                  </p>
                  {vehicle.repairsCompleted?.length > 0 ? (
                    <ul className="space-y-2 text-xs text-slate-700">
                      {vehicle.repairsCompleted.map((r, i) => (
                        <li key={i} className="flex items-center gap-2">
                          <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                          <span>{r}</span>
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <p className="text-xs text-slate-500">
                      Routine periodic service, synthetic oil change, filter replacement, and multi-point QC.
                    </p>
                  )}
                </div>

                <div className="pt-6 border-t border-slate-100">
                  <div className="flex items-center gap-2 mb-2 text-amber-700">
                    <AlertCircle className="w-4 h-4 text-amber-600" />
                    <h3 className="text-sm font-bold">Documented Condition Disclosures</h3>
                  </div>
                  <p className="text-xs text-slate-600 mb-4">
                    In compliance with Bharat Motor Club transparency policy, we disclose all known cosmetic
                    or minor wear items:
                  </p>
                  {vehicle.knownDefects?.length > 0 ? (
                    <ul className="space-y-2 text-xs text-slate-700">
                      {vehicle.knownDefects.map((d, i) => (
                        <li key={i} className="flex items-center gap-2">
                          <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
                          <span>{d}</span>
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <p className="text-xs text-slate-500">
                      Normal minor age-related cosmetic scratches on lower front bumper; zero structural defects.
                    </p>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Right Col: Booking & Actions */}
          <div className="space-y-6">
            <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm">
              <div className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-1">
                Availability Status
              </div>
              <div className="flex items-center gap-2 mb-4">
                <span
                  className={`w-3 h-3 rounded-full ${
                    vehicle.status === "AVAILABLE" ? "bg-emerald-500" : "bg-amber-500"
                  }`}
                />
                <span className="font-bold text-slate-900 text-sm">
                  {vehicle.status === "AVAILABLE" ? "Ready for Immediate Delivery" : "Currently on Hold"}
                </span>
              </div>

              <div className="space-y-3">
                <button
                  type="button"
                  onClick={() => setIsPaymentModalOpen(true)}
                  className="w-full py-3 text-sm font-bold text-white bg-[#E05A1B] hover:bg-[#C84B12] rounded-xl transition-all shadow-md"
                >
                  Reserve Vehicle (₹10,000 Hold)
                </button>

                <button
                  type="button"
                  onClick={() => setModalAction("TEST_DRIVE")}
                  className="w-full py-3 text-sm font-bold text-slate-900 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors"
                >
                  Request a Test Drive
                </button>

                <button
                  type="button"
                  onClick={() => setModalAction("ENQUIRY")}
                  className="w-full py-3 text-xs font-semibold text-slate-600 hover:text-slate-900 border border-slate-200 rounded-xl transition-colors"
                >
                  Ask a Question / Price Breakdown
                </button>
              </div>

              <div className="mt-6 pt-4 border-t border-slate-100 text-xs text-slate-500 space-y-2">
                <div className="flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-emerald-500" />
                  <span>3-Month / 5,000 km BMC Powertrain Warranty</span>
                </div>
                <div className="flex items-center gap-2">
                  <FileCheck className="w-4 h-4 text-[#E05A1B]" />
                  <span>Official RTO Ownership Transfer Handled</span>
                </div>
              </div>
            </div>

            {/* Action Modal / Form when clicked */}
            {modalAction && (
              <div className="bg-white rounded-2xl p-6 border-2 border-[#E05A1B] shadow-xl">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="font-bold text-slate-900 text-sm">
                    {modalAction === "RESERVE"
                      ? "Reserve Vehicle"
                      : modalAction === "TEST_DRIVE"
                      ? "Book Test Drive"
                      : "Submit Vehicle Enquiry"}
                  </h3>
                  <button
                    type="button"
                    onClick={() => setModalAction(null)}
                    className="text-xs font-bold text-slate-400 hover:text-slate-700"
                  >
                    Cancel
                  </button>
                </div>

                {actionSuccess ? (
                  <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-800 text-xs">
                    {actionSuccess}
                  </div>
                ) : (
                  <form onSubmit={handleSubmitAction} className="space-y-3">
                    {actionError && (
                      <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-xs">
                        {actionError}
                      </div>
                    )}

                    <div>
                      <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                        Full Name
                      </label>
                      <input
                        type="text"
                        required
                        value={customerName}
                        onChange={(e) => setCustomerName(e.target.value)}
                        className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs"
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                        Phone Number
                      </label>
                      <input
                        type="tel"
                        required
                        value={customerPhone}
                        onChange={(e) => setCustomerPhone(e.target.value)}
                        className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs"
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                        Email Address
                      </label>
                      <input
                        type="email"
                        value={customerEmail}
                        onChange={(e) => setCustomerEmail(e.target.value)}
                        className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs"
                      />
                    </div>

                    {modalAction === "TEST_DRIVE" && (
                      <div>
                        <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                          Preferred Date
                        </label>
                        <input
                          type="date"
                          required
                          min={new Date().toISOString().split("T")[0]}
                          value={preferredDate}
                          onChange={(e) => setPreferredDate(e.target.value)}
                          className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs"
                        />
                      </div>
                    )}

                    {modalAction === "ENQUIRY" && (
                      <div>
                        <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                          Your Question
                        </label>
                        <textarea
                          rows={2}
                          value={message}
                          onChange={(e) => setMessage(e.target.value)}
                          placeholder="Questions about financing, insurance, or inspection findings..."
                          className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs"
                        />
                      </div>
                    )}

                    <button
                      type="submit"
                      disabled={submitting}
                      className="w-full py-2.5 text-xs font-bold text-white bg-[#E05A1B] hover:bg-[#C84B12] rounded-lg transition-colors mt-2"
                    >
                      {submitting ? "Processing..." : "Confirm & Submit"}
                    </button>
                  </form>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Interactive Reservation Payment Modal */}
      {vehicle && (
        <PaymentModal
          isOpen={isPaymentModalOpen}
          onClose={() => setIsPaymentModalOpen(false)}
          amount={10000}
          purpose="VEHICLE_RESERVATION"
          referenceId={vehicle.id}
          title={`Reserve ${vehicle.year} ${vehicle.make} ${vehicle.model}`}
          description="₹10,000 fully refundable 48-hour exclusive reservation hold. Deducted from final purchase invoice."
          customerName={customerName || "Vehicle Buyer"}
          customerPhone={customerPhone || "+91 99999 99999"}
          customerEmail={customerEmail}
          onSuccess={() => {
            setVehicle((prev) => (prev ? { ...prev, status: "RESERVED" } : null));
          }}
        />
      )}
    </div>
  );
}

