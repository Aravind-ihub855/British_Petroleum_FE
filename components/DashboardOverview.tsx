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

  const [hoveredRisk, setHoveredRisk] = React.useState<{ label: string; value: number; percent: number } | null>(null);
  const [hoveredFsn, setHoveredFsn] = React.useState<{ label: string; value: number; percent: number } | null>(null);

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

  const productAggregates: Record<string, { riskLevel: "High" | "Medium" | "Low"; totalConsumption: number; storeCount: number; category: string; daysToStockout: number }> = {};
  masterProducts.forEach((p) => {
    productAggregates[p.code] = { riskLevel: "Low", totalConsumption: 0, storeCount: 0, category: p.category, daysToStockout: 999 };
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
        pInfo.totalConsumption += item.avgDailyConsumption;
        pInfo.storeCount++;
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
  const healthTheme =
    inventoryHealthPct >= 70
      ? { border: "border-t-bp-green", bg: "bg-emerald-50", text: "text-bp-green" }
      : inventoryHealthPct >= 50
      ? { border: "border-t-amber-500", bg: "bg-amber-50", text: "text-amber-600" }
      : { border: "border-t-rose-500", bg: "bg-rose-50", text: "text-rose-600" };
  // For store manager: show product count; for others: show store count
  const criticalStockoutDisplay = isStoreManager ? overallHighRiskProductCount : overallAtRisk;
  const atRiskPct = isStoreManager
    ? (totalMasterProducts > 0 ? Math.round((overallHighRiskProductCount / totalMasterProducts) * 100) : 0)
    : (totalMasterProducts > 0 ? Math.round((overallAtRisk / totalMasterProducts) * 100) : 0);
  const atRiskLabel = isStoreManager ? "products" : "stores";
  const belowReorderPct = totalSeededSKUsCount > 0 ? Math.round((belowReorderCount / totalSeededSKUsCount) * 100) : 0;

  const productList = Object.values(productAggregates).map((p) => {
    const avgConsumption = p.storeCount > 0 ? p.totalConsumption / p.storeCount : 0;
    return { ...p, avgConsumption };
  });
  const totalUniqueProducts = productList.length || 1;
  const highRiskProductCount = productList.filter((p) => p.riskLevel === "High").length;
  const mediumRiskProductCount = productList.filter((p) => p.riskLevel === "Medium").length;
  const lowRiskProductCount = productList.filter((p) => p.riskLevel === "Low").length;
  const fastMovingProductCount = productList.filter((p) => p.avgConsumption >= 25.0).length;
  const slowMovingProductCount = productList.filter((p) => p.avgConsumption >= 5.0 && p.avgConsumption < 25.0).length;
  const nonMovingProductCount = productList.filter((p) => p.avgConsumption < 5.0).length;
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
  const storeManagerTopAtRiskItems = [...allItems]
    .filter((item) => item.riskLevel === "High")
    .sort((a, b) => {
      if (a.daysRemaining !== b.daysRemaining) return a.daysRemaining - b.daysRemaining;
      return a.name.localeCompare(b.name);
    })
    .slice(0, 5)
    .map((item) => ({
      name: item.name,
      code: item.code,
      storesCount: 1,
      soonestDate: item.predictedStockoutDate,
      daysRemaining: item.daysRemaining,
      timestamp: item.daysRemaining,
    }));

  const topAtRiskProducts = isStoreManager
    ? storeManagerTopAtRiskItems
    : allAtRiskItems.sort((a, b) => a.timestamp - b.timestamp).slice(0, 5);

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
    <div className="space-y-8 animate-fadeIn">

      {/* KPI Cards */}
      <div className={`grid gap-5 ${isStoreManager ? "grid-cols-2 lg:grid-cols-5" : "grid-cols-2 lg:grid-cols-3 xl:grid-cols-6"}`}>

        {!isStoreManager && (
          <div className="bg-white border-t-4 border-t-bp-green border-x border-b border-slate-100 rounded-2xl p-5 shadow-sm card-hover-effect text-left">
            <div className="flex items-center gap-2 text-slate-400 mb-2">
              <div className="w-7 h-7 rounded-lg bg-emerald-50 flex items-center justify-center text-bp-green flex-shrink-0">
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" /></svg>
              </div>
              <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-500">Total Stores</span>
            </div>
            <span className="text-3xl font-extrabold tracking-tight text-slate-900">{totalStores}</span>
            <p className="text-[10px] text-slate-400 mt-1 font-medium">Active retail outlets</p>
          </div>
        )}

        <div className="bg-white border-t-4 border-t-bp-green border-x border-b border-slate-100 rounded-2xl p-5 shadow-sm card-hover-effect text-left">
          <div className="flex items-center gap-2 text-slate-400 mb-2">
            <div className="w-7 h-7 rounded-lg bg-emerald-50 flex items-center justify-center text-bp-green flex-shrink-0">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" /></svg>
            </div>
            <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-500">Total Products</span>
          </div>
          <span className="text-3xl font-extrabold tracking-tight text-slate-900">{totalMasterProducts}</span>
          <p className="text-[10px] text-slate-400 mt-1 font-medium">Active items</p>
        </div>

        <div className="bg-white border-t-4 border-t-bp-yellow border-x border-b border-slate-100 rounded-2xl p-5 shadow-sm card-hover-effect text-left">
          <div className="flex items-center gap-2 text-slate-400 mb-2">
            <div className="w-7 h-7 rounded-lg bg-yellow-50 flex items-center justify-center text-yellow-600 flex-shrink-0">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M12 16V5" /></svg>
            </div>
            <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-500">Inventory Value</span>
          </div>
          <span className="text-3xl font-extrabold tracking-tight text-slate-900">{formattedValuation}</span>
          <p className="text-[10px] text-slate-400 mt-1 font-medium">Stock valuation</p>
        </div>

        <div className="bg-white border-t-4 border-t-rose-500 border-x border-b border-slate-100 rounded-2xl p-5 shadow-sm card-hover-effect text-left">
          <div className="flex items-center gap-2 mb-2">
            <div className="w-7 h-7 bg-rose-550/10 rounded-lg flex items-center justify-center text-rose-600 flex-shrink-0">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
            </div>
            <span className="text-[10px] font-extrabold uppercase tracking-wider text-rose-600">Critical Stockout</span>
          </div>
          <span className="text-3xl font-extrabold tracking-tight text-rose-600">{criticalStockoutDisplay}</span>
          <p className="text-[10px] text-slate-400 mt-1 font-medium">{atRiskPct}% of {atRiskLabel} at risk</p>
        </div>

        <div className="bg-white border-t-4 border-t-orange-500 border-x border-b border-slate-100 rounded-2xl p-5 shadow-sm card-hover-effect text-left">
          <div className="flex items-center gap-2 mb-2">
            <div className="w-7 h-7 bg-orange-50 rounded-lg flex items-center justify-center text-orange-500 flex-shrink-0">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M13 17h8m0 0V9m0 8l-8-8-4 4-6-6" /></svg>
            </div>
            <span className="text-[10px] font-extrabold uppercase tracking-wider text-orange-500">Below Reorder</span>
          </div>
          <span className="text-3xl font-extrabold tracking-tight text-orange-550">{belowReorderCount}</span>
          <p className="text-[10px] text-slate-400 mt-1 font-medium">{belowReorderPct}% SKU reorder limits</p>
        </div>

        <div className={`bg-white border-t-4 ${healthTheme.border} border-x border-b border-slate-100 rounded-2xl p-5 shadow-sm card-hover-effect text-left`}>
          <div className="flex items-center gap-2 mb-2">
            <div className={`w-7 h-7 ${healthTheme.bg} rounded-lg flex items-center justify-center ${healthTheme.text} flex-shrink-0`}>
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
            </div>
            <span className={`text-[10px] font-extrabold uppercase tracking-wider ${healthTheme.text}`}>Inventory Health</span>
          </div>
          <span className={`text-3xl font-extrabold tracking-tight ${healthTheme.text}`}>{inventoryHealthPct}%</span>
          <p className={`text-[10px] font-extrabold mt-1 uppercase ${healthTheme.text}`}>{inventoryHealthLabel}</p>
        </div>

      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* Stockout Risk Summary Donut */}
        <div className="bg-white border border-slate-100 rounded-3xl p-6 shadow-sm card-hover-effect flex flex-col justify-between">
          <div className="border-b border-slate-50 pb-3.5 mb-4 text-left">
            <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">Stockout Risk Summary</h3>
            <p className="text-[10px] text-slate-400 font-medium mt-0.5">Stock depletion risk windows</p>
          </div>
          <div className="flex items-center justify-around flex-grow gap-4 py-3">
            <div className="relative w-32 h-32 flex-shrink-0">
              <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
                <circle cx="50" cy="50" r="40" stroke="#f1f5f9" strokeWidth="9" fill="transparent" />
                {riskDonutSegments.map((segment) => {
                  const isHovered = hoveredRisk?.label === segment.label;
                  return (
                    <circle key={segment.label} cx="50" cy="50" r="40" stroke={segment.color} strokeWidth={isHovered ? 12 : 9}
                      strokeDasharray={`${segment.length} ${circumference}`} strokeDashoffset={segment.offset}
                      strokeLinecap="round" fill="transparent" className="transition-all duration-150 cursor-pointer"
                      onMouseEnter={() => setHoveredRisk({ label: segment.label, value: segment.value, percent: segment.percent })}
                      onMouseLeave={() => setHoveredRisk(null)}>
                      <title>{`${segment.label}: ${segment.value} (${segment.percent}%)`}</title>
                    </circle>
                  );
                })}
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none select-none">
                {hoveredRisk ? (
                  <>
                    <span className="text-2xl font-extrabold text-slate-900 leading-none transition-all duration-150">{hoveredRisk.value}</span>
                    <span className="text-[8px] text-slate-400 font-extrabold uppercase tracking-wider mt-1 text-center leading-tight transition-all duration-150 max-w-[80px]">
                      {hoveredRisk.label} ({hoveredRisk.percent}%)
                    </span>
                  </>
                ) : (
                  <>
                    <span className="text-2xl font-extrabold text-slate-900 leading-none">{totalUniqueProducts}</span>
                    <span className="text-[9px] text-slate-400 font-extrabold uppercase tracking-wider mt-1">Products</span>
                  </>
                )}
              </div>
            </div>
            <div className="flex flex-col gap-2.5 text-xs font-semibold text-left">
              {riskDonutSegments.map((segment) => (
                <div key={segment.label} className="flex items-center gap-2 rounded-md px-1.5 py-1 hover:bg-slate-50 cursor-pointer"
                  onMouseEnter={() => setHoveredRisk({ label: segment.label, value: segment.value, percent: segment.percent })}
                  onMouseLeave={() => setHoveredRisk(null)}
                >
                  <span className={`w-2.5 h-2.5 rounded-full ${segment.dotClass} flex-shrink-0`} />
                  <div className="flex flex-col text-left">
                    <span className="text-slate-400 text-[9px] font-bold uppercase tracking-wide">{segment.label} ({segment.range})</span>
                    <span className="text-slate-800 font-extrabold text-xs">{segment.value} <span className="text-[10px] text-slate-400">({segment.percent}%)</span></span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* FSN Summary Donut */}
        <div className="bg-white border border-slate-100 rounded-3xl p-6 shadow-sm card-hover-effect flex flex-col justify-between">
          <div className="border-b border-slate-50 pb-3.5 mb-4 text-left">
            <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">FSN Analysis</h3>
            <p className="text-[10px] text-slate-400 font-medium mt-0.5">Fast, Slow, Non-moving product splits</p>
          </div>
          <div className="flex items-center justify-around flex-grow gap-4 py-3">
            <div className="relative w-32 h-32 flex-shrink-0">
              <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
                <circle cx="50" cy="50" r="40" stroke="#f1f5f9" strokeWidth="9" fill="transparent" />
                {fsnDonutSegments.map((segment) => {
                  const isHovered = hoveredFsn?.label === segment.label;
                  return (
                    <circle key={segment.label} cx="50" cy="50" r="40" stroke={segment.color} strokeWidth={isHovered ? 12 : 9}
                      strokeDasharray={`${segment.length} ${circumference}`} strokeDashoffset={segment.offset}
                      strokeLinecap="round" fill="transparent" className="transition-all duration-150 cursor-pointer"
                      onMouseEnter={() => setHoveredFsn({ label: segment.label, value: segment.value, percent: segment.percent })}
                      onMouseLeave={() => setHoveredFsn(null)}>
                      <title>{`${segment.label}: ${segment.value} (${segment.percent}%)`}</title>
                    </circle>
                  );
                })}
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none select-none">
                {hoveredFsn ? (
                  <>
                    <span className="text-2xl font-extrabold text-slate-900 leading-none transition-all duration-150">{hoveredFsn.value}</span>
                    <span className="text-[8px] text-slate-400 font-extrabold uppercase tracking-wider mt-1 text-center leading-tight transition-all duration-150 max-w-[80px]">
                      {hoveredFsn.label} ({hoveredFsn.percent}%)
                    </span>
                  </>
                ) : (
                  <>
                    <span className="text-2xl font-extrabold text-slate-900 leading-none">{totalUniqueProducts}</span>
                    <span className="text-[9px] text-slate-400 font-extrabold uppercase tracking-wider mt-1">Products</span>
                  </>
                )}
              </div>
            </div>
            <div className="flex flex-col gap-2.5 text-xs font-semibold text-left">
              {fsnDonutSegments.map((segment) => (
                <div key={segment.label} className="flex items-center gap-2 hover:bg-slate-50 px-1.5 py-1 rounded-md cursor-pointer"
                  onMouseEnter={() => setHoveredFsn({ label: segment.label, value: segment.value, percent: segment.percent })}
                  onMouseLeave={() => setHoveredFsn(null)}
                >
                  <span className={`w-2.5 h-2.5 rounded-full ${segment.dotClass} flex-shrink-0`} />
                  <div className="flex flex-col">
                    <span className="text-slate-400 text-[9px] font-bold uppercase tracking-wide">{segment.label}</span>
                    <span className="text-slate-800 font-extrabold text-xs">{segment.value} <span className="text-[10px] text-slate-400">({segment.percent}%)</span></span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Top 5 Products at Risk */}
        <div className="bg-white border border-slate-100 rounded-3xl p-6 shadow-sm card-hover-effect flex flex-col justify-between">
          <div>
            <div className="border-b border-slate-50 pb-3.5 mb-4 text-left">
              <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">Top 5 at Risk</h3>
              <p className="text-[10px] text-slate-400 font-medium mt-0.5">Most urgent stockout predictions</p>
            </div>
            <div className="overflow-x-auto scrollbar-thin">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b border-slate-100 text-slate-400 font-extrabold uppercase text-[9.5px]">
                    <th className="py-2.5 pr-2">Product</th>
                    {isStoreManager ? <th className="py-2.5 text-center px-2">Days Left</th> : <th className="py-2.5 text-center px-2">Stores</th>}
                    <th className="py-2.5 text-right pl-2">Date</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100/60 font-semibold text-slate-700">
                  {topAtRiskProducts.length === 0 ? (
                    <tr><td colSpan={3} className="py-6 text-center text-slate-400 font-medium">No at-risk products</td></tr>
                  ) : topAtRiskProducts.map((row, idx) => (
                    <tr key={idx} className="hover:bg-slate-50/60 transition duration-75 cursor-pointer" onClick={() => onNavigate("2", "store", undefined, row.code)}>
                      <td className="py-3 pr-2 text-bp-green hover:text-bp-green-dark font-bold text-left truncate max-w-[110px]" title={row.name}>{row.name}</td>
                      {isStoreManager
                        ? <td className={`py-3 text-center px-2 font-bold ${row.daysRemaining <= 3 ? "text-rose-600 animate-pulse" : "text-amber-600"}`}>{row.daysRemaining}</td>
                        : <td className="py-3 text-center px-2 text-rose-600 font-extrabold">{row.storesCount}</td>}
                      <td className="py-3 text-right pl-2 text-slate-500 font-semibold">{row.soonestDate}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
          <div className="text-right border-t border-slate-50/80 pt-3">
            <button className="text-xs font-bold text-bp-green hover:text-bp-green-dark transition" onClick={() => onNavigate("2", "store")}>View All Predictions</button>
          </div>
        </div>

      </div>

      {/* Stockout Risk by Category */}
      <div className="grid grid-cols-1 gap-6">

        <div className="bg-white border border-slate-100 rounded-3xl p-6 shadow-sm card-hover-effect">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between border-b border-slate-50 pb-4 mb-5 gap-3">
            <div className="text-left">
              <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">Stockout Risk by Category</h3>
              <p className="text-[10px] text-slate-400 font-medium mt-0.5">Aggregate stockout levels by department</p>
            </div>
            <div className="flex flex-wrap items-center gap-4 text-[9.5px] font-extrabold text-slate-500">
              <span className="flex items-center gap-1.5"><span className="w-3 h-2 rounded-sm bg-rose-500 inline-block" />&le; 7 Days</span>
              <span className="flex items-center gap-1.5"><span className="w-3 h-2 rounded-sm bg-amber-400 inline-block" />8-15 Days</span>
              <span className="flex items-center gap-1.5"><span className="w-3 h-2 rounded-sm bg-bp-green inline-block" />&gt; 15 Days</span>
            </div>
          </div>
          <div className="space-y-4">
            {categoryRows.map((cat, idx) => (
              <div key={idx} className="flex items-center gap-4 text-xs">
                <span className="w-32 text-slate-700 font-bold text-right flex-shrink-0 truncate" title={cat.name}>{cat.name}</span>
                <div className="flex-grow flex h-6.5 rounded-lg overflow-hidden bg-slate-50 border border-slate-100 p-0.5">
                  {cat.le7 > 0 && (
                    <div className="bg-rose-500 flex items-center justify-center text-white font-extrabold text-[9px] rounded-l-md transition duration-150 hover:opacity-90"
                      style={{ width: `${(cat.le7 / maxCatTotal) * 100}%`, minWidth: "24px" }} title={`≤7 Days: ${cat.le7}`}>{cat.le7}</div>
                  )}
                  {cat.eightTo15 > 0 && (
                    <div className="bg-amber-400 flex items-center justify-center text-white font-extrabold text-[9px] ml-0.5 transition duration-150 hover:opacity-90"
                      style={{ width: `${(cat.eightTo15 / maxCatTotal) * 100}%`, minWidth: "24px" }} title={`8-15 Days: ${cat.eightTo15}`}>{cat.eightTo15}</div>
                  )}
                  {cat.gt15 > 0 && (
                    <div className="bg-bp-green flex items-center justify-center text-white font-extrabold text-[9px] ml-0.5 rounded-r-md transition duration-150 hover:opacity-90"
                      style={{ width: `${(cat.gt15 / maxCatTotal) * 100}%`, minWidth: "24px" }} title={`>15 Days: ${cat.gt15}`}>{cat.gt15}</div>
                  )}
                </div>
                <span className="w-8 text-slate-400 font-extrabold text-right flex-shrink-0">{cat.total} <span className="text-[9px] font-normal text-slate-400">SKUs</span></span>
              </div>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
}
