import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Clock, Heart, MessageCircle, Loader2 } from "lucide-react";
import { newsApi, commentApi, reactionApi, userApi, API_BASE_URL } from "@/lib/api";
import { formatDistanceToNow } from "date-fns";

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
  
  const getImageUrl = (imageUrl: string | null) => {
    if (!imageUrl) return null;
    if (imageUrl.startsWith("http")) return imageUrl;
    return `${API_BASE_URL}${imageUrl}`;
  };

  const getCategoryColor = (category: string | null | undefined) => {
    if (!category) return "bg-muted/20 text-muted-foreground border-muted/30";
    switch(category) {
      case "Funny": return "bg-yellow-500/20 text-yellow-500 border-yellow-500/30";
      case "Achievement": return "bg-primary/20 text-primary border-primary/30";
      case "Social": return "bg-purple-500/20 text-purple-500 border-purple-500/30";
      case "Team Life": return "bg-blue-500/20 text-blue-500 border-blue-500/30";
      case "News": return "bg-green-500/20 text-green-500 border-green-500/30";
      default: return "bg-muted/20 text-muted-foreground border-muted/30";
    }
  };
  
  return (
    <Card 
      onClick={() => navigate('/news', { state: { postId: newsId } })}
      className="gradient-card border-2 border-primary/20 overflow-hidden hover:border-primary/40 transition-all cursor-pointer group"
    >
      {imageUrl && (
        <div className="w-full h-48 overflow-hidden">
          <img 
            src={getImageUrl(imageUrl) || ""} 
            alt={title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          />
        </div>
      )}
      <div className="p-5">
        <div className="flex items-center gap-2 mb-3">
          {category && (
            <Badge className={`${getCategoryColor(category)} text-xs`}>
              {category}
            </Badge>
          )}
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
          <div className="flex items-center gap-1 text-muted-foreground">
            <Heart className="w-4 h-4" />
            <span className="text-sm font-semibold">{likes}</span>
          </div>
          <div className="flex items-center gap-1 text-muted-foreground">
            <MessageCircle className="w-4 h-4" />
            <span className="text-sm font-semibold">{comments}</span>
          </div>
        </div>
      </div>
    </Card>
  );
};

export const NewsFeed = () => {
  const [newsItems, setNewsItems] = useState<NewsItemProps[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchNews = async () => {
      try {
        setIsLoading(true);
        const posts = await newsApi.getAll();
        
        // Get only the last 5 posts for homepage preview
        const previewPosts = posts.slice(0, 5);
        
        // Fetch additional data for each post
        const itemsWithDetails = await Promise.all(
          previewPosts.map(async (post) => {
            try {
              const author = await userApi.getUser(post.author_id);
              const comments = await commentApi.getNewsComments(post.id);
              const reactionCounts = await reactionApi.getNewsReactionCounts(post.id);
              
              return {
                newsId: post.id,
                title: post.title,
                description: post.content.length > 150 ? `${post.content.substring(0, 150)}...` : post.content,
                timestamp: formatDistanceToNow(new Date(post.created_at), { addSuffix: true }),
                likes: reactionCounts.like || 0,
                comments: comments.length,
                category: post.category || undefined,
                imageUrl: post.image_url || undefined,
              };
            } catch (error) {
              console.error(`Error loading post ${post.id}:`, error);
              return {
                newsId: post.id,
                title: post.title,
                description: post.content.length > 150 ? `${post.content.substring(0, 150)}...` : post.content,
                timestamp: formatDistanceToNow(new Date(post.created_at), { addSuffix: true }),
                likes: 0,
                comments: 0,
                category: post.category || undefined,
                imageUrl: post.image_url || undefined,
              };
            }
          })
        );
        
        setNewsItems(itemsWithDetails);
      } catch (error) {
        console.error("Error fetching news:", error);
        setNewsItems([]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchNews();
  }, []);

  return (
    <div className="animate-fade-in" style={{ animationDelay: "0.3s" }}>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-foreground text-glow flex items-center gap-2">
          📰 Team News
          {newsItems.length > 0 && (
            <Badge className="bg-accent text-accent-foreground">NEW</Badge>
          )}
        </h2>
      </div>
      
      {isLoading ? (
        <div className="flex items-center justify-center py-8">
          <Loader2 className="w-6 h-6 animate-spin text-primary" />
        </div>
      ) : newsItems.length === 0 ? (
        <div className="text-center py-8 text-muted-foreground">
          <p>No news posts yet. Check back later!</p>
        </div>
      ) : (
        <div className="space-y-4">
          {newsItems.map((item) => (
            <NewsItem key={item.newsId} {...item} />
          ))}
        </div>
      )}
    </div>
  );
};
