import { Wifi, WifiOff } from 'lucide-react';

interface MetricsStatusProps {
  isConnected: boolean;
  error?: Error | null;
}

export function MetricsStatus({ isConnected, error }: MetricsStatusProps) {
  if (error) {
    return (
      <div className="flex items-center gap-2 text-destructive text-sm">
        <WifiOff className="h-4 w-4" />
        <span>Metrics disconnected</span>
      </div>
    );
  }

  return (
    <div className={`flex items-center gap-2 text-sm ${isConnected ? 'text-success' : 'text-muted-foreground'}`}>
      {isConnected ? (
        <>
          <Wifi className="h-4 w-4 animate-pulse" />
          <span>Live metrics</span>
        </>
      ) : (
        <>
          <WifiOff className="h-4 w-4" />
          <span>Offline</span>
        </>
      )}
    </div>
  );
}
