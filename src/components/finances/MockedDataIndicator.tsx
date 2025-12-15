import { AlertCircle } from "lucide-react";

interface MockedDataIndicatorProps {
  title?: string;
}

export default function MockedDataIndicator({ title = "Datos mockeados - Implementación pendiente" }: MockedDataIndicatorProps) {
  return (
    <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-destructive/10 border border-destructive/30 text-xs text-destructive">
      <div className="w-2 h-2 bg-destructive rounded-full flex-shrink-0" />
      <span>{title}</span>
    </div>
  );
}
