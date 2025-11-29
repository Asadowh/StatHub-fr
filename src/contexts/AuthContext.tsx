import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { authApi, userApi, getToken, removeToken, type User } from '@/lib/api';

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (credential: string, password: string) => Promise<{ success: boolean; error?: string }>;
  signup: (formData: FormData) => Promise<{ success: boolean; error?: string }>;
  logout: () => void;
  resetPassword: (email: string) => Promise<{ success: boolean; error?: string }>;
  changePassword: (currentPassword: string, newPassword: string) => Promise<{ success: boolean; error?: string }>;
  resendVerificationEmail: () => Promise<void>;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Check for existing session on mount
  useEffect(() => {
    const initAuth = async () => {
      const token = getToken();
      if (token) {
        try {
          const userData = await userApi.getMe();
          setUser(userData);
        } catch (error) {
          // Token invalid or expired
          removeToken();
        }
      }
      setIsLoading(false);
    };

    initAuth();
  }, []);

  const refreshUser = async () => {
    try {
      const userData = await userApi.getMe();
      setUser(userData);
    } catch (error) {
      setUser(null);
      removeToken();
    }
  };

  const login = async (credential: string, password: string) => {
    try {
      await authApi.login(credential, password);
      const userData = await userApi.getMe();
      setUser(userData);
      return { success: true };
    } catch (error) {
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Login failed' 
      };
    }
  };

  const signup = async (formData: FormData) => {
    try {
      await authApi.register(formData);
      const userData = await userApi.getMe();
      setUser(userData);
      return { success: true };
    } catch (error) {
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Signup failed' 
      };
    }
  };

  const logout = () => {
    authApi.logout();
    setUser(null);
  };

  const resetPassword = async (email: string) => {
    try {
      await authApi.forgotPassword(email);
      return { success: true };
    } catch (error) {
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Reset password failed' 
      };
    }
  };

  const changePassword = async (currentPassword: string, newPassword: string) => {
    try {
      await authApi.changePassword(currentPassword, newPassword);
      // Logout user after password change to force re-login
      logout();
      return { success: true };
    } catch (error) {
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Failed to change password' 
      };
    }
  };

  const resendVerificationEmail = async () => {
    await authApi.resendVerificationEmail();
    // Refresh user data after resending
    await refreshUser();
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        isLoading,
        login,
        signup,
        logout,
        resetPassword,
        changePassword,
        resendVerificationEmail,
        refreshUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
