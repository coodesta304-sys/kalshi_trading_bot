import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { TrendingUpIcon, BarChart3Icon, BrainIcon, ShieldIcon } from "lucide-react";
import { getLoginUrl } from "@/const";
import { useLocation } from "wouter";

export default function Home() {
  const { isAuthenticated } = useAuth();
  const [, navigate] = useLocation();

  if (isAuthenticated) {
    navigate("/dashboard");
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white">
      {/* Navigation */}
      <nav className="border-b border-slate-700 bg-slate-900/50 backdrop-blur">
        <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">
          <div className="text-2xl font-bold">Kalshi AI Trading Bot</div>
          <Button
            onClick={() => (window.location.href = getLoginUrl())}
            className="bg-blue-600 hover:bg-blue-700"
          >
            Sign In
          </Button>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="max-w-7xl mx-auto px-6 py-20">
        <div className="text-center mb-16">
          <h1 className="text-5xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent">
            Intelligent Trading on Kalshi
          </h1>
          <p className="text-xl text-slate-300 mb-8 max-w-2xl mx-auto">
            Harness the power of AI-driven decision making combined with real-time market analysis to trade prediction markets with confidence.
          </p>
          <Button
            size="lg"
            onClick={() => (window.location.href = getLoginUrl())}
            className="bg-blue-600 hover:bg-blue-700 text-lg px-8 py-6"
          >
            Get Started Now
          </Button>
        </div>
      </section>

      {/* Features Section */}
      <section className="max-w-7xl mx-auto px-6 py-16">
        <h2 className="text-3xl font-bold text-center mb-12">Why Choose Our Bot?</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card className="bg-slate-800 border-slate-700">
            <CardHeader>
              <BrainIcon className="w-8 h-8 text-blue-400 mb-2" />
              <CardTitle className="text-white">AI Analysis</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-slate-300">GPT-4o-mini powered sentiment analysis of market news and events</p>
            </CardContent>
          </Card>

          <Card className="bg-slate-800 border-slate-700">
            <CardHeader>
              <BarChart3Icon className="w-8 h-8 text-green-400 mb-2" />
              <CardTitle className="text-white">Technical Analysis</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-slate-300">RSI, momentum, and trend analysis for data-driven decisions</p>
            </CardContent>
          </Card>

          <Card className="bg-slate-800 border-slate-700">
            <CardHeader>
              <ShieldIcon className="w-8 h-8 text-red-400 mb-2" />
              <CardTitle className="text-white">Risk Management</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-slate-300">Automatic stop loss, take profit, and position sizing</p>
            </CardContent>
          </Card>

          <Card className="bg-slate-800 border-slate-700">
            <CardHeader>
              <TrendingUpIcon className="w-8 h-8 text-yellow-400 mb-2" />
              <CardTitle className="text-white">24/7 Monitoring</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-slate-300">Continuous market monitoring and real-time trade execution</p>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* CTA Section */}
      <section className="max-w-7xl mx-auto px-6 py-16 text-center">
        <h2 className="text-3xl font-bold mb-6">Ready to Start Trading?</h2>
        <p className="text-xl text-slate-300 mb-8">Join thousands of traders using AI-powered strategies on Kalshi</p>
        <Button
          size="lg"
          onClick={() => (window.location.href = getLoginUrl())}
          className="bg-blue-600 hover:bg-blue-700 text-lg px-8 py-6"
        >
          Sign Up Now
        </Button>
      </section>

      {/* Footer */}
      <footer className="border-t border-slate-700 bg-slate-900/50 mt-20">
        <div className="max-w-7xl mx-auto px-6 py-8 text-center text-slate-400">
          <p>© 2026 Kalshi AI Trading Bot. Demo Environment - Paper Trading Only.</p>
        </div>
      </footer>
    </div>
  );
}
