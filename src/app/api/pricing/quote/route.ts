import { NextResponse } from "next/server";
import { simulateProviderQuotes } from "@/lib/pricing-engine";

/** In-memory provider quote state (per server instance). */
let providerState = {
  /** On-ramp: rate at which we buy from provider. */
  providerBuyPrice: 12.4,
  previousBuyPrice: 12.4,
  /** Off-ramp: rate at which we sell to provider (typically lower than buy). */
  providerSellPrice: 11.78,
  previousSellPrice: 11.78,
  volatility: 0.012,
  updatedAt: Date.now(),
};

export type QuoteApiResponse = {
  providerBuyPrice: number;
  providerSellPrice: number;
  previousBuyPrice: number;
  previousSellPrice: number;
  volatility: number;
  updatedAt: number;
};

/** GET — fetch current provider quotes (buy for on-ramp, sell for off-ramp). */
export async function GET(): Promise<
  NextResponse<QuoteApiResponse | { error: string }>
> {
  return NextResponse.json({
    providerBuyPrice: providerState.providerBuyPrice,
    providerSellPrice: providerState.providerSellPrice,
    previousBuyPrice: providerState.previousBuyPrice,
    previousSellPrice: providerState.previousSellPrice,
    volatility: providerState.volatility,
    updatedAt: providerState.updatedAt,
  });
}

/** POST — update provider prices (set explicitly or simulate). */
export async function POST(
  request: Request
): Promise<NextResponse<QuoteApiResponse | { error: string }>> {
  try {
    const body = await request.json().catch(() => ({}));
    const {
      providerBuyPrice: bodyBuy,
      providerSellPrice: bodySell,
      simulate = false,
    } = body as {
      providerBuyPrice?: number;
      providerSellPrice?: number;
      simulate?: boolean;
    };

    if (simulate) {
      const { nextBuyPrice, nextSellPrice, volatility } =
        simulateProviderQuotes(
          providerState.providerBuyPrice,
          providerState.providerSellPrice
        );
      providerState.previousBuyPrice = providerState.providerBuyPrice;
      providerState.previousSellPrice = providerState.providerSellPrice;
      providerState.providerBuyPrice = nextBuyPrice;
      providerState.providerSellPrice = nextSellPrice;
      providerState.volatility = volatility;
    } else if (
      typeof bodyBuy === "number" ||
      typeof bodySell === "number"
    ) {
      if (typeof bodyBuy === "number" && bodyBuy > 0) {
        providerState.previousBuyPrice = providerState.providerBuyPrice;
        providerState.providerBuyPrice = Math.max(
          12,
          Math.min(13, bodyBuy)
        );
      }
      if (typeof bodySell === "number" && bodySell > 0) {
        providerState.previousSellPrice = providerState.providerSellPrice;
        providerState.providerSellPrice = Math.max(
          11,
          Math.min(13, bodySell)
        );
      }
      providerState.volatility =
        Math.abs(
          providerState.providerBuyPrice - providerState.previousBuyPrice
        ) /
          providerState.previousBuyPrice +
        Math.random() * 0.01;
    }

    providerState.updatedAt = Date.now();

    return NextResponse.json({
      providerBuyPrice: providerState.providerBuyPrice,
      providerSellPrice: providerState.providerSellPrice,
      previousBuyPrice: providerState.previousBuyPrice,
      previousSellPrice: providerState.previousSellPrice,
      volatility: providerState.volatility,
      updatedAt: providerState.updatedAt,
    });
  } catch (e) {
    const message = e instanceof Error ? e.message : String(e);
    return NextResponse.json(
      { error: "Failed to update quote", details: message },
      { status: 400 }
    );
  }
}
