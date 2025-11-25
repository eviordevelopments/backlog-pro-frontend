import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { supabase } from "@/integrations/supabase/client";
import { User as SupabaseUser } from "@supabase/supabase-js";

// User interface matching design document
export interface User {
  id: string;
  email: string;
  name: string;
  createdAt: string;
}

// Session interface for localStorage
interface Session {
  user: User;
  accessToken: string;
  expiresAt: number;
}

// Error types for better error handling
export enum AuthErrorCode {
  INVALID_CREDENTIALS = "AUTH_INVALID_CREDENTIALS",
  NETWORK_ERROR = "AUTH_NETWORK_ERROR",
  SESSION_EXPIRED = "AUTH_SESSION_EXPIRED",
  EMAIL_EXISTS = "AUTH_EMAIL_EXISTS",
  VALIDATION_ERROR = "AUTH_VALIDATION_ERROR",
  UNKNOWN_ERROR = "AUTH_UNKNOWN_ERROR",
}

export interface AuthError {
  code: AuthErrorCode;
  message: string;
  retryable: boolean;
}

// AuthContext interface
export interface AuthContextType {
  user: User | null;
  loading: boolean;
  error: AuthError | null;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string, name: string) => Promise<void>;
  logout: () => Promise<void>;
  clearError: () => void;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<AuthError | null>(null);

  // Helper function to create user-friendly error messages
  const createAuthError = (error: unknown): AuthError => {
    if (error instanceof Error) {
      const message = error.message.toLowerCase();
      
      // Network errors
      if (message.includes("fetch") || message.includes("network") || message.includes("connection")) {
        return {
          code: AuthErrorCode.NETWORK_ERROR,
          message: "Unable to connect. Please check your internet connection and try again.",
          retryable: true,
        };
      }
      
      // Invalid credentials
      if (message.includes("invalid") || message.includes("incorrect") || message.includes("wrong")) {
        return {
          code: AuthErrorCode.INVALID_CREDENTIALS,
          message: "Invalid email or password. Please try again.",
          retryable: false,
        };
      }
      
      // Email already exists
      if (message.includes("already registered") || message.includes("already exists")) {
        return {
          code: AuthErrorCode.EMAIL_EXISTS,
          message: "An account with this email already exists. Please sign in instead.",
          retryable: false,
        };
      }
      
      // Session expired
      if (message.includes("expired") || message.includes("token")) {
        return {
          code: AuthErrorCode.SESSION_EXPIRED,
          message: "Your session has expired. Please log in again.",
          retryable: false,
        };
      }
      
      // Validation errors
      if (message.includes("validation") || message.includes("invalid email") || message.includes("password")) {
        return {
          code: AuthErrorCode.VALIDATION_ERROR,
          message: error.message,
          retryable: false,
        };
      }
      
      // Return the original error message if we can't categorize it
      return {
        code: AuthErrorCode.UNKNOWN_ERROR,
        message: error.message,
        retryable: false,
      };
    }
    
    // Unknown error type
    return {
      code: AuthErrorCode.UNKNOWN_ERROR,
      message: "An unexpected error occurred. Please try again.",
      retryable: true,
    };
  };

  const clearError = () => setError(null);

  // Session restoration on app load (Requirement 2.2, 2.5)
  useEffect(() => {
    const restoreSession = async () => {
      try {
        clearError(); // Clear any previous errors
        
        // Check localStorage for existing session
        const sessionData = localStorage.getItem("auth_session");
        
        if (sessionData) {
          const session: Session = JSON.parse(sessionData);
          
          // Validate session token expiration
          if (session.expiresAt > Date.now()) {
            // Session is valid, restore user state
            setUser(session.user);
          } else {
            // Session expired, clear it and set error
            localStorage.removeItem("auth_session");
            setUser(null);
            setError({
              code: AuthErrorCode.SESSION_EXPIRED,
              message: "Your session has expired. Please log in again.",
              retryable: false,
            });
          }
        }
        
        // Also check Supabase session
        const { data: { session: supabaseSession }, error: sessionError } = await supabase.auth.getSession();
        
        if (sessionError) {
          throw sessionError;
        }
        
        if (supabaseSession?.user) {
          // Restore from Supabase session
          const restoredUser: User = {
            id: supabaseSession.user.id,
            email: supabaseSession.user.email || "",
            name: supabaseSession.user.user_metadata?.name || supabaseSession.user.email?.split("@")[0] || "User",
            createdAt: supabaseSession.user.created_at || new Date().toISOString(),
          };
          
          setUser(restoredUser);
          
          // Update localStorage session
          const newSession: Session = {
            user: restoredUser,
            accessToken: supabaseSession.access_token,
            expiresAt: supabaseSession.expires_at ? supabaseSession.expires_at * 1000 : Date.now() + 3600000,
          };
          localStorage.setItem("auth_session", JSON.stringify(newSession));
        }
      } catch (error) {
        console.error("Error restoring session:", error);
        localStorage.removeItem("auth_session");
        setUser(null);
        
        // Set appropriate error for session restoration failure
        const authError = createAuthError(error);
        setError(authError);
      } finally {
        setLoading(false);
      }
    };

    restoreSession();
  }, []);

  // Login function (Requirements 1.1, 1.2, 1.4)
  const login = async (email: string, password: string): Promise<void> => {
    try {
      setLoading(true);
      clearError(); // Clear any previous errors
      
      // Call Supabase signInWithPassword
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        throw new Error(error.message);
      }

      if (!data.user || !data.session) {
        throw new Error("Authentication failed");
      }

      // Create user object
      const authenticatedUser: User = {
        id: data.user.id,
        email: data.user.email || "",
        name: data.user.user_metadata?.name || data.user.email?.split("@")[0] || "User",
        createdAt: data.user.created_at || new Date().toISOString(),
      };

      // Store session data in localStorage (Requirement 2.1)
      const session: Session = {
        user: authenticatedUser,
        accessToken: data.session.access_token,
        expiresAt: data.session.expires_at ? data.session.expires_at * 1000 : Date.now() + 3600000,
      };
      localStorage.setItem("auth_session", JSON.stringify(session));

      // Update user state
      setUser(authenticatedUser);
    } catch (error) {
      // Create user-friendly error and store it
      const authError = createAuthError(error);
      setError(authError);
      
      // Re-throw for component-level handling
      throw error;
    } finally {
      setLoading(false);
    }
  };

  // Register function (Requirements 5.2, 5.3, 5.4, 9.1, 9.2)
  const register = async (email: string, password: string, name: string): Promise<void> => {
    try {
      setLoading(true);
      clearError(); // Clear any previous errors
      
      // Validate registration data (email format, password length, name)
      if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        throw new Error("Invalid email format");
      }
      if (!password || password.length < 8) {
        throw new Error("Password must be at least 8 characters");
      }
      if (!name || name.trim().length < 2) {
        throw new Error("Name must be at least 2 characters");
      }

      console.log("Attempting to register with email:", email);

      // Call Supabase signUp with email confirmation disabled
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            name: name.trim(),
          },
          emailRedirectTo: undefined, // Don't redirect for email confirmation
        },
      });

      console.log("Supabase signUp response:", { data, error });

      if (error) {
        // Handle duplicate email errors (Requirement 5.3)
        if (error.message.includes("already registered") || error.message.includes("already exists") || error.message.includes("User already registered")) {
          throw new Error("An account with this email already exists");
        }
        throw new Error(error.message);
      }

      if (!data.user) {
        throw new Error("Registration failed - no user data returned");
      }

      // Check if email confirmation is required (session will be null if confirmation is needed)
      if (!data.session) {
        // Email confirmation is required - user needs to check their email
        throw new Error("Please check your email to confirm your account before logging in");
      }

      // After successful auth user creation, create TeamMember record in database (Requirements 9.1, 9.2)
      try {
        const { error: teamMemberError } = await supabase
          .from("team_members")
          .insert({
            id: data.user.id,
            name: name.trim(),
            email: email,
            role: "Developer", // Default role
          });

        if (teamMemberError) {
          // Handle TeamMember creation errors
          console.error("Error creating TeamMember record:", teamMemberError);
          
          // If TeamMember creation fails, we should clean up the auth user
          // However, Supabase doesn't provide a way to delete users from client side
          // So we'll throw an error and let the user know
          throw new Error(`Account created but team member setup failed: ${teamMemberError.message}. Please contact support.`);
        }

        console.log("TeamMember record created successfully");
      } catch (teamMemberError) {
        // Re-throw TeamMember creation errors
        throw teamMemberError;
      }

      // Auto-login user after successful registration (Requirement 5.4)
      const newUser: User = {
        id: data.user.id,
        email: data.user.email || "",
        name: name.trim(),
        createdAt: data.user.created_at || new Date().toISOString(),
      };

      // Store session data
      const session: Session = {
        user: newUser,
        accessToken: data.session.access_token,
        expiresAt: data.session.expires_at ? data.session.expires_at * 1000 : Date.now() + 3600000,
      };
      localStorage.setItem("auth_session", JSON.stringify(session));

      // Update user state
      setUser(newUser);
    } catch (error) {
      // Create user-friendly error and store it
      const authError = createAuthError(error);
      setError(authError);
      
      // Re-throw for component-level handling
      throw error;
    } finally {
      setLoading(false);
    }
  };

  // Logout function (Requirements 7.1, 7.2, 7.3)
  const logout = async (): Promise<void> => {
    try {
      setLoading(true);
      clearError(); // Clear any errors on logout
      
      // Call Supabase signOut
      await supabase.auth.signOut();

      // Clear session from localStorage
      localStorage.removeItem("auth_session");

      // Clear user state
      setUser(null);
    } catch (error) {
      console.error("Error during logout:", error);
      // Even if Supabase signOut fails, clear local state
      localStorage.removeItem("auth_session");
      setUser(null);
      
      // Set error but don't throw - logout should always succeed locally
      const authError = createAuthError(error);
      setError(authError);
    } finally {
      setLoading(false);
    }
  };

  const isAuthenticated = user !== null;

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        error,
        login,
        register,
        logout,
        clearError,
        isAuthenticated,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within AuthProvider");
  }
  return context;
};
