"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { 
  BarChart3, 
  ShieldAlert, 
  Car, 
  Wrench, 
  Bot, 
  ExternalLink,
  ShieldCheck,
  Building2
} from "lucide-react";

const NAV_ITEMS = [
  { name: "Executive BI", href: "/admin", icon: BarChart3 },
  { name: "Acquisition Queue", href: "/admin/acquisition", icon: ShieldAlert },
  { name: "120-Pt Inspector", href: "/inspector", icon: ShieldCheck },
  { name: "Inventory & QC Gates", href: "/admin/vehicles", icon: Car },
  { name: "Workshop Job Cards", href: "/admin/jobs", icon: Wrench },
  { name: "AI Prompt Studio", href: "/admin/prompts", icon: Bot },
];

export default function AdminNav() {
  const pathname = usePathname();

  return (
    <header className="bg-slate-950 text-white border-b border-slate-800 sticky top-16 z-30 shadow-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-14">
          <div className="flex items-center space-x-6 overflow-x-auto py-2">
            <div className="flex items-center space-x-2 mr-2">
              <Building2 className="w-4 h-4 text-[#E05A1B]" />
              <span className="text-xs font-black uppercase tracking-wider text-slate-300 whitespace-nowrap">
                BMC Ops Portal
              </span>
            </div>

            <nav className="flex space-x-1 sm:space-x-2">
              {NAV_ITEMS.map((item) => {
                const isActive = pathname === item.href;
                const Icon = item.icon;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`flex items-center space-x-1.5 px-3 py-1.5 rounded text-xs font-semibold whitespace-nowrap transition-colors ${
                      isActive
                        ? "bg-[#E05A1B] text-white shadow-sm"
                        : "text-slate-400 hover:text-white hover:bg-slate-900"
                    }`}
                  >
                    <Icon className="w-3.5 h-3.5" />
                    <span>{item.name}</span>
                  </Link>
                );
              })}
            </nav>
          </div>

          <div className="hidden lg:flex items-center space-x-4">
            <span className="flex items-center space-x-1.5 text-[11px] text-emerald-400 bg-emerald-950/60 px-2.5 py-1 rounded border border-emerald-800">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>RBAC Enforced • BMC-HQ</span>
            </span>
            <Link
              href="/"
              target="_blank"
              className="text-[11px] text-slate-400 hover:text-white flex items-center space-x-1"
            >
              <span>Public Store</span>
              <ExternalLink className="w-3 h-3" />
            </Link>
          </div>
        </div>
      </div>
    </header>
  );
}

