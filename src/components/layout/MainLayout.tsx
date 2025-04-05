
import React from "react";
import { Link, Outlet } from "react-router-dom";
import { MagicWandIcon, HomeIcon, CalendarIcon, CheckCheckIcon, UserIcon, SettingsIcon } from "lucide-react";
import { cn } from "@/lib/utils";

type NavItem = {
  href: string;
  label: string;
  icon: React.ReactNode;
};

const navItems: NavItem[] = [
  { href: "/", label: "Dashboard", icon: <HomeIcon className="h-5 w-5" /> },
  { href: "/schedule", label: "Schedule", icon: <CalendarIcon className="h-5 w-5" /> },
  { href: "/chores", label: "Chores", icon: <CheckCheckIcon className="h-5 w-5" /> },
  { href: "/members", label: "Members", icon: <UserIcon className="h-5 w-5" /> },
  { href: "/settings", label: "Settings", icon: <SettingsIcon className="h-5 w-5" /> },
];

const MainLayout: React.FC = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = React.useState(false);

  return (
    <div className="min-h-screen flex flex-col">
      {/* Header */}
      <header className="bg-white border-b sticky top-0 z-10">
        <div className="container mx-auto px-4 py-3 flex items-center justify-between">
          <Link to="/" className="flex items-center space-x-2">
            <div className="bg-primary rounded-md p-1.5">
              <MagicWandIcon className="h-5 w-5 text-white" />
            </div>
            <span className="text-xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
              ChoreWizard
            </span>
          </Link>
          
          {/* Mobile menu button */}
          <button 
            className="md:hidden bg-primary/10 hover:bg-primary/20 rounded-md p-2 transition-colors"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          >
            <span className="sr-only">Open menu</span>
            <svg 
              xmlns="http://www.w3.org/2000/svg" 
              className="h-5 w-5" 
              fill="none" 
              viewBox="0 0 24 24" 
              stroke="currentColor"
            >
              <path 
                strokeLinecap="round" 
                strokeLinejoin="round" 
                strokeWidth={2} 
                d={isMobileMenuOpen ? "M6 18L18 6M6 6l12 12" : "M4 6h16M4 12h16M4 18h16"} 
              />
            </svg>
          </button>

          {/* Desktop navbar */}
          <nav className="hidden md:flex items-center space-x-6">
            {navItems.map((item) => (
              <Link
                key={item.href}
                to={item.href}
                className="flex items-center space-x-1.5 text-sm font-medium text-muted-foreground hover:text-primary transition-colors"
              >
                {item.icon}
                <span>{item.label}</span>
              </Link>
            ))}
          </nav>
        </div>
      </header>

      {/* Mobile navigation */}
      {isMobileMenuOpen && (
        <div className="md:hidden fixed inset-0 z-50 bg-background/80 backdrop-blur-sm">
          <div className="fixed inset-y-0 right-0 w-3/4 bg-white shadow-lg">
            <div className="flex items-center justify-between p-4 border-b">
              <span className="font-semibold">Menu</span>
              <button 
                onClick={() => setIsMobileMenuOpen(false)}
                className="rounded-md p-1 hover:bg-muted"
              >
                <span className="sr-only">Close menu</span>
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 24 24" fill="none">
                  <path d="M18 6L6 18M6 6l12 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                </svg>
              </button>
            </div>
            <nav className="p-4 space-y-4">
              {navItems.map((item) => (
                <Link
                  key={item.href}
                  to={item.href}
                  className="flex items-center space-x-2 px-2 py-2 rounded-md hover:bg-muted transition-colors"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  {item.icon}
                  <span className="font-medium">{item.label}</span>
                </Link>
              ))}
            </nav>
          </div>
        </div>
      )}

      {/* Main content */}
      <main className="flex-1 container mx-auto px-4 py-6">
        <Outlet />
      </main>

      {/* Footer */}
      <footer className="bg-muted/30 py-4 border-t">
        <div className="container mx-auto px-4 text-center text-sm text-muted-foreground">
          ChoreWizard AI &copy; {new Date().getFullYear()} | Powered by Lovable
        </div>
      </footer>
    </div>
  );
};

export default MainLayout;
