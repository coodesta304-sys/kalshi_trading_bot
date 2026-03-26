import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { useState } from "react";
import { toast } from "sonner";
import { ArrowLeft } from "lucide-react";
import { useLocation } from "wouter";

export default function Settings() {
  const { user, isAuthenticated } = useAuth();
  const [, navigate] = useLocation();
  const [isSaving, setIsSaving] = useState(false);

  const [settings, setSettings] = useState({
    maxPositionSize: 5,
    stopLossPercent: 2,
    takeProfitPercent: 1.5,
    maxDailyLoss: 10,
    enableAutoTrading: false,
    enableNotifications: true,
    minConfidenceThreshold: 70,
  });

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card>
          <CardHeader>
            <CardTitle>Access Denied</CardTitle>
          </CardHeader>
          <CardContent>
            <p>Please sign in to access settings.</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  const handleSave = async () => {
    setIsSaving(true);
    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1000));
      toast.success("Settings saved successfully!");
    } catch (error) {
      toast.error("Failed to save settings");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white">
      {/* Header */}
      <div className="border-b border-slate-700 bg-slate-900/50 backdrop-blur">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center gap-4">
          <button
            onClick={() => navigate("/dashboard")}
            className="flex items-center gap-2 text-slate-400 hover:text-white transition"
          >
            <ArrowLeft className="w-5 h-5" />
            Back
          </button>
          <h1 className="text-2xl font-bold">Trading Settings</h1>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-4xl mx-auto px-6 py-8">
        {/* Risk Management */}
        <Card className="bg-slate-800 border-slate-700 mb-6">
          <CardHeader>
            <CardTitle className="text-white">Risk Management</CardTitle>
            <CardDescription className="text-slate-400">
              Configure position sizing and stop loss/take profit levels
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="maxPositionSize" className="text-slate-300">
                  Max Position Size (% of balance)
                </Label>
                <Input
                  id="maxPositionSize"
                  type="number"
                  min="0.1"
                  max="50"
                  step="0.1"
                  value={settings.maxPositionSize}
                  onChange={(e) =>
                    setSettings({ ...settings, maxPositionSize: parseFloat(e.target.value) })
                  }
                  className="bg-slate-700 border-slate-600 text-white"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="stopLossPercent" className="text-slate-300">
                  Stop Loss (%)
                </Label>
                <Input
                  id="stopLossPercent"
                  type="number"
                  min="0.1"
                  max="50"
                  step="0.1"
                  value={settings.stopLossPercent}
                  onChange={(e) =>
                    setSettings({ ...settings, stopLossPercent: parseFloat(e.target.value) })
                  }
                  className="bg-slate-700 border-slate-600 text-white"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="takeProfitPercent" className="text-slate-300">
                  Take Profit (%)
                </Label>
                <Input
                  id="takeProfitPercent"
                  type="number"
                  min="0.1"
                  max="50"
                  step="0.1"
                  value={settings.takeProfitPercent}
                  onChange={(e) =>
                    setSettings({ ...settings, takeProfitPercent: parseFloat(e.target.value) })
                  }
                  className="bg-slate-700 border-slate-600 text-white"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="maxDailyLoss" className="text-slate-300">
                  Max Daily Loss ($)
                </Label>
                <Input
                  id="maxDailyLoss"
                  type="number"
                  min="1"
                  max="1000"
                  step="1"
                  value={settings.maxDailyLoss}
                  onChange={(e) =>
                    setSettings({ ...settings, maxDailyLoss: parseFloat(e.target.value) })
                  }
                  className="bg-slate-700 border-slate-600 text-white"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* AI & Automation */}
        <Card className="bg-slate-800 border-slate-700 mb-6">
          <CardHeader>
            <CardTitle className="text-white">AI & Automation</CardTitle>
            <CardDescription className="text-slate-400">
              Configure AI trading and notification preferences
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="minConfidenceThreshold" className="text-slate-300">
                Minimum Confidence Threshold (%)
              </Label>
              <Input
                id="minConfidenceThreshold"
                type="number"
                min="0"
                max="100"
                step="5"
                value={settings.minConfidenceThreshold}
                onChange={(e) =>
                  setSettings({ ...settings, minConfidenceThreshold: parseFloat(e.target.value) })
                }
                className="bg-slate-700 border-slate-600 text-white"
              />
              <p className="text-sm text-slate-400">
                Only execute trades with AI confidence above this threshold
              </p>
            </div>

            <div className="flex items-center justify-between p-4 bg-slate-700 rounded-lg">
              <div>
                <Label className="text-slate-300 cursor-pointer">Enable Auto Trading</Label>
                <p className="text-sm text-slate-400 mt-1">
                  Automatically execute trades based on AI signals
                </p>
              </div>
              <Switch
                checked={settings.enableAutoTrading}
                onCheckedChange={(checked) =>
                  setSettings({ ...settings, enableAutoTrading: checked })
                }
              />
            </div>

            <div className="flex items-center justify-between p-4 bg-slate-700 rounded-lg">
              <div>
                <Label className="text-slate-300 cursor-pointer">Enable Notifications</Label>
                <p className="text-sm text-slate-400 mt-1">
                  Receive notifications for trades and alerts
                </p>
              </div>
              <Switch
                checked={settings.enableNotifications}
                onCheckedChange={(checked) =>
                  setSettings({ ...settings, enableNotifications: checked })
                }
              />
            </div>
          </CardContent>
        </Card>

        {/* Save Button */}
        <div className="flex gap-4">
          <Button
            onClick={handleSave}
            disabled={isSaving}
            className="bg-blue-600 hover:bg-blue-700 text-white"
          >
            {isSaving ? "Saving..." : "Save Settings"}
          </Button>
          <Button
            onClick={() => navigate("/dashboard")}
            variant="outline"
            className="border-slate-600 text-slate-300 hover:bg-slate-700"
          >
            Cancel
          </Button>
        </div>
      </div>
    </div>
  );
}
