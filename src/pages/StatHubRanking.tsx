import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Crown, Search, Loader2 } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { leaderboardApi, type LeaderboardPlayer } from "@/lib/api";

const ITEMS_PER_PAGE = 10;

const StatHubRanking = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<"rating" | "goals" | "assists" | "combined">("rating");
  const [players, setPlayers] = useState<LeaderboardPlayer[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [displayedCount, setDisplayedCount] = useState(ITEMS_PER_PAGE);

  useEffect(() => {
    window.scrollTo(0, 0);
    loadRanking();
  }, [activeTab]);

  const loadRanking = async () => {
    try {
      setIsLoading(true);
      setDisplayedCount(ITEMS_PER_PAGE);
      setSearchQuery("");
      const data = await leaderboardApi.getStatHubRanking(activeTab, 100);
      setPlayers(data);
    } catch (error) {
      console.error("Failed to load StatHub ranking:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const filteredPlayers = players.filter(player =>
    player.username?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    player.full_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    player.position?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const displayedPlayers = filteredPlayers.slice(0, displayedCount);
  const hasMore = displayedCount < filteredPlayers.length;

  const loadMore = () => {
    setDisplayedCount(prev => Math.min(prev + ITEMS_PER_PAGE, filteredPlayers.length));
  };

  const getStatValue = (player: LeaderboardPlayer) => {
    switch(activeTab) {
      case "rating": return player.avg_rating || 0;
      case "goals": return player.total_goals || 0;
      case "assists": return player.total_assists || 0;
      case "combined": return player.combined || (player.total_goals || 0) + (player.total_assists || 0);
      default: return 0;
    }
  };

  const getStatLabel = () => {
    switch(activeTab) {
      case "rating": return "Rating";
      case "goals": return "Goals";
      case "assists": return "Assists";
      case "combined": return "G+A";
      default: return "Value";
    }
  };

  const formatStatValue = (value: number) => {
    if (activeTab === "rating") {
      return value.toFixed(1);
    }
    return value.toString();
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
        <div className="space-y-4">
          <div>
            <h1 className="text-4xl font-bold mb-2">StatHub Rankings</h1>
            <p className="text-muted-foreground">Top performing players based on key performance metrics</p>
          </div>

          {/* Search Bar */}
          <div className="max-w-md">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
              <Input
                type="text"
                placeholder="Search players by name or position..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 bg-card border-border/50 focus:border-primary/50 focus:ring-2 focus:ring-primary/20 transition-all"
              />
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 flex-wrap">
          <Button
            variant={activeTab === "rating" ? "default" : "outline"}
            onClick={() => setActiveTab("rating")}
            className={activeTab === "rating" ? "bg-primary text-primary-foreground" : ""}
          >
            Average StatHub Rating
          </Button>
          <Button
            variant={activeTab === "goals" ? "default" : "outline"}
            onClick={() => setActiveTab("goals")}
            className={activeTab === "goals" ? "bg-primary text-primary-foreground" : ""}
          >
            Goals
          </Button>
          <Button
            variant={activeTab === "assists" ? "default" : "outline"}
            onClick={() => setActiveTab("assists")}
            className={activeTab === "assists" ? "bg-primary text-primary-foreground" : ""}
          >
            Assists
          </Button>
          <Button
            variant={activeTab === "combined" ? "default" : "outline"}
            onClick={() => setActiveTab("combined")}
            className={activeTab === "combined" ? "bg-primary text-primary-foreground" : ""}
          >
            Goals + Assists
          </Button>
        </div>

        {/* Rankings Table */}
        <Card className="bg-gradient-to-br from-card to-card/50 border-border/50">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border/50">
                  <th className="text-left p-4 text-muted-foreground font-semibold">Rank</th>
                  <th className="text-left p-4 text-muted-foreground font-semibold">Player</th>
                  <th className="text-left p-4 text-muted-foreground font-semibold">Position</th>
                  <th className="text-right p-4 text-muted-foreground font-semibold">{getStatLabel()}</th>
                </tr>
              </thead>
              <tbody>
                {displayedPlayers.map((player) => {
                  const statValue = getStatValue(player);
                  return (
                    <tr 
                      key={player.user_id}
                      className={`border-b border-border/30 transition-colors ${
                        player.user_id === user?.id
                          ? "bg-primary/10 hover:bg-primary/15"
                          : "hover:bg-primary/5"
                      }`}
                    >
                      <td className="p-4">
                        <div className="flex items-center gap-2">
                          {player.rank === 1 && <Crown className="w-5 h-5 text-primary" />}
                          <span className={`font-bold ${player.rank === 1 ? 'text-primary text-xl' : player.rank <= 3 ? 'text-primary/80' : ''}`}>
                            #{player.rank}
                          </span>
                        </div>
                      </td>
                      <td className="p-4">
                        <div className="flex items-center gap-3">
                          <Avatar className="w-10 h-10 border-2 border-border">
                            <AvatarImage 
                              src={player.photo_url ? `http://localhost:8000${player.photo_url}` : undefined} 
                              alt={player.username} 
                            />
                            <AvatarFallback className="bg-muted text-xs">
                              {(player.full_name || player.username)?.split(" ").map(n => n[0]).join("").slice(0, 2)}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <p className={`font-semibold ${player.user_id === user?.id ? "text-primary" : ""}`}>
                              {player.full_name || player.username} {player.user_id === user?.id && "(You)"}
                            </p>
                            <p className="text-xs text-muted-foreground">{player.nationality}</p>
                          </div>
                        </div>
                      </td>
                      <td className="p-4">
                        <Badge variant="outline" className="border-primary/30 text-muted-foreground">
                          {player.position || 'N/A'}
                        </Badge>
                      </td>
                      <td className="p-4 text-right">
                        <span className={`text-lg font-bold ${player.rank === 1 ? 'text-primary' : 'text-foreground'}`}>
                          {formatStatValue(statValue)}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Load More / End Message */}
          {hasMore ? (
            <div className="p-4 text-center border-t border-border/30">
              <Button 
                onClick={loadMore}
                variant="outline"
                className="border-primary/30 hover:border-primary/50 hover:bg-primary/10"
              >
                Load More ({filteredPlayers.length - displayedCount} remaining)
              </Button>
            </div>
          ) : displayedPlayers.length > 0 && (
            <div className="p-4 text-center border-t border-border/30">
              <p className="text-sm text-muted-foreground">End of list reached</p>
            </div>
          )}

          {displayedPlayers.length === 0 && (
            <div className="p-8 text-center">
              <p className="text-muted-foreground">
                {searchQuery ? `No players found matching "${searchQuery}"` : "No players in the ranking yet"}
              </p>
            </div>
          )}
        </Card>
      </div>
    </div>
  );
};

export default StatHubRanking;
