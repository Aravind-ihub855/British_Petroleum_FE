"use client";

import React, { useState } from "react";
import { useAuth } from "../context/AuthContext";
import Sidebar, { sidebarItems } from "@/components/Sidebar";
import DashboardOverview from "@/components/DashboardOverview";
import TabPlaceholder from "@/components/TabPlaceholder";

// High-fidelity dashboards
import StoreDashboard from "@/components/StoreDashboard";
import LocationDashboard from "@/components/LocationDashboard";
import ProductDashboard from "@/components/ProductDashboard";
import InventoryAnalysis from "@/components/InventoryAnalysis";

// Helper to load descriptions for the header
const getTabMetadata = (tab: string) => {
  switch (tab) {
    case "1":
      return {
        description: "Executive summary of convenience store inventory, stockout risks, and forecast metrics.",
      };
    case "2":
      return {
        description: "Predictive stockout analysis by store, location, and product bounds. Use the tab bar below to switch views.",
      };
    case "3":
      return {
        description: "Track lead times, order fill rates, and vendor supply metrics.",
      };
    case "4":
      return {
        description: "Analyze FSN (Fast, Slow, Non-moving) asset categories and stock levels.",
      };
    case "5":
      return {
        description: "Run AI/ML demand forecasting models and review prediction timelines.",
      };
    case "6":
      return {
        description: "View and manage master records for items, products, and convenience stores.",
      };
    case "7":
      return {
        description: "Generate and download custom inventory planning and forecasting reports.",
      };
    default:
      return {
        description: "Predictive planning and stockout analysis panel.",
      };
  }
};

export default function Home() {
  const { user, logout, loading } = useAuth();
  const [activeTab, setActiveTab] = useState<string>("1");
  const [isSidebarOpen, setIsSidebarOpen] = useState<boolean>(false);
  const [subTab, setSubTab] = useState<string>("store"); // store | location | product

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

  // Find active tab name & icon
  const currentTab = sidebarItems.find((item) => item.id === activeTab);
  const currentTabName = currentTab?.name || "";
  const currentTabIcon = currentTab?.icon || null;

  const tabMetadata = getTabMetadata(activeTab);

  return (
    <div className="flex bg-bp-cream text-slate-800 min-h-screen relative font-sans overflow-hidden">
      
      {/* Mobile Drawer Backdrop overlay */}
      {isSidebarOpen && (
        <div
          className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs z-40 lg:hidden transition-opacity duration-300"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* Sidebar navigation */}
      <Sidebar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        user={user}
        logout={logout}
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
      />

      {/* Main content right panel */}
      <div className="flex-grow flex flex-col overflow-y-auto max-h-screen">
        
        {/* Top Header: Title & Description without Breadcrumbs or Export button */}
        <header className="bg-white border-b border-slate-100 py-6 px-6 lg:px-8 sticky top-0 z-30 shadow-xs flex-shrink-0">
          <div className="flex flex-col text-left">
            <h1 className="text-xl lg:text-2xl font-bold text-slate-900 tracking-tight leading-none flex items-center gap-2">
              {/* Mobile hamburger menu toggle */}
              <button
                onClick={() => setIsSidebarOpen(true)}
                className="lg:hidden p-1 -ml-1 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-lg transition duration-150"
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              </button>
              <span>{currentTabName}</span>
            </h1>
            <p className="text-[11px] lg:text-xs text-slate-400 font-semibold mt-2 leading-relaxed">
              {tabMetadata.description}
            </p>
          </div>
        </header>

        {/* Dashboard Dynamic view */}
        <div className="p-4 sm:p-6 lg:p-8 flex-grow">
          {activeTab === "1" ? (
            <DashboardOverview />
          ) : activeTab === "2" ? (
            /* Tab 2: Predictive Stockout with center sub-tab switching */
            <div className="space-y-6">
              {/* Horizontal sub-tabs selector (first store, second location, third product) */}
              <div className="flex bg-slate-100/80 p-1 rounded-xl w-fit gap-1 border border-slate-200/40">
                <button
                  onClick={() => setSubTab("store")}
                  className={`px-4 py-2 rounded-lg text-xs font-bold transition duration-150 ${
                    subTab === "store"
                      ? "bg-white text-slate-900 shadow-sm border border-slate-200/20"
                      : "text-slate-500 hover:text-slate-800"
                  }`}
                >
                  Store Dashboard
                </button>
                <button
                  onClick={() => setSubTab("location")}
                  className={`px-4 py-2 rounded-lg text-xs font-bold transition duration-150 ${
                    subTab === "location"
                      ? "bg-white text-slate-900 shadow-sm border border-slate-200/20"
                      : "text-slate-500 hover:text-slate-800"
                  }`}
                >
                  Location Dashboard
                </button>
                <button
                  onClick={() => setSubTab("product")}
                  className={`px-4 py-2 rounded-lg text-xs font-bold transition duration-150 ${
                    subTab === "product"
                      ? "bg-white text-slate-900 shadow-sm border border-slate-200/20"
                      : "text-slate-500 hover:text-slate-800"
                  }`}
                >
                  Item / Product Dashboard
                </button>
              </div>

              {/* Render Selected Sub-tab view */}
              <div className="pt-2 animate-fade-in">
                {subTab === "store" ? (
                  <StoreDashboard />
                ) : subTab === "location" ? (
                  <LocationDashboard />
                ) : (
                  <ProductDashboard />
                )}
              </div>
            </div>
          ) : activeTab === "4" ? (
            /* Tab 4: Inventory Analysis (FSN classification) */
            <InventoryAnalysis />
          ) : (
            <TabPlaceholder
              tabName={currentTabName}
              icon={currentTabIcon}
            />
          )}
        </div>

      </div>
    </div>
  );
}
