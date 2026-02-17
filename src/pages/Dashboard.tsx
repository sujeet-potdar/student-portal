import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { LogOut, Shield, GraduationCap } from "lucide-react";

const Dashboard = () => {
  const { user, role, signOut } = useAuth();

  const isAdmin = role === "admin";

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border bg-card">
        <div className="container mx-auto flex items-center justify-between px-4 py-4">
          <h1 className="text-xl font-bold text-foreground">Dashboard</h1>
          <Button variant="outline" size="sm" onClick={signOut}>
            <LogOut className="mr-2 h-4 w-4" />
            Sign Out
          </Button>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8 space-y-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-3">
              {isAdmin ? (
                <Shield className="h-6 w-6 text-primary" />
              ) : (
                <GraduationCap className="h-6 w-6 text-primary" />
              )}
              Your Profile
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-center gap-2">
              <span className="text-sm text-muted-foreground">Email:</span>
              <span className="text-sm font-medium text-foreground">{user?.email}</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-sm text-muted-foreground">Role:</span>
              <Badge variant={isAdmin ? "default" : "secondary"}>
                {role ?? "Loading..."}
              </Badge>
            </div>
          </CardContent>
        </Card>

        {isAdmin && (
          <Card className="border-primary/20 bg-accent">
            <CardHeader>
              <CardTitle className="text-accent-foreground">Admin Panel</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                You have admin privileges. Admin-specific features will appear here.
              </p>
            </CardContent>
          </Card>
        )}
      </main>
    </div>
  );
};

export default Dashboard;
