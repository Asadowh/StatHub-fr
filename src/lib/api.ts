// API Client for StatHub Backend

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

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

  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...options,
    headers,
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ detail: 'Request failed' }));
    throw new Error(error.detail || 'Request failed');
  }

  return response.json();
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
      body: JSON.stringify(email),
    });
  },

  async resetPassword(token: string, newPassword: string) {
    return apiFetch('/auth/reset-password', {
      method: 'POST',
      body: JSON.stringify({ token, new_password: newPassword }),
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
  xp: number;
  level: number;
  points?: number;  // Kept for backward compatibility
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
  author_id: number;
  created_at: string;
}

export const newsApi = {
  async getAll(): Promise<NewsPost[]> {
    return apiFetch<NewsPost[]>('/news/');
  },

  async create(data: { title: string; content: string }): Promise<NewsPost> {
    return apiFetch<NewsPost>('/news/', {
      method: 'POST',
      body: JSON.stringify(data),
    });
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

