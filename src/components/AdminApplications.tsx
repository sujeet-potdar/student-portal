import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "@/hooks/use-toast";
import { Users } from "lucide-react";

interface Application {
  id: string;
  cgpa: number;
  status: string;
  created_at: string;
  user_id: string;
  opportunity_id: string;
  opportunities: { title: string } | null;
}

interface Profile {
  user_id: string;
  full_name: string | null;
}

const statusVariant = (status: string): "default" | "secondary" | "destructive" | "outline" => {
  if (status === "accepted") return "default";
  if (status === "rejected") return "destructive";
  return "secondary";
};

const AdminApplications = () => {
  const [applications, setApplications] = useState<Application[]>([]);
  const [profiles, setProfiles] = useState<Record<string, string | null>>({});
  const [pendingUpdates, setPendingUpdates] = useState<Record<string, string>>({});
  const [savingId, setSavingId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAll = async () => {
      setLoading(true);

      const [appsRes, profilesRes] = await Promise.all([
        supabase
          .from("applications")
          .select("*, opportunities(title)")
          .order("created_at", { ascending: false }),
        supabase.from("profiles").select("user_id, full_name"),
      ]);

      const apps = (appsRes.data ?? []) as unknown as Application[];
      setApplications(apps);

      const profileMap: Record<string, string | null> = {};
      for (const p of (profilesRes.data ?? []) as Profile[]) {
        profileMap[p.user_id] = p.full_name;
      }
      setProfiles(profileMap);

      setLoading(false);
    };

    fetchAll();
  }, []);

  const handleStatusChange = (appId: string, newStatus: string) => {
    setPendingUpdates((prev) => ({ ...prev, [appId]: newStatus }));
  };

  const handleSave = async (app: Application) => {
    const newStatus = pendingUpdates[app.id] ?? app.status;
    setSavingId(app.id);
    const { error } = await supabase
      .from("applications")
      .update({ status: newStatus })
      .eq("id", app.id);
    setSavingId(null);

    if (error) {
      toast({ title: "Update failed", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "Status updated successfully" });
      setApplications((prev) =>
        prev.map((a) => (a.id === app.id ? { ...a, status: newStatus } : a))
      );
      setPendingUpdates((prev) => {
        const next = { ...prev };
        delete next[app.id];
        return next;
      });
    }
  };

  if (loading) return null;

  if (applications.length === 0) {
    return (
      <Card>
        <CardContent className="py-8 text-center text-muted-foreground">
          No applications submitted yet.
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-lg">
          <Users className="h-5 w-5 text-primary" />
          Manage Applications
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Student</TableHead>
              <TableHead>Opportunity</TableHead>
              <TableHead>CGPA</TableHead>
              <TableHead>Current Status</TableHead>
              <TableHead>Update Status</TableHead>
              <TableHead></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {applications.map((app) => {
              const pendingStatus = pendingUpdates[app.id];
              const effectiveStatus = pendingStatus ?? app.status;
              const isDirty = pendingStatus !== undefined && pendingStatus !== app.status;
              const studentName = profiles[app.user_id] ?? app.user_id.slice(0, 8) + "…";

              return (
                <TableRow key={app.id}>
                  <TableCell className="font-medium">{studentName}</TableCell>
                  <TableCell>{app.opportunities?.title ?? "—"}</TableCell>
                  <TableCell>{app.cgpa}</TableCell>
                  <TableCell>
                    <Badge variant={statusVariant(app.status)}>
                      {app.status.charAt(0).toUpperCase() + app.status.slice(1)}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Select
                      value={effectiveStatus}
                      onValueChange={(val) => handleStatusChange(app.id, val)}
                    >
                      <SelectTrigger className="w-36 h-8 text-sm">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="pending">Pending</SelectItem>
                        <SelectItem value="accepted">Accepted</SelectItem>
                        <SelectItem value="rejected">Rejected</SelectItem>
                      </SelectContent>
                    </Select>
                  </TableCell>
                  <TableCell>
                    <Button
                      size="sm"
                      variant={isDirty ? "default" : "outline"}
                      disabled={!isDirty || savingId === app.id}
                      onClick={() => handleSave(app)}
                    >
                      {savingId === app.id ? "Saving…" : "Save"}
                    </Button>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
};

export default AdminApplications;
