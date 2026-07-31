import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { useRouter } from "@tanstack/react-router";
import type { Session, User } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";
import { resetAuthSessionReadiness, waitForAuthSession } from "@/lib/auth-session";

type AuthCtx = {
  user: User | null;
  session: Session | null;
  loading: boolean;
  signOut: () => Promise<void>;
};

const Ctx = createContext<AuthCtx>({ user: null, session: null, loading: true, signOut: async () => {} });

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const queryClient = useQueryClient();
  const router = useRouter();

  useEffect(() => {
    let mounted = true;

    const { data: sub } = supabase.auth.onAuthStateChange((event, s) => {
      resetAuthSessionReadiness();
      if (!mounted) return;
      setSession(s);
      setLoading(false);

      if (event === "SIGNED_IN" || event === "SIGNED_OUT" || event === "USER_UPDATED") {
        router.invalidate();
        if (event === "SIGNED_OUT") {
          queryClient.clear();
        } else {
          queryClient.invalidateQueries();
        }
      }
    });

    waitForAuthSession().then((initialSession) => {
      if (!mounted) return;
      setSession(initialSession);
      setLoading(false);
    });

    return () => {
      mounted = false;
      sub.subscription.unsubscribe();
    };
  }, [queryClient, router]);

  return (
    <Ctx.Provider
      value={{
        user: session?.user ?? null,
        session,
        loading,
        signOut: async () => {
          await queryClient.cancelQueries();
          queryClient.clear();
          resetAuthSessionReadiness();
          await supabase.auth.signOut();
          await router.navigate({ to: "/auth", replace: true });
        },
      }}
    >
      {children}
    </Ctx.Provider>
  );
}

export const useAuth = () => useContext(Ctx);
