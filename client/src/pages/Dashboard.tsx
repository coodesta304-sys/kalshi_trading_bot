import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { trpc } from "@/lib/trpc";
import { TrendingUpIcon, AlertCircle, Loader2 } from "lucide-react";
import { useEffect, useState } from "react";

export default function Dashboard() {
  const { user, isAuthenticated } = useAuth();
  const [autoRefresh, setAutoRefresh] = useState(true);

  // Fetch real data from RapidAPI
  const predictionsQuery = trpc.trading.getPredictions.useQuery();
  const signalsQuery = trpc.trading.getSignals.useQuery();
  const portfolioQuery = trpc.trading.getPortfolio.useQuery(undefined, {
    enabled: isAuthenticated,
  });
  const tradesQuery = trpc.trading.getTrades.useQuery(undefined, {
    enabled: isAuthenticated,
  });
  const trendsQuery = trpc.news.getTrends.useQuery();

  // Auto-refresh every 10 seconds
  useEffect(() => {
    if (!autoRefresh) return;

    const interval = setInterval(() => {
      predictionsQuery.refetch();
      signalsQuery.refetch();
      portfolioQuery.refetch();
      tradesQuery.refetch();
      trendsQuery.refetch();
    }, 10000);

    return () => clearInterval(interval);
  }, [autoRefresh, predictionsQuery, signalsQuery, portfolioQuery, tradesQuery, trendsQuery]);

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle>Kalshi AI Trading Bot</CardTitle>
            <CardDescription>Sign in to access your trading dashboard</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-slate-600 mb-4">
              Please log in to view your portfolio and trading activity.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-4xl font-bold text-white">Trading Dashboard</h1>
            <p className="text-slate-400 mt-2">Welcome, {user?.name || "Trader"}</p>
          </div>
          <div className="flex gap-2">
            <Button
              variant={autoRefresh ? "default" : "outline"}
              onClick={() => setAutoRefresh(!autoRefresh)}
              size="sm"
            >
              {autoRefresh ? "Auto-Refresh: ON" : "Auto-Refresh: OFF"}
            </Button>
            <Button variant="outline" size="sm" onClick={() => predictionsQuery.refetch()}>
              Refresh
            </Button>
          </div>
        </div>

        {/* Portfolio Overview */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <Card className="bg-slate-800 border-slate-700">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-slate-300">Total Balance</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-white">
                ${portfolioQuery.data?.totalBalance ? (portfolioQuery.data.totalBalance / 100).toFixed(2) : "10,000.00"}
              </div>
              <p className="text-xs text-slate-400 mt-1">Virtual balance</p>
            </CardContent>
          </Card>

          <Card className="bg-slate-800 border-slate-700">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-slate-300">Available</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-white">
                ${portfolioQuery.data?.availableBalance ? (portfolioQuery.data.availableBalance / 100).toFixed(2) : "10,000.00"}
              </div>
              <p className="text-xs text-slate-400 mt-1">Available to trade</p>
            </CardContent>
          </Card>

          <Card className="bg-slate-800 border-slate-700">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-slate-300">Total P&L</CardTitle>
            </CardHeader>
            <CardContent>
              <div className={`text-2xl font-bold ${portfolioQuery.data?.totalPnL && portfolioQuery.data.totalPnL > 0 ? "text-green-400" : "text-red-400"}`}>
                ${portfolioQuery.data?.totalPnL ? (portfolioQuery.data.totalPnL / 100).toFixed(2) : "0.00"}
              </div>
              <p className="text-xs text-slate-400 mt-1">Realized + Unrealized</p>
            </CardContent>
          </Card>

          <Card className="bg-slate-800 border-slate-700">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-slate-300">Win Rate</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-white">
                {portfolioQuery.data?.winRate || 0}%
              </div>
              <p className="text-xs text-slate-400 mt-1">Profitable trades</p>
            </CardContent>
          </Card>
        </div>

        {/* Main Content Tabs */}
        <Tabs defaultValue="signals" className="w-full">
          <TabsList className="grid w-full grid-cols-4 bg-slate-800">
            <TabsTrigger value="signals">Trading Signals</TabsTrigger>
            <TabsTrigger value="predictions">Predictions</TabsTrigger>
            <TabsTrigger value="trades">My Trades</TabsTrigger>
            <TabsTrigger value="trends">Trends</TabsTrigger>
          </TabsList>

          {/* Trading Signals Tab */}
          <TabsContent value="signals" className="space-y-4">
            <Card className="bg-slate-800 border-slate-700">
              <CardHeader>
                <CardTitle className="text-white">AI Trading Signals</CardTitle>
                <CardDescription className="text-slate-400">Opportunities detected by AI models</CardDescription>
              </CardHeader>
              <CardContent>
                {signalsQuery.isLoading ? (
                  <div className="flex items-center justify-center py-8">
                    <Loader2 className="animate-spin text-blue-400" />
                  </div>
                ) : signalsQuery.data && signalsQuery.data.length > 0 ? (
                  <div className="space-y-2 max-h-96 overflow-y-auto">
                    {signalsQuery.data.slice(0, 10).map((signal: any) => (
                      <div key={signal.id} className="flex justify-between items-center p-3 bg-slate-700 rounded-lg hover:bg-slate-600 transition">
                        <div>
                          <p className="font-medium text-white">{signal.ticker}</p>
                          <p className="text-sm text-slate-400">{signal.reasoning}</p>
                        </div>
                        <div className="text-right">
                          <span className={`px-3 py-1 rounded text-sm font-semibold ${
                            signal.signal === "buy" ? "bg-green-900 text-green-200" :
                            signal.signal === "sell" ? "bg-red-900 text-red-200" :
                            "bg-slate-600 text-slate-200"
                          }`}>
                            {signal.signal.toUpperCase()}
                          </span>
                          <p className="text-xs text-slate-400 mt-1">{signal.confidence}% confidence</p>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-slate-400">No signals detected yet</p>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Predictions Tab */}
          <TabsContent value="predictions" className="space-y-4">
            <Card className="bg-slate-800 border-slate-700">
              <CardHeader>
                <CardTitle className="text-white">Market Predictions</CardTitle>
                <CardDescription className="text-slate-400">Real-time predictions from Crene AI</CardDescription>
              </CardHeader>
              <CardContent>
                {predictionsQuery.isLoading ? (
                  <div className="flex items-center justify-center py-8">
                    <Loader2 className="animate-spin text-blue-400" />
                  </div>
                ) : predictionsQuery.data && predictionsQuery.data.length > 0 ? (
                  <div className="space-y-2 max-h-96 overflow-y-auto">
                    {predictionsQuery.data.slice(0, 10).map((pred: any) => (
                      <div key={pred.id} className="flex justify-between items-center p-3 bg-slate-700 rounded-lg">
                        <div>
                          <p className="font-medium text-white">{pred.ticker}</p>
                          <p className="text-sm text-slate-400">{pred.title}</p>
                        </div>
                        <div className="text-right">
                          <p className="font-semibold text-white">${(pred.currentPrice / 100).toFixed(2)}</p>
                          <p className="text-xs text-slate-400">AI: {(pred.predictions.consensus * 100).toFixed(1)}%</p>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-slate-400">No predictions available</p>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* My Trades Tab */}
          <TabsContent value="trades" className="space-y-4">
            <Card className="bg-slate-800 border-slate-700">
              <CardHeader>
                <CardTitle className="text-white">Paper Trading History</CardTitle>
                <CardDescription className="text-slate-400">Your virtual trades</CardDescription>
              </CardHeader>
              <CardContent>
                {tradesQuery.isLoading ? (
                  <div className="flex items-center justify-center py-8">
                    <Loader2 className="animate-spin text-blue-400" />
                  </div>
                ) : tradesQuery.data && tradesQuery.data.length > 0 ? (
                  <div className="space-y-2 max-h-96 overflow-y-auto">
                    {tradesQuery.data.map((trade: any) => (
                      <div key={trade.id} className="flex justify-between items-center p-3 bg-slate-700 rounded-lg">
                        <div>
                          <p className="font-medium text-white">{trade.ticker}</p>
                          <p className="text-sm text-slate-400">
                            {trade.side === "buy" ? "BUY" : "SELL"} {trade.quantity} @ ${(trade.entryPrice / 100).toFixed(2)}
                          </p>
                        </div>
                        <div className="text-right">
                          <span className={`px-2 py-1 rounded text-xs font-medium ${
                            trade.status === "closed" ? "bg-slate-600 text-slate-200" :
                            "bg-blue-900 text-blue-200"
                          }`}>
                            {trade.status.toUpperCase()}
                          </span>
                          {trade.pnl && (
                            <p className={`text-sm font-semibold mt-1 ${trade.pnl > 0 ? "text-green-400" : "text-red-400"}`}>
                              ${(trade.pnl / 100).toFixed(2)}
                            </p>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-slate-400">No trades yet</p>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Trends Tab */}
          <TabsContent value="trends" className="space-y-4">
            <Card className="bg-slate-800 border-slate-700">
              <CardHeader>
                <CardTitle className="text-white">Trending Topics</CardTitle>
                <CardDescription className="text-slate-400">Popular topics on Twitter/X</CardDescription>
              </CardHeader>
              <CardContent>
                {trendsQuery.isLoading ? (
                  <div className="flex items-center justify-center py-8">
                    <Loader2 className="animate-spin text-blue-400" />
                  </div>
                ) : trendsQuery.data && trendsQuery.data.length > 0 ? (
                  <div className="flex flex-wrap gap-2">
                    {trendsQuery.data.slice(0, 15).map((trend: string, idx: number) => (
                      <span key={idx} className="px-3 py-1 bg-blue-900 text-blue-200 rounded-full text-sm">
                        {trend}
                      </span>
                    ))}
                  </div>
                ) : (
                  <p className="text-slate-400">No trends available</p>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
