/**
 * Twitter API Client
 * Fetches tweets and performs sentiment analysis for market-related content
 */

import axios from "axios";

export interface Tweet {
  id: string;
  text: string;
  author: string;
  createdAt: string;
  likes: number;
  retweets: number;
  sentiment: "positive" | "negative" | "neutral";
  relevanceScore: number;
}

export class TwitterClient {
  private apiKey: string;
  private apiHost: string;
  private baseUrl: string;

  constructor() {
    this.apiKey = process.env.RAPIDAPI_KEY || "";
    this.apiHost = process.env.TWITTER_API_HOST || "twitter-api45.p.rapidapi.com";
    this.baseUrl = `https://${this.apiHost}`;

    if (!this.apiKey) {
      throw new Error("RAPIDAPI_KEY environment variable is not set");
    }
  }

  /**
   * Search for tweets related to a market or topic
   */
  async searchTweets(query: string, limit: number = 20): Promise<Tweet[]> {
    try {
      console.log("[Twitter] Searching tweets for:", query);
      const response = await axios.get(`${this.baseUrl}/search`, {
        headers: {
          "x-rapidapi-key": this.apiKey,
          "x-rapidapi-host": this.apiHost,
        },
        params: {
          query,
          count: limit,
          type: "Latest",
        },
        timeout: 10000,
      });

      console.log("[Twitter] Response status:", response.status);
      const tweets = response.data || [];
      console.log("[Twitter] Tweets found:", Array.isArray(tweets) ? tweets.length : 0);
      return Array.isArray(tweets) ? tweets.map((tweet: any) => this.parseTweet(tweet)) : [];
    } catch (error: any) {
      console.error("[Twitter] Error searching tweets:");
      console.error("  Status:", error.response?.status);
      console.error("  Message:", error.message);
      console.error("  Using mock data for development...");
      // Fallback to mock data for development
      const { getMockTweets } = await import("./mockData");
      return getMockTweets(query, limit);
    }
  }

  /**
   * Get trending topics
   */
  async getTrends(): Promise<string[]> {
    try {
      console.log("[Twitter] Fetching trends");
      const response = await axios.get(`${this.baseUrl}/trends`, {
        headers: {
          "x-rapidapi-key": this.apiKey,
          "x-rapidapi-host": this.apiHost,
        },
        timeout: 10000,
      });

      const trends = response.data?.trends || [];
      console.log("[Twitter] Trends count:", Array.isArray(trends) ? trends.length : 0);
      return Array.isArray(trends) ? trends : [];
    } catch (error: any) {
      console.error("[Twitter] Error fetching trends:");
      console.error("  Status:", error.response?.status);
      console.error("  Message:", error.message);
      console.error("  Using mock data for development...");
      // Fallback to mock data for development
      const { getMockTrends } = await import("./mockData");
      return getMockTrends();
    }
  }

  /**
   * Parse tweet and extract sentiment
   */
  private parseTweet(tweet: any): Tweet {
    const text = tweet.text || tweet.full_text || "";
    const sentiment = this.analyzeSentiment(text);
    const relevanceScore = this.calculateRelevance(text);

    return {
      id: tweet.id_str || tweet.id || "",
      text,
      author: tweet.user?.screen_name || tweet.author || "unknown",
      createdAt: tweet.created_at || new Date().toISOString(),
      likes: tweet.favorite_count || 0,
      retweets: tweet.retweet_count || 0,
      sentiment,
      relevanceScore,
    };
  }

  /**
   * Simple sentiment analysis based on keywords
   */
  private analyzeSentiment(text: string): "positive" | "negative" | "neutral" {
    const lowerText = text.toLowerCase();

    const positiveKeywords = [
      "bullish",
      "moon",
      "pump",
      "buy",
      "surge",
      "rally",
      "gains",
      "profit",
      "win",
      "great",
      "excellent",
      "amazing",
      "up",
      "rising",
    ];
    const negativeKeywords = [
      "bearish",
      "dump",
      "crash",
      "sell",
      "plunge",
      "loss",
      "fail",
      "bad",
      "terrible",
      "down",
      "falling",
      "risk",
      "warning",
    ];

    let positiveCount = 0;
    let negativeCount = 0;

    positiveKeywords.forEach((keyword) => {
      if (lowerText.includes(keyword)) positiveCount++;
    });

    negativeKeywords.forEach((keyword) => {
      if (lowerText.includes(keyword)) negativeCount++;
    });

    if (positiveCount > negativeCount) return "positive";
    if (negativeCount > positiveCount) return "negative";
    return "neutral";
  }

  /**
   * Calculate relevance score based on engagement and keywords
   */
  private calculateRelevance(text: string): number {
    const marketKeywords = [
      "bitcoin",
      "ethereum",
      "crypto",
      "market",
      "price",
      "trading",
      "kalshi",
      "polymarket",
      "prediction",
      "forecast",
      "bull",
      "bear",
      "stock",
      "fed",
      "interest",
      "inflation",
    ];

    let relevanceScore = 0;
    const lowerText = text.toLowerCase();

    marketKeywords.forEach((keyword) => {
      if (lowerText.includes(keyword)) relevanceScore += 0.1;
    });

    // Cap at 1.0
    return Math.min(relevanceScore, 1.0);
  }

  /**
   * Search for tweets about specific markets
   */
  async searchMarketTweets(marketName: string, limit: number = 20): Promise<Tweet[]> {
    const queries = [
      `${marketName} prediction`,
      `${marketName} price`,
      `${marketName} forecast`,
      `${marketName} trading`,
    ];

    const allTweets: Tweet[] = [];

    for (const query of queries) {
      const tweets = await this.searchTweets(query, Math.ceil(limit / queries.length));
      allTweets.push(...tweets);
    }

    // Remove duplicates and sort by relevance
    const uniqueTweets = Array.from(
      new Map(allTweets.map((t) => [t.id, t])).values()
    );

    return uniqueTweets.sort((a, b) => b.relevanceScore - a.relevanceScore).slice(0, limit);
  }

  /**
   * Aggregate sentiment from multiple tweets
   */
  aggregateSentiment(tweets: Tweet[]): {
    positive: number;
    negative: number;
    neutral: number;
    overall: "positive" | "negative" | "neutral";
    score: number;
  } {
    if (tweets.length === 0) {
      return { positive: 0, negative: 0, neutral: 0, overall: "neutral", score: 0 };
    }

    const counts = {
      positive: 0,
      negative: 0,
      neutral: 0,
    };

    tweets.forEach((tweet) => {
      counts[tweet.sentiment]++;
    });

    const total = tweets.length;
    const score =
      (counts.positive - counts.negative) / total; // Range: -1 to 1

    let overall: "positive" | "negative" | "neutral" = "neutral";
    if (score > 0.1) overall = "positive";
    if (score < -0.1) overall = "negative";

    return {
      positive: Math.round((counts.positive / total) * 100),
      negative: Math.round((counts.negative / total) * 100),
      neutral: Math.round((counts.neutral / total) * 100),
      overall,
      score: Math.round(score * 100) / 100,
    };
  }
}

// Singleton instance
let twitterClient: TwitterClient | null = null;

export function getTwitterClient(): TwitterClient {
  if (!twitterClient) {
    twitterClient = new TwitterClient();
  }
  return twitterClient;
}
