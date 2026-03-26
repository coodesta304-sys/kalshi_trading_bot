import axios from "axios";

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
  private baseUrl = "https://api.polymarketanalytics.com";
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
   * جلب الأسواق من Polymarket (agent_id: 574)
   */
  async getMarkets(limit: number = 50): Promise<PolymarketMarket[]> {
    try {
      console.log("[Polymarket] Fetching markets with limit:", limit);

      const response = await axios.post(
        `${this.baseUrl}/api/query`,
        {
          agent_id: 574,
          params: {
            limit,
            sort_by: "volume",
            order: "desc",
          },
        },
        {
          headers: this.getHeaders(),
          timeout: 10000,
        }
      );

      console.log("[Polymarket] Response status:", response.status);
      console.log("[Polymarket] Markets count:", response.data?.data?.length || 0);

      const markets = response.data?.data || [];

      // Map Polymarket response to our format
      const mapped = Array.isArray(markets)
        ? markets.map((m: any) => ({
            id: m.id || m.token_id,
            ticker: m.ticker || m.slug || "UNKNOWN",
            title: m.title || m.question || "Unknown",
            description: m.description || "",
            currentPrice: m.price || m.current_price || 0.5,
            volume24h: m.volume_24h || m.volume || 0,
            liquidity: m.liquidity || 0.5,
            createdAt: m.created_at || new Date().toISOString(),
            expiresAt: m.expires_at || new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
            category: m.category || "general",
            market: m.market || "polymarket",
          }))
        : [];

      console.log("[Polymarket] Mapped markets count:", mapped.length);
      return mapped;
    } catch (error: any) {
      console.error("[Polymarket] Error fetching markets:");
      console.error("  Status:", error.response?.status);
      console.error("  Message:", error.message);
      console.error("  Using mock data for development...");

      // Return mock data for development
      return this.getMockMarkets(limit);
    }
  }

  /**
   * جلب Market Insights (agent_id: 575)
   */
  async getMarketInsights(limit: number = 20): Promise<MarketInsight[]> {
    try {
      console.log("[Polymarket] Fetching market insights with limit:", limit);

      const response = await axios.post(
        `${this.baseUrl}/api/query`,
        {
          agent_id: 575,
          params: {
            limit,
            sort_by: "liquidity",
            order: "desc",
          },
        },
        {
          headers: this.getHeaders(),
          timeout: 10000,
        }
      );

      console.log("[Polymarket] Insights count:", response.data?.data?.length || 0);

      const insights = response.data?.data || [];

      const mapped = Array.isArray(insights)
        ? insights.map((i: any) => ({
            id: i.id || i.token_id,
            ticker: i.ticker || i.slug || "UNKNOWN",
            title: i.title || "Unknown",
            liquidityScore: i.liquidity_score || Math.random(),
            trendScore: i.trend_score || Math.random(),
            concentrationScore: i.concentration_score || Math.random(),
            signal: this.determineSignal(i),
            confidence: i.confidence || 0.5,
          }))
        : [];

      console.log("[Polymarket] Mapped insights count:", mapped.length);
      return mapped;
    } catch (error: any) {
      console.error("[Polymarket] Error fetching insights:", error.message);
      return this.getMockInsights(limit);
    }
  }

  /**
   * جلب Social Signals (agent_id: 585)
   */
  async getSocialSignals(limit: number = 20): Promise<SocialSignal[]> {
    try {
      console.log("[Polymarket] Fetching social signals with limit:", limit);

      const response = await axios.post(
        `${this.baseUrl}/api/query`,
        {
          agent_id: 585,
          params: {
            limit,
            sort_by: "momentum",
            order: "desc",
          },
        },
        {
          headers: this.getHeaders(),
          timeout: 10000,
        }
      );

      console.log("[Polymarket] Social signals count:", response.data?.data?.length || 0);

      const signals = response.data?.data || [];

      const mapped = Array.isArray(signals)
        ? signals.map((s: any) => ({
            id: s.id || s.token_id,
            ticker: s.ticker || s.slug || "UNKNOWN",
            title: s.title || "Unknown",
            sentiment: s.sentiment || 0,
            momentum: s.momentum || 50,
            volume: s.volume || 0,
            timestamp: s.timestamp || new Date().toISOString(),
          }))
        : [];

      console.log("[Polymarket] Mapped social signals count:", mapped.length);
      return mapped;
    } catch (error: any) {
      console.error("[Polymarket] Error fetching social signals:", error.message);
      return this.getMockSocialSignals(limit);
    }
  }

  /**
   * تحديد الإشارة بناءً على الدرجات
   */
  private determineSignal(insight: any): "BUY" | "SELL" | "NEUTRAL" {
    const liquidity = insight.liquidity_score || 0.5;
    const trend = insight.trend_score || 0.5;
    const concentration = insight.concentration_score || 0.5;

    const score = (liquidity + trend - concentration) / 3;

    if (score > 0.6) return "BUY";
    if (score < 0.4) return "SELL";
    return "NEUTRAL";
  }

  /**
   * بيانات وهمية للتطوير
   */
  private getMockMarkets(limit: number): PolymarketMarket[] {
    const categories = ["crypto", "politics", "sports", "weather", "finance"];
    const markets: PolymarketMarket[] = [];

    for (let i = 0; i < Math.min(limit, 10); i++) {
      const category = categories[i % categories.length];
      markets.push({
        id: `poly-${i}`,
        ticker: `${category.toUpperCase()}${i}`,
        title: `Will ${category} market ${i} reach target?`,
        description: `Prediction market for ${category} event ${i}`,
        currentPrice: 0.3 + Math.random() * 0.4,
        volume24h: Math.floor(Math.random() * 100000),
        liquidity: 0.5 + Math.random() * 0.5,
        createdAt: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000).toISOString(),
        expiresAt: new Date(Date.now() + Math.random() * 90 * 24 * 60 * 60 * 1000).toISOString(),
        category,
        market: "polymarket",
      });
    }

    return markets;
  }

  private getMockInsights(limit: number): MarketInsight[] {
    const insights: MarketInsight[] = [];

    for (let i = 0; i < Math.min(limit, 5); i++) {
      const liquidityScore = 0.5 + Math.random() * 0.5;
      const trendScore = 0.5 + Math.random() * 0.5;
      const concentrationScore = Math.random() * 0.5;

      insights.push({
        id: `insight-${i}`,
        ticker: `MARKET${i}`,
        title: `Market ${i} Insight`,
        liquidityScore,
        trendScore,
        concentrationScore,
        signal: liquidityScore + trendScore > 1.2 ? "BUY" : liquidityScore + trendScore < 0.8 ? "SELL" : "NEUTRAL",
        confidence: 0.5 + Math.random() * 0.5,
      });
    }

    return insights;
  }

  private getMockSocialSignals(limit: number): SocialSignal[] {
    const signals: SocialSignal[] = [];

    for (let i = 0; i < Math.min(limit, 5); i++) {
      signals.push({
        id: `signal-${i}`,
        ticker: `SOCIAL${i}`,
        title: `Social Signal ${i}`,
        sentiment: -1 + Math.random() * 2,
        momentum: Math.random() * 100,
        volume: Math.floor(Math.random() * 10000),
        timestamp: new Date(Date.now() - Math.random() * 60 * 60 * 1000).toISOString(),
      });
    }

    return signals;
  }
}
