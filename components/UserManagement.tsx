"use client";

import React, { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import { useData } from "../context/DataContext";

interface UserRecord {
  id: string;
  name: string;
  email: string;
  role: string;
  storeId?: string;
  region?: string;
  created_at: string;
}

export default function UserManagement() {
  const { token } = useAuth();
  const { stores } = useData();
  const [users, setUsers] = useState<UserRecord[]>([]);
  const [loadingUsers, setLoadingUsers] = useState<boolean>(true);

  // Form State
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("store manager");
  const [selectedStoreId, setSelectedStoreId] = useState("");
  const [selectedRegion, setSelectedRegion] = useState("Chicago");
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [successMsg, setSuccessMsg] = useState("");

  const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

  // Set default store when stores list loads
  useEffect(() => {
    if (stores && stores.length > 0 && !selectedStoreId) {
      setSelectedStoreId(stores[0].id);
    }
  }, [stores, selectedStoreId]);

  // Fetch all users
  const fetchUsers = async () => {
    if (!token) return;
    try {
      const res = await fetch(`${API_URL}/api/auth/users`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      if (res.ok) {
        const data = await res.json();
        setUsers(data);
      } else {
        console.error("Failed to fetch users");
      }
    } catch (err) {
      console.error("Error fetching users:", err);
    } finally {
      setLoadingUsers(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, [token]);

  // Handle Form Submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg("");
    setSuccessMsg("");

    if (!name.trim() || !email.trim() || !password.trim()) {
      setErrorMsg("All fields are required");
      return;
    }

    setSubmitting(true);
    
    // Set scope parameters based on selected role
    let storeId: string | null = null;
    let region: string | null = null;
    
    if (role === "store manager") {
      storeId = selectedStoreId || (stores[0]?.id || "");
    } else if (role === "regional head") {
      region = selectedRegion;
    }

    try {
      const res = await fetch(`${API_URL}/api/auth/signup`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          name,
          email,
          password,
          role,
          storeId,
          region
        }),
      });

      const data = await res.json();

      if (res.ok) {
        setSuccessMsg(`User ${name} registered successfully!`);
        // Reset form
        setName("");
        setEmail("");
        setPassword("");
        setRole("store manager");
        if (stores.length > 0) setSelectedStoreId(stores[0].id);
        setSelectedRegion("Chicago");
        // Refresh list
        fetchUsers();
      } else {
        setErrorMsg(data.detail || "Failed to register user");
      }
    } catch (err) {
      console.error("Register user error:", err);
      setErrorMsg("Network error. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left Form: Create User */}
        <div className="bg-white border border-slate-200/80 rounded-3xl p-6 shadow-sm lg:col-span-5 flex flex-col justify-between text-left">
          <div>
            <h2 className="text-sm font-bold text-slate-800 uppercase tracking-wider mb-5">Create New User</h2>
            
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">Full Name</label>
                <input
                  type="text"
                  placeholder="e.g. John Doe"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-3.5 py-2 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-bp-green transition duration-150 text-slate-700 font-semibold"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">Email Address</label>
                <input
                  type="email"
                  placeholder="e.g. manager@bp.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-3.5 py-2 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-bp-green transition duration-150 text-slate-700 font-semibold"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">Password</label>
                <input
                  type="password"
                  placeholder="At least 6 characters"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-3.5 py-2 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-bp-green transition duration-150 text-slate-700 font-semibold"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">System Persona Role</label>
                <select
                  value={role}
                  onChange={(e) => setRole(e.target.value)}
                  className="w-full px-3.5 py-2 border border-slate-200 bg-white rounded-xl text-sm focus:outline-none focus:border-bp-green transition duration-150 text-slate-700 font-semibold cursor-pointer"
                >
                  <option value="store manager">Store Manager</option>
                  <option value="vendor manager">Vendor Manager</option>
                  <option value="regional head">Regional Head</option>
                  <option value="retail head">Retail Head</option>
                </select>
              </div>

              {/* Conditional Store Selection dropdown */}
              {role === "store manager" && (
                <div>
                  <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">Store Assignment</label>
                  <select
                    value={selectedStoreId}
                    onChange={(e) => setSelectedStoreId(e.target.value)}
                    className="w-full px-3.5 py-2 border border-slate-200 bg-white rounded-xl text-sm focus:outline-none focus:border-bp-green transition duration-150 text-slate-700 font-semibold cursor-pointer"
                  >
                    {stores.map((s) => (
                      <option key={s.id} value={s.id}>
                        {s.name} ({s.id})
                      </option>
                    ))}
                  </select>
                </div>
              )}

              {/* Conditional Region Selection dropdown */}
              {role === "regional head" && (
                <div>
                  <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">Region Assignment</label>
                  <select
                    value={selectedRegion}
                    onChange={(e) => setSelectedRegion(e.target.value)}
                    className="w-full px-3.5 py-2 border border-slate-200 bg-white rounded-xl text-sm focus:outline-none focus:border-bp-green transition duration-150 text-slate-700 font-semibold cursor-pointer"
                  >
                    <option value="Chicago">Chicago</option>
                    <option value="Houston">Houston</option>
                    <option value="Los Angeles">Los Angeles</option>
                    <option value="Denver">Denver</option>
                  </select>
                </div>
              )}

              {errorMsg && (
                <div className="p-3 bg-rose-50 border border-rose-100 text-rose-600 rounded-xl text-xs font-semibold">
                  {errorMsg}
                </div>
              )}

              {successMsg && (
                <div className="p-3 bg-emerald-50 border border-emerald-100 text-emerald-600 rounded-xl text-xs font-semibold">
                  {successMsg}
                </div>
              )}

              <button
                type="submit"
                disabled={submitting}
                className="w-full py-2.5 bg-bp-green hover:bg-bp-green-dark text-white rounded-xl text-xs font-bold transition duration-150 disabled:opacity-50 mt-2 shadow-sm"
              >
                {submitting ? "Creating User..." : "Register Account"}
              </button>
            </form>
          </div>
        </div>

        {/* Right Table: Active Logins */}
        <div className="bg-white border border-slate-200/80 rounded-3xl p-6 shadow-sm lg:col-span-7 flex flex-col justify-between text-left">
          <div>
            <h2 className="text-sm font-bold text-slate-800 uppercase tracking-wider mb-5">Active Registered Accounts</h2>
            
            {loadingUsers ? (
              <div className="flex items-center justify-center py-12">
                <svg className="animate-spin h-8 w-8 text-bp-green" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
              </div>
            ) : (
              <div className="overflow-x-auto max-h-[380px] overflow-y-auto pr-1">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="border-b border-slate-100 text-slate-400 font-bold uppercase sticky top-0 bg-white pb-2">
                      <th className="py-2.5">User</th>
                      <th className="py-2.5">Role</th>
                      <th className="py-2.5">Scope</th>
                      <th className="py-2.5 text-right">Created</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100/60 font-semibold text-slate-700">
                    {users.map((u) => (
                      <tr key={u.id}>
                        <td className="py-3">
                          <div className="flex flex-col">
                            <span className="text-slate-800 font-semibold">{u.name}</span>
                            <span className="text-slate-400 font-normal text-[10px]">{u.email}</span>
                          </div>
                        </td>
                        <td className="py-3">
                          <span className={`px-2 py-0.5 rounded text-[10px] uppercase font-bold border ${
                            u.role === "super admin" ? "bg-purple-50 text-purple-600 border-purple-100" :
                            u.role === "retail head" ? "bg-indigo-50 text-indigo-600 border-indigo-100" :
                            u.role === "regional head" ? "bg-blue-50 text-blue-600 border-blue-100" :
                            u.role === "vendor manager" ? "bg-amber-50 text-amber-600 border-amber-100" :
                            "bg-emerald-50 text-emerald-600 border-emerald-100"
                          }`}>
                            {u.role}
                          </span>
                        </td>
                        <td className="py-3">
                          <span className="text-[10px] font-bold text-slate-500 uppercase">
                            {u.role === "store manager" ? (
                              <span className="text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-100">
                                Store: {u.storeId}
                              </span>
                            ) : u.role === "regional head" ? (
                              <span className="text-blue-600 bg-blue-50 px-1.5 py-0.5 rounded border border-blue-100">
                                Region: {u.region}
                              </span>
                            ) : (
                              <span className="text-slate-400 bg-slate-50 px-1.5 py-0.5 rounded border border-slate-100">
                                Global
                              </span>
                            )}
                          </span>
                        </td>
                        <td className="py-3 text-right text-slate-500 text-[10px] font-normal">
                          {new Date(u.created_at).toLocaleDateString(undefined, {
                            year: "numeric",
                            month: "short",
                            day: "numeric",
                          })}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>

      </div>
    </div>
  );
}
