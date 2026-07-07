"use client";

import React, { useState } from "react";

interface CityProductRow {
  product: string;
  uom: string;
  currentStock: string;
  roq: string;
  storesAtRisk: number;
}

const initialCityProducts: CityProductRow[] = [
  {
    product: "Lube Oil 15W40",
    uom: "Ltr",
    currentStock: "18,750",
    roq: "25,000",
    storesAtRisk: 14,
  },
  {
    product: "Engine Oil 20W50",
    uom: "Ltr",
    currentStock: "14,200",
    roq: "18,500",
    storesAtRisk: 11,
  },
  {
    product: "Hydraulic Oil 68",
    uom: "Ltr",
    currentStock: "9,600",
    roq: "12,000",
    storesAtRisk: 8,
  },
  {
    product: "Coolant 1L",
    uom: "Ltr",
    currentStock: "7,850",
    roq: "9,500",
    storesAtRisk: 2,
  },
  {
    product: "Brake Fluid DOT 4",
    uom: "Ltr",
    currentStock: "5,300",
    roq: "6,400",
    storesAtRisk: 5,
  },
  {
    product: "Grease 3KG",
    uom: "Kg",
    currentStock: "4,250",
    roq: "5,000",
    storesAtRisk: 1,
  },
];

export default function LocationDashboard() {
  const [selectedCity, setSelectedCity] = useState("Mumbai");

  const getCityKpis = (city: string) => {
    switch (city) {
      case "Pune":
        return { stores: "85", products: "1,850", value: "₹ 4.12 Cr", atRisk: "34", stockouts: "12" };
      case "Delhi NCR":
        return { stores: "150", products: "2,400", value: "₹ 8.56 Cr", atRisk: "68", stockouts: "25" };
      default:
        return { stores: "125", products: "2,140", value: "₹ 6.82 Cr", atRisk: "52", stockouts: "20" };
    }
  };

  const kpis = getCityKpis(selectedCity);

  return (
    <div className="space-y-6">
      
      {/* Top Filter Controls */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 bg-white p-5 rounded-xl border border-slate-100 shadow-xs">
        <div>
          <h2 className="text-sm font-bold text-slate-800">
            Location-Level Analysis
          </h2>
          <p className="text-[11px] text-slate-400 font-medium mt-0.5">
            Select a city boundary to review localized performance.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold text-slate-500">Select City</span>
          <select
            value={selectedCity}
            onChange={(e) => setSelectedCity(e.target.value)}
            className="bg-white border border-slate-200 text-xs font-semibold text-slate-700 py-1.5 px-3 rounded-lg focus:outline-none focus:ring-1 focus:ring-bp-green transition duration-150 shadow-xs"
          >
            <option>Mumbai</option>
            <option>Pune</option>
            <option>Delhi NCR</option>
          </select>
        </div>
      </div>

      {/* KPI Cards Row */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
        <div className="bg-white p-5 rounded-xl border border-slate-100 shadow-xs flex flex-col text-left">
          <span className="text-xs font-semibold text-slate-400 tracking-wide">Total Stores</span>
          <span className="text-2xl font-bold tracking-tight text-slate-900 mt-2">{kpis.stores}</span>
        </div>
        <div className="bg-white p-5 rounded-xl border border-slate-100 shadow-xs flex flex-col text-left">
          <span className="text-xs font-semibold text-slate-400 tracking-wide">Total Products</span>
          <span className="text-2xl font-bold tracking-tight text-slate-900 mt-2">{kpis.products}</span>
        </div>
        <div className="bg-white p-5 rounded-xl border border-slate-100 shadow-xs flex flex-col text-left">
          <span className="text-xs font-semibold text-slate-400 tracking-wide">Inventory Value</span>
          <span className="text-2xl font-bold tracking-tight text-slate-900 mt-2">{kpis.value}</span>
        </div>
        <div className="bg-white p-5 rounded-xl border border-slate-100 shadow-xs flex flex-col text-left">
          <span className="text-xs font-semibold text-slate-400 tracking-wide">At Risk Items</span>
          <span className="text-2xl font-bold tracking-tight text-slate-900 mt-2">{kpis.atRisk}</span>
        </div>
        <div className="bg-white p-5 rounded-xl border border-slate-100 shadow-xs flex flex-col text-left col-span-2 lg:col-span-1">
          <span className="text-xs font-semibold text-slate-400 tracking-wide">Stockout in 7 Days</span>
          <span className="text-2xl font-bold tracking-tight text-slate-900 mt-2">{kpis.stockouts}</span>
        </div>
      </div>

      {/* Split view: Products Table left, Donut Chart right */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Top Products Table (Left Column) */}
        <div className="bg-white rounded-xl border border-slate-100 shadow-xs overflow-hidden text-left lg:col-span-7">
          <div className="p-5 border-b border-slate-50">
            <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
              Inventory by City - Top 10 Products
            </h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead className="bg-slate-50/50 text-slate-500 tracking-wider font-semibold border-b border-slate-100">
                <tr>
                  <th className="py-3 px-5 font-bold">Product</th>
                  <th className="py-3 px-4 text-center font-bold">UOM</th>
                  <th className="py-3 px-4 text-right font-bold">Total Current Stock</th>
                  <th className="py-3 px-4 text-right font-bold">ROQ (Total)</th>
                  <th className="py-3 px-5 text-center font-bold">Stores at Risk</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium text-slate-600">
                {initialCityProducts.map((row, idx) => (
                  <tr key={idx} className="hover:bg-slate-50/40 transition duration-75">
                    <td className="py-3.5 px-5 font-semibold text-slate-900">{row.product}</td>
                    <td className="py-3.5 px-4 text-center text-slate-400 font-normal">{row.uom}</td>
                    <td className="py-3.5 px-4 text-right font-normal text-slate-700">{row.currentStock}</td>
                    <td className="py-3.5 px-4 text-right font-semibold text-bp-green">{row.roq}</td>
                    <td className="py-3.5 px-5 text-center">
                      <span className="text-rose-600 font-semibold bg-rose-50 border border-rose-100 px-2 py-0.5 rounded">
                        {row.storesAtRisk}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Risk summary chart (Right Column) */}
        <div className="bg-white rounded-xl border border-slate-100 shadow-xs p-5 flex flex-col justify-between text-left lg:col-span-5">
          <div className="border-b border-slate-50 pb-3 mb-4">
            <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
              Risk Summary by City
            </h3>
          </div>

          <div className="flex-grow flex items-center justify-center py-6">
            <div className="relative w-40 h-40 flex items-center justify-center">
              <svg className="w-full h-full transform -rotate-90" viewBox="0 0 36 36">
                {/* Background track */}
                <circle cx="18" cy="18" r="15.915" fill="none" stroke="#f1f5f9" strokeWidth="3" />
                
                {/* Low Risk Segment (Green): 77% */}
                <circle
                  cx="18"
                  cy="18"
                  r="15.915"
                  fill="none"
                  stroke="#008751"
                  strokeWidth="3"
                  strokeDasharray="77 100"
                  strokeDashoffset="0"
                />

                {/* Medium Risk Segment (Orange): 15% */}
                <circle
                  cx="18"
                  cy="18"
                  r="15.915"
                  fill="none"
                  stroke="#f59e0b"
                  strokeWidth="3"
                  strokeDasharray="15 100"
                  strokeDashoffset="-77"
                />

                {/* High Risk Segment (Red): 8% */}
                <circle
                  cx="18"
                  cy="18"
                  r="15.915"
                  fill="none"
                  stroke="#ef4444"
                  strokeWidth="3"
                  strokeDasharray="8 100"
                  strokeDashoffset="-92"
                />
              </svg>
              {/* Centered statistics circle */}
              <div className="absolute inset-0 flex flex-col items-center justify-center p-3 text-center bg-white rounded-full m-4.5 shadow-inner border border-slate-50">
                <span className="text-2xl font-bold text-slate-900 leading-none">136</span>
                <span className="text-[9px] font-semibold text-slate-400 uppercase tracking-widest mt-1">Outlets</span>
              </div>
            </div>

            {/* Labels right side */}
            <div className="ml-6 flex flex-col gap-2 font-medium text-xs text-slate-600">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-rose-500 flex-shrink-0" />
                <span>High</span>
                <span className="font-semibold text-slate-900 ml-1">20</span>
                <span className="text-slate-400 text-[10px]">(8%)</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-amber-500 flex-shrink-0" />
                <span>Medium</span>
                <span className="font-semibold text-slate-900 ml-1">27</span>
                <span className="text-slate-400 text-[10px]">(15%)</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-[#008751] flex-shrink-0" />
                <span>Low</span>
                <span className="font-semibold text-slate-900 ml-1">89</span>
                <span className="text-slate-400 text-[10px]">(77%)</span>
              </div>
            </div>
          </div>

          <div className="pt-4 border-t border-slate-50 text-center font-bold text-slate-800 text-xs mt-3">
            Total At Risk Items: <span className="text-rose-600 font-extrabold">52</span>
          </div>
        </div>

      </div>

    </div>
  );
}
