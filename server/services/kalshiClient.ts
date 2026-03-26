/**
 * Kalshi API Client
 * Handles all communication with Kalshi Demo/Production API
 * Documentation: https://docs.kalshi.com
 */

import axios, { AxiosInstance } from "axios";
import { ENV } from "../_core/env";

interface KalshiConfig {
  baseURL: string;
  apiKey: string;
  keyId: string;
}

interface OrderRequest {
  ticker: string;
  side: "yes" | "no";
  quantity: number;
  limitPrice?: number;
  clientOrderId?: string;
}

interface OrderResponse {
  orderId: string;
  ticker: string;
  side: "yes" | "no";
  quantity: number;
  limitPrice: number;
  status: string;
  createdAt: string;
}

interface MarketData {
  id: string;
  ticker: string;
  title: string;
  description: string;
  category: string;
  expirationDate: string;
  currentPrice: number; // 0-10000 (cents)
  yesPrice: number;
  noPrice: number;
  volume24h: number;
}

interface PortfolioData {
  balance: number; // In cents
  positions: Array<{
    ticker: string;
    quantity: number;
    currentPrice: number;
    unrealizedPnL: number;
  }>;
}

export class KalshiClient {
  private client: AxiosInstance;
  private config: KalshiConfig;

  constructor(config?: Partial<KalshiConfig>) {
    this.config = {
      baseURL: config?.baseURL || "https://demo-api.kalshi.co",
      apiKey: config?.apiKey || process.env.KALSHI_API_KEY || "",
      keyId: config?.keyId || process.env.KALSHI_KEY_ID || "",
    };

    this.client = axios.create({
      baseURL: this.config.baseURL,
      timeout: 10000,
    });

    // Add request interceptor for signing
    this.client.interceptors.request.use((config) => {
      if (!this.config.apiKey || !this.config.keyId) {
        console.warn("[Kalshi] Missing API credentials");
        return config;
      }

      // TODO: Implement RSA signing for Kalshi API
      // For now, we'll add basic headers
      config.headers["KALSHI-ACCESS-KEY"] = this.config.keyId;
      config.headers["KALSHI-ACCESS-TIMESTAMP"] = Date.now().toString();

      return config;
    });
  }

  /**
   * Get all available markets
   */
  async getMarkets(limit: number = 100): Promise<MarketData[]> {
    try {
      const response = await this.client.get("/trade-api/v2/markets", {
        params: { limit },
      });
      return response.data.markets || [];
    } catch (error) {
      console.error("[Kalshi] Error fetching markets:", error);
      return [];
    }
  }

  /**
   * Get specific market data
   */
  async getMarket(ticker: string): Promise<MarketData | null> {
    try {
      const response = await this.client.get(`/trade-api/v2/markets/${ticker}`);
      return response.data || null;
    } catch (error) {
      console.error(`[Kalshi] Error fetching market ${ticker}:`, error);
      return null;
    }
  }

  /**
   * Get user portfolio
   */
  async getPortfolio(): Promise<PortfolioData | null> {
    try {
      const response = await this.client.get("/trade-api/v2/portfolio/balance");
      return response.data || null;
    } catch (error) {
      console.error("[Kalshi] Error fetching portfolio:", error);
      return null;
    }
  }

  /**
   * Create a new order
   */
  async createOrder(order: OrderRequest): Promise<OrderResponse | null> {
    try {
      const response = await this.client.post("/trade-api/v2/orders", {
        ticker: order.ticker,
        side: order.side,
        quantity: order.quantity,
        limitPrice: order.limitPrice || 5000, // Default to $50
        clientOrderId: order.clientOrderId,
      });
      return response.data || null;
    } catch (error) {
      console.error("[Kalshi] Error creating order:", error);
      return null;
    }
  }

  /**
   * Cancel an order
   */
  async cancelOrder(orderId: string): Promise<boolean> {
    try {
      await this.client.delete(`/trade-api/v2/orders/${orderId}`);
      return true;
    } catch (error) {
      console.error("[Kalshi] Error cancelling order:", error);
      return false;
    }
  }

  /**
   * Get order history
   */
  async getOrders(limit: number = 50): Promise<OrderResponse[]> {
    try {
      const response = await this.client.get("/trade-api/v2/portfolio/orders", {
        params: { limit },
      });
      return response.data.orders || [];
    } catch (error) {
      console.error("[Kalshi] Error fetching orders:", error);
      return [];
    }
  }

  /**
   * Get order book for a market
   */
  async getOrderBook(ticker: string) {
    try {
      const response = await this.client.get(
        `/trade-api/v2/markets/${ticker}/orderbook`
      );
      return response.data || null;
    } catch (error) {
      console.error(`[Kalshi] Error fetching orderbook for ${ticker}:`, error);
      return null;
    }
  }
}

// Singleton instance
let kalshiClient: KalshiClient | null = null;

export function getKalshiClient(): KalshiClient {
  if (!kalshiClient) {
    kalshiClient = new KalshiClient();
  }
  return kalshiClient;
}
