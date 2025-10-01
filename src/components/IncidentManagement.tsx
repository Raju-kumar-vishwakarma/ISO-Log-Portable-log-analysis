import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Plus, AlertCircle, CheckCircle, Clock, User, FileText } from "lucide-react";
import { format } from "date-fns";

const IncidentManagement = () => {
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [newIncident, setNewIncident] = useState({
    title: "",
    description: "",
    severity: "MEDIUM" as any,
  });
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: incidents, isLoading } = useQuery({
    queryKey: ["incidents"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("incidents")
        .select(`
          *,
          assigned_profile:profiles!incidents_assigned_to_fkey(full_name),
          creator_profile:profiles!incidents_created_by_fkey(full_name)
        `)
        .order("created_at", { ascending: false });
      
      if (error) throw error;
      return data;
    },
  });

  const createIncident = useMutation({
    mutationFn: async (incident: typeof newIncident) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      const { data, error } = await supabase
        .from("incidents")
        .insert({
          ...incident,
          created_by: user.id,
          status: "OPEN",
        })
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["incidents"] });
      toast({
        title: "Incident Created",
        description: "The incident has been successfully created.",
      });
      setIsCreateOpen(false);
      setNewIncident({ title: "", description: "", severity: "MEDIUM" });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to create incident.",
        variant: "destructive",
      });
    },
  });

  const updateIncidentStatus = useMutation({
    mutationFn: async ({ id, status }: { id: string; status: string }) => {
      const updates: any = { status };
      if (status === "RESOLVED") {
        updates.resolved_at = new Date().toISOString();
      }

      const { error } = await supabase
        .from("incidents")
        .update(updates)
        .eq("id", id);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["incidents"] });
      toast({
        title: "Status Updated",
        description: "Incident status has been updated.",
      });
    },
  });

  const getSeverityColor = (severity: string) => {
    const colors = {
      LOW: "bg-chart-1/20 text-chart-1 border-chart-1/30",
      MEDIUM: "bg-chart-2/20 text-chart-2 border-chart-2/30",
      HIGH: "bg-chart-4/20 text-chart-4 border-chart-4/30",
      CRITICAL: "bg-chart-5/20 text-chart-5 border-chart-5/30",
    };
    return colors[severity as keyof typeof colors] || colors.MEDIUM;
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "OPEN":
        return <AlertCircle className="w-4 h-4 text-chart-5" />;
      case "IN_PROGRESS":
        return <Clock className="w-4 h-4 text-chart-2" />;
      case "RESOLVED":
        return <CheckCircle className="w-4 h-4 text-chart-3" />;
      default:
        return <AlertCircle className="w-4 h-4" />;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-bold">Incident Management</h2>
          <p className="text-muted-foreground">Track and manage security incidents</p>
        </div>
        <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="w-4 h-4 mr-2" />
              Create Incident
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[600px]">
            <DialogHeader>
              <DialogTitle>Create New Incident</DialogTitle>
              <DialogDescription>
                Create a new security incident case for investigation
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Title</label>
                <Input
                  placeholder="Enter incident title..."
                  value={newIncident.title}
                  onChange={(e) => setNewIncident({ ...newIncident, title: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Description</label>
                <Textarea
                  placeholder="Describe the incident..."
                  value={newIncident.description}
                  onChange={(e) => setNewIncident({ ...newIncident, description: e.target.value })}
                  rows={4}
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Severity</label>
                <Select value={newIncident.severity} onValueChange={(value) => setNewIncident({ ...newIncident, severity: value })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="LOW">Low</SelectItem>
                    <SelectItem value="MEDIUM">Medium</SelectItem>
                    <SelectItem value="HIGH">High</SelectItem>
                    <SelectItem value="CRITICAL">Critical</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <Button
                onClick={() => createIncident.mutate(newIncident)}
                disabled={!newIncident.title || createIncident.isPending}
                className="w-full"
              >
                Create Incident
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Active Incidents</CardTitle>
          <CardDescription>All security incidents requiring attention</CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="text-center py-8 text-muted-foreground">Loading incidents...</div>
          ) : incidents && incidents.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Status</TableHead>
                  <TableHead>Title</TableHead>
                  <TableHead>Severity</TableHead>
                  <TableHead>Created</TableHead>
                  <TableHead>Creator</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {incidents.map((incident: any) => (
                  <TableRow key={incident.id}>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        {getStatusIcon(incident.status)}
                        <span className="text-sm">{incident.status.replace("_", " ")}</span>
                      </div>
                    </TableCell>
                    <TableCell className="font-medium">
                      <div className="flex items-center gap-2">
                        <FileText className="w-4 h-4 text-muted-foreground" />
                        {incident.title}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge className={getSeverityColor(incident.severity)}>
                        {incident.severity}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {format(new Date(incident.created_at), "PPp")}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <User className="w-4 h-4 text-muted-foreground" />
                        <span className="text-sm">{incident.creator_profile?.full_name || "Unknown"}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Select
                        value={incident.status}
                        onValueChange={(status) =>
                          updateIncidentStatus.mutate({ id: incident.id, status })
                        }
                      >
                        <SelectTrigger className="w-[140px]">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="OPEN">Open</SelectItem>
                          <SelectItem value="IN_PROGRESS">In Progress</SelectItem>
                          <SelectItem value="RESOLVED">Resolved</SelectItem>
                        </SelectContent>
                      </Select>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              No incidents found. Create your first incident to get started.
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default IncidentManagement;