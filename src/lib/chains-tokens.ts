import {
  mainnet,
  arbitrum,
  base,
  polygon,
  type Chain,
} from "viem/chains";

export const supportedChains: Chain[] = [
  mainnet,
  arbitrum,
  base,
  polygon,
];

export type TokenInfo = {
  address: `0x${string}`;
  name: string;
  symbol: string;
  decimals: number;
  chainId: number;
};

const nativeToken = (chain: Chain): TokenInfo => ({
  address: "0x0000000000000000000000000000000000000000" as `0x${string}`,
  name: chain.nativeCurrency.name,
  symbol: chain.nativeCurrency.symbol,
  decimals: chain.nativeCurrency.decimals,
  chainId: chain.id,
});

export const chainTokens: Record<number, TokenInfo[]> = {
  [mainnet.id]: [
    nativeToken(mainnet),
    {
      address: "0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48" as `0x${string}`,
      name: "USD Coin",
      symbol: "USDC",
      decimals: 6,
      chainId: mainnet.id,
    },
    {
      address: "0xdAC17F958D2ee523a2206206994597C13D831ec7" as `0x${string}`,
      name: "Tether USD",
      symbol: "USDT",
      decimals: 6,
      chainId: mainnet.id,
    },
    {
      address: "0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2" as `0x${string}`,
      name: "Wrapped Ether",
      symbol: "WETH",
      decimals: 18,
      chainId: mainnet.id,
    },
  ],
  [arbitrum.id]: [
    nativeToken(arbitrum),
    {
      address: "0xaf88d065e77c8cC2239327C5EDb3A432268e5831" as `0x${string}`,
      name: "USD Coin",
      symbol: "USDC",
      decimals: 6,
      chainId: arbitrum.id,
    },
    {
      address: "0xFd086bC7CD5C481DCC9C85ebE478A1C0b69FCbb9" as `0x${string}`,
      name: "Tether USD",
      symbol: "USDT",
      decimals: 6,
      chainId: arbitrum.id,
    },
    {
      address: "0x82aF49447D8a07e3bd95BD0d56f35241523fBab1" as `0x${string}`,
      name: "Wrapped Ether",
      symbol: "WETH",
      decimals: 18,
      chainId: arbitrum.id,
    },
  ],
  [base.id]: [
    nativeToken(base),
    {
      address: "0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913" as `0x${string}`,
      name: "USD Coin",
      symbol: "USDC",
      decimals: 6,
      chainId: base.id,
    },
    {
      address: "0x4200000000000000000000000000000000000006" as `0x${string}`,
      name: "Wrapped Ether",
      symbol: "WETH",
      decimals: 18,
      chainId: base.id,
    },
  ],
  [polygon.id]: [
    nativeToken(polygon),
    {
      address: "0x3c499c542cEF5E3811e1192ce70d8cC03d5c3359" as `0x${string}`,
      name: "USD Coin",
      symbol: "USDC",
      decimals: 6,
      chainId: polygon.id,
    },
    {
      address: "0xc2132D05D31c914a87C6611C10748AEb04B58e8F" as `0x${string}`,
      name: "Tether USD",
      symbol: "USDT",
      decimals: 6,
      chainId: polygon.id,
    },
    {
      address: "0x7ceB23fD6bC0adD59E62ac25578270cFf1b9f619" as `0x${string}`,
      name: "Wrapped Ether",
      symbol: "WETH",
      decimals: 18,
      chainId: polygon.id,
    },
  ],
};

export function getTokensForChain(chainId: number): TokenInfo[] {
  return chainTokens[chainId] ?? [];
}
