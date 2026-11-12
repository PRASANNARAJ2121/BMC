"use client";

import React, { useState, useEffect } from "react";
import {
  Bot,
  Sparkles,
  ShieldCheck,
  Save,
  RotateCcw,
  CheckCircle2,
  AlertCircle,
  Sliders,
  Cpu,
  Layers,
  Terminal,
} from "lucide-react";

interface AIPromptTemplate {
  id: string;
  name: string;
  code: string;
  targetRole: string;
  versionNumber: number;
  systemPrompt: string;
  temperature: number;
  maxTokens: number;
  approvalStatus: string;
  allowedTools: string[];
}

export default function AdminPromptsPage() {
  const [prompts, setPrompts] = useState<AIPromptTemplate[]>([]);
  const [selectedPrompt, setSelectedPrompt] = useState<AIPromptTemplate | null>(null);
  const [loading, setLoading] = useState(true);

  // Edit form state
  const [systemPrompt, setSystemPrompt] = useState("");
  const [temperature, setTemperature] = useState(0.3);
  const [maxTokens, setMaxTokens] = useState(1024);
  const [approvalStatus, setApprovalStatus] = useState("APPROVED");
  const [saving, setSaving] = useState(false);
  const [feedback, setFeedback] = useState<{ type: "success" | "error"; message: string } | null>(null);

  const fetchPrompts = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/prompts");
      if (res.status === 401 || res.status === 403) {
        window.location.href = "/auth/signin?callbackUrl=/admin/prompts";
        return;
      }
      const data = await res.json();
      if (data.prompts) {
        setPrompts(data.prompts);
        if (!selectedPrompt && data.prompts.length > 0) {
          selectPrompt(data.prompts[0]);
        } else if (selectedPrompt) {
          const updated = data.prompts.find((p: AIPromptTemplate) => p.id === selectedPrompt.id);
          if (updated) selectPrompt(updated);
        }
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const selectPrompt = (p: AIPromptTemplate) => {
    setSelectedPrompt(p);
    setSystemPrompt(p.systemPrompt);
    setTemperature(p.temperature);
    setMaxTokens(p.maxTokens);
    setApprovalStatus(p.approvalStatus);
    setFeedback(null);
  };

  useEffect(() => {
    fetchPrompts();
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedPrompt) return;
    setSaving(true);
    setFeedback(null);

    try {
      const res = await fetch("/api/admin/prompts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: selectedPrompt.id,
          systemPrompt,
          temperature,
          maxTokens,
          approvalStatus,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to save prompt template");

      setFeedback({
        type: "success",
        message: `Saved! Incremented to version v${data.prompt.versionNumber}`,
      });
      fetchPrompts();
    } catch (err: unknown) {
      setFeedback({
        type: "error",
        message: err instanceof Error ? err.message : "Error updating prompt template",
      });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="py-8 bg-slate-950 text-slate-100 min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="pb-6 border-b border-slate-800 mb-6">
          <div className="flex items-center gap-2 text-xs font-bold text-[#E05A1B] uppercase tracking-wider mb-1">
            <Cpu className="w-4 h-4" />
            <span>AI Platform Governance</span>
          </div>
          <h1 className="text-2xl font-black text-white">Prompt Studio & Role-Governed Personas</h1>
          <p className="text-xs text-slate-400 mt-1">
            Configure system instructions, tool execution scopes, and version histories for the 12 division-specific AI agents.
          </p>
        </div>

        {/* Studio Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left Column: 12 Personas */}
          <div className="lg:col-span-4 space-y-2">
            <div className="text-xs font-semibold text-slate-400 mb-1 flex items-center justify-between">
              <span>Persona Agents ({prompts.length})</span>
              <span className="text-[10px] text-emerald-400 font-mono">100% RBAC Protected</span>
            </div>

            {loading ? (
              <div className="p-8 text-center bg-slate-900 rounded-xl border border-slate-800 text-slate-400 text-xs">
                Loading AI personas...
              </div>
            ) : (
              prompts.map((p) => {
                const isSelected = selectedPrompt?.id === p.id;
                return (
                  <div
                    key={p.id}
                    onClick={() => selectPrompt(p)}
                    className={`p-3 rounded-xl border cursor-pointer transition-all ${
                      isSelected
                        ? "bg-slate-900 border-[#E05A1B] ring-1 ring-[#E05A1B]"
                        : "bg-slate-900/50 border-slate-800 hover:bg-slate-900 hover:border-slate-700"
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <h4 className="text-xs font-bold text-white flex items-center gap-1.5">
                        <Bot className={`w-3.5 h-3.5 ${isSelected ? "text-[#E05A1B]" : "text-slate-400"}`} />
                        <span>{p.name}</span>
                      </h4>
                      <span className="text-[10px] font-mono font-bold px-1.5 py-0.5 rounded bg-slate-800 text-slate-300">
                        v{p.versionNumber}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 mt-2 text-[10px] text-slate-400">
                      <span className="px-1.5 py-0.5 rounded bg-slate-950 font-mono text-slate-300">
                        {p.targetRole}
                      </span>
                      <span>•</span>
                      <span>{p.allowedTools?.length || 0} tools</span>
                    </div>
                  </div>
                );
              })
            )}
          </div>

          {/* Right Column: Prompt Editor & Hyperparameters */}
          <div className="lg:col-span-8">
            {selectedPrompt ? (
              <form
                onSubmit={handleSave}
                className="bg-slate-900 border border-slate-800 rounded-xl p-6 space-y-5 sticky top-20"
              >
                {/* Header */}
                <div className="flex items-start justify-between border-b border-slate-800 pb-4">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-mono font-bold text-[#E05A1B]">
                        {selectedPrompt.code}
                      </span>
                      <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-slate-800 text-slate-300">
                        Version {selectedPrompt.versionNumber}
                      </span>
                    </div>
                    <h3 className="text-lg font-bold text-white mt-1">{selectedPrompt.name}</h3>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      type="submit"
                      disabled={saving}
                      className="flex items-center space-x-1.5 px-4 py-2 bg-[#E05A1B] hover:bg-[#C84B12] disabled:opacity-50 text-white rounded-lg text-xs font-bold transition-colors shadow-sm"
                    >
                      <Save className="w-3.5 h-3.5" />
                      <span>{saving ? "Saving..." : "Save New Version"}</span>
                    </button>
                  </div>
                </div>

                {feedback && (
                  <div
                    className={`p-3 rounded-lg text-xs flex items-center gap-2 ${
                      feedback.type === "success"
                        ? "bg-emerald-950/60 border border-emerald-800 text-emerald-300"
                        : "bg-rose-950/60 border border-rose-800 text-rose-300"
                    }`}
                  >
                    {feedback.type === "success" ? (
                      <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
                    ) : (
                      <AlertCircle className="w-4 h-4 flex-shrink-0" />
                    )}
                    <span>{feedback.message}</span>
                  </div>
                )}

                {/* Hyperparameters */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 bg-slate-950/60 p-4 rounded-lg border border-slate-800 text-xs">
                  <div>
                    <label className="text-slate-400 block mb-1 flex justify-between">
                      <span>Temperature</span>
                      <span className="text-[#E05A1B] font-mono font-bold">{temperature}</span>
                    </label>
                    <input
                      type="range"
                      min="0"
                      max="1"
                      step="0.05"
                      value={temperature}
                      onChange={(e) => setTemperature(parseFloat(e.target.value))}
                      className="w-full accent-[#E05A1B]"
                    />
                  </div>

                  <div>
                    <label className="text-slate-400 block mb-1">Max Output Tokens</label>
                    <select
                      value={maxTokens}
                      onChange={(e) => setMaxTokens(parseInt(e.target.value))}
                      className="w-full px-2.5 py-1.5 bg-slate-900 border border-slate-800 rounded text-xs text-white"
                    >
                      <option value="512">512 tokens</option>
                      <option value="1024">1024 tokens</option>
                      <option value="2048">2048 tokens</option>
                      <option value="4096">4096 tokens</option>
                    </select>
                  </div>

                  <div>
                    <label className="text-slate-400 block mb-1">Approval Status</label>
                    <select
                      value={approvalStatus}
                      onChange={(e) => setApprovalStatus(e.target.value)}
                      className="w-full px-2.5 py-1.5 bg-slate-900 border border-slate-800 rounded text-xs text-white"
                    >
                      <option value="APPROVED">APPROVED (Active)</option>
                      <option value="DRAFT">DRAFT (Testing)</option>
                    </select>
                  </div>
                </div>

                {/* Allowed Tools Scopes */}
                <div>
                  <label className="text-xs font-bold text-slate-300 uppercase tracking-wider block mb-2 flex items-center gap-1.5">
                    <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                    <span>Enforced Tool Execution Scope (Read/Write Boundaries)</span>
                  </label>
                  <div className="flex flex-wrap gap-1.5">
                    {selectedPrompt.allowedTools && selectedPrompt.allowedTools.length > 0 ? (
                      selectedPrompt.allowedTools.map((t) => (
                        <span
                          key={t}
                          className="px-2 py-1 rounded bg-slate-950 border border-slate-800 text-[11px] font-mono text-emerald-300"
                        >
                          {t}
                        </span>
                      ))
                    ) : (
                      <span className="text-xs text-slate-500">No external tool access granted.</span>
                    )}
                  </div>
                </div>

                {/* System Prompt Instructions Editor */}
                <div>
                  <label className="text-xs font-bold text-slate-300 uppercase tracking-wider block mb-2 flex items-center justify-between">
                    <span>System Prompt Instructions</span>
                    <span className="text-[11px] text-slate-500 font-mono">
                      {systemPrompt.length} characters
                    </span>
                  </label>
                  <textarea
                    rows={12}
                    required
                    value={systemPrompt}
                    onChange={(e) => setSystemPrompt(e.target.value)}
                    className="w-full p-4 bg-slate-950 border border-slate-800 rounded-lg text-xs font-mono text-slate-200 leading-relaxed focus:outline-none focus:border-[#E05A1B]"
                  />
                </div>
              </form>
            ) : (
              <div className="bg-slate-900/40 border border-slate-800 rounded-xl p-12 text-center text-slate-500 text-xs">
                Select an AI persona from the left list to inspect system instructions, calibrate temperature, or deploy new prompt revisions.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

