import { useEffect, useState, useRef } from "react";
import { Card } from "@/components/ui/card";
import { Trophy, Award, TrendingUp, Loader2 } from "lucide-react";
import achievementBanner from "@/assets/achievement-banner.png";
import trophyBanner from "@/assets/trophy-banner.png";
import rankingBanner from "@/assets/ranking-banner.png";
import { useAuth } from "@/contexts/AuthContext";
import { userApi, leaderboardApi, achievementApi, type UserStats } from "@/lib/api";

interface StatCardProps {
  title: string;
  value: string | number;
  icon: React.ReactNode;
  gradient?: string;
  isLoading?: boolean;
}

const StatCard = ({ title, value, icon, gradient = "from-primary/20 to-primary/10", isLoading }: StatCardProps) => {
  const getBackgroundImage = () => {
    if (title === "Achievements") return achievementBanner;
    if (title === "Trophies") return trophyBanner;
    if (title === "Ranking") return rankingBanner;
    return null;
  };

  const bgImage = getBackgroundImage();

  return (
    <Card className="gradient-card border-2 border-primary/20 overflow-hidden hover:border-primary/30 transition-all duration-300 hover:scale-105 hover:shadow-lg group relative">
      {bgImage && (
        <div className="absolute inset-0 opacity-10 group-hover:opacity-20 transition-opacity">
          <img 
            src={bgImage} 
            alt={title}
            className="w-full h-full object-cover"
          />
        </div>
      )}
      <div className={`absolute inset-0 bg-gradient-to-br ${gradient} opacity-40 group-hover:opacity-60 transition-opacity`} />
      
      <div className="relative z-10 p-6">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
            {title}
          </h3>
          <div className="text-primary group-hover:scale-110 transition-transform">
            {icon}
          </div>
        </div>
        
        <div className="flex items-center justify-between">
          {isLoading ? (
            <Loader2 className="w-6 h-6 animate-spin text-primary" />
          ) : (
            <p className="text-4xl font-bold text-foreground text-glow">
              {value}
            </p>
          )}
        </div>
      </div>
    </Card>
  );
};

export const StatsGrid = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState<UserStats | null>(null);
  const [rank, setRank] = useState<number | null>(null);
  const [totalAchievements, setTotalAchievements] = useState({ unlocked: 0, total: 0 });
  const [isLoading, setIsLoading] = useState(true);
  const loadedRef = useRef(false);

  useEffect(() => {
    // Only load once
    if (loadedRef.current || !user?.id) {
      setIsLoading(false);
      return;
    }
    
    loadedRef.current = true;
    
    const loadStats = async () => {
      try {
        const [statsData, rankData, achievementsData] = await Promise.all([
          userApi.getUserStats(user.id).catch(() => null),
          leaderboardApi.getUserRank(user.id).catch(() => null),
          achievementApi.getMyAchievements().catch(() => []),
        ]);

        if (statsData) setStats(statsData);
        if (rankData) setRank(rankData.rank);
        
        const unlocked = Array.isArray(achievementsData) 
          ? achievementsData.filter((a: any) => a.unlocked).length 
          : 0;
        const total = Array.isArray(achievementsData) ? achievementsData.length : 0;
        setTotalAchievements({ unlocked, total });
      } catch (error) {
        console.error("Failed to load stats:", error);
      } finally {
        setIsLoading(false);
      }
    };

    loadStats();
  }, [user?.id]);

  const formatRank = (rank: number | null) => {
    if (rank === null) return "N/A";
    return `#${rank}`;
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 animate-fade-in" style={{ animationDelay: "0.1s" }}>
      <StatCard
        title="Achievements"
        value={`${totalAchievements.unlocked}/${totalAchievements.total}`}
        icon={<Award className="w-6 h-6" />}
        gradient="from-accent/20 to-amber-400/10"
        isLoading={isLoading}
      />
      <StatCard
        title="Ranking"
        value={formatRank(rank)}
        icon={<TrendingUp className="w-6 h-6" />}
        gradient="from-blue-500/20 to-cyan-500/10"
        isLoading={isLoading}
      />
      <StatCard
        title="Trophies"
        value={stats?.trophy_count || 0}
        icon={<Trophy className="w-6 h-6" />}
        gradient="from-accent/20 to-amber-400/10"
        isLoading={isLoading}
      />
    </div>
  );
};
