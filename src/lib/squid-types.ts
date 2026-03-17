/**
 * Types for Squid Router v2 API (chains & tokens).
 * See https://docs.squidrouter.com/api-and-sdk-integration/key-concepts/get-supported-tokens-and-chains
 */

export type SquidChainType = "evm" | "cosmos" | "solana" | "bitcoin" | "sui" | "xrpl" | "stellar";

export interface SquidChain {
  id?: string;
  networkIdentifier: string;
  chainId: string;
  type: SquidChainType;
  /** Display name for the chain (use this in UI) */
  networkName?: string;
  chainName?: string;
  /** Chain logo URL (e.g. from Squid assets) */
  chainIconURI?: string;
  nativeCurrency?: {
    name: string;
    symbol: string;
    decimals: number;
    icon?: string;
  };
  blockExplorerUrl?: string;
  blockExplorerUrls?: string[];
}

export interface SquidToken {
  chainId: string;
  address: string;
  name: string;
  symbol: string;
  decimals: number;
  logoURI?: string;
  coingeckoId?: string;
}

/** Normalized chain for our UI (chainId as string to support cosmos etc.) */
export interface ChainOption {
  id: string;
  /** Display name from API (networkName) */
  name: string;
  nativeSymbol: string;
  type: SquidChainType;
  chainIconURI?: string;
}

/** Normalized token for our UI */
export interface TokenOption {
  chainId: string;
  address: string;
  name: string;
  symbol: string;
  decimals: number;
  logoURI?: string;
}

export function squashChain(c: SquidChain): ChainOption {
  const name = c.networkName ?? c.chainName ?? c.networkIdentifier ?? c.chainId;
  const nativeSymbol = c.nativeCurrency?.symbol ?? "—";
  return {
    id: c.chainId ?? c.id ?? "",
    name,
    nativeSymbol,
    type: c.type ?? "evm",
    chainIconURI: c.chainIconURI,
  };
}

export function squashToken(t: SquidToken): TokenOption {
  return {
    chainId: t.chainId,
    address: t.address,
    name: t.name,
    symbol: t.symbol,
    decimals: t.decimals,
    logoURI: t.logoURI,
  };
}
