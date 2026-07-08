export interface Store {
  id: string;
  name: string;
  city: string;
  address: string;
  contact: string;
  activeSince: string;
  products?: Record<string, boolean>;
}

export interface Vendor {
  id: string;
  name: string;
  contact: string;
  email: string;
  isExternal: boolean;
  type: "Distributor" | "Manufacturer" | "DSD";
  region: string;
  city: string;
  onboardingDate: string;
  managedBy: string;
  contractStatus: "Active" | "Under Review" | "Expired";
  paymentTerms: string;
}

export interface Product {
  code: string;
  name: string;
  category: string;
  uom: "Litres" | "Kilograms" | "Units";
  unitPrice: number;
  storageLocation: string;
  rol: number;
  roq: number;
  colour: string;
  viscosity: string;
  vendorId: string;
  leadTimeDays: number;
}

export interface InventoryItem extends Product {
  storeId?: string;
  currentStock: number;
  safetyStockLevel: number;
  predictedStockoutDate: string;
  avgDailyConsumption: number;
  recommendedRoq: number;
  orderByDate: string;
  prMrStatus: "PR" | "MR" | "Monitor";
  riskLevel: "High" | "Medium" | "Low";
  serviceLevel: number;
}

export interface VendorProductLink {
  productCode: string;
  productName: string;
  uom: string;
  category: string;
  costScore: string;
  qualityScore: string;
  deliveryTime: string;
  overallScore: number;
  unitCost: number;
  leadTimeDays: number;
  onTimePercent: number;
  rejectionRate: number;
  deliveriesCount: number;
  qtySupplied: number;
  spend: number;
  isPrimary: boolean;
  isSoleSource: boolean;
  fsnClass: "Fast" | "Slow" | "Non-moving";
  trend: "improving" | "stable" | "declining";
}

export interface ProductVendorLink {
  vendorId: string;
  vendorName: string;
  vendorType: string;
  vendorRegion: string;
  costScore: string;
  qualityScore: string;
  deliveryTime: string;
  overallScore: number;
  unitCost: number;
  leadTimeDays: number;
  onTimePercent: number;
  rejectionRate: number;
  moq: number;
  deliveriesCount: number;
  supplySharePercent: number;
  isPrimary: boolean;
  isActive: boolean;
  trend: "improving" | "stable" | "declining";
}

export interface PurchaseOrder {
  id: string;
  vendorId: string;
  vendorName: string;
  status: "Pending Approval" | "Approved" | "In Transit" | "Delivered" | "Delayed" | "Cancelled";
  amount: number;
  expectedDeliveryDate: string;
  actualDeliveryDate?: string;
  orderDate: string;
  expectedItems: number;
  receivedItems: number;
}

export interface PurchaseRequest {
  id: string;
  storeId: string;
  storeName: string;
  priority: "High" | "Medium" | "Low";
  amount: number;
  requestedDate: string;
  status: "Pending" | "Approved" | "Rejected";
}

export interface VendorIssue {
  id: string;
  priority: "High" | "Medium" | "Low";
  vendorId: string;
  vendorName: string;
  issueType: string;
  dateReported: string;
  status: "Open" | "In Progress" | "Resolved";
  assignedTo: string;
}

export interface ProcurementActivity {
  id: string;
  timestamp: string;
  type: string;
  reference: string;
  status: string;
}

export interface AIRecommendation {
  id: string;
  recommendation: string;
  reason: string;
  priority: "High" | "Medium" | "Low";
  actionLabel: string;
}

export interface VendorECOT {
  vendorId: string;
  vendor: string;
  product: string;
  costScore: string;
  qualityScore: string;
  deliveryTime: string;
  overallScore: number;
}
