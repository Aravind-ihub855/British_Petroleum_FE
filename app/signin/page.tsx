"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useAuth } from "../../context/AuthContext";

export default function SignIn() {
  const { login } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    if (!email || !password) {
      setError("Please fill in all fields.");
      setLoading(false);
      return;
    }

    try {
      const response = await fetch(`${API_URL}/api/auth/signin`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.detail || "Authentication failed.");
      }

      await login(data.access_token);
    } catch (err: any) {
      setError(err.message || "An unexpected error occurred. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex-grow flex items-center justify-center p-6 bg-bp-cream relative min-h-[90vh]">
      <div className="w-full max-w-md">
        {/* Card Body */}
        <div className="bg-white border border-slate-200/80 rounded-3xl p-8 md:p-10 shadow-xl shadow-slate-100 flex flex-col">
          
          {/* BP Corporate Logo Emblem */}
          <div className="flex justify-center mb-6">
            <div className="relative w-16 h-16 flex items-center justify-center bg-white rounded-full shadow-md border border-slate-100 p-2">
              <img src="/logo/BP.svg" alt="BP Logo" className="w-12 h-12 object-contain" />
            </div>
          </div>

          <div className="text-center mb-8">
            <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-slate-900 font-sans">
              Sign in to BP
            </h1>
            <p className="text-slate-500 text-sm mt-1.5 font-medium">
              Access your demand forecasting workspace
            </p>
          </div>

          {error && (
            <div className="mb-6 p-4 bg-rose-50 border border-rose-100 text-rose-700 rounded-2xl text-sm flex items-center gap-2.5 animate-fadeIn">
              <svg className="w-5 h-5 flex-shrink-0 text-rose-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
              <span className="font-semibold">{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="email" className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">
                Email Address
              </label>
              <input
                id="email"
                type="email"
                required
                className="w-full bg-slate-50/50 border border-slate-200 focus:border-bp-green focus:bg-white text-slate-800 placeholder-slate-400 rounded-2xl px-4 py-3.5 text-sm focus:outline-none focus:ring-4 focus:ring-bp-green/10 transition-all duration-200 font-medium"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={loading}
              />
            </div>

            <div>
              <div className="flex justify-between items-center mb-2">
                <label htmlFor="password" className="block text-xs font-bold uppercase tracking-wider text-slate-500">
                  Password
                </label>
              </div>
              <input
                id="password"
                type="password"
                required
                className="w-full bg-slate-50/50 border border-slate-200 focus:border-bp-green focus:bg-white text-slate-800 placeholder-slate-400 rounded-2xl px-4 py-3.5 text-sm focus:outline-none focus:ring-4 focus:ring-bp-green/10 transition-all duration-200 font-medium"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={loading}
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-bp-green hover:bg-bp-green-dark text-white rounded-full py-3.5 px-6 text-sm font-bold shadow-md shadow-bp-green/15 hover:shadow-lg hover:shadow-bp-green/20 focus:outline-none focus:ring-4 focus:ring-bp-green/20 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <svg className="animate-spin h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  <span>Signing In...</span>
                </>
              ) : (
                <span>Sign In</span>
              )}
            </button>
          </form>

          <div className="mt-8 text-center border-t border-slate-100 pt-6">
            <p className="text-slate-500 text-sm font-medium">
              New to BP workspace?{" "}
              <Link
                href="/signup"
                className="font-bold text-bp-green hover:text-bp-green-dark hover:underline transition duration-150 ease-in-out"
              >
                Sign up free
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
