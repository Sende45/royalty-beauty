"use client";

import { startTransition, useActionState } from "react";
import { Loader2, Lock, Mail } from "lucide-react";
import Logo from "@/components/Logo";
import { login, type LoginState } from "@/actions/auth";
import { ui } from "@/lib/admin-ui";

export default function LoginPage() {
  const [state, formAction, pending] = useActionState<LoginState, FormData>(login, {});

  return (
    <div className="flex min-h-screen items-center justify-center bg-prune-light px-4">
      <div className="w-full max-w-sm">
        <div className="mb-8 flex justify-center">
          <Logo />
        </div>

        <form
          onSubmit={(e) => {
            e.preventDefault();
            const data = new FormData(e.currentTarget);
            startTransition(() => formAction(data));
          }}
          className={`${ui.card} space-y-5`}
        >
          <div className="text-center">
            <h1 className="font-display text-xl text-encre">Espace administration</h1>
            <p className="mt-1 text-sm text-encre/50">Connectez-vous pour gérer le salon</p>
          </div>

          {state.error && (
            <p className="rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700">{state.error}</p>
          )}

          <label className="block">
            <span className={ui.label}>Email</span>
            <div className="relative">
              <Mail className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-encre/30" />
              <input name="email" type="email" required autoComplete="email" className={`${ui.input} pl-10`} />
            </div>
          </label>

          <label className="block">
            <span className={ui.label}>Mot de passe</span>
            <div className="relative">
              <Lock className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-encre/30" />
              <input
                name="password"
                type="password"
                required
                autoComplete="current-password"
                className={`${ui.input} pl-10`}
              />
            </div>
          </label>

          <button type="submit" disabled={pending} className={`${ui.btnPrimary} w-full`}>
            {pending && <Loader2 className="h-4 w-4 animate-spin" />}
            Se connecter
          </button>
        </form>
      </div>
    </div>
  );
}