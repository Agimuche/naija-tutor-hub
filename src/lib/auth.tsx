import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import type { Session, User } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";

interface AuthCtx {
  user: User | null;
  session: Session | null;
  loading: boolean;
  isAdmin: boolean;
  isTeacher: boolean;
  signOut: () => Promise<void>;
}

const Ctx = createContext<AuthCtx>({ user: null, session: null, loading: true, isAdmin: false, isTeacher: false, signOut: async () => {} });

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const [isTeacher, setIsTeacher] = useState(false);

  useEffect(() => {
    const loadRoles = (uid: string) => {
      setTimeout(async () => {
        const { data } = await supabase.from("user_roles").select("role").eq("user_id", uid);
        const roles = (data || []).map((r) => r.role);
        setIsAdmin(roles.includes("admin" as never));
        setIsTeacher(roles.includes("teacher" as never) || roles.includes("admin" as never));
      }, 0);
    };
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_e, s) => {
      setSession(s);
      if (s?.user) loadRoles(s.user.id);
      else { setIsAdmin(false); setIsTeacher(false); }
    });
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      if (session?.user) loadRoles(session.user.id);
      setLoading(false);
    });
    return () => subscription.unsubscribe();
  }, []);

  return (
    <Ctx.Provider value={{
      user: session?.user ?? null, session, loading, isAdmin, isTeacher,
      signOut: async () => { await supabase.auth.signOut(); }
    }}>{children}</Ctx.Provider>
  );
}

export const useAuth = () => useContext(Ctx);
