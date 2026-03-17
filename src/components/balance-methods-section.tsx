"use client";

import { useState, useEffect, useMemo, useCallback } from "react";
import { createPublicClient, http, formatUnits } from "viem";
import { useWatchAsset } from "wagmi";
import type { ChainOption, TokenOption } from "@/lib/squid-types";
import { squashChain, squashToken } from "@/lib/squid-types";
import type { SquidChain, SquidToken } from "@/lib/squid-types";
import { erc20BalanceAbi } from "@/lib/erc20-abi";
import { getRpcForChainId } from "@/lib/evm-rpc";

/** Multicall3 is deployed at this address on 100+ EVM chains (see multicall3.com/deployments) */
const MULTICALL3_ADDRESS = "0xcA11bde05977b3631167028862bE2a173976CA11" as const;

type BalanceMode = "per-token" | "per-chain-all" | "all-chains-all";
type Network = "mainnet" | "testnet";

/** Format ms as seconds (e.g. "1.23 s") or minutes (e.g. "1.05 min") when ≥ 60s */
function formatRequestTime(ms: number): string {
  if (ms >= 60_000) {
    return `${(ms / 60_000).toFixed(2)} min`;
  }
  return `${(ms / 1_000).toFixed(2)} s`;
}

interface MethodCardProps {
  title: string;
  loading?: boolean;
  error?: string | null;
  children: React.ReactNode;
  timeMs?: number | null;
}

function MethodCard({ title, loading, error, children, timeMs }: MethodCardProps) {
  return (
    <div className="rounded-xl border border-zinc-700/50 bg-zinc-900/60 p-4">
      <div className="mb-2 flex items-center justify-between gap-2">
        <h4 className="font-semibold text-white">{title}</h4>
        {timeMs != null && (
          <span className="text-xs text-zinc-500">{formatRequestTime(timeMs)}</span>
        )}
      </div>
      {loading && (
        <div className="h-8 w-24 animate-pulse rounded bg-zinc-700" />
      )}
      {error && (
        <p className="text-sm text-red-400">{error}</p>
      )}
      {!loading && !error && (children ?? <span className="text-sm text-zinc-500">—</span>)}
    </div>
  );
}

export function BalanceMethodsSection({ walletAddress }: { walletAddress: string }) {
  const [network, setNetwork] = useState<Network>("mainnet");
  const [squidChains, setSquidChains] = useState<ChainOption[]>([]);
  const [squidTokens, setSquidTokens] = useState<TokenOption[]>([]);
  const [loadingData, setLoadingData] = useState(true);
  const [dataError, setDataError] = useState<string | null>(null);
  const [selectedChainId, setSelectedChainId] = useState<string | null>(null);
  const [selectedToken, setSelectedToken] = useState<TokenOption | null>(null);
  const [mode, setMode] = useState<BalanceMode>("per-token");

  // Viem single balance
  const [viemLoading, setViemLoading] = useState(false);
  const [viemError, setViemError] = useState<string | null>(null);
  const [viemResult, setViemResult] = useState<string | null>(null);
  const [viemTimeMs, setViemTimeMs] = useState<number | null>(null);

  // Viem multicall
  const [multicallLoading, setMulticallLoading] = useState(false);
  const [multicallError, setMulticallError] = useState<string | null>(null);
  const [multicallResult, setMulticallResult] = useState<Array<{ symbol: string; balance: string; chainId: string }> | null>(null);
  const [multicallTimeMs, setMulticallTimeMs] = useState<number | null>(null);

  // Squid API
  const [squidLoading, setSquidLoading] = useState(false);
  const [squidError, setSquidError] = useState<string | null>(null);
  const [squidResult, setSquidResult] = useState<unknown>(null);
  const [squidTimeMs, setSquidTimeMs] = useState<number | null>(null);

  useEffect(() => {
    let cancelled = false;
    setLoadingData(true);
    const testnet = network === "testnet";
    const qs = testnet ? "?testnet=true" : "";

    async function fetchSquid() {
      try {
        const [chainsRes, tokensRes] = await Promise.all([
          fetch(`/api/squid/chains${qs}`),
          fetch(`/api/squid/tokens${qs}`),
        ]);
        if (cancelled) return;
        if (!chainsRes.ok || !tokensRes.ok) {
          const failedRes = chainsRes.ok ? tokensRes : chainsRes;
          const text = await failedRes.text();
          setDataError(`API error: ${text || failedRes.status}`);
          setSquidChains([]);
          setSquidTokens([]);
          return;
        }
        const chainsData = await chainsRes.json();
        const tokensData = await tokensRes.json();
        const rawChains: SquidChain[] = Array.isArray(chainsData) ? chainsData : chainsData?.chains ?? [];
        const rawTokens: SquidToken[] = Array.isArray(tokensData) ? tokensData : tokensData?.tokens ?? [];
        const chains = rawChains.map((c) => squashChain(c as SquidChain));
        const tokens = rawTokens.map((t) => squashToken(t as SquidToken));
        if (!cancelled) {
          setSquidChains(chains);
          setSquidTokens(tokens);
          setDataError(null);
          if (chains.length > 0 && !selectedChainId) setSelectedChainId(chains[0].id);
        }
      } catch {
        if (!cancelled) {
          setDataError("Failed to load chains/tokens");
          setSquidChains([]);
          setSquidTokens([]);
        }
      } finally {
        if (!cancelled) setLoadingData(false);
      }
    }
    fetchSquid();
    return () => { cancelled = true; };
  }, [network]);

  const tokensForChain = useMemo(
    () =>
      selectedChainId
        ? squidTokens.filter((t) => String(t.chainId) === String(selectedChainId))
        : [],
    [squidTokens, selectedChainId]
  );

  const evmChains = useMemo(
    () => squidChains.filter((c) => c.type === "evm"),
    [squidChains]
  );

  const selectedChain = useMemo(
    () => squidChains.find((c) => c.id === selectedChainId) ?? null,
    [squidChains, selectedChainId]
  );

  const runViemSingle = useCallback(async () => {
    if (!selectedChainId || !selectedToken || !walletAddress) return;
    const rpc = getRpcForChainId(selectedChainId);
    if (!rpc) {
      setViemError("No RPC for chain " + selectedChainId);
      return;
    }
    setViemLoading(true);
    setViemError(null);
    setViemResult(null);
    const start = performance.now();
    try {
      const chainIdNum = parseInt(selectedChainId, 10);
      const client = createPublicClient({
        chain: { id: chainIdNum, name: "", nativeCurrency: { decimals: 18, name: "", symbol: "" }, rpcUrls: { default: { http: [rpc] } } },
        transport: http(rpc),
      });
      const isNative =
        !selectedToken.address ||
        selectedToken.address === "0x0000000000000000000000000000000000000000" ||
        selectedToken.address === "native";
      if (isNative) {
        const balance = await client.getBalance({ address: walletAddress as `0x${string}` });
        const formatted = formatUnits(balance, selectedToken.decimals);
        setViemResult(`${formatted} ${selectedToken.symbol}`);
      } else {
        const balance = await client.readContract({
          address: selectedToken.address as `0x${string}`,
          abi: erc20BalanceAbi,
          functionName: "balanceOf",
          args: [walletAddress as `0x${string}`],
        });
        const formatted = formatUnits(balance, selectedToken.decimals);
        setViemResult(`${formatted} ${selectedToken.symbol}`);
      }
    } catch (e) {
      setViemError(e instanceof Error ? e.message : String(e));
    } finally {
      setViemTimeMs(Math.round(performance.now() - start));
      setViemLoading(false);
    }
  }, [selectedChainId, selectedToken, walletAddress]);

  const runViemMulticall = useCallback(async () => {
    const chainIdsToUse =
      mode === "all-chains-all"
        ? evmChains.map((c) => c.id)
        : selectedChainId
          ? [selectedChainId]
          : [];
    if (chainIdsToUse.length === 0 || !walletAddress) return;
    setMulticallLoading(true);
    setMulticallError(null);
    setMulticallResult(null);
    const start = performance.now();
    type ResultWithRaw = { symbol: string; balance: string; chainId: string; rawBalance: bigint };
    const results: ResultWithRaw[] = [];
    const addr = walletAddress as `0x${string}`;
    try {
      for (const cid of chainIdsToUse) {
        const rpc = getRpcForChainId(cid);
        if (!rpc) continue;
        const tokensOnChain = squidTokens.filter((t) => String(t.chainId) === String(cid));
        const evmTokens = tokensOnChain.filter(
          (t) =>
            t.address &&
            t.address !== "0x0000000000000000000000000000000000000000" &&
            t.address !== "native"
        );
        if (evmTokens.length === 0) continue;
        const chainIdNum = parseInt(cid, 10);
        const client = createPublicClient({
          chain: {
            id: chainIdNum,
            name: `Chain ${cid}`,
            nativeCurrency: { decimals: 18, name: "", symbol: "" },
            rpcUrls: { default: { http: [rpc] } },
            contracts: {
              multicall3: { address: MULTICALL3_ADDRESS },
            },
          },
          transport: http(rpc),
        });
        const multicallResult = await client.multicall({
          contracts: evmTokens.map((t) => ({
            address: t.address as `0x${string}`,
            abi: erc20BalanceAbi,
            functionName: "balanceOf",
            args: [addr],
          })),
          allowFailure: true,
        });
        multicallResult.forEach((r, i) => {
          const token = evmTokens[i];
          if (!token) return;
          const res = r as { status: string; result?: unknown };
          if (res.status === "success" && res.result != null) {
            const raw = res.result;
            const value = typeof raw === "bigint" ? raw : BigInt(String(raw));
            results.push({
              symbol: token.symbol,
              balance: formatUnits(value, token.decimals),
              rawBalance: value,
              chainId: cid,
            });
          } else {
            results.push({ symbol: token.symbol, balance: "0", rawBalance: BigInt(0), chainId: cid });
          }
        });
      }
      results.sort((a, b) => (a.rawBalance > b.rawBalance ? -1 : a.rawBalance < b.rawBalance ? 1 : 0));
      setMulticallResult(results.map(({ rawBalance: _r, ...r }) => r));
    } catch (e) {
      setMulticallError(e instanceof Error ? e.message : String(e));
    } finally {
      setMulticallTimeMs(Math.round(performance.now() - start));
      setMulticallLoading(false);
    }
  }, [mode, evmChains, selectedChainId, squidTokens, walletAddress]);

  const runSquidBalances = useCallback(async () => {
    setSquidLoading(true);
    setSquidError(null);
    setSquidResult(null);
    const start = performance.now();
    try {
      const qs = new URLSearchParams();
      qs.set("address", walletAddress);
      if (mode !== "all-chains-all" && selectedChainId) qs.set("chainId", selectedChainId);
      if (mode === "per-token" && selectedToken?.address && selectedToken.address !== "0x0000000000000000000000000000000000000000" && selectedToken.address !== "native") {
        qs.set("tokenAddress", selectedToken.address);
      }
      if (network === "testnet") qs.set("testnet", "true");
      const res = await fetch(`/api/squid/balances?${qs}`);
      const data = await res.json();
      if (!res.ok) throw new Error(data.details ?? data.error ?? res.statusText);
      setSquidResult(data);
    } catch (e) {
      setSquidError(e instanceof Error ? e.message : String(e));
    } finally {
      setSquidTimeMs(Math.round(performance.now() - start));
      setSquidLoading(false);
    }
  }, [mode, evmChains, selectedChainId, network, walletAddress]);

  const { watchAsset, isPending: watchAssetPending } = useWatchAsset();

  const handleAddToken = useCallback(() => {
    if (!selectedToken) return;
    watchAsset({
      type: "ERC20",
      options: {
        address: selectedToken.address as `0x${string}`,
        symbol: selectedToken.symbol,
        decimals: selectedToken.decimals,
        ...(selectedToken.logoURI && { image: selectedToken.logoURI }),
      },
    });
  }, [selectedToken, watchAsset]);

  if (loadingData) {
    return (
      <div className="rounded-2xl border border-zinc-700/50 bg-zinc-900/80 p-6">
        <div className="h-8 w-48 animate-pulse rounded bg-zinc-700" />
        <div className="mt-4 h-32 animate-pulse rounded-xl bg-zinc-800" />
      </div>
    );
  }

  return (
    <div className="rounded-2xl border border-zinc-700/50 bg-zinc-900/80 p-6 shadow-xl">
      <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
        <h3 className="text-lg font-semibold text-white">Balance methods</h3>
        <div className="flex rounded-lg border border-zinc-700 bg-zinc-800/80 p-0.5">
          <button
            type="button"
            onClick={() => setNetwork("mainnet")}
            className={`rounded-md px-3 py-1.5 text-sm font-medium transition ${
              network === "mainnet" ? "bg-indigo-600 text-white" : "text-zinc-400 hover:text-white"
            }`}
          >
            Mainnet
          </button>
          <button
            type="button"
            onClick={() => setNetwork("testnet")}
            className={`rounded-md px-3 py-1.5 text-sm font-medium transition ${
              network === "testnet" ? "bg-indigo-600 text-white" : "text-zinc-400 hover:text-white"
            }`}
          >
            Testnet
          </button>
        </div>
      </div>
      {dataError && (
        <p className="mb-4 text-sm text-amber-500">{dataError}</p>
      )}

      <div className="mb-4 flex flex-wrap gap-2">
        {(["per-token", "per-chain-all", "all-chains-all"] as const).map((m) => (
          <button
            key={m}
            type="button"
            onClick={() => setMode(m)}
            className={`rounded-lg px-3 py-2 text-sm font-medium transition ${
              mode === m ? "bg-indigo-600 text-white" : "bg-zinc-800 text-zinc-400 hover:text-white"
            }`}
          >
            {m === "per-token" && "Per chain + token"}
            {m === "per-chain-all" && "Per chain, all tokens"}
            {m === "all-chains-all" && "All chains, all tokens"}
          </button>
        ))}
      </div>

      {(mode === "per-token" || mode === "per-chain-all") && (
        <div className="mb-4 flex flex-wrap gap-4">
          <div>
            <label className="mb-1 block text-xs text-zinc-500">Chain</label>
            <select
              value={selectedChainId ?? ""}
              onChange={(e) => {
                setSelectedChainId(e.target.value || null);
                setSelectedToken(null);
              }}
              className="rounded-lg border border-zinc-600 bg-zinc-800 px-3 py-2 text-sm text-white"
            >
              {squidChains.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>
          {mode === "per-token" && (
            <div>
              <label className="mb-1 block text-xs text-zinc-500">Token</label>
              <select
                value={selectedToken ? `${selectedToken.chainId}-${selectedToken.address}` : ""}
                onChange={(e) => {
                  const v = e.target.value;
                  if (!v) setSelectedToken(null);
                  else {
                    const t = tokensForChain.find((t) => `${t.chainId}-${t.address}` === v);
                    setSelectedToken(t ?? null);
                  }
                }}
                className="rounded-lg border border-zinc-600 bg-zinc-800 px-3 py-2 text-sm text-white min-w-[140px]"
              >
                <option value="">Select token</option>
                {tokensForChain.map((t) => (
                  <option key={`${t.chainId}-${t.address}`} value={`${t.chainId}-${t.address}`}>
                    {t.symbol}
                  </option>
                ))}
              </select>
            </div>
          )}
        </div>
      )}

      <div className="mb-4 flex flex-wrap gap-2">
        {(mode === "per-token" && selectedToken) && (
          <button
            type="button"
            onClick={runViemSingle}
            disabled={viemLoading}
            className="rounded-lg bg-zinc-700 px-3 py-2 text-sm font-medium text-white hover:bg-zinc-600 disabled:opacity-50"
          >
            Run viem readContract
          </button>
        )}
        <button
          type="button"
          onClick={runViemMulticall}
          disabled={multicallLoading}
          className="rounded-lg bg-zinc-700 px-3 py-2 text-sm font-medium text-white hover:bg-zinc-600 disabled:opacity-50"
        >
          Run viem multicall
        </button>
        <button
          type="button"
          onClick={runSquidBalances}
          disabled={squidLoading}
          className="rounded-lg bg-zinc-700 px-3 py-2 text-sm font-medium text-white hover:bg-zinc-600 disabled:opacity-50"
        >
          Run Squid balances
        </button>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        {mode === "per-token" && selectedToken && (
          <MethodCard
            title="Viem readContract"
            loading={viemLoading}
            error={viemError}
            timeMs={viemTimeMs}
          >
            {viemResult && <p className="text-sm text-zinc-300">{viemResult}</p>}
          </MethodCard>
        )}

        <MethodCard
          title="Viem multicall"
          loading={multicallLoading}
          error={multicallError}
          timeMs={multicallTimeMs}
        >
          {multicallResult && multicallResult.length > 0 && (
            <ul className="max-h-32 space-y-1 overflow-y-auto text-sm text-zinc-300">
              {multicallResult.map((r, i) => (
                <li key={i}>
                  {r.symbol} (chain {r.chainId}): {r.balance}
                </li>
              ))}
            </ul>
          )}
          {multicallResult && multicallResult.length === 0 && (
            <p className="text-sm text-zinc-500">No balances</p>
          )}
        </MethodCard>

        <MethodCard
          title="Squid getEvmBalances"
          loading={squidLoading}
          error={squidError}
          timeMs={squidTimeMs}
        >
          {squidResult != null ? (
            <pre className="max-h-40 overflow-auto text-xs text-zinc-400">
              {JSON.stringify(squidResult, null, 2)}
            </pre>
          ) : null}
        </MethodCard>

        {mode === "per-token" && selectedToken && (
          <div className="rounded-xl border border-zinc-700/50 bg-zinc-900/60 p-4">
            <h4 className="mb-2 font-semibold text-white">useWatchAsset</h4>
            <button
              type="button"
              onClick={handleAddToken}
              disabled={watchAssetPending}
              className="rounded-lg bg-indigo-600 px-3 py-2 text-sm font-medium text-white hover:bg-indigo-500 disabled:opacity-50"
            >
              {watchAssetPending ? "Adding…" : "Add token to wallet"}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
