/**
 * Mock Data for Development & Testing
 * Used when RapidAPI is unavailable or for demo purposes
 */

import type { CrenePrediction, CreneSignal } from "./creneClient";
import type { Tweet } from "./twitterClient";

export const MOCK_PREDICTIONS: CrenePrediction[] = [
  {
    id: "btc-1",
    ticker: "BTC",
    title: "Will Bitcoin reach $50,000 by March 31?",
    description: "Bitcoin price prediction for end of Q1 2026",
    currentPrice: 0.65,
    market: "kalshi",
    domain: "crypto",
    createdAt: new Date().toISOString(),
    expiresAt: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString(),
    predictions: {
      gpt4o: 0.68,
      claude: 0.65,
      gemini: 0.70,
      grok: 0.62,
      consensus: 0.66,
    },
    volume24h: 150000,
    liquidity: 0.92,
  },
  {
    id: "eth-1",
    ticker: "ETH",
    title: "Will Ethereum reach $3,000 by March 31?",
    description: "Ethereum price prediction for end of Q1 2026",
    currentPrice: 0.58,
    market: "kalshi",
    domain: "crypto",
    createdAt: new Date().toISOString(),
    expiresAt: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString(),
    predictions: {
      gpt4o: 0.60,
      claude: 0.55,
      gemini: 0.62,
      grok: 0.58,
      consensus: 0.59,
    },
    volume24h: 120000,
    liquidity: 0.88,
  },
  {
    id: "sp500-1",
    ticker: "SP500",
    title: "Will S&P 500 reach 5,500 by March 31?",
    description: "S&P 500 index prediction for end of Q1 2026",
    currentPrice: 0.72,
    market: "kalshi",
    domain: "stocks",
    createdAt: new Date().toISOString(),
    expiresAt: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString(),
    predictions: {
      gpt4o: 0.75,
      claude: 0.70,
      gemini: 0.73,
      grok: 0.72,
      consensus: 0.73,
    },
    volume24h: 200000,
    liquidity: 0.95,
  },
  {
    id: "oil-1",
    ticker: "OIL",
    title: "Will crude oil stay above $80/barrel?",
    description: "Oil price prediction for March 2026",
    currentPrice: 0.55,
    market: "kalshi",
    domain: "commodities",
    createdAt: new Date().toISOString(),
    expiresAt: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString(),
    predictions: {
      gpt4o: 0.52,
      claude: 0.58,
      gemini: 0.54,
      grok: 0.56,
      consensus: 0.55,
    },
    volume24h: 80000,
    liquidity: 0.85,
  },
  {
    id: "gold-1",
    ticker: "GOLD",
    title: "Will gold reach $2,500/oz by March 31?",
    description: "Gold price prediction for end of Q1 2026",
    currentPrice: 0.68,
    market: "kalshi",
    domain: "commodities",
    createdAt: new Date().toISOString(),
    expiresAt: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString(),
    predictions: {
      gpt4o: 0.70,
      claude: 0.65,
      gemini: 0.72,
      grok: 0.68,
      consensus: 0.69,
    },
    volume24h: 95000,
    liquidity: 0.90,
  },
];

export const MOCK_SIGNALS: CreneSignal[] = [
  {
    id: "signal-1",
    ticker: "BTC",
    title: "Bitcoin Strong Buy Signal",
    aiPrediction: 0.68,
    marketPrice: 0.65,
    divergence: 0.03,
    confidence: 0.85,
    signal: "buy",
    reasoning: "AI models consensus is 3% higher than market price. Strong bullish sentiment detected.",
  },
  {
    id: "signal-2",
    ticker: "ETH",
    title: "Ethereum Neutral Signal",
    aiPrediction: 0.59,
    marketPrice: 0.58,
    divergence: 0.01,
    confidence: 0.62,
    signal: "hold",
    reasoning: "AI prediction slightly above market. Moderate confidence. Wait for stronger signals.",
  },
  {
    id: "signal-3",
    ticker: "SP500",
    title: "S&P 500 Moderate Buy",
    aiPrediction: 0.73,
    marketPrice: 0.72,
    divergence: 0.01,
    confidence: 0.78,
    signal: "buy",
    reasoning: "Consistent AI consensus above market price. Positive economic indicators detected.",
  },
];

export const MOCK_TWEETS: Tweet[] = [
  {
    id: "tweet-1",
    text: "Bitcoin showing strong recovery signals. Technical analysis suggests bullish momentum building.",
    author: "CryptoAnalyst",
    createdAt: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
    likes: 1250,
    retweets: 450,
    sentiment: "positive",
    relevanceScore: 0.92,
  },
  {
    id: "tweet-2",
    text: "S&P 500 breaks through resistance level. Investors optimistic about Q1 earnings.",
    author: "MarketWatch",
    createdAt: new Date(Date.now() - 45 * 60 * 1000).toISOString(),
    likes: 2100,
    retweets: 890,
    sentiment: "positive",
    relevanceScore: 0.88,
  },
  {
    id: "tweet-3",
    text: "Ethereum facing headwinds. Regulatory concerns weighing on sentiment.",
    author: "BlockchainNews",
    createdAt: new Date(Date.now() - 60 * 60 * 1000).toISOString(),
    likes: 850,
    retweets: 320,
    sentiment: "negative",
    relevanceScore: 0.85,
  },
  {
    id: "tweet-4",
    text: "Gold prices stable as investors seek safe haven assets amid geopolitical tensions.",
    author: "CommoditiesTrader",
    createdAt: new Date(Date.now() - 90 * 60 * 1000).toISOString(),
    likes: 650,
    retweets: 240,
    sentiment: "neutral",
    relevanceScore: 0.80,
  },
  {
    id: "tweet-5",
    text: "Oil market rallying on supply concerns. OPEC+ meeting outcomes key for next move.",
    author: "EnergyAnalyst",
    createdAt: new Date(Date.now() - 120 * 60 * 1000).toISOString(),
    likes: 920,
    retweets: 380,
    sentiment: "positive",
    relevanceScore: 0.83,
  },
];

export const MOCK_TRENDS = [
  "#Bitcoin",
  "#Ethereum",
  "#StockMarket",
  "#CryptoNews",
  "#FederalReserve",
  "#EarningsReport",
  "#TechStocks",
  "#CommodityPrices",
  "#MarketAnalysis",
  "#TradingSignals",
];

export function getMockPredictions(limit: number = 50): CrenePrediction[] {
  return MOCK_PREDICTIONS.slice(0, Math.min(limit, MOCK_PREDICTIONS.length));
}

export function getMockSignals(limit: number = 20): CreneSignal[] {
  return MOCK_SIGNALS.slice(0, Math.min(limit, MOCK_SIGNALS.length));
}

export function getMockTweets(query: string, limit: number = 20): Tweet[] {
  // Filter tweets by query relevance
  const filtered = MOCK_TWEETS.filter(
    (tweet) =>
      tweet.text.toLowerCase().includes(query.toLowerCase()) ||
      tweet.author.toLowerCase().includes(query.toLowerCase())
  );
  return filtered.slice(0, Math.min(limit, filtered.length));
}

export function getMockTrends(): string[] {
  return MOCK_TRENDS;
}
