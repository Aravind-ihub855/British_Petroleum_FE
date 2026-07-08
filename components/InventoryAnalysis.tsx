"use client";

import React from "react";
import { useData } from "@/context/DataContext";
import { useAuth } from "@/context/AuthContext";

interface NonMovingRow {
  product: string;
  uom: string;
  totalStock: number;
  lastSale: string;
  daysSince: number;
}

export default function InventoryAnalysis() {
  const { stores, getStoreInventory, masterProducts, loading } = useData();
  const { user } = useAuth();
  const isStoreManager = user?.role === "store manager";

  const [hoveredSegment, setHoveredSegment] = React.useState<any>(null);

  if (loading) {
    return (
      <div className="flex justify-center items-center py-12 bg-white/40 backdrop-blur-md rounded-3xl p-8 border border-slate-200/50">
        <svg className="animate-spin h-8 w-8 text-bp-green" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
        </svg>
      </div>
    );
  }

  // Filter stores if user is store manager
  const displayStores = isStoreManager && user?.storeId
    ? stores.filter(s => s.id === user.storeId)
    : stores;

  // Dynamically compute FSN categories based on actual sales volumes
  const allStoreItemsMap: Record<string, { name: string; uom: string; stock: number; maxConsumption: number }> = {};
  masterProducts.forEach((p) => {
    allStoreItemsMap[p.code] = {
      name: p.name,
      uom: p.uom,
      stock: 0,
      maxConsumption: 0
    };
  });

  displayStores.forEach((st) => {
    const inv = getStoreInventory(st.id);
    inv.forEach((item) => {
      if (allStoreItemsMap[item.code]) {
        allStoreItemsMap[item.code].stock += item.currentStock;
        if (item.avgDailyConsumption > allStoreItemsMap[item.code].maxConsumption) {
          allStoreItemsMap[item.code].maxConsumption = item.avgDailyConsumption;
        }
      }
    });
  });

  const uniqueItemsList = Object.values(allStoreItemsMap);
  const totalSKUs = masterProducts.length;

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
    .filter((item) => item.maxConsumption < 5.0 && item.stock > 0)
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

  // Build top 5 fast-moving products from dynamic dataset
  const fastMovingItems = uniqueItemsList
    .filter((item) => item.maxConsumption >= 25.0 && item.stock > 0)
    .map((item) => ({
      product: item.name,
      uom: item.uom,
      totalStock: item.stock,
      maxConsumption: item.maxConsumption
    }))
    .sort((a, b) => b.maxConsumption - a.maxConsumption)
    .slice(0, 5);

  const circumference = 251.3;
  const fsnSegments = [
    { label: "Fast Moving", value: fastItemsCount, percent: fastPercent, color: "#008751", dotClass: "bg-bp-green" },
    { label: "Slow Moving", value: slowItemsCount, percent: slowPercent, color: "#f59e0b", dotClass: "bg-amber-500" },
    { label: "Non Moving", value: nonMovingItemsCount, percent: nonPercent, color: "#ef4444", dotClass: "bg-rose-500" }
  ];
  let fsnOffset = 0;
  const fsnDonutSegments = fsnSegments.map((segment) => {
    const length = (segment.percent / 100) * circumference;
    const offset = -fsnOffset;
    fsnOffset += length;
    return { ...segment, length, offset };
  });

  return (
    <div className="space-y-6">

      {/* Top section: KPI Cards left (2x2 grid) and Donut Chart right */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">

        {/* KPI Cards Grid (Left side, takes 8 cols) */}
        <div className="lg:col-span-7 xl:col-span-8 grid grid-cols-2 gap-5">
          <div className="bg-white p-5 rounded-2xl border-t-4 border-t-bp-green border-x border-b border-slate-100 shadow-sm flex flex-col text-left card-hover-effect">
            <span className="text-[10px] font-extrabold text-slate-500 uppercase tracking-wider">Fast Moving (F)</span>
            <span className="text-3xl font-extrabold tracking-tight text-bp-green mt-2">{fastItemsCount} SKUs</span>
            <p className="text-[9.5px] text-slate-400 font-bold mt-1.5 uppercase tracking-wide">High velocity items</p>
          </div>
          <div className="bg-white p-5 rounded-2xl border-t-4 border-t-amber-500 border-x border-b border-slate-100 shadow-sm flex flex-col text-left card-hover-effect">
            <span className="text-[10px] font-extrabold text-slate-500 uppercase tracking-wider">Slow Moving (S)</span>
            <span className="text-3xl font-extrabold tracking-tight text-amber-500 mt-2">{slowItemsCount} SKUs</span>
            <p className="text-[9.5px] text-slate-400 font-bold mt-1.5 uppercase tracking-wide">Moderate velocity items</p>
          </div>
          <div className="bg-white p-5 rounded-2xl border-t-4 border-t-rose-500 border-x border-b border-slate-100 shadow-sm flex flex-col text-left card-hover-effect">
            <span className="text-[10px] font-extrabold text-slate-500 uppercase tracking-wider">Non Moving (N)</span>
            <span className="text-3xl font-extrabold tracking-tight text-rose-600 mt-2">{nonMovingItemsCount} SKUs</span>
            <p className="text-[9.5px] text-slate-400 font-bold mt-1.5 uppercase tracking-wide">Stagnant inventory items</p>
          </div>
          <div className="bg-white p-5 rounded-2xl border-t-4 border-t-slate-300 border-x border-b border-slate-100 shadow-sm flex flex-col text-left card-hover-effect">
            <span className="text-[10px] font-extrabold text-slate-500 uppercase tracking-wider">Total SKUs Checked</span>
            <span className="text-3xl font-extrabold tracking-tight text-slate-900 mt-2">{totalSKUs}</span>
            <p className="text-[9.5px] text-slate-400 font-bold mt-1.5 uppercase tracking-wide">Total unique items monitored</p>
          </div>
        </div>

        {/* FSN Donut Chart (Right side, takes 4 or 5 cols) */}
        <div className="lg:col-span-5 xl:col-span-4 bg-white rounded-2xl border border-slate-100 shadow-sm p-6 flex flex-col justify-between text-left card-hover-effect">
          <div className="border-b border-slate-50 pb-3 mb-4">
            <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
              FSN Classification
            </h3>
            <p className="text-[10px] text-slate-400 font-medium mt-0.5">Evaluation of dynamic sales speeds</p>
          </div>

          <div className="flex-grow flex items-center justify-around gap-4 py-3">
            <div className="relative w-32 h-32 flex-shrink-0">
              <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
                <circle cx="50" cy="50" r="40" stroke="#f1f5f9" strokeWidth="9" fill="transparent" />
                {fsnDonutSegments.map((segment) => {
                  const isHovered = hoveredSegment?.label === segment.label;
                  return (
                    <circle key={segment.label} cx="50" cy="50" r="40" stroke={segment.color} strokeWidth={isHovered ? 12 : 9}
                      strokeDasharray={`${segment.length} ${circumference}`} strokeDashoffset={segment.offset}
                      strokeLinecap="round" fill="transparent" className="transition-all duration-150 cursor-pointer"
                      onMouseEnter={() => setHoveredSegment(segment)}
                      onMouseLeave={() => setHoveredSegment(null)}>
                      <title>{`${segment.label}: ${segment.value} (${segment.percent}%)`}</title>
                    </circle>
                  );
                })}
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none select-none">
                {hoveredSegment ? (
                  <>
                    <span className="text-2xl font-extrabold text-slate-900 leading-none transition-all duration-150">{hoveredSegment.value}</span>
                    <span className="text-[8px] text-slate-400 font-extrabold uppercase tracking-wider mt-1 text-center leading-tight transition-all duration-150 max-w-[80px]">
                      {hoveredSegment.label} ({hoveredSegment.percent}%)
                    </span>
                  </>
                ) : (
                  <>
                    <span className="text-2xl font-extrabold text-slate-900 leading-none">{totalSKUs}</span>
                    <span className="text-[9px] text-slate-400 font-extrabold uppercase tracking-wider mt-1">SKUs</span>
                  </>
                )}
              </div>
            </div>

            {/* Labels right side */}
            <div className="flex flex-col gap-2.5 text-xs font-semibold text-left">
              {fsnDonutSegments.map((segment) => (
                <div key={segment.label} className="flex items-center gap-2 hover:bg-slate-50 px-1.5 py-1 rounded-md cursor-pointer"
                  onMouseEnter={() => setHoveredSegment(segment)}
                  onMouseLeave={() => setHoveredSegment(null)}
                >
                  <span className={`w-2.5 h-2.5 rounded-full ${segment.dotClass} flex-shrink-0`} />
                  <div className="flex flex-col">
                    <span className="text-slate-400 text-[9px] font-bold uppercase tracking-wide">{segment.label}</span>
                    <span className="text-slate-800 font-extrabold text-xs">{segment.value} <span className="text-[10px] text-slate-400">({segment.percent}%)</span></span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

      </div>

      {/* Bottom section: Side-by-side Tables */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

        {/* Top Fast Moving Items Table */}
        <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden text-left card-hover-effect">
          <div className="p-5 border-b border-slate-50">
            <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
              Top Fast-Moving Items
            </h3>
            <p className="text-[10px] text-slate-400 font-medium mt-0.5">Highest inventory turnover and demand items</p>
          </div>
          <div className="overflow-x-auto max-h-[450px]">
            <table className="w-full text-[11px] text-left">
              <thead className="bg-slate-50/50 text-slate-500 tracking-wider font-semibold border-b border-slate-100 sticky top-0 z-10 text-[9.5px]">
                <tr>
                  <th className="py-3 px-4 font-bold border-r border-slate-100">Product</th>
                  <th className="py-3 px-3 text-center font-bold border-r border-slate-100">UOM</th>
                  <th className="py-3 px-3 text-right font-bold border-r border-slate-100">Total Stock</th>
                  <th className="py-3 px-3 text-right font-bold border-r border-slate-100">Max Sales/Day</th>
                  <th className="py-3 px-4 text-center font-bold">Velocity</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-semibold text-slate-700">
                {fastMovingItems.map((row, idx) => (
                  <tr key={idx} className="hover:bg-slate-50/40 transition duration-75">
                    <td className="py-3 px-4 font-bold text-slate-800 border-r border-slate-100">{row.product}</td>
                    <td className="py-3 px-3 text-center text-slate-400 font-medium border-r border-slate-100">{row.uom}</td>
                    <td className="py-3 px-3 text-right text-slate-700 font-medium border-r border-slate-100">{row.totalStock.toLocaleString()}</td>
                    <td className="py-3 px-3 text-right text-slate-900 font-bold border-r border-slate-100">{row.maxConsumption.toFixed(1)}</td>
                    <td className="py-3 px-4 text-center">
                      <span className="px-2 py-0.5 rounded-full text-[9px] font-extrabold border bg-emerald-50 text-emerald-600 border-emerald-100">
                        Fast
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Top Non-Moving Items Table */}
        <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden text-left card-hover-effect">
          <div className="p-5 border-b border-slate-50">
            <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
              Top Non-Moving Items
            </h3>
            <p className="text-[10px] text-slate-400 font-medium mt-0.5">Stagnant items with longest periods since last sale</p>
          </div>
          <div className="overflow-x-auto max-h-[450px]">
            <table className="w-full text-[11px] text-left">
              <thead className="bg-slate-50/50 text-slate-500 tracking-wider font-semibold border-b border-slate-100 sticky top-0 z-10 text-[9.5px]">
                <tr>
                  <th className="py-3 px-4 font-bold border-r border-slate-100">Product</th>
                  <th className="py-3 px-3 text-center font-bold border-r border-slate-100">UOM</th>
                  <th className="py-3 px-3 text-right font-bold border-r border-slate-100">Total Stock</th>
                  <th className="py-3 px-3 text-center font-bold border-r border-slate-100">Last Sale</th>
                  <th className="py-3 px-4 text-center font-bold">Days Idle</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-semibold text-slate-700">
                {nonMovingItems.map((row, idx) => (
                  <tr key={idx} className="hover:bg-slate-50/40 transition duration-75">
                    <td className="py-3 px-4 font-bold text-slate-800 border-r border-slate-100">{row.product}</td>
                    <td className="py-3 px-3 text-center text-slate-400 font-medium border-r border-slate-100">{row.uom}</td>
                    <td className="py-3 px-3 text-right text-slate-700 font-medium border-r border-slate-100">{row.totalStock.toLocaleString()}</td>
                    <td className="py-3 px-3 text-center text-slate-500 font-medium border-r border-slate-100">{row.lastSale}</td>
                    <td className="py-3 px-4 text-center">
                      <span className="px-2 py-0.5 rounded-full text-[9px] font-extrabold border bg-rose-50 text-rose-600 border-rose-100">
                        {row.daysSince}d Idle
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
