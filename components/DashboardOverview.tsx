"use client";

import React from "react";

export default function DashboardOverview() {
  return (
    <div className="space-y-6">
      {/* KPI Section */}
      <div className="grid grid-cols-2 lg:grid-cols-6 gap-4">
        {/* Card 1 */}
        <div className="bg-white border border-slate-200/80 rounded-2xl p-4 shadow-sm">
          <div className="flex items-center gap-1.5 text-slate-400 mb-1">
            <svg className="w-4 h-4 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
            </svg>
            <span className="text-[11px] font-bold uppercase tracking-wider">Total Stores</span>
          </div>
          <span className="text-2xl font-black text-slate-900">1,500</span>
        </div>

        {/* Card 2 */}
        <div className="bg-white border border-slate-200/80 rounded-2xl p-4 shadow-sm">
          <div className="flex items-center gap-1.5 text-slate-400 mb-1">
            <svg className="w-4 h-4 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
            </svg>
            <span className="text-[11px] font-bold uppercase tracking-wider">Total Products</span>
          </div>
          <span className="text-2xl font-black text-slate-900">3,250</span>
        </div>

        {/* Card 3 */}
        <div className="bg-white border border-slate-200/80 rounded-2xl p-4 shadow-sm">
          <div className="flex items-center gap-1.5 text-slate-400 mb-1">
            <span className="text-[11px] font-bold uppercase tracking-wider">Total Inventory Value</span>
          </div>
          <span className="text-2xl font-black text-slate-900">₹ 45.62 Cr</span>
        </div>

        {/* Card 4 */}
        <div className="bg-white border border-slate-200/80 rounded-2xl p-4 shadow-sm">
          <div className="flex items-center gap-1.5 text-slate-400 mb-1">
            <span className="text-[11px] font-bold uppercase tracking-wider text-rose-600">At Risk (7 Days)</span>
          </div>
          <span className="text-2xl font-black text-rose-600">128</span>
        </div>

        {/* Card 5 */}
        <div className="bg-white border border-slate-200/80 rounded-2xl p-4 shadow-sm">
          <div className="flex items-center gap-1.5 text-slate-400 mb-1">
            <span className="text-[11px] font-bold uppercase tracking-wider text-bp-green">FSN - Fast Moving</span>
          </div>
          <span className="text-2xl font-black text-bp-green">65%</span>
        </div>

        {/* Card 6 */}
        <div className="bg-white border border-slate-200/80 rounded-2xl p-4 shadow-sm">
          <div className="flex items-center gap-1.5 text-slate-400 mb-1">
            <span className="text-[11px] font-bold uppercase tracking-wider text-indigo-600">Overall Service Level</span>
          </div>
          <span className="text-2xl font-black text-indigo-600">92.6%</span>
        </div>
      </div>

      {/* Charts & Table Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Stockout Risk Summary Donut */}
        <div className="bg-white border border-slate-200/80 rounded-3xl p-6 shadow-sm flex flex-col justify-between">
          <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider mb-4">Stockout Risk Summary</h3>
          <div className="flex items-center justify-around flex-grow gap-4">
            {/* SVG Donut */}
            <div className="relative w-32 h-32 flex-shrink-0">
              <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
                <circle cx="50" cy="50" r="40" stroke="#f1f5f9" strokeWidth="12" fill="transparent" />
                <circle cx="50" cy="50" r="40" stroke="#008751" strokeWidth="12" strokeDasharray="193.5 251.3" strokeDashoffset="0" fill="transparent" />
                <circle cx="50" cy="50" r="40" stroke="#f97316" strokeWidth="12" strokeDasharray="37.7 251.3" strokeDashoffset="-193.5" fill="transparent" />
                <circle cx="50" cy="50" r="40" stroke="#ef4444" strokeWidth="12" strokeDasharray="20.1 251.3" strokeDashoffset="-231.2" fill="transparent" />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-xl font-black text-slate-900">1,500</span>
                <span className="text-[9px] text-slate-400 font-bold uppercase tracking-wider">Stores</span>
              </div>
            </div>

            <div className="flex flex-col gap-2.5 text-xs font-semibold">
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-rose-500 flex-shrink-0" />
                <div className="flex flex-col">
                  <span className="text-slate-500 text-[10px]">High Risk (≤ 7 Days)</span>
                  <span className="text-slate-800">128 <span className="text-[10px] text-slate-400 font-bold">(8%)</span></span>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-orange-500 flex-shrink-0" />
                <div className="flex flex-col">
                  <span className="text-slate-500 text-[10px]">Medium Risk (8-15 Days)</span>
                  <span className="text-slate-800">226 <span className="text-[10px] text-slate-400 font-bold">(15%)</span></span>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-bp-green flex-shrink-0" />
                <div className="flex flex-col">
                  <span className="text-slate-500 text-[10px]">Low Risk (&gt; 15 Days)</span>
                  <span className="text-slate-800">1146 <span className="text-[10px] text-slate-400 font-bold">(77%)</span></span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Inventory by FSN Donut */}
        <div className="bg-white border border-slate-200/80 rounded-3xl p-6 shadow-sm flex flex-col justify-between">
          <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider mb-4">Inventory by FSN</h3>
          <div className="flex items-center justify-around flex-grow gap-4">
            {/* SVG Donut */}
            <div className="relative w-32 h-32 flex-shrink-0">
              <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
                <circle cx="50" cy="50" r="40" stroke="#f1f5f9" strokeWidth="12" fill="transparent" />
                <circle cx="50" cy="50" r="40" stroke="#008751" strokeWidth="12" strokeDasharray="163.3 251.3" strokeDashoffset="0" fill="transparent" />
                <circle cx="50" cy="50" r="40" stroke="#f97316" strokeWidth="12" strokeDasharray="62.8 251.3" strokeDashoffset="-163.3" fill="transparent" />
                <circle cx="50" cy="50" r="40" stroke="#ef4444" strokeWidth="12" strokeDasharray="25.1 251.3" strokeDashoffset="-226.1" fill="transparent" />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-xl font-black text-slate-900">3,250</span>
                <span className="text-[9px] text-slate-400 font-bold uppercase tracking-wider">SKUs</span>
              </div>
            </div>

            <div className="flex flex-col gap-3 text-xs font-semibold">
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-bp-green flex-shrink-0" />
                <div className="flex flex-col">
                  <span className="text-slate-500 text-[10px]">Fast Moving</span>
                  <span className="text-slate-800">65%</span>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-orange-500 flex-shrink-0" />
                <div className="flex flex-col">
                  <span className="text-slate-500 text-[10px]">Slow Moving</span>
                  <span className="text-slate-800">25%</span>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-rose-500 flex-shrink-0" />
                <div className="flex flex-col">
                  <span className="text-slate-500 text-[10px]">Non Moving</span>
                  <span className="text-slate-800">10%</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Top 5 Products Table */}
        <div className="bg-white border border-slate-200/80 rounded-3xl p-6 shadow-sm flex flex-col justify-between">
          <div>
            <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider mb-4">Top 5 Products at Risk</h3>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b border-slate-100 text-slate-400 font-bold uppercase">
                    <th className="py-2.5">Product</th>
                    <th className="py-2.5 text-center">Stores at Risk</th>
                    <th className="py-2.5 text-right">Soonest Stockout</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100/60 font-semibold text-slate-700">
                  <tr>
                    <td className="py-3 text-slate-900">Lube Oil 15W40</td>
                    <td className="py-3 text-center text-rose-600">45</td>
                    <td className="py-3 text-right text-slate-500">03-07-2026</td>
                  </tr>
                  <tr>
                    <td className="py-3 text-slate-900">Engine Oil 20W50</td>
                    <td className="py-3 text-center text-rose-600">32</td>
                    <td className="py-3 text-right text-slate-500">04-07-2026</td>
                  </tr>
                  <tr>
                    <td className="py-3 text-slate-900">Hydraulic Oil 68</td>
                    <td className="py-3 text-center text-rose-600">18</td>
                    <td className="py-3 text-right text-slate-500">05-07-2026</td>
                  </tr>
                  <tr>
                    <td className="py-3 text-slate-900">Coolant 1L</td>
                    <td className="py-3 text-center text-rose-500">12</td>
                    <td className="py-3 text-right text-slate-500">06-07-2026</td>
                  </tr>
                  <tr>
                    <td className="py-3 text-slate-900">Brake Fluid DOT 4</td>
                    <td className="py-3 text-center text-rose-500">10</td>
                    <td className="py-3 text-right text-slate-500">06-07-2026</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          <div className="text-right border-t border-slate-50/80 pt-3">
            <button className="text-xs font-bold text-bp-green hover:underline hover:text-bp-green-dark">
              View All
            </button>
          </div>
        </div>
      </div>

      {/* Bottom Section: Risk by City & Forecast Accuracy */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Bar Chart Mock for Stockout Risk by City */}
        <div className="bg-white border border-slate-200/80 rounded-3xl p-6 shadow-sm lg:col-span-2">
          <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider mb-5">Stockout Risk by City</h3>
          <div className="space-y-4 font-semibold text-xs text-slate-700">
            <div className="space-y-1.5">
              <div className="flex justify-between">
                <span className="text-slate-800">Delhi NCR</span>
                <span>120 stores at risk</span>
              </div>
              <div className="h-2.5 w-full bg-slate-100 rounded-full overflow-hidden">
                <div className="h-full bg-bp-green rounded-full" style={{ width: "80%" }} />
              </div>
            </div>

            <div className="space-y-1.5">
              <div className="flex justify-between">
                <span className="text-slate-800">Mumbai</span>
                <span>98 stores at risk</span>
              </div>
              <div className="h-2.5 w-full bg-slate-100 rounded-full overflow-hidden">
                <div className="h-full bg-bp-green rounded-full" style={{ width: "65%" }} />
              </div>
            </div>

            <div className="space-y-1.5">
              <div className="flex justify-between">
                <span className="text-slate-800">Bengaluru</span>
                <span>75 stores at risk</span>
              </div>
              <div className="h-2.5 w-full bg-slate-100 rounded-full overflow-hidden">
                <div className="h-full bg-bp-green rounded-full" style={{ width: "50%" }} />
              </div>
            </div>

            <div className="space-y-1.5">
              <div className="flex justify-between">
                <span className="text-slate-800">Chennai</span>
                <span>60 stores at risk</span>
              </div>
              <div className="h-2.5 w-full bg-slate-100 rounded-full overflow-hidden">
                <div className="h-full bg-bp-green rounded-full" style={{ width: "40%" }} />
              </div>
            </div>
          </div>
        </div>

        {/* Forecast Accuracy Gauge */}
        <div className="bg-white border border-slate-200/80 rounded-3xl p-6 shadow-sm flex flex-col justify-between items-center">
          <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider mb-2 self-start w-full">Forecast Accuracy (Overall)</h3>
          
          <div className="relative w-36 h-24 flex items-end justify-center overflow-hidden">
            <svg className="w-36 h-36 absolute top-0" viewBox="0 0 100 100">
              <path d="M 15 50 A 35 35 0 0 1 85 50" fill="none" stroke="#f1f5f9" strokeWidth="8" strokeLinecap="round" />
              <path d="M 15 50 A 35 35 0 0 1 85 50" fill="none" stroke="#008751" strokeWidth="8" strokeLinecap="round" strokeDasharray="95.6 109.9" />
            </svg>
            <div className="flex flex-col items-center z-10">
              <span className="text-3xl font-black text-slate-900 leading-none">87%</span>
              <span className="text-xs text-bp-green font-bold uppercase tracking-wider mt-1">Good</span>
            </div>
          </div>

          <div className="text-center text-slate-400 text-[10px] font-bold uppercase tracking-wider mt-4">
            Calculated against 30-day forecast models
          </div>
        </div>
      </div>
    </div>
  );
}
