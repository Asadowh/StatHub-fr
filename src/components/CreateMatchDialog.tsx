import { useState, useRef } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Plus, Search, Trash2, Loader2, Trophy, Users, Home, Plane, Star } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

interface SearchPlayer {
  id: number;
  username: string;
  full_name: string | null;
  photo_url: string | null;
  favorite_position: string | null;
}

interface PlayerStat {
  player: SearchPlayer;
  team: "home" | "away";
  goals: number;
  assists: number;
  rating: number;
}

interface CreateMatchDialogProps {
  onMatchCreated: () => void;
}

export const CreateMatchDialog = ({ onMatchCreated }: CreateMatchDialogProps) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [open, setOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Match details
  const [homeTeam, setHomeTeam] = useState("");
  const [awayTeam, setAwayTeam] = useState("");
  const [homeScore, setHomeScore] = useState(0);
  const [awayScore, setAwayScore] = useState(0);
  const [matchDate, setMatchDate] = useState(new Date().toISOString().split('T')[0]);
  
  // Player stats
  const [homePlayers, setHomePlayers] = useState<PlayerStat[]>([]);
  const [awayPlayers, setAwayPlayers] = useState<PlayerStat[]>([]);
  
  // Search state
  const [homeSearchQuery, setHomeSearchQuery] = useState("");
  const [awaySearchQuery, setAwaySearchQuery] = useState("");
  const [homeSearchResults, setHomeSearchResults] = useState<SearchPlayer[]>([]);
  const [awaySearchResults, setAwaySearchResults] = useState<SearchPlayer[]>([]);
  const [isSearchingHome, setIsSearchingHome] = useState(false);
  const [isSearchingAway, setIsSearchingAway] = useState(false);
  
  // Debounce timers
  const homeTimerRef = useRef<NodeJS.Timeout | null>(null);
  const awayTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Check admin
  const isAdmin = user?.role === "admin";

  const searchPlayers = async (query: string, team: "home" | "away") => {
    if (!query.trim()) {
      if (team === "home") setHomeSearchResults([]);
      else setAwaySearchResults([]);
      return;
    }
    
    if (team === "home") setIsSearchingHome(true);
    else setIsSearchingAway(true);
    
    try {
      const response = await fetch(`${API_BASE_URL}/search/?q=${encodeURIComponent(query)}`);
      if (response.ok) {
        const data = await response.json();
        const players = data.players || [];
        const addedIds = [...homePlayers, ...awayPlayers].map(ps => ps.player.id);
        const filtered = players.filter((p: SearchPlayer) => !addedIds.includes(p.id));
        
        if (team === "home") setHomeSearchResults(filtered);
        else setAwaySearchResults(filtered);
      }
    } catch (error) {
      console.error("Search failed:", error);
    } finally {
      if (team === "home") setIsSearchingHome(false);
      else setIsSearchingAway(false);
    }
  };

  const handleHomeSearchChange = (value: string) => {
    setHomeSearchQuery(value);
    if (homeTimerRef.current) clearTimeout(homeTimerRef.current);
    if (!value.trim()) {
      setHomeSearchResults([]);
      return;
    }
    homeTimerRef.current = setTimeout(() => searchPlayers(value, "home"), 300);
  };

  const handleAwaySearchChange = (value: string) => {
    setAwaySearchQuery(value);
    if (awayTimerRef.current) clearTimeout(awayTimerRef.current);
    if (!value.trim()) {
      setAwaySearchResults([]);
      return;
    }
    awayTimerRef.current = setTimeout(() => searchPlayers(value, "away"), 300);
  };

  const addPlayerToTeam = (player: SearchPlayer, team: "home" | "away") => {
    const newStat: PlayerStat = { player, team, goals: 0, assists: 0, rating: 7.0 };
    if (team === "home") {
      setHomePlayers(prev => [...prev, newStat]);
      setHomeSearchQuery("");
      setHomeSearchResults([]);
    } else {
      setAwayPlayers(prev => [...prev, newStat]);
      setAwaySearchQuery("");
      setAwaySearchResults([]);
    }
  };

  const removePlayer = (playerId: number, team: "home" | "away") => {
    if (team === "home") setHomePlayers(prev => prev.filter(ps => ps.player.id !== playerId));
    else setAwayPlayers(prev => prev.filter(ps => ps.player.id !== playerId));
  };

  const updatePlayerStat = (playerId: number, team: "home" | "away", field: 'goals' | 'assists' | 'rating', value: number) => {
    const updateFn = (prev: PlayerStat[]) => prev.map(ps => 
      ps.player.id === playerId ? { ...ps, [field]: value } : ps
    );
    if (team === "home") setHomePlayers(updateFn);
    else setAwayPlayers(updateFn);
  };

  const getToken = () => localStorage.getItem('stathub_token');

  const handleSubmit = async () => {
    if (!homeTeam.trim() || !awayTeam.trim()) {
      toast({ title: "Missing team names", description: "Please enter both team names", variant: "destructive" });
      return;
    }

    setIsSubmitting(true);
    try {
      const token = getToken();
      
      const matchResponse = await fetch(`${API_BASE_URL}/matches/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...(token ? { 'Authorization': `Bearer ${token}` } : {}) },
        body: JSON.stringify({ home_team: homeTeam, away_team: awayTeam, home_score: homeScore, away_score: awayScore, match_date: matchDate }),
      });

      if (!matchResponse.ok) {
        const err = await matchResponse.json();
        throw new Error(err.detail || 'Failed to create match');
      }

      const match = await matchResponse.json();

      for (const ps of homePlayers) {
        await fetch(`${API_BASE_URL}/stats/`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', ...(token ? { 'Authorization': `Bearer ${token}` } : {}) },
          body: JSON.stringify({ match_id: match.id, player_id: ps.player.id, team: "home", goals: ps.goals, assists: ps.assists, rating: ps.rating }),
        });
      }

      for (const ps of awayPlayers) {
        await fetch(`${API_BASE_URL}/stats/`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', ...(token ? { 'Authorization': `Bearer ${token}` } : {}) },
          body: JSON.stringify({ match_id: match.id, player_id: ps.player.id, team: "away", goals: ps.goals, assists: ps.assists, rating: ps.rating }),
        });
      }

      toast({ title: "Match created!", description: `${homeTeam} ${homeScore} - ${awayScore} ${awayTeam}` });
      setHomeTeam(""); setAwayTeam(""); setHomeScore(0); setAwayScore(0);
      setMatchDate(new Date().toISOString().split('T')[0]);
      setHomePlayers([]); setAwayPlayers([]);
      setOpen(false);
      onMatchCreated();
    } catch (error) {
      toast({ title: "Failed to create match", description: error instanceof Error ? error.message : "Please try again", variant: "destructive" });
    } finally {
      setIsSubmitting(false);
    }
  };

  const getInitials = (name: string | null) => {
    if (!name) return 'U';
    return name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase();
  };

  // Don't render if not admin
  if (!isAdmin) return null;

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="gap-2"><Plus className="w-4 h-4" />Log Match</Button>
      </DialogTrigger>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl flex items-center gap-2">
            <Trophy className="w-6 h-6 text-primary" />Log a Match
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Match Header */}
          <Card className="p-6">
            <div className="grid grid-cols-5 gap-4 items-center">
              <div className="col-span-2">
                <Label>Home Team</Label>
                <Input value={homeTeam} onChange={(e) => setHomeTeam(e.target.value)} placeholder="Team Alpha" />
              </div>
              <div className="flex items-center justify-center gap-2">
                <Input type="number" min="0" value={homeScore} onChange={(e) => setHomeScore(parseInt(e.target.value) || 0)} className="w-16 text-center text-2xl font-bold h-12" />
                <span className="text-2xl font-bold">:</span>
                <Input type="number" min="0" value={awayScore} onChange={(e) => setAwayScore(parseInt(e.target.value) || 0)} className="w-16 text-center text-2xl font-bold h-12" />
              </div>
              <div className="col-span-2">
                <Label>Away Team</Label>
                <Input value={awayTeam} onChange={(e) => setAwayTeam(e.target.value)} placeholder="Team Beta" />
              </div>
            </div>
            <div className="mt-4">
              <Label>Match Date</Label>
              <Input type="date" value={matchDate} onChange={(e) => setMatchDate(e.target.value)} className="w-48" />
            </div>
          </Card>

          {/* Teams */}
          <div className="grid md:grid-cols-2 gap-6">
            {/* Home */}
            <Card className="p-4 border-blue-500/30">
              <div className="flex items-center justify-between mb-4">
                <h4 className="font-semibold flex items-center gap-2"><Home className="w-4 h-4" />{homeTeam || "Home Team"}</h4>
                <Badge variant="outline">{homePlayers.length}</Badge>
              </div>
              <div className="relative mb-4">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input placeholder="Search player..." value={homeSearchQuery} onChange={(e) => handleHomeSearchChange(e.target.value)} className="pl-10" />
                {isSearchingHome && <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 animate-spin" />}
                {homeSearchResults.length > 0 && (
                  <Card className="absolute z-20 w-full mt-1 p-2 max-h-48 overflow-y-auto">
                    {homeSearchResults.map((p) => (
                      <div key={p.id} onClick={() => addPlayerToTeam(p, "home")} className="flex items-center gap-2 p-2 hover:bg-secondary/50 rounded cursor-pointer">
                        <Avatar className="w-8 h-8"><AvatarFallback>{getInitials(p.full_name || p.username)}</AvatarFallback></Avatar>
                        <span className="flex-1 truncate">{p.full_name || p.username}</span>
                        <Plus className="w-4 h-4 text-primary" />
                      </div>
                    ))}
                  </Card>
                )}
              </div>
              <ScrollArea className="max-h-64">
                {homePlayers.map((ps) => (
                  <Card key={ps.player.id} className="p-3 mb-2">
                    <div className="flex items-center gap-2 mb-2">
                      <Avatar className="w-8 h-8"><AvatarFallback>{getInitials(ps.player.full_name || ps.player.username)}</AvatarFallback></Avatar>
                      <span className="flex-1 truncate font-medium">{ps.player.full_name || ps.player.username}</span>
                      <Button variant="ghost" size="icon" onClick={() => removePlayer(ps.player.id, "home")} className="h-8 w-8 text-destructive"><Trash2 className="w-4 h-4" /></Button>
                    </div>
                    <div className="grid grid-cols-3 gap-2">
                      <div><Label className="text-xs">Goals</Label><Input type="number" min="0" value={ps.goals} onChange={(e) => updatePlayerStat(ps.player.id, "home", 'goals', parseInt(e.target.value) || 0)} className="h-8" /></div>
                      <div><Label className="text-xs">Assists</Label><Input type="number" min="0" value={ps.assists} onChange={(e) => updatePlayerStat(ps.player.id, "home", 'assists', parseInt(e.target.value) || 0)} className="h-8" /></div>
                      <div><Label className="text-xs">Rating</Label><Input type="number" min="0" max="10" step="0.1" value={ps.rating} onChange={(e) => updatePlayerStat(ps.player.id, "home", 'rating', parseFloat(e.target.value) || 0)} className="h-8" /></div>
                    </div>
                  </Card>
                ))}
                {homePlayers.length === 0 && <p className="text-center text-muted-foreground py-4">No players</p>}
              </ScrollArea>
            </Card>

            {/* Away */}
            <Card className="p-4 border-red-500/30">
              <div className="flex items-center justify-between mb-4">
                <h4 className="font-semibold flex items-center gap-2"><Plane className="w-4 h-4" />{awayTeam || "Away Team"}</h4>
                <Badge variant="outline">{awayPlayers.length}</Badge>
              </div>
              <div className="relative mb-4">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input placeholder="Search player..." value={awaySearchQuery} onChange={(e) => handleAwaySearchChange(e.target.value)} className="pl-10" />
                {isSearchingAway && <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 animate-spin" />}
                {awaySearchResults.length > 0 && (
                  <Card className="absolute z-20 w-full mt-1 p-2 max-h-48 overflow-y-auto">
                    {awaySearchResults.map((p) => (
                      <div key={p.id} onClick={() => addPlayerToTeam(p, "away")} className="flex items-center gap-2 p-2 hover:bg-secondary/50 rounded cursor-pointer">
                        <Avatar className="w-8 h-8"><AvatarFallback>{getInitials(p.full_name || p.username)}</AvatarFallback></Avatar>
                        <span className="flex-1 truncate">{p.full_name || p.username}</span>
                        <Plus className="w-4 h-4 text-primary" />
                      </div>
                    ))}
                  </Card>
                )}
              </div>
              <ScrollArea className="max-h-64">
                {awayPlayers.map((ps) => (
                  <Card key={ps.player.id} className="p-3 mb-2">
                    <div className="flex items-center gap-2 mb-2">
                      <Avatar className="w-8 h-8"><AvatarFallback>{getInitials(ps.player.full_name || ps.player.username)}</AvatarFallback></Avatar>
                      <span className="flex-1 truncate font-medium">{ps.player.full_name || ps.player.username}</span>
                      <Button variant="ghost" size="icon" onClick={() => removePlayer(ps.player.id, "away")} className="h-8 w-8 text-destructive"><Trash2 className="w-4 h-4" /></Button>
                    </div>
                    <div className="grid grid-cols-3 gap-2">
                      <div><Label className="text-xs">Goals</Label><Input type="number" min="0" value={ps.goals} onChange={(e) => updatePlayerStat(ps.player.id, "away", 'goals', parseInt(e.target.value) || 0)} className="h-8" /></div>
                      <div><Label className="text-xs">Assists</Label><Input type="number" min="0" value={ps.assists} onChange={(e) => updatePlayerStat(ps.player.id, "away", 'assists', parseInt(e.target.value) || 0)} className="h-8" /></div>
                      <div><Label className="text-xs">Rating</Label><Input type="number" min="0" max="10" step="0.1" value={ps.rating} onChange={(e) => updatePlayerStat(ps.player.id, "away", 'rating', parseFloat(e.target.value) || 0)} className="h-8" /></div>
                    </div>
                  </Card>
                ))}
                {awayPlayers.length === 0 && <p className="text-center text-muted-foreground py-4">No players</p>}
              </ScrollArea>
            </Card>
          </div>

          {/* Submit */}
          <div className="flex gap-3">
            <Button variant="outline" onClick={() => setOpen(false)} className="flex-1">Cancel</Button>
            <Button onClick={handleSubmit} disabled={isSubmitting || !homeTeam.trim() || !awayTeam.trim()} className="flex-1">
              {isSubmitting ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" />Creating...</> : <><Trophy className="w-4 h-4 mr-2" />Log Match</>}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
