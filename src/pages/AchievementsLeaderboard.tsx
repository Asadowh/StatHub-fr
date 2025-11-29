import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import { Medal, Search, Loader2 } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { leaderboardApi, type LeaderboardPlayer } from "@/lib/api";

const ITEMS_PER_PAGE = 10;

const AchievementsLeaderboard = () => {
  const { user } = useAuth();
  const [players, setPlayers] = useState<LeaderboardPlayer[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [displayedCount, setDisplayedCount] = useState(ITEMS_PER_PAGE);

  useEffect(() => {
    window.scrollTo(0, 0);
    loadLeaderboard();
  }, []);

  const loadLeaderboard = async () => {
    try {
      setIsLoading(true);
      // Request a high limit to get all players
      const data = await leaderboardApi.getAchievementsLeaderboard(1000);
      setPlayers(data);
    } catch (error) {
      console.error("Failed to load achievements leaderboard:", error);
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

  const getRankColor = (rank: number) => {
    if (rank === 1) return "text-yellow-500";
    if (rank === 2) return "text-gray-400";
    if (rank === 3) return "text-orange-600";
    return "text-muted-foreground";
  };

  const getRankBg = (rank: number) => {
    if (rank === 1) return "bg-yellow-500/20 border-yellow-500/30";
    if (rank === 2) return "bg-gray-400/20 border-gray-400/30";
    if (rank === 3) return "bg-orange-600/20 border-orange-600/30";
    return "";
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
        <div className="text-center space-y-4">
          <div className="flex items-center justify-center gap-3 mb-2">
            <Medal className="w-10 h-10 text-primary" />
            <h1 className="text-4xl font-bold">Achievements Leaderboard</h1>
          </div>
          <p className="text-muted-foreground">Ranked by number of achievements unlocked</p>
          
          {/* Search Bar */}
          <div className="max-w-md mx-auto">
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

        {/* Top 3 Podium */}
        {filteredPlayers.length >= 3 && (
          <div className="grid grid-cols-3 gap-4 max-w-4xl mx-auto">
            {/* 2nd Place */}
            <Card className="p-6 bg-gradient-to-br from-gray-400/10 to-card border-gray-400/30 text-center mt-8">
              <Medal className="w-8 h-8 text-gray-400 mx-auto mb-3" />
              <Avatar className="w-16 h-16 mx-auto mb-3 border-2 border-gray-400/50">
                <AvatarImage 
                  src={filteredPlayers[1].photo_url ? `http://localhost:8000${filteredPlayers[1].photo_url}` : undefined} 
                  alt={filteredPlayers[1].username} 
                />
                <AvatarFallback className="bg-gray-400/20 text-xl">2</AvatarFallback>
              </Avatar>
              <p className="font-bold text-lg">{filteredPlayers[1].full_name || filteredPlayers[1].username}</p>
              <p className="text-xs text-muted-foreground mb-2">{filteredPlayers[1].nationality} {filteredPlayers[1].position}</p>
              <Badge className="bg-primary/20 text-primary">{filteredPlayers[1].achievement_count || 0} Achievements</Badge>
            </Card>

            {/* 1st Place */}
            <Card className="p-6 bg-gradient-to-br from-yellow-500/20 to-card border-yellow-500/50 text-center shadow-gold">
              <Medal className="w-12 h-12 text-yellow-500 mx-auto mb-3" />
              <Avatar className="w-20 h-20 mx-auto mb-3 border-4 border-yellow-500/50">
                <AvatarImage 
                  src={filteredPlayers[0].photo_url ? `http://localhost:8000${filteredPlayers[0].photo_url}` : undefined} 
                  alt={filteredPlayers[0].username} 
                />
                <AvatarFallback className="bg-yellow-500/20 text-2xl">1</AvatarFallback>
              </Avatar>
              <p className="font-bold text-xl">{filteredPlayers[0].full_name || filteredPlayers[0].username}</p>
              <p className="text-sm text-muted-foreground mb-2">{filteredPlayers[0].nationality} {filteredPlayers[0].position}</p>
              <Badge className="bg-primary/20 text-primary text-lg">{filteredPlayers[0].achievement_count || 0} Achievements</Badge>
            </Card>

            {/* 3rd Place */}
            <Card className="p-6 bg-gradient-to-br from-orange-600/10 to-card border-orange-600/30 text-center mt-8">
              <Medal className="w-8 h-8 text-orange-600 mx-auto mb-3" />
              <Avatar className="w-16 h-16 mx-auto mb-3 border-2 border-orange-600/50">
                <AvatarImage 
                  src={filteredPlayers[2].photo_url ? `http://localhost:8000${filteredPlayers[2].photo_url}` : undefined} 
                  alt={filteredPlayers[2].username} 
                />
                <AvatarFallback className="bg-orange-600/20 text-xl">3</AvatarFallback>
              </Avatar>
              <p className="font-bold text-lg">{filteredPlayers[2].full_name || filteredPlayers[2].username}</p>
              <p className="text-xs text-muted-foreground mb-2">{filteredPlayers[2].nationality} {filteredPlayers[2].position}</p>
              <Badge className="bg-primary/20 text-primary">{filteredPlayers[2].achievement_count || 0} Achievements</Badge>
            </Card>
          </div>
        )}

        {/* Full Rankings Table */}
        <Card className="overflow-hidden bg-gradient-to-br from-card to-card/50 border-border/50">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-muted/30 border-b border-border/50">
                <tr>
                  <th className="px-6 py-4 text-left text-sm font-semibold">Rank</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold">Player</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold">Position</th>
                  <th className="px-6 py-4 text-right text-sm font-semibold">Achievements</th>
                </tr>
              </thead>
              <tbody>
                {displayedPlayers.map((player) => (
                  <tr
                    key={player.user_id}
                    className={`border-b border-border/30 transition-colors ${
                      player.user_id === user?.id
                        ? "bg-primary/10 hover:bg-primary/15"
                        : "hover:bg-muted/20"
                    }`}
                  >
                    <td className="px-6 py-4">
                      <Badge
                        variant="outline"
                        className={`font-bold text-lg ${getRankBg(player.rank)} ${getRankColor(player.rank)}`}
                      >
                        #{player.rank}
                      </Badge>
                    </td>
                    <td className="px-6 py-4">
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
                    <td className="px-6 py-4 text-muted-foreground">{player.position || 'N/A'}</td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Medal className="w-4 h-4 text-primary" />
                        <span className="font-bold text-lg text-primary">{player.achievement_count || 0}</span>
                      </div>
                    </td>
                  </tr>
                ))}
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
                {searchQuery ? `No players found matching "${searchQuery}"` : "No players in the leaderboard yet"}
              </p>
            </div>
          )}
        </Card>
      </div>
    </div>
  );
};

export default AchievementsLeaderboard;

