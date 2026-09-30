import { CONTACT } from "../data/siteContent.ts";
import { canonicalUrl, SITE_NAME, SITE_URL } from "./siteMetadata.ts";

export const BUSINESS_ID = `${SITE_URL}/#business`;
export const WEBSITE_ID = `${SITE_URL}/#website`;

// Managed text must never be able to close a script tag in the exported HTML.
export function serializeJsonLd(value: unknown): string {
  return JSON.stringify(value).replace(/</g, "\\u003c").replace(/\u2028/g, "\\u2028").replace(/\u2029/g, "\\u2029");
}

export function businessSchema() {
  return {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "LocalBusiness", "@id": BUSINESS_ID, name: SITE_NAME, url: canonicalUrl(),
        logo: `${SITE_URL}/brand/app-icons/apple-touch-icon.png`,
        image: `${SITE_URL}/images/jet-engine.webp`,
        description: "A Bangalore-based 3D printing studio making prototypes, functional parts, figurines and small batches in PLA and PETG, with shipping across India.",
        email: CONTACT.email,
        telephone: `+${CONTACT.whatsappNumber}`,
        contactPoint: { "@type": "ContactPoint", contactType: "Quotes and order enquiries", email: CONTACT.email, url: `https://wa.me/${CONTACT.whatsappNumber}`, areaServed: "IN" },
        address: { "@type": "PostalAddress", addressLocality: "Bangalore", addressRegion: "Karnataka", addressCountry: "IN" },
        areaServed: { "@type": "Country", name: "India" },
      },
      {
        "@type": "WebSite", "@id": WEBSITE_ID, name: SITE_NAME, alternateName: "Tara Forge 3D", url: canonicalUrl(),
        publisher: { "@id": BUSINESS_ID },
      },
    ],
  };
}

export function serviceCatalogSchema(services: readonly { id: string; label: string; description: string }[]) {
  return {
    "@context": "https://schema.org", "@type": "OfferCatalog",
    "@id": `${canonicalUrl("/services/")}#catalog`, name: "3D printing services",
    itemListElement: services.map(service => ({
      "@type": "Offer",
      itemOffered: {
        "@type": "Service", "@id": `${canonicalUrl("/services/")}#${service.id}`,
        name: service.label, description: service.description, url: canonicalUrl("/services/"),
        provider: { "@id": BUSINESS_ID }, areaServed: { "@type": "Country", name: "India" },
      },
    })),
  };
}

interface GallerySchemaPhoto { readonly src: string; readonly alt: string; readonly width: number; readonly height: number }
interface GallerySchemaEntry {
  readonly id: string; readonly title: string; readonly description: string; readonly category: string;
  readonly published: boolean; readonly image: GallerySchemaPhoto | null;
  readonly presentation?: { readonly photos: readonly GallerySchemaPhoto[] };
}

function photosFor(entry: GallerySchemaEntry): readonly GallerySchemaPhoto[] {
  return entry.presentation?.photos ?? (entry.image ? [entry.image] : []);
}

export function galleryImageUrls(entries: readonly GallerySchemaEntry[]): string[] {
  return [...new Set(entries.filter(entry => entry.published).flatMap(entry => photosFor(entry).map(photo => `${SITE_URL}${photo.src}`)))];
}

export function gallerySchema(entries: readonly GallerySchemaEntry[]) {
  return {
    "@context": "https://schema.org", "@type": "CollectionPage",
    "@id": `${canonicalUrl("/gallery/")}#collection`, url: canonicalUrl("/gallery/"),
    name: "The Gallery", isPartOf: { "@id": WEBSITE_ID },
    mainEntity: {
      "@type": "ItemList",
      itemListElement: entries.filter(entry => entry.published).map((entry, index) => ({
        "@type": "ListItem", position: index + 1,
        item: {
          "@type": "CreativeWork", "@id": `${canonicalUrl("/gallery/")}#${entry.id}`,
          name: entry.title, description: entry.description, genre: entry.category,
          image: photosFor(entry).map(photo => ({
            "@type": "ImageObject", contentUrl: `${SITE_URL}${photo.src}`, caption: photo.alt,
            width: photo.width, height: photo.height,
          })),
        },
      })),
    },
  };
}
