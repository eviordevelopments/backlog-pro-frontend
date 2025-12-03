import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { signup, SignupInput } from "@/api/auth/register";
import { signin, SigninInput } from "@/api/auth/verify-password";
import { requestPasswordReset, RequestPasswordResetInput } from "@/api/auth/password-reset";
import { getProfile, updateProfile, updateAvatar, UserProfile, UpdateProfileInput, UpdateAvatarInput } from "@/api/user/profile";

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
  requestPasswordReset: (email: string) => Promise<{ resetToken: string; expiresIn: string }>;
  getProfile: () => Promise<UserProfile>;
  updateProfile: (input: UpdateProfileInput) => Promise<UserProfile>;
  updateAvatar: (avatarUrl: string) => Promise<UserProfile>;
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
      
      // Call GraphQL signin mutation
      const signinInput: SigninInput = { email, password };
      const response = await signin(signinInput);

      // Create user object
      const authenticatedUser: User = {
        id: response.userId,
        email: response.email,
        name: response.name,
        createdAt: new Date().toISOString(),
      };

      // Store session data in localStorage (Requirement 2.1)
      const session: Session = {
        user: authenticatedUser,
        accessToken: response.token,
        expiresAt: Date.now() + 3600000, // 1 hour expiration
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

      // Call GraphQL signup mutation
      const signupInput: SignupInput = {
        email,
        password,
        name: name.trim(),
      };
      const response = await signup(signupInput);

      // Auto-login user after successful registration (Requirement 5.4)
      const newUser: User = {
        id: response.userId,
        email: response.email,
        name: response.name,
        createdAt: new Date().toISOString(),
      };

      // Store session data
      const session: Session = {
        user: newUser,
        accessToken: response.token,
        expiresAt: Date.now() + 3600000, // 1 hour expiration
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
      
      // Clear session from localStorage
      localStorage.removeItem("auth_session");

      // Clear user state
      setUser(null);
    } catch (error) {
      console.error("Error during logout:", error);
      // Even if something fails, clear local state
      localStorage.removeItem("auth_session");
      setUser(null);
      
      // Set error but don't throw - logout should always succeed locally
      const authError = createAuthError(error);
      setError(authError);
    } finally {
      setLoading(false);
    }
  };

  // Request password reset function
  const requestPasswordResetFn = async (email: string): Promise<{ resetToken: string; expiresIn: string }> => {
    try {
      clearError();
      const input: RequestPasswordResetInput = { email };
      return await requestPasswordReset(input);
    } catch (error) {
      const authError = createAuthError(error);
      setError(authError);
      throw error;
    }
  };

  // Get user profile function
  const getProfileFn = async (): Promise<UserProfile> => {
    try {
      clearError();
      const sessionData = localStorage.getItem("auth_session");
      if (!sessionData) {
        throw new Error("No active session");
      }
      const session: Session = JSON.parse(sessionData);
      return await getProfile(session.accessToken);
    } catch (error) {
      const authError = createAuthError(error);
      setError(authError);
      throw error;
    }
  };

  // Update user profile function
  const updateProfileFn = async (input: UpdateProfileInput): Promise<UserProfile> => {
    try {
      clearError();
      const sessionData = localStorage.getItem("auth_session");
      if (!sessionData) {
        throw new Error("No active session");
      }
      const session: Session = JSON.parse(sessionData);
      return await updateProfile(session.accessToken, input);
    } catch (error) {
      const authError = createAuthError(error);
      setError(authError);
      throw error;
    }
  };

  // Update user avatar function
  const updateAvatarFn = async (avatarUrl: string): Promise<UserProfile> => {
    try {
      clearError();
      const sessionData = localStorage.getItem("auth_session");
      if (!sessionData) {
        throw new Error("No active session");
      }
      const session: Session = JSON.parse(sessionData);
      return await updateAvatar(session.accessToken, { avatarUrl });
    } catch (error) {
      const authError = createAuthError(error);
      setError(authError);
      throw error;
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
        requestPasswordReset: requestPasswordResetFn,
        getProfile: getProfileFn,
        updateProfile: updateProfileFn,
        updateAvatar: updateAvatarFn,
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
