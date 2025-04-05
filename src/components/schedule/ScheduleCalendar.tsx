
import React, { useMemo } from "react";
import { Card } from "@/components/ui/card";
import { addDays, format } from "date-fns";
import { Chore, AssignedChore, User, Household } from "@/types";
import { cn } from "@/lib/utils";

type ChoreWithDetails = {
  assignedChore: AssignedChore;
  chore: Chore;
  user: User;
};

interface ScheduleCalendarProps {
  household: Household;
  onCompleteChore: (choreId: string) => void;
}

const ScheduleCalendar: React.FC<ScheduleCalendarProps> = ({ household, onCompleteChore }) => {
  const today = new Date();
  const days = useMemo(() => {
    return Array.from({ length: 7 }, (_, i) => addDays(today, i));
  }, [today]);

  const choresByDay = useMemo(() => {
    const result: Record<string, ChoreWithDetails[]> = {};
    
    days.forEach(day => {
      const dateStr = format(day, "yyyy-MM-dd");
      result[dateStr] = [];
    });

    household.assignedChores.forEach(assignedChore => {
      const chore = household.chores.find(c => c.id === assignedChore.choreId);
      const user = household.members.find(m => m.id === assignedChore.userId);
      
      if (chore && user) {
        const dueDate = new Date(assignedChore.dueDate);
        const dateStr = format(dueDate, "yyyy-MM-dd");
        
        if (result[dateStr]) {
          result[dateStr].push({
            assignedChore,
            chore,
            user,
          });
        }
      }
    });
    
    return result;
  }, [household, days]);

  const handleCompleteChore = (choreId: string) => {
    onCompleteChore(choreId);
  };

  return (
    <div className="bg-white rounded-lg border shadow-sm">
      <div className="grid grid-cols-7 gap-px bg-border border-b">
        {days.map((day) => (
          <div key={day.toString()} className="p-2 text-center">
            <div className="text-xs text-muted-foreground font-medium uppercase">
              {format(day, "EEE")}
            </div>
            <div className={cn(
              "mt-1 font-semibold text-sm inline-flex items-center justify-center w-7 h-7 rounded-full",
              format(day, "yyyy-MM-dd") === format(today, "yyyy-MM-dd") ? 
                "bg-primary text-primary-foreground" : ""
            )}>
              {format(day, "d")}
            </div>
          </div>
        ))}
      </div>
      <div className="grid grid-cols-7 gap-px bg-border min-h-[300px]">
        {days.map((day) => {
          const dateStr = format(day, "yyyy-MM-dd");
          const dayChores = choresByDay[dateStr] || [];
          
          return (
            <div key={dateStr} className="bg-white p-2 min-h-full">
              {dayChores.length === 0 ? (
                <div className="text-center text-muted-foreground text-sm py-4">
                  No chores
                </div>
              ) : (
                <div className="space-y-2">
                  {dayChores.map((choreDetail) => (
                    <ChoreItem 
                      key={choreDetail.assignedChore.id}
                      choreDetail={choreDetail}
                      onComplete={handleCompleteChore}
                    />
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

interface ChoreItemProps {
  choreDetail: ChoreWithDetails;
  onComplete: (choreId: string) => void;
}

const ChoreItem: React.FC<ChoreItemProps> = ({ choreDetail, onComplete }) => {
  const { assignedChore, chore, user } = choreDetail;
  const isCompleted = assignedChore.completed;
  
  const categoryEmojis: Record<string, string> = {
    kitchen: "🍽️",
    bathroom: "🚿",
    livingRoom: "🛋️",
    bedroom: "🛏️",
    outdoor: "🌳",
    pets: "🐾",
    other: "📦",
  };
  
  const emoji = categoryEmojis[chore.category] || "📝";
  
  return (
    <Card
      className={cn(
        "p-2 text-xs rounded-md border cursor-pointer transition-colors hover:bg-secondary/10",
        isCompleted ? "bg-muted/30" : "bg-white"
      )}
      onClick={() => !isCompleted && onComplete(assignedChore.id)}
    >
      <div className="flex items-start gap-1.5">
        <span className="flex-shrink-0">{emoji}</span>
        <div className="flex-1 min-w-0">
          <div className="font-medium flex items-center gap-1">
            {chore.name}
            {isCompleted && (
              <span className="text-green-600">✓</span>
            )}
          </div>
          <div className="text-muted-foreground truncate">
            {user.name}
          </div>
        </div>
      </div>
    </Card>
  );
};

export default ScheduleCalendar;
