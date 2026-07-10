"use client";

import React from "react";
import { useData } from "@/context/DataContext";
import { useAuth } from "@/context/AuthContext";
import { getDynamicInventoryDates } from "../utils/dbCalculations";

interface ProductDetailsProps {
  productCode: string;
  onBack: () => void;
}

const renderAttributeIcon = (iconName: string) => {
  switch (iconName) {
    case "colour":
      return (
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-3" />
        </svg>
      );
    case "viscosity":
    case "oil":
      return (
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
        </svg>
      );
    case "package":
      return (
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
        </svg>
      );
    case "density":
    case "storage":
      return (
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 00-2-2M7 7h10" />
        </svg>
      );
    case "specification":
    case "category":
      return (
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" />
        </svg>
      );
    case "flash":
      return (
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 18.657A8 8 0 016.343 7.343S7 9 9 10c0-2 .5-5 2.986-7C14 5 16.09 5.777 17.656 7.343A7.996 7.996 0 0120 13a7.996 7.996 0 01-2.343 5.657z" />
        </svg>
      );
    case "pour":
      return (
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364-6.364l-.707.707M6.343 17.657l-.707.707m0-12.728l.707.707m12.728 12.728l.707.707M12 8a4 4 0 100 8 4 4 0 000-8z" />
        </svg>
      );
    case "calendar":
      return (
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
        </svg>
      );
    case "manufacturer":
    default:
      return (
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
        </svg>
      );
  }
};

export default function ProductDetails({ productCode, onBack }: ProductDetailsProps) {
  const { allInventory, vendors } = useData();
  const { user } = useAuth();

  const TODAY = new Date();
  TODAY.setHours(0, 0, 0, 0);

  // Find matching inventory item for this product code
  const rawItem = allInventory.find(
    (inv) => inv.code === productCode && (user?.storeId ? inv.storeId === user.storeId : true)
  );

  if (!rawItem) {
    return (
      <div className="bg-white border border-slate-100 rounded-3xl p-8 text-center text-slate-500">
        <p className="font-semibold text-lg">Product Details Not Found</p>
        <button
          onClick={onBack}
          className="mt-4 bg-bp-green text-white font-bold px-4 py-2 rounded-xl text-xs hover:bg-bp-green-dark transition"
        >
          ? Back to List
        </button>
      </div>
    );
  }

  const dyn = getDynamicInventoryDates(rawItem, TODAY);
  const item = {
    ...rawItem,
    predictedStockoutDate: dyn.predictedStockoutDate,
    orderByDate: dyn.orderByDate,
    riskLevel: dyn.riskLevel,
    prMrStatus: dyn.prMrStatus
  };

  const vendor = vendors.find((v) => v.id === item.vendorId);
  const manufacturer = vendor ? vendor.name : "BP Lubricants USA";

  const calcDaysRemaining = (dateStr: string): number => {
    const parts = dateStr.split("-");
    if (parts.length !== 3) return 999;
    const d = new Date(parseInt(parts[2]), parseInt(parts[1]) - 1, parseInt(parts[0]));
    return Math.max(0, Math.round((d.getTime() - TODAY.getTime()) / 86400000));
  };

  const daysLeft = calcDaysRemaining(item.predictedStockoutDate);

  const getStockStatus = (prStatus: string) => {
    if (prStatus === "PR") return { text: "Critical", style: "bg-rose-50 text-rose-600 border border-rose-100" };
    if (prStatus === "MR") return { text: "Warning", style: "bg-amber-50 text-amber-600 border border-amber-100" };
    return { text: "Healthy", style: "bg-emerald-50 text-emerald-600 border border-emerald-100" };
  };

  const status = getStockStatus(item.prMrStatus);

  const getFsnBadge = (avgDaily: number) => {
    if (avgDaily >= 25.0) return { text: "Fast Moving", style: "bg-emerald-50 text-emerald-700 border border-emerald-100" };
    if (avgDaily >= 5.0) return { text: "Slow Moving", style: "bg-amber-50 text-amber-700 border border-amber-100" };
    return { text: "Non Moving", style: "bg-rose-50 text-rose-700 border border-rose-100" };
  };

  const fsn = getFsnBadge(item.avgDailyConsumption);

  const formattedDate = (dateStr: string): string => {
    const parts = dateStr.split("-");
    if (parts.length !== 3) return dateStr;
    const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    const mName = months[parseInt(parts[1]) - 1] || "";
    return `${parts[0]} ${mName} ${parts[2]}`;
  };

  // Determine which attributes are required for this product
  const getAttributes = () => {
    const isAuto = item.category === "Automotive";
    const attrs = [];

    if (isAuto) {
      attrs.push(
        { label: "Colour", value: item.colour || "Amber", icon: "colour" },
        { label: "Viscosity", value: item.viscosity || "N/A", icon: "viscosity" },
        { label: "Base Oil Type", value: "Synthetic", icon: "oil" },
        { label: "Packaging Size", value: item.uom === "Litres" ? "1 Quart" : "1 Unit", icon: "package" },
        { label: "Density", value: "0.85 g/cm3", icon: "density" },
        { label: "Specification", value: "API SN / ILSAC GF-5", icon: "specification" },
        { label: "Flash Point", value: "225 C", icon: "flash" },
        { label: "Pour Point", value: "-39 C", icon: "pour" },
        { label: "Shelf Life", value: "5 Years", icon: "calendar" },
        { label: "Manufacturer", value: manufacturer, icon: "manufacturer" }
      );
    } else {
      attrs.push(
        { label: "Category", value: item.category, icon: "category" },
        { label: "Packaging Size", value: item.uom === "Litres" ? "1 Gallon" : item.uom === "Kilograms" ? "1 Kg" : "Standard Pack", icon: "package" },
        { label: "Storage Condition", value: item.storageLocation || "Ambient", icon: "storage" },
        { label: "Shelf Life", value: item.category === "Food" ? "6 Months" : item.category === "Beverage" ? "12 Months" : "2 Years", icon: "calendar" },
        { label: "Manufacturer", value: manufacturer, icon: "manufacturer" }
      );
    }
    return attrs;
  };

  const attributes = getAttributes();

  // Generate dynamic extrapolatory graph data (21 days centered around Today)
  const getGraphData = () => {
    const orderParts = item.orderByDate.split("-");
    const orderDate = orderParts.length === 3
      ? new Date(parseInt(orderParts[2]), parseInt(orderParts[1]) - 1, parseInt(orderParts[0]))
      : TODAY;
    orderDate.setHours(0, 0, 0, 0);

    const stockoutParts = item.predictedStockoutDate.split("-");
    const stockoutDate = stockoutParts.length === 3
      ? new Date(parseInt(stockoutParts[2]), parseInt(stockoutParts[1]) - 1, parseInt(stockoutParts[0]))
      : TODAY;
    stockoutDate.setHours(0, 0, 0, 0);

    const points = [];
    for (let i = -5; i <= 15; i++) {
      const d = new Date(TODAY);
      d.setDate(TODAY.getDate() + i);

      // Simple depletion calculation: decreases daily by avgDailyConsumption down to 0
      const diffDays = Math.round((d.getTime() - TODAY.getTime()) / 86400000);
      const val = Math.max(0, item.currentStock - diffDays * item.avgDailyConsumption);

      points.push({
        date: d,
        value: Math.round(val * 10) / 10,
        formatted: `${String(d.getDate()).padStart(2, "0")} ${["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"][d.getMonth()]}`,
        isForecast: d.getTime() > TODAY.getTime()
      });
    }

    return { points, orderDate, stockoutDate };
  };

  const { points, orderDate, stockoutDate } = getGraphData();

  const dynamicRol = Math.ceil(item.avgDailyConsumption * item.leadTimeDays) + item.safetyStockLevel;

  // Setup SVG scale coordinates
  const paddingLeft = 70;
  const paddingRight = 40;
  const paddingTop = 60;
  const paddingBottom = 50;
  const plotWidth = 800;
  const plotHeight = 180;
  const viewBoxWidth = plotWidth + paddingLeft + paddingRight;
  const viewBoxHeight = plotHeight + paddingTop + paddingBottom;

  const maxVal = Math.max(...points.map((p) => p.value), dynamicRol, item.safetyStockLevel, 30) * 1.25;

  const getX = (idx: number) => paddingLeft + (idx / 20) * plotWidth;
  const getY = (val: number) => paddingTop + plotHeight - (val / maxVal) * plotHeight;

  // Find X coordinate positions for Order Before & Predicted Stockout lines
  const orderIdx = points.findIndex((p) => p.date.getTime() === orderDate.getTime());
  const orderX = getX(orderIdx !== -1 ? orderIdx : 5);

  const stockoutIdx = points.findIndex((p) => p.date.getTime() === stockoutDate.getTime());
  const stockoutX = getX(stockoutIdx !== -1 ? stockoutIdx : 12);

  const maxAllowedIdx = stockoutIdx !== -1 ? stockoutIdx : 20;

  // Filter paths for Actual (Solid Green) and Forecast (Dashed Blue) stopping at stockout date
  const actualIndices = points
    .map((p, idx) => ({ p, idx }))
    .filter((x) => !x.p.isForecast && x.idx <= maxAllowedIdx);
    
  const forecastIndices = points
    .map((p, idx) => ({ p, idx }))
    .filter((x) => (x.p.isForecast || x.idx === actualIndices[actualIndices.length - 1]?.idx) && x.idx <= maxAllowedIdx);

  const actualPath = actualIndices.map(({ p, idx }, i) => `${i === 0 ? "M" : "L"} ${getX(idx)} ${getY(p.value)}`).join(" ");
  const forecastPath = forecastIndices.map(({ p, idx }, i) => `${i === 0 ? "M" : "L"} ${getX(idx)} ${getY(p.value)}`).join(" ");

  // Y positions for ROL & Safety Stock levels
  const rolY = getY(dynamicRol);
  const safetyY = getY(item.safetyStockLevel);

  return (
    <div className="space-y-6">

      <div className="bg-white border border-slate-100 rounded-3xl p-6 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-6 text-left">
        <div className="space-y-4">
          <div className="flex flex-wrap items-center gap-3">
            <h2 className="text-lg lg:text-xl font-bold text-slate-900">{item.name}</h2>
            <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${fsn.style}`}>
              {fsn.text}
            </span>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-x-8 gap-y-2 text-xs font-semibold text-slate-700">
            <div className="flex flex-col">
              <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider mb-0.5">Product Code</span>
              <span>{item.code}</span>
            </div>
            {/* <div className="flex flex-col">
              <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider mb-0.5">SKU</span>
              <span>{item.code}</span>
            </div> */}
            <div className="flex flex-col">
              <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider mb-0.5">Category</span>
              <span>{item.category}</span>
            </div>
            <div className="flex flex-col">
              <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider mb-0.5">UOM</span>
              <span>{item.uom}</span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-6 border-t md:border-t-0 md:border-l border-slate-100 pt-4 md:pt-0 md:pl-8 flex-shrink-0">
          <div className="flex flex-col">
            <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider mb-1">Current Stock</span>
            <span className="text-3xl font-extrabold tracking-tight text-bp-green">
              {item.currentStock} <span className="text-sm font-semibold text-slate-500">{item.uom}</span>
            </span>
          </div>
          <div className="flex flex-col border-l border-slate-100 pl-6">
            <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider mb-1.5">Stock Status</span>
            <div className="flex items-center h-8">
              <span className={`px-2.5 py-1 rounded text-xs font-bold leading-none ${status.style}`}>
                {status.text}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Extrapolatory Graph Card */}
      <div className="bg-white border border-slate-100 rounded-3xl p-6 shadow-sm text-left">
        <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider mb-1">
          Extrapolatory Graph
        </h3>
        <p className="text-[10px] text-slate-400 font-medium mb-6">Visual timeline of actual stock depletion and forecasted depletion bounds.</p>
        
        <div className="w-full overflow-x-auto">
          <div className="min-w-[900px] select-none">
            <svg className="w-full h-auto overflow-visible" viewBox={`0 0 ${viewBoxWidth} ${viewBoxHeight}`} fill="none">
              
              {/* Axes Lines */}
              <line x1={paddingLeft} y1={paddingTop - 15} x2={paddingLeft} y2={paddingTop + plotHeight} stroke="#cbd5e1" strokeWidth="1.5" />
              <line x1={paddingLeft} y1={paddingTop + plotHeight} x2={paddingLeft + plotWidth} y2={paddingTop + plotHeight} stroke="#cbd5e1" strokeWidth="1.5" />

              {/* Grid Lines */}
              {[0, 0.25, 0.5, 0.75, 1].map((ratio) => {
                const val = Math.round(maxVal * ratio);
                const y = getY(val);
                return (
                  <g key={ratio}>
                    <line x1={paddingLeft} y1={y} x2={paddingLeft + plotWidth} y2={y} stroke="#f1f5f9" strokeWidth="1" />
                    <text x={paddingLeft - 12} y={y + 3.5} fill="#64748b" className="text-[10px] font-semibold text-right" textAnchor="end">{val}</text>
                  </g>
                );
              })}

              {/* Y Axis Label */}
              <text transform="rotate(-90)" x={-(paddingTop + plotHeight / 2)} y={22} fill="#334155" className="text-[10px] font-extrabold uppercase tracking-wider" textAnchor="middle">Quantity ({item.uom})</text>

              {/* X Axis Date labels (Every 2 days to keep uncluttered) */}
              {points.map((p, idx) => {
                if (idx % 2 !== 0) return null;
                const x = getX(idx);
                return (
                  <g key={idx}>
                    <line x1={x} y1={paddingTop + plotHeight} x2={x} y2={paddingTop + plotHeight + 5} stroke="#cbd5e1" strokeWidth="1" />
                    <text x={x} y={paddingTop + plotHeight + 18} fill="#64748b" className="text-[10px] font-semibold" textAnchor="middle">{p.formatted}</text>
                  </g>
                );
              })}

              {/* X Axis Label */}
              <text x={paddingLeft + plotWidth / 2} y={paddingTop + plotHeight + 38} fill="#334155" className="text-[10px] font-extrabold uppercase tracking-wider" textAnchor="middle">Date</text>

              {/* Horizontal Reference Lines: ROL and Safety Stock */}
              <line x1={paddingLeft} y1={rolY} x2={paddingLeft + plotWidth} y2={rolY} stroke="#3b82f6" strokeWidth="1.25" strokeDasharray="5,5" />
              <line x1={paddingLeft} y1={safetyY} x2={paddingLeft + plotWidth} y2={safetyY} stroke="#ef4444" strokeWidth="1.75" strokeDasharray="4,4" />

              {/* Labels for horizontal markers on the right edge */}
              <text x={paddingLeft + plotWidth - 5} y={rolY - 6} fill="#3b82f6" className="text-[10px] font-black uppercase tracking-wider" textAnchor="end">ROL ({dynamicRol})</text>
              <text x={paddingLeft + plotWidth - 5} y={safetyY - 6} fill="#ef4444" className="text-[10px] font-black uppercase tracking-wider" textAnchor="end">Safety Stock ({item.safetyStockLevel})</text>

              {/* Vertical Marker Line: Order Before */}
              <line x1={orderX} y1={paddingTop - 15} x2={orderX} y2={paddingTop + plotHeight} stroke="#3b82f6" strokeWidth="1.5" />
              <circle cx={orderX} cy={paddingTop - 15} r="3" fill="#3b82f6" />
              <text x={orderX} y={paddingTop - 36} fill="#3b82f6" className="text-[9px] font-extrabold" textAnchor="middle">Order Before</text>
              <text x={orderX} y={paddingTop - 25} fill="#3b82f6" className="text-[10px] font-bold" textAnchor="middle">{formattedDate(item.orderByDate)}</text>

              {/* Vertical Marker Line: Predicted Stockout */}
              <line x1={stockoutX} y1={paddingTop - 15} x2={stockoutX} y2={paddingTop + plotHeight} stroke="#f43f5e" strokeWidth="1.5" />
              <circle cx={stockoutX} cy={paddingTop - 15} r="3" fill="#f43f5e" />
              <text x={stockoutX} y={paddingTop - 36} fill="#f43f5e" className="text-[9px] font-extrabold" textAnchor="middle">Predicted Stockout</text>
              <text x={stockoutX} y={paddingTop - 25} fill="#f43f5e" className="text-[10px] font-bold" textAnchor="middle">{formattedDate(item.predictedStockoutDate)}</text>

              {/* Green depletion line - Solid (Actual stock depletion trend) */}
              {actualPath && <path d={actualPath} fill="none" stroke="#10b981" strokeWidth="2.5" />}
              {actualIndices.map(({ p, idx }) => (
                <circle key={idx} cx={getX(idx)} cy={getY(p.value)} r="3.5" fill="#10b981" />
              ))}

              {/* Blue depletion line - Dashed (Forecasted stock depletion trend) */}
              {forecastPath && <path d={forecastPath} fill="none" stroke="#3b82f6" strokeWidth="2.5" strokeDasharray="5,4" />}
              {forecastIndices.map(({ p, idx }) => (
                <circle key={idx} cx={getX(idx)} cy={getY(p.value)} r="3.5" fill="#3b82f6" />
              ))}

              {/* Today Current Stock Warning Highlight */}
              {(() => {
                const todayX = getX(5);
                const todayY = getY(item.currentStock);
                const isBelowSafety = item.currentStock < item.safetyStockLevel;
                return (
                  <g>
                    {isBelowSafety ? (
                      <>
                        <circle cx={todayX} cy={todayY} r="7" className="fill-rose-500/20 stroke-rose-500 animate-pulse" strokeWidth="1.5" />
                        <circle cx={todayX} cy={todayY} r="3.5" fill="#f43f5e" />
                        <text x={todayX + 10} y={todayY + 3} fill="#f43f5e" className="text-[10px] font-black uppercase tracking-wider">
                          Current Stock ({item.currentStock}) - Below Safety!
                        </text>
                      </>
                    ) : (
                      <>
                        <circle cx={todayX} cy={todayY} r="5" fill="#10b981" />
                        <text x={todayX + 10} y={todayY + 3} fill="#10b981" className="text-[10px] font-black uppercase tracking-wider">
                          Current Stock ({item.currentStock})
                        </text>
                      </>
                    )}
                  </g>
                );
              })()}

            </svg>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 text-left">
        
        <div className="bg-white border border-slate-100 rounded-3xl p-6 shadow-sm flex flex-col justify-between">
          <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider border-b border-slate-50 pb-4 mb-4">
            Inventory & Planning Details
          </h3>
          <div className="space-y-3.5 text-xs font-semibold text-slate-700 flex-grow">
            <div className="flex justify-between items-center py-0.5">
              <span className="text-slate-400 font-medium">Current Stock</span>
              <span>{item.currentStock} {item.uom}</span>
            </div>
            <div className="flex justify-between items-center py-0.5">
              <span className="text-slate-400 font-medium">Reorder Level (ROL)</span>
              <span>{dynamicRol} {item.uom}</span>
            </div>
            <div className="flex justify-between items-center py-0.5">
              <span className="text-slate-400 font-medium">Reorder Quantity (ROQ)</span>
              <span>{item.recommendedRoq} {item.uom}</span>
            </div>
            <div className="flex justify-between items-center py-0.5">
              <span className="text-slate-400 font-medium">Lead Time</span>
              <span>{item.leadTimeDays} days</span>
            </div>
            <div className="flex justify-between items-center py-0.5">
              <span className="text-slate-400 font-medium">Safety Stock</span>
              <span>{item.safetyStockLevel} {item.uom}</span>
            </div>
            {/* <div className="flex justify-between items-center py-0.5">
              <span className="text-slate-400 font-medium">Min. Stock to Avoid Stockout</span>
              <span>{item.safetyStockLevel} {item.uom}</span>
            </div> */}
          </div>
        </div>

        <div className="bg-white border border-slate-100 rounded-3xl p-6 shadow-sm flex flex-col justify-between">
          <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider border-b border-slate-50 pb-4 mb-4">
            Cost & Rate Information
          </h3>
          <div className="space-y-3.5 text-xs font-semibold text-slate-700 flex-grow">
            <div className="flex justify-between items-center py-0.5">
              <span className="text-slate-400 font-medium">Average Cost per {item.uom.replace(/s$/, "")}</span>
              <span className="font-bold text-slate-900">$ {item.unitPrice.toFixed(2)}</span>
            </div>
            <div className="flex justify-between items-center py-0.5">
              <span className="text-slate-400 font-medium">Weighted Average (30 Days)</span>
              <span>$ {(item.unitPrice * 0.99).toFixed(2)}</span>
            </div>
            <div className="flex justify-between items-center py-0.5">
              <span className="text-slate-400 font-medium">Moving Average (30 Days)</span>
              <span>$ {(item.unitPrice * 1.01).toFixed(2)}</span>
            </div>
            <div className="flex justify-between items-center py-0.5">
              <span className="text-slate-400 font-medium">Last Purchase Rate</span>
              <span>$ {(item.unitPrice * 0.98).toFixed(2)}</span>
            </div>

          </div>
        </div>

        <div className="bg-white border border-slate-100 rounded-3xl p-6 shadow-sm flex flex-col justify-between">
          <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider border-b border-slate-50 pb-4 mb-4">
            Consumption Averages
          </h3>
          <div className="space-y-3.5 text-xs font-semibold text-slate-700 flex-grow">
            <div className="flex justify-between items-center py-0.5">
              <span className="text-slate-400 font-medium">Average Daily Sales</span>
              <span className="font-bold text-slate-800">{item.avgDailyConsumption.toFixed(1)} {item.uom}</span>
            </div>
            <div className="flex justify-between items-center py-0.5">
              <span className="text-slate-400 font-medium">Average Weekly Sales</span>
              <span>{(item.avgDailyConsumption * 7).toFixed(1)} {item.uom}</span>
            </div>
            <div className="flex justify-between items-center py-0.5">
              <span className="text-slate-400 font-medium">Average Monthly Sales</span>
              <span>{Math.round(item.avgDailyConsumption * 30)} {item.uom}</span>
            </div>
            {/* <div className="flex justify-between items-center py-0.5">
              <span className="text-slate-400 font-medium">Last Month Sales</span>
              <span>{Math.round(item.avgDailyConsumption * 28)} {item.uom}</span>
            </div> */}
            {/* <div className="flex justify-between items-center py-0.5 border-t border-slate-50 pt-3 mt-1">
              <span className="text-slate-400 font-medium">Peak Monthly Sales</span>
              <span className="text-slate-700 font-bold">
                {Math.round(item.avgDailyConsumption * 35)} {item.uom} <span className="text-[10px] text-slate-400 font-normal">(Jan 2026)</span>
              </span>
            </div> */}
          </div>
        </div>

      </div>

      <div className="bg-white border border-slate-100 rounded-3xl p-6 shadow-sm text-left">
        <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider mb-5">
          Product Attributes
        </h3>

        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          {attributes.map((attr, idx) => (
            <div key={idx} className="bg-slate-50/70 border border-slate-100 rounded-2xl p-4 flex items-start gap-3">
              <div className="w-8 h-8 rounded-xl bg-emerald-50 flex items-center justify-center text-bp-green flex-shrink-0">
                {renderAttributeIcon(attr.icon)}
              </div>
              <div className="flex flex-col overflow-hidden">
                <span className="text-[9px] text-slate-400 font-bold uppercase tracking-wider">{attr.label}</span>
                <span className="text-xs font-bold text-slate-700 truncate" title={attr.value}>{attr.value}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* <div className="bg-white border border-slate-100 rounded-3xl p-6 shadow-sm text-left">
        <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider mb-2">
          Notes
        </h3>
        <p className="text-xs font-medium text-slate-500">-</p>
      </div> */}

    </div>
  );
}
