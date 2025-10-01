import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { supabase } from "@/integrations/supabase/client";
import { LineChart, Line, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, AreaChart, Area } from "recharts";
import { TrendingUp, Activity, Target, Zap } from "lucide-react";

const COLORS = ["hsl(var(--chart-1))", "hsl(var(--chart-2))", "hsl(var(--chart-3))", "hsl(var(--chart-4))", "hsl(var(--chart-5))"];

const AnalyticsDashboard = () => {
  // Log level distribution
  const { data: levelData } = useQuery({
    queryKey: ["log-level-distribution"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("logs")
        .select("level");
      
      if (error) throw error;
      
      const distribution = data.reduce((acc: any, log) => {
        acc[log.level] = (acc[log.level] || 0) + 1;
        return acc;
      }, {});
      
      return Object.entries(distribution).map(([name, value]) => ({ name, value }));
    },
  });

  // Timeline data (last 7 days)
  const { data: timelineData } = useQuery({
    queryKey: ["log-timeline"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("logs")
        .select("timestamp, level")
        .gte("timestamp", new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString())
        .order("timestamp", { ascending: true });
      
      if (error) throw error;
      
      // Group by day
      const grouped = data.reduce((acc: any, log) => {
        const day = new Date(log.timestamp).toLocaleDateString();
        if (!acc[day]) {
          acc[day] = { date: day, INFO: 0, WARNING: 0, ERROR: 0, CRITICAL: 0 };
        }
        acc[day][log.level]++;
        return acc;
      }, {});
      
      return Object.values(grouped);
    },
  });

  // Source distribution
  const { data: sourceData } = useQuery({
    queryKey: ["source-distribution"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("logs")
        .select("source_name");
      
      if (error) throw error;
      
      const distribution = data.reduce((acc: any, log) => {
        acc[log.source_name] = (acc[log.source_name] || 0) + 1;
        return acc;
      }, {});
      
      return Object.entries(distribution).map(([name, value]) => ({ name, value }));
    },
  });

  // Threat severity over time
  const { data: threatTimelineData } = useQuery({
    queryKey: ["threat-timeline"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("threat_alerts")
        .select("created_at, severity")
        .gte("created_at", new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString())
        .order("created_at", { ascending: true });
      
      if (error) throw error;
      
      const grouped = data.reduce((acc: any, alert) => {
        const day = new Date(alert.created_at).toLocaleDateString();
        if (!acc[day]) {
          acc[day] = { date: day, LOW: 0, MEDIUM: 0, HIGH: 0, CRITICAL: 0 };
        }
        acc[day][alert.severity]++;
        return acc;
      }, {});
      
      return Object.values(grouped);
    },
  });

  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-4">
        <Card className="bg-gradient-to-br from-chart-1/20 to-chart-1/5 border-chart-1/30">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg Response Time</CardTitle>
            <Zap className="h-4 w-4 text-chart-1" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">45ms</div>
            <p className="text-xs text-muted-foreground">-12% from last week</p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-chart-2/20 to-chart-2/5 border-chart-2/30">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Detection Rate</CardTitle>
            <Target className="h-4 w-4 text-chart-2" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">98.2%</div>
            <p className="text-xs text-muted-foreground">+2.1% from last week</p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-chart-3/20 to-chart-3/5 border-chart-3/30">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">System Uptime</CardTitle>
            <Activity className="h-4 w-4 text-chart-3" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">99.9%</div>
            <p className="text-xs text-muted-foreground">Last 30 days</p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-chart-4/20 to-chart-4/5 border-chart-4/30">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Threat Velocity</CardTitle>
            <TrendingUp className="h-4 w-4 text-chart-4" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">12/hr</div>
            <p className="text-xs text-muted-foreground">-5% from last hour</p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="timeline" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="timeline">Timeline</TabsTrigger>
          <TabsTrigger value="distribution">Distribution</TabsTrigger>
          <TabsTrigger value="sources">Sources</TabsTrigger>
          <TabsTrigger value="threats">Threats</TabsTrigger>
        </TabsList>

        <TabsContent value="timeline" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Log Activity Timeline</CardTitle>
              <CardDescription>Last 7 days log activity by severity</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={350}>
                <AreaChart data={timelineData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis dataKey="date" stroke="hsl(var(--muted-foreground))" />
                  <YAxis stroke="hsl(var(--muted-foreground))" />
                  <Tooltip contentStyle={{ backgroundColor: "hsl(var(--card))", border: "1px solid hsl(var(--border))" }} />
                  <Legend />
                  <Area type="monotone" dataKey="INFO" stackId="1" stroke="hsl(var(--chart-1))" fill="hsl(var(--chart-1))" />
                  <Area type="monotone" dataKey="WARNING" stackId="1" stroke="hsl(var(--chart-2))" fill="hsl(var(--chart-2))" />
                  <Area type="monotone" dataKey="ERROR" stackId="1" stroke="hsl(var(--chart-4))" fill="hsl(var(--chart-4))" />
                  <Area type="monotone" dataKey="CRITICAL" stackId="1" stroke="hsl(var(--chart-5))" fill="hsl(var(--chart-5))" />
                </AreaChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="distribution" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Log Level Distribution</CardTitle>
                <CardDescription>Distribution of log entries by severity</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie data={levelData} cx="50%" cy="50%" labelLine={false} label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`} outerRadius={80} fill="#8884d8" dataKey="value">
                      {levelData?.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Logs by Level</CardTitle>
                <CardDescription>Comparative view of log severities</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={levelData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                    <XAxis dataKey="name" stroke="hsl(var(--muted-foreground))" />
                    <YAxis stroke="hsl(var(--muted-foreground))" />
                    <Tooltip contentStyle={{ backgroundColor: "hsl(var(--card))", border: "1px solid hsl(var(--border))" }} />
                    <Bar dataKey="value" fill="hsl(var(--primary))" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="sources" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Log Sources Distribution</CardTitle>
              <CardDescription>Distribution of logs by source system</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={400}>
                <BarChart data={sourceData} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis type="number" stroke="hsl(var(--muted-foreground))" />
                  <YAxis dataKey="name" type="category" stroke="hsl(var(--muted-foreground))" width={150} />
                  <Tooltip contentStyle={{ backgroundColor: "hsl(var(--card))", border: "1px solid hsl(var(--border))" }} />
                  <Bar dataKey="value" fill="hsl(var(--chart-2))" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="threats" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Threat Activity Timeline</CardTitle>
              <CardDescription>Threats detected over the last 7 days by severity</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={350}>
                <LineChart data={threatTimelineData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis dataKey="date" stroke="hsl(var(--muted-foreground))" />
                  <YAxis stroke="hsl(var(--muted-foreground))" />
                  <Tooltip contentStyle={{ backgroundColor: "hsl(var(--card))", border: "1px solid hsl(var(--border))" }} />
                  <Legend />
                  <Line type="monotone" dataKey="LOW" stroke="hsl(var(--chart-1))" strokeWidth={2} />
                  <Line type="monotone" dataKey="MEDIUM" stroke="hsl(var(--chart-2))" strokeWidth={2} />
                  <Line type="monotone" dataKey="HIGH" stroke="hsl(var(--chart-4))" strokeWidth={2} />
                  <Line type="monotone" dataKey="CRITICAL" stroke="hsl(var(--chart-5))" strokeWidth={2} />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AnalyticsDashboard;