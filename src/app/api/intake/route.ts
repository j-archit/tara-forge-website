import { proxyToBackend } from "@/lib/backend-proxy";

export const dynamic = "force-dynamic";

export function POST(request: Request) {
  return proxyToBackend(request, "/api/intake");
}
