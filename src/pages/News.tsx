import { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import { Card } from "@/components/ui/card";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Heart, MessageCircle, Laugh, ArrowLeft, Send, Flame, ThumbsUp, Loader2 } from "lucide-react";
import concertPic from "@/assets/concert-pic.jpg";
import ronaldoAvatar from "@/assets/ronaldo-avatar.png";

interface Comment {
  id: number;
  author: string;
  avatar?: string;
  timestamp: string;
  text: string;
}

interface NewsPost {
  id: number;
  author: string;
  avatar?: string;
  timestamp: string;
  title: string;
  content: string;
  fullContent: string;
  image?: string;
  likes: number;
  comments: number;
  laughs: number;
  fires: number;
  category: string;
  postComments: Comment[];
}

const newsPosts: NewsPost[] = [
  {
    id: 1,
    author: "Ali Rahman",
    timestamp: "2 hours ago",
    title: "Epic Hat Trick Celebration Fail",
    content: "Ali scored a hat trick and then tripped over the ball during celebration 🏆😂",
    fullContent: "In what can only be described as the most Ali moment ever, our star striker scored an incredible hat trick in today's match, completely dominating the opposition with three brilliant goals.\n\nHowever, the celebration that followed will go down in team history for all the wrong reasons. In his excitement, Ali attempted an elaborate celebration involving a backflip and a victory slide. Unfortunately, he forgot about the very ball that made him a hero and tripped spectacularly, landing face-first on the pitch.\n\nThe entire stadium erupted in laughter, including his own teammates. Even the opposition couldn't help but crack up. Despite the embarrassing moment, Ali took it in stride, laughing along with everyone else.\n\n'At least I scored the goals first,' Ali said with a grin in the post-match interview. 'The celebration can use some work, but the finishing is on point!'\n\nClassic Ali. Never change, buddy! 🏆😂",
    likes: 24,
    comments: 8,
    laughs: 15,
    fires: 5,
    category: "Funny",
    postComments: [
      { id: 1, author: "Sami Ali", avatar: ronaldoAvatar, timestamp: "1 hour ago", text: "Hahaha I caught it on video! Sending it to the group chat 😂" },
      { id: 2, author: "Team Coach", timestamp: "1 hour ago", text: "Focus on scoring, leave celebrations to the pros 😅" }
    ]
  },
  {
    id: 2,
    author: "Team Coach",
    timestamp: "5 hours ago",
    title: "The Great Water Bottle Incident",
    content: "Coach forgot the water bottles again 💧😅 We had to share one bottle between 11 players.",
    fullContent: "Today's training session started with a classic coach moment - I completely forgot to bring the water bottles. Again.\n\nPicture this: 11 sweaty players, one tiny water bottle, and 90 minutes of intense drills under the hot sun. The guys weren't happy, and honestly, I don't blame them.\n\nWe had to implement a strict rationing system. Each player got exactly one sip per water break. Sami kept trying to sneak extra sips when he thought I wasn't looking. Spoiler alert: I was looking.\n\nThe funniest part? By the end of training, the team was more united than ever. Nothing brings a squad together like shared suffering and dehydration. They've now created a WhatsApp group called 'Never Forget Hydration Day' with the sole purpose of reminding me to bring water.\n\nLesson learned: hydration is key, and my memory... not so much. Tomorrow I'm setting three alarms labeled 'WATER BOTTLES' just to be safe.\n\nSorry boys, I promise it won't happen again... probably. 💧😅",
    likes: 31,
    comments: 12,
    laughs: 22,
    fires: 3,
    category: "Team Life",
    postComments: [
      { id: 1, author: "Rashad Huseynov", timestamp: "4 hours ago", text: "We literally had to share like it was the last water on Earth 😂" },
      { id: 2, author: "Parviz Mammadov", timestamp: "3 hours ago", text: "I'm buying you a reminder watch coach 😅" }
    ]
  },
  {
    id: 3,
    author: "Parviz Mammadov",
    timestamp: "1 day ago",
    title: "Clean Sheet Celebration!",
    content: "Parviz finally got a clean sheet after 9 matches 🧤👏 The drought is over!",
    fullContent: "After 9 long matches of conceding goals, saving shots, and questioning my life choices, I FINALLY got my clean sheet! 🧤\n\nThis has been the longest drought of my goalkeeping career. Nine matches. NINE! Every game, something would go wrong. A deflection here, a penalty there, sometimes just pure bad luck.\n\nBut today was different. Today, everything clicked. Every save felt natural, every positioning was perfect, and my defense actually showed up (thanks guys!).\n\nThe moment the final whistle blew, I literally dropped to my knees. The relief was overwhelming. My teammates rushed over and piled on top of me - pretty sure I lost some air in my lungs, but it was totally worth it.\n\nCoach said I played like a wall today. The opposition had 8 shots on target and I saved every single one. From diving saves to quick reflexes, everything worked perfectly.\n\nThis clean sheet is dedicated to everyone who believed in me during the rough patch. The drought is officially over, and I'm hungrier than ever for more.\n\nLet's keep this momentum going! 🔥🧤",
    likes: 45,
    comments: 15,
    laughs: 8,
    fires: 31,
    category: "Achievement",
    postComments: [
      { id: 1, author: "Sami Ali", avatar: ronaldoAvatar, timestamp: "20 hours ago", text: "Beast mode activated! Those saves were insane 🔥" },
      { id: 2, author: "Ali Rahman", timestamp: "18 hours ago", text: "Finally! I can trust my defense again 😂" },
      { id: 3, author: "Team Coach", timestamp: "16 hours ago", text: "Proud of you! Keep it up champ 👏" }
    ]
  },
  {
    id: 4,
    author: "Sami Ali",
    avatar: ronaldoAvatar,
    timestamp: "2 days ago",
    title: "Concert Night Success",
    content: "Got a girl's number at the concert last night 🎸😂 Who says football players can't have game?",
    fullContent: "So last night was legendary. The boys and I hit up this rock concert downtown, and let me tell you - it was an absolute vibe.\n\nThe band was incredible, the crowd was hyped, and somewhere between the guitar solo and the encore, I managed to shoot my shot with this amazing girl who was dancing near our group.\n\nNow, I know what you're thinking - 'Sami, you're better at football than flirting.' And normally, you'd be right. But last night? Last night I had my A-game on.\n\nWe started talking about the band, then about music in general, and before I knew it, we'd been chatting for half an hour. She thought it was hilarious when I told her I'm a footballer (apparently I don't look like one? Still not sure if that's a compliment).\n\nLong story short - I got her number! The boys are calling me the 'Concert Casanova' now, which is both embarrassing and kind of awesome.\n\nWho says football players can't have game off the field? Sometimes you just gotta take the shot - whether it's at goal or at a concert. 🎸😎\n\nP.S. - Already planning our first date. Wish me luck, team!",
    image: concertPic,
    likes: 67,
    comments: 23,
    laughs: 34,
    fires: 45,
    category: "Social",
    postComments: [
      { id: 1, author: "Ali Rahman", timestamp: "1 day ago", text: "The Concert Casanova! I can't 😂😂😂" },
      { id: 2, author: "Rashad Huseynov", timestamp: "1 day ago", text: "Teach me your ways master 🙏" },
      { id: 3, author: "Team Captain", timestamp: "1 day ago", text: "Just don't miss practice for the date! 😅" }
    ]
  },
  {
    id: 5,
    author: "Rashad Huseynov",
    timestamp: "3 days ago",
    title: "The Slipper Incident",
    content: "Rashad showed up to practice in slippers because he 'forgot' it was training day 🩴😂",
    fullContent: "Okay, so I may have made a tiny mistake this week. A very visible, very embarrassing mistake.\n\nI showed up to Tuesday training... in slippers. Not even nice slippers. We're talking full-on bathroom slippers with questionable stains.\n\nIn my defense, I genuinely forgot it was training day! I thought we had the day off and was planning to just chill at home. When coach called asking where I was, I panicked and rushed over without thinking.\n\nThe moment I stepped onto the pitch, everyone just stopped and stared. Complete silence. Then the laughter erupted. Coach couldn't even be mad - he was laughing too hard.\n\n'Rashad, are you going to the beach or to practice?' he asked between laughs. Fair question, honestly.\n\nI had to borrow someone's extra sneakers (thanks Parviz!), which were two sizes too small. Spent the entire session looking like a clown with cramped feet.\n\nThe guys have been roasting me non-stop. Someone even created a meme with my face photoshopped onto a beach vacation ad. It's their group chat profile picture now.\n\nLesson learned: always check the training schedule. And maybe invest in a calendar. Fashion icon or just lazy? I'll let you decide. 🩴😂",
    likes: 38,
    comments: 11,
    laughs: 28,
    fires: 7,
    category: "Funny",
    postComments: [
      { id: 1, author: "Parviz Mammadov", timestamp: "2 days ago", text: "My shoes are still recovering from your giant feet 😂" },
      { id: 2, author: "Sami Ali", avatar: ronaldoAvatar, timestamp: "2 days ago", text: "The meme is GOLD! Never living this down bro" }
    ]
  },
  {
    id: 6,
    author: "Team Captain",
    timestamp: "4 days ago",
    title: "Karaoke Night Chaos",
    content: "Post-game team dinner turned into a karaoke competition. Goalkeeper can't sing but gets 10/10 for effort 🎤😅",
    fullContent: "What started as a simple post-game team dinner at our favorite restaurant somehow evolved into the most chaotic karaoke night of the year.\n\nEverything was normal at first. We ordered food, celebrated the win, shared some laughs. Then someone spotted the karaoke machine in the corner and said, 'We should do one song.'\n\nOne song turned into three hours of non-stop entertainment.\n\nThe highlight? Our goalkeeper Parviz attempting to sing 'Bohemian Rhapsody.' And when I say 'attempting,' I'm being extremely generous. The man cannot hold a note to save his life. He was completely off-key, missed every high note, and at one point I think he invented a new language.\n\nBut you know what? His energy was INCREDIBLE. He gave it his absolute all, complete with dramatic hand gestures and air guitar solos. The restaurant staff was dying laughing. Other diners were recording. It was legendary.\n\nBy the end of the night, we had performed everything from classic rock to pop hits. Sami did a surprisingly good job with some Ed Sheeran song (hidden talent alert!). Ali rap-battled Rashad and lost spectacularly.\n\nThe restaurant manager finally had to kick us out at midnight because we were getting too loud. Worth it.\n\n10/10 would karaoke with this team again. Parviz, please never stop singing. Never change, boys! 🎤😅",
    likes: 52,
    comments: 19,
    laughs: 41,
    fires: 18,
    category: "Team Life",
    postComments: [
      { id: 1, author: "Parviz Mammadov", timestamp: "3 days ago", text: "I WAS ROBBED! My performance was Oscar-worthy 🎭" },
      { id: 2, author: "Sami Ali", avatar: ronaldoAvatar, timestamp: "3 days ago", text: "Bro you sounded like a dying cat 😂😂😂" },
      { id: 3, author: "Ali Rahman", timestamp: "3 days ago", text: "Best night ever! Same time next week? 🎤" }
    ]
  },
];

const ITEMS_PER_PAGE = 4;

const News = () => {
  const location = useLocation();
  const [selectedPost, setSelectedPost] = useState<NewsPost | null>(null);
  const [commentText, setCommentText] = useState("");
  const [localPosts, setLocalPosts] = useState(newsPosts);
  const [reactions, setReactions] = useState<{ [key: number]: { liked: boolean; laughed: boolean; fired: boolean } }>({});
  const [displayedCount, setDisplayedCount] = useState(ITEMS_PER_PAGE);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (location.state && (location.state as any).postId) {
      const postId = (location.state as any).postId;
      const post = newsPosts.find(p => p.id === postId);
      if (post) {
        setSelectedPost(post);
      }
    }
    // Always scroll to top when navigating to News page
    window.scrollTo(0, 0);
  }, [location]);

  const displayedPosts = localPosts.slice(0, displayedCount);
  const hasMore = displayedCount < localPosts.length;

  const loadMore = () => {
    setIsLoading(true);
    setTimeout(() => {
      setDisplayedCount(prev => Math.min(prev + ITEMS_PER_PAGE, localPosts.length));
      setIsLoading(false);
    }, 500);
  };

  const getCategoryColor = (category: string) => {
    switch(category) {
      case "Funny": return "bg-yellow-500/20 text-yellow-500 border-yellow-500/30";
      case "Achievement": return "bg-primary/20 text-primary border-primary/30";
      case "Social": return "bg-purple-500/20 text-purple-500 border-purple-500/30";
      case "Team Life": return "bg-blue-500/20 text-blue-500 border-blue-500/30";
      default: return "";
    }
  };

  const handlePostClick = (post: NewsPost) => {
    setSelectedPost(post);
  };

  const handleBackToFeed = () => {
    setSelectedPost(null);
  };

  const handleAddComment = () => {
    if (!commentText.trim() || !selectedPost) return;

    const newComment: Comment = {
      id: selectedPost.postComments.length + 1,
      author: "You",
      timestamp: "Just now",
      text: commentText.trim()
    };

    const updatedPosts = localPosts.map(post => 
      post.id === selectedPost.id 
        ? { ...post, postComments: [...post.postComments, newComment], comments: post.comments + 1 }
        : post
    );

    setLocalPosts(updatedPosts);
    setSelectedPost({ ...selectedPost, postComments: [...selectedPost.postComments, newComment], comments: selectedPost.comments + 1 });
    setCommentText("");
  };

  const handleReaction = (postId: number, type: 'like' | 'laugh' | 'fire') => {
    setReactions(prev => ({
      ...prev,
      [postId]: {
        ...prev[postId],
        liked: type === 'like' ? !prev[postId]?.liked : prev[postId]?.liked || false,
        laughed: type === 'laugh' ? !prev[postId]?.laughed : prev[postId]?.laughed || false,
        fired: type === 'fire' ? !prev[postId]?.fired : prev[postId]?.fired || false,
      }
    }));

    setLocalPosts(prev => prev.map(post => {
      if (post.id === postId) {
        if (type === 'like') return { ...post, likes: post.likes + (reactions[postId]?.liked ? -1 : 1) };
        if (type === 'laugh') return { ...post, laughs: post.laughs + (reactions[postId]?.laughed ? -1 : 1) };
        if (type === 'fire') return { ...post, fires: post.fires + (reactions[postId]?.fired ? -1 : 1) };
      }
      return post;
    }));
  };

  // Full Article View
  if (selectedPost) {
    return (
      <div className="container mx-auto px-4 py-8 max-w-4xl animate-fade-in">
        <Button
          variant="outline"
          onClick={handleBackToFeed}
          className="mb-6 border-primary/30 hover:border-primary/50 hover:bg-primary/10"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to News Feed
        </Button>

        <Card className="overflow-hidden bg-gradient-to-br from-card to-card/50 border-border/50">
          {/* Article Cover Image */}
          {selectedPost.image && (
            <div className="w-full h-96 overflow-hidden">
              <img 
                src={selectedPost.image} 
                alt={selectedPost.title}
                className="w-full h-full object-cover"
              />
            </div>
          )}

          <div className="p-8">
            {/* Article Header */}
            <div className="mb-6">
              <div className="flex items-center gap-3 mb-4">
                <Badge className={getCategoryColor(selectedPost.category)}>
                  {selectedPost.category}
                </Badge>
                <span className="text-sm text-muted-foreground">{selectedPost.timestamp}</span>
              </div>
              <h1 className="text-4xl font-bold mb-4">{selectedPost.title}</h1>
              <div className="flex items-center gap-3">
                <Avatar className="w-12 h-12 border-2 border-border">
                  {selectedPost.avatar ? (
                    <AvatarImage src={selectedPost.avatar} alt={selectedPost.author} />
                  ) : (
                    <AvatarFallback className="bg-muted text-sm">
                      {selectedPost.author.split(" ").map(n => n[0]).join("")}
                    </AvatarFallback>
                  )}
                </Avatar>
                <div>
                  <p className="font-semibold">{selectedPost.author}</p>
                  <p className="text-xs text-muted-foreground">Author</p>
                </div>
              </div>
            </div>

            {/* Article Content */}
            <div className="prose prose-invert max-w-none mb-8">
              {selectedPost.fullContent.split('\n\n').map((paragraph, index) => (
                <p key={index} className="text-foreground leading-relaxed mb-4">
                  {paragraph}
                </p>
              ))}
            </div>

            {/* Reactions */}
            <div className="flex items-center gap-4 pb-6 border-b border-border/50">
              <button
                onClick={() => handleReaction(selectedPost.id, 'like')}
                className={`flex items-center gap-2 transition-colors ${
                  reactions[selectedPost.id]?.liked
                    ? "text-primary"
                    : "text-muted-foreground hover:text-primary"
                }`}
              >
                <Heart className={`w-5 h-5 ${reactions[selectedPost.id]?.liked ? "fill-primary" : ""}`} />
                <span className="text-sm font-medium">{selectedPost.likes}</span>
              </button>
              <button
                onClick={() => handleReaction(selectedPost.id, 'laugh')}
                className={`flex items-center gap-2 transition-colors ${
                  reactions[selectedPost.id]?.laughed
                    ? "text-yellow-500"
                    : "text-muted-foreground hover:text-yellow-500"
                }`}
              >
                <Laugh className="w-5 h-5" />
                <span className="text-sm font-medium">{selectedPost.laughs}</span>
              </button>
              <button
                onClick={() => handleReaction(selectedPost.id, 'fire')}
                className={`flex items-center gap-2 transition-colors ${
                  reactions[selectedPost.id]?.fired
                    ? "text-orange-500"
                    : "text-muted-foreground hover:text-orange-500"
                }`}
              >
                <Flame className="w-5 h-5" />
                <span className="text-sm font-medium">{selectedPost.fires}</span>
              </button>
              <div className="flex items-center gap-2 text-muted-foreground">
                <MessageCircle className="w-5 h-5" />
                <span className="text-sm font-medium">{selectedPost.comments}</span>
              </div>
            </div>

            {/* Comments Section */}
            <div className="mt-8">
              <h2 className="text-2xl font-bold mb-6">Comments ({selectedPost.postComments.length})</h2>
              
              {/* Comment Input */}
              <div className="flex gap-3 mb-8">
                <Avatar className="w-10 h-10 border-2 border-border">
                  <AvatarFallback className="bg-muted text-sm">You</AvatarFallback>
                </Avatar>
                <div className="flex-1 flex gap-2">
                  <Input
                    placeholder="Write a comment..."
                    value={commentText}
                    onChange={(e) => setCommentText(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && handleAddComment()}
                    className="bg-muted/50 border-border/50 focus:border-primary/50"
                  />
                  <Button
                    onClick={handleAddComment}
                    size="icon"
                    className="bg-primary/20 hover:bg-primary/30 text-primary border border-primary/30"
                  >
                    <Send className="w-4 h-4" />
                  </Button>
                </div>
              </div>

              {/* Comments List */}
              <div className="space-y-6">
                {selectedPost.postComments.map((comment) => (
                  <div key={comment.id} className="flex gap-3">
                    <Avatar className="w-10 h-10 border-2 border-border">
                      {comment.avatar ? (
                        <AvatarImage src={comment.avatar} alt={comment.author} />
                      ) : (
                        <AvatarFallback className="bg-muted text-sm">
                          {comment.author.split(" ").map(n => n[0]).join("")}
                        </AvatarFallback>
                      )}
                    </Avatar>
                    <div className="flex-1">
                      <div className="bg-muted/30 rounded-lg p-4 border border-border/30">
                        <div className="flex items-center gap-2 mb-2">
                          <p className="font-semibold text-sm">{comment.author}</p>
                          <span className="text-xs text-muted-foreground">{comment.timestamp}</span>
                        </div>
                        <p className="text-foreground text-sm leading-relaxed">{comment.text}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </Card>

        <Button
          variant="outline"
          onClick={handleBackToFeed}
          className="mt-6 w-full border-primary/30 hover:border-primary/50 hover:bg-primary/10"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to News Feed
        </Button>
      </div>
    );
  }

  // News Feed View
  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <div className="space-y-8">
        {/* Header */}
        <div className="text-center space-y-2">
          <h1 className="text-4xl font-bold mb-2">Team News Feed</h1>
          <p className="text-muted-foreground">
            Stay updated with the latest happenings, laughs, and moments from the team 🎉
          </p>
        </div>

        {/* News Feed */}
        <div className="space-y-6">
          {displayedPosts.map((post) => (
            <Card
              key={post.id}
              onClick={() => handlePostClick(post)}
              className="p-6 bg-gradient-to-br from-card to-card/50 border-border/50 hover:border-primary/30 transition-all duration-300 animate-fade-in cursor-pointer group"
            >
              {/* Post Header */}
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <Avatar className="w-12 h-12 border-2 border-border">
                    {post.avatar ? (
                      <AvatarImage src={post.avatar} alt={post.author} />
                    ) : (
                      <AvatarFallback className="bg-muted text-sm">
                        {post.author.split(" ").map(n => n[0]).join("")}
                      </AvatarFallback>
                    )}
                  </Avatar>
                  <div>
                    <p className="font-semibold">{post.author}</p>
                    <p className="text-xs text-muted-foreground">{post.timestamp}</p>
                  </div>
                </div>
                <Badge className={getCategoryColor(post.category)}>
                  {post.category}
                </Badge>
              </div>

              {/* Post Title */}
              <h3 className="text-xl font-bold mb-2 group-hover:text-primary transition-colors">{post.title}</h3>

              {/* Post Content Preview */}
              <p className="text-muted-foreground mb-4 leading-relaxed">{post.content}</p>

              {/* Post Image */}
              {post.image && (
                <div className="mb-4 rounded-lg overflow-hidden">
                  <img 
                    src={post.image} 
                    alt="Post" 
                    className="w-full h-64 object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                </div>
              )}

              {/* Post Actions */}
              <div className="flex items-center gap-6 pt-4 border-t border-border/50">
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Heart className="w-5 h-5" />
                  <span className="text-sm font-medium">{post.likes}</span>
                </div>
                <div className="flex items-center gap-2 text-muted-foreground">
                  <MessageCircle className="w-5 h-5" />
                  <span className="text-sm font-medium">{post.comments}</span>
                </div>
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Laugh className="w-5 h-5" />
                  <span className="text-sm font-medium">{post.laughs}</span>
                </div>
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Flame className="w-5 h-5" />
                  <span className="text-sm font-medium">{post.fires}</span>
                </div>
              </div>
            </Card>
          ))}
        </div>

        {/* Load More / End Message */}
        {hasMore ? (
          <div className="text-center">
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
                `Load More Posts (${localPosts.length - displayedCount} remaining)`
              )}
            </Button>
          </div>
        ) : (
          <div className="text-center">
            <p className="text-sm text-muted-foreground">End of list reached</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default News;
