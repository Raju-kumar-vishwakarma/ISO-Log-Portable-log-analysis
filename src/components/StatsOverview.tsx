import { Card, CardContent } from "@/components/ui/card";
import { Database, AlertTriangle, CheckCircle, Activity } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Skeleton } from "@/components/ui/skeleton";
import { useEffect } from "react";

const StatsOverview = () => {
  const { data: stats, isLoading, refetch } = useQuery({
    queryKey: ['stats_overview'],
    queryFn: async () => {
      const [logsCount, threatsCount, resolvedCount, sourcesCount] = await Promise.all([
        supabase.from('logs').select('*', { count: 'exact', head: true }),
        supabase.from('threat_alerts').select('*', { count: 'exact', head: true }).eq('status', 'NEW'),
        supabase.from('threat_alerts').select('*', { count: 'exact', head: true }).eq('status', 'RESOLVED'),
        supabase.from('log_sources').select('*', { count: 'exact', head: true }).eq('status', 'active'),
      ]);

      return {
        logsProcessed: logsCount.count || 0,
        threatsDetected: threatsCount.count || 0,
        threatsMitigated: resolvedCount.count || 0,
        activeSources: sourcesCount.count || 0,
      };
    },
  });

  useEffect(() => {
    const channel = supabase
      .channel('stats-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
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

  if (isLoading) {
    return (
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {[...Array(4)].map((_, i) => (
          <Card key={i}>
            <CardContent className="p-6">
              <Skeleton className="h-20 w-full" />
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      <Card className="border-l-4 border-l-primary">
        <CardContent className="pt-6">
          <div className="flex items-center gap-4">
            <Database className="w-10 h-10 text-primary" />
            <div>
              <p className="text-2xl font-bold">{stats?.logsProcessed.toLocaleString()}</p>
              <p className="text-sm text-muted-foreground">Logs Processed</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="border-l-4 border-l-destructive">
        <CardContent className="pt-6">
          <div className="flex items-center gap-4">
            <AlertTriangle className="w-10 h-10 text-destructive" />
            <div>
              <p className="text-2xl font-bold">{stats?.threatsDetected}</p>
              <p className="text-sm text-muted-foreground">Active Threats</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="border-l-4 border-l-success">
        <CardContent className="pt-6">
          <div className="flex items-center gap-4">
            <CheckCircle className="w-10 h-10 text-success" />
            <div>
              <p className="text-2xl font-bold">{stats?.threatsMitigated}</p>
              <p className="text-sm text-muted-foreground">Threats Resolved</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="border-l-4 border-l-warning">
        <CardContent className="pt-6">
          <div className="flex items-center gap-4">
            <Activity className="w-10 h-10 text-warning" />
            <div>
              <p className="text-2xl font-bold">{stats?.activeSources}</p>
              <p className="text-sm text-muted-foreground">Active Sources</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default StatsOverview;