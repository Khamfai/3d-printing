"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/store/auth-store";

interface AuthGuardProps {
  children: React.ReactNode;
  requiredRole?: "ADMIN" | "CUSTOMER";
}

export function AuthGuard({ children, requiredRole }: AuthGuardProps) {
  const router = useRouter();
  const { isAuthenticated, user } = useAuthStore();
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    // Wait for zustand persist rehydration
    const unsub = useAuthStore.persist.onFinishHydration(() => {
      setIsReady(true);
    });

    // If already hydrated
    if (useAuthStore.persist.hasHydrated()) {
      setIsReady(true);
    }

    return unsub;
  }, []);

  useEffect(() => {
    if (!isReady) return;

    if (!isAuthenticated) {
      router.replace("/login");
      return;
    }

    if (requiredRole && user?.role !== requiredRole) {
      router.replace(user?.role === "ADMIN" ? "/admin" : "/dashboard");
    }
  }, [isReady, isAuthenticated, user, requiredRole, router]);

  if (!isReady) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="animate-spin h-8 w-8 border-4 border-brand-600 border-t-transparent rounded-full" />
      </div>
    );
  }

  if (!isAuthenticated) return null;
  if (requiredRole && user?.role !== requiredRole) return null;

  return <>{children}</>;
}
