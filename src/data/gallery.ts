import document from "../../content/gallery.json";
import { contentThemes, type ContentImage, type ContentTheme } from "./managedContent";

interface GalleryEntry {
  readonly id: string;
  readonly title: string;
  readonly category: string;
  readonly description: string;
  readonly tags: readonly string[];
  readonly theme: ContentTheme;
  readonly published: boolean;
  readonly image: ContentImage | null;
}

export const galleryItems = (document.items as readonly GalleryEntry[])
  .filter(item => item.published)
  .map(item => ({ ...item, gradient: contentThemes[item.theme].gallery, accent: contentThemes[item.theme].accent }));
