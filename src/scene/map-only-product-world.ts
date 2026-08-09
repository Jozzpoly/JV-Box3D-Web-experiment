import {
  createProductWorld,
  type ProductWorldLoader,
} from "./product-world.js";

// MAP is the portable baseline. It must never probe the private JSPREV2
// boundary; selecting SCAN is the only profile allowed to do that.
export const loadMapOnlyProductWorld: ProductWorldLoader = async () =>
  createProductWorld();
