"use client";

import React, { useState, useEffect } from "react";
import { useData } from "@/context/DataContext";

interface CityProductRow {
  product: string;
  uom: string;
  currentStock: string;
  roq: string;
  storesAtRisk: number;
}

export default function LocationDashboard() {
  const { stores, getStoreInventory, getLocationInventory, loading } = useData();
  const [selectedCity, setSelectedCity] = useState("");

  useEffect(() => {
    if (stores.length > 0 && !selectedCity) {
      setSelectedCity(stores[0].city);
    }
  }, [stores, selectedCity]);

  if (loading || !selectedCity) {
    return (
      <div className="flex justify-center items-center py-12 bg-white/40 backdrop-blur-md rounded-3xl p-8 border border-slate-200/50">
        <svg className="animate-spin h-8 w-8 text-bp-green" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
        </svg>
      </div>
    );
  }

  // Dynamically calculate aggregate metrics for the city
  const cityMetrics = getLocationInventory(selectedCity);

  // Dynamically generate the top product summaries inside this city
  const cityStores = stores.filter((s) => s.city.toLowerCase() === selectedCity.toLowerCase());
  
  // Aggregate products stock across all stores in the city
  const productAggMap: Record<string, { name: string; uom: string; stock: number; roq: number; riskStores: number }> = {};

  cityStores.forEach((st) => {
    const inv = getStoreInventory(st.id);
    inv.forEach((item) => {
      if (!productAggMap[item.code]) {
        productAggMap[item.code] = {
          name: item.name,
          uom: item.uom,
          stock: 0,
          roq: 0,
          riskStores: 0
        };
      }
      productAggMap[item.code].stock += item.currentStock;
      productAggMap[item.code].roq += item.recommendedRoq;
      if (item.riskLevel === "High") {
        productAggMap[item.code].riskStores++;
      }
    });
  });

  const aggregateRows: CityProductRow[] = Object.values(productAggMap)
    .map((p) => ({
      product: p.name,
      uom: p.uom,
      currentStock: p.stock.toLocaleString(),
      roq: p.roq.toLocaleString(),
      storesAtRisk: p.riskStores
    }))
    .slice(0, 8); // Display top 8 items for a clean layout

  // Calculate percentages for the circular donut chart
  const totalStores = cityStores.length;
  const highRiskStores = cityMetrics.atRiskCount;
  
  // Deterministic splits for high-fidelity rendering
  const lowRiskStores = Math.max(0, totalStores - highRiskStores);
  const highPercent = totalStores > 0 ? Math.round((highRiskStores / totalStores) * 100) : 0;
  const lowPercent = totalStores > 0 ? 100 - highPercent : 0;

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
            <option>Chicago</option>
            <option>Houston</option>
            <option>Los Angeles</option>
            <option>Denver</option>
          </select>
        </div>
      </div>

      {/* KPI Cards Row */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
        <div className="bg-white p-5 rounded-xl border border-slate-100 shadow-xs flex flex-col text-left">
          <span className="text-xs font-semibold text-slate-400 tracking-wide">Total Stores</span>
          <span className="text-2xl font-bold tracking-tight text-slate-900 mt-2">{cityMetrics.storesCount}</span>
        </div>
        <div className="bg-white p-5 rounded-xl border border-slate-100 shadow-xs flex flex-col text-left">
          <span className="text-xs font-semibold text-slate-400 tracking-wide">Total Products</span>
          <span className="text-2xl font-bold tracking-tight text-slate-900 mt-2">{cityMetrics.productsCount}</span>
        </div>
        <div className="bg-white p-5 rounded-xl border border-slate-100 shadow-xs flex flex-col text-left">
          <span className="text-xs font-semibold text-slate-400 tracking-wide">Inventory Value</span>
          <span className="text-2xl font-bold tracking-tight text-slate-900 mt-2">{cityMetrics.valString}</span>
        </div>
        <div className="bg-white p-5 rounded-xl border border-slate-100 shadow-xs flex flex-col text-left">
          <span className="text-xs font-semibold text-slate-400 tracking-wide">At Risk Items</span>
          <span className="text-2xl font-bold tracking-tight text-slate-900 mt-2">{cityMetrics.atRiskCount}</span>
        </div>
        <div className="bg-white p-5 rounded-xl border border-slate-100 shadow-xs flex flex-col text-left col-span-2 lg:col-span-1">
          <span className="text-xs font-semibold text-slate-400 tracking-wide">Stockouts (Current)</span>
          <span className="text-2xl font-bold tracking-tight text-rose-600 mt-2">{cityMetrics.stockoutsCount}</span>
        </div>
      </div>

      {/* Split view: Products Table left, Donut Chart right */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Top Products Table (Left Column) */}
        <div className="bg-white rounded-xl border border-slate-100 shadow-xs overflow-hidden text-left lg:col-span-7">
          <div className="p-5 border-b border-slate-50">
            <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
              Inventory by City - Product Details
            </h3>
          </div>
          <div className="overflow-x-auto max-h-[450px]">
            <table className="w-full text-xs text-left">
              <thead className="bg-slate-50 text-slate-500 tracking-wider font-semibold border-b border-slate-100 sticky top-0 z-10">
                <tr>
                  <th className="py-3 px-5 font-bold bg-slate-50">Product Name</th>
                  <th className="py-3 px-4 text-center font-bold bg-slate-50">UOM</th>
                  <th className="py-3 px-4 text-right font-bold bg-slate-50">Total Current Stock</th>
                  <th className="py-3 px-4 text-right font-bold bg-slate-50">ROQ</th>
                  <th className="py-3 px-5 text-center font-bold bg-slate-50">Stores at Risk</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium text-slate-600">
                {aggregateRows.map((row, idx) => (
                  <tr key={idx} className="hover:bg-slate-50/40 transition duration-75">
                    <td className="py-3.5 px-5 font-semibold text-slate-900">{row.product}</td>
                    <td className="py-3.5 px-4 text-center text-slate-400 font-normal">{row.uom}</td>
                    <td className="py-3.5 px-4 text-right font-normal text-slate-700">{row.currentStock}</td>
                    <td className="py-3.5 px-4 text-right font-semibold text-bp-green">{row.roq}</td>
                    <td className="py-3.5 px-5 text-center">
                      <span className={`px-2 py-0.5 rounded font-semibold border ${
                        row.storesAtRisk > 0 ? "text-rose-600 bg-rose-50 border-rose-100" : "text-slate-400 bg-slate-50 border-slate-100"
                      }`}>
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
              Store Risk Summary by City
            </h3>
          </div>

          <div className="flex-grow flex items-center justify-center py-6">
            <div className="relative w-40 h-40 flex items-center justify-center">
              <svg className="w-full h-full transform -rotate-90" viewBox="0 0 36 36">
                <circle cx="18" cy="18" r="15.915" fill="none" stroke="#f1f5f9" strokeWidth="3" />
                {/* Low Risk Segment (Green) */}
                <circle
                  cx="18"
                  cy="18"
                  r="15.915"
                  fill="none"
                  stroke="#008751"
                  strokeWidth="3"
                  strokeDasharray={`${lowPercent} 100`}
                  strokeDashoffset="0"
                />
                {/* High Risk Segment (Red) */}
                <circle
                  cx="18"
                  cy="18"
                  r="15.915"
                  fill="none"
                  stroke="#ef4444"
                  strokeWidth="3"
                  strokeDasharray={`${highPercent} 100`}
                  strokeDashoffset={`-${lowPercent}`}
                />
              </svg>
              {/* Centered statistics circle */}
              <div className="absolute inset-0 flex flex-col items-center justify-center p-3 text-center bg-white rounded-full m-4.5 shadow-inner border border-slate-50">
                <span className="text-2xl font-bold text-slate-900 leading-none">{totalStores}</span>
                <span className="text-[9px] font-semibold text-slate-400 uppercase tracking-widest mt-1">Outlets</span>
              </div>
            </div>

            <div className="ml-6 flex flex-col gap-3 font-medium text-xs text-slate-600">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-rose-500 flex-shrink-0" />
                <span>High Risk Stores</span>
                <span className="font-semibold text-slate-900 ml-1">{highRiskStores}</span>
                <span className="text-slate-400 text-[10px]">({highPercent}%)</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-[#008751] flex-shrink-0" />
                <span>Low Risk Stores</span>
                <span className="font-semibold text-slate-900 ml-1">{lowRiskStores}</span>
                <span className="text-slate-400 text-[10px]">({lowPercent}%)</span>
              </div>
            </div>
          </div>

          <div className="pt-4 border-t border-slate-50 text-center font-bold text-slate-800 text-xs mt-3">
            Total At Risk Products in {selectedCity}: <span className="text-rose-600 font-extrabold">{cityMetrics.atRiskCount}</span>
          </div>
        </div>

      </div>

    </div>
  );
}
