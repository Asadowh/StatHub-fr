import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Medal, Lock, Loader2 } from "lucide-react";
import confetti from "canvas-confetti";
import { useToast } from "@/hooks/use-toast";
import { achievementApi, type Achievement } from "@/lib/api";

const Achievements = () => {
  const [achievements, setAchievements] = useState<Achievement[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filter, setFilter] = useState<string>("All");
  const { toast } = useToast();
  
  useEffect(() => {
    window.scrollTo(0, 0);
    loadAchievements();
  }, []);

  const loadAchievements = async () => {
    try {
      setIsLoading(true);
      const data = await achievementApi.getMyAchievements();
      setAchievements(data);
    } catch (error) {
      console.error("Failed to load achievements:", error);
      // Fallback to empty array
      setAchievements([]);
    } finally {
      setIsLoading(false);
    }
  };

  const triggerAchievementUnlock = (achievement: Achievement) => {
    // Confetti animation
    const duration = 1000;
    const animationEnd = Date.now() + duration;
    const defaults = { startVelocity: 30, spread: 360, ticks: 60, zIndex: 9999 };

    const randomInRange = (min: number, max: number) => {
      return Math.random() * (max - min) + min;
    };

    const interval: NodeJS.Timeout = setInterval(() => {
      const timeLeft = animationEnd - Date.now();

      if (timeLeft <= 0) {
        return clearInterval(interval);
      }

      const particleCount = 50 * (timeLeft / duration);
      
      confetti({
        ...defaults,
        particleCount,
        origin: { x: randomInRange(0.1, 0.3), y: Math.random() - 0.2 }
      });
      confetti({
        ...defaults,
        particleCount,
        origin: { x: randomInRange(0.7, 0.9), y: Math.random() - 0.2 }
      });
    }, 250);

    // Toast notification
    toast({
      title: "🏅 Achievement Unlocked!",
      description: `${achievement.name} - ${achievement.description}`,
      duration: 3000,
    });
  };
  
  const tiers = ["All", "Beginner", "Advanced", "Expert"];
  const unlockedCount = achievements.filter(a => a.unlocked).length;
  const totalPoints = achievements.filter(a => a.unlocked).reduce((sum, a) => sum + a.points, 0);

  const filteredAchievements = filter === "All" 
    ? achievements 
    : achievements.filter(a => a.tier === filter);

  const getTierColor = (tier: string) => {
    switch(tier) {
      case "Beginner": return "bg-green-500/20 text-green-500 border-green-500/30";
      case "Advanced": return "bg-blue-500/20 text-blue-500 border-blue-500/30";
      case "Expert": return "bg-primary/20 text-primary border-primary/30";
      default: return "";
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
    <div className="container mx-auto px-4 py-8 max-w-7xl">
      <div className="space-y-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-4xl font-bold mb-2">Achievements</h1>
            <p className="text-muted-foreground">Track your progress and unlock rewards</p>
          </div>
          
          {/* Stats Summary */}
          <div className="flex gap-4">
            <Card className="p-4 bg-gradient-to-br from-card to-card/50">
              <p className="text-sm text-muted-foreground">Unlocked</p>
              <p className="text-2xl font-bold text-primary">{unlockedCount} / {achievements.length}</p>
            </Card>
            <Card className="p-4 bg-gradient-to-br from-card to-card/50">
              <p className="text-sm text-muted-foreground">Total Points</p>
              <p className="text-2xl font-bold text-primary">{totalPoints}</p>
            </Card>
          </div>
        </div>

        {/* Filters */}
        <div className="flex gap-2 flex-wrap">
          {tiers.map((tier) => (
            <Button
              key={tier}
              variant={filter === tier ? "default" : "outline"}
              onClick={() => setFilter(tier)}
              className={filter === tier ? "bg-primary text-primary-foreground" : ""}
            >
              {tier}
            </Button>
          ))}
        </div>

        {/* Achievements Grid */}
        {filteredAchievements.length > 0 ? (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {filteredAchievements.map((achievement) => (
              <Card
                key={achievement.id}
                className={`p-6 transition-all duration-300 ${
                  achievement.unlocked
                    ? "bg-gradient-to-br from-primary/10 to-card border-primary/30 shadow-gold cursor-pointer hover:scale-105"
                    : "bg-gradient-to-br from-card to-card/50 border-border/50 opacity-75"
                }`}
                onClick={() => achievement.unlocked && triggerAchievementUnlock(achievement)}
              >
                <div className="space-y-4">
                  {/* Icon & Title */}
                  <div className="flex items-start justify-between">
                    <div className={`p-3 rounded-xl ${achievement.unlocked ? "bg-primary/20" : "bg-muted/20"}`}>
                      {achievement.unlocked ? (
                        <Medal className="w-6 h-6 text-primary" />
                      ) : (
                        <Lock className="w-6 h-6 text-muted-foreground" />
                      )}
                    </div>
                    <Badge className={getTierColor(achievement.tier)}>
                      {achievement.tier}
                    </Badge>
                  </div>

                  {/* Content */}
                  <div>
                    <h3 className="font-bold text-lg mb-1">{achievement.name}</h3>
                    <p className="text-sm text-muted-foreground">{achievement.description}</p>
                    {achievement.unlocked && (
                      <p className="text-xs text-primary/60 mt-1 italic">Click to celebrate again! 🎉</p>
                    )}
                  </div>

                  {/* Progress Bar (if applicable) */}
                  {achievement.target_value > 0 && (
                    <div className="space-y-1">
                      <div className="flex justify-between text-xs">
                        <span className="text-muted-foreground">Progress</span>
                        <span className="text-primary font-semibold">
                          {achievement.current_value} / {achievement.target_value}
                        </span>
                      </div>
                      <Progress 
                        value={(achievement.current_value / achievement.target_value) * 100} 
                        className="h-2"
                      />
                    </div>
                  )}

                  {/* Points */}
                  <div className="pt-2 border-t border-border/50 flex items-center justify-between">
                    <span className="text-xs text-muted-foreground">{achievement.tier}</span>
                    <Badge variant="outline" className="border-primary/30 text-primary">
                      +{achievement.points} pts
                    </Badge>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        ) : (
          <Card className="p-12 text-center">
            <Medal className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-xl font-bold mb-2">No Achievements Yet</h3>
            <p className="text-muted-foreground">
              Start playing matches to unlock achievements and earn points!
            </p>
          </Card>
        )}
      </div>
    </div>
  );
};

export default Achievements;
