import { useEffect } from "react";
import { useNavigate, useRouterState } from "@tanstack/react-router";
import { useAuth } from "@/lib/auth";
import { needsOnboarding } from "@/lib/studentProfile";

export function OnboardingGate() {
  const { user, currentRole, loading } = useAuth();
  const navigate = useNavigate();
  const pathname = useRouterState({ select: (s) => s.location.pathname });

  useEffect(() => {
    if (loading || !user) return;
    if (pathname === "/onboard" || pathname === "/auth" || pathname === "/reset-password") return;
    if (needsOnboarding(user, currentRole)) {
      void navigate({
        to: "/onboard",
        search: { redirect: pathname },
        replace: true,
      });
    }
  }, [user, currentRole, loading, pathname, navigate]);

  return null;
}
