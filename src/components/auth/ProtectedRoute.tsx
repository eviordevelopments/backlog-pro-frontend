import { ReactNode, useEffect } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useAuth, AuthErrorCode } from "@/context/AuthContext";
import { useToast } from "@/hooks/use-toast";

interface ProtectedRouteProps {
  children: ReactNode;
}

/**
 * ProtectedRoute wrapper component
 * Requirements: 3.1, 3.2, 3.3, 3.4
 * 
 * Checks authentication status and redirects unauthenticated users to login.
 * Preserves the intended URL for post-login redirection.
 */
export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
  const { isAuthenticated, loading, error, clearError } = useAuth();
  const location = useLocation();
  const { toast } = useToast();

  useEffect(() => {
    // Store originally requested URL in localStorage when redirecting to login (Requirement 3.3)
    if (!isAuthenticated && !loading) {
      // Only store if not already on login or register page
      if (location.pathname !== "/login" && location.pathname !== "/register") {
        localStorage.setItem("intended_url", location.pathname + location.search);
      }
      
      // Show session expiration toast if that's the error (Requirement 2.5)
      if (error && error.code === AuthErrorCode.SESSION_EXPIRED) {
        toast({
          title: "Session Expired",
          description: error.message,
          variant: "destructive",
        });
        clearError();
      }
    }
  }, [isAuthenticated, loading, location, error, clearError, toast]);

  // Show loading state while checking authentication
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  // Redirect to login if not authenticated (Requirement 3.1)
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  // Render children if authenticated (Requirement 3.2)
  return <>{children}</>;
};
