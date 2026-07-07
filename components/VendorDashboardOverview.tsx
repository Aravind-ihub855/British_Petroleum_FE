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
        issues: [],
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

  const { purchaseOrders, purchaseRequests, issues, activities, recommendations } = procurement;

  const todayStr = new Date().toISOString().split("T")[0];

  // 1. EXECUTIVE KPI CARDS
  const activeVendors = vendors.filter(v => v.contractStatus === "Active").length;
  const openPOs = purchaseOrders.filter(po => po.status !== "Delivered" && po.status !== "Cancelled");
  const openPOCount = openPOs.length;
  const deliveriesDueToday = purchaseOrders.filter(po => po.expectedDeliveryDate === todayStr).length;
  const mtdSpend = purchaseOrders.reduce((sum, po) => sum + po.amount, 0);
  const criticalIssues = issues.filter(i => i.priority === "High" && i.status !== "Resolved").length;

  const deliveredPOsArr = purchaseOrders.filter(po => po.status === "Delivered");
  
  const totalDeliveredExpected = deliveredPOsArr.reduce((sum, po) => sum + po.expectedItems, 0);
  const totalReceivedItems = deliveredPOsArr.reduce((sum, po) => sum + po.receivedItems, 0);
  const avgFillRate = totalDeliveredExpected > 0 ? Math.round((totalReceivedItems / totalDeliveredExpected) * 100) : 0;

  const totalOnTimePOs = deliveredPOsArr.filter(po => po.actualDeliveryDate && po.actualDeliveryDate <= po.expectedDeliveryDate).length;
  const avgOnTime = deliveredPOsArr.length > 0 ? Math.round((totalOnTimePOs / deliveredPOsArr.length) * 100) : 0;

  // VENDOR PERFORMANCE CALCULATION
  const vendorStats = new Map<string, { spend: number, totalPOs: number, onTimePOs: number, expectedItems: number, receivedItems: number, openPOs: number, name: string }>();

  purchaseOrders.forEach(po => {
    if (!vendorStats.has(po.vendorId)) {
      vendorStats.set(po.vendorId, { spend: 0, totalPOs: 0, onTimePOs: 0, expectedItems: 0, receivedItems: 0, openPOs: 0, name: po.vendorName });
    }
    const stat = vendorStats.get(po.vendorId)!;
    stat.spend += po.amount;
    
    if (po.status !== "Delivered" && po.status !== "Cancelled") {
      stat.openPOs += 1;
    }

    if (po.status === "Delivered") {
      stat.totalPOs += 1;
      stat.expectedItems += po.expectedItems;
      stat.receivedItems += po.receivedItems;
      if (po.actualDeliveryDate && po.actualDeliveryDate <= po.expectedDeliveryDate) {
        stat.onTimePOs += 1;
      }
    }
  });

  const vendorPerformanceData = Array.from(vendorStats.values()).map(stat => {
    const onTime = stat.totalPOs > 0 ? (stat.onTimePOs / stat.totalPOs) * 100 : 0;
    const fillRate = stat.expectedItems > 0 ? (stat.receivedItems / stat.expectedItems) * 100 : 0;
    const score = Math.round((onTime * 0.6) + (fillRate * 0.4));
    
    let status = "Needs Attention";
    if (score > 95) status = "Excellent";
    else if (score >= 90) status = "Good";
    else if (score >= 80) status = "Average";

    return {
      name: stat.name,
      score,
      onTime: `${Math.round(onTime)}%`,
      fill: `${Math.round(fillRate)}%`,
      spend: `$${(stat.spend / 1000).toFixed(1)}K`,
      openPOs: stat.openPOs,
      status,
      rawOnTime: onTime
    };
  }).sort((a, b) => b.score - a.score);

  const validVendorScores = vendorPerformanceData.filter(v => v.rawOnTime > 0 || v.fill !== "0%");
  const avgScore = validVendorScores.length > 0 ? Math.round(validVendorScores.reduce((sum, v) => sum + v.score, 0) / validVendorScores.length) : 0;

  // ACTION CENTER AGGREGATION
  const awaitingApproval = openPOs.filter(p => p.status === "Pending Approval").length;
  const delayedShipments = issues.filter(i => i.issueType.toLowerCase().includes("delay") && i.status !== "Resolved");
  const slaMisses = vendorPerformanceData.filter(v => v.rawOnTime < 90 && v.rawOnTime > 0);
  const deliveredToday = purchaseOrders.filter(p => p.status === "Delivered" && p.actualDeliveryDate === todayStr).length;

  const actionAlerts = [];
  if (awaitingApproval > 0) actionAlerts.push({ type: "critical", title: "Approvals Needed", text: `${awaitingApproval} Purchase Orders awaiting approval` });

  // NEW LOGIC FOR RISKS AND SAVINGS
  const performanceLogs = calculateVendorPerformanceMetrics(vendors, masterProducts);

  // Dynamic Savings Opportunities using real DB inventory data vs master product price
  const savingsOpps: any[] = [];
  masterProducts.forEach(p => {
    const productInv = allInventory.filter(inv => inv.code === p.code);
    // Find unique suppliers and their pricing
    const supplierPrices = new Map<string, number>();
    productInv.forEach(inv => {
      // Assuming inv.unitPrice could be the cost price from the supplier, we compare to a market rate
      if (inv.unitPrice < p.unitPrice) {
        supplierPrices.set(inv.supplier, inv.unitPrice);
      }
    });

    supplierPrices.forEach((cost, supplier) => {
      savingsOpps.push({
        product: p.name,
        vendor: supplier,
        marketPrice: p.unitPrice,
        savings: p.unitPrice - cost
      });
    });
  });
  savingsOpps.sort((a, b) => b.savings - a.savings);

  // Dynamic Single Vendor Risk Alerts using real DB inventory data
  const riskAlerts: any[] = [];
  masterProducts.forEach(p => {
    const productInv = allInventory.filter(inv => inv.code === p.code);
    const uniqueSuppliers = new Set(productInv.map(inv => inv.supplier).filter(Boolean));
    if (uniqueSuppliers.size === 1) {
      riskAlerts.push({
        product: p.name,
        vendor: Array.from(uniqueSuppliers)[0],
      });
    }
  });

  delayedShipments.slice(0, 2).forEach(i => actionAlerts.push({ type: "critical", title: "Delayed Shipment", text: `${i.vendorName} delayed shipment` }));
  if (deliveriesDueToday > 0) actionAlerts.push({ type: "warning", title: "Deliveries Today", text: `${deliveriesDueToday} deliveries arriving today` });
  slaMisses.slice(0, 2).forEach(v => actionAlerts.push({ type: "warning", title: "SLA Below Target", text: `${v.name} SLA below target` }));
  if (deliveredToday > 0) actionAlerts.push({ type: "success", title: "Successfully Delivered", text: `${deliveredToday} Purchase Orders delivered successfully` });

  // PO STATUS (6 Categories)
  const totalPOs = purchaseOrders.length || 1;
  const poStatuses = [
    { label: "Pending Approval", count: purchaseOrders.filter(po => po.status === "Pending Approval").length, color: "#f59e0b" },
    { label: "Approved", count: purchaseOrders.filter(po => po.status === "Approved").length, color: "#3b82f6" },
    { label: "In Transit", count: purchaseOrders.filter(po => po.status === "In Transit").length, color: "#6366f1" },
    { label: "Delivered", count: purchaseOrders.filter(po => po.status === "Delivered").length, color: "#10b981" },
    { label: "Delayed", count: purchaseOrders.filter(po => po.status === "Delayed").length, color: "#f43f5e" },
    { label: "Cancelled", count: purchaseOrders.filter(po => po.status === "Cancelled").length, color: "#64748b" },
  ];

  let currentOffset = 0;
  const poSegments = poStatuses.map(s => {
    const len = (s.count / totalPOs) * 251.3;
    const offset = currentOffset;
    currentOffset -= len;
    return { ...s, len, offset };
  });

  // DELIVERY PERFORMANCE GRAPH (Last 30 Days)
  const now = new Date();
  const graphData = [];
  for (let i = 29; i >= 0; i--) {
    const d = new Date(now);
    d.setDate(now.getDate() - i);
    const dateStr = d.toISOString().split("T")[0];
    
    const dayPOs = purchaseOrders.filter(po => po.status === "Delivered" && po.actualDeliveryDate === dateStr);
    let onTimeCount = 0;
    let delayedCount = 0;
    const vendorDelays = new Map<string, number>();
    
    dayPOs.forEach(po => {
      if (po.actualDeliveryDate && po.actualDeliveryDate <= po.expectedDeliveryDate) {
        onTimeCount++;
      } else {
        delayedCount++;
        vendorDelays.set(po.vendorName, (vendorDelays.get(po.vendorName) || 0) + 1);
      }
    });

    let worstV = "";
    let worstC = 0;
    for (const [v, c] of vendorDelays.entries()) {
      if (c > worstC) { worstC = c; worstV = v; }
    }
    
    graphData.push({ 
      date: dateStr, 
      onTime: onTimeCount, 
      delayed: delayedCount, 
      label: `${d.toLocaleString('en-US', {month:'short'})} ${d.getDate()}`,
      worstVendor: worstV
    });
  }
  
  const maxGraphY = Math.max(1, ...graphData.map(g => Math.max(g.onTime, g.delayed)));
  const pathOnTime = `M ${graphData.map((g, i) => `${(i / 29) * 100},${100 - (g.onTime / maxGraphY) * 80}`).join(" L ")}`;
  const pathDelayed = `M ${graphData.map((g, i) => `${(i / 29) * 100},${100 - (g.delayed / maxGraphY) * 80}`).join(" L ")}`;

  // DELIVERY INSIGHT
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
  const thirtyDaysAgoStr = thirtyDaysAgo.toISOString().split("T")[0];

  const recentDelays = purchaseOrders.filter(po => 
    po.status === "Delivered" && 
    po.actualDeliveryDate && 
    po.actualDeliveryDate > po.expectedDeliveryDate &&
    po.actualDeliveryDate >= thirtyDaysAgoStr
  );

  let worstVendor = "";
  let worstCount = 0;
  if (recentDelays.length > 0) {
    const delayCounts = new Map<string, number>();
    recentDelays.forEach(po => {
      delayCounts.set(po.vendorName, (delayCounts.get(po.vendorName) || 0) + 1);
    });
    for (const [v, c] of delayCounts.entries()) {
      if (c > worstCount) {
        worstCount = c;
        worstVendor = v;
      }
    }
  }

  const delayInsight = worstVendor 
    ? `Late deliveries spiked recently. ${worstVendor} is responsible for ${Math.round((worstCount / recentDelays.length) * 100)}% of all delays in the last 30 days.` 
    : `Delivery performance is stable. No significant vendor delays recently.`;

  // INVENTORY RISK DYNAMIC CALCULATION
  const dynamicRisk: any[] = [];
  if (allInventory.length > 0 && masterProducts.length > 0) {
    allInventory.forEach(inv => {
      const prod = masterProducts.find(p => p.id === inv.productId || p.code === inv.productCode);
      if (prod && inv.quantity < 20) {
        let riskLevel = "Low";
        if (inv.quantity < 5) riskLevel = "High";
        else if (inv.quantity < 10) riskLevel = "Medium";
        
        // Ensure no duplicates by product name
        if (!dynamicRisk.find(r => r.prod === prod.name)) {
          dynamicRisk.push({
            prod: prod.name,
            vendor: inv.supplier || "Unknown",
            days: inv.quantity, // Estimate days left based on quantity
            risk: riskLevel
          });
        }
      }
    });
  }
  
  const riskList = dynamicRisk.sort((a, b) => a.days - b.days).slice(0, 5);

  // Standard Colors
  const statusLevel = (status: string): "critical" | "warning" | "success" | "neutral" => {
    const s = status.toLowerCase();
    if (["high", "delayed", "needs attention", "cancelled", "rejected", "out of stock", "❌"].includes(s)) return "critical";
    if (["medium", "pending", "pending approval", "in transit", "in progress", "average", "low stock"].includes(s)) return "warning";
    if (["low", "approved", "delivered", "resolved", "excellent", "good", "available", "✅", "open"].includes(s)) return "success";
    return "neutral";
  };

  const badgeStyles = {
    critical: "bg-rose-50 text-rose-600 border border-rose-200",
    warning: "bg-amber-50 text-amber-700 border border-amber-200",
    success: "bg-emerald-50 text-emerald-700 border border-emerald-200",
    neutral: "bg-slate-50 text-slate-600 border border-slate-200",
  };

  const dotStyles = {
    critical: "bg-rose-500",
    warning: "bg-amber-500",
    success: "bg-emerald-500",
    neutral: "bg-slate-400",
  };

  return (
    <div className="space-y-6 animate-fade-in pb-12">
      {/* 1. EXECUTIVE KPI CARDS */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-3">
        {[
          { label: "Active Vendors", value: activeVendors },
          { label: "Open POs", value: openPOCount },
          { label: "Due Today", value: deliveriesDueToday },
          { label: "On-Time Delivery", value: `${avgOnTime}%` },
          { label: "Fill Rate", value: `${avgFillRate}%` },
          { label: "MTD Spend", value: `$${(mtdSpend / 1000).toFixed(1)}k` },
          { label: "Avg Vendor Score", value: avgScore },
          { label: "Critical Issues", value: criticalIssues },
        ].map((kpi, idx) => (
          <div key={idx} className="bg-white border border-slate-200/80 rounded-xl p-3 shadow-sm flex flex-col justify-between h-24">
            <span className="text-[9px] font-bold uppercase tracking-wider text-slate-500">{kpi.label}</span>
            <span className="text-xl font-black tracking-tight text-slate-900">{kpi.value}</span>
          </div>
        ))}
      </div>

      {/* 2. RISK ALERTS & SAVINGS OPPORTUNITIES */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Single Vendor Risk Alerts */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm flex flex-col justify-between">
          <div>
            <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider mb-4 border-b border-slate-100 pb-2">Single-Vendor Risk Alerts</h3>
            <div className="space-y-3">
              {riskAlerts.slice(0, 3).map((alert, idx) => (
                <div key={idx} className="p-4 bg-rose-50 border border-rose-100 rounded-xl flex items-start gap-3">
                  <div className={`mt-1 flex-shrink-0 w-2.5 h-2.5 rounded-full shadow-sm bg-rose-500`} />
                  <div>
                    <h4 className="text-xs font-bold text-rose-800">{alert.product} dependency</h4>
                    <p className="text-[11px] text-rose-600 mt-1 leading-relaxed">
                      Dependent solely on {alert.vendor}. Immediate backup distributor onboarding recommended.
                    </p>
                  </div>
                </div>
              ))}
              {riskAlerts.length === 0 && (
                <p className="text-xs text-slate-500 italic p-4">No single-vendor dependencies found.</p>
              )}
            </div>
          </div>
        </div>

        {/* Procurement & Savings Opportunities */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm flex flex-col justify-between">
          <div>
            <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider mb-4 border-b border-slate-100 pb-2">Procurement & Savings Opportunities</h3>
            <div className="space-y-3">
              {savingsOpps.slice(0, 3).map((opp, idx) => (
                <div key={idx} className="p-4 bg-emerald-50 border border-emerald-100 rounded-xl flex items-center justify-between">
                  <div>
                    <h4 className="text-xs font-bold text-emerald-900 mb-0.5">{opp.product}</h4>
                    <span className="text-[10px] font-medium text-emerald-700">Market Price: ${opp.marketPrice.toFixed(2)} / Unit</span>
                  </div>
                  <div className="text-right">
                    <span className="text-sm font-black text-emerald-600 block">${opp.savings.toFixed(2)} / Unit Savings</span>
                    <span className="text-[9px] font-bold text-emerald-700 uppercase block mt-1">{opp.vendor} contract ready</span>
                  </div>
                </div>
              ))}
              {savingsOpps.length === 0 && (
                <p className="text-xs text-slate-500 italic p-4">No immediate savings opportunities identified.</p>
              )}
            </div>
          </div>
        </div>

      </div>

      {/* ROW: VENDOR PERFORMANCE & PO STATUS */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* 4. VENDOR CAPABILITY METRICS (Replacing Vendor Performance) */}
        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden flex flex-col lg:col-span-2">
          <div className="p-4 border-b border-slate-100 flex justify-between items-center bg-slate-50">
            <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider">Vendor Capability Metrics</h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead className="bg-white text-slate-400 tracking-wider font-semibold border-b border-slate-100">
                <tr>
                  <th className="py-3 px-4 uppercase">Vendor</th>
                  <th className="py-3 px-4 uppercase">Product</th>
                  <th className="py-3 px-4 text-center uppercase">Cost Score</th>
                  <th className="py-3 px-4 text-center uppercase">Quality Score</th>
                  <th className="py-3 px-4 text-center uppercase">Delivery Lead Time</th>
                  <th className="py-3 px-4 text-center uppercase">Overall Score</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {performanceLogs.slice(0, 5).map((row, idx) => (
                  <tr key={idx} className="hover:bg-slate-50 transition-colors">
                    <td className="py-3 px-4 font-bold text-slate-700">{row.vendor}</td>
                    <td className="py-3 px-4 font-medium text-slate-500">{row.product}</td>
                    <td className="py-3 px-4 text-center font-bold text-slate-700">{row.costScore}</td>
                    <td className="py-3 px-4 text-center font-bold text-slate-700">{row.qualityScore}</td>
                    <td className="py-3 px-4 text-center font-medium text-slate-500">{row.deliveryTime}</td>
                    <td className="py-3 px-4 text-center">
                      <span className={`px-2 py-1 rounded-md text-[10px] font-bold ${
                        row.overallScore >= 9.0 ? "bg-emerald-100 text-emerald-700" :
                        row.overallScore >= 8.0 ? "bg-amber-100 text-amber-700" :
                        "bg-rose-100 text-rose-700"
                      }`}>
                        {row.overallScore}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* 4. PO STATUS DONUT */}
        <div className="bg-white border border-slate-200/80 rounded-2xl shadow-sm p-5 flex flex-col justify-between">
          <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider mb-4">Purchase Order Status</h3>
          <div className="flex flex-col items-center justify-around flex-grow gap-6">
            <div className="relative w-32 h-32 flex-shrink-0">
              <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
                <circle cx="50" cy="50" r="40" stroke="#f1f5f9" strokeWidth="12" fill="transparent" />
                {poSegments.map((seg, i) => seg.len > 0 && (
                  <circle key={i} cx="50" cy="50" r="40" stroke={seg.color} strokeWidth="12" strokeDasharray={`${seg.len} 251.3`} strokeDashoffset={seg.offset} fill="transparent" />
                ))}
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-xl font-bold text-slate-900">{totalPOs}</span>
                <span className="text-[9px] text-slate-400 font-bold uppercase tracking-wider">Total POs</span>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-x-4 gap-y-2 text-[10px] font-semibold w-full">
              {poSegments.map((seg, i) => (
                <div key={i} className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5"><div className="w-2 h-2 rounded-full" style={{ backgroundColor: seg.color }}></div><span className="text-slate-600 truncate max-w-[70px]">{seg.label}</span></div>
                  <span className="text-slate-900 font-bold">{seg.count}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* ROW: DELIVERY PERFORMANCE & INVENTORY RISK */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* 5. DELIVERY PERFORMANCE TREND */}
        <div className="bg-white border border-slate-200/80 rounded-2xl shadow-sm p-5 lg:col-span-2 flex flex-col justify-between">
          <div>
            <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider mb-2">Delivery Performance Trend (Last 30 Days)</h3>
            <div className="flex items-center gap-4 text-[10px] font-semibold text-slate-400 mb-4">
              <span className="flex items-center gap-1.5"><div className={`w-2 h-2 rounded-full ${dotStyles.success}`}></div> On-Time Deliveries</span>
              <span className="flex items-center gap-1.5"><div className={`w-2 h-2 rounded-full ${dotStyles.critical}`}></div> Delayed Deliveries</span>
            </div>
          </div>
          
          <div className="w-full h-32 relative flex items-end justify-between px-2 mb-2">
            {/* SVG Line Chart */}
            <svg className="absolute inset-0 w-full h-full" preserveAspectRatio="none" viewBox="0 0 100 100">
              <path d={pathOnTime} fill="none" stroke="#10b981" strokeWidth="2.5" vectorEffect="non-scaling-stroke" strokeLinecap="round" strokeLinejoin="round" />
              <path d={pathDelayed} fill="none" stroke="#f43f5e" strokeWidth="2" vectorEffect="non-scaling-stroke" strokeLinecap="round" strokeLinejoin="round" strokeDasharray="4 4" />
            </svg>
            {/* Chart Grid Lines & Y-Axis */}
            <div className="absolute inset-0 flex flex-col justify-between pointer-events-none">
              <div className="w-full flex items-center gap-2">
                <span className="text-[8px] font-bold text-slate-400 w-4 text-right">{maxGraphY}</span>
                <div className="border-t border-slate-200 flex-grow opacity-50" />
              </div>
              <div className="w-full flex items-center gap-2">
                <span className="text-[8px] font-bold text-slate-400 w-4 text-right">{Math.round(maxGraphY / 2)}</span>
                <div className="border-t border-slate-200 flex-grow opacity-50" />
              </div>
              <div className="w-full flex items-center gap-2">
                <span className="text-[8px] font-bold text-slate-400 w-4 text-right">0</span>
                <div className="border-t border-slate-200 flex-grow opacity-50" />
              </div>
            </div>
            
            {/* INTERACTIVE HOVER COLUMNS */}
            <div className="absolute inset-0 flex">
              {graphData.map((g, i) => (
                <div key={i} className="h-full flex-grow relative group cursor-pointer">
                  {/* Hover Highlight */}
                  <div className="absolute inset-0 opacity-0 group-hover:opacity-100 bg-slate-900/5 transition-opacity" />
                  
                  {/* Tooltip */}
                  <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 hidden group-hover:flex flex-col bg-slate-900 text-white text-[10px] p-2.5 rounded-lg shadow-xl z-20 w-32 pointer-events-none transform origin-bottom scale-95 group-hover:scale-100 transition-transform">
                    <span className="font-bold border-b border-slate-700 pb-1.5 mb-1.5">{g.label}</span>
                    <div className="flex justify-between items-center mb-1">
                      <span className="text-emerald-400 font-semibold">On-Time</span>
                      <span className="font-bold">{g.onTime}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-rose-400 font-semibold">Delayed</span>
                      <span className="font-bold">{g.delayed}</span>
                    </div>
                    {g.delayed > 0 && g.worstVendor && (
                      <div className="mt-2 pt-1.5 border-t border-slate-700 leading-tight">
                        <span className="text-slate-400 text-[8px] uppercase tracking-wider block">Main Delay Source:</span>
                        <span className="text-slate-200 font-bold truncate block">{g.worstVendor}</span>
                      </div>
                    )}
                    {/* Tooltip Arrow */}
                    <div className="absolute top-full left-1/2 -translate-x-1/2 -mt-1 border-4 border-transparent border-t-slate-900" />
                  </div>
                </div>
              ))}
            </div>
          </div>
          <div className="flex justify-between text-[9px] font-bold text-slate-400 uppercase pl-6 mb-5">
            <span>{graphData[0].label}</span>
            <span>{graphData[14].label}</span>
            <span>{graphData[29].label}</span>
          </div>

          <div className="bg-slate-50 border border-slate-100 rounded-xl p-3 flex items-start gap-3 mt-auto">
            <span className="text-lg">💡</span>
            <div>
              <h4 className="text-[10px] font-bold text-slate-800 uppercase tracking-wider mb-0.5">AI Insight</h4>
              <p className="text-xs font-medium text-slate-600">{delayInsight}</p>
            </div>
          </div>
        </div>

        {/* 6. INVENTORY RISK */}
        <div className="bg-white border border-slate-200/80 rounded-2xl shadow-sm flex flex-col">
          <div className="p-4 border-b border-slate-100">
            <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider">Inventory Risk Due to Vendor Delays</h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-slate-50/50 text-slate-400 font-bold uppercase border-b border-slate-100">
                  <th className="px-4 py-3">Product</th>
                  <th className="px-4 py-3">Vendor</th>
                  <th className="px-4 py-3 text-center">Days left</th>
                  <th className="px-4 py-3 text-center">Risk</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium text-slate-600">
                {riskList.map((r, i) => (
                  <tr key={i}>
                    <td className="px-4 py-3 font-semibold text-slate-900">{r.prod}</td>
                    <td className="px-4 py-3 truncate max-w-[80px]" title={r.vendor}>{r.vendor}</td>
                    <td className="px-4 py-3 text-center font-bold">{r.days}</td>
                    <td className="px-4 py-3 text-center">
                      <span className={`px-2 py-0.5 rounded text-[9px] font-bold uppercase tracking-wide ${badgeStyles[statusLevel(r.risk)]}`}>{r.risk}</span>
                    </td>
                  </tr>
                ))}
                {riskList.length === 0 && (
                  <tr>
                    <td colSpan={4} className="px-4 py-6 text-center text-slate-500 italic">No inventory risk detected.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* ROW: PENDING PRS & PRODUCT AVAILABILITY */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* 7. PENDING PURCHASE REQUESTS */}
        <div className="bg-white border border-slate-200/80 rounded-2xl shadow-sm flex flex-col lg:col-span-2">
          <div className="p-4 border-b border-slate-100">
            <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider">Pending Purchase Requests</h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-slate-50/50 text-slate-400 font-bold uppercase border-b border-slate-100">
                  <th className="px-4 py-3">PR Number</th>
                  <th className="px-4 py-3">Store</th>
                  <th className="px-4 py-3 text-center">Priority</th>
                  <th className="px-4 py-3 text-right">Amount</th>
                  <th className="px-4 py-3 text-center">Requested Date</th>
                  <th className="px-4 py-3 text-center">Status</th>
                  <th className="px-4 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium text-slate-600">
                {purchaseRequests.slice(0, 4).map((pr, i) => (
                  <tr key={i}>
                    <td className="px-4 py-3 font-semibold text-slate-900">{pr.id}</td>
                    <td className="px-4 py-3 truncate max-w-[120px]">{pr.storeName}</td>
                    <td className="px-4 py-3 text-center">
                      <span className={`px-2 py-0.5 rounded text-[9px] font-bold uppercase tracking-wide ${badgeStyles[statusLevel(pr.priority)]}`}>{pr.priority}</span>
                    </td>
                    <td className="px-4 py-3 text-right">${pr.amount}</td>
                    <td className="px-4 py-3 text-center">{pr.requestedDate}</td>
                    <td className="px-4 py-3 text-center font-bold">{pr.status}</td>
                    <td className="px-4 py-3 text-right flex gap-1 justify-end">
                      <button className="text-[9px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-1 rounded hover:bg-emerald-100">Approve</button>
                      <button className="text-[9px] font-bold text-rose-700 bg-rose-50 border border-rose-200 px-2 py-1 rounded hover:bg-rose-100">Reject</button>
                      <button className="text-[9px] font-bold text-blue-700 bg-blue-50 border border-blue-200 px-2 py-1 rounded hover:bg-blue-100">Convert to PO</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* 8. PRODUCT AVAILABILITY DONUT */}
        <div className="bg-white border border-slate-200/80 rounded-2xl shadow-sm p-5 flex flex-col justify-between">
          <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider mb-4">Product Availability</h3>
          <div className="flex items-center justify-around flex-grow gap-4">
            <div className="relative w-32 h-32 flex-shrink-0">
              <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
                <circle cx="50" cy="50" r="40" stroke="#f1f5f9" strokeWidth="12" fill="transparent" />
                <circle cx="50" cy="50" r="40" stroke="#10b981" strokeWidth="12" strokeDasharray="206 251.3" strokeDashoffset="0" fill="transparent" />
                <circle cx="50" cy="50" r="40" stroke="#f59e0b" strokeWidth="12" strokeDasharray="32 251.3" strokeDashoffset="-206" fill="transparent" />
                <circle cx="50" cy="50" r="40" stroke="#f43f5e" strokeWidth="12" strokeDasharray="13.3 251.3" strokeDashoffset="-238" fill="transparent" />
              </svg>
            </div>
            <div className="flex flex-col gap-2.5 text-xs font-semibold">
              <div className="flex items-center justify-between gap-4">
                <div className="flex items-center gap-2"><div className={`w-3 h-3 rounded-full ${dotStyles.success}`}></div><span className="text-slate-600">Available</span></div>
                <span className="font-bold text-slate-900">82%</span>
              </div>
              <div className="flex items-center justify-between gap-4">
                <div className="flex items-center gap-2"><div className={`w-3 h-3 rounded-full ${dotStyles.warning}`}></div><span className="text-slate-600">Low Stock</span></div>
                <span className="font-bold text-slate-900">13%</span>
              </div>
              <div className="flex items-center justify-between gap-4">
                <div className="flex items-center gap-2"><div className={`w-3 h-3 rounded-full ${dotStyles.critical}`}></div><span className="text-slate-600">Out of Stock</span></div>
                <span className="font-bold text-slate-900">5%</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ROW: SLA COMPLIANCE & ISSUE TRACKER */}
      {/* REMOVED SLA COMPLIANCE & ISSUE TRACKER */}

      {/* ROW: AI RECS & ACTIVITIES */}
      <div className="grid grid-cols-1 gap-6">
        
        {/* 11. AI PROCUREMENT RECOMMENDATIONS */}
        <div className="bg-white border border-slate-200/80 rounded-2xl shadow-sm flex flex-col overflow-hidden">
          <div className="p-4 border-b border-slate-100 bg-slate-50">
            <div className="flex items-center gap-2">
              <svg className="w-4 h-4 text-slate-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
              <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider">AI Procurement Recommendations</h3>
            </div>
          </div>
          <div className="p-3 space-y-2 max-h-80 overflow-y-auto">
            {recommendations.map((rec) => (
              <div key={rec.id} className="p-3 bg-white border border-slate-100 hover:border-slate-200 transition-all rounded-xl shadow-sm flex justify-between items-center">
                <div>
                  <div className="flex items-center gap-2 mb-1.5">
                    <span className={`px-2 py-0.5 rounded text-[9px] font-bold uppercase tracking-wide ${badgeStyles[statusLevel(rec.priority)]}`}>{rec.priority}</span>
                    <h4 className="text-xs font-bold text-slate-900">{rec.recommendation}</h4>
                  </div>
                  <p className="text-[10px] text-slate-500 font-medium">{rec.reason}</p>
                </div>
                <button className="text-[10px] font-bold px-3 py-1.5 rounded-lg bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 shadow-sm transition-colors flex-shrink-0">
                  {rec.actionLabel}
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>

    </div>
  );
}
