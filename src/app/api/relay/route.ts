import { NextResponse } from "next/server";

/**
 * Secure Project Intake Relay
 * This server-side route acts as a proxy between the website's intake form
 * and the private Raspberry Pi. It injects the authentication token 
 * server-side to prevent exposing it in the client bundle.
 */
export async function POST(request: Request) {
  try {
    const payload = await request.json();
    const PI_RELAY_URL = process.env.PI_RELAY_URL;
    const PI_AUTH_TOKEN = process.env.PI_AUTH_TOKEN;

    // 1. Validate environment configuration
    if (!PI_RELAY_URL || !PI_AUTH_TOKEN) {
      console.error("[Relay] Error: Missing PI_RELAY_URL or PI_AUTH_TOKEN in environment variables.");
      return NextResponse.json(
        { error: "Server Configuration Error: Relay configuration is incomplete." },
        { status: 500 }
      );
    }

    // 2. Validate payload presence
    if (!payload || Object.keys(payload).length === 0) {
      return NextResponse.json(
        { error: "Bad Request: No submission data received." },
        { status: 400 }
      );
    }

    // 3. Inject authentication token and forward to the Pi
    // The Pi expects data at the /ingest endpoint
    const endpoint = `${PI_RELAY_URL.replace(/\/$/, '')}/ingest`;
    
    console.log(`[Relay] Forwarding transmission to Pi: ${endpoint}`);

    const piResponse = await fetch(endpoint, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        ...payload,
        token: PI_AUTH_TOKEN, // Injected securely on server-side
      }),
    });

    // 4. Handle Pi's response
    if (!piResponse.ok) {
      const errorText = await piResponse.text();
      console.error(`[Relay] Pi rejected transmission (${piResponse.status}):`, errorText);
      return NextResponse.json(
        { error: "Transmission rejected by target forge station." },
        { status: piResponse.status }
      );
    }

    const data = await piResponse.json();
    console.log(`[Relay] Transmission successful: ${data.id || 'No ID returned'}`);

    return NextResponse.json(data);
  } catch (error: any) {
    console.error("[Relay] Fatal error during relay operation:", error);
    return NextResponse.json(
      { error: "Internal Relay Fault: Transmission interrupted." },
      { status: 500 }
    );
  }
}
