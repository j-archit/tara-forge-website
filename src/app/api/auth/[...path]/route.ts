import { proxyToBackend } from "@/lib/backend-proxy";

type Context = { params: Promise<{ path: string[] }> };

export const dynamic = "force-dynamic";

async function forward(request: Request, context: Context) {
  const { path } = await context.params;
  return proxyToBackend(request, `/api/auth/${path.join("/")}`);
}

export const GET = forward;
export const POST = forward;
