import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { useToast } from "@/hooks/use-toast";
import { FileText, Download, Calendar as CalendarIcon, FileSpreadsheet, Loader2, Shield, CheckCircle, File } from "lucide-react";
import { format } from "date-fns";

const ReportingSystem = () => {
  const [reportType, setReportType] = useState("compliance");
  const [exportFormat, setExportFormat] = useState("pdf");
  const [startDate, setStartDate] = useState<Date>();
  const [endDate, setEndDate] = useState<Date>();
  const [isGenerating, setIsGenerating] = useState(false);
  const { toast } = useToast();

  const generateReport = async () => {
    if (!startDate || !endDate) {
      toast({
        title: "Missing Dates",
        description: "Please select both start and end dates",
        variant: "destructive",
      });
      return;
    }

    setIsGenerating(true);
    try {
      // Simulate report generation
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      toast({
        title: "Report Generated",
        description: `Your ${reportType} report has been generated successfully`,
      });
    } catch (error) {
      toast({
        title: "Generation Failed",
        description: "Failed to generate report",
        variant: "destructive",
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const reportTemplates = [
    {
      id: "compliance",
      name: "Compliance Report",
      description: "ISO 27001, NIST, PCI DSS compliance status",
      icon: Shield,
      color: "text-chart-1",
    },
    {
      id: "security",
      name: "Security Summary",
      description: "Overview of security events and threats",
      icon: FileText,
      color: "text-chart-2",
    },
    {
      id: "incident",
      name: "Incident Report",
      description: "Detailed incident analysis and response",
      icon: CheckCircle,
      color: "text-chart-3",
    },
    {
      id: "executive",
      name: "Executive Summary",
      description: "High-level security posture overview",
      icon: FileText,
      color: "text-chart-4",
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold">Advanced Reporting</h2>
        <p className="text-muted-foreground">Generate comprehensive security and compliance reports</p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {reportTemplates.map((template) => (
          <Card
            key={template.id}
            className={`cursor-pointer transition-all ${
              reportType === template.id
                ? "border-primary ring-2 ring-primary/20"
                : "hover:border-primary/50"
            }`}
            onClick={() => setReportType(template.id)}
          >
            <CardHeader className="space-y-2">
              <div className={`w-10 h-10 rounded-lg bg-muted flex items-center justify-center ${template.color}`}>
                <template.icon className="w-5 h-5" />
              </div>
              <CardTitle className="text-base">{template.name}</CardTitle>
              <CardDescription className="text-xs">{template.description}</CardDescription>
            </CardHeader>
          </Card>
        ))}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Report Configuration</CardTitle>
          <CardDescription>Customize your report parameters</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <label className="text-sm font-medium">Start Date</label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline" className="w-full justify-start text-left font-normal">
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {startDate ? format(startDate, "PPP") : "Select start date"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar mode="single" selected={startDate} onSelect={setStartDate} />
                </PopoverContent>
              </Popover>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">End Date</label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline" className="w-full justify-start text-left font-normal">
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {endDate ? format(endDate, "PPP") : "Select end date"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar mode="single" selected={endDate} onSelect={setEndDate} />
                </PopoverContent>
              </Popover>
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Export Format</label>
            <Select value={exportFormat} onValueChange={setExportFormat}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="pdf">
                  <div className="flex items-center gap-2">
                    <File className="w-4 h-4" />
                    PDF Report
                  </div>
                </SelectItem>
                <SelectItem value="excel">
                  <div className="flex items-center gap-2">
                    <FileSpreadsheet className="w-4 h-4" />
                    Excel Spreadsheet
                  </div>
                </SelectItem>
                <SelectItem value="csv">
                  <div className="flex items-center gap-2">
                    <FileText className="w-4 h-4" />
                    CSV Export
                  </div>
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          <Button 
            onClick={generateReport} 
            disabled={isGenerating || !startDate || !endDate}
            className="w-full"
            size="lg"
          >
            {isGenerating ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Generating Report...
              </>
            ) : (
              <>
                <Download className="w-4 h-4 mr-2" />
                Generate Report
              </>
            )}
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Recent Reports</CardTitle>
          <CardDescription>Previously generated reports</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-muted-foreground">
            No reports generated yet. Create your first report above.
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ReportingSystem;