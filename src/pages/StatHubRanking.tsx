import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Crown, Search, Loader2 } from "lucide-react";
import portugalFlag from "@/assets/portugal-flag.png";
import defaultAvatar from "@/assets/default-avatar.png";

interface RankingPlayer {
  rank: number;
  name: string;
  nationality: string;
  position: string;
  value: number;
  avatar: string;
}

const ratingPlayers: RankingPlayer[] = [
  { rank: 1, name: "Cristiano Ronaldo", nationality: "🇵🇹", position: "Forward", value: 9.2, avatar: defaultAvatar },
  { rank: 2, name: "Lionel Messi", nationality: "🇦🇷", position: "Forward", value: 9.1, avatar: defaultAvatar },
  { rank: 3, name: "Kylian Mbappé", nationality: "🇫🇷", position: "Forward", value: 8.9, avatar: defaultAvatar },
  { rank: 4, name: "Erling Haaland", nationality: "🇳🇴", position: "Forward", value: 8.8, avatar: defaultAvatar },
  { rank: 5, name: "Kevin De Bruyne", nationality: "🇧🇪", position: "Midfielder", value: 8.7, avatar: defaultAvatar },
  { rank: 6, name: "Robert Lewandowski", nationality: "🇵🇱", position: "Forward", value: 8.6, avatar: defaultAvatar },
  { rank: 7, name: "Neymar Jr", nationality: "🇧🇷", position: "Forward", value: 8.5, avatar: defaultAvatar },
  { rank: 8, name: "Mohamed Salah", nationality: "🇪🇬", position: "Forward", value: 8.4, avatar: defaultAvatar },
  { rank: 9, name: "Luka Modrić", nationality: "🇭🇷", position: "Midfielder", value: 8.3, avatar: defaultAvatar },
  { rank: 10, name: "Virgil van Dijk", nationality: "🇳🇱", position: "Defender", value: 8.2, avatar: defaultAvatar },
  { rank: 11, name: "Karim Benzema", nationality: "🇫🇷", position: "Forward", value: 8.1, avatar: defaultAvatar },
  { rank: 12, name: "Vinicius Jr", nationality: "🇧🇷", position: "Forward", value: 8.0, avatar: defaultAvatar },
  { rank: 13, name: "Jude Bellingham", nationality: "🏴󠁧󠁢󠁥󠁮󠁧󠁿", position: "Midfielder", value: 7.9, avatar: defaultAvatar },
  { rank: 14, name: "Phil Foden", nationality: "🏴󠁧󠁢󠁥󠁮󠁧󠁿", position: "Midfielder", value: 7.8, avatar: defaultAvatar },
  { rank: 15, name: "Bukayo Saka", nationality: "🏴󠁧󠁢󠁥󠁮󠁧󠁿", position: "Forward", value: 7.7, avatar: defaultAvatar },
];

const goalPlayers: RankingPlayer[] = [
  { rank: 1, name: "Erling Haaland", nationality: "🇳🇴", position: "Forward", value: 52, avatar: defaultAvatar },
  { rank: 2, name: "Kylian Mbappé", nationality: "🇫🇷", position: "Forward", value: 48, avatar: defaultAvatar },
  { rank: 3, name: "Harry Kane", nationality: "🏴󠁧󠁢󠁥󠁮󠁧󠁿", position: "Forward", value: 44, avatar: defaultAvatar },
  { rank: 4, name: "Cristiano Ronaldo", nationality: "🇵🇹", position: "Forward", value: 42, avatar: defaultAvatar },
  { rank: 5, name: "Lionel Messi", nationality: "🇦🇷", position: "Forward", value: 38, avatar: defaultAvatar },
  { rank: 6, name: "Robert Lewandowski", nationality: "🇵🇱", position: "Forward", value: 36, avatar: defaultAvatar },
  { rank: 7, name: "Victor Osimhen", nationality: "🇳🇬", position: "Forward", value: 34, avatar: defaultAvatar },
  { rank: 8, name: "Mohamed Salah", nationality: "🇪🇬", position: "Forward", value: 32, avatar: defaultAvatar },
  { rank: 9, name: "Vinícius Jr", nationality: "🇧🇷", position: "Forward", value: 30, avatar: defaultAvatar },
  { rank: 10, name: "Lautaro Martínez", nationality: "🇦🇷", position: "Forward", value: 28, avatar: defaultAvatar },
  { rank: 11, name: "Son Heung-min", nationality: "🇰🇷", position: "Forward", value: 26, avatar: defaultAvatar },
  { rank: 12, name: "Dusan Vlahovic", nationality: "🇷🇸", position: "Forward", value: 24, avatar: defaultAvatar },
  { rank: 13, name: "Marcus Rashford", nationality: "🏴󠁧󠁢󠁥󠁮󠁧󠁿", position: "Forward", value: 22, avatar: defaultAvatar },
  { rank: 14, name: "Rafael Leão", nationality: "🇵🇹", position: "Forward", value: 20, avatar: defaultAvatar },
  { rank: 15, name: "Randal Kolo Muani", nationality: "🇫🇷", position: "Forward", value: 18, avatar: defaultAvatar },
];

const assistPlayers: RankingPlayer[] = [
  { rank: 1, name: "Kevin De Bruyne", nationality: "🇧🇪", position: "Midfielder", value: 28, avatar: defaultAvatar },
  { rank: 2, name: "Bruno Fernandes", nationality: "🇵🇹", position: "Midfielder", value: 24, avatar: defaultAvatar },
  { rank: 3, name: "Lionel Messi", nationality: "🇦🇷", position: "Forward", value: 22, avatar: defaultAvatar },
  { rank: 4, name: "Trent Alexander-Arnold", nationality: "🏴󠁧󠁢󠁥󠁮󠁧󠁿", position: "Defender", value: 20, avatar: defaultAvatar },
  { rank: 5, name: "Mohamed Salah", nationality: "🇪🇬", position: "Forward", value: 18, avatar: defaultAvatar },
  { rank: 6, name: "Bukayo Saka", nationality: "🏴󠁧󠁢󠁥󠁮󠁧󠁿", position: "Forward", value: 17, avatar: defaultAvatar },
  { rank: 7, name: "Kylian Mbappé", nationality: "🇫🇷", position: "Forward", value: 16, avatar: defaultAvatar },
  { rank: 8, name: "Leroy Sané", nationality: "🇩🇪", position: "Forward", value: 15, avatar: defaultAvatar },
  { rank: 9, name: "Thomas Müller", nationality: "🇩🇪", position: "Midfielder", value: 14, avatar: defaultAvatar },
  { rank: 10, name: "Jack Grealish", nationality: "🏴󠁧󠁢󠁥󠁮󠁧󠁿", position: "Forward", value: 13, avatar: defaultAvatar },
  { rank: 11, name: "Martin Ødegaard", nationality: "🇳🇴", position: "Midfielder", value: 12, avatar: defaultAvatar },
  { rank: 12, name: "Mason Mount", nationality: "🏴󠁧󠁢󠁥󠁮󠁧󠁿", position: "Midfielder", value: 11, avatar: defaultAvatar },
  { rank: 13, name: "João Félix", nationality: "🇵🇹", position: "Forward", value: 10, avatar: defaultAvatar },
  { rank: 14, name: "Bernardo Silva", nationality: "🇵🇹", position: "Midfielder", value: 9, avatar: defaultAvatar },
  { rank: 15, name: "Jadon Sancho", nationality: "🏴󠁧󠁢󠁥󠁮󠁧󠁿", position: "Forward", value: 8, avatar: defaultAvatar },
];

const combinedPlayers: RankingPlayer[] = [
  { rank: 1, name: "Kylian Mbappé", nationality: "🇫🇷", position: "Forward", value: 64, avatar: defaultAvatar },
  { rank: 2, name: "Lionel Messi", nationality: "🇦🇷", position: "Forward", value: 60, avatar: defaultAvatar },
  { rank: 3, name: "Erling Haaland", nationality: "🇳🇴", position: "Forward", value: 58, avatar: defaultAvatar },
  { rank: 4, name: "Harry Kane", nationality: "🏴󠁧󠁢󠁥󠁮󠁧󠁿", position: "Forward", value: 54, avatar: defaultAvatar },
  { rank: 5, name: "Mohamed Salah", nationality: "🇪🇬", position: "Forward", value: 50, avatar: defaultAvatar },
  { rank: 6, name: "Cristiano Ronaldo", nationality: "🇵🇹", position: "Forward", value: 48, avatar: defaultAvatar },
  { rank: 7, name: "Robert Lewandowski", nationality: "🇵🇱", position: "Forward", value: 44, avatar: defaultAvatar },
  { rank: 8, name: "Vinícius Jr", nationality: "🇧🇷", position: "Forward", value: 42, avatar: defaultAvatar },
  { rank: 9, name: "Kevin De Bruyne", nationality: "🇧🇪", position: "Midfielder", value: 40, avatar: defaultAvatar },
  { rank: 10, name: "Victor Osimhen", nationality: "🇳🇬", position: "Forward", value: 38, avatar: defaultAvatar },
  { rank: 11, name: "Bukayo Saka", nationality: "🏴󠁧󠁢󠁥󠁮󠁧󠁿", position: "Forward", value: 36, avatar: defaultAvatar },
  { rank: 12, name: "Son Heung-min", nationality: "🇰🇷", position: "Forward", value: 34, avatar: defaultAvatar },
  { rank: 13, name: "Phil Foden", nationality: "🏴󠁧󠁢󠁥󠁮󠁧󠁿", position: "Midfielder", value: 32, avatar: defaultAvatar },
  { rank: 14, name: "Lautaro Martínez", nationality: "🇦🇷", position: "Forward", value: 30, avatar: defaultAvatar },
  { rank: 15, name: "Marcus Rashford", nationality: "🏴󠁧󠁢󠁥󠁮󠁧󠁿", position: "Forward", value: 28, avatar: defaultAvatar },
];

const ITEMS_PER_PAGE = 10;

const StatHubRanking = () => {
  const [activeTab, setActiveTab] = useState<"rating" | "goals" | "assists" | "combined">("rating");
  const [searchQuery, setSearchQuery] = useState("");
  const [displayedCount, setDisplayedCount] = useState(ITEMS_PER_PAGE);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  useEffect(() => {
    setDisplayedCount(ITEMS_PER_PAGE);
    setSearchQuery("");
  }, [activeTab]);

  const tabs = [
    { id: "rating" as const, label: "Average StatHub Rating", data: ratingPlayers },
    { id: "goals" as const, label: "Goals", data: goalPlayers },
    { id: "assists" as const, label: "Assists", data: assistPlayers },
    { id: "combined" as const, label: "Goals + Assists", data: combinedPlayers },
  ];

  const currentData = tabs.find(tab => tab.id === activeTab)?.data || ratingPlayers;
  
  const filteredData = currentData.filter(player =>
    player.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    player.position.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const displayedData = filteredData.slice(0, displayedCount);
  const hasMore = displayedCount < filteredData.length;

  const loadMore = () => {
    setIsLoading(true);
    setTimeout(() => {
      setDisplayedCount(prev => Math.min(prev + ITEMS_PER_PAGE, filteredData.length));
      setIsLoading(false);
    }, 500);
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
          {tabs.map((tab) => (
            <Button
              key={tab.id}
              variant={activeTab === tab.id ? "default" : "outline"}
              onClick={() => setActiveTab(tab.id)}
              className={activeTab === tab.id ? "bg-primary text-primary-foreground" : ""}
            >
              {tab.label}
            </Button>
          ))}
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
                {displayedData.map((player) => (
                  <tr 
                    key={player.rank}
                    className="border-b border-border/30 hover:bg-primary/5 transition-colors"
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
                          <AvatarImage src={player.avatar} alt={player.name} />
                          <AvatarFallback className="bg-muted text-xs">
                            {player.name.split(" ").map(n => n[0]).join("")}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <span className="font-semibold">{player.name}</span>
                          <p className="text-xs text-muted-foreground">{player.nationality}</p>
                        </div>
                      </div>
                    </td>
                    <td className="p-4">
                      <Badge variant="outline" className="border-primary/30 text-muted-foreground">
                        {player.position}
                      </Badge>
                    </td>
                    <td className="p-4 text-right">
                      <span className={`text-lg font-bold ${player.rank === 1 ? 'text-primary' : 'text-foreground'}`}>
                        {player.value}
                      </span>
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
                disabled={isLoading}
                variant="outline"
                className="border-primary/30 hover:border-primary/50 hover:bg-primary/10"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Loading more...
                  </>
                ) : (
                  `Load More (${filteredData.length - displayedCount} remaining)`
                )}
              </Button>
            </div>
          ) : displayedData.length > 0 && (
            <div className="p-4 text-center border-t border-border/30">
              <p className="text-sm text-muted-foreground">End of list reached</p>
            </div>
          )}

          {displayedData.length === 0 && (
            <div className="p-8 text-center">
              <p className="text-muted-foreground">No players found matching "{searchQuery}"</p>
            </div>
          )}
        </Card>
      </div>
    </div>
  );
};

export default StatHubRanking;
