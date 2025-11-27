import { useEffect } from "react";
import { ProfileCard } from "@/components/ProfileCard";
import { StatsGrid } from "@/components/StatsGrid";
import { MatchRatings } from "@/components/MatchRatings";
import { QuickActions } from "@/components/QuickActions";
import { NewsFeed } from "@/components/NewsFeed";
import { PlayerSearch } from "@/components/PlayerSearch";
import { useAuth } from "@/contexts/AuthContext";
import { Sparkles } from "lucide-react";

const Index = () => {
  const { user } = useAuth();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);
  
  return (
    <div className="min-h-screen bg-background">
      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        <div className="max-w-7xl mx-auto space-y-8">
          {/* Welcome Message */}
          <div className="flex items-center gap-3 animate-fade-in">
            <Sparkles className="w-6 h-6 text-primary" />
            <div>
              <h2 className="text-2xl font-bold">Welcome back, {user?.username || 'Player'}!</h2>
              <p className="text-sm text-muted-foreground">Ready to dominate the field today?</p>
            </div>
          </div>

          {/* Player Search */}
          <PlayerSearch />

          {/* Profile Section */}
          <ProfileCard />

          {/* Stats Grid */}
          <StatsGrid />

          {/* Match Ratings */}
          <MatchRatings />

          {/* Quick Actions */}
          <QuickActions />

          {/* News Feed */}
          <NewsFeed />
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-border/50 mt-16 py-8 bg-card/30 backdrop-blur-sm">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="text-center md:text-left">
              <p className="text-lg font-semibold">
                <span className="text-foreground">Stat</span>
                <span className="text-primary">Hub</span>
              </p>
              <p className="text-xs text-muted-foreground mt-1">Season 25/26</p>
            </div>
            <p className="text-sm text-muted-foreground text-center">
              Track your journey • Compete with friends • Achieve greatness
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Index;
