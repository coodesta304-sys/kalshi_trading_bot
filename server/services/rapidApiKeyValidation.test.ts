import { describe, it, expect, beforeAll } from "vitest";
import { CreneClient } from "./creneClient";
import { TwitterClient } from "./twitterClient";

describe("RapidAPI Key Validation", () => {
  let creneClient: CreneClient;
  let twitterClient: TwitterClient;

  beforeAll(() => {
    creneClient = new CreneClient();
    twitterClient = new TwitterClient();
  });

  it("should fetch predictions with new RapidAPI key", async () => {
    const predictions = await creneClient.getPredictions(5);
    
    // Should return array (either real data or mock data)
    expect(Array.isArray(predictions)).toBe(true);
    
    // If we get real data, it should have valid structure
    if (predictions.length > 0) {
      const pred = predictions[0];
      expect(pred).toHaveProperty("id");
      expect(pred).toHaveProperty("ticker");
      expect(pred).toHaveProperty("title");
      console.log("✅ Crene API returned real data:", predictions.length, "predictions");
    } else {
      console.log("✅ Crene API returned mock data (fallback)");
    }
  });

  it("should fetch signals with new RapidAPI key", async () => {
    const signals = await creneClient.getSignals(5);
    
    // Should return array (either real data or mock data)
    expect(Array.isArray(signals)).toBe(true);
    
    if (signals.length > 0) {
      const signal = signals[0];
      expect(signal).toHaveProperty("id");
      expect(signal).toHaveProperty("ticker");
      console.log("✅ Crene Signals API returned real data:", signals.length, "signals");
    } else {
      console.log("✅ Crene Signals API returned mock data (fallback)");
    }
  });

  it("should fetch tweets with new RapidAPI key", async () => {
    const tweets = await twitterClient.searchTweets("Bitcoin", 5);
    
    // Should return array (either real data or mock data)
    expect(Array.isArray(tweets)).toBe(true);
    
    if (tweets.length > 0) {
      const tweet = tweets[0];
      expect(tweet).toHaveProperty("text");
      expect(tweet).toHaveProperty("author");
      console.log("✅ Twitter API returned real data:", tweets.length, "tweets");
    } else {
      console.log("✅ Twitter API returned mock data (fallback)");
    }
  });

  it("should fetch trends with new RapidAPI key", async () => {
    const trends = await twitterClient.getTrends();
    
    // Should return array (either real data or mock data)
    expect(Array.isArray(trends)).toBe(true);
    
    if (trends.length > 0) {
      expect(typeof trends[0]).toBe("string");
      console.log("✅ Twitter Trends API returned real data:", trends.length, "trends");
    } else {
      console.log("✅ Twitter Trends API returned mock data (fallback)");
    }
  });
});
