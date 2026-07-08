"use client";

import React, { useState, useEffect } from "react";
import { useData } from "@/context/DataContext";

interface ProductDashboardProps {
  onNavigate: (tabId: string, subTabId: string, vendorName?: string, productCode?: string) => void;
}

export default function ProductDashboard({ onNavigate }: ProductDashboardProps) {
  const { stores, masterProducts, getStoreInventory, loading } = useData();
  const [selectedProductCode, setSelectedProductCode] = useState("");

  useEffect(() => {
    if (masterProducts.length > 0 && !selectedProductCode) {
      setSelectedProductCode(masterProducts[0].code);
    }
  }, [masterProducts, selectedProductCode]);

  if (loading || !selectedProductCode) {
    return (
      <div className="flex justify-center items-center py-12 bg-white/40 backdrop-blur-md rounded-3xl p-8 border border-slate-200/50">
        <svg className="animate-spin h-8 w-8 text-bp-green" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
        </svg>
      </div>
    );
  }

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
    <div className="space-y-8 animate-fadeIn">
      
      {/* Top Filter Controls */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 bg-white p-5 rounded-2xl border border-slate-100 shadow-sm card-hover-effect text-left">
        <div>
          <h2 className="text-sm font-extrabold text-slate-900 tracking-tight">
            Item / Product Analysis
          </h2>
          <p className="text-[10px] text-slate-400 font-semibold mt-0.5 leading-snug">
            Select a product category to review outlet allocations.
          </p>
        </div>
        <div className="flex items-center gap-2.5">
          <span className="text-xs font-bold text-slate-500">Select Product</span>
          <select
            value={selectedProductCode}
            onChange={(e) => setSelectedProductCode(e.target.value)}
            className="bg-slate-50 border border-slate-200 text-xs font-bold text-slate-700 py-2 px-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-bp-green transition duration-150 shadow-sm max-w-xs"
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
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-5">
        <div className="bg-white p-5 rounded-2xl border-t-4 border-t-bp-green border-x border-b border-slate-100 shadow-sm flex flex-col text-left card-hover-effect">
          <span className="text-[10px] font-extrabold text-slate-500 uppercase tracking-wider">Stores Carrying</span>
          <span className="text-3xl font-extrabold tracking-tight text-slate-900 mt-2">{totalCarrying}</span>
        </div>
        <div className="bg-white p-5 rounded-2xl border-t-4 border-t-bp-green border-x border-b border-slate-100 shadow-sm flex flex-col text-left card-hover-effect">
          <span className="text-[10px] font-extrabold text-slate-500 uppercase tracking-wider">Total Current Stock</span>
          <span className="text-3xl font-extrabold tracking-tight text-slate-900 mt-2">
            {totalStock.toLocaleString()} <span className="text-xs font-bold text-slate-400 ml-0.5">{activeProduct.uom === "Litres" ? "Ltr" : activeProduct.uom === "Kilograms" ? "Kg" : "Pcs"}</span>
          </span>
        </div>
        <div className="bg-white p-5 rounded-2xl border-t-4 border-t-bp-yellow border-x border-b border-slate-100 shadow-sm flex flex-col text-left card-hover-effect">
          <span className="text-[10px] font-extrabold text-slate-500 uppercase tracking-wider">Total ROQ</span>
          <span className="text-3xl font-extrabold tracking-tight text-slate-900 mt-2">
            {totalRoq.toLocaleString()} <span className="text-xs font-bold text-slate-400 ml-0.5">{activeProduct.uom === "Litres" ? "Ltr" : activeProduct.uom === "Kilograms" ? "Kg" : "Pcs"}</span>
          </span>
        </div>
        <div className="bg-white p-5 rounded-2xl border-t-4 border-t-rose-500 border-x border-b border-slate-100 shadow-sm flex flex-col text-left card-hover-effect">
          <span className="text-[10px] font-extrabold text-slate-500 uppercase tracking-wider">Stores at Risk</span>
          <span className="text-3xl font-extrabold tracking-tight text-rose-600 mt-2">{storesAtRisk}</span>
        </div>
        <div className="bg-white p-5 rounded-2xl border-t-4 border-t-rose-500 border-x border-b border-slate-100 shadow-sm flex flex-col text-left card-hover-effect col-span-2 lg:col-span-1">
          <span className="text-[10px] font-extrabold text-slate-500 uppercase tracking-wider">Stockout in 7 Days</span>
          <span className="text-3xl font-extrabold tracking-tight text-rose-600 mt-2">{stockoutIn7Days}</span>
        </div>
      </div>

      {/* Main Predictions Table */}
      <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden text-left card-hover-effect">
        <div className="px-6 py-5 border-b border-slate-50 flex items-center justify-between">
          <div>
            <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
              Store-wise Stockout Prediction - {activeProduct.name}
            </h3>
            <p className="text-[10px] text-slate-400 font-medium mt-0.5">Location inventory levels and direct sourcing shortcut options</p>
          </div>
          <button
            onClick={() => onNavigate("3", "product_wise", undefined, activeProduct.code)}
            className="text-xs font-extrabold text-bp-green hover:text-bp-green-dark"
          >
            Analyze Sourcing Vendors
          </button>
        </div>
        <div className="overflow-x-auto max-h-[450px] scrollbar-thin">
          <table className="w-full text-[11px] text-left">
            <thead className="bg-slate-100 text-slate-700 font-extrabold tracking-wider uppercase border-b border-slate-200 sticky top-0 z-10 text-[9.5px]">
              <tr>
                <th className="py-2.5 px-3 border-r border-slate-200 text-center">Store ID</th>
                <th className="py-2.5 px-2 border-r border-slate-200 text-center leading-tight">
                  <div className="flex flex-col items-center justify-center">
                    <span>Store</span>
                    <span>Name</span>
                  </div>
                </th>
                <th className="py-2.5 px-2 border-r border-slate-200 text-center">City</th>
                <th className="py-2.5 px-2 border-r border-slate-200 text-center leading-tight">
                  <div className="flex flex-col items-center justify-center">
                    <span>Current</span>
                    <span>Stock</span>
                  </div>
                </th>
                <th className="py-2.5 px-2 border-r border-slate-200 text-center leading-tight">
                  <div className="flex flex-col items-center justify-center">
                    <span>Avg Daily</span>
                    <span>Consumption</span>
                  </div>
                </th>
                <th className="py-2.5 px-2 border-r border-slate-200 text-center leading-tight">
                  <div className="flex flex-col items-center justify-center">
                    <span>Stockout</span>
                    <span>Date</span>
                  </div>
                </th>
                <th className="py-2.5 px-2 border-r border-slate-200 text-center">ROQ</th>
                <th className="py-2.5 px-2 border-r border-slate-200 text-center leading-tight">
                  <div className="flex flex-col items-center justify-center">
                    <span>Order</span>
                    <span>Recommendation</span>
                  </div>
                </th>
                <th className="py-2.5 px-2 border-r border-slate-200 text-center">Status</th>
                <th className="py-2.5 px-2.5 text-center leading-tight">
                  <div className="flex flex-col items-center justify-center">
                    <span>Risk</span>
                    <span>Level</span>
                  </div>
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100/60 font-semibold text-slate-700">
              {carryingStores.map((row, idx) => {
                const riskColor =
                  row.riskLevel === "High"
                    ? "text-rose-600 bg-rose-50 border-rose-100"
                    : "text-slate-600 bg-slate-50 border-slate-200";

                return (
                  <tr key={idx} className="hover:bg-slate-50/50 transition duration-75">
                    <td className="py-2.5 px-3 font-bold text-slate-800 hover:text-bp-green cursor-pointer border-r border-slate-100 text-center"
                      onClick={() => onNavigate("2", "store", undefined, undefined)}
                    >
                      {row.storeId}
                    </td>
                    <td className="py-2.5 px-2 text-slate-700 font-bold border-r border-slate-100 text-center">{row.storeName}</td>
                    <td className="py-2.5 px-2 text-slate-500 font-medium border-r border-slate-100 text-center">{row.city}</td>
                    <td className="py-2.5 px-2 text-center text-slate-700 font-normal border-r border-slate-100">{row.currentStock}</td>
                    <td className="py-2.5 px-2 text-center text-slate-500 font-medium border-r border-slate-100">{row.avgConsumption}</td>
                    <td className="py-2.5 px-2 text-center border-r border-slate-100">
                      <div className="font-bold text-slate-800 whitespace-nowrap">
                        {row.predictedStockoutDate}
                      </div>
                    </td>
                    <td className="py-2.5 px-2 text-center font-bold text-slate-800 border-r border-slate-100">{row.roq}</td>
                    <td className="py-2.5 px-2 text-center font-bold text-slate-800 border-r border-slate-100 whitespace-nowrap">{row.orderByDate}</td>
                    <td className="py-2.5 px-2 text-center border-r border-slate-100">
                      <span className="px-2 py-0.5 rounded-full text-[9px] font-extrabold border bg-slate-50 text-slate-600 border-slate-200">
                        {row.prMrStatus}
                      </span>
                    </td>
                    <td className="py-2.5 px-2.5 text-center">
                      <span className={`px-2 py-0.5 rounded-full text-[8.5px] font-extrabold border uppercase tracking-wider inline-flex items-center gap-1 ${riskColor}`}>
                        <span className={`w-1 h-1 rounded-full ${
                          row.riskLevel === "High" ? "bg-rose-500" :
                          "bg-slate-400"
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
        <div className="p-4 bg-slate-50/50 border-t border-slate-100 flex items-center justify-end text-xs font-bold text-bp-green">
          <button className="hover:text-bp-green-dark transition duration-150 cursor-pointer"
            onClick={() => onNavigate("2", "store", undefined, undefined)}
          >
            View All Stores
          </button>
        </div>
      </div>

    </div>
  );
}
