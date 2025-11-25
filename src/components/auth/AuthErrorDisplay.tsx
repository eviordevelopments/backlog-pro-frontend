import { AlertCircle, RefreshCw, X } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { AuthError } from "@/context/AuthContext";

interface AuthErrorDisplayProps {
  error: AuthError | null;
  onRetry?: () => void;
  onDismiss?: () => void;
}

/**
 * Reusable component for displaying authentication errors
 * Supports retry functionality for network errors
 * Requirements: 1.4, 5.3
 */
export function AuthErrorDisplay({ error, onRetry, onDismiss }: AuthErrorDisplayProps) {
  if (!error) return null;

  return (
    <Alert variant="destructive" className="relative">
      <AlertCircle className="h-4 w-4" />
      <AlertDescription className="flex items-center justify-between gap-2">
        <span className="flex-1">{error.message}</span>
        <div className="flex items-center gap-2">
          {/* Show retry button for retryable errors */}
          {error.retryable && onRetry && (
            <Button
              variant="ghost"
              size="sm"
              onClick={onRetry}
              className="h-8 px-2 text-destructive-foreground hover:bg-destructive/20"
            >
              <RefreshCw className="h-3 w-3 mr-1" />
              Retry
            </Button>
          )}
          {/* Show dismiss button if handler provided */}
          {onDismiss && (
            <Button
              variant="ghost"
              size="icon"
              onClick={onDismiss}
              className="h-6 w-6 text-destructive-foreground hover:bg-destructive/20"
            >
              <X className="h-3 w-3" />
            </Button>
          )}
        </div>
      </AlertDescription>
    </Alert>
  );
}
