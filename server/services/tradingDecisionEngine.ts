/**
 * Trading Decision Engine
 * Makes buy/sell decisions based on AI predictions, market sentiment, and risk management
 */

import { CreneSignal } from "./creneClient";
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
  private maxPositionSize: number = 5; // 5% of balance per trade
  private riskRewardRatio: number = 1.5; // Risk 1, Reward 1.5

  constructor(config?: {
    minConfidenceThreshold?: number;
    maxPositionSize?: number;
    riskRewardRatio?: number;
  }) {
    if (config?.minConfidenceThreshold) {
      this.minConfidenceThreshold = config.minConfidenceThreshold;
    }
    if (config?.maxPositionSize) {
      this.maxPositionSize = config.maxPositionSize;
    }
    if (config?.riskRewardRatio) {
      this.riskRewardRatio = config.riskRewardRatio;
    }
  }

  /**
   * Make trading decision based on multiple factors
   */
  makeDecision(
    marketId: string,
    ticker: string,
    signal: CreneSignal,
    tweets: Tweet[],
    accountBalance: number,
    riskPercentage: number = 1
  ): TradingDecision {
    // Analyze AI signal
    const aiSignalScore = this.analyzeAISignal(signal);

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

    // Calculate position size
    const positionSize = this.calculatePositionSize(
      accountBalance,
      signal.marketPrice,
      riskPercentage
    );

    // Calculate stop loss and take profit
    const stopLoss = signal.marketPrice * (1 - riskPercentage / 100);
    const takeProfit = signal.marketPrice * (1 + riskPercentage * this.riskRewardRatio / 100);

    // Build reasoning
    const reasoning = this.buildReasoning(
      signal,
      tweets,
      aiSignalScore,
      sentimentScore,
      combinedScore
    );

    // Build factors
    const factors = {
      aiSignal: `AI Prediction: ${(signal.aiPrediction * 100).toFixed(1)}% vs Market: ${(signal.marketPrice * 100).toFixed(1)}%`,
      sentiment: `Sentiment Score: ${sentimentScore.toFixed(2)} from ${tweets.length} tweets`,
      technicalAnalysis: `Divergence: ${(signal.divergence * 100).toFixed(2)}%`,
      riskAssessment: `Position Size: ${positionSize} units, Risk/Reward: 1:${this.riskRewardRatio}`,
    };

    return {
      id: `${marketId}-${Date.now()}`,
      marketId,
      ticker,
      decision,
      confidence: Math.round(confidence),
      entryPrice: signal.marketPrice,
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
  private analyzeAISignal(signal: CreneSignal): number {
    // Convert AI prediction and market price to a score
    // Positive score = bullish, Negative score = bearish

    const divergence = signal.aiPrediction - signal.marketPrice;
    const confidence = signal.confidence / 100; // Normalize to 0-1

    // Score ranges from -1 to 1
    let score = divergence * 2; // Scale divergence

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
    signal: CreneSignal,
    tweets: Tweet[],
    aiScore: number,
    sentimentScore: number,
    combinedScore: number
  ): string {
    const parts: string[] = [];

    // AI Signal reasoning
    if (aiScore > 0.3) {
      parts.push(`AI models are bullish (${(aiScore * 100).toFixed(0)}% confidence)`);
    } else if (aiScore < -0.3) {
      parts.push(`AI models are bearish (${(Math.abs(aiScore) * 100).toFixed(0)}% confidence)`);
    }

    // Sentiment reasoning
    if (sentimentScore > 0.3) {
      parts.push(`Twitter sentiment is positive (${tweets.length} relevant tweets)`);
    } else if (sentimentScore < -0.3) {
      parts.push(`Twitter sentiment is negative (${tweets.length} relevant tweets)`);
    }

    // Market divergence reasoning
    if (signal.divergence > 0.15) {
      parts.push(
        `Significant divergence detected: AI ${(signal.aiPrediction * 100).toFixed(1)}% vs Market ${(signal.marketPrice * 100).toFixed(1)}%`
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
  validateDecision(decision: TradingDecision, accountBalance: number): {
    valid: boolean;
    reason?: string;
  } {
    // Check confidence
    if (decision.confidence < this.minConfidenceThreshold && decision.decision !== "hold") {
      return {
        valid: false,
        reason: `Confidence ${decision.confidence}% below threshold ${this.minConfidenceThreshold}%`,
      };
    }

    // Check position size
    const positionValue = decision.positionSize * decision.entryPrice;
    const maxPositionValue = (accountBalance * this.maxPositionSize) / 100;

    if (positionValue > maxPositionValue) {
      return {
        valid: false,
        reason: `Position size $${positionValue} exceeds max $${maxPositionValue}`,
      };
    }

    // Check risk/reward ratio
    const riskAmount = decision.entryPrice - decision.stopLoss;
    const rewardAmount = decision.takeProfit - decision.entryPrice;

    if (rewardAmount < riskAmount * this.riskRewardRatio) {
      return {
        valid: false,
        reason: `Risk/Reward ratio below threshold`,
      };
    }

    return { valid: true };
  }

  /**
   * Get decision summary for display
   */
  getDecisionSummary(decision: TradingDecision): string {
    const action = decision.decision.toUpperCase();
    const confidence = decision.confidence;
    const ticker = decision.ticker;

    return `${action} ${ticker} with ${confidence}% confidence`;
  }
}

// Singleton instance
let tradingDecisionEngine: TradingDecisionEngine | null = null;

export function getTradingDecisionEngine(config?: {
  minConfidenceThreshold?: number;
  maxPositionSize?: number;
  riskRewardRatio?: number;
}): TradingDecisionEngine {
  if (!tradingDecisionEngine) {
    tradingDecisionEngine = new TradingDecisionEngine(config);
  }
  return tradingDecisionEngine;
}
