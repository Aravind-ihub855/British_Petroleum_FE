"use client";

import React, { useState, useEffect } from "react";
import { useData } from "@/context/DataContext";

interface StoreDashboardProps {
  onNavigate: (tabId: string, subTabId: string, vendorName?: string, productCode?: string) => void;
}

export default function StoreDashboard({ onNavigate }: StoreDashboardProps) {
  const { stores, getStoreInventory, loading } = useData();
  const [selectedStoreId, setSelectedStoreId] = useState("");
  const [targetDate, setTargetDate] = useState("2026-07-01");

  useEffect(() => {
    if (stores.length > 0 && !selectedStoreId) {
      setSelectedStoreId(stores[0].id);
    }
  }, [stores, selectedStoreId]);

  if (loading || !selectedStoreId) {
    return (
      <div className="flex justify-center items-center py-12 bg-white/40 backdrop-blur-md rounded-3xl p-8 border border-slate-200/50">
        <svg className="animate-spin h-8 w-8 text-bp-green" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
        </svg>
      </div>
    );
  }

  const inventory = getStoreInventory(selectedStoreId);

  // Calculate dynamic KPIs from the seeded store inventory
  const totalProducts = inventory.length;
  const atRiskCount = inventory.filter((item) => item.prMrStatus === "PR").length;
  const stockoutIn7Days = inventory.filter((item) => item.riskLevel === "High").length;
  
  const serviceLevel = totalProducts > 0
    ? (inventory.reduce((sum, item) => sum + item.serviceLevel, 0) / totalProducts).toFixed(1)
    : "95.0";

  return (
    <div className="space-y-6">
      
      {/* Top Filter Controls */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 bg-white p-5 rounded-xl border border-slate-100 shadow-xs">
        <div>
          <h2 className="text-sm font-bold text-slate-800">
            Store-Level Predictions
          </h2>
          <p className="text-[11px] text-slate-400 font-medium mt-0.5">
            Select a store outlet and target date to view predictions.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-4">
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-slate-400">Select Store</span>
            <select
              value={selectedStoreId}
              onChange={(e) => setSelectedStoreId(e.target.value)}
              className="bg-white border border-slate-200 text-xs font-semibold text-slate-700 py-1.5 px-3 rounded-lg focus:outline-none focus:ring-1 focus:ring-bp-green transition duration-150 shadow-xs"
            >
              {stores.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.id} ({s.name})
                </option>
              ))}
            </select>
          </div>
          {/* <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-slate-400">Date</span>
            <input
              type="date"
              value={targetDate}
              onChange={(e) => setTargetDate(e.target.value)}
              className="bg-white border border-slate-200 text-xs font-semibold text-slate-700 py-1.5 px-3 rounded-lg focus:outline-none focus:ring-1 focus:ring-bp-green transition duration-150 shadow-xs"
            />
          </div> */}
        </div>
      </div>

      {/* KPI Cards Row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-xl border border-slate-100 shadow-xs flex flex-col text-left">
          <span className="text-xs font-semibold text-slate-400 tracking-wide">Total Products</span>
          <span className="text-2xl font-bold tracking-tight text-slate-900 mt-2">{totalProducts}</span>
        </div>
        <div className="bg-white p-5 rounded-xl border border-slate-100 shadow-xs flex flex-col text-left">
          <span className="text-xs font-semibold text-slate-400 tracking-wide">At Risk Items</span>
          <span className="text-2xl font-bold tracking-tight text-slate-900 mt-2">{atRiskCount}</span>
        </div>
        <div className="bg-white p-5 rounded-xl border border-slate-100 shadow-xs flex flex-col text-left">
          <span className="text-xs font-semibold text-slate-400 tracking-wide">Stockout in 7 Days</span>
          <span className="text-2xl font-bold tracking-tight text-slate-900 mt-2">{stockoutIn7Days}</span>
        </div>
        <div className="bg-white p-5 rounded-xl border border-slate-100 shadow-xs flex flex-col text-left">
          <span className="text-xs font-semibold text-slate-400 tracking-wide">Service Level</span>
          <span className="text-2xl font-bold tracking-tight text-bp-green mt-2">{serviceLevel}%</span>
        </div>
      </div>

      {/* Main Predictions Table */}
      <div className="bg-white rounded-xl border border-slate-100 shadow-xs overflow-hidden text-left">
        <div className="p-5 border-b border-slate-50">
          <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
            Stockout Prediction - Store Level
          </h3>
        </div>
        <div className="overflow-x-auto max-h-[500px]">
          <table className="w-full text-xs text-left">
            <thead className="bg-slate-50 text-slate-500 tracking-wider font-semibold border-b border-slate-100 sticky top-0 z-10">
              <tr>
                <th className="py-3 px-5 font-bold bg-slate-50">Product</th>
                <th className="py-3 px-4 text-center font-bold bg-slate-50">UOM</th>
                <th className="py-3 px-4 text-right font-bold bg-slate-50">Current Stock</th>
                <th className="py-3 px-4 text-right font-bold bg-slate-50">Avg Daily Consumption</th>
                <th className="py-3 px-4 text-center font-bold bg-slate-50">Predicted Stockout Date</th>
                <th className="py-3 px-4 text-right font-bold bg-slate-50">ROQ (Recommended)</th>
                <th className="py-3 px-4 text-center font-bold bg-slate-50">Order By (Recommended)</th>
                <th className="py-3 px-4 text-center font-bold bg-slate-50">PR/MR Status</th>
                <th className="py-3 px-5 text-center font-bold bg-slate-50">Risk Level</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium text-slate-600">
              {inventory.map((row, idx) => {
                const riskColor =
                  row.riskLevel === "High"
                    ? "text-rose-600 bg-rose-50/70 border-rose-100"
                    : row.riskLevel === "Medium"
                    ? "text-amber-600 bg-amber-50/70 border-amber-100"
                    : "text-emerald-600 bg-emerald-50/70 border-emerald-100";

                const isOverdue = (() => {
                  const parts = row.orderByDate.split("-");
                  if (parts.length === 3) {
                    const orderDate = new Date(parseInt(parts[2]), parseInt(parts[1]) - 1, parseInt(parts[0]));
                    const currentDate = new Date(2026, 6, 7); // 07-07-2026 mock planning date
                    return orderDate < currentDate;
                  }
                  return false;
                })();

                return (
                  <tr key={idx} className="hover:bg-slate-50/40 transition duration-75">
                    <td className="py-3.5 px-5 font-semibold text-bp-green cursor-pointer hover:underline"
                      onClick={() => onNavigate("3", "product_wise", undefined, row.code)}
                    >
                      {row.name}
                    </td>
                    <td className="py-3.5 px-4 text-center text-slate-400 font-normal">{row.uom}</td>
                    <td className="py-3.5 px-4 text-right font-normal text-slate-700">{row.currentStock}</td>
                    <td className="py-3.5 px-4 text-right font-normal text-slate-500">{row.avgDailyConsumption}</td>
                    <td className="py-3.5 px-4 text-center font-medium text-slate-800">{row.predictedStockoutDate}</td>
                    <td className="py-3.5 px-4 text-right font-semibold text-bp-green">{row.recommendedRoq}</td>
                    <td className={`py-3.5 px-4 text-center font-semibold ${isOverdue ? "text-rose-600" : "text-slate-800"}`}>
                      <span>{row.orderByDate}</span>
                      {isOverdue && (
                        <span className="text-[9px] bg-rose-50 text-rose-600 px-1.5 py-0.5 rounded border border-rose-100 font-bold ml-1 uppercase tracking-wider inline-block">Overdue</span>
                      )}
                    </td>
                    <td className="py-3.5 px-4 text-center">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold border ${
                        row.prMrStatus === "PR" ? "bg-rose-50 text-rose-600 border-rose-100" :
                        row.prMrStatus === "MR" ? "bg-amber-50 text-amber-600 border-amber-100" :
                        "bg-slate-50 text-slate-400 border-slate-100"
                      }`}>
                        {row.prMrStatus}
                      </span>
                    </td>
                    <td className="py-3.5 px-5 text-center">
                      <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-semibold border uppercase tracking-wider inline-flex items-center gap-1.5 ${riskColor}`}>
                        <span className={`w-1.5 h-1.5 rounded-full ${
                          row.riskLevel === "High" ? "bg-rose-500" :
                          row.riskLevel === "Medium" ? "bg-amber-500" :
                          "bg-emerald-500"
                        }`} />
                        {row.riskLevel}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Legend Footer */}
        <div className="p-4 bg-slate-50/50 border-t border-slate-100 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 text-[10px] font-semibold text-slate-400">
          <div className="flex flex-wrap items-center gap-4">
            <span className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-rose-500" />
              High (≤ 7 Days)
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-amber-500" />
              Medium (8-15 Days)
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
              Low (&gt; 15 Days)
            </span>
          </div>
          <div className="text-slate-400">
            <span className="font-bold text-slate-500">PR:</span> Purchase Required | <span className="font-bold text-slate-500">MR:</span> Monitor &amp; Reorder
          </div>
        </div>
      </div>

    </div>
  );
}
