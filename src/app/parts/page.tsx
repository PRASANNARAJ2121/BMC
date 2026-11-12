"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { Package, Search, CheckCircle2, AlertCircle, ShieldCheck, Filter } from "lucide-react";

interface ProductItem {
  id: string;
  sku: string;
  partNumber: string;
  name: string;
  category: string;
  categoryCode: string;
  brand: string;
  grade: string;
  description: string;
  sellingPrice: number;
  inStock: boolean;
  stockAvailable: boolean;
  isCompatible: boolean | null;
  fitmentCaveat: string;
}

export default function PartsPage() {
  const [products, setProducts] = useState<ProductItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("ALL");
  const [make, setMake] = useState("");
  const [model, setModel] = useState("");
  const [year, setYear] = useState(2021);

  useEffect(() => {
    fetchParts();
  }, [category]);

  const fetchParts = () => {
    setLoading(true);
    const params = new URLSearchParams();
    if (search) params.set("q", search);
    if (category !== "ALL") params.set("category", category);
    if (make) params.set("make", make);
    if (model) params.set("model", model);
    if (year) params.set("year", String(year));

    fetch(`/api/products?${params.toString()}`)
      .then((res) => res.json())
      .then((data) => {
        setProducts(data.products || []);
        setLoading(false);
      })
      .catch((err) => {
        console.error(err);
        setLoading(false);
      });
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    fetchParts();
  };

  return (
    <div className="py-12 bg-slate-50 min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Banner */}
        <div className="bg-slate-900 rounded-3xl p-8 sm:p-12 text-white mb-10 border border-slate-800">
          <div className="max-w-2xl">
            <span className="text-xs font-bold uppercase tracking-widest text-emerald-400">
              BMC Parts & Logistics
            </span>
            <h1 className="mt-2 text-3xl sm:text-5xl font-black tracking-tight text-white">
              Genuine & Certified Spare Parts
            </h1>
            <p className="mt-4 text-sm sm:text-base text-slate-300 leading-relaxed">
              Tested OEM and high-durability aftermarket automotive components. Every part in our
              catalogue is SKU-tracked, warehouse-verified, and cross-referenced for strict vehicle
              compatibility.
            </p>
          </div>
        </div>

        {/* Filter & Vehicle Compatibility Checker Bar */}
        <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm mb-8 space-y-4">
          <div className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
            <Filter className="w-4 h-4 text-[#E05A1B]" />
            <span>Check Compatibility For Your Vehicle</span>
          </div>

          <form onSubmit={handleSearchSubmit} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
            <div className="lg:col-span-2 relative">
              <Search className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
              <input
                type="text"
                placeholder="Search part name, SKU, brand..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-[#E05A1B]"
              />
            </div>

            <div>
              <input
                type="text"
                placeholder="Vehicle Make (e.g. Maruti)"
                value={make}
                onChange={(e) => setMake(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-[#E05A1B]"
              />
            </div>

            <div>
              <input
                type="text"
                placeholder="Model (e.g. Swift)"
                value={model}
                onChange={(e) => setModel(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-[#E05A1B]"
              />
            </div>

            <div>
              <button
                type="submit"
                className="w-full py-2 bg-slate-900 hover:bg-[#E05A1B] text-white text-xs font-bold rounded-xl transition-colors"
              >
                Apply Compatibility Filter
              </button>
            </div>
          </form>

          {/* Category Chips */}
          <div className="flex flex-wrap gap-2 pt-2 border-t border-slate-100">
            {["ALL", "FLT-01", "LUB-01", "BRK-01", "ELC-01", "AC-01", "SUS-01"].map((cat) => (
              <button
                key={cat}
                type="button"
                onClick={() => setCategory(cat)}
                className={`px-3 py-1 rounded-lg text-xs font-semibold transition-colors ${
                  category === cat
                    ? "bg-[#E05A1B] text-white"
                    : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                }`}
              >
                {cat === "ALL"
                  ? "All Categories"
                  : cat === "FLT-01"
                  ? "Filters"
                  : cat === "LUB-01"
                  ? "Lubricants"
                  : cat === "BRK-01"
                  ? "Brakes"
                  : cat === "ELC-01"
                  ? "Electrical"
                  : cat === "AC-01"
                  ? "Air Conditioning"
                  : "Suspension"}
              </button>
            ))}
          </div>
        </div>

        {/* Parts Grid */}
        {loading ? (
          <div className="py-20 text-center">
            <div className="inline-block w-8 h-8 border-4 border-[#E05A1B] border-t-transparent rounded-full animate-spin mb-4" />
            <p className="text-slate-500 text-xs">Querying parts inventory...</p>
          </div>
        ) : products.length === 0 ? (
          <div className="bg-white rounded-2xl p-12 text-center border border-slate-200">
            <Package className="w-12 h-12 text-slate-400 mx-auto mb-4" />
            <h3 className="text-base font-bold text-slate-900">No Parts Match</h3>
            <p className="text-xs text-slate-500 mt-2">
              Try adjusting your search criteria or contact our parts desk directly.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {products.map((p) => (
              <div
                key={p.id}
                className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm hover:border-[#E05A1B] transition-colors flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-100 text-slate-600 font-bold">
                      {p.sku}
                    </span>
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                        p.inStock
                          ? "bg-emerald-100 text-emerald-800"
                          : "bg-red-100 text-red-800"
                      }`}
                    >
                      {p.inStock ? "In Stock" : "Backorder Inquiry"}
                    </span>
                  </div>

                  <h3 className="font-bold text-slate-900 text-base">{p.name}</h3>
                  <div className="text-xs text-slate-500 mt-0.5 font-medium">
                    {p.brand} • {p.grade}
                  </div>
                  <p className="text-xs text-slate-600 mt-2 leading-relaxed line-clamp-2">
                    {p.description}
                  </p>

                  {/* Compatibility Badge if filter applied */}
                  {p.isCompatible !== null && (
                    <div
                      className={`mt-3 p-2.5 rounded-xl text-xs flex items-start gap-2 ${
                        p.isCompatible
                          ? "bg-emerald-50 text-emerald-800 border border-emerald-200"
                          : "bg-amber-50 text-amber-800 border border-amber-200"
                      }`}
                    >
                      {p.isCompatible ? (
                        <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600 mt-0.5" />
                      ) : (
                        <AlertCircle className="w-4 h-4 shrink-0 text-amber-600 mt-0.5" />
                      )}
                      <div className="text-[11px] leading-snug font-medium">
                        {p.fitmentCaveat}
                      </div>
                    </div>
                  )}
                </div>

                <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between">
                  <div>
                    <span className="text-[10px] text-slate-400 block uppercase">Price</span>
                    <span className="text-lg font-black text-[#E05A1B]">
                      ₹{p.sellingPrice.toLocaleString("en-IN")}
                    </span>
                  </div>

                  <Link
                    href={`/garage#book?part=${encodeURIComponent(p.sku)}`}
                    className="px-4 py-2 bg-slate-900 hover:bg-[#E05A1B] text-white text-xs font-bold rounded-xl transition-colors"
                  >
                    Request Fitment
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

