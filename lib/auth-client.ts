import { createAuthClient } from "better-auth/react";

export const authClient = createAuthClient({
  baseURL:
    typeof window !== "undefined"
      ? `${window.location.origin}/api/auth`
      : process.env.BETTER_AUTH_URL || "http://localhost:3000/api/auth",
  fetchOptions: {
    onError: (e) => {
      console.error("Auth error:", e);
    },
  },
});

export const { signIn, signUp, signOut, useSession } = authClient;

export const useAuth = () => {
  const session = useSession();
  return {
    user: session.data?.user || null,
    isLoading: session.isPending,
    isAuthenticated: !!session.data?.user,
  };
};
