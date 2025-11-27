import { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Progress } from "@/components/ui/progress";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Trophy, Medal, MapPin, Ruler, Calendar, Target, Loader2 } from "lucide-react";
import trophyIcon from "@/assets/trophy-icon.png";
import badgeIcon from "@/assets/badge-icon.png";
import { EditProfileModal } from "@/components/EditProfileModal";
import { formatHeight } from "@/lib/utils";
import { useAuth } from "@/contexts/AuthContext";
import { userApi, achievementApi, trophyApi, type UserStats, type Achievement, type Trophy as TrophyType } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";

const Profile = () => {
  const { user, refreshUser } = useAuth();
  const { toast } = useToast();
  const [stats, setStats] = useState<UserStats | null>(null);
  const [achievements, setAchievements] = useState<Achievement[]>([]);
  const [trophies, setTrophies] = useState<TrophyType[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    window.scrollTo(0, 0);
    loadProfileData();
  }, [user]);

  const loadProfileData = async () => {
    if (!user) return;
    
    try {
      setIsLoading(true);
      const [statsData, achievementsData, trophiesData] = await Promise.all([
        userApi.getUserStats(user.id),
        achievementApi.getMyAchievements().catch(() => []),
        trophyApi.getUserTrophies(user.id).catch(() => []),
      ]);
      setStats(statsData);
      setAchievements(achievementsData);
      setTrophies(trophiesData);
    } catch (error) {
      console.error("Failed to load profile data:", error);
    } finally {
      setIsLoading(false);
    }
  };

  // Parse birth date without timezone issues (YYYY-MM-DD format)
  const parseBirthDate = () => {
    if (!user?.birth_date) return null;
    const parts = user.birth_date.split('-');
    if (parts.length !== 3) return null;
    return {
      year: parseInt(parts[0], 10),
      month: parseInt(parts[1], 10),
      day: parseInt(parts[2], 10),
    };
  };

  const calculateAge = () => {
    const birth = parseBirthDate();
    if (!birth) return 0;
    const today = new Date();
    let age = today.getFullYear() - birth.year;
    const monthDiff = (today.getMonth() + 1) - birth.month;
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.day)) {
      age--;
    }
    return age;
  };

  // XP Progress Calculation (based on stats)
  const level = Math.floor((stats?.total_goals || 0) / 5) + 1;
  const xp = ((stats?.total_goals || 0) * 100) + ((stats?.total_assists || 0) * 50);
  const xpForNextLevel = level * 1000;
  const xpProgress = Math.min((xp / xpForNextLevel) * 100, 100);

  const unlockedAchievements = achievements.filter(a => a.unlocked);
  const topAchievements = unlockedAchievements.slice(0, 5);

  const topTrophies = trophies.slice(0, 3);

  // Handle profile save
  const handleProfileSave = async (data: {
    name: string;
    username: string;
    jerseyNumber: number;
    nationality: string;
    birthDay: number;
    birthMonth: number;
    birthYear: number;
    height: string;
    favoritePosition: string;
    quote?: string;
  }, photoFile?: File) => {
    setIsSaving(true);
    try {
      // Format birth date as YYYY-MM-DD
      const formattedBirthDate = `${data.birthYear}-${String(data.birthMonth).padStart(2, '0')}-${String(data.birthDay).padStart(2, '0')}`;
      
      // Update profile data
      await userApi.updateMe({
        full_name: data.name,
        username: data.username,
        jersey_number: data.jerseyNumber,
        nationality: data.nationality,
        birth_date: formattedBirthDate,
        height: parseInt(data.height) || null,
        favorite_position: data.favoritePosition,
        personal_quote: data.quote,
      });
      
      // Upload photo if provided
      if (photoFile) {
        await userApi.uploadPhoto(photoFile);
      }
      
      // Refresh user data from backend - THIS IS THE KEY!
      await refreshUser();
      
      toast({
        title: "Profile updated!",
        description: "Your changes have been saved successfully.",
      });
    } catch (error) {
      console.error("Failed to update profile:", error);
      toast({
        title: "Update failed",
        description: error instanceof Error ? error.message : "Could not update profile",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
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
        {/* Profile Header */}
        <Card className="p-8 bg-gradient-to-br from-card to-card/50 border-border/50">
          <div className="flex flex-col md:flex-row gap-8 items-start">
            {/* Avatar Section */}
            <div className="flex flex-col items-center gap-4">
              <Avatar className="w-32 h-32 border-4 border-primary/30">
                <AvatarImage 
                  src={user?.photo_url ? `http://localhost:8000${user.photo_url}` : undefined} 
                  alt="Profile" 
                />
                <AvatarFallback className="text-3xl">
                  {user?.full_name?.split(' ').map(n => n[0]).join('') || 'U'}
                </AvatarFallback>
              </Avatar>
              <div className="text-center space-y-2">
                <Badge className="bg-primary/20 text-primary border-primary/30">Level {level}</Badge>
                
                {/* Level Progress Bar */}
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <div className="w-32 space-y-1 cursor-help">
                        <Progress value={xpProgress} className="h-2" />
                        <p className="text-xs text-muted-foreground flex items-center justify-center gap-1">
                          <span>{xp} / {xpForNextLevel} XP</span>
                        </p>
                      </div>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>{xp} / {xpForNextLevel} XP to level {level + 1}</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </div>
            </div>

            {/* Profile Info */}
            <div className="flex-1 space-y-6">
              <div>
                <h1 className="text-4xl font-bold mb-2">{user?.full_name || user?.username}</h1>
                {user?.personal_quote ? (
                  <p className="text-muted-foreground italic">"{user.personal_quote}"</p>
                ) : (
                  <p className="text-muted-foreground/50 italic text-sm">Add your personal quote</p>
                )}
              </div>

              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                <div className="flex items-center gap-2 text-sm">
                  <MapPin className="w-4 h-4 text-primary" />
                  <span className="text-muted-foreground">{user?.nationality || 'Not set'}</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <Calendar className="w-4 h-4 text-primary" />
                  <span className="text-muted-foreground">{calculateAge()} years old</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <Ruler className="w-4 h-4 text-primary" />
                  <span className="text-muted-foreground">
                    {user?.height ? formatHeight(user.height.toString()) : 'Not set'}
                  </span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <Target className="w-4 h-4 text-primary" />
                  <span className="text-muted-foreground">
                    {user?.jersey_number ? `Jersey #${user.jersey_number}` : 'No jersey'}
                  </span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <Trophy className="w-4 h-4 text-primary" />
                  <span className="text-muted-foreground">{user?.favorite_position || 'Not set'}</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <Calendar className="w-4 h-4 text-primary" />
                  <span className="text-muted-foreground">
                    Joined: {user?.created_at ? new Date(user.created_at).toLocaleDateString('en-US', { month: 'long', year: 'numeric' }) : 'Unknown'}
                  </span>
                </div>
              </div>

              <div>
                <EditProfileModal 
                  profileData={{
                    name: user?.full_name || '',
                    username: user?.username || '',
                    jerseyNumber: user?.jersey_number || 0,
                    nationality: user?.nationality || '',
                    birthDay: parseBirthDate()?.day || 1,
                    birthMonth: parseBirthDate()?.month || 1,
                    birthYear: parseBirthDate()?.year || 2000,
                    height: user?.height?.toString() || '',
                    favoritePosition: user?.favorite_position || '',
                    level: level,
                    xp: xp,
                    quote: user?.personal_quote || '',
                  }} 
                  onSave={handleProfileSave} 
                />
              </div>
            </div>
          </div>
        </Card>

        {/* Stats Overview */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card className="p-6 text-center bg-gradient-to-br from-card to-card/50">
            <p className="text-3xl font-bold text-primary">{stats?.matches_played || 0}</p>
            <p className="text-sm text-muted-foreground mt-1">Total Matches</p>
          </Card>
          <Card className="p-6 text-center bg-gradient-to-br from-card to-card/50">
            <p className="text-3xl font-bold text-primary">{stats?.total_goals || 0}</p>
            <p className="text-sm text-muted-foreground mt-1">Goals</p>
          </Card>
          <Card className="p-6 text-center bg-gradient-to-br from-card to-card/50">
            <p className="text-3xl font-bold text-primary">{stats?.total_assists || 0}</p>
            <p className="text-sm text-muted-foreground mt-1">Assists</p>
          </Card>
          <Card className="p-6 text-center bg-gradient-to-br from-card to-card/50">
            <p className="text-3xl font-bold text-primary">{stats?.avg_rating || 0}</p>
            <p className="text-sm text-muted-foreground mt-1">Avg Rating</p>
          </Card>
        </div>

        {/* Achievements Section */}
        <Card className="p-6 bg-gradient-to-br from-card to-card/50 border-border/50">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <img src={badgeIcon} alt="Achievement" className="w-8 h-8" />
              <h2 className="text-2xl font-bold">Top Achievements</h2>
            </div>
            <Badge variant="outline" className="border-primary/30 text-primary">
              {unlockedAchievements.length} / {achievements.length} Unlocked
            </Badge>
          </div>

          {topAchievements.length > 0 ? (
            <div className="grid gap-3">
              {topAchievements.map((achievement) => (
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
            <p className="text-center text-muted-foreground py-8">No achievements unlocked yet. Keep playing!</p>
          )}
        </Card>

        {/* Trophies Section */}
        <Card className="p-6 bg-gradient-to-br from-card to-card/50 border-border/50">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <img src={trophyIcon} alt="Trophy" className="w-8 h-8" />
              <h2 className="text-2xl font-bold">Recent Trophies</h2>
            </div>
            <Badge variant="outline" className="border-primary/30 text-primary">
              {trophies.length} Total
            </Badge>
          </div>

          {topTrophies.length > 0 ? (
            <div className="grid md:grid-cols-3 gap-4">
              {topTrophies.map((trophy) => (
                <Card
                  key={trophy.id}
                  className="p-5 bg-gradient-to-br from-primary/5 to-background border-primary/20 hover:border-primary/40 transition-all duration-300 hover:shadow-gold"
                >
                  <Trophy className="w-8 h-8 text-primary mb-3" />
                  <h3 className="font-bold text-lg mb-1">{trophy.name}</h3>
                  <p className="text-sm text-muted-foreground mb-2">{trophy.description || 'Achievement Trophy'}</p>
                  <p className="text-xs text-primary">
                    {new Date(trophy.date_awarded).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
                  </p>
                </Card>
              ))}
            </div>
          ) : (
            <p className="text-center text-muted-foreground py-8">No trophies yet. Keep playing to earn trophies!</p>
          )}

          <p className="text-sm text-muted-foreground text-center mt-6 italic">
            Trophies are awarded every 3 matches based on average ratings. Keep performing to climb the ranks!
          </p>
        </Card>
      </div>
    </div>
  );
};

export default Profile;
