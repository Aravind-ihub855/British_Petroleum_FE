"use client";

import React from "react";
import { stores, masterProducts, getStoreInventory } from "@/utils/mockDb";

interface DashboardOverviewProps {
  onNavigate: (tabId: string, subTabId: string, vendorName?: string, productCode?: string) => void;
}

export default function DashboardOverview({ onNavigate }: DashboardOverviewProps) {
  // 1. Total Stores Count
  const totalStores = stores.length;

  // 2. Total Master Products Count
  const totalMasterProducts = masterProducts.length;

  // 3. Compute overall aggregated valuation, at-risk, and stockouts
  let overallValuation = 0;
  let overallAtRisk = 0;
  let mediumRiskCount = 0;
  let lowRiskCount = 0;
  let totalSeededSKUsCount = 0;
  let sumServiceLevel = 0;

  // Classifications array
  const fsnConsumptions: number[] = [];

  stores.forEach((st) => {
    const inv = getStoreInventory(st.id);
    inv.forEach((item) => {
      overallValuation += item.currentStock * item.unitPrice;
      totalSeededSKUsCount++;
      sumServiceLevel += item.serviceLevel;
      fsnConsumptions.push(item.avgDailyConsumption);

      if (item.riskLevel === "High") {
        overallAtRisk++;
      } else if (item.riskLevel === "Medium") {
        mediumRiskCount++;
      } else {
        lowRiskCount++;
      }
    });
  });

  const formattedValuation = `$ ${(overallValuation / 1000000).toFixed(2)} M`;
  const avgServiceLevel = totalSeededSKUsCount > 0 ? (sumServiceLevel / totalSeededSKUsCount).toFixed(1) : "95.0";

  // FSN counts overall:
  const fastCount = fsnConsumptions.filter((c) => c >= 25.0).length;
  const slowCount = fsnConsumptions.filter((c) => c >= 5.0 && c < 25.0).length;
  const nonCount = fsnConsumptions.filter((c) => c < 5.0).length;
  const totalFSN = fsnConsumptions.length || 1;

  const fastPercent = Math.round((fastCount / totalFSN) * 100);
  const slowPercent = Math.round((slowCount / totalFSN) * 100);
  const nonPercent = 100 - fastPercent - slowPercent;

  // 4. City risk breakdown (Chicago, Houston, Los Angeles, Denver)
  const cities = ["Chicago", "Houston", "Los Angeles", "Denver"];
  const cityAggregates = cities.map((city) => {
    const cityStores = stores.filter((s) => s.city.toLowerCase() === city.toLowerCase());
    let storesAtRiskCount = 0;

    cityStores.forEach((st) => {
      const inv = getStoreInventory(st.id);
      const hasHighRiskItem = inv.some((item) => item.riskLevel === "High");
      if (hasHighRiskItem) {
        storesAtRiskCount++;
      }
    });

    const totalStoresInCity = cityStores.length || 1;

    return {
      name: city,
      storesAtRisk: storesAtRiskCount,
      totalStores: totalStoresInCity,
      percent: 0
    };
  });
  const maxCityRisk = Math.max(...cityAggregates.map((city) => city.storesAtRisk), 1);
  const cityRiskBars = cityAggregates.map((city) => ({
    ...city,
    percent: Math.round((city.storesAtRisk / maxCityRisk) * 100)
  }));

  // 5. Top 5 Products at risk (earliest predicted stockouts)
  const allAtRiskItems: { name: string; code: string; storesCount: number; soonestDate: string; timestamp: number }[] = [];
  
  masterProducts.forEach((prod) => {
    let riskCount = 0;
    let soonestTimestamp = Infinity;
    let soonestStr = "N/A";

    stores.forEach((st) => {
      const inv = getStoreInventory(st.id);
      const item = inv.find((p) => p.code === prod.code);
      if (item && item.riskLevel === "High") {
        riskCount++;
        // Parse dd-mm-yyyy to timestamp for comparison
        const parts = item.predictedStockoutDate.split("-");
        if (parts.length === 3) {
          const t = new Date(parseInt(parts[2]), parseInt(parts[1]) - 1, parseInt(parts[0])).getTime();
          if (t < soonestTimestamp) {
            soonestTimestamp = t;
            soonestStr = item.predictedStockoutDate;
          }
        }
      }
    });

    if (riskCount > 0) {
      allAtRiskItems.push({
        name: prod.name,
        code: prod.code,
        storesCount: riskCount,
        soonestDate: soonestStr,
        timestamp: soonestTimestamp
      });
    }
  });

  const topAtRiskProducts = allAtRiskItems
    .sort((a, b) => a.timestamp - b.timestamp)
    .slice(0, 5);

  const circumference = 251.3;
  const formatPercent = (value: number, total: number) => Math.round((value / (total || 1)) * 100);
  const riskSegments = [
    { label: "High Risk", range: "<= 7 Days", value: overallAtRisk, color: "#ef4444", dotClass: "bg-rose-500" },
    { label: "Medium Risk", range: "8-15 Days", value: mediumRiskCount, color: "#f97316", dotClass: "bg-orange-500" },
    { label: "Low Risk", range: "> 15 Days", value: lowRiskCount, color: "#008751", dotClass: "bg-bp-green" }
  ];
  let riskOffset = 0;
  const riskDonutSegments = riskSegments.map((segment) => {
    const length = (segment.value / (totalSeededSKUsCount || 1)) * circumference;
    const offset = -riskOffset;
    riskOffset += length;
    return { ...segment, length, offset, percent: formatPercent(segment.value, totalSeededSKUsCount) };
  });

  const fsnSegments = [
    { label: "Fast Moving", value: fastCount, percent: fastPercent, color: "#008751", dotClass: "bg-bp-green" },
    { label: "Slow Moving", value: slowCount, percent: slowPercent, color: "#f97316", dotClass: "bg-orange-500" },
    { label: "Non Moving", value: nonCount, percent: nonPercent, color: "#ef4444", dotClass: "bg-rose-500" }
  ];
  let fsnOffset = 0;
  const fsnDonutSegments = fsnSegments.map((segment) => {
    const length = (segment.percent / 100) * circumference;
    const offset = -fsnOffset;
    fsnOffset += length;
    return { ...segment, length, offset };
  });

  return (
    <div className="space-y-6">
      {/* KPI Section */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
        {/* Card 1 */}
        <div className="bg-white border border-slate-200/80 rounded-2xl p-4 shadow-sm">
          <div className="flex items-center gap-1.5 text-slate-400 mb-1">
            <svg className="w-4 h-4 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
            </svg>
            <span className="text-[11px] font-bold uppercase tracking-wider">Total Stores</span>
          </div>
          <span className="text-2xl font-bold tracking-tight text-slate-900">{totalStores}</span>
        </div>

        {/* Card 2 */}
        <div className="bg-white border border-slate-200/80 rounded-2xl p-4 shadow-sm">
          <div className="flex items-center gap-1.5 text-slate-400 mb-1">
            <svg className="w-4 h-4 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
            </svg>
            <span className="text-[11px] font-bold uppercase tracking-wider">Total Products</span>
          </div>
          <span className="text-2xl font-bold tracking-tight text-slate-900">{totalMasterProducts}</span>
        </div>

        {/* Card 3 */}
        <div className="bg-white border border-slate-200/80 rounded-2xl p-4 shadow-sm">
          <div className="flex items-center gap-1.5 text-slate-400 mb-1">
            <span className="text-[11px] font-bold uppercase tracking-wider">Total Inventory Value</span>
          </div>
          <span className="text-2xl font-bold tracking-tight text-slate-900">{formattedValuation}</span>
        </div>

        {/* Card 4 */}
        <div className="bg-white border border-slate-200/80 rounded-2xl p-4 shadow-sm">
          <div className="flex items-center gap-1.5 text-slate-400 mb-1">
            <span className="text-[11px] font-bold uppercase tracking-wider text-rose-600">At Risk (7 Days)</span>
          </div>
          <span className="text-2xl font-bold tracking-tight text-rose-600">{overallAtRisk}</span>
        </div>

        {/* Card 5 */}
        <div className="bg-white border border-slate-200/80 rounded-2xl p-4 shadow-sm">
          <div className="flex items-center gap-1.5 text-slate-400 mb-1">
            <span className="text-[11px] font-bold uppercase tracking-wider text-bp-green">FSN - Fast Moving</span>
          </div>
          <span className="text-2xl font-bold tracking-tight text-bp-green">{fastPercent}%</span>
        </div>
      </div>

      {/* Charts & Table Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Stockout Risk Summary Donut */}
        <div className="bg-white border border-slate-200/80 rounded-3xl p-6 shadow-sm flex flex-col justify-between">
          <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider mb-4">Stockout Risk Summary</h3>
          <div className="flex items-center justify-around flex-grow gap-4">
            {/* SVG Donut */}
            <div className="relative w-32 h-32 flex-shrink-0">
              <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
                <circle cx="50" cy="50" r="40" stroke="#f1f5f9" strokeWidth="12" fill="transparent" />
                {riskDonutSegments.map((segment) => (
                  <circle
                    key={segment.label}
                    cx="50"
                    cy="50"
                    r="40"
                    stroke={segment.color}
                    strokeWidth="12"
                    strokeDasharray={`${segment.length} ${circumference}`}
                    strokeDashoffset={segment.offset}
                    strokeLinecap="round"
                    fill="transparent"
                    className="transition-opacity duration-150 hover:opacity-80"
                  >
                    <title>{`${segment.label}: ${segment.value} items (${segment.percent}%)`}</title>
                  </circle>
                ))}
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-xl font-bold text-slate-900">{totalSeededSKUsCount}</span>
                <span className="text-[9px] text-slate-400 font-bold uppercase tracking-wider">Items</span>
              </div>
            </div>

            <div className="flex flex-col gap-2.5 text-xs font-semibold">
              {riskDonutSegments.map((segment) => (
                <div key={segment.label} className="group relative flex items-center gap-2 rounded-md px-1 py-0.5 transition-colors hover:bg-slate-50">
                  <span className={`w-3 h-3 rounded-full ${segment.dotClass} flex-shrink-0`} />
                  <div className="flex flex-col text-left">
                    <span className="text-slate-500 text-[10px]">{segment.label} ({segment.range})</span>
                    <span className="text-slate-800 font-bold">{segment.value} <span className="text-[10px] text-slate-400 font-bold">({segment.percent}%)</span></span>
                  </div>
                  <div className="pointer-events-none absolute left-0 top-full z-20 mt-2 w-40 rounded-lg bg-slate-900 px-3 py-2 text-[10px] font-semibold text-white opacity-0 shadow-lg transition-opacity group-hover:opacity-100">
                    {segment.value} inventory items, {segment.percent}% of tracked stock positions.
                  </div>
                </div>
              ))}
            </div>

            <div className="hidden">
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-rose-500 flex-shrink-0" />
                <div className="flex flex-col text-left">
                  <span className="text-slate-500 text-[10px]">High Risk (≤ 7 Days)</span>
                  <span className="text-slate-800 font-bold">{overallAtRisk} <span className="text-[10px] text-slate-400 font-bold">(10%)</span></span>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-orange-500 flex-shrink-0" />
                <div className="flex flex-col text-left">
                  <span className="text-slate-500 text-[10px]">Medium Risk (8-15 Days)</span>
                  <span className="text-slate-800 font-bold">15 <span className="text-[10px] text-slate-400 font-bold">(15%)</span></span>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-bp-green flex-shrink-0" />
                <div className="flex flex-col text-left">
                  <span className="text-slate-500 text-[10px]">Low Risk (&gt; 15 Days)</span>
                  <span className="text-slate-800 font-bold">75 <span className="text-[10px] text-slate-400 font-bold">(75%)</span></span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Inventory by FSN Donut */}
        <div className="bg-white border border-slate-200/80 rounded-3xl p-6 shadow-sm flex flex-col justify-between">
          <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider mb-4">Inventory by FSN</h3>
          <div className="flex items-center justify-around flex-grow gap-4">
            {/* SVG Donut */}
            <div className="relative w-32 h-32 flex-shrink-0">
              <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
                <circle cx="50" cy="50" r="40" stroke="#f1f5f9" strokeWidth="12" fill="transparent" />
                {fsnDonutSegments.map((segment) => (
                  <circle
                    key={segment.label}
                    cx="50"
                    cy="50"
                    r="40"
                    stroke={segment.color}
                    strokeWidth="12"
                    strokeDasharray={`${segment.length} ${circumference}`}
                    strokeDashoffset={segment.offset}
                    strokeLinecap="round"
                    fill="transparent"
                    className="transition-opacity duration-150 hover:opacity-80"
                  >
                    <title>{`${segment.label}: ${segment.value} items (${segment.percent}%)`}</title>
                  </circle>
                ))}
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-xl font-bold text-slate-900">{totalFSN}</span>
                <span className="text-[9px] text-slate-400 font-bold uppercase tracking-wider">Items</span>
              </div>
            </div>

            <div className="flex flex-col gap-3 text-xs font-semibold text-left">
              {fsnDonutSegments.map((segment) => (
                <div key={segment.label} className="group relative flex items-center gap-2 rounded-md px-1 py-0.5 transition-colors hover:bg-slate-50">
                  <span className={`w-3 h-3 rounded-full ${segment.dotClass} flex-shrink-0`} />
                  <div className="flex flex-col">
                    <span className="text-slate-500 text-[10px]">{segment.label}</span>
                    <span className="text-slate-800 font-bold">{segment.percent}% <span className="text-[10px] text-slate-400">({segment.value})</span></span>
                  </div>
                  <div className="pointer-events-none absolute left-0 top-full z-20 mt-2 w-40 rounded-lg bg-slate-900 px-3 py-2 text-[10px] font-semibold text-white opacity-0 shadow-lg transition-opacity group-hover:opacity-100">
                    {segment.value} items classified as {segment.label.toLowerCase()}.
                  </div>
                </div>
              ))}
            </div>

            <div className="hidden">
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-bp-green flex-shrink-0" />
                <div className="flex flex-col">
                  <span className="text-slate-500 text-[10px]">Fast Moving</span>
                  <span className="text-slate-800 font-bold">{fastPercent}%</span>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-orange-500 flex-shrink-0" />
                <div className="flex flex-col">
                  <span className="text-slate-500 text-[10px]">Slow Moving</span>
                  <span className="text-slate-800 font-bold">{slowPercent}%</span>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-rose-500 flex-shrink-0" />
                <div className="flex flex-col">
                  <span className="text-slate-500 text-[10px]">Non Moving</span>
                  <span className="text-slate-800 font-bold">{nonPercent}%</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Top 5 Products at Risk */}
        <div className="bg-white border border-slate-200/80 rounded-3xl p-6 shadow-sm flex flex-col justify-between">
          <div>
            <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider mb-4 text-left">Top 5 Products at Risk</h3>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b border-slate-100 text-slate-400 font-bold uppercase">
                    <th className="py-2.5">Product</th>
                    <th className="py-2.5 text-center">Stores at Risk</th>
                    <th className="py-2.5 text-right">Soonest Stockout</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100/60 font-semibold text-slate-700">
                  {topAtRiskProducts.map((row, idx) => (
                    <tr key={idx}>
                      <td className="py-3 text-bp-green font-semibold cursor-pointer hover:underline text-left"
                        onClick={() => onNavigate("3", "product_wise", undefined, row.code)}
                      >
                        {row.name}
                      </td>
                      <td className="py-3 text-center text-rose-600 font-bold">{row.storesCount}</td>
                      <td className="py-3 text-right text-slate-500 font-medium">{row.soonestDate}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <div className="text-right border-t border-slate-50/80 pt-3">
            <button className="text-xs font-bold text-bp-green hover:underline hover:text-bp-green-dark"
              onClick={() => onNavigate("2", "product")}
            >
              View All
            </button>
          </div>
        </div>
      </div>

      {/* Bottom Section: Risk by City & Forecast Accuracy */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Bar Chart Mock for Stockout Risk by City */}
        <div className="bg-white border border-slate-200/80 rounded-3xl p-6 shadow-sm lg:col-span-2">
          <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider mb-5 text-left">Stockout Risk by City</h3>
          <div className="space-y-4 font-semibold text-xs text-slate-700">
            {cityRiskBars.map((city, idx) => (
              <div key={idx} className="space-y-1.5 text-left">
                <div className="flex justify-between">
                  <span className="text-slate-800 font-semibold">{city.name}</span>
                  <span className="font-medium text-slate-500">{city.storesAtRisk} of {city.totalStores} stores at risk</span>
                </div>
                <div className="group relative h-2.5 w-full bg-slate-100 rounded-full">
                  <div className="h-full bg-bp-green rounded-full transition-colors duration-150 group-hover:bg-bp-green-dark" style={{ width: `${city.percent}%` }} />
                  <div className="pointer-events-none absolute right-0 top-full z-20 mt-2 rounded-lg bg-slate-900 px-3 py-2 text-[10px] font-semibold text-white opacity-0 shadow-lg transition-opacity group-hover:opacity-100">
                    {city.name}: {city.storesAtRisk} risky stores, scaled against highest city count ({maxCityRisk}).
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Forecast Accuracy Gauge */}
        <div className="bg-white border border-slate-200/80 rounded-3xl p-6 shadow-sm flex flex-col justify-between items-center">
          <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider mb-2 self-start w-full text-left">Forecast Accuracy (Overall)</h3>
          
          <div className="group relative w-36 h-24 flex items-end justify-center overflow-hidden">
            <svg className="w-36 h-36 absolute top-0" viewBox="0 0 100 100">
              <path d="M 15 50 A 35 35 0 0 1 85 50" fill="none" stroke="#f1f5f9" strokeWidth="8" strokeLinecap="round" />
              <path d="M 15 50 A 35 35 0 0 1 85 50" fill="none" stroke="#008751" strokeWidth="8" strokeLinecap="round" strokeDasharray="95.6 109.9" className="transition-opacity duration-150 group-hover:opacity-80">
                <title>Forecast accuracy: 87%</title>
              </path>
            </svg>
            <div className="flex flex-col items-center z-10">
              <span className="text-3xl font-bold tracking-tight text-slate-900 leading-none">87%</span>
              <span className="text-xs text-bp-green font-bold uppercase tracking-wider mt-1">Good</span>
            </div>
            <div className="pointer-events-none absolute left-1/2 top-2 z-20 w-44 -translate-x-1/2 rounded-lg bg-slate-900 px-3 py-2 text-center text-[10px] font-semibold text-white opacity-0 shadow-lg transition-opacity group-hover:opacity-100">
              87% forecast accuracy across the latest 30-day model window.
            </div>
          </div>

          <div className="text-center text-slate-400 text-[10px] font-bold uppercase tracking-wider mt-4">
            Calculated against 30-day forecast models
          </div>
        </div>
      </div>
    </div>
  );
}
