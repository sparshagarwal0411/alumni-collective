import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import type { User } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";

type Role = "admin" | "alumni" | "student";
interface AuthState {
  user: User | null;
  roles: Role[];
  loading: boolean;
  hasRole: (r: Role) => boolean;
  signOut: () => Promise<void>;
}

const AuthCtx = createContext<AuthState>({
  user: null,
  roles: [],
  loading: true,
  hasRole: () => false,
  signOut: async () => {},
});

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [roles, setRoles] = useState<Role[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async (u: User | null) => {
      setUser(u);
      if (u) {
        const { data } = await supabase.from("user_roles").select("role").eq("user_id", u.id);
        setRoles((data ?? []).map((r) => r.role));
      } else setRoles([]);
      setLoading(false);
    };
    const { data: sub } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === "TOKEN_REFRESHED") return;
      void load(session?.user ?? null);
    });
    supabase.auth.getUser().then(({ data }) => load(data.user));
    return () => sub.subscription.unsubscribe();
  }, []);

  return (
    <AuthCtx.Provider
      value={{
        user,
        roles,
        loading,
        hasRole: (r) => roles.includes(r),
        signOut: async () => {
          await supabase.auth.signOut();
        },
      }}
    >
      {children}
    </AuthCtx.Provider>
  );
}

export const useAuth = () => useContext(AuthCtx);
