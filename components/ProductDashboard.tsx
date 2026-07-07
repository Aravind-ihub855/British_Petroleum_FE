"use client";

import React, { useState } from "react";
import { masterProducts, getStoreInventory, stores } from "@/utils/mockDb";

interface ProductDashboardProps {
  onNavigate: (tabId: string, subTabId: string, vendorName?: string, productCode?: string) => void;
}

export default function ProductDashboard({ onNavigate }: ProductDashboardProps) {
  const [selectedProductCode, setSelectedProductCode] = useState(masterProducts[0].code);

  const activeProduct = masterProducts.find((p) => p.code === selectedProductCode) || masterProducts[0];

  // Scan all stores carrying this product dynamically
  const carryingStores: { storeId: string; storeName: string; city: string; currentStock: number; avgConsumption: number; predictedStockoutDate: string; roq: number; orderByDate: string; prMrStatus: string; riskLevel: string }[] = [];

  stores.forEach((st) => {
    const inv = getStoreInventory(st.id);
    const item = inv.find((p) => p.code === selectedProductCode);
    if (item) {
      carryingStores.push({
        storeId: st.id,
        storeName: st.name,
        city: st.city,
        currentStock: item.currentStock,
        avgConsumption: item.avgDailyConsumption,
        predictedStockoutDate: item.predictedStockoutDate,
        roq: item.recommendedRoq,
        orderByDate: item.orderByDate,
        prMrStatus: item.prMrStatus,
        riskLevel: item.riskLevel
      });
    }
  });

  // Calculate dynamic KPIs
  const totalCarrying = carryingStores.length;
  const totalStock = carryingStores.reduce((sum, s) => sum + s.currentStock, 0);
  const totalRoq = carryingStores.reduce((sum, s) => sum + s.roq, 0);
  const storesAtRisk = carryingStores.filter((s) => s.prMrStatus === "PR").length;
  const stockoutIn7Days = carryingStores.filter((s) => s.riskLevel === "High").length;

  return (
    <div className="space-y-6">
      
      {/* Top Filter Controls */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 bg-white p-5 rounded-xl border border-slate-100 shadow-xs">
        <div>
          <h2 className="text-sm font-bold text-slate-800">
            Item / Product Analysis
          </h2>
          <p className="text-[11px] text-slate-400 font-medium mt-0.5">
            Select a product category to review outlet allocations.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold text-slate-500">Select Product</span>
          <select
            value={selectedProductCode}
            onChange={(e) => setSelectedProductCode(e.target.value)}
            className="bg-white border border-slate-200 text-xs font-semibold text-slate-700 py-1.5 px-3 rounded-lg focus:outline-none focus:ring-1 focus:ring-bp-green transition duration-150 shadow-xs max-w-xs"
          >
            {masterProducts.map((p) => (
              <option key={p.code} value={p.code}>
                {p.name} ({p.code})
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* KPI Cards Row */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
        <div className="bg-white p-5 rounded-xl border border-slate-100 shadow-xs flex flex-col text-left">
          <span className="text-xs font-semibold text-slate-400 tracking-wide">Total Stores Carrying</span>
          <span className="text-2xl font-bold tracking-tight text-slate-900 mt-2">{totalCarrying}</span>
        </div>
        <div className="bg-white p-5 rounded-xl border border-slate-100 shadow-xs flex flex-col text-left">
          <span className="text-xs font-semibold text-slate-400 tracking-wide">Total Current Stock</span>
          <span className="text-2xl font-bold tracking-tight text-slate-900 mt-2">
            {totalStock.toLocaleString()} {activeProduct.uom === "Litres" ? "Ltr" : activeProduct.uom === "Kilograms" ? "Kg" : "Pcs"}
          </span>
        </div>
        <div className="bg-white p-5 rounded-xl border border-slate-100 shadow-xs flex flex-col text-left">
          <span className="text-xs font-semibold text-slate-400 tracking-wide">Total ROQ (Recommended)</span>
          <span className="text-2xl font-bold tracking-tight text-slate-900 mt-2">
            {totalRoq.toLocaleString()} {activeProduct.uom === "Litres" ? "Ltr" : activeProduct.uom === "Kilograms" ? "Kg" : "Pcs"}
          </span>
        </div>
        <div className="bg-white p-5 rounded-xl border border-slate-100 shadow-xs flex flex-col text-left">
          <span className="text-xs font-semibold text-slate-400 tracking-wide">Stores at Risk</span>
          <span className="text-2xl font-bold tracking-tight text-rose-600 mt-2">{storesAtRisk}</span>
        </div>
        <div className="bg-white p-5 rounded-xl border border-slate-100 shadow-xs flex flex-col text-left col-span-2 lg:col-span-1">
          <span className="text-xs font-semibold text-slate-400 tracking-wide">Stockout in 7 Days</span>
          <span className="text-2xl font-bold tracking-tight text-rose-600 mt-2">{stockoutIn7Days}</span>
        </div>
      </div>

      {/* Main Predictions Table */}
      <div className="bg-white rounded-xl border border-slate-100 shadow-xs overflow-hidden text-left">
        <div className="p-5 border-b border-slate-50 flex items-center justify-between">
          <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
            Store-wise Stockout Prediction - {activeProduct.name}
          </h3>
          <button
            onClick={() => onNavigate("3", "product_wise", undefined, activeProduct.code)}
            className="text-xs font-bold text-bp-green hover:underline"
          >
            Analyze Sourcing Vendors
          </button>
        </div>
        <div className="overflow-x-auto max-h-[450px]">
          <table className="w-full text-xs text-left">
            <thead className="bg-slate-50 text-slate-500 tracking-wider font-semibold border-b border-slate-100 sticky top-0 z-10">
              <tr>
                <th className="py-3 px-5 font-bold bg-slate-50">Store ID</th>
                <th className="py-3 px-4 font-bold bg-slate-50">Store Name</th>
                <th className="py-3 px-4 font-bold bg-slate-50">City</th>
                <th className="py-3 px-4 text-right font-bold bg-slate-50">Current Stock</th>
                <th className="py-3 px-4 text-right font-bold bg-slate-50">Avg Daily Consumption</th>
                <th className="py-3 px-4 text-center font-bold bg-slate-50">Predicted Stockout Date</th>
                <th className="py-3 px-4 text-right font-bold bg-slate-50">ROQ</th>
                <th className="py-3 px-4 text-center font-bold bg-slate-50">Order Recommendation</th>
                <th className="py-3 px-4 text-center font-bold bg-slate-50">PR/MR Status</th>
                <th className="py-3 px-5 text-center font-bold bg-slate-50">Risk Level</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium text-slate-600">
              {carryingStores.map((row, idx) => {
                const riskColor =
                  row.riskLevel === "High"
                    ? "text-rose-600 bg-rose-50 border-rose-100"
                    : row.riskLevel === "Medium"
                    ? "text-amber-600 bg-amber-50 border-amber-100"
                    : "text-emerald-600 bg-emerald-50 border-emerald-100";

                return (
                  <tr key={idx} className="hover:bg-slate-50/40 transition duration-75">
                    <td className="py-3.5 px-5 font-semibold text-bp-green cursor-pointer hover:underline"
                      onClick={() => onNavigate("2", "store", undefined, undefined)}
                    >
                      {row.storeId}
                    </td>
                    <td className="py-3.5 px-4 text-slate-400 font-normal">{row.storeName}</td>
                    <td className="py-3.5 px-4 text-slate-700 font-normal">{row.city}</td>
                    <td className="py-3.5 px-4 text-right font-normal text-slate-700">{row.currentStock}</td>
                    <td className="py-3.5 px-4 text-right font-normal text-slate-500">{row.avgConsumption}</td>
                    <td className="py-3.5 px-4 text-center font-medium text-slate-800">{row.predictedStockoutDate}</td>
                    <td className="py-3.5 px-4 text-right font-semibold text-bp-green">{row.roq}</td>
                    <td className="py-3.5 px-4 text-center font-medium text-slate-800">{row.orderByDate}</td>
                    <td className="py-3.5 px-4 text-center">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold border ${
                        row.prMrStatus === "PR" ? "bg-rose-50 text-rose-600 border-rose-100" :
                        row.prMrStatus === "MR" ? "bg-amber-50 text-amber-600 border-amber-100" :
                        "bg-slate-50 text-slate-400 border-slate-100"
                      }`}>
                        {row.prMrStatus}
                      </span>
                    </td>
                    <td className="py-3.5 px-5 text-center">
                      <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-semibold border uppercase tracking-wider inline-flex items-center gap-1.5 ${riskColor}`}>
                        <span className={`w-1.5 h-1.5 rounded-full ${
                          row.riskLevel === "High" ? "bg-rose-500" :
                          row.riskLevel === "Medium" ? "bg-amber-500" :
                          "bg-emerald-500"
                        }`} />
                        {row.riskLevel}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* View All Stores trigger bar */}
        <div className="p-4 bg-slate-50/20 border-t border-slate-100 flex items-center justify-end text-xs font-bold text-bp-green">
          <button className="hover:underline transition duration-150">
            View All Stores
          </button>
        </div>
      </div>

    </div>
  );
}
