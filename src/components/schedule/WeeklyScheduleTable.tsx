import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { format, startOfWeek, addDays } from "date-fns";
import { Loader2Icon, CalendarIcon } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Table, TableBody, TableCell, TableHead,
  TableHeader, TableRow,
} from "@/components/ui/table";

interface Assignment {
  id: string;
  user_id: string;
  chore_id: string;
  due_date: string;
  completed: boolean;
  completed_at: string | null;
  week_start: string;
  chores: { name: string; category: string; difficulty: number; estimated_minutes: number } | null;
}

interface WeeklyScheduleTableProps {
  /** If true, shows all users' assignments (admin). Otherwise only current user. */
  showAllUsers?: boolean;
}

const categoryEmojis: Record<string, string> = {
  kitchen: "🍽️",
  bathroom: "🚿",
  livingRoom: "🛋️",
  bedroom: "🛏️",
  outdoor: "🌳",
  pets: "🐾",
  other: "📦",
};

const WeeklyScheduleTable: React.FC<WeeklyScheduleTableProps> = ({ showAllUsers = false }) => {
  const { user } = useAuth();
  const weekStart = startOfWeek(new Date(), { weekStartsOn: 1 });
  const weekDays = Array.from({ length: 7 }, (_, i) => addDays(weekStart, i));

  const { data: assignments, isLoading } = useQuery({
    queryKey: ["weekly-schedule", showAllUsers, user?.id],
    queryFn: async () => {
      let query = supabase
        .from("assigned_chores")
        .select("*, chores(*)")
        .eq("week_start", format(weekStart, "yyyy-MM-dd"))
        .order("due_date", { ascending: true });

      if (!showAllUsers) {
        query = query.eq("user_id", user!.id);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data as unknown as Assignment[];
    },
    enabled: !!user,
  });

  const { data: profiles } = useQuery({
    queryKey: ["profiles-for-schedule", showAllUsers],
    queryFn: async () => {
      const { data, error } = await supabase.from("profiles").select("user_id, full_name");
      if (error) throw error;
      return data;
    },
    enabled: showAllUsers,
  });

  const profileMap = new Map(profiles?.map((p) => [p.user_id, p.full_name]) || []);

  // Group by day
  const byDay: Record<string, Assignment[]> = {};
  weekDays.forEach((d) => {
    byDay[format(d, "yyyy-MM-dd")] = [];
  });
  assignments?.forEach((a) => {
    const key = a.due_date;
    if (byDay[key]) byDay[key].push(a);
  });

  if (isLoading) {
    return (
      <div className="flex justify-center py-8">
        <Loader2Icon className="h-6 w-6 animate-spin text-primary" />
      </div>
    );
  }

  const todayStr = format(new Date(), "yyyy-MM-dd");

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-lg flex items-center gap-2">
          <CalendarIcon className="h-5 w-5 text-primary" />
          Weekly Schedule — {format(weekStart, "MMM d")} to {format(addDays(weekStart, 6), "MMM d, yyyy")}
        </CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        <Table>
          <TableHeader>
            <TableRow>
              {weekDays.map((d) => {
                const ds = format(d, "yyyy-MM-dd");
                return (
                  <TableHead
                    key={ds}
                    className={ds === todayStr ? "bg-primary/10 font-bold" : ""}
                  >
                    <div className="text-center">
                      <div className="text-xs uppercase">{format(d, "EEE")}</div>
                      <div className="text-sm">{format(d, "d")}</div>
                    </div>
                  </TableHead>
                );
              })}
            </TableRow>
          </TableHeader>
          <TableBody>
            <TableRow>
              {weekDays.map((d) => {
                const ds = format(d, "yyyy-MM-dd");
                const dayAssignments = byDay[ds] || [];
                return (
                  <TableCell
                    key={ds}
                    className={`align-top min-w-[120px] ${ds === todayStr ? "bg-primary/5" : ""}`}
                  >
                    {dayAssignments.length === 0 ? (
                      <span className="text-xs text-muted-foreground">—</span>
                    ) : (
                      <div className="space-y-1.5">
                        {dayAssignments.map((a) => (
                          <div
                            key={a.id}
                            className={`text-xs rounded-md border p-1.5 ${
                              a.completed
                                ? "bg-muted/40 opacity-60"
                                : "bg-card"
                            }`}
                          >
                            <div className="flex items-center gap-1 font-medium">
                              <span>{categoryEmojis[a.chores?.category || "other"] || "📝"}</span>
                              <span className={a.completed ? "line-through" : ""}>
                                {a.chores?.name}
                              </span>
                              {a.completed && <span className="text-green-600">✓</span>}
                            </div>
                            {showAllUsers && (
                              <div className="text-muted-foreground mt-0.5 truncate">
                                {profileMap.get(a.user_id) || "Unknown"}
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    )}
                  </TableCell>
                );
              })}
            </TableRow>
          </TableBody>
        </Table>
        {(!assignments || assignments.length === 0) && (
          <div className="text-center text-muted-foreground py-8 text-sm">
            No tasks distributed for this week yet.
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default WeeklyScheduleTable;
