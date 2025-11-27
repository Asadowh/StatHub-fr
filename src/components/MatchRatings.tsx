import { useEffect, useState, useRef } from "react";
import { Card } from "@/components/ui/card";
import { TrendingUp, TrendingDown, Minus, Loader2 } from "lucide-react";
import { statApi, type RecentPerformance } from "@/lib/api";
import { useAuth } from "@/contexts/AuthContext";

const getTrendIcon = (rating: number) => {
  if (rating >= 8) return <TrendingUp className="w-4 h-4 text-green-500" />;
  if (rating >= 6.5) return <Minus className="w-4 h-4 text-yellow-500" />;
  return <TrendingDown className="w-4 h-4 text-red-500" />;
};

const getResultColor = (result: "W" | "L" | "D") => {
  if (result === "W") return "text-green-500";
  if (result === "L") return "text-red-500";
  return "text-yellow-500";
};

const getRatingColor = (rating: number) => {
  if (rating >= 8) return "text-primary";
  if (rating >= 6.5) return "text-yellow-500";
  return "text-red-500";
};

export const MatchRatings = () => {
  const { user } = useAuth();
  const [performances, setPerformances] = useState<RecentPerformance[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const loadedRef = useRef(false);

  useEffect(() => {
    if (loadedRef.current || !user) {
      setIsLoading(false);
      return;
    }
    
    loadedRef.current = true;
    
    const loadPerformances = async () => {
      try {
        const data = await statApi.getMyRecentPerformances(3);
        setPerformances(data);
      } catch (error) {
        console.error("Failed to load recent performances:", error);
      } finally {
        setIsLoading(false);
      }
    };

    loadPerformances();
  }, [user]);

  // Show loading state
  if (isLoading) {
    return (
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-xl font-semibold">Recent Performances</h3>
          <span className="text-sm text-muted-foreground">Last 3 matches</span>
        </div>
        <div className="flex items-center justify-center py-8">
          <Loader2 className="w-6 h-6 animate-spin text-primary" />
        </div>
      </section>
    );
  }

  // Show empty state if no performances
  if (performances.length === 0) {
    return (
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-xl font-semibold">Recent Performances</h3>
          <span className="text-sm text-muted-foreground">Last 3 matches</span>
        </div>
        <Card className="p-8 text-center bg-gradient-to-br from-card to-card/50 border-border/50">
          <p className="text-muted-foreground">No matches played yet</p>
          <p className="text-sm text-muted-foreground mt-1">Your recent performances will appear here</p>
        </Card>
      </section>
    );
  }

  return (
    <section className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-xl font-semibold">Recent Performances</h3>
        <span className="text-sm text-muted-foreground">Last {performances.length} matches</span>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        {performances.map((perf) => {
          const winner = perf.home_score > perf.away_score 
            ? perf.home_team 
            : perf.away_score > perf.home_score 
              ? perf.away_team 
              : null;
          
          return (
            <Card
              key={perf.id}
              className="p-5 bg-gradient-to-br from-card to-card/50 border-border/50 hover:border-primary/30 transition-all duration-300 hover:shadow-gold group"
            >
              <div className="space-y-3">
                {/* Match Header */}
                <div className="flex items-start justify-between">
                  <p className="font-semibold text-foreground group-hover:text-primary transition-colors">
                    <span className={winner === perf.home_team ? "text-primary" : ""}>
                      {perf.home_team}
                    </span>
                    {" "}
                    <span className={winner === perf.home_team ? "text-primary" : "text-muted-foreground"}>
                      {perf.home_score}
                    </span>
                    {" - "}
                    <span className={winner === perf.away_team ? "text-primary" : "text-muted-foreground"}>
                      {perf.away_score}
                    </span>
                    {" "}
                    <span className={winner === perf.away_team ? "text-primary" : ""}>
                      {perf.away_team}
                    </span>
                  </p>
                  <span className={`text-lg font-bold ${getResultColor(perf.player_result)}`}>
                    {perf.player_result}
                  </span>
                </div>

                {/* Player Stats */}
                <div className="flex items-center gap-4 text-sm text-muted-foreground">
                  <span>⚽ {perf.goals} goals</span>
                  <span>🅰️ {perf.assists} assists</span>
                </div>

                {/* Rating Display */}
                <div className="flex items-center justify-between pt-2 border-t border-border/50">
                  <div className="flex items-center gap-2">
                    {getTrendIcon(perf.rating)}
                    <span className="text-xs text-muted-foreground">Rating</span>
                  </div>
                  <span className={`text-3xl font-bold ${getRatingColor(perf.rating)}`}>
                    {perf.rating.toFixed(1)}
                  </span>
                </div>

                {/* Date */}
                <p className="text-xs text-muted-foreground text-right">{perf.match_date}</p>
              </div>
            </Card>
          );
        })}
      </div>
    </section>
  );
};
