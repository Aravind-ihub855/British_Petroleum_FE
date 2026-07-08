"use client";

import React from "react";
import { useData } from "@/context/DataContext";

interface KpiDetailViewProps {
  kpiType: string;
  onBack: () => void;
}

const KPI_CONFIGS: Record<string, { title: string; description: string; logic: string; borderColor: string; badgeColor: string }> = {
  vendors_attention: {
    title: "Vendors Needing Attention",
    description: "Vendors with unresolved high-priority issues requiring immediate action",
    logic: "Count of distinct vendors that have at least one issue where Priority is 'High' and Status is not 'Resolved'.",
    borderColor: "border-t-rose-500",
    badgeColor: "bg-rose-50 text-rose-600 border-rose-100",
  },
  pos_awaiting: {
    title: "Purchase Orders Awaiting Action",
    description: "Purchase orders pending approval in the procurement pipeline",
    logic: "Count of all purchase orders where Status is exactly 'Pending Approval'.",
    borderColor: "border-t-orange-500",
    badgeColor: "bg-orange-50 text-orange-600 border-orange-100",
  },
  delayed_deliveries: {
    title: "Delayed Deliveries",
    description: "Orders that are past their expected delivery date or marked as delayed",
    logic: "Count of active purchase orders (excluding Cancelled) that are either explicitly marked as 'Delayed', or are 'Approved'/'In Transit' but their Expected Delivery Date has passed.",
    borderColor: "border-t-red-600",
    badgeColor: "bg-red-50 text-red-600 border-red-100",
  },
  supply_risk: {
    title: "Products at Supply Risk",
    description: "Products with stock below safety threshold and delayed incoming supply",
    logic: "Count of products where Current Stock is below Safety Stock, AND either stock is critically low (< 5) or there is a known delayed incoming supply from the vendor.",
    borderColor: "border-t-amber-500",
    badgeColor: "bg-amber-50 text-amber-600 border-amber-100",
  },
  critical_issues: {
    title: "Critical Vendor Issues",
    description: "High-priority open vendor disputes requiring escalation",
    logic: "Count of individual vendor issues where Priority is 'High' and Status is 'Open'.",
    borderColor: "border-t-rose-600",
    badgeColor: "bg-rose-50 text-rose-600 border-rose-100",
  },
  deliveries_today: {
    title: "Deliveries Due Today",
    description: "Expected deliveries scheduled for today that have not yet been received",
    logic: "Count of active purchase orders where Expected Delivery Date is exactly today, and Status is either 'Approved' or 'In Transit'.",
    borderColor: "border-t-emerald-500",
    badgeColor: "bg-emerald-50 text-emerald-600 border-emerald-100",
  }
};

export default function KpiDetailView({ kpiType, onBack }: KpiDetailViewProps) {
  const { vendors, stores, masterProducts, allInventory, purchaseOrders, vendorIssues, loading } = useData();

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
  const config = KPI_CONFIGS[kpiType] || KPI_CONFIGS.vendors_attention;

  // Helper for status badge styling
  const getBadge = (status: string) => {
    const s = status.toLowerCase();
    if (s.includes("high") || s.includes("delayed") || s.includes("critical"))
      return "bg-rose-50 text-rose-600 border-rose-100";
    if (s.includes("medium") || s.includes("in progress") || s.includes("in transit") || s.includes("pending") || s.includes("approved"))
      return "bg-amber-50 text-amber-600 border-amber-100";
    if (s.includes("low") || s.includes("delivered") || s.includes("resolved"))
      return "bg-emerald-50 text-emerald-600 border-emerald-100";
    return "bg-slate-50 text-slate-600 border-slate-200";
  };

  // ── Data Computations ─────────────────────────────────────

  // 1. Vendors Attention: distinct vendors with unresolved High issues
  const attentionIssues = issues.filter(i => i.priority === "High" && i.status !== "Resolved");
  const attentionVendorIds = Array.from(new Set(attentionIssues.map(i => i.vendorId)));
  const attentionVendors = attentionVendorIds.map(id => {
    const vendor = vendors.find(v => v.id === id);
    const vendorIssueList = attentionIssues.filter(i => i.vendorId === id);
    return {
      id,
      name: vendor?.name || id,
      contact: vendor?.contact || "—",
      email: vendor?.email || "—",
      type: vendor?.type || "—",
      contractStatus: vendor?.contractStatus || "—",
      issueCount: vendorIssueList.length,
      issues: vendorIssueList,
    };
  });

  // 2. POs Awaiting Action
  const posAwaiting = purchaseOrders.filter(po => po.status === "Pending Approval");

  // 3. Delayed Deliveries
  const delayedPOs = purchaseOrders.filter(po =>
    po.status !== "Cancelled" && (
      po.status === "Delayed" ||
      ((po.status === "Approved" || po.status === "In Transit") && po.expectedDeliveryDate < todayStr)
    )
  );

  // 4. Products at Supply Risk
  const supplyRiskProducts: {
    product: string;
    productCode: string;
    vendor: string;
    store: string;
    currentStock: number;
    safetyStock: number;
    risk: string;
  }[] = [];
  if (allInventory.length > 0 && masterProducts.length > 0) {
    allInventory.forEach(inv => {
      const prod = masterProducts.find(p => p.code === inv.code);
      const safetyStock = inv.safetyStockLevel || 20;
      if (prod && inv.currentStock < safetyStock) {
        const vendorDelay = purchaseOrders.find(
          po => po.vendorId === inv.vendorId && po.expectedDeliveryDate < todayStr && po.status !== "Delivered"
        );
        if (inv.currentStock < 5 || vendorDelay) {
          const vendorName = vendors.find(v => v.id === inv.vendorId)?.name || inv.vendorId;
          const storeName = stores.find(s => s.id === inv.storeId)?.name || "Main Store";
          if (!supplyRiskProducts.find(r => r.product === prod.name && r.store === storeName)) {
            supplyRiskProducts.push({
              product: prod.name,
              productCode: prod.code,
              vendor: vendorName,
              store: storeName,
              currentStock: inv.currentStock,
              safetyStock,
              risk: inv.currentStock <= 2 ? "High" : "Medium",
            });
          }
        }
      }
    });
  }
  supplyRiskProducts.sort((a, b) => a.currentStock - b.currentStock);

  // 5. Critical Vendor Issues
  const criticalIssues = issues.filter(i => i.priority === "High" && i.status === "Open");

  // 6. Deliveries Due Today
  const deliveriesToday = purchaseOrders.filter(
    po => po.expectedDeliveryDate === todayStr && 
         (po.status === "Approved" || po.status === "In Transit")
  );

  // Record count for badge
  const recordCount: Record<string, number> = {
    vendors_attention: attentionVendors.length,
    pos_awaiting: posAwaiting.length,
    delayed_deliveries: delayedPOs.length,
    supply_risk: supplyRiskProducts.length,
    critical_issues: criticalIssues.length,
    deliveries_today: deliveriesToday.length,
  };

  // Helper to safely get PO amount
  const getAmount = (po: any) => po.amount || po.totalAmount || 0;

  // Helper to safely get expected items
  const getExpectedItems = (po: any) => {
    if (po.expectedItems !== undefined) return po.expectedItems;
    if (po.items && Array.isArray(po.items)) return po.items.reduce((sum: number, item: any) => sum + (item.quantity || 0), 0);
    return 0;
  };

  // Helper to safely get received items
  const getReceivedItems = (po: any) => {
    if (po.receivedItems !== undefined) return po.receivedItems;
    if (po.status === "Delivered") return getExpectedItems(po);
    return 0;
  };

  // Helper to calculate days overdue
  const daysOverdue = (expectedDate: string): number => {
    const expected = new Date(expectedDate);
    const today = new Date(todayStr);
    const diff = Math.floor((today.getTime() - expected.getTime()) / (1000 * 60 * 60 * 24));
    return diff > 0 ? diff : 0;
  };

  return (
    <div className="space-y-6 animate-fadeIn pb-20">
      {/* Header Card */}
      <div className={`bg-white rounded-3xl border-t-4 ${config.borderColor} border-x border-b border-slate-100 shadow-sm p-6 text-left`}>
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div className="flex items-center gap-4">
            <button
              onClick={onBack}
              className="flex items-center gap-2 px-4 py-2 text-xs font-bold text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors border border-slate-200"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15 19l-7-7 7-7" />
              </svg>
              Back to Dashboard
            </button>
            <div>
              <h2 className="text-sm font-extrabold text-slate-900 tracking-tight uppercase">{config.title}</h2>
              <p className="text-[10px] text-slate-400 font-semibold mt-0.5">{config.description}</p>
              <div className="flex items-start gap-1.5 mt-2 bg-slate-50 border border-slate-200 rounded-md p-2">
                <svg className="w-3.5 h-3.5 text-slate-400 mt-0.5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <p className="text-[9.5px] text-slate-500 font-medium leading-snug">
                  <span className="font-bold text-slate-700">Calculation Basis:</span> {config.logic}
                </p>
              </div>
            </div>
          </div>
          <span className={`px-3 py-1 text-xs font-extrabold rounded-full border ${config.badgeColor}`}>
            {recordCount[kpiType] || 0} Records
          </span>
        </div>
      </div>

      {/* Data Table Card */}
      <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden text-left">
        <div className="overflow-x-auto scrollbar-thin">
          {/* ── Vendors Attention ── */}
          {kpiType === "vendors_attention" && (
            <table className="w-full text-xs text-left">
              <thead className="text-[10px] text-slate-400 uppercase tracking-wider font-extrabold bg-slate-50/50 border-b border-slate-100">
                <tr>
                  <th className="px-6 py-4">Vendor Name</th>
                  <th className="px-6 py-4">Contact Person</th>
                  <th className="px-6 py-4">Email</th>
                  <th className="px-6 py-4">Type</th>
                  <th className="px-6 py-4 text-center">Contract</th>
                  <th className="px-6 py-4 text-center">Open Issues</th>
                  <th className="px-6 py-4">Issue Types</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100/60 font-semibold text-slate-700">
                {attentionVendors.map((v, i) => (
                  <tr key={i} className="hover:bg-slate-50/50 transition-colors">
                    <td className="px-6 py-4 font-bold text-slate-900">{v.name}</td>
                    <td className="px-6 py-4">{v.contact}</td>
                    <td className="px-6 py-4 text-slate-500">{v.email}</td>
                    <td className="px-6 py-4">{v.type}</td>
                    <td className="px-6 py-4 text-center">
                      <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold border ${v.contractStatus === "Active" ? "bg-emerald-50 text-emerald-600 border-emerald-100" : "bg-amber-50 text-amber-600 border-amber-100"}`}>
                        {v.contractStatus}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <span className="px-2 py-0.5 rounded-full text-[9px] font-extrabold bg-rose-50 text-rose-600 border border-rose-100">
                        {v.issueCount}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-slate-500 font-medium">
                      {Array.from(new Set(v.issues.map(issue => issue.issueType))).join(", ")}
                    </td>
                  </tr>
                ))}
                {attentionVendors.length === 0 && (
                  <tr><td colSpan={7} className="px-6 py-12 text-center text-slate-400 font-medium">No vendors currently require attention.</td></tr>
                )}
              </tbody>
            </table>
          )}

          {/* ── POs Awaiting Action ── */}
          {kpiType === "pos_awaiting" && (
            <table className="w-full text-xs text-left">
              <thead className="text-[10px] text-slate-400 uppercase tracking-wider font-extrabold bg-slate-50/50 border-b border-slate-100">
                <tr>
                  <th className="px-6 py-4">PO ID</th>
                  <th className="px-6 py-4">Vendor</th>
                  <th className="px-6 py-4">Order Date</th>
                  <th className="px-6 py-4">Expected Delivery</th>
                  <th className="px-6 py-4 text-right">Amount</th>
                  <th className="px-6 py-4 text-right">Expected Items</th>
                  <th className="px-6 py-4 text-center">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100/60 font-semibold text-slate-700">
                {posAwaiting.map((po, i) => (
                  <tr key={i} className="hover:bg-slate-50/50 transition-colors">
                    <td className="px-6 py-4 font-bold text-slate-900">{po.id}</td>
                    <td className="px-6 py-4">{po.vendorName}</td>
                    <td className="px-6 py-4 text-slate-500">{po.orderDate}</td>
                    <td className="px-6 py-4">{po.expectedDeliveryDate}</td>
                    <td className="px-6 py-4 text-right font-bold">${getAmount(po).toLocaleString()}</td>
                    <td className="px-6 py-4 text-right">{getExpectedItems(po)}</td>
                    <td className="px-6 py-4 text-center">
                      <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold border ${getBadge(po.status)}`}>{po.status}</span>
                    </td>
                  </tr>
                ))}
                {posAwaiting.length === 0 && (
                  <tr><td colSpan={7} className="px-6 py-12 text-center text-slate-400 font-medium">No purchase orders pending approval.</td></tr>
                )}
              </tbody>
            </table>
          )}

          {/* ── Delayed Deliveries ── */}
          {kpiType === "delayed_deliveries" && (
            <table className="w-full text-xs text-left">
              <thead className="text-[10px] text-slate-400 uppercase tracking-wider font-extrabold bg-slate-50/50 border-b border-slate-100">
                <tr>
                  <th className="px-6 py-4">PO ID</th>
                  <th className="px-6 py-4">Vendor</th>
                  <th className="px-6 py-4">Order Date</th>
                  <th className="px-6 py-4">Expected Date</th>
                  <th className="px-6 py-4 text-right">Days Overdue</th>
                  <th className="px-6 py-4 text-right">Amount</th>
                  <th className="px-6 py-4 text-center">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100/60 font-semibold text-slate-700">
                {delayedPOs.map((po, i) => (
                  <tr key={i} className="hover:bg-slate-50/50 transition-colors">
                    <td className="px-6 py-4 font-bold text-slate-900">{po.id}</td>
                    <td className="px-6 py-4">{po.vendorName}</td>
                    <td className="px-6 py-4 text-slate-500">{po.orderDate}</td>
                    <td className="px-6 py-4 text-rose-600 font-bold">{po.expectedDeliveryDate}</td>
                    <td className="px-6 py-4 text-right">
                      <span className="px-2 py-0.5 rounded-full text-[9px] font-extrabold bg-rose-50 text-rose-600 border border-rose-100">
                        {daysOverdue(po.expectedDeliveryDate)}d
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right font-bold">${getAmount(po).toLocaleString()}</td>
                    <td className="px-6 py-4 text-center">
                      <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold border ${getBadge(po.status)}`}>{po.status}</span>
                    </td>
                  </tr>
                ))}
                {delayedPOs.length === 0 && (
                  <tr><td colSpan={7} className="px-6 py-12 text-center text-slate-400 font-medium">No delayed deliveries at this time.</td></tr>
                )}
              </tbody>
            </table>
          )}

          {/* ── Products at Supply Risk ── */}
          {kpiType === "supply_risk" && (
            <table className="w-full text-xs text-left">
              <thead className="text-[10px] text-slate-400 uppercase tracking-wider font-extrabold bg-slate-50/50 border-b border-slate-100">
                <tr>
                  <th className="px-6 py-4">Product</th>
                  <th className="px-6 py-4">Product Code</th>
                  <th className="px-6 py-4">Vendor</th>
                  <th className="px-6 py-4">Store</th>
                  <th className="px-6 py-4 text-right">Current Stock</th>
                  <th className="px-6 py-4 text-right">Safety Stock</th>
                  <th className="px-6 py-4 text-center">Risk Level</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100/60 font-semibold text-slate-700">
                {supplyRiskProducts.map((p, i) => (
                  <tr key={i} className="hover:bg-slate-50/50 transition-colors">
                    <td className="px-6 py-4 font-bold text-slate-900">{p.product}</td>
                    <td className="px-6 py-4 text-slate-500 font-mono text-[10px]">{p.productCode}</td>
                    <td className="px-6 py-4">{p.vendor}</td>
                    <td className="px-6 py-4">{p.store}</td>
                    <td className="px-6 py-4 text-right font-bold text-rose-600">{p.currentStock}</td>
                    <td className="px-6 py-4 text-right text-slate-500">{p.safetyStock}</td>
                    <td className="px-6 py-4 text-center">
                      <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold border ${getBadge(p.risk)}`}>{p.risk}</span>
                    </td>
                  </tr>
                ))}
                {supplyRiskProducts.length === 0 && (
                  <tr><td colSpan={7} className="px-6 py-12 text-center text-slate-400 font-medium">No products currently at supply risk.</td></tr>
                )}
              </tbody>
            </table>
          )}

          {/* ── Critical Vendor Issues ── */}
          {kpiType === "critical_issues" && (
            <table className="w-full text-xs text-left">
              <thead className="text-[10px] text-slate-400 uppercase tracking-wider font-extrabold bg-slate-50/50 border-b border-slate-100">
                <tr>
                  <th className="px-6 py-4">Issue ID</th>
                  <th className="px-6 py-4">Vendor</th>
                  <th className="px-6 py-4">Issue Type</th>
                  <th className="px-6 py-4">Date Reported</th>
                  <th className="px-6 py-4">Assigned To</th>
                  <th className="px-6 py-4 text-center">Priority</th>
                  <th className="px-6 py-4 text-center">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100/60 font-semibold text-slate-700">
                {criticalIssues.map((issue, i) => (
                  <tr key={i} className="hover:bg-slate-50/50 transition-colors">
                    <td className="px-6 py-4 font-bold text-slate-900">{issue.id}</td>
                    <td className="px-6 py-4">{issue.vendorName}</td>
                    <td className="px-6 py-4">{issue.issueType}</td>
                    <td className="px-6 py-4 text-slate-500">{issue.dateReported}</td>
                    <td className="px-6 py-4">{issue.assignedTo}</td>
                    <td className="px-6 py-4 text-center">
                      <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold border ${getBadge(issue.priority)}`}>{issue.priority}</span>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold border ${getBadge(issue.status)}`}>{issue.status}</span>
                    </td>
                  </tr>
                ))}
                {criticalIssues.length === 0 && (
                  <tr><td colSpan={7} className="px-6 py-12 text-center text-slate-400 font-medium">No critical vendor issues at this time.</td></tr>
                )}
              </tbody>
            </table>
          )}

          {/* ── Deliveries Due Today ── */}
          {kpiType === "deliveries_today" && (
            <table className="w-full text-xs text-left">
              <thead className="text-[10px] text-slate-400 uppercase tracking-wider font-extrabold bg-slate-50/50 border-b border-slate-100">
                <tr>
                  <th className="px-6 py-4">PO ID</th>
                  <th className="px-6 py-4">Vendor</th>
                  <th className="px-6 py-4">Order Date</th>
                  <th className="px-6 py-4 text-right">Amount</th>
                  <th className="px-6 py-4 text-right">Expected Items</th>
                  <th className="px-6 py-4 text-right">Received Items</th>
                  <th className="px-6 py-4 text-center">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100/60 font-semibold text-slate-700">
                {deliveriesToday.map((po, i) => (
                  <tr key={i} className="hover:bg-slate-50/50 transition-colors">
                    <td className="px-6 py-4 font-bold text-slate-900">{po.id}</td>
                    <td className="px-6 py-4">{po.vendorName}</td>
                    <td className="px-6 py-4 text-slate-500">{po.orderDate}</td>
                    <td className="px-6 py-4 text-right font-bold">${getAmount(po).toLocaleString()}</td>
                    <td className="px-6 py-4 text-right">{getExpectedItems(po)}</td>
                    <td className="px-6 py-4 text-right">{getReceivedItems(po)}</td>
                    <td className="px-6 py-4 text-center">
                      <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold border ${getBadge(po.status)}`}>{po.status}</span>
                    </td>
                  </tr>
                ))}
                {deliveriesToday.length === 0 && (
                  <tr><td colSpan={7} className="px-6 py-12 text-center text-slate-400 font-medium">No deliveries expected today.</td></tr>
                )}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
}
