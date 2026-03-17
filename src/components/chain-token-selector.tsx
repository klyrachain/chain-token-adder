"use client";

import { useState, useEffect, useMemo, useRef } from "react";
import {
  type SquidChain,
  type SquidToken,
  type ChainOption,
  type TokenOption,
  squashChain,
  squashToken,
} from "@/lib/squid-types";

type Network = "mainnet" | "testnet";

export function ChainTokenSelector() {
  const [network, setNetwork] = useState<Network>("mainnet");
  const [squidChains, setSquidChains] = useState<ChainOption[]>([]);
  const [squidTokens, setSquidTokens] = useState<TokenOption[]>([]);
  const [loading, setLoading] = useState(true);
  const [squidError, setSquidError] = useState<string | null>(null);
  const [selectedChainId, setSelectedChainId] = useState<string | null>(null);
  const [chainDropdownOpen, setChainDropdownOpen] = useState(false);
  const [chainSearch, setChainSearch] = useState("");
  const [tokenSearch, setTokenSearch] = useState("");
  const chainDropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
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
          if (!cancelled) {
            const status = chainsRes.ok ? tokensRes.status : chainsRes.status;
            const failedRes = chainsRes.ok ? tokensRes : chainsRes;
            let details: string;
            try {
              const body = await failedRes.text();
              let parsed: { error?: string; details?: string };
              try {
                parsed = JSON.parse(body) as { error?: string; details?: string };
              } catch {
                parsed = {};
              }
              details = (parsed.details ?? parsed.error ?? body) || `HTTP ${status}`;
            } catch {
              details = `HTTP ${status}`;
            }
            const networkLabel = network === "testnet" ? "Testnet" : "Mainnet";
            setSquidError(
              status === 503
                ? "Squid API temporarily unavailable. Check SQUID_INTEGRATOR_ID and try again."
                : `${networkLabel} Squid API error: ${details}`
            );
            setSquidChains([]);
            setSquidTokens([]);
          }
          return;
        }

        const chainsData = await chainsRes.json();
        const tokensData = await tokensRes.json();

        const rawChains: SquidChain[] = Array.isArray(chainsData)
          ? chainsData
          : Array.isArray(chainsData?.chains)
            ? chainsData.chains
            : [];

        const rawTokens: SquidToken[] = Array.isArray(tokensData)
          ? tokensData
          : Array.isArray(tokensData?.tokens)
            ? tokensData.tokens
            : [];

        const chains = rawChains.map((c) => squashChain(c as SquidChain));
        const tokens = rawTokens.map((t) => squashToken(t as SquidToken));

        if (!cancelled) {
          setSquidChains(chains);
          setSquidTokens(tokens);
          setSquidError(chains.length > 0 ? null : "No chains returned from Squid API.");
          setSelectedChainId(chains.length > 0 ? chains[0].id : null);
        }
      } catch {
        if (!cancelled) {
          setSquidError("Squid API unavailable. Set SQUID_INTEGRATOR_ID and try again.");
          setSquidChains([]);
          setSquidTokens([]);
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    fetchSquid();
    return () => {
      cancelled = true;
    };
  }, [network]);

  const selectedChain = useMemo(
    () => squidChains.find((c) => c.id === selectedChainId) ?? null,
    [squidChains, selectedChainId]
  );

  const sortedChains = useMemo(
    () => [...squidChains].sort((a, b) => a.name.localeCompare(b.name, undefined, { sensitivity: "base" })),
    [squidChains]
  );

  const filteredChains = useMemo(() => {
    const q = chainSearch.trim().toLowerCase();
    if (!q) return sortedChains;
    return sortedChains.filter(
      (c) =>
        c.name.toLowerCase().includes(q) ||
        c.nativeSymbol.toLowerCase().includes(q) ||
        String(c.id).toLowerCase().includes(q)
    );
  }, [sortedChains, chainSearch]);

  const tokensForChain = useMemo(
    () =>
      selectedChainId
        ? squidTokens.filter((t) => String(t.chainId) === String(selectedChainId))
        : [],
    [squidTokens, selectedChainId]
  );

  const sortedTokens = useMemo(
    () =>
      [...tokensForChain].sort((a, b) =>
        a.symbol.localeCompare(b.symbol, undefined, { sensitivity: "base" })
      ),
    [tokensForChain]
  );

  const filteredTokens = useMemo(() => {
    const q = tokenSearch.trim().toLowerCase();
    if (!q) return sortedTokens;
    return sortedTokens.filter(
      (t) =>
        t.symbol.toLowerCase().includes(q) ||
        t.name.toLowerCase().includes(q) ||
        (t.address && String(t.address).toLowerCase().includes(q))
    );
  }, [sortedTokens, tokenSearch]);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (chainDropdownRef.current && !chainDropdownRef.current.contains(e.target as Node)) {
        setChainDropdownOpen(false);
        setChainSearch("");
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  if (loading) {
    return (
      <div className="rounded-2xl border border-zinc-700/50 bg-zinc-900/80 p-6 shadow-xl">
        <div className="mb-4 h-6 w-48 animate-pulse rounded bg-zinc-700" />
        <div className="h-10 animate-pulse rounded-xl bg-zinc-800" />
        <div className="mt-4 h-64 animate-pulse rounded-xl bg-zinc-800/50" />
      </div>
    );
  }

  if (squidError && squidChains.length === 0) {
    return (
      <div className="rounded-2xl border border-zinc-700/50 bg-zinc-900/80 p-6 shadow-xl">
        <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
          <h3 className="text-lg font-semibold text-white">Chains & tokens</h3>
          <div className="flex rounded-lg border border-zinc-700 bg-zinc-800/80 p-0.5">
            <button
              type="button"
              onClick={() => setNetwork("mainnet")}
              className={`rounded-md px-3 py-1.5 text-sm font-medium transition ${
                network === "mainnet"
                  ? "bg-indigo-600 text-white"
                  : "text-zinc-400 hover:text-white"
              }`}
            >
              Mainnet
            </button>
            <button
              type="button"
              onClick={() => setNetwork("testnet")}
              className={`rounded-md px-3 py-1.5 text-sm font-medium transition ${
                network === "testnet"
                  ? "bg-indigo-600 text-white"
                  : "text-zinc-400 hover:text-white"
              }`}
            >
              Testnet
            </button>
          </div>
        </div>
        <p className="mb-4 text-sm text-zinc-400">
          No wallet required — browse chains and their tokens from the Squid Router API.
        </p>
        <div className="rounded-xl border border-amber-500/30 bg-amber-500/10 px-4 py-3 text-sm text-amber-200">
          {squidError}
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-2xl border border-zinc-700/50 bg-zinc-900/80 p-6 shadow-xl">
      <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
        <h3 className="text-lg font-semibold text-white">Chains & tokens</h3>
        <div className="flex items-center gap-2">
          <div className="flex rounded-lg border border-zinc-700 bg-zinc-800/80 p-0.5">
            <button
              type="button"
              onClick={() => setNetwork("mainnet")}
              className={`rounded-md px-3 py-1.5 text-sm font-medium transition ${
                network === "mainnet"
                  ? "bg-indigo-600 text-white"
                  : "text-zinc-400 hover:text-white"
              }`}
            >
              Mainnet
            </button>
            <button
              type="button"
              onClick={() => setNetwork("testnet")}
              className={`rounded-md px-3 py-1.5 text-sm font-medium transition ${
                network === "testnet"
                  ? "bg-indigo-600 text-white"
                  : "text-zinc-400 hover:text-white"
              }`}
            >
              Testnet
            </button>
          </div>
          <span className="rounded-full bg-emerald-500/20 px-2.5 py-0.5 text-xs font-medium text-emerald-400">
            Squid Router
          </span>
        </div>
      </div>
      <p className="mb-4 text-sm text-zinc-400">
        No wallet required — browse chains and their tokens from the API.
        {network === "testnet" && (
          <span className="mt-1 block text-amber-400/90">Showing testnet chains and tokens.</span>
        )}
        {squidError && (
          <span className="mt-1 block text-amber-500/90">{squidError}</span>
        )}
      </p>

      <div className="space-y-4">
        <div>
          <label className="mb-2 block text-xs font-medium uppercase tracking-wider text-zinc-500">
            Chain
          </label>
          <div className="relative" ref={chainDropdownRef}>
            <button
              type="button"
              onClick={() => setChainDropdownOpen((o) => !o)}
              className="flex w-full items-center gap-3 rounded-xl border border-zinc-700 bg-zinc-800/80 px-4 py-3 text-left text-white outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20"
            >
              {selectedChain ? (
                <>
                  {selectedChain.chainIconURI ? (
                    <img
                      src={selectedChain.chainIconURI}
                      alt=""
                      className="h-8 w-8 shrink-0 rounded-full object-cover"
                    />
                  ) : (
                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-zinc-700 text-xs font-medium text-zinc-300">
                      {selectedChain.name.slice(0, 2)}
                    </div>
                  )}
                  <span className="flex-1 truncate">{selectedChain.name}</span>
                  <span className="shrink-0 text-zinc-500">({selectedChain.nativeSymbol})</span>
                </>
              ) : (
                <span className="text-zinc-500">Select chain</span>
              )}
            </button>
            {chainDropdownOpen && squidChains.length > 0 && (
              <div className="absolute top-full left-0 right-0 z-10 mt-1 overflow-hidden rounded-xl border border-zinc-700 bg-zinc-800 shadow-xl">
                <div className="border-b border-zinc-700 p-2" onClick={(e) => e.stopPropagation()}>
                  <input
                    type="search"
                    placeholder="Search chains..."
                    value={chainSearch}
                    onChange={(e) => setChainSearch(e.target.value)}
                    className="w-full rounded-lg border border-zinc-600 bg-zinc-800/80 px-3 py-2 text-sm text-white placeholder-zinc-500 outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500/30"
                  />
                </div>
                <ul className="max-h-72 overflow-y-auto py-1">
                {filteredChains.map((chain) => (
                  <li key={chain.id}>
                    <button
                      type="button"
                      onClick={() => {
                        setSelectedChainId(chain.id);
                        setChainDropdownOpen(false);
                        setChainSearch("");
                      }}
                      className="flex w-full items-center gap-3 px-4 py-2.5 text-left text-white transition hover:bg-zinc-700/80"
                    >
                      {chain.chainIconURI ? (
                        <img
                          src={chain.chainIconURI}
                          alt=""
                          className="h-8 w-8 shrink-0 rounded-full object-cover"
                        />
                      ) : (
                        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-zinc-700 text-xs font-medium text-zinc-300">
                          {chain.name.slice(0, 2)}
                        </div>
                      )}
                      <span className="truncate">{chain.name}</span>
                      <span className="shrink-0 text-zinc-500">({chain.nativeSymbol})</span>
                    </button>
                  </li>
                ))}
                </ul>
                {filteredChains.length === 0 && (
                  <div className="px-4 py-3 text-center text-sm text-zinc-500">
                    No chains match &quot;{chainSearch}&quot;
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        <div>
          <label className="mb-2 block text-xs font-medium uppercase tracking-wider text-zinc-500">
            Tokens on this chain
          </label>
          {tokensForChain.length > 0 && (
            <div className="mb-2">
              <input
                type="search"
                placeholder="Search tokens..."
                value={tokenSearch}
                onChange={(e) => setTokenSearch(e.target.value)}
                className="w-full rounded-lg border border-zinc-600 bg-zinc-800/80 px-3 py-2 text-sm text-white placeholder-zinc-500 outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500/30"
              />
            </div>
          )}
          <ul className="max-h-64 space-y-1 overflow-y-auto rounded-xl border border-zinc-700/50 bg-zinc-800/50 p-2">
            {tokensForChain.length > 0 ? (
              filteredTokens.length > 0 ? (
                filteredTokens.map((token) => (
                  <SquidTokenRow key={`${token.chainId}-${token.address}`} token={token} />
                ))
              ) : (
                <li className="rounded-lg px-3 py-4 text-center text-sm text-zinc-500">
                  No tokens match &quot;{tokenSearch}&quot;
                </li>
              )
            ) : (
              <li className="rounded-lg px-3 py-4 text-center text-sm text-zinc-500">
                No tokens returned from Squid API for this chain.
              </li>
            )}
          </ul>
        </div>
      </div>
    </div>
  );
}

function SquidTokenRow({ token }: { token: TokenOption }) {
  const isNative =
    token.address === "0x0000000000000000000000000000000000000000" ||
    !token.address ||
    token.address === "native";

  return (
    <li className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-left transition hover:bg-zinc-700/50">
      {token.logoURI ? (
        <img
          src={token.logoURI}
          alt=""
          className="h-9 w-9 shrink-0 rounded-full object-cover"
        />
      ) : (
        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-zinc-700 text-sm font-medium text-zinc-300">
          {token.symbol.slice(0, 2)}
        </div>
      )}
      <div className="min-w-0 flex-1">
        <div className="font-medium text-white">{token.symbol}</div>
        <div className="truncate text-xs text-zinc-400">
          {token.name}
          {isNative && " (native)"}
        </div>
      </div>
      <div className="shrink-0 text-xs text-zinc-500">
        {token.decimals} decimals
      </div>
    </li>
  );
}
