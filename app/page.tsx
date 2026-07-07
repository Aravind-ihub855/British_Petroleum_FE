"use client";

import React from "react";
import { useAuth } from "../context/AuthContext";

export default function Home() {
  const { user, logout, loading } = useAuth();

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
    return null; // AuthContext handles routing redirect
  }

  const memberSince = user.created_at
    ? new Date(user.created_at).toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
      })
    : "Recently";

  return (
    <div className="flex-grow flex flex-col bg-bp-cream text-slate-800 min-h-screen relative overflow-hidden">
      {/* Top Banner Accent */}
      <div className="h-1.5 w-full bg-gradient-to-r from-bp-green via-bp-yellow to-bp-green-light" />

      {/* Navbar Header */}
      <header className="bg-white border-b border-slate-200/80 shadow-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            {/* Helios logo symbol */}
            <div className="w-10 h-10 flex items-center justify-center bg-white rounded-full border border-slate-100 shadow-sm p-1">
              <img src="/logo/BP.svg" alt="BP Logo" className="w-7 h-7 object-contain" />
            </div>
            <div className="flex flex-col">
              <span className="font-extrabold text-lg text-slate-900 tracking-tight leading-none">
                bp
              </span>
              <span className="text-[10px] text-slate-500 font-bold uppercase tracking-widest mt-0.5">
                Predictive Planning
              </span>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="hidden md:flex flex-col text-right">
              <span className="text-sm font-bold text-slate-800">{user.name}</span>
              <span className="text-xs text-slate-500 font-medium">{user.email}</span>
            </div>
            
            <button
              onClick={logout}
              className="bg-slate-100 hover:bg-slate-200 border border-slate-200 text-slate-700 text-xs font-bold px-4 py-2 rounded-full transition duration-150 ease-in-out shadow-sm"
            >
              Sign Out
            </button>
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="max-w-7xl mx-auto px-6 py-12 w-full flex-grow flex flex-col justify-start">
        {/* Welcome Section */}
        <div className="mb-10 bg-white border border-slate-200/60 rounded-3xl p-6 md:p-8 shadow-sm flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-slate-900 mb-1">
              Hello, {user.name}
            </h1>
            <p className="text-slate-500 text-sm font-medium">
              Welcome back to your workspace. You are authenticated with BP's secure systems.
            </p>
          </div>
          
          <div className="flex gap-2">
            <span className="bg-bp-green/10 text-bp-green border border-bp-green/20 text-xs font-bold px-3 py-1.5 rounded-full flex items-center gap-1.5 shadow-sm">
              <span className="w-2 h-2 rounded-full bg-bp-green animate-pulse" />
              API Server Online
            </span>
          </div>
        </div>

        {/* Dashboard Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Column 1: Profile metadata */}
          <div className="md:col-span-1">
            <div className="bg-white border border-slate-200/80 rounded-3xl p-6 shadow-md shadow-slate-100/50 flex flex-col h-full">
              <h2 className="text-base font-bold text-slate-950 mb-5 pb-3 border-b border-slate-100 flex items-center gap-2">
                <svg className="w-5 h-5 text-bp-green" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
                Identity Details
              </h2>
              
              <div className="space-y-4 text-sm font-medium">
                <div>
                  <span className="text-slate-400 block text-xs font-bold uppercase tracking-wider mb-0.5">User Account</span>
                  <span className="text-slate-800 text-base font-bold">{user.name}</span>
                </div>
                
                <div>
                  <span className="text-slate-400 block text-xs font-bold uppercase tracking-wider mb-0.5">Corporate Email</span>
                  <span className="text-slate-800 font-semibold">{user.email}</span>
                </div>
                
                <div>
                  <span className="text-slate-400 block text-xs font-bold uppercase tracking-wider mb-0.5">Authorization Date</span>
                  <span className="text-slate-700">{memberSince}</span>
                </div>

                <div>
                  <span className="text-slate-400 block text-xs font-bold uppercase tracking-wider mb-1">MongoDB Record ID</span>
                  <code className="text-xs font-mono bg-slate-50 border border-slate-100 px-2.5 py-2 rounded-xl text-bp-green block overflow-x-auto select-all">
                    {user.id}
                  </code>
                </div>
              </div>
            </div>
          </div>

          {/* Column 2 & 3: Database & Tech Stack Details */}
          <div className="md:col-span-2">
            <div className="bg-white border border-slate-200/80 rounded-3xl p-6 shadow-md shadow-slate-100/50 flex flex-col justify-between h-full">
              <div>
                <h2 className="text-base font-bold text-slate-950 mb-5 pb-3 border-b border-slate-100 flex items-center gap-2">
                  <svg className="w-5 h-5 text-bp-green" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                  </svg>
                  System & Database Connectivity
                </h2>

                <p className="text-slate-500 text-sm mb-6 leading-relaxed font-medium">
                  Authentication module is securely integrated with a <code className="text-bp-green font-bold">MongoDB Atlas</code> cluster. User registrations and sign-ins are verified asynchronously in the backend using Python FastAPI, using hashed passwords securely encrypted through <code className="text-bp-green font-bold">bcrypt</code> standards.
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="bg-slate-50 border border-slate-100 rounded-2xl p-4">
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="text-xs text-slate-400 font-bold uppercase tracking-wider">Database Name</span>
                      <span className="w-2 h-2 rounded-full bg-bp-green animate-pulse" />
                    </div>
                    <span className="text-slate-800 font-bold text-sm">BP Database (Active)</span>
                  </div>

                  <div className="bg-slate-50 border border-slate-100 rounded-2xl p-4">
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="text-xs text-slate-400 font-bold uppercase tracking-wider">Backend Service</span>
                      <span className="w-2 h-2 rounded-full bg-bp-green" />
                    </div>
                    <span className="text-slate-800 font-bold text-sm">Python FastAPI (v0.111.0)</span>
                  </div>

                  <div className="bg-slate-50 border border-slate-100 rounded-2xl p-4">
                    <span className="text-xs text-slate-400 font-bold uppercase tracking-wider block mb-1">User Collection</span>
                    <span className="text-slate-800 font-bold text-sm">users (Collection ID)</span>
                  </div>

                  <div className="bg-slate-50 border border-slate-100 rounded-2xl p-4">
                    <span className="text-xs text-slate-400 font-bold uppercase tracking-wider block mb-1">JWT Expiry</span>
                    <span className="text-slate-800 font-bold text-sm">1440 Minutes (1 Day)</span>
                  </div>
                </div>
              </div>

              <div className="mt-6 flex justify-end gap-3 border-t border-slate-100 pt-4 text-xs font-bold">
                <a
                  href="https://fastapi.tiangolo.com/"
                  target="_blank"
                  rel="noreferrer"
                  className="text-bp-green hover:text-bp-green-dark hover:underline transition duration-150"
                >
                  FastAPI Docs
                </a>
                <span className="text-slate-300">|</span>
                <a
                  href="https://nextjs.org/"
                  target="_blank"
                  rel="noreferrer"
                  className="text-bp-green hover:text-bp-green-dark hover:underline transition duration-150"
                >
                  Next.js Docs
                </a>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-slate-200/80 py-6 mt-12 text-center text-xs text-slate-400 font-bold uppercase tracking-widest relative z-10">
        © 2026 BP plc. All rights reserved.
      </footer>
    </div>
  );
}
