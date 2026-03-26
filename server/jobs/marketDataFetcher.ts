import { getCreneClient } from "../services/creneClient";
import { getTwitterClient } from "../services/twitterClient";
import { getTradingDecisionEngine } from "../services/tradingDecisionEngine";
import { getPaperTradingEngine } from "../services/paperTradingEngine";
import { getDb } from "../db";
import { kalshiMarkets, newsEvents, aiDecisions } from "../../drizzle/schema";
import { nanoid } from "nanoid";

/**
 * Fetch market data from Crene and store in database
 */
export async function fetchMarketData() {
  try {
    const creneClient = getCreneClient();
    const predictions = await creneClient.getPredictions(50);

    if (!predictions || predictions.length === 0) {
      console.log("[Job] No predictions fetched from Crene");
      return;
    }

    const db = await getDb();
    if (!db) {
      console.warn("[Job] Database not available");
      return;
    }

    // Store market data
    for (const pred of predictions) {
      await db.insert(kalshiMarkets).values({
        id: nanoid(),
        ticker: pred.ticker,
        title: pred.title,
        description: pred.title,
        category: "prediction",
        currentPrice: pred.currentPrice,
        volume24h: pred.volume24h || 0,
        lastUpdated: new Date(),
      }).onDuplicateKeyUpdate({
        set: {
          currentPrice: pred.currentPrice,
          volume24h: pred.volume24h || 0,
          lastUpdated: new Date(),
        },
      });
    }

    console.log(`[Job] Stored ${predictions.length} market data points`);
  } catch (error) {
    console.error("[Job] Error fetching market data:", error);
  }
}

/**
 * Fetch Twitter trends and store as news events
 */
export async function fetchTwitterTrends() {
  try {
    const twitterClient = getTwitterClient();
    const trends = await twitterClient.getTrends();

    if (!trends || trends.length === 0) {
      console.log("[Job] No trends fetched from Twitter");
      return;
    }

    const db = await getDb();
    if (!db) {
      console.warn("[Job] Database not available");
      return;
    }

    // Store trends as news events
    for (const trend of trends) {
      await db.insert(newsEvents).values({
        id: nanoid(),
        title: `Trending: ${trend}`,
        content: `Twitter trend: ${trend}`,
        source: "twitter",
        sentiment: "neutral",
        sentimentScore: 0,
        fetchedAt: new Date(),
      });
    }

    console.log(`[Job] Stored ${trends.length} Twitter trends`);
  } catch (error) {
    console.error("[Job] Error fetching Twitter trends:", error);
  }
}

/**
 * Generate trading decisions based on market data
 */
export async function generateTradingDecisions() {
  try {
    const creneClient = getCreneClient();
    const decisionEngine = getTradingDecisionEngine();
    const paperTradingEngine = getPaperTradingEngine();
    const db = await getDb();

    if (!db) {
      console.warn("[Job] Database not available");
      return;
    }

    // Get latest market data
    const predictions = await creneClient.getPredictions(50);
    if (!predictions || predictions.length === 0) {
      console.log("[Job] No predictions for decision making");
      return;
    }

    // Detect signals
    const signals = creneClient.detectSignals(predictions, 0.1);
    console.log(`[Job] Detected ${signals.length} trading signals`);

    // Generate decisions for each signal
    for (const signal of signals) {
      const decision = decisionEngine.makeDecision(
        nanoid(),
        signal.ticker,
        signal,
        [],
        1000000, // Default account balance
        1 // Risk percentage
      );

      // Execute paper trade if decision is to buy or sell
      if (decision.decision !== "hold") {
        const trade = paperTradingEngine.executeTrade(
          "1", // userId
          decision.marketId,
          signal.ticker,
          decision.decision,
          decision.positionSize,
          signal.marketPrice,
          2, // stopLossPercent
          1.5 // takeProfitPercent
        );

        // Store decision
        await db.insert(aiDecisions).values({
          id: decision.id,
          userId: 1, // Default user for now
          marketId: decision.marketId,
          decision: decision.decision,
          confidence: decision.confidence,
          reasoning: decision.reasoning,
          sentimentScore: 0,
          executed: "pending",
          createdAt: new Date(),
        });

        console.log(`[Job] Created ${decision.decision} decision for ${signal.ticker}`);
      }
    }
  } catch (error) {
    console.error("[Job] Error generating trading decisions:", error);
  }
}

/**
 * Start background job scheduler
 */
export function startJobScheduler() {
  console.log("[Job Scheduler] Starting background jobs...");

  // Fetch market data every 1 minute
  setInterval(() => {
    fetchMarketData().catch((error) => console.error("[Job] Market data fetch error:", error));
  }, 60000);

  // Fetch Twitter trends every 5 minutes
  setInterval(() => {
    fetchTwitterTrends().catch((error) => console.error("[Job] Twitter trends fetch error:", error));
  }, 300000);

  // Generate trading decisions every 2 minutes
  setInterval(() => {
    generateTradingDecisions().catch((error) => console.error("[Job] Trading decision error:", error));
  }, 120000);

  // Initial run
  fetchMarketData().catch((error) => console.error("[Job] Initial market data fetch error:", error));
  fetchTwitterTrends().catch((error) => console.error("[Job] Initial Twitter trends fetch error:", error));
  generateTradingDecisions().catch((error) => console.error("[Job] Initial trading decision error:", error));

  console.log("[Job Scheduler] Background jobs started successfully");
}
