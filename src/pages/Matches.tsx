import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Trophy, Calendar, Loader2, Plus, ChevronRight } from "lucide-react";
import { matchApi, type Match } from "@/lib/api";
import { useAuth } from "@/contexts/AuthContext";
import { CreateMatchDialog } from "@/components/CreateMatchDialog";
import { MatchDetailsDialog } from "@/components/MatchDetailsDialog";

const ITEMS_PER_PAGE = 6;

const Matches = () => {
  const [matches, setMatches] = useState<Match[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [displayedCount, setDisplayedCount] = useState(ITEMS_PER_PAGE);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [selectedMatch, setSelectedMatch] = useState<Match | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  useEffect(() => {
    window.scrollTo(0, 0);
    loadMatches();
  }, []);

  const loadMatches = async () => {
    try {
      setIsLoading(true);
      const data = await matchApi.getAll();
      setMatches(data);
    } catch (error) {
      console.error("Failed to load matches:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const displayedMatches = matches.slice(0, displayedCount);
  const hasMore = displayedCount < matches.length;

  const loadMore = () => {
    setIsLoadingMore(true);
    setTimeout(() => {
      setDisplayedCount(prev => Math.min(prev + ITEMS_PER_PAGE, matches.length));
      setIsLoadingMore(false);
    }, 500);
  };

  const getWinner = (match: Match) => {
    if (match.home_score > match.away_score) return match.home_team;
    if (match.away_score > match.home_score) return match.away_team;
    return "Draw";
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      month: 'long', 
      day: 'numeric', 
      year: 'numeric' 
    });
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl">
      <div className="space-y-8">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold mb-2">Recent Matches</h1>
            <p className="text-muted-foreground">See how teams across the league have performed recently</p>
          </div>
          <div className="flex items-center gap-4">
            <CreateMatchDialog onMatchCreated={loadMatches} />
            <Trophy className="w-12 h-12 text-primary" />
          </div>
        </div>

        {/* No Upcoming Match Banner */}
      {/* No Upcoming Match Banner */}
<Card className="relative overflow-hidden bg-gradient-to-br from-card to-card/50 border-border/50">
  <div className="relative h-80 w-full overflow-hidden rounded-lg">
    
    {/* FULL BACKGROUND IMAGE */}
    <div 
      className="absolute inset-0 bg-cover bg-center"
      style={{ backgroundImage: "url('/stadium.jpg')" }}
    />

    {/* DARK OVERLAY FOR READABILITY */}
    <div className="absolute inset-0 bg-black/50" />

    {/* TEXT OVER THE IMAGE */}
    <div className="relative z-10 flex flex-col items-center justify-center h-full text-center px-6">
      <h2 className="text-3xl font-bold text-white mb-3">
        No future games scheduled yet.
      </h2>
      <p className="text-white/80 text-lg">
        Check back later for upcoming match announcements.
      </p>
    </div>

  </div>
</Card>




        {/* Filters */}
        <div className="flex gap-2 flex-wrap justify-center md:justify-start">
          <Button variant="default" className="bg-primary text-primary-foreground">
            All Matches
          </Button>
        </div>

        {/* Matches List */}
        {displayedMatches.length > 0 ? (
          <div className="space-y-4">
            {displayedMatches.map((match) => {
              const winner = getWinner(match);
              return (
                <Card
                  key={match.id}
                  className="p-6 bg-gradient-to-br from-card to-card/50 border-border/50 hover:border-primary/30 transition-all duration-300 hover:shadow-gold cursor-pointer group"
                  onClick={() => {
                    setSelectedMatch(match);
                    setIsDialogOpen(true);
                  }}
                >
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    {/* Match Info */}
                    <div className="flex-1 space-y-3">
                      <div className="flex items-center gap-3 flex-wrap">
                        <h3 className="text-2xl font-bold">
                          <span className={winner === match.home_team ? "text-primary" : ""}>
                            {match.home_team}
                          </span>
                          {" "}
                          <span className={winner === match.home_team ? "text-primary" : "text-muted-foreground"}>
                            {match.home_score}
                          </span>
                          {" - "}
                          <span className={winner === match.away_team ? "text-primary" : "text-muted-foreground"}>
                            {match.away_score}
                          </span>
                          {" "}
                          <span className={winner === match.away_team ? "text-primary" : ""}>
                            {match.away_team}
                          </span>
                        </h3>
                      </div>
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Calendar className="w-4 h-4" />
                        <span>{formatDate(match.match_date)}</span>
                      </div>
                      {winner !== "Draw" && (
                        <p className="text-sm text-muted-foreground">
                          Winner: <span className="text-primary font-semibold">{winner}</span>
                        </p>
                      )}
                      {winner === "Draw" && (
                        <Badge variant="outline" className="text-yellow-500 border-yellow-500/30">
                          Draw
                        </Badge>
                      )}
                    </div>

                    {/* Team Average Ratings */}
                    <div className="flex items-center gap-4">
                      <div className="h-12 w-px bg-border hidden md:block" />
                      <div className="flex gap-4">
                        <div className="text-center min-w-[80px]">
                          <p className="text-xs text-muted-foreground mb-1">Home Avg</p>
                          <Badge 
                            className={
                              match.home_avg_rating && match.home_avg_rating >= 7
                                ? "bg-green-500/20 text-green-500"
                                : match.home_avg_rating && match.home_avg_rating >= 5
                                  ? "bg-yellow-500/20 text-yellow-500"
                                  : "bg-red-500/20 text-red-500"
                            }
                          >
                            {match.home_avg_rating ? match.home_avg_rating.toFixed(1) : "N/A"}
                          </Badge>
                        </div>
                        <div className="text-center min-w-[80px]">
                          <p className="text-xs text-muted-foreground mb-1">Away Avg</p>
                          <Badge 
                            className={
                              match.away_avg_rating && match.away_avg_rating >= 7
                                ? "bg-green-500/20 text-green-500"
                                : match.away_avg_rating && match.away_avg_rating >= 5
                                  ? "bg-yellow-500/20 text-yellow-500"
                                  : "bg-red-500/20 text-red-500"
                            }
                          >
                            {match.away_avg_rating ? match.away_avg_rating.toFixed(1) : "N/A"}
                          </Badge>
                        </div>
                      </div>
                      <ChevronRight className="w-5 h-5 text-muted-foreground group-hover:text-primary transition-colors" />
                    </div>
                  </div>
                </Card>
              );
            })}
          </div>
        ) : (
          <Card className="p-12 text-center">
            <Trophy className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-xl font-bold mb-2">No Matches Yet</h3>
            <p className="text-muted-foreground">
              Matches will appear here once they are played.
            </p>
          </Card>
        )}

        {/* Load More / End Message */}
        {hasMore ? (
          <div className="text-center">
            <Button 
              onClick={loadMore}
              disabled={isLoadingMore}
              variant="outline"
              className="border-primary/30 hover:border-primary/50 hover:bg-primary/10"
            >
              {isLoadingMore ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Loading more...
                </>
              ) : (
                `Load More Matches (${matches.length - displayedCount} remaining)`
              )}
            </Button>
          </div>
        ) : displayedMatches.length > 0 && (
          <div className="text-center">
            <p className="text-sm text-muted-foreground">End of list reached</p>
          </div>
        )}
      </div>

      {/* Match Details Dialog */}
      <MatchDetailsDialog 
        match={selectedMatch} 
        open={isDialogOpen} 
        onOpenChange={setIsDialogOpen} 
      />
    </div>
  );
};

export default Matches;
