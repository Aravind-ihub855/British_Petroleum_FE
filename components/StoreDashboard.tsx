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

  const [filterCategory, setFilterCategory] = useState("All");
  const [filterRisk, setFilterRisk] = useState("All");
  const [filterFsn, setFilterFsn] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");

  const [sortField, setSortField] = useState<string>("none");
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("asc");

  const handleSort = (field: string) => {
    if (sortField === field) {
      if (sortDirection === "asc") {
        setSortDirection("desc");
      } else {
        setSortField("none");
      }
    } else {
      setSortField(field);
      setSortDirection("asc");
    }
  };

  const renderSortIcon = (field: string) => {
    if (sortField !== field) return <span className="text-slate-300">↕</span>;
    return sortDirection === "asc" ? <span className="text-bp-green">▲</span> : <span className="text-bp-green">▼</span>;
  };

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

  // Calculate dynamic KPIs from the seeded store inventory
  const totalProducts = inventory.length;
  const atRiskCount = inventory.filter((item) => item.currentStock <= item.rol).length;
  const stockoutIn7Days = inventory.filter((item) => calcRisk(calcDays(item.predictedStockoutDate)) === "High").length;
  
  const overdueOrdersCount = inventory.filter((item) => {
    const parts = item.orderByDate.split("-");
    if (parts.length !== 3) return false;
    const orderDate = new Date(parseInt(parts[2]), parseInt(parts[1]) - 1, parseInt(parts[0]));
    orderDate.setHours(0, 0, 0, 0);
    return orderDate.getTime() < TODAY.getTime();
  }).length;

  const getFsnCategory = (avgDaily: number): "Fast Moving" | "Slow Moving" | "Non Moving" => {
    if (avgDaily >= 25.0) return "Fast Moving";
    if (avgDaily >= 5.0) return "Slow Moving";
    return "Non Moving";
  };

  // Extract unique categories from this store's inventory
  const categories = Array.from(new Set(inventory.map((item) => item.category)));

  // Filter application
  const filteredInventory = inventory.filter((item) => {
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

  const sortedFilteredInventory = [...filteredInventory].sort((a, b) => {
    if (sortField === "none") {
      const daysA = calcDays(a.predictedStockoutDate);
      const daysB = calcDays(b.predictedStockoutDate);
      if (daysA !== daysB) return daysA - daysB;
      return a.name.localeCompare(b.name);
    }

    let aVal: any;
    let bVal: any;

    if (sortField === "name") {
      aVal = a.name;
      bVal = b.name;
    } else if (sortField === "uom") {
      aVal = a.uom;
      bVal = b.uom;
    } else if (sortField === "currentStock") {
      aVal = a.currentStock;
      bVal = b.currentStock;
    } else if (sortField === "safetyStockLevel") {
      aVal = a.safetyStockLevel;
      bVal = b.safetyStockLevel;
    } else if (sortField === "avgDailyConsumption") {
      aVal = a.avgDailyConsumption;
      bVal = b.avgDailyConsumption;
    } else if (sortField === "predictedStockoutDate") {
      aVal = calcDays(a.predictedStockoutDate);
      bVal = calcDays(b.predictedStockoutDate);
    } else if (sortField === "daysLeft") {
      aVal = calcDays(a.predictedStockoutDate);
      bVal = calcDays(b.predictedStockoutDate);
    } else if (sortField === "recommendedRoq") {
      aVal = a.recommendedRoq;
      bVal = b.recommendedRoq;
    } else if (sortField === "leadTimeDays") {
      aVal = a.leadTimeDays;
      bVal = b.leadTimeDays;
    } else if (sortField === "orderByDate") {
      const aParts = a.orderByDate.split("-");
      const bParts = b.orderByDate.split("-");
      aVal = aParts.length === 3 ? new Date(parseInt(aParts[2]), parseInt(aParts[1]) - 1, parseInt(aParts[0])).getTime() : 0;
      bVal = bParts.length === 3 ? new Date(parseInt(bParts[2]), parseInt(bParts[1]) - 1, parseInt(bParts[0])).getTime() : 0;
    } else if (sortField === "prMrStatus") {
      aVal = a.prMrStatus;
      bVal = b.prMrStatus;
    } else if (sortField === "riskLevel") {
      const riskRank = { High: 3, Medium: 2, Low: 1 };
      aVal = riskRank[calcRisk(calcDays(a.predictedStockoutDate))] || 0;
      bVal = riskRank[calcRisk(calcDays(b.predictedStockoutDate))] || 0;
    } else {
      aVal = a.name;
      bVal = b.name;
    }

    if (typeof aVal === "string") {
      return sortDirection === "asc" ? aVal.localeCompare(bVal) : bVal.localeCompare(aVal);
    } else {
      return sortDirection === "asc" ? (aVal - bVal) : (bVal - aVal);
    }
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

            {/* KPI Cards Row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-5">
        <div className="bg-white p-5 rounded-2xl border-t-4 border-t-bp-green border-x border-b border-slate-100 shadow-sm flex flex-col text-left card-hover-effect">
          <span className="text-[10px] font-extrabold text-slate-500 uppercase tracking-wider">Total Products</span>
          <span className="text-3xl font-extrabold tracking-tight text-bp-green mt-2">{totalProducts}</span>
          <p className="text-[9.5px] text-slate-400 font-bold mt-1.5 uppercase tracking-wide">Active catalog items</p>
        </div>
        <div className="bg-white p-5 rounded-2xl border-t-4 border-t-orange-500 border-x border-b border-slate-100 shadow-sm flex flex-col text-left card-hover-effect">
          <span className="text-[10px] font-extrabold text-slate-500 uppercase tracking-wider">Below ROL (PR Needed)</span>
          <span className="text-3xl font-extrabold tracking-tight text-orange-500 mt-2">{atRiskCount}</span>
          <p className="text-[9.5px] text-slate-400 font-bold mt-1.5 uppercase tracking-wide">Purchase requests required</p>
        </div>
        <div className="bg-white p-5 rounded-2xl border-t-4 border-t-rose-500 border-x border-b border-slate-100 shadow-sm flex flex-col text-left card-hover-effect">
          <span className="text-[10px] font-extrabold text-slate-500 uppercase tracking-wider">Stockout in 7 Days</span>
          <span className="text-3xl font-extrabold tracking-tight text-rose-600 mt-2">{stockoutIn7Days}</span>
          <p className="text-[9.5px] text-slate-400 font-bold mt-1.5 uppercase tracking-wide">Products at risk</p>
        </div>
        <div className="bg-white p-5 rounded-2xl border-t-4 border-t-rose-500 border-x border-b border-slate-100 shadow-sm flex flex-col text-left card-hover-effect">
          <span className="text-[10px] font-extrabold text-slate-500 uppercase tracking-wider">Overdue Orders</span>
          <span className="text-3xl font-extrabold tracking-tight text-rose-600 mt-2">{overdueOrdersCount}</span>
          <p className="text-[9.5px] text-slate-400 font-bold mt-1.5 uppercase tracking-wide">Orders past deadline</p>
        </div>
      </div>

      {/* Grid of Interactive Table Filters */}
      <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm flex flex-wrap gap-4 items-end text-left text-xs font-semibold text-slate-700 card-hover-effect">
        <div className="flex-1 min-w-[150px] space-y-1">
          <label className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Category</label>
          <select
            value={filterCategory}
            onChange={(e) => setFilterCategory(e.target.value)}
            className="w-full bg-slate-50 border border-slate-200 text-slate-700 py-2 px-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-bp-green transition duration-150 shadow-sm"
          >
            <option value="All">All Categories</option>
            {categories.map((cat) => (
              <option key={cat} value={cat}>{cat}</option>
            ))}
          </select>
        </div>

        <div className="flex-1 min-w-[150px] space-y-1">
          <label className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Stockout Risk</label>
          <select
            value={filterRisk}
            onChange={(e) => setFilterRisk(e.target.value)}
            className="w-full bg-slate-50 border border-slate-200 text-slate-700 py-2 px-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-bp-green transition duration-150 shadow-sm"
          >
            <option value="All">All Risks</option>
            <option value="High">High Risk (≤ 7 Days)</option>
            <option value="Medium">Medium Risk (8-15 Days)</option>
            <option value="Low">Low Risk (&gt; 15 Days)</option>
          </select>
        </div>

        <div className="flex-1 min-w-[150px] space-y-1">
          <label className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">FSN Category</label>
          <select
            value={filterFsn}
            onChange={(e) => setFilterFsn(e.target.value)}
            className="w-full bg-slate-50 border border-slate-200 text-slate-700 py-2 px-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-bp-green transition duration-150 shadow-sm"
          >
            <option value="All">All FSN Statuses</option>
            <option value="Fast Moving">Fast Moving</option>
            <option value="Slow Moving">Slow Moving</option>
            <option value="Non Moving">Non Moving</option>
          </select>
        </div>

        <div className="flex-[2] min-w-[240px] space-y-1 relative">
          <label className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Search</label>
          <div className="relative">
            <input
              type="text"
              placeholder="Search by Product ID or Product Name"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 text-slate-700 py-2 pl-9 pr-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-bp-green transition duration-150 font-semibold shadow-sm"
            />
            <svg className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
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
          className="bg-white border border-slate-200 text-bp-green hover:bg-slate-50 py-2 px-4 rounded-lg flex items-center justify-center gap-1.5 transition duration-150 min-h-[38px] font-bold shadow-sm"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
          </svg>
          Clear Filters
        </button>
      </div>



      {/* Main Predictions Table */}
      <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden text-left card-hover-effect">
        <div className="px-6 py-5 border-b border-slate-50">
          <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
            Stockout Prediction - Store Level
          </h3>
        </div>
        <div className="overflow-x-auto max-h-[500px] scrollbar-thin">
          <table className="w-full text-[11px] text-left">
            <thead className="bg-slate-100 text-slate-700 font-extrabold tracking-wider uppercase border-b border-slate-200 sticky top-0 z-10 text-[9.5px]">
              <tr>
                <th onClick={() => handleSort("name")} className="py-2.5 px-3.5 pr-4.5 border-r border-slate-200 cursor-pointer hover:bg-slate-200/50 transition select-none text-left w-[220px] min-w-[220px] relative">
                  <div className="flex items-center justify-start pr-2">
                    <span>Product</span>
                  </div>
                  <div className="absolute right-1.5 top-1/2 -translate-y-1/2 text-[9px] pointer-events-none select-none">
                    {renderSortIcon("name")}
                  </div>
                </th>
                <th onClick={() => handleSort("uom")} className="py-2.5 px-2 pr-3.5 border-r border-slate-200 cursor-pointer hover:bg-slate-200/50 transition select-none text-center relative">
                  <div className="flex items-center justify-center">
                    <span>UOM</span>
                  </div>
                  <div className="absolute right-1 top-1/2 -translate-y-1/2 text-[9px] pointer-events-none select-none">
                    {renderSortIcon("uom")}
                  </div>
                </th>
                <th onClick={() => handleSort("currentStock")} className="py-2.5 px-2 pr-3.5 border-r border-slate-200 cursor-pointer hover:bg-slate-200/50 transition select-none text-center leading-tight relative">
                  <div className="flex flex-col items-center justify-center">
                    <span>Current</span>
                    <span>Stock</span>
                  </div>
                  <div className="absolute right-1 top-1/2 -translate-y-1/2 text-[9px] pointer-events-none select-none">
                    {renderSortIcon("currentStock")}
                  </div>
                </th>
                <th onClick={() => handleSort("safetyStockLevel")} className="py-2.5 px-2 pr-3.5 border-r border-slate-200 cursor-pointer hover:bg-slate-200/50 transition select-none text-center leading-tight relative">
                  <div className="flex flex-col items-center justify-center">
                    <span>Safety</span>
                    <span>Stock</span>
                  </div>
                  <div className="absolute right-1 top-1/2 -translate-y-1/2 text-[9px] pointer-events-none select-none">
                    {renderSortIcon("safetyStockLevel")}
                  </div>
                </th>
                <th onClick={() => handleSort("avgDailyConsumption")} className="py-2.5 px-2 pr-3.5 border-r border-slate-200 cursor-pointer hover:bg-slate-200/50 transition select-none text-center leading-tight relative">
                  <div className="flex flex-col items-center justify-center">
                    <span>Avg Daily</span>
                    <span>Consumption</span>
                  </div>
                  <div className="absolute right-1 top-1/2 -translate-y-1/2 text-[9px] pointer-events-none select-none">
                    {renderSortIcon("avgDailyConsumption")}
                  </div>
                </th>
                <th onClick={() => handleSort("predictedStockoutDate")} className="py-2.5 px-2 pr-3.5 border-r border-slate-200 cursor-pointer hover:bg-slate-200/50 transition select-none text-center leading-tight relative">
                  <div className="flex flex-col items-center justify-center">
                    <span>Stockout</span>
                    <span>Date</span>
                  </div>
                  <div className="absolute right-1 top-1/2 -translate-y-1/2 text-[9px] pointer-events-none select-none">
                    {renderSortIcon("predictedStockoutDate")}
                  </div>
                </th>
                <th onClick={() => handleSort("daysLeft")} className="py-2.5 px-2 pr-3.5 border-r border-slate-200 cursor-pointer hover:bg-slate-200/50 transition select-none text-center leading-tight relative">
                  <div className="flex flex-col items-center justify-center">
                    <span>Days</span>
                    <span>Left</span>
                  </div>
                  <div className="absolute right-1 top-1/2 -translate-y-1/2 text-[9px] pointer-events-none select-none">
                    {renderSortIcon("daysLeft")}
                  </div>
                </th>
                <th onClick={() => handleSort("recommendedRoq")} className="py-2.5 px-2 pr-3.5 border-r border-slate-200 cursor-pointer hover:bg-slate-200/50 transition select-none text-center relative">
                  <div className="flex items-center justify-center">
                    <span>ROQ</span>
                  </div>
                  <div className="absolute right-1 top-1/2 -translate-y-1/2 text-[9px] pointer-events-none select-none">
                    {renderSortIcon("recommendedRoq")}
                  </div>
                </th>
                <th onClick={() => handleSort("leadTimeDays")} className="py-2.5 px-2 pr-3.5 border-r border-slate-200 cursor-pointer hover:bg-slate-200/50 transition select-none text-center leading-tight relative">
                  <div className="flex flex-col items-center justify-center">
                    <span>Lead</span>
                    <span>Time</span>
                  </div>
                  <div className="absolute right-1 top-1/2 -translate-y-1/2 text-[9px] pointer-events-none select-none">
                    {renderSortIcon("leadTimeDays")}
                  </div>
                </th>
                <th onClick={() => handleSort("orderByDate")} className="py-2.5 px-2 pr-3.5 border-r border-slate-200 cursor-pointer hover:bg-slate-200/50 transition select-none text-center leading-tight relative">
                  <div className="flex flex-col items-center justify-center">
                    <span>Order</span>
                    <span>By</span>
                  </div>
                  <div className="absolute right-1 top-1/2 -translate-y-1/2 text-[9px] pointer-events-none select-none">
                    {renderSortIcon("orderByDate")}
                  </div>
                </th>
                <th onClick={() => handleSort("prMrStatus")} className="py-2.5 px-2 pr-3.5 border-r border-slate-200 cursor-pointer hover:bg-slate-200/50 transition select-none text-center relative">
                  <div className="flex items-center justify-center">
                    <span>Status</span>
                  </div>
                  <div className="absolute right-1 top-1/2 -translate-y-1/2 text-[9px] pointer-events-none select-none">
                    {renderSortIcon("prMrStatus")}
                  </div>
                </th>
                <th onClick={() => handleSort("riskLevel")} className="py-2.5 px-3 pr-4 border-r border-slate-200 cursor-pointer hover:bg-slate-200/50 transition select-none text-center leading-tight relative">
                  <div className="flex flex-col items-center justify-center">
                    <span>Risk</span>
                    <span>Level</span>
                  </div>
                  <div className="absolute right-1.5 top-1/2 -translate-y-1/2 text-[9px] pointer-events-none select-none">
                    {renderSortIcon("riskLevel")}
                  </div>
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100/60 font-semibold text-slate-700">
               {sortedFilteredInventory.map((row, idx) => {
                const daysLeft = calcDays(row.predictedStockoutDate);
                const recalcRisk = calcRisk(daysLeft);
                const riskColor =
                  recalcRisk === "High"
                    ? "text-rose-600 bg-rose-50 border-rose-100"
                    : "text-slate-600 bg-slate-50 border-slate-200";

                // Order by date urgency using actual today
                const orderParts = row.orderByDate.split("-");
                const orderDate = orderParts.length === 3
                  ? new Date(parseInt(orderParts[2]), parseInt(orderParts[1]) - 1, parseInt(orderParts[0]))
                  : null;
                const orderDiff = orderDate ? Math.round((orderDate.getTime() - TODAY.getTime()) / 86400000) : 999;
                const isOverdue = orderDiff < 0;
                const isToday = orderDiff === 0;

                return (
                  <tr key={idx} className="hover:bg-slate-50/50 transition duration-75">
                    <td className="py-2.5 px-3.5 border-r border-slate-100 text-left w-[220px] min-w-[220px]"
                      onClick={() => onNavigate("3", "product_wise", undefined, row.code)}
                    >
                      <div className="leading-tight font-bold text-slate-800 hover:text-bp-green cursor-pointer max-w-[220px]">
                        {row.name}
                      </div>
                    </td>
                    <td className="py-2.5 px-2 text-center text-slate-400 font-medium border-r border-slate-100">{row.uom}</td>
                    <td className="py-2.5 px-2 text-center text-slate-700 font-normal border-r border-slate-100">{row.currentStock}</td>
                    <td className="py-2.5 px-2 text-center text-slate-500 font-medium border-r border-slate-100">{row.safetyStockLevel}</td>
                    <td className="py-2.5 px-2 text-center text-slate-500 font-medium border-r border-slate-100">{row.avgDailyConsumption}</td>
                    <td className="py-2.5 px-2 text-center border-r border-slate-100">
                      <div className="font-bold text-slate-800 whitespace-nowrap">
                        {(() => {
                          const parts = row.predictedStockoutDate.split("-");
                          if (parts.length !== 3) return row.predictedStockoutDate;
                          const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
                          const mName = months[parseInt(parts[1]) - 1] || "";
                          return `${parts[0]} ${mName} ${parts[2]}`;
                        })()}
                      </div>
                      <div className="text-[9px] text-slate-400 font-medium mt-0.5 animate-none whitespace-nowrap">
                        ({daysLeft} {daysLeft === 1 ? "day" : "days"} left)
                      </div>
                    </td>
                    <td className="py-2.5 px-2 text-center border-r border-slate-100">
                      <span className="font-extrabold text-sm text-slate-800">{daysLeft}</span>
                    </td>
                    <td className="py-2.5 px-2 text-center font-bold text-slate-800 border-r border-slate-100">{row.recommendedRoq}</td>
                    <td className="py-2.5 px-2 text-center text-slate-500 font-medium border-r border-slate-100">
                      {row.leadTimeDays} {row.leadTimeDays === 1 ? "day" : "days"}
                    </td>
                    <td className="py-2.5 px-2 text-center border-r border-slate-100">
                      <div className="flex flex-col items-center justify-center">
                        <div className="font-bold text-slate-800 whitespace-nowrap">
                          {(() => {
                            const parts = row.orderByDate.split("-");
                            if (parts.length !== 3) return row.orderByDate;
                            const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
                            const mName = months[parseInt(parts[1]) - 1] || "";
                            return `${parts[0]} ${mName} ${parts[2]}`;
                          })()}
                        </div>
                        <div className="text-[8.5px] mt-0.5 whitespace-nowrap">
                          {isOverdue ? (
                            <span className="text-rose-600 font-bold uppercase tracking-wide">Overdue</span>
                          ) : (
                            <span className="text-slate-400 font-medium">({row.leadTimeDays} {row.leadTimeDays === 1 ? "day" : "days"} before stock out)</span>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="py-2.5 px-2 text-center border-r border-slate-100">
                      <span className="px-2 py-0.5 rounded-full text-[9px] font-extrabold border bg-slate-50 text-slate-600 border-slate-200">
                        {row.prMrStatus}
                      </span>
                    </td>
                    <td className="py-2.5 px-2 text-center">
                      <span className={`px-2 py-0.5 rounded-full text-[8.5px] font-extrabold border uppercase tracking-wider inline-flex items-center gap-1 ${riskColor}`}>
                        <span className={`w-1 h-1 rounded-full ${
                          recalcRisk === "High" ? "bg-rose-500" :
                          "bg-slate-400"
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
        <div className="p-4 bg-slate-50/50 border-t border-slate-100 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 text-[10px] font-bold text-slate-400">
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
            <span className="font-extrabold text-slate-500">PR:</span> Purchase Required | <span className="font-extrabold text-slate-500">MR:</span> Monitor &amp; Reorder
          </div>
        </div>
      </div>

    </div>
  );
}
