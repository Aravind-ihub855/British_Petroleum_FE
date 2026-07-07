"use client";

import React, { useState } from "react";

interface VendorRow {
  vendor: string;
  product: string;
  costScore: string;
  qualityScore: string;
  deliveryTime: string;
  overallScore: number;
}

const initialVendors: VendorRow[] = [
  {
    vendor: "Supreme Distributors",
    product: "Lube Oil 15W40",
    costScore: "92%",
    qualityScore: "98%",
    deliveryTime: "2.2 Days",
    overallScore: 9.1,
  },
  {
    vendor: "Reliable Logistics",
    product: "Engine Oil 20W50",
    costScore: "95%",
    qualityScore: "99%",
    deliveryTime: "1.8 Days",
    overallScore: 9.4,
  },
  {
    vendor: "Global Spares Ltd",
    product: "Hydraulic Oil 68",
    costScore: "88%",
    qualityScore: "97%",
    deliveryTime: "3.1 Days",
    overallScore: 8.2,
  },
  {
    vendor: "Apex Fluids",
    product: "Coolant 1L",
    costScore: "90%",
    qualityScore: "96%",
    deliveryTime: "2.9 Days",
    overallScore: 8.5,
  },
];

export default function VendorPerformance() {
  const [selectedVendor, setSelectedVendor] = useState("All Vendors");
  const [selectedProduct, setSelectedProduct] = useState("All Products");

  const filteredVendors = initialVendors.filter((row) => {
    const matchesVendor = selectedVendor === "All Vendors" || row.vendor === selectedVendor;
    const matchesProduct = selectedProduct === "All Products" || row.product === selectedProduct;
    return matchesVendor && matchesProduct;
  });

  return (
    <div className="space-y-6">
      
      {/* Top Filter Controls */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 bg-white p-5 rounded-xl border border-slate-100 shadow-xs">
        <div>
          <h2 className="text-sm font-bold text-slate-800">
            Vendor Performance Dashboard (ECOT)
          </h2>
          <p className="text-[11px] text-slate-400 font-medium mt-0.5">
            Evaluate vendor capabilities across Cost, Quality, and Delivery Time parameters.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-4">
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-slate-400">Filter Vendor</span>
            <select
              value={selectedVendor}
              onChange={(e) => setSelectedVendor(e.target.value)}
              className="bg-white border border-slate-200 text-xs font-semibold text-slate-700 py-1.5 px-3 rounded-lg focus:outline-none focus:ring-1 focus:ring-bp-green transition duration-150 shadow-xs"
            >
              <option>All Vendors</option>
              <option>Supreme Distributors</option>
              <option>Reliable Logistics</option>
              <option>Global Spares Ltd</option>
              <option>Apex Fluids</option>
            </select>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-slate-400">Filter Product</span>
            <select
              value={selectedProduct}
              onChange={(e) => setSelectedProduct(e.target.value)}
              className="bg-white border border-slate-200 text-xs font-semibold text-slate-700 py-1.5 px-3 rounded-lg focus:outline-none focus:ring-1 focus:ring-bp-green transition duration-150 shadow-xs"
            >
              <option>All Products</option>
              <option>Lube Oil 15W40</option>
              <option>Engine Oil 20W50</option>
              <option>Hydraulic Oil 68</option>
              <option>Coolant 1L</option>
            </select>
          </div>
        </div>
      </div>

      {/* KPI Cards Row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-xl border border-slate-100 shadow-xs flex flex-col text-left">
          <span className="text-xs font-semibold text-slate-400 tracking-wide">Overall Rating</span>
          <span className="text-2xl font-bold tracking-tight text-slate-900 mt-2">8.8 / 10</span>
        </div>
        <div className="bg-white p-5 rounded-xl border border-slate-100 shadow-xs flex flex-col text-left">
          <span className="text-xs font-semibold text-slate-400 tracking-wide">Cost Compliance</span>
          <span className="text-2xl font-bold tracking-tight text-slate-900 mt-2">91.3%</span>
        </div>
        <div className="bg-white p-5 rounded-xl border border-slate-100 shadow-xs flex flex-col text-left">
          <span className="text-xs font-semibold text-slate-400 tracking-wide">Quality Acceptance</span>
          <span className="text-2xl font-bold tracking-tight text-bp-green mt-2">97.5%</span>
        </div>
        <div className="bg-white p-5 rounded-xl border border-slate-100 shadow-xs flex flex-col text-left">
          <span className="text-xs font-semibold text-slate-400 tracking-wide">Avg Delivery Time</span>
          <span className="text-2xl font-bold tracking-tight text-slate-900 mt-2">2.5 Days</span>
        </div>
      </div>

      {/* Split grid: Vendor ECOT table left, Risk alerts/Procurement opportunities right */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left Column: Vendor Performance Table */}
        <div className="bg-white rounded-xl border border-slate-100 shadow-xs overflow-hidden text-left lg:col-span-7">
          <div className="p-5 border-b border-slate-50">
            <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
              Vendor Capability Metrics
            </h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead className="bg-slate-50/50 text-slate-500 tracking-wider font-semibold border-b border-slate-100">
                <tr>
                  <th className="py-3 px-5 font-bold">Vendor</th>
                  <th className="py-3 px-4 font-bold">Product</th>
                  <th className="py-3 px-4 text-center font-bold">Cost</th>
                  <th className="py-3 px-4 text-center font-bold">Quality</th>
                  <th className="py-3 px-4 text-center font-bold">Delivery Time</th>
                  <th className="py-3 px-5 text-center font-bold">Overall Score</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium text-slate-600">
                {filteredVendors.map((row, idx) => (
                  <tr key={idx} className="hover:bg-slate-50/40 transition duration-75">
                    <td className="py-3.5 px-5 font-semibold text-slate-900">{row.vendor}</td>
                    <td className="py-3.5 px-4 text-slate-500 font-normal">{row.product}</td>
                    <td className="py-3.5 px-4 text-center text-slate-700 font-normal">{row.costScore}</td>
                    <td className="py-3.5 px-4 text-center text-slate-700 font-normal">{row.qualityScore}</td>
                    <td className="py-3.5 px-4 text-center font-normal text-slate-700">{row.deliveryTime}</td>
                    <td className="py-3.5 px-5 text-center">
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

        {/* Right Column: Alerts & Opportunities */}
        <div className="space-y-6 lg:col-span-5 text-left">
          
          {/* Dependency Alerts */}
          <div className="bg-white p-5 rounded-xl border border-slate-100 shadow-xs space-y-4">
            <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider border-b border-slate-50 pb-2">
              Single-Vendor Risk Alerts
            </h3>
            
            <div className="p-3 bg-rose-50 border border-rose-100 rounded-lg flex items-start gap-2.5">
              <svg className="w-4 h-4 text-rose-500 mt-0.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
              <div>
                <h4 className="text-xs font-bold text-rose-800">Coolant 1L dependency</h4>
                <p className="text-[10px] text-rose-600 mt-0.5 leading-relaxed">
                  Dependent solely on Apex Fluids. Recommend onboarding backup suppliers.
                </p>
              </div>
            </div>

            <div className="p-3 bg-amber-50 border border-amber-100 rounded-lg flex items-start gap-2.5">
              <svg className="w-4 h-4 text-amber-500 mt-0.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
              <div>
                <h4 className="text-xs font-bold text-amber-800">Hydraulic Oil 68 dependency</h4>
                <p className="text-[10px] text-amber-600 mt-0.5 leading-relaxed">
                  Single-vendor onboarded for Pune limits. Onboarding Supreme Distributors planned for Q3.
                </p>
              </div>
            </div>
          </div>

          {/* Pricing Opportunities */}
          <div className="bg-white p-5 rounded-xl border border-slate-100 shadow-xs space-y-4">
            <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider border-b border-slate-50 pb-2">
              Procurement &amp; Savings Opportunities
            </h3>

            <div className="space-y-3">
              <div className="flex items-center justify-between text-xs">
                <div>
                  <h4 className="font-semibold text-slate-800">Hydraulic Oil 68</h4>
                  <span className="text-[10px] text-slate-400">Current Market Price: ₹185 / Ltr</span>
                </div>
                <div className="text-right">
                  <span className="font-bold text-bp-green">₹15 / Ltr Savings</span>
                  <p className="text-[9px] text-slate-400">Apex rates match target</p>
                </div>
              </div>
              
              <div className="flex items-center justify-between text-xs">
                <div>
                  <h4 className="font-semibold text-slate-800">Lube Oil 15W40</h4>
                  <span className="text-[10px] text-slate-400">Current Market Price: ₹215 / Ltr</span>
                </div>
                <div className="text-right">
                  <span className="font-bold text-bp-green">₹20 / Ltr Savings</span>
                  <p className="text-[9px] text-slate-400">Supreme volume contract ready</p>
                </div>
              </div>
            </div>
          </div>

        </div>

      </div>

    </div>
  );
}
