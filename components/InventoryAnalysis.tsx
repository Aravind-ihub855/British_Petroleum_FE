"use client";

import React from "react";

interface NonMovingRow {
  product: string;
  uom: string;
  totalStock: number;
  lastSale: string;
  daysSince: number;
}

const nonMovingItems: NonMovingRow[] = [
  {
    product: "Gear Oil 90",
    uom: "Ltr",
    totalStock: 850,
    lastSale: "12-01-2026",
    daysSince: 170,
  },
  {
    product: "Coolant 5L",
    uom: "Ltr",
    totalStock: 620,
    lastSale: "25-01-2026",
    daysSince: 157,
  },
  {
    product: "Chain Lube 500ml",
    uom: "Ltr",
    totalStock: 410,
    lastSale: "05-02-2026",
    daysSince: 146,
  },
  {
    product: "Industrial Grease",
    uom: "Kg",
    totalStock: 300,
    lastSale: "18-02-2026",
    daysSince: 133,
  },
  {
    product: "Brake Cleaner",
    uom: "Ltr",
    totalStock: 210,
    lastSale: "28-02-2026",
    daysSince: 123,
  },
];

export default function InventoryAnalysis() {
  return (
    <div className="space-y-6">
      
      {/* KPI Info row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-xs flex flex-col text-left">
          <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider">Fast Moving (F)</span>
          <span className="text-2xl font-black text-bp-green mt-2">2,112 Items</span>
        </div>
        <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-xs flex flex-col text-left">
          <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider">Slow Moving (S)</span>
          <span className="text-2xl font-black text-amber-500 mt-2">812 Items</span>
        </div>
        <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-xs flex flex-col text-left">
          <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider">Non Moving (N)</span>
          <span className="text-2xl font-black text-rose-500 mt-2">325 Items</span>
        </div>
        <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-xs flex flex-col text-left">
          <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider">Total SKU Checked</span>
          <span className="text-2xl font-black text-slate-900 mt-2">3,249</span>
        </div>
      </div>

      {/* Split section: Donut Chart left, non-moving items right */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* FSN Classification Donut Chart (Left Column) */}
        <div className="bg-white rounded-2xl border border-slate-100 shadow-xs p-5 flex flex-col justify-between text-left lg:col-span-5">
          <div className="border-b border-slate-50 pb-3 mb-4">
            <h3 className="text-sm font-extrabold text-slate-900 uppercase tracking-wider">
              FSN Classification (Overall)
            </h3>
          </div>

          <div className="flex-grow flex items-center justify-center py-6">
            <div className="relative w-48 h-48 flex items-center justify-center">
              <svg className="w-full h-full transform -rotate-90" viewBox="0 0 36 36">
                {/* Background track */}
                <circle cx="18" cy="18" r="15.915" fill="none" stroke="#f1f5f9" strokeWidth="3" />
                
                {/* Fast Moving Segment (Green): 65% -> length 65, offset 0 */}
                <circle
                  cx="18"
                  cy="18"
                  r="15.915"
                  fill="none"
                  stroke="#008751"
                  strokeWidth="3"
                  strokeDasharray="65 100"
                  strokeDashoffset="0"
                />

                {/* Slow Moving Segment (Orange): 25% -> length 25, offset -65 */}
                <circle
                  cx="18"
                  cy="18"
                  r="15.915"
                  fill="none"
                  stroke="#f59e0b"
                  strokeWidth="3"
                  strokeDasharray="25 100"
                  strokeDashoffset="-65"
                />

                {/* Non Moving Segment (Red): 10% -> length 10, offset -90 */}
                <circle
                  cx="18"
                  cy="18"
                  r="15.915"
                  fill="none"
                  stroke="#ef4444"
                  strokeWidth="3"
                  strokeDasharray="10 100"
                  strokeDashoffset="-90"
                />
              </svg>
              {/* Centered statistics circle */}
              <div className="absolute inset-0 flex flex-col items-center justify-center p-3 text-center bg-white rounded-full m-5 shadow-inner border border-slate-50">
                <span className="text-3xl font-black text-slate-900 leading-none">3,249</span>
                <span className="text-[9px] font-extrabold text-slate-400 uppercase tracking-widest mt-1">SKUs</span>
              </div>
            </div>

            {/* Labels right side */}
            <div className="ml-6 flex flex-col gap-3.5 font-semibold text-xs text-slate-600">
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-[#008751] flex-shrink-0" />
                <span>Fast Moving</span>
                <span className="font-bold text-slate-900 ml-1">65%</span>
                <span className="text-slate-400 text-[10px]">(2112)</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-amber-500 flex-shrink-0" />
                <span>Slow Moving</span>
                <span className="font-bold text-slate-900 ml-1">25%</span>
                <span className="text-slate-400 text-[10px]">(812)</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-rose-500 flex-shrink-0" />
                <span>Non Moving</span>
                <span className="font-bold text-slate-900 ml-1">10%</span>
                <span className="text-slate-400 text-[10px]">(325)</span>
              </div>
            </div>
          </div>
          <div className="pt-2 text-center text-[10.5px] text-slate-400 font-bold">
            Items classification evaluated dynamically over a 90-day sales cycle.
          </div>
        </div>

        {/* Top Non-Moving Items (Right Column) */}
        <div className="bg-white rounded-2xl border border-slate-100 shadow-xs overflow-hidden text-left lg:col-span-7">
          <div className="p-5 border-b border-slate-50">
            <h3 className="text-sm font-extrabold text-slate-900 uppercase tracking-wider">
              Top Non-Moving Items
            </h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead className="bg-slate-50/70 text-slate-400 uppercase tracking-wider font-extrabold border-b border-slate-100">
                <tr>
                  <th className="py-3.5 px-5">Product</th>
                  <th className="py-3.5 px-4 text-center">UOM</th>
                  <th className="py-3.5 px-4 text-right">Total Stock</th>
                  <th className="py-3.5 px-4 text-center">Last Sale Date</th>
                  <th className="py-3.5 px-5 text-center">Days Since Last Sale</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-semibold text-slate-700">
                {nonMovingItems.map((row, idx) => (
                  <tr key={idx} className="hover:bg-slate-50/50 transition duration-75">
                    <td className="py-4 px-5 font-bold text-slate-900">{row.product}</td>
                    <td className="py-4 px-4 text-center text-slate-500">{row.uom}</td>
                    <td className="py-4 px-4 text-right">{row.totalStock}</td>
                    <td className="py-4 px-4 text-center text-slate-500">{row.lastSale}</td>
                    <td className="py-4 px-5 text-center">
                      <span className="text-rose-600 font-black bg-rose-50 border border-rose-100 px-3 py-1 rounded-full text-[10px]">
                        {row.daysSince}
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
  );
}
