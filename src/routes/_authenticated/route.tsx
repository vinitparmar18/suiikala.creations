import { createFileRoute, Outlet, redirect } from "@tanstack/react-router";
import { getAuthenticatedUser, toSafeAuthRedirect } from "@/lib/auth-session";

export const Route = createFileRoute("/_authenticated")({
  ssr: false,
  beforeLoad: async ({ location }) => {
    const user = await getAuthenticatedUser();
    if (!user) {
      throw redirect({ to: "/auth", search: { redirect: toSafeAuthRedirect(location.href) } });
    }
    return { user };
  },
  component: () => <Outlet />,
});
