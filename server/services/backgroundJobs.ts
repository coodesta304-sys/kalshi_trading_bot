/**
 * Background Jobs Service
 * Handles periodic data fetching and processing
 */

import { getCreneClient } from "./creneClient";
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
  private config: {
    creneSync: JobConfig;
    twitterSync: JobConfig;
    decisionMaking: JobConfig;
    portfolioUpdate: JobConfig;
  };

  constructor(config?: {
    creneSync?: JobConfig;
    twitterSync?: JobConfig;
    decisionMaking?: JobConfig;
    portfolioUpdate?: JobConfig;
  }) {
    this.config = {
      creneSync: config?.creneSync || { interval: 60000, enabled: true }, // 1 minute
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

    if (this.config.creneSync.enabled) {
      this.startCreneSync();
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
   * Sync Crene market data
   */
  private startCreneSync(): void {
    console.log("[BackgroundJobs] Starting Crene sync job...");

    const job = setInterval(async () => {
      try {
        const creneClient = getCreneClient();
        const predictions = await creneClient.getPredictions(50);

        console.log(`[Crene] Fetched ${predictions.length} predictions`);

        // Store in database (implementation depends on your DB schema)
        // await storeCreneData(predictions);
      } catch (error) {
        console.error("[Crene] Error fetching predictions:", error);
      }
    }, this.config.creneSync.interval);

    this.jobs.set("creneSync", job);
  }

  /**
   * Sync Twitter sentiment data
   */
  private startTwitterSync(): void {
    console.log("[BackgroundJobs] Starting Twitter sync job...");

    const job = setInterval(async () => {
      try {
        const twitterClient = getTwitterClient();

        // Search for market-related tweets
        const queries = ["bitcoin prediction", "ethereum forecast", "kalshi market", "crypto trading"];

        for (const query of queries) {
          const tweets = await twitterClient.searchTweets(query, 10);
          console.log(`[Twitter] Fetched ${tweets.length} tweets for "${query}"`);

          // Store in database (implementation depends on your DB schema)
          // await storeTwitterData(tweets, query);
        }
      } catch (error) {
        console.error("[Twitter] Error fetching tweets:", error);
      }
    }, this.config.twitterSync.interval);

    this.jobs.set("twitterSync", job);
  }

  /**
   * Make trading decisions based on latest data
   */
  private startDecisionMaking(): void {
    console.log("[BackgroundJobs] Starting decision making job...");

    const job = setInterval(async () => {
      try {
        const creneClient = getCreneClient();
        const twitterClient = getTwitterClient();
        const decisionEngine = getTradingDecisionEngine();

        // Get latest predictions
        const predictions = await creneClient.getPredictions(20);
        const signals = creneClient.detectSignals(predictions);

        console.log(`[DecisionMaking] Detected ${signals.length} trading signals`);

        // For each signal, make a decision
        for (const signal of signals.slice(0, 5)) {
          // Limit to top 5 signals
          try {
            // Get related tweets
            const tweets = await twitterClient.searchMarketTweets(signal.ticker, 10);

            // Make decision
            const decision = decisionEngine.makeDecision(
              signal.id,
              signal.ticker,
              signal,
              tweets,
              10000, // Virtual balance
              1 // Risk 1% per trade
            );

            console.log(
              `[DecisionMaking] Decision for ${signal.ticker}: ${decision.decision} (${decision.confidence}% confidence)`
            );

            // Store decision in database
            // await storeDecision(decision);
          } catch (error) {
            console.error(`[DecisionMaking] Error processing signal for ${signal.ticker}:`, error);
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

        // This would update portfolio metrics for all users
        // In a real implementation, you'd iterate through all users
        console.log("[PortfolioUpdate] Portfolio metrics updated");

        // Update in database
        // await updatePortfolioMetrics();
      } catch (error) {
        console.error("[PortfolioUpdate] Error updating portfolio:", error);
      }
    }, this.config.portfolioUpdate.interval);

    this.jobs.set("portfolioUpdate", job);
  }

  /**
   * Get job status
   */
  getStatus(): {
    running: boolean;
    jobs: string[];
    config: any;
  } {
    return {
      running: this.jobs.size > 0,
      jobs: Array.from(this.jobs.keys()),
      config: this.config,
    };
  }
}

// Singleton instance
let backgroundJobsService: BackgroundJobsService | null = null;

export function getBackgroundJobsService(config?: {
  creneSync?: JobConfig;
  twitterSync?: JobConfig;
  decisionMaking?: JobConfig;
  portfolioUpdate?: JobConfig;
}): BackgroundJobsService {
  if (!backgroundJobsService) {
    backgroundJobsService = new BackgroundJobsService(config);
  }
  return backgroundJobsService;
}
