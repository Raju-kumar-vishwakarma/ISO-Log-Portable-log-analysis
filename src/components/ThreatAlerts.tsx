import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { AlertTriangle, CheckCircle, Clock, XCircle, RefreshCw } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useQuery } from "@tanstack/react-query";
import { toast } from "@/hooks/use-toast";
import { Skeleton } from "@/components/ui/skeleton";

interface ThreatAlert {
  id: string;
  severity: string;
  title: string;
  description: string;
  source: string;
  status: string;
  affected_systems: string[];
  created_at: string;
}

const ThreatAlerts = () => {
  const { data: alerts = [], isLoading, refetch } = useQuery({
    queryKey: ['threat_alerts'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('threat_alerts')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(50);
      
      if (error) throw error;
      return data as ThreatAlert[];
    },
  });

  useEffect(() => {
    const channel = supabase
      .channel('alerts-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'threat_alerts'
        },
        () => {
          refetch();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [refetch]);

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case "CRITICAL":
        return { bg: "bg-destructive/10", text: "text-destructive" };
      case "HIGH":
        return { bg: "bg-warning/10", text: "text-warning" };
      case "MEDIUM":
        return { bg: "bg-primary/10", text: "text-primary" };
      default:
        return { bg: "bg-muted", text: "text-muted-foreground" };
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "NEW":
        return <AlertTriangle className="w-4 h-4" />;
      case "INVESTIGATING":
        return <Clock className="w-4 h-4" />;
      case "RESOLVED":
        return <CheckCircle className="w-4 h-4" />;
      case "FALSE_POSITIVE":
        return <XCircle className="w-4 h-4" />;
      default:
        return <AlertTriangle className="w-4 h-4" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "NEW":
        return { border: "border-destructive", text: "text-destructive" };
      case "INVESTIGATING":
        return { border: "border-warning", text: "text-warning" };
      case "RESOLVED":
        return { border: "border-success", text: "text-success" };
      case "FALSE_POSITIVE":
        return { border: "border-muted", text: "text-muted-foreground" };
      default:
        return { border: "border-border", text: "text-foreground" };
    }
  };

  const handleUpdateStatus = async (alertId: string, newStatus: string) => {
    const { error } = await supabase
      .from('threat_alerts')
      .update({ 
        status: newStatus as any,
        resolved_at: newStatus === 'RESOLVED' ? new Date().toISOString() : null
      })
      .eq('id', alertId);

    if (error) {
      toast({
        title: "Update failed",
        description: error.message,
        variant: "destructive",
      });
    } else {
      toast({
        title: "Status updated",
        description: `Alert marked as ${newStatus.toLowerCase().replace('_', ' ')}.`,
      });
      refetch();
    }
  };

  const criticalCount = alerts.filter(a => a.severity === "CRITICAL").length;
  const investigatingCount = alerts.filter(a => a.status === "INVESTIGATING").length;
  const resolvedCount = alerts.filter(a => a.status === "RESOLVED").length;

  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-3">
        <Card className="border-l-4 border-l-destructive">
          <CardContent className="pt-6">
            <div className="flex items-center gap-2">
              <AlertTriangle className="w-8 h-8 text-destructive" />
              <div>
                <p className="text-2xl font-bold">{criticalCount}</p>
                <p className="text-sm text-muted-foreground">Critical Alerts</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="border-l-4 border-l-warning">
          <CardContent className="pt-6">
            <div className="flex items-center gap-2">
              <Clock className="w-8 h-8 text-warning" />
              <div>
                <p className="text-2xl font-bold">{investigatingCount}</p>
                <p className="text-sm text-muted-foreground">Investigating</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="border-l-4 border-l-success">
          <CardContent className="pt-6">
            <div className="flex items-center gap-2">
              <CheckCircle className="w-8 h-8 text-success" />
              <div>
                <p className="text-2xl font-bold">{resolvedCount}</p>
                <p className="text-sm text-muted-foreground">Resolved</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <AlertTriangle className="w-5 h-5" />
              Active Threat Alerts
            </div>
            <Button variant="outline" size="sm" onClick={() => refetch()}>
              <RefreshCw className="w-4 h-4 mr-2" />
              Refresh
            </Button>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {isLoading ? (
            <div className="space-y-4">
              {[...Array(3)].map((_, i) => (
                <Skeleton key={i} className="h-32 w-full" />
              ))}
            </div>
          ) : alerts.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              No threat alerts found. System is operating normally.
            </div>
          ) : (
            alerts.map((alert) => (
              <Card key={alert.id} className={`border-l-4 ${getSeverityColor(alert.severity).bg}`}>
                <CardContent className="pt-6 space-y-4">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 space-y-2">
                      <div className="flex items-center gap-2">
                        <Badge className={`${getSeverityColor(alert.severity).bg} ${getSeverityColor(alert.severity).text}`}>
                          {alert.severity}
                        </Badge>
                        <Badge variant="outline" className={`${getStatusColor(alert.status).border} ${getStatusColor(alert.status).text}`}>
                          {getStatusIcon(alert.status)}
                          <span className="ml-1">{alert.status.replace('_', ' ')}</span>
                        </Badge>
                      </div>
                      <h3 className="font-semibold text-lg">{alert.title}</h3>
                      <p className="text-sm text-muted-foreground">{alert.description}</p>
                      <div className="flex items-center gap-4 text-xs text-muted-foreground">
                        <span>{new Date(alert.created_at).toLocaleString()}</span>
                        <span>•</span>
                        <span>Source: {alert.source}</span>
                      </div>
                      {alert.affected_systems && alert.affected_systems.length > 0 && (
                        <div className="flex gap-1 flex-wrap">
                          {alert.affected_systems.map((system, idx) => (
                            <Badge key={idx} variant="secondary" className="text-xs">
                              {system}
                            </Badge>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="flex gap-2">
                    {alert.status === "NEW" && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleUpdateStatus(alert.id, "INVESTIGATING")}
                      >
                        Investigate
                      </Button>
                    )}
                    {alert.status === "INVESTIGATING" && (
                      <>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleUpdateStatus(alert.id, "RESOLVED")}
                        >
                          Mark Resolved
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleUpdateStatus(alert.id, "FALSE_POSITIVE")}
                        >
                          False Positive
                        </Button>
                      </>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default ThreatAlerts;