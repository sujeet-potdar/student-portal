import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { toast } from "@/hooks/use-toast";
import { Send, Briefcase } from "lucide-react";

interface Opportunity {
  id: string;
  title: string;
  min_cgpa: number;
  created_at: string;
}

interface Props {
  refreshKey: number;
}

const OpportunitiesList = ({ refreshKey }: Props) => {
  const { user, role } = useAuth();
  const [opportunities, setOpportunities] = useState<Opportunity[]>([]);
  const [appliedIds, setAppliedIds] = useState<Set<string>>(new Set());
  const [cgpaInputs, setCgpaInputs] = useState<Record<string, string>>({});
  const [applyingId, setApplyingId] = useState<string | null>(null);

  const fetchData = async () => {
    const { data } = await supabase
      .from("opportunities")
      .select("*")
      .order("created_at", { ascending: false });
    setOpportunities(data ?? []);

    if (user && role === "student") {
      const { data: apps } = await supabase
        .from("applications")
        .select("opportunity_id")
        .eq("user_id", user.id);
      setAppliedIds(new Set((apps ?? []).map((a) => a.opportunity_id)));
    }
  };

  useEffect(() => {
    fetchData();
  }, [refreshKey, user, role]);

  const handleApply = async (oppId: string, minCgpa: number) => {
    if (!user) return;
    const cgpa = parseFloat(cgpaInputs[oppId] ?? "");
    if (isNaN(cgpa) || cgpa < 0 || cgpa > 10) {
      toast({ title: "Invalid CGPA", description: "Enter your CGPA (0–10).", variant: "destructive" });
      return;
    }

    setApplyingId(oppId);
    const { error } = await supabase.from("applications").insert({
      opportunity_id: oppId,
      user_id: user.id,
      cgpa,
    });
    setApplyingId(null);

    if (error) {
      const msg = error.message.includes("does not meet")
        ? `Your CGPA (${cgpa}) does not meet the minimum requirement of ${minCgpa}.`
        : error.message;
      toast({ title: "Application failed", description: msg, variant: "destructive" });
    } else {
      toast({ title: "Applied successfully!" });
      setAppliedIds((prev) => new Set(prev).add(oppId));
      setCgpaInputs((prev) => ({ ...prev, [oppId]: "" }));
    }
  };

  if (opportunities.length === 0) {
    return (
      <Card>
        <CardContent className="py-8 text-center text-muted-foreground">
          No opportunities available yet.
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-lg">
          <Briefcase className="h-5 w-5 text-primary" />
          Opportunities
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Title</TableHead>
              <TableHead>Min CGPA</TableHead>
              {role === "student" && <TableHead>Apply</TableHead>}
            </TableRow>
          </TableHeader>
          <TableBody>
            {opportunities.map((opp) => (
              <TableRow key={opp.id}>
                <TableCell className="font-medium">{opp.title}</TableCell>
                <TableCell>
                  <Badge variant="secondary">{opp.min_cgpa}</Badge>
                </TableCell>
                {role === "student" && (
                  <TableCell>
                    {appliedIds.has(opp.id) ? (
                      <Badge>Applied</Badge>
                    ) : (
                      <div className="flex items-end gap-2">
                        <div className="space-y-1">
                          <Label htmlFor={`cgpa-${opp.id}`} className="text-xs">
                            Your CGPA
                          </Label>
                          <Input
                            id={`cgpa-${opp.id}`}
                            type="number"
                            step="0.01"
                            min="0"
                            max="10"
                            className="w-24 h-8 text-sm"
                            value={cgpaInputs[opp.id] ?? ""}
                            onChange={(e) =>
                              setCgpaInputs((prev) => ({ ...prev, [opp.id]: e.target.value }))
                            }
                            placeholder="8.50"
                          />
                        </div>
                        <Button
                          size="sm"
                          disabled={applyingId === opp.id}
                          onClick={() => handleApply(opp.id, opp.min_cgpa)}
                        >
                          <Send className="mr-1 h-3 w-3" />
                          {applyingId === opp.id ? "…" : "Apply"}
                        </Button>
                      </div>
                    )}
                  </TableCell>
                )}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
};

export default OpportunitiesList;
