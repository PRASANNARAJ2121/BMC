"use client";

import React, { useState, useEffect } from "react";
import {
  ShieldCheck,
  Car,
  Camera,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  FileText,
  Upload,
  ArrowRight,
  ArrowLeft,
  RefreshCw,
  Sparkles,
  Send,
  AlertCircle,
  Check,
  PenTool,
} from "lucide-react";
import SignaturePad from "@/components/common/SignaturePad";

interface CaseItem {
  id: string;
  caseNumber: string;
  status: string;
  vehicleDetails: {
    make: string;
    model: string;
    year: number;
    fuelType: string;
    transmission: string;
    odometerKm: number;
    registrationNumber: string | null;
  } | null;
  sellerProfile: {
    user: {
      fullName: string;
      phone: string;
    };
  };
}

const CHECKLIST_SECTIONS = [
  {
    key: "EXTERIOR_STRUCTURE",
    title: "1. Chassis & Structural Integrity (20 Pts)",
    items: [
      { id: "apron_welding", label: "Apron & Strut Tower Factory Spot Welds", max: 5 },
      { id: "a_b_c_pillars", label: "A, B & C Pillars Free of Rework or Cut", max: 5 },
      { id: "underbody_rust", label: "Underbody Floor Pan & Running Board Rust-Free", max: 5 },
      { id: "panel_alignment", label: "Body Panel Gaps & Non-Accidental Alignment", max: 5 },
    ],
  },
  {
    key: "ENGINE_COOLING",
    title: "2. Engine & Powertrain (20 Pts)",
    items: [
      { id: "engine_oil", label: "Engine Oil Level, Viscosity & Zero Sludge", max: 5 },
      { id: "blow_by", label: "Engine Blow-by & Dipstick Vapor Test Passed", max: 5 },
      { id: "coolant_system", label: "Coolant Level, Radiator & Hose Leak-Free", max: 5 },
      { id: "engine_sound", label: "Tappet, Idling & Valve Train Acoustic Check", max: 5 },
    ],
  },
  {
    key: "TRANSMISSION_CLUTCH",
    title: "3. Transmission & Drivetrain (20 Pts)",
    items: [
      { id: "clutch_bite", label: "Clutch Pedal Bite Point & Zero Slippage", max: 5 },
      { id: "gear_shift", label: "Smooth Gear Shift Across All Forward & Reverse", max: 5 },
      { id: "cv_joints", label: "Drive Axle Boots & CV Joints Grease-Free", max: 5 },
      { id: "transmission_leak", label: "Gearbox Case & Seals Zero Oil Leakage", max: 5 },
    ],
  },
  {
    key: "SUSPENSION_STEERING",
    title: "4. Steering, Suspension & Brakes (20 Pts)",
    items: [
      { id: "shock_absorbers", label: "Front/Rear Struts Zero Leak & Clean Rebound", max: 5 },
      { id: "steering_rack", label: "Steering Play, Ball Joints & Tie Rods Firm", max: 5 },
      { id: "brake_pads", label: "Brake Pads > 5mm Thickness & Smooth Rotors", max: 5 },
      { id: "tyre_tread", label: "All 4 Tyres + Spare > 4mm Tread & Even Wear", max: 5 },
    ],
  },
  {
    key: "ELECTRICAL_WIRING",
    title: "5. Electricals & ECU Diagnostics (20 Pts)",
    items: [
      { id: "obd_scan", label: "OBD-II Diagnostic Scan Zero Stored DTC Errors", max: 5 },
      { id: "alternator_battery", label: "Battery Cranking Health & 14.2V Alternator Output", max: 5 },
      { id: "lighting_signals", label: "Headlamps, Indicators, Horn & Power Windows", max: 5 },
      { id: "airbag_abs", label: "Instrument Cluster Airbag & ABS Tell-Tale Lights", max: 5 },
    ],
  },
  {
    key: "AC_VENTILATION",
    title: "6. Air-Conditioning & Cabin Comfort (20 Pts)",
    items: [
      { id: "ac_cooling_delta", label: "Cabin Vent Temperature Delta (< 8°C Cooling)", max: 5 },
      { id: "compressor_clutch", label: "AC Compressor Magnetic Clutch Smooth Engage", max: 5 },
      { id: "blower_heater", label: "Multi-Speed Blower & Climate Control Defroster", max: 5 },
      { id: "interior_condition", label: "Seat Upholstery, Dashboard & Zero Flood Smell", max: 5 },
    ],
  },
];

export default function MobileInspectorPage() {
  const [cases, setCases] = useState<CaseItem[]>([]);
  const [selectedCase, setSelectedCase] = useState<CaseItem | null>(null);
  const [loadingCases, setLoadingCases] = useState(true);
  const [activeStep, setActiveStep] = useState(1);

  // Inspection Score Matrix
  const [itemScores, setItemScores] = useState<Record<string, number>>(() => {
    const initial: Record<string, number> = {};
    CHECKLIST_SECTIONS.forEach((sec) => {
      sec.items.forEach((item) => {
        initial[item.id] = 5; // Default full score
      });
    });
    return initial;
  });

  // Repair estimates & observations
  const [repairEstimate, setRepairEstimate] = useState("12000");
  const [summaryNotes, setSummaryNotes] = useState("120-Point Doorstep Assessment Completed. Non-accidental certified.");
  const [defectNotes, setDefectNotes] = useState("Minor cosmetic wear on rear bumper. Front brake pads at 40% life.");
  const [signatureData, setSignatureData] = useState<string | null>(null);

  // Photo uploads
  const [photoKeys, setPhotoKeys] = useState<string[]>([]);
  const [uploadingPhoto, setUploadingPhoto] = useState(false);

  // Submission state
  const [submitting, setSubmitting] = useState(false);
  const [completedReportNumber, setCompletedReportNumber] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Fetch queue of cases
  useEffect(() => {
    fetch("/api/admin/acquisition/cases")
      .then((res) => {
        if (res.status === 401 || res.status === 403) {
          window.location.href = "/auth/signin?callbackUrl=/inspector";
          return null;
        }
        return res.json();
      })
      .then((data) => {
        if (data?.cases) {
          setCases(data.cases);
          if (data.cases.length > 0) {
            setSelectedCase(data.cases[0]);
          }
        }
        setLoadingCases(false);
      })
      .catch((err) => {
        console.error(err);
        setLoadingCases(false);
      });
  }, []);

  // Compute live overall score out of 120
  const overallScore = Object.values(itemScores).reduce((acc, curr) => acc + curr, 0);

  const handleScoreChange = (itemId: string, val: number) => {
    setItemScores((prev) => ({ ...prev, [itemId]: val }));
  };

  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !selectedCase) return;

    setUploadingPhoto(true);
    const formData = new FormData();
    formData.append("file", file);
    formData.append("caseId", selectedCase.id);
    formData.append("documentType", "INSPECTION_PHOTO");
    formData.append("isPrivate", "false"); // inspection photos for certified inventory

    try {
      const res = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });
      const data = await res.json();
      if (data.fileKey) {
        setPhotoKeys((prev) => [...prev, data.fileKey]);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setUploadingPhoto(false);
    }
  };

  const handleSubmitInspection = async () => {
    if (!selectedCase) return;
    setSubmitting(true);
    setErrorMessage(null);

    // Build structured sections
    const formattedSections = CHECKLIST_SECTIONS.map((sec) => {
      const secScore = sec.items.reduce((acc, it) => acc + (itemScores[it.id] || 0), 0);
      return {
        sectionKey: sec.key,
        score: Math.round((secScore / 20) * 100),
        notes: `Module Score: ${secScore}/20 points`,
        findings: [
          {
            componentName: sec.title.split(". ")[1],
            severity: secScore < 15 ? "MODERATE" : "NONE",
            description: secScore < 15 ? "Requires routine servicing/wear replacement." : "Verified within OEM parameters.",
            estimatedRepairCost: secScore < 15 ? 2500 : 0,
            buyerFacingDisclosure: true,
          },
        ],
      };
    });

    try {
      const res = await fetch("/api/admin/inspections", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          caseId: selectedCase.id,
          overallScore,
          summaryNotes: `${summaryNotes} Defect Observations: ${defectNotes}`,
          internalNotes: signatureData ? "Digital signature certified on mobile." : "",
          sections: formattedSections,
          signatureDataUrl: signatureData,
          estimatedRepairCost: Number(repairEstimate),
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to submit inspection");

      setCompletedReportNumber(data.inspectionNumber);
    } catch (err: unknown) {
      setErrorMessage(err instanceof Error ? err.message : "Error submitting inspection");
    } finally {
      setSubmitting(false);
    }
  };

  if (completedReportNumber) {
    return (
      <div className="min-h-screen bg-slate-950 text-white p-6 flex items-center justify-center">
        <div className="max-w-md w-full bg-slate-900 border border-slate-800 rounded-2xl p-8 text-center space-y-4">
          <div className="w-14 h-14 bg-emerald-500/20 text-emerald-400 rounded-full flex items-center justify-center mx-auto">
            <CheckCircle2 className="w-8 h-8" />
          </div>
          <h2 className="text-xl font-black">Inspection Certified & Recorded!</h2>
          <p className="text-xs text-slate-400">
            Report Ref: <strong className="font-mono text-emerald-400">{completedReportNumber}</strong>
          </p>
          <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 text-xs text-left space-y-1.5">
            <div className="flex justify-between">
              <span className="text-slate-500">Overall Score:</span>
              <span className="font-bold text-white">{overallScore} / 120 Pts</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Repair Estimate:</span>
              <span className="font-mono font-bold text-amber-400">₹{Number(repairEstimate).toLocaleString("en-IN")}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Photos Uploaded:</span>
              <span className="font-bold text-slate-300">{photoKeys.length} captured</span>
            </div>
          </div>
          <div className="flex gap-2 pt-2">
            <button
              onClick={() => {
                setCompletedReportNumber(null);
                setActiveStep(1);
              }}
              className="flex-1 py-2.5 bg-slate-800 hover:bg-slate-700 rounded-xl text-xs font-bold transition-colors"
            >
              Inspect Another Car
            </button>
            <a
              href="/admin/acquisition"
              className="flex-1 py-2.5 bg-[#E05A1B] hover:bg-[#C84B12] rounded-xl text-xs font-bold transition-colors flex items-center justify-center"
            >
              Acquisition Queue
            </a>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 pb-20">
      {/* Mobile Sticky Header */}
      <header className="bg-slate-900 border-b border-slate-800 sticky top-16 z-20 px-4 py-3 flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <div className="w-8 h-8 rounded-lg bg-[#E05A1B] flex items-center justify-center text-white font-black text-xs">
            BMC
          </div>
          <div>
            <h1 className="text-xs font-bold text-white uppercase tracking-wider">
              Doorstep 120-Point Inspection
            </h1>
            <p className="text-[10px] text-slate-400">Field Technical Evaluator</p>
          </div>
        </div>

        {/* Live Score Pill */}
        <div className="flex items-center space-x-1.5 bg-slate-950 px-3 py-1 rounded-full border border-slate-800">
          <Sparkles className="w-3.5 h-3.5 text-[#E05A1B]" />
          <span className="text-xs font-black text-white font-mono">{overallScore}</span>
          <span className="text-[10px] text-slate-500">/ 120</span>
        </div>
      </header>

      <div className="max-w-2xl mx-auto px-4 py-6 space-y-6">
        {/* Step Indicator */}
        <div className="flex items-center justify-between text-xs border-b border-slate-800 pb-3">
          <button
            onClick={() => setActiveStep(1)}
            className={`font-bold transition-colors ${activeStep === 1 ? "text-[#E05A1B]" : "text-slate-500"}`}
          >
            1. Select Vehicle
          </button>
          <button
            onClick={() => setActiveStep(2)}
            className={`font-bold transition-colors ${activeStep === 2 ? "text-[#E05A1B]" : "text-slate-500"}`}
          >
            2. 120-Point Check
          </button>
          <button
            onClick={() => setActiveStep(3)}
            className={`font-bold transition-colors ${activeStep === 3 ? "text-[#E05A1B]" : "text-slate-500"}`}
          >
            3. Photos & Sign-off
          </button>
        </div>

        {/* Step 1: Select Active Case */}
        {activeStep === 1 && (
          <div className="space-y-4">
            <h2 className="text-sm font-bold text-white">Select Vehicle Scheduled for Inspection</h2>
            {loadingCases ? (
              <div className="py-12 text-center text-slate-500 text-xs">Loading pending assignments...</div>
            ) : cases.length === 0 ? (
              <div className="p-6 text-center bg-slate-900 rounded-xl border border-slate-800 text-slate-500 text-xs">
                No active acquisition cases pending inspection.
              </div>
            ) : (
              <div className="space-y-2">
                {cases.map((c) => {
                  const isSelected = selectedCase?.id === c.id;
                  return (
                    <div
                      key={c.id}
                      onClick={() => setSelectedCase(c)}
                      className={`p-4 rounded-xl border cursor-pointer transition-all ${
                        isSelected
                          ? "bg-slate-900 border-[#E05A1B] ring-1 ring-[#E05A1B]"
                          : "bg-slate-900/50 border-slate-800 hover:bg-slate-900"
                      }`}
                    >
                      <div className="flex justify-between items-start">
                        <div>
                          <span className="text-[10px] font-mono font-bold text-[#E05A1B]">
                            {c.caseNumber}
                          </span>
                          <h4 className="text-sm font-bold text-white mt-0.5">
                            {c.vehicleDetails
                              ? `${c.vehicleDetails.year} ${c.vehicleDetails.make} ${c.vehicleDetails.model}`
                              : "Vehicle Details Pending"}
                          </h4>
                          <span className="text-[11px] font-mono text-slate-400">
                            Reg: {c.vehicleDetails?.registrationNumber || "Unspecified"} • {c.vehicleDetails?.odometerKm.toLocaleString("en-IN")} km
                          </span>
                        </div>
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-slate-800 text-slate-300">
                          {c.status.replace(/_/g, " ")}
                        </span>
                      </div>

                      <div className="mt-2 pt-2 border-t border-slate-800/80 text-[11px] text-slate-400 flex justify-between">
                        <span>Seller: {c.sellerProfile?.user?.fullName}</span>
                        <span>{c.sellerProfile?.user?.phone}</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            <div className="pt-4">
              <button
                onClick={() => setActiveStep(2)}
                disabled={!selectedCase}
                className="w-full py-3 bg-[#E05A1B] hover:bg-[#C84B12] disabled:opacity-40 text-white rounded-xl text-xs font-bold transition-colors flex items-center justify-center gap-1.5 shadow-sm"
              >
                <span>Proceed to 120-Point Checklist</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* Step 2: 120-Point Checklist */}
        {activeStep === 2 && selectedCase && (
          <div className="space-y-6">
            <div className="bg-slate-900 p-3 rounded-lg border border-slate-800 flex justify-between items-center text-xs">
              <div>
                <span className="text-slate-400 text-[10px] block">Inspecting Vehicle:</span>
                <strong className="text-white">
                  {selectedCase.vehicleDetails?.year} {selectedCase.vehicleDetails?.make} {selectedCase.vehicleDetails?.model}
                </strong>
              </div>
              <span className="font-mono text-slate-400">{selectedCase.vehicleDetails?.registrationNumber}</span>
            </div>

            {CHECKLIST_SECTIONS.map((sec) => (
              <div key={sec.key} className="bg-slate-900 border border-slate-800 rounded-xl p-4 space-y-3">
                <h3 className="text-xs font-bold text-white border-b border-slate-800 pb-2">
                  {sec.title}
                </h3>
                <div className="space-y-3">
                  {sec.items.map((item) => {
                    const currentScore = itemScores[item.id] || 0;
                    return (
                      <div key={item.id} className="text-xs space-y-1.5">
                        <div className="flex justify-between text-slate-300">
                          <span>{item.label}</span>
                          <span className="font-mono font-bold text-slate-200">{currentScore} / {item.max}</span>
                        </div>
                        {/* Rating Buttons */}
                        <div className="grid grid-cols-6 gap-1">
                          {[0, 1, 2, 3, 4, 5].map((val) => (
                            <button
                              key={val}
                              type="button"
                              onClick={() => handleScoreChange(item.id, val)}
                              className={`py-1 rounded font-mono text-[11px] font-bold transition-colors ${
                                currentScore === val
                                  ? val >= 4
                                    ? "bg-emerald-600 text-white"
                                    : val >= 2
                                    ? "bg-amber-600 text-white"
                                    : "bg-rose-600 text-white"
                                  : "bg-slate-950 text-slate-400 hover:bg-slate-800"
                              }`}
                            >
                              {val}
                            </button>
                          ))}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}

            <div className="flex gap-3 pt-2">
              <button
                onClick={() => setActiveStep(1)}
                className="py-3 px-4 bg-slate-900 hover:bg-slate-800 text-slate-300 rounded-xl text-xs font-bold transition-colors"
              >
                Back
              </button>
              <button
                onClick={() => setActiveStep(3)}
                className="flex-1 py-3 bg-[#E05A1B] hover:bg-[#C84B12] text-white rounded-xl text-xs font-bold transition-colors flex items-center justify-center gap-1.5 shadow-sm"
              >
                <span>Continue to Photos & Sign-off</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* Step 3: Photos, Observations & Digital Signature Pad */}
        {activeStep === 3 && selectedCase && (
          <div className="space-y-6">
            {errorMessage && (
              <div className="p-3 bg-rose-950/60 border border-rose-800 rounded-xl text-rose-300 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 flex-shrink-0" />
                <span>{errorMessage}</span>
              </div>
            )}

            {/* Photo Capture Section */}
            <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-xs font-bold text-white flex items-center gap-1.5">
                    <Camera className="w-4 h-4 text-[#E05A1B]" />
                    <span>Evidence Photos ({photoKeys.length} captured)</span>
                  </h3>
                  <p className="text-[10px] text-slate-400">Capture odometer, engine bay, all 4 tyres, VIN plate</p>
                </div>
                <label className="cursor-pointer px-3 py-1.5 bg-[#E05A1B] hover:bg-[#C84B12] rounded-lg text-xs font-bold text-white transition-colors flex items-center gap-1">
                  <Upload className="w-3.5 h-3.5" />
                  <span>{uploadingPhoto ? "Uploading..." : "Take Photo"}</span>
                  <input
                    type="file"
                    accept="image/*"
                    capture="environment"
                    className="hidden"
                    onChange={handlePhotoUpload}
                    disabled={uploadingPhoto}
                  />
                </label>
              </div>

              {photoKeys.length > 0 && (
                <div className="grid grid-cols-3 gap-2 pt-2">
                  {photoKeys.map((key, idx) => (
                    <div key={key} className="bg-slate-950 p-2 rounded border border-slate-800 text-[10px] font-mono text-slate-300 truncate">
                      Photo #{idx + 1}
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Reconditioning Estimate & Observations */}
            <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 space-y-3">
              <h3 className="text-xs font-bold text-white">Estimated Repairs & Reconditioning</h3>
              <div>
                <label className="text-[11px] text-slate-400 block mb-1">
                  Estimated Repair / Refurbishment Cost (INR ₹)
                </label>
                <input
                  type="number"
                  value={repairEstimate}
                  onChange={(e) => setRepairEstimate(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded text-xs text-white font-mono"
                />
              </div>

              <div>
                <label className="text-[11px] text-slate-400 block mb-1">
                  Inspector Summary & Observations
                </label>
                <textarea
                  rows={2}
                  value={summaryNotes}
                  onChange={(e) => setSummaryNotes(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded text-xs text-white"
                />
              </div>

              <div>
                <label className="text-[11px] text-slate-400 block mb-1">
                  Known Imperfections / Defect Notes
                </label>
                <textarea
                  rows={2}
                  value={defectNotes}
                  onChange={(e) => setDefectNotes(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded text-xs text-white"
                />
              </div>
            </div>

            {/* Digital Signature Pad */}
            <SignaturePad
              title="Inspector Digital Certification Signature"
              subtitle="Sign on the pad below using your finger or stylus to certify these findings"
              onSave={(dataUrl) => setSignatureData(dataUrl)}
              onClear={() => setSignatureData(null)}
              height={160}
            />

            <div className="flex gap-3 pt-2">
              <button
                onClick={() => setActiveStep(2)}
                className="py-3 px-4 bg-slate-900 hover:bg-slate-800 text-slate-300 rounded-xl text-xs font-bold transition-colors"
              >
                Back
              </button>
              <button
                onClick={handleSubmitInspection}
                disabled={submitting}
                className="flex-1 py-3 bg-[#E05A1B] hover:bg-[#C84B12] disabled:opacity-50 text-white rounded-xl text-xs font-bold transition-colors flex items-center justify-center gap-1.5 shadow-sm"
              >
                <Send className="w-4 h-4" />
                <span>{submitting ? "Certifying Report..." : `Submit Inspection (${overallScore}/120 Pts)`}</span>
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

