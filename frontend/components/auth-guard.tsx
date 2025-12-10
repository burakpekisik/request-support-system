"use client"

import { useAuthGuard } from '@/hooks/useAuthGuard';
import { Loader2 } from 'lucide-react';

interface AuthGuardProps {
  children: React.ReactNode;
}

export function AuthGuard({ children }: AuthGuardProps) {
  const { isChecking } = useAuthGuard();

  if (isChecking) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto text-primary" />
          <p className="mt-2 text-sm text-muted-foreground">Verifying...</p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}