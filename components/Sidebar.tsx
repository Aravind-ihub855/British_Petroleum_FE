"use client";

import React from "react";
import { useData } from "@/context/DataContext";

export interface SidebarItem {
  id: string;
  name: string;
  icon: React.ReactNode;
}

export const sidebarItems: SidebarItem[] = [
  {
    id: "1",
    name: "Dashboard Overview",
    icon: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v4a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v4a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v4a2 2 0 01-2 2H6a2 2 0 01-2-2v-4zM14 16a2 2 0 012-2h2a2 2 0 012 2v4a2 2 0 01-2 2h-2a2 2 0 01-2-2v-4z" />
      </svg>
    ),
  },
  {
    id: "2",
    name: "Predictive Stockout",
    icon: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
      </svg>
    ),
  },
  {
    id: "3",
    name: "Vendor Performance",
    icon: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20H7m0 0v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
      </svg>
    ),
  },
  {
    id: "4",
    name: "Inventory Analysis",
    icon: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 002 2h2a2 2 0 002-2z" />
      </svg>
    ),
  },
  {
    id: "5",
    name: "Demand Forecasting",
    icon: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
      </svg>
    ),
  },
  {
    id: "6",
    name: "Master Data",
    icon: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7M4 7c0 2.21 3.582 4 8 4s8-1.79 8-4M4 7c0-2.21 3.582-4 8-4s8 1.79 8 4m0 5c0 2.21-3.582 4-8 4s-8-1.79-8-4" />
      </svg>
    ),
  },
  {
    id: "7",
    name: "Reports",
    icon: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
      </svg>
    ),
  },
  {
    id: "8",
    name: "User Management",
    icon: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a3 3 0 11-6 0 3 3 0 016 0z" />
      </svg>
    ),
  },
];

export const getRoleAllowedTabs = (role: string): string[] => {
  switch (role?.toLowerCase()) {
    case "store manager":
      return ["1", "2", "4", "5"];
    case "vendor manager":
      return ["1", "2", "3", "4", "5"];
    case "regional head":
      return ["1", "2", "3", "4", "5"];
    case "retail head":
      return ["1", "2", "3", "4", "5", "6", "7"];
    case "super admin":
      return ["8"];
    default:
      return ["2"];
  }
};

interface SidebarProps {
  activeTab: string;
  setActiveTab: (tabId: string) => void;
  user: {
    name: string;
    email: string;
    role: string;
    storeId?: string;
    region?: string;
  };
  logout: () => void;
  isOpen: boolean;
  onClose: () => void;
}

export default function Sidebar({
  activeTab,
  setActiveTab,
  user,
  logout,
  isOpen,
  onClose,
}: SidebarProps) {
  const { stores } = useData();
  const storeName = stores.find((s) => s.id === user.storeId)?.name || "";
  const allowedTabIds = getRoleAllowedTabs(user.role);
  const allowedItems = sidebarItems.filter((item) => allowedTabIds.includes(item.id));
  
  const coreItems = allowedItems.filter((item) => ["1", "2", "3", "4", "5"].includes(item.id));
  const systemItems = allowedItems.filter((item) => ["6", "7", "8"].includes(item.id));

  return (
    <aside
      className={`fixed inset-y-0 left-0 z-50 w-64 min-w-[256px] bg-[#052416] border-r border-emerald-950/60 flex flex-col justify-between h-screen transition-transform duration-300 transform lg:translate-x-0 lg:static lg:flex-shrink-0 sticky top-0`}
      style={{ transform: isOpen ? "translateX(0)" : undefined }}
    >
      <div className="flex flex-col overflow-hidden h-[calc(100vh-88px)]">
        {/* Logo Brand Header */}
        <div className="p-6 border-b border-emerald-900/30 flex items-center justify-between flex-shrink-0 bg-[#031d11]">
          <div className="flex items-center gap-3">
            <div className="relative w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center p-1.5 border border-white/5 shadow-inner">
              <img src="/logo/BP.svg" alt="BP Logo" className="w-full h-full object-contain" />
            </div>
            <span className="font-extrabold text-sm text-white tracking-tight font-sans">
              BP Convenience
            </span>
          </div>
          {/* Mobile close button */}
          <button
            onClick={onClose}
            className="lg:hidden p-2 text-slate-400 hover:text-white hover:bg-white/10 rounded-xl transition duration-150"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Scrollable Navigation section */}
        <nav className="p-4 space-y-1.5 overflow-y-auto flex-grow scrollbar-thin">
          {/* CORE PLATFORM section */}
          {coreItems.length > 0 && (
            <>
              <div className="px-3 py-2 text-[10px] font-extrabold text-emerald-500 uppercase tracking-widest flex items-center gap-2">
                <span>Core Platform</span>
                <span className="flex-grow h-px bg-emerald-900/30" />
              </div>
              {coreItems.map((item) => {
                const isSelected = activeTab === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => {
                      setActiveTab(item.id);
                      onClose();
                    }}
                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition duration-150 font-semibold text-sm text-left border-l-4 outline-none ${
                      isSelected
                        ? "bg-white/10 border-bp-yellow text-white shadow-sm"
                        : "border-transparent text-slate-400 hover:text-white hover:bg-white/5"
                    }`}
                  >
                    <span className={`${isSelected ? "text-bp-yellow" : "text-slate-500"}`}>
                      {item.icon}
                    </span>
                    <span>
                      {item.name}
                    </span>
                  </button>
                );
              })}
            </>
          )}

          {/* SYSTEM & REPORTS section */}
          {systemItems.length > 0 && (
            <>
              <div className="px-3 py-2.5 mt-4 text-[9px] font-extrabold text-emerald-500 uppercase tracking-widest flex items-center gap-2">
                <span>System & Reports</span>
                <span className="flex-grow h-px bg-emerald-900/30" />
              </div>
              {systemItems.map((item) => {
                const isSelected = activeTab === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => {
                      setActiveTab(item.id);
                      onClose();
                    }}
                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition duration-150 font-semibold text-sm text-left border-l-4 outline-none ${
                      isSelected
                        ? "bg-white/10 border-bp-yellow text-white shadow-sm"
                        : "border-transparent text-slate-400 hover:text-white hover:bg-white/5"
                    }`}
                  >
                    <span className={`${isSelected ? "text-bp-yellow" : "text-slate-500"}`}>
                      {item.icon}
                    </span>
                    <span>
                      {item.name}
                    </span>
                  </button>
                );
              })}
            </>
          )}
        </nav>

        {/* Store Information Box (only for Store Manager) */}
        {user.role === "store manager" && user.storeId && (
          <div className="mx-4 my-3 p-4 bg-white/5 border border-white/10 rounded-2xl text-[11px] text-left text-white/90">
            <h3 className="text-bp-yellow font-extrabold mb-3 uppercase tracking-wider text-[9.5px]">Store Information</h3>
            <div className="space-y-2.5">
              <div className="flex justify-between">
                <span className="text-slate-400 font-semibold">Location</span>
                <span className="text-white font-bold">North America</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400 font-semibold">City</span>
                <span className="text-white font-bold">{stores.find(s => s.id === user.storeId)?.city || "Chicago"}</span>
              </div>
              <div className="flex justify-between gap-2 overflow-hidden">
                <span className="text-slate-400 font-semibold whitespace-nowrap">Store</span>
                <span className="text-white font-bold truncate" title={storeName}>
                  BP ({storeName || user.storeId})
                </span>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* User profile footer block: locked to the very bottom */}
      <div className="p-4 border-t border-emerald-900/30 bg-[#031d11] flex-shrink-0 h-[88px] flex items-center justify-between">
        <div className="flex items-center gap-3 overflow-hidden">
          {/* Colorful/BP styled round avatar */}
          <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-[#008751] to-emerald-500 flex items-center justify-center font-bold text-xs text-white flex-shrink-0 shadow-md">
            {user.name ? user.name.charAt(0).toUpperCase() : "U"}
          </div>
          <div className="flex flex-col text-left overflow-hidden">
            <span className="text-xs font-bold text-white truncate leading-none">{user.name}</span>
            <span className="text-[10px] text-slate-400 font-semibold truncate mt-1">{user.role || "User"}</span>
            {user.role === "store manager" && user.storeId && (
              <span className="text-[9px] text-bp-yellow font-bold truncate mt-0.5" title={`${storeName} (${user.storeId})`}>
                {storeName || "Store"}: {user.storeId}
              </span>
            )}
          </div>
        </div>
        
        <button
          onClick={logout}
          className="p-2 text-slate-400 hover:text-rose-400 hover:bg-rose-950/20 rounded-lg transition duration-150 flex-shrink-0"
          title="Sign Out"
        >
          <svg className="w-4.5 h-4.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
          </svg>
        </button>
      </div>
    </aside>
  );
}
