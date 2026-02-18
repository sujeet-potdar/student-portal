import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { ClipboardList } from "lucide-react";

interface Application {
  id: string;
  cgpa: number;
  status: string;
  created_at: string;
  opportunity_id: string;
  opportunities: {
    title: string;
    min_cgpa: number;
  } | null;
}

interface Props {
  refreshKey: number;
}

const statusVariant = (status: string): "default" | "secondary" | "destructive" | "outline" => {
  if (status === "accepted") return "default";
  if (status === "rejected") return "destructive";
  return "secondary";
};

const statusLabel = (status: string) =>
  status.charAt(0).toUpperCase() + status.slice(1);

const MyApplications = ({ refreshKey }: Props) => {
  const { user } = useAuth();
  const [applications, setApplications] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    const fetch = async () => {
      setLoading(true);
      const { data } = await supabase
        .from("applications")
        .select("*, opportunities(title, min_cgpa)")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });
      setApplications((data as Application[]) ?? []);
      setLoading(false);
    };
    fetch();
  }, [user, refreshKey]);

  if (loading) return null;

  if (applications.length === 0) {
    return (
      <Card>
        <CardContent className="py-8 text-center text-muted-foreground">
          You haven't applied to any opportunities yet.
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-lg">
          <ClipboardList className="h-5 w-5 text-primary" />
          My Applications
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Opportunity</TableHead>
              <TableHead>Min CGPA</TableHead>
              <TableHead>Your CGPA</TableHead>
              <TableHead>Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {applications.map((app) => (
              <TableRow key={app.id}>
                <TableCell className="font-medium">
                  {app.opportunities?.title ?? "—"}
                </TableCell>
                <TableCell>
                  <Badge variant="outline">{app.opportunities?.min_cgpa ?? "—"}</Badge>
                </TableCell>
                <TableCell>{app.cgpa}</TableCell>
                <TableCell>
                  <Badge variant={statusVariant(app.status)}>
                    {statusLabel(app.status)}
                  </Badge>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
};

export default MyApplications;
