"use client";

import React, { useState, useEffect } from "react";
import { useData } from "@/context/DataContext";
import { PurchaseOrder, PurchaseRequest, VendorIssue, ProcurementActivity, AIRecommendation } from "@/utils/mockDb";
import { calculateVendorPerformanceMetrics, generateDBProcurementData } from "@/utils/dbCalculations";

interface VendorDashboardOverviewProps {
  onNavigate: (tabId: string, subTabId: string, vendorName?: string, productCode?: string) => void;
}

export default function VendorDashboardOverview({ onNavigate }: VendorDashboardOverviewProps) {
  const { vendors, stores, masterProducts, allInventory, purchaseOrders, vendorIssues, recommendations, loading } = useData();

  if (loading) {
    return (
      <div className="flex justify-center items-center py-12">
        <svg className="animate-spin h-8 w-8 text-emerald-600" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
        </svg>
      </div>
    );
  }

  const issues = vendorIssues || [];
  const todayStr = new Date().toISOString().split("T")[0];

  // ============================================================
  // SINGLE SOURCE OF TRUTH: PO-based vendor metrics
  // Moved above KPI calculations so all cards use the same data
  // ============================================================
  const getVendorPOMetrics = (vendorId: string) => {
    const vPOs = purchaseOrders ? purchaseOrders.filter(po => po.vendorId === vendorId) : [];

    // Delivered POs
    const deliveredPOs = vPOs.filter(po => po.status === "Delivered");

    // Delayed POs — only explicitly "Delayed" status (not inferred from dates)
    const delayedPOs = vPOs.filter(po => po.status === "Delayed");

    // Open POs
    const openPOs = vPOs.filter(po =>
      po.status === "Approved" || po.status === "In Transit" ||
      po.status === "Pending Approval" || po.status === "Pending Review" || po.status === "Returned"
    ).length;

    // On-Time Delivery % — averaged from stored onTimeTarget profile field
    const onTimePercent = deliveredPOs.length > 0
      ? Math.round(
          (deliveredPOs.reduce((sum, po) => sum + ((po as any).onTimeTarget ?? 0.92), 0) / deliveredPOs.length) * 100
        )
      : 92;

    // Fill Rate %
    const totalExpected = deliveredPOs.reduce((sum, po) => sum + (po.expectedItems || 100), 0);
    const totalReceived = deliveredPOs.reduce((sum, po) => sum + (po.receivedItems || 98), 0);
    const fillRateVal = totalExpected > 0
      ? parseFloat(((totalReceived / totalExpected) * 100).toFixed(1))
      : 98.0;

    // Order Accuracy %
    const orderAccuracyVal = parseFloat((fillRateVal - 0.5).toFixed(1));

    // Avg. Actual Lead Time (from stored decimal field)
    const leadTimeDays = deliveredPOs.length > 0
      ? parseFloat((deliveredPOs.reduce((sum, po) => sum + (po.leadTimeDays || 2.5), 0) / deliveredPOs.length).toFixed(1))
      : 2.5;

    // Stockouts = explicitly Delayed POs
    const stockouts = delayedPOs.length;

    // Weighted Performance Score (same formula as Performance Overview)
    const stockoutScore = Math.max(0, 100 - (stockouts * 5));
    const leadTimeScore = Math.max(0, 100 - (leadTimeDays * 10));
    const performanceScore = parseFloat((
      (fillRateVal * 0.40) +
      (onTimePercent * 0.25) +
      (orderAccuracyVal * 0.20) +
      (stockoutScore * 0.10) +
      (leadTimeScore * 0.05)
    ).toFixed(1));

    // Status tiers (identical to Performance Overview thresholds)
    let status: "Excellent" | "Good" | "Needs Improvement" | "Critical" = "Good";
    if (performanceScore >= 95.0) status = "Excellent";
    else if (performanceScore >= 85.0) status = "Good";
    else if (performanceScore >= 75.0) status = "Needs Improvement";
    else status = "Critical";

    return {
      onTimePercent,
      fillRateVal,
      orderAccuracyVal,
      leadTimeDays,
      openPOs,
      stockouts,
      performanceScore,
      status,
      // Volume & quality metrics for weighted org formula
      deliveredUnits: deliveredPOs.reduce((sum, po) => sum + ((po as any).receivedItems || 0), 0),
      rejectedUnits:  deliveredPOs.reduce((sum, po) => sum + ((po as any).rejectedItems || 0), 0),
      acceptedUnits:  deliveredPOs.reduce((sum, po) => sum + ((po as any).acceptedItems || 0), 0),
      rejectionRatePct: (() => {
        const totalDel = deliveredPOs.reduce((s, po) => s + ((po as any).receivedItems || 0), 0);
        const totalRej = deliveredPOs.reduce((s, po) => s + ((po as any).rejectedItems || 0), 0);
        return totalDel > 0 ? parseFloat(((totalRej / totalDel) * 100).toFixed(1)) : 0;
      })()
    };
  };

  // Compute for ALL vendors upfront — single source of truth for every section below
  const allVendorMetrics = vendors.map(v => ({ vendor: v, metrics: getVendorPOMetrics(v.id) }));

  // ============================================================
  // 1. EXECUTIVE KPI CARDS — all derived from PO metrics above
  // ============================================================

  // KPI 1 — Vendors Needing Attention (aligned with Performance Overview status tiers)
  const criticalVendorsCount = allVendorMetrics.filter(v => v.metrics.status === "Critical").length;
  const warningVendorsCount = allVendorMetrics.filter(v => v.metrics.status === "Needs Improvement").length;
  const vendorsNeedingAttention = criticalVendorsCount + warningVendorsCount;

  // KPI 2 — Purchase Orders Awaiting Action
  const posAwaitingAction = purchaseOrders.filter(po =>
    po.status === "Pending Approval" || po.status === "Pending Review"
  ).length;

  // KPI 3 — Delayed Deliveries (explicitly Delayed status only — consistent with vendor stockout metric)
  const delayedDeliveries = purchaseOrders.filter(po => po.status === "Delayed").length;

  // KPI 4 — Products at Supply Risk
  const supplyRiskProducts: any[] = [];
  allInventory.forEach(inv => {
    const prod = masterProducts.find(p => p.code === inv.code);
    if (prod) {
      const daysRemaining = inv.avgDailyConsumption > 0
        ? Math.max(0, Math.round(inv.currentStock / inv.avgDailyConsumption))
        : 15;

      if (daysRemaining <= 15) {
        const vendorName = vendors.find(v => v.id === inv.vendorId)?.name || inv.vendorId;
        const storeName = stores.find(s => s.id === inv.storeId)?.name || "Store 1";

        let risk = "Low";
        if (daysRemaining <= 3) risk = "High";
        else if (daysRemaining <= 7) risk = "Medium";

        supplyRiskProducts.push({
          productCode: prod.code,
          productName: prod.name,
          vendorName,
          storeName,
          currentStock: inv.currentStock,
          daysRemaining,
          risk
        });
      }
    }
  });
  supplyRiskProducts.sort((a, b) => a.daysRemaining - b.daysRemaining);
  const supplyRiskProductsCount = new Set(supplyRiskProducts.map(p => p.productCode)).size;

  // KPI 5 — Critical Issues = number of unique vendors with at least one explicitly Delayed PO
  const criticalVendorIssues = new Set(
    purchaseOrders.filter(po => po.status === "Delayed").map(po => po.vendorId)
  ).size;

  // KPI 6 — Deliveries Due Today
  const deliveriesDueToday = purchaseOrders.filter(po =>
    po.expectedDeliveryDate === todayStr &&
    (po.status === "Approved" || po.status === "In Transit")
  ).length;

  // ============================================================
  // 2. VENDOR ACTION CENTER — sourced from actual Delayed POs
  // Shows the worst-performing vendors with delayed shipments
  // ============================================================
  const delayedPOsByVendor = new Map<string, any>();
  purchaseOrders
    .filter(po => po.status === "Delayed")
    .forEach(po => {
      if (!delayedPOsByVendor.has(po.vendorId)) {
        delayedPOsByVendor.set(po.vendorId, po);
      }
    });

  const openVendorIssues = Array.from(delayedPOsByVendor.entries())
    .map(([vendorId, po]) => {
      const store = stores.find(s => s.id === po.storeId);
      const expectedMs = new Date(po.expectedDeliveryDate).getTime();
      const todayMs = new Date(todayStr).getTime();
      const daysLate = Math.max(1, Math.ceil((todayMs - expectedMs) / (1000 * 60 * 60 * 24)));
      const vm = allVendorMetrics.find(v => v.vendor.id === vendorId);
      return {
        vendorId,
        vendorName: po.vendorName,
        issueType: "Delivery delayed",
        affectedStore: store?.name || "Store 1",
        daysDelayed: `${daysLate} Day${daysLate !== 1 ? "s" : ""}`,
        priority: "High",
        status: "Open",
        recAction: "Follow up with vendor",
        performanceScore: vm?.metrics.performanceScore ?? 100
      };
    })
    .sort((a, b) => a.performanceScore - b.performanceScore) // worst performers first
    .slice(0, 5);

  // 3. VENDOR PERFORMANCE TABLE (top 5 by score — same metrics as Performance Overview)
  const vendorPerformanceData = allVendorMetrics.map(({ vendor, metrics }) => ({
    name: vendor.name,
    onTime: `${metrics.onTimePercent}%`,
    fill: `${metrics.fillRateVal.toFixed(1)}%`,    // GAP 4: use 1 decimal, not Math.round
    openPOs: metrics.openPOs,
    status: metrics.status,
    score: metrics.performanceScore
  })).sort((a, b) => b.score - a.score).slice(0, 5);

  // 4. PURCHASE ORDER STATUS (Donut Chart)
  const poStatusesCount = [
    { label: "Pending Approval", count: purchaseOrders.filter(po => po.status === "Pending Approval" || po.status === "Pending Review").length, color: "#a855f7" },
    { label: "Approved", count: purchaseOrders.filter(po => po.status === "Approved" && po.expectedDeliveryDate >= todayStr).length, color: "#3b82f6" },
    { label: "In Transit", count: purchaseOrders.filter(po => po.status === "In Transit" && po.expectedDeliveryDate >= todayStr).length, color: "#f59e0b" },
    { label: "Delivered", count: purchaseOrders.filter(po => po.status === "Delivered").length, color: "#10b981" },
    { label: "Delayed", count: purchaseOrders.filter(po => po.status === "Delayed").length, color: "#ef4444" }
  ];

  const totalPOs = purchaseOrders.length || 1;
  let currentOffset = 0;
  const poSegments = poStatusesCount.map(s => {
    const len = (s.count / totalPOs) * 251.327;
    const offset = currentOffset;
    currentOffset += len;
    return { ...s, len, offset, percent: Math.round((s.count / totalPOs) * 100) };
  });

  // 5. VENDOR DELAY IMPACT (Number of Affected Products)
  const vendorDelayCounts = new Map<string, number>();
  purchaseOrders.filter(po => po.status === "Delayed").forEach(po => {
    const uniqueItemsCount = po.items ? po.items.length : 1;
    vendorDelayCounts.set(po.vendorName, (vendorDelayCounts.get(po.vendorName) || 0) + uniqueItemsCount);
  });
  
  const vendorDelays = Array.from(vendorDelayCounts.entries())
    .map(([vendor, count]) => ({ vendor, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 5);

  const maxDelayCount = vendorDelays.length > 0 ? Math.max(...vendorDelays.map(d => d.count)) : 10;

  // 6. AI PROCUREMENT RECOMMENDATIONS (Carousel mapping)
  const aiRecommendations: any[] = [];
  
  const delayedPO = purchaseOrders.find(po => po.status === "Delayed");
  if (delayedPO) {
    aiRecommendations.push({
      title: "Follow up",
      description: `Follow up with ${delayedPO.vendorName} regarding delayed shipment.`,
      priority: "High Priority",
      priorityClass: "bg-rose-50 text-rose-600 border-rose-100",
      actionLabel: "Take Action",
      kpi: "delayed_deliveries"
    });
  }

  const pendingPO = purchaseOrders.find(po => po.status === "Pending Approval" || po.status === "Pending Review");
  if (pendingPO) {
    aiRecommendations.push({
      title: "Approve PO",
      description: `Approve ${pendingPO.id} before 2 PM.`,
      priority: "High Priority",
      priorityClass: "bg-rose-50 text-rose-600 border-rose-100",
      actionLabel: "Approve Now",
      kpi: "pos_awaiting"
    });
  }

  const riskProduct = supplyRiskProducts[0];
  if (riskProduct) {
    aiRecommendations.push({
      title: "Expedite Supply",
      description: `Expedite ${riskProduct.productName} delivery from ${riskProduct.vendorName}.`,
      priority: "Medium Priority",
      priorityClass: "bg-amber-50 text-amber-600 border-amber-100",
      actionLabel: "Expedite",
      kpi: "supply_risk"
    });
  }

  const lowPerfVendor = vendorPerformanceData.find(v => v.status === "Needs Improvement" || v.status === "Critical");
  if (lowPerfVendor) {
    aiRecommendations.push({
      title: "Review SLA",
      description: `Review ${lowPerfVendor.name} due to repeated SLA violations.`,
      priority: "Medium Priority",
      priorityClass: "bg-amber-50 text-amber-600 border-amber-100",
      actionLabel: "Review",
      kpi: "vendors_attention"
    });
  }

  const riskFoodProduct = supplyRiskProducts.find(p => p.productName.toLowerCase().includes("bread") || p.productName.toLowerCase().includes("milk") || p.productName.toLowerCase().includes("coolant"));
  if (riskFoodProduct) {
    aiRecommendations.push({
      title: "Replenishment",
      description: `Prioritize ${riskFoodProduct.productName} replenishment for ${riskFoodProduct.storeName}.`,
      priority: "Low Priority",
      priorityClass: "bg-blue-50 text-blue-600 border-blue-100",
      actionLabel: "Create PO",
      kpi: "supply_risk"
    });
  }

  // Merge static DB recommendations if we have room
  recommendations.forEach((rec, idx) => {
    if (aiRecommendations.length < 5) {
      aiRecommendations.push({
        title: rec.type || "AI Recommendation",
        description: rec.description,
        priority: `${rec.priority || "Medium"} Priority`,
        priorityClass: rec.priority === "High" ? "bg-rose-50 text-rose-600 border-rose-100" : rec.priority === "Medium" ? "bg-amber-50 text-amber-600 border-amber-100" : "bg-blue-50 text-blue-600 border-blue-100",
        actionLabel: rec.actionLabel || "Take Action",
        kpi: "supply_risk"
      });
    }
  });

  const getStatusBadgeStyle = (status: string) => {
    const s = status.toLowerCase();
    if (s.includes("excellent") || s.includes("resolved") || s.includes("green")) return "bg-emerald-50 text-emerald-600 border-emerald-100 font-semibold";
    if (s.includes("good") || s.includes("in progress") || s.includes("blue")) return "bg-blue-50 text-blue-600 border-blue-100 font-semibold";
    if (s.includes("average") || s.includes("medium") || s.includes("yellow") || s.includes("warning") || s.includes("improvement")) return "bg-amber-50 text-amber-600 border-amber-100 font-semibold";
    if (s.includes("attention") || s.includes("critical") || s.includes("high") || s.includes("rose") || s.includes("red")) return "bg-rose-50 text-rose-600 border-rose-100 font-semibold";
    return "bg-slate-50 text-slate-600 border-slate-200 font-semibold";
  };

  const getAvatarInitials = (nameStr: string) => {
    if (!nameStr) return "VN";
    return nameStr.split(" ").filter(Boolean).map(n => n[0]).slice(0, 2).join("").toUpperCase();
  };

  return (
    <div className="space-y-8 animate-fadeIn pb-20">
      
      {/* 1. EXECUTIVE KPI 6-CARD GRID ROW */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-4">
        
        {/* Card 1: Vendors Needing Attention */}
        <div onClick={() => onNavigate("3", "overview")} className="cursor-pointer bg-white rounded-2xl p-4 border border-slate-100 shadow-sm flex items-center gap-4 hover:shadow-md transition duration-150 text-left card-hover-effect">
          <div className="w-11 h-11 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center flex-shrink-0">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
            </svg>
          </div>
          <div className="space-y-0.5 min-w-0">
            <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider block truncate">Vendors Attention</span>
            <span className="text-xl font-extrabold text-slate-900 block leading-tight">{vendorsNeedingAttention}</span>
            <span className="text-[9px] text-slate-400 block font-semibold leading-none truncate">{criticalVendorsCount} Critical, {warningVendorsCount} Warning</span>
          </div>
        </div>

        {/* Card 2: Purchase Orders Awaiting Action */}
        <div onClick={() => onNavigate("1", "pos_awaiting")} className="cursor-pointer bg-white rounded-2xl p-4 border border-slate-100 shadow-sm flex items-center gap-4 hover:shadow-md transition duration-150 text-left card-hover-effect">
          <div className="w-11 h-11 rounded-full bg-purple-50 text-purple-600 flex items-center justify-center flex-shrink-0">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
            </svg>
          </div>
          <div className="space-y-0.5 min-w-0">
            <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider block truncate">PO Awaiting Action</span>
            <span className="text-xl font-extrabold text-slate-900 block leading-tight">{posAwaitingAction}</span>
            <span className="text-[9px] text-slate-400 block font-semibold leading-none truncate">Pending Approval & Review</span>
          </div>
        </div>

        {/* Card 3: Delayed Deliveries */}
        <div onClick={() => onNavigate("3", "overview")} className="cursor-pointer bg-white rounded-2xl p-4 border border-slate-100 shadow-sm flex items-center gap-4 hover:shadow-md transition duration-150 text-left card-hover-effect">
          <div className="w-11 h-11 rounded-full bg-rose-50 text-rose-600 flex items-center justify-center flex-shrink-0">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>
          <div className="space-y-0.5 min-w-0">
            <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider block truncate">Delayed Deliveries</span>
            <span className="text-xl font-extrabold text-slate-900 block leading-tight">{delayedDeliveries}</span>
            <span className="text-[9px] text-slate-400 block font-semibold leading-none truncate">Overdue Shipments</span>
          </div>
        </div>

        {/* Card 4: Products Supply Risk */}
        <div onClick={() => onNavigate("2", "store")} className="cursor-pointer bg-white rounded-2xl p-4 border border-slate-100 shadow-sm flex items-center gap-4 hover:shadow-md transition duration-150 text-left card-hover-effect">
          <div className="w-11 h-11 rounded-full bg-amber-50 text-amber-600 flex items-center justify-center flex-shrink-0">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
            </svg>
          </div>
          <div className="space-y-0.5 min-w-0">
            <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider block truncate">Products Supply Risk</span>
            <span className="text-xl font-extrabold text-slate-900 block leading-tight">{supplyRiskProductsCount}</span>
            <span className="text-[9px] text-slate-400 block font-semibold leading-none truncate">Across Assigned Stores</span>
          </div>
        </div>

        {/* Card 5: Critical Vendor Issues */}
        <div onClick={() => onNavigate("3", "overview")} className="cursor-pointer bg-white rounded-2xl p-4 border border-slate-100 shadow-sm flex items-center gap-4 hover:shadow-md transition duration-150 text-left card-hover-effect">
          <div className="w-11 h-11 rounded-full bg-rose-50 text-rose-600 flex items-center justify-center flex-shrink-0">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <div className="space-y-0.5 min-w-0">
            <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider block truncate">Critical Issues</span>
            <span className="text-xl font-extrabold text-slate-900 block leading-tight">{criticalVendorIssues}</span>
            <span className="text-[9px] text-slate-400 block font-semibold leading-none truncate">Requires Immediate Action</span>
          </div>
        </div>

        {/* Card 6: Deliveries Due Today */}
        <div onClick={() => onNavigate("3", "overview")} className="cursor-pointer bg-white rounded-2xl p-4 border border-slate-100 shadow-sm flex items-center gap-4 hover:shadow-md transition duration-150 text-left card-hover-effect">
          <div className="w-11 h-11 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center flex-shrink-0">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
          </div>
          <div className="space-y-0.5 min-w-0">
            <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider block truncate">Deliveries Due Today</span>
            <span className="text-xl font-extrabold text-slate-900 block leading-tight">{deliveriesDueToday}</span>
            <span className="text-[9px] text-slate-400 block font-semibold leading-none truncate">Scheduled Deliveries</span>
          </div>
        </div>

      </div>

      {/* 2. VENDOR ACTION CENTER */}
      <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden text-left card-hover-effect">
        <div className="px-6 py-5 border-b border-slate-50 flex justify-between items-center flex-wrap gap-2">
          <div>
            <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">Vendor Action Center <span className="text-[10px] text-slate-400 font-semibold lowercase tracking-normal">(Top Issues Requiring Your Attention)</span></h3>
            <p className="text-[10px] text-slate-400 font-medium mt-0.5">Critical compliance actions and updates</p>
          </div>
          {openVendorIssues.length > 0 && (
            <span className="px-2.5 py-0.5 bg-rose-50 text-rose-600 text-[10px] font-extrabold rounded-full border border-rose-100 uppercase tracking-wider">
              {openVendorIssues.length} Actions Required
            </span>
          )}
        </div>
        <div className="overflow-x-auto scrollbar-thin">
          <table className="w-full text-xs text-left">
            <thead className="text-[10px] text-slate-400 uppercase tracking-wider font-extrabold bg-slate-50/50 border-b border-slate-50">
              <tr>
                <th className="px-6 py-4">Vendor</th>
                <th className="px-6 py-4">Issue</th>
                <th className="px-6 py-4">Affected Store</th>
                <th className="px-6 py-4 text-center">Priority</th>
                <th className="px-6 py-4 text-center">Days Delayed</th>
                <th className="px-6 py-4">Recommended Action</th>
                <th className="px-6 py-4 text-center">Status</th>
                <th className="px-6 py-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100/60 font-semibold text-slate-700">
              {openVendorIssues.map((issue, idx) => {
                const priorityColor = getStatusBadgeStyle(issue.priority);
                const statusColor = getStatusBadgeStyle(issue.status === "Open" ? "Open" : "In Progress");
                const daysColor = issue.daysDelayed !== "-" ? "text-rose-600 font-bold" : "text-slate-400 font-semibold";
                
                return (
                  <tr key={idx} className="hover:bg-slate-50/50 transition-colors">
                    <td className="px-6 py-4 font-bold text-slate-900">
                      <div className="flex items-center gap-2">
                        <div className="w-6 h-6 rounded-full bg-slate-900 text-bp-yellow flex items-center justify-center font-extrabold text-[9px] shadow-xs shrink-0">
                          {getAvatarInitials(issue.vendorName)}
                        </div>
                        <span>{issue.vendorName}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-slate-500 font-medium">{issue.issueType}</td>
                    <td className="px-6 py-4 text-slate-500 font-semibold">{issue.affectedStore}</td>
                    <td className="px-6 py-4 text-center">
                      <span className={`px-2 py-0.5 rounded text-[8.5px] font-extrabold uppercase border ${priorityColor}`}>
                        {issue.priority}
                      </span>
                    </td>
                    <td className={`px-6 py-4 text-center ${daysColor}`}>{issue.daysDelayed}</td>
                    <td className="px-6 py-4 text-slate-500 font-medium">{issue.recAction}</td>
                    <td className="px-6 py-4 text-center">
                      <span className={`px-2.5 py-0.5 rounded text-[8.5px] font-extrabold uppercase border ${statusColor}`}>
                        {issue.status === "Open" ? "Open" : "In Progress"}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button onClick={() => onNavigate("3", "overview")} className="text-slate-400 hover:text-slate-600 transition shrink-0 p-1">
                        <svg className="w-4.5 h-4.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                        </svg>
                      </button>
                    </td>
                  </tr>
                );
              })}
              {openVendorIssues.length === 0 && (
                <tr>
                  <td colSpan={8} className="px-6 py-8 text-center text-slate-400 font-medium">No immediate vendor actions required today.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* 3. ROW 2: VENDOR PERFORMANCE & PO STATUS */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 text-left">
        
        {/* Vendor Performance */}
        <div className="lg:col-span-2 bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden card-hover-effect">
          <div className="px-6 py-5 border-b border-slate-50 flex justify-between items-center">
            <div>
              <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">Vendor Performance <span className="text-[10px] text-slate-400 font-semibold lowercase tracking-normal">(Current Month)</span></h3>
              <p className="text-[10px] text-slate-400 font-medium mt-0.5">Delivery timelines and fulfillment rates</p>
            </div>
            <button onClick={() => onNavigate("3", "overview")} className="text-[10.5px] font-extrabold text-emerald-600 hover:underline">View All</button>
          </div>
          <div className="overflow-x-auto scrollbar-thin">
            <table className="w-full text-xs text-left">
              <thead className="text-[10px] text-slate-400 uppercase tracking-wider font-extrabold bg-slate-50/50 border-b border-slate-50">
                <tr>
                  <th className="px-6 py-4">Vendor</th>
                  <th className="px-6 py-4 text-center">On-Time Delivery</th>
                  <th className="px-6 py-4 text-center">Fill Rate</th>
                  <th className="px-6 py-4 text-center">Open POs</th>
                  <th className="px-6 py-4 text-center">Performance Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100/60 font-semibold text-slate-700">
                {vendorPerformanceData.map((v, i) => {
                  const onTimeVal = parseInt(v.onTime);
                  const fillVal = parseInt(v.fill);
                  
                  const onTimeColor = onTimeVal >= 95 ? "text-emerald-600 font-bold" : onTimeVal >= 85 ? "text-slate-800" : "text-rose-600 font-bold";
                  const fillColor = fillVal >= 95 ? "text-emerald-600 font-bold" : fillVal >= 85 ? "text-slate-800" : "text-rose-600 font-bold";
                  
                  return (
                    <tr key={i} className="hover:bg-slate-50/50">
                      <td className="px-6 py-4 font-bold text-slate-900">
                        <div className="flex items-center gap-2">
                          <div className="w-6 h-6 rounded-full bg-slate-900 text-bp-yellow flex items-center justify-center font-extrabold text-[9px] shadow-xs shrink-0">
                            {getAvatarInitials(v.name)}
                          </div>
                          <span className="text-bp-green hover:text-bp-green-dark cursor-pointer transition" onClick={() => onNavigate("3", "vendor_wise", v.name)}>{v.name}</span>
                        </div>
                      </td>
                      <td className={`px-6 py-4 text-center ${onTimeColor}`}>{v.onTime}</td>
                      <td className={`px-6 py-4 text-center ${fillColor}`}>{v.fill}</td>
                      <td className="px-6 py-4 text-center text-slate-500 font-bold">{v.openPOs}</td>
                      <td className="px-6 py-4 text-center">
                        <span className={`px-2.5 py-0.5 rounded text-[8.5px] font-extrabold uppercase border ${getStatusBadgeStyle(v.status)}`}>
                          {v.status}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* PO Status Donut */}
        <div className="bg-white rounded-3xl border border-slate-100 shadow-sm p-6 flex flex-col card-hover-effect">
          <div className="border-b border-slate-50 pb-3.5 mb-5 flex justify-between items-center">
            <div className="text-left">
              <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">Purchase Order Status</h3>
              <p className="text-[10px] text-slate-400 font-medium mt-0.5">Overview of active order states</p>
            </div>
            <button onClick={() => onNavigate("3", "overview")} className="text-[10.5px] font-extrabold text-emerald-600 hover:underline">View All</button>
          </div>
          <div className="flex-grow flex flex-col sm:flex-row justify-center items-center py-2 gap-6">
            <div className="relative w-28 h-28 shrink-0">
              <svg viewBox="0 0 100 100" className="w-full h-full transform -rotate-90">
                {poSegments.map((segment, i) => (
                  <circle
                    key={i}
                    cx="50" cy="50" r="40"
                    fill="transparent"
                    stroke={segment.color}
                    strokeWidth="11"
                    strokeDasharray={`${segment.len} 251.327`}
                    strokeDashoffset={-segment.offset}
                    className="transition-all duration-1000 ease-out cursor-pointer hover:opacity-85"
                  />
                ))}
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-2xl font-extrabold text-slate-900 tracking-tighter leading-none">{purchaseOrders.length}</span>
                <span className="text-[8.5px] font-bold text-slate-400 uppercase tracking-wider mt-1">Total POs</span>
              </div>
            </div>
            <div className="flex-grow flex flex-col gap-2.5 text-xs font-semibold w-full text-left">
              {poStatusesCount.filter(s => s.count >= 0).map((s, i) => {
                const percent = purchaseOrders.length > 0 ? Math.round((s.count / purchaseOrders.length) * 100) : 0;
                return (
                  <div key={i} className="flex items-center justify-between hover:bg-slate-50 px-2 py-1 rounded transition">
                    <div className="flex items-center gap-2">
                      <div className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: s.color }}></div>
                      <span className="text-[9.5px] font-bold text-slate-500 uppercase leading-none">{s.label}</span>
                    </div>
                    <span className="text-slate-800 font-extrabold text-xs">{s.count} <span className="text-[9.5px] text-slate-400 font-medium">({percent}%)</span></span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* 4. ROW 3: PRODUCTS AT SUPPLY RISK & VENDOR DELAY IMPACT */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 text-left">
        
        {/* Products at Supply Risk */}
        <div className="lg:col-span-2 bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden card-hover-effect">
          <div className="px-6 py-5 border-b border-slate-50 flex justify-between items-center">
            <div>
              <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">Products at Supply Risk</h3>
              <p className="text-[10px] text-slate-400 font-medium mt-0.5">Critical raw materials and SKUs with supply risk</p>
            </div>
            <button onClick={() => onNavigate("2", "store")} className="text-[10.5px] font-extrabold text-emerald-600 hover:underline">View All</button>
          </div>
          <div className="overflow-x-auto scrollbar-thin">
            <table className="w-full text-xs text-left">
              <thead className="text-[10px] text-slate-400 uppercase tracking-wider font-extrabold bg-slate-50/50 border-b border-slate-50">
                <tr>
                  <th className="px-6 py-4">Product</th>
                  <th className="px-6 py-4">Vendor</th>
                  <th className="px-6 py-4">Store</th>
                  <th className="px-6 py-4 text-center">Current Stock</th>
                  <th className="px-6 py-4 text-center">Days Remaining</th>
                  <th className="px-6 py-4 text-center">Risk Level</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100/60 font-semibold text-slate-700">
                {supplyRiskProducts.slice(0, 5).map((p, i) => {
                  const riskColor = getStatusBadgeStyle(p.risk);
                  const daysColor = p.daysRemaining <= 3 ? "text-rose-600 animate-pulse font-bold" : p.daysRemaining <= 7 ? "text-amber-500 font-bold" : "text-slate-500 font-semibold";
                  
                  return (
                    <tr key={i} className="hover:bg-slate-50/50">
                      <td className="px-6 py-4 font-bold text-slate-900 hover:text-bp-green cursor-pointer transition" onClick={() => onNavigate("2", "store", undefined, p.productCode)}>{p.productName}</td>
                      <td className="px-6 py-4 text-slate-500 font-medium">{p.vendorName}</td>
                      <td className="px-6 py-4 text-slate-500 font-semibold">{p.storeName}</td>
                      <td className="px-6 py-4 text-center text-slate-700">{p.currentStock}</td>
                      <td className={`px-6 py-4 text-center ${daysColor}`}>{p.daysRemaining} days</td>
                      <td className="px-6 py-4 text-center">
                        <span className={`px-2.5 py-0.5 rounded text-[8.5px] font-extrabold uppercase border ${riskColor}`}>
                          {p.risk}
                        </span>
                      </td>
                    </tr>
                  );
                })}
                {supplyRiskProducts.length === 0 && (
                  <tr>
                    <td colSpan={6} className="px-6 py-8 text-center text-slate-400 font-medium">No products currently at supply risk.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Vendor Delay Impact Chart */}
        <div className="bg-white rounded-3xl border border-slate-100 shadow-sm p-6 flex flex-col justify-between card-hover-effect">
          <div>
            <div className="border-b border-slate-50 pb-3.5 mb-5 flex justify-between items-center">
              <div>
                <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">Vendor Delay Impact</h3>
                <p className="text-[10px] text-slate-400 font-medium mt-0.5">Number of affected products by delayed shipment</p>
              </div>
              <button onClick={() => onNavigate("3", "overview")} className="text-[10.5px] font-extrabold text-emerald-600 hover:underline">View All</button>
            </div>
            
            <div className="space-y-4">
              {vendorDelays.map((v, i) => {
                const widthPct = Math.max(10, Math.min(100, (v.count / maxDelayCount) * 100));
                // Use different warm tones for gradient bars
                const barColor = i === 0 ? "from-rose-500 to-rose-600" : i === 1 ? "from-orange-400 to-orange-500" : "from-amber-400 to-amber-500";
                
                return (
                  <div key={i} className="space-y-1.5">
                    <div className="flex justify-between text-[10.5px] font-bold text-slate-700">
                      <span>{v.vendor}</span>
                      <span className="text-slate-900 font-extrabold">{v.count} SKUs</span>
                    </div>
                    <div className="w-full h-3 rounded-full bg-slate-50 border border-slate-100 p-0.5 overflow-hidden">
                      <div className={`h-full rounded-full bg-gradient-to-r ${barColor} transition-all duration-1000`} style={{ width: `${widthPct}%` }}></div>
                    </div>
                  </div>
                );
              })}
              {vendorDelays.length === 0 && (
                <div className="py-12 text-center text-slate-400 font-semibold text-xs">No active delayed products today.</div>
              )}
            </div>
          </div>
        </div>

      </div>

      {/* 5. AI PROCUREMENT RECOMMENDATIONS */}
      <div className="bg-white rounded-3xl border border-slate-100 shadow-sm p-6 text-left w-full card-hover-effect">
        <div className="border-b border-slate-50 pb-3.5 mb-5 flex justify-between items-center">
          <div>
            <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
              <svg className="w-4 h-4 text-bp-yellow fill-bp-yellow shrink-0" fill="currentColor" viewBox="0 0 20 20">
                <path d="M11 3a1 1 0 10-2 0v1a1 1 0 102 0V3zM15.657 5.757a1 1 0 00-1.414-1.414l-.707.707a1 1 0 001.414 1.414l.707-.707zM18 10a1 1 0 01-1 1h-1a1 1 0 110-2h1a1 1 0 011 1zM5.05 6.464a1 1 0 10-1.414-1.414l.707-.707a1 1 0 101.414 1.414l-.707.707zM5 10a1 1 0 11-2 0 1 1 0 012 0zM8 16v-1a1 1 0 112 0v1a1 1 0 11-2 0zM5.657 13.05a1 1 0 10-1.414 1.414l.707.707a1 1 0 001.414-1.414l-.707-.707zM15.657 14.243a1 1 0 00-1.414-1.414l-.707.707a1 1 0 001.414 1.414l-.707-.707z" />
              </svg>
              AI Procurement Recommendations
            </h3>
            <p className="text-[10px] text-slate-400 font-medium mt-0.5">Recommended actions derived from database stock metrics and vendor fulfillment SLA rates</p>
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
          {aiRecommendations.map((rec, i) => (
            <div key={i} className="bg-slate-50/50 hover:bg-slate-50 border border-slate-100 rounded-2xl p-4 flex flex-col justify-between h-[155px] transition duration-150 text-left">
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className={`px-2 py-0.5 rounded text-[8px] font-extrabold border uppercase tracking-wider ${rec.priorityClass}`}>
                    {rec.priority}
                  </span>
                </div>
                <h4 className="text-slate-900 font-extrabold text-xs leading-tight uppercase tracking-wider">{rec.title}</h4>
                <p className="text-slate-500 font-semibold text-[10.5px] leading-snug line-clamp-3" title={rec.description}>{rec.description}</p>
              </div>
              <button onClick={() => onNavigate(rec.kpi === "pos_awaiting" ? "1" : "3", rec.kpi)} className="w-full text-center text-[10px] font-extrabold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 border border-emerald-100 py-1.5 rounded-xl shadow-xs transition leading-none">
                {rec.actionLabel} &rarr;
              </button>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
}
