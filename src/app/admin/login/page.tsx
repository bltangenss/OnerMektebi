import { redirect } from "next/navigation";
import { LogoMark } from "@/components/art/Logo";
import { AdminForm } from "@/components/admin/AdminForm";
import { isCmsConfigured } from "@/lib/supabase/env";
import { signIn } from "../actions";

export default async function LoginPage({ searchParams }: PageProps<"/admin/login">) {
  if (!isCmsConfigured()) redirect("/admin");
  const { denied } = await searchParams;
  const field = "mt-1 w-full rounded-felt border border-line bg-white px-3 py-3 text-base";

  return (
    <main className="mx-auto flex min-h-svh max-w-sm flex-col justify-center px-4 py-12">
      <LogoMark className="size-12 text-wine" />
      <h1 className="display mt-4 text-[2.8rem]">Вход для сотрудников</h1>
      {denied && (
        <p role="alert" className="mt-4 rounded-felt bg-wine-soft p-3 text-wine-deep">
          У этой учётной записи нет доступа к админ-панели.
        </p>
      )}
      <div className="mt-8">
        <AdminForm action={signIn} submitLabel="Войти">
          <label className="block">
            <span className="font-semibold">Email</span>
            <input name="email" type="email" autoComplete="username" required className={field} />
          </label>
          <label className="block">
            <span className="font-semibold">Пароль</span>
            <input name="password" type="password" autoComplete="current-password" required className={field} />
          </label>
        </AdminForm>
      </div>
      <p className="mt-6 text-sm text-muted">Учётные записи создаёт ответственный за сайт. Самостоятельной регистрации нет.</p>
    </main>
  );
}
