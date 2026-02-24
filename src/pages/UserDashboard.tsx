import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { UserIcon, LogOutIcon, CheckCheckIcon, CalendarIcon } from "lucide-react";
import { Link } from "react-router-dom";

const UserDashboard = () => {
  const { user, signOut } = useAuth();

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
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card>
            <CardHeader className="flex flex-row items-center gap-2">
              <CheckCheckIcon className="h-5 w-5 text-secondary" />
              <CardTitle className="text-lg">My Chores</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground mb-3">View and complete your assigned chores.</p>
              <Link to="/chores">
                <Button variant="outline" size="sm">Go to Chores</Button>
              </Link>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center gap-2">
              <CalendarIcon className="h-5 w-5 text-accent" />
              <CardTitle className="text-lg">My Schedule</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground mb-3">View your upcoming chore schedule.</p>
              <Link to="/schedule">
                <Button variant="outline" size="sm">Go to Schedule</Button>
              </Link>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
};

export default UserDashboard;
