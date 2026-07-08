import { getStoreInventory, stores } from "./mockDb";

stores.forEach((st) => {
  const inv = getStoreInventory(st.id);
  console.log(`Store ${st.id} (${st.name}): total products = ${inv.length}`);
});
