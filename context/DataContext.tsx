"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import { useAuth } from "./AuthContext";
import { Store, Vendor, Product, InventoryItem, PurchaseOrder, VendorIssue, AIRecommendation } from "@/utils/mockDb";

interface DataContextType {
  stores: Store[];
  masterProducts: Product[];
  vendors: Vendor[];
  allInventory: InventoryItem[];
  purchaseOrders: PurchaseOrder[];
  vendorIssues: VendorIssue[];
  recommendations: AIRecommendation[];
  loading: boolean;
  refreshData: () => Promise<void>;
  getStoreInventory: (storeId: string) => InventoryItem[];
  getLocationInventory: (city: string) => {
    storesCount: number;
    productsCount: number;
    valString: string;
    atRiskCount: number;
    stockoutsCount: number;
  };
}

const DataContext = createContext<DataContextType | undefined>(undefined);

export function DataProvider({ children }: { children: React.ReactNode }) {
  const { token, user } = useAuth();
  const [stores, setStores] = useState<Store[]>([]);
  const [masterProducts, setMasterProducts] = useState<Product[]>([]);
  const [vendors, setVendors] = useState<Vendor[]>([]);
  const [allInventory, setAllInventory] = useState<InventoryItem[]>([]);
  const [purchaseOrders, setPurchaseOrders] = useState<PurchaseOrder[]>([]);
  const [vendorIssues, setVendorIssues] = useState<VendorIssue[]>([]);
  const [recommendations, setRecommendations] = useState<AIRecommendation[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

  const refreshData = async () => {
    if (!token || !user) {
      setStores([]);
      setMasterProducts([]);
      setVendors([]);
      setAllInventory([]);
      setPurchaseOrders([]);
      setVendorIssues([]);
      setRecommendations([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    try {
      // 1. Fetch Stores (scoped by backend)
      const storesRes = await fetch(`${API_URL}/api/data/stores`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const storesData = storesRes.ok ? await storesRes.json() : [];

      // 2. Fetch Products
      const productsRes = await fetch(`${API_URL}/api/data/products`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const productsData = productsRes.ok ? await productsRes.json() : [];

      // 3. Fetch Vendors
      const vendorsRes = await fetch(`${API_URL}/api/data/vendors`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const vendorsData = vendorsRes.ok ? await vendorsRes.json() : [];

      // 4. Fetch Scoped Inventory
      const inventoryRes = await fetch(`${API_URL}/api/data/inventory`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const inventoryData = inventoryRes.ok ? await inventoryRes.json() : [];

      // 5. Fetch Procurement Data
      const poRes = await fetch(`${API_URL}/api/data/purchase-orders`, { headers: { Authorization: `Bearer ${token}` } });
      const poData = poRes.ok ? await poRes.json() : [];
      
      const issuesRes = await fetch(`${API_URL}/api/data/vendor-issues`, { headers: { Authorization: `Bearer ${token}` } });
      const issuesData = issuesRes.ok ? await issuesRes.json() : [];
      
      const recsRes = await fetch(`${API_URL}/api/data/recommendations`, { headers: { Authorization: `Bearer ${token}` } });
      const recsData = recsRes.ok ? await recsRes.json() : [];

      // Global Region Filter
      let scopedStores = storesData;
      let scopedVendors = vendorsData;
      
      if (user?.region) {
        const userRegion = user.region.toLowerCase();
        scopedStores = storesData.filter((s: any) => s.city.toLowerCase() === userRegion);
        scopedVendors = vendorsData.filter((v: any) => v.city.toLowerCase() === userRegion);
      }
      
      const scopedStoreIds = new Set(scopedStores.map((s: any) => s.id));
      const scopedInventory = inventoryData.filter((i: any) => scopedStoreIds.has(i.storeId));
      
      const scopedVendorIds = new Set(scopedVendors.map((v: any) => v.id));
      let finalProducts = productsData.filter((p: any) => scopedVendorIds.has(p.vendorId));
      
      if (user?.role === "store manager" && user?.storeId) {
        const managerStore = scopedStores.find((s: any) => s.id === user.storeId);
        if (managerStore && managerStore.products) {
          finalProducts = finalProducts.filter((p: any) => managerStore.products[p.code]);
        }
      }
      
      // Filter procurement data to scoped vendors
      const scopedPOs = poData.filter((po: any) => scopedVendorIds.has(po.vendorId));
      const scopedIssues = issuesData.filter((i: any) => scopedVendorIds.has(i.vendorId));
      
      setStores(scopedStores);
      setMasterProducts(finalProducts);
      setVendors(scopedVendors);
      setAllInventory(scopedInventory);
      setPurchaseOrders(scopedPOs);
      setVendorIssues(scopedIssues);
      setRecommendations(recsData);
    } catch (err) {
      console.error("Error loading database scoping datasets:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    refreshData();
  }, [token, user]);

  // Scoped helper: get inventory for a store, sorted by risk descending
  const getStoreInventory = (storeId: string): InventoryItem[] => {
    const list = allInventory.filter((item) => item.storeId === storeId);
    return list.sort((a, b) => {
      const riskRank = { High: 3, Medium: 2, Low: 1 };
      return riskRank[b.riskLevel] - riskRank[a.riskLevel];
    });
  };

  // Scoped helper: get inventory summary for a city
  const getLocationInventory = (city: string) => {
    const cityStores = stores.filter((s) => s.city.toLowerCase() === city.toLowerCase());
    
    let totalStockValue = 0;
    let atRiskCount = 0;
    let stockoutsCount = 0;
    const uniqueProducts = new Set<string>();

    cityStores.forEach((st) => {
      const inv = getStoreInventory(st.id);
      inv.forEach((item) => {
        totalStockValue += item.currentStock * item.unitPrice;
        uniqueProducts.add(item.code);
        if (item.riskLevel === "High") {
          atRiskCount++;
        }
        if (item.currentStock <= item.rol) {
          stockoutsCount++;
        }
      });
    });

    const valString = `$ ${(totalStockValue / 1000000).toFixed(2)} M`;

    return {
      storesCount: cityStores.length,
      productsCount: uniqueProducts.size,
      valString,
      atRiskCount,
      stockoutsCount,
    };
  };

  return (
    <DataContext.Provider
      value={{
        stores,
        masterProducts,
        vendors,
        allInventory,
        purchaseOrders,
        vendorIssues,
        recommendations,
        loading,
        refreshData,
        getStoreInventory,
        getLocationInventory,
      }}
    >
      {children}
    </DataContext.Provider>
  );
}

export function useData() {
  const context = useContext(DataContext);
  if (context === undefined) {
    throw new Error("useData must be used within a DataProvider");
  }
  return context;
}
