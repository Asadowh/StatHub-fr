import { useNavigate } from "react-router-dom";
import { Card } from "@/components/ui/card";
import { Trophy, Award, BarChart3 } from "lucide-react";

const actions = [
  { 
    title: "Leaderboard", 
    description: "Ranked by XP from achievements", 
    icon: Trophy, 
    path: "/leaderboard",
    gradient: "from-primary/10 to-primary/5",
    iconColor: "text-primary"
  },
  { 
    title: "Trophies", 
    description: "Ranked by trophies earned", 
    icon: Award, 
    path: "/trophies",
    gradient: "from-yellow-400/15 to-amber-400/15",
    iconColor: "text-yellow-400",
    glow: true
  },
  { 
    title: "StatHub Ranking", 
    description: "Compare top player stats", 
    icon: BarChart3, 
    path: "/stathub-ranking",
    gradient: "from-blue-500/10 to-cyan-500/10",
    iconColor: "text-blue-400"
  },
];

export const QuickActions = () => {
  const navigate = useNavigate();

  const handleNavigate = (path: string) => {
    navigate(path);
    window.scrollTo(0, 0);
  };

  return (
    <section className="space-y-4">
      <h3 className="text-xl font-semibold">Quick Actions</h3>
      
      <div className="grid gap-4 md:grid-cols-3">
        {actions.map((action) => (
          <Card
            key={action.path}
            onClick={() => handleNavigate(action.path)}
            className={`p-6 bg-gradient-to-br ${action.gradient} border-border/50 hover:border-primary/50 cursor-pointer transition-all duration-300 hover:scale-105 hover:shadow-gold group ${action.glow ? 'shadow-[0_0_15px_rgba(250,204,21,0.15)]' : ''}`}
          >
            <div className="flex items-center gap-4">
              <div className={`p-3 rounded-xl bg-background/50 ${action.iconColor} group-hover:scale-110 transition-transform`}>
                <action.icon className="w-6 h-6" />
              </div>
              <div>
                <h4 className="font-semibold text-foreground group-hover:text-primary transition-colors">
                  {action.title}
                </h4>
                <p className="text-sm text-muted-foreground">{action.description}</p>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </section>
  );
};
