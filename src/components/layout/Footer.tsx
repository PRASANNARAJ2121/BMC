import React from "react";
import Link from "next/link";
import { BrandLogo } from "@/components/brand/Logo";
import { ShieldCheck, Phone, Mail, MapPin } from "lucide-react";

export function Footer() {
  return (
    <footer className="bg-slate-950 text-slate-300 pt-16 pb-12 border-t border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10 mb-12">
          {/* Col 1: Brand & Tagline */}
          <div className="lg:col-span-2 space-y-4">
            <BrandLogo variant="light" size="lg" />
            <p className="text-sm text-slate-400 max-w-sm leading-relaxed">
              One Club. Every Automotive Need. A unified, company-operated automotive destination
              integrating private vehicle acquisition, certified company-owned resale, workshop
              mechanics, automotive electricals, electronics, air-conditioning, genuine spare parts,
              and fleet support.
            </p>
            <div className="pt-2 flex flex-col gap-2 text-xs text-slate-400">
              <div className="flex items-center gap-2">
                <MapPin className="w-4 h-4 text-[#E05A1B]" />
                <span>Central Hub: Automotive Corridor, Guindy, Chennai, TN 600032</span>
              </div>
              <div className="flex items-center gap-2">
                <Phone className="w-4 h-4 text-[#E05A1B]" />
                <span>Customer Care: +91 44 2855 0000</span>
              </div>
              <div className="flex items-center gap-2">
                <Mail className="w-4 h-4 text-[#E05A1B]" />
                <span>Official Enquiries: contact@bharatmotorclub.local</span>
              </div>
            </div>
          </div>

          {/* Col 2: Automobiles & Resale */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-white mb-4">
              Automobiles
            </h4>
            <ul className="space-y-2.5 text-xs text-slate-400">
              <li>
                <Link href="/automobiles" className="hover:text-white transition-colors">
                  Certified Resale Catalogue
                </Link>
              </li>
              <li>
                <Link href="/seller/submit" className="hover:text-[#E05A1B] text-[#E05A1B] font-semibold transition-colors">
                  Sell your Vehicle to BMC
                </Link>
              </li>
              <li>
                <Link href="/inspections" className="hover:text-white transition-colors">
                  120-Point Inspection Scope
                </Link>
              </li>
              <li>
                <Link href="/automobiles#how-it-works" className="hover:text-white transition-colors">
                  Company Resale Model
                </Link>
              </li>
            </ul>
          </div>

          {/* Col 3: Workshop Services */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-white mb-4">
              Workshop & Parts
            </h4>
            <ul className="space-y-2.5 text-xs text-slate-400">
              <li>
                <Link href="/garage" className="hover:text-white transition-colors">
                  Garage & Mechanical Repairs
                </Link>
              </li>
              <li>
                <Link href="/electricals" className="hover:text-white transition-colors">
                  Automotive Electricals
                </Link>
              </li>
              <li>
                <Link href="/electronics" className="hover:text-white transition-colors">
                  Electronics, Audio & ECU
                </Link>
              </li>
              <li>
                <Link href="/ac" className="hover:text-white transition-colors">
                  Car Air-Conditioning (AC)
                </Link>
              </li>
              <li>
                <Link href="/parts" className="hover:text-white transition-colors">
                  Spare Parts & Compatibility
                </Link>
              </li>
            </ul>
          </div>

          {/* Col 4: Corporate & Club */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-white mb-4">
              Club & Corporate
            </h4>
            <ul className="space-y-2.5 text-xs text-slate-400">
              <li>
                <Link href="/membership" className="hover:text-white transition-colors">
                  Club Membership Plans
                </Link>
              </li>
              <li>
                <Link href="/fleet" className="hover:text-white transition-colors">
                  Corporate Fleet Solutions
                </Link>
              </li>
              <li>
                <Link href="/technologies" className="hover:text-white transition-colors">
                  Digital Vehicle Health Records
                </Link>
              </li>
              <li>
                <Link href="/admin" className="hover:text-[#E05A1B] text-slate-500 transition-colors">
                  Staff & Operations Portal
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Legal Disclosures and Privacy Bar */}
        <div className="pt-8 border-t border-slate-900 grid grid-cols-1 md:grid-cols-2 gap-4 items-center text-xs text-slate-500">
          <div>
            <p>
              © 2026 BHARAT MOTOR CLUB. All rights reserved. Company-operated automotive ecosystem.
            </p>
            <p className="mt-1 text-[11px] text-slate-600">
              Non-negotiable Privacy Policy: Private seller identity, private submission records, and documentation
              are strictly confidential and visible only to authorized BMC acquisition personnel. No public peer-to-peer listings.
            </p>
          </div>

          <div className="flex md:justify-end gap-6 text-xs text-slate-400">
            <Link href="/privacy" className="hover:text-white transition-colors">
              Privacy Policy
            </Link>
            <Link href="/terms" className="hover:text-white transition-colors">
              Terms of Business
            </Link>
            <Link href="/seller-agreement" className="hover:text-white transition-colors">
              Seller Acquisition Agreement
            </Link>
            <Link href="/admin" className="hover:text-[#E05A1B] transition-colors">
              Team Login
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}

