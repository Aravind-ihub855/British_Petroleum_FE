// Deterministic mock database for North American BP Connect ampm Convenience Stores
// Mapped boundaries: 4 cities, 10 stores, 25 vendors, 150 master products (100-200 random stores variants)

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

// 1. 25 Onboarded Vendors with full SaaS metadata profiles
export const vendors: Vendor[] = [
  { id: "VND-001", name: "Castrol USA Lubricants", contact: "John Davis", email: "orders@castrol.us", isExternal: true, type: "Manufacturer", region: "Midwest", city: "Chicago", onboardingDate: "12-Oct-2019", managedBy: "Alex Rivera", contractStatus: "Active", paymentTerms: "Net 30" },
  { id: "VND-002", name: "Coca-Cola Bottling Co.", contact: "Sarah Miller", email: "delivery@coca-cola.com", isExternal: true, type: "DSD", region: "South", city: "Houston", onboardingDate: "05-Jan-2020", managedBy: "Emma Stone", contractStatus: "Active", paymentTerms: "Net 15" },
  { id: "VND-003", name: "Frito-Lay North America", contact: "Mike Johnson", email: "snacks@fritolay.com", isExternal: true, type: "DSD", region: "West", city: "Los Angeles", onboardingDate: "18-Feb-2020", managedBy: "Marcus Vance", contractStatus: "Active", paymentTerms: "Net 30" },
  { id: "VND-004", name: "McLane Company Distribution", contact: "Robert Lee", email: "supply@mclane.com", isExternal: true, type: "Distributor", region: "Midwest", city: "Chicago", onboardingDate: "22-Jul-2018", managedBy: "Alex Rivera", contractStatus: "Active", paymentTerms: "Net 45" },
  { id: "VND-005", name: "Keurig Dr Pepper Group", contact: "Emily Watson", email: "beverages@kdp.com", isExternal: true, type: "DSD", region: "South", city: "Houston", onboardingDate: "14-Mar-2020", managedBy: "Emma Stone", contractStatus: "Active", paymentTerms: "Net 30" },
  { id: "VND-006", name: "Hershey Chocolate USA", contact: "Chris Brown", email: "sales@hersheys.com", isExternal: true, type: "Manufacturer", region: "Northeast", city: "Denver", onboardingDate: "09-Jun-2020", managedBy: "Sarah Jenkins", contractStatus: "Active", paymentTerms: "Net 30" },
  { id: "VND-007", name: "Kraft Heinz Foodservice", contact: "David Clark", email: "orders@kraftheinz.com", isExternal: true, type: "Manufacturer", region: "Midwest", city: "Chicago", onboardingDate: "11-Nov-2019", managedBy: "Alex Rivera", contractStatus: "Active", paymentTerms: "Net 30" },
  { id: "VND-008", name: "PepsiCo Beverages NA", contact: "Amanda Taylor", email: "dispatch@pepsico.com", isExternal: true, type: "DSD", region: "West", city: "Los Angeles", onboardingDate: "01-Apr-2020", managedBy: "Marcus Vance", contractStatus: "Active", paymentTerms: "Net 15" },
  { id: "VND-009", name: "General Mills Inc.", contact: "James Wilson", email: "grocery@generalmills.com", isExternal: true, type: "Manufacturer", region: "Midwest", city: "Chicago", onboardingDate: "15-Dec-2018", managedBy: "Alex Rivera", contractStatus: "Active", paymentTerms: "Net 45" },
  { id: "VND-010", name: "Nestle USA Snacks", contact: "Jessica Thomas", email: "orders@nestle.com", isExternal: true, type: "Manufacturer", region: "Northeast", city: "Denver", onboardingDate: "03-Mar-2019", managedBy: "Sarah Jenkins", contractStatus: "Active", paymentTerms: "Net 30" },
  { id: "VND-011", name: "Mondelez International", contact: "Brian Garcia", email: "orders@mondelez.com", isExternal: true, type: "Distributor", region: "Northeast", city: "Denver", onboardingDate: "20-May-2020", managedBy: "Sarah Jenkins", contractStatus: "Active", paymentTerms: "Net 30" },
  { id: "VND-012", name: "Tyson Foods Distributors", contact: "Kevin Martinez", email: "meat@tyson.com", isExternal: true, type: "Manufacturer", region: "Midwest", city: "Chicago", onboardingDate: "12-Sep-2019", managedBy: "Alex Rivera", contractStatus: "Active", paymentTerms: "Net 30" },
  { id: "VND-013", name: "Kellogg Sales Company", contact: "Rachel Robinson", email: "cereal@kelloggs.com", isExternal: true, type: "Manufacturer", region: "Midwest", city: "Chicago", onboardingDate: "05-Aug-2019", managedBy: "Alex Rivera", contractStatus: "Active", paymentTerms: "Net 30" },
  { id: "VND-014", name: "Hostess Brands Bakery", contact: "Jason White", email: "cakes@hostess.com", isExternal: true, type: "Manufacturer", region: "Northeast", city: "Denver", onboardingDate: "14-Feb-2020", managedBy: "Sarah Jenkins", contractStatus: "Active", paymentTerms: "Net 30" },
  { id: "VND-015", name: "Mars Wrigley Confectionery", contact: "Lisa Harris", email: "sweets@mars.com", isExternal: true, type: "Manufacturer", region: "Midwest", city: "Chicago", onboardingDate: "10-Oct-2019", managedBy: "Alex Rivera", contractStatus: "Active", paymentTerms: "Net 30" },
  { id: "VND-016", name: "Valvoline Lubricants NA", contact: "Daniel Lewis", email: "commercial@valvoline.com", isExternal: true, type: "Manufacturer", region: "South", city: "Houston", onboardingDate: "04-Apr-2021", managedBy: "Emma Stone", contractStatus: "Active", paymentTerms: "Net 30" },
  { id: "VND-017", name: "Chevron Lubricants USA", contact: "Thomas Allen", email: "industrial@chevron.com", isExternal: true, type: "Manufacturer", region: "West", city: "Los Angeles", onboardingDate: "08-Dec-2020", managedBy: "Marcus Vance", contractStatus: "Active", paymentTerms: "Net 30" },
  { id: "VND-018", name: "Shell Lubricants US", contact: "Sandra King", email: "fluids@shell.com", isExternal: true, type: "Manufacturer", region: "South", city: "Houston", onboardingDate: "15-Jun-2020", managedBy: "Emma Stone", contractStatus: "Active", paymentTerms: "Net 45" },
  { id: "VND-019", name: "ExxonMobil Lubricants Co", contact: "Paul Wright", email: "lubes@exxonmobil.com", isExternal: true, type: "Manufacturer", region: "South", city: "Houston", onboardingDate: "02-Nov-2020", managedBy: "Emma Stone", contractStatus: "Active", paymentTerms: "Net 30" },
  { id: "VND-020", name: "Procter & Gamble Sales", contact: "Mark Scott", email: "orders@pg.com", isExternal: true, type: "Manufacturer", region: "Midwest", city: "Chicago", onboardingDate: "18-Sep-2018", managedBy: "Alex Rivera", contractStatus: "Active", paymentTerms: "Net 45" },
  { id: "VND-021", name: "Unilever Grocery NA", contact: "Steven Green", email: "orders@unilever.com", isExternal: true, type: "Distributor", region: "Midwest", city: "Chicago", onboardingDate: "01-Oct-2019", managedBy: "Alex Rivera", contractStatus: "Active", paymentTerms: "Net 30" },
  { id: "VND-022", name: "Kimberly-Clark Corp", contact: "Karen Adams", email: "hygiene@kcc.com", isExternal: true, type: "Manufacturer", region: "Northeast", city: "Denver", onboardingDate: "12-Apr-2020", managedBy: "Sarah Jenkins", contractStatus: "Active", paymentTerms: "Net 30" },
  { id: "VND-023", name: "Colgate-Palmolive Co", contact: "Donald Baker", email: "orders@colgate.com", isExternal: true, type: "Manufacturer", region: "Northeast", city: "Denver", onboardingDate: "20-May-2020", managedBy: "Sarah Jenkins", contractStatus: "Active", paymentTerms: "Net 30" },
  { id: "VND-024", name: "Clorox Professional", contact: "Helen Nelson", email: "sanitation@clorox.com", isExternal: true, type: "Manufacturer", region: "West", city: "Los Angeles", onboardingDate: "10-Jul-2020", managedBy: "Marcus Vance", contractStatus: "Active", paymentTerms: "Net 30" },
  { id: "VND-025", name: "Conagra Brands Wholesale", contact: "Gary Carter", email: "foods@conagra.com", isExternal: true, type: "Distributor", region: "Midwest", city: "Chicago", onboardingDate: "08-Aug-2019", managedBy: "Alex Rivera", contractStatus: "Active", paymentTerms: "Net 30" },
];

// 2. 10 Stores across 4 Cities
export const stores: Store[] = [
  // Chicago
  { id: "BP-CHI-1024", name: "Loop Connect", city: "Chicago", address: "200 N Michigan Ave, Chicago, IL", contact: "+1 (312) 555-0199", activeSince: "Oct 2021" },
  { id: "BP-CHI-1025", name: "Lincoln Park Connect", city: "Chicago", address: "2400 N Halsted St, Chicago, IL", contact: "+1 (312) 555-0210", activeSince: "Mar 2022" },
  { id: "BP-CHI-1026", name: "Wrigleyville Connect", city: "Chicago", address: "3600 N Clark St, Chicago, IL", contact: "+1 (312) 555-0223", activeSince: "Jul 2022" },
  // Houston
  { id: "BP-HOU-1050", name: "Westheimer Rd ampm", city: "Houston", address: "8201 Westheimer Rd, Houston, TX", contact: "+1 (713) 555-0145", activeSince: "Jan 2022" },
  { id: "BP-HOU-1051", name: "Galleria Connect", city: "Houston", address: "5015 Westheimer Rd, Houston, TX", contact: "+1 (713) 555-0158", activeSince: "May 2022" },
  // Los Angeles
  { id: "BP-LAX-1088", name: "Sunset Blvd Connect", city: "Los Angeles", address: "6420 Sunset Blvd, Los Angeles, CA", contact: "+1 (323) 555-0177", activeSince: "Apr 2022" },
  { id: "BP-LAX-1089", name: "Hollywood Blvd Connect", city: "Los Angeles", address: "7000 Hollywood Blvd, Los Angeles, CA", contact: "+1 (323) 555-0182", activeSince: "Sep 2022" },
  { id: "BP-LAX-1090", name: "Santa Monica ampm", city: "Los Angeles", address: "1400 Santa Monica Blvd, Santa Monica, CA", contact: "+1 (310) 555-0300", activeSince: "Nov 2022" },
  // Denver
  { id: "BP-DEN-2001", name: "Cherry Creek ampm", city: "Denver", address: "100 University Blvd, Denver, CO", contact: "+1 (303) 555-0123", activeSince: "Jul 2022" },
  { id: "BP-DEN-2002", name: "LoDo Connect", city: "Denver", address: "1600 Blake St, Denver, CO", contact: "+1 (303) 555-0138", activeSince: "Dec 2022" },
];

// Helper to generate deterministic numeric values based on a seed string (hash function)
function getSeedHash(str: string): number {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = str.charCodeAt(i) + ((hash << 5) - hash);
  }
  return Math.abs(hash);
}

// 3. Generate 150 Master Products programmatically
const baseProductsList = [
  // Automotive Lubricants (Litres)
  { name: "Castrol GTX 5W30", category: "Automotive", uom: "Litres" as const, price: 9.99, viscosity: "5W-30", colour: "Golden Amber", storage: "Shelves / Drums" },
  { name: "Castrol GTX 10W40", category: "Automotive", uom: "Litres" as const, price: 9.99, viscosity: "10W-40", colour: "Golden Amber", storage: "Shelves / Drums" },
  { name: "Castrol Edge 5W20 Synthetic", category: "Automotive", uom: "Litres" as const, price: 12.99, viscosity: "5W-20", colour: "Light Amber", storage: "Shelves" },
  { name: "Castrol Edge 5W30 Full Syn", category: "Automotive", uom: "Litres" as const, price: 12.99, viscosity: "5W-30", colour: "Light Amber", storage: "Shelves" },
  { name: "Castrol Edge 0W20 Full Syn", category: "Automotive", uom: "Litres" as const, price: 13.49, viscosity: "0W-20", colour: "Light Amber", storage: "Shelves" },
  { name: "Castrol Transmax ATF Fluid", category: "Automotive", uom: "Litres" as const, price: 11.49, viscosity: "ATF Fluid", colour: "Red", storage: "Drums (200L)" },
  { name: "BP Coolant Green Pre-mix", category: "Automotive", uom: "Litres" as const, price: 8.99, viscosity: "Low (Water-like)", colour: "Fluorescent Green", storage: "Cans (5L)" },
  { name: "BP Coolant Orange Concentrate", category: "Automotive", uom: "Litres" as const, price: 10.99, viscosity: "Low (Water-like)", colour: "Fluorescent Orange", storage: "Cans (5L)" },
  { name: "Valvoline MaxLife 5W30", category: "Automotive", uom: "Litres" as const, price: 11.99, viscosity: "5W-30", colour: "Golden", storage: "Shelves" },
  { name: "Mobil 1 Extended Performance", category: "Automotive", uom: "Litres" as const, price: 14.99, viscosity: "5W-30", colour: "Amber", storage: "Shelves" },
  { name: "Shell Rotella T4 15W40", category: "Automotive", uom: "Litres" as const, price: 10.49, viscosity: "15W-40", colour: "Brownish Golden", storage: "Drums (200L)" },
  { name: "Brake Fluid DOT 4 Heavy", category: "Automotive", uom: "Litres" as const, price: 7.49, viscosity: "Low", colour: "Pale Yellow", storage: "Bottles (1L)" },
  
  // Beverages (Units)
  { name: "Coca-Cola 20oz Bottle", category: "Beverage", uom: "Units" as const, price: 2.29, viscosity: "N/A", colour: "Dark Brown", storage: "Cooler A" },
  { name: "Coca-Cola Zero Sugar 20oz", category: "Beverage", uom: "Units" as const, price: 2.29, viscosity: "N/A", colour: "Dark Brown", storage: "Cooler A" },
  { name: "Diet Coke 20oz Bottle", category: "Beverage", uom: "Units" as const, price: 2.29, viscosity: "N/A", colour: "Dark Brown", storage: "Cooler A" },
  { name: "Sprite 20oz Bottle", category: "Beverage", uom: "Units" as const, price: 2.29, viscosity: "N/A", colour: "Clear", storage: "Cooler A" },
  { name: "Fanta Orange 20oz Bottle", category: "Beverage", uom: "Units" as const, price: 2.29, viscosity: "N/A", colour: "Bright Orange", storage: "Cooler A" },
  { name: "Monster Energy Original 16oz", category: "Beverage", uom: "Units" as const, price: 3.49, viscosity: "N/A", colour: "Greenish Gold", storage: "Cooler B" },
  { name: "Monster Ultra White SugarFree", category: "Beverage", uom: "Units" as const, price: 3.49, viscosity: "N/A", colour: "Cloudy White", storage: "Cooler B" },
  { name: "Red Bull Energy Drink 12oz", category: "Beverage", uom: "Units" as const, price: 3.99, viscosity: "N/A", colour: "Light Amber", storage: "Cooler B" },
  { name: "SmartWater Vapor Distilled 1L", category: "Beverage", uom: "Units" as const, price: 2.79, viscosity: "N/A", colour: "Clear", storage: "Cooler C" },
  { name: "Dr Pepper 20oz Bottle", category: "Beverage", uom: "Units" as const, price: 2.29, viscosity: "N/A", colour: "Dark Reddish Brown", storage: "Cooler C" },
  { name: "Gatorade Cool Blue 24oz", category: "Beverage", uom: "Units" as const, price: 2.49, viscosity: "N/A", colour: "Bright Blue", storage: "Cooler D" },
  { name: "Gatorade Lemon Lime 24oz", category: "Beverage", uom: "Units" as const, price: 2.49, viscosity: "N/A", colour: "Yellow-Green", storage: "Cooler D" },
  
  // Snack Foods (Units)
  { name: "Doritos Nacho Cheese 9oz", category: "Food", uom: "Units" as const, price: 4.99, viscosity: "N/A", colour: "Orange", storage: "Aisle 1" },
  { name: "Doritos Cool Ranch 9oz", category: "Food", uom: "Units" as const, price: 4.99, viscosity: "N/A", colour: "White-dusted", storage: "Aisle 1" },
  { name: "Lay's Classic Potato Chips 8oz", category: "Food", uom: "Units" as const, price: 4.49, viscosity: "N/A", colour: "Pale Yellow", storage: "Aisle 1" },
  { name: "Lay's Sour Cream & Onion 8oz", category: "Food", uom: "Units" as const, price: 4.49, viscosity: "N/A", colour: "Speckled Green", storage: "Aisle 1" },
  { name: "Lay's Barbecue Chips 8oz", category: "Food", uom: "Units" as const, price: 4.49, viscosity: "N/A", colour: "Reddish Brown", storage: "Aisle 1" },
  { name: "Pringles Sour Cream & Onion", category: "Food", uom: "Units" as const, price: 2.49, viscosity: "N/A", colour: "Cream", storage: "Aisle 2" },
  { name: "Cheetos Crunchy Cheese 8.5oz", category: "Food", uom: "Units" as const, price: 4.79, viscosity: "N/A", colour: "Neon Orange", storage: "Aisle 2" },
  { name: "Snickers Chocolate Bar Standard", category: "Food", uom: "Units" as const, price: 1.89, viscosity: "N/A", colour: "Brown", storage: "Register Rack" },
  { name: "Reese's Peanut Butter Cups Std", category: "Food", uom: "Units" as const, price: 1.89, viscosity: "N/A", colour: "Light Brown", storage: "Register Rack" },
  { name: "M&M Peanut Candy King Size", category: "Food", uom: "Units" as const, price: 2.49, viscosity: "N/A", colour: "Multi-colour", storage: "Register Rack" },
  { name: "Kit Kat Crisp Wafer Standard", category: "Food", uom: "Units" as const, price: 1.89, viscosity: "N/A", colour: "Dark Brown", storage: "Register Rack" },
  
  // Grocery items
  { name: "Whole Milk Gallon Jug", category: "Grocery", uom: "Litres" as const, price: 3.99, viscosity: "N/A", colour: "White", storage: "Dairy Cooler" },
  { name: "2% Reduced Fat Milk Gallon", category: "Grocery", uom: "Litres" as const, price: 3.99, viscosity: "N/A", colour: "White", storage: "Dairy Cooler" },
  { name: "Wonder Bread White Loaf 20oz", category: "Grocery", uom: "Units" as const, price: 2.99, viscosity: "N/A", colour: "White/Brown Crust", storage: "Bread Stand" },
  { name: "Grade A Large White Eggs Dozen", category: "Grocery", uom: "Units" as const, price: 4.29, viscosity: "N/A", colour: "White", storage: "Dairy Cooler" },
  { name: "Land O Lakes Salted Butter 1lb", category: "Grocery", uom: "Kilograms" as const, price: 5.49, viscosity: "N/A", colour: "Yellow", storage: "Dairy Cooler" },
  { name: "Campbell Soup Chicken Noodle", category: "Grocery", uom: "Units" as const, price: 1.69, viscosity: "Medium", colour: "Yellowish", storage: "Aisle 3" },
  { name: "Tide Liquid Laundry Detergent", category: "Grocery", uom: "Litres" as const, price: 11.99, viscosity: "Viscous Liquid", colour: "Blue", storage: "Aisle 4" },
  { name: "Colgate Total Toothpaste 5oz", category: "Grocery", uom: "Units" as const, price: 3.89, viscosity: "Paste", colour: "White-Blue Striped", storage: "Aisle 4" },
  { name: "Dawn Platinum Dish Soap 16oz", category: "Grocery", uom: "Litres" as const, price: 3.49, viscosity: "Viscous", colour: "Deep Blue", storage: "Aisle 4" }
];

export const masterProducts: Product[] = [];

// Generate exactly 150 unique product variations deterministically using volumetric or quantity tags
for (let i = 0; i < 150; i++) {
  const base = baseProductsList[i % baseProductsList.length];
  const sizeMultiplier = Math.floor(i / baseProductsList.length) + 1;
  
  let sizeTag = "";
  let priceAdj = 0;
  let code = `BP-PROD-${String(i + 1).padStart(3, "0")}`;

  if (base.uom === "Litres") {
    // Automotive liters size extensions
    if (sizeMultiplier === 1) { sizeTag = " (1 Quart)"; priceAdj = 0; }
    else if (sizeMultiplier === 2) { sizeTag = " (5 Quart Jug)"; priceAdj = 25.00; }
    else { sizeTag = " (1 Gallon)"; priceAdj = 18.00; }
  } else if (base.category === "Beverage") {
    if (sizeMultiplier === 1) { sizeTag = ""; priceAdj = 0; }
    else if (sizeMultiplier === 2) { sizeTag = " 12-Pack Cans"; priceAdj = 5.50; }
    else { sizeTag = " 2-Litre Bottle"; priceAdj = 0.80; }
  } else if (base.category === "Food") {
    if (sizeMultiplier === 1) { sizeTag = ""; priceAdj = 0; }
    else if (sizeMultiplier === 2) { sizeTag = " Family Size Bag"; priceAdj = 2.50; }
    else { sizeTag = " Sharing Size Bar"; priceAdj = 1.00; }
  } else {
    if (sizeMultiplier === 1) { sizeTag = ""; priceAdj = 0; }
    else { sizeTag = " Value Pack"; priceAdj = 4.00; }
  }

  // Assign vendor deterministically based on product code index
  const vendorIndex = i % vendors.length;

  masterProducts.push({
    code,
    name: `${base.name}${sizeTag}`,
    category: base.category,
    uom: base.uom,
    unitPrice: parseFloat((base.price + priceAdj).toFixed(2)),
    storageLocation: base.storage,
    rol: Math.round(15 + (getSeedHash(code) % 35)),
    roq: Math.round(50 + (getSeedHash(code) % 150)),
    colour: base.colour,
    viscosity: base.viscosity,
    vendorId: vendors[vendorIndex].id,
    leadTimeDays: 1 + (getSeedHash(code) % 4) // Lead times: 1 to 5 days
  });
}

// 4. Relational Seeding Generator (Each store gets between 100 and 140 random products dynamically)
export function getStoreInventory(storeId: string): InventoryItem[] {
  const storeSeed = getSeedHash(storeId);
  
  // Dynamic target count between 100 and 140 products
  const targetCount = 100 + (storeSeed % 41); 

  const inventory: InventoryItem[] = [];

  for (let i = 0; i < targetCount; i++) {
    // Step by 7 (which is coprime to 150) to query all unique products
    const productIdx = (storeSeed + i * 7) % masterProducts.length;
    const product = masterProducts[productIdx];

    // Skip duplicates inside same store catalog
    if (inventory.some((item) => item.code === product.code)) {
      continue;
    }

    // Deterministic item properties seed
    const itemSeed = getSeedHash(storeId + product.code);

    // Beverages/foods consumption is higher than automotive lubricants
    let avgConsumption = 1.5 + (itemSeed % 10); // Default 1.5 to 11.5 units per day
    if (product.category === "Beverage") {
      avgConsumption = 20.0 + (itemSeed % 40); // 20.0 to 60.0 units per day
    } else if (product.category === "Food") {
      avgConsumption = 10.0 + (itemSeed % 25); // 10.0 to 35.0 units per day
    }

    avgConsumption = parseFloat(avgConsumption.toFixed(1));

    // Calculate current stock levels (to force varying risk distribution: ~15% at risk, 85% safe)
    let currentStock = Math.round(avgConsumption * (5 + (itemSeed % 25)));
    
    // Let's make select high-profile products universally short-stocked
    // to simulate regional supply shortages across multiple stores
    const isRegionalShortage =
      product.code === "BP-PROD-001" ||
      product.code === "BP-PROD-002" ||
      product.code === "BP-PROD-003" ||
      product.code === "BP-PROD-004";

    if (storeId === "ST-003" || storeId === "ST-006") {
      // Force healthy inventory levels for ST-003 and ST-006 so they act as fully non-risk stores
      currentStock = Math.round(avgConsumption * (15 + (itemSeed % 15)));
    } else if (isRegionalShortage) {
      const cityDemandSkew = stores.find((store) => store.id === storeId)?.city.length || 0;
      const shortageCoverageDays = 1 + ((itemSeed + storeSeed + productIdx + cityDemandSkew) % 6);
      currentStock = Math.max(1, Math.round(avgConsumption * shortageCoverageDays)); // 1 to 6 days of stock
    } else if (i < 8) {
      const localCoverageDays = 1 + ((itemSeed + storeSeed + i) % 6);
      currentStock = Math.max(1, Math.round(avgConsumption * localCoverageDays)); // 1 to 6 days of stock
    }

    // Safety stock derived: SS = Math.ceil(ADC * 0.5 * LeadTime)
    const safetyStockLevel = Math.ceil(avgConsumption * 0.5 * product.leadTimeDays);

    // Derived ROL = (ADC * LeadTime) + SS
    const derivedRol = Math.ceil(avgConsumption * product.leadTimeDays) + safetyStockLevel;

    // Derived ROQ = ADC * 15 (Standard 15 days coverage limit)
    const derivedRoq = Math.round(avgConsumption * 15);

    // Days to stockout = currentStock / ADC
    const daysToStockout = currentStock / avgConsumption;
    const daysInt = Math.floor(daysToStockout);

    // Expected predicted stockout date
    const stockoutDateObj = new Date();
    stockoutDateObj.setDate(stockoutDateObj.getDate() + daysInt);
    
    const dStr = String(stockoutDateObj.getDate()).padStart(2, "0");
    const mStr = String(stockoutDateObj.getMonth() + 1).padStart(2, "0");
    const predictedStockoutDate = `${dStr}-${mStr}-${stockoutDateObj.getFullYear()}`;

    // Order By Date = Predicted Stockout Date - Lead Time
    const orderByDateObj = new Date(stockoutDateObj);
    orderByDateObj.setDate(orderByDateObj.getDate() - product.leadTimeDays);
    const ordD = String(orderByDateObj.getDate()).padStart(2, "0");
    const ordM = String(orderByDateObj.getMonth() + 1).padStart(2, "0");
    const orderByDate = `${ordD}-${ordM}-${orderByDateObj.getFullYear()}`;

    // PR/MR status trigger check
    let prMrStatus: "PR" | "MR" | "Monitor" = "Monitor";
    if (currentStock <= derivedRol) {
      prMrStatus = "PR";
    } else if (currentStock <= derivedRol + avgConsumption * 3) {
      prMrStatus = "MR";
    }

    // Risk classification flags
    let riskLevel: "High" | "Medium" | "Low" = "Low";
    if (daysToStockout <= 7) {
      riskLevel = "High";
    } else if (daysToStockout <= 15) {
      riskLevel = "Medium";
    }

    const serviceLevel = 90 + (itemSeed % 10); // 90% to 99% dynamic targets

    inventory.push({
      ...product,
      currentStock,
      safetyStockLevel,
      rol: derivedRol,
      roq: derivedRoq,
      predictedStockoutDate,
      avgDailyConsumption: avgConsumption,
      recommendedRoq: derivedRoq,
      orderByDate,
      prMrStatus,
      riskLevel,
      serviceLevel
    });
  }

  // Sort inventory so that High Risk / PR items display at the top (better UI usability)
  return inventory.sort((a, b) => {
    const riskRank = { High: 3, Medium: 2, Low: 1 };
    return riskRank[b.riskLevel] - riskRank[a.riskLevel];
  });
}

// 5. Global aggregated lookup helper by North American city bounds
export function getLocationInventory(city: string): { storesCount: number; productsCount: number; valString: string; atRiskCount: number; stockoutsCount: number } {
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
    stockoutsCount
  };
}

// 6. Vendor capability log seeding matrices
// 6. Vendor capability log seeding matrices
export interface VendorECOT {
  vendorId: string;
  vendor: string;
  product: string;
  costScore: string;
  qualityScore: string;
  deliveryTime: string;
  overallScore: number;
}

export function getVendorPerformanceMetrics(): VendorECOT[] {
  const performanceLogs: VendorECOT[] = [];

  // Generate for all 25 vendors
  vendors.forEach((vendor, index) => {
    // Link to a deterministic master product
    const product = masterProducts[index % masterProducts.length];
    
    // Deterministic seed
    const seed = getSeedHash(vendor.id);
    const costScoreVal = 85 + (seed % 15); // 85% to 99%
    const qualityScoreVal = 92 + (seed % 8); // 92% to 99%
    const leadTime = (1.5 + (seed % 30) / 10).toFixed(1); // 1.5 to 4.5 days
    const scoreVal = parseFloat((8.0 + (seed % 20) / 10).toFixed(1)); // 8.0 to 10.0 score

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

// 7. Product-wise Sourcing (multiple vendors per SKU)
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

export function getVendorsForProduct(productCode: string): ProductVendorLink[] {
  const hash = getSeedHash(productCode);
  
  // Decide how many vendors supply this product (1, 2, or 3)
  // Let's make some products have single-vendor dependency (e.g. hash % 3 === 0)
  const vendorCount = (hash % 3 === 0) ? 1 : (hash % 3 === 1) ? 2 : 3;
  
  const links: ProductVendorLink[] = [];
  const product = masterProducts.find((p) => p.code === productCode) || masterProducts[0];
  
  for (let i = 0; i < vendorCount; i++) {
    // Select vendor deterministically
    const vIdx = (hash + i * 7) % vendors.length;
    const vendor = vendors[vIdx];
    
    const vSeed = getSeedHash(productCode + vendor.id);
    const isPrimary = i === 0;
    
    // Cost, quality, delivery scores
    const costScoreVal = 85 + (vSeed % 15);
    const qualityScoreVal = 90 + (vSeed % 10);
    const leadTimeVal = 1 + (vSeed % 4);
    const scoreVal = parseFloat((8.0 + (vSeed % 20) / 10).toFixed(1));
    
    // Unit cost relative to the reference price in masterProducts
    const priceFactor = 0.9 + (vSeed % 25) / 100; // 0.9x to 1.15x of base price
    const unitCost = parseFloat((product.unitPrice * priceFactor).toFixed(2));
    
    const onTimePercent = 85 + (vSeed % 16);
    const rejectionRate = parseFloat(((vSeed % 50) / 10).toFixed(1));
    const moq = 10 + (vSeed % 5) * 10;
    
    // Share of supply splits
    let supplySharePercent = 100;
    if (vendorCount === 2) {
      supplySharePercent = isPrimary ? 70 : 30;
    } else if (vendorCount === 3) {
      supplySharePercent = isPrimary ? 60 : i === 1 ? 25 : 15;
    }
    
    links.push({
      vendorId: vendor.id,
      vendorName: vendor.name,
      vendorType: vendor.type,
      vendorRegion: vendor.region,
      costScore: `${costScoreVal}%`,
      qualityScore: `${qualityScoreVal}%`,
      deliveryTime: `${leadTimeVal} Days`,
      overallScore: scoreVal,
      unitCost,
      leadTimeDays: leadTimeVal,
      onTimePercent,
      rejectionRate,
      moq,
      deliveriesCount: 15 + (vSeed % 30),
      supplySharePercent,
      isPrimary,
      isActive: true,
      trend: (vSeed % 3 === 0) ? "improving" : (vSeed % 3 === 1) ? "stable" : "declining"
    });
  }
  
  // Sort vendors so the highest overall score is first (best recommended source)
  return links.sort((a, b) => b.overallScore - a.overallScore);
}

// 8. Vendor-wise Product listings
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

export function getProductsForVendor(vendorId: string): VendorProductLink[] {
  const links: VendorProductLink[] = [];
  
  // Filter masterProducts supplied by this vendor
  masterProducts.forEach((product) => {
    // Check if vendor supplies this product (either as primary vendorId or dynamically matched)
    const seed = getSeedHash(vendorId + product.code);
    const isSupplier = product.vendorId === vendorId || (seed % 12 === 0);
    
    if (isSupplier) {
      const isPrimary = product.vendorId === vendorId;
      
      // Cost, quality, time
      const costScoreVal = 85 + (seed % 15);
      const qualityScoreVal = 91 + (seed % 9);
      const leadTimeVal = product.leadTimeDays;
      const scoreVal = parseFloat((8.1 + (seed % 19) / 10).toFixed(1));
      
      const priceFactor = 0.95 + (seed % 15) / 100;
      const unitCost = parseFloat((product.unitPrice * priceFactor).toFixed(2));
      
      const onTimePercent = 88 + (seed % 13);
      const rejectionRate = parseFloat(((seed % 40) / 10).toFixed(1));
      const qtySupplied = 500 + (seed % 20) * 150;
      const spend = parseFloat((unitCost * qtySupplied).toFixed(2));
      
      // Is sole source? Check if getVendorsForProduct yields only 1 vendor
      const vendorsForThis = getVendorsForProduct(product.code);
      const isSoleSource = vendorsForThis.length === 1;
      
      // FSN Class
      const fsnClass = product.code === "BP-PROD-001" || product.code === "BP-PROD-002" ? "Fast" : (seed % 2 === 0) ? "Slow" : "Non-moving";

      links.push({
        productCode: product.code,
        productName: product.name,
        uom: product.uom,
        category: product.category,
        costScore: `${costScoreVal}%`,
        qualityScore: `${qualityScoreVal}%`,
        deliveryTime: `${leadTimeVal} Days`,
        overallScore: scoreVal,
        unitCost,
        leadTimeDays: leadTimeVal,
        onTimePercent,
        rejectionRate,
        deliveriesCount: 8 + (seed % 15),
        qtySupplied,
        spend,
        isPrimary,
        isSoleSource,
        fsnClass,
        trend: (seed % 3 === 0) ? "improving" : (seed % 3 === 1) ? "stable" : "declining"
      });
    }
  });
  
  return links.sort((a, b) => b.overallScore - a.overallScore);
}
