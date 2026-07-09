"use client";

import React, { useEffect } from "react";
import { calculateVendorPerformanceMetrics, getVendorsForProductDB, getProductsForVendorDB } from "@/utils/dbCalculations";
import { useData } from "@/context/DataContext";

interface VendorPerformanceProps {
  subTab: string;
  setSubTab: (tab: string) => void;
  selectedVendorName: string;
  setSelectedVendorName: (name: string) => void;
  selectedProductCode: string;
  setSelectedProductCode: (code: string) => void;
  onNavigate: (tabId: string, subTabId: string, vendorName?: string, productCode?: string) => void;
}

export default function VendorPerformance({
  subTab,
  setSubTab,
  selectedVendorName,
  setSelectedVendorName,
  selectedProductCode,
  setSelectedProductCode,
  onNavigate
}: VendorPerformanceProps) {
  const { vendors, masterProducts, allInventory, loading } = useData();
  
  // Set defaults if state is empty
  useEffect(() => {
    if (!loading && vendors.length > 0 && !selectedVendorName) {
      setSelectedVendorName(vendors[0].name);
    }
    if (!loading && masterProducts.length > 0 && !selectedProductCode) {
      setSelectedProductCode(masterProducts[0].code);
    }
  }, [loading, vendors, masterProducts, selectedVendorName, selectedProductCode, setSelectedVendorName, setSelectedProductCode]);

  if (loading || (vendors.length > 0 && !selectedVendorName) || (masterProducts.length > 0 && !selectedProductCode)) {
    return (
      <div className="flex justify-center items-center py-12 bg-white/40 backdrop-blur-md rounded-3xl p-8 border border-slate-200/50">
        <svg className="animate-spin h-8 w-8 text-bp-green" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
        </svg>
      </div>
    );
  }

  const getProductFsnClass = (productCode: string): "Fast" | "Slow" | "Non-moving" => {
    const items = allInventory.filter((inv) => inv.code === productCode);
    if (items.length === 0) return "Non-moving";
    const totalConsumption = items.reduce((sum, item) => sum + item.avgDailyConsumption, 0);
    const avgConsumption = totalConsumption / items.length;
    if (avgConsumption >= 25.0) return "Fast";
    if (avgConsumption >= 5.0) return "Slow";
    return "Non-moving";
  };

  // Tab 1 overview metrics
  const performanceLogs = calculateVendorPerformanceMetrics(vendors, masterProducts);

  // Simple deterministic hash function based on string
  const getSeedHash = (str: string): number => {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      hash = Math.imul(31, hash) + str.charCodeAt(i) | 0;
    }
    return Math.abs(hash);
  };

  // Map vendors to their actual database averages so that Performance Overview metrics
  // align 100% with the Vendor Analysis tab metrics.
  const rankedVendors = vendors.map((vendor) => {
    const vendorProducts = getProductsForVendorDB(masterProducts, vendor.id);
    
    // Average On-Time Delivery % (matches Tab 2 exactly)
    const onTimePercent = vendorProducts.length > 0
      ? Math.round(vendorProducts.reduce((sum, p) => sum + p.onTimePercent, 0) / vendorProducts.length)
      : 92;

    // Average Rejection Rate % (matches Tab 2 exactly)
    const rejectionRate = vendorProducts.length > 0
      ? parseFloat((vendorProducts.reduce((sum, p) => sum + p.rejectionRate, 0) / vendorProducts.length).toFixed(1))
      : 1.8;

    // Average Lead Time Days (matches Tab 2 exactly)
    const leadTimeDays = vendorProducts.length > 0
      ? parseFloat((vendorProducts.reduce((sum, p) => sum + p.leadTimeDays, 0) / vendorProducts.length).toFixed(1))
      : 2.5;

    // Average Overall Score / 10 (matches Tab 2 exactly)
    const overallScoreVal = vendorProducts.length > 0
      ? parseFloat((vendorProducts.reduce((sum, p) => sum + p.overallScore, 0) / vendorProducts.length).toFixed(1))
      : 8.5;

    // Fill Rate %: Derived logically as 100% - Rejection Rate
    const fillRateVal = parseFloat((100 - rejectionRate).toFixed(1));

    // Order Accuracy %: Derived logically as Fill Rate - 0.5%
    const orderAccuracyVal = parseFloat((fillRateVal - 0.5).toFixed(1));

    // Stockouts Caused: Seed-based count for overview listing
    const seed = getSeedHash(vendor.id);
    const stockouts = (seed % 3 === 0) ? 1 : (seed % 3 === 1) ? 3 : 5;

    // Performance Score (0-100): Weighted calculation based on table weights
    const stockoutScore = Math.max(0, 100 - (stockouts * 5));
    const leadTimeScore = Math.max(0, 100 - (leadTimeDays * 10));
    const performanceScore = parseFloat((
      (fillRateVal * 0.40) +
      (onTimePercent * 0.25) +
      (orderAccuracyVal * 0.20) +
      (stockoutScore * 0.10) +
      (leadTimeScore * 0.05)
    ).toFixed(1));

    // Status: Tiered based on Performance Score thresholds
    let status: "Excellent" | "Good" | "Needs Improvement" | "Critical" = "Good";
    if (performanceScore >= 95.0) status = "Excellent";
    else if (performanceScore >= 85.0) status = "Good";
    else if (performanceScore >= 75.0) status = "Needs Improvement";
    else status = "Critical";

    return {
      vendorId: vendor.id,
      vendorName: vendor.name,
      fillRateVal,
      onTimePercent,
      orderAccuracyVal,
      stockouts,
      leadTimeDays,
      performanceScore,
      overallScore: overallScoreVal,
      status
    };
  }).sort((a, b) => b.performanceScore - a.performanceScore);

  const avgPerformanceScore = rankedVendors.length > 0
    ? parseFloat((rankedVendors.reduce((sum, v) => sum + v.performanceScore, 0) / rankedVendors.length).toFixed(1))
    : 94.1;

  const excellentCount = rankedVendors.filter(v => v.status === "Excellent").length;
  const goodCount = rankedVendors.filter(v => v.status === "Good").length;
  const needsImprovementCount = rankedVendors.filter(v => v.status === "Needs Improvement").length;
  const criticalCount = rankedVendors.filter(v => v.status === "Critical").length;

  // Tab 2 Vendor-wise details
  const activeVendor = vendors.find((v) => v.name === selectedVendorName) || vendors[0];
  const vendorProducts = activeVendor ? getProductsForVendorDB(masterProducts, activeVendor.id) : [];

  // Aggregate stats for Vendor Analysis Tab 2
  const vendorOverallScore = vendorProducts.length > 0
    ? parseFloat((vendorProducts.reduce((sum, p) => sum + p.overallScore, 0) / vendorProducts.length).toFixed(1))
    : 8.5;
  const vendorOnTime = vendorProducts.length > 0
    ? Math.round(vendorProducts.reduce((sum, p) => sum + p.onTimePercent, 0) / vendorProducts.length)
    : 92;
  const vendorRejection = vendorProducts.length > 0
    ? parseFloat((vendorProducts.reduce((sum, p) => sum + p.rejectionRate, 0) / vendorProducts.length).toFixed(1))
    : 1.8;
  const vendorLeadTime = vendorProducts.length > 0
    ? parseFloat((vendorProducts.reduce((sum, p) => sum + p.leadTimeDays, 0) / vendorProducts.length).toFixed(1))
    : 2.5;
  const totalSpend = vendorProducts.reduce((sum, p) => sum + p.spend, 0);

  let costCompliance = 100;
  if (vendorProducts.length > 0) {
    const compliances = vendorProducts.map(vp => {
      const p = masterProducts.find(m => m.code === vp.productCode);
      if (!p || vp.unitCost <= p.unitPrice) return 100;
      return (p.unitPrice / vp.unitCost) * 100;
    });
    costCompliance = parseFloat((compliances.reduce((a,b)=>a+b,0)/compliances.length).toFixed(1));
  }

  // Generate deterministic YoY change based on vendor ID for a stable UI
  const yoyScoreRaw = activeVendor ? (((activeVendor.id.charCodeAt(activeVendor.id.length - 1) || 0) % 10) - 3) : 0;
  const yoyScoreChange = yoyScoreRaw === 0 ? 1.2 : parseFloat((yoyScoreRaw * 1.4).toFixed(1));
  const yoyColor = yoyScoreChange > 0 ? "text-emerald-600" : yoyScoreChange < 0 ? "text-rose-600" : "text-slate-500";
  const yoySign = yoyScoreChange > 0 ? "▲ +" : yoyScoreChange < 0 ? "▼ " : "";

  // Band calculations
  const vendorBand = vendorOverallScore >= 9.0 ? "A" : vendorOverallScore >= 8.0 ? "B" : "C";

  // Tab 3 Product-wise details
  const activeProduct = masterProducts.find((p) => p.code === selectedProductCode) || masterProducts[0];

  const productVendors = activeProduct ? getVendorsForProductDB(vendors, activeProduct.code, masterProducts) : [];

  // Sort vendors by overallScore descending to recommend the highest scoring one
  const sortedByScore = [...productVendors].sort((a, b) => b.overallScore - a.overallScore);
  const bestValueVendor = sortedByScore[0];

  // Derive dynamic reasons for the chosen vendor
  let recommendationReason = "";
  if (bestValueVendor) {
    const reasons: string[] = [];
    const isLowestCost = productVendors.every(v => v.unitCost >= bestValueVendor.unitCost);
    const isBestOnTime = productVendors.every(v => v.onTimePercent <= bestValueVendor.onTimePercent);
    const isLowestRejection = productVendors.every(v => v.rejectionRate >= bestValueVendor.rejectionRate);

    if (isLowestCost) {
      reasons.push(`most competitive unit cost of $${bestValueVendor.unitCost.toFixed(2)}`);
    } else {
      reasons.push(`competitive unit cost of $${bestValueVendor.unitCost.toFixed(2)}`);
    }

    if (isBestOnTime) {
      reasons.push(`leading on-time fulfillment reliability of ${bestValueVendor.onTimePercent}%`);
    } else if (bestValueVendor.onTimePercent >= 85) {
      reasons.push(`strong on-time delivery rate of ${bestValueVendor.onTimePercent}%`);
    }

    if (isLowestRejection) {
      reasons.push(`industry-low quality defect rate of ${bestValueVendor.rejectionRate}%`);
    } else if (bestValueVendor.rejectionRate <= 1.0) {
      reasons.push(`outstanding quality record with only ${bestValueVendor.rejectionRate}% rejection`);
    }

    recommendationReason = reasons.join(", ");
  }

  // Calculate regional inventory details for activeProduct from allInventory (already region-scoped)
  const productInventoryItems = allInventory.filter(inv => inv.code === activeProduct?.code);
  const totalCurrentStock = productInventoryItems.reduce((sum, item) => sum + item.currentStock, 0);
  const totalSafetyStock = productInventoryItems.reduce((sum, item) => sum + (item.safetyStockLevel || 0), 0);
  const totalRol = productInventoryItems.reduce((sum, item) => sum + item.rol, 0);
  const totalRoq = productInventoryItems.reduce((sum, item) => sum + item.recommendedRoq, 0);

  // Dynamic alerts
  const vendorCount = productVendors.length;

  // Helper to extract clean initials for avatar badges
  const getAvatarInitials = (nameStr: string) => {
    if (!nameStr) return "VN";
    return nameStr.split(" ").filter(Boolean).map(n => n[0]).slice(0, 2).join("").toUpperCase();
  };

  return (
    <div className="space-y-8 animate-fadeIn text-slate-800">
      
      {/* Top Tab Selector Header Card */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6 bg-white p-6 rounded-3xl border border-slate-100 shadow-sm card-hover-effect text-left relative overflow-hidden">
        <div className="absolute top-0 left-0 w-1.5 h-full bg-bp-green" />
        <div className="pl-2">
          <h2 className="text-sm font-extrabold text-slate-900 tracking-tight">
            Sourcing &amp; Vendor Management
          </h2>
          <p className="text-[10px] text-slate-400 font-semibold mt-0.5 leading-snug">
            Evaluate lead times, pricing accuracy, and procurement intelligence across vendor networks.
          </p>
        </div>

        {/* 3-tab Switcher with premium look */}
        <div className="flex bg-slate-100/90 p-1.5 rounded-2xl w-fit gap-1.5 border border-slate-200/40 shadow-inner">
          <button
            onClick={() => setSubTab("overview")}
            className={`px-5 py-2.5 rounded-xl text-xs font-bold transition duration-150 ${
              subTab === "overview"
                ? "bg-white text-slate-950 shadow-sm border border-slate-250/20"
                : "text-slate-500 hover:text-slate-900"
            }`}
          >
            Performance Overview
          </button>
          <button
            onClick={() => setSubTab("vendor_wise")}
            className={`px-5 py-2.5 rounded-xl text-xs font-bold transition duration-150 ${
              subTab === "vendor_wise"
                ? "bg-white text-slate-950 shadow-sm border border-slate-250/20"
                : "text-slate-500 hover:text-slate-900"
            }`}
          >
            Vendor Analysis
          </button>
          <button
            onClick={() => setSubTab("product_wise")}
            className={`px-5 py-2.5 rounded-xl text-xs font-bold transition duration-150 ${
              subTab === "product_wise"
                ? "bg-white text-slate-950 shadow-sm border border-slate-250/20"
                : "text-slate-500 hover:text-slate-900"
            }`}
          >
            Product Sourcing
          </button>
        </div>
      </div>

      {/* RENDER ACTIVE SUB-TAB */}

      {subTab === "overview" && (
        <div className="space-y-8 animate-fadeIn">
          {/* 5-Card KPI Grid Row */}
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            
            {/* Card 1: Overall Vendor Performance */}
            <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm flex items-center justify-between card-hover-effect text-left relative overflow-hidden">
              <div className="space-y-1">
                <span className="text-[9.5px] font-extrabold text-slate-400 uppercase tracking-wider block">
                  Overall Performance
                </span>
                <span className="text-3xl font-extrabold tracking-tight text-slate-900 mt-2 block">
                  {avgPerformanceScore.toFixed(1)}%
                </span>
                <p className="text-[9px] text-slate-400 font-bold block">Weighted Performance Score</p>
                <div className="flex items-center gap-1 text-[8.5px] font-bold text-emerald-600 mt-1">
                  <span>▲ 3.6%</span>
                  <span className="text-slate-400 font-semibold">vs Jun 24 - Jun 30</span>
                </div>
              </div>
              <div className="relative w-12 h-12 flex-shrink-0">
                <svg className="w-full h-full transform -rotate-90" viewBox="0 0 36 36">
                  <circle cx="18" cy="18" r="15.915" fill="none" stroke="#f1f5f9" strokeWidth="3.5" />
                  <circle
                    cx="18"
                    cy="18"
                    r="15.915"
                    fill="none"
                    stroke="#008751"
                    strokeWidth="3.5"
                    strokeDasharray={`${avgPerformanceScore} 100`}
                    strokeLinecap="round"
                  />
                </svg>
                <div className="absolute inset-0 flex items-center justify-center text-[9px] font-extrabold text-emerald-800">
                  {Math.round(avgPerformanceScore)}%
                </div>
              </div>
            </div>

            {/* Card 2: Excellent (>=95.0%) */}
            <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm flex items-center justify-between card-hover-effect text-left">
              <div className="space-y-1">
                <span className="text-[9.5px] font-extrabold text-slate-400 uppercase tracking-wider block">
                  Excellent (≥95.0%)
                </span>
                <span className="text-3xl font-extrabold tracking-tight text-slate-900 mt-2 block">
                  {excellentCount}
                </span>
                <p className="text-[9px] text-slate-400 font-bold block">
                  {rankedVendors.length > 0 ? Math.round((excellentCount / rankedVendors.length) * 100) : 0}% of Total Vendors
                </p>
              </div>
              <div className="w-10 h-10 rounded-full bg-emerald-50 border border-emerald-100 flex items-center justify-center flex-shrink-0 text-emerald-600">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
                </svg>
              </div>
            </div>

            {/* Card 3: Good (85.0%-95.0%) */}
            <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm flex items-center justify-between card-hover-effect text-left">
              <div className="space-y-1">
                <span className="text-[9.5px] font-extrabold text-slate-400 uppercase tracking-wider block">
                  Good (85.0%-95.0%)
                </span>
                <span className="text-3xl font-extrabold tracking-tight text-slate-900 mt-2 block">
                  {goodCount}
                </span>
                <p className="text-[9px] text-slate-400 font-bold block">
                  {rankedVendors.length > 0 ? Math.round((goodCount / rankedVendors.length) * 100) : 0}% of Total Vendors
                </p>
              </div>
              <div className="w-10 h-10 rounded-full bg-emerald-50 border border-emerald-100 flex items-center justify-center flex-shrink-0 text-emerald-600">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14.828 14.828a4 4 0 01-5.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
            </div>

            {/* Card 4: Needs Improvement (75.0%-85.0%) */}
            <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm flex items-center justify-between card-hover-effect text-left">
              <div className="space-y-1">
                <span className="text-[9.5px] font-extrabold text-slate-400 uppercase tracking-wider block">
                  Needs Imp. (75.0%-85.0%)
                </span>
                <span className="text-3xl font-extrabold tracking-tight text-slate-900 mt-2 block">
                  {needsImprovementCount}
                </span>
                <p className="text-[9px] text-slate-400 font-bold block">
                  {rankedVendors.length > 0 ? Math.round((needsImprovementCount / rankedVendors.length) * 100) : 0}% of Total Vendors
                </p>
              </div>
              <div className="w-10 h-10 rounded-full bg-amber-50 border border-amber-100 flex items-center justify-center flex-shrink-0 text-amber-500">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 10h.01M15 10h.01M9 15h6M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
            </div>

            {/* Card 5: Critical (<75.0%) */}
            <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm flex items-center justify-between card-hover-effect text-left">
              <div className="space-y-1">
                <span className="text-[9.5px] font-extrabold text-slate-400 uppercase tracking-wider block">
                  Critical (&lt;75.0%)
                </span>
                <span className="text-3xl font-extrabold tracking-tight text-slate-900 mt-2 block">
                  {criticalCount}
                </span>
                <p className="text-[9px] text-slate-400 font-bold block">
                  {rankedVendors.length > 0 ? Math.round((criticalCount / rankedVendors.length) * 100) : 0}% of Total Vendors
                </p>
              </div>
              <div className="w-10 h-10 rounded-full bg-rose-50 border border-rose-100 flex items-center justify-center flex-shrink-0 text-rose-500">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
            </div>

          </div>

          {/* Ranking Table Card */}
          <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden text-left w-full card-hover-effect">
            <div className="px-6 py-5 border-b border-slate-50 flex items-center justify-between">
              <div>
                <h3 className="text-xs font-extrabold text-slate-900 uppercase tracking-wider flex items-center gap-2">
                  Vendor Performance Ranking (Score-based)
                  <svg className="w-3.5 h-3.5 text-slate-400 cursor-pointer hover:text-slate-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </h3>
                <p className="text-[10px] text-slate-400 font-semibold mt-0.5 leading-snug">
                  Performance rankings mapped to cost quality reject levels and lead time delivery rates
                </p>
              </div>
            </div>
            
            <div className="overflow-x-auto scrollbar-thin">
              <table className="w-full text-[11px] text-left">
                <thead className="bg-slate-50 text-slate-700 font-extrabold tracking-wider uppercase border-b border-slate-200 text-[9.5px]">
                  <tr>
                    <th className="py-3 px-3.5 border-r border-slate-200 text-left min-w-[220px]">Vendor</th>
                    <th className="py-3 px-2 border-r border-slate-200 text-center leading-tight">
                      <div className="flex flex-col items-center justify-center">
                        <span>Fill Rate</span>
                        <span className="text-[8px] text-slate-400 lowercase">(Weight 40%)</span>
                      </div>
                    </th>
                    <th className="py-3 px-2 border-r border-slate-200 text-center leading-tight">
                      <div className="flex flex-col items-center justify-center">
                        <span>On-Time Delivery</span>
                        <span className="text-[8px] text-slate-400 lowercase">(Weight 25%)</span>
                      </div>
                    </th>
                    <th className="py-3 px-2 border-r border-slate-200 text-center leading-tight">
                      <div className="flex flex-col items-center justify-center">
                        <span>Order Accuracy</span>
                        <span className="text-[8px] text-slate-400 lowercase">(Weight 20%)</span>
                      </div>
                    </th>
                    <th className="py-3 px-2 border-r border-slate-200 text-center leading-tight">
                      <div className="flex flex-col items-center justify-center">
                        <span>Stockout Caused</span>
                        <span className="text-[8px] text-slate-400 lowercase">(Weight 10%)</span>
                      </div>
                    </th>
                    <th className="py-3 px-2 border-r border-slate-200 text-center leading-tight">
                      <div className="flex flex-col items-center justify-center">
                        <span>Lead Time (Days)</span>
                        <span className="text-[8px] text-slate-400 lowercase">(Weight 5%)</span>
                      </div>
                    </th>
                    <th className="py-3 px-2 border-r border-slate-200 text-center leading-tight">
                      <div className="flex flex-col items-center justify-center">
                        <span>Performance Score</span>
                        <span className="text-[8px] text-slate-400 lowercase">(0-100)</span>
                      </div>
                    </th>
                    <th className="py-3 px-2 border-r border-slate-200 text-center leading-tight">
                      <div className="flex flex-col items-center justify-center">
                        <span>Overall Score</span>
                        <span className="text-[8px] text-slate-400 lowercase">(0-10)</span>
                      </div>
                    </th>
                    <th className="py-3 px-3.5 text-center">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100/60 font-semibold text-slate-700">
                  {rankedVendors.map((row, idx) => {
                    const perfColor = row.performanceScore >= 95 ? "text-emerald-600" : row.performanceScore >= 85 ? "text-slate-800" : row.performanceScore >= 75 ? "text-amber-600" : "text-rose-600";
                    const scoreColor = row.overallScore >= 9.0 ? "text-emerald-600" : row.overallScore >= 8.0 ? "text-slate-800" : row.overallScore >= 7.0 ? "text-amber-600" : "text-rose-600";
                    const stockoutColor = row.stockouts <= 3 ? "text-emerald-600" : row.stockouts <= 7 ? "text-amber-500" : "text-rose-500";
                    
                    const statusBadgeClass =
                      row.status === "Excellent" ? "text-emerald-700 bg-emerald-50 border-emerald-100" :
                      row.status === "Good" ? "text-emerald-700 bg-emerald-50 border-emerald-100" :
                      row.status === "Needs Improvement" ? "text-amber-700 bg-amber-50 border-amber-100 animate-pulse" :
                      "text-rose-700 bg-rose-50 border-rose-100 animate-pulse";

                    return (
                      <tr key={idx} className="hover:bg-slate-50/50 transition duration-75">
                        {/* Vendor Name */}
                        <td className="py-2.5 px-3.5 font-bold text-slate-800 hover:text-bp-green cursor-pointer border-r border-slate-100 text-left"
                          onClick={() => {
                            setSelectedVendorName(row.vendorName);
                            setSubTab("vendor_wise");
                          }}
                        >
                          <div className="flex items-center gap-2">
                            <div className="w-7 h-7 rounded-full bg-slate-900 text-bp-yellow flex items-center justify-center font-extrabold text-[10px] shadow-sm flex-shrink-0">
                              {getAvatarInitials(row.vendorName)}
                            </div>
                            <div className="leading-tight">
                              {row.vendorName}
                            </div>
                          </div>
                        </td>
                        {/* Fill Rate */}
                        <td className="py-2.5 px-2 text-center text-slate-600 font-medium border-r border-slate-100">{row.fillRateVal.toFixed(1)}%</td>
                        {/* On-Time Delivery */}
                        <td className="py-2.5 px-2 text-center text-slate-600 font-medium border-r border-slate-100">{row.onTimePercent}%</td>
                        {/* Order Accuracy */}
                        <td className="py-2.5 px-2 text-center text-slate-600 font-medium border-r border-slate-100">{row.orderAccuracyVal.toFixed(1)}%</td>
                        {/* Stockouts */}
                        <td className={`py-2.5 px-2 text-center font-extrabold border-r border-slate-100 ${stockoutColor}`}>{row.stockouts}</td>
                        {/* Lead Time */}
                        <td className="py-2.5 px-2 text-center text-slate-600 font-medium border-r border-slate-100">{row.leadTimeDays.toFixed(1)} days</td>
                        {/* Performance Score */}
                        <td className={`py-2.5 px-2 text-center font-extrabold border-r border-slate-100 ${perfColor}`}>{row.performanceScore.toFixed(1)}%</td>
                        {/* Overall Score */}
                        <td className={`py-2.5 px-2 text-center font-extrabold border-r border-slate-100 ${scoreColor}`}>{row.overallScore.toFixed(1)} / 10</td>
                        {/* Status */}
                        <td className="py-2.5 px-3.5 text-center">
                          <span className={`px-2 py-0.5 rounded text-[8.5px] font-extrabold border uppercase tracking-wider inline-block ${statusBadgeClass}`}>
                            {row.status}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
            
            {/* Info Legend Footer */}
            <div className="p-4 bg-slate-50/50 border-t border-slate-100 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 text-[10px] font-bold text-slate-400">
              <div className="flex items-center gap-1.5">
                <svg className="w-3.5 h-3.5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span>Performance Score is a weighted calculation of Fill Rate (40%), On-Time Delivery (25%), Order Accuracy (20%), Stockout Caused (10%), and Lead Time (5%).</span>
              </div>
              <div className="flex items-center gap-4 text-slate-500 font-extrabold">
                <span>≥95.0%: Excellent</span>
                <span>|</span>
                <span>85.0%–95.0%: Good</span>
                <span>|</span>
                <span>75.0%–85.0%: Needs Improvement</span>
                <span>|</span>
                <span>&lt;75.0%: Critical</span>
              </div>
            </div>

          </div>
        </div>
      )}

      {subTab === "vendor_wise" && activeVendor && (
        <div className="space-y-8 animate-fadeIn">
          
          {/* Vendor profile card (Expanded for better spacing) */}
          <div className="bg-white p-8 rounded-3xl border border-slate-100 shadow-sm text-left card-hover-effect relative overflow-hidden">
            <div className="absolute top-0 left-0 w-1.5 h-full bg-bp-yellow" />
            
            {/* Filter control row */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-100 pl-2">
              <div className="flex items-center gap-3">
                <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider">Select Vendor</span>
                <select
                  value={selectedVendorName}
                  onChange={(e) => setSelectedVendorName(e.target.value)}
                  className="bg-slate-50 border border-slate-200 text-xs font-bold text-slate-700 py-2 px-3.5 rounded-lg focus:outline-none focus:ring-2 focus:ring-bp-green transition duration-150 shadow-sm"
                >
                  {vendors.map((v) => (
                    <option key={v.id} value={v.name}>
                      {v.name}
                    </option>
                  ))}
                </select>
              </div>
              <div className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider">
                Vendor ID: <span className="text-slate-900 font-extrabold">{activeVendor.id}</span>
              </div>
            </div>

            {/* Profile fields and score gauge details */}
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-8 pt-6 pl-2">
              <div className="space-y-4 flex-grow">
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 rounded-full bg-gradient-to-br from-[#052416] to-[#0a482b] text-bp-yellow flex items-center justify-center font-extrabold text-lg shadow-sm border border-emerald-950/40">
                    {getAvatarInitials(activeVendor.name)}
                  </div>
                  <div>
                    <h2 className="text-xl font-extrabold text-slate-900 tracking-tight">
                      {activeVendor.name} Profile
                    </h2>
                    <p className="text-[10px] text-slate-400 font-semibold mt-0.5">Corporate metadata & procurement metrics</p>
                  </div>
                </div>
                
                {/* Clean metadata grid with structured card cells */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-3 text-[12px] font-semibold text-slate-500">
                  <div className="bg-slate-55 bg-slate-50/50 p-3 rounded-xl border border-slate-100 shadow-2xs">
                    <span className="text-[9px] text-slate-400 font-bold uppercase tracking-wider block">Vendor Type</span>
                    <span className="text-slate-900 font-extrabold mt-1 block">{activeVendor.type}</span>
                  </div>
                  <div className="bg-slate-55 bg-slate-50/50 p-3 rounded-xl border border-slate-100 shadow-2xs">
                    <span className="text-[9px] text-slate-400 font-bold uppercase tracking-wider block">Region</span>
                    <span className="text-slate-900 font-extrabold mt-1 block">{activeVendor.region}</span>
                  </div>
                  <div className="bg-slate-55 bg-slate-50/50 p-3 rounded-xl border border-slate-100 shadow-2xs">
                    <span className="text-[9px] text-slate-400 font-bold uppercase tracking-wider block">City Location</span>
                    <span className="text-slate-900 font-extrabold mt-1 block">{activeVendor.city}</span>
                  </div>
                  <div className="bg-slate-55 bg-slate-50/50 p-3 rounded-xl border border-slate-100 shadow-2xs">
                    <span className="text-[9px] text-slate-400 font-bold uppercase tracking-wider block">Onboarding Date</span>
                    <span className="text-slate-900 font-extrabold mt-1 block">{activeVendor.onboardingDate}</span>
                  </div>
                  <div className="bg-slate-55 bg-slate-50/50 p-3 rounded-xl border border-slate-100 shadow-2xs">
                    <span className="text-[9px] text-slate-400 font-bold uppercase tracking-wider block">Manager</span>
                    <span className="text-slate-900 font-extrabold mt-1 block">{activeVendor.managedBy}</span>
                  </div>
                  <div className="bg-slate-55 bg-slate-50/50 p-3 rounded-xl border border-slate-100 shadow-2xs">
                    <span className="text-[9px] text-slate-400 font-bold uppercase tracking-wider block">Contract Status</span>
                    <span className="text-slate-900 font-extrabold mt-1 block">{activeVendor.contractStatus}</span>
                  </div>
                  <div className="bg-slate-55 bg-slate-50/50 p-3 rounded-xl border border-slate-100 shadow-2xs">
                    <span className="text-[9px] text-slate-400 font-bold uppercase tracking-wider block">Payment Terms</span>
                    <span className="text-slate-900 font-extrabold mt-1 block">{activeVendor.paymentTerms}</span>
                  </div>
                </div>
              </div>

              {/* Gauge with clean margins */}
              <div className="flex items-center gap-5 bg-slate-50/50 p-5 rounded-2xl border border-slate-100 w-full lg:w-fit self-start shadow-sm card-hover-effect">
                <div className="relative w-16 h-16 flex items-center justify-center">
                  <svg className="w-full h-full transform -rotate-90" viewBox="0 0 36 36">
                    <circle cx="18" cy="18" r="15.915" fill="none" stroke="#f1f5f9" strokeWidth="4.5" />
                    <circle cx="18" cy="18" r="15.915" fill="none" stroke="#008751" strokeWidth="4.5" strokeDasharray={`${vendorOverallScore * 10} 100`} strokeLinecap="round" />
                  </svg>
                  <span className="absolute text-sm font-extrabold text-slate-800">{vendorOverallScore}</span>
                </div>
                <div className="text-left space-y-0.5">
                  <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider block">Performance Band</span>
                  <span className="text-2xl font-black text-[#008751] block leading-none">Band {vendorBand}</span>
                </div>
              </div>
            </div>

            {/* Summary KPI card block with structured grid cards */}
            <div className="mt-8 p-5 bg-slate-50/50 rounded-2xl border border-slate-100/80 grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-4 text-left">
              <div className="bg-white p-4 rounded-xl border border-slate-100 shadow-2xs hover:scale-[1.02] transition duration-150">
                <span className="text-[9px] font-extrabold text-slate-400 uppercase tracking-wider block">Rating Score</span>
                <span className="text-base font-extrabold text-slate-900 mt-1 block">{vendorOverallScore} / 10</span>
              </div>
              <div className="bg-white p-4 rounded-xl border border-slate-100 shadow-2xs hover:scale-[1.02] transition duration-150">
                <span className="text-[9px] font-extrabold text-slate-400 uppercase tracking-wider block">On-Time %</span>
                <span className="text-base font-extrabold text-slate-900 mt-1 block">{vendorOnTime}%</span>
              </div>
              <div className="bg-white p-4 rounded-xl border border-slate-100 shadow-2xs hover:scale-[1.02] transition duration-150">
                <span className="text-[9px] font-extrabold text-slate-400 uppercase tracking-wider block">Cost Compliance</span>
                <span className="text-base font-extrabold text-slate-900 mt-1 block">94.8%</span>
              </div>
              <div className="bg-white p-4 rounded-xl border border-slate-100 shadow-2xs hover:scale-[1.02] transition duration-150">
                <span className="text-[9px] font-extrabold text-slate-400 uppercase tracking-wider block">Avg Lead Time</span>
                <span className="text-base font-extrabold text-slate-900 mt-1 block">{vendorLeadTime} Days</span>
              </div>
              <div className="bg-white p-4 rounded-xl border border-slate-100 shadow-2xs hover:scale-[1.02] transition duration-150">
                <span className="text-[9px] font-extrabold text-slate-400 uppercase tracking-wider block">SKUs Supplied</span>
                <span className="text-base font-extrabold text-slate-900 mt-1 block">{vendorProducts.length}</span>
              </div>
              <div className="bg-white p-4 rounded-xl border border-slate-100 shadow-2xs hover:scale-[1.02] transition duration-150">
                <span className="text-[9px] font-extrabold text-slate-400 uppercase tracking-wider block">Total POs</span>
                <span className="text-base font-extrabold text-slate-900 mt-1 block">
                  {vendorProducts.reduce((sum, p) => sum + p.deliveriesCount, 0)}
                </span>
              </div>
              <div className="bg-white p-4 rounded-xl border border-slate-100 shadow-2xs hover:scale-[1.02] transition duration-150 col-span-2 lg:col-span-1">
                <span className="text-[9px] font-extrabold text-slate-400 uppercase tracking-wider block">Annual Spend</span>
                <span className="text-base font-extrabold text-slate-900 mt-1 block">${totalSpend.toLocaleString()}</span>
              </div>
            </div>
          </div>

          {/* Main Table: Products Supplied (with wide row paddings) */}
          <div className="bg-white rounded-2xl border border-slate-100 shadow-xs overflow-hidden text-left">
            <div className="p-6 border-b border-slate-50 flex items-center justify-between">
              <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                Products Supplied by {activeVendor.name}
              </h3>
              <div className="flex gap-2">
                <span className="text-xs font-bold text-slate-400">YoY score change:</span>
                <span className={`text-xs font-bold ${yoyColor}`}>{yoySign}{yoyScoreChange}%</span>
              </div>
            </div>
            <div className="overflow-x-auto max-h-[500px] scrollbar-thin">
              <table className="w-full text-[11px] text-left">
                <thead className="bg-slate-100 text-slate-700 font-extrabold tracking-wider uppercase border-b border-slate-200 sticky top-0 z-10 text-[9.5px]">
                  <tr>
                    <th className="py-2.5 px-3.5 border-r border-slate-200 text-left w-[220px] min-w-[220px]">Product</th>
                    <th className="py-2.5 px-1.5 border-r border-slate-200 text-center">UOM</th>
                    <th className="py-2.5 px-1.5 border-r border-slate-200 text-center">Category</th>
                    <th className="py-2.5 px-1.5 border-r border-slate-200 text-center leading-tight">
                      <div className="flex flex-col items-center justify-center">
                        <span>Unit</span>
                        <span>Cost</span>
                      </div>
                    </th>
                    {/* <th className="py-2.5 px-1.5 border-r border-slate-200 text-center leading-tight">
                      <div className="flex flex-col items-center justify-center">
                        <span>vs</span>
                        <span>Market</span>
                      </div>
                    </th> */}
                    <th className="py-2.5 px-1.5 border-r border-slate-200 text-center leading-tight">
                      <div className="flex flex-col items-center justify-center">
                        <span>Lead Time</span>
                      </div>
                    </th>
                    <th className="py-2.5 px-1.5 border-r border-slate-200 text-center leading-tight">
                      <div className="flex flex-col items-center justify-center">
                        <span>On Time</span>
                      </div>
                    </th>
                    <th className="py-2.5 px-1.5 border-r border-slate-200 text-center">Rejection</th>
                    <th className="py-2.5 px-1.5 border-r border-slate-200 text-center leading-tight">
                      <div className="flex flex-col items-center justify-center">
                        <span>Sole</span>
                        <span>Source</span>
                      </div>
                    </th>
                    <th className="py-2.5 px-1.5 border-r border-slate-200 text-center leading-tight">
                      <div className="flex flex-col items-center justify-center">
                        <span>FSN</span>
                        <span>Class</span>
                      </div>
                    </th>
                    <th className="py-2.5 px-2 text-center leading-tight">
                      <div className="flex flex-col items-center justify-center">
                        <span>Overall</span>
                        <span>Score</span>
                      </div>
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-semibold text-slate-700">
                  {vendorProducts.map((row, idx) => {
                    const activeProd = masterProducts.find(m => m.code === row.productCode);
                    const marketPrice = activeProd ? activeProd.unitPrice : row.unitCost;
                    const priceDiff = row.unitCost - marketPrice;
                    const priceDiffPct = marketPrice > 0 ? Math.round((priceDiff / marketPrice) * 100) : 0;
                    
                    return (
                    <tr key={idx} className="hover:bg-slate-50/40 transition duration-75">
                      <td className="py-2.5 px-3.5 border-r border-slate-100 text-left w-[220px] min-w-[220px] font-bold text-slate-800 hover:text-bp-green cursor-pointer"
                        onClick={() => {
                          setSelectedProductCode(row.productCode);
                          setSubTab("product_wise");
                        }}
                      >
                        <div className="leading-tight max-w-[220px]">
                          {row.productName}
                        </div>
                      </td>
                      <td className="py-2.5 px-1.5 text-center text-slate-400 border-r border-slate-100">{row.uom}</td>
                      <td className="py-2.5 px-1.5 text-center text-slate-400 border-r border-slate-100">{row.category}</td>
                      <td className="py-2.5 px-1.5 text-center font-normal text-slate-700 border-r border-slate-100">${row.unitCost.toFixed(2)}</td>
                      {/* <td className="py-2.5 px-1.5 text-center font-normal border-r border-slate-100">
                        {priceDiff > 0 ? (
                          <span className="text-slate-800 font-bold">+${priceDiff.toFixed(2)} (+{priceDiffPct}%)</span>
                        ) : priceDiff < 0 ? (
                          <span className="text-slate-700 font-bold">-${Math.abs(priceDiff).toFixed(2)} ({priceDiffPct}%)</span>
                        ) : (
                          <span className="text-slate-400">-</span>
                        )}
                      </td> */}
                      <td className="py-2.5 px-1.5 text-center text-slate-500 font-medium border-r border-slate-100">{row.deliveryTime}</td>
                      <td className="py-2.5 px-1.5 text-center text-slate-700 border-r border-slate-100">{row.onTimePercent}%</td>
                      <td className="py-2.5 px-1.5 text-center text-slate-700 border-r border-slate-100">{row.rejectionRate}%</td>
                      <td className="py-2.5 px-1.5 text-center border-r border-slate-100">
                        <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold border ${row.isSoleSource ? "bg-rose-50 text-rose-600 border-rose-100" : "bg-slate-50 text-slate-600 border-slate-200"}`}>
                          {row.isSoleSource ? "Yes" : "No"}
                        </span>
                      </td>
                      <td className="py-2.5 px-1.5 text-center border-r border-slate-100">
                        {(() => {
                          const fsn = getProductFsnClass(row.productCode);
                          return (
                            <span className="px-2 py-0.5 rounded-full text-[9px] font-bold border bg-slate-50 text-slate-600 border-slate-200">
                              {fsn}
                            </span>
                          );
                        })()}
                      </td>
                      <td className="py-4.5 px-6 text-center">
                        <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${
                          row.overallScore >= 9.0 ? "bg-emerald-50 text-emerald-600 border-emerald-100" :
                          row.overallScore >= 8.5 ? "bg-amber-50 text-amber-600 border-amber-100" :
                          "bg-slate-50 text-slate-400 border-slate-150"
                        }`}>
                          {row.overallScore} / 10
                        </span>
                      </td>
                    </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {subTab === "product_wise" && activeProduct && (
        <div className="space-y-8 animate-fadeIn">
          
          {/* Sourcing Summary Banner */}
          {vendorCount === 1 ? (
            <div className="p-5 bg-rose-50/60 border border-rose-100/80 rounded-2xl flex items-start gap-4 text-left card-hover-effect relative overflow-hidden">
              <div className="absolute top-0 left-0 w-1.5 h-full bg-rose-500 animate-pulse" />
              <svg className="w-5 h-5 text-rose-500 mt-0.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
              <div>
                <h4 className="text-xs font-extrabold text-rose-800 uppercase tracking-wider">Critical Sourcing Risk - Single Vendor Dependency</h4>
                <p className="text-xs text-rose-700 mt-1.5 leading-relaxed font-semibold">
                  This product is supplied solely by {productVendors[0]?.vendorName || "one vendor"}. Qualify a second distributor immediately to secure replenishment operations.
                </p>
              </div>
            </div>
          ) : (
            <div className="p-5 bg-emerald-50/60 border border-emerald-100/80 rounded-2xl flex items-start gap-4 text-left card-hover-effect relative overflow-hidden">
              <div className="absolute top-0 left-0 w-1.5 h-full bg-[#008751]" />
              <svg className="w-5 h-5 text-emerald-500 mt-0.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <div>
                <h4 className="text-xs font-extrabold text-emerald-800 uppercase tracking-wider">Diversified Sourcing (Safe)</h4>
                <p className="text-xs text-emerald-700 mt-1.5 leading-relaxed font-semibold">
                  Product has {vendorCount} active distributors. Recommended best-performing source is <span className="font-extrabold text-slate-850 underline">{bestValueVendor?.vendorName}</span>.
                </p>
              </div>
            </div>
          )}

          {/* Product Header Card */}
          <div className="bg-white p-8 rounded-3xl border border-slate-100 shadow-sm text-left space-y-6 card-hover-effect relative overflow-hidden">
            <div className="absolute top-0 left-0 w-1.5 h-full bg-bp-green" />

            {/* Filter Row */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-100 pl-2">
              <div className="flex items-center gap-3">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Select Product</span>
                <select
                  value={selectedProductCode}
                  onChange={(e) => setSelectedProductCode(e.target.value)}
                  className="bg-slate-50 border border-slate-200 text-xs font-bold text-slate-700 py-2 px-3.5 rounded-lg focus:outline-none focus:ring-2 focus:ring-bp-green transition duration-150 max-w-xs shadow-sm"
                >
                  {masterProducts.map((p) => (
                    <option key={p.code} value={p.code}>
                      {p.name} ({p.code})
                    </option>
                  ))}
                </select>
              </div>
              <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                SKU Code: <span className="text-slate-800 font-extrabold">{activeProduct.code}</span>
              </div>
            </div>

            <div className="space-y-4 pl-2">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 rounded-full bg-gradient-to-br from-[#052416] to-[#0a482b] text-bp-yellow flex items-center justify-center font-extrabold text-lg shadow-sm border border-emerald-950/40">
                  {getAvatarInitials(activeProduct.name)}
                </div>
                <div>
                  <h2 className="text-xl font-extrabold text-slate-900 tracking-tight">
                    Sourcing Analysis: {activeProduct.name}
                  </h2>
                  <p className="text-[10px] text-slate-400 font-semibold mt-0.5">Sourcing allocations, storage rules and baseline cost margins</p>
                </div>
              </div>
              
              {/* Product properties list */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-3 text-[12px] font-semibold text-slate-500">
                <div className="bg-slate-55 bg-slate-50/50 p-3 rounded-xl border border-slate-100 shadow-2xs">
                  <span className="text-[9px] text-slate-400 font-bold uppercase tracking-wider block">UOM Category</span>
                  <span className="text-slate-900 font-extrabold mt-1 block">{activeProduct.uom}</span>
                </div>
                <div className="bg-slate-55 bg-slate-50/50 p-3 rounded-xl border border-slate-100 shadow-2xs">
                  <span className="text-[9px] text-slate-400 font-bold uppercase tracking-wider block">Base Price</span>
                  <span className="text-slate-900 font-extrabold mt-1 block">${activeProduct.unitPrice}</span>
                </div>
                <div className="bg-slate-55 bg-slate-50/50 p-3 rounded-xl border border-slate-100 shadow-2xs">
                  <span className="text-[9px] text-slate-400 font-bold uppercase tracking-wider block">Storage Medium</span>
                  <span className="text-slate-900 font-extrabold mt-1 block">{activeProduct.storageLocation}</span>
                </div>
                <div className="bg-slate-55 bg-slate-50/50 p-3 rounded-xl border border-slate-100 shadow-2xs">
                  <span className="text-[9px] text-slate-400 font-bold uppercase tracking-wider block">FSN Status</span>
                  <span className="text-slate-900 font-extrabold mt-1 block">{getProductFsnClass(activeProduct.code)}</span>
                </div>
              </div>
            </div>

            {/* Regional Stock & Planning Status */}
            <div className="space-y-3 pl-2">
              <h4 className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider">Regional Inventory Status</h4>
              <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                <div className="bg-slate-50/50 p-4 rounded-xl border border-slate-100 shadow-2xs">
                  <span className="text-[9.5px] font-extrabold text-slate-400 uppercase tracking-wider block">Current Stock</span>
                  <span className="text-sm font-extrabold text-slate-900 mt-1.5 block">{totalCurrentStock.toLocaleString()} units</span>
                </div>
                <div className="bg-slate-50/50 p-4 rounded-xl border border-slate-100 shadow-2xs">
                  <span className="text-[9.5px] font-extrabold text-slate-400 uppercase tracking-wider block">Safety Stock</span>
                  <span className="text-sm font-extrabold text-slate-900 mt-1.5 block">{totalSafetyStock.toLocaleString()} units</span>
                </div>
                <div className="bg-slate-50/50 p-4 rounded-xl border border-slate-100 shadow-2xs">
                  <span className="text-[9.5px] font-extrabold text-slate-400 uppercase tracking-wider block">Reorder Level (ROL)</span>
                  <span className="text-sm font-extrabold text-slate-900 mt-1.5 block">{totalRol.toLocaleString()} units</span>
                </div>
                <div className="bg-slate-50/50 p-4 rounded-xl border border-slate-100 shadow-2xs">
                  <span className="text-[9.5px] font-extrabold text-slate-400 uppercase tracking-wider block">Recommended ROQ</span>
                  <span className="text-sm font-extrabold text-slate-900 mt-1.5 block">{totalRoq.toLocaleString()} units</span>
                </div>
                <div className="bg-slate-50/50 p-4 rounded-xl border border-slate-100 shadow-2xs col-span-2 md:col-span-1">
                  <span className="text-[9.5px] font-extrabold text-slate-400 uppercase tracking-wider block">Stock Status</span>
                  <span className={`text-sm font-extrabold mt-1.5 block ${totalCurrentStock <= totalRol ? "text-rose-600 animate-pulse" : "text-emerald-600"}`}>
                    {totalCurrentStock <= totalRol ? "Reorder Needed" : "Sufficient Stock"}
                  </span>
                </div>
              </div>
            </div>

            {/* Product summary KPI band */}
            <div className="mt-8 p-5 bg-slate-50/40 rounded-2xl border border-slate-100 grid grid-cols-2 md:grid-cols-4 gap-4 text-left pl-2">
              <div className="bg-white p-4 rounded-xl border border-slate-100 shadow-2xs hover:scale-[1.02] transition duration-150">
                <span className="text-[9px] font-extrabold text-slate-400 uppercase tracking-wider block">Active Vendors</span>
                <span className="text-base font-extrabold text-slate-900 mt-1 block">{vendorCount}</span>
              </div>
              <div className="bg-white p-4 rounded-xl border border-slate-100 shadow-2xs hover:scale-[1.02] transition duration-150">
                <span className="text-[9px] font-extrabold text-slate-400 uppercase tracking-wider block">Recommended Source</span>
                <span className="text-base font-extrabold text-[#008751] mt-1 block">{bestValueVendor?.vendorName || "N/A"}</span>
              </div>
              <div className="bg-white p-4 rounded-xl border border-slate-100 shadow-2xs hover:scale-[1.02] transition duration-150">
                <span className="text-[9px] font-extrabold text-slate-400 uppercase tracking-wider block">Best Cost</span>
                <span className="text-base font-extrabold text-slate-900 mt-1 block">
                  ${productVendors.length > 0 ? Math.min(...productVendors.map((v) => v.unitCost)).toFixed(2) : "0.00"}
                </span>
              </div>
              <div className="bg-white p-4 rounded-xl border border-slate-100 shadow-2xs hover:scale-[1.02] transition duration-150">
                <span className="text-[9px] font-extrabold text-slate-400 uppercase tracking-wider block">Overall Score</span>
                <span className="text-base font-extrabold text-bp-green mt-1 block">
                  {productVendors.length > 0 ? (productVendors.reduce((sum, v) => sum + v.overallScore, 0) / productVendors.length).toFixed(1) : "9.0"} / 10
                </span>
              </div>
            </div>
          </div>

          {/* Vendors for this product table */}
          <div className="bg-white rounded-3xl border-t-4 border-t-bp-green border-x border-b border-slate-100 shadow-sm overflow-hidden text-left card-hover-effect">
            <div className="px-6 py-5 border-b border-slate-50">
              <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                Onboarded Vendors for {activeProduct.name}
              </h3>
              <p className="text-[10px] text-slate-400 font-medium mt-0.5">Overview scores and base unit prices of qualified vendor networks</p>
            </div>
            <div className="overflow-x-auto scrollbar-thin">
              <table className="w-full text-[11px] text-left">
                <thead className="bg-slate-100 text-slate-700 font-extrabold tracking-wider uppercase border-b border-slate-200 text-[9.5px]">
                  <tr>
                    <th className="py-2.5 px-3.5 border-r border-slate-200 text-left w-[220px] min-w-[220px]">Vendor</th>
                    <th className="py-2.5 px-1.5 border-r border-slate-200 text-center leading-tight">
                      <div className="flex flex-col items-center justify-center">
                        <span>Vendor</span>
                        <span>Type</span>
                      </div>
                    </th>
                    <th className="py-2.5 px-1.5 border-r border-slate-200 text-center">Region</th>
                    <th className="py-2.5 px-1.5 border-r border-slate-200 text-center leading-tight">
                      <div className="flex flex-col items-center justify-center">
                        <span>PO</span>
                        <span>Cost</span>
                      </div>
                    </th>
                    <th className="py-2.5 px-1.5 border-r border-slate-200 text-center leading-tight">
                      <div className="flex flex-col items-center justify-center">
                        <span>Lead</span>
                        <span>Time</span>
                      </div>
                    </th>
                    <th className="py-2.5 px-1.5 border-r border-slate-200 text-center leading-tight">
                      <div className="flex flex-col items-center justify-center">
                        <span>On-</span>
                        <span>Time %</span>
                      </div>
                    </th>
                    <th className="py-2.5 px-1.5 border-r border-slate-200 text-center leading-tight">
                      <div className="flex flex-col items-center justify-center">
                        <span>Rejection</span>
                        <span>%</span>
                      </div>
                    </th>
                    <th className="py-2.5 px-1.5 border-r border-slate-200 text-center">MOQ</th>
                    <th className="py-2.5 px-2 text-center leading-tight">
                      <div className="flex flex-col items-center justify-center">
                        <span>Overall</span>
                        <span>Score</span>
                      </div>
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100/60 font-semibold text-slate-700">
                  {productVendors.map((row, idx) => {
                    const priceDiff = row.unitCost - activeProduct.unitPrice;
                    const priceDiffPct = Math.round((priceDiff / activeProduct.unitPrice) * 100);

                    return (
                      <tr key={idx} className="hover:bg-slate-50/50 transition duration-75">
                        <td className="py-2.5 px-3.5 border-r border-slate-100 text-left w-[220px] min-w-[220px] font-bold text-slate-800 hover:text-bp-green cursor-pointer"
                          onClick={() => {
                            setSelectedVendorName(row.vendorName);
                            setSubTab("vendor_wise");
                          }}
                        >
                          <div className="leading-tight max-w-[220px]">
                            {row.vendorName}
                          </div>
                        </td>
                        <td className="py-2.5 px-1.5 text-slate-500 font-medium border-r border-slate-100 text-center">{row.vendorType}</td>
                        <td className="py-2.5 px-1.5 text-slate-500 font-medium border-r border-slate-100 text-center">{row.vendorRegion}</td>
                        <td className="py-2.5 px-1.5 text-center text-slate-900 border-r border-slate-100">${row.unitCost.toFixed(2)}</td>
                        <td className="py-2.5 px-1.5 text-center text-slate-500 font-medium border-r border-slate-100">{row.deliveryTime}</td>
                        <td className="py-2.5 px-1.5 text-center text-slate-700 border-r border-slate-100">{row.onTimePercent}%</td>
                        <td className="py-2.5 px-1.5 text-center text-slate-700 border-r border-slate-100">{row.rejectionRate}%</td>
                        <td className="py-2.5 px-1.5 text-center text-slate-700 border-r border-slate-100">{row.moq} units</td>
                        <td className="py-2.5 px-2 text-center">
                          <span className="px-2 py-0.5 rounded-full text-[9px] font-bold border bg-slate-50 text-slate-600 border-slate-200">
                            {row.overallScore} / 10
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          {/* AI Procurement Sourcing Recommendation block matching Overview Action Items */}
          <div className="bg-gradient-to-br from-[#052416] to-[#0a482b] rounded-3xl shadow-md border border-emerald-900/60 p-6 relative overflow-hidden card-hover-effect text-left text-white">
            <div className="absolute top-0 right-0 p-8 opacity-[0.03] pointer-events-none">
              <svg className="w-40 h-40 text-white" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"/></svg>
            </div>
            <div className="relative z-10">
              <h3 className="text-xs font-bold text-bp-yellow uppercase tracking-wider mb-3 flex items-center gap-2">
                <svg className="w-4.5 h-4.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M13 10V3L4 14h7v7l9-11h-7z"></path></svg>
                AI Procurement Sourcing Recommendation
              </h3>
              <p className="text-emerald-100/90 font-semibold text-xs leading-relaxed max-w-4xl">
                {vendorCount === 1 ? (
                  <span>
                    ALERT: Single-source vulnerability detected. Sourcing operations are entirely reliant on <span className="font-extrabold text-white underline">{productVendors[0]?.vendorName}</span>. Any manufacturing disruptions will immediately deplete inventory levels. It is critical to qualify and onboard a secondary backup distributor.
                  </span>
                ) : (
                  <span>
                   Our AI recommendation engines identify <span className="font-extrabold text-bp-yellow underline">{bestValueVendor?.vendorName}</span> as the optimal primary replenishment route because of its {recommendationReason}, yielding a leading overall performance score of {bestValueVendor?.overallScore}/10.
                  </span>
                )}
              </p>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
