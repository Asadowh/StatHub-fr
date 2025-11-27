import { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Loader2 } from "lucide-react";
import { findCountryByName } from "@/lib/countryData";
import { useAuth } from "@/contexts/AuthContext";
import { userApi, type UserStats, type XPInfo } from "@/lib/api";
import { getLevelInfo } from "@/lib/levels";

export const ProfileCard = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState<UserStats | null>(null);
  const [xpInfo, setXpInfo] = useState<XPInfo | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadStats();
  }, [user]);

  const loadStats = async () => {
    if (!user) return;
    try {
      const [statsData, xpData] = await Promise.all([
        userApi.getUserStats(user.id).catch(() => null),
        userApi.getMyXPInfo().catch(() => null),
      ]);
      if (statsData) setStats(statsData);
      if (xpData) setXpInfo(xpData);
    } catch (error) {
      console.error("Failed to load stats:", error);
    } finally {
      setIsLoading(false);
    }
  };

  // Get level info from user or XP info
  const level = xpInfo?.level || user?.level || 1;
  const xp = xpInfo?.current_xp || user?.xp || 0;
  const levelInfo = getLevelInfo(level);
  const progressPercent = xpInfo?.progress_percent || 0;
  const xpForNext = xpInfo?.xp_for_next_level;

  // Get country data - search by name or code
  const countryData = findCountryByName(user?.nationality || '');
  
  // Get country code for display (just the code, no flag emoji - they don't render well on all systems)
  const getCountryDisplay = (): string => {
    if (countryData?.code) return countryData.code;
    if (user?.nationality) {
      // If it's a 2-3 letter code, use it directly
      if (user.nationality.length <= 3) return user.nationality.toUpperCase();
      // Otherwise take first 2 letters
      return user.nationality.slice(0, 2).toUpperCase();
    }
    return 'N/A';
  };
  
  // Parse birth date without timezone issues (YYYY-MM-DD format)
  const parseBirthDate = () => {
    if (!user?.birth_date) return null;
    // Parse YYYY-MM-DD directly to avoid timezone issues
    const parts = user.birth_date.split('-');
    if (parts.length !== 3) return null;
    return {
      year: parseInt(parts[0], 10),
      month: parseInt(parts[1], 10), // 1-based month
      day: parseInt(parts[2], 10),
    };
  };

  // Calculate age from birthday
  const calculateAge = () => {
    const birth = parseBirthDate();
    if (!birth) return 0;
    const today = new Date();
    let age = today.getFullYear() - birth.year;
    const monthDiff = (today.getMonth() + 1) - birth.month; // today.getMonth() is 0-based
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.day)) {
      age--;
    }
    return age;
  };

  const formatBirthDate = () => {
    const birth = parseBirthDate();
    if (!birth) return 'Not set';
    const monthNames = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
    return `${birth.day} ${monthNames[birth.month - 1]} ${birth.year} (${calculateAge()})`;
  };

  if (!user) return null;

  return (
    <Card className="relative overflow-hidden border-2 border-primary/30 p-6 animate-fade-in">
      <div className="relative z-10">
        {/* Header Badge */}
        <div className="flex justify-end items-start mb-6">
          <Badge className="bg-white/10 backdrop-blur-sm text-foreground border-white/20 text-lg px-3 py-1">
            {getCountryDisplay()}
          </Badge>
        </div>

        {/* Avatar and Info */}
        <div className="flex items-center gap-6">
          <div className="relative">
            <div className="absolute inset-0 bg-gradient-to-br from-primary to-accent rounded-full blur-xl opacity-50 animate-pulse" />
            <Avatar className="w-28 h-28 border-4 border-primary relative z-10">
              <AvatarImage 
                src={user.photo_url ? `http://localhost:8000${user.photo_url}` : undefined} 
                alt={user.full_name || user.username} 
                className="object-cover" 
              />
              <AvatarFallback className="bg-primary/20 text-2xl font-bold">
                {(user.full_name || user.username)?.split(' ').map(n => n[0]).join('').slice(0, 2)}
              </AvatarFallback>
            </Avatar>
          </div>

          <div className="flex-1">
            <h2 className="text-3xl font-bold text-foreground mb-1 text-glow">
              {user.full_name || user.username}
            </h2>
            <p className="text-muted-foreground text-sm mb-3">@{user.username}</p>
            
            <div className="grid grid-cols-2 gap-3 mb-4">
              <div className="flex items-center gap-2">
                <Badge className="bg-accent text-accent-foreground font-bold text-lg px-3 py-1">
                  #{user.jersey_number || '?'}
                </Badge>
                <span className="text-sm text-muted-foreground">Jersey</span>
              </div>
              <div className="flex flex-col">
                <span className="text-xs text-muted-foreground">Position</span>
                <span className="text-sm font-semibold text-foreground">{user.favorite_position || 'Not set'}</span>
              </div>
              <div className="flex flex-col">
                <span className="text-xs text-muted-foreground">Birthday</span>
                <span className="text-sm font-semibold text-foreground">{formatBirthDate()}</span>
              </div>
              <div className="flex flex-col">
                <span className="text-xs text-muted-foreground">Height</span>
                <span className="text-sm font-semibold text-foreground">
                  {user.height ? `${user.height} cm` : 'Not set'}
                </span>
              </div>
            </div>

            {/* Level & XP */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  {isLoading ? (
                    <Loader2 className="w-6 h-6 animate-spin text-primary" />
                  ) : (
                    <>
                      <div 
                        className="w-10 h-10 rounded-lg flex items-center justify-center font-bold text-xl shadow-lg text-white"
                        style={{ backgroundColor: levelInfo.color }}
                      >
                        {level}
                      </div>
                      <span className="text-sm font-semibold" style={{ color: levelInfo.color }}>
                        {levelInfo.name}
                      </span>
                    </>
                  )}
                </div>
                <div className="flex items-center gap-1">
                  <span className="text-accent text-xl font-bold">⭐</span>
                  <span className="text-foreground font-bold">{xp.toLocaleString()} XP</span>
                </div>
              </div>
              
              {/* Progress bar */}
              <div className="h-3 bg-muted/30 rounded-full overflow-hidden backdrop-blur-sm">
                <div 
                  className="h-full rounded-full transition-all duration-500 shadow-lg"
                  style={{ 
                    width: `${progressPercent}%`,
                    backgroundColor: levelInfo.color,
                  }}
                />
              </div>
              <p className="text-xs text-muted-foreground text-right">
                {xpForNext ? `${xpForNext.toLocaleString()} XP to next level` : 'Max level reached!'}
              </p>
            </div>
          </div>
        </div>
      </div>
    </Card>
  );
};
