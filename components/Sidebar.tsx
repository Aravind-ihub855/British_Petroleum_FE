"use client";

import React from "react";

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
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
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
];

interface SidebarProps {
  activeTab: string;
  setActiveTab: (tabId: string) => void;
  user: {
    name: string;
    email: string;
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
  return (
    <aside
      className={`fixed inset-y-0 left-0 z-50 w-64 bg-white border-r border-slate-200/80 flex flex-col justify-between h-screen transition-transform duration-300 transform lg:translate-x-0 lg:static sticky top-0`}
      style={{ transform: isOpen ? "translateX(0)" : undefined }}
    >
      <div className="flex flex-col overflow-hidden h-[calc(100vh-76px)]">
        {/* Logo Brand Header */}
        <div className="p-6 border-b border-slate-100 flex items-center justify-between flex-shrink-0">
          <div className="flex items-center gap-2.5">
            <img src="/logo/BP.svg" alt="BP Logo" className="w-6.5 h-6.5 object-contain" />
            <span className="font-extrabold text-sm text-slate-900 tracking-tight font-sans">
              bp Convenience
            </span>
          </div>
          {/* Mobile close button */}
          <button
            onClick={onClose}
            className="lg:hidden p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-xl transition duration-150"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Scrollable Navigation section */}
        <nav className="p-4 space-y-1 overflow-y-auto flex-grow scrollbar-thin">
          {/* CORE PLATFORM Header */}
          <div className="px-3 py-2 text-[10px] font-extrabold text-slate-400 uppercase tracking-widest flex items-center gap-2">
            <span>Core Platform</span>
            <span className="flex-grow h-px bg-slate-100" />
          </div>

          {sidebarItems.slice(0, 5).map((item) => {
            const isSelected = activeTab === item.id;

            return (
              <button
                key={item.id}
                onClick={() => {
                  setActiveTab(item.id);
                  onClose();
                }}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition duration-150 font-semibold text-sm text-left border-2 ${
                  isSelected
                    ? "bg-bp-green/5 border-bp-green text-slate-950 shadow-sm"
                    : "border-transparent text-slate-500 hover:text-slate-800 hover:bg-slate-50"
                }`}
              >
                <span className={`${isSelected ? "text-bp-green" : "text-slate-400"}`}>
                  {item.icon}
                </span>
                <span>
                  {item.id}. {item.name}
                </span>
              </button>
            );
          })}

          {/* SYSTEM & REPORTS Header */}
          <div className="px-3 py-2.5 mt-4 text-[9px] font-extrabold text-slate-400 uppercase tracking-widest flex items-center gap-2">
            <span>System & Reports</span>
            <span className="flex-grow h-px bg-slate-100" />
          </div>

          {sidebarItems.slice(5).map((item) => {
            const isSelected = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => {
                  setActiveTab(item.id);
                  onClose();
                }}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition duration-150 font-semibold text-sm text-left border-2 ${
                  isSelected
                    ? "bg-bp-green/5 border-bp-green text-slate-950 shadow-sm"
                    : "border-transparent text-slate-500 hover:text-slate-800 hover:bg-slate-50"
                }`}
              >
                <span className={`${isSelected ? "text-bp-green" : "text-slate-400"}`}>
                  {item.icon}
                </span>
                <span>
                  {item.id}. {item.name}
                </span>
              </button>
            );
          })}
        </nav>
      </div>

      {/* User profile footer block: locked to the very bottom */}
      <div className="p-4 border-t border-slate-100 bg-white flex-shrink-0 h-[76px] flex items-center justify-between">
        <div className="flex items-center gap-3 overflow-hidden">
          {/* Colorful/BP styled round avatar */}
          <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-[#008751] to-emerald-500 flex items-center justify-center font-bold text-xs text-white flex-shrink-0 shadow-sm">
            {user.name ? user.name.charAt(0).toUpperCase() : "U"}
          </div>
          <div className="flex flex-col text-left overflow-hidden">
            <span className="text-xs font-bold text-slate-800 truncate leading-none">{user.name}</span>
            <span className="text-[10px] text-slate-400 font-semibold truncate mt-1.5">{user.email}</span>
          </div>
        </div>
        
        <button
          onClick={logout}
          className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition duration-150 flex-shrink-0"
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
