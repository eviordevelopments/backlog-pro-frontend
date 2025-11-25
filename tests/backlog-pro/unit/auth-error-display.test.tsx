import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { AuthErrorDisplay } from "@/components/auth/AuthErrorDisplay";
import { AuthErrorCode, AuthError } from "@/context/AuthContext";

/**
 * Tests for AuthErrorDisplay component
 * Requirements: 1.4, 5.3
 */
describe("AuthErrorDisplay Component", () => {
  it("should not render when error is null", () => {
    const { container } = render(<AuthErrorDisplay error={null} />);
    expect(container.firstChild).toBeNull();
  });

  it("should display error message", () => {
    const error: AuthError = {
      code: AuthErrorCode.INVALID_CREDENTIALS,
      message: "Invalid email or password",
      retryable: false,
    };

    render(<AuthErrorDisplay error={error} />);
    expect(screen.getByText("Invalid email or password")).toBeInTheDocument();
  });

  it("should show retry button for retryable errors", () => {
    const error: AuthError = {
      code: AuthErrorCode.NETWORK_ERROR,
      message: "Network error occurred",
      retryable: true,
    };
    const onRetry = vi.fn();

    render(<AuthErrorDisplay error={error} onRetry={onRetry} />);
    
    const retryButton = screen.getByText("Retry");
    expect(retryButton).toBeInTheDocument();
    
    fireEvent.click(retryButton);
    expect(onRetry).toHaveBeenCalledTimes(1);
  });

  it("should not show retry button for non-retryable errors", () => {
    const error: AuthError = {
      code: AuthErrorCode.INVALID_CREDENTIALS,
      message: "Invalid credentials",
      retryable: false,
    };

    render(<AuthErrorDisplay error={error} />);
    expect(screen.queryByText("Retry")).not.toBeInTheDocument();
  });

  it("should show dismiss button when onDismiss is provided", () => {
    const error: AuthError = {
      code: AuthErrorCode.VALIDATION_ERROR,
      message: "Validation failed",
      retryable: false,
    };
    const onDismiss = vi.fn();

    render(<AuthErrorDisplay error={error} onDismiss={onDismiss} />);
    
    const dismissButton = screen.getByRole("button", { name: "" }); // X button has no text
    expect(dismissButton).toBeInTheDocument();
    
    fireEvent.click(dismissButton);
    expect(onDismiss).toHaveBeenCalledTimes(1);
  });

  it("should handle network errors with retry capability", () => {
    const error: AuthError = {
      code: AuthErrorCode.NETWORK_ERROR,
      message: "Unable to connect. Please check your internet connection and try again.",
      retryable: true,
    };
    const onRetry = vi.fn();

    render(<AuthErrorDisplay error={error} onRetry={onRetry} />);
    
    expect(screen.getByText(/Unable to connect/)).toBeInTheDocument();
    expect(screen.getByText("Retry")).toBeInTheDocument();
  });

  it("should handle session expired errors", () => {
    const error: AuthError = {
      code: AuthErrorCode.SESSION_EXPIRED,
      message: "Your session has expired. Please log in again.",
      retryable: false,
    };

    render(<AuthErrorDisplay error={error} />);
    expect(screen.getByText(/session has expired/)).toBeInTheDocument();
  });

  it("should handle email exists errors", () => {
    const error: AuthError = {
      code: AuthErrorCode.EMAIL_EXISTS,
      message: "An account with this email already exists. Please sign in instead.",
      retryable: false,
    };

    render(<AuthErrorDisplay error={error} />);
    expect(screen.getByText(/already exists/)).toBeInTheDocument();
  });
});
