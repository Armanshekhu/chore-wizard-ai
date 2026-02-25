import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { UserIcon, LogOutIcon, CheckCheckIcon, CalendarIcon, CheckIcon, Loader2Icon } from "lucide-react";
import { Link } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";
import WeeklyScheduleTable from "@/components/schedule/WeeklyScheduleTable";

const UserDashboard = () => {
  const { user, signOut } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: assignments, isLoading } = useQuery({
    queryKey: ["my-assignments", user?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("assigned_chores")
        .select("*, chores(*)")
        .eq("user_id", user!.id)
        .order("due_date", { ascending: true });
      if (error) throw error;
      return data;
    },
    enabled: !!user,
  });

  const completeMutation = useMutation({
    mutationFn: async (assignmentId: string) => {
      const { error } = await supabase
        .from("assigned_chores")
        .update({ completed: true, completed_at: new Date().toISOString() })
        .eq("id", assignmentId);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["my-assignments"] });
      toast({ title: "Chore completed! 🎉" });
    },
    onError: (err: any) => {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    },
  });

  const pending = assignments?.filter((a) => !a.completed) || [];
  const completed = assignments?.filter((a) => a.completed) || [];

  return (
    <div className="min-h-screen bg-muted/30">
      <header className="bg-card border-b sticky top-0 z-10">
        <div className="container mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <UserIcon className="h-5 w-5 text-primary" />
            <span className="text-xl font-bold text-primary">My Dashboard</span>
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
        <h1 className="text-3xl font-bold mb-6">Welcome!</h1>

        {isLoading ? (
          <div className="flex justify-center py-12">
            <Loader2Icon className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : (
          <div className="space-y-8">
            {/* Pending chores */}
            <section>
              <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
                <CalendarIcon className="h-5 w-5 text-primary" />
                Upcoming Chores ({pending.length})
              </h2>
              {pending.length === 0 ? (
                <Card>
                  <CardContent className="py-6 text-center text-muted-foreground">
                    No chores assigned yet. Check back later!
                  </CardContent>
                </Card>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {pending.map((a) => (
                    <Card key={a.id}>
                      <CardHeader className="pb-2">
                        <div className="flex items-center justify-between">
                          <CardTitle className="text-base">{(a as any).chores?.name}</CardTitle>
                          <Badge variant="outline">Due {format(new Date(a.due_date), "EEE, MMM d")}</Badge>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <p className="text-sm text-muted-foreground mb-3">
                          {(a as any).chores?.description}
                        </p>
                        <div className="flex items-center justify-between">
                          <span className="text-xs text-muted-foreground">
                            ~{(a as any).chores?.estimated_minutes} min
                          </span>
                          <Button
                            size="sm"
                            onClick={() => completeMutation.mutate(a.id)}
                            disabled={completeMutation.isPending}
                          >
                            <CheckIcon className="h-4 w-4 mr-1" /> Mark Done
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </section>

            {/* Completed chores */}
            {completed.length > 0 && (
              <section>
                <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
                  <CheckCheckIcon className="h-5 w-5 text-secondary" />
                  Completed ({completed.length})
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {completed.map((a) => (
                    <Card key={a.id} className="opacity-70">
                      <CardHeader className="pb-2">
                        <div className="flex items-center justify-between">
                          <CardTitle className="text-base line-through">
                            {(a as any).chores?.name}
                          </CardTitle>
                          <Badge variant="secondary">Done</Badge>
                        </div>
                      </CardHeader>
                    </Card>
                  ))}
                </div>
              </section>
            )}
          </div>
        )}

        <div className="mt-8">
          <WeeklyScheduleTable />
        </div>
      </main>
    </div>
  );
};

export default UserDashboard;
