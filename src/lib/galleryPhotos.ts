import type { GalleryPhoto } from "../data/gallery";
import type { ContentImage } from "../data/managedContent";

interface GalleryPhotoSource {
  readonly image: ContentImage | null;
  readonly presentation?: { readonly photos: readonly GalleryPhoto[] };
}

export function galleryPhotosFor(item: GalleryPhotoSource): readonly GalleryPhoto[] {
  if (item.presentation) return item.presentation.photos;
  return item.image ? [{ ...item.image, framed: true, focusX: 50, focusY: 50, zoom: 1, edgeFade: false }] : [];
}
