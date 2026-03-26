import { useAuth } from "@/_core/hooks/useAuth";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { ArrowLeft, TrendingUp, TrendingDown, Target, Zap } from "lucide-react";
import { useLocation } from "wouter";
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";

export default function Reports() {
  const { user, isAuthenticated } = useAuth();
  const [, navigate] = useLocation();
  const [timeframe, setTimeframe] = useState("1M");

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card>
          <CardHeader>
            <CardTitle>Access Denied</CardTitle>
          </CardHeader>
          <CardContent>
            <p>Please sign in to access reports.</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Sample data for charts
  const performanceData = [
    { date: "Mar 1", balance: 10000, trades: 0 },
    { date: "Mar 5", balance: 10250, trades: 3 },
    { date: "Mar 10", balance: 10500, trades: 7 },
    { date: "Mar 15", balance: 10750, trades: 12 },
    { date: "Mar 20", balance: 11000, trades: 18 },
    { date: "Mar 26", balance: 11200, trades: 24 },
  ];

  const tradeStats = [
    { name: "Winning Trades", value: 18, fill: "#10b981" },
    { name: "Losing Trades", value: 6, fill: "#ef4444" },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white">
      {/* Header */}
      <div className="border-b border-slate-700 bg-slate-900/50 backdrop-blur">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate("/dashboard")}
              className="flex items-center gap-2 text-slate-400 hover:text-white transition"
            >
              <ArrowLeft className="w-5 h-5" />
              Back
            </button>
            <h1 className="text-2xl font-bold">Trading Reports</h1>
          </div>
          <div className="flex gap-2">
            {["1W", "1M", "3M", "1Y"].map((period) => (
              <Button
                key={period}
                onClick={() => setTimeframe(period)}
                variant={timeframe === period ? "default" : "outline"}
                className={timeframe === period ? "bg-blue-600" : "border-slate-600"}
              >
                {period}
              </Button>
            ))}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-6 py-8 space-y-6">
        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card className="bg-slate-800 border-slate-700">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-slate-300">Total Return</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-green-400" />
                <span className="text-2xl font-bold text-white">+12%</span>
              </div>
              <p className="text-xs text-slate-400 mt-1">+$1,200 from initial balance</p>
            </CardContent>
          </Card>

          <Card className="bg-slate-800 border-slate-700">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-slate-300">Win Rate</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-2">
                <Target className="w-5 h-5 text-blue-400" />
                <span className="text-2xl font-bold text-white">75%</span>
              </div>
              <p className="text-xs text-slate-400 mt-1">18 wins out of 24 trades</p>
            </CardContent>
          </Card>

          <Card className="bg-slate-800 border-slate-700">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-slate-300">Avg Trade</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-2">
                <Zap className="w-5 h-5 text-yellow-400" />
                <span className="text-2xl font-bold text-white">+$50</span>
              </div>
              <p className="text-xs text-slate-400 mt-1">Average profit per trade</p>
            </CardContent>
          </Card>

          <Card className="bg-slate-800 border-slate-700">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-slate-300">Max Drawdown</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-2">
                <TrendingDown className="w-5 h-5 text-red-400" />
                <span className="text-2xl font-bold text-white">-3.5%</span>
              </div>
              <p className="text-xs text-slate-400 mt-1">Largest losing streak</p>
            </CardContent>
          </Card>
        </div>

        {/* Performance Chart */}
        <Card className="bg-slate-800 border-slate-700">
          <CardHeader>
            <CardTitle className="text-white">Portfolio Performance</CardTitle>
            <CardDescription className="text-slate-400">Balance over time</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={performanceData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#475569" />
                <XAxis dataKey="date" stroke="#94a3b8" />
                <YAxis stroke="#94a3b8" />
                <Tooltip
                  contentStyle={{ backgroundColor: "#1e293b", border: "1px solid #475569" }}
                  labelStyle={{ color: "#f1f5f9" }}
                />
                <Legend />
                <Line
                  type="monotone"
                  dataKey="balance"
                  stroke="#3b82f6"
                  strokeWidth={2}
                  dot={{ fill: "#3b82f6" }}
                  name="Balance ($)"
                />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Trade Statistics */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card className="bg-slate-800 border-slate-700">
            <CardHeader>
              <CardTitle className="text-white">Trade Distribution</CardTitle>
              <CardDescription className="text-slate-400">Wins vs Losses</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={250}>
                <BarChart data={tradeStats}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#475569" />
                  <XAxis dataKey="name" stroke="#94a3b8" />
                  <YAxis stroke="#94a3b8" />
                  <Tooltip
                    contentStyle={{ backgroundColor: "#1e293b", border: "1px solid #475569" }}
                    labelStyle={{ color: "#f1f5f9" }}
                  />
                  <Bar dataKey="value" fill="#3b82f6" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <Card className="bg-slate-800 border-slate-700">
            <CardHeader>
              <CardTitle className="text-white">Monthly Summary</CardTitle>
              <CardDescription className="text-slate-400">March 2026</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex justify-between items-center p-3 bg-slate-700 rounded">
                <span className="text-slate-300">Total Trades</span>
                <span className="text-white font-bold">24</span>
              </div>
              <div className="flex justify-between items-center p-3 bg-slate-700 rounded">
                <span className="text-slate-300">Winning Trades</span>
                <span className="text-green-400 font-bold">18</span>
              </div>
              <div className="flex justify-between items-center p-3 bg-slate-700 rounded">
                <span className="text-slate-300">Losing Trades</span>
                <span className="text-red-400 font-bold">6</span>
              </div>
              <div className="flex justify-between items-center p-3 bg-slate-700 rounded">
                <span className="text-slate-300">Total P&L</span>
                <span className="text-blue-400 font-bold">+$1,200</span>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
