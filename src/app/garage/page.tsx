"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  Wrench,
  ShieldCheck,
  Calendar,
  Clock,
  CheckCircle2,
  AlertCircle,
  Car,
  Check,
} from "lucide-react";

export default function GaragePage() {
  const [customerName, setCustomerName] = useState("");
  const [customerPhone, setCustomerPhone] = useState("");
  const [customerEmail, setCustomerEmail] = useState("");
  const [vehicleMake, setVehicleMake] = useState("");
  const [vehicleModel, setVehicleModel] = useState("");
  const [vehicleRegNumber, setVehicleRegNumber] = useState("");
  const [serviceCategory, setServiceCategory] = useState("GARAGE_GENERAL");
  const [preferredDate, setPreferredDate] = useState("");
  const [preferredTimeSlot, setPreferredTimeSlot] = useState("09:00 - 11:00");
  const [issueDescription, setIssueDescription] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleBook = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setSuccessMsg(null);
    setErrorMsg(null);

    try {
      const res = await fetch("/api/appointments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          customerName,
          customerPhone,
          customerEmail,
          vehicleMake,
          vehicleModel,
          vehicleRegNumber,
          serviceCategory,
          preferredDate,
          preferredTimeSlot,
          issueDescription,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error?.message || data.error || "Booking failed");
      }

      setSuccessMsg(
        `Service appointment requested successfully! Appointment ID: ${data.appointment?.appointmentNumber}. Our Service Advisor will call you to confirm bay availability.`
      );
    } catch (err: unknown) {
      setErrorMsg(err instanceof Error ? err.message : "Appointment booking failed");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="py-12 bg-slate-50 min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Banner */}
        <div className="bg-slate-900 rounded-3xl p-8 sm:p-12 text-white mb-12 border border-slate-800">
          <div className="max-w-2xl">
            <span className="text-xs font-bold uppercase tracking-widest text-[#E05A1B]">
              BMC Garage Operations
            </span>
            <h1 className="mt-2 text-3xl sm:text-5xl font-black tracking-tight text-white">
              Precision Mechanical Service & Workshop Bay
            </h1>
            <p className="mt-4 text-sm sm:text-base text-slate-300 leading-relaxed">
              Certified multi-bay workshop equipped with hydraulic lifts, computerized wheel aligners,
              transmission test rigs, and manufacturer-grade diagnostic tooling.
            </p>
          </div>
        </div>

        {/* Content & Booking Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
          {/* Left 2 Cols: Services Scope */}
          <div className="lg:col-span-2 space-y-8">
            <div className="bg-white rounded-2xl p-8 border border-slate-200 shadow-sm">
              <h2 className="text-xl font-black text-slate-900 mb-6">Workshop Service Menu</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div className="p-5 border border-slate-100 rounded-xl bg-slate-50">
                  <Wrench className="w-6 h-6 text-[#E05A1B] mb-3" />
                  <h3 className="font-bold text-slate-900 text-sm mb-1">Periodic Maintenance</h3>
                  <p className="text-xs text-slate-600 leading-relaxed">
                    Synthetic engine oil, oil filter, air filter, spark plugs, brake fluid flush, coolant
                    top-up, and 40-point safety check.
                  </p>
                </div>

                <div className="p-5 border border-slate-100 rounded-xl bg-slate-50">
                  <Car className="w-6 h-6 text-blue-600 mb-3" />
                  <h3 className="font-bold text-slate-900 text-sm mb-1">Engine & Transmission</h3>
                  <p className="text-xs text-slate-600 leading-relaxed">
                    Timing belt/chain replacement, head gasket overhaul, clutch plate replacement, flywheel
                    facing, and manual/automatic gearbox servicing.
                  </p>
                </div>

                <div className="p-5 border border-slate-100 rounded-xl bg-slate-50">
                  <ShieldCheck className="w-6 h-6 text-emerald-600 mb-3" />
                  <h3 className="font-bold text-slate-900 text-sm mb-1">Braking & Safety</h3>
                  <p className="text-xs text-slate-600 leading-relaxed">
                    Brake pad replacement, rotor skim/replacement, caliper overhaul, ABS sensor calibration,
                    and brake line pressure bleeding.
                  </p>
                </div>

                <div className="p-5 border border-slate-100 rounded-xl bg-slate-50">
                  <Clock className="w-6 h-6 text-purple-600 mb-3" />
                  <h3 className="font-bold text-slate-900 text-sm mb-1">Suspension & Steering</h3>
                  <p className="text-xs text-slate-600 leading-relaxed">
                    Strut assembly replacement, lower arms, ball joints, tie rod ends, computerized 3D wheel
                    alignment, and road vibration balancing.
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-slate-900 text-white rounded-2xl p-8 border border-slate-800">
              <h3 className="text-base font-bold text-white mb-2">
                Digital Vehicle History for Every Job Card
              </h3>
              <p className="text-xs text-slate-400 leading-relaxed mb-4">
                Whenever your vehicle is serviced at Bharat Motor Club, a permanent digital service card
                is recorded with odometer reading, parts consumed, technician notes, and next service due
                milestones.
              </p>
              <div className="flex flex-wrap gap-4 text-xs font-semibold text-slate-300">
                <span className="flex items-center gap-1.5">
                  <Check className="w-4 h-4 text-[#E05A1B]" />
                  Itemized Labour Estimates
                </span>
                <span className="flex items-center gap-1.5">
                  <Check className="w-4 h-4 text-[#E05A1B]" />
                  Timestamped Customer Approval
                </span>
                <span className="flex items-center gap-1.5">
                  <Check className="w-4 h-4 text-[#E05A1B]" />
                  Genuine Spare Parts with Warranty
                </span>
              </div>
            </div>
          </div>

          {/* Right Col: Booking Form */}
          <div id="book" className="bg-white rounded-2xl p-8 border border-slate-200 shadow-sm h-fit">
            <h2 className="text-lg font-black text-slate-900 mb-1">Book Service Appointment</h2>
            <p className="text-xs text-slate-500 mb-6">
              Select service category and preferred date. Confirmed upon advisor availability check.
            </p>

            {successMsg ? (
              <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-800 text-xs font-semibold leading-relaxed">
                {successMsg}
              </div>
            ) : (
              <form onSubmit={handleBook} className="space-y-4">
                {errorMsg && (
                  <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-xs">
                    {errorMsg}
                  </div>
                )}

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Full Name</label>
                  <input
                    type="text"
                    required
                    value={customerName}
                    onChange={(e) => setCustomerName(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Phone</label>
                    <input
                      type="tel"
                      required
                      value={customerPhone}
                      onChange={(e) => setCustomerPhone(e.target.value)}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Email</label>
                    <input
                      type="email"
                      value={customerEmail}
                      onChange={(e) => setCustomerEmail(e.target.value)}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-2">
                  <div className="col-span-1">
                    <label className="block text-xs font-bold text-slate-700 mb-1">Make</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Maruti"
                      value={vehicleMake}
                      onChange={(e) => setVehicleMake(e.target.value)}
                      className="w-full px-2.5 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs"
                    />
                  </div>
                  <div className="col-span-1">
                    <label className="block text-xs font-bold text-slate-700 mb-1">Model</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Swift"
                      value={vehicleModel}
                      onChange={(e) => setVehicleModel(e.target.value)}
                      className="w-full px-2.5 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs"
                    />
                  </div>
                  <div className="col-span-1">
                    <label className="block text-xs font-bold text-slate-700 mb-1">Reg No</label>
                    <input
                      type="text"
                      required
                      placeholder="TN09CC4521"
                      value={vehicleRegNumber}
                      onChange={(e) => setVehicleRegNumber(e.target.value.toUpperCase())}
                      className="w-full px-2.5 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs uppercase font-mono"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Service Category
                  </label>
                  <select
                    value={serviceCategory}
                    onChange={(e) => setServiceCategory(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-700"
                  >
                    <option value="GARAGE_GENERAL">Periodic General Service</option>
                    <option value="ENGINE_TRANSMISSION">Engine / Clutch / Transmission</option>
                    <option value="ELECTRICALS">Electrical & Battery Diagnosis</option>
                    <option value="ELECTRONICS">Electronics, ECU & Infotainment</option>
                    <option value="AIR_CONDITIONING">Car AC & Climate Control</option>
                    <option value="INSPECTION">Comprehensive 120-Point Inspection</option>
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Preferred Date</label>
                    <input
                      type="date"
                      required
                      min={new Date().toISOString().split("T")[0]}
                      value={preferredDate}
                      onChange={(e) => setPreferredDate(e.target.value)}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Time Slot</label>
                    <select
                      value={preferredTimeSlot}
                      onChange={(e) => setPreferredTimeSlot(e.target.value)}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-700"
                    >
                      <option value="09:00 - 11:00">09:00 - 11:00 AM</option>
                      <option value="11:00 - 01:00">11:00 - 01:00 PM</option>
                      <option value="02:00 - 04:00">02:00 - 04:00 PM</option>
                      <option value="04:00 - 06:00">04:00 - 06:00 PM</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Describe Concerns / Symptoms
                  </label>
                  <textarea
                    rows={2}
                    value={issueDescription}
                    onChange={(e) => setIssueDescription(e.target.value)}
                    placeholder="e.g. Squeaking noise when braking, AC cooling drops in traffic..."
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs"
                  />
                </div>

                <button
                  type="submit"
                  disabled={submitting}
                  className="w-full py-3 text-xs font-bold text-white bg-[#E05A1B] hover:bg-[#C84B12] rounded-xl shadow-md transition-colors disabled:opacity-50"
                >
                  {submitting ? "Booking Bay..." : "Confirm Bay Reservation"}
                </button>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

