import document from "../../content/products.json";
import { contentThemes, type ContentImage, type ContentTheme } from "./managedContent";

export interface Product {
  readonly id: string;
  readonly title: string;
  readonly category: string;
  readonly description: string;
  readonly price: number;
  readonly currency: string;
  readonly imageGradient: string;
  readonly accent: string;
  readonly tag?: string;
  readonly image: ContentImage | null;
}

interface ProductEntry extends Omit<Product, "imageGradient" | "accent"> {
  readonly theme: ContentTheme;
  readonly published: boolean;
}

// Ordered, versioned content; the local editor never publishes automatically.
export const products: readonly Product[] = (document.items as readonly ProductEntry[])
  .filter(item => item.published)
  .map(item => ({ ...item, imageGradient: contentThemes[item.theme].shop, accent: contentThemes[item.theme].shopAccent }));
