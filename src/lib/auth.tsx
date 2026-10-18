import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import type { User } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";

export type AppRole = "student" | "faculty" | "alumni" | "admin";

export interface AuthState {
  user: User | null;
  roles: AppRole[];
  currentRole: AppRole;
  loading: boolean;
  hasRole: (r: AppRole) => boolean;
  setRole: (r: AppRole) => Promise<void>;
  signOut: () => Promise<void>;
  signInWithOAuth: (provider: "google" | "github" | "linkedin", role?: AppRole) => Promise<{ error?: unknown }>;
  signInAsDemo: (role: AppRole, name?: string) => void;
  updateProfile: (data: { full_name: string }) => Promise<void>;
}

const DEMO_USER_KEY = "ashwood_demo_auth_user";
const PENDING_ROLE_KEY = "ashwood_pending_role";

const AuthCtx = createContext<AuthState>({
  user: null,
  roles: [],
  currentRole: "student",
  loading: true,
  hasRole: () => false,
  setRole: async () => {},
  signOut: async () => {},
  signInWithOAuth: async () => ({}),
  signInAsDemo: () => {},
  updateProfile: async () => {},
});

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [roles, setRoles] = useState<AppRole[]>([]);
  const [currentRole, setCurrentRole] = useState<AppRole>("student");
  const [loading, setLoading] = useState(true);

  // Load user roles & metadata
  const loadUserData = async (u: User | null) => {
    setUser(u);
    if (u) {
      // 1. Check user_metadata
      const metaRole = (u.user_metadata?.role as AppRole) || null;
      const pendingRole = (localStorage.getItem(PENDING_ROLE_KEY) as AppRole) || null;

      // 2. Fetch from user_roles table
      const { data } = await supabase.from("user_roles").select("role").eq("user_id", u.id);
      const dbRoles = (data ?? []).map((r) => r.role as AppRole);

      const resolvedRoles: AppRole[] = Array.from(
        new Set([...(dbRoles || []), ...(metaRole ? [metaRole] : []), ...(pendingRole ? [pendingRole] : [])])
      );

      const effectiveRole: AppRole = pendingRole || metaRole || (resolvedRoles[0] as AppRole) || "student";

      if (pendingRole) {
        localStorage.removeItem(PENDING_ROLE_KEY);
        // Persist role to user metadata if not already saved
        if (metaRole !== pendingRole) {
          void supabase.auth.updateUser({ data: { role: pendingRole } });
        }
      }

      setRoles(resolvedRoles.length > 0 ? resolvedRoles : [effectiveRole]);
      setCurrentRole(effectiveRole);
    } else {
      // Check if there is a demo user session in local storage for quick testing
      const savedDemo = localStorage.getItem(DEMO_USER_KEY);
      if (savedDemo) {
        try {
          const parsed = JSON.parse(savedDemo) as { user: User; role: AppRole };
          setUser(parsed.user);
          setRoles([parsed.role]);
          setCurrentRole(parsed.role);
          setLoading(false);
          return;
        } catch {
          localStorage.removeItem(DEMO_USER_KEY);
        }
      }
      setRoles([]);
    }
    setLoading(false);
  };

  useEffect(() => {
    const { data: sub } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === "TOKEN_REFRESHED") return;
      void loadUserData(session?.user ?? null);
    });

    supabase.auth.getUser().then(({ data }) => {
      void loadUserData(data.user);
    });

    return () => sub.subscription.unsubscribe();
  }, []);

  const setRole = async (newRole: AppRole) => {
    setCurrentRole(newRole);
    if (!roles.includes(newRole)) {
      setRoles((prev) => [...prev, newRole]);
    }
    if (user) {
      if (user.id.startsWith("demo-")) {
        localStorage.setItem(DEMO_USER_KEY, JSON.stringify({ user, role: newRole }));
      } else {
        await supabase.auth.updateUser({ data: { role: newRole } });
      }
    }
  };

  const signInWithOAuth = async (
    provider: "google" | "github" | "linkedin" = "google",
    selectedRole: AppRole = "student"
  ) => {
    localStorage.setItem(PENDING_ROLE_KEY, selectedRole);

    try {
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider,
        options: {
          redirectTo: `${window.location.origin}/`,
          queryParams: {
            access_type: "offline",
            prompt: "consent",
          },
        },
      });

      if (error) {
        return { error };
      }
      return { data };
    } catch (err) {
      return { error: err };
    }
  };

  const signInAsDemo = (role: AppRole, name?: string) => {
    const defaultNames: Record<AppRole, string> = {
      student: "Arjun Sharma (Active Student)",
      faculty: "Prof. Gayatri Sen (Faculty Mentor)",
      alumni: "Vikram Choudhury (Class of '16 Alum)",
      admin: "Dean of Academic Relations",
    };

    const mockEmail = `${role}@ashwood.edu`;
    const fullName = name || defaultNames[role];

    const demoUser = {
      id: `demo-${role}-${Date.now()}`,
      app_metadata: { provider: "demo" },
      user_metadata: { full_name: fullName, role },
      aud: "authenticated",
      created_at: new Date().toISOString(),
      email: mockEmail,
      phone: "",
      role: "authenticated",
    } as unknown as User;

    localStorage.setItem(DEMO_USER_KEY, JSON.stringify({ user: demoUser, role }));
    setUser(demoUser);
    setRoles([role]);
    setCurrentRole(role);
  };

  const updateProfile = async (data: { full_name: string }) => {
    if (!user) return;
    const nextMeta = { ...user.user_metadata, ...data };
    if (user.id.startsWith("demo-")) {
      const nextUser = { ...user, user_metadata: nextMeta } as User;
      setUser(nextUser);
      localStorage.setItem(DEMO_USER_KEY, JSON.stringify({ user: nextUser, role: currentRole }));
      return;
    }
    await supabase.auth.updateUser({ data: { full_name: data.full_name } });
    const { data: refreshed } = await supabase.auth.getUser();
    if (refreshed.user) setUser(refreshed.user);
    else setUser({ ...user, user_metadata: nextMeta } as User);
  };

  const signOut = async () => {
    localStorage.removeItem(DEMO_USER_KEY);
    localStorage.removeItem(PENDING_ROLE_KEY);
    setUser(null);
    setRoles([]);
    setCurrentRole("student");
    await supabase.auth.signOut();
  };

  return (
    <AuthCtx.Provider
      value={{
        user,
        roles,
        currentRole,
        loading,
        hasRole: (r) => roles.includes(r) || currentRole === r,
        setRole,
        signOut,
        signInWithOAuth,
        signInAsDemo,
        updateProfile,
      }}
    >
      {children}
    </AuthCtx.Provider>
  );
}

export const useAuth = () => useContext(AuthCtx);
