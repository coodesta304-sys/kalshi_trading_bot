import axios from "axios";
import { getMockMarkets, getMockInsights, getMockSocialSignals } from "./mockData";

export interface PolymarketMarket {
  id: string;
  ticker: string;
  title: string;
  description: string;
  currentPrice: number;
  volume24h: number;
  liquidity: number;
  createdAt: string;
  expiresAt: string;
  category: string;
  market: "polymarket" | "kalshi";
}

export interface MarketInsight {
  id: string;
  ticker: string;
  title: string;
  liquidityScore: number;
  trendScore: number;
  concentrationScore: number;
  signal: "BUY" | "SELL" | "NEUTRAL";
  confidence: number;
}

export interface SocialSignal {
  id: string;
  ticker: string;
  title: string;
  sentiment: number; // -1 to 1
  momentum: number; // 0 to 100
  volume: number;
  timestamp: string;
}

export class PolymarketClient {
  private apiKey: string;

  constructor() {
    this.apiKey = process.env.POLYMARKET_API_KEY || "";
    if (!this.apiKey) {
      console.warn("[Polymarket] No API key provided. Using mock data.");
    }
  }

  private getHeaders() {
    return {
      "Authorization": `Bearer ${this.apiKey}`,
      "Content-Type": "application/json",
    };
  }

  /**
   * جلب الأسواق من Polymarket
   * استخدام endpoint مباشر بدلاً من agent_id
   */
  async getMarkets(limit: number = 50): Promise<PolymarketMarket[]> {
    try {
      console.log("[Polymarket] Fetching markets with limit:", limit);

      // محاولة جلب البيانات من الـ API الحقيقي
      const response = await axios.get(
        `https://polymarketanalytics.com/api/markets`,
        {
          params: {
            limit,
            sort_by: "volume",
            order: "desc",
          },
          headers: this.getHeaders(),
          timeout: 10000,
        }
      );

      console.log("[Polymarket] Response status:", response.status);
      console.log("[Polymarket] Markets count:", response.data?.markets?.length || response.data?.length || 0);

      // معالجة البيانات المرجعة
      const markets = response.data?.markets || response.data || [];

      const mapped = Array.isArray(markets)
        ? markets.map((m: any) => ({
            id: m.id || m.token_id || `market_${Math.random()}`,
            ticker: m.ticker || m.slug || "UNKNOWN",
            title: m.title || m.question || "Unknown Market",
            description: m.description || m.question_description || "",
            currentPrice: parseFloat(m.price) || parseFloat(m.current_price) || 0.5,
            volume24h: parseFloat(m.volume_24h) || parseFloat(m.volume) || 0,
            liquidity: parseFloat(m.liquidity) || 0.5,
            createdAt: m.created_at || new Date().toISOString(),
            expiresAt: m.expires_at || new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
            category: m.category || "general",
            market: m.market || "polymarket",
          }))
        : [];

      console.log("[Polymarket] Mapped markets count:", mapped.length);
      
      // إذا كانت البيانات فارغة، استخدم mock data
      if (mapped.length === 0) {
        console.log("[Polymarket] No markets returned, using mock data");
        return getMockMarkets(limit);
      }
      
      return mapped;
    } catch (error: any) {
      console.error("[Polymarket] Error fetching markets:");
      console.error("  Status:", error.response?.status);
      console.error("  Message:", error.message);
      console.error("  Using mock data for development...");

      // Return mock data for development
      return getMockMarkets(limit);
    }
  }

  /**
   * جلب Market Insights
   */
  async getMarketInsights(limit: number = 20): Promise<MarketInsight[]> {
    try {
      console.log("[Polymarket] Fetching market insights with limit:", limit);

      const response = await axios.get(
        `https://polymarketanalytics.com/api/insights`,
        {
          params: {
            limit,
            sort_by: "liquidity",
            order: "desc",
          },
          headers: this.getHeaders(),
          timeout: 10000,
        }
      );

      console.log("[Polymarket] Insights count:", response.data?.insights?.length || response.data?.length || 0);

      const insights = response.data?.insights || response.data || [];

      const mapped = Array.isArray(insights)
        ? insights.map((i: any) => ({
            id: i.id || i.token_id || `insight_${Math.random()}`,
            ticker: i.ticker || i.slug || "UNKNOWN",
            title: i.title || "Unknown",
            liquidityScore: parseFloat(i.liquidity_score) || Math.random(),
            trendScore: parseFloat(i.trend_score) || Math.random(),
            concentrationScore: parseFloat(i.concentration_score) || Math.random(),
            signal: this.determineSignal(i),
            confidence: parseFloat(i.confidence) || 0.5,
          }))
        : [];

      console.log("[Polymarket] Mapped insights count:", mapped.length);
      
      if (mapped.length === 0) {
        return getMockInsights(limit);
      }
      
      return mapped;
    } catch (error: any) {
      console.error("[Polymarket] Error fetching insights:", error.message);
      return getMockInsights(limit);
    }
  }

  /**
   * جلب Social Signals
   */
  async getSocialSignals(limit: number = 20): Promise<SocialSignal[]> {
    try {
      console.log("[Polymarket] Fetching social signals with limit:", limit);

      const response = await axios.get(
        `https://polymarketanalytics.com/api/social`,
        {
          params: {
            limit,
            sort_by: "momentum",
            order: "desc",
          },
          headers: this.getHeaders(),
          timeout: 10000,
        }
      );

      console.log("[Polymarket] Social signals count:", response.data?.signals?.length || response.data?.length || 0);

      const signals = response.data?.signals || response.data || [];

      const mapped = Array.isArray(signals)
        ? signals.map((s: any) => ({
            id: s.id || s.token_id || `signal_${Math.random()}`,
            ticker: s.ticker || s.slug || "UNKNOWN",
            title: s.title || "Unknown",
            sentiment: parseFloat(s.sentiment) || 0,
            momentum: parseFloat(s.momentum) || 50,
            volume: parseFloat(s.volume) || 0,
            timestamp: s.timestamp || new Date().toISOString(),
          }))
        : [];

      console.log("[Polymarket] Mapped social signals count:", mapped.length);
      
      if (mapped.length === 0) {
        return getMockSocialSignals(limit);
      }
      
      return mapped;
    } catch (error: any) {
      console.error("[Polymarket] Error fetching social signals:", error.message);
      return getMockSocialSignals(limit);
    }
  }

  /**
   * جلب Falcon Scores (المتداولون الأقويون)
   */
  async getFalconScores(limit: number = 20): Promise<any[]> {
    try {
      console.log("[Polymarket] Fetching Falcon scores with limit:", limit);

      const response = await axios.get(
        `https://polymarketanalytics.com/api/falcon`,
        {
          params: {
            limit,
            sort_by: "score",
            order: "desc",
          },
          headers: this.getHeaders(),
          timeout: 10000,
        }
      );

      console.log("[Polymarket] Falcon scores count:", response.data?.scores?.length || response.data?.length || 0);

      const scores = response.data?.scores || response.data || [];

      const mapped = Array.isArray(scores)
        ? scores.map((s: any) => ({
            id: s.id || `falcon_${Math.random()}`,
            ticker: s.ticker || "UNKNOWN",
            score: parseFloat(s.score) || 0.5,
            confidence: parseFloat(s.confidence) || 0.5,
            timestamp: s.timestamp || new Date().toISOString(),
          }))
        : [];

      console.log("[Polymarket] Mapped Falcon scores count:", mapped.length);
      return mapped;
    } catch (error: any) {
      console.error("[Polymarket] Error fetching Falcon scores:", error.message);
      // Return mock Falcon scores
      return Array.from({ length: Math.min(limit, 5) }, (_, i) => ({
        id: `falcon_${i}`,
        ticker: `MARKET${i}`,
        score: 0.5 + Math.random() * 0.5,
        confidence: 0.6 + Math.random() * 0.4,
        timestamp: new Date().toISOString(),
      }));
    }
  }

  /**
   * تحديد الإشارة بناءً على البيانات
   */
  private determineSignal(data: any): "BUY" | "SELL" | "NEUTRAL" {
    const trend = parseFloat(data.trend_score) || 0;
    const liquidity = parseFloat(data.liquidity_score) || 0;
    const combined = (trend + liquidity) / 2;

    if (combined > 0.6) return "BUY";
    if (combined < 0.4) return "SELL";
    return "NEUTRAL";
  }

  /**
   * Get mock markets for development
   */
  private getMockMarkets(limit: number): PolymarketMarket[] {
    return getMockMarkets(limit);
  }

  /**
   * Get mock insights for development
   */
  private getMockInsights(limit: number): MarketInsight[] {
    return getMockInsights(limit);
  }

  /**
   * Get mock social signals for development
   */
  private getMockSocialSignals(limit: number): SocialSignal[] {
    return getMockSocialSignals(limit);
  }
}

// Export singleton instance
export const polymarketClient = new PolymarketClient();
