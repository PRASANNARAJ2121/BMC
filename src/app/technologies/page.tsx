"use client";

import React, { useState, useRef, useEffect } from "react";
import { Sparkles, Bot, ShieldCheck, Send, ChevronDown } from "lucide-react";

const AGENTS = [
  {
    id: "public_customer_assistant",
    label: "🏠 Public Concierge",
    description: "General questions about BMC divisions, services, and bookings",
    public: true,
  },
  {
    id: "buyer_vehicle_discovery",
    label: "🚗 Vehicle Discovery",
    description: "Browse & discover certified company-owned resale inventory",
    public: true,
  },
  {
    id: "diagnostic_advisor",
    label: "🔧 Diagnostic Advisor",
    description: "OBD-II fault code guidance and symptom-based diagnosis",
    public: true,
  },
  {
    id: "parts_recommender",
    label: "⚙️ Parts Recommender",
    description: "Find genuine spare parts for your vehicle make & model",
    public: true,
  },
  {
    id: "fleet_advisor",
    label: "🚛 Fleet Advisor",
    description: "Corporate fleet maintenance scheduling and cost analysis",
    public: true,
  },
  {
    id: "garage_service_assistant",
    label: "🛠️ Garage Service",
    description: "Labour estimates and workshop service suggestions",
    public: true,
  },
  {
    id: "membership_support_assistant",
    label: "🏅 Membership Support",
    description: "Club tier benefits, renewals, and discount eligibility",
    public: true,
  },
  {
    id: "electrical_electronics_ac_assistant",
    label: "⚡ Electricals & AC",
    description: "Specialist diagnosis for wiring, ECU, battery, and AC faults",
    public: true,
  },
];

const GREETINGS: Record<string, string> = {
  public_customer_assistant:
    "Hello! I'm the BMC Concierge. Ask me anything about our 10 automotive divisions — buying, selling, servicing, or membership.",
  buyer_vehicle_discovery:
    "Hi! I can show you available certified company-owned vehicles. Tell me your preferred make, budget, or body type.",
  diagnostic_advisor:
    "Hello! Share your vehicle's symptoms or OBD-II fault codes and I'll help you identify likely causes and next steps.",
  parts_recommender:
    "Hi! Tell me your vehicle make, model, year, and the part you need — I'll check our genuine parts catalogue for fitment and availability.",
  fleet_advisor:
    "Hello! I'm the BMC Fleet Advisor. Share your fleet size or company name and I'll provide maintenance recommendations and scheduling insights.",
  garage_service_assistant:
    "Hi! Describe your vehicle's issue and I'll suggest the appropriate workshop services and estimated labour scope.",
  membership_support_assistant:
    "Hello! I can help you understand your Club Membership benefits, check renewal dates, and explain tier upgrade options.",
  electrical_electronics_ac_assistant:
    "Hi! I specialise in Electricals, Electronics, and AC systems. Describe your fault — battery, wiring, ECU, infotainment, or cooling — and I'll guide you.",
};

export default function TechnologiesPage() {
  const [selectedAgent, setSelectedAgent] = useState(AGENTS[0]);
  const [query, setQuery] = useState("");
  const [chatLog, setChatLog] = useState<{ role: string; text: string }[]>([
    { role: "assistant", text: GREETINGS[AGENTS[0].id] },
  ]);
  const [loading, setLoading] = useState(false);
  const [showAgentPicker, setShowAgentPicker] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [chatLog, loading]);

  const switchAgent = (agent: (typeof AGENTS)[0]) => {
    setSelectedAgent(agent);
    setShowAgentPicker(false);
    setChatLog([{ role: "assistant", text: GREETINGS[agent.id] || `Switched to ${agent.label}. How can I help?` }]);
    setQuery("");
  };

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim() || loading) return;

    const userMessage = query.trim();
    setChatLog((prev) => [...prev, { role: "user", text: userMessage }]);
    setQuery("");
    setLoading(true);

    try {
      const res = await fetch("/api/ai/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          agentType: selectedAgent.id,
          query: userMessage,
        }),
      });

      const data = await res.json();
      setChatLog((prev) => [
        ...prev,
        {
          role: "assistant",
          text:
            data.reply ||
            "I'm currently running in verified deterministic local mode. Please explore our service pages for more information.",
        },
      ]);
    } catch {
      setChatLog((prev) => [
        ...prev,
        {
          role: "assistant",
          text: "Service temporarily unavailable. Please contact our central support desk.",
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="py-12 bg-slate-50 min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Hero */}
        <div className="bg-slate-900 rounded-3xl p-8 sm:p-12 text-white mb-12 border border-slate-800">
          <div className="max-w-2xl">
            <span className="text-xs font-bold uppercase tracking-widest text-[#E05A1B]">
              BMC Automotive Technologies
            </span>
            <h1 className="mt-2 text-3xl sm:text-5xl font-black tracking-tight text-white">
              Role-Governed Automotive AI Platform
            </h1>
            <p className="mt-4 text-sm sm:text-base text-slate-300 leading-relaxed">
              AI within Bharat Motor Club operates as an assistive intelligence layer strictly bounded by verified
              database records and server-side role permissions. AI never makes independent legal, safety, pricing, or
              purchase approvals.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
          {/* Left: Live Interactive Chat */}
          <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm flex flex-col h-[600px]">
            {/* Agent Selector */}
            <div className="relative mb-4">
              <button
                onClick={() => setShowAgentPicker((v) => !v)}
                className="w-full flex items-center justify-between gap-3 p-3 bg-slate-50 border border-slate-200 rounded-xl hover:bg-slate-100 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-orange-100 text-[#E05A1B] flex items-center justify-center">
                    <Bot className="w-4 h-4" />
                  </div>
                  <div className="text-left">
                    <div className="text-xs font-bold text-slate-900">{selectedAgent.label}</div>
                    <div className="text-[10px] text-slate-500">{selectedAgent.description}</div>
                  </div>
                </div>
                <ChevronDown className={`w-4 h-4 text-slate-400 transition-transform ${showAgentPicker ? "rotate-180" : ""}`} />
              </button>

              {showAgentPicker && (
                <div className="absolute z-20 top-full left-0 right-0 mt-1 bg-white border border-slate-200 rounded-2xl shadow-xl overflow-hidden">
                  {AGENTS.map((agent) => (
                    <button
                      key={agent.id}
                      onClick={() => switchAgent(agent)}
                      className={`w-full flex items-start gap-3 px-4 py-3 text-left hover:bg-slate-50 transition-colors ${
                        selectedAgent.id === agent.id ? "bg-orange-50 border-l-2 border-[#E05A1B]" : ""
                      }`}
                    >
                      <div>
                        <div className="text-xs font-semibold text-slate-900">{agent.label}</div>
                        <div className="text-[10px] text-slate-500">{agent.description}</div>
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Status Badge */}
            <div className="flex items-center gap-2 pb-3 border-b border-slate-100 mb-2">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span className="text-[10px] text-emerald-600 font-semibold">
                Verified Deterministic Mode — Sandbox Safe
              </span>
            </div>

            {/* Chat Messages */}
            <div className="flex-1 overflow-y-auto py-2 space-y-3 pr-1 text-xs">
              {chatLog.map((msg, i) => (
                <div key={i} className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
                  <div
                    className={`max-w-[85%] rounded-2xl px-4 py-2.5 leading-relaxed whitespace-pre-wrap ${
                      msg.role === "user" ? "bg-[#E05A1B] text-white" : "bg-slate-100 text-slate-800"
                    }`}
                  >
                    {msg.text}
                  </div>
                </div>
              ))}
              {loading && (
                <div className="flex justify-start">
                  <div className="bg-slate-100 text-slate-500 rounded-2xl px-4 py-2 text-xs italic">
                    Retrieving verified automotive data...
                  </div>
                </div>
              )}
              <div ref={chatEndRef} />
            </div>

            {/* Input Bar */}
            <form onSubmit={handleSend} className="pt-3 border-t border-slate-100 flex gap-2">
              <input
                type="text"
                placeholder={`Ask ${selectedAgent.label}...`}
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                className="flex-1 px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-[#E05A1B]"
              />
              <button
                type="submit"
                disabled={loading || !query.trim()}
                className="px-4 py-2.5 bg-[#E05A1B] hover:bg-[#C84B12] text-white rounded-xl text-xs font-bold transition-colors disabled:opacity-50 flex items-center gap-1"
              >
                <Send className="w-4 h-4" />
              </button>
            </form>
          </div>

          {/* Right: Architecture & Governance */}
          <div className="space-y-6">
            <div className="bg-white rounded-3xl p-8 border border-slate-200 shadow-sm">
              <h3 className="text-base font-bold text-slate-900 mb-4 flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-emerald-600" />
                <span>14 Role-Limited Agent Architecture</span>
              </h3>
              <p className="text-xs text-slate-600 leading-relaxed mb-4">
                Every agent enforces strict server-side role boundaries. Public agents never access private acquisition
                data, seller identities, or internal pricing.
              </p>
              <div className="grid grid-cols-2 gap-2 text-xs">
                {[
                  "1. Public Customer Concierge",
                  "2. Vehicle Resale Discovery",
                  "3. Private Seller Advisor",
                  "4. Acquisition Case Summarizer",
                  "5. Valuation Researcher",
                  "6. Technical Inspection Drafter",
                  "7. Garage Labour Assistant",
                  "8. Electrical & AC Specialist",
                  "9. Parts Fitment Verifier",
                  "10. Fleet Account Manager",
                  "11. Club Membership Advisor",
                  "12. Executive Management Copilot",
                  "13. Diagnostic Advisor",
                  "14. Parts Recommender",
                ].map((agent) => (
                  <div key={agent} className="p-2.5 bg-slate-50 rounded-xl font-medium text-slate-800">
                    {agent}
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm">
              <h3 className="text-sm font-bold text-slate-900 mb-3 flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-[#E05A1B]" />
                AI Governance Guarantees
              </h3>
              <ul className="space-y-2 text-xs text-slate-600">
                {[
                  "All responses grounded in verified database records",
                  "Seller identity & acquisition price never exposed to AI",
                  "Every AI interaction logged to immutable AIAuditLog",
                  "Role permissions enforced server-side, not by prompt",
                  "Deterministic fallback when Gemini API key not configured",
                  "No AI approval for legal, safety, or financial decisions",
                ].map((point) => (
                  <li key={point} className="flex items-start gap-2">
                    <span className="text-emerald-500 mt-0.5">✓</span>
                    {point}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
