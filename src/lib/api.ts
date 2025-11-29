// API Client for StatHub Backend

export const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

// Token management
const getToken = () => localStorage.getItem('stathub_token');
const setToken = (token: string) => localStorage.setItem('stathub_token', token);
const removeToken = () => localStorage.removeItem('stathub_token');

// Base fetch with auth
async function apiFetch<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const token = getToken();
  
  const headers: HeadersInit = {
    ...options.headers,
  };

  // Add auth header if token exists (don't add Content-Type for FormData)
  if (token) {
    (headers as Record<string, string>)['Authorization'] = `Bearer ${token}`;
  }
  
  // Add Content-Type for JSON (but not for FormData)
  if (!(options.body instanceof FormData)) {
    (headers as Record<string, string>)['Content-Type'] = 'application/json';
  }

  try {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      ...options,
      headers,
    });

    if (!response.ok) {
      let errorMessage = 'Request failed';
      try {
        const error = await response.json();
        errorMessage = error.detail || error.message || JSON.stringify(error);
      } catch {
        // If response is not JSON, try to get text
        try {
          const text = await response.text();
          errorMessage = text || `HTTP ${response.status}: ${response.statusText}`;
        } catch {
          errorMessage = `HTTP ${response.status}: ${response.statusText}`;
        }
      }
      throw new Error(errorMessage);
    }

    // Handle empty responses (e.g., DELETE requests with 204 No Content)
    if (response.status === 204 || response.headers.get('content-length') === '0') {
      return undefined as T;
    }

    // Try to parse JSON, but handle empty responses gracefully
    const text = await response.text();
    if (!text) {
      return undefined as T;
    }
    
    try {
      return JSON.parse(text) as T;
    } catch {
      return undefined as T;
    }
  } catch (error) {
    // Handle network errors (backend not running, CORS, etc.)
    if (error instanceof TypeError && error.message.includes('fetch')) {
      throw new Error('Failed to connect to server. Please make sure the backend is running on http://localhost:8000');
    }
    // Re-throw other errors
    throw error;
  }
}

// ============================================
// AUTH API
// ============================================
export const authApi = {
  async login(credential: string, password: string) {
    const response = await apiFetch<{ access_token: string; token_type: string }>(
      '/auth/login',
      {
        method: 'POST',
        body: JSON.stringify({ credential, password }),
      }
    );
    setToken(response.access_token);
    return response;
  },

  async register(formData: FormData) {
    const response = await fetch(`${API_BASE_URL}/auth/register`, {
      method: 'POST',
      body: formData,
    });
    
    if (!response.ok) {
      const error = await response.json().catch(() => ({ detail: 'Registration failed' }));
      throw new Error(error.detail || 'Registration failed');
    }
    
    const data = await response.json();
    setToken(data.access_token);
    return data;
  },

  async forgotPassword(email: string) {
    return apiFetch('/auth/forgot-password', {
      method: 'POST',
      body: JSON.stringify({ email }),
    });
  },

  async validateResetCode(email: string, code: string) {
    return apiFetch<{ message: string; valid: boolean }>('/auth/validate-reset-code', {
      method: 'POST',
      body: JSON.stringify({ email, code }),
    });
  },

  async resetPassword(email: string, code: string, newPassword: string) {
    return apiFetch('/auth/reset-password', {
      method: 'POST',
      body: JSON.stringify({ email, code, new_password: newPassword }),
    });
  },

  async changePassword(currentPassword: string, newPassword: string): Promise<void> {
    return apiFetch<void>('/auth/change-password', {
      method: 'POST',
      body: JSON.stringify({ 
        current_password: currentPassword, 
        new_password: newPassword 
      }),
    });
  },

  async resendVerificationEmail(): Promise<void> {
    return apiFetch<void>('/auth/resend-verification', {
      method: 'POST',
    });
  },

  async verifyEmail(code: string): Promise<void> {
    return apiFetch<void>('/auth/verify-email', {
      method: 'POST',
      body: JSON.stringify({ code }),
    });
  },

  logout() {
    removeToken();
  },

  isAuthenticated() {
    return !!getToken();
  },
};

// ============================================
// USER API
// ============================================
export interface User {
  id: number;
  username: string;
  email: string;
  full_name: string | null;
  photo_url: string | null;
  height: number | null;
  jersey_number: number | null;
  nationality: string | null;
  birth_date: string | null;
  favorite_position: string | null;
  personal_quote: string | null;
  role: string;
  is_active: boolean;
  is_email_verified: boolean;
  xp: number;
  level: number;
  created_at: string;
}

export interface XPInfo {
  current_xp: number;
  level: number;
  level_name: string;
  level_color: string;
  xp_in_level: number;
  xp_for_next_level: number | null;
  progress_percent: number;
}

export interface UserStats {
  user_id: number;
  matches_played: number;
  total_goals: number;
  total_assists: number;
  avg_rating: number;
  trophy_count: number;
  achievements_unlocked: number;
}

export const userApi = {
  async getMe(): Promise<User> {
    return apiFetch<User>('/users/me');
  },

  async updateMe(data: Partial<User>): Promise<User> {
    return apiFetch<User>('/users/me', {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  },

  async uploadPhoto(file: File): Promise<User> {
    const formData = new FormData();
    formData.append('photo', file);
    
    const token = getToken();
    const response = await fetch(`${API_BASE_URL}/users/me/photo`, {
      method: 'POST',
      headers: token ? { 'Authorization': `Bearer ${token}` } : {},
      body: formData,
    });
    
    if (!response.ok) {
      const error = await response.json().catch(() => ({ detail: 'Photo upload failed' }));
      throw new Error(error.detail || 'Photo upload failed');
    }
    
    return response.json();
  },

  async getUser(userId: number) {
    return apiFetch(`/users/${userId}`);
  },

  async getUserStats(userId: number): Promise<UserStats> {
    return apiFetch<UserStats>(`/users/${userId}/stats`);
  },

  async getMyStats(): Promise<UserStats> {
    const user = await this.getMe();
    return this.getUserStats(user.id);
  },

  async getMyXPInfo(): Promise<XPInfo> {
    return apiFetch<XPInfo>('/users/me/xp');
  },

  async getUserXPInfo(userId: number): Promise<XPInfo> {
    return apiFetch<XPInfo>(`/users/${userId}/xp`);
  },
};

// ============================================
// MATCHES API
// ============================================
export interface Match {
  id: number;
  home_team: string;
  away_team: string;
  home_score: number;
  away_score: number;
  match_date: string;
  winner_team: string | null;
  home_avg_rating: number | null;
  away_avg_rating: number | null;
}

export interface UserMatch extends Match {
  player_goals: number;
  player_assists: number;
  player_rating: number;
}

export const matchApi = {
  async getAll(): Promise<Match[]> {
    return apiFetch<Match[]>('/matches/');
  },

  async getMatch(matchId: number): Promise<Match> {
    return apiFetch<Match>(`/matches/${matchId}`);
  },

  async getUserMatches(userId: number): Promise<UserMatch[]> {
    return apiFetch<UserMatch[]>(`/matches/user/${userId}`);
  },

  async getMyMatches(): Promise<UserMatch[]> {
    return apiFetch<UserMatch[]>('/matches/me/history');
  },

  async create(data: Omit<Match, 'id' | 'winner_team'>): Promise<Match> {
    return apiFetch<Match>('/matches/', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },
};

// ============================================
// LEADERBOARD API
// ============================================
export interface LeaderboardPlayer {
  rank: number;
  user_id: number;
  username: string;
  full_name: string | null;
  photo_url: string | null;
  nationality: string | null;
  position: string | null;
  total_goals: number;
  total_assists: number;
  avg_rating: number;
  matches_played: number;
  trophy_count?: number;
  achievement_count?: number;
  xp?: number;
  level?: number;
  points?: number;  // Kept for backward compatibility
  combined?: number;  // Goals + Assists
}

export const leaderboardApi = {
  // StatHub Ranking Leaderboard (by XP)
  async getLeaderboard(limit = 50): Promise<LeaderboardPlayer[]> {
    return apiFetch<LeaderboardPlayer[]>(`/leaderboard/?limit=${limit}`);
  },

  async getUserRank(userId: number): Promise<LeaderboardPlayer> {
    return apiFetch<LeaderboardPlayer>(`/leaderboard/user/${userId}`);
  },

  // Achievements Leaderboard
  async getAchievementsLeaderboard(limit = 50): Promise<LeaderboardPlayer[]> {
    return apiFetch<LeaderboardPlayer[]>(`/leaderboard/achievements?limit=${limit}`);
  },

  async getUserAchievementRank(userId: number): Promise<LeaderboardPlayer> {
    return apiFetch<LeaderboardPlayer>(`/leaderboard/achievements/user/${userId}`);
  },

  // Trophies Leaderboard
  async getTrophiesLeaderboard(limit = 50): Promise<LeaderboardPlayer[]> {
    return apiFetch<LeaderboardPlayer[]>(`/leaderboard/trophies?limit=${limit}`);
  },

  async getUserTrophyRank(userId: number): Promise<LeaderboardPlayer> {
    return apiFetch<LeaderboardPlayer>(`/leaderboard/trophies/user/${userId}`);
  },

  // StatHub Ranking (by rating, goals, assists, or combined)
  async getStatHubRanking(sortBy: "rating" | "goals" | "assists" | "combined" = "rating", limit = 50): Promise<LeaderboardPlayer[]> {
    return apiFetch<LeaderboardPlayer[]>(`/leaderboard/stathub-ranking?sort_by=${sortBy}&limit=${limit}`);
  },
};

// ============================================
// ACHIEVEMENTS API
// ============================================
export interface Achievement {
  id: number;
  name: string;
  description: string;
  tier: string;
  points: number;
  target_value: number;
  current_value: number;
  unlocked: boolean;
  unlocked_at: string | null;
}

export const achievementApi = {
  async getAll(): Promise<Achievement[]> {
    return apiFetch<Achievement[]>('/achievements/');
  },

  async getUserAchievements(userId: number): Promise<Achievement[]> {
    return apiFetch<Achievement[]>(`/achievements/user/${userId}`);
  },

  async getMyAchievements(): Promise<Achievement[]> {
    return apiFetch<Achievement[]>('/achievements/me');
  },
};

// ============================================
// TROPHIES API
// ============================================
export interface Trophy {
  id: number;
  name: string;
  description: string | null;
  awarded_to: number;
  date_awarded: string;
}

export const trophyApi = {
  async getUserTrophies(userId: number): Promise<Trophy[]> {
    return apiFetch<Trophy[]>(`/trophies/user/${userId}`);
  },
};

// ============================================
// NEWS API
// ============================================
export interface NewsPost {
  id: number;
  title: string;
  content: string;
  image_url: string | null;
  author_id: number;
  created_at: string;
  category?: string | null;
}

export const newsApi = {
  async getAll(): Promise<NewsPost[]> {
    return apiFetch<NewsPost[]>('/news/');
  },

  async create(formData: FormData): Promise<NewsPost> {
    const token = getToken();
    const response = await fetch(`${API_BASE_URL}/news/`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
      body: formData,
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ detail: 'Failed to create post' }));
      throw new Error(error.detail || 'Failed to create post');
    }

    return response.json();
  },

  async delete(postId: number): Promise<void> {
    return apiFetch<void>(`/news/${postId}`, {
      method: 'DELETE',
    });
  },
};

// ============================================
// COMMENTS API
// ============================================
export interface Comment {
  id: number;
  content: string;
  author_id: number;
  news_id: number | null;
  match_id: number | null;
  created_at: string;
}

export const commentApi = {
  async getNewsComments(newsId: number): Promise<Comment[]> {
    return apiFetch<Comment[]>(`/comments/news/${newsId}`);
  },

  async create(data: { content: string; news_id?: number; match_id?: number }): Promise<Comment> {
    return apiFetch<Comment>('/comments/', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  async delete(commentId: number): Promise<void> {
    return apiFetch<void>(`/comments/${commentId}`, {
      method: 'DELETE',
    });
  },
};

// ============================================
// REACTIONS API
// ============================================
export interface Reaction {
  id: number;
  type: string;
  user_id: number;
  news_id: number | null;
  comment_id: number | null;
  match_id: number | null;
  created_at: string;
}

export interface ReactionCounts {
  [type: string]: number;
}

export const reactionApi = {
  async toggle(data: { type: string; news_id?: number; comment_id?: number; match_id?: number }): Promise<{ reaction: Reaction | null; action: 'added' | 'removed' }> {
    return apiFetch<{ reaction: Reaction | null; action: 'added' | 'removed' }>('/reactions/', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  async getNewsReactionCounts(newsId: number): Promise<ReactionCounts> {
    return apiFetch<ReactionCounts>(`/reactions/news/${newsId}/counts`);
  },

  async getUserReactionsForNews(newsId: number, userId: number): Promise<{ reactions: string[] }> {
    return apiFetch<{ reactions: string[] }>(`/reactions/news/${newsId}/user/${userId}`);
  },
};

// ============================================
// DASHBOARD API
// ============================================
export interface DashboardData {
  user_id: number;
  total_goals: number;
  trophies: number;
}

export const dashboardApi = {
  async getData(): Promise<DashboardData> {
    return apiFetch<DashboardData>('/dashboard/');
  },
};

// ============================================
// SEARCH API
// ============================================
export const searchApi = {
  async search(query: string) {
    return apiFetch(`/search/?q=${encodeURIComponent(query)}`);
  },
};

// ============================================
// STATS API
// ============================================
export interface RecentPerformance {
  id: number;
  match_id: number;
  home_team: string;
  away_team: string;
  home_score: number;
  away_score: number;
  match_date: string;
  rating: number;
  goals: number;
  assists: number;
  player_team: "home" | "away";
  player_result: "W" | "L" | "D";
}

export interface MatchPlayer {
  id: number;
  username: string;
  full_name: string | null;
  photo_url: string | null;
  jersey_number: number;
  favorite_position: string | null;
  nationality: string | null;
  goals: number;
  assists: number;
  rating: number;
}

export interface MatchPlayersResponse {
  home_players: MatchPlayer[];
  away_players: MatchPlayer[];
}

export const statApi = {
  async getMyRecentPerformances(limit = 3): Promise<RecentPerformance[]> {
    return apiFetch<RecentPerformance[]>(`/stats/me/recent?limit=${limit}`);
  },

  async getUserRecentPerformances(userId: number, limit = 3): Promise<RecentPerformance[]> {
    return apiFetch<RecentPerformance[]>(`/stats/user/${userId}/recent?limit=${limit}`);
  },

  async getMatchPlayers(matchId: number): Promise<MatchPlayersResponse> {
    return apiFetch<MatchPlayersResponse>(`/stats/match/${matchId}/players`);
  },

  async create(data: { match_id: number; player_id: number; team: string; goals: number; assists: number; rating: number }) {
    return apiFetch('/stats/', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },
};

// Export token utilities for AuthContext
export { getToken, setToken, removeToken };

