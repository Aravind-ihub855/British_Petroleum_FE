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
  const { vendors, masterProducts, loading } = useData();
  
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

  // Tab 1 overview metrics
  const performanceLogs = calculateVendorPerformanceMetrics(vendors, masterProducts);

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

  // Band calculations
  const vendorBand = vendorOverallScore >= 9.0 ? "A" : vendorOverallScore >= 8.0 ? "B" : "C";

  // Tab 3 Product-wise details
  const activeProduct = masterProducts.find((p) => p.code === selectedProductCode) || masterProducts[0];

  const productVendors = activeProduct ? getVendorsForProductDB(vendors, activeProduct.code) : [];

  // Dynamic alerts
  const vendorCount = productVendors.length;
  const bestValueVendor = productVendors[0];

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
          <div className="grid grid-cols-1 gap-8">
            {/* Overview Table */}
            <div className="bg-white rounded-3xl border-t-4 border-t-bp-green border-x border-b border-slate-100 shadow-sm overflow-hidden text-left w-full card-hover-effect">
              <div className="px-6 py-5 border-b border-slate-50">
                <h3 className="text-xs font-extrabold text-slate-900 uppercase tracking-wider">
                  Vendor Capability Metrics
                </h3>
                <p className="text-[10px] text-slate-400 font-semibold mt-0.5 leading-snug">Summary score ratings of qualified convenience store suppliers</p>
              </div>
              <div className="overflow-x-auto max-h-[500px] scrollbar-thin">
                <table className="w-full text-xs text-left">
                  <thead className="bg-slate-50/50 text-slate-400 font-extrabold tracking-wider uppercase border-b border-slate-50 sticky top-0 z-10 text-[9.5px]">
                    <tr>
                      <th className="py-4 px-6">Vendor</th>
                      <th className="py-4 px-6">Product Category Group</th>
                      <th className="py-4 px-6 text-center">Cost Compliance</th>
                      <th className="py-4 px-6 text-center">Quality Score</th>
                      <th className="py-4 px-6 text-center">Avg Lead Time</th>
                      <th className="py-4 px-6 text-center">Overall Score</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100/60 font-semibold text-slate-700">
                    {performanceLogs.map((row, idx) => (
                      <tr key={idx} className="hover:bg-slate-50/50 transition duration-75">
                        <td className="py-4 px-6 font-bold text-bp-green cursor-pointer hover:text-bp-green-dark"
                          onClick={() => {
                            setSelectedVendorName(row.vendor);
                            setSubTab("vendor_wise");
                          }}
                        >
                          {row.vendor}
                        </td>
                        <td className="py-4 px-6 text-slate-500 font-medium">{row.product}</td>
                        <td className="py-4 px-6 text-center text-slate-655 font-normal">{row.costScore}</td>
                        <td className="py-4 px-6 text-center text-slate-655 font-normal">{row.qualityScore}</td>
                        <td className="py-4 px-6 text-center font-normal text-slate-700">{row.deliveryTime}</td>
                        <td className="py-4 px-6 text-center">
                          <span className={`px-2.5 py-0.5 rounded-full font-bold text-[10.5px] border ${
                            row.overallScore >= 9.0 ? "bg-emerald-50 text-emerald-600 border-emerald-100" :
                            row.overallScore >= 8.5 ? "bg-amber-50 text-amber-600 border-amber-100" :
                            "bg-slate-50 text-slate-400 border-slate-150"
                          }`}>
                            {row.overallScore} / 10
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
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

          {/* Main Table: Products Supplied */}
          <div className="bg-white rounded-3xl border-t-4 border-t-bp-green border-x border-b border-slate-100 shadow-sm overflow-hidden text-left card-hover-effect">
            <div className="px-6 py-5 border-b border-slate-50 flex items-center justify-between">
              <div>
                <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider font-sans">
                  Products Supplied by {activeVendor.name}
                </h3>
                <p className="text-[10px] text-slate-400 font-medium mt-0.5">Summary values of products supplied to target convenience warehouses</p>
              </div>
              <div className="flex gap-2 text-xs font-bold">
                <span className="text-slate-400">YoY score change:</span>
                <span className="text-emerald-600">▲ +4.2%</span>
              </div>
            </div>
            <div className="overflow-x-auto max-h-[500px] scrollbar-thin">
              <table className="w-full text-xs text-left">
                <thead className="bg-slate-50/50 text-slate-400 font-extrabold tracking-wider uppercase border-b border-slate-50 sticky top-0 z-10 text-[9.5px]">
                  <tr>
                    <th className="py-4 px-6">Product</th>
                    <th className="py-4 px-4 text-center">UOM</th>
                    <th className="py-4 px-4 text-center">Category</th>
                    <th className="py-4 px-4 text-right">Unit Cost</th>
                    <th className="py-4 px-4 text-center">vs Market</th>
                    <th className="py-4 px-4 text-center">Lead Time</th>
                    <th className="py-4 px-4 text-center">On-Time</th>
                    <th className="py-4 px-4 text-center">Rejection</th>
                    <th className="py-4 px-4 text-center">Sole Source</th>
                    <th className="py-4 px-4 text-center">FSN Class</th>
                    <th className="py-4 px-6 text-center">Overall Score</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100/60 font-semibold text-slate-700">
                  {vendorProducts.map((row, idx) => (
                    <tr key={idx} className="hover:bg-slate-50/50 transition duration-75">
                      <td className="py-4.5 px-6 font-bold text-bp-green cursor-pointer hover:text-bp-green-dark"
                        onClick={() => {
                          setSelectedProductCode(row.productCode);
                          setSubTab("product_wise");
                        }}
                      >
                        {row.productName}
                      </td>
                      <td className="py-4.5 px-4 text-center text-slate-400 font-medium">{row.uom}</td>
                      <td className="py-4.5 px-4 text-center text-slate-400 font-medium">{row.category}</td>
                      <td className="py-4.5 px-4 text-right text-slate-900">${row.unitCost.toFixed(2)}</td>
                      <td className="py-4.5 px-4 text-center">
                        {(idx % 3 === 0) ? <span className="text-rose-600 font-bold">+$0.15 (+2%)</span> : <span className="text-emerald-600 font-bold">-$0.30 (-4%)</span>}
                      </td>
                      <td className="py-4.5 px-4 text-center text-slate-500 font-medium">{row.deliveryTime}d</td>
                      <td className="py-4.5 px-4 text-center text-slate-700">{row.onTimePercent}%</td>
                      <td className="py-4.5 px-4 text-center text-rose-600">{row.rejectionRate}%</td>
                      <td className="py-4.5 px-4 text-center">
                        <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${row.isSoleSource ? "bg-rose-50 text-rose-600 border-rose-100" : "bg-slate-50 text-slate-400 border-slate-150"}`}>
                          {row.isSoleSource ? "Yes" : "No"}
                        </span>
                      </td>
                      <td className="py-4.5 px-4 text-center">
                        <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${
                          row.fsnClass === "Fast" ? "bg-emerald-50 text-emerald-600 border-emerald-100" :
                          row.fsnClass === "Slow" ? "bg-amber-50 text-amber-600 border-amber-100" :
                          "bg-rose-50 text-rose-600 border-rose-100"
                        }`}>
                          {row.fsnClass}
                        </span>
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
                  ))}
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
                  Product has {vendorCount} active distributors. Recommended cost-efficient source is <span className="font-extrabold text-slate-850 underline">{bestValueVendor?.vendorName}</span>.
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
                  <span className="text-slate-900 font-extrabold mt-1 block">{activeProduct.code === "BP-PROD-001" ? "Fast" : "Slow"}</span>
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
              <table className="w-full text-xs text-left">
                <thead className="bg-slate-50/50 text-slate-400 font-extrabold tracking-wider uppercase border-b border-slate-50 text-[9.5px]">
                  <tr>
                    <th className="py-4 px-6">Vendor</th>
                    <th className="py-4 px-4">Vendor Type</th>
                    <th className="py-4 px-4">Region</th>
                    <th className="py-4 px-4 text-right">PO Cost</th>
                    <th className="py-4 px-4 text-center">vs Market</th>
                    <th className="py-4 px-4 text-center">Lead Time</th>
                    <th className="py-4 px-4 text-center">On-Time %</th>
                    <th className="py-4 px-4 text-center">Rejection %</th>
                    <th className="py-4 px-4 text-right">MOQ</th>
                    <th className="py-4 px-6 text-center">Overall Score</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100/60 font-semibold text-slate-700">
                  {productVendors.map((row, idx) => {
                    const priceDiff = row.unitCost - activeProduct.unitPrice;
                    const priceDiffPct = Math.round((priceDiff / activeProduct.unitPrice) * 100);

                    return (
                      <tr key={idx} className="hover:bg-slate-50/50 transition duration-75">
                        <td className="py-4.5 px-6 font-bold text-bp-green cursor-pointer hover:text-bp-green-dark"
                          onClick={() => {
                            setSelectedVendorName(row.vendorName);
                            setSubTab("vendor_wise");
                          }}
                        >
                          {row.vendorName}
                        </td>
                        <td className="py-4.5 px-4 text-slate-500 font-medium">{row.vendorType}</td>
                        <td className="py-4.5 px-4 text-slate-500 font-medium">{row.vendorRegion}</td>
                        <td className="py-4.5 px-4 text-right text-slate-900">${row.unitCost.toFixed(2)}</td>
                        <td className="py-4.5 px-4 text-center">
                          {priceDiff > 0 ? (
                            <span className="text-rose-600 font-bold bg-rose-50 px-2 py-0.5 rounded-full border border-rose-100/80 text-[10px]">+${priceDiff.toFixed(2)} (+{priceDiffPct}%)</span>
                          ) : priceDiff < 0 ? (
                            <span className="text-emerald-600 font-bold bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-100/80 text-[10px]">-${Math.abs(priceDiff).toFixed(2)} ({priceDiffPct}%)</span>
                          ) : (
                            <span className="text-slate-400 font-bold">-</span>
                          )}
                        </td>
                        <td className="py-4.5 px-4 text-center text-slate-500 font-medium">{row.deliveryTime}</td>
                        <td className="py-4.5 px-4 text-center text-slate-700">{row.onTimePercent}%</td>
                        <td className="py-4.5 px-4 text-center text-rose-600">{row.rejectionRate}%</td>
                        <td className="py-4.5 px-4 text-right text-slate-700">{row.moq} units</td>
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
                    Sourcing network is safely diversified with {vendorCount} active distributors. Our machine learning recommendation engines identify <span className="font-extrabold text-bp-yellow underline">{bestValueVendor?.vendorName}</span> as the optimal primary replenishment route, offering an outstanding balance of PO unit cost and historical on-time fulfillment reliability.
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
