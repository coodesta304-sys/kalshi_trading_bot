/**
 * Trading Engine Service
 * Hybrid decision-making system combining technical analysis and AI insights
 */

import { nanoid } from "nanoid";

interface MarketData {
  ticker: string;
  currentPrice: number;
  yesPrice: number;
  noPrice: number;
  volume24h: number;
  priceHistory?: number[]; // Last 20 prices for technical analysis
}

interface NewsImpact {
  sentiment: "positive" | "negative" | "neutral";
  score: number; // -100 to 100
  confidence: number; // 0-100
  impactedMarkets: string[];
}

interface TradingDecision {
  id: string;
  ticker: string;
  decision: "buy" | "sell" | "hold";
  confidence: number; // 0-100
  reasoning: string;
  technicalSignal: string;
  sentimentScore: number;
  recommendedQuantity: number;
  stopLoss: number;
  takeProfit: number;
  createdAt: Date;
}

export class TradingEngine {
  /**
   * Calculate RSI (Relative Strength Index) for technical analysis
   */
  private calculateRSI(prices: number[], period: number = 14): number {
    if (prices.length < period + 1) return 50; // Default neutral

    let gains = 0;
    let losses = 0;

    for (let i = prices.length - period; i < prices.length; i++) {
      const change = prices[i] - prices[i - 1];
      if (change > 0) gains += change;
      else losses += Math.abs(change);
    }

    const avgGain = gains / period;
    const avgLoss = losses / period;

    if (avgLoss === 0) return 100;
    const rs = avgGain / avgLoss;
    const rsi = 100 - 100 / (1 + rs);

    return rsi;
  }

  /**
   * Analyze market momentum
   */
  private analyzeMomentum(prices: number[]): string {
    if (prices.length < 2) return "insufficient_data";

    const recentPrice = prices[prices.length - 1];
    const oldPrice = prices[0];
    const change = ((recentPrice - oldPrice) / oldPrice) * 100;

    if (change > 5) return "strong_uptrend";
    if (change > 1) return "uptrend";
    if (change < -5) return "strong_downtrend";
    if (change < -1) return "downtrend";
    return "sideways";
  }

  /**
   * Generate trading decision based on hybrid analysis
   */
  async generateDecision(
    market: MarketData,
    newsImpact: NewsImpact,
    userRiskProfile: {
      maxPositionSize: number;
      stopLossPercent: number;
      takeProfitPercent: number;
      minConfidenceThreshold: number;
    }
  ): Promise<TradingDecision> {
    // Technical Analysis
    const priceHistory = market.priceHistory || [market.currentPrice];
    const rsi = this.calculateRSI(priceHistory);
    const momentum = this.analyzeMomentum(priceHistory);

    // Technical signals
    let technicalSignal = "neutral";
    let technicalScore = 50;

    if (rsi < 30) {
      technicalSignal = "oversold";
      technicalScore = 70;
    } else if (rsi > 70) {
      technicalSignal = "overbought";
      technicalScore = 30;
    } else if (rsi < 50) {
      technicalSignal = "downtrend";
      technicalScore = 40;
    } else if (rsi > 50) {
      technicalSignal = "uptrend";
      technicalScore = 60;
    }

    // Adjust for momentum
    if (momentum === "strong_uptrend") technicalScore += 10;
    if (momentum === "strong_downtrend") technicalScore -= 10;

    // Combine technical + sentiment
    const sentimentWeight = 0.4;
    const technicalWeight = 0.6;

    const combinedScore =
      technicalScore * technicalWeight +
      (newsImpact.score + 100) * 0.5 * sentimentWeight;

    // Normalize to 0-100
    const normalizedScore = Math.max(0, Math.min(100, combinedScore));

    // Decision logic
    let decision: "buy" | "sell" | "hold" = "hold";
    let confidence = 0;

    if (normalizedScore > 65) {
      decision = "buy";
      confidence = Math.min(normalizedScore, 95);
    } else if (normalizedScore < 35) {
      decision = "sell";
      confidence = Math.min(100 - normalizedScore, 95);
    } else {
      decision = "hold";
      confidence = 50;
    }

    // Apply confidence threshold
    if (confidence < userRiskProfile.minConfidenceThreshold) {
      decision = "hold";
    }

    // Calculate position sizing
    const recommendedQuantity =
      decision === "hold"
        ? 0
        : Math.floor(
            (userRiskProfile.maxPositionSize / 100) * (confidence / 100)
          );

    // Calculate stop loss and take profit
    const priceInCents = market.currentPrice;
    const stopLossPercent = userRiskProfile.stopLossPercent / 100;
    const takeProfitPercent = userRiskProfile.takeProfitPercent / 100;

    const stopLoss = Math.floor(priceInCents * (1 - stopLossPercent));
    const takeProfit = Math.floor(priceInCents * (1 + takeProfitPercent));

    // Build reasoning
    const reasoning = `
Technical Analysis: RSI=${rsi.toFixed(1)} (${technicalSignal}), Momentum=${momentum}
Sentiment: ${newsImpact.sentiment} (score: ${newsImpact.score})
Combined Score: ${normalizedScore.toFixed(1)}/100
Decision: ${decision.toUpperCase()} with ${confidence}% confidence
    `.trim();

    return {
      id: nanoid(),
      ticker: market.ticker,
      decision,
      confidence: Math.round(confidence),
      reasoning,
      technicalSignal,
      sentimentScore: newsImpact.score,
      recommendedQuantity,
      stopLoss,
      takeProfit,
      createdAt: new Date(),
    };
  }

  /**
   * Evaluate trade performance
   */
  evaluateTradePerformance(
    entryPrice: number,
    exitPrice: number,
    quantity: number
  ): {
    profitLoss: number;
    profitLossPercent: number;
    outcome: "profit" | "loss" | "neutral";
  } {
    const profitLoss = (exitPrice - entryPrice) * quantity;
    const profitLossPercent = ((exitPrice - entryPrice) / entryPrice) * 100;

    let outcome: "profit" | "loss" | "neutral" = "neutral";
    if (profitLoss > 0) outcome = "profit";
    if (profitLoss < 0) outcome = "loss";

    return {
      profitLoss,
      profitLossPercent,
      outcome,
    };
  }

  /**
   * Detect arbitrage opportunities
   */
  detectArbitrage(
    kalshiYesPrice: number,
    kalshiNoPrice: number,
    externalPrice?: number
  ): {
    opportunity: boolean;
    type: "yes_undervalued" | "no_undervalued" | "none";
    expectedProfit: number;
  } {
    // In Kalshi, YES + NO should equal 100 (cents)
    const totalPrice = kalshiYesPrice + kalshiNoPrice;

    if (totalPrice < 9900) {
      // Prices don't add up to $100, potential arbitrage
      if (kalshiYesPrice < kalshiNoPrice) {
        return {
          opportunity: true,
          type: "yes_undervalued",
          expectedProfit: 10000 - totalPrice,
        };
      } else {
        return {
          opportunity: true,
          type: "no_undervalued",
          expectedProfit: 10000 - totalPrice,
        };
      }
    }

    return {
      opportunity: false,
      type: "none",
      expectedProfit: 0,
    };
  }
}

// Singleton instance
let tradingEngine: TradingEngine | null = null;

export function getTradingEngine(): TradingEngine {
  if (!tradingEngine) {
    tradingEngine = new TradingEngine();
  }
  return tradingEngine;
}
