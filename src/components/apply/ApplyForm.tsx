"use client";

import { startTransition, useActionState, useEffect, useRef, useState } from "react";
import { AlertCircle, CheckCircle2, Loader2, Send } from "lucide-react";
import type { ApplyState } from "@/app/[locale]/apply/actions";
import type { ApplicationErrorKey } from "@/lib/applications";
import type { Dictionary } from "@/locales/kk";

type Props = {
  action: (state: ApplyState, form: FormData) => Promise<ApplyState>;
  dict: Dictionary["apply"];
  directions: { slug: string; name: string }[];
  initialKind?: string;
  initialDirection?: string;
};

const control =
  "mt-2 w-full rounded-felt border border-ink/25 bg-white px-4 py-3 text-base transition-colors hover:border-ink/45 focus:border-wine aria-invalid:border-wine aria-invalid:bg-wine-soft/40";

function Submit({ dict, pending }: { dict: Props["dict"]; pending: boolean }) {
  return (
    <button type="submit" disabled={pending} className="btn btn-primary w-full disabled:opacity-75 sm:w-auto">
      {pending ? <Loader2 className="size-5 animate-spin" aria-hidden /> : <Send className="size-5" aria-hidden />}
      {pending ? dict.sending : dict.submit}
    </button>
  );
}

function FieldError({ id, text }: { id: string; text?: string }) {
  if (!text) return null;
  return (
    <p id={id} className="mt-2 flex items-start gap-2 text-sm font-medium text-wine">
      <AlertCircle className="mt-0.5 size-4 shrink-0" aria-hidden />
      {text}
    </p>
  );
}

/**
 * Заявка родителя. Успех показывается только после того, как сервер
 * подтвердил сохранение; при ошибке введённые данные остаются в форме.
 */
export function ApplyForm({ action, dict, directions, initialKind = "enroll", initialDirection = "" }: Props) {
  const [state, formAction, pending] = useActionState(action, {});
  const [startedAt] = useState(() => Date.now());
  const [kind, setKind] = useState(initialKind);
  const summary = useRef<HTMLDivElement>(null);
  const success = useRef<HTMLDivElement>(null);
  const errs = new Set<ApplicationErrorKey>(state.errors ?? []);
  const err = (k: ApplicationErrorKey) => (errs.has(k) ? dict.errors[k] : undefined);

  useEffect(() => {
    if (state.ok) success.current?.focus();
    else if (state.errors?.length || state.error) summary.current?.focus();
  }, [state]);

  if (state.ok) {
    return (
      <div ref={success} tabIndex={-1} role="status" className="fade-in rounded-felt bg-sand p-8 outline-none md:p-12">
        <CheckCircle2 className="size-12 text-wine" aria-hidden />
        <h2 className="display mt-4 text-[clamp(2.6rem,7vw,4rem)] text-wine">{dict.successTitle}</h2>
        <p className="mt-3 max-w-xl text-lg">{dict.successText}</p>
        <button type="button" onClick={() => window.location.reload()} className="btn btn-outline mt-8 text-wine">
          {dict.another}
        </button>
      </div>
    );
  }

  const problems = [
    ...[...errs].map((k) => dict.errors[k]),
    ...(state.error ? [dict.errors[state.error]] : []),
  ];

  return (
    <form
      noValidate
      className="space-y-8"
      onSubmit={(e) => {
        // Отправляем вручную: так поля не очищаются, если сервер вернул ошибку.
        e.preventDefault();
        const data = new FormData(e.currentTarget);
        startTransition(() => formAction(data));
      }}
    >
      {problems.length > 0 && (
        <div ref={summary} tabIndex={-1} role="alert" className="rounded-felt border border-wine/40 bg-wine-soft p-5 text-wine-deep outline-none">
          <p className="font-semibold">{dict.errors.summary}</p>
          <ul className="mt-2 list-disc space-y-1 pl-5">
            {problems.map((p) => (
              <li key={p}>{p}</li>
            ))}
          </ul>
        </div>
      )}

      {/* Скрытые поля защиты от спама */}
      <input type="hidden" name="startedAt" value={startedAt} />
      <div aria-hidden className="absolute -left-[9999px] h-px w-px overflow-hidden">
        <label>
          Website
          <input type="text" name="website" tabIndex={-1} autoComplete="off" defaultValue="" />
        </label>
      </div>

      <fieldset>
        <legend className="font-semibold">{dict.kindLabel}</legend>
        <div className="mt-3 flex flex-wrap gap-2">
          {(Object.keys(dict.kinds) as (keyof typeof dict.kinds)[]).map((k) => (
            <label
              key={k}
              className="flex min-h-12 cursor-pointer items-center gap-2 rounded-full border border-ink/25 px-5 transition-colors hover:border-wine has-checked:border-wine has-checked:bg-wine has-checked:text-milk has-focus-visible:outline-2 has-focus-visible:outline-offset-2 has-focus-visible:outline-wine"
            >
              <input type="radio" name="kind" value={k} checked={kind === k} onChange={() => setKind(k)} className="sr-only" />
              {dict.kinds[k]}
            </label>
          ))}
        </div>
      </fieldset>

      <div className="grid gap-6 md:grid-cols-2">
        <label className="block">
          <span className="font-semibold">
            {dict.parentName} <span className="text-sm font-normal text-muted">({dict.required})</span>
          </span>
          <input
            name="parentName"
            autoComplete="name"
            required
            maxLength={80}
            aria-invalid={errs.has("name") || undefined}
            aria-describedby="name-hint name-err"
            className={control}
          />
          <span id="name-hint" className="mt-1 block text-sm text-muted">
            {dict.parentHint}
          </span>
          <FieldError id="name-err" text={err("name")} />
        </label>

        <label className="block">
          <span className="font-semibold">
            {dict.phone} <span className="text-sm font-normal text-muted">({dict.required})</span>
          </span>
          <input
            name="phone"
            type="tel"
            inputMode="tel"
            autoComplete="tel"
            required
            maxLength={20}
            aria-invalid={errs.has("phone") || undefined}
            aria-describedby="phone-hint phone-err"
            className={control}
          />
          <span id="phone-hint" className="mt-1 block text-sm text-muted">
            {dict.phoneHint}
          </span>
          <FieldError id="phone-err" text={err("phone")} />
        </label>
      </div>

      <fieldset>
        <legend className="font-semibold">{dict.contactMethod}</legend>
        <div className="mt-3 flex flex-wrap gap-6">
          {(Object.keys(dict.methods) as (keyof typeof dict.methods)[]).map((m, i) => (
            <label key={m} className="flex min-h-11 items-center gap-3">
              <input type="radio" name="contactMethod" value={m} defaultChecked={i === 0} className="size-5 accent-[var(--color-wine)]" />
              {dict.methods[m]}
            </label>
          ))}
        </div>
      </fieldset>

      <div className="grid gap-6 md:grid-cols-[1fr_12rem]">
        <label className="block">
          <span className="font-semibold">{dict.direction}</span>
          <select name="direction" defaultValue={initialDirection} className={control}>
            <option value="">{dict.directionAny}</option>
            {directions.map((d) => (
              <option key={d.slug} value={d.slug}>
                {d.name}
              </option>
            ))}
          </select>
        </label>
        <label className="block">
          <span className="font-semibold">{dict.childAge}</span>
          <input
            name="childAge"
            type="number"
            inputMode="numeric"
            min={3}
            max={18}
            aria-invalid={errs.has("age") || undefined}
            aria-describedby="age-err"
            className={control}
          />
          <FieldError id="age-err" text={err("age")} />
        </label>
      </div>
      <p className="-mt-4 text-sm text-muted">{dict.childAgeHint}</p>

      <label className="block">
        <span className="font-semibold">
          {dict.message} <span className="text-sm font-normal text-muted">({dict.messageHint})</span>
        </span>
        <textarea
          name="message"
          rows={4}
          maxLength={1000}
          aria-invalid={errs.has("message") || undefined}
          aria-describedby="message-err"
          className={control}
        />
        <FieldError id="message-err" text={err("message")} />
      </label>

      <div>
        <label className="flex items-start gap-3">
          <input
            type="checkbox"
            name="consent"
            required
            aria-invalid={errs.has("consent") || undefined}
            aria-describedby="consent-err"
            className="mt-1 size-5 shrink-0 accent-[var(--color-wine)]"
          />
          <span>{dict.consent}</span>
        </label>
        <FieldError id="consent-err" text={err("consent")} />
        <p className="mt-3 text-sm text-muted">{dict.privacy}</p>
      </div>

      <Submit dict={dict} pending={pending} />
    </form>
  );
}
