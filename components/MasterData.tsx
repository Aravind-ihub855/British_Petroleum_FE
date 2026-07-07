"use client";

import React, { useState } from "react";

interface StoreDetail {
  id: string;
  name: string;
  city: string;
  address: string;
  contact: string;
  activeSince: string;
}

interface ProductDetail {
  code: string;
  name: string;
  uom: string;
  price: string;
  minAlert: string;
  leadTime: string;
}

const stores: StoreDetail[] = [
  {
    id: "BP-MUM-1024",
    name: "Andheri East",
    city: "Mumbai",
    address: "Off Link Road, Industrial Area",
    contact: "+91 98765 43210",
    activeSince: "Oct 2021",
  },
  {
    id: "BP-MUM-1050",
    name: "Borivali West",
    city: "Mumbai",
    address: "S.V. Road, Near Station Outlet",
    contact: "+91 98765 43211",
    activeSince: "Jan 2022",
  },
  {
    id: "BP-MUM-1088",
    name: "Bandra",
    city: "Mumbai",
    address: "Hill Road Junction Near Metro",
    contact: "+91 98765 43212",
    activeSince: "Apr 2022",
  },
  {
    id: "BP-PUN-2001",
    name: "Kothrud",
    city: "Pune",
    address: "Karve Road Corner, Near Bridge",
    contact: "+91 98765 43213",
    activeSince: "Jul 2022",
  },
];

const products: ProductDetail[] = [
  {
    code: "BP-PROD-001",
    name: "Lube Oil 15W40",
    uom: "Ltr",
    price: "₹200",
    minAlert: "150 Ltr",
    leadTime: "3 Days",
  },
  {
    code: "BP-PROD-002",
    name: "Engine Oil 20W50",
    uom: "Ltr",
    price: "₹180",
    minAlert: "100 Ltr",
    leadTime: "4 Days",
  },
  {
    code: "BP-PROD-003",
    name: "Hydraulic Oil 68",
    uom: "Ltr",
    price: "₹160",
    minAlert: "80 Ltr",
    leadTime: "3 Days",
  },
  {
    code: "BP-PROD-004",
    name: "Coolant 1L",
    uom: "Ltr",
    price: "₹120",
    minAlert: "60 Ltr",
    leadTime: "2 Days",
  },
];

export default function MasterData() {
  const [subTab, setSubTab] = useState<"store" | "product">("store");

  return (
    <div className="space-y-6">
      
      {/* Top Filter Controls */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 bg-white p-5 rounded-xl border border-slate-100 shadow-xs">
        <div>
          <h2 className="text-sm font-bold text-slate-800">
            Master Data Records
          </h2>
          <p className="text-[11px] text-slate-400 font-medium mt-0.5">
            Review and manage baseline registers for convenience stores and product stock items.
          </p>
        </div>
        
        {/* Sub-tabs Capsule Switcher */}
        <div className="flex bg-slate-100/80 p-1 rounded-xl w-fit gap-1 border border-slate-200/40">
          <button
            onClick={() => setSubTab("store")}
            className={`px-4 py-1.5 rounded-lg text-xs font-bold transition duration-150 ${
              subTab === "store"
                ? "bg-white text-slate-900 shadow-sm border border-slate-200/20"
                : "text-slate-500 hover:text-slate-800"
            }`}
          >
            Store Details
          </button>
          <button
            onClick={() => setSubTab("product")}
            className={`px-4 py-1.5 rounded-lg text-xs font-bold transition duration-150 ${
              subTab === "product"
                ? "bg-white text-slate-900 shadow-sm border border-slate-200/20"
                : "text-slate-500 hover:text-slate-800"
            }`}
          >
            Product Details
          </button>
        </div>
      </div>

      {/* Main Records Container */}
      <div className="bg-white rounded-xl border border-slate-100 shadow-xs overflow-hidden text-left">
        {subTab === "store" ? (
          <div>
            <div className="p-5 border-b border-slate-50 flex justify-between items-center">
              <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                Store Locations Register
              </h3>
              <button className="bg-bp-green hover:bg-bp-green/90 text-white text-xs font-semibold py-1.5 px-3 rounded-lg transition duration-150 shadow-xs">
                + Add Outlet
              </button>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left">
                <thead className="bg-slate-50/50 text-slate-500 tracking-wider font-semibold border-b border-slate-100">
                  <tr>
                    <th className="py-3 px-5 font-bold">Store ID</th>
                    <th className="py-3 px-4 font-bold">Store Name</th>
                    <th className="py-3 px-4 font-bold">City</th>
                    <th className="py-3 px-4 font-bold">Address</th>
                    <th className="py-3 px-4 font-bold">Contact Number</th>
                    <th className="py-3 px-5 text-center font-bold">Active Since</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-medium text-slate-600">
                  {stores.map((row, idx) => (
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
                Product Stock Register
              </h3>
              <button className="bg-bp-green hover:bg-bp-green/90 text-white text-xs font-semibold py-1.5 px-3 rounded-lg transition duration-150 shadow-xs">
                + Add Product
              </button>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left">
                <thead className="bg-slate-50/50 text-slate-500 tracking-wider font-semibold border-b border-slate-100">
                  <tr>
                    <th className="py-3 px-5 font-bold">Product Code</th>
                    <th className="py-3 px-4 font-bold">Product Name</th>
                    <th className="py-3 px-4 text-center font-bold">UOM</th>
                    <th className="py-3 px-4 text-right font-bold">Unit Price</th>
                    <th className="py-3 px-4 text-right font-bold">Min Stock Alert</th>
                    <th className="py-3 px-5 text-center font-bold">Lead Time</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-medium text-slate-600">
                  {products.map((row, idx) => (
                    <tr key={idx} className="hover:bg-slate-50/40 transition duration-75">
                      <td className="py-3.5 px-5 font-semibold text-slate-900">{row.code}</td>
                      <td className="py-3.5 px-4 text-slate-800 font-semibold">{row.name}</td>
                      <td className="py-3.5 px-4 text-center text-slate-400 font-normal">{row.uom}</td>
                      <td className="py-3.5 px-4 text-right text-slate-700 font-normal">{row.price}</td>
                      <td className="py-3.5 px-4 text-right font-semibold text-bp-green">{row.minAlert}</td>
                      <td className="py-3.5 px-5 text-center text-slate-500 font-normal">{row.leadTime}</td>
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
