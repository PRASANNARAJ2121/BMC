"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { Car, Search, Filter, ShieldCheck, ArrowRight, CheckCircle2 } from "lucide-react";

interface Listing {
  id: string;
  stockNumber: string;
  make: string;
  model: string;
  variant: string;
  year: number;
  fuelType: string;
  transmission: string;
  mileageKm: number;
  exteriorColor: string;
  bodyType: string;
  askingPrice: number;
  isFeatured: boolean;
  status: string;
  ownershipCount: number;
  photos: string[];
}

export default function AutomobilesPage() {
  const [listings, setListings] = useState<Listing[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [selectedMake, setSelectedMake] = useState("ALL");
  const [selectedFuel, setSelectedFuel] = useState("ALL");
  const [selectedBody, setSelectedBody] = useState("ALL");
  const [sort, setSort] = useState("featured");

  useEffect(() => {
    fetchListings();
  }, [selectedMake, selectedFuel, selectedBody, sort]);

  const fetchListings = () => {
    setLoading(true);
    const params = new URLSearchParams();
    if (search) params.set("q", search);
    if (selectedMake !== "ALL") params.set("make", selectedMake);
    if (selectedFuel !== "ALL") params.set("fuel", selectedFuel);
    if (selectedBody !== "ALL") params.set("body", selectedBody);
    if (sort) params.set("sort", sort);

    fetch(`/api/vehicles?${params.toString()}`)
      .then((res) => res.json())
      .then((data) => {
        setListings(data.listings || []);
        setLoading(false);
      })
      .catch((err) => {
        console.error(err);
        setLoading(false);
      });
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    fetchListings();
  };

  return (
    <div className="py-12 bg-slate-50 min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="bg-slate-900 rounded-3xl p-8 sm:p-12 text-white mb-10 border border-slate-800 relative overflow-hidden">
          <div className="max-w-2xl relative z-10">
            <span className="text-xs font-bold uppercase tracking-widest text-[#E05A1B]">
              BMC Automobiles
            </span>
            <h1 className="mt-2 text-3xl sm:text-5xl font-black tracking-tight text-white">
              Certified Company-Owned Used Cars
            </h1>
            <p className="mt-4 text-sm sm:text-base text-slate-300 leading-relaxed">
              Every vehicle listed is owned, legally transferred, and certified by Bharat Motor Club.
              We do not host unverified third-party listings. Complete mechanical disclosure, transparent
              pricing, and full workshop backing.
            </p>

            <div className="mt-6 flex flex-wrap gap-4 items-center">
              <Link
                href="/seller/submit"
                className="px-5 py-2.5 text-sm font-bold text-white bg-[#E05A1B] hover:bg-[#C84B12] rounded-xl transition-colors shadow-md"
              >
                Sell Your Car to BMC Instead
              </Link>
              <span className="text-xs text-slate-400">
                Guaranteed company purchase • Strict privacy
              </span>
            </div>
          </div>
        </div>

        {/* Filter & Search Bar */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm mb-8">
          <form onSubmit={handleSearchSubmit} className="grid grid-cols-1 md:grid-cols-5 gap-4">
            <div className="relative md:col-span-2">
              <Search className="w-5 h-5 absolute left-3.5 top-3.5 text-slate-400" />
              <input
                type="text"
                placeholder="Search make, model, variant..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-11 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#E05A1B]"
              />
            </div>

            <div>
              <select
                value={selectedMake}
                onChange={(e) => setSelectedMake(e.target.value)}
                className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-[#E05A1B]"
              >
                <option value="ALL">All Makes</option>
                <option value="Maruti Suzuki">Maruti Suzuki</option>
                <option value="Hyundai">Hyundai</option>
                <option value="Tata">Tata</option>
                <option value="Mahindra">Mahindra</option>
                <option value="Honda">Honda</option>
                <option value="Toyota">Toyota</option>
                <option value="Kia">Kia</option>
                <option value="Volkswagen">Volkswagen</option>
              </select>
            </div>

            <div>
              <select
                value={selectedFuel}
                onChange={(e) => setSelectedFuel(e.target.value)}
                className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-[#E05A1B]"
              >
                <option value="ALL">All Fuel Types</option>
                <option value="Petrol">Petrol</option>
                <option value="Diesel">Diesel</option>
                <option value="CNG">CNG</option>
                <option value="Electric">Electric</option>
                <option value="Hybrid">Hybrid</option>
              </select>
            </div>

            <div>
              <select
                value={sort}
                onChange={(e) => setSort(e.target.value)}
                className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-[#E05A1B]"
              >
                <option value="featured">Featured First</option>
                <option value="price_asc">Price: Low to High</option>
                <option value="price_desc">Price: High to Low</option>
                <option value="year_desc">Year: Newest</option>
                <option value="mileage_asc">Mileage: Lowest</option>
              </select>
            </div>
          </form>
        </div>

        {/* Listings Grid */}
        {loading ? (
          <div className="py-20 text-center">
            <div className="inline-block w-8 h-8 border-4 border-[#E05A1B] border-t-transparent rounded-full animate-spin mb-4" />
            <p className="text-slate-500 text-sm">Loading certified inventory...</p>
          </div>
        ) : listings.length === 0 ? (
          <div className="bg-white rounded-2xl p-12 text-center border border-slate-200 max-w-lg mx-auto">
            <Car className="w-12 h-12 text-slate-400 mx-auto mb-4" />
            <h3 className="text-lg font-bold text-slate-900">No Vehicles Match Criteria</h3>
            <p className="mt-2 text-xs text-slate-600 leading-relaxed">
              We update our company-owned inventory continuously as newly acquired vehicles clear
              reconditioning and 120-point quality control.
            </p>
            <div className="mt-6">
              <Link
                href="/seller/submit"
                className="inline-block px-5 py-2.5 text-xs font-bold text-white bg-slate-900 hover:bg-[#E05A1B] rounded-xl transition-colors"
              >
                Submit Your Vehicle for BMC Acquisition
              </Link>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {listings.map((item) => (
              <div
                key={item.id}
                className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm hover:border-[#E05A1B] hover:shadow-md transition-all flex flex-col justify-between"
              >
                <div>
                  {/* Photo or Placeholder Banner */}
                  <div className="relative h-48 bg-slate-900 flex items-center justify-center p-4">
                    <Car className="w-16 h-16 text-slate-700" />
                    <div className="absolute top-3 left-3 flex gap-2">
                      <span className="px-2.5 py-1 rounded-md text-[10px] font-bold bg-slate-950/80 text-white backdrop-blur-sm">
                        {item.stockNumber}
                      </span>
                      {item.status === "RESERVED" && (
                        <span className="px-2.5 py-1 rounded-md text-[10px] font-bold bg-amber-500 text-slate-950">
                          RESERVED
                        </span>
                      )}
                    </div>
                    <div className="absolute bottom-3 right-3">
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-500/90 text-white flex items-center gap-1">
                        <ShieldCheck className="w-3 h-3" />
                        <span>BMC Verified</span>
                      </span>
                    </div>
                  </div>

                  {/* Vehicle Meta */}
                  <div className="p-5">
                    <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                      {item.year} • {item.fuelType} • {item.transmission}
                    </div>
                    <h3 className="text-lg font-bold text-slate-900 mt-1">
                      {item.make} {item.model}
                    </h3>
                    <div className="text-xs text-slate-600 font-mono mt-0.5">
                      {item.variant || item.bodyType}
                    </div>

                    <div className="mt-4 pt-4 border-t border-slate-100 grid grid-cols-2 gap-2 text-xs text-slate-600">
                      <div>
                        <span className="text-slate-400 block text-[10px]">Odometer:</span>
                        <span className="font-semibold text-slate-800">
                          {item.mileageKm.toLocaleString("en-IN")} km
                        </span>
                      </div>
                      <div>
                        <span className="text-slate-400 block text-[10px]">Ownership:</span>
                        <span className="font-semibold text-slate-800">
                          {item.ownershipCount} {item.ownershipCount === 1 ? "Owner" : "Owners"}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Price & Action */}
                <div className="p-5 pt-0">
                  <div className="flex items-baseline justify-between mb-4">
                    <div>
                      <span className="text-[10px] text-slate-400 block uppercase">BMC Resale Price</span>
                      <span className="text-xl font-black text-[#E05A1B]">
                        ₹{item.askingPrice.toLocaleString("en-IN")}
                      </span>
                    </div>
                    <span className="text-[10px] text-slate-500">Includes GST & Transfer</span>
                  </div>

                  <Link
                    href={`/automobiles/${item.id}`}
                    className="w-full py-2.5 text-center text-xs font-bold text-white bg-slate-900 hover:bg-[#E05A1B] rounded-xl transition-colors flex items-center justify-center gap-1.5"
                  >
                    <span>View Inspection & Details</span>
                    <ArrowRight className="w-3.5 h-3.5" />
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

