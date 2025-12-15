import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Loader2, AlertCircle, CheckCircle } from "lucide-react";
import { toast } from "sonner";
import { confirmEmail } from "@/api/auth";

export default function ConfirmEmail() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    const confirmEmailToken = async () => {
      console.log("ConfirmEmail: useEffect started");
      const token = searchParams.get("token");
      console.log("ConfirmEmail: token =", token);

      if (!token) {
        console.log("ConfirmEmail: No token provided");
        setError("No confirmation token provided");
        setIsLoading(false);
        return;
      }

      try {
        console.log("ConfirmEmail: Calling confirmEmail API");
        const response = await confirmEmail(token);
        console.log("ConfirmEmail: API response =", response);

        if (response.success && response.token) {
          console.log("ConfirmEmail: Email confirmed successfully");
          // Store auth session
          localStorage.setItem("auth_session", JSON.stringify({
            token: response.token,
            userId: response.userId,
            email: response.email,
            name: response.name,
          }));

          setSuccess(true);
          toast.success(response.message);

          // Redirect to dashboard after 2 seconds
          setTimeout(() => {
            navigate("/");
          }, 2000);
        } else {
          console.log("ConfirmEmail: Confirmation failed");
          setError(response.message || "Failed to confirm email");
          toast.error(response.message || "Failed to confirm email");
        }
      } catch (err) {
        console.error("ConfirmEmail: Error =", err);
        const errorMessage = err instanceof Error ? err.message : "Failed to confirm email";
        setError(errorMessage);
        toast.error(errorMessage);
      } finally {
        setIsLoading(false);
      }
    };

    confirmEmailToken();
  }, []);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background to-muted p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <CardTitle>Confirming Email</CardTitle>
            <CardDescription>
              Please wait while we confirm your email address
            </CardDescription>
          </CardHeader>
          <CardContent className="flex justify-center">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
          </CardContent>
        </Card>
      </div>
    );
  }

  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background to-muted p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <div className="flex justify-center mb-4">
              <CheckCircle className="w-12 h-12 text-success" />
            </div>
            <CardTitle>Email Confirmed</CardTitle>
            <CardDescription>
              Your account has been activated successfully
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-muted-foreground text-center">
              You are now logged in and will be redirected to the dashboard.
            </p>
            <Button onClick={() => navigate("/")} className="w-full">
              Go to Dashboard
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background to-muted p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            <AlertCircle className="w-12 h-12 text-destructive" />
          </div>
          <CardTitle>Email Confirmation Failed</CardTitle>
          <CardDescription>
            We couldn't confirm your email address
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
          <div className="space-y-2">
            <Button onClick={() => navigate("/login")} className="w-full">
              Go to Sign In
            </Button>
            <Button onClick={() => navigate("/register")} variant="outline" className="w-full">
              Create New Account
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
