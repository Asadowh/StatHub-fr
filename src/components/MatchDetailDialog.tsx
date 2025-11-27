import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";

interface Player {
  rank: number;
  name: string;
  position: string;
  rating: number;
  nationality: string;
  goals?: number;
}

interface MatchDetailDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  homeTeam: string;
  awayTeam: string;
  homeScore?: number;
  awayScore?: number;
  date: string;
  homePlayers: Player[];
  awayPlayers: Player[];
  isUpcoming?: boolean;
}

const getRatingColor = (rating: number) => {
  if (rating >= 8.5) return "bg-green-600";
  if (rating >= 8.0) return "bg-green-500";
  if (rating >= 7.5) return "bg-lime-600";
  if (rating >= 7.0) return "bg-yellow-600";
  return "bg-orange-600";
};

export const MatchDetailDialog = ({
  open,
  onOpenChange,
  homeTeam,
  awayTeam,
  homeScore,
  awayScore,
  date,
  homePlayers,
  awayPlayers,
  isUpcoming = false,
}: MatchDetailDialogProps) => {
  const PlayerList = ({ players, teamName }: { players: Player[]; teamName: string }) => {
    // Sort players by rating (highest to lowest) for past matches
    const sortedPlayers = [...players].sort((a, b) => b.rating - a.rating);
    
    return (
      <div className="space-y-3">
        <h3 className="text-xl font-bold text-center mb-4">{teamName}</h3>
        {sortedPlayers.map((player, index) => (
        <div
          key={`${player.name}-${index}`}
          className="flex items-center gap-3 p-3 rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors"
        >
          <div className="flex items-center justify-center w-10 h-10 rounded-full border-2 border-border bg-background">
            <span className="font-bold text-sm">{index + 1}</span>
          </div>
          <Avatar className="w-12 h-12 border-2 border-border">
            <AvatarFallback className="bg-muted text-xs">
              {player.name.split(" ").map(n => n[0]).join("")}
            </AvatarFallback>
          </Avatar>
          <div className="flex items-center gap-2">
            <span className="text-2xl">{player.nationality}</span>
          </div>
          <div className="flex-1">
            <p className="font-semibold">{player.name}</p>
            <p className="text-xs text-muted-foreground">{player.position}</p>
          </div>
          <div className="flex items-center gap-2">
            {!isUpcoming && player.goals !== undefined && player.goals > 0 && (
              <div className="flex items-center gap-1">
                {Array.from({ length: player.goals }).map((_, i) => (
                  <span key={i} className="text-lg">⚽</span>
                ))}
              </div>
            )}
            <Badge className={`${isUpcoming ? 'bg-muted text-muted-foreground' : getRatingColor(player.rating)} ${isUpcoming ? '' : 'text-white'} border-0 text-base font-bold px-3 py-1`}>
              {isUpcoming ? '-' : player.rating.toFixed(2)}
            </Badge>
          </div>
        </div>
      ))}
      </div>
    );
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-5xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-center text-2xl">{isUpcoming ? 'Upcoming Match Squads' : 'Match Player Ratings'}</DialogTitle>
          <div className="text-center space-y-2 pt-2">
            <div className="flex items-center justify-center gap-4 text-2xl font-bold">
              <span>{homeTeam}</span>
              {!isUpcoming && <span className="text-primary">{homeScore} - {awayScore}</span>}
              {isUpcoming && <span className="text-muted-foreground">vs</span>}
              <span>{awayTeam}</span>
            </div>
            <p className="text-sm text-muted-foreground">{date}</p>
          </div>
        </DialogHeader>

        {isUpcoming ? (
          // Flat list for upcoming matches
          <Card className="p-4 bg-gradient-to-br from-card to-card/50 mt-6">
            <div className="space-y-3">
              {[...homePlayers, ...awayPlayers].map((player, index) => (
                <div
                  key={index}
                  className="flex items-center gap-3 p-3 rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors"
                >
                  <div className="flex items-center justify-center w-10 h-10 rounded-full border-2 border-border bg-background">
                    <span className="font-bold text-sm">{index + 1}</span>
                  </div>
                  <Avatar className="w-12 h-12 border-2 border-border">
                    <AvatarFallback className="bg-muted text-xs">
                      {player.name.split(" ").map(n => n[0]).join("")}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex items-center gap-2">
                    <span className="text-2xl">{player.nationality}</span>
                  </div>
                  <div className="flex-1">
                    <p className="font-semibold">{player.name}</p>
                    <p className="text-xs text-muted-foreground">{player.position}</p>
                  </div>
                  <Badge className="bg-muted text-muted-foreground border-0 text-base font-bold px-3 py-1">
                    -
                  </Badge>
                </div>
              ))}
            </div>
          </Card>
        ) : (
          // Squad separation for past matches
          <div className="grid md:grid-cols-2 gap-6 mt-6">
            <Card className="p-4 bg-gradient-to-br from-card to-card/50">
              <PlayerList players={homePlayers} teamName={homeTeam} />
            </Card>
            <Card className="p-4 bg-gradient-to-br from-card to-card/50">
              <PlayerList players={awayPlayers} teamName={awayTeam} />
            </Card>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};
