import React from "react";
import Link from "next/link";
import { Wind, Gauge, Droplet, ShieldCheck, Thermometer } from "lucide-react";

export default function ACPage() {
  return (
    <div className="py-12 bg-slate-50 min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-slate-900 rounded-3xl p-8 sm:p-12 text-white mb-12 border border-slate-800">
          <div className="max-w-2xl">
            <span className="text-xs font-bold uppercase tracking-widest text-cyan-400">
              Specialist Climate Division
            </span>
            <h1 className="mt-2 text-3xl sm:text-5xl font-black tracking-tight text-white">
              Car Air-Conditioning & Climate Control
            </h1>
            <p className="mt-4 text-sm sm:text-base text-slate-300 leading-relaxed">
              Full cooling performance diagnosis, nitrogen high-pressure leak detection, compressor
              overhaul, evaporator coil cleaning, expansion valve replacement, and digital refrigerant charging.
            </p>
            <div className="mt-6">
              <Link
                href="/garage#book"
                className="px-6 py-3 text-xs font-bold text-slate-950 bg-cyan-400 hover:bg-cyan-500 rounded-xl transition-colors inline-block"
              >
                Book AC Cooling Service
              </Link>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          <div className="bg-white rounded-2xl p-6 border border-slate-200">
            <Thermometer className="w-8 h-8 text-cyan-500 mb-4" />
            <h3 className="font-bold text-slate-900 text-base mb-2">Cooling Performance Diagnosis</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Precision digital thermometer vent testing, condenser heat rejection measurement, and
              ambient-versus-cabin drop analysis.
            </p>
          </div>

          <div className="bg-white rounded-2xl p-6 border border-slate-200">
            <Gauge className="w-8 h-8 text-cyan-500 mb-4" />
            <h3 className="font-bold text-slate-900 text-base mb-2">Nitrogen Leak Testing</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              High-pressure nitrogen charging to isolate microscopic leaks in O-rings, hose crimps,
              cooling coils, and condenser fins without wasting refrigerant.
            </p>
          </div>

          <div className="bg-white rounded-2xl p-6 border border-slate-200">
            <Wind className="w-8 h-8 text-cyan-500 mb-4" />
            <h3 className="font-bold text-slate-900 text-base mb-2">Refrigerant & Compressor</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Full vacuum evacuation, PAG compressor oil replenishment, OEM-specified mass refrigerant
              charging, and magnetic clutch gap calibration.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

