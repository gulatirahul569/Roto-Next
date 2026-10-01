import { Suspense } from "react";
import LoginForm from "./LoginForm";

export default function LoginPage() {
  return (
    <Suspense
      fallback={
        <main className="grid min-h-screen place-items-center bg-zinc-950">
          <p className="text-sm font-semibold text-zinc-300">
            Loading account...
          </p>
        </main>
      }
    >
      <LoginForm />
    </Suspense>
  );
}