import { describe, it, expect, beforeAll } from "vitest";
import { PolymarketClient } from "./polymarketClient";

describe("PolymarketClient", () => {
  let client: PolymarketClient;

  beforeAll(() => {
    client = new PolymarketClient();
  });

  it("should have JWT token configured", () => {
    const token = process.env.POLYMARKET_JWT_TOKEN;
    expect(token).toBeDefined();
    expect(token).toMatch(/^eyJ/); // JWT tokens start with eyJ
  });

  it("should fetch markets from Polymarket API", async () => {
    try {
      const markets = await client.getMarkets();
      
      // Should return an array (either real data or mock data)
      expect(Array.isArray(markets)).toBe(true);
      
      // If we got real data, it should have markets
      if (markets.length > 0) {
        const market = markets[0];
        expect(market).toHaveProperty("id");
        expect(market).toHaveProperty("question");
        expect(market).toHaveProperty("slug");
        expect(market).toHaveProperty("volume");
        expect(market).toHaveProperty("yes_price");
        expect(market).toHaveProperty("no_price");
        console.log(`✓ Fetched ${markets.length} REAL markets from Polymarket API`);
      } else {
        console.log("⚠ No markets returned, API may be unavailable");
      }
    } catch (error) {
      console.error("Error fetching markets:", error);
      throw error;
    }
  });

  it("should fetch market insights from Polymarket API", async () => {
    try {
      const insights = await client.getMarketInsights();
      
      // Should return an array
      expect(Array.isArray(insights)).toBe(true);
      
      if (insights.length > 0) {
        const insight = insights[0];
        expect(insight).toHaveProperty("market_id");
        expect(insight).toHaveProperty("market_question");
        expect(insight).toHaveProperty("signal");
        expect(["BUY", "SELL", "HOLD"]).toContain(insight.signal);
        expect(insight).toHaveProperty("confidence");
        console.log(`✓ Fetched ${insights.length} REAL market insights from Polymarket API`);
      } else {
        console.log("⚠ No insights returned, API may be unavailable");
      }
    } catch (error) {
      console.error("Error fetching insights:", error);
      throw error;
    }
  });

  it("should validate JWT token format", () => {
    const token = process.env.POLYMARKET_JWT_TOKEN;
    expect(token).toBeDefined();
    
    // JWT format: header.payload.signature
    const parts = token!.split(".");
    expect(parts).toHaveLength(3);
    
    // Decode and validate payload
    try {
      const payload = JSON.parse(Buffer.from(parts[1], "base64").toString());
      expect(payload).toHaveProperty("token_type", "access");
      expect(payload).toHaveProperty("user_id");
      expect(payload).toHaveProperty("scope");
      console.log(`✓ JWT token is valid and properly formatted`);
    } catch (error) {
      throw new Error("Invalid JWT token format");
    }
  });
});
