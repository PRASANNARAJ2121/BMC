"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  Car,
  ShieldCheck,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  RefreshCw,
  Search,
  ExternalLink,
  DollarSign,
  Wrench,
  AlertCircle,
  Tag,
  Check,
} from "lucide-react";

interface CompanyVehicle {
  id: string;
  stockNumber: string;
  vin: string;
  registrationNumber: string | null;
  make: string;
  model: string;
  year: number;
  variant: string | null;
  fuelType: string;
  transmission: string;
  odometerKm: number;
  ownershipCount: number;
  purchasePrice: number;
  totalReconditioningCost: number;
  totalCostBasis: number;
  legalSaleEligibilityApproved: boolean;
  legalSaleApprovedAt: string | null;
  qcApproved: boolean;
  qcApprovedAt: string | null;
  status: string;
  publicListing: {
    id: string;
    listingCode: string;
    askingPrice: number;
    status: string;
  } | null;
  qcChecks: Array<{
    id: string;
    passed: boolean;
    notes: string;
    inspectedAt: string;
  }>;
  refurbishmentJobs: Array<{
    id: string;
    jobNumber: string;
    totalLabourCost: number;
    totalPartsCost: number;
    status: string;
  }>;
}

const VEHICLE_STATUSES = [
  "ALL",
  "ACQUIRED",
  "IN_REFURBISHMENT",
  "REFURBISHMENT_COMPLETED",
  "QC_PENDING",
  "APPROVED_FOR_RESALE",
  "LISTED_FOR_RESALE",
  "RESERVED",
  "SOLD",
];

export default function AdminVehiclesPage() {
  const [vehicles, setVehicles] = useState<CompanyVehicle[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedStatus, setSelectedStatus] = useState("ALL");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedVehicle, setSelectedVehicle] = useState<CompanyVehicle | null>(null);

  // Action Form States
  const [actionType, setActionType] = useState<string>("");
  const [askingPrice, setAskingPrice] = useState("");
  const [bodyType, setBodyType] = useState("Sedan");
  const [inspectionSummary, setInspectionSummary] = useState(
    "120-Point Bharat Motor Club Master Technical Assessment completed. Certified engine compression, OBD-II scan clear, suspension and braking systems verified."
  );
  const [repairsCompleted, setRepairsCompleted] = useState(
    "Full synthetic fluid replacement, brake rotor resurfacing, cabin AC deep decontamination, interior detailing."
  );
  const [knownDefects, setKnownDefects] = useState(
    "Minor cosmetic gravel chips on rear bumper. Completely free of structural or flood damage."
  );
  const [qcNotes, setQcNotes] = useState("All 120 inspection check points verified within factory tolerances.");
  const [actionLoading, setActionLoading] = useState(false);
  const [feedback, setFeedback] = useState<{ type: "success" | "error"; message: string } | null>(null);

  const fetchVehicles = async () => {
    setLoading(true);
    try {
      const url =
        selectedStatus === "ALL"
          ? "/api/admin/vehicles"
          : `/api/admin/vehicles?status=${selectedStatus}`;
      const res = await fetch(url);
      if (res.status === 401 || res.status === 403) {
        window.location.href = "/auth/signin?callbackUrl=/admin/vehicles";
        return;
      }
      const data = await res.json();
      if (data.vehicles) {
        setVehicles(data.vehicles);
        if (selectedVehicle) {
          const updated = data.vehicles.find((v: CompanyVehicle) => v.id === selectedVehicle.id);
          if (updated) setSelectedVehicle(updated);
        }
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchVehicles();
  }, [selectedStatus]);

  const handleAction = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedVehicle) return;
    setActionLoading(true);
    setFeedback(null);

    let payload: Record<string, unknown> = { action: actionType };

    if (actionType === "APPROVE_LEGAL_ELIGIBILITY") {
      payload = { action: "APPROVE_LEGAL_ELIGIBILITY" };
    } else if (actionType === "RECORD_QC") {
      payload = {
        action: "RECORD_QC",
        passed: true,
        notes: qcNotes,
        checklist: {
          engineCompression: "PASS",
          transmissionEngagement: "PASS",
          chassisStructuralIntegrity: "PASS",
          obdScanNoDtc: "PASS",
          airbagsAndAbs: "PASS",
          airConditioningDelta: "PASS",
          brakePadWear: "PASS",
          electricalSystem: "PASS",
        },
      };
    } else if (actionType === "PUBLISH_RESALE") {
      payload = {
        action: "PUBLISH_RESALE",
        askingPrice: Number(askingPrice),
        bodyType,
        inspectionSummary,
        repairsCompleted,
        knownDefects,
        ownershipCount: selectedVehicle.ownershipCount || 1,
        isFeatured: true,
        keyFeatures: [
          "Certified Pre-Owned by Bharat Motor Club",
          "120-Point Multi-Stage Inspection",
          "6-Month Powertrain Warranty Included",
          "Complete Verified Service History",
          "100% Non-Accidental Guarantee",
        ],
        specifications: {
          engine: "1.5L Inline-4 DOHC",
          power: "115 PS",
          mileage: "18.5 km/l",
          fuelType: selectedVehicle.fuelType,
          transmission: selectedVehicle.transmission,
        },
      };
    }

    try {
      const res = await fetch(`/api/admin/vehicles/${selectedVehicle.id}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to execute action");
      }

      setFeedback({ type: "success", message: `Action "${actionType}" executed successfully!` });
      setActionType("");
      fetchVehicles();
    } catch (err: unknown) {
      setFeedback({
        type: "error",
        message: err instanceof Error ? err.message : "Error executing action",
      });
    } finally {
      setActionLoading(false);
    }
  };

  const filteredVehicles = vehicles.filter((v) => {
    const q = searchQuery.toLowerCase();
    const stock = v.stockNumber.toLowerCase();
    const name = `${v.year} ${v.make} ${v.model}`.toLowerCase();
    const reg = (v.registrationNumber || "").toLowerCase();
    return stock.includes(q) || name.includes(q) || reg.includes(q);
  });

  return (
    <div className="py-8 bg-slate-950 text-slate-100 min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between pb-6 border-b border-slate-800 gap-4 mb-6">
          <div>
            <div className="flex items-center gap-2 text-xs font-bold text-[#E05A1B] uppercase tracking-wider mb-1">
              <Car className="w-4 h-4" />
              <span>Company Inventory & Pre-Sale Governance</span>
            </div>
            <h1 className="text-2xl font-black text-white">Certified Vehicle Stock & Resale Gates</h1>
            <p className="text-xs text-slate-400 mt-1">
              Strictly enforces dual-gate policy (Legal Title Clearance + 120-Point QC Pass) before any vehicle can enter public resale.
            </p>
          </div>
          <button
            onClick={fetchVehicles}
            className="flex items-center space-x-2 px-3 py-2 bg-slate-900 hover:bg-slate-800 border border-slate-700 rounded-lg text-xs font-semibold text-slate-300 transition-colors self-start md:self-auto"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} />
            <span>Refresh Stock</span>
          </button>
        </div>

        {/* Filter Bar */}
        <div className="flex flex-col md:flex-row gap-3 mb-6">
          <div className="relative flex-1">
            <Search className="w-4 h-4 absolute left-3 top-3 text-slate-500" />
            <input
              type="text"
              placeholder="Search by stock #, make, model, or reg number..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2 bg-slate-900 border border-slate-800 rounded-lg text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-[#E05A1B]"
            />
          </div>
          <div className="flex items-center overflow-x-auto pb-1 gap-1 text-xs">
            {VEHICLE_STATUSES.map((status) => (
              <button
                key={status}
                onClick={() => setSelectedStatus(status)}
                className={`px-2.5 py-1.5 rounded font-medium whitespace-nowrap transition-colors ${
                  selectedStatus === status
                    ? "bg-[#E05A1B] text-white"
                    : "bg-slate-900 text-slate-400 hover:text-white"
                }`}
              >
                {status.replace(/_/g, " ")}
              </button>
            ))}
          </div>
        </div>

        {/* Grid: Stock List & Governance Terminal */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left Column: Vehicles List */}
          <div className="lg:col-span-5 space-y-3">
            <div className="text-xs font-semibold text-slate-400 mb-1">
              Company Inventory ({filteredVehicles.length})
            </div>
            {filteredVehicles.length === 0 ? (
              <div className="p-8 text-center bg-slate-900/50 rounded-xl border border-slate-800 text-slate-500 text-xs">
                No vehicles found matching current filter.
              </div>
            ) : (
              filteredVehicles.map((v) => {
                const isSelected = selectedVehicle?.id === v.id;
                return (
                  <div
                    key={v.id}
                    onClick={() => {
                      setSelectedVehicle(v);
                      setActionType("");
                      setFeedback(null);
                      setAskingPrice(
                        v.publicListing?.askingPrice
                          ? String(v.publicListing.askingPrice)
                          : String(Math.round(v.totalCostBasis * 1.15))
                      );
                    }}
                    className={`p-4 rounded-xl border cursor-pointer transition-all ${
                      isSelected
                        ? "bg-slate-900 border-[#E05A1B] ring-1 ring-[#E05A1B]"
                        : "bg-slate-900/60 border-slate-800 hover:bg-slate-900 hover:border-slate-700"
                    }`}
                  >
                    <div className="flex items-start justify-between mb-1.5">
                      <div>
                        <span className="text-[11px] font-mono font-bold text-slate-300">
                          {v.stockNumber}
                        </span>
                        <h4 className="text-sm font-bold text-white">
                          {v.year} {v.make} {v.model}
                        </h4>
                      </div>
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded uppercase tracking-wider bg-slate-800 text-slate-300 border border-slate-700">
                        {v.status.replace(/_/g, " ")}
                      </span>
                    </div>

                    {/* Pre-sale Gate Badges */}
                    <div className="flex items-center gap-2 my-2 text-[10px]">
                      <span
                        className={`flex items-center gap-1 px-2 py-0.5 rounded font-bold ${
                          v.legalSaleEligibilityApproved
                            ? "bg-emerald-950 text-emerald-300 border border-emerald-800"
                            : "bg-amber-950/60 text-amber-300 border border-amber-800"
                        }`}
                      >
                        {v.legalSaleEligibilityApproved ? <Check className="w-3 h-3" /> : <AlertTriangle className="w-3 h-3" />}
                        Legal Gate: {v.legalSaleEligibilityApproved ? "Approved" : "Pending"}
                      </span>
                      <span
                        className={`flex items-center gap-1 px-2 py-0.5 rounded font-bold ${
                          v.qcApproved
                            ? "bg-emerald-950 text-emerald-300 border border-emerald-800"
                            : "bg-amber-950/60 text-amber-300 border border-amber-800"
                        }`}
                      >
                        {v.qcApproved ? <Check className="w-3 h-3" /> : <AlertTriangle className="w-3 h-3" />}
                        QC Gate: {v.qcApproved ? "Passed" : "Pending"}
                      </span>
                    </div>

                    <div className="text-[11px] text-slate-400 space-y-1 mt-2 border-t border-slate-800/80 pt-2">
                      <div className="flex justify-between">
                        <span>Total Cost Basis:</span>
                        <span className="text-slate-200 font-mono font-semibold">
                          ₹{v.totalCostBasis.toLocaleString("en-IN")}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span>Public Resale Listing:</span>
                        <span
                          className={`font-semibold ${
                            v.publicListing
                              ? "text-emerald-400"
                              : "text-slate-500 italic"
                          }`}
                        >
                          {v.publicListing ? `Active (₹${v.publicListing.askingPrice.toLocaleString("en-IN")})` : "Unpublished"}
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>

          {/* Right Column: Governance Details & Publication Terminal */}
          <div className="lg:col-span-7">
            {selectedVehicle ? (
              <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 space-y-6 sticky top-20">
                {/* Header */}
                <div className="flex items-start justify-between border-b border-slate-800 pb-4">
                  <div>
                    <span className="text-xs font-mono text-[#E05A1B] font-bold">
                      {selectedVehicle.stockNumber}
                    </span>
                    <h3 className="text-lg font-bold text-white mt-1">
                      {selectedVehicle.year} {selectedVehicle.make} {selectedVehicle.model} {selectedVehicle.variant || ""}
                    </h3>
                    <div className="text-xs text-slate-400 mt-1">
                      VIN: <span className="font-mono text-slate-300">{selectedVehicle.vin}</span> • {selectedVehicle.odometerKm.toLocaleString("en-IN")} km
                    </div>
                  </div>
                  {selectedVehicle.publicListing && (
                    <Link
                      href={`/automobiles/${selectedVehicle.publicListing.id}`}
                      target="_blank"
                      className="flex items-center space-x-1.5 px-3 py-1.5 bg-[#E05A1B] hover:bg-[#C84B12] text-white rounded-lg text-xs font-bold transition-colors"
                    >
                      <span>View Public Catalogue</span>
                      <ExternalLink className="w-3.5 h-3.5" />
                    </Link>
                  )}
                </div>

                {/* Financial Ledger Basis */}
                <div className="bg-slate-950/60 p-4 rounded-lg border border-slate-800">
                  <div className="text-xs font-bold text-slate-300 uppercase tracking-wider mb-2">
                    Company Cost Basis Ledger
                  </div>
                  <div className="grid grid-cols-3 gap-3 text-xs">
                    <div>
                      <span className="text-slate-500 block">Acquisition Basis</span>
                      <span className="text-slate-200 font-mono font-bold">
                        ₹{selectedVehicle.purchasePrice.toLocaleString("en-IN")}
                      </span>
                    </div>
                    <div>
                      <span className="text-slate-500 block">Reconditioning Invested</span>
                      <span className="text-slate-200 font-mono font-bold">
                        ₹{selectedVehicle.totalReconditioningCost.toLocaleString("en-IN")}
                      </span>
                    </div>
                    <div>
                      <span className="text-slate-500 block">Total Cost Basis</span>
                      <span className="text-[#E05A1B] font-mono font-bold">
                        ₹{selectedVehicle.totalCostBasis.toLocaleString("en-IN")}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Resale Prerequisite Gates */}
                <div className="space-y-3">
                  <div className="text-xs font-bold text-slate-300 uppercase tracking-wider">
                    Resale Publication Prerequisite Gates
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div
                      className={`p-3 rounded-lg border ${
                        selectedVehicle.legalSaleEligibilityApproved
                          ? "bg-emerald-950/30 border-emerald-800 text-emerald-300"
                          : "bg-amber-950/30 border-amber-800 text-amber-300"
                      }`}
                    >
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-xs font-bold">Gate 1: Legal Title Clearance</span>
                        {selectedVehicle.legalSaleEligibilityApproved ? (
                          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                        ) : (
                          <AlertTriangle className="w-4 h-4 text-amber-400" />
                        )}
                      </div>
                      <p className="text-[11px] text-slate-400 leading-snug">
                        {selectedVehicle.legalSaleEligibilityApproved
                          ? `Signed off on ${new Date(selectedVehicle.legalSaleApprovedAt!).toLocaleDateString()}. Zero encumbrance.`
                          : "Requires Compliance Officer approval before publication."}
                      </p>
                    </div>

                    <div
                      className={`p-3 rounded-lg border ${
                        selectedVehicle.qcApproved
                          ? "bg-emerald-950/30 border-emerald-800 text-emerald-300"
                          : "bg-amber-950/30 border-amber-800 text-amber-300"
                      }`}
                    >
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-xs font-bold">Gate 2: 120-Point QC Pass</span>
                        {selectedVehicle.qcApproved ? (
                          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                        ) : (
                          <AlertTriangle className="w-4 h-4 text-amber-400" />
                        )}
                      </div>
                      <p className="text-[11px] text-slate-400 leading-snug">
                        {selectedVehicle.qcApproved
                          ? `Certified on ${new Date(selectedVehicle.qcApprovedAt!).toLocaleDateString()}. All tests passed.`
                          : "Requires workshop QC sign-off before publication."}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Staff Actions */}
                <div className="border-t border-slate-800 pt-4 space-y-4">
                  <div className="text-xs font-bold text-slate-300 uppercase tracking-wider">
                    Inventory Actions
                  </div>

                  {feedback && (
                    <div
                      className={`p-3 rounded-lg text-xs flex items-center gap-2 ${
                        feedback.type === "success"
                          ? "bg-emerald-950/60 border border-emerald-800 text-emerald-300"
                          : "bg-rose-950/60 border border-rose-800 text-rose-300"
                      }`}
                    >
                      <AlertCircle className="w-4 h-4 flex-shrink-0" />
                      <span>{feedback.message}</span>
                    </div>
                  )}

                  <div className="flex flex-wrap gap-2">
                    {!selectedVehicle.legalSaleEligibilityApproved && (
                      <button
                        onClick={() => setActionType("APPROVE_LEGAL_ELIGIBILITY")}
                        className="px-3 py-1.5 rounded text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700"
                      >
                        Sign Off Legal Clearance
                      </button>
                    )}
                    {!selectedVehicle.qcApproved && (
                      <button
                        onClick={() => setActionType("RECORD_QC")}
                        className="px-3 py-1.5 rounded text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700"
                      >
                        Record 120-Point QC Pass
                      </button>
                    )}
                    <button
                      onClick={() => setActionType("PUBLISH_RESALE")}
                      disabled={!selectedVehicle.legalSaleEligibilityApproved || !selectedVehicle.qcApproved}
                      className="px-3.5 py-1.5 rounded text-xs font-bold bg-[#E05A1B] hover:bg-[#C84B12] disabled:opacity-40 disabled:cursor-not-allowed text-white transition-colors"
                    >
                      {selectedVehicle.publicListing ? "Update Public Resale Listing" : "Publish to Resale Store"}
                    </button>
                  </div>

                  {/* Dynamic Action Forms */}
                  {actionType && (
                    <form onSubmit={handleAction} className="bg-slate-950 p-4 rounded-lg border border-slate-800 space-y-3">
                      <div className="text-xs font-bold text-[#E05A1B]">
                        Action: {actionType.replace(/_/g, " ")}
                      </div>

                      {actionType === "APPROVE_LEGAL_ELIGIBILITY" && (
                        <p className="text-xs text-slate-400">
                          Confirm that vehicle ownership has been verified clear of criminal blacklists, unpaid RTO challans, bank hypothecations, and is officially held under Bharat Motor Club title.
                        </p>
                      )}

                      {actionType === "RECORD_QC" && (
                        <div className="space-y-3">
                          <p className="text-xs text-slate-400">
                            Certify that all mechanical systems, electrical harnesses, ECU error logs, and AC delta temperatures have been inspected and meet Bharat Motor Club certified quality standards.
                          </p>
                          <div>
                            <label className="text-[11px] text-slate-400 block mb-1">QC Verification Notes</label>
                            <input
                              type="text"
                              required
                              value={qcNotes}
                              onChange={(e) => setQcNotes(e.target.value)}
                              className="w-full px-3 py-2 bg-slate-900 border border-slate-800 rounded text-xs text-white"
                            />
                          </div>
                        </div>
                      )}

                      {actionType === "PUBLISH_RESALE" && (
                        <div className="space-y-3">
                          <div className="grid grid-cols-2 gap-3">
                            <div>
                              <label className="text-[11px] text-slate-400 block mb-1">
                                Public Asking Price (INR ₹)
                              </label>
                              <input
                                type="number"
                                required
                                value={askingPrice}
                                onChange={(e) => setAskingPrice(e.target.value)}
                                placeholder="e.g. 950000"
                                className="w-full px-3 py-2 bg-slate-900 border border-slate-800 rounded text-xs text-white"
                              />
                            </div>
                            <div>
                              <label className="text-[11px] text-slate-400 block mb-1">Body Type</label>
                              <select
                                value={bodyType}
                                onChange={(e) => setBodyType(e.target.value)}
                                className="w-full px-3 py-2 bg-slate-900 border border-slate-800 rounded text-xs text-white"
                              >
                                <option value="Sedan">Sedan</option>
                                <option value="SUV">SUV</option>
                                <option value="Hatchback">Hatchback</option>
                                <option value="MUV">MUV</option>
                                <option value="Coupe">Coupe</option>
                              </select>
                            </div>
                          </div>

                          <div>
                            <label className="text-[11px] text-slate-400 block mb-1">
                              Mandatory Known Defects Disclosure (Non-Negotiable Transparency)
                            </label>
                            <textarea
                              rows={2}
                              required
                              value={knownDefects}
                              onChange={(e) => setKnownDefects(e.target.value)}
                              className="w-full px-3 py-2 bg-slate-900 border border-slate-800 rounded text-xs text-white"
                            />
                          </div>

                          <div>
                            <label className="text-[11px] text-slate-400 block mb-1">
                              Refurbishment & Repairs Completed
                            </label>
                            <textarea
                              rows={2}
                              required
                              value={repairsCompleted}
                              onChange={(e) => setRepairsCompleted(e.target.value)}
                              className="w-full px-3 py-2 bg-slate-900 border border-slate-800 rounded text-xs text-white"
                            />
                          </div>
                        </div>
                      )}

                      <div className="flex justify-end gap-2 pt-2">
                        <button
                          type="button"
                          onClick={() => setActionType("")}
                          className="px-3 py-1.5 rounded text-xs text-slate-400 hover:text-white"
                        >
                          Cancel
                        </button>
                        <button
                          type="submit"
                          disabled={actionLoading}
                          className="px-4 py-1.5 bg-[#E05A1B] hover:bg-[#C84B12] disabled:opacity-50 text-white rounded text-xs font-bold transition-colors"
                        >
                          {actionLoading ? "Executing..." : "Confirm & Save"}
                        </button>
                      </div>
                    </form>
                  )}
                </div>
              </div>
            ) : (
              <div className="bg-slate-900/40 border border-slate-800 rounded-xl p-12 text-center text-slate-500 text-xs">
                Select a vehicle from the left inventory list to review legal clearance status, sign off QC inspections, or configure resale pricing.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

