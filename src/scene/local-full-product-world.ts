import { loadLocalJsprev2Scan } from "./jsprev2-scan.js";
import {
  createProductWorld,
  type ProductWorldLoader,
} from "./product-world.js";

export const loadLocalFullProductWorld: ProductWorldLoader = async () =>
  createProductWorld(await loadLocalJsprev2Scan());
