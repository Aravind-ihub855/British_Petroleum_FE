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

export function getVendorsForProductDB(vendors: Vendor[], productCode: string) {
  const hash = getSeedHash(productCode);
  const vendorCount = (hash % 3 === 0) ? 1 : (hash % 3 === 1) ? 2 : 3;
  const links = [];
  for (let i = 0; i < vendorCount; i++) {
    const vIdx = (hash + i * 7) % vendors.length;
    if (vendors[vIdx]) {
      const vendor = vendors[vIdx];
      const seed = getSeedHash(vendor.id + productCode);
      links.push({
        vendorId: vendor.id,
        vendorName: vendor.name,
        vendorType: vendor.type || "Distributor",
        vendorRegion: vendor.region || "National",
        costScore: `${80 + (seed % 20)}%`,
        qualityScore: `${85 + (seed % 15)}%`,
        deliveryTime: `${(1 + (seed % 40) / 10).toFixed(1)} Days`,
        overallScore: parseFloat((8.0 + (seed % 20) / 10).toFixed(1)),
        unitCost: 1.5 + (seed % 10),
        leadTimeDays: 1 + (seed % 4),
        onTimePercent: 85 + (seed % 15),
        rejectionRate: parseFloat((0.5 + (seed % 20) / 10).toFixed(1)),
        moq: (seed % 5 + 1) * 100,
        deliveriesCount: 50 + (seed % 200),
        supplySharePercent: Math.round(100 / vendorCount),
        isPrimary: i === 0,
        isActive: true,
        trend: (seed % 3 === 0) ? "improving" : (seed % 3 === 1) ? "stable" : "declining"
      });
    }
  }
  return links;
}

export function getProductsForVendorDB(masterProducts: Product[], vendorId: string) {
  const hash = getSeedHash(vendorId);
  const numProducts = 3 + (hash % 6);
  const productLinks = [];
  for (let i = 0; i < numProducts; i++) {
    const pIdx = (hash + i * 11) % masterProducts.length;
    if (masterProducts[pIdx]) {
      const p = masterProducts[pIdx];
      const seed = getSeedHash(vendorId + p.code);
      productLinks.push({
        productCode: p.code,
        productName: p.name,
        category: p.category,
        uom: p.uom,
        unitCost: p.unitPrice ? parseFloat((p.unitPrice * (0.8 + (seed % 40) / 100)).toFixed(2)) : (1.5 + (seed % 10)),
        deliveryTime: `${1 + (seed % 5)} Days`,
        isSoleSource: seed % 4 === 0,
        fsnClass: p.code === "BP-PROD-001" ? "Fast" : (seed % 2 === 0 ? "Non-moving" : "Slow"),
        deliveriesCount: 20 + (seed % 100),
        overallScore: parseFloat((8.0 + (seed % 20) / 10).toFixed(1)),
        spend: 5000 + (seed % 20000),
        onTimePercent: 80 + (seed % 20),
        leadTimeDays: 1 + (seed % 5),
        rejectionRate: parseFloat((0.5 + (seed % 25) / 10).toFixed(1)),
        trend: (seed % 3 === 0) ? "improving" : (seed % 3 === 1) ? "stable" : "declining"
      });
    }
  }
  return productLinks;
}
