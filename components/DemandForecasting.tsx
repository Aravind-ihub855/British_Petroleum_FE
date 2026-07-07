"use client";

import React, { useState } from "react";

interface ForecastRow {
  date: string;
  historicalAvg: string;
  forecasted: string;
  confidenceInterval: string;
  safetyStock: string;
  action: "Monitor" | "Reorder Recommended" | "Reorder Required";
}

const forecastSchedule: ForecastRow[] = [
  {
    date: "02-07-2026",
    historicalAvg: "12.0 Ltr",
    forecasted: "12.5 Ltr",
    confidenceInterval: "11.8 - 13.2 Ltr",
    safetyStock: "150 Ltr",
    action: "Monitor",
  },
  {
    date: "03-07-2026",
    historicalAvg: "12.2 Ltr",
    forecasted: "13.0 Ltr",
    confidenceInterval: "12.2 - 13.8 Ltr",
    safetyStock: "150 Ltr",
    action: "Reorder Recommended",
  },
  {
    date: "04-07-2026",
    historicalAvg: "11.9 Ltr",
    forecasted: "12.8 Ltr",
    confidenceInterval: "12.0 - 13.6 Ltr",
    safetyStock: "150 Ltr",
    action: "Monitor",
  },
  {
    date: "05-07-2026",
    historicalAvg: "12.5 Ltr",
    forecasted: "13.5 Ltr",
    confidenceInterval: "12.5 - 14.5 Ltr",
    safetyStock: "150 Ltr",
    action: "Monitor",
  },
  {
    date: "06-07-2026",
    historicalAvg: "12.8 Ltr",
    forecasted: "13.8 Ltr",
    confidenceInterval: "12.8 - 14.8 Ltr",
    safetyStock: "150 Ltr",
    action: "Monitor",
  },
  {
    date: "07-07-2026",
    historicalAvg: "13.0 Ltr",
    forecasted: "14.2 Ltr",
    confidenceInterval: "13.2 - 15.2 Ltr",
    safetyStock: "150 Ltr",
    action: "Reorder Required",
  },
];

export default function DemandForecasting() {
  const [selectedStore, setSelectedStore] = useState("BP-MUM-1024 (Andheri East)");
  const [selectedProduct, setSelectedProduct] = useState("Lube Oil 15W40");
  const [horizon, setHorizon] = useState("30 Days");

  const getKpis = (prod: string) => {
    switch (prod) {
      case "Engine Oil 20W50":
        return { mape: "93.8%", trend: "+1.5%", demand: "14,850 Ltr", safety: "180 Ltr", reorder: "400 Ltr" };
      case "Hydraulic Oil 68":
        return { mape: "91.2%", trend: "+0.8%", demand: "9,600 Ltr", safety: "120 Ltr", reorder: "280 Ltr" };
      default:
        return { mape: "92.6%", trend: "+1.2%", demand: "12,450 Ltr", safety: "150 Ltr", reorder: "350 Ltr" };
    }
  };

  const kpis = getKpis(selectedProduct);

  return (
    <div className="space-y-6">
      
      {/* Top Filter Controls */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 bg-white p-5 rounded-xl border border-slate-100 shadow-xs">
        <div>
          <h2 className="text-sm font-bold text-slate-800">
            Demand Forecasting Models
          </h2>
          <p className="text-[11px] text-slate-400 font-medium mt-0.5">
            Run predictive model projections for safety stocks and reorders.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-4">
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-slate-400">Select Store</span>
            <select
              value={selectedStore}
              onChange={(e) => setSelectedStore(e.target.value)}
              className="bg-white border border-slate-200 text-xs font-semibold text-slate-700 py-1.5 px-3 rounded-lg focus:outline-none focus:ring-1 focus:ring-bp-green transition duration-150 shadow-xs"
            >
              <option>BP-MUM-1024 (Andheri East)</option>
              <option>BP-MUM-1050 (Borivali West)</option>
              <option>BP-MUM-1088 (Bandra)</option>
            </select>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-slate-400">Select Product</span>
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
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-slate-400">Horizon</span>
            <select
              value={horizon}
              onChange={(e) => setHorizon(e.target.value)}
              className="bg-white border border-slate-200 text-xs font-semibold text-slate-700 py-1.5 px-3 rounded-lg focus:outline-none focus:ring-1 focus:ring-bp-green transition duration-150 shadow-xs"
            >
              <option>30 Days</option>
              <option>60 Days</option>
              <option>90 Days</option>
            </select>
          </div>
        </div>
      </div>

      {/* KPI Cards Row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-xl border border-slate-100 shadow-xs flex flex-col text-left">
          <span className="text-xs font-semibold text-slate-400 tracking-wide">Accuracy (MAPE)</span>
          <div className="flex items-baseline gap-2 mt-2">
            <span className="text-2xl font-bold tracking-tight text-slate-900">{kpis.mape}</span>
            <span className="text-[10px] font-bold text-emerald-600">{kpis.trend} vs last mo.</span>
          </div>
        </div>
        <div className="bg-white p-5 rounded-xl border border-slate-100 shadow-xs flex flex-col text-left">
          <span className="text-xs font-semibold text-slate-400 tracking-wide">Predicted Demand ({horizon})</span>
          <span className="text-2xl font-bold tracking-tight text-slate-900 mt-2">{kpis.demand}</span>
        </div>
        <div className="bg-white p-5 rounded-xl border border-slate-100 shadow-xs flex flex-col text-left">
          <span className="text-xs font-semibold text-slate-400 tracking-wide">Safety Stock Level</span>
          <span className="text-2xl font-bold tracking-tight text-slate-900 mt-2">{kpis.safety}</span>
        </div>
        <div className="bg-white p-5 rounded-xl border border-slate-100 shadow-xs flex flex-col text-left">
          <span className="text-xs font-semibold text-slate-400 tracking-wide">Recommended Reorder Point</span>
          <span className="text-2xl font-bold tracking-tight text-bp-green mt-2">{kpis.reorder}</span>
        </div>
      </div>

      {/* SVG Projections Chart */}
      <div className="bg-white p-5 rounded-xl border border-slate-100 shadow-xs text-left">
        <div className="border-b border-slate-50 pb-3 mb-4">
          <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
            Predictive Model Projections vs Historical Sales
          </h3>
        </div>

        {/* Responsive Line Chart */}
        <div className="h-64 w-full relative pt-4">
          <svg className="w-full h-full" viewBox="0 0 800 200" preserveAspectRatio="none">
            {/* Grid Lines */}
            <line x1="50" y1="40" x2="750" y2="40" stroke="#f1f5f9" strokeWidth="1" strokeDasharray="3" />
            <line x1="50" y1="90" x2="750" y2="90" stroke="#f1f5f9" strokeWidth="1" strokeDasharray="3" />
            <line x1="50" y1="140" x2="750" y2="140" stroke="#f1f5f9" strokeWidth="1" strokeDasharray="3" />
            <line x1="50" y1="190" x2="750" y2="190" stroke="#e2e8f0" strokeWidth="1.5" />

            {/* Shaded Confidence Interval Block (next 30 days) */}
            <path
              d="M 400 130 L 450 115 L 500 105 L 550 110 L 600 95 L 650 100 L 700 85 L 750 90 L 750 70 L 700 65 L 650 80 L 600 75 L 550 90 L 500 85 L 450 95 L 400 90 Z"
              fill="#d1e7dd"
              fillOpacity="0.5"
            />

            {/* Historical Actuals Path (Solid line, up to X=400) */}
            <path
              d="M 50 160 L 100 150 L 150 170 L 200 140 L 250 155 L 300 130 L 350 145 L 400 110"
              fill="none"
              stroke="#475569"
              strokeWidth="2.5"
              strokeLinecap="round"
            />

            {/* Projections Forecast Path (Dashed green line, starting at X=400) */}
            <path
              d="M 400 110 L 450 105 L 500 95 L 550 100 L 600 85 L 650 90 L 700 75 L 750 80"
              fill="none"
              stroke="#008751"
              strokeWidth="2.5"
              strokeDasharray="5"
              strokeLinecap="round"
            />

            {/* Chart dots */}
            <circle cx="400" cy="110" r="4" fill="#008751" />
          </svg>

          {/* X Axis Labels */}
          <div className="flex justify-between px-12 text-[10px] font-bold text-slate-400 mt-2">
            <span>15 Days Ago</span>
            <span>Today (Forecast Trigger)</span>
            <span>30 Days Projections</span>
          </div>
        </div>

        {/* Legend block */}
        <div className="flex items-center gap-6 mt-4 pt-4 border-t border-slate-50 text-[10px] font-bold text-slate-400">
          <div className="flex items-center gap-1.5">
            <span className="w-4 h-0.5 bg-slate-600 block" />
            <span>Actual Historical Sales</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-4 h-0.5 border-t border-dashed border-bp-green block" />
            <span>AI Projected Demand</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-4 h-2 bg-[#d1e7dd] block opacity-70" />
            <span>Confidence Interval (95% bounds)</span>
          </div>
        </div>
      </div>

      {/* Forecast scheduling table */}
      <div className="bg-white rounded-xl border border-slate-100 shadow-xs overflow-hidden text-left">
        <div className="p-5 border-b border-slate-50">
          <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
            Demand Forecast &amp; Safety Stock Schedule
          </h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead className="bg-slate-50/50 text-slate-500 tracking-wider font-semibold border-b border-slate-100">
              <tr>
                <th className="py-3 px-5 font-bold">Date</th>
                <th className="py-3 px-4 text-right font-bold">Historical Avg Sales</th>
                <th className="py-3 px-4 text-right font-bold">Forecasted Demand</th>
                <th className="py-3 px-4 text-center font-bold">Confidence Interval</th>
                <th className="py-3 px-4 text-right font-bold">Recommended Safety Stock</th>
                <th className="py-3 px-5 text-center font-bold">Suggested Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium text-slate-600">
              {forecastSchedule.map((row, idx) => {
                const actionColor =
                  row.action === "Reorder Required"
                    ? "bg-rose-50 text-rose-600 border-rose-100"
                    : row.action === "Reorder Recommended"
                    ? "bg-amber-50 text-amber-600 border-amber-100"
                    : "bg-slate-50 text-slate-400 border-slate-100";

                return (
                  <tr key={idx} className="hover:bg-slate-50/40 transition duration-75">
                    <td className="py-3.5 px-5 font-semibold text-slate-900">{row.date}</td>
                    <td className="py-3.5 px-4 text-right text-slate-500">{row.historicalAvg}</td>
                    <td className="py-3.5 px-4 text-right text-slate-800 font-semibold">{row.forecasted}</td>
                    <td className="py-3.5 px-4 text-center text-slate-400">{row.confidenceInterval}</td>
                    <td className="py-3.5 px-4 text-right text-slate-700">{row.safetyStock}</td>
                    <td className="py-3.5 px-5 text-center">
                      <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold border uppercase tracking-wider ${actionColor}`}>
                        {row.action}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
}
