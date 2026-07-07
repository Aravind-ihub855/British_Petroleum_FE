"use client";

import React, { useState, useEffect } from "react";
import { useData } from "@/context/DataContext";
import { useAuth } from "@/context/AuthContext";

interface StoreDashboardProps {
  onNavigate: (tabId: string, subTabId: string, vendorName?: string, productCode?: string) => void;
}

export default function StoreDashboard({ onNavigate }: StoreDashboardProps) {
  const { stores, getStoreInventory, loading } = useData();
  const { user } = useAuth();
  const isStoreManager = user?.role === "store manager";

  const [selectedStoreId, setSelectedStoreId] = useState("");
  const [targetDate, setTargetDate] = useState("2026-07-01");

  const [filterCategory, setFilterCategory] = useState("All");
  const [filterRisk, setFilterRisk] = useState("All");
  const [filterFsn, setFilterFsn] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    if (isStoreManager && user?.storeId) {
      setSelectedStoreId(user.storeId);
    } else if (stores.length > 0 && !selectedStoreId) {
      setSelectedStoreId(stores[0].id);
    }
  }, [stores, selectedStoreId, user, isStoreManager]);

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

  // Actual today (midnight) for all calculations
  const TODAY = new Date();
  TODAY.setHours(0, 0, 0, 0);

  const calcDays = (dateStr: string): number => {
    const parts = dateStr.split("-");
    if (parts.length !== 3) return 999;
    const d = new Date(parseInt(parts[2]), parseInt(parts[1]) - 1, parseInt(parts[0]));
    return Math.max(0, Math.round((d.getTime() - TODAY.getTime()) / 86400000));
  };

  const calcRisk = (days: number): "High" | "Medium" | "Low" => {
    if (days <= 7) return "High";
    if (days <= 15) return "Medium";
    return "Low";
  };

  // Sort by predicted stockout date ascending (soonest first)
  const sortedInventory = [...inventory].sort((a, b) => {
    return calcDays(a.predictedStockoutDate) - calcDays(b.predictedStockoutDate);
  });

  // Calculate dynamic KPIs from the seeded store inventory
  const totalProducts = inventory.length;
  const atRiskCount = inventory.filter((item) => item.prMrStatus === "PR").length;
  const stockoutIn7Days = inventory.filter((item) => calcRisk(calcDays(item.predictedStockoutDate)) === "High").length;
  
  const serviceLevel = totalProducts > 0
    ? (inventory.reduce((sum, item) => sum + item.serviceLevel, 0) / totalProducts).toFixed(1)
    : "95.0";

  const getFsnCategory = (avgDaily: number): "Fast Moving" | "Slow Moving" | "Non Moving" => {
    if (avgDaily >= 25.0) return "Fast Moving";
    if (avgDaily >= 5.0) return "Slow Moving";
    return "Non Moving";
  };

  // Extract unique categories from this store's inventory
  const categories = Array.from(new Set(inventory.map((item) => item.category)));

  // Filter application
  const filteredInventory = sortedInventory.filter((item) => {
    const daysLeft = calcDays(item.predictedStockoutDate);
    const recalcRisk = calcRisk(daysLeft);
    const fsnCat = getFsnCategory(item.avgDailyConsumption);

    if (filterCategory !== "All" && item.category !== filterCategory) return false;
    if (filterRisk !== "All" && recalcRisk !== filterRisk) return false;
    if (filterFsn !== "All" && fsnCat !== filterFsn) return false;
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      const nameMatch = item.name.toLowerCase().includes(q);
      const codeMatch = item.code.toLowerCase().includes(q);
      if (!nameMatch && !codeMatch) return false;
    }
    return true;
  });

  return (
    <div className="space-y-6">
      
      {/* Top Filter Controls (only shown for non-store manager since store manager has only one store) */}
      {!isStoreManager && (
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
          </div>
        </div>
      )}

      {/* Grid of Interactive Table Filters */}
      <div className="bg-white p-5 rounded-xl border border-slate-100 shadow-xs flex flex-wrap gap-4 items-end text-left text-xs font-semibold text-slate-700">
        <div className="flex-1 min-w-[150px] space-y-1">
          <label className="text-[11px] text-slate-400 font-bold uppercase tracking-wider">Category</label>
          <select
            value={filterCategory}
            onChange={(e) => setFilterCategory(e.target.value)}
            className="w-full bg-slate-50 border border-slate-200 text-slate-700 py-2 px-3 rounded-lg focus:outline-none focus:ring-1 focus:ring-bp-green focus:border-bp-green transition duration-150"
          >
            <option value="All">All Categories</option>
            {categories.map((cat) => (
              <option key={cat} value={cat}>{cat}</option>
            ))}
          </select>
        </div>

        <div className="flex-1 min-w-[150px] space-y-1">
          <label className="text-[11px] text-slate-400 font-bold uppercase tracking-wider">Stockout Risk</label>
          <select
            value={filterRisk}
            onChange={(e) => setFilterRisk(e.target.value)}
            className="w-full bg-slate-50 border border-slate-200 text-slate-700 py-2 px-3 rounded-lg focus:outline-none focus:ring-1 focus:ring-bp-green focus:border-bp-green transition duration-150"
          >
            <option value="All">All Risks</option>
            <option value="High">High Risk (≤ 7 Days)</option>
            <option value="Medium">Medium Risk (8-15 Days)</option>
            <option value="Low">Low Risk (&gt; 15 Days)</option>
          </select>
        </div>

        <div className="flex-1 min-w-[150px] space-y-1">
          <label className="text-[11px] text-slate-400 font-bold uppercase tracking-wider">FSN Category</label>
          <select
            value={filterFsn}
            onChange={(e) => setFilterFsn(e.target.value)}
            className="w-full bg-slate-50 border border-slate-200 text-slate-700 py-2 px-3 rounded-lg focus:outline-none focus:ring-1 focus:ring-bp-green focus:border-bp-green transition duration-150"
          >
            <option value="All">All FSN Statuses</option>
            <option value="Fast Moving">Fast Moving</option>
            <option value="Slow Moving">Slow Moving</option>
            <option value="Non Moving">Non Moving</option>
          </select>
        </div>

        <div className="flex-[2] min-w-[240px] space-y-1 relative">
          <label className="text-[11px] text-slate-400 font-bold uppercase tracking-wider">Search</label>
          <div className="relative">
            <input
              type="text"
              placeholder="Search by Product ID or Product Name"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 text-slate-700 py-2 pl-9 pr-3 rounded-lg focus:outline-none focus:ring-1 focus:ring-bp-green focus:border-bp-green transition duration-150 font-medium"
            />
            <svg className="w-4 h-4 text-slate-400 absolute left-3 top-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
        </div>

        <button
          onClick={() => {
            setFilterCategory("All");
            setFilterRisk("All");
            setFilterFsn("All");
            setSearchQuery("");
          }}
          className="bg-white border border-slate-200 text-slate-500 hover:text-slate-800 py-2 px-4 rounded-lg flex items-center justify-center gap-1.5 transition duration-150 hover:bg-slate-50 min-h-[38px] font-bold border-emerald-500/20 text-bp-green"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
          </svg>
          Clear Filters
        </button>
      </div>

      {/* KPI Cards Row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-xl border border-slate-100 shadow-xs flex flex-col text-left">
          <span className="text-xs font-semibold text-slate-400 tracking-wide">Total Products</span>
          <span className="text-2xl font-bold tracking-tight text-slate-900 mt-2">{totalProducts}</span>
        </div>
        <div className="bg-white p-5 rounded-xl border border-slate-100 shadow-xs flex flex-col text-left">
          <span className="text-xs font-semibold text-slate-400 tracking-wide">Below ROL (PR)</span>
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
                <th className="py-3 px-4 text-center font-bold bg-slate-50">Days Left</th>
                <th className="py-3 px-4 text-right font-bold bg-slate-50">ROQ (Recommended)</th>
                <th className="py-3 px-4 text-center font-bold bg-slate-50">Order By (Recommended)</th>
                <th className="py-3 px-4 text-center font-bold bg-slate-50">PR/MR Status</th>
                <th className="py-3 px-5 text-center font-bold bg-slate-50">Risk Level</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium text-slate-600">
              {filteredInventory.map((row, idx) => {
                const daysLeft = calcDays(row.predictedStockoutDate);
                const recalcRisk = calcRisk(daysLeft);
                const riskColor =
                  recalcRisk === "High"
                    ? "text-rose-600 bg-rose-50/70 border-rose-100"
                    : recalcRisk === "Medium"
                    ? "text-amber-600 bg-amber-50/70 border-amber-100"
                    : "text-emerald-600 bg-emerald-50/70 border-emerald-100";

                // Order by date urgency using actual today
                const orderParts = row.orderByDate.split("-");
                const orderDate = orderParts.length === 3
                  ? new Date(parseInt(orderParts[2]), parseInt(orderParts[1]) - 1, parseInt(orderParts[0]))
                  : null;
                const orderDiff = orderDate ? Math.round((orderDate.getTime() - TODAY.getTime()) / 86400000) : 999;
                const isOverdue = orderDiff < 0;
                const isToday = orderDiff === 0;
                const isUrgent = orderDiff > 0 && orderDiff <= 3;

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
                    <td className="py-3.5 px-4 text-center">
                      <div className={`font-bold ${
                        daysLeft <= 3 ? "text-rose-600" :
                        daysLeft <= 7 ? "text-amber-600" :
                        "text-slate-800"
                      }`}>
                        {(() => {
                          const parts = row.predictedStockoutDate.split("-");
                          if (parts.length !== 3) return row.predictedStockoutDate;
                          const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
                          const mName = months[parseInt(parts[1]) - 1] || "";
                          return `${parts[0]} ${mName} ${parts[2]}`;
                        })()}
                      </div>
                      <div className="text-[10px] text-slate-400 font-normal mt-0.5">
                        ({daysLeft} {daysLeft === 1 ? "day" : "days"} left)
                      </div>
                    </td>
                    <td className="py-3.5 px-4 text-center">
                      <span className={`font-bold text-sm ${
                        daysLeft <= 3 ? "text-rose-600" :
                        daysLeft <= 7 ? "text-amber-600" :
                        daysLeft <= 15 ? "text-slate-700" :
                        "text-emerald-600"
                      }`}>{daysLeft}</span>
                    </td>
                    <td className="py-3.5 px-4 text-right font-semibold text-bp-green">{row.recommendedRoq}</td>
                    <td className="py-3.5 px-4 text-center">
                      <div className={`font-semibold ${isOverdue ? "text-rose-600" : isToday ? "text-amber-600" : "text-slate-800"}`}>
                        {(() => {
                          const parts = row.orderByDate.split("-");
                          if (parts.length !== 3) return row.orderByDate;
                          const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
                          const mName = months[parseInt(parts[1]) - 1] || "";
                          return `${parts[0]} ${mName} ${parts[2]}`;
                        })()}
                      </div>
                      <div className="text-[10px] text-slate-400 font-normal mt-0.5">
                        ({row.leadTimeDays} {row.leadTimeDays === 1 ? "day" : "days"} before stockout)
                      </div>
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
                          recalcRisk === "High" ? "bg-rose-500" :
                          recalcRisk === "Medium" ? "bg-amber-500" :
                          "bg-emerald-500"
                        }`} />
                        {recalcRisk}
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
