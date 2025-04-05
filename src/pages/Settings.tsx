
import React from "react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { AlertCircle } from "lucide-react";

const Settings = () => {
  const { toast } = useToast();

  const handleSave = () => {
    toast({
      title: "Settings saved",
      description: "Your preferences have been updated successfully.",
    });
  };
  
  const handleResetData = () => {
    localStorage.clear();
    toast({
      title: "Data reset",
      description: "All household data has been reset to default.",
      variant: "destructive",
    });
    setTimeout(() => {
      window.location.reload();
    }, 1500);
  };

  return (
    <div className="space-y-6">
      <div>
        <h1>Settings</h1>
        <p className="text-muted-foreground mt-1">
          Manage your preferences and application settings
        </p>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>AI Distribution Settings</CardTitle>
            <CardDescription>
              Configure how chores are distributed among household members
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="respect-preferences">Respect Preferences</Label>
                <p className="text-sm text-muted-foreground">
                  Consider member likes and dislikes when assigning chores
                </p>
              </div>
              <Switch id="respect-preferences" defaultChecked />
            </div>
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="fairness">Fairness Priority</Label>
                <p className="text-sm text-muted-foreground">
                  Prioritize equal workload distribution between members
                </p>
              </div>
              <Switch id="fairness" defaultChecked />
            </div>
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="auto-distribute">Auto-Distribute</Label>
                <p className="text-sm text-muted-foreground">
                  Automatically distribute chores at the start of each week
                </p>
              </div>
              <Switch id="auto-distribute" />
            </div>
          </CardContent>
          <CardFooter>
            <Button onClick={handleSave}>Save Changes</Button>
          </CardFooter>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>Household Settings</CardTitle>
            <CardDescription>
              Update your household information
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="household-name">Household Name</Label>
              <Input id="household-name" defaultValue="Our Home" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="timezone">Timezone</Label>
              <select 
                id="timezone"
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                defaultValue="America/New_York"
              >
                <option value="America/New_York">Eastern Time (US & Canada)</option>
                <option value="America/Chicago">Central Time (US & Canada)</option>
                <option value="America/Denver">Mountain Time (US & Canada)</option>
                <option value="America/Los_Angeles">Pacific Time (US & Canada)</option>
                <option value="Europe/London">London</option>
                <option value="Europe/Paris">Paris</option>
                <option value="Asia/Tokyo">Tokyo</option>
              </select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="start-of-week">Start of Week</Label>
              <select 
                id="start-of-week"
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                defaultValue="0"
              >
                <option value="0">Sunday</option>
                <option value="1">Monday</option>
              </select>
            </div>
          </CardContent>
          <CardFooter>
            <Button onClick={handleSave}>Save Changes</Button>
          </CardFooter>
        </Card>
      </div>

      <Separator className="my-6" />
      
      <Card className="border-destructive/50">
        <CardHeader className="text-destructive">
          <div className="flex items-center">
            <AlertCircle className="h-5 w-5 mr-2" />
            <CardTitle>Danger Zone</CardTitle>
          </div>
          <CardDescription>
            Actions here cannot be undone. Be careful.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm">
            Resetting your data will remove all household members, chores, and history. 
            Your settings will be returned to default.
          </p>
        </CardContent>
        <CardFooter>
          <Button variant="destructive" onClick={handleResetData}>
            Reset All Data
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
};

export default Settings;
