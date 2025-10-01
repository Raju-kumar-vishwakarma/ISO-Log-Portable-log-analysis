import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Brain, Sparkles, TrendingUp, AlertTriangle, Loader2 } from "lucide-react";

const AIAnalysis = () => {
  const [query, setQuery] = useState("");
  const [analysis, setAnalysis] = useState<any>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const { toast } = useToast();

  const analyzeWithAI = async () => {
    if (!query.trim()) {
      toast({
        title: "Error",
        description: "Please enter a query for AI analysis",
        variant: "destructive",
      });
      return;
    }

    setIsAnalyzing(true);
    try {
      const { data: logs } = await supabase
        .from("logs")
        .select("*")
        .order("timestamp", { ascending: false })
        .limit(100);

      const { data: threats } = await supabase
        .from("threat_alerts")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(50);

      // This would call your AI edge function
      const response = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/ai-analyze`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
        },
        body: JSON.stringify({
          query,
          logs: logs?.slice(0, 20),
          threats: threats?.slice(0, 10),
        }),
      });

      if (!response.ok) throw new Error("AI analysis failed");

      const result = await response.json();
      setAnalysis(result);
      
      toast({
        title: "Analysis Complete",
        description: "AI has analyzed your security data",
      });
    } catch (error) {
      console.error("AI analysis error:", error);
      toast({
        title: "Analysis Error",
        description: "Failed to complete AI analysis. Make sure AI features are enabled.",
        variant: "destructive",
      });
    } finally {
      setIsAnalyzing(false);
    }
  };

  const quickAnalysis = [
    { label: "Detect Anomalies", query: "Analyze recent logs for unusual patterns or anomalies" },
    { label: "Threat Summary", query: "Provide a summary of recent threat activity" },
    { label: "Security Posture", query: "Assess current security posture based on logs" },
    { label: "Recommendations", query: "Suggest security improvements based on log analysis" },
  ];

  return (
    <div className="space-y-6">
      <Card className="border-primary/30 bg-gradient-to-br from-primary/5 to-accent/5">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Brain className="w-6 h-6 text-primary" />
            AI-Powered Security Analysis
          </CardTitle>
          <CardDescription>
            Leverage AI to analyze logs, detect anomalies, and identify threats
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">Ask AI a Question</label>
            <Textarea
              placeholder="E.g., 'What are the most critical security issues in the last 24 hours?'"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              rows={3}
              className="resize-none"
            />
          </div>

          <div className="flex flex-wrap gap-2">
            {quickAnalysis.map((item) => (
              <Button
                key={item.label}
                variant="outline"
                size="sm"
                onClick={() => setQuery(item.query)}
                className="text-xs"
              >
                <Sparkles className="w-3 h-3 mr-1" />
                {item.label}
              </Button>
            ))}
          </div>

          <Button 
            onClick={analyzeWithAI} 
            disabled={isAnalyzing || !query.trim()}
            className="w-full"
          >
            {isAnalyzing ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Analyzing...
              </>
            ) : (
              <>
                <Brain className="w-4 h-4 mr-2" />
                Analyze with AI
              </>
            )}
          </Button>
        </CardContent>
      </Card>

      {analysis && (
        <div className="grid gap-4 md:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <TrendingUp className="w-5 h-5 text-chart-1" />
                Key Insights
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {analysis.insights?.map((insight: string, index: number) => (
                  <div key={index} className="flex items-start gap-2 p-3 rounded-lg bg-muted/50">
                    <div className="w-2 h-2 rounded-full bg-primary mt-2 flex-shrink-0" />
                    <p className="text-sm">{insight}</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <AlertTriangle className="w-5 h-5 text-chart-4" />
                Detected Issues
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {analysis.issues?.map((issue: any, index: number) => (
                  <div key={index} className="p-3 rounded-lg bg-muted/50 space-y-2">
                    <div className="flex items-center justify-between">
                      <h4 className="font-medium text-sm">{issue.title}</h4>
                      <Badge className={`text-xs ${
                        issue.severity === "CRITICAL" ? "bg-chart-5/20 text-chart-5" :
                        issue.severity === "HIGH" ? "bg-chart-4/20 text-chart-4" :
                        "bg-chart-2/20 text-chart-2"
                      }`}>
                        {issue.severity}
                      </Badge>
                    </div>
                    <p className="text-xs text-muted-foreground">{issue.description}</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      <Card>
        <CardHeader>
          <CardTitle>AI Capabilities</CardTitle>
          <CardDescription>What our AI can help you with</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-3">
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-chart-1/20 flex items-center justify-center">
                  <Brain className="w-4 h-4 text-chart-1" />
                </div>
                <h4 className="font-medium">Anomaly Detection</h4>
              </div>
              <p className="text-sm text-muted-foreground">
                Identify unusual patterns and behaviors in log data
              </p>
            </div>

            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-chart-2/20 flex items-center justify-center">
                  <Sparkles className="w-4 h-4 text-chart-2" />
                </div>
                <h4 className="font-medium">Threat Correlation</h4>
              </div>
              <p className="text-sm text-muted-foreground">
                Connect related security events and identify attack patterns
              </p>
            </div>

            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-chart-3/20 flex items-center justify-center">
                  <TrendingUp className="w-4 h-4 text-chart-3" />
                </div>
                <h4 className="font-medium">Predictive Analysis</h4>
              </div>
              <p className="text-sm text-muted-foreground">
                Forecast potential security issues before they occur
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AIAnalysis;