import { int, mysqlEnum, mysqlTable, text, timestamp, varchar } from "drizzle-orm/mysql-core";

/**
 * Core user table backing auth flow.
 * Extend this file with additional tables as your product grows.
 * Columns use camelCase to match both database fields and generated types.
 */
export const users = mysqlTable("users", {
  /**
   * Surrogate primary key. Auto-incremented numeric value managed by the database.
   * Use this for relations between tables.
   */
  id: int("id").autoincrement().primaryKey(),
  /** Manus OAuth identifier (openId) returned from the OAuth callback. Unique per user. */
  openId: varchar("openId", { length: 64 }).notNull().unique(),
  name: text("name"),
  email: varchar("email", { length: 320 }),
  loginMethod: varchar("loginMethod", { length: 64 }),
  role: mysqlEnum("role", ["user", "admin"]).default("user").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  lastSignedIn: timestamp("lastSignedIn").defaultNow().notNull(),
});

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;

// Trading Markets & Contracts
export const kalshiMarkets = mysqlTable("kalshi_markets", {
  id: varchar("id", { length: 64 }).primaryKey(),
  ticker: varchar("ticker", { length: 32 }).notNull().unique(),
  title: text("title").notNull(),
  description: text("description"),
  category: varchar("category", { length: 64 }),
  expirationDate: timestamp("expiration_date"),
  currentPrice: int("current_price"), // Stored as cents (0-10000 = $0-$100)
  yesPrice: int("yes_price"),
  noPrice: int("no_price"),
  volume24h: int("volume_24h"),
  lastUpdated: timestamp("last_updated").defaultNow().onUpdateNow(),
  createdAt: timestamp("created_at").defaultNow(),
});

export type KalshiMarket = typeof kalshiMarkets.$inferSelect;
export type InsertKalshiMarket = typeof kalshiMarkets.$inferInsert;

// Trading Orders & Positions
export const tradingOrders = mysqlTable("trading_orders", {
  id: varchar("id", { length: 64 }).primaryKey(),
  userId: int("user_id").notNull().references(() => users.id),
  marketId: varchar("market_id", { length: 64 }).notNull().references(() => kalshiMarkets.id),
  side: mysqlEnum("side", ["yes", "no"]).notNull(),
  quantity: int("quantity").notNull(),
  limitPrice: int("limit_price"), // In cents
  status: mysqlEnum("status", ["pending", "open", "filled", "cancelled", "failed"]).default("pending"),
  executedPrice: int("executed_price"),
  executedQuantity: int("executed_quantity"),
  stopLoss: int("stop_loss"),
  takeProfit: int("take_profit"),
  kalshiOrderId: varchar("kalshi_order_id", { length: 128 }),
  decisionId: varchar("decision_id", { length: 64 }),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow().onUpdateNow(),
});

export type TradingOrder = typeof tradingOrders.$inferSelect;
export type InsertTradingOrder = typeof tradingOrders.$inferInsert;

// AI Decisions & Analysis
export const aiDecisions = mysqlTable("ai_decisions", {
  id: varchar("id", { length: 64 }).primaryKey(),
  userId: int("user_id").notNull().references(() => users.id),
  marketId: varchar("market_id", { length: 64 }).notNull().references(() => kalshiMarkets.id),
  decision: mysqlEnum("decision", ["buy", "sell", "hold"]).notNull(),
  confidence: int("confidence").notNull(), // 0-100
  reasoning: text("reasoning"),
  newsIds: text("news_ids"), // JSON array of news IDs
  sentimentScore: int("sentiment_score"), // -100 to 100
  technicalSignal: varchar("technical_signal", { length: 64 }),
  aiAnalysis: text("ai_analysis"), // Full AI response
  executed: mysqlEnum("executed", ["yes", "no", "pending"]).default("pending"),
  outcome: mysqlEnum("outcome", ["profit", "loss", "neutral", "pending"]),
  profitLoss: int("profit_loss"), // In cents
  createdAt: timestamp("created_at").defaultNow(),
});

export type AiDecision = typeof aiDecisions.$inferSelect;
export type InsertAiDecision = typeof aiDecisions.$inferInsert;

// News & Events
export const newsEvents = mysqlTable("news_events", {
  id: varchar("id", { length: 64 }).primaryKey(),
  title: text("title").notNull(),
  content: text("content"),
  source: varchar("source", { length: 128 }), // RSS, Twitter, etc.
  sourceUrl: varchar("source_url", { length: 512 }),
  sentiment: mysqlEnum("sentiment", ["positive", "negative", "neutral"]).default("neutral"),
  sentimentScore: int("sentiment_score"), // -100 to 100
  relatedMarkets: text("related_markets"), // JSON array of market IDs
  aiSummary: text("ai_summary"),
  publishedAt: timestamp("published_at"),
  fetchedAt: timestamp("fetched_at").defaultNow(),
});

export type NewsEvent = typeof newsEvents.$inferSelect;
export type InsertNewsEvent = typeof newsEvents.$inferInsert;

// Portfolio & Performance
export const portfolioSnapshots = mysqlTable("portfolio_snapshots", {
  id: varchar("id", { length: 64 }).primaryKey(),
  userId: int("user_id").notNull().references(() => users.id),
  totalBalance: int("total_balance").notNull(), // In cents
  availableBalance: int("available_balance").notNull(),
  totalPositions: int("total_positions").notNull(),
  unrealizedPnL: int("unrealized_pnl"), // In cents
  realizedPnL: int("realized_pnl"), // In cents
  winRate: int("win_rate"), // 0-100
  totalTrades: int("total_trades"),
  createdAt: timestamp("created_at").defaultNow(),
});

export type PortfolioSnapshot = typeof portfolioSnapshots.$inferSelect;
export type InsertPortfolioSnapshot = typeof portfolioSnapshots.$inferInsert;

// Trading Settings & Preferences
export const tradingSettings = mysqlTable("trading_settings", {
  id: varchar("id", { length: 64 }).primaryKey(),
  userId: int("user_id").notNull().unique().references(() => users.id),
  maxPositionSize: int("max_position_size").default(500), // In cents (5% of balance)
  stopLossPercent: int("stop_loss_percent").default(200), // 2%
  takeProfitPercent: int("take_profit_percent").default(150), // 1.5%
  maxDailyLoss: int("max_daily_loss").default(1000), // In cents
  enableAutoTrading: mysqlEnum("enable_auto_trading", ["yes", "no"]).default("no"),
  enableNotifications: mysqlEnum("enable_notifications", ["yes", "no"]).default("yes"),
  minConfidenceThreshold: int("min_confidence_threshold").default(70), // 0-100
  updatedAt: timestamp("updated_at").defaultNow().onUpdateNow(),
});

export type TradingSetting = typeof tradingSettings.$inferSelect;
export type InsertTradingSetting = typeof tradingSettings.$inferInsert;