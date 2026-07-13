import { Store, Vendor, Product, InventoryItem } from "./mockDb";

// We'll reuse the types from mockDb, but we WON'T use its data arrays.
import { PurchaseOrder, PurchaseRequest, AIRecommendation, VendorECOT, VendorIssue } from "./mockDb";

// Simple deterministic hash function based on string
const getSeedHash = (str: string): number => {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = Math.imul(31, hash) + str.charCodeAt(i) | 0;
  }
  return Math.abs(hash);
};

export function calculateVendorPerformanceMetrics(vendors: Vendor[], masterProducts: Product[]): VendorECOT[] {
  if (!vendors.length || !masterProducts.length) return [];

  const performanceLogs: VendorECOT[] = [];

  vendors.forEach((vendor, index) => {
    const product = masterProducts[index % masterProducts.length];
    const seed = getSeedHash(vendor.id);
    const costScoreVal = 85 + (seed % 15);
    const qualityScoreVal = 92 + (seed % 8);
    const leadTime = (1.5 + (seed % 30) / 10).toFixed(1);
    const scoreVal = parseFloat((8.0 + (seed % 20) / 10).toFixed(1));

    performanceLogs.push({
      vendorId: vendor.id,
      vendor: vendor.name,
      product: product.name,
      costScore: `${costScoreVal}%`,
      qualityScore: `${qualityScoreVal}%`,
      deliveryTime: `${leadTime} Days`,
      overallScore: scoreVal
    });
  });

  return performanceLogs.sort((a, b) => b.overallScore - a.overallScore);
}

export function generateDBProcurementData(stores: Store[], vendors: Vendor[]) {
  const purchaseOrders: PurchaseOrder[] = [];
  const purchaseRequests: PurchaseRequest[] = [];
  const recommendations: AIRecommendation[] = [];

  const issues: VendorIssue[] = [];

  if (vendors.length === 0 || stores.length === 0) {
    return { purchaseOrders, purchaseRequests, issues, recommendations };
  }

  const statuses = ["Pending Approval", "Pending Review", "Returned", "Approved", "In Transit", "Delivered", "Delivered", "Delivered", "Delayed", "Cancelled"];

  const today = new Date();

  // Generate POs based on DB vendors
  vendors.forEach((vendor, vIdx) => {
    const seed = getSeedHash(vendor.id);
    const numPOs = 3 + (seed % 5);

    for (let i = 0; i < numPOs; i++) {
      const pSeed = seed + i;
      let status = statuses[pSeed % statuses.length];

      const expectedDate = new Date(today);
      expectedDate.setDate(today.getDate() + ((pSeed % 14) - 7)); // -7 to +7 days

      const isChicago = vendor.city.toLowerCase() === "chicago";
      if (isChicago && i === 0) {
        status = "Delayed"; // Force a delay so supply risk is triggered
        expectedDate.setDate(today.getDate() - 2); // Expected 2 days ago
      }

      let actualDate: string | undefined = undefined;
      if (status === "Delivered") {
        const actual = new Date(expectedDate);
        if (pSeed % 5 === 0) actual.setDate(actual.getDate() + (pSeed % 3) + 1); // Delayed
        else if (pSeed % 3 === 0) actual.setDate(actual.getDate() - 1); // Early
        actualDate = actual.toISOString().split("T")[0];
      }

      const expectedItems = 50 + (pSeed % 100);
      const receivedItems = status === "Delivered" ? expectedItems : 0;

      purchaseOrders.push({
        id: `PO-${10000 + vIdx * 100 + i}`,
        vendorId: vendor.id,
        vendorName: vendor.name,
        orderDate: new Date(today.getTime() - (pSeed % 30) * 86400000).toISOString().split("T")[0],
        expectedDeliveryDate: expectedDate.toISOString().split("T")[0],
        actualDeliveryDate: actualDate,
        amount: 2500 + (pSeed % 15000),
        status: status as any,
        expectedItems,
        receivedItems
      });
    }
  });

  // Generate PRs based on DB stores
  stores.forEach((st, sIdx) => {
    const seed = getSeedHash(st.id);
    const numPRs = 1 + (seed % 3);
    for (let i = 0; i < numPRs; i++) {
      purchaseRequests.push({
        id: `PR-${5000 + sIdx * 10 + i}`,
        storeId: st.id,
        storeName: st.name,
        priority: (seed % 5 === 0) ? "High" : (seed % 2 === 0) ? "Medium" : "Low",
        amount: 1500 + (seed % 5000),
        requestedDate: new Date(today.getTime() - (seed % 10) * 86400000).toISOString().split("T")[0],
        status: "Pending"
      });
    }
  });

  // Generate some AI Recommendations
  recommendations.push({
    id: "R1",
    recommendation: "Consolidate Orders",
    reason: `You have multiple pending orders with ${vendors[0].name}`,
    priority: "High",
    actionLabel: "Review Orders"
  });

  if (vendors.length > 1) {
    recommendations.push({
      id: "R2",
      recommendation: "Negotiate Bulk Discount",
      reason: `${vendors[1].name} spend has increased by 15% this quarter.`,
      priority: "Medium",
      actionLabel: "View Spend Analysis"
    });
  }

  // Generate some realistic Vendor Issues based on vendors
  const issueTypes = ["Delivery delayed by 2 days", "Fill Rate below SLA", "Invoice mismatch", "Quality control failure", "Missing documentation"];
  const severities = ["High", "Medium", "Low", "High", "Medium"];

  vendors.forEach((vendor, vIdx) => {
    const seed = getSeedHash(vendor.id + "issue");
    const isChicago = vendor.city.toLowerCase() === "chicago";
    // Ensure Chicago vendors have issues so the dashboard isn't empty
    if (seed % 3 === 0 || (isChicago && vIdx % 2 === 0)) {
      const issueIdx = (isChicago && vIdx % 2 === 0) ? 0 : (seed % issueTypes.length); // Force "High" priority for Chicago
      issues.push({
        id: `ISSUE-${1000 + vIdx}`,
        vendorId: vendor.id,
        vendorName: vendor.name,
        issueType: issueTypes[issueIdx],
        dateReported: new Date(today.getTime() - (seed % 5) * 86400000).toISOString().split("T")[0],
        status: "Open", // Force them to be open so they appear in action center
        priority: severities[issueIdx] as any,
        assignedTo: "Procurement Team"
      });
    }
  });

  return { purchaseOrders, purchaseRequests, issues, recommendations };
}

export function getVendorsForProductDB(vendors: Vendor[], productCode: string, masterProducts: Product[]) {
  const hash = getSeedHash(productCode);
  const activeProduct = masterProducts.find((p) => p.code === productCode);
  const vendorCount = (hash % 3 === 0) ? 1 : (hash % 3 === 1) ? 2 : 3;
  const links: any[] = [];

  // Add the primary vendor first
  const primaryVendor = activeProduct ? vendors.find(v => v.id === activeProduct.vendorId) : null;
  if (primaryVendor && activeProduct) {
    const seed = getSeedHash(primaryVendor.id + productCode);
    links.push({
      vendorId: primaryVendor.id,
      vendorName: primaryVendor.name,
      vendorType: primaryVendor.type || "Distributor",
      vendorRegion: primaryVendor.region || "National",
      costScore: `${85 + (seed % 15)}%`,
      qualityScore: `${90 + (seed % 8)}%`,
      deliveryTime: `${activeProduct.leadTimeDays} Days`,
      overallScore: parseFloat((8.5 + (seed % 15) / 10).toFixed(1)),
      unitCost: activeProduct.unitPrice,
      leadTimeDays: activeProduct.leadTimeDays,
      onTimePercent: 90 + (seed % 10),
      rejectionRate: parseFloat((0.2 + (seed % 15) / 10).toFixed(1)),
      moq: (seed % 3 + 1) * 100,
      deliveriesCount: 120 + (seed % 80),
      supplySharePercent: 100, // will adjust below
      isPrimary: true,
      isActive: true,
      trend: (seed % 3 === 0) ? "improving" : (seed % 3 === 1) ? "stable" : "declining"
    });
  }

  // Add alternative vendors
  const otherVendors = vendors.filter(v => !primaryVendor || v.id !== primaryVendor.id);
  const remainingCount = vendorCount - (primaryVendor ? 1 : 0);
  for (let i = 0; i < remainingCount; i++) {
    if (otherVendors.length === 0) break;
    const vIdx = (hash + i * 7) % otherVendors.length;
    const vendor = otherVendors[vIdx];
    if (vendor) {
      const seed = getSeedHash(vendor.id + productCode);
      const baseCost = activeProduct ? activeProduct.unitPrice : 10.0;
      const baseLeadTime = activeProduct ? activeProduct.leadTimeDays : 3;

      const costMultiplier = 0.95 + (seed % 20) / 100; // 0.95x to 1.15x cost
      const altCost = parseFloat((baseCost * costMultiplier).toFixed(2));
      const altLeadTime = Math.max(1, baseLeadTime + (seed % 3 - 1)); // -1 to +1 days lead time

      links.push({
        vendorId: vendor.id,
        vendorName: vendor.name,
        vendorType: vendor.type || "Distributor",
        vendorRegion: vendor.region || "National",
        costScore: `${75 + (seed % 20)}%`,
        qualityScore: `${80 + (seed % 18)}%`,
        deliveryTime: `${altLeadTime} Days`,
        overallScore: parseFloat((7.0 + (seed % 25) / 10).toFixed(1)),
        unitCost: altCost,
        leadTimeDays: altLeadTime,
        onTimePercent: 80 + (seed % 15),
        rejectionRate: parseFloat((0.5 + (seed % 25) / 10).toFixed(1)),
        moq: (seed % 4 + 1) * 150,
        deliveriesCount: 40 + (seed % 100),
        supplySharePercent: 0, // will adjust below
        isPrimary: false,
        isActive: true,
        trend: (seed % 3 === 0) ? "improving" : (seed % 3 === 1) ? "stable" : "declining"
      });
    }
  }

  // Adjust supply share percentages
  if (links.length > 0) {
    if (links.length === 1) {
      links[0].supplySharePercent = 100;
    } else if (links.length === 2) {
      links[0].supplySharePercent = 70;
      links[1].supplySharePercent = 30;
    } else {
      links[0].supplySharePercent = 60;
      links[1].supplySharePercent = 25;
      if (links[2]) links[2].supplySharePercent = 15;
    }
  }

  return links;
}

export function getProductsForVendorDB(masterProducts: Product[], vendorId: string) {
  const hash = getSeedHash(vendorId);
  const numProducts = 3 + (hash % 6);
  const productLinks: any[] = [];

  // Get products where this vendor is the primary vendor
  const primaryProducts = masterProducts.filter(p => p.vendorId === vendorId);
  const otherProducts = masterProducts.filter(p => p.vendorId !== vendorId);

  const selectedProducts = [...primaryProducts];
  if (selectedProducts.length < numProducts) {
    const needed = numProducts - selectedProducts.length;
    for (let i = 0; i < needed; i++) {
      if (otherProducts.length === 0) break;
      const pIdx = (hash + i * 11) % otherProducts.length;
      const p = otherProducts[pIdx];
      if (p && !selectedProducts.some(sp => sp.code === p.code)) {
        selectedProducts.push(p);
      }
    }
  }

  selectedProducts.forEach((p) => {
    const seed = getSeedHash(vendorId + p.code);
    const isPrimary = p.vendorId === vendorId;

    const unitCost = isPrimary ? p.unitPrice : parseFloat((p.unitPrice * (0.95 + (seed % 15) / 100)).toFixed(2));
    const leadTime = isPrimary ? p.leadTimeDays : Math.max(1, p.leadTimeDays + (seed % 3 - 1));

    productLinks.push({
      productCode: p.code,
      productName: p.name,
      category: p.category,
      uom: p.uom,
      unitCost: unitCost,
      deliveryTime: `${leadTime} Days`,
      isSoleSource: isPrimary && !masterProducts.some(mp => mp.code === p.code && mp.vendorId !== vendorId),
      fsnClass: "Slow", // dynamically overridden in frontend
      deliveriesCount: 40 + (seed % 110),
      overallScore: parseFloat((8.0 + (seed % 18) / 10).toFixed(1)),
      spend: 4000 + (seed % 18000),
      onTimePercent: 82 + (seed % 18),
      leadTimeDays: leadTime,
      rejectionRate: parseFloat((0.4 + (seed % 20) / 10).toFixed(1)),
      trend: (seed % 3 === 0) ? "improving" : (seed % 3 === 1) ? "stable" : "declining"
    });
  });

  return productLinks;
}

export interface DynamicDates {
  daysToStockout: number;
  predictedStockoutDate: string;
  orderByDate: string;
  riskLevel: "High" | "Medium" | "Low";
  prMrStatus: string;
}

export function getDynamicInventoryDates(item: any, todayDate: Date): DynamicDates {
  const avgCons = item.avgDailyConsumption || 1.5;
  const leadTime = item.leadTimeDays || 3;
  const currentStock = item.currentStock;

  // Days to stockout
  const daysToStockout = avgCons > 0 ? Math.floor(currentStock / avgCons) : 999;

  // Predicted Stockout Date
  const stockoutDateObj = new Date(todayDate);
  stockoutDateObj.setDate(todayDate.getDate() + daysToStockout);

  const pad = (num: number) => String(num).padStart(2, "0");
  const predictedStockoutDate = `${pad(stockoutDateObj.getDate())}-${pad(stockoutDateObj.getMonth() + 1)}-${stockoutDateObj.getFullYear()}`;

  // Order By Date
  const orderByDateObj = new Date(stockoutDateObj);
  orderByDateObj.setDate(stockoutDateObj.getDate() - leadTime);
  const orderByDate = `${pad(orderByDateObj.getDate())}-${pad(orderByDateObj.getMonth() + 1)}-${orderByDateObj.getFullYear()}`;

  // Risk Level
  let riskLevel: "High" | "Medium" | "Low" = "Low";
  if (daysToStockout <= 7) {
    riskLevel = "High";
  } else if (daysToStockout <= 15) {
    riskLevel = "Medium";
  }

  // PR/MR Status
  let prMrStatus = "Monitor";
  const derivedRol = Math.ceil(avgCons * leadTime) + item.safetyStockLevel;
  if (currentStock <= derivedRol) {
    if (daysToStockout >= leadTime) {
      prMrStatus = "PR";
    } else {
      prMrStatus = "MR";
    }
  }

  return {
    daysToStockout,
    predictedStockoutDate,
    orderByDate,
    riskLevel,
    prMrStatus
  };
}
