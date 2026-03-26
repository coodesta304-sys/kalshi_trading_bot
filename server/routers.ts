import { COOKIE_NAME } from "@shared/const";
import type { TRPCError } from "@trpc/server";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { publicProcedure, protectedProcedure, router } from "./_core/trpc";

export const appRouter = router({
  system: systemRouter,
  auth: router({
    me: publicProcedure.query(opts => opts.ctx.user),
    logout: publicProcedure.mutation(({ ctx }) => {
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
      return {
        success: true,
      } as const;
    }),
  }),

  // Trading routes with real data from Polymarket Analytics
  trading: router({
    // Get market predictions
    getPredictions: publicProcedure.query(async () => {
      try {
        const { PolymarketClient } = await import("./services/polymarketClient");
        const client = new PolymarketClient();
        const markets = await client.getMarkets(50);
        return markets;
      } catch (error) {
        console.error("Error fetching predictions:", error);
        return [];
      }
    }),

    // Get trading signals (Market Insights)
    getSignals: publicProcedure.query(async () => {
      try {
        const { PolymarketClient } = await import("./services/polymarketClient");
        const client = new PolymarketClient();
        const insights = await client.getMarketInsights(20);
        return insights.filter((i) => i.signal !== "NEUTRAL");
      } catch (error) {
        console.error("Error fetching signals:", error);
        return [];
      }
    }),

    // Get social signals
    getSocialSignals: publicProcedure.query(async () => {
      try {
        const { PolymarketClient } = await import("./services/polymarketClient");
        const client = new PolymarketClient();
        return await client.getSocialSignals(20);
      } catch (error) {
        console.error("Error fetching social signals:", error);
        return [];
      }
    }),

    // Get user's paper trading portfolio
    getPortfolio: protectedProcedure.query(async ({ ctx }) => {
      const { getPaperTradingEngine } = await import("./services/paperTradingEngine");
      const engine = getPaperTradingEngine();
      return engine.getPortfolioSummary(ctx.user.id.toString());
    }),

    // Get user's paper trades
    getTrades: protectedProcedure.query(async ({ ctx }) => {
      const { getPaperTradingEngine } = await import("./services/paperTradingEngine");
      const engine = getPaperTradingEngine();
      return engine.getUserTrades(ctx.user.id.toString());
    }),

    // Get AI trading decisions
    getDecisions: protectedProcedure.query(async ({ ctx }) => {
      const { getAiDecisionsByUser } = await import("./db");
      return getAiDecisionsByUser(ctx.user.id, 50);
    }),
  }),

  // News and sentiment routes
  news: router({
    // Get tweets and sentiment for a market
    getMarketSentiment: publicProcedure
      .input((val: any) => {
        if (typeof val !== "object" || val === null) throw new Error("Invalid input");
        if (typeof val.ticker !== "string") throw new Error("ticker must be string");
        return val as { ticker: string };
      })
      .query(async ({ input }) => {
        try {
          const { getTwitterClient } = await import("./services/twitterClient");
          const client = getTwitterClient();
          const tweets = await client.searchMarketTweets(input.ticker, 20);
          const sentiment = client.aggregateSentiment(tweets);
          return { tweets, sentiment };
        } catch (error) {
          console.error("Error fetching sentiment:", error);
          return { tweets: [], sentiment: null };
        }
      }),

    // Get trending topics
    getTrends: publicProcedure.query(async () => {
      try {
        const { getTwitterClient } = await import("./services/twitterClient");
        const client = getTwitterClient();
        return await client.getTrends();
      } catch (error) {
        console.error("Error fetching trends:", error);
        return [];
      }
    }),
  }),

  // Notifications
  notifications: router({
    // Get user notifications
    getNotifications: protectedProcedure
      .input((val: any) => {
        if (typeof val !== "object" || val === null) return { unreadOnly: false };
        return { unreadOnly: val.unreadOnly === true };
      })
      .query(async ({ ctx, input }) => {
        const { getNotificationService } = await import("./services/notificationService");
        const service = getNotificationService();
        return service.getNotifications(ctx.user.id, input.unreadOnly);
      }),

    // Mark notification as read
    markAsRead: protectedProcedure
      .input((val: any) => {
        if (typeof val !== "object" || val === null) throw new Error("Invalid input");
        if (typeof val.notificationId !== "string") throw new Error("notificationId must be string");
        return val as { notificationId: string };
      })
      .mutation(async ({ ctx, input }) => {
        const { getNotificationService } = await import("./services/notificationService");
        const service = getNotificationService();
        service.markAsRead(ctx.user.id, input.notificationId);
        return { success: true };
      }),

    // Clear all notifications
    clearAll: protectedProcedure.mutation(async ({ ctx }) => {
      const { getNotificationService } = await import("./services/notificationService");
      const service = getNotificationService();
      service.clearNotifications(ctx.user.id);
      return { success: true };
    }),
  }),

  // Background jobs control
  jobs: router({
    // Start background jobs
    start: protectedProcedure.mutation(async ({ ctx }) => {
      // Only allow admin users
      if (ctx.user.role !== "admin") {
        throw new Error("Unauthorized");
      }

      const { getBackgroundJobsService } = await import("./services/backgroundJobs");
      const service = getBackgroundJobsService();
      service.startAll();

      return { success: true, message: "Background jobs started" };
    }),

    // Stop background jobs
    stop: protectedProcedure.mutation(async ({ ctx }) => {
      // Only allow admin users
      if (ctx.user.role !== "admin") {
        throw new Error("Unauthorized");
      }

      const { getBackgroundJobsService } = await import("./services/backgroundJobs");
      const service = getBackgroundJobsService();
      service.stopAll();

      return { success: true, message: "Background jobs stopped" };
    }),

    // Get background jobs status
    getStatus: protectedProcedure.query(async ({ ctx }) => {
      const { getBackgroundJobsService } = await import("./services/backgroundJobs");
      const service = getBackgroundJobsService();
      return service.getStatus();
    }),
  }),
});

export type AppRouter = typeof appRouter;
