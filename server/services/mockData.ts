import type { PolymarketMarket, MarketInsight, SocialSignal } from "./polymarketClient";

export function getMockMarkets(limit: number): PolymarketMarket[] {
  const markets: PolymarketMarket[] = [
    {
      id: "market_btc_2025",
      ticker: "BTC",
      title: "Will Bitcoin reach $100,000 by end of 2025?",
      description: "Prediction market for Bitcoin price",
      currentPrice: 0.65,
      volume24h: 1500000,
      liquidity: 850000,
      createdAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
      expiresAt: new Date(Date.now() + 280 * 24 * 60 * 60 * 1000).toISOString(),
      category: "crypto",
      market: "polymarket",
    },
    {
      id: "market_eth_2025",
      ticker: "ETH",
      title: "Will Ethereum reach $5,000 by end of 2025?",
      description: "Prediction market for Ethereum price",
      currentPrice: 0.58,
      volume24h: 980000,
      liquidity: 620000,
      createdAt: new Date(Date.now() - 25 * 24 * 60 * 60 * 1000).toISOString(),
      expiresAt: new Date(Date.now() + 280 * 24 * 60 * 60 * 1000).toISOString(),
      category: "crypto",
      market: "polymarket",
    },
    {
      id: "market_sp500_2025",
      ticker: "SP500",
      title: "Will S&P 500 reach 6,500 by end of 2025?",
      description: "Prediction market for S&P 500 index",
      currentPrice: 0.72,
      volume24h: 2100000,
      liquidity: 1200000,
      createdAt: new Date(Date.now() - 20 * 24 * 60 * 60 * 1000).toISOString(),
      expiresAt: new Date(Date.now() + 280 * 24 * 60 * 60 * 1000).toISOString(),
      category: "stocks",
      market: "polymarket",
    },
    {
      id: "market_gold_2025",
      ticker: "GOLD",
      title: "Will Gold reach $2,500 per ounce by end of 2025?",
      description: "Prediction market for gold prices",
      currentPrice: 0.55,
      volume24h: 750000,
      liquidity: 420000,
      createdAt: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000).toISOString(),
      expiresAt: new Date(Date.now() + 280 * 24 * 60 * 60 * 1000).toISOString(),
      category: "commodities",
      market: "polymarket",
    },
    {
      id: "market_usd_2025",
      ticker: "USD",
      title: "Will USD strengthen against EUR by 10% in 2025?",
      description: "Prediction market for USD/EUR exchange rate",
      currentPrice: 0.48,
      volume24h: 580000,
      liquidity: 310000,
      createdAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(),
      expiresAt: new Date(Date.now() + 280 * 24 * 60 * 60 * 1000).toISOString(),
      category: "forex",
      market: "polymarket",
    },
  ];

  return markets.slice(0, limit);
}

export function getMockInsights(limit: number): MarketInsight[] {
  const insights: MarketInsight[] = [
    {
      id: "insight_btc",
      ticker: "BTC",
      title: "Bitcoin Strong Buy Signal",
      liquidityScore: 0.85,
      trendScore: 0.78,
      concentrationScore: 0.62,
      signal: "BUY",
      confidence: 0.82,
    },
    {
      id: "insight_eth",
      ticker: "ETH",
      title: "Ethereum Neutral Signal",
      liquidityScore: 0.72,
      trendScore: 0.55,
      concentrationScore: 0.48,
      signal: "NEUTRAL",
      confidence: 0.68,
    },
    {
      id: "insight_sp500",
      ticker: "SP500",
      title: "S&P 500 Strong Buy Signal",
      liquidityScore: 0.88,
      trendScore: 0.81,
      concentrationScore: 0.75,
      signal: "BUY",
      confidence: 0.85,
    },
    {
      id: "insight_gold",
      ticker: "GOLD",
      title: "Gold Sell Signal",
      liquidityScore: 0.65,
      trendScore: 0.42,
      concentrationScore: 0.38,
      signal: "SELL",
      confidence: 0.71,
    },
    {
      id: "insight_usd",
      ticker: "USD",
      title: "USD Weak Sell Signal",
      liquidityScore: 0.58,
      trendScore: 0.35,
      concentrationScore: 0.32,
      signal: "SELL",
      confidence: 0.64,
    },
  ];

  return insights.slice(0, limit);
}

export function getMockSocialSignals(limit: number): SocialSignal[] {
  const signals: SocialSignal[] = [
    {
      id: "signal_btc",
      ticker: "BTC",
      title: "Bitcoin trending on Twitter",
      sentiment: 0.72,
      momentum: 85,
      volume: 45000,
      timestamp: new Date(Date.now() - 5 * 60 * 1000).toISOString(),
    },
    {
      id: "signal_eth",
      ticker: "ETH",
      title: "Ethereum mixed sentiment",
      sentiment: 0.15,
      momentum: 52,
      volume: 28000,
      timestamp: new Date(Date.now() - 10 * 60 * 1000).toISOString(),
    },
    {
      id: "signal_sp500",
      ticker: "SP500",
      title: "S&P 500 positive outlook",
      sentiment: 0.68,
      volume: 35000,
      momentum: 78,
      timestamp: new Date(Date.now() - 3 * 60 * 1000).toISOString(),
    },
    {
      id: "signal_gold",
      ticker: "GOLD",
      title: "Gold negative sentiment",
      sentiment: -0.45,
      momentum: 38,
      volume: 12000,
      timestamp: new Date(Date.now() - 15 * 60 * 1000).toISOString(),
    },
    {
      id: "signal_usd",
      ticker: "USD",
      title: "USD weakness discussed",
      sentiment: -0.32,
      momentum: 42,
      volume: 18000,
      timestamp: new Date(Date.now() - 8 * 60 * 1000).toISOString(),
    },
  ];

  return signals.slice(0, limit);
}

export function getMockTweets() {
  return [
    {
      id: "tweet_1",
      author: "CryptoAnalyst",
      text: "Bitcoin showing strong bullish signals. Could break $100k soon! 🚀 #BTC",
      sentiment: 0.85,
      timestamp: new Date(Date.now() - 2 * 60 * 1000).toISOString(),
      likes: 5420,
      retweets: 1850,
    },
    {
      id: "tweet_2",
      author: "MarketWatch",
      text: "S&P 500 reaches new highs amid positive economic data",
      sentiment: 0.72,
      timestamp: new Date(Date.now() - 5 * 60 * 1000).toISOString(),
      likes: 3200,
      retweets: 1100,
    },
    {
      id: "tweet_3",
      author: "GoldTrader",
      text: "Gold selling pressure continues as USD strengthens",
      sentiment: -0.55,
      timestamp: new Date(Date.now() - 8 * 60 * 1000).toISOString(),
      likes: 1850,
      retweets: 620,
    },
  ];
}

export function getMockTrends() {
  return [
    { name: "#Bitcoin", volume: 125000, sentiment: 0.75 },
    { name: "#Crypto", volume: 98000, sentiment: 0.68 },
    { name: "#StockMarket", volume: 87000, sentiment: 0.65 },
    { name: "#Ethereum", volume: 76000, sentiment: 0.52 },
    { name: "#Trading", volume: 65000, sentiment: 0.58 },
  ];
}
