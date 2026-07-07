"use client";

import React from "react";
import { masterProducts, stores, getStoreInventory } from "@/utils/mockDb";

interface NonMovingRow {
  product: string;
  uom: string;
  totalStock: number;
  lastSale: string;
  daysSince: number;
}

export default function InventoryAnalysis() {
  // Dynamically compute FSN categories based on actual sales volumes
  const allStoreItemsMap: Record<string, { name: string; uom: string; stock: number; maxConsumption: number }> = {};

  stores.forEach((st) => {
    const inv = getStoreInventory(st.id);
    inv.forEach((item) => {
      if (!allStoreItemsMap[item.code]) {
        allStoreItemsMap[item.code] = {
          name: item.name,
          uom: item.uom,
          stock: 0,
          maxConsumption: 0
        };
      }
      allStoreItemsMap[item.code].stock += item.currentStock;
      if (item.avgDailyConsumption > allStoreItemsMap[item.code].maxConsumption) {
        allStoreItemsMap[item.code].maxConsumption = item.avgDailyConsumption;
      }
    });
  });

  const uniqueItemsList = Object.values(allStoreItemsMap);
  const totalSKUs = uniqueItemsList.length;

  // Classify products:
  // Fast (F): Max daily consumption >= 25.0
  // Slow (S): Max daily consumption >= 5.0 and < 25.0
  // Non-Moving (N): Max daily consumption < 5.0
  const fastItemsCount = uniqueItemsList.filter((item) => item.maxConsumption >= 25.0).length;
  const slowItemsCount = uniqueItemsList.filter((item) => item.maxConsumption >= 5.0 && item.maxConsumption < 25.0).length;
  const nonMovingItemsCount = uniqueItemsList.filter((item) => item.maxConsumption < 5.0).length;

  const fastPercent = totalSKUs > 0 ? Math.round((fastItemsCount / totalSKUs) * 100) : 0;
  const slowPercent = totalSKUs > 0 ? Math.round((slowItemsCount / totalSKUs) * 100) : 0;
  const nonPercent = totalSKUs > 0 ? 100 - fastPercent - slowPercent : 0;

  // Build top 5 non-moving products from dynamic dataset
  const nonMovingItems: NonMovingRow[] = uniqueItemsList
    .filter((item) => item.maxConsumption < 5.0)
    .map((item, idx) => {
      // Deterministic dates based on code string
      const days = 100 + (idx * 17) % 80;
      const lastSaleDate = new Date();
      lastSaleDate.setDate(lastSaleDate.getDate() - days);
      const dStr = String(lastSaleDate.getDate()).padStart(2, "0");
      const mStr = String(lastSaleDate.getMonth() + 1).padStart(2, "0");

      return {
        product: item.name,
        uom: item.uom,
        totalStock: item.stock,
        lastSale: `${dStr}-${mStr}-${lastSaleDate.getFullYear()}`,
        daysSince: days
      };
    })
    .sort((a, b) => b.daysSince - a.daysSince)
    .slice(0, 5);

  return (
    <div className="space-y-6">
      
      {/* KPI Info row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-xl border border-slate-100 shadow-xs flex flex-col text-left">
          <span className="text-xs font-semibold text-slate-400 tracking-wide">Fast Moving (F)</span>
          <span className="text-2xl font-bold tracking-tight text-bp-green mt-2">{fastItemsCount} SKUs</span>
        </div>
        <div className="bg-white p-5 rounded-xl border border-slate-100 shadow-xs flex flex-col text-left">
          <span className="text-xs font-semibold text-slate-400 tracking-wide">Slow Moving (S)</span>
          <span className="text-2xl font-bold tracking-tight text-amber-500 mt-2">{slowItemsCount} SKUs</span>
        </div>
        <div className="bg-white p-5 rounded-xl border border-slate-100 shadow-xs flex flex-col text-left">
          <span className="text-xs font-semibold text-slate-400 tracking-wide">Non Moving (N)</span>
          <span className="text-2xl font-bold tracking-tight text-rose-500 mt-2">{nonMovingItemsCount} SKUs</span>
        </div>
        <div className="bg-white p-5 rounded-xl border border-slate-100 shadow-xs flex flex-col text-left">
          <span className="text-xs font-semibold text-slate-400 tracking-wide">Total SKU Checked</span>
          <span className="text-2xl font-bold tracking-tight text-slate-900 mt-2">{totalSKUs}</span>
        </div>
      </div>

      {/* Split section: Donut Chart left, non-moving items right */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* FSN Classification Donut Chart (Left Column) */}
        <div className="bg-white rounded-xl border border-slate-100 shadow-xs p-5 flex flex-col justify-between text-left lg:col-span-5">
          <div className="border-b border-slate-50 pb-3 mb-4">
            <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
              FSN Classification (Overall)
            </h3>
          </div>

          <div className="flex-grow flex items-center justify-center py-6">
            <div className="relative w-40 h-40 flex items-center justify-center">
              <svg className="w-full h-full transform -rotate-90" viewBox="0 0 36 36">
                <circle cx="18" cy="18" r="15.915" fill="none" stroke="#f1f5f9" strokeWidth="3" />
                <circle cx="18" cy="18" r="15.915" fill="none" stroke="#008751" strokeWidth="3" strokeDasharray={`${fastPercent} 100`} strokeDashoffset="0" />
                <circle cx="18" cy="18" r="15.915" fill="none" stroke="#f59e0b" strokeWidth="3" strokeDasharray={`${slowPercent} 100`} strokeDashoffset={`-${fastPercent}`} />
                <circle cx="18" cy="18" r="15.915" fill="none" stroke="#ef4444" strokeWidth="3" strokeDasharray={`${nonPercent} 100`} strokeDashoffset={`-${fastPercent + slowPercent}`} />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center p-3 text-center bg-white rounded-full m-4.5 shadow-inner border border-slate-50">
                <span className="text-2xl font-bold text-slate-900 leading-none">{totalSKUs}</span>
                <span className="text-[9px] font-semibold text-slate-400 uppercase tracking-widest mt-1">SKUs</span>
              </div>
            </div>

            {/* Labels right side */}
            <div className="ml-6 flex flex-col gap-3.5 font-medium text-xs text-slate-600">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-[#008751] flex-shrink-0" />
                <span>Fast Moving</span>
                <span className="font-semibold text-slate-900 ml-1">{fastPercent}%</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-amber-500 flex-shrink-0" />
                <span>Slow Moving</span>
                <span className="font-semibold text-slate-900 ml-1">{slowPercent}%</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-rose-500 flex-shrink-0" />
                <span>Non Moving</span>
                <span className="font-semibold text-slate-900 ml-1">{nonPercent}%</span>
              </div>
            </div>
          </div>
          <div className="pt-2 text-center text-[10.5px] text-slate-400 font-bold">
            Items classification evaluated dynamically over a 90-day sales cycle.
          </div>
        </div>

        {/* Top Non-Moving Items (Right Column) */}
        <div className="bg-white rounded-xl border border-slate-100 shadow-xs overflow-hidden text-left lg:col-span-7">
          <div className="p-5 border-b border-slate-50">
            <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
              Top Non-Moving Items
            </h3>
          </div>
          <div className="overflow-x-auto max-h-[450px]">
            <table className="w-full text-xs text-left">
              <thead className="bg-slate-50/50 text-slate-500 tracking-wider font-semibold border-b border-slate-100 sticky top-0 z-10">
                <tr>
                  <th className="py-3 px-5 font-bold">Product</th>
                  <th className="py-3 px-4 text-center font-bold">UOM</th>
                  <th className="py-3 px-4 text-right font-bold">Total Stock</th>
                  <th className="py-3 px-4 text-center font-bold">Last Sale Date</th>
                  <th className="py-3 px-5 text-center font-bold">Days Since Last Sale</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium text-slate-600">
                {nonMovingItems.map((row, idx) => (
                  <tr key={idx} className="hover:bg-slate-50/40 transition duration-75">
                    <td className="py-3.5 px-5 font-semibold text-slate-900">{row.product}</td>
                    <td className="py-3.5 px-4 text-center text-slate-400 font-normal">{row.uom}</td>
                    <td className="py-3.5 px-4 text-right font-normal text-slate-700">{row.totalStock.toLocaleString()}</td>
                    <td className="py-3.5 px-4 text-center text-slate-500 font-normal">{row.lastSale}</td>
                    <td className="py-3.5 px-5 text-center">
                      <span className="text-rose-600 font-bold bg-rose-50 border border-rose-100 px-3 py-1 rounded-full text-[10px]">
                        {row.daysSince} days
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
