/**
 * Trading Decision Engine
 * Makes buy/sell decisions based on AI predictions, market sentiment, and risk management
 */

import { MarketInsight } from "./polymarketClient";
import { Tweet } from "./twitterClient";

export interface TradingDecision {
  id: string;
  marketId: string;
  ticker: string;
  decision: "buy" | "sell" | "hold";
  confidence: number;
  entryPrice: number;
  stopLoss: number;
  takeProfit: number;
  positionSize: number;
  reasoning: string;
  factors: {
    aiSignal: string;
    sentiment: string;
    technicalAnalysis: string;
    riskAssessment: string;
  };
  timestamp: Date;
}

export class TradingDecisionEngine {
  private minConfidenceThreshold: number = 60; // 60% confidence minimum
  private maxPositionSize: number = 5; // Max 5% of account per trade
  private stopLossPercentage: number = 2; // 2% stop loss
  private takeProfitPercentage: number = 5; // 5% take profit
  private riskRewardRatio: number = 2.5; // Risk/Reward ratio

  constructor(config?: any) {
    if (config) {
      if (config.minConfidenceThreshold) this.minConfidenceThreshold = config.minConfidenceThreshold;
      if (config.maxPositionSize) this.maxPositionSize = config.maxPositionSize;
      if (config.stopLossPercentage) this.stopLossPercentage = config.stopLossPercentage;
      if (config.takeProfitPercentage) this.takeProfitPercentage = config.takeProfitPercentage;
      if (config.riskRewardRatio) this.riskRewardRatio = config.riskRewardRatio;
    }
  }

  /**
   * Make trading decision based on multiple factors
   */
  makeDecision(
    marketId: string,
    ticker: string,
    insight: any,
    tweets: Tweet[],
    accountBalance: number,
    riskPercentage: number = 1
  ): TradingDecision {
    // Analyze AI signal
    const aiSignalScore = this.analyzeAISignal(insight);

    // Analyze sentiment
    const sentimentScore = this.analyzeSentiment(tweets);

    // Combine scores
    const combinedScore = (aiSignalScore + sentimentScore) / 2;

    // Determine decision
    let decision: "buy" | "sell" | "hold" = "hold";
    let confidence = 0;

    if (combinedScore > 0.6) {
      decision = "buy";
      confidence = Math.min(combinedScore * 100, 100);
    } else if (combinedScore < -0.6) {
      decision = "sell";
      confidence = Math.min(Math.abs(combinedScore) * 100, 100);
    }

    // Check confidence threshold
    if (confidence < this.minConfidenceThreshold) {
      decision = "hold";
    }

    // Default entry price
    const entryPrice = 0.5;

    // Calculate position size
    const positionSize = this.calculatePositionSize(
      accountBalance,
      entryPrice,
      riskPercentage
    );

    // Calculate stop loss and take profit
    const stopLoss = entryPrice * (1 - riskPercentage / 100);
    const takeProfit = entryPrice * (1 + riskPercentage * this.riskRewardRatio / 100);

    // Build reasoning
    const reasoning = this.buildReasoning(
      insight,
      tweets,
      aiSignalScore,
      sentimentScore,
      combinedScore
    );

    // Build factors
    const factors = {
      aiSignal: `Market Insight Signal: ${insight.signal || "NEUTRAL"}`,
      sentiment: `Sentiment Score: ${sentimentScore.toFixed(2)} from ${tweets.length} tweets`,
      technicalAnalysis: `Liquidity: ${((insight.liquidityScore || 0.5) * 100).toFixed(1)}%`,
      riskAssessment: `Position Size: ${positionSize} units, Risk/Reward: 1:${this.riskRewardRatio}`,
    };

    return {
      id: `${marketId}-${Date.now()}`,
      marketId,
      ticker,
      decision,
      confidence: Math.round(confidence),
      entryPrice,
      stopLoss,
      takeProfit,
      positionSize,
      reasoning,
      factors,
      timestamp: new Date(),
    };
  }

  /**
   * Analyze AI signal strength
   */
  private analyzeAISignal(insight: any): number {
    // Convert market insight to a score
    // Positive score = bullish, Negative score = bearish

    const liquidityScore = insight.liquidityScore || 0.5;
    const trendScore = insight.trendScore || 0.5;
    const confidence = insight.confidence || 0.5;

    // Score ranges from -1 to 1
    let score = (liquidityScore + trendScore) / 2 - 0.5; // Center around 0
    score *= 2; // Scale to -1 to 1

    // Apply confidence weighting
    score *= confidence;

    // Clamp to -1 to 1
    return Math.max(-1, Math.min(1, score));
  }

  /**
   * Analyze sentiment from tweets
   */
  private analyzeSentiment(tweets: Tweet[]): number {
    if (tweets.length === 0) return 0;

    let sentimentScore = 0;
    let totalWeight = 0;

    tweets.forEach((tweet) => {
      // Weight by relevance and engagement
      const weight = tweet.relevanceScore * (1 + tweet.likes / 1000 + tweet.retweets / 1000);

      if (tweet.sentiment === "positive") {
        sentimentScore += weight;
      } else if (tweet.sentiment === "negative") {
        sentimentScore -= weight;
      }

      totalWeight += weight;
    });

    // Normalize to -1 to 1
    if (totalWeight === 0) return 0;
    const normalized = sentimentScore / totalWeight;
    return Math.max(-1, Math.min(1, normalized));
  }

  /**
   * Calculate position size based on risk management
   */
  private calculatePositionSize(
    accountBalance: number,
    entryPrice: number,
    riskPercentage: number
  ): number {
    const maxPositionValue = (accountBalance * this.maxPositionSize) / 100;
    const positionSize = Math.floor(maxPositionValue / entryPrice);
    return Math.max(1, positionSize); // Minimum 1 unit
  }

  /**
   * Build detailed reasoning for the decision
   */
  private buildReasoning(
    insight: any,
    tweets: Tweet[],
    aiScore: number,
    sentimentScore: number,
    combinedScore: number
  ): string {
    const parts: string[] = [];

    // AI Signal reasoning
    if (aiScore > 0.3) {
      parts.push(`AI signal is bullish (${(aiScore * 100).toFixed(1)})`);
    } else if (aiScore < -0.3) {
      parts.push(`AI signal is bearish (${(aiScore * 100).toFixed(1)})`);
    }

    // Sentiment reasoning
    if (sentimentScore > 0.3) {
      parts.push(`Twitter sentiment is positive (${tweets.length} relevant tweets)`);
    } else if (sentimentScore < -0.3) {
      parts.push(`Twitter sentiment is negative (${tweets.length} relevant tweets)`);
    }

    // Market divergence reasoning
    if (insight.liquidityScore > 0.65) {
      parts.push(
        `High liquidity score: ${(insight.liquidityScore * 100).toFixed(1)}%`
      );
    }

    // Combined reasoning
    if (combinedScore > 0.6) {
      parts.push("Strong bullish signals across multiple indicators");
    } else if (combinedScore < -0.6) {
      parts.push("Strong bearish signals across multiple indicators");
    } else {
      parts.push("Mixed signals, holding position");
    }

    return parts.join(". ");
  }

  /**
   * Validate decision against risk parameters
   */
  private validateDecision(decision: TradingDecision): boolean {
    // Check confidence threshold
    if (decision.confidence < this.minConfidenceThreshold && decision.decision !== "hold") {
      return false;
    }

    // Check position size
    if (decision.positionSize < 1) {
      return false;
    }

    // Check stop loss and take profit
    if (decision.stopLoss >= decision.entryPrice || decision.takeProfit <= decision.entryPrice) {
      return false;
    }

    return true;
  }
}

// Singleton instance
let instance: TradingDecisionEngine | null = null;

export function getTradingDecisionEngine(config?: Partial<TradingDecisionEngine>): TradingDecisionEngine {
  if (!instance) {
    instance = new TradingDecisionEngine(config);
  }
  return instance;
}
