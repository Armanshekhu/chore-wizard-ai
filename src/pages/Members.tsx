import React, { useState, useEffect } from "react";
import { getHousehold, addUser } from "@/services/data";
import { Household, User } from "@/types";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent } from "@/components/ui/card";
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Checkbox } from "@/components/ui/checkbox";
import { MagicWandIcon, PlusIcon, Trash2 } from "lucide-react";

const Members = () => {
  const [household, setHousehold] = useState<Household | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState<boolean>(false);
  const { toast } = useToast();

  // Form state for new user
  const [newUser, setNewUser] = useState<Partial<User>>({
    name: "",
    avatar: `https://i.pravatar.cc/150?u=${Math.random().toString(36).substring(2, 15)}`,
    preferences: {
      likedChores: [],
      dislikedChores: [],
    },
  });

  // Chore preferences for the new user
  const [likedChores, setLikedChores] = useState<string[]>([]);
  const [dislikedChores, setDislikedChores] = useState<string[]>([]);

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
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const { name, value } = e.target;
    setNewUser((prev) => ({ ...prev, [name]: value }));
  };

  const handleToggleLiked = (choreId: string) => {
    setLikedChores(prev => {
      // If already liked, remove from liked
      if (prev.includes(choreId)) {
        return prev.filter(id => id !== choreId);
      }
      // Otherwise add to liked and ensure it's not in disliked
      setDislikedChores(current => current.filter(id => id !== choreId));
      return [...prev, choreId];
    });
  };
  
  const handleToggleDisliked = (choreId: string) => {
    setDislikedChores(prev => {
      // If already disliked, remove from disliked
      if (prev.includes(choreId)) {
        return prev.filter(id => id !== choreId);
      }
      // Otherwise add to disliked and ensure it's not in liked
      setLikedChores(current => current.filter(id => id !== choreId));
      return [...prev, choreId];
    });
  };

  const handleAddUser = () => {
    if (!household) return;

    // Validate input
    if (!newUser.name) {
      toast({
        variant: "destructive",
        title: "Missing information",
        description: "Please enter a name for the new member.",
      });
      return;
    }

    try {
      // Create new user with a unique ID
      const userToAdd: User = {
        id: `user-${Date.now()}`,
        name: newUser.name,
        avatar: newUser.avatar,
        preferences: {
          likedChores: likedChores,
          dislikedChores: dislikedChores,
        },
        stats: {
          completedChores: 0,
          totalPoints: 0,
          streak: 0,
        },
      };

      const updatedHousehold = addUser(userToAdd);
      setHousehold(updatedHousehold);
      
      // Reset form and close dialog
      setNewUser({
        name: "",
        avatar: `https://i.pravatar.cc/150?u=${Math.random().toString(36).substring(2, 15)}`,
        preferences: {
          likedChores: [],
          dislikedChores: [],
        },
      });
      setLikedChores([]);
      setDislikedChores([]);
      setIsAddDialogOpen(false);
      
      toast({
        title: "Member added!",
        description: `${userToAdd.name} has been added to your household.`,
      });
    } catch (error) {
      console.error("Error adding user:", error);
      toast({
        variant: "destructive",
        title: "Error adding member",
        description: "There was a problem adding the new member.",
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

  const categoryIcons: Record<string, string> = {
    kitchen: "🍽️",
    bathroom: "🚿",
    livingRoom: "🛋️",
    bedroom: "🛏️",
    outdoor: "🌳",
    pets: "🐾",
    other: "📦",
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1>Household Members</h1>
          <p className="text-muted-foreground mt-1">
            Manage members and their preferences
          </p>
        </div>
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <PlusIcon className="h-4 w-4 mr-2" />
              Add New Member
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add New Member</DialogTitle>
              <DialogDescription>
                Add a new member to your household and set their chore preferences.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-6 py-4">
              <div className="space-y-2">
                <Label htmlFor="name">Name</Label>
                <Input
                  id="name"
                  name="name"
                  value={newUser.name}
                  onChange={handleInputChange}
                  placeholder="e.g. Alex Johnson"
                />
              </div>
              
              <div>
                <Label className="block mb-2">Chore Preferences</Label>
                <Tabs defaultValue="liked">
                  <TabsList className="grid w-full grid-cols-2">
                    <TabsTrigger value="liked">Liked Chores</TabsTrigger>
                    <TabsTrigger value="disliked">Disliked Chores</TabsTrigger>
                  </TabsList>
                  <TabsContent value="liked" className="p-4 border rounded-md mt-2">
                    <p className="text-sm text-muted-foreground mb-3">
                      Select chores that this person enjoys doing:
                    </p>
                    <div className="space-y-2">
                      {household.chores.map((chore) => (
                        <div key={`liked-${chore.id}`} className="flex items-start space-x-2">
                          <Checkbox 
                            id={`liked-${chore.id}`} 
                            checked={likedChores.includes(chore.id)}
                            onCheckedChange={() => handleToggleLiked(chore.id)}
                          />
                          <div className="grid gap-1.5 leading-none">
                            <label
                              htmlFor={`liked-${chore.id}`}
                              className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 flex items-center"
                            >
                              <span className="mr-1">{categoryIcons[chore.category]}</span>
                              {chore.name}
                            </label>
                          </div>
                        </div>
                      ))}
                    </div>
                  </TabsContent>
                  <TabsContent value="disliked" className="p-4 border rounded-md mt-2">
                    <p className="text-sm text-muted-foreground mb-3">
                      Select chores that this person dislikes doing:
                    </p>
                    <div className="space-y-2">
                      {household.chores.map((chore) => (
                        <div key={`disliked-${chore.id}`} className="flex items-start space-x-2">
                          <Checkbox 
                            id={`disliked-${chore.id}`} 
                            checked={dislikedChores.includes(chore.id)}
                            onCheckedChange={() => handleToggleDisliked(chore.id)}
                          />
                          <div className="grid gap-1.5 leading-none">
                            <label
                              htmlFor={`disliked-${chore.id}`}
                              className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 flex items-center"
                            >
                              <span className="mr-1">{categoryIcons[chore.category]}</span>
                              {chore.name}
                            </label>
                          </div>
                        </div>
                      ))}
                    </div>
                  </TabsContent>
                </Tabs>
              </div>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setIsAddDialogOpen(false)}>
                Cancel
              </Button>
              <Button type="button" onClick={handleAddUser}>
                Add Member
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        {household.members.map((member) => (
          <Card key={member.id} className="overflow-hidden">
            <CardContent className="p-0">
              <div className="bg-primary/10 p-6">
                <div className="flex items-center space-x-4">
                  <img 
                    src={member.avatar || "https://i.pravatar.cc/150"} 
                    alt={member.name}
                    className="w-16 h-16 rounded-full border-2 border-white"
                  />
                  <div className="flex-1">
                    <h3 className="font-medium text-lg">{member.name}</h3>
                    <div className="flex items-center text-sm text-muted-foreground space-x-4 mt-0.5">
                      <span>{member.stats.completedChores} chores completed</span>
                      <span>{member.stats.totalPoints} points</span>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="p-6 space-y-4">
                <div>
                  <h4 className="font-medium text-sm mb-2">Chore Preferences</h4>
                  <div className="space-y-3">
                    <div>
                      <h5 className="text-xs font-medium text-muted-foreground mb-1.5">Likes</h5>
                      <div className="flex flex-wrap gap-2">
                        {member.preferences.likedChores.length > 0 ? (
                          member.preferences.likedChores.map(choreId => {
                            const chore = household.chores.find(c => c.id === choreId);
                            if (!chore) return null;
                            
                            return (
                              <span 
                                key={`liked-${choreId}`}
                                className="bg-green-100 text-green-800 text-xs py-1 px-2 rounded-full flex items-center"
                              >
                                <span className="mr-1">{categoryIcons[chore.category]}</span>
                                {chore.name}
                              </span>
                            );
                          })
                        ) : (
                          <span className="text-xs text-muted-foreground">No preferred chores set</span>
                        )}
                      </div>
                    </div>
                    
                    <div>
                      <h5 className="text-xs font-medium text-muted-foreground mb-1.5">Dislikes</h5>
                      <div className="flex flex-wrap gap-2">
                        {member.preferences.dislikedChores.length > 0 ? (
                          member.preferences.dislikedChores.map(choreId => {
                            const chore = household.chores.find(c => c.id === choreId);
                            if (!chore) return null;
                            
                            return (
                              <span 
                                key={`disliked-${choreId}`}
                                className="bg-red-100 text-red-800 text-xs py-1 px-2 rounded-full flex items-center"
                              >
                                <span className="mr-1">{categoryIcons[chore.category]}</span>
                                {chore.name}
                              </span>
                            );
                          })
                        ) : (
                          <span className="text-xs text-muted-foreground">No disliked chores set</span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
                
                <div>
                  <h4 className="font-medium text-sm mb-2">Statistics</h4>
                  <div className="grid grid-cols-3 gap-2 text-center">
                    <div className="bg-muted/30 p-2 rounded-md">
                      <div className="text-lg font-medium">{member.stats.completedChores}</div>
                      <div className="text-xs text-muted-foreground">Chores</div>
                    </div>
                    <div className="bg-muted/30 p-2 rounded-md">
                      <div className="text-lg font-medium">{member.stats.totalPoints}</div>
                      <div className="text-xs text-muted-foreground">Points</div>
                    </div>
                    <div className="bg-muted/30 p-2 rounded-md">
                      <div className="text-lg font-medium">{member.stats.streak}</div>
                      <div className="text-xs text-muted-foreground">Streak</div>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default Members;
