import { NextResponse } from "next/server";
import { createPublicClient, http, formatUnits } from "viem";
import { erc20BalanceAbi } from "@/lib/erc20-abi";
import { getRpcForChainId } from "@/lib/evm-rpc";

const SQUID_V2_MAINNET = "https://v2.api.squidrouter.com/v2";
const SQUID_V1_TESTNET = "https://testnet.api.squidrouter.com/v1";
const MULTICALL3_ADDRESS = "0xcA11bde05977b3631167028862bE2a173976CA11" as const;

interface SquidToken {
  chainId: string;
  address: string;
  symbol: string;
  decimals: number;
}

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

  const filterChainId = chainIdParam ? parseInt(chainIdParam.trim(), 10) : undefined;
  const filterTokenAddress = tokenAddressParam?.trim().toLowerCase();
  const hasChainFilter = filterChainId != null && !Number.isNaN(filterChainId);
  const hasTokenFilter = !!filterTokenAddress && /^0x[a-f0-9]{40}$/.test(filterTokenAddress);

  const base = testnet ? SQUID_V1_TESTNET : SQUID_V2_MAINNET;

  try {
    const [chainsRes, tokensRes] = await Promise.all([
      fetch(`${base}/chains`, {
        headers: {
          "x-integrator-id": integratorId,
          "Content-Type": "application/json",
        },
        next: { revalidate: 300 },
      }),
      fetch(`${base}/tokens`, {
        headers: {
          "x-integrator-id": integratorId,
          "Content-Type": "application/json",
        },
        next: { revalidate: 300 },
      }),
    ]);

    if (!chainsRes.ok || !tokensRes.ok) {
      const failedRes = chainsRes.ok ? tokensRes : chainsRes;
      const text = await failedRes.text();
      return NextResponse.json(
        { error: "Squid API error", details: text },
        { status: failedRes.status }
      );
    }

    const chainsData = await chainsRes.json();
    const tokensData = await tokensRes.json();

    const rawChains: Array<{ chainId?: string; type?: string }> = Array.isArray(chainsData)
      ? chainsData
      : chainsData?.chains ?? [];
    let rawTokens: SquidToken[] = Array.isArray(tokensData) ? tokensData : tokensData?.tokens ?? [];

    const evmChainIds = hasChainFilter
      ? [String(filterChainId)]
      : rawChains
          .filter((c) => (c.type ?? "").toLowerCase() === "evm" && c.chainId)
          .map((c) => String(c.chainId));

    if (hasTokenFilter) {
      rawTokens = rawTokens.filter((t) => (t.address ?? "").toLowerCase() === filterTokenAddress);
    }

    const addr = address as `0x${string}`;
    const results: Array<{ chainId: string; symbol: string; address: string; decimals: number; balance: string; rawBalance: bigint }> = [];

    for (const cid of evmChainIds) {
      const rpc = getRpcForChainId(cid);
      if (!rpc) continue;

      const tokensOnChain = rawTokens.filter(
        (t) =>
          String(t.chainId) === String(cid) &&
          t.address &&
          t.address !== "0x0000000000000000000000000000000000000000" &&
          t.address !== "native"
      );
      if (tokensOnChain.length === 0) continue;

      const chainIdNum = parseInt(cid, 10);
      const client = createPublicClient({
        chain: {
          id: chainIdNum,
          name: `Chain ${cid}`,
          nativeCurrency: { decimals: 18, name: "", symbol: "" },
          rpcUrls: { default: { http: [rpc] } },
          contracts: { multicall3: { address: MULTICALL3_ADDRESS } },
        },
        transport: http(rpc),
      });

      const multicallResult = await client.multicall({
        contracts: tokensOnChain.map((t) => ({
          address: t.address as `0x${string}`,
          abi: erc20BalanceAbi,
          functionName: "balanceOf",
          args: [addr],
        })),
        allowFailure: true,
      });

      multicallResult.forEach((r, i) => {
        const token = tokensOnChain[i];
        if (!token) return;
        if (r.status === "success" && r.result != null) {
          const value = typeof r.result === "bigint" ? r.result : BigInt(r.result);
          results.push({
            chainId: cid,
            symbol: token.symbol,
            address: token.address,
            decimals: token.decimals,
            balance: formatUnits(value, token.decimals),
            rawBalance: value,
          });
        } else {
          results.push({
            chainId: cid,
            symbol: token.symbol,
            address: token.address,
            decimals: token.decimals,
            balance: "0",
            rawBalance: BigInt(0),
          });
        }
      });
    }

    results.sort((a, b) => (a.rawBalance > b.rawBalance ? -1 : a.rawBalance < b.rawBalance ? 1 : 0));

    const balances = results.map(({ rawBalance: _, ...r }) => r);

    const response = NextResponse.json({ balances });
    response.headers.set("x-balance-sort", "highest-first");
    return response;
  } catch (e) {
    const message = e instanceof Error ? e.message : String(e);
    return NextResponse.json(
      { error: "Failed to fetch multicall balances", details: message },
      { status: 502 }
    );
  }
}
