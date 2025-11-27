import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Card } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Loader2, Trophy, Users, Star } from "lucide-react";
import { statApi, type Match, type MatchPlayer } from "@/lib/api";

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

interface MatchDetailsDialogProps {
  match: Match | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const getRatingColor = (rating: number) => {
  if (rating >= 8) return "text-green-500 bg-green-500/20";
  if (rating >= 6) return "text-yellow-500 bg-yellow-500/20";
  return "text-red-500 bg-red-500/20";
};

const getInitials = (name: string | null, username: string) => {
  const displayName = name || username;
  return displayName
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);
};

const PlayerCard = ({ player, teamColor }: { player: MatchPlayer; teamColor: string }) => (
  <Card className={`p-3 border-l-4 ${teamColor} bg-card/50 hover:bg-card/80 transition-colors`}>
    <div className="flex items-center gap-3">
      {/* Jersey Number */}
      <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center font-bold text-primary">
        {player.jersey_number}
      </div>
      
      {/* Avatar */}
      <Avatar className="w-10 h-10 border-2 border-border">
        <AvatarImage 
          src={player.photo_url ? `${API_BASE_URL}${player.photo_url}` : undefined} 
          alt={player.full_name || player.username} 
        />
        <AvatarFallback className="bg-primary/10 text-primary text-sm font-semibold">
          {getInitials(player.full_name, player.username)}
        </AvatarFallback>
      </Avatar>
      
      {/* Player Info */}
      <div className="flex-1 min-w-0">
        <p className="font-semibold truncate">{player.full_name || player.username}</p>
        <p className="text-xs text-muted-foreground">
          {player.favorite_position || 'No position'}
        </p>
      </div>
      
      {/* Stats */}
      <div className="flex items-center gap-2 text-sm">
        {player.goals > 0 && (
          <Badge variant="outline" className="text-xs">
            ⚽ {player.goals}
          </Badge>
        )}
        {player.assists > 0 && (
          <Badge variant="outline" className="text-xs">
            🅰️ {player.assists}
          </Badge>
        )}
      </div>
      
      {/* Rating */}
      <Badge className={`${getRatingColor(player.rating)} font-bold min-w-[50px] justify-center`}>
        {player.rating.toFixed(1)}
      </Badge>
    </div>
  </Card>
);

export const MatchDetailsDialog = ({ match, open, onOpenChange }: MatchDetailsDialogProps) => {
  const [homePlayers, setHomePlayers] = useState<MatchPlayer[]>([]);
  const [awayPlayers, setAwayPlayers] = useState<MatchPlayer[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (open && match) {
      loadMatchPlayers();
    }
  }, [open, match]);

  const loadMatchPlayers = async () => {
    if (!match) return;
    
    setIsLoading(true);
    try {
      const data = await statApi.getMatchPlayers(match.id);
      setHomePlayers(data.home_players);
      setAwayPlayers(data.away_players);
    } catch (error) {
      console.error("Failed to load match players:", error);
    } finally {
      setIsLoading(false);
    }
  };

  if (!match) return null;

  const winner = match.home_score > match.away_score 
    ? match.home_team 
    : match.away_score > match.home_score 
      ? match.away_team 
      : null;

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      weekday: 'long',
      month: 'long', 
      day: 'numeric', 
      year: 'numeric' 
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl flex items-center gap-2">
            <Trophy className="w-6 h-6 text-primary" />
            Match Details
          </DialogTitle>
        </DialogHeader>

        {/* Match Header */}
        <Card className="p-6 bg-gradient-to-br from-card to-card/50 border-border/50">
          <div className="text-center space-y-2">
            <p className="text-sm text-muted-foreground">{formatDate(match.match_date)}</p>
            <div className="flex items-center justify-center gap-4">
              <div className="text-right flex-1">
                <p className={`text-2xl font-bold ${winner === match.home_team ? 'text-primary' : ''}`}>
                  {match.home_team}
                </p>
                {match.home_avg_rating && (
                  <p className="text-sm text-muted-foreground">Avg: {match.home_avg_rating.toFixed(1)}</p>
                )}
              </div>
              <div className="px-6 py-3 bg-primary/10 rounded-lg">
                <p className="text-4xl font-bold">
                  <span className={winner === match.home_team ? 'text-primary' : ''}>{match.home_score}</span>
                  <span className="text-muted-foreground mx-2">-</span>
                  <span className={winner === match.away_team ? 'text-primary' : ''}>{match.away_score}</span>
                </p>
              </div>
              <div className="text-left flex-1">
                <p className={`text-2xl font-bold ${winner === match.away_team ? 'text-primary' : ''}`}>
                  {match.away_team}
                </p>
                {match.away_avg_rating && (
                  <p className="text-sm text-muted-foreground">Avg: {match.away_avg_rating.toFixed(1)}</p>
                )}
              </div>
            </div>
            {winner && (
              <Badge className="bg-primary/20 text-primary">
                Winner: {winner}
              </Badge>
            )}
            {!winner && (
              <Badge className="bg-yellow-500/20 text-yellow-500">
                Draw
              </Badge>
            )}
          </div>
        </Card>

        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
          </div>
        ) : (
          <div className="grid md:grid-cols-2 gap-6">
            {/* Home Team */}
            <div className="space-y-3">
              <div className="flex items-center gap-2 mb-4">
                <div className="w-4 h-4 rounded-full bg-blue-500" />
                <h3 className="font-bold text-lg">{match.home_team}</h3>
                <Badge variant="outline">{homePlayers.length} players</Badge>
              </div>
              
              {homePlayers.length > 0 ? (
                <div className="space-y-2">
                  {homePlayers.map((player) => (
                    <PlayerCard key={player.id} player={player} teamColor="border-l-blue-500" />
                  ))}
                </div>
              ) : (
                <Card className="p-8 text-center bg-card/50">
                  <Users className="w-8 h-8 mx-auto mb-2 text-muted-foreground" />
                  <p className="text-muted-foreground">No players recorded</p>
                </Card>
              )}
            </div>

            {/* Away Team */}
            <div className="space-y-3">
              <div className="flex items-center gap-2 mb-4">
                <div className="w-4 h-4 rounded-full bg-red-500" />
                <h3 className="font-bold text-lg">{match.away_team}</h3>
                <Badge variant="outline">{awayPlayers.length} players</Badge>
              </div>
              
              {awayPlayers.length > 0 ? (
                <div className="space-y-2">
                  {awayPlayers.map((player) => (
                    <PlayerCard key={player.id} player={player} teamColor="border-l-red-500" />
                  ))}
                </div>
              ) : (
                <Card className="p-8 text-center bg-card/50">
                  <Users className="w-8 h-8 mx-auto mb-2 text-muted-foreground" />
                  <p className="text-muted-foreground">No players recorded</p>
                </Card>
              )}
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};

