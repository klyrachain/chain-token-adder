"use client";

import "./pricing.css";
import { useCallback, useEffect, useRef, useState } from "react";
import {
  type PricingMode,
  type ProfitMode,
  quoteOnRamp,
  quoteOffRamp,
  isOnRampQuote,
  calculateBaseProfit,
  inventoryBaseProfitFromRatio,
  velocityAdjustment,
  volatilityAdjustmentToBase,
} from "@/lib/pricing-engine";

const QUOTE_INTERVAL_MS = 30000;
const QUOTE_INTERVAL_AUTO_MS = 12000; // faster refresh in auto mode so price fluctuates visibly
const COUNTDOWN_START = 30;

type QuoteApiResponse = {
  providerBuyPrice: number;
  providerSellPrice: number;
  previousBuyPrice: number;
  previousSellPrice: number;
  volatility: number;
  updatedAt: number;
};

async function fetchQuote(): Promise<QuoteApiResponse> {
  const res = await fetch("/api/pricing/quote");
  if (!res.ok) throw new Error("Failed to fetch quote");
  return res.json();
}

async function simulateQuote(): Promise<QuoteApiResponse> {
  const res = await fetch("/api/pricing/quote", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ simulate: true }),
  });
  if (!res.ok) throw new Error("Failed to simulate quote");
  return res.json();
}

function getVolatilityLabel(vol: number): string {
  if (vol < 0.005) return "Calm";
  if (vol < 0.015) return "Normal";
  if (vol < 0.03) return "Active";
  return "Extreme";
}

function getRiskLabel(risk: number): string {
  if (risk === 0) return "None";
  if (risk < 0.01) return "Low";
  if (risk < 0.02) return "Medium";
  return "High";
}

function getRiskClass(risk: number): "low" | "medium" | "high" {
  if (risk === 0 || risk < 0.01) return "low";
  if (risk < 0.02) return "medium";
  return "high";
}

export default function PricingPage() {
  const [mode, setMode] = useState<PricingMode>("onramp");
  const [profitMode, setProfitMode] = useState<ProfitMode>("manual");
  const [providerBuyPrice, setProviderBuyPrice] = useState(12.4);
  const [providerSellPrice, setProviderSellPrice] = useState(11.78);
  const [previousBuyPrice, setPreviousBuyPrice] = useState(12.4);
  const [previousSellPrice, setPreviousSellPrice] = useState(11.78);
  const [volatility, setVolatility] = useState(0.012);
  const [avgBuyPrice, setAvgBuyPrice] = useState(12.24);
  const [amount, setAmount] = useState(100);
  const [baseProfit, setBaseProfit] = useState(0.03);
  const [inventoryRatio, setInventoryRatio] = useState(0.5);
  const [tradesPerHour, setTradesPerHour] = useState(10);
  const [fiatUtilization, setFiatUtilization] = useState(0);
  const [countdown, setCountdown] = useState(COUNTDOWN_START);
  const [quoteStatus, setQuoteStatus] = useState<"ready" | "fetching">("ready");
  const [quoteError, setQuoteError] = useState<string | null>(null);
  const [useLiveProviderQuotes, setUseLiveProviderQuotes] = useState(true);
  const [manualProviderBuyPrice, setManualProviderBuyPrice] = useState(12.4);
  const [manualProviderSellPrice, setManualProviderSellPrice] = useState(11.78);
  const [inventoryAutoSimulation, setInventoryAutoSimulation] = useState(false);

  const selectedBaseProfitRef = useRef(0.03);
  const inventorySimulationStepRef = useRef(0);

  const effectiveProviderBuyPrice = useLiveProviderQuotes ? providerBuyPrice : manualProviderBuyPrice;
  const effectiveProviderSellPrice = useLiveProviderQuotes ? providerSellPrice : manualProviderSellPrice;
  const effectivePreviousBuyPrice = useLiveProviderQuotes ? previousBuyPrice : manualProviderBuyPrice;
  const effectivePreviousSellPrice = useLiveProviderQuotes ? previousSellPrice : manualProviderSellPrice;

  const fetchInitial = useCallback(async () => {
    setQuoteError(null);
    try {
      const data = await fetchQuote();
      setProviderBuyPrice(data.providerBuyPrice);
      setProviderSellPrice(data.providerSellPrice);
      setPreviousBuyPrice(data.previousBuyPrice);
      setPreviousSellPrice(data.previousSellPrice);
      setVolatility(data.volatility);
      setCountdown(COUNTDOWN_START);
    } catch (e) {
      setQuoteError(e instanceof Error ? e.message : "Failed to load quote");
    }
  }, []);

  useEffect(() => {
    fetchInitial();
  }, [fetchInitial]);

  const quoteIntervalMs =
    profitMode === "auto" ? QUOTE_INTERVAL_AUTO_MS : QUOTE_INTERVAL_MS;
  const countdownMax = Math.round(quoteIntervalMs / 1000);

  useEffect(() => {
    if (!useLiveProviderQuotes) return;

    let countdownTimer: ReturnType<typeof setInterval>;
    let quoteTimer: ReturnType<typeof setInterval>;

    countdownTimer = setInterval(() => {
      setCountdown((c) => {
        if (c <= 1) return countdownMax;
        return c - 1;
      });
    }, 1000);

    quoteTimer = setInterval(async () => {
      setQuoteStatus("fetching");
      try {
        const data = await simulateQuote();
        setProviderBuyPrice(data.providerBuyPrice);
        setProviderSellPrice(data.providerSellPrice);
        setPreviousBuyPrice(data.previousBuyPrice);
        setPreviousSellPrice(data.previousSellPrice);
        setVolatility(data.volatility);
        setCountdown(countdownMax);
      } catch {
        // keep previous values
      } finally {
        setQuoteStatus("ready");
      }
    }, quoteIntervalMs);

    return () => {
      clearInterval(countdownTimer);
      clearInterval(quoteTimer);
    };
  }, [quoteIntervalMs, countdownMax, useLiveProviderQuotes]);

  const INVENTORY_SIMULATION_VALUES = [0.3, 0.5, 0.7, 0.5];
  const INVENTORY_SIMULATION_INTERVAL_MS = 2000;

  useEffect(() => {
    if (!inventoryAutoSimulation || profitMode !== "auto") return;
    const timer = setInterval(() => {
      inventorySimulationStepRef.current =
        (inventorySimulationStepRef.current + 1) % INVENTORY_SIMULATION_VALUES.length;
      setInventoryRatio(INVENTORY_SIMULATION_VALUES[inventorySimulationStepRef.current]);
    }, INVENTORY_SIMULATION_INTERVAL_MS);
    return () => clearInterval(timer);
  }, [inventoryAutoSimulation, profitMode]);

  const effectiveBaseProfit =
    profitMode === "auto"
      ? calculateBaseProfit({ inventoryRatio, tradesPerHour, volatility })
      : baseProfit;

  const volatilityAdjToBase = profitMode === "auto" ? volatilityAdjustmentToBase(volatility) : 0;

  const quote =
    mode === "onramp"
      ? quoteOnRamp({
          providerPrice: effectiveProviderBuyPrice,
          avgBuyPrice,
          baseProfit: effectiveBaseProfit,
          volatility,
          minSellingPrice: avgBuyPrice,
        })
      : quoteOffRamp({
          providerPrice: effectiveProviderSellPrice,
          baseProfit: effectiveBaseProfit,
          volatility,
          fiatUtilization,
          maxBuyPrice: effectiveProviderSellPrice,
        });

  const totalFiat = quote.pricePerToken * amount;
  const profit =
    mode === "onramp"
      ? totalFiat - avgBuyPrice * amount
      : (effectiveProviderSellPrice - quote.pricePerToken) * amount;
  const profitMargin =
    mode === "onramp"
      ? ((quote.pricePerToken - avgBuyPrice) / avgBuyPrice) * 100
      : ((effectiveProviderSellPrice - quote.pricePerToken) / effectiveProviderSellPrice) * 100;

  const displayProviderPrice = mode === "onramp" ? effectiveProviderBuyPrice : effectiveProviderSellPrice;
  const displayPreviousPrice = mode === "onramp" ? effectivePreviousBuyPrice : effectivePreviousSellPrice;
  const priceChangePct =
    displayPreviousPrice === 0
      ? 0
      : ((displayProviderPrice - displayPreviousPrice) / displayPreviousPrice) * 100;

  const baseSellingPrice = avgBuyPrice;

  const baseFromInventory = inventoryBaseProfitFromRatio({ inventoryRatio });
  const velocityAdj = velocityAdjustment(tradesPerHour);

  return (
    <div className="pricing-root">
      <div className="pricing-container">
        <header className="pricing-header">
          <h1>Merchant Pricing Engine</h1>
          <p className="pricing-subtitle">Professional On/Off-Ramp Calculator</p>
        </header>

        <div className="pricing-main-grid">
          <div className="pricing-calculator-section">
            <div className="pricing-section-title">Configuration</div>

            <div className="pricing-mode-toggle">
              <button
                type="button"
                className={`pricing-mode-btn onramp ${mode === "onramp" ? "active" : ""}`}
                onClick={() => setMode("onramp")}
              >
                ON-RAMP (Sell Crypto)
              </button>
              <button
                type="button"
                className={`pricing-mode-btn offramp ${mode === "offramp" ? "active" : ""}`}
                onClick={() => setMode("offramp")}
              >
                OFF-RAMP (Buy Crypto)
              </button>
            </div>

            <div className="pricing-quote-status">
              <div
                className={`pricing-quote-indicator ${!useLiveProviderQuotes ? "manual" : quoteStatus === "fetching" ? "fetching" : ""}`}
              />
              <span>
                {!useLiveProviderQuotes
                  ? "Manual quotes (testing)"
                  : quoteError
                    ? quoteError
                    : quoteStatus === "fetching"
                      ? "Fetching new quote..."
                      : "Live quote ready"}
              </span>
              {useLiveProviderQuotes && (
                <span style={{ marginLeft: "auto", color: "var(--pricing-text-muted)" }}>
                  {countdown}s
                </span>
              )}
            </div>

            <div className="pricing-input-group">
              <label className="pricing-input-label">Provider quotes</label>
              <div className="pricing-provider-quotes-toggle">
                <button
                  type="button"
                  className={`pricing-provider-quotes-btn ${useLiveProviderQuotes ? "active" : ""}`}
                  onClick={() => {
                    setUseLiveProviderQuotes(true);
                    fetchInitial();
                  }}
                >
                  Live quotes
                </button>
                <button
                  type="button"
                  className={`pricing-provider-quotes-btn ${!useLiveProviderQuotes ? "active" : ""}`}
                  onClick={() => {
                    setUseLiveProviderQuotes(false);
                    setManualProviderBuyPrice(providerBuyPrice);
                    setManualProviderSellPrice(providerSellPrice);
                  }}
                >
                  Manual (testing)
                </button>
              </div>
              <p className="pricing-help-text">
                Use manual quotes to test prices when live quotes aren&apos;t available.
              </p>
              {!useLiveProviderQuotes && (
                <div className="pricing-manual-quotes-inputs">
                  <div className="pricing-input-group">
                    <label className="pricing-input-label">Provider buy price (on-ramp)</label>
                    <div className="pricing-input-wrapper">
                      <input
                        type="number"
                        value={manualProviderBuyPrice}
                        step={0.01}
                        min={0}
                        onChange={(e) => setManualProviderBuyPrice(parseFloat(e.target.value) || 0)}
                      />
                      <span className="pricing-currency-badge">GHS/USDC</span>
                    </div>
                  </div>
                  <div className="pricing-input-group">
                    <label className="pricing-input-label">Provider sell price (off-ramp)</label>
                    <div className="pricing-input-wrapper">
                      <input
                        type="number"
                        value={manualProviderSellPrice}
                        step={0.01}
                        min={0}
                        onChange={(e) => setManualProviderSellPrice(parseFloat(e.target.value) || 0)}
                      />
                      <span className="pricing-currency-badge">GHS/USDC</span>
                    </div>
                  </div>
                </div>
              )}
            </div>

            <div
              className="pricing-quote-status pricing-price-history"
              style={{ flexDirection: "column", alignItems: "stretch", gap: "0.75rem", padding: "1rem" }}
            >
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <span
                  style={{
                    fontSize: "0.65rem",
                    textTransform: "uppercase",
                    letterSpacing: "0.1em",
                    color: "var(--pricing-text-muted)",
                  }}
                >
                  {mode === "onramp" ? "Provider buy rate" : "Provider sell rate"}
                </span>
                <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                  <span
                    style={{
                      fontFamily: "JetBrains Mono, monospace",
                      fontSize: "1.25rem",
                      fontWeight: 700,
                      color: "var(--pricing-text-primary)",
                    }}
                  >
                    {displayProviderPrice.toFixed(2)}
                  </span>
                  <span style={{ fontSize: "0.75rem", color: "var(--pricing-text-muted)" }}>
                    GHS
                  </span>
                </div>
              </div>
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  paddingTop: "0.5rem",
                  borderTop: "1px solid var(--pricing-border-color)",
                }}
              >
                <div style={{ display: "flex", flexDirection: "column", gap: "0.25rem" }}>
                  <span style={{ fontSize: "0.65rem", color: "var(--pricing-text-muted)" }}>
                    Previous
                  </span>
                  <span
                    style={{
                      fontFamily: "JetBrains Mono, monospace",
                      fontSize: "0.875rem",
                      color: "var(--pricing-text-secondary)",
                    }}
                  >
                    {displayPreviousPrice.toFixed(2)}
                  </span>
                </div>
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "0.5rem",
                    padding: "0.375rem 0.75rem",
                    background: "var(--pricing-bg-tertiary)",
                    borderRadius: "6px",
                  }}
                >
                  <span
                    style={{
                      fontSize: "0.875rem",
                      color:
                        priceChangePct > 0
                          ? "var(--pricing-accent-green)"
                          : priceChangePct < 0
                            ? "var(--pricing-accent-red)"
                            : "var(--pricing-text-muted)",
                    }}
                  >
                    {priceChangePct > 0 ? "↗" : priceChangePct < 0 ? "↘" : "→"}
                  </span>
                  <span
                    style={{
                      fontFamily: "JetBrains Mono, monospace",
                      fontSize: "0.875rem",
                      fontWeight: 600,
                      color:
                        priceChangePct > 0
                          ? "var(--pricing-accent-green)"
                          : priceChangePct < 0
                            ? "var(--pricing-accent-red)"
                            : "var(--pricing-text-muted)",
                    }}
                  >
                    {priceChangePct > 0 ? "+" : ""}
                    {priceChangePct.toFixed(2)}%
                  </span>
                </div>
              </div>
            </div>

            <div className="pricing-input-group">
              <label className="pricing-input-label">Volatility risk (preview)</label>
              <p className="pricing-help-text" style={{ marginBottom: "0.5rem" }}>
                Set volatility to see how it affects your price. Next quote refresh will use live volatility.
              </p>
              <div className="pricing-volatility-buttons">
                {[
                  { label: "Calm", value: 0.003, class: "low" },
                  { label: "Normal", value: 0.012, class: "low" },
                  { label: "Active", value: 0.022, class: "medium" },
                  { label: "Extreme", value: 0.035, class: "high" },
                ].map(({ label, value, class: riskClass }) => (
                  <button
                    key={label}
                    type="button"
                    className={`pricing-volatility-btn pricing-volatility-btn-${riskClass} ${
                      Math.abs(volatility - value) < 0.002 ? "active" : ""
                    }`}
                    onClick={() => setVolatility(value)}
                    title={`Set volatility to ${label.toLowerCase()} (~${(value * 100).toFixed(2)}%)`}
                  >
                    {label}
                  </button>
                ))}
              </div>
              <div className="pricing-volatility-current">
                <span className="pricing-volatility-current-label">Current:</span>
                <span className="pricing-volatility-current-value">
                  {getVolatilityLabel(volatility)} ({(volatility * 100).toFixed(2)}%)
                </span>
              </div>
            </div>

            {mode === "offramp" && (
              <>
                <div className="pricing-warning-banner" style={{ display: "flex" }}>
                  <div className="pricing-warning-icon">⚠</div>
                  <div className="pricing-warning-text">
                    <strong>Off-ramp mode:</strong> We use the provider&apos;s sell rate (what we get
                    when we sell crypto to them). We buy from users below that so we profit when we
                    sell to the provider. Don&apos;t offer above the provider sell rate.
                  </div>
                </div>
                <div className="pricing-base-price-row pricing-base-price-row-offramp">
                  <span className="pricing-base-price-label">Provider sell rate (max buy price):</span>
                  <span className="pricing-base-price-value">{effectiveProviderSellPrice.toFixed(2)} GHS</span>
                </div>
              </>
            )}

            {mode === "onramp" && (
              <div className="pricing-input-group">
                <label className="pricing-input-label">Your Purchase Price (incl. fees)</label>
                <div className="pricing-input-row-with-action">
                  <div className="pricing-input-wrapper">
                    <input
                      type="number"
                      value={avgBuyPrice}
                      step={0.01}
                      min={0}
                      onChange={(e) => setAvgBuyPrice(parseFloat(e.target.value) || 0)}
                    />
                    <span className="pricing-currency-badge">GHS/USDC</span>
                  </div>
                  <button
                    type="button"
                    className="pricing-set-amount-btn"
                    onClick={() => setAmount(100)}
                    title="Set amount to 100 USDC"
                  >
                    Set amount
                  </button>
                </div>
                <p className="pricing-help-text">The price you paid for USDC including all fees</p>
                <div className="pricing-base-price-row">
                  <span className="pricing-base-price-label">Base selling price (floor):</span>
                  <span className="pricing-base-price-value">{baseSellingPrice.toFixed(2)} GHS</span>
                </div>
                {mode === "onramp" && isOnRampQuote(quote) && quote.atFloor && (
                  <div className="pricing-below-cost-banner">
                    <div className="pricing-below-cost-icon">ℹ</div>
                    <div className="pricing-below-cost-content">
                      <strong>Market below your cost</strong> — Provider dropped to{" "}
                      {effectiveProviderBuyPrice.toFixed(2)} GHS. Your selling price is at floor (
                      {quote.pricePerToken.toFixed(2)} GHS) so you don&apos;t sell at a loss. If you
                      sold at current market you&apos;d get{" "}
                      <span className="pricing-below-cost-market">
                        {quote.marketPricePerToken.toFixed(2)} GHS
                      </span>{" "}
                      and make a loss of{" "}
                      <span className="pricing-below-cost-loss">
                        {((quote.lossPerTokenIfSoldAtMarket ?? 0) * amount).toFixed(2)} GHS
                      </span>{" "}
                      total. Either wait for market to recover or accept the loss to compete.
                    </div>
                  </div>
                )}
              </div>
            )}

            <div className="pricing-input-group">
              <label className="pricing-input-label">Amount</label>
              <div className="pricing-input-wrapper">
                <input
                  type="number"
                  value={amount}
                  step={1}
                  min={0}
                  onChange={(e) => setAmount(parseFloat(e.target.value) || 0)}
                />
                <span className="pricing-currency-badge">USDC</span>
              </div>
              {mode === "onramp" && (
                <div className="pricing-base-price-row">
                  <span className="pricing-base-price-label">Base selling price (floor):</span>
                  <span className="pricing-base-price-value">{baseSellingPrice.toFixed(2)} GHS</span>
                </div>
              )}
            </div>

            <div className="pricing-input-group">
              <label className="pricing-input-label">Base Profit Mode</label>
              <div className="pricing-profit-mode-toggle">
                <button
                  type="button"
                  className={`pricing-profit-mode-btn ${profitMode === "manual" ? "active" : ""}`}
                  onClick={() => {
                    setProfitMode("manual");
                    setCountdown(Math.round(QUOTE_INTERVAL_MS / 1000));
                  }}
                >
                  Manual
                </button>
                <button
                  type="button"
                  className={`pricing-profit-mode-btn ${profitMode === "auto" ? "active" : ""}`}
                  onClick={() => {
                    setProfitMode("auto");
                    setCountdown(Math.round(QUOTE_INTERVAL_AUTO_MS / 1000));
                  }}
                >
                  Auto-Calculate
                </button>
              </div>
            </div>

            {profitMode === "manual" && (
              <div>
                <label className="pricing-input-label">Select Base Profit %</label>
                <div className="pricing-percentage-grid">
                  {[0.01, 0.015, 0.02, 0.025, 0.03, 0.035, 0.04, 0.045, 0.05].map((pct) => (
                    <button
                      key={pct}
                      type="button"
                      className={`pricing-percentage-option ${baseProfit === pct ? "selected" : ""}`}
                      onClick={() => {
                        setBaseProfit(pct);
                        selectedBaseProfitRef.current = pct;
                      }}
                    >
                      {(pct * 100).toFixed(pct % 1 ? 1 : 0)}%
                    </button>
                  ))}
                </div>
              </div>
            )}

            {profitMode === "auto" && (
              <div>
                <label className="pricing-input-label">Auto-Calculation Inputs</label>
                <p className="pricing-help-text" style={{ marginBottom: "0.5rem" }}>
                  Inventory: 1% when balanced, scales to 2.5% when skewed (more crypto or more fiat).
                </p>
                <div className="pricing-inventory-inputs">
                  <div className="pricing-input-group">
                    <label className="pricing-input-label">Inventory Ratio</label>
                    <div className="pricing-input-wrapper">
                      <input
                        type="number"
                        value={inventoryRatio}
                        step={0.01}
                        min={0}
                        max={1}
                        onChange={(e) => setInventoryRatio(parseFloat(e.target.value) || 0)}
                        readOnly={inventoryAutoSimulation}
                        className={inventoryAutoSimulation ? "pricing-input-readonly" : ""}
                      />
                    </div>
                    <p className="pricing-help-text">0 = empty, 1 = full</p>
                  </div>
                  <div className="pricing-input-group">
                    <label className="pricing-input-label">Trades/Hour</label>
                    <div className="pricing-input-wrapper">
                      <input
                        type="number"
                        value={tradesPerHour}
                        step={1}
                        min={0}
                        onChange={(e) => setTradesPerHour(parseFloat(e.target.value) || 0)}
                      />
                    </div>
                    <p className="pricing-help-text">Trade velocity</p>
                  </div>
                </div>
                <div className="pricing-automate-inventory-row">
                  <button
                    type="button"
                    className={`pricing-automate-inventory-btn ${inventoryAutoSimulation ? "active" : ""}`}
                    onClick={() => setInventoryAutoSimulation((v) => !v)}
                    title={inventoryAutoSimulation ? "Stop simulating inventory movement" : "Simulate inventory movement (ratio cycles 0.3 → 0.5 → 0.7 → 0.5)"}
                  >
                    {inventoryAutoSimulation ? "Stop automate" : "Automate"}
                  </button>
                  {inventoryAutoSimulation && (
                    <span className="pricing-automate-inventory-label">
                      Simulating inventory movement every 2s
                    </span>
                  )}
                </div>
                <div className="pricing-auto-profit-info">
                  <div className="pricing-auto-profit-row">
                    <span className="pricing-auto-profit-label">Calculated Base:</span>
                    <span className="pricing-auto-profit-value">
                      {(effectiveBaseProfit * 100).toFixed(2)}%
                    </span>
                  </div>
                  <div className="pricing-auto-profit-row">
                    <span className="pricing-auto-profit-label">From Inventory (1%–2.5%):</span>
                    <span className="pricing-auto-profit-value">
                      {(baseFromInventory * 100).toFixed(2)}%
                    </span>
                  </div>
                  <div className="pricing-auto-profit-row">
                    <span className="pricing-auto-profit-label">From Velocity:</span>
                    <span className="pricing-auto-profit-value">
                      {(velocityAdj * 100).toFixed(2)}%
                    </span>
                  </div>
                  <div className="pricing-auto-profit-row">
                    <span className="pricing-auto-profit-label">From Volatility:</span>
                    <span className="pricing-auto-profit-value">
                      {volatilityAdjToBase >= 0 ? "+" : ""}
                      {(volatilityAdjToBase * 100).toFixed(2)}%
                    </span>
                  </div>
                  <p className="pricing-help-text" style={{ marginTop: "0.5rem", marginBottom: 0 }}>
                    Base % and selling/buying price update with each quote (~{countdownMax}s) so they fluctuate with market.
                  </p>
                </div>
              </div>
            )}

            {mode === "offramp" && (
              <div className="pricing-input-group">
                <label className="pricing-input-label">Fiat Liquidity Pressure</label>
                <div className="pricing-input-wrapper">
                  <input
                    type="number"
                    value={fiatUtilization}
                    step={0.01}
                    min={0}
                    max={1}
                    onChange={(e) => setFiatUtilization(parseFloat(e.target.value) || 0)}
                  />
                </div>
                <p className="pricing-help-text">0 = plenty of cash, 1 = no cash available</p>
              </div>
            )}
          </div>

          <div className="pricing-results-panel">
            <div className="pricing-section-title">Live Quote</div>

            <div
              className="pricing-price-display"
              style={{
                borderColor: mode === "onramp" ? "var(--pricing-accent-green)" : "var(--pricing-accent-red)",
                boxShadow:
                  mode === "onramp"
                    ? "0 0 30px var(--pricing-glow-green)"
                    : "0 0 30px var(--pricing-glow-red)",
              }}
            >
              <div className="pricing-price-label">
                {mode === "onramp"
                  ? isOnRampQuote(quote) && quote.atFloor
                    ? "Your Selling Price (floor)"
                    : "Your Selling Price"
                  : "Your Buying Price"}
              </div>
              <div
                className="pricing-price-value"
                style={{
                  color:
                    mode === "onramp" ? "var(--pricing-accent-green)" : "var(--pricing-accent-red)",
                }}
              >
                {quote.pricePerToken.toFixed(2)} GHS
              </div>
              <div className="pricing-price-subtext">per USDC</div>
              {mode === "onramp" && isOnRampQuote(quote) && quote.atFloor && (
                <div className="pricing-price-extra">
                  <div className="pricing-price-extra-row">
                    <span>Market-based price:</span>
                    <span className="pricing-price-extra-value">
                      {quote.marketPricePerToken.toFixed(2)} GHS
                    </span>
                  </div>
                  <div className="pricing-price-extra-row pricing-price-extra-loss">
                    <span>Loss if sold at market:</span>
                    <span className="pricing-price-extra-value">
                      {((quote.lossPerTokenIfSoldAtMarket ?? 0) * amount).toFixed(2)} GHS
                    </span>
                  </div>
                </div>
              )}
            </div>

            <div className="pricing-breakdown-section">
              <div className="pricing-breakdown-title">Transaction Summary</div>
              <div className="pricing-breakdown-row">
                <span className="pricing-breakdown-label">Amount</span>
                <span className="pricing-breakdown-value">
                  {amount.toFixed(2)} USDC
                </span>
              </div>
              <div className="pricing-breakdown-row">
                <span className="pricing-breakdown-label">Rate</span>
                <span className="pricing-breakdown-value">
                  {quote.pricePerToken.toFixed(2)} GHS/USDC
                </span>
              </div>
              <div
                className="pricing-breakdown-row"
                style={{
                  borderTop: "2px solid var(--pricing-border-color)",
                  paddingTop: "1rem",
                  marginTop: "0.5rem",
                }}
              >
                <span
                  className="pricing-breakdown-label"
                  style={{ fontWeight: 600, color: "var(--pricing-text-primary)" }}
                >
                  Total
                </span>
                <span
                  className="pricing-breakdown-value positive"
                  style={{ fontSize: "1.25rem" }}
                >
                  {totalFiat.toFixed(2)} GHS
                </span>
              </div>
            </div>

            <div className="pricing-breakdown-section">
              <div className="pricing-breakdown-title">Pricing Breakdown</div>
              <div className="pricing-breakdown-row">
                <span className="pricing-breakdown-label">
                  {mode === "onramp" ? "Provider buy rate" : "Provider sell rate"}
                </span>
                <span className="pricing-breakdown-value">
                  {(mode === "onramp" ? effectiveProviderBuyPrice : effectiveProviderSellPrice).toFixed(2)} GHS
                </span>
              </div>
              <div className="pricing-breakdown-row">
                <span className="pricing-breakdown-label">Base Profit</span>
                <span className="pricing-breakdown-value positive">
                  {mode === "onramp" ? "+" : "-"}
                  {(effectiveBaseProfit * 100).toFixed(2)}%
                </span>
              </div>
              {mode === "onramp" && isOnRampQuote(quote) && (
                <div className="pricing-breakdown-row">
                  <span className="pricing-breakdown-label">
                    Inventory Risk
                    <span className="pricing-volatility-indicator">
                      <span
                        className={`pricing-volatility-dot ${getRiskClass(quote.breakdown.inventoryRisk)}`}
                      />
                      <span>{getRiskLabel(quote.breakdown.inventoryRisk)}</span>
                    </span>
                  </span>
                  <span className="pricing-breakdown-value positive">
                    +{(quote.breakdown.inventoryRisk * 100).toFixed(2)}%
                  </span>
                </div>
              )}
              <div className="pricing-breakdown-row">
                <span className="pricing-breakdown-label">
                  Volatility Premium
                  <span className="pricing-volatility-indicator">
                    <span
                      className={`pricing-volatility-dot ${
                        volatility < 0.015 ? "low" : volatility < 0.03 ? "medium" : "high"
                      }`}
                    />
                    <span>{getVolatilityLabel(volatility)}</span>
                  </span>
                </span>
                <span className="pricing-breakdown-value positive">
                  {mode === "onramp" ? "+" : "-"}
                  {(quote.breakdown.volatilityPremium * 100).toFixed(2)}%
                </span>
              </div>
              {mode === "offramp" && !isOnRampQuote(quote) && (
                <div className="pricing-breakdown-row">
                  <span className="pricing-breakdown-label">Fiat Risk</span>
                  <span className="pricing-breakdown-value negative">
                    +{(quote.breakdown.fiatRiskPremium * 100).toFixed(2)}%
                  </span>
                </div>
              )}
              <div
                className="pricing-breakdown-row"
                style={{
                  borderTop: "2px solid var(--pricing-border-color)",
                  paddingTop: "1rem",
                  marginTop: "0.5rem",
                }}
              >
                <span className="pricing-breakdown-label" style={{ fontWeight: 600 }}>
                  Total Premium
                </span>
                <span
                  className="pricing-breakdown-value positive"
                  style={{ fontSize: "1.1rem" }}
                >
                  {isOnRampQuote(quote)
                    ? `+${(quote.totalPremium * 100).toFixed(2)}%`
                    : `-${(quote.totalDiscount * 100).toFixed(2)}%`}
                </span>
              </div>
            </div>

            <div className="pricing-metrics-grid">
              <div className="pricing-metric-card">
                <div className="pricing-metric-label">Your Profit</div>
                <div
                  className="pricing-metric-value"
                  style={{
                    color:
                      profit >= 0 ? "var(--pricing-accent-green)" : "var(--pricing-accent-red)",
                  }}
                >
                  {profit >= 0 ? "+" : ""}
                  {profit.toFixed(2)} GHS
                </div>
              </div>
              <div className="pricing-metric-card">
                <div className="pricing-metric-label">Profit Margin</div>
                <div className="pricing-metric-value">
                  {profitMargin.toFixed(2)}%
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
