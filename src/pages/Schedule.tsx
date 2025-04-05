
import React, { useState, useEffect } from "react";
import { getHousehold, completeChore } from "@/services/data";
import { Household } from "@/types";
import ScheduleCalendar from "@/components/schedule/ScheduleCalendar";
import { useToast } from "@/hooks/use-toast";
import { Wand2Icon } from "lucide-react";

const Schedule = () => {
  const [household, setHousehold] = useState<Household | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const { toast } = useToast();

  useEffect(() => {
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

  const handleCompleteChore = (choreId: string) => {
    if (!household) return;

    try {
      const updatedHousehold = completeChore(choreId);
      setHousehold(updatedHousehold);
      toast({
        title: "Chore completed!",
        description: "The chore has been marked as complete.",
      });
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
          <Wand2Icon className="h-12 w-12 text-primary/70" />
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
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1>Weekly Schedule</h1>
        <p className="text-muted-foreground mt-1">
          View and manage all upcoming chores
        </p>
      </div>

      <ScheduleCalendar 
        household={household} 
        onCompleteChore={handleCompleteChore} 
      />

      <div className="rounded-lg border bg-card p-4">
        <h3 className="text-lg font-medium mb-2">Schedule Legend</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="flex items-center gap-2">
            <span className="text-xl">🍽️</span>
            <span>Kitchen</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xl">🚿</span>
            <span>Bathroom</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xl">🛋️</span>
            <span>Living Room</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xl">🛏️</span>
            <span>Bedroom</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xl">🌳</span>
            <span>Outdoor</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xl">🐾</span>
            <span>Pets</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xl">📦</span>
            <span>Other</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Schedule;
