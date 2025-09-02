import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { AlertTriangle, CheckCircle2, Shield, Archive, RefreshCw } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface SystemAlert {
  id: string;
  type: "security" | "system" | "payment";
  severity: "critical" | "high" | "medium" | "low";
  title: string;
  description: string;
  createdAt: string;
  resolved: boolean;
}

const SystemAlerts = () => {
  const { toast } = useToast();
  const [alerts, setAlerts] = useState<SystemAlert[]>([
    {
      id: "ALT001",
      type: "security",
      severity: "critical",
      title: "Multiple failed login attempts",
      description: "Detected 15 failed login attempts from IP 102.89.10.23",
      createdAt: new Date().toISOString(),
      resolved: false,
    },
    {
      id: "ALT002",
      type: "payment",
      severity: "high",
      title: "Gateway timeout spikes",
      description: "MTN MoMo gateway reporting elevated timeout rates",
      createdAt: new Date().toISOString(),
      resolved: false,
    },
    {
      id: "ALT003",
      type: "system",
      severity: "medium",
      title: "Scheduled maintenance upcoming",
      description: "Maintenance window scheduled for Sunday 2:00 AM EAT",
      createdAt: new Date().toISOString(),
      resolved: true,
    },
  ]);

  const severityStyle = (severity: SystemAlert["severity"]) => {
    switch (severity) {
      case "critical":
        return "bg-red-100 text-red-700";
      case "high":
        return "bg-red-100 text-red-700";
      case "medium":
        return "bg-gray-100 text-gray-700";
      case "low":
        return "bg-blue-100 text-blue-700";
      default:
        return "bg-gray-100 text-gray-700";
    }
  };

  const resolveAlert = (id: string) => {
    setAlerts(prev => prev.map(a => a.id === id ? { ...a, resolved: true } : a));
    toast({ title: "Alert resolved", description: `Alert ${id} marked as resolved` });
  };

  const archiveResolved = () => {
    setAlerts(prev => prev.filter(a => !a.resolved));
    toast({ title: "Archived", description: "Resolved alerts archived" });
  };

  const refresh = () => {
    toast({ title: "Refreshed", description: "Latest alerts fetched" });
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold">System Alerts</h1>
          <p className="text-muted-foreground">Monitor and manage system-wide alerts</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={refresh}>
            <RefreshCw className="h-4 w-4 mr-2" /> Refresh
          </Button>
          <Button variant="outline" onClick={archiveResolved}>
            <Archive className="h-4 w-4 mr-2" /> Archive resolved
          </Button>
        </div>
      </div>

        <Card className="border border-blue-200 shadow-sm bg-white">
        <Card className="border border-blue-200 shadow-lg bg-white">
            <CardTitle className="text-xs font-bold text-black">Total Alerts</CardTitle>
            <AlertTriangle className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent className="pt-2">
            <div className="text-lg font-bold text-black">{alerts.length}</div>
            <p className="text-xs text-gray-600">All severities</p>
          </CardContent>
        <Card className="border border-blue-200 shadow-sm bg-white">
        <Card className="border border-blue-200 shadow-lg bg-white">
            <CardTitle className="text-xs font-bold text-black">Open</CardTitle>
            <Activity className="h-4 w-4 text-gray-600" />
          </CardHeader>
          <CardContent className="pt-2">
            <div className="text-lg font-bold text-gray-800">{alerts.filter(a => !a.resolved).length}</div>
            <p className="text-xs text-gray-600">Needs attention</p>
          </CardContent>
        <Card className="border border-blue-200 shadow-sm bg-white">
        <Card className="border border-blue-200 shadow-lg bg-white">
            <CardTitle className="text-xs font-bold text-black">Resolved</CardTitle>
            <CheckCircle2 className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent className="pt-2">
            <div className="text-lg font-bold text-blue-600">{alerts.filter(a => a.resolved).length}</div>
            <p className="text-xs text-gray-600">Awaiting archival</p>
          </CardContent>
        </Card>
      </div>

      <div className="space-y-4">
        {alerts.map(alert => (
          <Card key={alert.id} className="border border-blue-200 shadow-sm bg-white hover:shadow-md transition-shadow">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center">
                    <AlertTriangle className="h-4 w-4 text-blue-600" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-semibold text-base text-black">{alert.title}</h3>
                      <Badge className={severityStyle(alert.severity)}>{alert.severity}</Badge>
                      <Badge variant="outline" className="capitalize">
                        <Shield className="h-3 w-3 mr-1" /> {alert.type}
                      </Badge>
                      {alert.resolved && (
                        <Badge variant="outline" className="text-blue-700 border-blue-200">
                          <CheckCircle2 className="h-3 w-3 mr-1" /> Resolved
                        </Badge>
                      )}
                    </div>
                    <p className="text-xs text-gray-600">{alert.description}</p>
                    <p className="text-xs text-gray-500 mt-1">{new Date(alert.createdAt).toLocaleString()}</p>
                  </div>
                </div>
                <div className="flex gap-2">
                  {!alert.resolved && (
                    <Button size="sm" variant="outline" onClick={() => resolveAlert(alert.id)} className="border-blue-200 text-blue-700 hover:bg-blue-50">
                      Resolve
                    </Button>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default SystemAlerts;

