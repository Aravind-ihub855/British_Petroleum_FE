"use client";

import React, { useState, useEffect } from "react";
import { useData } from "@/context/DataContext";
import { PurchaseOrder, PurchaseRequest, VendorIssue, ProcurementActivity, AIRecommendation } from "@/utils/mockDb";
import { calculateVendorPerformanceMetrics, generateDBProcurementData } from "@/utils/dbCalculations";

interface VendorDashboardOverviewProps {
  onNavigate: (tabId: string, subTabId: string, vendorName?: string, productCode?: string) => void;
}

export default function VendorDashboardOverview({ onNavigate }: VendorDashboardOverviewProps) {
  const { vendors, stores, masterProducts, allInventory, loading } = useData();
  const [procurement, setProcurement] = useState<{
    purchaseOrders: PurchaseOrder[];
    purchaseRequests: PurchaseRequest[];
    issues: VendorIssue[];
    activities: ProcurementActivity[];
    recommendations: AIRecommendation[];
  } | null>(null);

  useEffect(() => {
    if (!loading && vendors.length > 0 && stores.length > 0) {
      const data = generateDBProcurementData(stores, vendors);
      setProcurement({
        purchaseOrders: data.purchaseOrders,
        purchaseRequests: data.purchaseRequests,
        recommendations: data.recommendations,
        issues: data.issues || [],
        activities: []
      });
    }
  }, [loading, vendors, stores]);

  if (loading || !procurement) {
    return (
      <div className="flex justify-center items-center py-12">
        <svg className="animate-spin h-8 w-8 text-emerald-600" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
        </svg>
      </div>
    );
  }

  const { purchaseOrders, issues, recommendations } = procurement;
  const todayStr = new Date().toISOString().split("T")[0];

  // 1. EXECUTIVE KPI CARDS CALCULATIONS
  
  // KPI 1 - Vendors Needing Attention
  // Formula: COUNT(DISTINCT Vendor) WHERE Vendor has unresolved critical issue
  const vendorsNeedingAttention = new Set(
    issues.filter(i => (i.priority === "Critical" || i.priority === "High") && i.status !== "Resolved").map(i => i.vendorId)
  ).size;

  // KPI 2 - Purchase Orders Awaiting Action
  // Formula: COUNT(PO) WHERE Status IN (Pending Approval, Pending Review, Returned)
  const posAwaitingAction = purchaseOrders.filter(po => 
    po.status === "Pending Approval" || po.status === "Pending Review" || po.status === "Returned"
  ).length;

  // KPI 3 - Delayed Deliveries
  // Formula: COUNT(Deliveries) WHERE Status is Delayed OR (Status is Approved/In Transit AND Date is past due)
  // We exclude Pending POs because they haven't been ordered yet.
  const delayedDeliveries = purchaseOrders.filter(po => 
    po.status === "Delayed" || 
    ((po.status === "Approved" || po.status === "In Transit") && po.expectedDeliveryDate < todayStr)
  ).length;

  // KPI 4 - Products at Supply Risk
  // Formula: Products WHERE Projected Stock < Safety Stock AND Incoming Supply Delayed
  let supplyRiskProductsCount = 0;
  const supplyRiskProducts: any[] = [];
  if (allInventory.length > 0 && masterProducts.length > 0) {
    allInventory.forEach(inv => {
      const prod = masterProducts.find(p => p.code === inv.code);
      // Fallback for safety stock if not defined
      const safetyStock = inv.safetyStockLevel || 20; 
      if (prod && inv.currentStock < safetyStock) {
        // Check if there is an incoming supply delayed for this vendor/product
        // (For simplicity we just flag it if stock is very low or there is a known delay from this vendor)
        const vendorDelay = purchaseOrders.find(po => po.vendorId === inv.vendorId && po.expectedDeliveryDate < todayStr && po.status !== "Delivered");
        
        if (inv.currentStock < 5 || vendorDelay) {
          supplyRiskProductsCount++;
          const vendorName = vendors.find(v => v.id === inv.vendorId)?.name || inv.vendorId;
          const storeName = stores.find(s => s.id === inv.storeId)?.name || "Main Store";
          
          let riskLevel = "Medium";
          if (inv.currentStock <= 2) riskLevel = "High";
          
          if (!supplyRiskProducts.find(r => r.product === prod.name && r.store === storeName)) {
             supplyRiskProducts.push({
               product: prod.name,
               vendor: vendorName,
               store: storeName,
               daysRemaining: inv.currentStock, // Approximation
               risk: riskLevel
             });
          }
        }
      }
    });
  }
  
  supplyRiskProducts.sort((a, b) => a.daysRemaining - b.daysRemaining);

  // KPI 5 - Critical Vendor Issues
  // Formula: COUNT(Issues) WHERE Priority = Critical AND Status = Open
  const criticalVendorIssues = issues.filter(i => (i.priority === "Critical" || i.priority === "High") && i.status === "Open").length;

  // KPI 6 - Deliveries Due Today
  // Formula: COUNT(Deliveries) WHERE Expected Delivery Date = Today
  const deliveriesDueToday = purchaseOrders.filter(po => po.expectedDeliveryDate === todayStr && po.status !== "Delivered").length;

  // 2. VENDOR ACTION CENTER
  const openVendorIssues = issues.filter(i => i.status === "Open").sort((a, b) => {
    const pA = a.priority === "Critical" ? 3 : a.priority === "High" ? 2 : 1;
    const pB = b.priority === "Critical" ? 3 : b.priority === "High" ? 2 : 1;
    return pB - pA;
  }).slice(0, 5);

  // 3. VENDOR PERFORMANCE
  const vendorStats = new Map<string, { totalPOs: number, onTimePOs: number, expectedItems: number, receivedItems: number, openPOs: number, name: string }>();
  purchaseOrders.forEach(po => {
    if (!vendorStats.has(po.vendorId)) {
      vendorStats.set(po.vendorId, { totalPOs: 0, onTimePOs: 0, expectedItems: 0, receivedItems: 0, openPOs: 0, name: po.vendorName });
    }
    const stat = vendorStats.get(po.vendorId)!;
    
    if (po.status !== "Delivered" && po.status !== "Cancelled") {
      stat.openPOs += 1;
    }

    if (po.status === "Delivered") {
      stat.totalPOs += 1;
      stat.expectedItems += po.expectedItems || 100; // Mock items if undefined
      stat.receivedItems += po.receivedItems || 98;
      if (po.actualDeliveryDate && po.actualDeliveryDate <= po.expectedDeliveryDate) {
        stat.onTimePOs += 1;
      }
    }
  });

  const vendorPerformanceData = Array.from(vendorStats.values()).map(stat => {
    const onTime = stat.totalPOs > 0 ? (stat.onTimePOs / stat.totalPOs) * 100 : 0;
    const fillRate = stat.expectedItems > 0 ? (stat.receivedItems / stat.expectedItems) * 100 : 0;
    
    let status = "Needs Attention";
    if (onTime >= 98 && fillRate >= 98) status = "Excellent";
    else if (onTime >= 95 && fillRate >= 95) status = "Good";
    else if (onTime >= 85 && fillRate >= 85) status = "Average";

    return {
      name: stat.name,
      onTime: `${Math.round(onTime)}%`,
      fill: `${Math.round(fillRate)}%`,
      openPOs: stat.openPOs,
      status,
      rawOnTime: onTime,
      score: onTime + fillRate // Use combined score for sorting
    };
  }).sort((a, b) => a.score - b.score).slice(0, 5);

  // 4. PURCHASE ORDER STATUS (Donut Chart)
  // We group them into mutually exclusive buckets so the total matches exactly.
  const poStatusesCount = [
    { label: "Awaiting Action", count: purchaseOrders.filter(po => po.status === "Pending Approval" || po.status === "Pending Review" || po.status === "Returned").length, color: "#f59e0b" },
    { label: "Approved", count: purchaseOrders.filter(po => po.status === "Approved").length, color: "#3b82f6" },
    { label: "In Transit", count: purchaseOrders.filter(po => po.status === "In Transit").length, color: "#6366f1" },
    { label: "Delivered", count: purchaseOrders.filter(po => po.status === "Delivered").length, color: "#10b981" },
    // A PO is exclusively in the "Delayed" bucket if its status is literally "Delayed", OR it's an active order (Approved/In Transit) that missed its date.
    { label: "Delayed", count: purchaseOrders.filter(po => 
        po.status === "Delayed" || 
        ((po.status === "Approved" || po.status === "In Transit") && po.expectedDeliveryDate < todayStr)
      ).length, color: "#f43f5e" }
  ];

  // To prevent double counting in the donut chart, we must remove the past-due Approved/In Transit from their original buckets
  const delayedCountForDonut = poStatusesCount[4].count;
  poStatusesCount[1].count -= purchaseOrders.filter(po => po.status === "Approved" && po.expectedDeliveryDate < todayStr).length;
  poStatusesCount[2].count -= purchaseOrders.filter(po => po.status === "In Transit" && po.expectedDeliveryDate < todayStr).length;

  const totalPOs = poStatusesCount.reduce((s, x) => s + x.count, 0) || 1;
  let currentOffset = 0;
  const poSegments = poStatusesCount.map(s => {
    const len = (s.count / totalPOs) * 251.327;
    const offset = currentOffset;
    currentOffset += len;
    return { ...s, len, offset };
  });

  // 6. VENDOR DELAY IMPACT
  const vendorDelayCounts = new Map<string, number>();
  purchaseOrders.filter(po => po.expectedDeliveryDate < todayStr && po.status !== "Delivered").forEach(po => {
     vendorDelayCounts.set(po.vendorName, (vendorDelayCounts.get(po.vendorName) || 0) + 1);
  });
  const vendorDelays = Array.from(vendorDelayCounts.entries())
    .map(([vendor, count]) => ({ vendor, count }))
    .sort((a, b) => b.count - a.count).slice(0, 4);

  const maxDelayCount = vendorDelays.length > 0 ? vendorDelays[0].count : 1;

  // Status Badge Helper
  const getStatusBadgeStyle = (status: string) => {
    const s = status.toLowerCase();
    if (s.includes("excellent") || s.includes("resolved")) return "bg-emerald-50 text-emerald-600 border-emerald-100 font-semibold";
    if (s.includes("good") || s.includes("medium")) return "bg-blue-50 text-blue-600 border-blue-100 font-semibold";
    if (s.includes("average") || s.includes("low")) return "bg-slate-50 text-slate-600 border-slate-200 font-semibold";
    if (s.includes("attention") || s.includes("critical") || s.includes("high")) return "bg-rose-50 text-rose-600 border-rose-100 font-semibold";
    return "bg-slate-50 text-slate-600 border-slate-200 font-semibold";
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500 pb-20">
      
      {/* 1. EXECUTIVE KPI CARDS */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        {[
          { label: "VENDORS NEEDING ATTENTION", val: vendorsNeedingAttention },
          { label: "POS AWAITING ACTION", val: posAwaitingAction },
          { label: "DELAYED DELIVERIES", val: delayedDeliveries },
          { label: "PRODUCTS AT SUPPLY RISK", val: supplyRiskProductsCount },
          { label: "CRITICAL VENDOR ISSUES", val: criticalVendorIssues },
          { label: "DELIVERIES DUE TODAY", val: deliveriesDueToday },
        ].map((kpi, idx) => (
          <div key={idx} className="bg-white rounded-xl p-5 border border-slate-200 shadow-sm flex flex-col justify-between hover:shadow-md transition-shadow">
            <h3 className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider mb-2">{kpi.label}</h3>
            <p className={`text-3xl font-semibold text-slate-800 tracking-tight`}>{kpi.val}</p>
          </div>
        ))}
      </div>

      {/* 2. VENDOR ACTION CENTER */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="px-6 py-5 border-b border-slate-100 flex justify-between items-center">
          <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider">Vendor Action Center</h3>
          {openVendorIssues.length > 0 && (
            <span className="px-2.5 py-1 bg-slate-100 text-slate-600 text-xs font-semibold rounded-full border border-slate-200">
              {openVendorIssues.length} Actions Required
            </span>
          )}
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="text-xs text-slate-500 uppercase bg-slate-50 border-b border-slate-100">
              <tr>
                <th className="px-6 py-4 font-medium">Vendor</th>
                <th className="px-6 py-4 font-medium">Issue</th>
                <th className="px-6 py-4 font-medium text-center">Severity</th>
                <th className="px-6 py-4 font-medium text-right">Action Required</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {openVendorIssues.map((issue, idx) => (
                <tr key={idx} className="hover:bg-slate-50 transition-colors">
                  <td className="px-6 py-4 font-medium text-slate-700">{issue.vendorName}</td>
                  <td className="px-6 py-4 text-slate-500 font-normal">{issue.issueType}</td>
                  <td className="px-6 py-4 text-center">
                    <span className={`px-2.5 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider border ${getStatusBadgeStyle(issue.priority)}`}>
                      {issue.priority}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <button className="text-xs font-medium text-slate-600 bg-white border border-slate-200 hover:bg-slate-50 hover:text-slate-900 px-4 py-2 rounded-lg shadow-sm transition-colors">
                      {issue.issueType.includes("Invoice") ? "Verify Invoice" : issue.issueType.includes("SLA") ? "Review Performance" : "Follow Up"}
                    </button>
                  </td>
                </tr>
              ))}
              {openVendorIssues.length === 0 && (
                <tr>
                  <td colSpan={4} className="px-6 py-8 text-center text-slate-500 font-medium">No immediate vendor actions required today.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* 3. ROW 1: VENDOR PERFORMANCE & PO STATUS */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Vendor Performance */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="px-6 py-5 border-b border-slate-100">
            <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider">Vendor Performance</h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="text-xs text-slate-500 uppercase bg-slate-50 border-b border-slate-100">
                <tr>
                  <th className="px-6 py-4 font-medium">Vendor</th>
                  <th className="px-6 py-4 font-medium text-right">On-Time Delivery</th>
                  <th className="px-6 py-4 font-medium text-right">Fill Rate</th>
                  <th className="px-6 py-4 font-medium text-right">Open POs</th>
                  <th className="px-6 py-4 font-medium text-center">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {vendorPerformanceData.map((v, i) => (
                  <tr key={i} className="hover:bg-slate-50">
                    <td className="px-6 py-4 font-medium text-slate-700 cursor-pointer hover:text-emerald-600 transition-colors" onClick={() => onNavigate("vendors", "details", v.name)}>{v.name}</td>
                    <td className="px-6 py-4 text-right font-normal text-slate-500">{v.onTime}</td>
                    <td className="px-6 py-4 text-right font-normal text-slate-500">{v.fill}</td>
                    <td className="px-6 py-4 text-right font-normal text-slate-500">{v.openPOs}</td>
                    <td className="px-6 py-4 text-center">
                       <span className={`px-2.5 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider border ${getStatusBadgeStyle(v.status)}`}>
                        {v.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* PO Status Donut */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 flex flex-col">
          <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider mb-6">Purchase Order Status</h3>
          <div className="flex-1 flex flex-col justify-center items-center">
            <div className="relative w-48 h-48 mb-6 drop-shadow-md">
              <svg viewBox="0 0 100 100" className="w-full h-full transform -rotate-90">
                {poSegments.map((segment, i) => (
                  <circle
                    key={i}
                    cx="50" cy="50" r="40"
                    fill="transparent"
                    stroke={segment.color}
                    strokeWidth="16"
                    strokeDasharray={`${segment.len} 251.327`}
                    strokeDashoffset={-segment.offset}
                    className="transition-all duration-1000 ease-out cursor-pointer hover:opacity-80"
                  />
                ))}
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-3xl font-black text-slate-800 tracking-tighter">{totalPOs}</span>
                <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">Total</span>
              </div>
            </div>
            <div className="w-full grid grid-cols-2 gap-3">
              {poStatusesCount.filter(s => s.count > 0).map((s, i) => (
                <div key={i} className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full shadow-sm" style={{ backgroundColor: s.color }}></div>
                  <div className="flex flex-col">
                     <span className="text-[10px] font-bold text-slate-500 uppercase leading-none">{s.label}</span>
                     <span className="text-sm font-black text-slate-800">{s.count}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* 4. ROW 2: PRODUCTS AT SUPPLY RISK & VENDOR DELAY IMPACT */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Products at Supply Risk */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="px-6 py-5 border-b border-slate-100">
            <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider">Products at Supply Risk</h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="text-xs text-slate-500 uppercase bg-slate-50 border-b border-slate-100">
                <tr>
                  <th className="px-6 py-4 font-medium">Product</th>
                  <th className="px-6 py-4 font-medium">Vendor</th>
                  <th className="px-6 py-4 font-medium">Store</th>
                  <th className="px-6 py-4 font-medium text-right">Days Remaining</th>
                  <th className="px-6 py-4 font-medium text-center">Risk</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {supplyRiskProducts.slice(0, 5).map((p, i) => (
                  <tr key={i} className="hover:bg-slate-50">
                    <td className="px-6 py-4 font-medium text-slate-700">{p.product}</td>
                    <td className="px-6 py-4 font-normal text-slate-500">{p.vendor}</td>
                    <td className="px-6 py-4 font-normal text-slate-500">{p.store}</td>
                    <td className="px-6 py-4 text-right font-semibold text-slate-700">{p.daysRemaining}</td>
                    <td className="px-6 py-4 text-center">
                       <span className={`px-2.5 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider border ${getStatusBadgeStyle(p.risk)}`}>
                        {p.risk}
                      </span>
                    </td>
                  </tr>
                ))}
                {supplyRiskProducts.length === 0 && (
                  <tr>
                    <td colSpan={5} className="px-6 py-8 text-center text-slate-500 font-medium">No products currently at supply risk.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Vendor Delay Impact */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 flex flex-col">
          <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider mb-6">Vendor Delay Impact</h3>
          <div className="flex-1 flex flex-col justify-center space-y-5">
            {vendorDelays.map((v, i) => (
              <div key={i} className="flex flex-col gap-1">
                <div className="flex justify-between items-end">
                  <span className="text-xs font-semibold text-slate-600 uppercase tracking-wide truncate max-w-[150px]">{v.vendor}</span>
                  <span className="text-xs font-semibold text-slate-700">{v.count} <span className="text-slate-400 font-normal">Impacted</span></span>
                </div>
                <div className="w-full bg-slate-100 rounded-full h-1.5 overflow-hidden">
                  <div 
                    className="bg-slate-400 h-1.5 rounded-full" 
                    style={{ width: `${(v.count / maxDelayCount) * 100}%` }}
                  ></div>
                </div>
              </div>
            ))}
            {vendorDelays.length === 0 && (
              <div className="text-center text-slate-500 text-sm font-medium py-8">No current vendor delays impacting operations.</div>
            )}
          </div>
        </div>

      </div>

      {/* 5. AI PROCUREMENT RECOMMENDATIONS */}
      <div className="bg-slate-900 rounded-2xl shadow-sm border border-slate-800 p-6 relative overflow-hidden">
        <div className="absolute top-0 right-0 p-8 opacity-5 pointer-events-none">
          <svg className="w-32 h-32 text-white" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"/></svg>
        </div>
        <div className="relative z-10">
          <h3 className="text-xs font-bold text-slate-300 uppercase tracking-wider mb-6 flex items-center gap-2">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z"></path></svg>
            AI Procurement Recommendations
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
             {/* Realistic recommendations generated based on earlier conditions */}
             {delayedDeliveries > 0 && (
                <div className="bg-white/10 backdrop-blur-sm border border-white/10 rounded-xl p-4 hover:bg-white/20 transition-colors flex justify-between items-center gap-4">
                  <div className="flex items-start gap-3">
                    <span className="text-emerald-400 mt-1">✔</span>
                    <div>
                      <h4 className="text-white font-bold text-sm mb-1">Follow up with Delayed Vendors</h4>
                      <p className="text-indigo-200 text-xs">There are {delayedDeliveries} delayed deliveries impacting operations.</p>
                    </div>
                  </div>
                  <button className="whitespace-nowrap px-4 py-2 bg-indigo-500 hover:bg-indigo-400 text-white text-xs font-bold rounded-lg shadow-sm transition-colors">Follow Up</button>
                </div>
             )}
             {posAwaitingAction > 0 && (
                <div className="bg-white/10 backdrop-blur-sm border border-white/10 rounded-xl p-4 hover:bg-white/20 transition-colors flex justify-between items-center gap-4">
                  <div className="flex items-start gap-3">
                    <span className="text-emerald-400 mt-1">✔</span>
                    <div>
                      <h4 className="text-white font-bold text-sm mb-1">Approve Pending Purchase Orders</h4>
                      <p className="text-indigo-200 text-xs">You have {posAwaitingAction} purchase orders waiting for your approval.</p>
                    </div>
                  </div>
                  <button className="whitespace-nowrap px-4 py-2 bg-indigo-500 hover:bg-indigo-400 text-white text-xs font-bold rounded-lg shadow-sm transition-colors">Review POs</button>
                </div>
             )}
             {supplyRiskProductsCount > 0 && (
                <div className="bg-white/10 backdrop-blur-sm border border-white/10 rounded-xl p-4 hover:bg-white/20 transition-colors flex justify-between items-center gap-4">
                  <div className="flex items-start gap-3">
                    <span className="text-emerald-400 mt-1">✔</span>
                    <div>
                      <h4 className="text-white font-bold text-sm mb-1">Expedite Supply Risk Replenishments</h4>
                      <p className="text-indigo-200 text-xs">Prioritize replenishment for {supplyRiskProductsCount} products at risk.</p>
                    </div>
                  </div>
                  <button className="whitespace-nowrap px-4 py-2 bg-indigo-500 hover:bg-indigo-400 text-white text-xs font-bold rounded-lg shadow-sm transition-colors">Expedite</button>
                </div>
             )}
             {criticalVendorIssues > 0 && (
                <div className="bg-white/10 backdrop-blur-sm border border-white/10 rounded-xl p-4 hover:bg-white/20 transition-colors flex justify-between items-center gap-4">
                  <div className="flex items-start gap-3">
                    <span className="text-emerald-400 mt-1">✔</span>
                    <div>
                      <h4 className="text-white font-bold text-sm mb-1">Escalate Critical Vendor Issues</h4>
                      <p className="text-indigo-200 text-xs">{criticalVendorIssues} critical vendor issues require immediate escalation.</p>
                    </div>
                  </div>
                  <button className="whitespace-nowrap px-4 py-2 bg-indigo-500 hover:bg-indigo-400 text-white text-xs font-bold rounded-lg shadow-sm transition-colors">Escalate</button>
                </div>
             )}
             {recommendations.slice(0, Math.max(0, 4 - [delayedDeliveries, posAwaitingAction, supplyRiskProductsCount, criticalVendorIssues].filter(x => x > 0).length)).map(rec => (
               <div key={rec.id} className="bg-white/10 backdrop-blur-sm border border-white/10 rounded-xl p-4 hover:bg-white/20 transition-colors flex justify-between items-center gap-4">
                  <div className="flex items-start gap-3">
                    <span className="text-emerald-400 mt-1">✔</span>
                    <div>
                      <h4 className="text-white font-bold text-sm mb-1">{rec.recommendation}</h4>
                      <p className="text-indigo-200 text-xs">{rec.reason}</p>
                    </div>
                  </div>
                  <button className="whitespace-nowrap px-4 py-2 bg-indigo-500 hover:bg-indigo-400 text-white text-xs font-bold rounded-lg shadow-sm transition-colors">{rec.actionLabel}</button>
                </div>
             ))}
          </div>
        </div>
      </div>

    </div>
  );
}
