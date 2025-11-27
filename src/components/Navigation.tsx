import { NavLink, Link, useLocation } from "react-router-dom";
import { Home, Trophy, Medal, Users, User, Newspaper, LogIn, UserPlus } from "lucide-react";
import { UserMenu } from "./UserMenu";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "./ui/button";

const navItems = [
  { title: "Home", path: "/", icon: Home },
  { title: "Matches", path: "/matches", icon: Trophy },
  { title: "Achievements", path: "/achievements", icon: Medal },
  { title: "Profile", path: "/profile", icon: User },
  { title: "Press Room", path: "/news", icon: Newspaper },
];

export const Navigation = () => {
  const { isAuthenticated } = useAuth();
  const location = useLocation();
  
  // Hide navigation tabs on authentication pages
  const isAuthPage = location.pathname === "/login" || 
                     location.pathname === "/signup" || 
                     location.pathname === "/forgot-password";
  
  const showNavItems = isAuthenticated && !isAuthPage;

  return (
    <header className="border-b border-border/50 backdrop-blur-md sticky top-0 z-50 bg-background/95">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <NavLink to="/" className="text-2xl font-bold flex items-center gap-0 hover:opacity-80 transition-opacity">
            <span className="text-foreground">Stat</span>
            <span className="text-primary">Hub</span>
          </NavLink>

          {/* Desktop Navigation */}
          {showNavItems && (
            <nav className="hidden md:flex items-center gap-1">
              {navItems.map((item) => (
                <NavLink
                  key={item.path}
                  to={item.path}
                  end={item.path === "/"}
                  className={({ isActive }) =>
                    `flex items-center gap-2 px-4 py-2 rounded-lg transition-all duration-200 ${
                      isActive
                        ? "bg-primary/10 text-primary font-medium"
                        : "text-muted-foreground hover:text-foreground hover:bg-secondary/50"
                    }`
                  }
                >
                  <item.icon className="w-4 h-4" />
                  <span className="text-sm">{item.title}</span>
                </NavLink>
              ))}
            </nav>
          )}

          {/* Auth Actions */}
          {isAuthenticated ? (
            <UserMenu />
          ) : (
            <div className="flex items-center gap-2">
              <Button asChild variant="ghost" size="sm">
                <Link to="/login">
                  <LogIn className="w-4 h-4 mr-2" />
                  Login
                </Link>
              </Button>
              <Button asChild size="sm">
                <Link to="/signup">
                  <UserPlus className="w-4 h-4 mr-2" />
                  Sign up
                </Link>
              </Button>
            </div>
          )}
        </div>

        {/* Mobile Navigation */}
        {showNavItems && (
          <nav className="md:hidden flex items-center gap-1 overflow-x-auto pb-2 -mx-2 px-2 custom-scrollbar">
            {navItems.map((item) => (
              <NavLink
                key={item.path}
                to={item.path}
                end={item.path === "/"}
                className={({ isActive }) =>
                  `flex items-center gap-2 px-3 py-1.5 rounded-lg transition-all duration-200 whitespace-nowrap ${
                    isActive
                      ? "bg-primary/10 text-primary font-medium"
                      : "text-muted-foreground hover:text-foreground hover:bg-secondary/50"
                  }`
                }
              >
                <item.icon className="w-4 h-4" />
                <span className="text-xs">{item.title}</span>
              </NavLink>
            ))}
          </nav>
        )}
      </div>
    </header>
  );
};
