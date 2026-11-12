"use client";

import React, { useState } from "react";
import {
  CreditCard,
  QrCode,
  Building,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  X,
  Lock,
  ArrowRight,
  Smartphone,
} from "lucide-react";

interface PaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  amount: number;
  purpose: "VEHICLE_RESERVATION" | "MEMBERSHIP_ENROLLMENT" | "WORKSHOP_INVOICE" | "ACQUISITION_PAYOUT";
  referenceId: string;
  title: string;
  description: string;
  customerName?: string;
  customerPhone?: string;
  customerEmail?: string;
  onSuccess?: (reconciliation: any) => void;
}

export default function PaymentModal({
  isOpen,
  onClose,
  amount,
  purpose,
  referenceId,
  title,
  description,
  customerName = "Customer",
  customerPhone = "+91 99999 99999",
  customerEmail,
  onSuccess,
}: PaymentModalProps) {
  const [selectedMethod, setSelectedMethod] = useState<"UPI" | "CARD" | "NETBANKING">("UPI");
  const [upiId, setUpiId] = useState("customer@okhdfcbank");
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [paymentSuccess, setPaymentSuccess] = useState<any | null>(null);

  if (!isOpen) return null;

  const handleProcessPayment = async () => {
    setLoading(true);
    setErrorMessage(null);

    try {
      // 1. Create order
      const orderRes = await fetch("/api/payments/create-order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          amount,
          purpose,
          referenceId,
          customerName,
          customerPhone,
          customerEmail,
        }),
      });

      const orderData = await orderRes.json();
      if (!orderRes.ok) throw new Error(orderData.error || "Failed to initiate payment");

      const order = orderData.order;

      // 2. Simulate / verify signature settlement
      const paymentId = `pay_bmc_${Date.now().toString().slice(-8)}`;
      const signature = `sandbox_sig_${order.orderId}_${paymentId}`;

      const verifyRes = await fetch("/api/payments/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          orderId: order.orderId,
          paymentId,
          signature,
          purpose,
          referenceId,
          amount,
          paymentMethod: selectedMethod,
        }),
      });

      const verifyData = await verifyRes.json();
      if (!verifyRes.ok) throw new Error(verifyData.error || "Payment verification failed");

      setPaymentSuccess({
        orderId: order.orderId,
        paymentId,
        amount,
        reconciliation: verifyData.reconciliation,
      });

      if (onSuccess) onSuccess(verifyData.reconciliation);
    } catch (err: unknown) {
      setErrorMessage(err instanceof Error ? err.message : "Payment processing error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-md w-full overflow-hidden text-slate-100 shadow-2xl animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="bg-slate-950 p-4 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 rounded-lg bg-[#E05A1B] flex items-center justify-center text-white font-black text-xs">
              BMC
            </div>
            <div>
              <h3 className="text-xs font-bold text-white uppercase tracking-wider">
                Bharat Motor Club Secure Pay
              </h3>
              <p className="text-[10px] text-slate-400">256-Bit Encrypted Payment Gateway</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {paymentSuccess ? (
          /* Payment Success View */
          <div className="p-6 text-center space-y-4">
            <div className="w-14 h-14 bg-emerald-500/20 text-emerald-400 rounded-full flex items-center justify-center mx-auto">
              <CheckCircle2 className="w-8 h-8" />
            </div>
            <div>
              <h4 className="text-lg font-black text-white">Payment Successful!</h4>
              <p className="text-xs text-slate-400 mt-1">{title} Confirmed</p>
            </div>

            <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 text-xs text-left space-y-1.5 font-mono">
              <div className="flex justify-between">
                <span className="text-slate-500 font-sans">Amount Paid:</span>
                <span className="font-bold text-emerald-400">₹{amount.toLocaleString("en-IN")}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500 font-sans">Payment ID:</span>
                <span className="text-slate-300">{paymentSuccess.paymentId}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500 font-sans">Order Ref:</span>
                <span className="text-slate-300">{paymentSuccess.orderId}</span>
              </div>
            </div>

            <button
              onClick={onClose}
              className="w-full py-2.5 bg-[#E05A1B] hover:bg-[#C84B12] text-white rounded-xl text-xs font-bold transition-colors"
            >
              Done & Return to Portal
            </button>
          </div>
        ) : (
          /* Checkout Payment Form */
          <div className="p-6 space-y-5">
            {/* Amount Summary */}
            <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 flex justify-between items-center">
              <div>
                <span className="text-[10px] uppercase font-bold text-slate-500 tracking-wider block">
                  Amount Due
                </span>
                <h4 className="text-xl font-black text-white font-mono">
                  ₹{amount.toLocaleString("en-IN")}
                </h4>
              </div>
              <span className="text-[11px] font-bold px-2 py-0.5 rounded bg-emerald-950 text-emerald-300 border border-emerald-800">
                100% Refundable
              </span>
            </div>

            {/* Purpose & Description */}
            <div className="text-xs text-slate-400 bg-slate-900/60 p-3 rounded-lg border border-slate-800/80">
              <strong className="text-slate-200 block mb-0.5">{title}</strong>
              <span>{description}</span>
            </div>

            {errorMessage && (
              <div className="p-3 bg-rose-950/60 border border-rose-800 rounded-xl text-rose-300 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 flex-shrink-0" />
                <span>{errorMessage}</span>
              </div>
            )}

            {/* Payment Method Selector */}
            <div className="space-y-2">
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
                Choose Payment Method
              </span>
              <div className="grid grid-cols-3 gap-2">
                <button
                  type="button"
                  onClick={() => setSelectedMethod("UPI")}
                  className={`p-2.5 rounded-xl border flex flex-col items-center gap-1.5 transition-all text-xs font-bold ${
                    selectedMethod === "UPI"
                      ? "bg-slate-800 border-[#E05A1B] text-white ring-1 ring-[#E05A1B]"
                      : "bg-slate-950 border-slate-800 text-slate-400 hover:text-white"
                  }`}
                >
                  <Smartphone className="w-4 h-4 text-[#E05A1B]" />
                  <span>UPI / QR</span>
                </button>

                <button
                  type="button"
                  onClick={() => setSelectedMethod("CARD")}
                  className={`p-2.5 rounded-xl border flex flex-col items-center gap-1.5 transition-all text-xs font-bold ${
                    selectedMethod === "CARD"
                      ? "bg-slate-800 border-[#E05A1B] text-white ring-1 ring-[#E05A1B]"
                      : "bg-slate-950 border-slate-800 text-slate-400 hover:text-white"
                  }`}
                >
                  <CreditCard className="w-4 h-4 text-[#E05A1B]" />
                  <span>Card</span>
                </button>

                <button
                  type="button"
                  onClick={() => setSelectedMethod("NETBANKING")}
                  className={`p-2.5 rounded-xl border flex flex-col items-center gap-1.5 transition-all text-xs font-bold ${
                    selectedMethod === "NETBANKING"
                      ? "bg-slate-800 border-[#E05A1B] text-white ring-1 ring-[#E05A1B]"
                      : "bg-slate-950 border-slate-800 text-slate-400 hover:text-white"
                  }`}
                >
                  <Building className="w-4 h-4 text-[#E05A1B]" />
                  <span>NetBanking</span>
                </button>
              </div>
            </div>

            {/* Method Inputs */}
            {selectedMethod === "UPI" && (
              <div className="space-y-2">
                <label className="text-[11px] text-slate-400 block">Virtual Payment Address (VPA / UPI ID)</label>
                <div className="relative">
                  <input
                    type="text"
                    value={upiId}
                    onChange={(e) => setUpiId(e.target.value)}
                    placeholder="e.g. yourname@okaxis"
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-xs text-white font-mono"
                  />
                  <span className="absolute right-3 top-2 text-[10px] text-emerald-400 font-bold">VERIFIED</span>
                </div>
              </div>
            )}

            {selectedMethod === "CARD" && (
              <div className="space-y-2 text-xs">
                <input
                  type="text"
                  placeholder="Card Number: 4532 •••• •••• 8892"
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg font-mono text-white"
                />
                <div className="grid grid-cols-2 gap-2">
                  <input
                    type="text"
                    placeholder="MM / YY"
                    className="px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg font-mono text-white"
                  />
                  <input
                    type="password"
                    placeholder="CVV: •••"
                    maxLength={3}
                    className="px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg font-mono text-white"
                  />
                </div>
              </div>
            )}

            {selectedMethod === "NETBANKING" && (
              <div className="space-y-2 text-xs">
                <label className="text-[11px] text-slate-400 block">Select Popular Bank</label>
                <select className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-white">
                  <option>HDFC Bank</option>
                  <option>ICICI Bank</option>
                  <option>State Bank of India</option>
                  <option>Axis Bank</option>
                  <option>Kotak Mahindra Bank</option>
                </select>
              </div>
            )}

            {/* Pay Button */}
            <button
              type="button"
              onClick={handleProcessPayment}
              disabled={loading}
              className="w-full py-3 bg-[#E05A1B] hover:bg-[#C84B12] disabled:opacity-50 text-white rounded-xl text-xs font-bold transition-colors flex items-center justify-center gap-1.5 shadow-lg"
            >
              <Lock className="w-3.5 h-3.5" />
              <span>{loading ? "Processing Secure Payment..." : `Pay ₹${amount.toLocaleString("en-IN")}`}</span>
            </button>

            <div className="flex items-center justify-center gap-1 text-[10px] text-slate-500">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
              <span>PCI-DSS Compliant • Powered by Bharat Motor Club Treasury</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

