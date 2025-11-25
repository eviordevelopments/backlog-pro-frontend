import { Spinner } from "@/components/ui/spinner";

export const LoadingScreen = () => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background via-background to-primary/5">
      <div className="flex flex-col items-center space-y-4">
        <Spinner size="xl" />
        <p className="text-muted-foreground text-sm">Loading your session...</p>
      </div>
    </div>
  );
};
