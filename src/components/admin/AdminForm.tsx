"use client";

import { startTransition, useActionState, type ReactNode } from "react";
import { AlertCircle, Loader2 } from "lucide-react";
import type { FormState } from "@/app/admin/actions";

type Props = {
  action: (state: FormState, form: FormData) => Promise<FormState>;
  submitLabel: string;
  children: ReactNode;
};

function Submit({ label, pending }: { label: string; pending: boolean }) {
  return (
    <button type="submit" disabled={pending} className="btn btn-primary min-w-44 disabled:opacity-70">
      {pending && <Loader2 className="size-5 animate-spin" aria-hidden />}
      {pending ? "Сохранение…" : label}
    </button>
  );
}

/** Форма с серверной проверкой: ошибки показываются сверху, данные не теряются. */
export function AdminForm({ action, submitLabel, children }: Props) {
  const [state, formAction, pending] = useActionState(action, {});
  const problems = [...(state.errors ?? []), ...(state.error ? [state.error] : [])];

  return (
    <form
      className="space-y-8"
      noValidate
      onSubmit={(e) => {
        // Вручную, чтобы при ошибке проверки введённое не сбрасывалось.
        e.preventDefault();
        const data = new FormData(e.currentTarget);
        startTransition(() => formAction(data));
      }}
    >
      {problems.length > 0 && (
        <div role="alert" className="flex gap-3 rounded-felt border border-wine/40 bg-wine-soft p-4 text-wine-deep">
          <AlertCircle className="mt-0.5 size-5 shrink-0" aria-hidden />
          <ul className="space-y-1">
            {problems.map((p) => (
              <li key={p}>{p}</li>
            ))}
          </ul>
        </div>
      )}
      {children}
      <div className="sticky bottom-0 -mx-4 border-t border-line bg-milk/95 px-4 py-4 backdrop-blur md:static md:mx-0 md:border-0 md:bg-transparent md:px-0">
        <Submit label={submitLabel} pending={pending} />
      </div>
    </form>
  );
}
