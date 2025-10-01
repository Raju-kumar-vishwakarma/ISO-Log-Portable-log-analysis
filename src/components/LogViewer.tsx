import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { useQuery } from "@tanstack/react-query";
import { Skeleton } from "@/components/ui/skeleton";
import AdvancedSearch from "@/components/AdvancedSearch";

interface LogEntry {
  id: string;
  timestamp: string;
  source_name: string;
  level: string;
  message: string;
  ip_address?: string;
}

const LogViewer = () => {
  const [filters, setFilters] = useState<any>({
    query: "",
    tags: [],
  });

  const { data: logs = [], isLoading, refetch } = useQuery({
    queryKey: ['logs', filters],
    queryFn: async () => {
      let query = supabase
        .from('logs')
        .select('*')
        .order('timestamp', { ascending: false })
        .limit(100);

      if (filters.level && filters.level !== "all") {
        query = query.eq('level', filters.level);
      }

      if (filters.source && filters.source !== "all") {
        query = query.eq('source_name', filters.source);
      }

      if (filters.query) {
        query = query.or(`message.ilike.%${filters.query}%,source_name.ilike.%${filters.query}%`);
      }

      if (filters.ipAddress) {
        query = query.ilike('ip_address', `%${filters.ipAddress}%`);
      }

      if (filters.startDate) {
        query = query.gte('timestamp', filters.startDate.toISOString());
      }

      if (filters.endDate) {
        query = query.lte('timestamp', filters.endDate.toISOString());
      }

      const { data, error } = await query;
      if (error) throw error;
      return data as LogEntry[];
    },
  });

  const { data: sources = [] } = useQuery({
    queryKey: ['log-sources'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('logs')
        .select('source_name')
        .limit(1000);
      
      if (error) throw error;
      const uniqueSources = [...new Set(data.map(log => log.source_name))];
      return uniqueSources;
    },
  });

  useEffect(() => {
    const channel = supabase
      .channel('logs-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'logs'
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

  const getLevelColor = (level: string) => {
    switch (level.toUpperCase()) {
      case "CRITICAL":
        return "bg-destructive text-destructive-foreground";
      case "ERROR":
        return "bg-destructive/80 text-destructive-foreground";
      case "WARNING":
        return "bg-warning text-warning-foreground";
      case "INFO":
        return "bg-primary/20 text-primary";
      default:
        return "bg-muted text-muted-foreground";
    }
  };

  return (
    <div className="space-y-6">
      <AdvancedSearch onSearch={setFilters} sources={sources} />

      <div className="space-y-2">
        {isLoading ? (
          <div className="space-y-2">
            {[...Array(5)].map((_, i) => (
              <Card key={i}>
                <CardContent className="py-4">
                  <Skeleton className="h-20 w-full" />
                </CardContent>
              </Card>
            ))}
          </div>
        ) : logs.length === 0 ? (
          <Card>
            <CardContent className="py-8 text-center text-muted-foreground">
              No logs found. Import log files to get started.
            </CardContent>
          </Card>
        ) : (
          logs.map((log) => (
            <Card key={log.id} className="hover:bg-accent/50 transition-colors">
              <CardContent className="py-4">
                <div className="flex items-start gap-4">
                  <Badge className={getLevelColor(log.level)}>
                    {log.level}
                  </Badge>
                  <div className="flex-1 space-y-1">
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <span>{new Date(log.timestamp).toLocaleString()}</span>
                      <span>•</span>
                      <span>{log.source_name}</span>
                      {log.ip_address && (
                        <>
                          <span>•</span>
                          <span>{log.ip_address}</span>
                        </>
                      )}
                    </div>
                    <p className="text-sm">{log.message}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
};

export default LogViewer;