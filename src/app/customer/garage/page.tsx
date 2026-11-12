"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  Car,
  Wrench,
  ShieldCheck,
  Calendar,
  FileText,
  Clock,
  AlertTriangle,
  CheckCircle2,
  PhoneCall,
  Plus,
  ArrowRight,
  ExternalLink,
  Award,
} from "lucide-react";

interface ServiceRecord {
  id: string;
  vehicleRegNumber: string;
  vehicleDescription: string;
  odometerKm: number;
  serviceSummary: string;
  invoiceTotal: number;
  serviceDate: string;
  nextServiceDate: string | null;
  nextServiceKm: number | null;
  jobCard?: {
    id: string;
    jobNumber: string;
    invoices: Array<{
      id: string;
      invoiceNumber: string;
      grandTotal: number;
    }>;
  };
}

interface MembershipInfo {
  id: string;
  membershipNumber: string;
  status: string;
  startDate: string;
  endDate: string;
  plan: {
    name: string;
    tier: string;
  };
}

export default function CustomerGaragePage() {
  const [loading, setLoading] = useState(true);
  const [serviceRecords, setServiceRecords] = useState<ServiceRecord[]>([]);
  const [membership, setMembership] = useState<MembershipInfo | null>(null);

  useEffect(() => {
    fetch("/api/customer/vehicles")
      .then((res) => {
        if (res.status === 401) {
          window.location.href = "/auth/signin?callbackUrl=/customer/garage";
          return null;
        }
        return res.json();
      })
      .then((data) => {
        if (data) {
          if (data.serviceRecords) setServiceRecords(data.serviceRecords);
          if (data.membership) setMembership(data.membership);
        }
        setLoading(false);
      })
      .catch((err) => {
        console.error(err);
        setLoading(false);
      });
  }, []);

  return (
    <div className="py-10 bg-slate-950 text-slate-100 min-h-screen">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        {/* Header Bar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-800">
          <div>
            <div className="flex items-center gap-2 text-xs font-bold text-[#E05A1B] uppercase tracking-wider mb-1">
              <Car className="w-4 h-4" />
              <span>Digital Glovebox & Ownership Hub</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-white">
              My Garage & Service Vault
            </h1>
            <p className="text-xs text-slate-400 mt-1">
              Lifetime verified service ledgers, upcoming maintenance reminders, and digital warranty certificates.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <Link
              href="/garage"
              className="px-4 py-2 bg-[#E05A1B] hover:bg-[#C84B12] text-white rounded-xl text-xs font-bold transition-colors flex items-center gap-1.5 shadow-sm"
            >
              <Wrench className="w-3.5 h-3.5" />
              <span>Book Service Bay</span>
            </Link>
          </div>
        </div>

        {/* Top Cards: Membership & Roadside Assistance */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Active Club Membership */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-3 relative overflow-hidden">
            <div className="flex justify-between items-start">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-amber-400 block">
                  Club Membership
                </span>
                <h3 className="text-base font-bold text-white mt-0.5">
                  {membership ? membership.plan.name : "Standard Club Member"}
                </h3>
              </div>
              <Award className="w-6 h-6 text-amber-400" />
            </div>

            <p className="text-xs text-slate-400">
              {membership
                ? `Tier: ${membership.plan.tier} • Member #${membership.membershipNumber}`
                : "Upgrade to Gold or Platinum for 15% labour discounts and zero-wait priority bay scheduling."}
            </p>

            <div className="pt-2">
              <Link
                href="/membership"
                className="text-xs font-bold text-[#E05A1B] hover:underline flex items-center gap-1"
              >
                <span>{membership ? "View Membership Perks" : "Explore Club Tiers"}</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>

          {/* 24/7 Roadside Assistance */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-3">
            <div className="flex justify-between items-start">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-400 block">
                  Emergency Support
                </span>
                <h3 className="text-base font-bold text-white mt-0.5">24/7 Roadside Assistance</h3>
              </div>
              <PhoneCall className="w-6 h-6 text-emerald-400" />
            </div>

            <p className="text-xs text-slate-400">
              Breakdown towing, battery jumpstarts, flat tyre assistance, and emergency fuel across India.
            </p>

            <div className="pt-1 font-mono text-xs font-black text-white">
              Toll-Free: <span className="text-emerald-400">1800-BMC-HELP</span>
            </div>
          </div>

          {/* Digital Inspection Record */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-3">
            <div className="flex justify-between items-start">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-blue-400 block">
                  Quality Guarantee
                </span>
                <h3 className="text-base font-bold text-white mt-0.5">120-Point Multi-Point Scope</h3>
              </div>
              <ShieldCheck className="w-6 h-6 text-blue-400" />
            </div>

            <p className="text-xs text-slate-400">
              All vehicles serviced or certified by BMC undergo standardized electronic & mechanical diagnostics.
            </p>

            <div className="pt-2">
              <Link
                href="/inspections"
                className="text-xs font-bold text-blue-400 hover:underline flex items-center gap-1"
              >
                <span>Read Inspection Scope</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>
        </div>

        {/* Service History Timeline */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-6">
          <div className="flex items-center justify-between border-b border-slate-800 pb-4">
            <div>
              <h2 className="text-base font-bold text-white">Lifetime Service History & Invoices</h2>
              <p className="text-xs text-slate-400 mt-0.5">
                Permanent maintenance records that preserve your vehicle&apos;s resale value.
              </p>
            </div>
            <span className="text-xs font-mono font-bold text-slate-400">
              {serviceRecords.length} Records Logged
            </span>
          </div>

          {loading ? (
            <div className="py-12 text-center text-slate-500 text-xs">Loading service ledger...</div>
          ) : serviceRecords.length === 0 ? (
            <div className="p-8 text-center bg-slate-950/60 rounded-xl border border-slate-800/80 space-y-3">
              <p className="text-xs text-slate-400">
                No workshop service visits recorded yet for your account.
              </p>
              <Link
                href="/garage"
                className="inline-flex items-center gap-1.5 px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-lg text-xs font-bold transition-colors"
              >
                <span>Schedule Your First Periodic Maintenance</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          ) : (
            <div className="space-y-4">
              {serviceRecords.map((record) => (
                <div
                  key={record.id}
                  className="bg-slate-950/70 border border-slate-800 rounded-xl p-5 space-y-3"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-800/80 pb-3">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-white text-sm">
                          {record.vehicleDescription}
                        </span>
                        <span className="text-[11px] font-mono font-bold px-2 py-0.5 rounded bg-slate-900 border border-slate-700 text-slate-200">
                          {record.vehicleRegNumber}
                        </span>
                      </div>
                      <span className="text-[11px] text-slate-400 mt-0.5 block">
                        Serviced on {new Date(record.serviceDate).toLocaleDateString("en-IN")} • Odometer: {record.odometerKm.toLocaleString("en-IN")} km
                      </span>
                    </div>

                    <div className="flex items-center gap-3">
                      <div className="text-right">
                        <span className="text-[10px] text-slate-500 block uppercase">Invoice Total</span>
                        <span className="font-mono font-bold text-emerald-400 text-sm">
                          ₹{record.invoiceTotal.toLocaleString("en-IN")}
                        </span>
                      </div>

                      {record.jobCard?.invoices?.[0] && (
                        <a
                          href={`/api/documents/invoice/${record.jobCard.invoices[0].id}`}
                          target="_blank"
                          rel="noreferrer"
                          className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors"
                        >
                          <FileText className="w-3.5 h-3.5 text-[#E05A1B]" />
                          <span>View GST Invoice</span>
                          <ExternalLink className="w-3 h-3 text-slate-400" />
                        </a>
                      )}
                    </div>
                  </div>

                  <p className="text-xs text-slate-300 leading-relaxed">
                    {record.serviceSummary}
                  </p>

                  {record.nextServiceDate && (
                    <div className="flex items-center gap-2 text-[11px] text-amber-400/90 bg-amber-950/20 px-3 py-1.5 rounded-lg border border-amber-900/40">
                      <Clock className="w-3.5 h-3.5 flex-shrink-0" />
                      <span>
                        Next Recommended Service: {new Date(record.nextServiceDate).toLocaleDateString("en-IN")} or at {(record.nextServiceKm || record.odometerKm + 10000).toLocaleString("en-IN")} km
                      </span>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

