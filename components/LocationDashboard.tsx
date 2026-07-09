import React, { useState, useEffect } from "react";
import { useData } from "@/context/DataContext";

interface CityProductRow {
  productCode: string;
  product: string;
  uom: string;
  currentStock: string;
  roq: string;
  storesAtRisk: number;
}

interface LocationDashboardProps {
  onNavigate: (tabId: string, subTabId: string, vendorName?: string, productCode?: string) => void;
}

export default function LocationDashboard({ onNavigate }: LocationDashboardProps) {
  const { stores, getStoreInventory, getLocationInventory, loading } = useData();
  const [selectedCity, setSelectedCity] = useState("");

  // Normalize city name to Title Case (handles 'chicago', 'CHICAGO', 'Chicago' → 'Chicago')
  const toTitleCase = (str: string) =>
    str.trim().split(" ").map((w) => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase()).join(" ");

  // Unique normalized city list derived from scoped stores
  const availableCities = [...new Set(stores.map((s) => toTitleCase(s.city)))].sort();

  useEffect(() => {
    if (availableCities.length > 0 && !selectedCity) {
      setSelectedCity(availableCities[0]);
    }
  }, [stores, selectedCity]);

  if (loading || !selectedCity) {
    return (
      <div className="flex justify-center items-center py-12 bg-white/40 backdrop-blur-md rounded-3xl p-8 border border-slate-200/50">
        <svg className="animate-spin h-8 w-8 text-bp-green" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
        </svg>
      </div>
    );
  }

  // Dynamically calculate aggregate metrics for the city
  const cityMetrics = getLocationInventory(selectedCity);

  // Dynamically generate the top product summaries inside this city
  const cityStores = stores.filter((s) => s.city.toLowerCase() === selectedCity.toLowerCase());
  
  // Aggregate products stock across all stores in the city
  const productAggMap: Record<string, { code: string; name: string; uom: string; stock: number; roq: number; riskStores: number }> = {};

  cityStores.forEach((st) => {
    const inv = getStoreInventory(st.id);
    inv.forEach((item) => {
      if (!productAggMap[item.code]) {
        productAggMap[item.code] = {
          code: item.code,
          name: item.name,
          uom: item.uom,
          stock: 0,
          roq: 0,
          riskStores: 0
        };
      }
      productAggMap[item.code].stock += item.currentStock;
      productAggMap[item.code].roq += item.recommendedRoq;
      if (item.riskLevel === "High") {
        productAggMap[item.code].riskStores++;
      }
    });
  });

  const aggregateRows: CityProductRow[] = Object.values(productAggMap)
    .map((p) => ({
      productCode: p.code,
      product: p.name,
      uom: p.uom,
      currentStock: p.stock.toLocaleString(),
      roq: p.roq.toLocaleString(),
      storesAtRisk: p.riskStores
    }))
    .slice(0, 8); // Display top 8 items for a clean layout

  // Calculate store-wise risk counts using real today's date calculations
  const TODAY = new Date();
  TODAY.setHours(0, 0, 0, 0);

  const calcDays = (dateStr: string): number => {
    const parts = dateStr.split("-");
    if (parts.length !== 3) return 999;
    const d = new Date(parseInt(parts[2]), parseInt(parts[1]) - 1, parseInt(parts[0]));
    return Math.max(0, Math.round((d.getTime() - TODAY.getTime()) / 86400000));
  };

  const calcRisk = (days: number): "High" | "Medium" | "Low" => {
    if (days <= 7) return "High";
    if (days <= 15) return "Medium";
    return "Low";
  };

  const storeRiskList = cityStores.map((st) => {
    const inv = getStoreInventory(st.id);
    const totalItems = inv.length;
    const highRiskItemsCount = inv.filter((item) => calcRisk(calcDays(item.predictedStockoutDate)) === "High").length;
    return {
      id: st.id,
      name: st.name,
      totalItems,
      highRiskItemsCount,
    };
  }).sort((a, b) => b.highRiskItemsCount - a.highRiskItemsCount);

  return (
    <div className="space-y-8 animate-fadeIn">
      
      {/* Top Filter Controls */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 bg-white p-5 rounded-2xl border border-slate-100 shadow-sm card-hover-effect text-left">
        <div>
          <h2 className="text-sm font-extrabold text-slate-900 tracking-tight">
            Location-Level Analysis
          </h2>
          {/* <p className="text-[10px] text-slate-400 font-semibold mt-0.5 leading-snug">
            Select a city boundary to review localized performance.
          </p> */}
        </div>
        <div className="flex items-center gap-2.5">
          <span className="text-xs font-bold text-slate-500">Select City</span>
          <select
            value={selectedCity}
            onChange={(e) => setSelectedCity(e.target.value)}
            className="bg-slate-50 border border-slate-200 text-xs font-bold text-slate-700 py-2 px-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-bp-green transition duration-150 shadow-sm"
          >
            {/* Cities from backend-scoped stores — normalized to Title Case, region-filtered */}
            {availableCities.map((city) => (
              <option key={city} value={city}>{city}</option>
            ))}
          </select>
        </div>
      </div>

      {/* KPI Cards Row */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-5">
        <div 
          className="bg-white p-5 rounded-2xl border-t-4 border-t-bp-green border-x border-b border-slate-100 shadow-sm flex flex-col text-left card-hover-effect"
          title="Total Stores: Total active retail locations managed in this city"
        >
          <span className="text-[10px] font-extrabold text-slate-500 uppercase tracking-wider">Total Stores</span>
          <span className="text-3xl font-extrabold tracking-tight text-slate-900 mt-2">{cityMetrics.storesCount}</span>
        </div>
        <div 
          className="bg-white p-5 rounded-2xl border-t-4 border-t-bp-green border-x border-b border-slate-100 shadow-sm flex flex-col text-left card-hover-effect"
          title="Total Products: Total unique SKU item codes carried in stores in this city"
        >
          <span className="text-[10px] font-extrabold text-slate-500 uppercase tracking-wider">Total Products</span>
          <span className="text-3xl font-extrabold tracking-tight text-slate-900 mt-2">{cityMetrics.productsCount}</span>
        </div>
        <div 
          className="bg-white p-5 rounded-2xl border-t-4 border-t-bp-yellow border-x border-b border-slate-100 shadow-sm flex flex-col text-left card-hover-effect"
          title="Inventory Value: Combined stock valuation across all stores in this city (Stock × Unit Price)"
        >
          <span className="text-[10px] font-extrabold text-slate-500 uppercase tracking-wider">Inventory Value</span>
          <span className="text-3xl font-extrabold tracking-tight text-slate-900 mt-2">{cityMetrics.valString}</span>
        </div>
        <div 
          className="bg-white p-5 rounded-2xl border-t-4 border-t-rose-600 border-x border-b border-slate-100 shadow-sm flex flex-col text-left card-hover-effect"
          title="At Risk Items: Combined count of store inventory records currently below their Reorder Level (ROL) in this city"
        >
          <span className="text-[10px] font-extrabold text-slate-500 uppercase tracking-wider">At Risk Items</span>
          <span className="text-3xl font-extrabold tracking-tight text-rose-600 mt-2">{cityMetrics.atRiskCount}</span>
        </div>
        <div 
          className="bg-white p-5 rounded-2xl border-t-4 border-t-rose-500 border-x border-b border-slate-100 shadow-sm flex flex-col text-left card-hover-effect col-span-2 lg:col-span-1"
          title="Stockouts: Combined count of store inventory records with zero safety days remaining in this city"
        >
          <span className="text-[10px] font-extrabold text-slate-500 uppercase tracking-wider">Stockouts</span>
          <span className="text-3xl font-extrabold tracking-tight text-rose-600 mt-2">{cityMetrics.stockoutsCount}</span>
        </div>
      </div>

      {/* Split view: Products Table left, Store Progress List right */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Top Products Table (Left Column) */}
        <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden text-left lg:col-span-7 card-hover-effect">
          <div className="px-6 py-5 border-b border-slate-50">
            <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
              Inventory by City - Product Details
            </h3>
            {/* <p className="text-[10px] text-slate-400 font-medium mt-0.5">Top stock levels and recommendations</p> */}
          </div>
          <div className="overflow-x-auto max-h-[450px] scrollbar-thin">
            <table className="w-full text-xs text-left">
              <thead className="bg-slate-50/50 text-slate-400 font-extrabold tracking-wider uppercase border-b border-slate-50 sticky top-0 z-10 text-[9.5px]">
                <tr>
                  <th className="py-3.5 px-6 cursor-help" title="Product name and catalog descriptor">Product Name</th>
                  <th className="py-3.5 px-4 text-center cursor-help" title="Unit of Measure">UOM</th>
                  <th className="py-3.5 px-4 text-right cursor-help" title="Total stock units combined across all stores in this city">Current Stock</th>
                  <th className="py-3.5 px-4 text-right cursor-help" title="Recommended reorder quantity needed for this product">ROQ</th>
                  <th className="py-3.5 px-6 text-center cursor-help" title="Number of unique stores in this city where this product is currently below ROL">Stores Risk</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100/60 font-semibold text-slate-700">
                {aggregateRows.map((row, idx) => (
                  <tr key={idx} className="hover:bg-slate-50/50 transition duration-75">
                    <td className="py-4 px-6 border-r border-slate-100">
                      <div
                        onClick={() => onNavigate("2", "location", undefined, row.productCode)}
                        className="font-bold text-slate-900 hover:text-bp-green cursor-pointer leading-tight"
                      >
                        {row.product}
                      </div>
                    </td>
                    <td className="py-4 px-4 text-center text-slate-400 font-medium border-r border-slate-100">{row.uom}</td>
                    <td className="py-4 px-4 text-right text-slate-600 font-normal border-r border-slate-100">{row.currentStock}</td>
                    <td className="py-4 px-4 text-right font-bold text-slate-850 border-r border-slate-100">{row.roq}</td>
                    <td className="py-4 px-6 text-center">
                      <span className={`px-2 py-0.5 rounded-full font-bold text-[10px] border ${
                        row.storesAtRisk > 0 ? "text-rose-600 bg-rose-50 border-rose-100" : "text-slate-400 bg-slate-50 border-slate-150"
                      }`}>
                        {row.storesAtRisk}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Store-wise Risk progress bars (Right Column) */}
        <div className="bg-white rounded-3xl border border-slate-100 shadow-sm p-6 flex flex-col justify-between text-left lg:col-span-5 card-hover-effect">
          <div className="border-b border-slate-50 pb-3.5 mb-4">
            <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
              Store Risk Summary by City
            </h3>
            <p className="text-[10px] text-slate-400 font-medium mt-0.5">High-risk products count per outlet</p>
          </div>

          <div className="flex-grow space-y-5 py-4">
            {storeRiskList.map((store) => {
              const totalItems = store.totalItems || 1;
              const barWidth = (store.highRiskItemsCount / totalItems) * 100;
              const barColor = store.highRiskItemsCount > 20 
                ? "bg-rose-500" 
                : store.highRiskItemsCount > 0 
                ? "bg-amber-500" 
                : "bg-emerald-500";

              return (
                <div key={store.id} className="space-y-1.5">
                  <div className="flex justify-between items-end text-xs">
                    <div>
                      <span className="font-bold text-slate-900">{store.name}</span>
                      <span className="text-[10px] text-slate-400 font-bold ml-1.5">({store.id})</span>
                    </div>
                    <div className="text-[11px] font-extrabold text-slate-800">
                      <span className={store.highRiskItemsCount > 0 ? "text-rose-600" : "text-emerald-600"}>
                        {store.highRiskItemsCount}
                      </span>
                      <span className="text-slate-400 font-normal text-[10px]"> / {store.totalItems} SKUs</span>
                    </div>
                  </div>
                  <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                    <div 
                      className={`h-full rounded-full transition-all duration-500 ${barColor}`} 
                      style={{ width: `${Math.max(3, barWidth)}%` }} 
                    />
                  </div>
                </div>
              );
            })}
          </div>

          <div className="pt-4 border-t border-slate-50 text-center font-bold text-slate-700 text-xs mt-3">
            Total At Risk Products in {selectedCity}: <span className="text-rose-600 font-extrabold">{cityMetrics.atRiskCount}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
