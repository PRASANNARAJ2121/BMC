import React from "react";
import Link from "next/link";
import {
  Car,
  ShieldCheck,
  Wrench,
  Zap,
  Cpu,
  Wind,
  Package,
  ClipboardCheck,
  Building2,
  Award,
  ArrowRight,
  CheckCircle2,
  Lock,
} from "lucide-react";

export default function HomePage() {
  return (
    <div className="flex flex-col">
      {/* Hero Section */}
      <section className="relative bg-slate-950 text-white overflow-hidden py-24 sm:py-32 border-b border-slate-800">
        <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#E05A1B_1px,transparent_1px)] [background-size:16px_16px]" />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="max-w-3xl">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-slate-900 border border-slate-700 mb-6">
              <span className="w-2 h-2 rounded-full bg-[#E05A1B] animate-pulse" />
              <span className="text-xs font-semibold text-slate-300 tracking-wide uppercase">
                Company-Operated Automotive Ecosystem
              </span>
            </div>

            <h1 className="text-4xl sm:text-6xl font-black tracking-tight leading-[1.1] text-white">
              ONE CLUB. <br />
              <span className="text-[#E05A1B]">EVERY AUTOMOTIVE NEED.</span>
            </h1>

            <p className="mt-6 text-lg sm:text-xl text-slate-300 font-normal leading-relaxed">
              Bharat Motor Club unifies private vehicle acquisition, certified company-owned resale,
              multi-bay garage repairs, specialist electricals, vehicle electronics, car air-conditioning,
              and genuine spare parts into one trusted Indian destination.
            </p>

            <div className="mt-8 flex flex-wrap items-center gap-4">
              <Link
                href="/seller/submit"
                className="px-7 py-3.5 text-base font-bold text-white bg-[#E05A1B] hover:bg-[#C84B12] rounded-xl transition-all shadow-lg hover:shadow-orange-950/50 flex items-center gap-2 group"
              >
                <span>Sell Your Vehicle to BMC</span>
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </Link>

              <Link
                href="/automobiles"
                className="px-7 py-3.5 text-base font-bold text-slate-200 bg-slate-900 hover:bg-slate-800 border border-slate-700 rounded-xl transition-all"
              >
                Browse Certified Resale
              </Link>

              <Link
                href="/garage#book"
                className="px-6 py-3.5 text-base font-semibold text-slate-300 hover:text-white transition-colors"
              >
                Book Workshop Service →
              </Link>
            </div>

            <div className="mt-12 pt-8 border-t border-slate-800 grid grid-cols-2 sm:grid-cols-3 gap-6 text-xs text-slate-400">
              <div className="flex items-center gap-2.5">
                <Lock className="w-4 h-4 text-[#E05A1B]" />
                <span>Strict Seller Privacy (No Public P2P)</span>
              </div>
              <div className="flex items-center gap-2.5">
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
                <span>Company-Owned & RTO Transferred</span>
              </div>
              <div className="flex items-center gap-2.5">
                <CheckCircle2 className="w-4 h-4 text-[#E05A1B]" />
                <span>120-Point Technical Inspection</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* The 10 Connected Business Divisions */}
      <section className="py-20 bg-slate-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-14">
            <h2 className="text-xs font-bold uppercase tracking-widest text-[#E05A1B]">
              Integrated Operations
            </h2>
            <p className="mt-2 text-3xl font-black text-slate-900 tracking-tight">
              10 Specialized Divisions. Zero Compromise.
            </p>
            <p className="mt-3 text-slate-600 text-sm">
              Every division operates under centralized BMC governance, shared vehicle history ledgers,
              and professional workshop standards.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* 1. Automobiles */}
            <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm hover:border-[#E05A1B] transition-all group flex flex-col justify-between">
              <div>
                <div className="w-12 h-12 rounded-xl bg-orange-50 text-[#E05A1B] flex items-center justify-center mb-5 group-hover:scale-105 transition-transform">
                  <Car className="w-6 h-6" />
                </div>
                <h3 className="text-lg font-bold text-slate-900">BMC Automobiles</h3>
                <p className="mt-2 text-xs text-slate-600 leading-relaxed">
                  Confidential private vehicle acquisition and company-owned used vehicle retail.
                  Every resale car is company-owned, reconditioned, and backed by verifiable vehicle history.
                </p>
              </div>
              <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between text-xs">
                <Link href="/automobiles" className="font-bold text-[#E05A1B] hover:underline">
                  View Resale Stock →
                </Link>
                <Link href="/seller/submit" className="font-semibold text-slate-500 hover:text-slate-900">
                  Submit Vehicle
                </Link>
              </div>
            </div>

            {/* 2. Garage */}
            <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm hover:border-[#E05A1B] transition-all group flex flex-col justify-between">
              <div>
                <div className="w-12 h-12 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center mb-5 group-hover:scale-105 transition-transform">
                  <Wrench className="w-6 h-6" />
                </div>
                <h3 className="text-lg font-bold text-slate-900">BMC Garage</h3>
                <p className="mt-2 text-xs text-slate-600 leading-relaxed">
                  Multi-bay mechanical servicing, engine diagnostics, transmission overhauls, clutch
                  replacement, braking systems, suspension geometry, and wheel alignment.
                </p>
              </div>
              <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between text-xs">
                <Link href="/garage" className="font-bold text-[#E05A1B] hover:underline">
                  Garage Services →
                </Link>
                <Link href="/garage#book" className="font-semibold text-slate-500 hover:text-slate-900">
                  Book Service Bay
                </Link>
              </div>
            </div>

            {/* 3. Electricals */}
            <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm hover:border-[#E05A1B] transition-all group flex flex-col justify-between">
              <div>
                <div className="w-12 h-12 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center mb-5 group-hover:scale-105 transition-transform">
                  <Zap className="w-6 h-6" />
                </div>
                <h3 className="text-lg font-bold text-slate-900">BMC Electricals</h3>
                <p className="mt-2 text-xs text-slate-600 leading-relaxed">
                  Specialist automotive wiring, parasitic battery drain tests, high-output alternators,
                  starter motors, relay boards, lighting assemblies, and charging system health checks.
                </p>
              </div>
              <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between text-xs">
                <Link href="/electricals" className="font-bold text-[#E05A1B] hover:underline">
                  Electrical Diagnosis →
                </Link>
                <span className="text-[11px] font-mono text-slate-400">Battery & Harness</span>
              </div>
            </div>

            {/* 4. Electronics */}
            <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm hover:border-[#E05A1B] transition-all group flex flex-col justify-between">
              <div>
                <div className="w-12 h-12 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center mb-5 group-hover:scale-105 transition-transform">
                  <Cpu className="w-6 h-6" />
                </div>
                <h3 className="text-lg font-bold text-slate-900">BMC Electronics</h3>
                <p className="mt-2 text-xs text-slate-600 leading-relaxed">
                  Electronic control units (ECU), sensor calibration, touch infotainment, Android Auto /
                  Apple CarPlay upgrades, reversing cameras, 360-degree systems, and GPS tracking.
                </p>
              </div>
              <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between text-xs">
                <Link href="/electronics" className="font-bold text-[#E05A1B] hover:underline">
                  Electronics Suite →
                </Link>
                <span className="text-[11px] font-mono text-slate-400">ECU & Audio</span>
              </div>
            </div>

            {/* 5. AC */}
            <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm hover:border-[#E05A1B] transition-all group flex flex-col justify-between">
              <div>
                <div className="w-12 h-12 rounded-xl bg-cyan-50 text-cyan-600 flex items-center justify-center mb-5 group-hover:scale-105 transition-transform">
                  <Wind className="w-6 h-6" />
                </div>
                <h3 className="text-lg font-bold text-slate-900">BMC Car AC</h3>
                <p className="mt-2 text-xs text-slate-600 leading-relaxed">
                  Dedicated climate control workshop: electronic nitrogen leak detection, compressor
                  rebuilding, condenser replacement, R134a/R1234yf evacuation, and antibacterial cabin sanitation.
                </p>
              </div>
              <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between text-xs">
                <Link href="/ac" className="font-bold text-[#E05A1B] hover:underline">
                  AC Diagnostic Bay →
                </Link>
                <span className="text-[11px] font-mono text-slate-400">Zero Leakage</span>
              </div>
            </div>

            {/* 6. Spare Parts */}
            <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm hover:border-[#E05A1B] transition-all group flex flex-col justify-between">
              <div>
                <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center mb-5 group-hover:scale-105 transition-transform">
                  <Package className="w-6 h-6" />
                </div>
                <h3 className="text-lg font-bold text-slate-900">BMC Parts</h3>
                <p className="mt-2 text-xs text-slate-600 leading-relaxed">
                  Genuine OEM & verified aftermarket replacement parts. Lubricants, brake pads, shock
                  absorbers, air filters, and clutches with exact vehicle fitment verification.
                </p>
              </div>
              <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between text-xs">
                <Link href="/parts" className="font-bold text-[#E05A1B] hover:underline">
                  Search Catalogue →
                </Link>
                <span className="text-[11px] font-mono text-slate-400">SKU Fitment</span>
              </div>
            </div>

            {/* 7. Inspections */}
            <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm hover:border-[#E05A1B] transition-all group flex flex-col justify-between">
              <div>
                <div className="w-12 h-12 rounded-xl bg-teal-50 text-teal-600 flex items-center justify-center mb-5 group-hover:scale-105 transition-transform">
                  <ClipboardCheck className="w-6 h-6" />
                </div>
                <h3 className="text-lg font-bold text-slate-900">BMC Inspections</h3>
                <p className="mt-2 text-xs text-slate-600 leading-relaxed">
                  120-point digital vehicle certifications covering chassis, flood damage, paint depth,
                  engine compression, OBD-II error codes, and verified odometer readouts.
                </p>
              </div>
              <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between text-xs">
                <Link href="/inspections" className="font-bold text-[#E05A1B] hover:underline">
                  Inspection Scope →
                </Link>
                <span className="text-[11px] font-mono text-slate-400">120-Point QC</span>
              </div>
            </div>

            {/* 8. Fleet */}
            <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm hover:border-[#E05A1B] transition-all group flex flex-col justify-between">
              <div>
                <div className="w-12 h-12 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center mb-5 group-hover:scale-105 transition-transform">
                  <Building2 className="w-6 h-6" />
                </div>
                <h3 className="text-lg font-bold text-slate-900">BMC Fleet Solutions</h3>
                <p className="mt-2 text-xs text-slate-600 leading-relaxed">
                  Corporate fleet preventive maintenance schedules, volume labour discounts, dedicated
                  service bay allocations, centralized GST billing, and fleet vehicle health reports.
                </p>
              </div>
              <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between text-xs">
                <Link href="/fleet" className="font-bold text-[#E05A1B] hover:underline">
                  Fleet Onboarding →
                </Link>
                <span className="text-[11px] font-mono text-slate-400">Corporate SLA</span>
              </div>
            </div>

            {/* 9. Membership */}
            <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm hover:border-[#E05A1B] transition-all group flex flex-col justify-between">
              <div>
                <div className="w-12 h-12 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center mb-5 group-hover:scale-105 transition-transform">
                  <Award className="w-6 h-6" />
                </div>
                <h3 className="text-lg font-bold text-slate-900">BMC Membership</h3>
                <p className="mt-2 text-xs text-slate-600 leading-relaxed">
                  Club member plans with prioritized bay booking, labour discounts, complimentary seasonal
                  checkups, roadside breakdown support, and vehicle health digital records.
                </p>
              </div>
              <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between text-xs">
                <Link href="/membership" className="font-bold text-[#E05A1B] hover:underline">
                  Explore Plans →
                </Link>
                <span className="text-[11px] font-mono text-slate-400">Annual Shield</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works — The Company Resale Model */}
      <section className="py-20 bg-white border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <h2 className="text-xs font-bold uppercase tracking-widest text-[#E05A1B]">
              The Core Differentiator
            </h2>
            <p className="mt-2 text-3xl font-black text-slate-900 tracking-tight">
              Why We Are NOT a Peer-to-Peer Classifieds Site
            </p>
            <p className="mt-3 text-slate-600 text-sm">
              We never post private cars for buyers to contact strangers. BMC purchases, reconditions,
              owns, and warrants every vehicle we offer for resale.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div className="relative p-6 bg-slate-50 rounded-2xl border border-slate-200">
              <div className="text-3xl font-black text-[#E05A1B] mb-3">01</div>
              <h4 className="font-bold text-slate-900 text-base">Confidential Submission</h4>
              <p className="mt-2 text-xs text-slate-600 leading-relaxed">
                You submit your car securely to BMC. Your identity, contact, address, and RC details remain
                strictly confidential and are never exposed publicly.
              </p>
            </div>

            <div className="relative p-6 bg-slate-50 rounded-2xl border border-slate-200">
              <div className="text-3xl font-black text-[#E05A1B] mb-3">02</div>
              <h4 className="font-bold text-slate-900 text-base">Direct Company Purchase</h4>
              <p className="mt-2 text-xs text-slate-600 leading-relaxed">
                BMC inspects, values, and buys your vehicle directly with instant verified settlement.
                We complete the official RTO transfer of ownership.
              </p>
            </div>

            <div className="relative p-6 bg-slate-50 rounded-2xl border border-slate-200">
              <div className="text-3xl font-black text-[#E05A1B] mb-3">03</div>
              <h4 className="font-bold text-slate-900 text-base">Workshop Reconditioning</h4>
              <p className="mt-2 text-xs text-slate-600 leading-relaxed">
                Our in-house garage, electrical, electronics, and AC specialists recondition the vehicle,
                replace worn parts, and certify it through strict QC.
              </p>
            </div>

            <div className="relative p-6 bg-slate-50 rounded-2xl border border-slate-200">
              <div className="text-3xl font-black text-[#E05A1B] mb-3">04</div>
              <h4 className="font-bold text-slate-900 text-base">Certified Company Resale</h4>
              <p className="mt-2 text-xs text-slate-600 leading-relaxed">
                Buyers purchase directly from BMC with full condition disclosures, warranty coverage,
                and lifelong service continuity under one club.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Banner */}
      <section className="bg-slate-900 text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-black tracking-tight">
            Ready to Experience Transparent Automotive Services?
          </h2>
          <p className="mt-3 text-slate-400 text-sm max-w-xl mx-auto">
            Whether you are selling your car, searching for certified company stock, or servicing
            your existing vehicle, Bharat Motor Club is at your service.
          </p>

          <div className="mt-8 flex justify-center gap-4 flex-wrap">
            <Link
              href="/seller/submit"
              className="px-6 py-3 font-bold text-white bg-[#E05A1B] hover:bg-[#C84B12] rounded-xl transition-colors shadow-md"
            >
              Sell Your Car to BMC
            </Link>
            <Link
              href="/garage#book"
              className="px-6 py-3 font-bold text-slate-900 bg-white hover:bg-slate-100 rounded-xl transition-colors"
            >
              Book Service Appointment
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
