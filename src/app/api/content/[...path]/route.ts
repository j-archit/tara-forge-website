import { proxyToBackend } from "@/lib/backend-proxy";

type Context = { params: Promise<{ path: string[] }> };

export const dynamic = "force-dynamic";

export async function GET(request: Request, context: Context) {
  const { path } = await context.params;
  return proxyToBackend(request, `/api/content/${path.join("/")}`);
}
