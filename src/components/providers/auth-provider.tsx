"use client";

import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import { useAuthStore } from "@/stores/auth-store";

const PUBLIC_ROUTES = ["/login", "/design-system"];

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const { isInitialized, accessToken, initialize } = useAuthStore();
  const [ready, setReady] = useState(false);

  useEffect(() => {
    initialize();
  }, [initialize]);

  useEffect(() => {
    if (!isInitialized) return;
    setReady(true);

    const isPublic = PUBLIC_ROUTES.some((route) => pathname.startsWith(route));
    if (!isPublic && !accessToken) {
      router.replace("/login");
    }
  }, [isInitialized, accessToken, pathname, router]);

  if (!ready) return null;

  return <>{children}</>;
}
