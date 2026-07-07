"use client";

import React from "react";

interface TabPlaceholderProps {
  tabName: string;
  icon: React.ReactNode;
}

export default function TabPlaceholder({ tabName, icon }: TabPlaceholderProps) {
  return (
    <div className="bg-white border border-slate-200/60 rounded-3xl p-10 shadow-sm text-center">
      <div className="mx-auto w-16 h-16 rounded-full bg-bp-green/10 flex items-center justify-center text-bp-green mb-5">
        {icon}
      </div>
      <h3 className="text-xl font-bold text-slate-900 mb-2">{tabName} Module</h3>
      <p className="text-slate-500 text-sm max-w-md mx-auto leading-relaxed">
        This module provides complete visual controls and predictive tools for {tabName.toLowerCase()}. Currently running in simulation environment.
      </p>
      <button className="bg-bp-green hover:bg-bp-green-dark text-white font-bold text-xs px-5 py-2.5 rounded-full mt-6 shadow-sm transition duration-150">
        Configure Settings
      </button>
    </div>
  );
}
