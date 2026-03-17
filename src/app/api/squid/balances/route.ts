import { NextResponse } from "next/server";

const SQUID_V2_MAINNET = "https://v2.api.squidrouter.com";
const SQUID_V1_TESTNET = "https://testnet.api.squidrouter.com";

export async function GET(request: Request) {
  const integratorId = process.env.SQUID_INTEGRATOR_ID;
  if (!integratorId) {
    return NextResponse.json(
      { error: "SQUID_INTEGRATOR_ID not configured" },
      { status: 503 }
    );
  }

  const { searchParams } = new URL(request.url);
  const address = searchParams.get("address");
  const chainIdParam = searchParams.get("chainId");
  const tokenAddressParam = searchParams.get("tokenAddress");
  const testnet = searchParams.get("testnet") === "1" || searchParams.get("testnet") === "true";

  if (!address || !/^0x[a-fA-F0-9]{40}$/.test(address)) {
    return NextResponse.json(
      { error: "Valid EVM address (address) is required" },
      { status: 400 }
    );
  }

  const chainId = chainIdParam ? parseInt(chainIdParam.trim(), 10) : undefined;
  const chainIds = chainId != null && !Number.isNaN(chainId) ? [chainId] : undefined;
  const tokenAddress = tokenAddressParam?.trim().toLowerCase();
  const hasTokenFilter = !!tokenAddress && /^0x[a-f0-9]{40}$/.test(tokenAddress);

  const baseUrl = testnet ? SQUID_V1_TESTNET : SQUID_V2_MAINNET;

  try {
    const { Squid } = await import("@0xsquid/sdk");
    const squid = new Squid({
      baseUrl,
      integratorId,
    });
    await squid.init();

    let evmBalances = await squid.getEvmBalances({
      userAddress: address as `0x${string}`,
      chains: chainIds,
    });

    if (hasTokenFilter) {
      evmBalances = evmBalances.filter(
        (b) => (b.address ?? "").toLowerCase() === tokenAddress
      );
    }

    evmBalances = [...evmBalances].sort((a, b) => {
      const aVal = BigInt(typeof a.balance === "string" ? a.balance : String(a.balance));
      const bVal = BigInt(typeof b.balance === "string" ? b.balance : String(b.balance));
      return aVal > bVal ? -1 : aVal < bVal ? 1 : 0;
    });

    const response = NextResponse.json({ evm: evmBalances });
    response.headers.set("x-squid-network", testnet ? "testnet" : "mainnet");
    return response;
  } catch (e) {
    const message = e instanceof Error ? e.message : String(e);
    return NextResponse.json(
      { error: "Failed to fetch Squid balances", details: message },
      { status: 502 }
    );
  }
}
