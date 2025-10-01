import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Shield, Database, TrendingUp, FileText, Upload, AlertTriangle, BarChart3, Brain, Briefcase, FileBarChart } from "lucide-react";
import LogViewer from "@/components/LogViewer";
import ThreatAlerts from "@/components/ThreatAlerts";
import StatsOverview from "@/components/StatsOverview";
import Header from "@/components/Header";
import LogUpload from "@/components/LogUpload";
import AnalyticsDashboard from "@/components/AnalyticsDashboard";
import AIAnalysis from "@/components/AIAnalysis";
import IncidentManagement from "@/components/IncidentManagement";
import ReportingSystem from "@/components/ReportingSystem";

const Index = () => {
  const [activeTab, setActiveTab] = useState("overview");

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="container py-8">
        <div className="space-y-8">
          {/* Hero Section */}
          <div className="text-center space-y-4">
            <div className="flex items-center justify-center gap-3 mb-4">
              <Shield className="w-12 h-12 text-primary" />
              <h1 className="text-4xl font-bold text-foreground">
                ISO Log
              </h1>
            </div>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Comprehensive security log analysis and threat detection platform for isolated networks
            </p>
          </div>

          {/* Main Tabs */}
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-4 md:grid-cols-8 lg:w-auto lg:inline-grid">
              <TabsTrigger value="overview" className="gap-2">
                <TrendingUp className="w-4 h-4" />
                <span className="hidden sm:inline">Overview</span>
              </TabsTrigger>
              <TabsTrigger value="analytics" className="gap-2">
                <BarChart3 className="w-4 h-4" />
                <span className="hidden sm:inline">Analytics</span>
              </TabsTrigger>
              <TabsTrigger value="ai" className="gap-2">
                <Brain className="w-4 h-4" />
                <span className="hidden sm:inline">AI Analysis</span>
              </TabsTrigger>
              <TabsTrigger value="logs" className="gap-2">
                <FileText className="w-4 h-4" />
                <span className="hidden sm:inline">Logs</span>
              </TabsTrigger>
              <TabsTrigger value="alerts" className="gap-2">
                <AlertTriangle className="w-4 h-4" />
                <span className="hidden sm:inline">Alerts</span>
              </TabsTrigger>
              <TabsTrigger value="incidents" className="gap-2">
                <Briefcase className="w-4 h-4" />
                <span className="hidden sm:inline">Incidents</span>
              </TabsTrigger>
              <TabsTrigger value="reports" className="gap-2">
                <FileBarChart className="w-4 h-4" />
                <span className="hidden sm:inline">Reports</span>
              </TabsTrigger>
              <TabsTrigger value="upload" className="gap-2">
                <Upload className="w-4 h-4" />
                <span className="hidden sm:inline">Import</span>
              </TabsTrigger>
            </TabsList>

            <TabsContent value="overview" className="space-y-6 mt-6">
              <StatsOverview />
              
              <div className="grid gap-6 md:grid-cols-3">
                <Card className="border-l-4 border-l-primary">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Database className="w-5 h-5" />
                      Multi-Source Collection
                    </CardTitle>
                    <CardDescription>
                      Import and analyze logs from various sources including files, syslog, and APIs
                    </CardDescription>
                  </CardHeader>
                </Card>

                <Card className="border-l-4 border-l-warning">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <AlertTriangle className="w-5 h-5" />
                      Smart Threat Detection
                    </CardTitle>
                    <CardDescription>
                      AI-powered analysis identifies security threats and anomalies in real-time
                    </CardDescription>
                  </CardHeader>
                </Card>

                <Card className="border-l-4 border-l-success">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <FileText className="w-5 h-5" />
                      Detailed Reporting
                    </CardTitle>
                    <CardDescription>
                      Generate comprehensive compliance reports for ISO 27001, NIST, and more
                    </CardDescription>
                  </CardHeader>
                </Card>
              </div>

              <Card className="bg-gradient-to-br from-primary/10 to-accent/10 border-primary/20">
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between">
                    <div className="space-y-2">
                      <h3 className="text-xl font-semibold">Get Started</h3>
                      <p className="text-muted-foreground">
                        Import your first log files to begin security analysis
                      </p>
                    </div>
                    <Button onClick={() => setActiveTab("upload")} size="lg">
                      <Upload className="w-4 h-4 mr-2" />
                      Import Logs
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="analytics" className="mt-6">
              <AnalyticsDashboard />
            </TabsContent>

            <TabsContent value="ai" className="mt-6">
              <AIAnalysis />
            </TabsContent>

            <TabsContent value="logs" className="mt-6">
              <LogViewer />
            </TabsContent>

            <TabsContent value="alerts" className="mt-6">
              <ThreatAlerts />
            </TabsContent>

            <TabsContent value="incidents" className="mt-6">
              <IncidentManagement />
            </TabsContent>

            <TabsContent value="reports" className="mt-6">
              <ReportingSystem />
            </TabsContent>

            <TabsContent value="upload" className="mt-6">
              <div className="max-w-3xl mx-auto">
                <LogUpload />
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </main>
    </div>
  );
};

export default Index;