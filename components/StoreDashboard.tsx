"use client";

import React, { useState } from "react";

interface PredictionRow {
  product: string;
  uom: string;
  currentStock: number;
  avgConsumption: number;
  predictedStockout: string;
  roq: number;
  orderBy: string;
  status: string;
  risk: "High" | "Medium" | "Low";
}

const initialRows: PredictionRow[] = [
  {
    product: "Lube Oil 15W40",
    uom: "Ltr",
    currentStock: 200,
    avgConsumption: 12.5,
    predictedStockout: "03-07-2026",
    roq: 300,
    orderBy: "01-07-2026",
    status: "PR",
    risk: "High",
  },
  {
    product: "Engine Oil 20W50",
    uom: "Ltr",
    currentStock: 150,
    avgConsumption: 8.2,
    predictedStockout: "04-07-2026",
    roq: 250,
    orderBy: "02-07-2026",
    status: "MR",
    risk: "High",
  },
  {
    product: "Hydraulic Oil 68",
    uom: "Ltr",
    currentStock: 80,
    avgConsumption: 4.1,
    predictedStockout: "05-07-2026",
    roq: 150,
    orderBy: "02-07-2026",
    status: "PR",
    risk: "Medium",
  },
  {
    product: "Coolant 1L",
    uom: "Ltr",
    currentStock: 60,
    avgConsumption: 2.8,
    predictedStockout: "06-07-2026",
    roq: 100,
    orderBy: "03-07-2026",
    status: "MR",
    risk: "Medium",
  },
  {
    product: "Brake Fluid DOT 4",
    uom: "Ltr",
    currentStock: 40,
    avgConsumption: 1.6,
    predictedStockout: "07-07-2026",
    roq: 60,
    orderBy: "04-07-2026",
    status: "PR",
    risk: "Medium",
  },
  {
    product: "Grease 3KG",
    uom: "Kg",
    currentStock: 25,
    avgConsumption: 0.9,
    predictedStockout: "09-07-2026",
    roq: 50,
    orderBy: "05-07-2026",
    status: "MR",
    risk: "Low",
  },
  {
    product: "Windshield Washer",
    uom: "Ltr",
    currentStock: 120,
    avgConsumption: 2.0,
    predictedStockout: "15-07-2026",
    roq: 80,
    orderBy: "08-07-2026",
    status: "-",
    risk: "Low",
  },
];

export default function StoreDashboard() {
  const [selectedStore, setSelectedStore] = useState("BP-MUM-1024 (Andheri East)");
  const [targetDate, setTargetDate] = useState("2026-07-01");

  const getKpisForStore = (store: string) => {
    switch (store) {
      case "BP-MUM-1050 (Borivali West)":
        return { totalProds: "980", atRisk: "12", stockout: "4", service: "96.2%" };
      case "BP-MUM-1088 (Bandra)":
        return { totalProds: "1,140", atRisk: "25", stockout: "9", service: "91.8%" };
      case "BP-PUN-2001 (Kothrud)":
        return { totalProds: "850", atRisk: "8", stockout: "3", service: "97.5%" };
      default:
        return { totalProds: "1,250", atRisk: "18", stockout: "6", service: "94%" };
    }
  };

  const kpis = getKpisForStore(selectedStore);

  return (
    <div className="space-y-6">
      
      {/* Top Filter Controls */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 bg-white p-5 rounded-xl border border-slate-100 shadow-xs">
        <div>
          <h2 className="text-sm font-bold text-slate-800">
            Store-Level Predictions
          </h2>
          <p className="text-[11px] text-slate-400 font-medium mt-0.5">
            Select a store outlet and target date to view predictions.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-4">
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-slate-400 tracking-wide">Select Store</span>
            <select
              value={selectedStore}
              onChange={(e) => setSelectedStore(e.target.value)}
              className="bg-white border border-slate-200 text-xs font-semibold text-slate-700 py-1.5 px-3 rounded-lg focus:outline-none focus:ring-1 focus:ring-bp-green transition duration-150 shadow-xs"
            >
              <option>BP-MUM-1024 (Andheri East)</option>
              <option>BP-MUM-1050 (Borivali West)</option>
              <option>BP-MUM-1088 (Bandra)</option>
              <option>BP-PUN-2001 (Kothrud)</option>
            </select>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-slate-400 tracking-wide">Date</span>
            <input
              type="date"
              value={targetDate}
              onChange={(e) => setTargetDate(e.target.value)}
              className="bg-white border border-slate-200 text-xs font-semibold text-slate-700 py-1.5 px-3 rounded-lg focus:outline-none focus:ring-1 focus:ring-bp-green transition duration-150 shadow-xs"
            />
          </div>
        </div>
      </div>

      {/* KPI Cards Row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-xl border border-slate-100 shadow-xs flex flex-col text-left">
          <span className="text-xs font-semibold text-slate-400 tracking-wide">Total Products</span>
          <span className="text-2xl font-bold tracking-tight text-slate-900 mt-2">{kpis.totalProds}</span>
        </div>
        <div className="bg-white p-5 rounded-xl border border-slate-100 shadow-xs flex flex-col text-left">
          <span className="text-xs font-semibold text-slate-400 tracking-wide">At Risk Items</span>
          <span className="text-2xl font-bold tracking-tight text-slate-900 mt-2">{kpis.atRisk}</span>
        </div>
        <div className="bg-white p-5 rounded-xl border border-slate-100 shadow-xs flex flex-col text-left">
          <span className="text-xs font-semibold text-slate-400 tracking-wide">Stockout in 7 Days</span>
          <span className="text-2xl font-bold tracking-tight text-slate-900 mt-2">{kpis.stockout}</span>
        </div>
        <div className="bg-white p-5 rounded-xl border border-slate-100 shadow-xs flex flex-col text-left">
          <span className="text-xs font-semibold text-slate-400 tracking-wide">Service Level</span>
          <span className="text-2xl font-bold tracking-tight text-bp-green mt-2">{kpis.service}</span>
        </div>
      </div>

      {/* Main Predictions Table */}
      <div className="bg-white rounded-xl border border-slate-100 shadow-xs overflow-hidden text-left">
        <div className="p-5 border-b border-slate-50">
          <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
            Stockout Prediction - Store Level
          </h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead className="bg-slate-50/50 text-slate-500 tracking-wider font-semibold border-b border-slate-100">
              <tr>
                <th className="py-3 px-5 font-bold">Product</th>
                <th className="py-3 px-4 text-center font-bold">UOM</th>
                <th className="py-3 px-4 text-right font-bold">Current Stock</th>
                <th className="py-3 px-4 text-right font-bold">Avg Daily Consumption</th>
                <th className="py-3 px-4 text-center font-bold">Predicted Stockout Date</th>
                <th className="py-3 px-4 text-right font-bold">ROQ (Recommended)</th>
                <th className="py-3 px-4 text-center font-bold">Order By (Recommended)</th>
                <th className="py-3 px-4 text-center font-bold">PR/MR Status</th>
                <th className="py-3 px-5 text-center font-bold">Risk Level</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium text-slate-600">
              {initialRows.map((row, idx) => {
                const riskColor =
                  row.risk === "High"
                    ? "text-rose-600 bg-rose-50/70 border-rose-100"
                    : row.risk === "Medium"
                    ? "text-amber-600 bg-amber-50/70 border-amber-100"
                    : "text-emerald-600 bg-emerald-50/70 border-emerald-100";

                return (
                  <tr key={idx} className="hover:bg-slate-50/40 transition duration-75">
                    <td className="py-3.5 px-5 font-semibold text-slate-900">{row.product}</td>
                    <td className="py-3.5 px-4 text-center text-slate-400 font-normal">{row.uom}</td>
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

        {/* Legend Footer */}
        <div className="p-4 bg-slate-50/50 border-t border-slate-100 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 text-[10px] font-semibold text-slate-400">
          <div className="flex flex-wrap items-center gap-4">
            <span className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-rose-500" />
              High (≤ 7 Days)
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-amber-500" />
              Medium (8-15 Days)
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
              Low (&gt; 15 Days)
            </span>
          </div>
          <div className="text-slate-400">
            <span className="font-bold text-slate-500">PR:</span> Purchase Required | <span className="font-bold text-slate-500">MR:</span> Monitor &amp; Reorder
          </div>
        </div>
      </div>

    </div>
  );
}
