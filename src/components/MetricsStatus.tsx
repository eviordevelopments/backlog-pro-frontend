import { AlertCircle, CheckCircle2 } from 'lucide-react';

interface MetricsStatusProps {
  isConnected: boolean;
  error?: string | null;
}

export function MetricsStatus({ isConnected, error }: MetricsStatusProps) {
  if (error) {
    return (
      <div className="flex items-center gap-2 text-destructive">
        <AlertCircle className="h-4 w-4" />
        <span className="text-sm">{error}</span>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-2 text-success">
      <CheckCircle2 className="h-4 w-4" />
      <span className="text-sm">{isConnected ? 'Connected' : 'Offline'}</span>
    </div>
  );
}
