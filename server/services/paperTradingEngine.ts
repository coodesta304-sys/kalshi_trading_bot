/**
 * Paper Trading Engine
 * Simulates trading without real transactions
 * All trades are virtual but based on real market prices
 */

export interface PaperTrade {
  id: string;
  marketId: string;
  ticker: string;
  side: "buy" | "sell";
  quantity: number;
  entryPrice: number;
  currentPrice: number;
  stopLoss: number;
  takeProfit: number;
  status: "open" | "closed" | "stopped";
  openedAt: Date;
  closedAt?: Date;
  reason?: string;
  pnl?: number;
  pnlPercent?: number;
}

export interface VirtualPortfolio {
  initialBalance: number;
  currentBalance: number;
  usedMargin: number;
  availableBalance: number;
  totalOpenPositions: number;
  totalClosedTrades: number;
  realizedPnL: number;
  unrealizedPnL: number;
  totalPnL: number;
  winRate: number;
  maxDrawdown: number;
}

export class PaperTradingEngine {
  private portfolio: Map<string, VirtualPortfolio> = new Map();
  private trades: Map<string, PaperTrade[]> = new Map();
  private initialBalance: number = 10000; // $10,000 virtual balance

  constructor(initialBalance: number = 10000) {
    this.initialBalance = initialBalance;
  }

  /**
   * Initialize portfolio for a user
   */
  initializePortfolio(userId: string): VirtualPortfolio {
    const portfolio: VirtualPortfolio = {
      initialBalance: this.initialBalance,
      currentBalance: this.initialBalance,
      usedMargin: 0,
      availableBalance: this.initialBalance,
      totalOpenPositions: 0,
      totalClosedTrades: 0,
      realizedPnL: 0,
      unrealizedPnL: 0,
      totalPnL: 0,
      winRate: 0,
      maxDrawdown: 0,
    };

    this.portfolio.set(userId, portfolio);
    this.trades.set(userId, []);

    return portfolio;
  }

  /**
   * Get user portfolio
   */
  getPortfolio(userId: string): VirtualPortfolio {
    let portfolio = this.portfolio.get(userId);
    if (!portfolio) {
      portfolio = this.initializePortfolio(userId);
    }
    return portfolio;
  }

  /**
   * Execute a paper trade (buy or sell)
   */
  executeTrade(
    userId: string,
    marketId: string,
    ticker: string,
    side: "buy" | "sell",
    quantity: number,
    entryPrice: number,
    stopLossPercent: number = 2,
    takeProfitPercent: number = 1.5
  ): PaperTrade {
    const portfolio = this.getPortfolio(userId);
    const tradeValue = quantity * entryPrice;

    // Check if user has enough balance
    if (tradeValue > portfolio.availableBalance) {
      throw new Error(`Insufficient balance. Required: $${tradeValue}, Available: $${portfolio.availableBalance}`);
    }

    // Calculate stop loss and take profit
    const stopLoss = entryPrice * (1 - stopLossPercent / 100);
    const takeProfit = entryPrice * (1 + takeProfitPercent / 100);

    // Create trade
    const trade: PaperTrade = {
      id: `${userId}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      marketId,
      ticker,
      side,
      quantity,
      entryPrice,
      currentPrice: entryPrice,
      stopLoss,
      takeProfit,
      status: "open",
      openedAt: new Date(),
    };

    // Update portfolio
    portfolio.usedMargin += tradeValue;
    portfolio.availableBalance -= tradeValue;
    portfolio.totalOpenPositions += 1;

    // Store trade
    const userTrades = this.trades.get(userId) || [];
    userTrades.push(trade);
    this.trades.set(userId, userTrades);

    return trade;
  }

  /**
   * Close a trade at current price
   */
  closeTrade(userId: string, tradeId: string, exitPrice: number): PaperTrade {
    const userTrades = this.trades.get(userId) || [];
    const trade = userTrades.find((t) => t.id === tradeId);

    if (!trade) {
      throw new Error(`Trade ${tradeId} not found`);
    }

    if (trade.status !== "open") {
      throw new Error(`Trade ${tradeId} is already closed`);
    }

    // Calculate P&L
    const pnl = (exitPrice - trade.entryPrice) * trade.quantity;
    const pnlPercent = ((exitPrice - trade.entryPrice) / trade.entryPrice) * 100;

    // Update trade
    trade.currentPrice = exitPrice;
    trade.status = "closed";
    trade.closedAt = new Date();
    trade.pnl = pnl;
    trade.pnlPercent = pnlPercent;
    trade.reason = "Manual close";

    // Update portfolio
    const portfolio = this.getPortfolio(userId);
    const tradeValue = trade.quantity * trade.entryPrice;
    portfolio.usedMargin -= tradeValue;
    portfolio.availableBalance += tradeValue + pnl;
    portfolio.currentBalance += pnl;
    portfolio.realizedPnL += pnl;
    portfolio.totalOpenPositions -= 1;
    portfolio.totalClosedTrades += 1;

    // Update total P&L
    this.updatePortfolioMetrics(userId);

    return trade;
  }

  /**
   * Update trade price and check for stop loss / take profit
   */
  updateTradePrice(userId: string, tradeId: string, newPrice: number): PaperTrade | null {
    const userTrades = this.trades.get(userId) || [];
    const trade = userTrades.find((t) => t.id === tradeId);

    if (!trade || trade.status !== "open") {
      return null;
    }

    trade.currentPrice = newPrice;

    // Check stop loss
    if (newPrice <= trade.stopLoss) {
      return this.closeTrade(userId, tradeId, trade.stopLoss);
    }

    // Check take profit
    if (newPrice >= trade.takeProfit) {
      return this.closeTrade(userId, tradeId, trade.takeProfit);
    }

    return trade;
  }

  /**
   * Get all trades for a user
   */
  getUserTrades(userId: string): PaperTrade[] {
    return this.trades.get(userId) || [];
  }

  /**
   * Get open trades for a user
   */
  getOpenTrades(userId: string): PaperTrade[] {
    const userTrades = this.trades.get(userId) || [];
    return userTrades.filter((t) => t.status === "open");
  }

  /**
   * Get closed trades for a user
   */
  getClosedTrades(userId: string): PaperTrade[] {
    const userTrades = this.trades.get(userId) || [];
    return userTrades.filter((t) => t.status === "closed");
  }

  /**
   * Calculate unrealized P&L for open positions
   */
  calculateUnrealizedPnL(userId: string): number {
    const openTrades = this.getOpenTrades(userId);
    return openTrades.reduce((sum, trade) => {
      const pnl = (trade.currentPrice - trade.entryPrice) * trade.quantity;
      return sum + pnl;
    }, 0);
  }

  /**
   * Update portfolio metrics
   */
  private updatePortfolioMetrics(userId: string): void {
    const portfolio = this.getPortfolio(userId);
    const userTrades = this.trades.get(userId) || [];

    // Calculate unrealized P&L
    const openTrades = userTrades.filter((t) => t.status === "open");
    portfolio.unrealizedPnL = openTrades.reduce((sum, trade) => {
      const pnl = (trade.currentPrice - trade.entryPrice) * trade.quantity;
      return sum + pnl;
    }, 0);

    // Calculate total P&L
    portfolio.totalPnL = portfolio.realizedPnL + portfolio.unrealizedPnL;

    // Calculate win rate
    const closedTrades = userTrades.filter((t) => t.status === "closed");
    if (closedTrades.length > 0) {
      const winningTrades = closedTrades.filter((t) => (t.pnl || 0) > 0).length;
      portfolio.winRate = Math.round((winningTrades / closedTrades.length) * 100);
    }

    // Calculate max drawdown (simplified)
    if (closedTrades.length > 0) {
      let peak = this.initialBalance;
      let maxDD = 0;

      closedTrades.forEach((trade) => {
        const balance = this.initialBalance + portfolio.realizedPnL;
        if (balance > peak) peak = balance;
        const dd = ((peak - balance) / peak) * 100;
        if (dd > maxDD) maxDD = dd;
      });

      portfolio.maxDrawdown = Math.round(maxDD * 100) / 100;
    }
  }

  /**
   * Get portfolio summary
   */
  getPortfolioSummary(userId: string): any {
    const portfolio = this.getPortfolio(userId);
    const userTrades = this.trades.get(userId) || [];
    const openTrades = userTrades.filter((t) => t.status === "open");
    const closedTrades = userTrades.filter((t) => t.status === "closed");

    return {
      ...portfolio,
      openTrades: openTrades.length,
      closedTrades: closedTrades.length,
      totalTrades: userTrades.length,
      profitFactor:
        closedTrades.length > 0
          ? closedTrades
              .filter((t) => (t.pnl || 0) > 0)
              .reduce((sum, t) => sum + (t.pnl || 0), 0) /
            Math.abs(
              closedTrades
                .filter((t) => (t.pnl || 0) < 0)
                .reduce((sum, t) => sum + (t.pnl || 0), 0) || 1
            )
          : 0,
    };
  }
}

// Singleton instance
let paperTradingEngine: PaperTradingEngine | null = null;

export function getPaperTradingEngine(): PaperTradingEngine {
  if (!paperTradingEngine) {
    paperTradingEngine = new PaperTradingEngine();
  }
  return paperTradingEngine;
}
