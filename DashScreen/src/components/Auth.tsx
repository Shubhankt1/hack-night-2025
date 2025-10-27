// src/components/Auth.tsx
import { useAuthActions } from "@convex-dev/auth/react";

export function Auth() {
  const { signIn } = useAuthActions();

  return (
    <button onClick={() => void signIn("google")}>Sign in with Google!</button>
  );
}
