import { NextResponse } from "next/server";

const SQUID_V2_MAINNET = "https://v2.api.squidrouter.com/v2";
const SQUID_V1_TESTNET = "https://testnet.api.squidrouter.com/v1";

export async function GET(request: Request) {
  const integratorId = process.env.SQUID_INTEGRATOR_ID;
  if (!integratorId) {
    return NextResponse.json(
      { error: "SQUID_INTEGRATOR_ID not configured" },
      { status: 503 }
    );
  }

  const { searchParams } = new URL(request.url);
  const testnet = searchParams.get("testnet") === "1" || searchParams.get("testnet") === "true";
  const base = testnet ? SQUID_V1_TESTNET : SQUID_V2_MAINNET;

  try {
    const res = await fetch(`${base}/tokens`, {
      headers: {
        "x-integrator-id": integratorId,
        "Content-Type": "application/json",
      },
      next: { revalidate: 300 },
    });

    if (!res.ok) {
      const text = await res.text();
      return NextResponse.json(
        { error: "Squid tokens API error", details: text },
        { status: res.status }
      );
    }

    const data = await res.json();
    const response = NextResponse.json(data);
    response.headers.set("x-squid-network", testnet ? "testnet" : "mainnet");
    response.headers.set("x-squid-integrator-sent", "true");
    return response;
  } catch (e) {
    const message = e instanceof Error ? e.message : "Unknown error";
    return NextResponse.json(
      { error: "Failed to fetch Squid tokens", details: message },
      { status: 502 }
    );
  }
}
