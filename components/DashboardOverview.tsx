"use client";

import React from "react";
import { useData } from "@/context/DataContext";
import { useAuth } from "@/context/AuthContext";

interface DashboardOverviewProps {
  onNavigate: (tabId: string, subTabId: string, vendorName?: string, productCode?: string) => void;
}

export default function DashboardOverview({ onNavigate }: DashboardOverviewProps) {
  const { stores, masterProducts, getStoreInventory, loading } = useData();
  const { user } = useAuth();
  const isStoreManager = user?.role === "store manager";

  // Always use actual today (midnight) for all date calculations
  const TODAY = new Date();
  TODAY.setHours(0, 0, 0, 0);

  const calcDaysRemaining = (dateStr: string): number => {
    const parts = dateStr.split("-");
    if (parts.length !== 3) return 999;
    const d = new Date(parseInt(parts[2]), parseInt(parts[1]) - 1, parseInt(parts[0]));
    return Math.max(0, Math.round((d.getTime() - TODAY.getTime()) / 86400000));
  };

  const calcRiskLevel = (days: number): "High" | "Medium" | "Low" => {
    if (days <= 7) return "High";
    if (days <= 15) return "Medium";
    return "Low";
  };

  // Scope stores for store manager
  const displayStores = isStoreManager && user?.storeId
    ? stores.filter(s => s.id === user.storeId)
    : stores;

  if (loading) {
    return (
      <div className="flex justify-center items-center py-12 bg-white/40 backdrop-blur-md rounded-3xl p-8 border border-slate-200/50">
        <svg className="animate-spin h-8 w-8 text-bp-green" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
        </svg>
      </div>
    );
  }

  const totalStores = stores.length;
  const totalMasterProducts = masterProducts.length;

  let overallValuation = 0;
  let overallAtRisk = 0;
  let totalSeededSKUsCount = 0;
  let belowReorderCount = 0;
  let pendingPrCount = 0;
  let pendingPrValue = 0;
  let healthyCount = 0;

  const productAggregates: Record<string, { riskLevel: "High" | "Medium" | "Low"; maxConsumption: number; category: string; daysToStockout: number }> = {};
  masterProducts.forEach((p) => {
    productAggregates[p.code] = { riskLevel: "Low", maxConsumption: 0, category: p.category, daysToStockout: 999 };
  });

  const allItems: Array<{
    code: string; name: string; uom: string; currentStock: number;
    predictedStockoutDate: string; daysRemaining: number; leadTimeDays: number;
    recommendedRoq: number; orderByDate: string; prMrStatus: string;
    riskLevel: string; category: string;
  }> = [];

  let overallHighRiskProductCount = 0; // for store manager KPI

  displayStores.forEach((st) => {
    const inv = getStoreInventory(st.id);

    // Check if this store has any High-risk items (recalculated from actual today)
    const hasHighRisk = inv.some((item) => calcRiskLevel(calcDaysRemaining(item.predictedStockoutDate)) === "High");
    if (hasHighRisk) overallAtRisk++;

    inv.forEach((item) => {
      overallValuation += item.currentStock * item.unitPrice;
      totalSeededSKUsCount++;
      if (item.currentStock <= item.rol) belowReorderCount++;
      if (item.prMrStatus === "PR") {
        pendingPrCount++;
        pendingPrValue += item.recommendedRoq * item.unitPrice;
      }

      // Recalculate days and risk from actual today
      const daysLeft = calcDaysRemaining(item.predictedStockoutDate);
      const recalcRisk = calcRiskLevel(daysLeft);
      if (recalcRisk === "Low") healthyCount++;

      const pInfo = productAggregates[item.code];
      if (pInfo) {
        if (item.avgDailyConsumption > pInfo.maxConsumption) pInfo.maxConsumption = item.avgDailyConsumption;
        // Upgrade risk level using recalculated value (consistent across all charts)
        if (recalcRisk === "High") pInfo.riskLevel = "High";
        else if (recalcRisk === "Medium" && pInfo.riskLevel !== "High") pInfo.riskLevel = "Medium";
        if (daysLeft < pInfo.daysToStockout) pInfo.daysToStockout = daysLeft;

        allItems.push({
          code: item.code,
          name: item.name,
          uom: item.uom,
          currentStock: item.currentStock,
          predictedStockoutDate: item.predictedStockoutDate,
          daysRemaining: daysLeft,
          leadTimeDays: item.leadTimeDays,
          recommendedRoq: item.recommendedRoq,
          orderByDate: item.orderByDate,
          prMrStatus: item.prMrStatus,
          riskLevel: recalcRisk, // always use recalculated risk
          category: item.category,
        });
      }
    });
  });

  // For store manager: count products (not stores) with High risk
  if (isStoreManager) {
    overallHighRiskProductCount = Object.values(productAggregates).filter(p => p.riskLevel === "High").length;
  }

  const formattedValuation = `$ ${(overallValuation / 1000000).toFixed(2)} M`;
  const formattedPrValue = `$ ${(pendingPrValue / 1000).toFixed(0)}K`;
  const inventoryHealthPct = totalSeededSKUsCount > 0 ? Math.round((healthyCount / totalSeededSKUsCount) * 100) : 0;
  const inventoryHealthLabel = inventoryHealthPct >= 70 ? "Good" : inventoryHealthPct >= 50 ? "Warning" : "Critical";
  const inventoryHealthColor = inventoryHealthPct >= 70 ? "text-bp-green" : inventoryHealthPct >= 50 ? "text-amber-500" : "text-rose-600";
  // For store manager: show product count; for others: show store count
  const criticalStockoutDisplay = isStoreManager ? overallHighRiskProductCount : overallAtRisk;
  const atRiskPct = isStoreManager
    ? (totalMasterProducts > 0 ? Math.round((overallHighRiskProductCount / totalMasterProducts) * 100) : 0)
    : (totalMasterProducts > 0 ? Math.round((overallAtRisk / totalMasterProducts) * 100) : 0);
  const atRiskLabel = isStoreManager ? "products" : "stores";
  const belowReorderPct = totalSeededSKUsCount > 0 ? Math.round((belowReorderCount / totalSeededSKUsCount) * 100) : 0;

  const productList = Object.values(productAggregates);
  const totalUniqueProducts = productList.length || 1;
  const highRiskProductCount = productList.filter((p) => p.riskLevel === "High").length;
  const mediumRiskProductCount = productList.filter((p) => p.riskLevel === "Medium").length;
  const lowRiskProductCount = productList.filter((p) => p.riskLevel === "Low").length;
  const fastMovingProductCount = productList.filter((p) => p.maxConsumption >= 25.0).length;
  const slowMovingProductCount = productList.filter((p) => p.maxConsumption >= 5.0 && p.maxConsumption < 25.0).length;
  const nonMovingProductCount = productList.filter((p) => p.maxConsumption < 5.0).length;
  const fastPercent = Math.round((fastMovingProductCount / totalUniqueProducts) * 100);
  const slowPercent = Math.round((slowMovingProductCount / totalUniqueProducts) * 100);
  const nonPercent = 100 - fastPercent - slowPercent;

  const criticalInlineItems = [...allItems]
    .filter((item) => item.riskLevel === "High" || item.riskLevel === "Medium")
    .sort((a, b) => a.daysRemaining - b.daysRemaining)
    .filter((item, idx, self) => self.findIndex(x => x.code === item.code) === idx)
    .slice(0, 8);

  const allAtRiskItems: { name: string; code: string; storesCount: number; soonestDate: string; daysRemaining: number; timestamp: number }[] = [];
  masterProducts.forEach((prod) => {
    let riskCount = 0;
    let soonestTimestamp = Infinity;
    let soonestStr = "N/A";
    let soonestDays = 999;
    displayStores.forEach((st) => {
      const inv = getStoreInventory(st.id);
      const item = inv.find((p) => p.code === prod.code);
      if (item) {
        const daysLeft = calcDaysRemaining(item.predictedStockoutDate);
        const recalcRisk = calcRiskLevel(daysLeft);
        if (recalcRisk === "High") {
          riskCount++;
          const parts = item.predictedStockoutDate.split("-");
          if (parts.length === 3) {
            const t = new Date(parseInt(parts[2]), parseInt(parts[1]) - 1, parseInt(parts[0])).getTime();
            if (t < soonestTimestamp) {
              soonestTimestamp = t;
              soonestStr = item.predictedStockoutDate;
              soonestDays = daysLeft;
            }
          }
        }
      }
    });
    if (riskCount > 0) allAtRiskItems.push({ name: prod.name, code: prod.code, storesCount: riskCount, soonestDate: soonestStr, daysRemaining: soonestDays, timestamp: soonestTimestamp });
  });
  const topAtRiskProducts = allAtRiskItems.sort((a, b) => a.timestamp - b.timestamp).slice(0, 5);

  const categoryRiskMap: Record<string, { le7: number; eightTo15: number; gt15: number; total: number }> = {};
  const seenCodes = new Set<string>();
  Object.entries(productAggregates).forEach(([code, info]) => {
    if (seenCodes.has(code)) return;
    seenCodes.add(code);
    const cat = info.category;
    if (!categoryRiskMap[cat]) categoryRiskMap[cat] = { le7: 0, eightTo15: 0, gt15: 0, total: 0 };
    categoryRiskMap[cat].total++;
    if (info.daysToStockout <= 7) categoryRiskMap[cat].le7++;
    else if (info.daysToStockout <= 15) categoryRiskMap[cat].eightTo15++;
    else categoryRiskMap[cat].gt15++;
  });
  const categoryRows = Object.entries(categoryRiskMap).map(([name, v]) => ({ name, ...v })).sort((a, b) => b.total - a.total).slice(0, 6);
  const maxCatTotal = Math.max(...categoryRows.map((c) => c.total), 1);

  const circumference = 251.3;
  const riskSegments = [
    { label: "High Risk", range: "<= 7 Days", value: highRiskProductCount, color: "#ef4444", dotClass: "bg-rose-500" },
    { label: "Medium Risk", range: "8-15 Days", value: mediumRiskProductCount, color: "#f97316", dotClass: "bg-orange-500" },
    { label: "Low Risk", range: "> 15 Days", value: lowRiskProductCount, color: "#008751", dotClass: "bg-bp-green" }
  ];
  let riskOffset = 0;
  const riskDonutSegments = riskSegments.map((segment) => {
    const length = (segment.value / totalUniqueProducts) * circumference;
    const offset = -riskOffset;
    riskOffset += length;
    return { ...segment, length, offset, percent: Math.round((segment.value / totalUniqueProducts) * 100) };
  });

  const fsnSegments = [
    { label: "Fast Moving", value: fastMovingProductCount, percent: fastPercent, color: "#008751", dotClass: "bg-bp-green" },
    { label: "Slow Moving", value: slowMovingProductCount, percent: slowPercent, color: "#f97316", dotClass: "bg-orange-500" },
    { label: "Non Moving", value: nonMovingProductCount, percent: nonPercent, color: "#ef4444", dotClass: "bg-rose-500" }
  ];
  let fsnOffset = 0;
  const fsnDonutSegments = fsnSegments.map((segment) => {
    const length = (segment.percent / 100) * circumference;
    const offset = -fsnOffset;
    fsnOffset += length;
    return { ...segment, length, offset };
  });

  const getPrBadgeClass = (status: string) => {
    if (status === "PR") return "bg-rose-100 text-rose-700 font-bold border border-rose-200";
    if (status === "MR") return "bg-amber-100 text-amber-700 font-bold border border-amber-200";
    return "bg-slate-100 text-slate-500 font-medium";
  };

  return (
    <div className="space-y-6">

      {/* KPI Cards */}
      <div className={`grid gap-4 ${isStoreManager ? "grid-cols-2 lg:grid-cols-5" : "grid-cols-2 lg:grid-cols-3 xl:grid-cols-6"}`}>

        {!isStoreManager && (
          <div className="bg-white border border-slate-200/80 rounded-2xl p-4 shadow-sm">
            <div className="flex items-center gap-1.5 text-slate-400 mb-1">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" /></svg>
              <span className="text-[11px] font-bold uppercase tracking-wider">Total Stores</span>
            </div>
            <span className="text-2xl font-bold tracking-tight text-slate-900">{totalStores}</span>
          </div>
        )}

        <div className="bg-white border border-slate-200/80 rounded-2xl p-4 shadow-sm">
          <div className="flex items-center gap-1.5 text-slate-400 mb-1">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" /></svg>
            <span className="text-[11px] font-bold uppercase tracking-wider">Total Products</span>
          </div>
          <span className="text-2xl font-bold tracking-tight text-slate-900">{totalMasterProducts}</span>
          <p className="text-[10px] text-slate-400 mt-0.5">Active SKUs</p>
        </div>

        <div className="bg-white border border-slate-200/80 rounded-2xl p-4 shadow-sm">
          <div className="flex items-center gap-1.5 text-slate-400 mb-1">
            <span className="text-[11px] font-bold uppercase tracking-wider">Inventory Value</span>
          </div>
          <span className="text-2xl font-bold tracking-tight text-slate-900">{formattedValuation}</span>
          <p className="text-[10px] text-slate-400 mt-0.5">Across all products</p>
        </div>

        <div className="bg-white border border-rose-100 rounded-2xl p-4 shadow-sm">
          <div className="flex items-center gap-1.5 mb-1">
            <div className="w-5 h-5 bg-rose-100 rounded-full flex items-center justify-center flex-shrink-0">
              <svg className="w-3 h-3 text-rose-600" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
            </div>
            <span className="text-[11px] font-bold uppercase tracking-wider text-rose-600">Critical Stockout</span>
          </div>
          <span className="text-2xl font-bold tracking-tight text-rose-600">{criticalStockoutDisplay}</span>
          <p className="text-[10px] text-slate-400 mt-0.5">{atRiskPct}% of {atRiskLabel}</p>
        </div>

        <div className="bg-white border border-amber-100 rounded-2xl p-4 shadow-sm">
          <div className="flex items-center gap-1.5 mb-1">
            <div className="w-5 h-5 bg-amber-100 rounded-full flex items-center justify-center flex-shrink-0">
              <svg className="w-3 h-3 text-amber-600" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M13 17h8m0 0V9m0 8l-8-8-4 4-6-6" /></svg>
            </div>
            <span className="text-[11px] font-bold uppercase tracking-wider text-amber-600">Below Reorder</span>
          </div>
          <span className="text-2xl font-bold tracking-tight text-amber-600">{belowReorderCount}</span>
          <p className="text-[10px] text-slate-400 mt-0.5">{belowReorderPct}% of products</p>
        </div>

        <div className="bg-white border border-slate-200/80 rounded-2xl p-4 shadow-sm">
          <div className="flex items-center gap-1.5 mb-1">
            <div className="w-5 h-5 bg-purple-100 rounded-full flex items-center justify-center flex-shrink-0">
              <svg className="w-3 h-3 text-purple-600" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
            </div>
            <span className="text-[11px] font-bold uppercase tracking-wider text-purple-600">Inventory Health</span>
          </div>
          <span className={`text-2xl font-bold tracking-tight ${inventoryHealthColor}`}>{inventoryHealthPct}%</span>
          <p className={`text-[10px] font-bold mt-0.5 ${inventoryHealthColor}`}>{inventoryHealthLabel}</p>
        </div>

        {/* <div className="bg-white border border-slate-200/80 rounded-2xl p-4 shadow-sm">
          <div className="flex items-center gap-1.5 mb-1">
            <div className="w-5 h-5 bg-emerald-100 rounded-full flex items-center justify-center flex-shrink-0">
              <svg className="w-3 h-3 text-bp-green" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" /></svg>
            </div>
            <span className="text-[11px] font-bold uppercase tracking-wider text-bp-green">Pending PRs</span>
          </div>
          <span className="text-2xl font-bold tracking-tight text-slate-900">{pendingPrCount}</span>
          <p className="text-[10px] text-slate-400 mt-0.5">Value: {formattedPrValue}</p>
        </div> */}

      </div>

      {/* Predictive Stockout Inline Table */}
      {/* <div className="bg-white border border-slate-200/80 rounded-3xl p-6 shadow-sm">
        <div className="flex items-center justify-between mb-5">
          <div>
            <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider">Predictive Stockout</h3>
            <p className="text-[11px] text-slate-400 mt-0.5">Products Needing Attention</p>
          </div>
          <button className="text-xs font-bold text-bp-green hover:underline" onClick={() => onNavigate("2", "store")}>View All ?</button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-slate-100 text-slate-400 font-bold uppercase text-[10px]">
                <th className="py-2.5 pr-3">Product Name</th>
                <th className="py-2.5 pr-3">SKU</th>
                <th className="py-2.5 pr-3 text-right">Current Stock</th>
                <th className="py-2.5 pr-3">UOM</th>
                <th className="py-2.5 pr-3">Stockout Date</th>
                <th className="py-2.5 pr-3 text-center">Days Left</th>
                <th className="py-2.5 pr-3 text-center">Lead Time</th>
                <th className="py-2.5 pr-3 text-right">ROQ</th>
                <th className="py-2.5 pr-3">Order By</th>
                <th className="py-2.5">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50 font-semibold text-slate-700">
              {criticalInlineItems.length === 0 ? (
                <tr><td colSpan={10} className="py-8 text-center text-slate-400 font-medium">No critical items found</td></tr>
              ) : criticalInlineItems.map((row, idx) => (
                <tr key={idx} className="hover:bg-slate-50/60 transition-colors cursor-pointer" onClick={() => onNavigate("2", "store")}>
                  <td className="py-3 pr-3 text-bp-green font-semibold max-w-[160px] truncate" title={row.name}>{row.name}</td>
                  <td className="py-3 pr-3 text-slate-400 font-medium">{row.code}</td>
                  <td className={`py-3 pr-3 text-right font-bold ${row.riskLevel === "High" ? "text-rose-600" : "text-amber-600"}`}>{row.currentStock}</td>
                  <td className="py-3 pr-3 text-slate-500">{row.uom}</td>
                  <td className="py-3 pr-3 text-slate-700">{row.predictedStockoutDate}</td>
                  <td className="py-3 pr-3 text-center">
                    <span className={`font-bold text-sm ${row.daysRemaining <= 3 ? "text-rose-600" : row.daysRemaining <= 7 ? "text-amber-600" : "text-slate-700"}`}>{row.daysRemaining}</span>
                  </td>
                  <td className="py-3 pr-3 text-center text-slate-500">{row.leadTimeDays}d</td>
                  <td className="py-3 pr-3 text-right text-slate-700">{row.recommendedRoq}</td>
                  <td className="py-3 pr-3 text-slate-600">{row.orderByDate}</td>
                  <td className="py-3">
                    <span className={`px-2 py-0.5 rounded-full text-[10px] ${getPrBadgeClass(row.prMrStatus)}`}>{row.prMrStatus}</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div> */}

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* Stockout Risk Summary Donut */}
        <div className="bg-white border border-slate-200/80 rounded-3xl p-6 shadow-sm flex flex-col justify-between">
          <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider mb-4">Stockout Risk Summary</h3>
          <div className="flex items-center justify-around flex-grow gap-4">
            <div className="relative w-32 h-32 flex-shrink-0">
              <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
                <circle cx="50" cy="50" r="40" stroke="#f1f5f9" strokeWidth="12" fill="transparent" />
                {riskDonutSegments.map((segment) => (
                  <circle key={segment.label} cx="50" cy="50" r="40" stroke={segment.color} strokeWidth="12"
                    strokeDasharray={`${segment.length} ${circumference}`} strokeDashoffset={segment.offset}
                    strokeLinecap="round" fill="transparent" className="transition-opacity duration-150 hover:opacity-80">
                    <title>{`${segment.label}: ${segment.value} (${segment.percent}%)`}</title>
                  </circle>
                ))}
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-xl font-bold text-slate-900">{totalMasterProducts}</span>
                <span className="text-[9px] text-slate-400 font-bold uppercase tracking-wider">Products</span>
              </div>
            </div>
            <div className="flex flex-col gap-2.5 text-xs font-semibold">
              {riskDonutSegments.map((segment) => (
                <div key={segment.label} className="flex items-center gap-2 rounded-md px-1 py-0.5 hover:bg-slate-50">
                  <span className={`w-3 h-3 rounded-full ${segment.dotClass} flex-shrink-0`} />
                  <div className="flex flex-col text-left">
                    <span className="text-slate-500 text-[10px]">{segment.label} ({segment.range})</span>
                    <span className="text-slate-800 font-bold">{segment.value} <span className="text-[10px] text-slate-400">({segment.percent}%)</span></span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* FSN Summary Donut */}
        <div className="bg-white border border-slate-200/80 rounded-3xl p-6 shadow-sm flex flex-col justify-between">
          <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider mb-4">FSN Summary</h3>
          <div className="flex items-center justify-around flex-grow gap-4">
            <div className="relative w-32 h-32 flex-shrink-0">
              <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
                <circle cx="50" cy="50" r="40" stroke="#f1f5f9" strokeWidth="12" fill="transparent" />
                {fsnDonutSegments.map((segment) => (
                  <circle key={segment.label} cx="50" cy="50" r="40" stroke={segment.color} strokeWidth="12"
                    strokeDasharray={`${segment.length} ${circumference}`} strokeDashoffset={segment.offset}
                    strokeLinecap="round" fill="transparent" className="transition-opacity duration-150 hover:opacity-80">
                    <title>{`${segment.label}: ${segment.value} (${segment.percent}%)`}</title>
                  </circle>
                ))}
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-xl font-bold text-slate-900">{totalMasterProducts}</span>
                <span className="text-[9px] text-slate-400 font-bold uppercase tracking-wider">Products</span>
              </div>
            </div>
            <div className="flex flex-col gap-3 text-xs font-semibold text-left">
              {fsnDonutSegments.map((segment) => (
                <div key={segment.label} className="flex items-center gap-2 hover:bg-slate-50 px-1 py-0.5 rounded-md">
                  <span className={`w-3 h-3 rounded-full ${segment.dotClass} flex-shrink-0`} />
                  <div className="flex flex-col">
                    <span className="text-slate-500 text-[10px]">{segment.label}</span>
                    <span className="text-slate-800 font-bold">{segment.value} <span className="text-[10px] text-slate-400">({segment.percent}%)</span></span>
                  </div>
                </div>
              ))}
              <div className="border-t border-slate-100 pt-2 mt-1">
                <span className="text-[10px] text-slate-400">Total Active Products</span>
                <p className="font-bold text-slate-800">{totalMasterProducts}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Top 5 Products at Risk */}
        <div className="bg-white border border-slate-200/80 rounded-3xl p-6 shadow-sm flex flex-col justify-between">
          <div>
            <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider mb-4 text-left">Top 5 at Risk</h3>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b border-slate-100 text-slate-400 font-bold uppercase">
                    <th className="py-2.5">Product</th>
                    {isStoreManager ? <th className="py-2.5 text-center">Days Left</th> : <th className="py-2.5 text-center">Stores</th>}
                    <th className="py-2.5 text-right">Date</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100/60 font-semibold text-slate-700">
                  {topAtRiskProducts.map((row, idx) => (
                    <tr key={idx} className="hover:bg-slate-50/60 cursor-pointer" onClick={() => onNavigate("2", "store", undefined, row.code)}>
                      <td className="py-3 text-bp-green font-semibold text-left truncate max-w-[100px]" title={row.name}>{row.name}</td>
                      {isStoreManager
                        ? <td className={`py-3 text-center font-bold ${row.daysRemaining <= 3 ? "text-rose-600" : "text-amber-600"}`}>{row.daysRemaining}</td>
                        : <td className="py-3 text-center text-rose-600 font-bold">{row.storesCount}</td>}
                      <td className="py-3 text-right text-slate-500 font-medium">{row.soonestDate}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
          <div className="text-right border-t border-slate-50/80 pt-3">
            <button className="text-xs font-bold text-bp-green hover:underline" onClick={() => onNavigate("2", "store")}>View All</button>
          </div>
        </div>

      </div>

      {/* Stockout Risk by Category + Forecast Accuracy */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        <div className="bg-white border border-slate-200/80 rounded-3xl p-6 shadow-sm lg:col-span-2">
          <div className="flex items-center justify-between mb-5">
            <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider">Stockout Risk by Category</h3>
            <div className="flex items-center gap-4 text-[10px] font-bold text-slate-500">
              <span className="flex items-center gap-1.5"><span className="w-3 h-2 rounded-sm bg-rose-500 inline-block" />&le; 7 Days</span>
              <span className="flex items-center gap-1.5"><span className="w-3 h-2 rounded-sm bg-amber-400 inline-block" />8-15 Days</span>
              <span className="flex items-center gap-1.5"><span className="w-3 h-2 rounded-sm bg-bp-green inline-block" />&gt; 15 Days</span>
            </div>
          </div>
          <div className="space-y-3">
            {categoryRows.map((cat, idx) => (
              <div key={idx} className="flex items-center gap-3 text-xs">
                <span className="w-28 text-slate-700 font-semibold text-right flex-shrink-0 truncate" title={cat.name}>{cat.name}</span>
                <div className="flex-grow flex h-6 rounded-lg overflow-hidden bg-slate-100">
                  {cat.le7 > 0 && (
                    <div className="bg-rose-500 flex items-center justify-center text-white font-bold text-[9px]"
                      style={{ width: `${(cat.le7 / maxCatTotal) * 100}%`, minWidth: "20px" }} title={`≤7 Days: ${cat.le7}`}>{cat.le7}</div>
                  )}
                  {cat.eightTo15 > 0 && (
                    <div className="bg-amber-400 flex items-center justify-center text-white font-bold text-[9px] ml-0.5"
                      style={{ width: `${(cat.eightTo15 / maxCatTotal) * 100}%`, minWidth: "20px" }} title={`8-15 Days: ${cat.eightTo15}`}>{cat.eightTo15}</div>
                  )}
                  {cat.gt15 > 0 && (
                    <div className="bg-bp-green flex items-center justify-center text-white font-bold text-[9px] ml-0.5"
                      style={{ width: `${(cat.gt15 / maxCatTotal) * 100}%`, minWidth: "20px" }} title={`>15 Days: ${cat.gt15}`}>{cat.gt15}</div>
                  )}
                </div>
                <span className="w-6 text-slate-500 font-bold text-right flex-shrink-0">{cat.total}</span>
              </div>
            ))}
          </div>
        </div>

        {/* <div className="bg-white border border-slate-200/80 rounded-3xl p-6 shadow-sm flex flex-col justify-between items-center">
          <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider mb-2 self-start w-full text-left">Forecast Accuracy</h3>
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
          </div>
          <div className="text-center text-slate-400 text-[10px] font-bold uppercase tracking-wider mt-4">Calculated against 30-day forecast models</div>
        </div> */}

      </div>
    </div>
  );
}
