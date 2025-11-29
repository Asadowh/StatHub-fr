import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./contexts/AuthContext";
import { ProtectedRoute } from "./components/ProtectedRoute";
import Index from "./pages/Index";
import Achievements from "./pages/Achievements";
import Leaderboard from "./pages/Leaderboard";
import AchievementsLeaderboard from "./pages/AchievementsLeaderboard";
import Trophies from "./pages/Trophies";
import Matches from "./pages/Matches";
import Profile from "./pages/Profile";
import News from "./pages/News";
import CreatePost from "./pages/CreatePost";
import Settings from "./pages/Settings";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import ForgotPassword from "./pages/ForgotPassword";
import VerifyEmail from "./pages/VerifyEmail";
import StatHubRanking from "./pages/StatHubRanking";
import NotFound from "./pages/NotFound";
import { Navigation } from "./components/Navigation";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <AuthProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Navigation />
          <Routes>
            {/* Public routes */}
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<Signup />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />
            <Route path="/verify-email" element={<ProtectedRoute><VerifyEmail /></ProtectedRoute>} />
            
            {/* Protected routes */}
            <Route path="/" element={<ProtectedRoute><Index /></ProtectedRoute>} />
            <Route path="/achievements" element={<ProtectedRoute><Achievements /></ProtectedRoute>} />
            <Route path="/leaderboard" element={<ProtectedRoute><Leaderboard /></ProtectedRoute>} />
            <Route path="/achievements-leaderboard" element={<ProtectedRoute><AchievementsLeaderboard /></ProtectedRoute>} />
            <Route path="/trophies" element={<ProtectedRoute><Trophies /></ProtectedRoute>} />
            <Route path="/matches" element={<ProtectedRoute><Matches /></ProtectedRoute>} />
            <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
            <Route path="/news" element={<ProtectedRoute><News /></ProtectedRoute>} />
            <Route path="/news/create" element={<CreatePost />} />
            <Route path="/stathub-ranking" element={<ProtectedRoute><StatHubRanking /></ProtectedRoute>} />
            <Route path="/settings" element={<ProtectedRoute><Settings /></ProtectedRoute>} />
            
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
