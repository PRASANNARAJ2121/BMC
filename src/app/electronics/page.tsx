import React from "react";
import Link from "next/link";
import { Cpu, Radio, ShieldAlert, Sparkles, ArrowRight } from "lucide-react";

export default function ElectronicsPage() {
  return (
    <div className="py-12 bg-slate-50 min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-slate-900 rounded-3xl p-8 sm:p-12 text-white mb-12 border border-slate-800">
          <div className="max-w-2xl">
            <span className="text-xs font-bold uppercase tracking-widest text-indigo-400">
              Specialist Automotive Division
            </span>
            <h1 className="mt-2 text-3xl sm:text-5xl font-black tracking-tight text-white">
              Vehicle Electronics, ECU & Infotainment
            </h1>
            <p className="mt-4 text-sm sm:text-base text-slate-300 leading-relaxed">
              Diagnostic scanning, engine control modules, body control modules, steering angle sensor
              calibration, 360-degree parking cameras, touchscreen infotainment, and audio enhancements.
            </p>
            <div className="mt-6">
              <Link
                href="/garage#book"
                className="px-6 py-3 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl transition-colors inline-block"
              >
                Book Electronics Diagnostic Bay
              </Link>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          <div className="bg-white rounded-2xl p-6 border border-slate-200">
            <Cpu className="w-8 h-8 text-indigo-600 mb-4" />
            <h3 className="font-bold text-slate-900 text-base mb-2">ECU & Sensor Diagnostics</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              OBD-II live data parameter streaming, check-engine fault code isolation, oxygen sensor
              response curves, and throttle position sensor calibration.
            </p>
          </div>

          <div className="bg-white rounded-2xl p-6 border border-slate-200">
            <Radio className="w-8 h-8 text-indigo-600 mb-4" />
            <h3 className="font-bold text-slate-900 text-base mb-2">Infotainment & Audio</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Wireless Apple CarPlay and Android Auto head-unit retrofits, steering wheel control
              integration, amplifier setup, and high-fidelity speaker upgrades.
            </p>
          </div>

          <div className="bg-white rounded-2xl p-6 border border-slate-200">
            <ShieldAlert className="w-8 h-8 text-indigo-600 mb-4" />
            <h3 className="font-bold text-slate-900 text-base mb-2">Safety Electronics & Cameras</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              High-definition reverse cameras, ultrasonic parking sensor arrays, digital dash cams with
              hardwire kit, and GPS fleet tracking equipment.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

