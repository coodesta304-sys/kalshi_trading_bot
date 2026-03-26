import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { trpc } from "@/lib/trpc";
import { Bell, Trash2, CheckCheck, AlertCircle, TrendingUp, TrendingDown } from "lucide-react";
import { useEffect, useState } from "react";
import { useLocation } from "wouter";

export default function Notifications() {
  const { user, isAuthenticated } = useAuth();
  const [, navigate] = useLocation();
  const [autoRefresh, setAutoRefresh] = useState(true);

  const notificationsQuery = trpc.notifications.getNotifications.useQuery({ unreadOnly: false });
  const markAsReadMutation = trpc.notifications.markAsRead.useMutation();
  const clearAllMutation = trpc.notifications.clearAll.useMutation();

  // Auto-refresh notifications
  useEffect(() => {
    if (!autoRefresh) return;

    const interval = setInterval(() => {
      notificationsQuery.refetch();
    }, 10000); // Refresh every 10 seconds

    return () => clearInterval(interval);
  }, [autoRefresh, notificationsQuery]);

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center">
        <div className="text-center">
          <p className="text-white mb-4">Please log in to view notifications</p>
          <Button onClick={() => navigate("/")} variant="default">
            Go to Home
          </Button>
        </div>
      </div>
    );
  }

  const notifications = notificationsQuery.data || [];
  const unreadCount = notifications.filter((n) => !n.read).length;

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case "trade_executed":
        return <TrendingUp className="w-5 h-5 text-blue-400" />;
      case "profit_target":
        return <TrendingUp className="w-5 h-5 text-green-400" />;
      case "stop_loss":
        return <TrendingDown className="w-5 h-5 text-red-400" />;
      case "signal_detected":
        return <Bell className="w-5 h-5 text-yellow-400" />;
      case "alert":
        return <AlertCircle className="w-5 h-5 text-orange-400" />;
      default:
        return <Bell className="w-5 h-5 text-slate-400" />;
    }
  };

  const getNotificationColor = (type: string) => {
    switch (type) {
      case "trade_executed":
        return "bg-blue-900/20 border-blue-700";
      case "profit_target":
        return "bg-green-900/20 border-green-700";
      case "stop_loss":
        return "bg-red-900/20 border-red-700";
      case "signal_detected":
        return "bg-yellow-900/20 border-yellow-700";
      case "alert":
        return "bg-orange-900/20 border-orange-700";
      default:
        return "bg-slate-800/50 border-slate-700";
    }
  };

  return (
    <div className="min-h-screen bg-slate-900 text-white p-6">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-4xl font-bold text-white">Notifications</h1>
            <p className="text-slate-400 mt-2">
              {unreadCount > 0 ? `${unreadCount} unread notification${unreadCount !== 1 ? "s" : ""}` : "All caught up!"}
            </p>
          </div>
          <div className="flex gap-2">
            <Button
              variant={autoRefresh ? "default" : "outline"}
              onClick={() => setAutoRefresh(!autoRefresh)}
              size="sm"
            >
              {autoRefresh ? "Auto-Refresh: ON" : "Auto-Refresh: OFF"}
            </Button>
            <Button variant="outline" size="sm" onClick={() => notificationsQuery.refetch()}>
              Refresh
            </Button>
            <Button
              variant="destructive"
              size="sm"
              onClick={() => {
                clearAllMutation.mutate();
                notificationsQuery.refetch();
              }}
              disabled={notifications.length === 0}
            >
              <Trash2 className="w-4 h-4 mr-2" />
              Clear All
            </Button>
          </div>
        </div>

        {/* Notifications List */}
        {notificationsQuery.isLoading ? (
          <Card className="bg-slate-800 border-slate-700">
            <CardContent className="p-8 text-center">
              <p className="text-slate-400">Loading notifications...</p>
            </CardContent>
          </Card>
        ) : notifications.length === 0 ? (
          <Card className="bg-slate-800 border-slate-700">
            <CardContent className="p-8 text-center">
              <Bell className="w-12 h-12 text-slate-600 mx-auto mb-4" />
              <p className="text-slate-400">No notifications yet</p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {notifications.map((notification) => (
              <Card
                key={notification.id}
                className={`border cursor-pointer transition-all hover:border-slate-500 ${
                  getNotificationColor(notification.type)
                } ${!notification.read ? "ring-2 ring-blue-500" : ""}`}
              >
                <CardContent className="p-4">
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-4 flex-1">
                      <div className="mt-1">{getNotificationIcon(notification.type)}</div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="font-semibold text-white">{notification.title}</h3>
                          {!notification.read && (
                            <Badge variant="secondary" className="bg-blue-600 text-white">
                              New
                            </Badge>
                          )}
                        </div>
                        <p className="text-slate-300 text-sm mb-2">{notification.message}</p>
                        <p className="text-slate-500 text-xs">
                          {new Date(notification.createdAt).toLocaleString()}
                        </p>
                      </div>
                    </div>
                    {!notification.read && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          markAsReadMutation.mutate({ notificationId: notification.id });
                          notificationsQuery.refetch();
                        }}
                        className="ml-4"
                      >
                        <CheckCheck className="w-4 h-4" />
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
