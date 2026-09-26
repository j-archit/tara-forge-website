import { fileURLToPath } from "node:url";
import { COLLECTIONS } from "./schema.mjs";
import { createStore } from "./storage.mjs";

const store = await createStore(fileURLToPath(new URL("../../", import.meta.url)));
for (const collection of COLLECTIONS) {
  const { document } = await store.load(collection);
  await store.validateAssets(document);
  console.log(`${collection}: ${document.items.length} valid entries`);
}
