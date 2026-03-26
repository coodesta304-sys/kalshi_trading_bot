import { eq } from "drizzle-orm";
import { drizzle } from "drizzle-orm/mysql2";
import { InsertUser, users } from "../drizzle/schema";
import { ENV } from './_core/env';

let _db: ReturnType<typeof drizzle> | null = null;

// Lazily create the drizzle instance so local tooling can run without a DB.
export async function getDb() {
  if (!_db && process.env.DATABASE_URL) {
    try {
      _db = drizzle(process.env.DATABASE_URL);
    } catch (error) {
      console.warn("[Database] Failed to connect:", error);
      _db = null;
    }
  }
  return _db;
}

export async function upsertUser(user: InsertUser): Promise<void> {
  if (!user.openId) {
    throw new Error("User openId is required for upsert");
  }

  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot upsert user: database not available");
    return;
  }

  try {
    const values: InsertUser = {
      openId: user.openId,
    };
    const updateSet: Record<string, unknown> = {};

    const textFields = ["name", "email", "loginMethod"] as const;
    type TextField = (typeof textFields)[number];

    const assignNullable = (field: TextField) => {
      const value = user[field];
      if (value === undefined) return;
      const normalized = value ?? null;
      values[field] = normalized;
      updateSet[field] = normalized;
    };

    textFields.forEach(assignNullable);

    if (user.lastSignedIn !== undefined) {
      values.lastSignedIn = user.lastSignedIn;
      updateSet.lastSignedIn = user.lastSignedIn;
    }
    if (user.role !== undefined) {
      values.role = user.role;
      updateSet.role = user.role;
    } else if (user.openId === ENV.ownerOpenId) {
      values.role = 'admin';
      updateSet.role = 'admin';
    }

    if (!values.lastSignedIn) {
      values.lastSignedIn = new Date();
    }

    if (Object.keys(updateSet).length === 0) {
      updateSet.lastSignedIn = new Date();
    }

    await db.insert(users).values(values).onDuplicateKeyUpdate({
      set: updateSet,
    });
  } catch (error) {
    console.error("[Database] Failed to upsert user:", error);
    throw error;
  }
}

export async function getUserByOpenId(openId: string) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot get user: database not available");
    return undefined;
  }

  const result = await db.select().from(users).where(eq(users.openId, openId)).limit(1);

  return result.length > 0 ? result[0] : undefined;
}

// Trading queries
export async function getKalshiMarkets(limit: number = 50) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(kalshiMarkets).limit(limit);
}

export async function getMarketById(marketId: string) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(kalshiMarkets).where(eq(kalshiMarkets.id, marketId)).limit(1);
  return result[0];
}

export async function getUserTradingOrders(userId: number) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(tradingOrders).where(eq(tradingOrders.userId, userId));
}

export async function getRecentNewsEvents(limit: number = 20) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(newsEvents).orderBy(desc(newsEvents.fetchedAt)).limit(limit);
}

export async function getAiDecisionsByUser(userId: number, limit: number = 50) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(aiDecisions).where(eq(aiDecisions.userId, userId)).orderBy(desc(aiDecisions.createdAt)).limit(limit);
}

export async function getPortfolioSnapshot(userId: number) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(portfolioSnapshots).where(eq(portfolioSnapshots.userId, userId)).orderBy(desc(portfolioSnapshots.createdAt)).limit(1);
  return result[0];
}

export async function getTradingSettings(userId: number) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(tradingSettings).where(eq(tradingSettings.userId, userId)).limit(1);
  return result[0];
}

export async function createTradingSettings(userId: number) {
  const db = await getDb();
  if (!db) return undefined;
  const id = nanoid();
  await db.insert(tradingSettings).values({ id, userId });
  return { id, userId };
}

import { desc } from "drizzle-orm";
import { kalshiMarkets, tradingOrders, newsEvents, aiDecisions, portfolioSnapshots, tradingSettings } from "../drizzle/schema";
import { nanoid } from "nanoid";
