import { useNavigate } from "react-router-dom";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Clock, ThumbsUp, MessageCircle } from "lucide-react";
import concertPic from "@/assets/concert-pic.jpg";
import news2 from "@/assets/news-2.png";
import news3 from "@/assets/news-3.png";
import news4 from "@/assets/news-4.png";
import news5 from "@/assets/news-5.png";

interface NewsItemProps {
  title: string;
  description: string;
  timestamp: string;
  likes?: number;
  comments?: number;
  category?: string;
  imageUrl?: string;
  newsId: number;
}

const NewsItem = ({ title, description, timestamp, likes = 0, comments = 0, category = "Team News", imageUrl, newsId }: NewsItemProps) => {
  const navigate = useNavigate();
  
  return (
    <Card 
      onClick={() => navigate('/news', { state: { postId: newsId } })}
      className="gradient-card border-2 border-primary/20 overflow-hidden hover:border-primary/40 transition-all cursor-pointer group"
    >
      {imageUrl && (
        <div className="w-full h-48 overflow-hidden">
          <img 
            src={imageUrl} 
            alt={title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          />
        </div>
      )}
      <div className="p-5">
        <div className="flex items-center gap-2 mb-3">
          <Badge className="bg-accent/20 text-accent border-accent/30 text-xs">
            {category}
          </Badge>
          <div className="flex items-center gap-1 text-muted-foreground text-xs">
            <Clock className="w-3 h-3" />
            <span>{timestamp}</span>
          </div>
        </div>
        
        <h3 className="text-foreground font-bold text-lg group-hover:text-primary transition-colors mb-2">
          {title}
        </h3>
        
        <p className="text-muted-foreground text-sm leading-relaxed mb-4">
          {description}
        </p>
        
        <div className="flex items-center gap-4">
          <button className="flex items-center gap-1 text-muted-foreground hover:text-accent transition-colors">
            <ThumbsUp className="w-4 h-4" />
            <span className="text-sm font-semibold">{likes}</span>
          </button>
          <button className="flex items-center gap-1 text-muted-foreground hover:text-primary transition-colors">
            <MessageCircle className="w-4 h-4" />
            <span className="text-sm font-semibold">{comments}</span>
          </button>
        </div>
      </div>
    </Card>
  );
};

export const NewsFeed = () => {
  const newsItems = [
    {
      newsId: 4,
      title: "Concert Night Success 🎸",
      description: "Qaqam qiza shaggaladi!",
      timestamp: "2 hours ago",
      likes: 67,
      comments: 23,
      category: "Social",
      imageUrl: concertPic
    },
    {
      newsId: 1,
      title: "Epic Hat Trick Celebration Fail 🏆😂",
      description: "Ali scored a hat trick and then tripped over the ball during celebration. Classic Ali moment that will go down in team history!",
      timestamp: "5 hours ago",
      likes: 24,
      comments: 8,
      category: "Funny",
      imageUrl: news2
    },
    {
      newsId: 3,
      title: "Clean Sheet Celebration! 🧤",
      description: "Parviz finally got a clean sheet after 9 matches! The drought is over and the goalkeeper is back in beast mode.",
      timestamp: "1 day ago",
      likes: 45,
      comments: 15,
      category: "Achievement",
      imageUrl: news3
    },
    {
      newsId: 5,
      title: "The Slipper Incident 🩴",
      description: "Rashad showed up to practice in slippers because he 'forgot' it was training day. The team will never let him live this down!",
      timestamp: "2 days ago",
      likes: 38,
      comments: 11,
      category: "Funny",
      imageUrl: news4
    },
    {
      newsId: 6,
      title: "Karaoke Night Chaos 🎤",
      description: "Post-game team dinner turned into a karaoke competition. Goalkeeper can't sing but gets 10/10 for effort and entertainment!",
      timestamp: "3 days ago",
      likes: 52,
      comments: 19,
      category: "Team Life",
      imageUrl: news5
    }
  ];

  return (
    <div className="animate-fade-in" style={{ animationDelay: "0.3s" }}>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-foreground text-glow flex items-center gap-2">
          📰 Team News
          <Badge className="bg-accent text-accent-foreground">NEW</Badge>
        </h2>
      </div>
      
      <div className="space-y-4">
        {newsItems.map((item, index) => (
          <NewsItem key={index} {...item} />
        ))}
      </div>
    </div>
  );
};
