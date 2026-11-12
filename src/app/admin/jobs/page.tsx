"use client";

import React, { useState, useEffect } from "react";
import {
  Wrench,
  Car,
  Clock,
  User,
  Plus,
  Receipt,
  CheckCircle2,
  AlertCircle,
  FileText,
  DollarSign,
  Package,
  RefreshCw,
  Search,
  Check,
  Send,
  Zap,
  Cpu,
  Wind,
} from "lucide-react";

interface JobTask {
  id: string;
  description: string;
  category: string;
  estimatedHours: number;
  labourRate: number;
  totalLabourCost: number;
  status: string;
}

interface PartConsumption {
  id: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
  product: {
    sku: string;
    name: string;
  };
}

interface Estimate {
  id: string;
  estimateNumber: string;
  grandTotal: number;
  status: string;
  customerApprovedAt: string | null;
  customerSignatureNote: string | null;
}

interface Invoice {
  id: string;
  invoiceNumber: string;
  subtotal: number;
  cgstAmount: number;
  sgstAmount: number;
  grandTotal: number;
  paymentStatus: string;
  paymentMethod: string | null;
}

interface JobCard {
  id: string;
  jobNumber: string;
  category: string;
  status: string;
  vehicleRegNumber: string;
  vehicleMake: string;
  vehicleModel: string;
  odometerIn: number;
  customerName: string;
  customerPhone: string;
  customerEmail: string | null;
  customerNotes: string | null;
  labourTotal: number;
  partsTotal: number;
  taxTotal: number;
  grandTotal: number;
  createdAt: string;
  tasks: JobTask[];
  partConsumptions: PartConsumption[];
  estimates: Estimate[];
  invoices: Invoice[];
}

interface Product {
  id: string;
  sku: string;
  name: string;
  stockQuantity: number;
  sellingPrice: number;
}

const CATEGORIES = [
  "ALL",
  "MECHANICAL",
  "ELECTRICAL",
  "ELECTRONICS",
  "AIR_CONDITIONING",
  "GENERAL_SERVICE",
];

const STATUSES = [
  "ALL",
  "OPEN",
  "ESTIMATE_PENDING",
  "ESTIMATE_APPROVED",
  "IN_PROGRESS",
  "READY_FOR_INVOICE",
  "INVOICED",
  "DELIVERED",
];

export default function AdminJobsPage() {
  const [jobs, setJobs] = useState<JobCard[]>([]);
  const [availableProducts, setAvailableProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState("ALL");
  const [selectedStatus, setSelectedStatus] = useState("ALL");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedJob, setSelectedJob] = useState<JobCard | null>(null);

  // New Job Modal state
  const [isCreatingJob, setIsCreatingJob] = useState(false);
  const [newCustomerName, setNewCustomerName] = useState("");
  const [newCustomerPhone, setNewCustomerPhone] = useState("");
  const [newVehicleMake, setNewVehicleMake] = useState("Hyundai");
  const [newVehicleModel, setNewVehicleModel] = useState("Creta 1.5 SX");
  const [newVehicleReg, setNewVehicleReg] = useState("DL-01-AB-1234");
  const [newCategory, setNewCategory] = useState("MECHANICAL");
  const [newOdometer, setNewOdometer] = useState("35000");
  const [newNotes, setNewNotes] = useState("Scheduled maintenance and fluid inspection");

  // Action states
  const [actionType, setActionType] = useState<string>("");
  const [taskDescription, setTaskDescription] = useState("");
  const [taskHours, setTaskHours] = useState("1.5");
  const [labourRate, setLabourRate] = useState("650");
  const [selectedProductId, setSelectedProductId] = useState("");
  const [partQuantity, setPartQuantity] = useState("1");
  const [approvalNote, setApprovalNote] = useState("Approved verbally via customer phone authorization");
  const [actionLoading, setActionLoading] = useState(false);
  const [feedback, setFeedback] = useState<{ type: "success" | "error"; message: string } | null>(null);

  const fetchJobs = async () => {
    setLoading(true);
    try {
      let url = "/api/admin/jobs?";
      if (selectedCategory !== "ALL") url += `category=${selectedCategory}&`;
      if (selectedStatus !== "ALL") url += `status=${selectedStatus}&`;

      const res = await fetch(url);
      if (res.status === 401 || res.status === 403) {
        window.location.href = "/auth/signin?callbackUrl=/admin/jobs";
        return;
      }
      const data = await res.json();
      if (data.jobs) {
        setJobs(data.jobs);
        if (selectedJob) {
          const updated = data.jobs.find((j: JobCard) => j.id === selectedJob.id);
          if (updated) setSelectedJob(updated);
        }
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const fetchProducts = async () => {
    try {
      const res = await fetch("/api/products");
      const data = await res.json();
      if (data.products) setAvailableProducts(data.products);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchJobs();
    fetchProducts();
  }, [selectedCategory, selectedStatus]);

  const handleCreateJob = async (e: React.FormEvent) => {
    e.preventDefault();
    setActionLoading(true);
    setFeedback(null);

    try {
      const res = await fetch("/api/admin/jobs", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          category: newCategory,
          customerName: newCustomerName,
          customerPhone: newCustomerPhone,
          vehicleMake: newVehicleMake,
          vehicleModel: newVehicleModel,
          vehicleRegNumber: newVehicleReg,
          odometerIn: Number(newOdometer),
          customerNotes: newNotes,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to create job card");

      setIsCreatingJob(false);
      setFeedback({ type: "success", message: `Job card ${data.job.jobNumber} opened successfully!` });
      fetchJobs();
    } catch (err: unknown) {
      setFeedback({
        type: "error",
        message: err instanceof Error ? err.message : "Error creating job card",
      });
    } finally {
      setActionLoading(false);
    }
  };

  const handleJobAction = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedJob) return;
    setActionLoading(true);
    setFeedback(null);

    let payload: Record<string, unknown> = { action: actionType };

    if (actionType === "ADD_TASK") {
      payload = {
        action: "ADD_TASK",
        description: taskDescription,
        category: selectedJob.category,
        estimatedHours: Number(taskHours),
        labourRate: Number(labourRate),
      };
    } else if (actionType === "CONSUME_PART") {
      payload = {
        action: "CONSUME_PART",
        productId: selectedProductId,
        quantity: Number(partQuantity),
      };
    } else if (actionType === "CREATE_ESTIMATE") {
      payload = { action: "CREATE_ESTIMATE", items: [] };
    } else if (actionType === "APPROVE_ESTIMATE") {
      const latestEstimate = selectedJob.estimates[0];
      if (!latestEstimate) {
        setFeedback({ type: "error", message: "No estimate exists to approve. Create estimate first." });
        setActionLoading(false);
        return;
      }
      payload = {
        action: "APPROVE_ESTIMATE",
        estimateId: latestEstimate.id,
        signatureNote: approvalNote,
      };
    } else if (actionType === "GENERATE_INVOICE") {
      payload = { action: "GENERATE_INVOICE", paymentMethod: "UPI" };
    } else if (actionType === "DELIVER_VEHICLE") {
      payload = {
        action: "DELIVER_VEHICLE",
        odometerOut: selectedJob.odometerIn + 5,
        serviceSummary: `Comprehensive workshop service completed for ${selectedJob.category}. Verified all systems operational.`,
        nextServiceMonths: 6,
        nextServiceKmInterval: 10000,
      };
    }

    try {
      const res = await fetch(`/api/admin/jobs/${selectedJob.id}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to execute workshop action");

      setFeedback({ type: "success", message: `Action "${actionType}" executed successfully!` });
      setActionType("");
      fetchJobs();
      fetchProducts();
    } catch (err: unknown) {
      setFeedback({
        type: "error",
        message: err instanceof Error ? err.message : "Error executing workshop action",
      });
    } finally {
      setActionLoading(false);
    }
  };

  const filteredJobs = jobs.filter((j) => {
    const q = searchQuery.toLowerCase();
    const num = j.jobNumber.toLowerCase();
    const cust = j.customerName.toLowerCase();
    const veh = `${j.vehicleMake} ${j.vehicleModel} ${j.vehicleRegNumber}`.toLowerCase();
    return num.includes(q) || cust.includes(q) || veh.includes(q);
  });

  return (
    <div className="py-8 bg-slate-950 text-slate-100 min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between pb-6 border-b border-slate-800 gap-4 mb-6">
          <div>
            <div className="flex items-center gap-2 text-xs font-bold text-[#E05A1B] uppercase tracking-wider mb-1">
              <Wrench className="w-4 h-4" />
              <span>Workshop Service Management</span>
            </div>
            <h1 className="text-2xl font-black text-white">Workshop Job Cards & Diagnostics</h1>
            <p className="text-xs text-slate-400 mt-1">
              Integrated mechanical, electrical, electronics & AC work orders with inventory deduction and 18% GST tax invoicing.
            </p>
          </div>
          <div className="flex items-center gap-2 self-start md:self-auto">
            <button
              onClick={() => setIsCreatingJob(true)}
              className="flex items-center space-x-1.5 px-3.5 py-2 bg-[#E05A1B] hover:bg-[#C84B12] text-white rounded-lg text-xs font-bold transition-colors shadow-sm"
            >
              <Plus className="w-4 h-4" />
              <span>Open Job Card</span>
            </button>
            <button
              onClick={fetchJobs}
              className="flex items-center space-x-1 px-3 py-2 bg-slate-900 hover:bg-slate-800 border border-slate-700 rounded-lg text-xs font-semibold text-slate-300 transition-colors"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} />
            </button>
          </div>
        </div>

        {/* Filters */}
        <div className="flex flex-col md:flex-row gap-3 mb-6">
          <div className="relative flex-1">
            <Search className="w-4 h-4 absolute left-3 top-3 text-slate-500" />
            <input
              type="text"
              placeholder="Search by job #, customer, or vehicle registration..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2 bg-slate-900 border border-slate-800 rounded-lg text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-[#E05A1B]"
            />
          </div>
          <div className="flex items-center overflow-x-auto pb-1 gap-1 text-xs">
            {CATEGORIES.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-2.5 py-1.5 rounded font-medium whitespace-nowrap transition-colors ${
                  selectedCategory === cat
                    ? "bg-[#E05A1B] text-white"
                    : "bg-slate-900 text-slate-400 hover:text-white"
                }`}
              >
                {cat.replace(/_/g, " ")}
              </button>
            ))}
          </div>
        </div>

        {/* Modal: Create Job Card */}
        {isCreatingJob && (
          <div className="fixed inset-0 bg-black/70 flex items-center justify-center p-4 z-50">
            <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 max-w-lg w-full space-y-4">
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <h3 className="text-sm font-bold text-white flex items-center gap-2">
                  <Wrench className="w-4 h-4 text-[#E05A1B]" />
                  <span>Open New Workshop Job Card</span>
                </h3>
                <button
                  onClick={() => setIsCreatingJob(false)}
                  className="text-slate-400 hover:text-white text-xs"
                >
                  ✕
                </button>
              </div>

              <form onSubmit={handleCreateJob} className="space-y-3 text-xs">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-slate-400 block mb-1">Customer Name</label>
                    <input
                      type="text"
                      required
                      value={newCustomerName}
                      onChange={(e) => setNewCustomerName(e.target.value)}
                      placeholder="e.g. Vikram Malhotra"
                      className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded text-white"
                    />
                  </div>
                  <div>
                    <label className="text-slate-400 block mb-1">Customer Phone</label>
                    <input
                      type="text"
                      required
                      value={newCustomerPhone}
                      onChange={(e) => setNewCustomerPhone(e.target.value)}
                      placeholder="e.g. +91 98765 43210"
                      className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded text-white"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-3">
                  <div>
                    <label className="text-slate-400 block mb-1">Make</label>
                    <input
                      type="text"
                      required
                      value={newVehicleMake}
                      onChange={(e) => setNewVehicleMake(e.target.value)}
                      className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded text-white"
                    />
                  </div>
                  <div>
                    <label className="text-slate-400 block mb-1">Model</label>
                    <input
                      type="text"
                      required
                      value={newVehicleModel}
                      onChange={(e) => setNewVehicleModel(e.target.value)}
                      className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded text-white"
                    />
                  </div>
                  <div>
                    <label className="text-slate-400 block mb-1">Reg Number</label>
                    <input
                      type="text"
                      required
                      value={newVehicleReg}
                      onChange={(e) => setNewVehicleReg(e.target.value)}
                      className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded text-white font-mono"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-slate-400 block mb-1">Division / Category</label>
                    <select
                      value={newCategory}
                      onChange={(e) => setNewCategory(e.target.value)}
                      className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded text-white"
                    >
                      <option value="MECHANICAL">Mechanical & Garage</option>
                      <option value="ELECTRICAL">Automotive Electricals</option>
                      <option value="ELECTRONICS">Electronics & ECU</option>
                      <option value="AIR_CONDITIONING">Car Air-Conditioning</option>
                      <option value="GENERAL_SERVICE">Periodic Maintenance</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-slate-400 block mb-1">Odometer (km)</label>
                    <input
                      type="number"
                      required
                      value={newOdometer}
                      onChange={(e) => setNewOdometer(e.target.value)}
                      className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded text-white font-mono"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-slate-400 block mb-1">Reported Issue / Customer Notes</label>
                  <textarea
                    rows={2}
                    value={newNotes}
                    onChange={(e) => setNewNotes(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded text-white"
                  />
                </div>

                <div className="flex justify-end gap-2 pt-2 border-t border-slate-800">
                  <button
                    type="button"
                    onClick={() => setIsCreatingJob(false)}
                    className="px-3 py-1.5 text-slate-400 hover:text-white"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={actionLoading}
                    className="px-4 py-1.5 bg-[#E05A1B] hover:bg-[#C84B12] disabled:opacity-50 text-white font-bold rounded"
                  >
                    {actionLoading ? "Opening..." : "Create Work Order"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Main Grid: Job Cards & Service Terminal */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left Column: Job Cards List */}
          <div className="lg:col-span-5 space-y-3">
            <div className="text-xs font-semibold text-slate-400 mb-1">
              Work Orders ({filteredJobs.length})
            </div>
            {filteredJobs.length === 0 ? (
              <div className="p-8 text-center bg-slate-900/50 rounded-xl border border-slate-800 text-slate-500 text-xs">
                No job cards found matching active filters.
              </div>
            ) : (
              filteredJobs.map((j) => {
                const isSelected = selectedJob?.id === j.id;
                return (
                  <div
                    key={j.id}
                    onClick={() => {
                      setSelectedJob(j);
                      setActionType("");
                      setFeedback(null);
                    }}
                    className={`p-4 rounded-xl border cursor-pointer transition-all ${
                      isSelected
                        ? "bg-slate-900 border-[#E05A1B] ring-1 ring-[#E05A1B]"
                        : "bg-slate-900/60 border-slate-800 hover:bg-slate-900 hover:border-slate-700"
                    }`}
                  >
                    <div className="flex items-start justify-between mb-1.5">
                      <div>
                        <span className="text-[11px] font-mono font-bold text-slate-300">
                          {j.jobNumber}
                        </span>
                        <h4 className="text-sm font-bold text-white">
                          {j.vehicleMake} {j.vehicleModel}
                        </h4>
                        <span className="text-[11px] font-mono text-slate-400">
                          {j.vehicleRegNumber}
                        </span>
                      </div>
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded uppercase tracking-wider bg-slate-800 text-slate-300 border border-slate-700">
                        {j.status.replace(/_/g, " ")}
                      </span>
                    </div>

                    <div className="text-[11px] text-slate-400 space-y-1 mt-2 border-t border-slate-800/80 pt-2">
                      <div className="flex justify-between">
                        <span>Customer:</span>
                        <span className="text-slate-200 font-medium">{j.customerName}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Division:</span>
                        <span className="text-amber-400 font-medium">{j.category}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Grand Total (incl 18% GST):</span>
                        <span className="text-emerald-400 font-mono font-bold">
                          ₹{Math.round(j.grandTotal).toLocaleString("en-IN")}
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>

          {/* Right Column: Workshop Detail & Terminal */}
          <div className="lg:col-span-7">
            {selectedJob ? (
              <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 space-y-6 sticky top-20">
                {/* Header */}
                <div className="flex items-start justify-between border-b border-slate-800 pb-4">
                  <div>
                    <span className="text-xs font-mono text-[#E05A1B] font-bold">
                      {selectedJob.jobNumber} • {selectedJob.category}
                    </span>
                    <h3 className="text-lg font-bold text-white mt-1">
                      {selectedJob.vehicleMake} {selectedJob.vehicleModel}
                    </h3>
                    <div className="text-xs text-slate-400 mt-1">
                      Reg: <span className="font-mono text-slate-300 font-bold">{selectedJob.vehicleRegNumber}</span> • In: {selectedJob.odometerIn.toLocaleString("en-IN")} km
                    </div>
                  </div>
                  <span className="text-xs font-bold px-2.5 py-1 rounded bg-slate-800 text-slate-200 border border-slate-700">
                    {selectedJob.status}
                  </span>
                </div>

                {/* Customer Details */}
                <div className="bg-slate-950/60 p-3.5 rounded-lg border border-slate-800 text-xs grid grid-cols-2 gap-3">
                  <div>
                    <span className="text-slate-500 block">Customer</span>
                    <span className="text-slate-200 font-medium">{selectedJob.customerName}</span>
                  </div>
                  <div>
                    <span className="text-slate-500 block">Phone</span>
                    <span className="text-slate-200 font-mono">{selectedJob.customerPhone}</span>
                  </div>
                  {selectedJob.customerNotes && (
                    <div className="col-span-2 text-slate-400 pt-1 border-t border-slate-800/60">
                      <span className="text-slate-500 block">Reported Symptom:</span>
                      {selectedJob.customerNotes}
                    </div>
                  )}
                </div>

                {/* Financial Summary */}
                <div className="bg-slate-950/60 p-4 rounded-lg border border-slate-800">
                  <div className="text-xs font-bold text-slate-300 uppercase tracking-wider mb-2">
                    Work Order Billing Ledger
                  </div>
                  <div className="grid grid-cols-4 gap-2 text-xs">
                    <div>
                      <span className="text-slate-500 block">Labour Subtotal</span>
                      <span className="text-slate-200 font-mono font-bold">
                        ₹{selectedJob.labourTotal.toLocaleString("en-IN")}
                      </span>
                    </div>
                    <div>
                      <span className="text-slate-500 block">Parts Subtotal</span>
                      <span className="text-slate-200 font-mono font-bold">
                        ₹{selectedJob.partsTotal.toLocaleString("en-IN")}
                      </span>
                    </div>
                    <div>
                      <span className="text-slate-500 block">GST (18%)</span>
                      <span className="text-slate-200 font-mono font-bold">
                        ₹{Math.round(selectedJob.taxTotal).toLocaleString("en-IN")}
                      </span>
                    </div>
                    <div>
                      <span className="text-slate-500 block">Grand Total</span>
                      <span className="text-emerald-400 font-mono font-black">
                        ₹{Math.round(selectedJob.grandTotal).toLocaleString("en-IN")}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Tasks & Parts Tabs */}
                <div className="space-y-3">
                  <div className="text-xs font-bold text-slate-300 uppercase tracking-wider">
                    Labour Tasks ({selectedJob.tasks.length})
                  </div>
                  {selectedJob.tasks.length === 0 ? (
                    <p className="text-xs text-slate-500">No labour tasks logged yet.</p>
                  ) : (
                    <div className="space-y-1.5">
                      {selectedJob.tasks.map((t) => (
                        <div
                          key={t.id}
                          className="flex items-center justify-between p-2.5 bg-slate-950/50 rounded border border-slate-800 text-xs"
                        >
                          <div>
                            <span className="font-semibold text-slate-200">{t.description}</span>
                            <span className="text-slate-500 text-[11px] block">
                              {t.estimatedHours} hrs @ ₹{t.labourRate}/hr
                            </span>
                          </div>
                          <span className="font-mono font-bold text-slate-300">
                            ₹{t.totalLabourCost.toLocaleString("en-IN")}
                          </span>
                        </div>
                      ))}
                    </div>
                  )}

                  <div className="text-xs font-bold text-slate-300 uppercase tracking-wider pt-2">
                    Spare Parts Consumed ({selectedJob.partConsumptions.length})
                  </div>
                  {selectedJob.partConsumptions.length === 0 ? (
                    <p className="text-xs text-slate-500">No spare parts consumed for this order.</p>
                  ) : (
                    <div className="space-y-1.5">
                      {selectedJob.partConsumptions.map((p) => (
                        <div
                          key={p.id}
                          className="flex items-center justify-between p-2.5 bg-slate-950/50 rounded border border-slate-800 text-xs"
                        >
                          <div>
                            <span className="font-semibold text-slate-200">{p.product?.name}</span>
                            <span className="text-slate-500 text-[11px] block font-mono">
                              SKU: {p.product?.sku} • Qty: {p.quantity} @ ₹{p.unitPrice}
                            </span>
                          </div>
                          <span className="font-mono font-bold text-slate-300">
                            ₹{p.totalPrice.toLocaleString("en-IN")}
                          </span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Workshop Action Buttons */}
                <div className="border-t border-slate-800 pt-4 space-y-4">
                  <div className="text-xs font-bold text-slate-300 uppercase tracking-wider">
                    Technician & Advisor Actions
                  </div>

                  {feedback && (
                    <div
                      className={`p-3 rounded-lg text-xs flex items-center gap-2 ${
                        feedback.type === "success"
                          ? "bg-emerald-950/60 border border-emerald-800 text-emerald-300"
                          : "bg-rose-950/60 border border-rose-800 text-rose-300"
                      }`}
                    >
                      <AlertCircle className="w-4 h-4 flex-shrink-0" />
                      <span>{feedback.message}</span>
                    </div>
                  )}

                  <div className="flex flex-wrap gap-2">
                    <button
                      onClick={() => setActionType("ADD_TASK")}
                      className="px-3 py-1.5 rounded text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700"
                    >
                      + Labour Task
                    </button>
                    <button
                      onClick={() => setActionType("CONSUME_PART")}
                      className="px-3 py-1.5 rounded text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700"
                    >
                      + Consume Part
                    </button>
                    <button
                      onClick={() => setActionType("CREATE_ESTIMATE")}
                      className="px-3 py-1.5 rounded text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700"
                    >
                      Generate Estimate
                    </button>
                    <button
                      onClick={() => setActionType("APPROVE_ESTIMATE")}
                      className="px-3 py-1.5 rounded text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700"
                    >
                      Record Customer Approval
                    </button>
                    <button
                      onClick={() => setActionType("GENERATE_INVOICE")}
                      className="px-3 py-1.5 rounded text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 flex items-center gap-1"
                    >
                      <Receipt className="w-3.5 h-3.5" />
                      <span>Generate 18% Tax Invoice</span>
                    </button>
                    <button
                      onClick={() => setActionType("DELIVER_VEHICLE")}
                      className="px-3.5 py-1.5 rounded text-xs font-bold bg-emerald-950 text-emerald-300 border border-emerald-800 hover:bg-emerald-900"
                    >
                      Deliver Vehicle
                    </button>
                  </div>

                  {/* Subforms */}
                  {actionType && (
                    <form onSubmit={handleJobAction} className="bg-slate-950 p-4 rounded-lg border border-slate-800 space-y-3">
                      <div className="text-xs font-bold text-[#E05A1B]">
                        Execute: {actionType.replace(/_/g, " ")}
                      </div>

                      {actionType === "ADD_TASK" && (
                        <div className="space-y-3 text-xs">
                          <div>
                            <label className="text-slate-400 block mb-1">Task Description</label>
                            <input
                              type="text"
                              required
                              value={taskDescription}
                              onChange={(e) => setTaskDescription(e.target.value)}
                              placeholder="e.g. Disassemble and replace front brake pads"
                              className="w-full px-3 py-2 bg-slate-900 border border-slate-800 rounded text-white"
                            />
                          </div>
                          <div className="grid grid-cols-2 gap-3">
                            <div>
                              <label className="text-slate-400 block mb-1">Labour Hours</label>
                              <input
                                type="number"
                                step="0.25"
                                required
                                value={taskHours}
                                onChange={(e) => setTaskHours(e.target.value)}
                                className="w-full px-3 py-2 bg-slate-900 border border-slate-800 rounded text-white"
                              />
                            </div>
                            <div>
                              <label className="text-slate-400 block mb-1">Hourly Rate (₹)</label>
                              <input
                                type="number"
                                required
                                value={labourRate}
                                onChange={(e) => setLabourRate(e.target.value)}
                                className="w-full px-3 py-2 bg-slate-900 border border-slate-800 rounded text-white"
                              />
                            </div>
                          </div>
                        </div>
                      )}

                      {actionType === "CONSUME_PART" && (
                        <div className="space-y-3 text-xs">
                          <div>
                            <label className="text-slate-400 block mb-1">Select Spare Part from Stock</label>
                            <select
                              required
                              value={selectedProductId}
                              onChange={(e) => setSelectedProductId(e.target.value)}
                              className="w-full px-3 py-2 bg-slate-900 border border-slate-800 rounded text-white"
                            >
                              <option value="">-- Choose Part --</option>
                              {availableProducts.map((p) => (
                                <option key={p.id} value={p.id} disabled={p.stockQuantity <= 0}>
                                  {p.name} ({p.sku}) — Stock: {p.stockQuantity} @ ₹{p.sellingPrice}
                                </option>
                              ))}
                            </select>
                          </div>
                          <div>
                            <label className="text-slate-400 block mb-1">Quantity</label>
                            <input
                              type="number"
                              min="1"
                              required
                              value={partQuantity}
                              onChange={(e) => setPartQuantity(e.target.value)}
                              className="w-full px-3 py-2 bg-slate-900 border border-slate-800 rounded text-white"
                            />
                          </div>
                        </div>
                      )}

                      {actionType === "CREATE_ESTIMATE" && (
                        <p className="text-xs text-slate-400">
                          Compile present labour and parts ledger into an official formal Estimate with 18% GST tax computation.
                        </p>
                      )}

                      {actionType === "APPROVE_ESTIMATE" && (
                        <div className="space-y-2 text-xs">
                          <label className="text-slate-400 block">Customer Approval Verification Note</label>
                          <input
                            type="text"
                            required
                            value={approvalNote}
                            onChange={(e) => setApprovalNote(e.target.value)}
                            className="w-full px-3 py-2 bg-slate-900 border border-slate-800 rounded text-white"
                          />
                        </div>
                      )}

                      {actionType === "GENERATE_INVOICE" && (
                        <p className="text-xs text-slate-400">
                          Create official Bharat Motor Club GST Tax Invoice with 9% CGST + 9% SGST breakdown and mark order for settlement.
                        </p>
                      )}

                      {actionType === "DELIVER_VEHICLE" && (
                        <p className="text-xs text-slate-400">
                          Mark vehicle delivered to customer, close work order, and write permanent Service History Record with 6-month / 10,000 km reminder.
                        </p>
                      )}

                      <div className="flex justify-end gap-2 pt-2">
                        <button
                          type="button"
                          onClick={() => setActionType("")}
                          className="px-3 py-1.5 rounded text-xs text-slate-400 hover:text-white"
                        >
                          Cancel
                        </button>
                        <button
                          type="submit"
                          disabled={actionLoading}
                          className="px-4 py-1.5 bg-[#E05A1B] hover:bg-[#C84B12] disabled:opacity-50 text-white rounded text-xs font-bold transition-colors"
                        >
                          {actionLoading ? "Executing..." : "Confirm & Save"}
                        </button>
                      </div>
                    </form>
                  )}
                </div>
              </div>
            ) : (
              <div className="bg-slate-900/40 border border-slate-800 rounded-xl p-12 text-center text-slate-500 text-xs">
                Select a work order from the left list to review diagnostics, assign technician labour tasks, deduct parts from inventory, or generate tax invoices.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

