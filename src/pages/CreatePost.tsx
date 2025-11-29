import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { newsApi } from "@/lib/api";
import { useAuth } from "@/contexts/AuthContext";
import { Loader2, Image as ImageIcon, X, ArrowLeft } from "lucide-react";
import { ProtectedRoute } from "@/components/ProtectedRoute";

const CreatePost = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [category, setCategory] = useState<string | undefined>(undefined);
  const [image, setImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [imageInfo, setImageInfo] = useState<string>("");
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const categories = [
    { value: "Team Life", label: "Team Life" },
    { value: "Funny", label: "Funny" },
    { value: "Achievement", label: "Achievement" },
    { value: "Social", label: "Social" },
    { value: "News", label: "News" },
  ];

  // Check if user is admin
  if (!user || user.role !== "admin") {
    return (
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <Card className="p-8 text-center">
          <h1 className="text-2xl font-bold mb-4">Access Denied</h1>
          <p className="text-muted-foreground mb-6">
            Only administrators can create news posts.
          </p>
          <Button onClick={() => navigate("/news")} variant="outline">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to News
          </Button>
        </Card>
      </div>
    );
  }

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Check file size (max 10MB)
      const maxSize = 10 * 1024 * 1024; // 10MB
      if (file.size > maxSize) {
        toast({
          title: "Image too large",
          description: "Please select an image smaller than 10MB",
          variant: "destructive",
        });
        return;
      }

      setImage(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
        
        // Get image dimensions for info display
        const img = new Image();
        img.onload = () => {
          const sizeMB = (file.size / (1024 * 1024)).toFixed(2);
          setImageInfo(`${img.width}x${img.height}px • ${sizeMB}MB`);
        };
        img.src = reader.result as string;
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRemoveImage = () => {
    setImage(null);
    setImagePreview(null);
    setImageInfo("");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!title.trim() || !content.trim()) {
      toast({
        title: "Validation Error",
        description: "Title and content are required",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);

    try {
      const formData = new FormData();
      formData.append("title", title);
      formData.append("content", content);
      // Append category if selected
      if (category) {
        formData.append("category", category);
      }
      if (image) {
        formData.append("image", image);
      }

      await newsApi.create(formData);
      
      toast({
        title: "Success!",
        description: "Post created successfully",
      });

      // Navigate back to news page
      navigate("/news");
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to create post",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <Button
        variant="outline"
        onClick={() => navigate("/news")}
        className="mb-6 border-primary/30 hover:border-primary/50 hover:bg-primary/10"
      >
        <ArrowLeft className="w-4 h-4 mr-2" />
        Back to News
      </Button>

      <Card className="p-8 bg-gradient-to-br from-card to-card/50 border-border/50">
        <h1 className="text-4xl font-bold mb-2">Create News Post</h1>
        <p className="text-muted-foreground mb-8">
          Share the latest updates and news with the team
        </p>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="title">Title *</Label>
            <Input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Enter post title..."
              className="bg-muted/50 border-border/50"
              disabled={isLoading}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="content">Content *</Label>
            <Textarea
              id="content"
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Write your post content..."
              className="bg-muted/50 border-border/50 min-h-[200px]"
              disabled={isLoading}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="category">Category (Optional)</Label>
            <Select 
              value={category} 
              onValueChange={(value) => {
                console.log("Category changed to:", value);
                setCategory(value);
              }} 
              disabled={isLoading}
            >
              <SelectTrigger className="bg-muted/50 border-border/50">
                <SelectValue placeholder="Select a category..." />
              </SelectTrigger>
              <SelectContent>
                {categories.map((cat) => (
                  <SelectItem key={cat.value} value={cat.value}>
                    {cat.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {category && (
              <p className="text-xs text-muted-foreground mt-1">
                Selected: <span className="font-semibold text-primary">{category}</span>
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="image">Image (Optional)</Label>
            <p className="text-xs text-muted-foreground mb-2">
              Accepts any resolution. Max file size: 10MB. High-resolution images are supported.
            </p>
            {imagePreview ? (
              <div className="relative">
                <img
                  src={imagePreview}
                  alt="Preview"
                  className="w-full h-64 object-cover rounded-lg border border-border/50"
                />
                <Button
                  type="button"
                  variant="destructive"
                  size="icon"
                  className="absolute top-2 right-2"
                  onClick={handleRemoveImage}
                  disabled={isLoading}
                >
                  <X className="w-4 h-4" />
                </Button>
                {imageInfo && (
                  <div className="absolute bottom-2 left-2 bg-black/70 text-white text-xs px-2 py-1 rounded">
                    {imageInfo}
                  </div>
                )}
              </div>
            ) : (
              <div>
                <input
                  type="file"
                  id="image"
                  accept="image/*"
                  onChange={handleImageSelect}
                  className="hidden"
                  disabled={isLoading}
                />
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => document.getElementById("image")?.click()}
                  className="w-full"
                  disabled={isLoading}
                >
                  <ImageIcon className="w-4 h-4 mr-2" />
                  Choose Image
                </Button>
              </div>
            )}
          </div>

          <div className="flex gap-3 justify-end pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => navigate("/news")}
              disabled={isLoading}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading} className="bg-primary hover:bg-primary/90">
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Creating...
                </>
              ) : (
                "Create Post"
              )}
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
};

// Wrap with ProtectedRoute and admin check
const CreatePostProtected = () => {
  return (
    <ProtectedRoute>
      <CreatePost />
    </ProtectedRoute>
  );
};

export default CreatePostProtected;

