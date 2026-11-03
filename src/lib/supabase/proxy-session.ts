import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import { isCmsConfigured, supabaseAnonKey, supabaseUrl } from "./env";

/**
 * Обновляет сессию администратора в cookies и не пускает в /admin без входа.
 * Права администратора дополнительно проверяются на сервере в каждом действии.
 */
export async function refreshAdminSession(request: NextRequest) {
  let response = NextResponse.next({ request });
  if (!isCmsConfigured()) return response;

  const supabase = createServerClient(supabaseUrl, supabaseAnonKey, {
    cookies: {
      getAll: () => request.cookies.getAll(),
      setAll: (cookies) => {
        cookies.forEach(({ name, value }) => request.cookies.set(name, value));
        response = NextResponse.next({ request });
        cookies.forEach(({ name, value, options }) => response.cookies.set(name, value, options));
      },
    },
  });

  const { data } = await supabase.auth.getUser();
  const isLogin = request.nextUrl.pathname === "/admin/login";
  if (!data.user && !isLogin) {
    const url = request.nextUrl.clone();
    url.pathname = "/admin/login";
    url.search = "";
    return NextResponse.redirect(url);
  }
  return response;
}
