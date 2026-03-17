/**
 * Merchant Pricing Engine — On/Off-ramp calculator logic.
 * Used by the pricing calculator page; all calculations live here.
 */

export type PricingMode = "onramp" | "offramp";
export type ProfitMode = "manual" | "auto";

export interface PricingState {
  mode: PricingMode;
  profitMode: ProfitMode;
  providerPrice: number;
  previousPrice: number;
  avgBuyPrice: number;
  amount: number;
  baseProfit: number;
  volatility: number;
  inventoryRatio: number;
  tradesPerHour: number;
  fiatUtilization: number;
}

export interface OnRampQuote {
  /** Final selling price (floored at cost if market is below). */
  pricePerToken: number;
  totalPremium: number;
  breakdown: {
    baseProfit: number;
    inventoryRisk: number;
    volatilityPremium: number;
  };
  /** Price we'd quote if we followed market (no floor). */
  marketPricePerToken: number;
  /** True when market dropped below cost and we're showing the floor. */
  atFloor: boolean;
  /** Loss per token if you sold at market price (only when atFloor). */
  lossPerTokenIfSoldAtMarket?: number;
}

export interface OffRampQuote {
  pricePerToken: number;
  totalDiscount: number;
  breakdown: {
    baseProfit: number;
    volatilityPremium: number;
    fiatRiskPremium: number;
  };
}

export type QuoteResult = OnRampQuote | OffRampQuote;

export function isOnRampQuote(q: QuoteResult): q is OnRampQuote {
  return "totalPremium" in q;
}

// ---------- Volatility & auto profit ----------

export function volatilityToPremium(volatility: number): number {
  if (volatility < 0.005) return 0;
  if (volatility < 0.015) return 0.005;
  if (volatility < 0.03) return 0.015;
  return 0.03;
}

export function autoBaseProfit(params: {
  inventoryRatio: number;
  targetInventory?: number;
  minBase?: number;
  maxBase?: number;
}): number {
  const {
    inventoryRatio,
    targetInventory = 0.5,
    minBase = 0.02,
    maxBase = 0.04,
  } = params;
  const deviation = inventoryRatio - targetInventory;
  const adjustment = deviation * 0.02;
  const baseProfit = minBase + adjustment;
  return Math.min(Math.max(baseProfit, minBase), maxBase);
}

/**
 * Inventory-based base profit: 1% (min) when balanced, scales up to 2.5% (max) when skewed.
 * More crypto than fiat OR more fiat than crypto → higher %; when normal (balanced) → min.
 */
export function inventoryBaseProfitFromRatio(params: {
  inventoryRatio: number;
  targetInventory?: number;
  minPct?: number;
  maxPct?: number;
}): number {
  const {
    inventoryRatio,
    targetInventory = 0.5,
    minPct = 0.01,
    maxPct = 0.025,
  } = params;
  const deviation = Math.abs(inventoryRatio - targetInventory);
  const normalized = Math.min(deviation * 2, 1);
  return minPct + (maxPct - minPct) * normalized;
}

export function velocityAdjustment(tradesPerHour: number): number {
  if (tradesPerHour > 30) return -0.005;
  if (tradesPerHour > 15) return -0.002;
  if (tradesPerHour < 5) return 0.005;
  return 0;
}

/** Auto mode: add to base profit when volatility is high so price fluctuates with market. */
export function volatilityAdjustmentToBase(volatility: number): number {
  if (volatility < 0.005) return 0;
  if (volatility < 0.015) return 0.005;
  if (volatility < 0.03) return 0.01;
  return 0.015;
}

export function calculateBaseProfit(params: {
  inventoryRatio: number;
  tradesPerHour: number;
  /** When provided, auto base profit fluctuates with live volatility. */
  volatility?: number;
}): number {
  const baseFromInventory = inventoryBaseProfitFromRatio({
    inventoryRatio: params.inventoryRatio,
  });
  const velocityAdj = velocityAdjustment(params.tradesPerHour);
  const volAdj = params.volatility != null ? volatilityAdjustmentToBase(params.volatility) : 0;
  return Math.min(
    Math.max(baseFromInventory + velocityAdj + volAdj, 0.01),
    0.045
  );
}

// ---------- Quotes ----------
// On-ramp: providerPrice = provider's buy rate (what we pay to buy from provider).
// minSellingPrice = floor from our purchase price; we never sell below cost.

export function quoteOnRamp(params: {
  providerPrice: number;
  avgBuyPrice: number;
  baseProfit?: number;
  volatility?: number;
  /** Floor: never sell below this (e.g. purchase price). */
  minSellingPrice?: number;
}): OnRampQuote {
  const {
    providerPrice,
    avgBuyPrice,
    baseProfit = 0.03,
    volatility = 0,
    minSellingPrice,
  } = params;
  const inventoryRisk = Math.max(
    0,
    (avgBuyPrice - providerPrice) / providerPrice
  );
  const volatilityPremium = volatilityToPremium(volatility);
  const totalPremium = Math.min(
    baseProfit + inventoryRisk + volatilityPremium,
    0.06
  );
  const marketPricePerToken = providerPrice * (1 + totalPremium);
  let sellPricePerToken = marketPricePerToken;
  let atFloor = false;
  let lossPerTokenIfSoldAtMarket: number | undefined;
  if (typeof minSellingPrice === "number" && minSellingPrice > 0) {
    if (marketPricePerToken < minSellingPrice) {
      sellPricePerToken = minSellingPrice;
      atFloor = true;
      lossPerTokenIfSoldAtMarket = minSellingPrice - marketPricePerToken;
    }
  }

  return {
    pricePerToken: sellPricePerToken,
    totalPremium,
    breakdown: {
      baseProfit,
      inventoryRisk,
      volatilityPremium,
    },
    marketPricePerToken,
    atFloor,
    ...(atFloor && typeof lossPerTokenIfSoldAtMarket === "number" && {
      lossPerTokenIfSoldAtMarket,
    }),
  };
}

// Off-ramp: providerSellPrice = provider's sell rate (what we get when we sell to provider).
// We buy from users below that so we profit when we sell to provider.
// maxBuyPrice = cap (provider sell rate); we never offer users more than we get from provider.

export function quoteOffRamp(params: {
  /** Provider's sell rate (what we get when we sell crypto to them). */
  providerPrice: number;
  baseProfit?: number;
  volatility?: number;
  fiatUtilization?: number;
  /** Cap: never buy from users above this (e.g. provider sell rate). */
  maxBuyPrice?: number;
}): OffRampQuote {
  const {
    providerPrice,
    baseProfit = 0.03,
    volatility = 0,
    fiatUtilization = 0,
    maxBuyPrice,
  } = params;
  const volatilityPremium = volatilityToPremium(volatility);
  const fiatRiskPremium = fiatUtilization * 0.02;
  const totalDiscount = Math.min(
    baseProfit + volatilityPremium + fiatRiskPremium,
    0.06
  );
  let buyPricePerToken = providerPrice * (1 - totalDiscount);
  if (typeof maxBuyPrice === "number" && maxBuyPrice > 0) {
    buyPricePerToken = Math.min(buyPricePerToken, maxBuyPrice);
  }

  return {
    pricePerToken: buyPricePerToken,
    totalDiscount,
    breakdown: {
      baseProfit,
      volatilityPremium,
      fiatRiskPremium,
    },
  };
}

// ---------- Simulate next provider price (for API / client) ----------

export function simulateProviderPriceChange(
  currentPrice: number,
  minPrice = 12,
  maxPrice = 13
): { nextPrice: number; volatility: number } {
  const change = (Math.random() - 0.5) * 0.02;
  const nextPrice = Math.max(
    minPrice,
    Math.min(maxPrice, currentPrice * (1 + change))
  );
  const volatility = Math.abs(change) + Math.random() * 0.01;
  return { nextPrice, volatility };
}

/** Typical spread: provider sell (off-ramp) is below provider buy (on-ramp). */
const OFF_RAMP_SPREAD = 0.05; // sell rate ~5% below buy rate

export function simulateProviderQuotes(
  currentBuyPrice: number,
  currentSellPrice: number,
  buyRange = { min: 12, max: 13 }
): {
  nextBuyPrice: number;
  nextSellPrice: number;
  volatility: number;
} {
  const { nextPrice: nextBuyPrice, volatility } = simulateProviderPriceChange(
    currentBuyPrice,
    buyRange.min,
    buyRange.max
  );
  // Sell price tracks buy but stays below it (provider pays us less when we sell to them)
  const sellSpread = OFF_RAMP_SPREAD + (Math.random() - 0.5) * 0.02;
  const nextSellPrice = Math.max(
    buyRange.min * 0.9,
    Math.min(nextBuyPrice * (1 - sellSpread), nextBuyPrice - 0.1)
  );
  return { nextBuyPrice, nextSellPrice, volatility };
}
