import { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Card } from "@/components/ui/card";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Heart, MessageCircle, ArrowLeft, Send, Loader2, Trash2, Plus } from "lucide-react";
import { newsApi, commentApi, reactionApi, userApi, type NewsPost as ApiNewsPost, type Comment as ApiComment, API_BASE_URL } from "@/lib/api";
import { useAuth } from "@/contexts/AuthContext";
import { formatDistanceToNow } from "date-fns";

interface CommentWithAuthor extends ApiComment {
  author_name?: string;
  author_photo?: string;
}

interface NewsPostWithDetails extends ApiNewsPost {
  author_name?: string;
  author_photo?: string;
  comments: CommentWithAuthor[];
  reaction_counts: { [key: string]: number };
  user_reactions: string[];
  category?: string | null;
}

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

const News = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [posts, setPosts] = useState<NewsPostWithDetails[]>([]);
  const [selectedPost, setSelectedPost] = useState<NewsPostWithDetails | null>(null);
  const [commentText, setCommentText] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmittingComment, setIsSubmittingComment] = useState(false);
  const [isTogglingReaction, setIsTogglingReaction] = useState<number | null>(null);
  const [deletingCommentId, setDeletingCommentId] = useState<number | null>(null);
  const [deletingPostId, setDeletingPostId] = useState<number | null>(null);
  const [likedPosts, setLikedPosts] = useState<number[]>([]);

  const fetchPosts = async () => {
    try {
      setIsLoading(true);
      const apiPosts = await newsApi.getAll();
      
      if (!apiPosts || apiPosts.length === 0) {
        setPosts([]);
        setIsLoading(false);
        return;
      }
      
      // Show posts immediately with minimal data for better UX
      const minimalPosts = apiPosts.map(post => ({
        ...post,
        category: post.category || null, // Preserve category
        author_name: `User ${post.author_id}`,
        author_photo: undefined,
        comments: [],
        reaction_counts: {},
        user_reactions: [],
      }));
      setPosts(minimalPosts);
      
      // Fetch author info and reactions for each post
      const postsWithDetails = await Promise.allSettled(
        apiPosts.map(async (post) => {
          try {
            // Get author info
            let author_name = "Unknown";
            let author_photo = undefined;
            try {
              const author = await userApi.getUser(post.author_id);
              author_name = author.full_name || author.username || "Unknown";
              author_photo = author.photo_url || undefined;
            } catch (err) {
              console.error(`Error fetching author for post ${post.id}:`, err);
            }
            
            // Get comments
            let commentsWithAuthors: CommentWithAuthor[] = [];
            try {
              const comments = await commentApi.getNewsComments(post.id);
              commentsWithAuthors = await Promise.allSettled(
                comments.map(async (comment) => {
                  try {
                    const commentAuthor = await userApi.getUser(comment.author_id);
                    return {
                      ...comment,
                      author_name: commentAuthor.full_name || commentAuthor.username,
                      author_photo: commentAuthor.photo_url || undefined,
                    };
                  } catch {
                    return {
                      ...comment,
                      author_name: "Unknown",
                      author_photo: undefined,
                    };
                  }
                })
              ).then(results => 
                results
                  .filter((r): r is PromiseFulfilledResult<CommentWithAuthor> => r.status === 'fulfilled')
                  .map(r => r.value)
              );
            } catch (err) {
              console.error(`Error fetching comments for post ${post.id}:`, err);
            }
            
            // Get reaction counts
            let reactionCounts: { [key: string]: number } = {};
            try {
              reactionCounts = await reactionApi.getNewsReactionCounts(post.id);
            } catch (err) {
              console.error(`Error fetching reactions for post ${post.id}:`, err);
            }
            
            // Get user reactions if logged in
            let userReactions: string[] = [];
            if (user) {
              try {
                const userReactionsData = await reactionApi.getUserReactionsForNews(post.id, user.id);
                userReactions = userReactionsData.reactions;
              } catch {
                // User not reacted yet - this is fine
              }
            }
            
            return {
              ...post,
              author_name,
              author_photo,
              comments: commentsWithAuthors,
              reaction_counts: reactionCounts,
              user_reactions: userReactions,
            };
          } catch (error) {
            console.error(`Error loading post ${post.id}:`, error);
            return {
              ...post,
              category: post.category || null, // Preserve category
              author_name: "Unknown",
              author_photo: undefined,
              comments: [],
              reaction_counts: {},
              user_reactions: [],
            };
          }
        })
      );
      
      // Extract successful results
      const successfulPosts = postsWithDetails
        .filter((result): result is PromiseFulfilledResult<NewsPostWithDetails> => result.status === 'fulfilled')
        .map(result => result.value);
      
      // Update posts with full details
      if (successfulPosts.length > 0) {
        setPosts(successfulPosts);
      }
      
      // If navigating from a link, select that post
      if (location.state && (location.state as any).postId) {
        const postId = (location.state as any).postId;
        const post = successfulPosts.find((p) => p.id === postId);
        if (post) {
          setSelectedPost(post);
        }
      }
    } catch (error) {
      console.error("Error fetching posts:", error);
      setPosts([]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchPosts();
    window.scrollTo(0, 0);
  }, [user]);

  useEffect(() => {
    if (location.state && (location.state as any).postId && posts.length > 0) {
      const postId = (location.state as any).postId;
      const post = posts.find((p) => p.id === postId);
      if (post) {
        setSelectedPost(post);
      }
    }
  }, [location, posts]);

  const handlePostClick = (post: NewsPostWithDetails) => {
    setSelectedPost(post);
  };

  const handleBackToFeed = () => {
    setSelectedPost(null);
  };

  const handleAddComment = async () => {
    if (!commentText.trim() || !selectedPost || !user) return;

    setIsSubmittingComment(true);
    try {
      const newComment = await commentApi.create({
        content: commentText.trim(),
        news_id: selectedPost.id,
      });

      // Get author info for the new comment
      const commentAuthor = await userApi.getUser(newComment.author_id);
      const commentWithAuthor: CommentWithAuthor = {
        ...newComment,
        author_name: commentAuthor.full_name || commentAuthor.username,
        author_photo: commentAuthor.photo_url || undefined,
      };

      // Update selected post
      setSelectedPost({
        ...selectedPost,
        comments: [...selectedPost.comments, commentWithAuthor],
      });

      // Update posts list
      setPosts((prev) =>
        prev.map((post) =>
          post.id === selectedPost.id
            ? { ...post, comments: [...post.comments, commentWithAuthor] }
            : post
        )
      );

      setCommentText("");
    } catch (error) {
      console.error("Error adding comment:", error);
    } finally {
      setIsSubmittingComment(false);
    }
  };

  const toggleLike = (postId: number) => {
    setLikedPosts(prev =>
      prev.includes(postId)
        ? prev.filter(item => item !== postId)
        : [...prev, postId]
    );
  };

  const handleReaction = async (postId: number, type: string) => {
    if (!user) return;

    // Get current post to check if already liked
    const currentPost = selectedPost?.id === postId ? selectedPost : posts.find(p => p.id === postId);
    const wasLiked = currentPost?.user_reactions?.includes("like") || false;
    const currentLikeCount = currentPost?.reaction_counts?.like || 0;

    // Optimistically update UI immediately
    const newLikeCount = wasLiked ? Math.max(0, currentLikeCount - 1) : currentLikeCount + 1;
    
    // Update selected post if it's the one being liked
    if (selectedPost && selectedPost.id === postId) {
      setSelectedPost({
        ...selectedPost,
        user_reactions: wasLiked 
          ? selectedPost.user_reactions.filter(r => r !== "like")
          : [...selectedPost.user_reactions, "like"],
        reaction_counts: {
          ...selectedPost.reaction_counts,
          like: newLikeCount,
        },
      });
    }

    // Update posts list
    setPosts(prev => prev.map(post => 
      post.id === postId
        ? {
            ...post,
            user_reactions: wasLiked 
              ? post.user_reactions.filter(r => r !== "like")
              : [...post.user_reactions, "like"],
            reaction_counts: {
              ...post.reaction_counts,
              like: newLikeCount,
            },
          }
        : post
    ));

    // Add animation - always trigger animation on click
    // Add to animation state to trigger animation
    setLikedPosts(prev => {
      if (!prev.includes(postId)) {
        return [...prev, postId];
      }
      return prev;
    });
    // Remove from animation state after animation completes (600ms)
    setTimeout(() => {
      setLikedPosts(prev => prev.filter(id => id !== postId));
    }, 600);

    setIsTogglingReaction(postId);
    try {
      await reactionApi.toggle({
        type,
        news_id: postId,
      });

      // Don't refresh all posts - just update the specific post's reaction count from API
      // The optimistic update already handled the UI
      try {
        const updatedReactionCounts = await reactionApi.getNewsReactionCounts(postId);
        const updatedUserReactions = user ? await reactionApi.getUserReactionsForNews(postId, user.id).then(r => r.reactions).catch(() => []) : [];
        
        // Update only the reaction counts without full refresh
        if (selectedPost && selectedPost.id === postId) {
          setSelectedPost({
            ...selectedPost,
            reaction_counts: updatedReactionCounts,
            user_reactions: updatedUserReactions,
          });
        }
        setPosts(prev => prev.map(post => 
          post.id === postId
            ? {
                ...post,
                reaction_counts: updatedReactionCounts,
                user_reactions: updatedUserReactions,
              }
            : post
        ));
      } catch (err) {
        console.error("Error fetching updated reactions:", err);
      }
    } catch (error) {
      console.error("Error toggling reaction:", error);
      // Revert optimistic update on error
      if (selectedPost && selectedPost.id === postId) {
        setSelectedPost({
          ...selectedPost,
          user_reactions: wasLiked 
            ? [...selectedPost.user_reactions, "like"]
            : selectedPost.user_reactions.filter(r => r !== "like"),
          reaction_counts: {
            ...selectedPost.reaction_counts,
            like: currentLikeCount,
          },
        });
      }
      setPosts(prev => prev.map(post => 
        post.id === postId
          ? {
              ...post,
              user_reactions: wasLiked 
                ? [...post.user_reactions, "like"]
                : post.user_reactions.filter(r => r !== "like"),
              reaction_counts: {
                ...post.reaction_counts,
                like: currentLikeCount,
              },
            }
          : post
      ));
    } finally {
      setIsTogglingReaction(null);
    }
  };

  const handleDeletePost = async (postId: number) => {
    console.log("handleDeletePost called", { postId, userRole: user?.role });
    if (!user || user.role !== "admin") {
      console.log("User is not admin or not logged in");
      return;
    }

    if (!confirm("Are you sure you want to delete this post? This action cannot be undone.")) {
      return;
    }

    setDeletingPostId(postId);
    try {
      console.log("Calling newsApi.delete", postId);
      await newsApi.delete(postId);
      console.log("Post deleted successfully");
      
      // Remove post from list
      setPosts((prev) => prev.filter((post) => post.id !== postId));
      
      // If deleted post was selected, go back to feed
      if (selectedPost && selectedPost.id === postId) {
        setSelectedPost(null);
      }
    } catch (error) {
      console.error("Error deleting post:", error);
      alert("Failed to delete post. Please try again.");
    } finally {
      setDeletingPostId(null);
    }
  };

  const handleDeleteComment = async (commentId: number) => {
    console.log("handleDeleteComment called", { commentId, userId: user?.id, userRole: user?.role });
    if (!user) {
      console.log("User not logged in");
      return;
    }
    
    setDeletingCommentId(commentId);
    try {
      console.log("Calling commentApi.delete", commentId);
      await commentApi.delete(commentId);
      console.log("Comment deleted successfully");
      
      // Update selected post
      if (selectedPost) {
        setSelectedPost({
          ...selectedPost,
          comments: selectedPost.comments.filter(c => c.id !== commentId),
        });
      }
      
      // Update posts list
      setPosts((prev) =>
        prev.map((post) =>
          post.id === selectedPost?.id
            ? { ...post, comments: post.comments.filter(c => c.id !== commentId) }
            : post
        )
      );
    } catch (error) {
      console.error("Error deleting comment:", error);
      const errorMessage = error instanceof Error ? error.message : "Failed to delete comment. Please try again.";
      alert(errorMessage);
    } finally {
      setDeletingCommentId(null);
    }
  };

  const formatTime = (dateString: string) => {
    try {
      return formatDistanceToNow(new Date(dateString), { addSuffix: true });
    } catch {
      return "Recently";
    }
  };

  const getImageUrl = (imageUrl: string | null) => {
    if (!imageUrl) return null;
    if (imageUrl.startsWith("http")) return imageUrl;
    return `${API_BASE_URL}${imageUrl}`;
  };

  // Full Article View
  if (selectedPost) {
    const hasLiked = (selectedPost.user_reactions && Array.isArray(selectedPost.user_reactions) && selectedPost.user_reactions.includes("like")) || false;
    const isAnimating = likedPosts.includes(selectedPost.id);

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
          {selectedPost.image_url && (
            <div className="w-full h-96 overflow-hidden">
              <img
                src={getImageUrl(selectedPost.image_url) || ""}
                alt={selectedPost.title}
                className="w-full h-full object-cover"
              />
            </div>
          )}

          <div className="p-8">
            {/* Article Header */}
            <div className="mb-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  {selectedPost.category && (
                    <Badge className={getCategoryColor(selectedPost.category)}>
                      {selectedPost.category}
                    </Badge>
                  )}
                  <span className="text-sm text-muted-foreground">
                    {formatTime(selectedPost.created_at)}
                  </span>
                </div>
                {user?.role === "admin" && (
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      handleDeletePost(selectedPost.id);
                    }}
                    disabled={deletingPostId === selectedPost.id}
                    className="gap-2"
                  >
                    {deletingPostId === selectedPost.id ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        Deleting...
                      </>
                    ) : (
                      <>
                        <Trash2 className="w-4 h-4" />
                        Delete Post
                      </>
                    )}
                  </Button>
                )}
              </div>
              <h1 className="text-4xl font-bold mb-4">{selectedPost.title}</h1>
              <div className="flex items-center gap-3">
                <Avatar className="w-12 h-12 border-2 border-border">
                  {selectedPost.author_photo ? (
                    <AvatarImage
                      src={getImageUrl(selectedPost.author_photo) || ""}
                      alt={selectedPost.author_name}
                    />
                  ) : (
                    <AvatarFallback className="bg-muted text-sm">
                      {selectedPost.author_name
                        ?.split(" ")
                        .map((n) => n[0])
                        .join("") || "A"}
                    </AvatarFallback>
                  )}
                </Avatar>
                <div>
                  <p className="font-semibold">{selectedPost.author_name}</p>
                  <p className="text-xs text-muted-foreground">Author</p>
                </div>
              </div>
            </div>

            {/* Article Content */}
            <div className="prose prose-invert max-w-none mb-8">
              {selectedPost.content.split("\n").map((paragraph, index) => {
                if (!paragraph.trim()) return null;
                return (
                  <p key={index} className="text-foreground leading-relaxed mb-4">
                    {paragraph}
                  </p>
                );
              })}
            </div>

            {/* Reactions */}
            <div className="flex items-center gap-4 pb-6 border-b border-border/50">
              <button
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  handleReaction(selectedPost.id, "like");
                }}
                disabled={isTogglingReaction === selectedPost.id || !user}
                className={`flex items-center gap-2 transition-all ${
                  hasLiked
                    ? "text-primary"
                    : "text-muted-foreground hover:text-primary"
                }`}
              >
                <Heart
                  className={`w-5 h-5 transition-all ${
                    hasLiked ? "fill-primary" : ""
                  } ${isAnimating ? "animate-like-pop" : ""}`}
                />
                <span className="text-sm font-medium">
                  {selectedPost.reaction_counts.like || 0}
                </span>
              </button>
              <div className="flex items-center gap-2 text-muted-foreground">
                <MessageCircle className="w-5 h-5" />
                <span className="text-sm font-medium">
                  {selectedPost.comments.length}
                </span>
              </div>
            </div>

            {/* Comments Section */}
            <div className="mt-8">
              <h2 className="text-2xl font-bold mb-6">
                Comments ({selectedPost.comments.length})
              </h2>

              {/* Comment Input */}
              {user && (
                <div className="flex gap-3 mb-8">
                  <Avatar className="w-10 h-10 border-2 border-border">
                    {user.photo_url ? (
                      <AvatarImage
                        src={getImageUrl(user.photo_url) || ""}
                        alt={user.full_name || user.username}
                      />
                    ) : (
                      <AvatarFallback className="bg-muted text-sm">
                        {(user.full_name || user.username)
                          ?.split(" ")
                          .map((n) => n[0])
                          .join("") || "U"}
                      </AvatarFallback>
                    )}
                  </Avatar>
                  <div className="flex-1 flex gap-2">
                    <Input
                      placeholder="Write a comment..."
                      value={commentText}
                      onChange={(e) => setCommentText(e.target.value)}
                      onKeyPress={(e) =>
                        e.key === "Enter" && !isSubmittingComment && handleAddComment()
                      }
                      className="bg-muted/50 border-border/50 focus:border-primary/50"
                      disabled={isSubmittingComment}
                    />
                    <Button
                      onClick={handleAddComment}
                      size="icon"
                      disabled={isSubmittingComment}
                      className="bg-primary/20 hover:bg-primary/30 text-primary border border-primary/30"
                    >
                      {isSubmittingComment ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        <Send className="w-4 h-4" />
                      )}
                    </Button>
                  </div>
                </div>
              )}

              {/* Comments List */}
              <div className="space-y-6">
                {selectedPost.comments.map((comment) => {
                  const canDelete = user && (user.role === "admin" || user.id === comment.author_id);
                  
                  return (
                    <div key={comment.id} className="flex gap-3">
                      <Avatar className="w-10 h-10 border-2 border-border">
                        {comment.author_photo ? (
                          <AvatarImage
                            src={getImageUrl(comment.author_photo) || ""}
                            alt={comment.author_name}
                          />
                        ) : (
                          <AvatarFallback className="bg-muted text-sm">
                            {comment.author_name
                              ?.split(" ")
                              .map((n) => n[0])
                              .join("") || "U"}
                          </AvatarFallback>
                        )}
                      </Avatar>
                      <div className="flex-1">
                        <div className="bg-muted/30 rounded-lg p-4 border border-border/30">
                          <div className="flex items-center justify-between mb-2">
                            <div className="flex items-center gap-2">
                              <p className="font-semibold text-sm">
                                {comment.author_name}
                              </p>
                              <span className="text-xs text-muted-foreground">
                                {formatTime(comment.created_at)}
                              </span>
                            </div>
                            {canDelete && (
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-6 w-6 text-muted-foreground hover:text-destructive"
                                onClick={(e) => {
                                  e.preventDefault();
                                  e.stopPropagation();
                                  handleDeleteComment(comment.id);
                                }}
                                disabled={deletingCommentId === comment.id}
                              >
                                {deletingCommentId === comment.id ? (
                                  <Loader2 className="w-3 h-3 animate-spin" />
                                ) : (
                                  <Trash2 className="w-3 h-3" />
                                )}
                              </Button>
                            )}
                          </div>
                          <p className="text-foreground text-sm leading-relaxed">
                            {comment.content}
                          </p>
                        </div>
                      </div>
                    </div>
                  );
                })}
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
  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <div className="flex items-center justify-center min-h-[400px]">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <div className="space-y-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-4xl font-bold mb-2">Team News Feed</h1>
            <p className="text-muted-foreground">
              Stay updated with the latest happenings, laughs, and moments from
              the team 🎉
            </p>
          </div>
          {/* Show Create Post button for admins only */}
          {user?.role === "admin" && (
            <Button
              onClick={() => navigate("/news/create")}
              className="bg-primary hover:bg-primary/90 text-primary-foreground shadow-lg hover:shadow-xl transition-all"
              size="lg"
            >
              <Plus className="w-5 h-5 mr-2" />
              Create Post
            </Button>
          )}
        </div>

        {/* Refresh Button */}
        <div className="flex justify-end mb-4">
          <Button
            variant="outline"
            size="sm"
            onClick={fetchPosts}
            disabled={isLoading}
            className="gap-2"
          >
            <Loader2 className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        </div>

        {/* News Feed */}
        {posts.length === 0 && !isLoading ? (
          <div className="text-center py-12">
            <p className="text-muted-foreground mb-4">No posts yet. Check back later!</p>
            {user?.role === "admin" && (
              <p className="text-sm text-muted-foreground">
                As an admin, you can create the first post using the "Create Post" button above.
              </p>
            )}
          </div>
        ) : (
          <div className="space-y-6">
            {posts.map((post) => {
              const hasLiked = (post.user_reactions && Array.isArray(post.user_reactions) && post.user_reactions.includes("like")) || false;
              const isAnimating = likedPosts.includes(post.id);

              return (
                <Card
                  key={post.id}
                  onClick={() => handlePostClick(post)}
                  className="p-6 bg-gradient-to-br from-card to-card/50 border-border/50 hover:border-primary/30 transition-all duration-300 animate-fade-in cursor-pointer group"
                >
                  {/* Post Header */}
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <Avatar className="w-12 h-12 border-2 border-border">
                        {post.author_photo ? (
                          <AvatarImage
                            src={getImageUrl(post.author_photo) || ""}
                            alt={post.author_name}
                          />
                        ) : (
                          <AvatarFallback className="bg-muted text-sm">
                            {post.author_name
                              ?.split(" ")
                              .map((n) => n[0])
                              .join("") || "A"}
                          </AvatarFallback>
                        )}
                      </Avatar>
                      <div>
                        <p className="font-semibold">{post.author_name}</p>
                        <div className="flex items-center gap-2">
                          <p className="text-xs text-muted-foreground">
                            {formatTime(post.created_at)}
                          </p>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {post.category && (
                        <Badge className={`${getCategoryColor(post.category)} text-xs`}>
                          {post.category}
                        </Badge>
                      )}
                      {user?.role === "admin" && (
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            handleDeletePost(post.id);
                          }}
                          disabled={deletingPostId === post.id}
                          className="h-8 w-8 text-muted-foreground hover:text-destructive"
                        >
                          {deletingPostId === post.id ? (
                            <Loader2 className="w-4 h-4 animate-spin" />
                          ) : (
                            <Trash2 className="w-4 h-4" />
                          )}
                        </Button>
                      )}
                    </div>
                  </div>

                  {/* Post Title */}
                  <h3 className="text-xl font-bold mb-2 group-hover:text-primary transition-colors">
                    {post.title}
                  </h3>

                  {/* Post Content Preview */}
                  <p className="text-muted-foreground mb-4 leading-relaxed line-clamp-3">
                    {post.content.length > 200 ? `${post.content.substring(0, 200)}...` : post.content}
                  </p>

                  {/* Post Image */}
                  {post.image_url && (
                    <div className="mb-4 rounded-lg overflow-hidden">
                      <img
                        src={getImageUrl(post.image_url) || ""}
                        alt="Post"
                        className="w-full h-64 object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                    </div>
                  )}

                  {/* Post Actions */}
                  <div className="flex items-center gap-6 pt-4 border-t border-border/50">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleReaction(post.id, "like");
                      }}
                      disabled={!user || isTogglingReaction === post.id}
                      className={`flex items-center gap-2 transition-all ${
                        hasLiked
                          ? "text-primary"
                          : "text-muted-foreground hover:text-primary"
                      }`}
                    >
                      <Heart
                        className={`w-5 h-5 transition-all ${
                          hasLiked ? "fill-primary" : ""
                        } ${isAnimating ? "animate-like-pop" : ""}`}
                      />
                      <span className="text-sm font-medium">
                        {post.reaction_counts.like || 0}
                      </span>
                    </button>
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <MessageCircle className="w-5 h-5" />
                      <span className="text-sm font-medium">
                        {post.comments.length}
                      </span>
                    </div>
                  </div>
                </Card>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default News;
