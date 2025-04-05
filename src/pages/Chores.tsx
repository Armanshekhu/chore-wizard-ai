
import React, { useState, useEffect } from "react";
import { getHousehold, addChore } from "@/services/data";
import { Household, Chore, ChoreCategory } from "@/types";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { MagicWandIcon, PlusIcon } from "lucide-react";

const frequencies = [
  { value: "daily", label: "Daily" },
  { value: "weekly", label: "Weekly" },
  { value: "monthly", label: "Monthly" },
];

const difficulties = [
  { value: "1", label: "Easy" },
  { value: "2", label: "Medium" },
  { value: "3", label: "Hard" },
];

const categories = [
  { value: "kitchen", label: "Kitchen", icon: "🍽️" },
  { value: "bathroom", label: "Bathroom", icon: "🚿" },
  { value: "livingRoom", label: "Living Room", icon: "🛋️" },
  { value: "bedroom", label: "Bedroom", icon: "🛏️" },
  { value: "outdoor", label: "Outdoor", icon: "🌳" },
  { value: "pets", label: "Pets", icon: "🐾" },
  { value: "other", label: "Other", icon: "📦" },
];

const Chores: React.FC = () => {
  const [household, setHousehold] = useState<Household | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState<boolean>(false);
  const { toast } = useToast();

  // Form state for new chore
  const [newChore, setNewChore] = useState<Partial<Chore>>({
    name: "",
    description: "",
    difficulty: 1,
    frequency: "daily",
    estimatedTime: 15,
    category: "other",
  });

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

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setNewChore((prev) => ({ ...prev, [name]: value }));
  };

  const handleNumberChange = (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const { name, value } = e.target;
    setNewChore((prev) => ({ ...prev, [name]: parseInt(value) || 0 }));
  };

  const handleSelectChange = (name: string, value: string) => {
    if (name === "difficulty") {
      setNewChore((prev) => ({ ...prev, [name]: parseInt(value) as 1 | 2 | 3 }));
    } else {
      setNewChore((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleAddChore = () => {
    if (!household) return;

    // Validate input
    if (!newChore.name || !newChore.description) {
      toast({
        variant: "destructive",
        title: "Missing information",
        description: "Please fill in all required fields.",
      });
      return;
    }

    try {
      // Create new chore with a unique ID
      const choreToAdd: Chore = {
        id: `chore-${Date.now()}`,
        name: newChore.name,
        description: newChore.description,
        difficulty: newChore.difficulty as 1 | 2 | 3,
        frequency: newChore.frequency as "daily" | "weekly" | "monthly",
        estimatedTime: newChore.estimatedTime || 15,
        category: newChore.category as ChoreCategory,
      };

      const updatedHousehold = addChore(choreToAdd);
      setHousehold(updatedHousehold);
      
      // Reset form and close dialog
      setNewChore({
        name: "",
        description: "",
        difficulty: 1,
        frequency: "daily",
        estimatedTime: 15,
        category: "other",
      });
      setIsAddDialogOpen(false);
      
      toast({
        title: "Chore added!",
        description: `"${choreToAdd.name}" has been added successfully.`,
      });
    } catch (error) {
      console.error("Error adding chore:", error);
      toast({
        variant: "destructive",
        title: "Error adding chore",
        description: "There was a problem adding the chore.",
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
      </div>
    );
  }

  const choresByCategory = household.chores.reduce<Record<ChoreCategory, Chore[]>>(
    (acc, chore) => {
      if (!acc[chore.category]) {
        acc[chore.category] = [];
      }
      acc[chore.category].push(chore);
      return acc;
    },
    {} as Record<ChoreCategory, Chore[]>
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1>Chore Management</h1>
          <p className="text-muted-foreground mt-1">
            Create and manage household chores
          </p>
        </div>
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <PlusIcon className="h-4 w-4 mr-2" />
              Add New Chore
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>Add New Chore</DialogTitle>
              <DialogDescription>
                Create a new chore for your household.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="name">Name</Label>
                <Input
                  id="name"
                  name="name"
                  value={newChore.name}
                  onChange={handleInputChange}
                  placeholder="e.g. Wash Dishes"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  name="description"
                  value={newChore.description}
                  onChange={handleInputChange}
                  placeholder="Describe what this chore entails"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="difficulty">Difficulty</Label>
                  <Select
                    value={String(newChore.difficulty)}
                    onValueChange={(value) => handleSelectChange("difficulty", value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select difficulty" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectGroup>
                        <SelectLabel>Difficulty Level</SelectLabel>
                        {difficulties.map((difficulty) => (
                          <SelectItem key={difficulty.value} value={difficulty.value}>
                            {difficulty.label}
                          </SelectItem>
                        ))}
                      </SelectGroup>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="frequency">Frequency</Label>
                  <Select
                    value={newChore.frequency}
                    onValueChange={(value) => handleSelectChange("frequency", value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select frequency" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectGroup>
                        <SelectLabel>Repeat</SelectLabel>
                        {frequencies.map((frequency) => (
                          <SelectItem key={frequency.value} value={frequency.value}>
                            {frequency.label}
                          </SelectItem>
                        ))}
                      </SelectGroup>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="estimatedTime">Time (minutes)</Label>
                  <Input
                    id="estimatedTime"
                    name="estimatedTime"
                    type="number"
                    value={newChore.estimatedTime}
                    onChange={handleNumberChange}
                    min={1}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="category">Category</Label>
                  <Select
                    value={newChore.category}
                    onValueChange={(value) => handleSelectChange("category", value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectGroup>
                        <SelectLabel>Category</SelectLabel>
                        {categories.map((category) => (
                          <SelectItem key={category.value} value={category.value}>
                            <div className="flex items-center">
                              <span className="mr-2">{category.icon}</span>
                              {category.label}
                            </div>
                          </SelectItem>
                        ))}
                      </SelectGroup>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setIsAddDialogOpen(false)}>
                Cancel
              </Button>
              <Button type="button" onClick={handleAddChore}>
                Add Chore
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <div className="space-y-8">
        {categories.map((category) => {
          const chores = choresByCategory[category.value as ChoreCategory] || [];
          if (chores.length === 0) return null;
          
          return (
            <div key={category.value} className="space-y-3">
              <div className="flex items-center gap-2">
                <span className="text-xl">{category.icon}</span>
                <h2 className="text-xl font-semibold">{category.label}</h2>
              </div>
              <div className="grid md:grid-cols-3 sm:grid-cols-2 grid-cols-1 gap-4">
                {chores.map((chore) => (
                  <Card key={chore.id} className="hover:shadow-md transition-shadow">
                    <CardHeader className="p-4 pb-2">
                      <CardTitle className="text-lg">{chore.name}</CardTitle>
                    </CardHeader>
                    <CardContent className="p-4 pt-1 space-y-3">
                      <p className="text-sm text-muted-foreground">{chore.description}</p>
                      <div className="grid grid-cols-2 gap-2 text-xs">
                        <div>
                          <span className="block text-muted-foreground">Difficulty:</span>
                          <span className="font-medium">
                            {difficulties.find(d => d.value === String(chore.difficulty))?.label}
                          </span>
                        </div>
                        <div>
                          <span className="block text-muted-foreground">Frequency:</span>
                          <span className="font-medium">
                            {frequencies.find(f => f.value === chore.frequency)?.label}
                          </span>
                        </div>
                        <div>
                          <span className="block text-muted-foreground">Est. Time:</span>
                          <span className="font-medium">{chore.estimatedTime} min</span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default Chores;
