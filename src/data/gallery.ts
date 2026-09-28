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
  readonly presentation?: {
    readonly widthSpan: 1 | 2 | 3;
    readonly heightSpan: 1 | 2 | 3;
    readonly autoplay: boolean;
    readonly photos: readonly GalleryPhoto[];
  };
}

export interface GalleryPhoto extends ContentImage {
  readonly framed: boolean;
  readonly focusX: number;
  readonly focusY: number;
  readonly zoom: number;
  readonly edgeFade: boolean;
}

export const galleryItems = (document.items as readonly GalleryEntry[])
  .filter(item => item.published)
  .map(item => ({ ...item, gradient: contentThemes[item.theme].gallery, accent: contentThemes[item.theme].accent }));
