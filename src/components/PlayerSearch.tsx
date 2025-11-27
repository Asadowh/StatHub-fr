import { useState, useEffect } from 'react';
import { Search, User, Loader2, Medal, Trophy } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';
import { userApi, achievementApi, trophyApi, type UserStats, type Achievement, type Trophy as TrophyType } from '@/lib/api';

interface SearchPlayer {
  id: number;
  username: string;
  full_name: string | null;
  photo_url: string | null;
  nationality: string | null;
  favorite_position: string | null;
  jersey_number: number | null;
  stats: {
    matches: number;
    goals: number;
    assists: number;
    rating: number;
  };
}

interface SearchResponse {
  players: SearchPlayer[];
  matches: any[];
}

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

export const PlayerSearch = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [filteredPlayers, setFilteredPlayers] = useState<SearchPlayer[]>([]);
  const [selectedPlayer, setSelectedPlayer] = useState<SearchPlayer | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [playerAchievements, setPlayerAchievements] = useState<Achievement[]>([]);
  const [playerTrophies, setPlayerTrophies] = useState<TrophyType[]>([]);
  const [loadingProfile, setLoadingProfile] = useState(false);

  // Debounced search
  useEffect(() => {
    if (!searchQuery.trim()) {
      setFilteredPlayers([]);
      return;
    }

    const timeoutId = setTimeout(async () => {
      setIsLoading(true);
      try {
        const response = await fetch(`${API_BASE_URL}/search/?q=${encodeURIComponent(searchQuery)}`);
        if (response.ok) {
          const data: SearchResponse = await response.json();
          setFilteredPlayers(data.players || []);
        }
      } catch (error) {
        console.error('Search failed:', error);
        setFilteredPlayers([]);
      } finally {
        setIsLoading(false);
      }
    }, 300); // 300ms debounce

    return () => clearTimeout(timeoutId);
  }, [searchQuery]);

  const handlePlayerClick = async (player: SearchPlayer) => {
    setSelectedPlayer(player);
    setIsDialogOpen(true);
    setLoadingProfile(true);
    
    // Load player's achievements and trophies
    try {
      const [achievements, trophies] = await Promise.all([
        achievementApi.getUserAchievements(player.id).catch(() => []),
        trophyApi.getUserTrophies(player.id).catch(() => []),
      ]);
      setPlayerAchievements(achievements);
      setPlayerTrophies(trophies);
    } catch (error) {
      console.error('Failed to load player details:', error);
    } finally {
      setLoadingProfile(false);
    }
  };

  const getInitials = (name: string | null) => {
    if (!name) return 'U';
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  // Calculate level from goals
  const getLevel = (goals: number) => Math.floor(goals / 5) + 1;

  return (
    <>
      <div className="w-full max-w-2xl mx-auto">
        <Card className="p-4 bg-card border-border/50">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              type="text"
              placeholder="Search players by name, username..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 h-11"
            />
            {isLoading && (
              <Loader2 className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 animate-spin text-primary" />
            )}
          </div>

          {/* Search Results */}
          {filteredPlayers.length > 0 && (
            <ScrollArea className="mt-4 max-h-96 rounded-md border border-border/50">
              <div className="space-y-2 p-2">
                {filteredPlayers.map((player) => (
                  <Card
                    key={player.id}
                    className="p-3 hover:bg-secondary/50 cursor-pointer transition-colors border-border/30"
                    onClick={() => handlePlayerClick(player)}
                  >
                    <div className="flex items-center gap-3">
                      <Avatar className="w-12 h-12 border-2 border-primary/20">
                        <AvatarImage 
                          src={player.photo_url ? `${API_BASE_URL}${player.photo_url}` : undefined} 
                          alt={player.full_name || player.username} 
                        />
                        <AvatarFallback className="bg-primary/10 text-primary font-semibold">
                          {getInitials(player.full_name || player.username)}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <p className="font-semibold truncate">{player.full_name || player.username}</p>
                        </div>
                        <p className="text-sm text-muted-foreground truncate">
                          @{player.username} • {player.favorite_position || 'No position'}
                        </p>
                      </div>
                      <Badge variant="outline" className="flex-shrink-0">
                        Lvl {getLevel(player.stats.goals)}
                      </Badge>
                    </div>
                  </Card>
                ))}
              </div>
            </ScrollArea>
          )}

          {/* No Results */}
          {searchQuery.trim() && !isLoading && filteredPlayers.length === 0 && (
            <div className="mt-4 p-8 text-center text-muted-foreground">
              <User className="w-12 h-12 mx-auto mb-2 opacity-50" />
              <p>No players found</p>
              <p className="text-sm">Try searching with a different term</p>
            </div>
          )}
        </Card>
      </div>

      {/* Player Profile Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          {selectedPlayer && (
            <>
              <DialogHeader>
                <DialogTitle className="text-2xl">Player Profile</DialogTitle>
              </DialogHeader>

              <div className="space-y-6">
                {/* Profile Header */}
                <Card className="p-8 bg-gradient-to-br from-card to-card/50 border-border/50">
                  <div className="flex flex-col md:flex-row gap-8 items-start">
                    {/* Avatar Section */}
                    <div className="flex flex-col items-center gap-4">
                      <Avatar className="w-32 h-32 border-4 border-primary/30">
                        <AvatarImage 
                          src={selectedPlayer.photo_url ? `${API_BASE_URL}${selectedPlayer.photo_url}` : undefined} 
                          alt={selectedPlayer.full_name || selectedPlayer.username} 
                        />
                        <AvatarFallback className="text-3xl bg-primary/10 text-primary font-bold">
                          {getInitials(selectedPlayer.full_name || selectedPlayer.username)}
                        </AvatarFallback>
                      </Avatar>
                      <div className="text-center space-y-2">
                        <Badge className="bg-primary/20 text-primary border-primary/30">
                          Level {getLevel(selectedPlayer.stats.goals)}
                        </Badge>
                      </div>
                    </div>

                    {/* Profile Info */}
                    <div className="flex-1 space-y-6">
                      <div>
                        <h3 className="text-4xl font-bold mb-2">{selectedPlayer.full_name || selectedPlayer.username}</h3>
                        <p className="text-muted-foreground">@{selectedPlayer.username}</p>
                      </div>

                      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                        <div className="flex items-center gap-2 text-sm">
                          <span className="text-muted-foreground">Nationality:</span>
                          <span className="font-medium">{selectedPlayer.nationality || 'Not set'}</span>
                        </div>
                        <div className="flex items-center gap-2 text-sm">
                          <span className="text-muted-foreground">Position:</span>
                          <span className="font-medium">{selectedPlayer.favorite_position || 'Not set'}</span>
                        </div>
                        <div className="flex items-center gap-2 text-sm">
                          <span className="text-muted-foreground">Jersey:</span>
                          <span className="font-medium">#{selectedPlayer.jersey_number || '?'}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </Card>

                {/* Stats Overview */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <Card className="p-6 text-center bg-gradient-to-br from-card to-card/50">
                    <p className="text-3xl font-bold text-primary">{selectedPlayer.stats.matches}</p>
                    <p className="text-sm text-muted-foreground mt-1">Total Matches</p>
                  </Card>
                  <Card className="p-6 text-center bg-gradient-to-br from-card to-card/50">
                    <p className="text-3xl font-bold text-primary">{selectedPlayer.stats.goals}</p>
                    <p className="text-sm text-muted-foreground mt-1">Goals</p>
                  </Card>
                  <Card className="p-6 text-center bg-gradient-to-br from-card to-card/50">
                    <p className="text-3xl font-bold text-primary">{selectedPlayer.stats.assists}</p>
                    <p className="text-sm text-muted-foreground mt-1">Assists</p>
                  </Card>
                  <Card className="p-6 text-center bg-gradient-to-br from-card to-card/50">
                    <p className="text-3xl font-bold text-primary">{selectedPlayer.stats.rating}</p>
                    <p className="text-sm text-muted-foreground mt-1">Avg Rating</p>
                  </Card>
                </div>

                {loadingProfile ? (
                  <div className="flex items-center justify-center py-8">
                    <Loader2 className="w-8 h-8 animate-spin text-primary" />
                  </div>
                ) : (
                  <>
                    {/* Top Achievements */}
                    <Card className="p-6 bg-gradient-to-br from-card to-card/50 border-border/50">
                      <div className="flex items-center justify-between mb-6">
                        <div className="flex items-center gap-3">
                          <Medal className="w-8 h-8 text-primary" />
                          <h2 className="text-2xl font-bold">Achievements</h2>
                        </div>
                        <Badge variant="outline" className="border-primary/30 text-primary">
                          {playerAchievements.filter(a => a.unlocked).length} Unlocked
                        </Badge>
                      </div>

                      {playerAchievements.filter(a => a.unlocked).length > 0 ? (
                        <div className="grid gap-3">
                          {playerAchievements.filter(a => a.unlocked).slice(0, 5).map((achievement) => (
                            <div
                              key={achievement.id}
                              className="flex items-center justify-between p-4 rounded-lg bg-background/50 border border-border/50 hover:border-primary/30 transition-colors"
                            >
                              <div className="flex items-center gap-3">
                                <Medal className="w-5 h-5 text-primary" />
                                <div>
                                  <p className="font-semibold">{achievement.name}</p>
                                  <p className="text-xs text-muted-foreground">{achievement.tier}</p>
                                </div>
                              </div>
                              <Badge className="bg-primary/20 text-primary border-primary/30">
                                +{achievement.points} pts
                              </Badge>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <p className="text-center text-muted-foreground py-4">No achievements unlocked yet</p>
                      )}
                    </Card>

                    {/* Recent Trophies */}
                    <Card className="p-6 bg-gradient-to-br from-card to-card/50 border-border/50">
                      <div className="flex items-center justify-between mb-6">
                        <div className="flex items-center gap-3">
                          <Trophy className="w-8 h-8 text-primary" />
                          <h2 className="text-2xl font-bold">Trophies</h2>
                        </div>
                        <Badge variant="outline" className="border-primary/30 text-primary">
                          {playerTrophies.length} Total
                        </Badge>
                      </div>

                      {playerTrophies.length > 0 ? (
                        <div className="grid md:grid-cols-3 gap-4">
                          {playerTrophies.slice(0, 3).map((trophy) => (
                            <Card
                              key={trophy.id}
                              className="p-5 bg-gradient-to-br from-primary/5 to-background border-primary/20 hover:border-primary/40 transition-all duration-300 hover:shadow-gold"
                            >
                              <Trophy className="w-8 h-8 text-primary mb-3" />
                              <h3 className="font-bold text-lg mb-1">{trophy.name}</h3>
                              <p className="text-sm text-muted-foreground mb-2">{trophy.description || 'Trophy'}</p>
                              <p className="text-xs text-primary">
                                {new Date(trophy.date_awarded).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
                              </p>
                            </Card>
                          ))}
                        </div>
                      ) : (
                        <p className="text-center text-muted-foreground py-4">No trophies yet</p>
                      )}
                    </Card>
                  </>
                )}
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
};
