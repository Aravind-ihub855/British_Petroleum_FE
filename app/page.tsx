"use client";

import React, { useState } from "react";
import { useAuth } from "../context/AuthContext";
import Sidebar, { sidebarItems } from "@/components/Sidebar";
import DashboardOverview from "@/components/DashboardOverview";
import TabPlaceholder from "@/components/TabPlaceholder";

export default function Home() {
  const { user, logout, loading } = useAuth();
  const [activeTab, setActiveTab] = useState<number>(1);

  if (loading) {
    return (
      <div className="flex-grow flex items-center justify-center bg-bp-cream min-h-screen">
        <div className="flex flex-col items-center gap-4">
          <svg className="animate-spin h-10 w-10 text-bp-green" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
          </svg>
          <span className="text-slate-500 text-sm font-semibold">Verifying Secure Session...</span>
        </div>
      </div>
    );
  }

  if (!user) {
    return null; // Redirected by AuthContext
  }

  const currentTab = sidebarItems.find((item) => item.id === activeTab);

  return (
    <div className="flex bg-bp-cream text-slate-800 min-h-screen relative font-sans">
      
      {/* Sidebar navigation */}
      <Sidebar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        user={user}
        logout={logout}
      />

      {/* Main content right panel */}
      <div className="flex-grow flex flex-col overflow-y-auto max-h-screen">
        
        {/* Top Header Active title & Export */}
        <header className="bg-white border-b border-slate-200/80 h-16 px-8 flex items-center justify-between sticky top-0 z-10 shadow-sm">
          <h1 className="text-base font-black text-slate-900 tracking-tight flex items-center gap-2">
            <span>{activeTab}. {currentTab?.name}</span>
            <span className="text-xs font-bold text-slate-400 normal-case">(Executive Summary)</span>
          </h1>
          <button className="bg-bp-green hover:bg-bp-green-dark text-white text-xs font-bold px-5 py-2.5 rounded-full transition duration-150 ease-in-out shadow-sm shadow-bp-green/10">
            Export
          </button>
        </header>

        {/* Dashboard Dynamic view */}
        <div className="p-8 flex-grow">
          {activeTab === 1 ? (
            <DashboardOverview />
          ) : (
            <TabPlaceholder
              tabName={currentTab?.name || ""}
              icon={currentTab?.icon || null}
            />
          )}
        </div>

      </div>
    </div>
  );
}
