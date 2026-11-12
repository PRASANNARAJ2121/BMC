"use client";

import React, { useState } from "react";
import Link from "next/link";
import { BrandLogo } from "@/components/brand/Logo";
import { Lock, Mail, User, Phone, ArrowRight, AlertCircle } from "lucide-react";

export default function SignInPage() {
  const [tab, setTab] = useState<"signin" | "register">("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [isSeller, setIsSeller] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const endpoint = tab === "signin" ? "/api/auth/login" : "/api/auth/register";
    const payload =
      tab === "signin"
        ? { email, password }
        : { email, password, fullName, phone, isSeller };

    try {
      const res = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error?.message || (typeof data.error === "string" ? data.error : "Authentication failed"));
      }

      const roles: string[] = data.user?.roles || [];
      if (
        roles.some((r) =>
          ["SUPER_ADMIN", "BUSINESS_OWNER", "ACQUISITION_MANAGER", "WORKSHOP_MANAGER"].includes(r)
        )
      ) {
        window.location.href = "/admin";
      } else if (roles.includes("SELLER") || isSeller) {
        window.location.href = "/seller/dashboard";
      } else {
        window.location.href = "/";
      }
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Authentication error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="py-16 bg-slate-50 min-h-screen flex items-center justify-center px-4 sm:px-6">
      <div className="max-w-md w-full bg-white rounded-3xl p-8 border border-slate-200 shadow-xl">
        <div className="text-center mb-8">
          <BrandLogo size="md" className="justify-center mb-4" />
          <h1 className="text-xl font-black text-slate-900 tracking-tight">
            {tab === "signin" ? "Account Sign In" : "Create Bharat Motor Club Account"}
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Access confidential seller submissions, garage job cards, and membership privileges.
          </p>
        </div>

        {/* Tab Selector */}
        <div className="flex bg-slate-100 p-1 rounded-xl mb-6 text-xs font-bold">
          <button
            type="button"
            onClick={() => {
              setTab("signin");
              setError(null);
            }}
            className={`flex-1 py-2 rounded-lg transition-colors ${
              tab === "signin" ? "bg-white text-slate-900 shadow-sm" : "text-slate-500 hover:text-slate-900"
            }`}
          >
            Sign In
          </button>
          <button
            type="button"
            onClick={() => {
              setTab("register");
              setError(null);
            }}
            className={`flex-1 py-2 rounded-lg transition-colors ${
              tab === "register" ? "bg-white text-slate-900 shadow-sm" : "text-slate-500 hover:text-slate-900"
            }`}
          >
            New Registration
          </button>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-xl text-red-700 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {tab === "register" && (
            <>
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Full Legal Name</label>
                <div className="relative">
                  <User className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
                  <input
                    type="text"
                    required
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="e.g. Ramesh Kumar"
                    className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-[#E05A1B]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Mobile Phone</label>
                <div className="relative">
                  <Phone className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
                  <input
                    type="tel"
                    required
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="e.g. 9876543210"
                    className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-[#E05A1B]"
                  />
                </div>
              </div>
            </>
          )}

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Email Address</label>
            <div className="relative">
              <Mail className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@example.com"
                className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-[#E05A1B]"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Password</label>
            <div className="relative">
              <Lock className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-[#E05A1B]"
              />
            </div>
          </div>

          {tab === "register" && (
            <div className="p-3 bg-orange-50 border border-orange-200 rounded-xl flex items-start gap-2.5">
              <input
                type="checkbox"
                id="isSellerCheck"
                checked={isSeller}
                onChange={(e) => setIsSeller(e.target.checked)}
                className="w-4 h-4 text-[#E05A1B] rounded mt-0.5"
              />
              <label htmlFor="isSellerCheck" className="text-[11px] text-slate-700 leading-snug">
                I want to submit a private vehicle for Bharat Motor Club acquisition review
              </label>
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 bg-[#E05A1B] hover:bg-[#C84B12] text-white text-xs font-bold rounded-xl shadow-md transition-colors flex items-center justify-center gap-1.5 disabled:opacity-50 mt-2"
          >
            <span>{loading ? "Processing..." : tab === "signin" ? "Sign In" : "Complete Registration"}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>

        <div className="mt-6 pt-4 border-t border-slate-100 text-center text-[11px] text-slate-400">
          Local Development Admin: <br />
          <code className="text-slate-600 font-mono">admin@bharatmotorclub.local</code> /{" "}
          <code className="text-slate-600 font-mono">Bmc@2026!ChangeMe</code>
        </div>
      </div>
    </div>
  );
}

