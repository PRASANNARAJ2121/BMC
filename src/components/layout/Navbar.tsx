"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { BrandLogo } from "@/components/brand/Logo";
import {
  Car,
  Wrench,
  Zap,
  Cpu,
  Wind,
  Package,
  ClipboardCheck,
  Shield,
  Users,
  Menu,
  X,
  User as UserIcon,
  ChevronDown,
} from "lucide-react";

interface UserState {
  id: string;
  fullName: string;
  email: string;
  roles: string[];
}

export function Navbar() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [divisionsOpen, setDivisionsOpen] = useState(false);
  const [user, setUser] = useState<UserState | null>(null);

  useEffect(() => {
    fetch("/api/auth/me")
      .then((res) => res.json())
      .then((data) => {
        if (data?.user) setUser(data.user);
      })
      .catch(() => {});
  }, []);

  const handleLogout = async () => {
    await fetch("/api/auth/logout", { method: "POST" });
    setUser(null);
    window.location.href = "/";
  };

  const isStaff = user?.roles?.some((r) =>
    [
      "SUPER_ADMIN",
      "BUSINESS_OWNER",
      "ACQUISITION_MANAGER",
      "ACQUISITION_EXECUTIVE",
      "WORKSHOP_MANAGER",
      "SERVICE_ADVISOR",
      "FINANCE_OFFICER",
      "INVENTORY_MANAGER",
      "SALES_MANAGER",
    ].includes(r)
  );

  return (
    <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-md border-b border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          {/* Logo */}
          <BrandLogo size="md" />

          {/* Desktop Navigation Links */}
          <nav className="hidden lg:flex items-center gap-6">
            <Link
              href="/automobiles"
              className="text-sm font-semibold text-slate-700 hover:text-[#E05A1B] transition-colors"
            >
              Certified Resale
            </Link>

            <Link
              href="/seller/submit"
              className="text-sm font-semibold text-[#E05A1B] hover:text-[#C84B12] transition-colors"
            >
              Sell to BMC
            </Link>

            <div className="relative group">
              <button
                type="button"
                onClick={() => setDivisionsOpen(!divisionsOpen)}
                className="flex items-center gap-1 text-sm font-semibold text-slate-700 group-hover:text-[#E05A1B] transition-colors py-2"
              >
                Services & Divisions
                <ChevronDown className="w-4 h-4 text-slate-400 group-hover:text-[#E05A1B]" />
              </button>

              <div className="absolute top-full left-0 w-80 bg-white border border-slate-200 rounded-xl shadow-xl p-3 opacity-0 translate-y-2 pointer-events-none group-hover:opacity-100 group-hover:translate-y-0 group-hover:pointer-events-auto transition-all duration-200 grid grid-cols-1 gap-1">
                <Link
                  href="/garage"
                  className="flex items-center gap-3 p-2.5 rounded-lg hover:bg-slate-50 transition-colors"
                >
                  <Wrench className="w-5 h-5 text-[#E05A1B]" />
                  <div>
                    <div className="text-xs font-bold text-slate-900">Garage & Mechanical</div>
                    <div className="text-[11px] text-slate-500">Periodic service, engine & clutch overhauls</div>
                  </div>
                </Link>

                <Link
                  href="/electricals"
                  className="flex items-center gap-3 p-2.5 rounded-lg hover:bg-slate-50 transition-colors"
                >
                  <Zap className="w-5 h-5 text-amber-500" />
                  <div>
                    <div className="text-xs font-bold text-slate-900">Electricals</div>
                    <div className="text-[11px] text-slate-500">Wiring, battery, alternator & starter diagnosis</div>
                  </div>
                </Link>

                <Link
                  href="/electronics"
                  className="flex items-center gap-3 p-2.5 rounded-lg hover:bg-slate-50 transition-colors"
                >
                  <Cpu className="w-5 h-5 text-indigo-500" />
                  <div>
                    <div className="text-xs font-bold text-slate-900">Electronics & ECU</div>
                    <div className="text-[11px] text-slate-500">Infotainment, cameras & electronic control systems</div>
                  </div>
                </Link>

                <Link
                  href="/ac"
                  className="flex items-center gap-3 p-2.5 rounded-lg hover:bg-slate-50 transition-colors"
                >
                  <Wind className="w-5 h-5 text-cyan-500" />
                  <div>
                    <div className="text-xs font-bold text-slate-900">Car Air-Conditioning</div>
                    <div className="text-[11px] text-slate-500">Leak checks, compressor work & refrigerant refill</div>
                  </div>
                </Link>

                <Link
                  href="/inspections"
                  className="flex items-center gap-3 p-2.5 rounded-lg hover:bg-slate-50 transition-colors"
                >
                  <ClipboardCheck className="w-5 h-5 text-emerald-600" />
                  <div>
                    <div className="text-xs font-bold text-slate-900">120-Point Inspections</div>
                    <div className="text-[11px] text-slate-500">Pre-purchase & condition certifications</div>
                  </div>
                </Link>
              </div>
            </div>

            <Link
              href="/parts"
              className="text-sm font-semibold text-slate-700 hover:text-[#E05A1B] transition-colors"
            >
              Spare Parts
            </Link>

            <Link
              href="/fleet"
              className="text-sm font-semibold text-slate-700 hover:text-[#E05A1B] transition-colors"
            >
              Fleet
            </Link>

            <Link
              href="/membership"
              className="text-sm font-semibold text-slate-700 hover:text-[#E05A1B] transition-colors"
            >
              Club Membership
            </Link>
          </nav>

          {/* Action CTAs */}
          <div className="hidden lg:flex items-center gap-4">
            <Link
              href="/customer/garage"
              className="text-sm font-semibold text-slate-700 hover:text-[#E05A1B] transition-colors"
            >
              My Garage
            </Link>

            <Link
              href="/garage#book"
              className="px-4 py-2 text-sm font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors"
            >
              Book Service
            </Link>

            {user ? (
              <div className="flex items-center gap-3">
                <Link
                  href={isStaff ? "/admin" : "/seller/dashboard"}
                  className="flex items-center gap-2 px-3.5 py-2 text-sm font-bold text-slate-900 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors"
                >
                  <UserIcon className="w-4 h-4 text-[#E05A1B]" />
                  <span>{user.fullName.split(" ")[0]}</span>
                  {isStaff && (
                    <span className="text-[10px] bg-slate-900 text-white px-1.5 py-0.5 rounded font-mono">
                      STAFF
                    </span>
                  )}
                </Link>
                <button
                  type="button"
                  onClick={handleLogout}
                  className="text-xs font-semibold text-slate-500 hover:text-red-600 transition-colors"
                >
                  Sign Out
                </button>
              </div>
            ) : (
              <Link
                href="/auth/signin"
                className="px-4 py-2 text-sm font-bold text-white bg-slate-900 hover:bg-[#E05A1B] rounded-lg transition-colors shadow-sm"
              >
                Sign In
              </Link>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="lg:hidden flex items-center gap-2">
            <Link
              href="/technologies"
              className="flex items-center gap-1.5 px-3 py-1.5 bg-orange-50 border border-orange-200 text-[#E05A1B] text-xs font-bold rounded-lg"
            >
              <Cpu className="w-4 h-4 text-[#E05A1B]" />
              <span>AI Chat</span>
            </Link>
            <button
              type="button"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 text-slate-700 hover:text-slate-900"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="lg:hidden border-t border-slate-200 bg-white px-4 pt-3 pb-6 space-y-3">
          <Link
            href="/technologies"
            onClick={() => setMobileMenuOpen(false)}
            className="flex items-center justify-between px-3.5 py-2.5 text-base font-bold text-white bg-[#E05A1B] rounded-xl shadow-sm"
          >
            <div className="flex items-center gap-2.5">
              <Cpu className="w-5 h-5 text-white" />
              <span>AI Automotive Assistant</span>
            </div>
            <span className="text-xs bg-white/20 px-2 py-0.5 rounded-full font-mono">14 Agents</span>
          </Link>
          <Link
            href="/automobiles"
            onClick={() => setMobileMenuOpen(false)}
            className="block px-3 py-2 text-base font-semibold text-slate-800 hover:bg-slate-50 rounded-lg"
          >
            Certified Resale Catalogue
          </Link>
          <Link
            href="/seller/submit"
            onClick={() => setMobileMenuOpen(false)}
            className="block px-3 py-2 text-base font-bold text-[#E05A1B] hover:bg-orange-50 rounded-lg"
          >
            Sell your Vehicle to BMC
          </Link>
          <Link
            href="/garage"
            onClick={() => setMobileMenuOpen(false)}
            className="block px-3 py-2 text-base font-semibold text-slate-800 hover:bg-slate-50 rounded-lg"
          >
            Garage & Mechanical Repairs
          </Link>
          <Link
            href="/electricals"
            onClick={() => setMobileMenuOpen(false)}
            className="block px-3 py-2 text-base font-semibold text-slate-800 hover:bg-slate-50 rounded-lg"
          >
            Automotive Electricals
          </Link>
          <Link
            href="/electronics"
            onClick={() => setMobileMenuOpen(false)}
            className="block px-3 py-2 text-base font-semibold text-slate-800 hover:bg-slate-50 rounded-lg"
          >
            Vehicle Electronics & ECU
          </Link>
          <Link
            href="/ac"
            onClick={() => setMobileMenuOpen(false)}
            className="block px-3 py-2 text-base font-semibold text-slate-800 hover:bg-slate-50 rounded-lg"
          >
            Car Air-Conditioning (AC)
          </Link>
          <Link
            href="/parts"
            onClick={() => setMobileMenuOpen(false)}
            className="block px-3 py-2 text-base font-semibold text-slate-800 hover:bg-slate-50 rounded-lg"
          >
            Spare Parts Catalogue
          </Link>
          <Link
            href="/inspections"
            onClick={() => setMobileMenuOpen(false)}
            className="block px-3 py-2 text-base font-semibold text-slate-800 hover:bg-slate-50 rounded-lg"
          >
            120-Point Inspections
          </Link>
          <Link
            href="/fleet"
            onClick={() => setMobileMenuOpen(false)}
            className="block px-3 py-2 text-base font-semibold text-slate-800 hover:bg-slate-50 rounded-lg"
          >
            Fleet Solutions
          </Link>
          <Link
            href="/membership"
            onClick={() => setMobileMenuOpen(false)}
            className="block px-3 py-2 text-base font-semibold text-slate-800 hover:bg-slate-50 rounded-lg"
          >
            Club Membership
          </Link>

          <div className="pt-4 border-t border-slate-200">
            {user ? (
              <div className="space-y-2">
                <Link
                  href={isStaff ? "/admin" : "/seller/dashboard"}
                  onClick={() => setMobileMenuOpen(false)}
                  className="block text-center w-full py-2.5 font-bold text-slate-900 bg-slate-100 rounded-lg"
                >
                  My Dashboard ({user.fullName})
                </Link>
                <button
                  type="button"
                  onClick={handleLogout}
                  className="block text-center w-full py-2 text-sm text-red-600 font-semibold"
                >
                  Sign Out
                </button>
              </div>
            ) : (
              <Link
                href="/auth/signin"
                onClick={() => setMobileMenuOpen(false)}
                className="block text-center w-full py-3 font-bold text-white bg-slate-900 rounded-lg"
              >
                Sign In to Account
              </Link>
            )}
          </div>
        </div>
      )}
    </header>
  );
}

