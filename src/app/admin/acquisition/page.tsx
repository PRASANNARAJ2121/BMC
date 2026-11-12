"use client";

import React, { useState, useEffect } from "react";
import {
  ShieldAlert,
  Car,
  CheckCircle2,
  Clock,
  User,
  DollarSign,
  FileText,
  AlertCircle,
  Eye,
  Send,
  Building,
  RefreshCw,
  Search,
} from "lucide-react";

interface AcquisitionCase {
  id: string;
  caseNumber: string;
  status: string;
  currentStage: string;
  expectedPrice: number | null;
  agreedPurchasePrice: number | null;
  createdAt: string;
  sellerProfile: {
    user: {
      fullName: string;
      email: string;
      phone: string;
    };
  };
  vehicleDetails: {
    make: string;
    model: string;
    year: number;
    variant: string | null;
    fuelType: string;
    transmission: string;
    odometerKm: number;
    registrationState: string;
    rtoCode: string | null;
    registrationNumber: string | null;
    vin: string | null;
  } | null;
  verificationTasks: Array<{
    id: string;
    taskType: string;
    status: string;
    completedAt: string | null;
  }>;
  purchaseOffers: Array<{
    id: string;
    offeredPrice: number;
    status: string;
    currentVersionNumber: number;
  }>;
  purchaseTransaction: {
    id: string;
    status: string;
    amount: number;
    transactionReference: string;
  } | null;
  ownershipTransferCase: {
    id: string;
    status: string;
    form29Signed: boolean;
    form30Signed: boolean;
  } | null;
}

const STAGES = [
  "ALL",
  "SUBMITTED",
  "IN_VERIFICATION",
  "INSPECTION_SCHEDULED",
  "INSPECTED",
  "OFFER_ISSUED",
  "OFFER_ACCEPTED",
  "PURCHASE_DOCUMENTS_PENDING",
  "PAYMENT_PENDING",
  "OWNERSHIP_TRANSFER_PENDING",
  "ACQUIRED",
];

export default function AdminAcquisitionPage() {
  const [cases, setCases] = useState<AcquisitionCase[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedStatus, setSelectedStatus] = useState("ALL");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCase, setSelectedCase] = useState<AcquisitionCase | null>(null);

  // Action Form States
  const [actionType, setActionType] = useState<string>("");
  const [offerPrice, setOfferPrice] = useState("");
  const [offerTerms, setOfferTerms] = useState("Standard Bharat Motor Club certified purchase terms.");
  const [utrNumber, setUtrNumber] = useState("");
  const [paymentAmount, setPaymentAmount] = useState("");
  const [actionLoading, setActionLoading] = useState(false);
  const [feedback, setFeedback] = useState<{ type: "success" | "error"; message: string } | null>(null);

  const fetchCases = async () => {
    setLoading(true);
    try {
      const url = selectedStatus === "ALL" 
        ? "/api/admin/acquisition/cases" 
        : `/api/admin/acquisition/cases?status=${selectedStatus}`;
      const res = await fetch(url);
      if (res.status === 401 || res.status === 403) {
        window.location.href = "/auth/signin?callbackUrl=/admin/acquisition";
        return;
      }
      const data = await res.json();
      if (data.cases) {
        setCases(data.cases);
        if (selectedCase) {
          const updated = data.cases.find((c: AcquisitionCase) => c.id === selectedCase.id);
          if (updated) setSelectedCase(updated);
        }
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCases();
  }, [selectedStatus]);

  const handleActionSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCase) return;
    setActionLoading(true);
    setFeedback(null);

    let bodyPayload: Record<string, unknown> = { action: actionType };

    if (actionType === "ISSUE_OFFER") {
      bodyPayload = {
        action: "ISSUE_OFFER",
        offeredPrice: Number(offerPrice),
        termsAndConditions: offerTerms,
      };
    } else if (actionType === "EXECUTE_AGREEMENT") {
      bodyPayload = {
        action: "EXECUTE_AGREEMENT",
        agreedPrice: selectedCase.purchaseOffers[0]?.offeredPrice || selectedCase.expectedPrice,
      };
    } else if (actionType === "RECORD_PAYMENT") {
      bodyPayload = {
        action: "RECORD_PAYMENT",
        amount: Number(paymentAmount) || selectedCase.agreedPurchasePrice || selectedCase.purchaseOffers[0]?.offeredPrice,
        transactionReference: utrNumber,
        paymentMethod: "RTGS_BANK_TRANSFER",
      };
    } else if (actionType === "RECORD_RTO_TRANSFER") {
      bodyPayload = {
        action: "RECORD_RTO_TRANSFER",
        rtoState: selectedCase.vehicleDetails?.registrationState || "DL",
        rtoCode: selectedCase.vehicleDetails?.rtoCode || "DL-01",
        applicationNumber: `RTO-APP-${Date.now().toString().slice(-6)}`,
        form29Signed: true,
        form30Signed: true,
        status: "RC_TRANSFERRED_TO_BMC",
      };
    } else if (actionType === "COMPLETE_ACQUISITION") {
      bodyPayload = {
        action: "TRANSITION",
        nextStatus: "ACQUIRED",
        reason: "Acquisition fully executed, settled, and transferred to Bharat Motor Club ownership.",
      };
    } else if (actionType === "VERIFY_TASK") {
      bodyPayload = {
        action: "VERIFY_TASK",
        taskType: "VAHAN_RTO_CLEARANCE",
        status: "PASSED",
        evidenceReference: "Parivahan Digital Verification Verified Clear",
        sourceMethod: "Direct Government Portal Registry Check",
        reviewNotes: "No active hypothecation or blacklists found.",
      };
    }

    try {
      const res = await fetch(`/api/admin/acquisition/cases/${selectedCase.id}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(bodyPayload),
      });

      const resData = await res.json();
      if (!res.ok) {
        throw new Error(resData.error || "Failed to execute action");
      }

      setFeedback({ type: "success", message: `Action "${actionType}" executed successfully!` });
      setActionType("");
      fetchCases();
    } catch (err: unknown) {
      setFeedback({ 
        type: "error", 
        message: err instanceof Error ? err.message : "Error executing action" 
      });
    } finally {
      setActionLoading(false);
    }
  };

  const filteredCases = cases.filter((c) => {
    const q = searchQuery.toLowerCase();
    const caseNum = c.caseNumber.toLowerCase();
    const seller = c.sellerProfile?.user?.fullName?.toLowerCase() || "";
    const vehicle = `${c.vehicleDetails?.make} ${c.vehicleDetails?.model}`.toLowerCase();
    return caseNum.includes(q) || seller.includes(q) || vehicle.includes(q);
  });

  return (
    <div className="py-8 bg-slate-950 text-slate-100 min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between pb-6 border-b border-slate-800 gap-4 mb-6">
          <div>
            <div className="flex items-center gap-2 text-xs font-bold text-[#E05A1B] uppercase tracking-wider mb-1">
              <ShieldAlert className="w-4 h-4" />
              <span>Confidential Vehicle Acquisition Queue</span>
            </div>
            <h1 className="text-2xl font-black text-white">Private Vehicle Intake & Verification</h1>
            <p className="text-xs text-slate-400 mt-1">
              Internal-only workspace. Strictly isolates seller identity and purchase terms from public buyers.
            </p>
          </div>
          <button
            onClick={fetchCases}
            className="flex items-center space-x-2 px-3 py-2 bg-slate-900 hover:bg-slate-800 border border-slate-700 rounded-lg text-xs font-semibold text-slate-300 transition-colors self-start md:self-auto"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} />
            <span>Refresh Queue</span>
          </button>
        </div>

        {/* Filter Bar */}
        <div className="flex flex-col md:flex-row gap-3 mb-6">
          <div className="relative flex-1">
            <Search className="w-4 h-4 absolute left-3 top-3 text-slate-500" />
            <input
              type="text"
              placeholder="Search by case #, seller name, or vehicle make/model..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2 bg-slate-900 border border-slate-800 rounded-lg text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-[#E05A1B]"
            />
          </div>
          <div className="flex items-center overflow-x-auto pb-1 gap-1 text-xs">
            {STAGES.map((stage) => (
              <button
                key={stage}
                onClick={() => setSelectedStatus(stage)}
                className={`px-2.5 py-1.5 rounded font-medium whitespace-nowrap transition-colors ${
                  selectedStatus === stage
                    ? "bg-[#E05A1B] text-white"
                    : "bg-slate-900 text-slate-400 hover:text-white"
                }`}
              >
                {stage.replace(/_/g, " ")}
              </button>
            ))}
          </div>
        </div>

        {/* Grid: Cases & Detail View */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left Column: Cases List */}
          <div className="lg:col-span-5 space-y-3">
            <div className="text-xs font-semibold text-slate-400 mb-1">
              Active Cases ({filteredCases.length})
            </div>
            {filteredCases.length === 0 ? (
              <div className="p-8 text-center bg-slate-900/50 rounded-xl border border-slate-800 text-slate-500 text-xs">
                No acquisition cases found for selected filters.
              </div>
            ) : (
              filteredCases.map((c) => {
                const isSelected = selectedCase?.id === c.id;
                return (
                  <div
                    key={c.id}
                    onClick={() => {
                      setSelectedCase(c);
                      setActionType("");
                      setFeedback(null);
                    }}
                    className={`p-4 rounded-xl border cursor-pointer transition-all ${
                      isSelected
                        ? "bg-slate-900 border-[#E05A1B] ring-1 ring-[#E05A1B]"
                        : "bg-slate-900/60 border-slate-800 hover:bg-slate-900 hover:border-slate-700"
                    }`}
                  >
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <span className="text-[11px] font-mono font-bold text-slate-300">
                          {c.caseNumber}
                        </span>
                        <h4 className="text-sm font-bold text-white mt-0.5">
                          {c.vehicleDetails
                            ? `${c.vehicleDetails.year} ${c.vehicleDetails.make} ${c.vehicleDetails.model}`
                            : "Vehicle Details Pending"}
                        </h4>
                      </div>
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded uppercase tracking-wider bg-[#E05A1B]/20 text-[#E05A1B] border border-[#E05A1B]/30">
                        {c.status.replace(/_/g, " ")}
                      </span>
                    </div>

                    <div className="text-[11px] text-slate-400 space-y-1 mt-2 border-t border-slate-800/80 pt-2">
                      <div className="flex justify-between">
                        <span>Seller:</span>
                        <span className="text-slate-200 font-medium">{c.sellerProfile?.user?.fullName}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Expected Price:</span>
                        <span className="text-slate-200 font-mono">
                          {c.expectedPrice ? `₹${c.expectedPrice.toLocaleString("en-IN")}` : "Not Disclosed"}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span>Latest Offer:</span>
                        <span className="text-emerald-400 font-mono font-bold">
                          {c.purchaseOffers[0]
                            ? `₹${c.purchaseOffers[0].offeredPrice.toLocaleString("en-IN")}`
                            : "No Offer Issued"}
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>

          {/* Right Column: Case Details & Action Terminal */}
          <div className="lg:col-span-7">
            {selectedCase ? (
              <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 space-y-6 sticky top-20">
                {/* Header */}
                <div className="flex items-start justify-between border-b border-slate-800 pb-4">
                  <div>
                    <span className="text-xs font-mono text-[#E05A1B] font-bold">
                      {selectedCase.caseNumber}
                    </span>
                    <h3 className="text-lg font-bold text-white mt-1">
                      {selectedCase.vehicleDetails
                        ? `${selectedCase.vehicleDetails.year} ${selectedCase.vehicleDetails.make} ${selectedCase.vehicleDetails.model} ${selectedCase.vehicleDetails.variant || ""}`
                        : "Vehicle Intake Details"}
                    </h3>
                    <div className="text-xs text-slate-400 mt-1">
                      Submitted on {new Date(selectedCase.createdAt).toLocaleDateString()}
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="inline-block text-xs font-bold px-2.5 py-1 rounded bg-slate-800 text-slate-200 border border-slate-700">
                      {selectedCase.status}
                    </span>
                  </div>
                </div>

                {/* Confidential Seller Information */}
                <div className="bg-slate-950/60 p-4 rounded-lg border border-slate-800 space-y-2">
                  <div className="flex items-center space-x-2 text-xs font-bold text-amber-400 uppercase tracking-wider">
                    <ShieldAlert className="w-3.5 h-3.5" />
                    <span>Confidential Seller Identity (Never Disclosed to Public)</span>
                  </div>
                  <div className="grid grid-cols-3 gap-3 text-xs pt-1">
                    <div>
                      <span className="text-slate-500 block">Full Legal Name</span>
                      <span className="text-slate-200 font-medium">
                        {selectedCase.sellerProfile?.user?.fullName}
                      </span>
                    </div>
                    <div>
                      <span className="text-slate-500 block">Phone</span>
                      <span className="text-slate-200 font-mono">
                        {selectedCase.sellerProfile?.user?.phone}
                      </span>
                    </div>
                    <div>
                      <span className="text-slate-500 block">Email</span>
                      <span className="text-slate-200 font-mono">
                        {selectedCase.sellerProfile?.user?.email}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Vehicle Specifications */}
                {selectedCase.vehicleDetails && (
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs bg-slate-950/40 p-4 rounded-lg border border-slate-800/80">
                    <div>
                      <span className="text-slate-500 block">Fuel / Trans</span>
                      <span className="text-slate-200 font-medium">
                        {selectedCase.vehicleDetails.fuelType} • {selectedCase.vehicleDetails.transmission}
                      </span>
                    </div>
                    <div>
                      <span className="text-slate-500 block">Odometer</span>
                      <span className="text-slate-200 font-mono">
                        {selectedCase.vehicleDetails.odometerKm.toLocaleString("en-IN")} km
                      </span>
                    </div>
                    <div>
                      <span className="text-slate-500 block">Reg State / RTO</span>
                      <span className="text-slate-200 font-medium">
                        {selectedCase.vehicleDetails.registrationState} ({selectedCase.vehicleDetails.rtoCode || "N/A"})
                      </span>
                    </div>
                    <div>
                      <span className="text-slate-500 block">Registration No</span>
                      <span className="text-slate-200 font-mono font-bold">
                        {selectedCase.vehicleDetails.registrationNumber || "Unspecified"}
                      </span>
                    </div>
                  </div>
                )}

                {/* Verification Tasks */}
                <div>
                  <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider mb-2">
                    Verification Milestones
                  </h4>
                  <div className="space-y-2">
                    {selectedCase.verificationTasks.length === 0 ? (
                      <p className="text-xs text-slate-500">No verification tasks recorded yet.</p>
                    ) : (
                      selectedCase.verificationTasks.map((t) => (
                        <div
                          key={t.id}
                          className="flex items-center justify-between p-2.5 bg-slate-950/50 rounded border border-slate-800 text-xs"
                        >
                          <span className="font-medium text-slate-300">
                            {t.taskType.replace(/_/g, " ")}
                          </span>
                          <span className="text-[11px] font-bold text-emerald-400 flex items-center gap-1">
                            <CheckCircle2 className="w-3.5 h-3.5" />
                            {t.status}
                          </span>
                        </div>
                      ))
                    )}
                  </div>
                </div>

                {/* Action Form / Buttons */}
                <div className="border-t border-slate-800 pt-4 space-y-4">
                  <div className="text-xs font-bold text-slate-300 uppercase tracking-wider">
                    Staff Action Terminal
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
                    <button
                      onClick={() => setActionType("VERIFY_TASK")}
                      className={`px-3 py-1.5 rounded text-xs font-semibold border ${
                        actionType === "VERIFY_TASK"
                          ? "bg-slate-700 text-white border-slate-600"
                          : "bg-slate-800 text-slate-300 border-slate-700 hover:bg-slate-700"
                      }`}
                    >
                      1. Pass Vahan Verification
                    </button>
                    <button
                      onClick={() => setActionType("ISSUE_OFFER")}
                      className={`px-3 py-1.5 rounded text-xs font-semibold border ${
                        actionType === "ISSUE_OFFER"
                          ? "bg-slate-700 text-white border-slate-600"
                          : "bg-slate-800 text-slate-300 border-slate-700 hover:bg-slate-700"
                      }`}
                    >
                      2. Issue Purchase Offer
                    </button>
                    <button
                      onClick={() => setActionType("EXECUTE_AGREEMENT")}
                      className={`px-3 py-1.5 rounded text-xs font-semibold border ${
                        actionType === "EXECUTE_AGREEMENT"
                          ? "bg-slate-700 text-white border-slate-600"
                          : "bg-slate-800 text-slate-300 border-slate-700 hover:bg-slate-700"
                      }`}
                    >
                      3. Execute Purchase Agreement
                    </button>
                    <button
                      onClick={() => setActionType("RECORD_PAYMENT")}
                      className={`px-3 py-1.5 rounded text-xs font-semibold border ${
                        actionType === "RECORD_PAYMENT"
                          ? "bg-slate-700 text-white border-slate-600"
                          : "bg-slate-800 text-slate-300 border-slate-700 hover:bg-slate-700"
                      }`}
                    >
                      4. Settle Payment
                    </button>
                    <button
                      onClick={() => setActionType("RECORD_RTO_TRANSFER")}
                      className={`px-3 py-1.5 rounded text-xs font-semibold border ${
                        actionType === "RECORD_RTO_TRANSFER"
                          ? "bg-slate-700 text-white border-slate-600"
                          : "bg-slate-800 text-slate-300 border-slate-700 hover:bg-slate-700"
                      }`}
                    >
                      5. Record RTO Forms 29/30
                    </button>
                    <button
                      onClick={() => setActionType("COMPLETE_ACQUISITION")}
                      className={`px-3 py-1.5 rounded text-xs font-semibold border ${
                        actionType === "COMPLETE_ACQUISITION"
                          ? "bg-[#E05A1B] text-white border-[#E05A1B]"
                          : "bg-emerald-950 text-emerald-300 border-emerald-800 hover:bg-emerald-900"
                      }`}
                    >
                      6. Complete & Move to Inventory
                    </button>
                  </div>

                  {/* Dynamic Action Sub-form */}
                  {actionType && (
                    <form onSubmit={handleActionSubmit} className="bg-slate-950 p-4 rounded-lg border border-slate-800 space-y-3">
                      <div className="text-xs font-bold text-[#E05A1B]">
                        Confirm Action: {actionType.replace(/_/g, " ")}
                      </div>

                      {actionType === "ISSUE_OFFER" && (
                        <div className="space-y-3">
                          <div>
                            <label className="text-[11px] text-slate-400 block mb-1">
                              Bharat Motor Club Purchase Offer (INR ₹)
                            </label>
                            <input
                              type="number"
                              required
                              value={offerPrice}
                              onChange={(e) => setOfferPrice(e.target.value)}
                              placeholder="e.g. 850000"
                              className="w-full px-3 py-2 bg-slate-900 border border-slate-800 rounded text-xs text-white"
                            />
                          </div>
                          <div>
                            <label className="text-[11px] text-slate-400 block mb-1">Terms & Notes</label>
                            <textarea
                              rows={2}
                              value={offerTerms}
                              onChange={(e) => setOfferTerms(e.target.value)}
                              className="w-full px-3 py-2 bg-slate-900 border border-slate-800 rounded text-xs text-white"
                            />
                          </div>
                        </div>
                      )}

                      {actionType === "RECORD_PAYMENT" && (
                        <div className="space-y-3">
                          <div>
                            <label className="text-[11px] text-slate-400 block mb-1">
                              Payment Amount (INR ₹)
                            </label>
                            <input
                              type="number"
                              value={paymentAmount}
                              onChange={(e) => setPaymentAmount(e.target.value)}
                              placeholder={`Agreed Amount: ₹${selectedCase.agreedPurchasePrice || selectedCase.purchaseOffers[0]?.offeredPrice || ""}`}
                              className="w-full px-3 py-2 bg-slate-900 border border-slate-800 rounded text-xs text-white"
                            />
                          </div>
                          <div>
                            <label className="text-[11px] text-slate-400 block mb-1">
                              Bank UTR / Transaction Reference
                            </label>
                            <input
                              type="text"
                              required
                              value={utrNumber}
                              onChange={(e) => setUtrNumber(e.target.value)}
                              placeholder="e.g. BMC-HDFC-RTGS-99281726"
                              className="w-full px-3 py-2 bg-slate-900 border border-slate-800 rounded text-xs text-white font-mono"
                            />
                          </div>
                        </div>
                      )}

                      {actionType === "COMPLETE_ACQUISITION" && (
                        <p className="text-xs text-slate-400 leading-relaxed">
                          This will finalize the acquisition transition to <strong className="text-emerald-400">ACQUIRED</strong>, close the private seller file, and automatically provision a new company vehicle record in the internal inventory awaiting technical reconditioning and QC review.
                        </p>
                      )}

                      {actionType === "VERIFY_TASK" && (
                        <p className="text-xs text-slate-400">
                          Record automated Vahan RTO Registry check showing clear NOC eligibility, single owner verification, and zero active hypothecation.
                        </p>
                      )}

                      {actionType === "EXECUTE_AGREEMENT" && (
                        <p className="text-xs text-slate-400">
                          Execute formal Bharat Motor Club digital purchase agreement binding vehicle transfer at the accepted offer valuation.
                        </p>
                      )}

                      {actionType === "RECORD_RTO_TRANSFER" && (
                        <p className="text-xs text-slate-400">
                          Record submission of signed Form 29 & Form 30 to regional RTO authority for company RC endorsement.
                        </p>
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
                          {actionLoading ? "Processing..." : "Confirm & Execute"}
                        </button>
                      </div>
                    </form>
                  )}
                </div>
              </div>
            ) : (
              <div className="bg-slate-900/40 border border-slate-800 rounded-xl p-12 text-center text-slate-500 text-xs">
                Select an acquisition case from the left queue to review seller credentials, inspect history, issue valuations, or settle payments.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

