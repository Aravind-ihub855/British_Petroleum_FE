"use client";

import React, { useState } from "react";

interface ProductStoreRow {
  storeId: string;
  storeName: string;
  city: string;
  currentStock: number;
  avgConsumption: number;
  predictedStockout: string;
  roq: number;
  orderBy: string;
  status: string;
  risk: "High" | "Medium" | "Low";
}

const initialProductStores: ProductStoreRow[] = [
  {
    storeId: "BP-MUM-1024",
    storeName: "Andheri East",
    city: "Mumbai",
    currentStock: 200,
    avgConsumption: 12.5,
    predictedStockout: "03-07-2026",
    roq: 300,
    orderBy: "01-07-2026",
    status: "PR",
    risk: "High",
  },
  {
    storeId: "BP-MUM-1050",
    storeName: "Borivali West",
    city: "Mumbai",
    currentStock: 150,
    avgConsumption: 10.1,
    predictedStockout: "04-07-2026",
    roq: 250,
    orderBy: "02-07-2026",
    status: "PR",
    risk: "High",
  },
  {
    storeId: "BP-MUM-1088",
    storeName: "Bandra",
    city: "Mumbai",
    currentStock: 90,
    avgConsumption: 6.2,
    predictedStockout: "06-07-2026",
    roq: 200,
    orderBy: "03-07-2026",
    status: "MR",
    risk: "Medium",
  },
  {
    storeId: "BP-PUN-2001",
    storeName: "Kothrud",
    city: "Pune",
    currentStock: 180,
    avgConsumption: 11.5,
    predictedStockout: "05-07-2026",
    roq: 250,
    orderBy: "02-07-2026",
    status: "PR",
    risk: "Medium",
  },
  {
    storeId: "BP-PUN-2015",
    storeName: "Hinjewadi",
    city: "Pune",
    currentStock: 120,
    avgConsumption: 8.0,
    predictedStockout: "06-07-2026",
    roq: 200,
    orderBy: "03-07-2026",
    status: "MR",
    risk: "Medium",
  },
];

export default function ProductDashboard() {
  const [selectedProduct, setSelectedProduct] = useState("Lube Oil 15W40");

  const getProductKpis = (product: string) => {
    switch (product) {
      case "Engine Oil 20W50":
        return { carrying: "920", currentStock: "112,450 Ltr", roq: "180,000 Ltr", atRisk: "62", stockouts: "18" };
      case "Hydraulic Oil 68":
        return { carrying: "450", currentStock: "84,300 Ltr", roq: "95,000 Ltr", atRisk: "45", stockouts: "14" };
      default:
        return { carrying: "1,120", currentStock: "156,750 Ltr", roq: "210,000 Ltr", atRisk: "85", stockouts: "28" };
    }
  };

  const kpis = getProductKpis(selectedProduct);

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
            value={selectedProduct}
            onChange={(e) => setSelectedProduct(e.target.value)}
            className="bg-white border border-slate-200 text-xs font-semibold text-slate-700 py-1.5 px-3 rounded-lg focus:outline-none focus:ring-1 focus:ring-bp-green transition duration-150 shadow-xs"
          >
            <option>Lube Oil 15W40</option>
            <option>Engine Oil 20W50</option>
            <option>Hydraulic Oil 68</option>
            <option>Coolant 1L</option>
          </select>
        </div>
      </div>

      {/* KPI Cards Row */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
        <div className="bg-white p-5 rounded-xl border border-slate-100 shadow-xs flex flex-col text-left">
          <span className="text-xs font-semibold text-slate-400 tracking-wide">Total Stores Carrying</span>
          <span className="text-2xl font-bold tracking-tight text-slate-900 mt-2">{kpis.carrying}</span>
        </div>
        <div className="bg-white p-5 rounded-xl border border-slate-100 shadow-xs flex flex-col text-left">
          <span className="text-xs font-semibold text-slate-400 tracking-wide">Total Current Stock</span>
          <span className="text-2xl font-bold tracking-tight text-slate-900 mt-2">{kpis.currentStock}</span>
        </div>
        <div className="bg-white p-5 rounded-xl border border-slate-100 shadow-xs flex flex-col text-left">
          <span className="text-xs font-semibold text-slate-400 tracking-wide">Total ROQ (Recommended)</span>
          <span className="text-2xl font-bold tracking-tight text-slate-900 mt-2">{kpis.roq}</span>
        </div>
        <div className="bg-white p-5 rounded-xl border border-slate-100 shadow-xs flex flex-col text-left">
          <span className="text-xs font-semibold text-slate-400 tracking-wide">Stores at Risk</span>
          <span className="text-2xl font-bold tracking-tight text-rose-600 mt-2">{kpis.atRisk}</span>
        </div>
        <div className="bg-white p-5 rounded-xl border border-slate-100 shadow-xs flex flex-col text-left col-span-2 lg:col-span-1">
          <span className="text-xs font-semibold text-slate-400 tracking-wide">Stockout in 7 Days</span>
          <span className="text-2xl font-bold tracking-tight text-rose-600 mt-2">{kpis.stockouts}</span>
        </div>
      </div>

      {/* Main Predictions Table */}
      <div className="bg-white rounded-xl border border-slate-100 shadow-xs overflow-hidden text-left">
        <div className="p-5 border-b border-slate-50">
          <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
            Store-wise Stockout Prediction - {selectedProduct}
          </h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead className="bg-slate-50/50 text-slate-500 tracking-wider font-semibold border-b border-slate-100">
              <tr>
                <th className="py-3 px-5 font-bold">Store ID</th>
                <th className="py-3 px-4 font-bold">Store Name</th>
                <th className="py-3 px-4 font-bold">City</th>
                <th className="py-3 px-4 text-right font-bold">Current Stock (Ltr)</th>
                <th className="py-3 px-4 text-right font-bold">Avg Daily Consumption</th>
                <th className="py-3 px-4 text-center font-bold">Predicted Stockout Date</th>
                <th className="py-3 px-4 text-right font-bold">ROQ (Ltr)</th>
                <th className="py-3 px-4 text-center font-bold">Order By</th>
                <th className="py-3 px-4 text-center font-bold">PR/MR Status</th>
                <th className="py-3 px-5 text-center font-bold">Risk Level</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium text-slate-600">
              {initialProductStores.map((row, idx) => {
                const riskColor =
                  row.risk === "High"
                    ? "text-rose-600 bg-rose-50 border-rose-100"
                    : row.risk === "Medium"
                    ? "text-amber-600 bg-amber-50 border-amber-100"
                    : "text-emerald-600 bg-emerald-50 border-emerald-100";

                return (
                  <tr key={idx} className="hover:bg-slate-50/40 transition duration-75">
                    <td className="py-3.5 px-5 font-semibold text-slate-900">{row.storeId}</td>
                    <td className="py-3.5 px-4 text-slate-400 font-normal">{row.storeName}</td>
                    <td className="py-3.5 px-4 text-slate-700 font-normal">{row.city}</td>
                    <td className="py-3.5 px-4 text-right font-normal text-slate-700">{row.currentStock}</td>
                    <td className="py-3.5 px-4 text-right font-normal text-slate-500">{row.avgConsumption}</td>
                    <td className="py-3.5 px-4 text-center font-medium text-slate-800">{row.predictedStockout}</td>
                    <td className="py-3.5 px-4 text-right font-semibold text-bp-green">{row.roq}</td>
                    <td className="py-3.5 px-4 text-center font-medium text-slate-800">{row.orderBy}</td>
                    <td className="py-3.5 px-4 text-center">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                        row.status === "PR" ? "bg-rose-50 text-rose-600 border border-rose-100" :
                        row.status === "MR" ? "bg-amber-50 text-amber-600 border border-amber-100" :
                        "bg-slate-100 text-slate-400"
                      }`}>
                        {row.status}
                      </span>
                    </td>
                    <td className="py-3.5 px-5 text-center">
                      <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-semibold border uppercase tracking-wider inline-flex items-center gap-1.5 ${riskColor}`}>
                        <span className={`w-1.5 h-1.5 rounded-full ${
                          row.risk === "High" ? "bg-rose-500" :
                          row.risk === "Medium" ? "bg-amber-500" :
                          "bg-emerald-500"
                        }`} />
                        {row.risk}
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
