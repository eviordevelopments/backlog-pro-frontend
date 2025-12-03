import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Link } from "react-router-dom";
import { Mail, ArrowLeft } from "lucide-react";
import { usePasswordReset } from "@/hooks/use-password-reset";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Spinner } from "@/components/ui/spinner";
import { useToast } from "@/hooks/use-toast";
import { Alert, AlertDescription } from "@/components/ui/alert";

const forgotPasswordSchema = z.object({
  email: z
    .string()
    .min(1, "Email is required")
    .email("Please enter a valid email address"),
});

type ForgotPasswordFormValues = z.infer<typeof forgotPasswordSchema>;

export default function ForgotPassword() {
  const { requestPasswordReset } = usePasswordReset();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [resetToken, setResetToken] = useState<string | null>(null);

  const form = useForm<ForgotPasswordFormValues>({
    resolver: zodResolver(forgotPasswordSchema),
    defaultValues: {
      email: "",
    },
  });

  const onSubmit = async (data: ForgotPasswordFormValues) => {
    try {
      setIsLoading(true);
      const response = await requestPasswordReset(data.email);
      setResetToken(response.resetToken);
      setSubmitted(true);
      toast({
        title: "Success",
        description: "Password reset token sent. Check your email for instructions.",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to request password reset",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-background via-background to-primary/5">
      <Card className="w-full max-w-md glass">
        <CardHeader className="space-y-1">
          <div className="flex items-center justify-center mb-4">
            <img src="/evior-logo.png" alt="E-vior" className="h-12 w-auto" />
          </div>
          <CardTitle className="text-2xl text-center">Reset Password</CardTitle>
          <CardDescription className="text-center">
            {submitted
              ? "Check your email for reset instructions"
              : "Enter your email to receive a password reset link"}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {submitted ? (
            <div className="space-y-4">
              <Alert>
                <AlertDescription>
                  We've sent a password reset link to your email. Please check your inbox and follow the instructions.
                </AlertDescription>
              </Alert>
              {resetToken && (
                <div className="space-y-2">
                  <label className="text-sm font-medium">Reset Token</label>
                  <div className="p-3 bg-muted rounded-md break-all text-xs font-mono">
                    {resetToken}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Expires in: 1 hour
                  </p>
                </div>
              )}
              <Button asChild className="w-full">
                <Link to="/login">
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Back to Login
                </Link>
              </Button>
            </div>
          ) : (
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Email</FormLabel>
                      <FormControl>
                        <Input
                          type="email"
                          placeholder="name@example.com"
                          autoComplete="email"
                          disabled={isLoading}
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <Button
                  type="submit"
                  className="w-full"
                  disabled={isLoading || !form.formState.isValid}
                >
                  {isLoading ? (
                    <>
                      <Spinner size="sm" className="mr-2" />
                      Sending...
                    </>
                  ) : (
                    "Send Reset Link"
                  )}
                </Button>
              </form>
            </Form>
          )}
        </CardContent>
        {!submitted && (
          <div className="px-6 pb-6 text-center text-sm text-muted-foreground">
            Remember your password?{" "}
            <Link to="/login" className="text-primary hover:underline font-medium">
              Sign in
            </Link>
          </div>
        )}
      </Card>
    </div>
  );
}
