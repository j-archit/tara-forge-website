export type Submission = {
  id: string;
  name: string;
  email: string;
  projectType: string;
  material: string;
  description: string;
  fileName: string | null;
  createdAt: string;
  status: string;
  googleDriveStatus: string;
  googleSheetStatus: string;
  slicerStatus: string;
  printTimeSeconds: number | null;
  filamentGrams: number | null;
};

export type Client = {
  id: number;
  email: string;
  name: string;
  createdAt: string;
};

export type SlicerProfile = {
  material: string;
  name: string;
  version: number;
  config: Record<string, unknown>;
};

export type Job = {
  id: number;
  type: string;
  submissionId: string | null;
  status: string;
  attemptCount: number;
  maxAttempts: number;
  lastError: string | null;
  availableAt: string;
  createdAt: string;
};

export type TemplateMap = Record<string, { subject: string; body: string; version: number }>;

export type GalleryItem = {
  id: number;
  title: string;
  category: string;
  description: string;
  tags: string[];
  imageUrl: string | null;
  gradient: string;
  accent: string;
  published: boolean;
  sortOrder: number;
};

export type GalleryItemInput = Omit<GalleryItem, "id">;

export type StoreItem = {
  id: string;
  title: string;
  category: string;
  description: string;
  pricePaise: number;
  currency: string;
  imageUrl: string | null;
  gradient: string;
  accent: string;
  badge: string | null;
  published: boolean;
  available: boolean;
  sortOrder: number;
};

export class ApiError extends Error {
  constructor(public status: number, message: string) {
    super(message);
  }
}

function cookie(name: string) {
  if (typeof document === "undefined") return null;
  const prefix = `${encodeURIComponent(name)}=`;
  return document.cookie
    .split(";")
    .map((part) => part.trim())
    .find((part) => part.startsWith(prefix))
    ?.slice(prefix.length) ?? null;
}

export async function apiRequest<T>(path: string, init: RequestInit = {}): Promise<T> {
  const headers = new Headers(init.headers);
  if (init.body && !(init.body instanceof FormData)) headers.set("Content-Type", "application/json");
  if (init.method && !["GET", "HEAD"].includes(init.method.toUpperCase())) {
    const csrf = cookie("tf_admin_csrf");
    if (csrf) headers.set("X-CSRF-Token", decodeURIComponent(csrf));
  }
  const response = await fetch(path, { ...init, headers, cache: "no-store" });
  if (!response.ok) {
    const payload = await response.json().catch(() => ({}));
    throw new ApiError(response.status, payload.detail ?? "Request failed");
  }
  if (response.status === 204) return undefined as T;
  return response.json() as Promise<T>;
}

export const adminApi = {
  session: () => apiRequest<{ admin: { id: number; email: string } }>("/api/auth/session"),
  logout: () => apiRequest<void>("/api/auth/logout", { method: "POST" }),
  submissions: () => apiRequest<Submission[]>("/api/admin/submissions"),
  clients: () => apiRequest<Client[]>("/api/admin/clients"),
  profiles: () => apiRequest<SlicerProfile[]>("/api/admin/slicer/profiles"),
  saveProfile: (profile: SlicerProfile) =>
    apiRequest(`/api/admin/slicer/profiles/${profile.material}/${profile.name}`, {
      method: "PUT",
      body: JSON.stringify({ config: profile.config }),
    }),
  deleteProfile: (profile: SlicerProfile) =>
    apiRequest<void>(`/api/admin/slicer/profiles/${profile.material}/${profile.name}`, {
      method: "DELETE",
    }),
  templates: () => apiRequest<TemplateMap>("/api/admin/templates"),
  saveTemplate: (key: string, subject: string, body: string) =>
    apiRequest(`/api/admin/templates/${key}`, {
      method: "PUT",
      body: JSON.stringify({ subject, body }),
    }),
  jobs: () => apiRequest<Job[]>("/api/admin/jobs"),
  uploadMedia: (file: File) => {
    const body = new FormData();
    body.append("file", file);
    return apiRequest<{ url: string; fileName: string; byteSize: number }>("/api/admin/content/media", { method: "POST", body });
  },
  gallery: () => apiRequest<GalleryItem[]>("/api/admin/content/gallery"),
  createGallery: (item: GalleryItemInput) => apiRequest<GalleryItem>("/api/admin/content/gallery", { method: "POST", body: JSON.stringify(item) }),
  saveGallery: (item: GalleryItem) => apiRequest<GalleryItem>(`/api/admin/content/gallery/${item.id}`, { method: "PUT", body: JSON.stringify(item) }),
  deleteGallery: (id: number) => apiRequest<void>(`/api/admin/content/gallery/${id}`, { method: "DELETE" }),
  store: () => apiRequest<StoreItem[]>("/api/admin/content/store"),
  createStore: (item: StoreItem) => apiRequest<StoreItem>("/api/admin/content/store", { method: "POST", body: JSON.stringify(item) }),
  saveStore: (item: StoreItem) => apiRequest<StoreItem>(`/api/admin/content/store/${item.id}`, { method: "PUT", body: JSON.stringify(item) }),
  deleteStore: (id: string) => apiRequest<void>(`/api/admin/content/store/${id}`, { method: "DELETE" }),
  retryJob: (id: number) => apiRequest(`/api/admin/jobs/${id}/retry`, { method: "POST" }),
  slice: (id: string) => apiRequest(`/api/admin/submissions/${id}/slice`, { method: "POST" }),
  email: (id: string) => apiRequest<{ mailto: string }>(`/api/admin/email/${id}`),
};
