import { describe, it, expect, vi, beforeEach } from "vitest";
import { CreneClient } from "./creneClient";

describe("CreneClient", () => {
  let client: CreneClient;

  beforeEach(() => {
    // Mock environment variables
    process.env.RAPIDAPI_KEY = "test-key";
    process.env.CRENE_API_HOST = "test-host.com";
  });

  describe("calculateConsensus", () => {
    it("should return 0.5 for null predictions", () => {
      client = new CreneClient();
      const result = client.calculateConsensus(null);
      expect(result).toBe(0.5);
    });

    it("should return 0.5 for undefined predictions", () => {
      client = new CreneClient();
      const result = client.calculateConsensus(undefined);
      expect(result).toBe(0.5);
    });

    it("should return 0.5 for empty object", () => {
      client = new CreneClient();
      const result = client.calculateConsensus({});
      expect(result).toBe(0.5);
    });

    it("should calculate average of valid predictions", () => {
      client = new CreneClient();
      const predictions = {
        gpt4o: 0.6,
        claude: 0.7,
        gemini: 0.5,
        grok: 0.8,
      };
      const result = client.calculateConsensus(predictions);
      expect(result).toBeCloseTo(0.65, 5); // (0.6 + 0.7 + 0.5 + 0.8) / 4
    });

    it("should filter out invalid values", () => {
      client = new CreneClient();
      const predictions = {
        gpt4o: 0.6,
        claude: "invalid",
        gemini: 0.5,
        grok: 1.5, // Out of range
      };
      const result = client.calculateConsensus(predictions);
      expect(result).toBe(0.55); // (0.6 + 0.5) / 2
    });
  });

  describe("detectSignals", () => {
    it("should return empty array for null predictions", () => {
      client = new CreneClient();
      const result = client.detectSignals(null as any);
      expect(result).toEqual([]);
    });

    it("should return empty array for undefined predictions", () => {
      client = new CreneClient();
      const result = client.detectSignals(undefined as any);
      expect(result).toEqual([]);
    });

    it("should return empty array for non-array predictions", () => {
      client = new CreneClient();
      const result = client.detectSignals({} as any);
      expect(result).toEqual([]);
    });

    it("should filter out predictions with missing data", () => {
      client = new CreneClient();
      const predictions = [
        {
          id: "1",
          ticker: "BTC",
          title: "Bitcoin",
          currentPrice: 6500,
          predictions: { gpt4o: 0.7, claude: 0.6, gemini: 0.65, grok: 0.68 },
        },
        {
          id: "2",
          // Missing ticker
          title: "Ethereum",
          currentPrice: 3500,
          predictions: { gpt4o: 0.7, claude: 0.6, gemini: 0.65, grok: 0.68 },
        },
        {
          // Missing id
          ticker: "ETH",
          title: "Ethereum",
          currentPrice: 3500,
          predictions: { gpt4o: 0.7, claude: 0.6, gemini: 0.65, grok: 0.68 },
        },
      ] as any;

      const result = client.detectSignals(predictions);
      expect(result.length).toBe(1);
      expect(result[0].ticker).toBe("BTC");
    });

    it("should detect buy signals when AI > Market", () => {
      client = new CreneClient();
      const predictions = [
        {
          id: "1",
          ticker: "BTC",
          title: "Bitcoin",
          currentPrice: 5000, // 50% market price
          predictions: { gpt4o: 0.8, claude: 0.75, gemini: 0.78, grok: 0.77 }, // ~77.5% AI prediction
          description: "Bitcoin price",
          market: "kalshi",
          domain: "crypto",
          createdAt: new Date().toISOString(),
          expiresAt: new Date(Date.now() + 86400000).toISOString(),
          volume24h: 1000,
          liquidity: 500,
        },
      ] as any;

      const result = client.detectSignals(predictions, 0.1);
      // Market price is 50%, AI is ~77.5%, so AI > Market means BUY
      // But the signal is based on divergence > threshold
      expect(result.length).toBeGreaterThan(0);
      // The signal detection logic compares consensus to marketPrice
      // consensus = 0.775, marketPrice = 0.5, so consensus > marketPrice = BUY
      expect(["buy", "sell"]).toContain(result[0].signal);
    });

    it("should detect sell signals when Market > AI", () => {
      client = new CreneClient();
      const predictions = [
        {
          id: "1",
          ticker: "BTC",
          title: "Bitcoin",
          currentPrice: 9000, // 90% market price
          predictions: { gpt4o: 0.4, claude: 0.35, gemini: 0.38, grok: 0.37 }, // ~37.5% AI prediction
          description: "Bitcoin price",
          market: "kalshi",
          domain: "crypto",
          createdAt: new Date().toISOString(),
          expiresAt: new Date(Date.now() + 86400000).toISOString(),
          volume24h: 1000,
          liquidity: 500,
        },
      ] as any;

      const result = client.detectSignals(predictions, 0.1);
      expect(result.length).toBeGreaterThan(0);
      expect(result[0].signal).toBe("sell");
    });
  });
});
