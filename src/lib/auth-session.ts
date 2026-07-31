import type { Session, User } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";

const AUTH_READY_TIMEOUT_MS = 2500;
const AUTH_REDIRECT_KEY = "suii-kala-auth-redirect";

let authReadyPromise: Promise<Session | null> | undefined;

function isBrowser() {
  return typeof window !== "undefined";
}

async function readStoredSession(): Promise<Session | null> {
  const { data, error } = await supabase.auth.getSession();
  if (error) return null;
  return data.session ?? null;
}

export function resetAuthSessionReadiness() {
  authReadyPromise = undefined;
}

export async function waitForAuthSession(): Promise<Session | null> {
  if (!isBrowser()) return null;

  if (!authReadyPromise) {
    authReadyPromise = new Promise((resolve) => {
      let settled = false;
      let timeoutId: number | undefined;
      let subscription: { unsubscribe: () => void } | undefined;

      const finish = (session: Session | null) => {
        if (settled) return;
        settled = true;
        if (timeoutId) window.clearTimeout(timeoutId);
        subscription?.unsubscribe();
        if (!session) authReadyPromise = undefined;
        resolve(session);
      };

      const authListener = supabase.auth.onAuthStateChange((event, session) => {
        if (
          event === "INITIAL_SESSION" ||
          event === "SIGNED_IN" ||
          event === "TOKEN_REFRESHED" ||
          event === "USER_UPDATED" ||
          event === "SIGNED_OUT"
        ) {
          finish(session ?? null);
        }
      });
      subscription = authListener.data.subscription;
      if (settled) subscription.unsubscribe();

      readStoredSession()
        .then((session) => {
          if (session) finish(session);
        })
        .catch(() => finish(null));

      timeoutId = window.setTimeout(() => {
        readStoredSession().then(finish).catch(() => finish(null));
      }, AUTH_READY_TIMEOUT_MS);
    });
  }

  return authReadyPromise;
}

export async function getAuthenticatedUser(): Promise<User | null> {
  const session = await waitForAuthSession();
  if (!session) return null;

  const { data, error } = await supabase.auth.getUser();
  if (!error && data.user) return data.user;

  const refreshed = await supabase.auth.refreshSession().catch(() => null);
  if (!refreshed?.data.session) {
    resetAuthSessionReadiness();
    return null;
  }

  const retry = await supabase.auth.getUser();
  if (retry.error || !retry.data.user) return null;
  return retry.data.user;
}

export async function isAuthenticatedUserAdmin(): Promise<boolean> {
  const user = await getAuthenticatedUser();
  if (!user) return false;

  const { data, error } = await supabase
    .from("user_roles")
    .select("role")
    .eq("user_id", user.id)
    .eq("role", "admin")
    .maybeSingle();

  if (error) return false;
  return data?.role === "admin";
}

export function toSafeAuthRedirect(value: string | null | undefined, fallback = "/account") {
  const fallbackPath = fallback.startsWith("/") && !fallback.startsWith("//") ? fallback : "/account";
  if (!value) return fallbackPath;

  const trimmed = value.trim();
  if (!trimmed) return fallbackPath;

  let path = trimmed;
  if (trimmed.startsWith("http://") || trimmed.startsWith("https://")) {
    try {
      const url = new URL(trimmed);
      if (isBrowser() && url.origin !== window.location.origin) return fallbackPath;
      path = `${url.pathname}${url.search}${url.hash}`;
    } catch {
      return fallbackPath;
    }
  }

  if (!path.startsWith("/") || path.startsWith("//") || path.startsWith("/auth")) return fallbackPath;
  return path;
}

export function rememberAuthRedirect(value: string | null | undefined) {
  if (!isBrowser()) return;
  window.sessionStorage.setItem(AUTH_REDIRECT_KEY, toSafeAuthRedirect(value));
}

export function consumeAuthRedirect(value: string | null | undefined, fallback = "/account") {
  const direct = value ? toSafeAuthRedirect(value, fallback) : null;
  if (!isBrowser()) return direct ?? fallback;

  const stored = window.sessionStorage.getItem(AUTH_REDIRECT_KEY);
  window.sessionStorage.removeItem(AUTH_REDIRECT_KEY);

  return direct ?? toSafeAuthRedirect(stored, fallback);
}