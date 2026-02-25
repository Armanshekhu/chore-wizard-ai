import { useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  ShieldIcon, LogOutIcon, UsersIcon, CheckCheckIcon,
  BarChart3Icon, WandSparklesIcon, Loader2Icon,
} from "lucide-react";
import { Link } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { useQueryClient } from "@tanstack/react-query";
import WeeklyScheduleTable from "@/components/schedule/WeeklyScheduleTable";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel,
  AlertDialogContent, AlertDialogDescription, AlertDialogFooter,
  AlertDialogHeader, AlertDialogTitle,
} from "@/components/ui/alert-dialog";

const AdminDashboard = () => {
  const { user, session, signOut } = useAuth();
  const { toast } = useToast();
  const [distributing, setDistributing] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const distribute = async (force = false) => {
    setDistributing(true);
    try {
      const resp = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/distribute-chores`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${session?.access_token}`,
          },
          body: JSON.stringify({ force }),
        }
      );

      const data = await resp.json();

      if (resp.status === 409) {
        setShowConfirm(true);
        return;
      }

      if (!resp.ok) {
        throw new Error(data.error || "Distribution failed");
      }

      toast({
        title: "Tasks Distributed!",
        description: data.message,
      });
    } catch (err: any) {
      toast({
        title: "Distribution Failed",
        description: err.message,
        variant: "destructive",
      });
    } finally {
      setDistributing(false);
    }
  };

  const handleForceDistribute = async () => {
    setShowConfirm(false);
    await distribute(true);
  };

  return (
    <div className="min-h-screen bg-muted/30">
      <header className="bg-card border-b sticky top-0 z-10">
        <div className="container mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <ShieldIcon className="h-5 w-5 text-primary" />
            <span className="text-xl font-bold text-primary">Admin Dashboard</span>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-sm text-muted-foreground hidden sm:inline">{user?.email}</span>
            <Button variant="outline" size="sm" onClick={signOut}>
              <LogOutIcon className="h-4 w-4 mr-1" /> Logout
            </Button>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-6 gap-4">
          <h1 className="text-3xl font-bold">Welcome, Admin!</h1>
          <Button
            size="lg"
            onClick={() => distribute(false)}
            disabled={distributing}
            className="gap-2"
          >
            {distributing ? (
              <Loader2Icon className="h-5 w-5 animate-spin" />
            ) : (
              <WandSparklesIcon className="h-5 w-5" />
            )}
            {distributing ? "Distributing..." : "Distribute Tasks Using AI"}
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card>
            <CardHeader className="flex flex-row items-center gap-2">
              <UsersIcon className="h-5 w-5 text-primary" />
              <CardTitle className="text-lg">Manage Members</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground mb-3">View and manage all household members.</p>
              <Link to="/members">
                <Button variant="outline" size="sm">Go to Members</Button>
              </Link>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center gap-2">
              <CheckCheckIcon className="h-5 w-5 text-secondary" />
              <CardTitle className="text-lg">Manage Chores</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground mb-3">Create, assign, and track all chores.</p>
              <Link to="/chores">
                <Button variant="outline" size="sm">Go to Chores</Button>
              </Link>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center gap-2">
              <BarChart3Icon className="h-5 w-5 text-accent" />
              <CardTitle className="text-lg">View Schedule</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground mb-3">View the full chore schedule calendar.</p>
              <Link to="/schedule">
                <Button variant="outline" size="sm">Go to Schedule</Button>
              </Link>
            </CardContent>
          </Card>
        </div>

        <div className="mt-8">
          <WeeklyScheduleTable showAllUsers />
        </div>
      </main>

      <AlertDialog open={showConfirm} onOpenChange={setShowConfirm}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Tasks Already Distributed</AlertDialogTitle>
            <AlertDialogDescription>
              Tasks have already been distributed for this week. Redistributing will remove incomplete assignments and create new ones. Completed tasks will be kept.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleForceDistribute}>
              Redistribute
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default AdminDashboard;
