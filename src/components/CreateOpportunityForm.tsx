import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "@/hooks/use-toast";
import { Plus } from "lucide-react";

interface Props {
  onCreated: () => void;
}

const CreateOpportunityForm = ({ onCreated }: Props) => {
  const { user } = useAuth();
  const [title, setTitle] = useState("");
  const [minCgpa, setMinCgpa] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    const cgpa = parseFloat(minCgpa);
    if (isNaN(cgpa) || cgpa < 0 || cgpa > 10) {
      toast({ title: "Invalid CGPA", description: "Enter a value between 0 and 10.", variant: "destructive" });
      return;
    }

    setLoading(true);
    const { error } = await supabase.from("opportunities").insert({
      title: title.trim(),
      min_cgpa: cgpa,
      created_by: user.id,
    });
    setLoading(false);

    if (error) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "Opportunity created" });
      setTitle("");
      setMinCgpa("");
      onCreated();
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Create Opportunity</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="title">Title</Label>
            <Input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Summer Internship"
              required
              maxLength={200}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="min_cgpa">Minimum CGPA (0–10)</Label>
            <Input
              id="min_cgpa"
              type="number"
              step="0.01"
              min="0"
              max="10"
              value={minCgpa}
              onChange={(e) => setMinCgpa(e.target.value)}
              placeholder="7.50"
              required
            />
          </div>
          <Button type="submit" disabled={loading} className="w-full">
            <Plus className="mr-2 h-4 w-4" />
            {loading ? "Creating…" : "Create"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};

export default CreateOpportunityForm;
