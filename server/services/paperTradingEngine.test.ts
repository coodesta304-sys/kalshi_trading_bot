import { describe, it, expect, beforeEach } from "vitest";
import { PaperTradingEngine } from "./paperTradingEngine";

describe("PaperTradingEngine", () => {
  let engine: PaperTradingEngine;
  const userId = "test-user-1";

  beforeEach(() => {
    engine = new PaperTradingEngine(10000);
  });

  describe("Portfolio Initialization", () => {
    it("should initialize portfolio with correct balance", () => {
      const portfolio = engine.initializePortfolio(userId);
      expect(portfolio.initialBalance).toBe(10000);
      expect(portfolio.currentBalance).toBe(10000);
      expect(portfolio.availableBalance).toBe(10000);
    });

    it("should return existing portfolio if already initialized", () => {
      engine.initializePortfolio(userId);
      const portfolio = engine.getPortfolio(userId);
      expect(portfolio.initialBalance).toBe(10000);
    });
  });

  describe("Trade Execution", () => {
    it("should execute buy trade successfully", () => {
      engine.initializePortfolio(userId);
      const trade = engine.executeTrade(userId, "market-1", "BTC", "buy", 10, 100, 2, 1.5);

      expect(trade.side).toBe("buy");
      expect(trade.quantity).toBe(10);
      expect(trade.entryPrice).toBe(100);
      expect(trade.status).toBe("open");
    });

    it("should reject trade if insufficient balance", () => {
      engine.initializePortfolio(userId);
      expect(() => {
        engine.executeTrade(userId, "market-1", "BTC", "buy", 1000, 100, 2, 1.5);
      }).toThrow();
    });

    it("should calculate stop loss correctly", () => {
      engine.initializePortfolio(userId);
      const trade = engine.executeTrade(userId, "market-1", "BTC", "buy", 10, 100, 2, 1.5);

      const expectedStopLoss = 100 * (1 - 0.02); // 2% stop loss
      expect(trade.stopLoss).toBe(expectedStopLoss);
    });

    it("should calculate take profit correctly", () => {
      engine.initializePortfolio(userId);
      const trade = engine.executeTrade(userId, "market-1", "BTC", "buy", 10, 100, 2, 1.5);

      const expectedTakeProfit = 100 * (1 + 0.015); // 1.5% take profit
      expect(trade.takeProfit).toBe(expectedTakeProfit);
    });
  });

  describe("Portfolio Updates", () => {
    it("should update portfolio after buy trade", () => {
      engine.initializePortfolio(userId);
      const initialPortfolio = engine.getPortfolio(userId);

      engine.executeTrade(userId, "market-1", "BTC", "buy", 10, 100, 2, 1.5);
      const updatedPortfolio = engine.getPortfolio(userId);

      expect(updatedPortfolio.usedMargin).toBeGreaterThanOrEqual(initialPortfolio.usedMargin);
      expect(updatedPortfolio.availableBalance).toBeLessThanOrEqual(initialPortfolio.availableBalance);
      expect(updatedPortfolio.totalOpenPositions).toBe(1);
    });
  });

  describe("Trade Closing", () => {
    it("should close trade at profit", () => {
      engine.initializePortfolio(userId);
      const trade = engine.executeTrade(userId, "market-1", "BTC", "buy", 10, 100, 2, 1.5);

      const closedTrade = engine.closeTrade(userId, trade.id, 110);
      expect(closedTrade.status).toBe("closed");
      expect(closedTrade.pnl).toBeGreaterThan(0);
    });

    it("should close trade at loss", () => {
      engine.initializePortfolio(userId);
      const trade = engine.executeTrade(userId, "market-1", "BTC", "buy", 10, 100, 2, 1.5);

      const closedTrade = engine.closeTrade(userId, trade.id, 90);
      expect(closedTrade.status).toBe("closed");
      expect(closedTrade.pnl).toBeLessThan(0);
    });

    it("should update portfolio after closing trade", () => {
      engine.initializePortfolio(userId);
      const trade = engine.executeTrade(userId, "market-1", "BTC", "buy", 10, 100, 2, 1.5);

      engine.closeTrade(userId, trade.id, 110);
      const portfolio = engine.getPortfolio(userId);

      expect(portfolio.totalClosedTrades).toBe(1);
      expect(portfolio.realizedPnL).toBeGreaterThan(0);
    });
  });

  describe("Portfolio Statistics", () => {
    it("should calculate win rate correctly", () => {
      engine.initializePortfolio(userId);

      // Execute 3 winning trades
      for (let i = 0; i < 3; i++) {
        const trade = engine.executeTrade(userId, `market-${i}`, `BTC${i}`, "buy", 10, 100, 2, 1.5);
        engine.closeTrade(userId, trade.id, 110);
      }

      // Execute 1 losing trade
      const losingTrade = engine.executeTrade(userId, "market-3", "BTC3", "buy", 10, 100, 2, 1.5);
      engine.closeTrade(userId, losingTrade.id, 90);

      const portfolio = engine.getPortfolio(userId);
      expect(portfolio.winRate).toBe(75); // 3 wins out of 4 trades
    });

    it("should calculate total PnL correctly", () => {
      engine.initializePortfolio(userId);

      const trade1 = engine.executeTrade(userId, "market-1", "BTC", "buy", 10, 100, 2, 1.5);
      engine.closeTrade(userId, trade1.id, 110); // +$100

      const trade2 = engine.executeTrade(userId, "market-2", "ETH", "buy", 10, 50, 2, 1.5);
      engine.closeTrade(userId, trade2.id, 45); // -$50

      const portfolio = engine.getPortfolio(userId);
      expect(portfolio.realizedPnL).toBe(50); // $100 - $50
    });
  });
});
