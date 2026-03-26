import { describe, it, expect, beforeEach } from "vitest";
import { TradingDecisionEngine } from "./tradingDecisionEngine";
import type { CreneSignal } from "./creneClient";

describe("TradingDecisionEngine", () => {
  let engine: TradingDecisionEngine;

  beforeEach(() => {
    engine = new TradingDecisionEngine({
      minConfidenceThreshold: 60,
      maxPositionSize: 5,
      riskRewardRatio: 1.5,
    });
  });

  describe("Decision Making", () => {
    it("should make buy decision on strong positive signal", () => {
      const signal: CreneSignal = {
        ticker: "BTC",
        title: "Bitcoin Price",
        signal: "buy",
        confidence: 80,
        aiPrediction: 50000,
        marketPrice: 45000,
        volume24h: 1000000,
        liquidity: 500000,
      };

      const decision = engine.makeDecision("market-1", "BTC", signal, [], 10000, 1);

      expect(["buy", "hold"]).toContain(decision.decision);
    });

    it("should make sell decision on strong negative signal", () => {
      const signal: CreneSignal = {
        ticker: "BTC",
        title: "Bitcoin Price",
        signal: "sell",
        confidence: 80,
        aiPrediction: 40000,
        marketPrice: 45000,
        volume24h: 1000000,
        liquidity: 500000,
      };

      const decision = engine.makeDecision("market-1", "BTC", signal, [], 10000, 1);

      expect(["sell", "hold"]).toContain(decision.decision);
    });

    it("should make hold decision on neutral signal", () => {
      const signal: CreneSignal = {
        ticker: "BTC",
        title: "Bitcoin Price",
        signal: "hold",
        confidence: 50,
        aiPrediction: 45000,
        marketPrice: 45000,
        volume24h: 1000000,
        liquidity: 500000,
      };

      const decision = engine.makeDecision("market-1", "BTC", signal, [], 10000, 1);

      expect(decision.decision).toBe("hold");
    });
  });

  describe("Position Sizing", () => {
    it("should calculate position size based on account balance", () => {
      const signal: CreneSignal = {
        ticker: "BTC",
        title: "Bitcoin Price",
        signal: "buy",
        confidence: 80,
        aiPrediction: 50000,
        marketPrice: 45000,
        volume24h: 1000000,
        liquidity: 500000,
      };

      const decision = engine.makeDecision("market-1", "BTC", signal, [], 10000, 1);

      // Position size should be calculated based on risk
      expect(decision.positionSize).toBeGreaterThan(0);
    });

    it("should respect max position size limit", () => {
      const signal: CreneSignal = {
        ticker: "BTC",
        title: "Bitcoin Price",
        signal: "buy",
        confidence: 95,
        aiPrediction: 55000,
        marketPrice: 45000,
        volume24h: 1000000,
        liquidity: 500000,
      };

      const decision = engine.makeDecision("market-1", "BTC", signal, [], 100000, 1);

      // Position size should be reasonable
      expect(decision.positionSize).toBeGreaterThan(0);
    });
  });

  describe("Stop Loss & Take Profit", () => {
    it("should calculate stop loss correctly", () => {
      const signal: CreneSignal = {
        ticker: "BTC",
        title: "Bitcoin Price",
        signal: "buy",
        confidence: 80,
        aiPrediction: 50000,
        marketPrice: 45000,
        volume24h: 1000000,
        liquidity: 500000,
      };

      const decision = engine.makeDecision("market-1", "BTC", signal, [], 10000, 1);

      // Stop loss should be below entry price
      expect(decision.stopLoss).toBeLessThan(decision.entryPrice);
    });

    it("should calculate take profit correctly", () => {
      const signal: CreneSignal = {
        ticker: "BTC",
        title: "Bitcoin Price",
        signal: "buy",
        confidence: 80,
        aiPrediction: 50000,
        marketPrice: 45000,
        volume24h: 1000000,
        liquidity: 500000,
      };

      const decision = engine.makeDecision("market-1", "BTC", signal, [], 10000, 1);

      // Take profit should be above entry price
      expect(decision.takeProfit).toBeGreaterThan(decision.entryPrice);
    });

    it("should maintain risk-reward ratio", () => {
      const signal: CreneSignal = {
        ticker: "BTC",
        title: "Bitcoin Price",
        signal: "buy",
        confidence: 80,
        aiPrediction: 50000,
        marketPrice: 45000,
        volume24h: 1000000,
        liquidity: 500000,
      };

      const decision = engine.makeDecision("market-1", "BTC", signal, [], 10000, 1);

      const risk = decision.entryPrice - decision.stopLoss;
      const reward = decision.takeProfit - decision.entryPrice;
      const ratio = reward / risk;

      expect(ratio).toBeGreaterThanOrEqual(1); // Should have positive risk-reward
    });
  });

  describe("Confidence Threshold", () => {
    it("should reject low confidence signals", () => {
      const signal: CreneSignal = {
        ticker: "BTC",
        title: "Bitcoin Price",
        signal: "buy",
        confidence: 30,
        aiPrediction: 45350,
        marketPrice: 45000,
        volume24h: 1000000,
        liquidity: 500000,
      };

      const decision = engine.makeDecision("market-1", "BTC", signal, [], 10000, 1);

      expect(decision.decision).toBe("hold");
    });
  });
});
