/**
 * Risk Manager Service
 * Handles position sizing, stop loss, take profit, and portfolio risk management
 */

interface Position {
  ticker: string;
  quantity: number;
  entryPrice: number;
  currentPrice: number;
}

interface PortfolioMetrics {
  totalBalance: number;
  usedMargin: number;
  availableBalance: number;
  totalPositionValue: number;
  unrealizedPnL: number;
  realizedPnL: number;
  winRate: number;
  maxDrawdown: number;
  sharpeRatio: number;
}

interface RiskLimits {
  maxPositionSize: number; // % of balance
  maxDailyLoss: number; // % of balance
  maxOpenPositions: number;
  stopLossPercent: number; // % of entry price
  takeProfitPercent: number; // % of entry price
  maxLeverage: number;
}

export class RiskManager {
  private riskLimits: RiskLimits;

  constructor(limits?: Partial<RiskLimits>) {
    this.riskLimits = {
      maxPositionSize: limits?.maxPositionSize || 5, // 5% of balance
      maxDailyLoss: limits?.maxDailyLoss || 10, // 10% of balance
      maxOpenPositions: limits?.maxOpenPositions || 10,
      stopLossPercent: limits?.stopLossPercent || 2, // 2%
      takeProfitPercent: limits?.takeProfitPercent || 1.5, // 1.5%
      maxLeverage: limits?.maxLeverage || 1, // No leverage for now
    };
  }

  /**
   * Calculate position size based on risk parameters
   */
  calculatePositionSize(
    accountBalance: number,
    entryPrice: number,
    riskPercentage: number = 1 // Risk 1% of account per trade
  ): number {
    const riskAmount = (accountBalance * riskPercentage) / 100;
    const stopLossAmount =
      (entryPrice * this.riskLimits.stopLossPercent) / 100;

    if (stopLossAmount === 0) return 0;

    const positionSize = Math.floor(riskAmount / stopLossAmount);
    const maxPositionValue =
      (accountBalance * this.riskLimits.maxPositionSize) / 100;

    // Don't exceed max position size
    return Math.min(positionSize, Math.floor(maxPositionValue / entryPrice));
  }

  /**
   * Calculate stop loss and take profit levels
   */
  calculateExitLevels(entryPrice: number): {
    stopLoss: number;
    takeProfit: number;
  } {
    const stopLoss = Math.floor(
      entryPrice * (1 - this.riskLimits.stopLossPercent / 100)
    );
    const takeProfit = Math.floor(
      entryPrice * (1 + this.riskLimits.takeProfitPercent / 100)
    );

    return { stopLoss, takeProfit };
  }

  /**
   * Check if trade violates risk limits
   */
  validateTrade(
    accountBalance: number,
    openPositions: Position[],
    proposedPosition: {
      ticker: string;
      quantity: number;
      entryPrice: number;
    }
  ): {
    isValid: boolean;
    reason?: string;
  } {
    // Check max open positions
    if (openPositions.length >= this.riskLimits.maxOpenPositions) {
      return {
        isValid: false,
        reason: `Maximum open positions (${this.riskLimits.maxOpenPositions}) reached`,
      };
    }

    // Check position size
    const proposedPositionValue = proposedPosition.quantity * proposedPosition.entryPrice;
    const maxPositionValue =
      (accountBalance * this.riskLimits.maxPositionSize) / 100;

    if (proposedPositionValue > maxPositionValue) {
      return {
        isValid: false,
        reason: `Position size exceeds limit: ${proposedPositionValue} > ${maxPositionValue}`,
      };
    }

    // Check total exposure
    const totalExposure = openPositions.reduce(
      (sum, pos) => sum + pos.quantity * pos.currentPrice,
      0
    );

    if (totalExposure + proposedPositionValue > accountBalance * 1.5) {
      return {
        isValid: false,
        reason: "Total portfolio exposure too high",
      };
    }

    return { isValid: true };
  }

  /**
   * Calculate portfolio metrics
   */
  calculatePortfolioMetrics(
    accountBalance: number,
    positions: Position[],
    trades: Array<{
      entryPrice: number;
      exitPrice: number;
      quantity: number;
      timestamp: Date;
    }>
  ): PortfolioMetrics {
    // Calculate position values
    let totalPositionValue = 0;
    let unrealizedPnL = 0;

    for (const position of positions) {
      const positionValue = position.quantity * position.currentPrice;
      totalPositionValue += positionValue;

      const pnl =
        (position.currentPrice - position.entryPrice) * position.quantity;
      unrealizedPnL += pnl;
    }

    // Calculate realized P&L
    let realizedPnL = 0;
    let profitableTrades = 0;

    for (const trade of trades) {
      const tradePnL = (trade.exitPrice - trade.entryPrice) * trade.quantity;
      realizedPnL += tradePnL;
      if (tradePnL > 0) profitableTrades++;
    }

    const winRate =
      trades.length > 0 ? (profitableTrades / trades.length) * 100 : 0;

    // Calculate drawdown (simplified)
    const peakBalance = accountBalance + Math.abs(realizedPnL);
    const currentBalance = accountBalance + realizedPnL + unrealizedPnL;
    const maxDrawdown =
      peakBalance > 0 ? ((peakBalance - currentBalance) / peakBalance) * 100 : 0;

    // Calculate Sharpe ratio (simplified)
    const returns = trades.map((t) => (t.exitPrice - t.entryPrice) / t.entryPrice);
    const avgReturn = returns.length > 0 ? returns.reduce((a, b) => a + b) / returns.length : 0;
    const variance =
      returns.length > 1
        ? returns.reduce((sum, r) => sum + Math.pow(r - avgReturn, 2), 0) /
          (returns.length - 1)
        : 0;
    const stdDev = Math.sqrt(variance);
    const sharpeRatio = stdDev > 0 ? avgReturn / stdDev : 0;

    return {
      totalBalance: accountBalance,
      usedMargin: totalPositionValue,
      availableBalance: accountBalance - totalPositionValue,
      totalPositionValue,
      unrealizedPnL,
      realizedPnL,
      winRate: Math.round(winRate),
      maxDrawdown: Math.round(maxDrawdown * 100) / 100,
      sharpeRatio: Math.round(sharpeRatio * 100) / 100,
    };
  }

  /**
   * Check if daily loss limit exceeded
   */
  checkDailyLossLimit(
    accountBalance: number,
    dailyLoss: number
  ): {
    exceeded: boolean;
    remainingLossAllowance: number;
  } {
    const maxDailyLoss = (accountBalance * this.riskLimits.maxDailyLoss) / 100;
    const exceeded = Math.abs(dailyLoss) > maxDailyLoss;

    return {
      exceeded,
      remainingLossAllowance: maxDailyLoss - Math.abs(dailyLoss),
    };
  }

  /**
   * Get current risk metrics
   */
  getRiskMetrics(
    accountBalance: number,
    positions: Position[]
  ): {
    exposurePercent: number;
    leverageRatio: number;
    riskPerTrade: number;
  } {
    const totalExposure = positions.reduce(
      (sum, pos) => sum + pos.quantity * pos.currentPrice,
      0
    );

    const exposurePercent = (totalExposure / accountBalance) * 100;
    const leverageRatio = totalExposure / accountBalance;
    const riskPerTrade = this.riskLimits.stopLossPercent;

    return {
      exposurePercent: Math.round(exposurePercent * 100) / 100,
      leverageRatio: Math.round(leverageRatio * 100) / 100,
      riskPerTrade,
    };
  }
}

// Singleton instance
let riskManager: RiskManager | null = null;

export function getRiskManager(limits?: Partial<RiskLimits>): RiskManager {
  if (!riskManager) {
    riskManager = new RiskManager(limits);
  }
  return riskManager;
}
