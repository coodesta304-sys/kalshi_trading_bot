/**
 * News Analyzer Service
 * Analyzes news and events using GPT-4o-mini for sentiment analysis
 * and impact assessment on Kalshi markets
 */

import { invokeLLM } from "../_core/llm";
import { nanoid } from "nanoid";

interface NewsItem {
  title: string;
  content: string;
  source: string;
  sourceUrl?: string;
  publishedAt?: Date;
}

interface SentimentAnalysis {
  sentiment: "positive" | "negative" | "neutral";
  score: number; // -100 to 100
  confidence: number; // 0-100
  summary: string;
  impactedMarkets: string[]; // List of market tickers that might be affected
  tradingSignal?: "buy" | "sell" | "hold";
}

interface NewsAnalysisResult {
  id: string;
  title: string;
  sentiment: SentimentAnalysis;
  relatedEvents: string[];
  createdAt: Date;
}

export class NewsAnalyzer {
  /**
   * Analyze a single news item for sentiment and market impact
   */
  async analyzeNews(news: NewsItem): Promise<SentimentAnalysis> {
    const systemPrompt = `You are a financial news analyst specializing in prediction markets and event-driven trading.

Analyze the following news and provide:
1. Overall sentiment (positive/negative/neutral)
2. Sentiment score (-100 to 100)
3. Confidence level (0-100)
4. Brief summary
5. Which Kalshi markets might be affected (list tickers like FEDRATE, INFLATION, WEATHER, etc.)
6. Trading signal (buy/sell/hold) for the affected markets

Respond in JSON format.`;

    const userPrompt = `News Title: ${news.title}

Content: ${news.content}

Source: ${news.source}
Published: ${news.publishedAt || "Unknown"}`;

    try {
      const response = await invokeLLM({
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt },
        ],
        response_format: {
          type: "json_schema",
          json_schema: {
            name: "sentiment_analysis",
            strict: true,
            schema: {
              type: "object",
              properties: {
                sentiment: {
                  type: "string",
                  enum: ["positive", "negative", "neutral"],
                },
                score: { type: "number", minimum: -100, maximum: 100 },
                confidence: { type: "number", minimum: 0, maximum: 100 },
                summary: { type: "string" },
                impactedMarkets: {
                  type: "array",
                  items: { type: "string" },
                },
                tradingSignal: {
                  type: "string",
                  enum: ["buy", "sell", "hold"],
                },
              },
              required: [
                "sentiment",
                "score",
                "confidence",
                "summary",
                "impactedMarkets",
              ],
            },
          },
        },
      });

      const content = response.choices[0]?.message.content;
      if (!content) throw new Error("No response from LLM");

      const contentStr = typeof content === "string" ? content : JSON.stringify(content);
      const parsed = JSON.parse(contentStr);
      return {
        sentiment: parsed.sentiment,
        score: parsed.score,
        confidence: parsed.confidence,
        summary: parsed.summary,
        impactedMarkets: parsed.impactedMarkets || [],
        tradingSignal: parsed.tradingSignal,
      };
    } catch (error) {
      console.error("[NewsAnalyzer] Error analyzing news:", error);
      return {
        sentiment: "neutral",
        score: 0,
        confidence: 0,
        summary: "Unable to analyze news",
        impactedMarkets: [],
      };
    }
  }

  /**
   * Batch analyze multiple news items
   */
  async analyzeNewsBatch(newsList: NewsItem[]): Promise<NewsAnalysisResult[]> {
    const results: NewsAnalysisResult[] = [];

    for (const news of newsList) {
      const sentiment = await this.analyzeNews(news);
      results.push({
        id: nanoid(),
        title: news.title,
        sentiment,
        relatedEvents: [], // TODO: Link to historical events
        createdAt: new Date(),
      });

      // Rate limiting: wait 500ms between requests
      await new Promise((resolve) => setTimeout(resolve, 500));
    }

    return results;
  }

  /**
   * Aggregate sentiment from multiple news items
   */
  aggregateSentiment(analyses: SentimentAnalysis[]): SentimentAnalysis {
    if (analyses.length === 0) {
      return {
        sentiment: "neutral",
        score: 0,
        confidence: 0,
        summary: "No news to analyze",
        impactedMarkets: [],
      };
    }

    const avgScore = analyses.reduce((sum, a) => sum + a.score, 0) / analyses.length;
    const avgConfidence = analyses.reduce((sum, a) => sum + a.confidence, 0) / analyses.length;
    const allMarkets = Array.from(new Set(analyses.flatMap((a) => a.impactedMarkets)));

    let sentiment: "positive" | "negative" | "neutral" = "neutral";
    if (avgScore > 20) sentiment = "positive";
    if (avgScore < -20) sentiment = "negative";

    return {
      sentiment,
      score: Math.round(avgScore),
      confidence: Math.round(avgConfidence),
      summary: `Aggregate sentiment from ${analyses.length} news items`,
      impactedMarkets: allMarkets,
    };
  }
}

// Singleton instance
let newsAnalyzer: NewsAnalyzer | null = null;

export function getNewsAnalyzer(): NewsAnalyzer {
  if (!newsAnalyzer) {
    newsAnalyzer = new NewsAnalyzer();
  }
  return newsAnalyzer;
}
