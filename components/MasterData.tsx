"use client";

import React, { useState } from "react";
import { stores, masterProducts } from "@/utils/mockDb";

interface MasterDataProps {
  onNavigate: (tabId: string, subTabId: string, vendorName?: string, productCode?: string) => void;
}

export default function MasterData({ onNavigate }: MasterDataProps) {
  const [subTab, setSubTab] = useState<"store" | "product">("store");
  const [searchQuery, setSearchQuery] = useState("");

  const filteredStores = stores.filter((row) =>
    row.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    row.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
    row.city.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredProducts = masterProducts.filter((row) =>
    row.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    row.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
    row.category.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6">
      
      {/* Top Filter Controls */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 bg-white p-5 rounded-xl border border-slate-100 shadow-xs">
        <div className="space-y-1">
          <h2 className="text-sm font-bold text-slate-800">
            Master Data Records
          </h2>
          <p className="text-[11px] text-slate-400 font-medium mt-0.5">
            Review and manage baseline registers for convenience stores and product stock items.
          </p>
        </div>
        
        <div className="flex flex-wrap items-center gap-3">
          {/* Search box */}
          <input
            type="text"
            placeholder={subTab === "store" ? "Search stores..." : "Search products..."}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="bg-slate-50 border border-slate-200 text-xs font-semibold text-slate-700 py-1.5 px-3 rounded-lg focus:outline-none focus:ring-1 focus:ring-bp-green transition duration-150 w-44"
          />

          {/* Sub-tabs Capsule Switcher */}
          <div className="flex bg-slate-100/80 p-1 rounded-xl w-fit gap-1 border border-slate-200/40">
            <button
              onClick={() => { setSubTab("store"); setSearchQuery(""); }}
              className={`px-4 py-1.5 rounded-lg text-xs font-bold transition duration-150 ${
                subTab === "store"
                  ? "bg-white text-slate-900 shadow-sm border border-slate-200/20"
                  : "text-slate-500 hover:text-slate-800"
              }`}
            >
              Outlets / Stores
            </button>
            <button
              onClick={() => { setSubTab("product"); setSearchQuery(""); }}
              className={`px-4 py-1.5 rounded-lg text-xs font-bold transition duration-150 ${
                subTab === "product"
                  ? "bg-white text-slate-900 shadow-sm border border-slate-200/20"
                  : "text-slate-500 hover:text-slate-800"
              }`}
            >
              SKU Products Register
            </button>
          </div>
        </div>
      </div>

      {/* Main Records Table panel */}
      <div className="bg-white rounded-xl border border-slate-100 shadow-xs overflow-hidden text-left animate-fade-in">
        {subTab === "store" ? (
          <div>
            <div className="p-5 border-b border-slate-50 flex justify-between items-center">
              <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                Convenience Stores Register ({filteredStores.length} Stores)
              </h3>
              <button className="bg-bp-green hover:bg-bp-green/90 text-white text-xs font-semibold py-1.5 px-3 rounded-lg transition duration-150 shadow-xs">
                + Onboard Store
              </button>
            </div>
            <div className="overflow-x-auto max-h-[500px]">
              <table className="w-full text-xs text-left">
                <thead className="bg-slate-50 text-slate-500 tracking-wider font-semibold border-b border-slate-100 sticky top-0 z-10">
                  <tr>
                    <th className="py-3 px-5 font-bold bg-slate-50">Store ID</th>
                    <th className="py-3 px-4 font-bold bg-slate-50">Outlet Name</th>
                    <th className="py-3 px-4 font-bold bg-slate-50">City</th>
                    <th className="py-3 px-4 font-bold bg-slate-50">Address</th>
                    <th className="py-3 px-4 font-bold bg-slate-50">Contact Person</th>
                    <th className="py-3 px-5 text-center font-bold bg-slate-50">Active Since</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-medium text-slate-600">
                  {filteredStores.map((row, idx) => (
                    <tr key={idx} className="hover:bg-slate-50/40 transition duration-75">
                      <td className="py-3.5 px-5 font-semibold text-slate-900">{row.id}</td>
                      <td className="py-3.5 px-4 text-slate-800 font-semibold">{row.name}</td>
                      <td className="py-3.5 px-4 text-slate-900 font-semibold">{row.city}</td>
                      <td className="py-3.5 px-4 text-slate-500 font-normal">{row.address}</td>
                      <td className="py-3.5 px-4 text-slate-500 font-normal">{row.contact}</td>
                      <td className="py-3.5 px-5 text-center text-slate-500 font-normal">{row.activeSince}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        ) : (
          <div>
            <div className="p-5 border-b border-slate-50 flex justify-between items-center">
              <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                Product Stock Register ({filteredProducts.length} Products)
              </h3>
              <button className="bg-bp-green hover:bg-bp-green/90 text-white text-xs font-semibold py-1.5 px-3 rounded-lg transition duration-150 shadow-xs">
                + Add Product
              </button>
            </div>
            <div className="overflow-x-auto max-h-[500px]">
              <table className="w-full text-xs text-left">
                <thead className="bg-slate-50 text-slate-500 tracking-wider font-semibold border-b border-slate-100 sticky top-0 z-10">
                  <tr>
                    <th className="py-3 px-5 font-bold bg-slate-50">Code</th>
                    <th className="py-3 px-4 font-bold bg-slate-50">Product Name</th>
                    <th className="py-3 px-4 text-center font-bold bg-slate-50">Category</th>
                    <th className="py-3 px-4 text-center font-bold bg-slate-50">UOM</th>
                    <th className="py-3 px-4 text-right font-bold bg-slate-50">Unit Price</th>
                    <th className="py-3 px-4 text-center font-bold bg-slate-50">Storage Location</th>
                    <th className="py-3 px-4 text-right font-bold bg-slate-50">ROL</th>
                    <th className="py-3 px-4 text-right font-bold bg-slate-50">ROQ (Baseline)</th>
                    <th className="py-3 px-4 text-center font-bold bg-slate-50">Colour</th>
                    <th className="py-3 px-5 text-center font-bold bg-slate-50">Viscosity</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-medium text-slate-600">
                  {filteredProducts.map((row, idx) => (
                    <tr key={idx} className="hover:bg-slate-50/40 transition duration-75">
                      <td className="py-3.5 px-5 font-semibold text-slate-900">{row.code}</td>
                      <td className="py-3.5 px-4 text-bp-green cursor-pointer hover:underline font-semibold"
                        onClick={() => onNavigate("3", "product_wise", undefined, row.code)}
                      >
                        {row.name}
                      </td>
                      <td className="py-3.5 px-4 text-center text-slate-500 font-normal">{row.category}</td>
                      <td className="py-3.5 px-4 text-center text-slate-400 font-normal">{row.uom}</td>
                      <td className="py-3.5 px-4 text-right font-normal text-slate-700">${row.unitPrice.toFixed(2)}</td>
                      <td className="py-3.5 px-4 text-center font-normal text-slate-500">{row.storageLocation}</td>
                      <td className="py-3.5 px-4 text-right font-semibold text-slate-700">{row.rol}</td>
                      <td className="py-3.5 px-4 text-right font-semibold text-bp-green">{row.roq}</td>
                      <td className="py-3.5 px-4 text-center text-slate-500 font-normal">{row.colour}</td>
                      <td className="py-3.5 px-5 text-center text-slate-500 font-normal">{row.viscosity}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

    </div>
  );
}
