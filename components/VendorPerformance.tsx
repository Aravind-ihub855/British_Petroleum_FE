"use client";

import React, { useEffect } from "react";
import {
  vendors,
  masterProducts,
  getVendorPerformanceMetrics,
  getVendorsForProduct,
  getProductsForVendor
} from "@/utils/mockDb";

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
  
  // Set defaults if state is empty
  useEffect(() => {
    if (!selectedVendorName && vendors.length > 0) {
      setSelectedVendorName(vendors[0].name);
    }
    if (!selectedProductCode && masterProducts.length > 0) {
      setSelectedProductCode(masterProducts[0].code);
    }
  }, [selectedVendorName, selectedProductCode, setSelectedVendorName, setSelectedProductCode]);

  // Tab 1 overview metrics
  const performanceLogs = getVendorPerformanceMetrics();

  // Tab 2 Vendor-wise details
  const activeVendor = vendors.find((v) => v.name === selectedVendorName) || vendors[0];
  const vendorProducts = activeVendor ? getProductsForVendor(activeVendor.id) : [];

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
  const productVendors = activeProduct ? getVendorsForProduct(activeProduct.code) : [];

  // Dynamic alerts
  const vendorCount = productVendors.length;
  const bestValueVendor = productVendors[0];

  return (
    <div className="space-y-8">
      
      {/* Top Tab Selector Header Card */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6 bg-white p-6 rounded-2xl border border-slate-100 shadow-xs">
        <div>
          <h2 className="text-base font-extrabold text-slate-900 tracking-tight">
            Sourcing &amp; Vendor Management
          </h2>
          <p className="text-xs text-slate-400 font-medium mt-1 leading-relaxed">
            Evaluate lead times, pricing accuracy, and procurement intelligence across vendor networks.
          </p>
        </div>

        {/* 3-tab Switcher with improved styling and larger tabs */}
        <div className="flex bg-slate-100 p-1 rounded-xl w-fit gap-1 border border-slate-200/50">
          <button
            onClick={() => setSubTab("overview")}
            className={`px-5 py-2 rounded-lg text-xs font-bold transition duration-150 ${
              subTab === "overview"
                ? "bg-white text-slate-900 shadow-sm border border-slate-200/20"
                : "text-slate-500 hover:text-slate-800"
            }`}
          >
            Performance Overview
          </button>
          <button
            onClick={() => setSubTab("vendor_wise")}
            className={`px-5 py-2 rounded-lg text-xs font-bold transition duration-150 ${
              subTab === "vendor_wise"
                ? "bg-white text-slate-900 shadow-sm border border-slate-200/20"
                : "text-slate-500 hover:text-slate-800"
            }`}
          >
            Vendor Analysis
          </button>
          <button
            onClick={() => setSubTab("product_wise")}
            className={`px-5 py-2 rounded-lg text-xs font-bold transition duration-150 ${
              subTab === "product_wise"
                ? "bg-white text-slate-900 shadow-sm border border-slate-200/20"
                : "text-slate-500 hover:text-slate-800"
            }`}
          >
            Product Sourcing
          </button>
        </div>
      </div>

      {/* RENDER ACTIVE TAB */}

      {subTab === "overview" && (
        <div className="space-y-8 animate-fade-in">
          {/* KPI overview band with improved spacing */}
          {/* <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-xs flex flex-col text-left">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Overall Rating</span>
              <span className="text-3xl font-extrabold tracking-tight text-slate-900 mt-2.5">9.2 / 10</span>
            </div>
            <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-xs flex flex-col text-left">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Cost Compliance</span>
              <span className="text-3xl font-extrabold tracking-tight text-slate-900 mt-2.5">93.4%</span>
            </div>
            <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-xs flex flex-col text-left">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Quality Acceptance</span>
              <span className="text-3xl font-extrabold tracking-tight text-bp-green mt-2.5">98.1%</span>
            </div>
            <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-xs flex flex-col text-left">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Avg Delivery Time</span>
              <span className="text-3xl font-extrabold tracking-tight text-slate-900 mt-2.5">2.1 Days</span>
            </div>
          </div> */}

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            {/* Overview Table */}
            <div className="bg-white rounded-2xl border border-slate-100 shadow-xs overflow-hidden text-left lg:col-span-7">
              <div className="p-6 border-b border-slate-50">
                <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                  Vendor Capability Metrics
                </h3>
              </div>
              <div className="overflow-x-auto max-h-[500px]">
                <table className="w-full text-xs text-left">
                  <thead className="bg-slate-50 text-slate-500 tracking-wider font-semibold border-b border-slate-100 sticky top-0 z-10">
                    <tr>
                      <th className="py-3.5 px-6 font-bold bg-slate-50">Vendor</th>
                      <th className="py-3.5 px-6 font-bold bg-slate-50">Product</th>
                      <th className="py-3.5 px-6 text-center font-bold bg-slate-50">Cost</th>
                      <th className="py-3.5 px-6 text-center font-bold bg-slate-50">Quality</th>
                      <th className="py-3.5 px-6 text-center font-bold bg-slate-50">Delivery</th>
                      <th className="py-3.5 px-6 text-center font-bold bg-slate-50">Overall Score</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 font-medium text-slate-600">
                    {performanceLogs.map((row, idx) => (
                      <tr key={idx} className="hover:bg-slate-50/40 transition duration-75">
                        <td className="py-4 px-6 font-semibold text-bp-green cursor-pointer hover:underline"
                          onClick={() => {
                            setSelectedVendorName(row.vendor);
                            setSubTab("vendor_wise");
                          }}
                        >
                          {row.vendor}
                        </td>
                        <td className="py-4 px-6 text-slate-500 font-normal">{row.product}</td>
                        <td className="py-4 px-6 text-center text-slate-700 font-normal">{row.costScore}</td>
                        <td className="py-4 px-6 text-center text-slate-700 font-normal">{row.qualityScore}</td>
                        <td className="py-4 px-6 text-center font-normal text-slate-700">{row.deliveryTime}</td>
                        <td className="py-4 px-6 text-center">
                          <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${
                            row.overallScore >= 9.0 ? "bg-emerald-50 text-emerald-600 border-emerald-100" :
                            row.overallScore >= 8.5 ? "bg-amber-50 text-amber-600 border-amber-100" :
                            "bg-slate-50 text-slate-400 border-slate-100"
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

            {/* Right side alerts with enhanced margin */}
            <div className="space-y-6 lg:col-span-5 text-left">
              {/* Dependency Alerts */}
              <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-xs space-y-4">
                <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider border-b border-slate-50 pb-2">
                  Single-Vendor Risk Alerts
                </h3>
                <div className="p-4 bg-rose-50 border border-rose-100 rounded-xl flex items-start gap-3">
                  <svg className="w-5 h-5 text-rose-500 mt-0.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                  </svg>
                  <div>
                    <h4 className="text-xs font-bold text-rose-800">Castrol GTX 5W30 dependency</h4>
                    <p className="text-[11px] text-rose-600 mt-1.5 leading-relaxed">
                      Dependent solely on Castrol USA Lubricants. Recommend onboarding Valvoline or Mobil 1 backup lines.
                    </p>
                  </div>
                </div>
                <div className="p-4 bg-amber-50 border border-amber-100 rounded-xl flex items-start gap-3">
                  <svg className="w-5 h-5 text-amber-500 mt-0.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                  </svg>
                  <div>
                    <h4 className="text-xs font-bold text-amber-800">Whole Milk dependency</h4>
                    <p className="text-[11px] text-amber-600 mt-1.5 leading-relaxed">
                      Single-vendor onboarded for Chicago limits. Onboarding McLane Company planned for Q3.
                    </p>
                  </div>
                </div>
              </div>

              {/* Pricing Opportunities */}
              <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-xs space-y-4">
                <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider border-b border-slate-50 pb-2">
                  Procurement &amp; Savings Opportunities
                </h3>
                <div className="space-y-4">
                  <div className="flex items-center justify-between text-xs">
                    <div>
                      <h4 className="font-semibold text-slate-800">Coca-Cola 20oz Bottle</h4>
                      <span className="text-[10px] text-slate-400 mt-0.5 block">Current Market Price: $2.49 / Unit</span>
                    </div>
                    <div className="text-right">
                      <span className="font-bold text-bp-green block">$0.20 / Unit Savings</span>
                      <p className="text-[9px] text-slate-400 mt-0.5">Coca-Cola Bottling rates match target</p>
                    </div>
                  </div>
                  <div className="flex items-center justify-between text-xs">
                    <div>
                      <h4 className="font-semibold text-slate-800">Castrol GTX 5W30</h4>
                      <span className="text-[10px] text-slate-400 mt-0.5 block">Current Market Price: $10.99 / Ltr</span>
                    </div>
                    <div className="text-right">
                      <span className="font-bold text-bp-green block">$1.00 / Ltr Savings</span>
                      <p className="text-[9px] text-slate-400 mt-0.5">Castrol USA volume contract ready</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {subTab === "vendor_wise" && activeVendor && (
        <div className="space-y-8 animate-fade-in">
          
          {/* Vendor profile card (Expanded for better spacing) */}
          <div className="bg-white p-8 rounded-2xl border border-slate-100 shadow-xs text-left">
            {/* Filter control row (now separated clean from data fields) */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-100">
              <div className="flex items-center gap-3">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Select Vendor</span>
                <select
                  value={selectedVendorName}
                  onChange={(e) => setSelectedVendorName(e.target.value)}
                  className="bg-white border border-slate-200 text-xs font-semibold text-slate-700 py-1.5 px-3 rounded-lg focus:outline-none focus:ring-1 focus:ring-bp-green transition duration-150 shadow-xs"
                >
                  {vendors.map((v) => (
                    <option key={v.id} value={v.name}>
                      {v.name}
                    </option>
                  ))}
                </select>
              </div>
              <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                ID: <span className="text-slate-800 font-extrabold">{activeVendor.id}</span>
              </div>
            </div>

            {/* Profile fields and score gauge details */}
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-8 pt-6">
              <div className="space-y-3 flex-grow">
                <h2 className="text-xl font-black text-slate-900 tracking-tight">
                  {activeVendor.name} Profile
                </h2>
                
                {/* Clean metadata grid with better gaps and typography */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-y-4 gap-x-8 pt-3 text-[13px] font-medium text-slate-500">
                  <div>Vendor Type: <span className="text-slate-900 font-bold block mt-0.5">{activeVendor.type}</span></div>
                  <div>Region: <span className="text-slate-900 font-bold block mt-0.5">{activeVendor.region}</span></div>
                  <div>City Location: <span className="text-slate-900 font-bold block mt-0.5">{activeVendor.city}</span></div>
                  <div>Onboarding Date: <span className="text-slate-900 font-bold block mt-0.5">{activeVendor.onboardingDate}</span></div>
                  <div>Manager: <span className="text-slate-900 font-bold block mt-0.5">{activeVendor.managedBy}</span></div>
                  <div>Contract Status: <span className="text-slate-900 font-bold block mt-0.5">{activeVendor.contractStatus}</span></div>
                  <div>Payment Terms: <span className="text-slate-900 font-bold block mt-0.5">{activeVendor.paymentTerms}</span></div>
                </div>
              </div>

              {/* Gauge with clean margins */}
              <div className="flex items-center gap-5 bg-slate-50/60 p-5 rounded-2xl border border-slate-100/80 w-full lg:w-fit self-start">
                <div className="relative w-16 h-16 flex items-center justify-center">
                  <svg className="w-full h-full transform -rotate-90" viewBox="0 0 36 36">
                    <circle cx="18" cy="18" r="15.915" fill="none" stroke="#e2e8f0" strokeWidth="3" />
                    <circle cx="18" cy="18" r="15.915" fill="none" stroke="#008751" strokeWidth="3" strokeDasharray={`${vendorOverallScore * 10} 100`} />
                  </svg>
                  <span className="absolute text-sm font-extrabold text-slate-800">{vendorOverallScore}</span>
                </div>
                <div className="text-left space-y-0.5">
                  <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider block">Performance Band</span>
                  <span className="text-2xl font-black text-[#008751] block leading-none">Band {vendorBand}</span>
                </div>
              </div>
            </div>

            {/* Summary KPI card block (styled as neat grid cards) */}
            <div className="mt-8 p-6 bg-slate-50/40 rounded-2xl border border-slate-100/80 grid grid-cols-2 md:grid-cols-5 lg:grid-cols-8 gap-6 text-left">
              <div className="flex flex-col">
                <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">Score</span>
                <span className="text-sm font-bold text-slate-800 mt-1.5">{vendorOverallScore} / 10</span>
              </div>
              <div className="flex flex-col">
                <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">On-Time %</span>
                <span className="text-sm font-bold text-slate-800 mt-1.5">{vendorOnTime}%</span>
              </div>
              <div className="flex flex-col">
                <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">Cost Compliance</span>
                <span className="text-sm font-bold text-slate-800 mt-1.5">94.8%</span>
              </div>
              {/* <div className="flex flex-col">
                <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">Avg Rejection Rate</span>
                <span className="text-sm font-bold text-rose-600 mt-1.5">{vendorRejection}%</span>
              </div> */}
              {/* <div className="flex flex-col">
                <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">OTIF %</span>
                <span className="text-sm font-bold text-bp-green mt-1.5">{vendorOnTime - 2}%</span>
              </div> */}
              <div className="flex flex-col">
                <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">Avg Lead Time</span>
                <span className="text-sm font-bold text-slate-800 mt-1.5">{vendorLeadTime} Days</span>
              </div>
              <div className="flex flex-col">
                <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">SKUs Supplied</span>
                <span className="text-sm font-bold text-slate-800 mt-1.5">{vendorProducts.length}</span>
              </div>
              <div className="flex flex-col">
                <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">Total POs</span>
                <span className="text-sm font-bold text-slate-800 mt-1.5">
                  {vendorProducts.reduce((sum, p) => sum + p.deliveriesCount, 0)}
                </span>
              </div>
              <div className="flex flex-col col-span-2">
                <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">Annual Spend</span>
                <span className="text-sm font-bold text-slate-800 mt-1.5">$ {totalSpend.toLocaleString()}</span>
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
                <span className="text-xs font-bold text-emerald-600">▲ +4.2%</span>
              </div>
            </div>
            <div className="overflow-x-auto max-h-[500px]">
              <table className="w-full text-xs text-left">
                <thead className="bg-slate-50 text-slate-500 tracking-wider font-semibold border-b border-slate-100 sticky top-0 z-10">
                  <tr>
                    <th className="py-4 px-6 font-bold bg-slate-50">Product</th>
                    <th className="py-4 px-4 text-center font-bold bg-slate-50">UOM</th>
                    <th className="py-4 px-4 text-center font-bold bg-slate-50">Category</th>
                    <th className="py-4 px-4 text-right font-bold bg-slate-50">PO Cost</th>
                    <th className="py-4 px-4 text-center font-bold bg-slate-50">vs Market</th>
                    <th className="py-4 px-4 text-center font-bold bg-slate-50">Lead Time</th>
                    <th className="py-4 px-4 text-center font-bold bg-slate-50">On-Time %</th>
                    <th className="py-4 px-4 text-center font-bold bg-slate-50">Rejection %</th>
                    {/* <th className="py-4 px-4 text-center font-bold bg-slate-50">Primary?</th> */}
                    <th className="py-4 px-4 text-center font-bold bg-slate-50">Sole Source?</th>
                    <th className="py-4 px-4 text-center font-bold bg-slate-50">FSN Class</th>
                    <th className="py-4 px-6 text-center font-bold bg-slate-50">Overall Score</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-medium text-slate-600">
                  {vendorProducts.map((row, idx) => (
                    <tr key={idx} className="hover:bg-slate-50/40 transition duration-75">
                      <td className="py-4.5 px-6 font-semibold text-bp-green cursor-pointer hover:underline"
                        onClick={() => {
                          setSelectedProductCode(row.productCode);
                          setSubTab("product_wise");
                        }}
                      >
                        {row.productName}
                      </td>
                      <td className="py-4.5 px-4 text-center text-slate-400">{row.uom}</td>
                      <td className="py-4.5 px-4 text-center text-slate-400">{row.category}</td>
                      <td className="py-4.5 px-4 text-right font-normal text-slate-700">${row.unitCost.toFixed(2)}</td>
                      <td className="py-4.5 px-4 text-center text-slate-500 font-normal">
                        {(idx % 3 === 0) ? <span className="text-rose-600 font-bold">+$0.15 (+2%)</span> : <span className="text-emerald-600 font-bold">-$0.30 (-4%)</span>}
                      </td>
                      <td className="py-4.5 px-4 text-center text-slate-500">{row.deliveryTime}</td>
                      <td className="py-4.5 px-4 text-center text-slate-700">{row.onTimePercent}%</td>
                      <td className="py-4.5 px-4 text-center text-rose-600">{row.rejectionRate}%</td>
                      {/* <td className="py-4.5 px-4 text-center">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${row.isPrimary ? "bg-emerald-50 text-emerald-600 border border-emerald-100" : "bg-slate-50 text-slate-400 border border-slate-100"}`}>
                          {row.isPrimary ? "Yes" : "No"}
                        </span>
                      </td> */}
                      <td className="py-4.5 px-4 text-center">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${row.isSoleSource ? "bg-rose-50 text-rose-600 border border-rose-100" : "bg-slate-50 text-slate-400 border border-slate-100"}`}>
                          {row.isSoleSource ? "Yes" : "No"}
                        </span>
                      </td>
                      <td className="py-4.5 px-4 text-center">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold border ${
                          row.fsnClass === "Fast" ? "bg-emerald-50 text-emerald-600 border-emerald-100" :
                          row.fsnClass === "Slow" ? "bg-amber-50 text-amber-600 border-amber-100" :
                          "bg-rose-50 text-rose-600 border-rose-100"
                        }`}>
                          {row.fsnClass}
                        </span>
                      </td>
                      <td className="py-4.5 px-6 text-center">
                        <span className={`px-2.5 py-0.5 rounded text-[10px] font-bold border ${
                          row.overallScore >= 9.0 ? "bg-emerald-50 text-emerald-600 border-emerald-100" :
                          row.overallScore >= 8.5 ? "bg-amber-50 text-amber-600 border-amber-100" :
                          "bg-slate-50 text-slate-400 border-slate-100"
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

          {/* Action cards with spacious gaps */}
          {/* <div className="grid grid-cols-1 md:grid-cols-2 gap-8 text-left">
            <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-xs space-y-4">
              <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider border-b border-slate-50 pb-2">
                Actions &amp; Sourcing Bids
              </h3>
              <div className="flex flex-col gap-4 text-xs font-semibold">
                <div className="flex items-center justify-between">
                  <span className="text-slate-600">Qualify secondary backup source</span>
                  <button className="bg-bp-green text-white font-bold py-1.5 px-4 rounded-lg hover:bg-bp-green/90 transition duration-150 shadow-xs">
                    Qualify
                  </button>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-600">Renegotiate contract rates (priced above market)</span>
                  <button className="bg-amber-600 text-white font-bold py-1.5 px-4 rounded-lg hover:bg-amber-700 transition duration-150 shadow-xs">
                    Renegotiate
                  </button>
                </div>
              </div>
            </div>

            <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-xs space-y-4">
              <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider border-b border-slate-50 pb-2">
                Supply Chain Risk Summary
              </h3>
              <p className="text-xs text-slate-500 font-medium leading-relaxed">
                Vendor is currently sole source for <span className="text-rose-600 font-bold">{vendorProducts.filter((p) => p.isSoleSource).length} products</span>.
                Any manufacturing downtime or shipping delay will trigger immediate stockouts at the convenience outlets.
              </p>
            </div>
          </div> */}
        </div>
      )}

      {subTab === "product_wise" && activeProduct && (
        <div className="space-y-8 animate-fade-in">
          
          {/* Sourcing Summary Banner with improved margins and spacing */}
          {vendorCount === 1 ? (
            <div className="p-5 bg-rose-50 border border-rose-100 rounded-2xl flex items-start gap-4 text-left">
              <svg className="w-5 h-5 text-rose-500 mt-0.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
              <div>
                <h4 className="text-xs font-extrabold text-rose-800 uppercase tracking-wider">Critical Sourcing Risk - Single Vendor Dependency</h4>
                <p className="text-xs text-rose-700 mt-2 leading-relaxed font-semibold">
                  This product is supplied solely by {productVendors[0]?.vendorName || "one vendor"}. Qualify a second distributor immediately to secure replenishment operations.
                </p>
              </div>
            </div>
          ) : (
            <div className="p-5 bg-emerald-50 border border-emerald-100 rounded-2xl flex items-start gap-4 text-left">
              <svg className="w-5 h-5 text-emerald-500 mt-0.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <div>
                <h4 className="text-xs font-extrabold text-emerald-800 uppercase tracking-wider">Diversified Sourcing (Safe)</h4>
                <p className="text-xs text-emerald-700 mt-2 leading-relaxed font-semibold">
                  Product has {vendorCount} active distributors. Recommended cost-efficient source is <span className="font-extrabold text-slate-800 underline">{bestValueVendor?.vendorName}</span>.
                </p>
              </div>
            </div>
          )}

          {/* Product Header Card (Expanded for better spacing) */}
          <div className="bg-white p-8 rounded-2xl border border-slate-100 shadow-xs text-left space-y-6">
            
            {/* Filter Row */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-100">
              <div className="flex items-center gap-3">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Select Product</span>
                <select
                  value={selectedProductCode}
                  onChange={(e) => setSelectedProductCode(e.target.value)}
                  className="bg-white border border-slate-200 text-xs font-semibold text-slate-700 py-1.5 px-3 rounded-lg focus:outline-none focus:ring-1 focus:ring-bp-green transition duration-150 max-w-xs shadow-xs"
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

            <div className="space-y-4">
              <h2 className="text-xl font-black text-slate-900 tracking-tight">
                Sourcing Analysis: {activeProduct.name}
              </h2>
              
              {/* Product properties list */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-y-4 gap-x-8 pt-2 text-[13px] font-medium text-slate-500">
                <div>UOM Category: <span className="text-slate-900 font-bold block mt-0.5">{activeProduct.uom}</span></div>
                <div>Base Price: <span className="text-slate-900 font-bold block mt-0.5">${activeProduct.unitPrice}</span></div>
                <div>Storage Medium: <span className="text-slate-900 font-bold block mt-0.5">{activeProduct.storageLocation}</span></div>
                <div>FSN Status: <span className="text-slate-900 font-bold block mt-0.5">{activeProduct.code === "BP-PROD-001" ? "Fast" : "Slow"}</span></div>
              </div>
            </div>

            {/* Product summary KPI band */}
            <div className="mt-6 p-6 bg-slate-50/40 rounded-2xl border border-slate-100/80 grid grid-cols-2 md:grid-cols-4 gap-6 text-left">
              <div className="flex flex-col">
                <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">Active Vendors</span>
                <span className="text-sm font-bold text-slate-800 mt-1">{vendorCount}</span>
              </div>
              <div className="flex flex-col">
                <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">Recommended Source</span>
                <span className="text-sm font-bold text-[#008751] mt-1">{bestValueVendor?.vendorName || "N/A"}</span>
              </div>
              <div className="flex flex-col">
                <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">Best Cost</span>
                <span className="text-sm font-bold text-slate-800 mt-1">
                  ${productVendors.length > 0 ? Math.min(...productVendors.map((v) => v.unitCost)).toFixed(2) : "0.00"}
                </span>
              </div>
              {/* <div className="flex flex-col">
                <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">Market Price</span>
                <span className="text-sm font-bold text-slate-800 mt-1">${activeProduct.unitPrice}</span>
              </div> */}
              <div className="flex flex-col">
                <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">Overall Score</span>
                <span className="text-sm font-bold text-bp-green mt-1">
                  {productVendors.length > 0 ? (productVendors.reduce((sum, v) => sum + v.overallScore, 0) / productVendors.length).toFixed(1) : "9.0"} / 10
                </span>
              </div>
            </div>
          </div>

          {/* Vendors for this product table (with wide cell paddings) */}
          <div className="bg-white rounded-2xl border border-slate-100 shadow-xs overflow-hidden text-left">
            <div className="p-6 border-b border-slate-50">
              <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                Onboarded Vendors for {activeProduct.name}
              </h3>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left">
                <thead className="bg-slate-50 text-slate-500 tracking-wider font-semibold border-b border-slate-100">
                  <tr>
                    <th className="py-4 px-6 font-bold bg-slate-50">Vendor</th>
                    <th className="py-4 px-4 font-bold bg-slate-50">Vendor Type</th>
                    <th className="py-4 px-4 font-bold bg-slate-50">Region</th>
                    <th className="py-4 px-4 text-right font-bold bg-slate-50">PO cost</th>
                    <th className="py-4 px-4 text-center font-bold bg-slate-50">vs Market</th>
                    <th className="py-4 px-4 text-center font-bold bg-slate-50">Lead Time</th>
                    <th className="py-4 px-4 text-center font-bold bg-slate-50">On-Time %</th>
                    <th className="py-4 px-4 text-center font-bold bg-slate-50">Rejection %</th>
                    <th className="py-4 px-4 text-right font-bold bg-slate-50">MOQ</th>
                    <th className="py-4 px-6 text-center font-bold bg-slate-50">Overall Score</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-medium text-slate-600">
                  {productVendors.map((row, idx) => {
                    const priceDiff = row.unitCost - activeProduct.unitPrice;
                    const priceDiffPct = Math.round((priceDiff / activeProduct.unitPrice) * 100);

                    return (
                      <tr key={idx} className="hover:bg-slate-50/40 transition duration-75">
                        <td className="py-4.5 px-5 font-semibold text-bp-green cursor-pointer hover:underline"
                          onClick={() => {
                            setSelectedVendorName(row.vendorName);
                            setSubTab("vendor_wise");
                          }}
                        >
                          {row.vendorName}
                        </td>
                        <td className="py-4.5 px-4 text-slate-500 font-normal">{row.vendorType}</td>
                        <td className="py-4.5 px-4 text-slate-500 font-normal">{row.vendorRegion}</td>
                        <td className="py-4.5 px-4 text-right font-normal text-slate-700">${row.unitCost.toFixed(2)}</td>
                        <td className="py-4.5 px-4 text-center font-normal">
                          {priceDiff > 0 ? (
                            <span className="text-rose-600 font-bold">+${priceDiff.toFixed(2)} (+{priceDiffPct}%)</span>
                          ) : priceDiff < 0 ? (
                            <span className="text-emerald-600 font-bold">-${Math.abs(priceDiff).toFixed(2)} ({priceDiffPct}%)</span>
                          ) : (
                            <span className="text-slate-400">-</span>
                          )}
                        </td>
                        <td className="py-4.5 px-4 text-center text-slate-500">{row.deliveryTime}</td>
                        <td className="py-4.5 px-4 text-center text-slate-700">{row.onTimePercent}%</td>
                        <td className="py-4.5 px-4 text-center text-rose-600">{row.rejectionRate}%</td>
                        <td className="py-4.5 px-4 text-right text-slate-700">{row.moq} units</td>
                        <td className="py-4.5 px-6 text-center">
                          <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${
                            row.overallScore >= 9.0 ? "bg-emerald-50 text-emerald-600 border-emerald-100" :
                            row.overallScore >= 8.5 ? "bg-amber-50 text-amber-600 border-amber-100" :
                            "bg-slate-50 text-slate-400 border-slate-100"
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

          {/* Recommendations pick */}
          <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-xs text-left space-y-3">
            <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider border-b border-slate-50 pb-2">
              Procurement Sourcing Recommendation
            </h3>
            <p className="text-xs text-slate-500 font-medium leading-relaxed">
              {vendorCount === 1 ? (
                <span>
                  High supply-chain vulnerability due to single source. Onboard a secondary distributor immediately.
                </span>
              ) : (
                <span>
                  Diversified source verified. Sourcing from <span className="font-bold text-[#008751]">{bestValueVendor.vendorName}</span> offers the best cost-to-delivery index.
                </span>
              )}
            </p>
          </div>
        </div>
      )}

    </div>
  );
}
