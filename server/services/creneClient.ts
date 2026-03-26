/**
 * Crene Prediction Intelligence API Client
 * Fetches real market data and AI predictions for Kalshi markets
 */

import axios from "axios";

export interface CrenePrediction {
  id: string;
  ticker: string;
  title: string;
  description: string;
  currentPrice: number;
  market: string;
  domain: string;
  createdAt: string;
  expiresAt: string;
  predictions: {
    gpt4o: number;
    claude: number;
    gemini: number;
    grok: number;
    consensus: number;
  };
  volume24h: number;
  liquidity: number;
}

export interface CreneSignal {
  id: string;
  ticker: string;
  title: string;
  aiPrediction: number;
  marketPrice: number;
  divergence: number;
  confidence: number;
  signal: "buy" | "sell" | "hold";
  reasoning: string;
}

export class CreneClient {
  private apiKey: string;
  private apiHost: string;
  private baseUrl: string;

  constructor() {
    this.apiKey = process.env.RAPIDAPI_KEY || "";
    this.apiHost = process.env.CRENE_API_HOST || "crene-prediction-intelligence.p.rapidapi.com";
    this.baseUrl = `https://${this.apiHost}`;

    if (!this.apiKey) {
      throw new Error("RAPIDAPI_KEY environment variable is not set");
    }
  }

  /**
   * Fetch active predictions from Crene
   */
  async getPredictions(limit: number = 50): Promise<CrenePrediction[]> {
    try {
      console.log("[Crene] Fetching predictions with limit:", limit);
      const response = await axios.get(`${this.baseUrl}/api/predictions/`, {
        headers: {
          "x-rapidapi-key": this.apiKey,
          "x-rapidapi-host": this.apiHost,
        },
        params: {
          limit,
          market: "kalshi",
        },
        timeout: 10000,
      });

      console.log("[Crene] Response status:", response.status);
      console.log("[Crene] Response data type:", typeof response.data);
      console.log("[Crene] Response data keys:", Object.keys(response.data || {}));
      
      const predictions = response.data?.predictions || response.data || [];
      const filtered = Array.isArray(predictions) ? predictions.filter((p: any) => p && p.id && p.ticker) : [];
      console.log("[Crene] Filtered predictions count:", filtered.length);
      return filtered;
    } catch (error: any) {
      console.error("[Crene] Error fetching predictions:");
      console.error("  Status:", error.response?.status);
      console.error("  Message:", error.message);
      console.error("  Using mock data for development...");
      // Fallback to mock data for development
      const { getMockPredictions } = await import("./mockData");
      return getMockPredictions(limit);
    }
  }

  /**
   * Fetch prediction statistics
   */
  async getPredictionStats(): Promise<any> {
    try {
      const response = await axios.get(`${this.baseUrl}/api/predictions/stats/`, {
        headers: {
          "x-rapidapi-key": this.apiKey,
          "x-rapidapi-host": this.apiHost,
        },
      });

      return response.data;
    } catch (error) {
      console.error("Error fetching Crene stats:", error);
      throw error;
    }
  }

  /**
   * Fetch AI vs Market signals (divergences)
   */
  async getSignals(limit: number = 20): Promise<CreneSignal[]> {
    try {
      console.log("[Crene] Fetching signals with limit:", limit);
      const response = await axios.get(`${this.baseUrl}/api/signals/`, {
        headers: {
          "x-rapidapi-key": this.apiKey,
          "x-rapidapi-host": this.apiHost,
        },
        params: {
          limit,
          market: "kalshi",
        },
        timeout: 10000,
      });

      const signals = response.data?.signals || response.data || [];
      console.log("[Crene] Signals count:", Array.isArray(signals) ? signals.length : 0);
      return Array.isArray(signals) ? signals : [];
    } catch (error: any) {
      console.error("[Crene] Error fetching signals:");
      console.error("  Status:", error.response?.status);
      console.error("  Message:", error.message);
      console.error("  Using mock data for development...");
      // Fallback to mock data for development
      const { getMockSignals } = await import("./mockData");
      return getMockSignals(limit);
    }
  }

  /**
   * Fetch market prediction by ticker
   */
  async getPredictionByTicker(ticker: string): Promise<CrenePrediction | null> {
    try {
      const response = await axios.get(`${this.baseUrl}/api/predictions/`, {
        headers: {
          "x-rapidapi-key": this.apiKey,
          "x-rapidapi-host": this.apiHost,
        },
        params: {
          ticker,
          market: "kalshi",
        },
      });

      const predictions = response.data.predictions || [];
      return predictions.length > 0 ? predictions[0] : null;
    } catch (error) {
      console.error(`Error fetching prediction for ${ticker}:`, error);
      throw error;
    }
  }

  /**
   * Calculate AI consensus from multiple models
   */
  calculateConsensus(predictions: any): number {
    if (!predictions || typeof predictions !== "object") return 0.5;
    const values = Object.values(predictions).filter((v) => typeof v === "number" && v >= 0 && v <= 1) as number[];
    if (values.length === 0) return 0.5;
    return values.reduce((a: number, b: number) => a + b, 0) / values.length;
  }

  /**
   * Detect trading signals based on AI vs Market divergence
   */
  detectSignals(predictions: CrenePrediction[], threshold: number = 0.1): CreneSignal[] {
    if (!predictions || !Array.isArray(predictions)) {
      return [];
    }
    return predictions
      .filter((pred) => pred && pred.predictions && pred.ticker && pred.id)
      .map((pred) => {
        const consensus = this.calculateConsensus(pred.predictions);
        const marketPrice = pred.currentPrice / 100; // Convert to decimal
        const divergence = Math.abs(consensus - marketPrice);

        let signal: "buy" | "sell" | "hold" = "hold";
        let confidence = 0;

        if (divergence > threshold) {
          if (consensus > marketPrice) {
            signal = "buy";
            confidence = Math.min((consensus - marketPrice) * 100, 100);
          } else {
            signal = "sell";
            confidence = Math.min((marketPrice - consensus) * 100, 100);
          }
        }

        return {
          id: pred.id,
          ticker: pred.ticker,
          title: pred.title,
          aiPrediction: consensus,
          marketPrice,
          divergence,
          confidence: Math.round(confidence),
          signal,
          reasoning: `AI consensus: ${(consensus * 100).toFixed(1)}% vs Market: ${(marketPrice * 100).toFixed(1)}%`,
        };
      })
      .filter((s) => s.signal !== "hold")
      .sort((a, b) => b.confidence - a.confidence);
  }
}

// Singleton instance
let creneClient: CreneClient | null = null;

export function getCreneClient(): CreneClient {
  if (!creneClient) {
    creneClient = new CreneClient();
  }
  return creneClient;
}
