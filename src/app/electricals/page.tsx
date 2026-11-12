import React from "react";
import Link from "next/link";
import { Zap, ShieldCheck, CheckCircle2, Battery, AlertTriangle, ArrowRight } from "lucide-react";

export default function ElectricalsPage() {
  return (
    <div className="py-12 bg-slate-50 min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-slate-900 rounded-3xl p-8 sm:p-12 text-white mb-12 border border-slate-800">
          <div className="max-w-2xl">
            <span className="text-xs font-bold uppercase tracking-widest text-amber-500">
              Specialist Automotive Division
            </span>
            <h1 className="mt-2 text-3xl sm:text-5xl font-black tracking-tight text-white">
              Automotive Electricals & Battery Systems
            </h1>
            <p className="mt-4 text-sm sm:text-base text-slate-300 leading-relaxed">
              Specialist diagnostics for complex automotive wiring harnesses, parasitic battery drain,
              high-output alternators, starter motors, relay panels, fuse blocks, and lighting systems.
            </p>
            <div className="mt-6">
              <Link
                href="/garage#book"
                className="px-6 py-3 text-xs font-bold text-slate-950 bg-amber-400 hover:bg-amber-500 rounded-xl transition-colors inline-block"
              >
                Book Electrical Diagnostic Bay
              </Link>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          <div className="bg-white rounded-2xl p-6 border border-slate-200">
            <Battery className="w-8 h-8 text-amber-500 mb-4" />
            <h3 className="font-bold text-slate-900 text-base mb-2">Battery Health & Charging</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Computerized cold-cranking amp (CCA) load testing, alternator diode ripple checks, and
              parasitic overnight drain diagnosis.
            </p>
          </div>

          <div className="bg-white rounded-2xl p-6 border border-slate-200">
            <Zap className="w-8 h-8 text-amber-500 mb-4" />
            <h3 className="font-bold text-slate-900 text-base mb-2">Starter & Alternator Overhaul</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Armature testing, solenoid rebuilds, carbon brush replacement, rectifier pack overhauls,
              and precision bench testing.
            </p>
          </div>

          <div className="bg-white rounded-2xl p-6 border border-slate-200">
            <AlertTriangle className="w-8 h-8 text-amber-500 mb-4" />
            <h3 className="font-bold text-slate-900 text-base mb-2">Harness & Short Circuit Repair</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Thermal imaging for hidden wiring resistance, fuse-box short-circuit isolation, and
              water-ingress connector restoration.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

