
import React from "react";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Chore, AssignedChore, User } from "@/types";
import { getChorePoints, completeChore } from "@/services/data";
import { cn } from "@/lib/utils";
import { CalendarIcon, ClockIcon, CheckCircle, CircleCheck, Trash } from "lucide-react";

interface ChoreCardProps {
  chore: Chore;
  assignedChore: AssignedChore;
  user: User;
  onComplete: (id: string) => void;
}

const difficultyLabels: Record<number, string> = {
  1: "Easy",
  2: "Medium",
  3: "Hard",
};

const difficultyColors: Record<number, string> = {
  1: "bg-green-100 text-green-800 border-green-200",
  2: "bg-yellow-100 text-yellow-800 border-yellow-200",
  3: "bg-red-100 text-red-800 border-red-200",
};

const categoryIcons: Record<string, React.ReactNode> = {
  kitchen: <span className="text-xl">🍽️</span>,
  bathroom: <span className="text-xl">🚿</span>,
  livingRoom: <span className="text-xl">🛋️</span>,
  bedroom: <span className="text-xl">🛏️</span>,
  outdoor: <span className="text-xl">🌳</span>,
  pets: <span className="text-xl">🐾</span>,
  other: <span className="text-xl">📦</span>,
};

const ChoreCard: React.FC<ChoreCardProps> = ({ chore, assignedChore, user, onComplete }) => {
  const { toast } = useToast();
  const points = getChorePoints(chore.difficulty);
  const dueDate = new Date(assignedChore.dueDate);
  const isCompleted = assignedChore.completed;

  const handleComplete = () => {
    onComplete(assignedChore.id);
    toast({
      title: "Chore completed!",
      description: `You've earned ${points} points for completing "${chore.name}"`,
    });
  };

  return (
    <Card className={cn(
      "transition-all duration-300 hover:shadow-md",
      isCompleted ? "opacity-70 bg-muted/30" : "bg-white"
    )}>
      <CardHeader className="p-4 pb-2 flex flex-row items-start justify-between">
        <div className="flex items-center space-x-2">
          <div className="w-8 h-8 flex items-center justify-center rounded-md bg-primary/10 text-primary">
            {categoryIcons[chore.category]}
          </div>
          <div>
            <h3 className="text-base font-medium leading-none">{chore.name}</h3>
            <p className="text-sm text-muted-foreground mt-1">{chore.description}</p>
          </div>
        </div>
        <Badge className={difficultyColors[chore.difficulty]}>
          {difficultyLabels[chore.difficulty]}
        </Badge>
      </CardHeader>
      <CardContent className="p-4 pt-0">
        <div className="flex flex-wrap gap-3 text-sm mt-2">
          <div className="flex items-center text-muted-foreground">
            <ClockIcon className="h-3.5 w-3.5 mr-1" /> 
            {chore.estimatedTime} mins
          </div>
          <div className="flex items-center text-muted-foreground">
            <CalendarIcon className="h-3.5 w-3.5 mr-1" /> 
            Due {dueDate.toLocaleDateString()}
          </div>
        </div>
      </CardContent>
      <CardFooter className="p-4 pt-2 flex justify-between items-center border-t">
        <div className="flex items-center">
          <img 
            src={user.avatar || "https://i.pravatar.cc/150"} 
            alt={user.name}
            className="w-6 h-6 rounded-full mr-2"
          />
          <span className="text-sm">{user.name}</span>
        </div>
        {isCompleted ? (
          <span className="inline-flex items-center text-sm font-medium text-green-600">
            <CheckCircle className="h-4 w-4 mr-1" />
            Completed
          </span>
        ) : (
          <Button size="sm" variant="outline" onClick={handleComplete}>
            <CheckCircle className="h-4 w-4 mr-1" />
            Complete
          </Button>
        )}
      </CardFooter>
    </Card>
  );
};

export default ChoreCard;
