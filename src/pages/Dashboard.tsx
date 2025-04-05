
import React, { useState, useEffect } from "react";
import { getHousehold, completeChore, distributeChores } from "@/services/data";
import { Household, AssignedChore, Chore, User } from "@/types";
import ChoreCard from "@/components/chores/ChoreCard";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent } from "@/components/ui/card";
import { MagicWandIcon, RotateCw, CalendarIcon, UserIcon, CheckCircle } from "lucide-react";

const Dashboard = () => {
  const [household, setHousehold] = useState<Household | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const { toast } = useToast();

  useEffect(() => {
    // Load household data
    const loadData = () => {
      try {
        const data = getHousehold();
        setHousehold(data);
      } catch (error) {
        console.error("Error loading data:", error);
        toast({
          variant: "destructive",
          title: "Error loading data",
          description: "There was a problem loading your household data.",
        });
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [toast]);

  const handleDistributeChores = () => {
    if (!household) return;

    try {
      const updatedHousehold = distributeChores();
      setHousehold(updatedHousehold);
      toast({
        title: "Chores distributed!",
        description: "Chores have been fairly distributed using AI.",
      });
    } catch (error) {
      console.error("Error distributing chores:", error);
      toast({
        variant: "destructive",
        title: "Error distributing chores",
        description: "There was a problem distributing the chores.",
      });
    }
  };

  const handleCompleteChore = (choreId: string) => {
    if (!household) return;

    try {
      const updatedHousehold = completeChore(choreId);
      setHousehold(updatedHousehold);
    } catch (error) {
      console.error("Error completing chore:", error);
      toast({
        variant: "destructive",
        title: "Error completing chore",
        description: "There was a problem marking this chore as complete.",
      });
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-[60vh]">
        <div className="animate-spin-slow">
          <MagicWandIcon className="h-12 w-12 text-primary/70" />
        </div>
        <span className="ml-3 text-xl font-medium">Loading...</span>
      </div>
    );
  }

  if (!household) {
    return (
      <div className="text-center py-12">
        <h2 className="text-2xl font-bold text-red-600">Error</h2>
        <p className="mt-2">Failed to load household data.</p>
        <Button className="mt-4" onClick={() => window.location.reload()}>
          Try Again
        </Button>
      </div>
    );
  }

  const todaysChores = household.assignedChores.filter(
    (assignedChore) => {
      const today = new Date();
      const choreDate = new Date(assignedChore.dueDate);
      return (
        choreDate.getDate() === today.getDate() &&
        choreDate.getMonth() === today.getMonth() &&
        choreDate.getFullYear() === today.getFullYear()
      );
    }
  );

  const completedToday = todaysChores.filter(chore => chore.completed).length;
  const totalToday = todaysChores.length;
  const completionRate = totalToday > 0 ? (completedToday / totalToday) * 100 : 0;

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1>Welcome to ChoreWizard</h1>
          <p className="text-muted-foreground mt-1">
            Your AI-powered chore management system
          </p>
        </div>
        <Button onClick={handleDistributeChores} className="md:w-auto w-full">
          <MagicWandIcon className="mr-2 h-4 w-4" />
          Redistribute Chores
        </Button>
      </div>

      {/* Stats overview */}
      <div className="grid gap-4 md:grid-cols-4 grid-cols-2">
        <Card className="stat-card">
          <CardContent className="p-6 flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Total Chores</p>
              <h3 className="text-2xl font-bold">{household.chores.length}</h3>
            </div>
            <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center text-primary">
              <CheckCircle className="h-5 w-5" />
            </div>
          </CardContent>
        </Card>
        <Card className="stat-card">
          <CardContent className="p-6 flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Members</p>
              <h3 className="text-2xl font-bold">{household.members.length}</h3>
            </div>
            <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center text-primary">
              <UserIcon className="h-5 w-5" />
            </div>
          </CardContent>
        </Card>
        <Card className="stat-card">
          <CardContent className="p-6 flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Today's Completion</p>
              <h3 className="text-2xl font-bold">{completedToday}/{totalToday}</h3>
            </div>
            <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center text-primary">
              <CalendarIcon className="h-5 w-5" />
            </div>
          </CardContent>
        </Card>
        <Card className="stat-card">
          <CardContent className="p-6">
            <p className="text-sm font-medium text-muted-foreground">Completion Rate</p>
            <div className="flex items-center">
              <h3 className="text-2xl font-bold">{Math.round(completionRate)}%</h3>
              <div className="ml-auto h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                <RotateCw className="h-5 w-5" />
              </div>
            </div>
            <div className="mt-2 h-2 bg-muted rounded-full w-full overflow-hidden">
              <div 
                className="h-full bg-primary rounded-full"
                style={{ width: `${Math.round(completionRate)}%` }}
              />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Today's chores */}
      <div>
        <h2 className="text-xl font-semibold mb-4">Today's Chores</h2>
        {todaysChores.length === 0 ? (
          <Card className="bg-muted/30">
            <CardContent className="p-8 text-center">
              <p className="text-muted-foreground">No chores scheduled for today.</p>
              <Button variant="outline" className="mt-4" onClick={handleDistributeChores}>
                <MagicWandIcon className="mr-2 h-4 w-4" />
                Generate Chores
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid md:grid-cols-3 sm:grid-cols-2 grid-cols-1 gap-4">
            {todaysChores.map((assignedChore) => {
              const chore = household.chores.find((c) => c.id === assignedChore.choreId);
              const user = household.members.find((u) => u.id === assignedChore.userId);
              
              if (!chore || !user) return null;
              
              return (
                <ChoreCard
                  key={assignedChore.id}
                  chore={chore}
                  assignedChore={assignedChore}
                  user={user}
                  onComplete={handleCompleteChore}
                />
              );
            })}
          </div>
        )}
      </div>

      {/* Household members */}
      <div>
        <h2 className="text-xl font-semibold mb-4">Household Members</h2>
        <div className="grid md:grid-cols-4 grid-cols-2 gap-4">
          {household.members.map((member) => (
            <Card key={member.id} className="overflow-hidden hover:shadow-md transition-shadow">
              <CardContent className="p-0">
                <div className="bg-primary/10 p-6 flex flex-col items-center">
                  <img 
                    src={member.avatar || "https://i.pravatar.cc/150"} 
                    alt={member.name}
                    className="w-16 h-16 rounded-full border-2 border-white"
                  />
                  <h3 className="mt-2 font-medium text-lg">{member.name}</h3>
                </div>
                <div className="p-4">
                  <div className="flex justify-between text-sm mb-1.5">
                    <span className="text-muted-foreground">Completed Chores:</span>
                    <span className="font-medium">{member.stats.completedChores}</span>
                  </div>
                  <div className="flex justify-between text-sm mb-1.5">
                    <span className="text-muted-foreground">Total Points:</span>
                    <span className="font-medium">{member.stats.totalPoints}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Streak:</span>
                    <span className="font-medium">{member.stats.streak} days</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
