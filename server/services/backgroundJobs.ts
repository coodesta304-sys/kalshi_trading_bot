/**
 * Background Jobs Service
 * Handles periodic data fetching and processing
 */

import { PolymarketClient } from "./polymarketClient";
import { getTwitterClient } from "./twitterClient";
import { getTradingDecisionEngine } from "./tradingDecisionEngine";
import { getPaperTradingEngine } from "./paperTradingEngine";
import { getDb } from "../db";

interface JobConfig {
  interval: number; // milliseconds
  enabled: boolean;
}

export class BackgroundJobsService {
  private jobs: Map<string, NodeJS.Timeout> = new Map();
  private polymarketClient: PolymarketClient;
  private config: {
    polymarketSync: JobConfig;
    twitterSync: JobConfig;
    decisionMaking: JobConfig;
    portfolioUpdate: JobConfig;
  };

  constructor(config?: {
    polymarketSync?: JobConfig;
    twitterSync?: JobConfig;
    decisionMaking?: JobConfig;
    portfolioUpdate?: JobConfig;
  }) {
    this.polymarketClient = new PolymarketClient();
    this.config = {
      polymarketSync: config?.polymarketSync || { interval: 60000, enabled: true }, // 1 minute
      twitterSync: config?.twitterSync || { interval: 300000, enabled: true }, // 5 minutes
      decisionMaking: config?.decisionMaking || { interval: 120000, enabled: true }, // 2 minutes
      portfolioUpdate: config?.portfolioUpdate || { interval: 30000, enabled: true }, // 30 seconds
    };
  }

  /**
   * Start all background jobs
   */
  startAll(): void {
    console.log("[BackgroundJobs] Starting all jobs...");

    if (this.config.polymarketSync.enabled) {
      this.startPolymarketSync();
    }

    if (this.config.twitterSync.enabled) {
      this.startTwitterSync();
    }

    if (this.config.decisionMaking.enabled) {
      this.startDecisionMaking();
    }

    if (this.config.portfolioUpdate.enabled) {
      this.startPortfolioUpdate();
    }
  }

  /**
   * Stop all background jobs
   */
  stopAll(): void {
    console.log("[BackgroundJobs] Stopping all jobs...");

    this.jobs.forEach((timeout) => clearInterval(timeout));
    this.jobs.clear();
  }

  /**
   * Sync Polymarket data
   */
  private startPolymarketSync(): void {
    console.log("[BackgroundJobs] Starting Polymarket sync job...");

    const job = setInterval(async () => {
      try {
        // Fetch markets
        const markets = await this.polymarketClient.getMarkets();
        console.log(`[Polymarket] Fetched ${markets.length} markets`);

        // Fetch market insights
        const insights = await this.polymarketClient.getMarketInsights();
        console.log(`[Polymarket] Fetched ${insights.length} market insights`);

        // Store in database (implementation depends on your DB schema)
        // await storePolymarketData(markets, insights);
      } catch (error) {
        console.error("[Polymarket] Error syncing data:", error);
      }
    }, this.config.polymarketSync.interval);

    this.jobs.set("polymarketSync", job);
  }

  /**
   * Sync Twitter data
   */
  private startTwitterSync(): void {
    console.log("[BackgroundJobs] Starting Twitter sync job...");

    const queries = [
      "Polymarket prediction",
      "Kalshi trading",
      "prediction market",
      "market forecast",
      "trading signals",
    ];

    const job = setInterval(async () => {
      try {
        const twitterClient = getTwitterClient();

        for (const query of queries) {
          try {
            const tweets = await twitterClient.searchTweets(query, 10);
            console.log(`[Twitter] Fetched ${tweets.length} tweets for "${query}"`);

            // Store tweets in database if needed
            // await storeTweets(tweets);
          } catch (error) {
            console.error(`[Twitter] Error fetching tweets for "${query}":`, error);
          }
        }
      } catch (error) {
        console.error("[Twitter] Error syncing data:", error);
      }
    }, this.config.twitterSync.interval);

    this.jobs.set("twitterSync", job);
  }

  /**
   * Make trading decisions based on market insights
   */
  private startDecisionMaking(): void {
    console.log("[BackgroundJobs] Starting decision making job...");

    const job = setInterval(async () => {
      try {
        const decisionEngine = getTradingDecisionEngine();
        const twitterClient = getTwitterClient();

        // Get market insights
        const insights = await this.polymarketClient.getMarketInsights();

        for (const insight of insights.slice(0, 5)) {
          // Limit to top 5 insights
          try {
            // Get related tweets for sentiment analysis
            const tweets = await twitterClient.searchTweets(insight.market_question, 10);

            // Make decision based on insight and sentiment
            const decision = decisionEngine.makeDecision(
              insight.market_id,
              insight.market_question,
              {
                id: insight.market_id,
                ticker: insight.market_question.substring(0, 20), // Use question as ticker
                title: insight.market_question,
                currentPrice: 0.5,
                predictions: {
                  gpt4o: insight.confidence,
                  claude: insight.confidence,
                  gemini: insight.confidence,
                  grok: insight.confidence,
                  consensus: insight.confidence,
                },
              },
              tweets,
              10000, // Virtual balance
              1 // Risk 1% per trade
            );

            console.log(
              `[DecisionMaking] Decision for ${insight.market_question}: ${decision.decision} (${decision.confidence}% confidence)`
            );

            // Store decision in database if needed
            // const db = getDb();
            // await db.insert(aiDecisions).values({ ... });
          } catch (error) {
            console.error(
              `[DecisionMaking] Error processing insight for ${insight.market_question}:`,
              error
            );
          }
        }
      } catch (error) {
        console.error("[DecisionMaking] Error making decisions:", error);
      }
    }, this.config.decisionMaking.interval);

    this.jobs.set("decisionMaking", job);
  }

  /**
   * Update portfolio metrics
   */
  private startPortfolioUpdate(): void {
    console.log("[BackgroundJobs] Starting portfolio update job...");

    const job = setInterval(async () => {
      try {
        const paperTradingEngine = getPaperTradingEngine();

        // Update portfolio metrics (using default user)
        const portfolio = paperTradingEngine.getPortfolio('default-user');
        console.log(`[Portfolio] Updated portfolio - Balance: $${portfolio.currentBalance}`);

        // Store portfolio snapshot in database if needed
        // const db = getDb();
        // await db.insert(portfolioSnapshots).values({ ... });
      } catch (error) {
        console.error("[Portfolio] Error updating portfolio:", error);
      }
    }, this.config.portfolioUpdate.interval);

    this.jobs.set("portfolioUpdate", job);
  }
}

// Singleton instance
let backgroundJobsService: BackgroundJobsService | null = null;

export function getBackgroundJobsService(): BackgroundJobsService {
  if (!backgroundJobsService) {
    backgroundJobsService = new BackgroundJobsService();
  }
  return backgroundJobsService;
}
