import React from "react";
import Link from "next/link";
import { ClipboardCheck, ShieldCheck, CheckCircle2, Search, ArrowRight } from "lucide-react";

export default function InspectionsPage() {
  const categories = [
    { title: "Chassis & Structural Frame", items: "A-B-C pillar alignment, unibody welds, apron integrity, zero flood or fire signs" },
    { title: "Engine & Mechanical Systems", items: "Cylinder compression, valve train noise, head gasket sealing, exhaust emission analysis" },
    { title: "Transmission & Drivetrain", items: "Gear synchromesh, clutch slip index, automatic torque converter fluid, differential backlash" },
    { title: "Braking & Safety Electronics", items: "Rotor runout, pad thickness (mm), ABS pump cycle, electronic brake distribution calibration" },
    { title: "Suspension & Steering Dynamics", items: "Strut damping rate, lower wishbones, rack and pinion backlash, tie-rod boot integrity" },
    { title: "Automotive Electricals & Battery", items: "Alternator ripple current, battery cranking health under load, starter solenoid draw" },
    { title: "Air-Conditioning & HVAC", items: "Vent cooling delta, electronic high-pressure nitrogen test, evaporator odour check" },
    { title: "OBD-II Electronics & Modules", items: "Stored, pending and permanent DTC trouble codes, live sensor data freeze-frame review" },
    { title: "Road Test Dynamics", items: "Straight-line tracking, NVH vibration harmonics, brake pull, high-speed stability" },
    { title: "Documentation Consistency", items: "RC engine/chassis number stamping match, hypothecation check, insurance transferability" },
  ];

  return (
    <div className="py-12 bg-slate-50 min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-slate-900 rounded-3xl p-8 sm:p-12 text-white mb-12 border border-slate-800">
          <div className="max-w-2xl">
            <span className="text-xs font-bold uppercase tracking-widest text-teal-400">
              Technical Verification Standard
            </span>
            <h1 className="mt-2 text-3xl sm:text-5xl font-black tracking-tight text-white">
              120-Point Comprehensive Vehicle Certification
            </h1>
            <p className="mt-4 text-sm sm:text-base text-slate-300 leading-relaxed">
              Every vehicle acquired and resold by Bharat Motor Club undergoes our rigorous,
              verifiable 120-point digital inspection. Available as an independent pre-purchase
              evaluation or pre-monsoon health check.
            </p>
            <div className="mt-6">
              <Link
                href="/garage#book"
                className="px-6 py-3 text-xs font-bold text-slate-950 bg-teal-400 hover:bg-teal-500 rounded-xl transition-colors inline-block"
              >
                Schedule Independent Inspection
              </Link>
            </div>
          </div>
        </div>

        {/* 10 Checklist Categories */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
          {categories.map((cat, idx) => (
            <div key={idx} className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm flex items-start gap-4">
              <div className="w-8 h-8 rounded-lg bg-teal-50 text-teal-700 font-black text-xs flex items-center justify-center shrink-0">
                {String(idx + 1).padStart(2, "0")}
              </div>
              <div>
                <h3 className="font-bold text-slate-900 text-sm mb-1">{cat.title}</h3>
                <p className="text-xs text-slate-600 leading-relaxed">{cat.items}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

