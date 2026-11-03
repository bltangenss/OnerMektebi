import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { supabaseAnonKey, supabaseUrl } from "./env";

/** Клиент с сессией сотрудника: RLS пропускает его только если он в таблице admins. */
export async function createSessionClient() {
  const store = await cookies();
  return createServerClient(supabaseUrl, supabaseAnonKey, {
    cookies: {
      getAll: () => store.getAll(),
      setAll: (list) => {
        try {
          list.forEach(({ name, value, options }) => store.set(name, value, options));
        } catch {
          // Вызов из серверного компонента: cookies обновит proxy.
        }
      },
    },
  });
}
