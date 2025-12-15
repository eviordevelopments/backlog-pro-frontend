import { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Mail, ArrowRight } from "lucide-react";
import { toast } from "sonner";

export default function ConfirmEmailPending() {
  const navigate = useNavigate();
  const location = useLocation();
  const [isResending, setIsResending] = useState(false);
  
  const email = (location.state?.email as string) || localStorage.getItem("pending_email") || "";

  const handleResendEmail = async () => {
    try {
      setIsResending(true);
      // TODO: Implement resend email API call
      toast.success("Confirmation email sent! Check your inbox.");
    } catch (error) {
      toast.error("Failed to resend email. Please try again.");
    } finally {
      setIsResending(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-background via-background to-primary/5">
      <Card className="w-full max-w-md glass">
        <CardHeader className="text-center space-y-4">
          <div className="flex justify-center">
            <div className="p-3 bg-primary/10 rounded-full">
              <Mail className="w-8 h-8 text-primary" />
            </div>
          </div>
          <CardTitle className="text-2xl">Confirm Your Email</CardTitle>
          <CardDescription>
            We've sent a confirmation link to your email
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <Alert className="bg-primary/5 border-primary/20">
            <AlertDescription className="text-sm">
              A confirmation email has been sent to <span className="font-semibold">{email}</span>. 
              Click the link in the email to activate your account.
            </AlertDescription>
          </Alert>

          <div className="space-y-3">
            <p className="text-sm text-muted-foreground text-center">
              Didn't receive the email? Check your spam folder or request a new confirmation link.
            </p>
            
            <Button
              onClick={handleResendEmail}
              disabled={isResending}
              variant="outline"
              className="w-full"
            >
              {isResending ? "Sending..." : "Resend Confirmation Email"}
            </Button>
          </div>

          <div className="pt-4 border-t">
            <Button
              onClick={() => navigate("/login")}
              variant="ghost"
              className="w-full"
            >
              Back to Sign In
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
